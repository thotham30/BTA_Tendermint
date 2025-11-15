// src/utils/MessageQueue.js
// Message queue system for neighbor-aware routing in graph-based network

/**
 * Message object for inter-node communication
 * @typedef {Object} Message
 * @property {string} id - Unique message ID
 * @property {number} sender - Sender node ID
 * @property {number} receiver - Receiver node ID
 * @property {string} type - Message type: "proposal", "prevote", "precommit", "decision"
 * @property {Object} content - Message payload (block, vote, etc.)
 * @property {number} timestamp - Message creation time
 * @property {number} ttl - Time-to-live (hops remaining)
 * @property {number[]} path - Path taken by message (for debugging/visualization)
 */

/**
 * Create a new message
 * @param {number} sender - Sender node ID
 * @param {number} receiver - Receiver node ID
 * @param {string} type - Message type
 * @param {Object} content - Message content
 * @param {Object} options - Additional options
 * @returns {Message} New message object
 */
export function createMessage(
  sender,
  receiver,
  type,
  content,
  options = {}
) {
  return {
    id: `${sender}-${receiver}-${type}-${Date.now()}-${Math.random()}`,
    sender,
    receiver,
    type,
    content,
    timestamp: Date.now(),
    ttl: options.ttl ?? 10, // Default max 10 hops
    path: [sender],
  };
}

/**
 * Send message to a specific node (if directly connected)
 * @param {number} senderId - Sender node ID
 * @param {number} receiverId - Receiver node ID
 * @param {string} type - Message type
 * @param {Object} content - Message content
 * @param {Edge[]} edges - Network edges
 * @param {number} globalLatency - Global latency fallback (ms)
 * @param {number} globalPacketLoss - Global packet loss fallback (0-100)
 * @returns {Object|null} Delivery info or null if failed
 */
export function sendMessage(
  senderId,
  receiverId,
  type,
  content,
  edges,
  globalLatency = 0,
  globalPacketLoss = 0
) {
  // Find direct edge between sender and receiver
  const edge = edges.find(
    (e) =>
      (e.source === senderId && e.target === receiverId) ||
      (e.bidirectional &&
        e.source === receiverId &&
        e.target === senderId)
  );

  if (!edge) {
    // No direct connection
    return null;
  }

  // Calculate delivery
  const latency = edge.latency ?? globalLatency;
  const packetLoss = edge.packetLoss ?? globalPacketLoss;

  // Simulate packet loss
  if (Math.random() * 100 < packetLoss) {
    return {
      delivered: false,
      reason: "packet-loss",
      latency: 0,
    };
  }

  // Message delivered successfully
  const message = createMessage(
    senderId,
    receiverId,
    type,
    content
  );
  return {
    delivered: true,
    message,
    latency,
    deliveryTime: Date.now() + latency,
  };
}

/**
 * Broadcast message to all neighbors (flooding)
 * @param {number} senderId - Sender node ID
 * @param {number[]} neighbors - Array of neighbor node IDs
 * @param {string} type - Message type
 * @param {Object} content - Message content
 * @param {Edge[]} edges - Network edges
 * @param {number} globalLatency - Global latency fallback
 * @param {number} globalPacketLoss - Global packet loss fallback
 * @returns {Object} Broadcast results
 */
export function broadcastToNeighbors(
  senderId,
  neighbors,
  type,
  content,
  edges,
  globalLatency = 0,
  globalPacketLoss = 0
) {
  const results = {
    sent: 0,
    delivered: 0,
    failed: 0,
    messages: [],
  };

  neighbors.forEach((neighborId) => {
    results.sent++;
    const result = sendMessage(
      senderId,
      neighborId,
      type,
      content,
      edges,
      globalLatency,
      globalPacketLoss
    );

    if (result && result.delivered) {
      results.delivered++;
      results.messages.push(result.message);
    } else {
      results.failed++;
    }
  });

  return results;
}

/**
 * Flood message through network (multi-hop broadcast)
 * Simulates gossip protocol where nodes rebroadcast received messages
 * @param {number} originId - Origin node ID
 * @param {string} type - Message type
 * @param {Object} content - Message content
 * @param {Object[]} nodes - Array of all nodes with neighbor info
 * @param {Edge[]} edges - Network edges
 * @param {Object} config - Network configuration
 * @returns {Object} Flood results
 */
