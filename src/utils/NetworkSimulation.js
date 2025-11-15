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
  recordProposalEvidence,
} from "./tendermintLogic";
import { DEFAULTS } from "./ConfigManager";
import {
  buildTopology,
  getNeighbors,
  calculateCircularLayout,
  calculateForceDirectedLayout,
} from "./GraphTopology";

export function initializeNetwork(nodeCount, config) {
  const byzantineCount =
    config?.nodeBehavior?.byzantineCount || 0;

  // Build network topology
  const topology = config?.network?.topology || {
    type: "full-mesh",
    useGraphRouting: false,
  };
  const edges =
    config?.network?.edges && config.network.edges.length > 0
      ? config.network.edges
      : buildTopology(topology.type, nodeCount, {
          edgeProbability: topology.edgeProbability,
          nodeDegree: topology.nodeDegree,
        });

  // Calculate node positions based on topology
  let positions;
  if (topology.type === "ring" || topology.type === "star") {
    positions = calculateCircularLayout(
      nodeCount,
      400,
      300,
      200
    );
  } else if (edges.length > 0) {
    positions = calculateForceDirectedLayout(nodeCount, edges, {
      width: 800,
      height: 600,
      iterations: 50,
    });
  } else {
    // Default circular layout
    positions = calculateCircularLayout(
      nodeCount,
      400,
      300,
      200
    );
  }

  // Create nodes with graph data
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const isByzantine = i < byzantineCount;
    const nodeId = i + 1;

    return {
      id: nodeId,
      state: "Idle",
      color: isByzantine ? "#ff6b6b" : "#ccc",
      isByzantine,
      byzantineType:
        config?.nodeBehavior?.byzantineType || "faulty",
      isOnline: true,

      // Graph topology fields
      neighbors: getNeighbors(nodeId, edges),
      position: positions[nodeId] || { x: 400, y: 300 },
      inbox: [],
      outbox: [],

      // Per-node consensus tracking
      round: 0, // Track individual node's round
    };
  });

  return nodes;
}

