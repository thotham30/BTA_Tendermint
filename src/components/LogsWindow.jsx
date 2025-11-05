import React, { useRef, useEffect } from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function LogsWindow() {
  const { logs } = useConsensus();
  const logsEndRef = useRef(null);

  // Auto-scroll to the bottom when new logs are added
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="logs-window">
      <h3 className="logs-title">Simulation Logs</h3>
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
