import React, { useRef, useEffect } from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function LogsWindow() {
  const {
    logs,
    roundTimeouts,
    consecutiveTimeouts,
    round,
    blocks,
  } = useConsensus();
  const logsEndRef = useRef(null);

  // Auto-scroll to the bottom when new logs are added
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Calculate timeout statistics
  const timeoutRate =
    round > 0 ? ((roundTimeouts / round) * 100).toFixed(1) : 0;
  const isHighTimeout = timeoutRate > 40;

  return (
    <div className="logs-window">
      <h3 className="logs-title">Simulation Logs</h3>

      {/* Timeout Statistics Summary */}
      {roundTimeouts > 0 && (
        <div
          className={`timeout-summary ${
            isHighTimeout ? "high-timeout" : ""
          }`}
        >
          <div className="timeout-summary-item">
            <span className="summary-label">
              Total Timeouts:
            </span>
            <span className="summary-value">
              {roundTimeouts}
            </span>
          </div>
          <div className="timeout-summary-item">
            <span className="summary-label">Consecutive:</span>
            <span className="summary-value">
              {consecutiveTimeouts}
            </span>
          </div>
          <div className="timeout-summary-item">
            <span className="summary-label">Rate:</span>
            <span
              className={`summary-value ${
                isHighTimeout ? "warning-text" : ""
              }`}
            >
              {timeoutRate}%
            </span>
          </div>
          {isHighTimeout && (
            <div className="timeout-warning">
              ⚠️ High timeout rate detected - potential liveness
              issue!
            </div>
          )}
        </div>
      )}

      <div className="logs-container">
        {logs.length === 0 ? (
          <p className="logs-empty">
            No logs yet. Start the simulation!
          </p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`log-entry log-${log.type}`}
            >
              <span className="log-timestamp">
                [{log.timestamp}]
              </span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
      <button
        className="logs-clear-btn"
        onClick={() => window.location.reload()}
      >
        Clear Logs
      </button>
    </div>
  );
}
