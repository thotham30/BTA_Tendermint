import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function TimeoutStats() {
  const {
    roundTimeouts,
    consecutiveTimeouts,
    timeoutHistory,
    round,
    blocks,
  } = useConsensus();

  // Calculate statistics
  const totalRounds = round;
  const successfulRounds = blocks.length;
  const timeoutRate =
    totalRounds > 0 ? (roundTimeouts / totalRounds) * 100 : 0;

  const avgTimeout =
    timeoutHistory.length > 0
      ? timeoutHistory.reduce((sum, t) => sum + t.duration, 0) /
        timeoutHistory.length
      : 0;

  const maxEscalation =
    timeoutHistory.length > 0
      ? Math.max(...timeoutHistory.map((t) => t.escalationLevel))
      : 0;

  // Determine if timeouts are excessive
  const isExcessive =
    timeoutRate > 50 || consecutiveTimeouts > 5;

  // Get recent timeout chain
  const recentTimeouts = timeoutHistory.slice(-5).reverse();

  return (
    <div className="timeout-stats">
      <h3>Timeout Statistics</h3>

      {roundTimeouts === 0 ? (
        <div className="no-timeouts">
          <p>
            ✓ No timeouts yet! Consensus is progressing smoothly.
          </p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-box-label">
                Total Timeouts
              </div>
              <div className="stat-box-value stat-timeout">
                {roundTimeouts}
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Consecutive</div>
              <div
                className={`stat-box-value ${
                  consecutiveTimeouts > 3 ? "stat-warning" : ""
                }`}
              >
                {consecutiveTimeouts}
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Timeout Rate</div>
              <div
                className={`stat-box-value ${
                  timeoutRate > 30 ? "stat-warning" : ""
                }`}
              >
                {timeoutRate.toFixed(1)}%
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Avg Duration</div>
              <div className="stat-box-value">
                {Math.round(avgTimeout)}ms
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">
                Max Escalation
              </div>
              <div className="stat-box-value">
                {maxEscalation}
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-box-label">Success Rate</div>
              <div className="stat-box-value stat-success">
                {totalRounds > 0
                  ? (
                      (successfulRounds / totalRounds) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>

          {isExcessive && (
            <div className="timeout-alert">
              <strong>⚠️ Excessive Timeouts Detected!</strong>
              <p>
                High timeout rate indicates potential liveness
                issues. This could be caused by:
              </p>
              <ul>
                <li>High network latency or packet loss</li>
                <li>Byzantine nodes disrupting consensus</li>
                <li>
                  Insufficient timeout duration for network
                  conditions
                </li>
              </ul>
            </div>
          )}

          {recentTimeouts.length > 0 && (
            <div className="timeout-chain">
              <h4>Recent Timeout Chain</h4>
              <div className="chain-list">
                {recentTimeouts.map((timeout, idx) => (
                  <div key={idx} className="chain-item">
                    <div className="chain-marker">
                      <span className="escalation-badge">
                        {timeout.escalationLevel}x
                      </span>
                    </div>
                    <div className="chain-details">
                      <div className="chain-round">
                        Round {timeout.round}
                      </div>
                      <div className="chain-info">
                        {Math.round(timeout.duration)}ms timeout
                        {timeout.proposer &&
                          ` • Proposer: Node ${timeout.proposer.id}`}
                      </div>
                      <div className="chain-time">
                        {new Date(
                          timeout.timestamp
                        ).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="timeout-education">
            <h4>💡 Understanding Timeouts</h4>
            <p>
              <strong>Exponential Backoff:</strong> Each timeout
              increases the duration by a multiplier (e.g.,
              1.5x). This prevents livelock scenarios where nodes
              keep timing out at the same rate.
            </p>
            <p>
              <strong>Byzantine Fault Tolerance:</strong>{" "}
              Timeouts ensure progress even when Byzantine nodes
              try to stall consensus by not voting or proposing
              invalid blocks.
            </p>
            <p>
              <strong>Network Resilience:</strong> Adaptive
              timeout durations help the system adjust to varying
              network conditions automatically.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
