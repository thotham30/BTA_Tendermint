// src/utils/tendermintLogic.js

export function getNextProposer(nodes, round) {
  return nodes[round % nodes.length];
}

export function createBlock(proposerId, height) {
  return {
    height,
    proposer: proposerId,
    txCount: Math.floor(Math.random() * 10) + 1,
    hash: Math.random().toString(36).substring(2, 10),
  };
}

export function voteOnBlock(nodes, block) {
  const votes = nodes.map((node) => ({
    nodeId: node.id,
    vote: Math.random() > 0.1, // 90% chance to vote yes
  }));
  const yesVotes = votes.filter((v) => v.vote).length;
  return { votes, yesVotes, approved: yesVotes >= Math.ceil(nodes.length * 2 / 3) };
}
