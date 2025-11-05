// src/utils/networkSimulation.js
import {
  getNextProposer,
  createBlock,
  voteOnBlock,
  createVotingRound,
  updatePrevotes,
  updatePrecommits,
  finalizeVotingRound,
} from "./tendermintLogic";

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

  // Apply network latency simulation
  const latency = config?.network?.latency || 100;
  const packetLoss = config?.network?.packetLoss || 0;
  const downtimePercentage =
    config?.nodeBehavior?.downtimePercentage || 0;

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
    config?.consensus?.voteThreshold || 2 / 3
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
    config?.consensus?.voteThreshold || 2 / 3
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
  };
}
