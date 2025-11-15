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
import StepByStepControls from "./components/StepByStepControls";
import StateInspector from "./components/StateInspector";
import DetailedStepView from "./components/DetailedStepView";
import { formatVoteThreshold } from "./utils/ConfigManager";
import "./styles/App.css";

function AppContent() {
  const { config, stepMode } = useConsensus();

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
              {formatVoteThreshold(
                config.consensus.voteThreshold
              )}
            </span>
          </div>
          {config.nodeBehavior.byzantineCount > 0 && (
            <div
              className={`summary-item ${
                config.nodeBehavior.byzantineCount >
                Math.floor(config.network.nodeCount / 3)
                  ? "critical"
                  : "warning"
              }`}
            >
              <span className="summary-label">Byzantine:</span>
              <span className="summary-value">
                {config.nodeBehavior.byzantineCount}
                {config.nodeBehavior.byzantineCount >
                  Math.floor(config.network.nodeCount / 3) && (
                  <span
                    style={{
                      marginLeft: "4px",
                      fontSize: "0.9em",
                    }}
                  >
                    ⚠️
                  </span>
                )}
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

      {/* Step-by-Step Controls */}
      {stepMode && <StepByStepControls />}

      <div
        className={`main-content ${
          stepMode ? "step-mode-layout" : ""
        }`}
      >
        <div className="left-panel">
          <ConsensusVisualizer />
          <Controls />
        </div>

        {stepMode ? (
          <div className="right-panel-step-mode">
            <StateInspector />
            <DetailedStepView />
            <div className="step-mode-logs">
              <LogsWindow />
            </div>
          </div>
        ) : (
          <LogsWindow />
        )}
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
