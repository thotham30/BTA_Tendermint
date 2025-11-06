import React, { useState, useEffect } from "react";
import { useConsensus } from "../context/ConsensusContext";
import {
  PRESET_CONFIGS,
  saveConfig,
  SPEED_OPTIONS,
} from "../utils/ConfigManager";
import ConfigurationPanel from "./ConfigurationPanel";

export default function Controls() {
  const {
    isRunning,
    speed,
    config,
    stepMode,
    startConsensus,
    stopConsensus,
    resetNetwork,
    changeSpeed,
    loadNewConfig,
    toggleVotingDetails,
    toggleVotingHistory,
    toggleStepMode,
    showVotingDetails,
    baseTimeoutDuration,
    timeoutMultiplier,
    timeoutEscalationEnabled,
    updateTimeoutSettings,
  } = useConsensus();

  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [localTimeout, setLocalTimeout] = useState(
    baseTimeoutDuration
  );
  const [localMultiplier, setLocalMultiplier] = useState(
    timeoutMultiplier
  );
  const [localEscalation, setLocalEscalation] = useState(
    timeoutEscalationEnabled
  );

  // Update local state when config changes
  useEffect(() => {
    setLocalTimeout(baseTimeoutDuration);
    setLocalMultiplier(timeoutMultiplier);
    setLocalEscalation(timeoutEscalationEnabled);
  }, [
    baseTimeoutDuration,
    timeoutMultiplier,
    timeoutEscalationEnabled,
  ]);

  const handlePreset = (presetName) => {
    const preset = PRESET_CONFIGS[presetName];
    if (preset) {
      loadNewConfig(preset);
    }
  };

  const handleTimeoutChange = (newTimeout) => {
    setLocalTimeout(newTimeout);
    updateTimeoutSettings(newTimeout, undefined, undefined);

    // Update config and save
    const updatedConfig = {
      ...config,
      consensus: {
        ...config.consensus,
        roundTimeout: newTimeout,
      },
    };
    saveConfig(updatedConfig);
  };

  const handleMultiplierChange = (newMultiplier) => {
    setLocalMultiplier(newMultiplier);
    updateTimeoutSettings(undefined, newMultiplier, undefined);

    // Update config and save
    const updatedConfig = {
      ...config,
      consensus: {
        ...config.consensus,
        timeoutMultiplier: newMultiplier,
      },
    };
    saveConfig(updatedConfig);
  };

  const handleEscalationToggle = () => {
    const newValue = !localEscalation;
    setLocalEscalation(newValue);
    updateTimeoutSettings(undefined, undefined, newValue);

    // Update config and save
    const updatedConfig = {
      ...config,
      consensus: {
        ...config.consensus,
        timeoutEscalationEnabled: newValue,
      },
    };
    saveConfig(updatedConfig);
  };

  return (
    <>
      <div className="controls">
        {/* Mode Selection */}
        <div className="mode-selection">
          <label>Simulation Mode:</label>
          <div className="mode-buttons">
            <button
              onClick={() => !stepMode || toggleStepMode()}
              className={`mode-btn ${!stepMode ? "active" : ""}`}
              disabled={!stepMode}
            >
              🔄 Continuous
            </button>
            <button
              onClick={() => stepMode || toggleStepMode()}
              className={`mode-btn ${stepMode ? "active" : ""}`}
              disabled={stepMode}
            >
              👣 Step-by-Step
            </button>
          </div>
        </div>

        <div className="control-buttons">
          {!stepMode && (
            <>
              {!isRunning ? (
                <button
                  onClick={startConsensus}
                  className="start-btn"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={stopConsensus}
                  className="stop-btn"
                >
                  Pause
                </button>
              )}
            </>
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
          <button
            onClick={toggleVotingHistory}
            className="voting-history-btn"
            title="View voting history"
          >
            📊 Voting History
          </button>
          <button
            onClick={toggleVotingDetails}
            className={`voting-toggle-btn ${
              showVotingDetails ? "active" : ""
            }`}
            title="Toggle voting breakdown display"
          >
            {showVotingDetails
              ? "👁️ Hide Votes"
              : "👁️ Show Votes"}
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

        {/* Timeout Controls Section */}
        {/* <div className="timeout-controls">
          <h4>⏱️ Timeout Settings</h4>

          <div className="timeout-control-item">
            <label>
              Initial Timeout:{" "}
              <span className="range-value">
                {localTimeout}ms
              </span>
            </label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={localTimeout}
              onChange={(e) =>
                handleTimeoutChange(Number(e.target.value))
              }
              disabled={isRunning}
            />
          </div>

          <div className="timeout-control-item">
            <label>
              Escalation Multiplier:{" "}
              <span className="range-value">
                {localMultiplier.toFixed(1)}x
              </span>
            </label>
            <input
              type="range"
              min="1.1"
              max="2.0"
              step="0.1"
              value={localMultiplier}
              onChange={(e) =>
                handleMultiplierChange(Number(e.target.value))
              }
              disabled={isRunning}
            />
          </div>

          <div className="timeout-control-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={localEscalation}
                onChange={handleEscalationToggle}
                disabled={isRunning}
              />
              <span>Enable Timeout Escalation</span>
            </label>
            <p className="control-help">
              When enabled, timeout duration increases
              exponentially after each failure
            </p>
          </div>
        </div> */}

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

        {/* Speed controls - only show in continuous mode */}
        {!stepMode && (
          <div className="speed-controls">
            <label>Speed:</label>
            {SPEED_OPTIONS.map((option) => (
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
        )}
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