export function floodMessage(
  originId,
  type,
  content,
  nodes,
  edges,
  config
) {
  const {
    latency: globalLatency = 0,
    packetLoss: globalPacketLoss = 0,
  } = config.network || {};

  const delivered = new Set([originId]); // Nodes that received message
  const pending = [{ nodeId: originId, hops: 0 }]; // Nodes to process
  const results = {
    totalSent: 0,
    totalDelivered: 1, // Origin has message
    totalFailed: 0,
    maxHops: 0,
    deliveryMap: { [originId]: 0 }, // nodeId -> hop count
  };

  while (pending.length > 0) {
    const { nodeId, hops } = pending.shift();

    // Find node's neighbors
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.neighbors) continue;

    results.maxHops = Math.max(results.maxHops, hops);

    // Broadcast to neighbors
    node.neighbors.forEach((neighborId) => {
      // Skip if already delivered
      if (delivered.has(neighborId)) return;

      // Check if neighbor is online
      const neighborNode = nodes.find(
        (n) => n.id === neighborId
      );
      if (!neighborNode || !neighborNode.isOnline) {
        results.totalFailed++;
        return;
      }

      results.totalSent++;

      // Attempt delivery
      const deliveryResult = sendMessage(
        nodeId,
        neighborId,
        type,
        content,
        edges,
        globalLatency,
        globalPacketLoss
      );

      if (deliveryResult && deliveryResult.delivered) {
        results.totalDelivered++;
        delivered.add(neighborId);
        results.deliveryMap[neighborId] = hops + 1;

        // Add to pending for further propagation
        pending.push({ nodeId: neighborId, hops: hops + 1 });
      } else {
        results.totalFailed++;
      }
    });
  }

  return {
    ...results,
    reachedNodes: Array.from(delivered),
    reachPercentage: (
      (delivered.size / nodes.length) *
      100
    ).toFixed(1),
  };
}

/**
 * Process incoming messages for a node
 * @param {Object} node - Node object
 * @param {Message[]} messages - Messages in node's inbox
 * @returns {Object} Processing results
 */
export function processInbox(node, messages) {
  const processed = [];
  const byType = {
    proposal: [],
    prevote: [],
    precommit: [],
    decision: [],
  };

  messages.forEach((message) => {
    if (message.receiver !== node.id) return; // Not for this node

    processed.push(message);
    if (byType[message.type]) {
      byType[message.type].push(message);
    }
  });

  return {
    processed,
    byType,
    count: processed.length,
  };
}

/**
 * Get message statistics for visualization
 * @param {Object[]} nodes - All nodes with message queues
 * @returns {Object} Message statistics
 */
export function getMessageStatistics(nodes) {
  let totalInbox = 0;
  let totalOutbox = 0;
  const byType = {
    proposal: 0,
    prevote: 0,
    precommit: 0,
    decision: 0,
  };

  nodes.forEach((node) => {
    if (node.inbox) {
      totalInbox += node.inbox.length;
      node.inbox.forEach((msg) => {
        if (byType[msg.type] !== undefined) {
          byType[msg.type]++;
        }
      });
    }
    if (node.outbox) {
      totalOutbox += node.outbox.length;
    }
  });

  return {
    totalInbox,
    totalOutbox,
    byType,
    totalQueued: totalInbox + totalOutbox,
  };
}

/**
 * Clear all message queues
 * @param {Object[]} nodes - All nodes
 * @returns {Object[]} Nodes with cleared queues
 */
export function clearMessageQueues(nodes) {
  return nodes.map((node) => ({
    ...node,
    inbox: [],
    outbox: [],
  }));
}

/**
 * Simulate message delivery with latency
 * @param {Message[]} messages - Pending messages
 * @param {number} currentTime - Current simulation time
 * @returns {Message[]} Messages ready for delivery
 */
export function getReadyMessages(messages, currentTime) {
  return messages.filter((msg) => {
    const deliveryTime = msg.timestamp + (msg.latency || 0);
    return deliveryTime <= currentTime;
  });
}
