// src/utils/tendermintLogic.js

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
