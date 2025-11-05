import React from "react";
import { motion } from "framer-motion";
import { useConsensus } from "../context/ConsensusContext";

export default function Node({ node }) {
  const { id, state, color } = node;
  const { currentRoundVotes } = useConsensus();

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
          className="vote-badge vote-yes-badge"
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
          className="vote-badge vote-no-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          ✗
        </motion.div>
      );
    } else {
      return (
        <div className="vote-badge vote-pending-badge">?</div>
      );
    }
  };

  return (
    <motion.div
      className="node"
      style={{ backgroundColor: color }}
      whileHover={{ scale: 1.1 }}
    >
      <div className="node-id">Node {id}</div>
      <div className="node-state">{state}</div>
      {renderVoteBadge()}
      {node.isByzantine && (
        <div
          className="byzantine-indicator"
          title={`Byzantine: ${node.byzantineType}`}
        >
          ⚠
        </div>
      )}
    </motion.div>
  );
}
