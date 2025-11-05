import React, { useState } from "react";
import { useConsensus } from "../context/ConsensusContext";
import { PRESET_CONFIGS } from "../utils/ConfigManager";
import ConfigurationPanel from "./ConfigurationPanel";

export default function Controls() {
  const {
    isRunning,
    speed,
    config,
    startConsensus,
    stopConsensus,
    resetNetwork,
    changeSpeed,
    loadNewConfig,
  } = useConsensus();

  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const speedOptions = [
    { label: "0.25x", value: 0.25 },
    { label: "0.5x", value: 0.5 },
    { label: "1x", value: 1 },
    { label: "2x", value: 2 },
    { label: "4x", value: 4 },
  ];

  const handlePreset = (presetName) => {
    const preset = PRESET_CONFIGS[presetName];
    if (preset) {
      loadNewConfig(preset);
    }
  };

  return (
    <>
      <div className="controls">
        <div className="control-buttons">
          {!isRunning ? (
            <button
              onClick={startConsensus}
              className="start-btn"
            >
              Start
            </button>
          ) : (
            <button onClick={stopConsensus} className="stop-btn">
              Pause
            </button>
          )}
          <button onClick={resetNetwork} className="reset-btn">
            Reset
          </button>
          <button
            onClick={() => setShowConfigPanel(true)}
            className="config-btn"
          >
            ⚙️ Configuration
          </button>
        </div>

        <div className="config-info">
          <span className="config-name">
            Current: <strong>{config.name}</strong>
          </span>
          <span className="config-summary">
            {config.network.nodeCount} nodes •{" "}
            {config.network.latency}ms latency
            {config.nodeBehavior.byzantineCount > 0 &&
              ` • ${config.nodeBehavior.byzantineCount} byzantine`}
          </span>
        </div>

        <div className="preset-controls">
          <label>Quick Presets:</label>
          <div className="preset-buttons">
            <button
              onClick={() => handlePreset("smallNetwork")}
              className="preset-btn"
            >
              Small
            </button>
            <button
              onClick={() => handlePreset("largeNetwork")}
              className="preset-btn"
            >
              Large
            </button>
            <button
              onClick={() => handlePreset("byzantineTest")}
              className="preset-btn"
            >
              Byzantine
            </button>
            <button
              onClick={() => handlePreset("partitionTest")}
              className="preset-btn"
            >
              Partition
            </button>
          </div>
        </div>

        <div className="speed-controls">
          <label>Speed:</label>
          {speedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => changeSpeed(option.value)}
              className={`speed-btn ${
                speed === option.value ? "active" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ConfigurationPanel
        isOpen={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
        currentConfig={config}
        onApplyConfig={loadNewConfig}
      />
    </>
  );
}
