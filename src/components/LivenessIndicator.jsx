import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function LivenessIndicator() {
  const { liveness, roundTimeouts, round, consecutiveTimeouts } =
    useConsensus();

  // Calculate timeout impact on liveness
  const timeoutRate =
    round > 0 ? (roundTimeouts / round) * 100 : 0;
  const hasHighTimeoutRate = timeoutRate > 40;
  const hasConsecutiveTimeouts = consecutiveTimeouts > 3;

  // Liveness is degraded if there are excessive timeouts
  const livenessStatus =
    liveness && !hasHighTimeoutRate
      ? "Maintained"
      : hasHighTimeoutRate || hasConsecutiveTimeouts
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
      return `${
        hasHighTimeoutRate
          ? `High timeout rate (${timeoutRate.toFixed(1)}%)`
          : `${consecutiveTimeouts} consecutive timeouts`
      } - Progress slowed`;
    } else {
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
      {(hasHighTimeoutRate || hasConsecutiveTimeouts) && (
        <p className="indicator-hint">
          💡 Timeouts indicate network issues or Byzantine
          behavior affecting liveness
        </p>
      )}
    </div>
  );
}
