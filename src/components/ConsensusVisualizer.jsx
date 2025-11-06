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
import NetworkPartition from "./NetworkPartition";
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
    stepMode,
    highlightedNodes,
    stepState,
    isSynchronousMode,
    stepModeRound,
  } = useConsensus();

  // Use stepModeRound in step mode, otherwise use continuous round
  const displayRound = stepMode ? stepModeRound : round;

  return (
    <div className="visualizer-container">
      <h2>Consensus Round: {displayRound}</h2>

      {/* Step-by-Step Phase Indicator */}
      {stepMode && stepState && (
        <div
          className={`phase-indicator phase-${stepState.phase}`}
        >
          <span className="phase-label">
            {stepState.phase.toUpperCase()}
          </span>
        </div>
      )}

      {/* Timeout Visualizer Section - Only in asynchronous mode */}
      {isRunning && !stepMode && !isSynchronousMode && (
        <div className="timeout-section">
          <TimeoutVisualizer />
        </div>
      )}

      {/* Network Partition Panel */}
      <NetworkPartition />

      <div className="nodes-container">
        {nodes.map((node) => {
          const isHighlighted =
            stepMode && highlightedNodes.includes(node.id);
          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0 }}
              animate={{
                scale: isHighlighted ? 1.2 : 1,
                borderWidth: isHighlighted ? 3 : 0,
              }}
              transition={{ duration: 0.3 }}
              className={isHighlighted ? "highlighted-node" : ""}
            >
              <Node node={node} isHighlighted={isHighlighted} />
            </motion.div>
          );
        })}
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
            <Block key={idx} block={block} nodes={nodes} />
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