export function simulateConsensusStep(
  nodes,
  blocks,
  config,
  consensusContext
) {
  // Prefer the explicit currentRound (from ConsensusContext) if provided.
  // Fall back to blocks.length for compatibility.
  const round =
    consensusContext &&
    typeof consensusContext.currentRound === "number"
      ? consensusContext.currentRound
      : blocks.length;

  // Get graph routing configuration
  const edges = consensusContext?.edges || [];
  const useGraphRouting =
    consensusContext?.useGraphRouting || false;

  const proposerNode = getNextProposer(
    nodes,
    round,
    edges,
    useGraphRouting
  );

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
  const timedOut =
    !isSynchronousMode && elapsedTime >= timeoutDuration;

  const latency = config?.network?.latency || DEFAULTS.latency;
  const packetLoss =
    config?.network?.packetLoss || DEFAULTS.packetLoss;
  const downtimePercentage =
    config?.nodeBehavior?.downtimePercentage ||
    DEFAULTS.downtimePercentage;

  let messagesSent = 0;
  let messagesDelivered = 0;
  let messagesLost = 0;

  // Update node availability (downtime + partition)
  const updatedNodes = nodes.map((n) => {
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

  if (timedOut) {
    handleRoundTimeout();

    const partitionedCount = updatedNodes.filter(
      (n) => n.isPartitioned
    ).length;
    if (partitionedCount > 0 && addLog) {
      addLog(
        `Round ${round} timeout due to network partition (${partitionedCount} nodes affected)`,
        "warning"
      );
    }

    updatedNodes.forEach((n) => {
      if (n.isOnline && !n.isPartitioned) {
        n.state = "Timeout";
        n.color = n.isByzantine ? "#ff6b6b" : "#f94144";
        // Update round even on timeout - nodes advance to next round
        n.round = round;
      }
    });

    return {
      updatedNodes,
      newBlock: null,
      newLiveness: false,
      newSafety: true,
      votingRound: null,
      timedOut: true,
      newProposer: getNextProposer(
        updatedNodes,
        round + 1,
        edges,
        useGraphRouting
      ),
    };
  }

  // Step 1: proposer creates block
  const block = createBlock(
    proposerNode.id,
    round + 1,
    config,
    proposerNode
  );

  // Record proposal evidence (equivocation detection)
  try {
    const evidence = recordProposalEvidence({
      height: block.height,
      round: round + 1,
      proposer: proposerNode.id,
      hash: block.hash,
    });
    if (evidence.equivocates) {
      const idx = updatedNodes.findIndex(
        (n) => n.id === proposerNode.id
      );
      if (idx >= 0) {
        updatedNodes[idx] = {
          ...updatedNodes[idx],
          isByzantine: true,
        };
      }
      if (addLog) {
        addLog(
          `EVIDENCE: proposer ${
            proposerNode.id
          } equivocated at height ${
            block.height
          } (hashes: ${evidence.hashes.join(", ")})`,
          "error"
        );
      }
    }
  } catch (err) {
    if (addLog)
      addLog(
        `Equivocation detection error: ${err.message}`,
        "error"
      );
  }

  if (proposerNode.isByzantine && block.isMalicious) {
    if (addLog)
      addLog(
        `⚠️ Byzantine Node ${proposerNode.id} (${proposerNode.byzantineType}) proposed malicious block!`,
        "warning"
      );
  } else if (proposerNode.isByzantine) {
    if (addLog)
      addLog(
        `Byzantine Node ${proposerNode.id} is proposer (block appears valid)`,
        "info"
      );
  }

  // Create voting round
  const votingRound = createVotingRound(
    round + 1,
    round + 1,
    proposerNode.id,
    updatedNodes
  );

  // Ensure votingRound maps include all nodes (defensive)
  updatedNodes.forEach((n) => {
    if (!(n.id in votingRound.prevotesReceived))
      votingRound.prevotesReceived[n.id] = null;
    if (!(n.id in votingRound.precommitsReceived))
      votingRound.precommitsReceived[n.id] = null;
  });

  // Step 2: simulate prevote phase (only online, non-partitioned nodes vote)
  const votableNodes = updatedNodes.filter(
    (n) => n.isOnline && !n.isPartitioned
  );

  // Calculate message statistics based on routing mode
  if (useGraphRouting && edges.length > 0) {
    // Graph routing: messages only sent to neighbors
    const reachableFromProposer = proposerNode.neighbors || [];
    const reachableOnline = reachableFromProposer.filter(
      (nId) => {
        const node = updatedNodes.find((n) => n.id === nId);
        return node && node.isOnline && !node.isPartitioned;
      }
    );
    messagesSent += reachableFromProposer.length;
    messagesDelivered += reachableOnline.length;
    messagesLost +=
      reachableFromProposer.length - reachableOnline.length;
  } else {
    // Broadcast mode: messages sent to all
    messagesSent += updatedNodes.length;
    messagesDelivered += votableNodes.length;
    messagesLost += updatedNodes.length - votableNodes.length;
  }

  // Use full validator count (all nodes in votingRound) as denominator
  const totalValidatorsForPrevote =
    Object.keys(votingRound.prevotesReceived).length ||
    updatedNodes.length ||
    nodes.length;
  const prevoteResult = voteOnBlock(
    votableNodes,
    block,
    config,
    totalValidatorsForPrevote,
    { edges, useGraphRouting, proposerId: proposerNode.id }
  );
  updatePrevotes(
    votingRound,
    prevoteResult.votes,
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold,
    block
  );

  if (
    block.isMalicious &&
    !votingRound.prevoteThresholdMet &&
    addLog
  ) {
    addLog(
      `✓ Malicious block from Byzantine proposer rejected by honest nodes in prevote`,
      "success"
    );
  }

  if (partitionActive && partitionedNodes.length > 0 && addLog) {
    addLog(
      `${partitionedNodes.length} partitioned nodes unable to vote in prevote`,
      "warning"
    );
  }

  // Graph routing info
  if (useGraphRouting && edges.length > 0 && addLog) {
    const reachableCount =
      prevoteResult.reachableNodes?.length || 0;
    addLog(
      `Graph Routing: Proposer ${proposerNode.id} can reach ${reachableCount}/${nodes.length} nodes`,
      "info"
    );
  }

  // Debug logs
  console.log(
    "[SIM] round used for proposer selection:",
    round,
    "(blocks.length:",
    blocks.length,
    "), useGraphRouting:",
    useGraphRouting
  );
  console.log(
    "[SIM] prevotesReceived keys",
    Object.keys(votingRound.prevotesReceived).length,
    "yesPrevotes=",
    votingRound.prevoteCount
  );
  console.log(
    "[SIM] prevoteResult.votes:",
    prevoteResult.votes.map((v) => ({
      nodeId: v.nodeId,
      vote: v.vote,
    }))
  );
  console.log(
    "[SIM] prevoteThresholdMet:",
    votingRound.prevoteThresholdMet
  );

  // Step 3: precommit phase (only if prevote threshold met)
  const totalValidatorsForPrecommit =
    Object.keys(votingRound.precommitsReceived).length ||
    updatedNodes.length ||
    nodes.length;
  let precommitResult;
  if (votingRound.prevoteThresholdMet) {
    precommitResult = voteOnBlock(
      votableNodes,
      block,
      config,
      totalValidatorsForPrecommit,
      { edges, useGraphRouting, proposerId: proposerNode.id }
    );
    updatePrecommits(
      votingRound,
      precommitResult.votes,
      config?.consensus?.voteThreshold || DEFAULTS.voteThreshold,
      block
    );
  } else {
    precommitResult = {
      votes: prevoteResult.votes.map((v) => ({
        ...v,
        vote: null,
      })),
      approved: false,
    };
  }

  console.log(
    "[SIM] precommitsReceived keys",
    Object.keys(votingRound.precommitsReceived).length,
    "yesPrecommits=",
    votingRound.precommitCount
  );
  console.log(
    "[SIM] precommitResult.votes:",
    precommitResult.votes.map((v) => ({
      nodeId: v.nodeId,
      vote: v.vote,
    }))
  );
  console.log(
    "[SIM] precommitThresholdMet:",
    votingRound.precommitThresholdMet
  );

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

  const packetLossOccurred =
    !isSynchronousMode && Math.random() * 100 < packetLoss;

  const maxByzantine = Math.floor(nodes.length / 3);
  const byzantineCount =
    config?.nodeBehavior?.byzantineCount || 0;
  const byzantineExceedsThreshold =
    byzantineCount > maxByzantine;

  // Use votingRound.precommitThresholdMet as canonical truth to decide commit
  if (votingRound.precommitThresholdMet && !packetLossOccurred) {
    newBlock = block;
    // Attach precommit QC to the committed block as commit proof
    if (votingRound.precommitQC) {
      newBlock.commitQC = votingRound.precommitQC;
    }
    finalizeVotingRound(votingRound, true);
    updatedNodes.forEach((n) => {
      if (n.isOnline && !n.isPartitioned) {
        n.state = "Committed";
        n.color = n.isByzantine ? "#ff6b6b" : "#90be6d";
      }
    });

    newLiveness = true;

    if (byzantineExceedsThreshold) {
      newSafety = false;
      if (addLog)
        addLog(
          `⚠️ Safety violation risk: Byzantine nodes (${byzantineCount}) exceed safe threshold (${maxByzantine})`,
          "error"
        );
    } else {
      newSafety = true;
    }
  } else {
    // Consensus failed - no block committed
    newLiveness = false;

    if (byzantineExceedsThreshold) {
      newSafety = false;
      if (addLog)
        addLog(
          `⚠️ Safety violated: Byzantine nodes (${byzantineCount}) exceed threshold (${maxByzantine})`,
          "error"
        );
    } else {
      newSafety = true;
    }

    if (partitionActive && partitionedNodes.length > 0) {
      if (addLog)
        addLog(
          `Consensus failed: ${partitionedNodes.length} nodes partitioned, threshold not met`,
          "error"
        );
    } else if (byzantineExceedsThreshold) {
      if (addLog)
        addLog(
          `Consensus failed: Too many Byzantine nodes (${byzantineCount}/${nodes.length})`,
          "error"
        );
    }

    finalizeVotingRound(votingRound, false);
    updatedNodes.forEach((n) => {
      if (n.isOnline && !n.isPartitioned) {
        n.state = isSynchronousMode ? "Failed" : "Timeout";
        n.color = n.isByzantine ? "#ff6b6b" : "#f94144";
      }
    });
  }

  // Update node rounds for all participating nodes
  updatedNodes.forEach((n) => {
    // Update round for online, non-partitioned nodes that participated
    if (n.isOnline && !n.isPartitioned) {
      n.round = round;
    }
    // Byzantine nodes and offline nodes don't update their round
  });

  // Update consensus context
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
    newProposer: getNextProposer(
      updatedNodes,
      round + 1,
      edges,
      useGraphRouting
    ),
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
  currentRound = null,
  options = {}
) {
  const { edges = null, useGraphRouting = false } = options;

  const stepState = executeConsensusStep(
    step,
    nodes,
    blocks,
    config,
    previousStepState,
    currentRound,
    { edges, useGraphRouting }
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
