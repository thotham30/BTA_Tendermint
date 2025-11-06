import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function SafetyIndicator() {
  const {
    safety,
    blocks,
    config,
    partitionActive,
    partitionedNodes,
  } = useConsensus();

  // Safety is generally not affected by timeouts, but partitions can create concerns
  const byzantineCount =
    config?.nodeBehavior?.byzantineCount || 0;

  const getMessage = () => {
    if (safety) {
      const messages = [];
      if (byzantineCount > 0) {
        messages.push(
          `No forks despite ${byzantineCount} Byzantine nodes`
        );
      }
      if (partitionActive && partitionedNodes.length > 0) {
        messages.push(`No conflicting commits during partition`);
      }
      if (messages.length === 0) {
        return "No conflicting blocks committed";
      }
      return messages.join(" • ");
    } else {
      if (partitionActive) {
        return "Fork detected - partition may have caused split-brain scenario!";
      }
      return "Fork detected - conflicting blocks committed!";
    }
  };

  return (
    <div
      className="indicator safety-indicator"
      style={{
        backgroundColor: safety ? "#3b82f6" : "#f97316",
      }}
    >
      <h4>Safety: {safety ? "Maintained ✅" : "Violated ⚠️"}</h4>
      <p className="indicator-message">{getMessage()}</p>
      {safety && byzantineCount > 0 && (
        <p className="indicator-hint">
          💡 Byzantine Fault Tolerance working correctly
        </p>
      )}
      {safety &&
        partitionActive &&
        partitionedNodes.length > 0 && (
          <p className="indicator-hint">
            💡 Safety maintained despite network partition - no
            split-brain scenario
          </p>
        )}
      {!safety && partitionActive && (
        <p className="indicator-hint">
          ⚠️ Network partition may have allowed conflicting
          commits in separate partitions
        </p>
      )}
    </div>
  );
}
