import React from "react";
import { motion } from "framer-motion";
import Node from "./Node";
import Block from "./Block";
import VotingBreakdown from "./VotingBreakdown";
import VotingVisualization from "./VotingVisualization";
import VotingHistory from "./VotingHistory";
import VotingDetails from "./VotingDetails";
import VotingStatistics from "./VotingStatistics";
import TimeoutVisualizer from "./TimeoutVisualizer";
import TimeoutStats from "./TimeoutStats";
import { useConsensus } from "../context/ConsensusContext";
import "../styles/Visualizer.css";

export default function ConsensusVisualizer() {
  const {
    nodes,
    blocks,
    round,
    showVotingDetails,
    showVotingHistory,
    currentRoundVotes,
    isRunning,
  } = useConsensus();

  return (
    <div className="visualizer-container">
      <h2>Consensus Round: {round}</h2>

      {/* Timeout Visualizer Section */}
      {isRunning && (
        <div className="timeout-section">
          <TimeoutVisualizer />
        </div>
      )}

      <div className="nodes-container">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Node node={node} />
          </motion.div>
        ))}
      </div>

      {/* Voting Visualization Section */}
      {showVotingDetails && currentRoundVotes && (
        <div className="voting-section">
          <VotingVisualization />
          <VotingBreakdown />
        </div>
      )}

      {/* Voting Statistics Section */}
      {showVotingDetails && (
        <div className="statistics-section">
          <VotingStatistics />
        </div>
      )}

      {/* Timeout Statistics Section */}
      <div className="timeout-stats-section">
        <TimeoutStats />
      </div>

      <div className="blocks-container">
        <h3>Committed Blocks</h3>
        <div className="blocks-scroll">
          {blocks.map((block, idx) => (
            <Block key={idx} block={block} />
          ))}
        </div>
      </div>

      {/* Voting History Modal */}
      {showVotingHistory && <VotingHistory />}

      {/* Voting Details Modal */}
      <VotingDetails />
    </div>
  );
}
