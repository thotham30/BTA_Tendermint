import React from "react";
import { ConsensusProvider } from "./context/ConsensusContext";
import ConsensusVisualizer from "./components/ConsensusVisualizer";
import Controls from "./components/Controls";
import LivenessIndicator from "./components/LivenessIndicator";
import SafetyIndicator from "./components/SafetyIndicator";
import "./styles/App.css";

export default function App() {
  return (
    <ConsensusProvider>
      <div className="app-container">
        <header className="app-header">
          <h1>Tendermint Protocol Visualizer</h1>
          <p>Visualizing Liveness & Safety in Consensus</p>
        </header>

        <div className="indicators">
          <LivenessIndicator />
          <SafetyIndicator />
        </div>

        <ConsensusVisualizer />
        <Controls />
      </div>
    </ConsensusProvider>
  );
}
