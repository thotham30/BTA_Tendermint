import React from "react";
import { motion } from "framer-motion";
import { useConsensus } from "../context/ConsensusContext";

export default function Node({ node, isHighlighted = false }) {
  const { id, state, color, isPartitioned } = node;
  const {
    currentRoundVotes,
    currentProposer,
    partitionActive,
    config,
  } = useConsensus();

  // Check if this node is the current proposer
  const isProposer =
    currentProposer && currentProposer.id === id;

  // Get network health indicators
  const latency = config?.network?.latency || 0;
  const packetLoss = config?.network?.packetLoss || 0;
  const hasNetworkIssues =
    latency > 1000 || packetLoss > 20 || isPartitioned;

  // Get vote status for this node
  const getVoteStatus = () => {
    if (!currentRoundVotes) return null;

    const prevote = currentRoundVotes.prevotesReceived[id];
    const precommit = currentRoundVotes.precommitsReceived[id];

    // Show precommit if available, otherwise prevote
    if (precommit !== null && precommit !== undefined) {
      return { vote: precommit, phase: "precommit" };
    } else if (prevote !== null && prevote !== undefined) {
      return { vote: prevote, phase: "prevote" };
    }
    return null;
  };

  const voteStatus = getVoteStatus();

  const renderVoteBadge = () => {
    if (!voteStatus) return null;

    if (voteStatus.vote === true) {
      return (
        <motion.div
          className="vote-yes-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          ✓
        </motion.div>
      );
    } else if (voteStatus.vote === false) {
      return (
        <motion.div
          className="vote-no-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          ✗
        </motion.div>
      );
    } else {
      return <div className="vote-pending-badge">?</div>;
    }
  };

  return (
    <motion.div
      className={`node ${isProposer ? "node-proposer" : ""} ${
        isHighlighted ? "node-highlighted" : ""
      } ${isPartitioned ? "node-partitioned" : ""}`}
      style={{
        backgroundColor: color,
        boxShadow: isHighlighted
          ? "0 0 20px rgba(255, 215, 0, 0.8)"
          : "none",
        border: isPartitioned ? "3px dashed #f59e0b" : undefined,
      }}
      whileHover={{ scale: 1.1 }}
      title={
        isPartitioned
          ? `Node ${id} - Partitioned (disconnected from network)`
          : node.isByzantine
          ? `Node ${id} - Byzantine: ${node.byzantineType}`
          : `Node ${id} - ${state}`
      }
    >
      <div className="node-id">Node {id}</div>
      <div className="node-state">{state}</div>
      {renderVoteBadge()}

      {/* Partition indicator - highest priority */}
      {isPartitioned && (
        <div
          className="partition-indicator"
          title="Node is partitioned from the network"
        >
          🔌
        </div>
      )}

      {/* Byzantine indicator */}
      {node.isByzantine && !isPartitioned && (
        <div
          className="byzantine-indicator"
          title={`Byzantine: ${node.byzantineType}`}
        >
          ⚠
        </div>
      )}

      {/* Network health indicator */}
      {hasNetworkIssues && !isPartitioned && (
        <div
          className="network-health-indicator"
          title={`Network issues: ${latency}ms latency, ${packetLoss}% packet loss`}
        >
          📡
        </div>
      )}

      {/* Proposer indicator (never shown for Byzantine or partitioned) */}
      {isProposer && !isPartitioned && (
        <div
          className="proposer-indicator"
          title="Current Proposer"
        >
          👑
        </div>
      )}

      {isHighlighted && (
        <motion.div
          className="highlight-ring"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
