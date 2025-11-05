// src/utils/tendermintLogic.js

/**
 * VotingRound data structure for tracking consensus voting
 * @typedef {Object} VotingRound
 * @property {number} roundNumber - The round number
 * @property {number} roundHeight - The block height
 * @property {number} proposerId - The proposer node ID
 * @property {Object} prevotesReceived - Map of nodeId -> vote (true/false/null)
 * @property {Object} precommitsReceived - Map of nodeId -> vote (true/false/null)
 * @property {number} timestamp - When the round started
 * @property {string} result - 'approved', 'rejected', or 'pending'
 * @property {number} prevoteCount - Number of prevotes received
 * @property {number} precommitCount - Number of precommits received
 * @property {boolean} prevoteThresholdMet - Whether 2/3+ prevotes achieved
 * @property {boolean} precommitThresholdMet - Whether 2/3+ precommits achieved
 */

export function getNextProposer(nodes, round) {
  // Get only online, non-byzantine nodes for proposer selection
  const eligibleNodes = nodes.filter(
    (n) => n.isOnline && !n.isByzantine
  );
  if (eligibleNodes.length === 0) {
    // Fallback to all nodes if no eligible ones
    return nodes[round % nodes.length];
  }
  return eligibleNodes[round % eligibleNodes.length];
}

export function createBlock(proposerId, height, config) {
  const blockSize = config?.consensus?.blockSize || 10;
  const txCount = Math.floor(Math.random() * blockSize) + 1;

  return {
    height,
    proposer: proposerId,
    txCount,
    hash: Math.random().toString(36).substring(2, 10),
    timestamp: Date.now(),
  };
}

export function voteOnBlock(nodes, block, config) {
  const voteThreshold =
    config?.consensus?.voteThreshold || 2 / 3;
  const responseVariance =
    config?.nodeBehavior?.responseVariance || 50;

  let byzantineDetected = false;

  const votes = nodes.map((node) => {
    // Node is offline - no vote
    if (!node.isOnline) {
      return { nodeId: node.id, vote: null, isByzantine: false };
    }

    // Byzantine node behavior
    if (node.isByzantine) {
      byzantineDetected = true;
      switch (node.byzantineType) {
        case "faulty":
          // Votes randomly
          return {
            nodeId: node.id,
            vote: Math.random() > 0.5,
            isByzantine: true,
          };
        case "equivocator":
          // Sends conflicting votes (simulated as random)
          return {
            nodeId: node.id,
            vote: Math.random() > 0.3,
            isByzantine: true,
          };
        case "silent":
          // Doesn't vote
          return {
            nodeId: node.id,
            vote: null,
            isByzantine: true,
          };
        default:
          return {
            nodeId: node.id,
            vote: Math.random() > 0.5,
            isByzantine: true,
          };
      }
    }

    // Honest node with response variance
    const baseApprovalRate = 0.9;
    const varianceImpact =
      (Math.random() * responseVariance) / 1000;
    const approval = Math.random() > 0.1 - varianceImpact;

    return {
      nodeId: node.id,
      vote: approval,
      isByzantine: false,
    };
  });

  // Count valid yes votes (excluding null votes)
  const validVotes = votes.filter((v) => v.vote !== null);
  const yesVotes = validVotes.filter((v) => v.vote).length;
  const totalVotes = validVotes.length;

  // Check if threshold is met
  const approved =
    totalVotes > 0 && yesVotes / totalVotes >= voteThreshold;

  return {
    votes,
    yesVotes,
    totalVotes,
    approved,
    byzantineDetected,
  };
}

/**
 * Create a VotingRound object for tracking consensus rounds
 */
export function createVotingRound(
  roundNumber,
  roundHeight,
  proposerId,
  nodes
) {
  const prevotesReceived = {};
  const precommitsReceived = {};

  // Initialize all nodes with null votes
  nodes.forEach((node) => {
    prevotesReceived[node.id] = null;
    precommitsReceived[node.id] = null;
  });

  return {
    roundNumber,
    roundHeight,
    proposerId,
    prevotesReceived,
    precommitsReceived,
    timestamp: Date.now(),
    result: "pending",
    prevoteCount: 0,
    precommitCount: 0,
    prevoteThresholdMet: false,
    precommitThresholdMet: false,
  };
}

/**
 * Update voting round with prevotes
 */
export function updatePrevotes(
  votingRound,
  votes,
  voteThreshold
) {
  votes.forEach(({ nodeId, vote }) => {
    votingRound.prevotesReceived[nodeId] = vote;
  });

  const validPrevotes = Object.values(
    votingRound.prevotesReceived
  ).filter((v) => v !== null);
  const yesPrevotes = validPrevotes.filter(
    (v) => v === true
  ).length;

  votingRound.prevoteCount = yesPrevotes;
  votingRound.prevoteThresholdMet =
    validPrevotes.length > 0 &&
    yesPrevotes / validPrevotes.length >= voteThreshold;

  return votingRound;
}

/**
 * Update voting round with precommits
 */
export function updatePrecommits(
  votingRound,
  votes,
  voteThreshold
) {
  votes.forEach(({ nodeId, vote }) => {
    votingRound.precommitsReceived[nodeId] = vote;
  });

  const validPrecommits = Object.values(
    votingRound.precommitsReceived
  ).filter((v) => v !== null);
  const yesPrecommits = validPrecommits.filter(
    (v) => v === true
  ).length;

  votingRound.precommitCount = yesPrecommits;
  votingRound.precommitThresholdMet =
    validPrecommits.length > 0 &&
    yesPrecommits / validPrecommits.length >= voteThreshold;

  return votingRound;
}

/**
 * Finalize voting round with result
 */
export function finalizeVotingRound(votingRound, approved) {
  votingRound.result = approved ? "approved" : "rejected";
  return votingRound;
}
