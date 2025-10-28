// src/utils/networkSimulation.js
import { getNextProposer, createBlock, voteOnBlock } from "./tendermintLogic";

export function initializeNetwork(nodeCount) {
  return Array.from({ length: nodeCount }, (_, i) => ({
    id: i + 1,
    state: "Idle",
    color: "#ccc",
  }));
}

export function simulateConsensusStep(nodes, blocks) {
  const round = blocks.length;
  const proposerNode = getNextProposer(nodes, round);
  const newNodes = nodes.map((n) => ({ ...n, state: "Voting", color: "#f9c74f" }));

  // Step 1: proposer creates block
  const block = createBlock(proposerNode.id, round + 1);

  // Step 2: simulate votes
  const { approved } = voteOnBlock(nodes, block);

  let newBlock = null;
  let newLiveness = true;
  let newSafety = true;

  if (approved) {
    newBlock = block;
    newNodes.forEach((n) => (n.state = "Committed"));
    newNodes.forEach((n) => (n.color = "#90be6d"));
  } else {
    // simulate potential liveness failure or fork
    newLiveness = Math.random() > 0.1; // 10% chance liveness fails
    newSafety = Math.random() > 0.05; // 5% chance safety fails
    newNodes.forEach((n) => (n.state = "Timeout"));
    newNodes.forEach((n) => (n.color = "#f94144"));
  }

  return { updatedNodes: newNodes, newBlock, newLiveness, newSafety };
}
