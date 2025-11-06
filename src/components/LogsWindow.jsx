import React, { useRef, useEffect } from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function LogsWindow() {
  const {
    logs,
    roundTimeouts,
    consecutiveTimeouts,
    round,
    blocks,
    partitionActive,
    partitionedNodes,
    networkStats,
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

  // Calculate network statistics
  const deliveryRate =
    networkStats.messagesSent > 0
      ? (
          (networkStats.messagesDelivered /
            networkStats.messagesSent) *
          100
        ).toFixed(1)
      : 100;
  const isLowDelivery = deliveryRate < 70;

  return (
    <div className="logs-window">
      <h3 className="logs-title">Simulation Logs</h3>

      {/* Network Partition Status */}
      {partitionActive && (
        <div className="partition-status-summary">
          <div className="status-header">
            <span className="status-icon">🔌</span>
            <span className="status-text">
              Network Partition Active
            </span>
          </div>
          <div className="partition-stats">
            <div className="partition-stat-item">
              <span>Affected Nodes:</span>
              <span className="warning-text">
                {partitionedNodes.length}
              </span>
            </div>
            <div className="partition-stat-item">
              <span>Delivery Rate:</span>
              <span
                className={isLowDelivery ? "warning-text" : ""}
              >
                {deliveryRate}%
              </span>
            </div>
            <div className="partition-stat-item">
              <span>Messages Lost:</span>
              <span className="warning-text">
                {networkStats.messagesLost}
              </span>
            </div>
          </div>
        </div>
      )}

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
              {partitionActive &&
                " Network partition may be the cause."}
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
