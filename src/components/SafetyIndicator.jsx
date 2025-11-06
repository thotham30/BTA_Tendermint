import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function SafetyIndicator() {
  const {
    safety,
    blocks,
    config,
    partitionActive,
    partitionedNodes,
    nodes,
  } = useConsensus();

  // Safety is generally not affected by timeouts, but partitions can create concerns
  const byzantineCount =
    config?.nodeBehavior?.byzantineCount || 0;
  const maxByzantine = Math.floor(
    (nodes?.length || config?.network?.nodeCount || 0) / 3
  );
  const byzantineExceedsThreshold =
    byzantineCount > maxByzantine;

  const getMessage = () => {
    if (safety) {
      const messages = [];
      if (byzantineCount > 0 && !byzantineExceedsThreshold) {
        messages.push(
          `No forks despite ${byzantineCount} Byzantine nodes (≤${maxByzantine} safe limit)`
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
      if (byzantineExceedsThreshold) {
        return `CRITICAL: Byzantine nodes (${byzantineCount}) exceed safety threshold (${maxByzantine})! Protocol guarantees broken!`;
      }
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
        backgroundColor: safety ? "#3b82f6" : "#ef4444",
      }}
    >
      <h4>Safety: {safety ? "Maintained ✅" : "Violated ❌"}</h4>
      <p className="indicator-message">{getMessage()}</p>
      {safety &&
        byzantineCount > 0 &&
        !byzantineExceedsThreshold && (
          <p className="indicator-hint">
            💡 Byzantine Fault Tolerance working correctly
            (within {maxByzantine} limit)
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
      {!safety && byzantineExceedsThreshold && (
        <p className="indicator-hint">
          ⚠️ Byzantine nodes exceed n/3 threshold - BFT
          assumptions violated, forks and conflicting commits are
          possible!
        </p>
      )}
      {!safety &&
        partitionActive &&
        !byzantineExceedsThreshold && (
          <p className="indicator-hint">
            ⚠️ Network partition may have allowed conflicting
            commits in separate partitions
          </p>
        )}
    </div>
  );
}
