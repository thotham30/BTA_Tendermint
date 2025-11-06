import React from "react";
import { useConsensus } from "../context/ConsensusContext";
import { motion } from "framer-motion";

export default function NetworkPartition() {
  const {
    partitionActive,
    partitionedNodes,
    partitionType,
    networkStats,
    config,
  } = useConsensus();

  if (!partitionActive) return null;

  const latency = config?.network?.latency || 0;
  const packetLoss = config?.network?.packetLoss || 0;

  const deliveryRate =
    networkStats.messagesSent > 0
      ? (
          (networkStats.messagesDelivered /
            networkStats.messagesSent) *
          100
        ).toFixed(1)
      : 100;

  const getPartitionDescription = () => {
    switch (partitionType) {
      case "single":
        return `Single Node Isolated: ${partitionedNodes.length} node(s) disconnected`;
      case "split":
        return `Network Split: ${partitionedNodes.length} nodes in minority partition`;
      case "gradual":
        return `Gradual Degradation: ${partitionedNodes.length} nodes experiencing issues`;
      default:
        return "Network Partition Active";
    }
  };

  return (
    <motion.div
      className="network-partition-panel"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="partition-header">
        <h3>🔌 Network Partition Active</h3>
        <div className="partition-warning">
          ⚠️ Consensus may be affected
        </div>
      </div>

      <div className="partition-info">
        <div className="partition-description">
          {getPartitionDescription()}
        </div>

        <div className="partition-affected-nodes">
          <strong>Affected Nodes:</strong>{" "}
          {partitionedNodes.length > 0
            ? partitionedNodes.join(", ")
            : "None"}
        </div>
      </div>

      <div className="network-stats-grid">
        <div className="network-stat">
          <div className="stat-label">Network Latency</div>
          <div className="stat-value">{latency}ms</div>
        </div>

        <div className="network-stat">
          <div className="stat-label">Packet Loss</div>
          <div className="stat-value">{packetLoss}%</div>
        </div>

        <div className="network-stat">
          <div className="stat-label">Messages Sent</div>
          <div className="stat-value">
            {networkStats.messagesSent}
          </div>
        </div>

        <div className="network-stat">
          <div className="stat-label">Messages Delivered</div>
          <div className="stat-value">
            {networkStats.messagesDelivered}
          </div>
        </div>

        <div className="network-stat">
          <div className="stat-label">Messages Lost</div>
          <div className="stat-value warning-value">
            {networkStats.messagesLost}
          </div>
        </div>

        <div className="network-stat">
          <div className="stat-label">Delivery Rate</div>
          <div
            className={`stat-value ${
              deliveryRate < 50 ? "warning-value" : ""
            }`}
          >
            {deliveryRate}%
          </div>
        </div>
      </div>

      <div className="partition-visual">
        <div className="partition-line">
          <div className="partition-line-segment dashed"></div>
        </div>
        <div className="partition-indicator">
          <span className="partition-icon">⚡</span>
          <span className="partition-text">
            Communication Disrupted
          </span>
        </div>
      </div>
    </motion.div>
  );
}
