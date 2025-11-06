import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function LivenessIndicator() {
  const {
    liveness,
    roundTimeouts,
    round,
    consecutiveTimeouts,
    partitionActive,
    partitionedNodes,
    nodes,
  } = useConsensus();

  // Calculate timeout impact on liveness
  const timeoutRate =
    round > 0 ? (roundTimeouts / round) * 100 : 0;
  const hasHighTimeoutRate = timeoutRate > 40;
  const hasConsecutiveTimeouts = consecutiveTimeouts > 3;

  // Calculate partition impact
  const partitionRatio =
    partitionActive && nodes.length > 0
      ? partitionedNodes.length / nodes.length
      : 0;
  const hasSignificantPartition = partitionRatio > 0.3; // > 30% partitioned

  // Liveness is degraded if there are excessive timeouts or partitions
  const livenessStatus =
    liveness && !hasHighTimeoutRate && !hasSignificantPartition
      ? "Maintained"
      : hasHighTimeoutRate ||
        hasConsecutiveTimeouts ||
        hasSignificantPartition
      ? "Degraded"
      : "Violated";

  const getColor = () => {
    if (livenessStatus === "Maintained") return "#10b981"; // Green
    if (livenessStatus === "Degraded") return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  const getMessage = () => {
    if (livenessStatus === "Maintained") {
      return "Consensus progressing normally";
    } else if (livenessStatus === "Degraded") {
      const reasons = [];
      if (hasHighTimeoutRate) {
        reasons.push(
          `High timeout rate (${timeoutRate.toFixed(1)}%)`
        );
      }
      if (hasConsecutiveTimeouts) {
        reasons.push(
          `${consecutiveTimeouts} consecutive timeouts`
        );
      }
      if (hasSignificantPartition) {
        reasons.push(
          `${partitionedNodes.length} nodes partitioned (${(
            partitionRatio * 100
          ).toFixed(0)}%)`
        );
      }
      return reasons.join(", ") + " - Progress slowed";
    } else {
      if (partitionActive && hasSignificantPartition) {
        return "Network partition preventing consensus progress";
      }
      return "Consensus cannot progress";
    }
  };

  return (
    <div
      className="indicator liveness-indicator"
      style={{
        backgroundColor: getColor(),
      }}
    >
      <h4>
        Liveness: {livenessStatus}{" "}
        {livenessStatus === "Maintained"
          ? "✅"
          : livenessStatus === "Degraded"
          ? "⚠️"
          : "❌"}
      </h4>
      <p className="indicator-message">{getMessage()}</p>
      {(hasHighTimeoutRate ||
        hasConsecutiveTimeouts ||
        hasSignificantPartition) && (
        <p className="indicator-hint">
          💡{" "}
          {hasSignificantPartition
            ? "Network partitions prevent nodes from reaching consensus threshold"
            : "Timeouts indicate network issues or Byzantine behavior affecting liveness"}
        </p>
      )}
    </div>
  );
}
