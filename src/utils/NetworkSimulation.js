// src/utils/networkSimulation.js
import {
  getNextProposer,
  createBlock,
  voteOnBlock,
  createVotingRound,
  updatePrevotes,
  updatePrecommits,
  finalizeVotingRound,
  executeConsensusStep,
  CONSENSUS_STEPS,
  getTotalSteps,
} from "./tendermintLogic";
import { DEFAULTS } from "./ConfigManager";

export function initializeNetwork(nodeCount, config) {
  const byzantineCount =
    config?.nodeBehavior?.byzantineCount || 0;

  return Array.from({ length: nodeCount }, (_, i) => {
    const isByzantine = i < byzantineCount;
    return {
      id: i + 1,
      state: "Idle",
      color: isByzantine ? "#ff6b6b" : "#ccc",
      isByzantine,
      byzantineType:
        config?.nodeBehavior?.byzantineType || "faulty",
      isOnline: true,
    };
  });
}

export function simulateConsensusStep(
  nodes,
  blocks,
  config,
  consensusContext
) {
  const round = blocks.length;
  const proposerNode = getNextProposer(nodes, round);

  // Check for timeout
  const {
    roundStartTime,
    timeoutDuration,
    handleRoundTimeout,
    currentRound,
    partitionActive,
    partitionedNodes,
    updateNetworkStats,
    addLog,
    isSynchronousMode,
  } = consensusContext;

  const elapsedTime = Date.now() - roundStartTime;
  // In synchronous mode, disable timeouts
  const timedOut =
    !isSynchronousMode && elapsedTime >= timeoutDuration;

  // Apply network latency simulation
  const latency = config?.network?.latency || DEFAULTS.latency;
  const packetLoss =
    config?.network?.packetLoss || DEFAULTS.packetLoss;
  const downtimePercentage =
    config?.nodeBehavior?.downtimePercentage ||
    DEFAULTS.downtimePercentage;

  // Network stats tracking
  let messagesSent = 0;
  let messagesDelivered = 0;
  let messagesLost = 0;

  // Update node availability based on downtime and partitions
  const updatedNodes = nodes.map((n) => {
    // In synchronous mode, no random downtime (only partitions can affect nodes)
    const isDowntime =
      !isSynchronousMode &&
      Math.random() * 100 < downtimePercentage;
    const isPartitioned =
      partitionActive && partitionedNodes.includes(n.id);
    const isOnline = !isDowntime && !isPartitioned;

    return {
      ...n,
      state: isPartitioned
        ? "Partitioned"
        : !isOnline
        ? "Offline"
        : "Voting",
      color: isPartitioned
        ? n.isByzantine
          ? "#ff6b6b"
          : "#f59e0b"
        : !isOnline
        ? "#666"
        : n.isByzantine
        ? "#ff6b6b"
        : "#f9c74f",
      isOnline,
      isPartitioned,
    };
  });

  // If timeout occurred, move to next proposer
  if (timedOut) {
    handleRoundTimeout();

    // Check if timeout is due to partition
    const partitionedCount = updatedNodes.filter(
      (n) => n.isPartitioned
    ).length;
    if (partitionedCount > 0) {
      addLog(
        `Round ${round} timeout due to network partition (${partitionedCount} nodes affected)`,
        "warning"
      );
    }

    // Mark nodes as timed out
    updatedNodes.forEach((n) => {
      if (n.isOnline && !n.isPartitioned) {
        n.state = "Timeout";
        n.color = n.isByzantine ? "#ff6b6b" : "#f94144";
      }
    });

    return {
      updatedNodes,
      newBlock: null,
      newLiveness: false,
      newSafety: true,
      votingRound: null,
      timedOut: true,
      newProposer: getNextProposer(updatedNodes, round + 1),
    };
  }

  // Step 1: proposer creates block
  const block = createBlock(
    proposerNode.id,
    round + 1,
    config,
    proposerNode
  );

  // Log if Byzantine proposer creates malicious block
  if (proposerNode.isByzantine && block.isMalicious) {
    addLog(
      `⚠️ Byzantine Node ${proposerNode.id} (${proposerNode.byzantineType}) proposed malicious block!`,
      "warning"
    );
  } else if (proposerNode.isByzantine) {
    addLog(
      `Byzantine Node ${proposerNode.id} is proposer (block appears valid)`,
      "info"
    );
  }

  // Create voting round to track votes
  const votingRound = createVotingRound(
    round + 1,
    round + 1,
    proposerNode.id,
    updatedNodes
  );

  // Step 2: simulate prevote phase with partition logic
  // Only online, non-partitioned nodes can vote
  const votableNodes = updatedNodes.filter(
    (n) => n.isOnline && !n.isPartitioned
  );
  messagesSent += updatedNodes.length; // Messages sent to all nodes

  // Simulate message loss due to partition
  messagesDelivered += votableNodes.length;
  messagesLost += updatedNodes.length - votableNodes.length;

  const prevoteResult = voteOnBlock(votableNodes, block, config);
  updatePrevotes(
    votingRound,
    prevoteResult.votes,
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold
  );

  // Log malicious block rejection
  if (block.isMalicious && !votingRound.prevoteThresholdMet) {
    addLog(
      `✓ Malicious block from Byzantine proposer rejected by honest nodes in prevote`,
      "success"
    );
  }

  // Log partition effects
  if (partitionActive && partitionedNodes.length > 0) {
    addLog(
      `${partitionedNodes.length} partitioned nodes unable to vote in prevote`,
      "warning"
    );
  }

  // Step 3: simulate precommit phase (only if prevote passed)
  const precommitResult = votingRound.prevoteThresholdMet
    ? voteOnBlock(votableNodes, block, config)
    : {
        votes: prevoteResult.votes.map((v) => ({
          ...v,
          vote: null,
        })),
        approved: false,
      };

  messagesSent += updatedNodes.length;
  messagesDelivered += votableNodes.length;
  messagesLost += updatedNodes.length - votableNodes.length;

  updatePrecommits(
    votingRound,
    precommitResult.votes,
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold
  );

  const { approved, byzantineDetected } = precommitResult;

  // Update network stats
  if (updateNetworkStats) {
    updateNetworkStats({
      sent: messagesSent,
      delivered: messagesDelivered,
      lost: messagesLost,
    });
  }

  let newBlock = null;
  let newLiveness = true;
  let newSafety = true;

  // Simulate packet loss affecting consensus (only in asynchronous mode)
  const packetLossOccurred =
    !isSynchronousMode && Math.random() * 100 < packetLoss;

  // Check if Byzantine nodes exceed safety threshold
  const maxByzantine = Math.floor(nodes.length / 3);
  const byzantineCount =
    config?.nodeBehavior?.byzantineCount || 0;
  const byzantineExceedsThreshold =
    byzantineCount > maxByzantine;

  if (
    approved &&
    votingRound.precommitThresholdMet &&
    !packetLossOccurred
  ) {
    newBlock = block;
    finalizeVotingRound(votingRound, true);
    updatedNodes.forEach((n) => {
      if (n.isOnline && !n.isPartitioned) {
        n.state = "Committed";
        n.color = n.isByzantine ? "#ff6b6b" : "#90be6d";
      }
    });

    // Liveness is maintained when blocks are committed
    newLiveness = true;

    // Safety is violated if Byzantine nodes exceed n/3, even if a block was committed
    // This is because the BFT assumption is broken and forks could occur
    if (byzantineExceedsThreshold) {
      newSafety = false;
      addLog(
        `⚠️ Safety violation risk: Byzantine nodes (${byzantineCount}) exceed safe threshold (${maxByzantine})`,
        "error"
      );
    } else {
      newSafety = true;
    }
  } else {
    // Consensus failed - no block committed
    // Liveness is violated when consensus cannot progress
    newLiveness = false;

    // Safety violations occur when Byzantine nodes exceed n/3
    // Even without a commit, exceeding n/3 means safety guarantees are lost
    if (byzantineExceedsThreshold) {
      newSafety = false;
      addLog(
        `⚠️ Safety violated: Byzantine nodes (${byzantineCount}) exceed threshold (${maxByzantine})`,
        "error"
      );
    } else {
      // Safety can still be maintained even if liveness fails
      // (no conflicting blocks committed, just no progress)
      newSafety = true;
    }

    // Log partition impact on consensus
    if (partitionActive && partitionedNodes.length > 0) {
      addLog(
        `Consensus failed: ${partitionedNodes.length} nodes partitioned, threshold not met`,
        "error"
      );
    } else if (byzantineExceedsThreshold) {
      addLog(
        `Consensus failed: Too many Byzantine nodes (${byzantineCount}/${nodes.length})`,
        "error"
      );
    }

    finalizeVotingRound(votingRound, false);
    updatedNodes.forEach((n) => {
      if (n.isOnline && !n.isPartitioned) {
        // In synchronous mode, call it "Failed" instead of "Timeout"
        n.state = isSynchronousMode ? "Failed" : "Timeout";
        n.color = n.isByzantine ? "#ff6b6b" : "#f94144";
      }
    });
  }

  // Update consensus context with voting data if available
  if (consensusContext?.updateCurrentRoundVotes) {
    consensusContext.updateCurrentRoundVotes(votingRound);
  }
  if (consensusContext?.finalizeRound) {
    consensusContext.finalizeRound(votingRound);
  }

  return {
    updatedNodes,
    newBlock,
    newLiveness,
    newSafety,
    votingRound,
    timedOut: false,
    newProposer: proposerNode,
  };
}

/**
 * Execute a single step in step-by-step mode
 */
export function executeStepMode(
  step,
  nodes,
  blocks,
  config,
  previousStepState = null,
  currentRound = null
) {
  const stepState = executeConsensusStep(
    step,
    nodes,
    blocks,
    config,
    previousStepState,
    currentRound
  );

  return {
    stepState,
    updatedNodes: stepState.nodes,
    newBlock: stepState.block,
    votingRound: stepState.votingRound,
    highlightedNodes: stepState.highlightedNodes,
    committed: stepState.committed,
  };
}

/**
 * Get information about a specific step
 */
export function getStepInfo(step) {
  return {
    step,
    totalSteps: getTotalSteps(),
    isLastStep: step >= getTotalSteps() - 1,
    isFirstStep: step === 0,
  };
}
