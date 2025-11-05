import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function SafetyIndicator() {
  const { safety, blocks, config } = useConsensus();

  // Safety is generally not affected by timeouts, but we can provide context
  const byzantineCount =
    config?.nodeBehavior?.byzantineCount || 0;

  const getMessage = () => {
    if (safety) {
      return byzantineCount > 0
        ? `No forks detected despite ${byzantineCount} Byzantine nodes`
        : "No conflicting blocks committed";
    } else {
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
    </div>
  );
}
