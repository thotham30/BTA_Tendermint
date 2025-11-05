import React from "react";
import {
  ConsensusProvider,
  useConsensus,
} from "./context/ConsensusContext";
import ConsensusVisualizer from "./components/ConsensusVisualizer";
import Controls from "./components/Controls";
import LivenessIndicator from "./components/LivenessIndicator";
import SafetyIndicator from "./components/SafetyIndicator";
import LogsWindow from "./components/LogsWindow";
import "./styles/App.css";

function AppContent() {
  const { config } = useConsensus();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Tendermint Protocol Visualizer</h1>
        <p>Visualizing Liveness & Safety in Consensus</p>
        <div className="config-summary">
          <div className="summary-item">
            <span className="summary-label">Nodes:</span>
            <span className="summary-value">
              {config.network.nodeCount}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Latency:</span>
            <span className="summary-value">
              {config.network.latency}ms
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Threshold:</span>
            <span className="summary-value">
              {config.consensus.voteThreshold === 0.67
                ? "2/3+"
                : config.consensus.voteThreshold === 0.5
                ? "1/2+"
                : config.consensus.voteThreshold === 0.75
                ? "3/4+"
                : `${(
                    config.consensus.voteThreshold * 100
                  ).toFixed(0)}%`}
            </span>
          </div>
          {config.nodeBehavior.byzantineCount > 0 && (
            <div className="summary-item warning">
              <span className="summary-label">Byzantine:</span>
              <span className="summary-value">
                {config.nodeBehavior.byzantineCount}
              </span>
            </div>
          )}
          {config.network.packetLoss > 0 && (
            <div className="summary-item warning">
              <span className="summary-label">Packet Loss:</span>
              <span className="summary-value">
                {config.network.packetLoss}%
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="indicators">
        <LivenessIndicator />
        <SafetyIndicator />
      </div>

      <div className="main-content">
        <div className="left-panel">
          <ConsensusVisualizer />
          <Controls />
        </div>
        <LogsWindow />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ConsensusProvider>
      <AppContent />
    </ConsensusProvider>
  );
}
