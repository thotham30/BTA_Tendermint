import React, { useState, useEffect } from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function TimeoutVisualizer() {
  const {
    roundStartTime,
    timeoutDuration,
    consecutiveTimeouts,
    isRunning,
    currentProposer,
  } = useConsensus();

  const [timeRemaining, setTimeRemaining] =
    useState(timeoutDuration);
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    if (!isRunning) {
      setTimeRemaining(timeoutDuration);
      setPercentage(100);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - roundStartTime;
      const remaining = Math.max(0, timeoutDuration - elapsed);
      const pct = (remaining / timeoutDuration) * 100;

      setTimeRemaining(remaining);
      setPercentage(pct);
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [isRunning, roundStartTime, timeoutDuration]);

  // Determine color based on remaining time
  const getColor = () => {
    if (percentage > 50) return "#10b981"; // Green - safe
    if (percentage > 20) return "#f59e0b"; // Yellow - warning
    return "#ef4444"; // Red - critical
  };

  const getEscalationText = () => {
    if (consecutiveTimeouts === 0) return "No escalation";
    if (consecutiveTimeouts === 1) return "1st timeout";
    if (consecutiveTimeouts === 2) return "2nd timeout";
    if (consecutiveTimeouts === 3) return "3rd timeout";
    return `${consecutiveTimeouts}th timeout`;
  };

  const color = getColor();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="timeout-visualizer">
      <h3>Round Timeout</h3>

      <div className="timeout-content">
        <div className="circular-timer">
          <svg width="150" height="150" viewBox="0 0 150 150">
            {/* Background circle */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke="#334155"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 75 75)"
              style={{
                transition:
                  "stroke-dashoffset 0.05s linear, stroke 0.3s ease",
              }}
            />
          </svg>

          <div className="timer-text">
            <div className="time-value" style={{ color }}>
              {(timeRemaining / 1000).toFixed(1)}s
            </div>
            <div className="time-label">remaining</div>
          </div>
        </div>

        <div className="timeout-info">
          <div className="info-item">
            <span className="info-label">Timeout Duration:</span>
            <span className="info-value">
              {Math.round(timeoutDuration)}ms
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Escalation Level:</span>
            <span
              className={`info-value ${
                consecutiveTimeouts > 0 ? "escalated" : ""
              }`}
            >
              {getEscalationText()}
            </span>
          </div>

          {currentProposer && (
            <div className="info-item">
              <span className="info-label">
                Current Proposer:
              </span>
              <span className="info-value proposer-highlight">
                Node {currentProposer.id}
              </span>
            </div>
          )}

          <div className="timeout-explanation">
            <p>
              ℹ️ <strong>Why timeouts matter:</strong> If
              consensus doesn't progress within the timeout
              period, the system moves to the next proposer.
              Exponential backoff prevents livelock by increasing
              timeout duration after each failure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
