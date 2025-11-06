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
  } = consensusContext;

  const elapsedTime = Date.now() - roundStartTime;
  const timedOut = elapsedTime >= timeoutDuration;

  // Apply network latency simulation
  const latency = config?.network?.latency || DEFAULTS.latency;
  const packetLoss =
    config?.network?.packetLoss || DEFAULTS.packetLoss;
  const downtimePercentage =
    config?.nodeBehavior?.downtimePercentage ||
    DEFAULTS.downtimePercentage;

  // Update node availability based on downtime
  const updatedNodes = nodes.map((n) => {
    const isOnline = Math.random() * 100 > downtimePercentage;
    return {
      ...n,
      state: "Voting",
      color: !isOnline
        ? "#666"
        : n.isByzantine
        ? "#ff6b6b"
        : "#f9c74f",
      isOnline,
    };
  });

  // If timeout occurred, move to next proposer
  if (timedOut) {
    handleRoundTimeout();

    // Mark nodes as timed out
    updatedNodes.forEach((n) => {
      if (n.isOnline) {
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
  const block = createBlock(proposerNode.id, round + 1, config);

  // Create voting round to track votes
  const votingRound = createVotingRound(
    round + 1,
    round + 1,
    proposerNode.id,
    updatedNodes
  );

  // Step 2: simulate prevote phase
  const prevoteResult = voteOnBlock(updatedNodes, block, config);
  updatePrevotes(
    votingRound,
    prevoteResult.votes,
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold
  );

  // Step 3: simulate precommit phase (only if prevote passed)
  const precommitResult = votingRound.prevoteThresholdMet
    ? voteOnBlock(updatedNodes, block, config)
    : {
        votes: prevoteResult.votes.map((v) => ({
          ...v,
          vote: null,
        })),
        approved: false,
      };

  updatePrecommits(
    votingRound,
    precommitResult.votes,
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold
  );

  const { approved, byzantineDetected } = precommitResult;

  let newBlock = null;
  let newLiveness = true;
  let newSafety = true;

  // Simulate packet loss affecting consensus
  const packetLossOccurred = Math.random() * 100 < packetLoss;

  if (
    approved &&
    votingRound.precommitThresholdMet &&
    !packetLossOccurred
  ) {
    newBlock = block;
    finalizeVotingRound(votingRound, true);
    updatedNodes.forEach((n) => {
      if (n.isOnline) {
        n.state = "Committed";
        n.color = n.isByzantine ? "#ff6b6b" : "#90be6d";
      }
    });
  } else {
    // simulate potential liveness failure or fork
    const baseFailureRate = 0.1;
    const byzantineImpact =
      (config?.nodeBehavior?.byzantineCount || 0) / nodes.length;
    const networkImpact = packetLoss / 100;

    const livenessFailureRate =
      baseFailureRate + byzantineImpact + networkImpact;
    const safetyFailureRate =
      baseFailureRate / 2 + byzantineImpact * 2;

    newLiveness = Math.random() > livenessFailureRate;
    newSafety =
      Math.random() > safetyFailureRate || !byzantineDetected;

    finalizeVotingRound(votingRound, false);
    updatedNodes.forEach((n) => {
      if (n.isOnline) {
        n.state = "Timeout";
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
  previousStepState = null
) {
  const stepState = executeConsensusStep(
    step,
    nodes,
    blocks,
    config,
    previousStepState
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
