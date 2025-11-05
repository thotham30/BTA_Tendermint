// src/utils/networkSimulation.js
import {
  getNextProposer,
  createBlock,
  voteOnBlock,
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

export function simulateConsensusStep(nodes, blocks, config) {
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

  // Step 2: simulate votes with network conditions
  const { approved, byzantineDetected } = voteOnBlock(
    updatedNodes,
    block,
    config
  );

  let newBlock = null;
  let newLiveness = true;
  let newSafety = true;

  // Simulate packet loss affecting consensus
  const packetLossOccurred = Math.random() * 100 < packetLoss;

  if (approved && !packetLossOccurred) {
    newBlock = block;
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

    updatedNodes.forEach((n) => {
      if (n.isOnline) {
        n.state = "Timeout";
        n.color = n.isByzantine ? "#ff6b6b" : "#f94144";
      }
    });
  }

  return { updatedNodes, newBlock, newLiveness, newSafety };
}
