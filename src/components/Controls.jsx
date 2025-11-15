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
    partitionActive,
    partitionType,
    togglePartition,
    changePartitionType,
    isSynchronousMode,
    toggleNetworkMode,
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
            {partitionActive && ` • ⚠️ partition active`}
          </span>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          {/* Network Partition Controls */}
          <div className="network-partition-controls">
            <h4>🔌 Network Partition Simulation</h4>

            <div className="partition-control-row">
              <button
                onClick={togglePartition}
                className={`partition-toggle-btn ${
                  partitionActive ? "active" : ""
                }`}
                title={
                  partitionActive
                    ? "Deactivate network partition"
                    : "Activate network partition"
                }
              >
                {partitionActive
                  ? "🔌 Disable Partition"
                  : "⚡ Enable Partition"}
              </button>
            </div>

            {partitionActive && (
              <div className="partition-type-selector">
                <label>Partition Type:</label>
                <div className="partition-type-buttons">
                  <button
                    onClick={() => changePartitionType("single")}
                    className={`partition-type-btn ${
                      partitionType === "single" ? "active" : ""
                    }`}
                    title="Isolate a single node from the network"
                  >
                    🔴 Single Node
                  </button>
                  <button
                    onClick={() => changePartitionType("split")}
                    className={`partition-type-btn ${
                      partitionType === "split" ? "active" : ""
                    }`}
                    title="Split network into two equal partitions"
                  >
                    ⚡ Split (50/50)
                  </button>
                  <button
                    onClick={() =>
                      changePartitionType("gradual")
                    }
                    className={`partition-type-btn ${
                      partitionType === "gradual" ? "active" : ""
                    }`}
                    title="Gradual network degradation affecting ~30% of nodes"
                  >
                    📉 Gradual
                  </button>
                </div>
                <p className="partition-help-text">
                  {partitionType === "single" &&
                    "One node is isolated from all others"}
                  {partitionType === "split" &&
                    "Network is split into two groups"}
                  {partitionType === "gradual" &&
                    "Random nodes experience connectivity issues"}
                </p>
              </div>
            )}
          </div>

          {/* Network Mode Toggle */}
          <div className="network-mode-controls">
            <h4>🌐 Network Timing Model</h4>

            <div className="mode-toggle-row">
              <button
                onClick={toggleNetworkMode}
                className={`network-mode-toggle-btn ${
                  isSynchronousMode
                    ? "synchronous-active"
                    : "asynchronous-active"
                }`}
                title={
                  isSynchronousMode
                    ? "Switch to Partially Synchronous (with timeouts)"
                    : "Switch to Fully Synchronous (no timeouts)"
                }
              >
                {isSynchronousMode
                  ? "⚡ Synchronous"
                  : "⏱️ Partially Synchronous"}
              </button>
            </div>

            <p className="network-mode-description">
              {isSynchronousMode ? (
                <>
                  <strong>Synchronous:</strong> Messages are
                  delivered instantly, no timeouts. Easier to
                  understand consensus flow without timing
                  complications.
                </>
              ) : (
                <>
                  <strong>Partially Synchronous:</strong>{" "}
                  Messages may be delayed, timeouts enabled.
                  Realistic network conditions with timeout
                  handling.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Timeout Controls Section - Only show in asynchronous mode */}
        {!isSynchronousMode && (
          <div className="timeout-controls">
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
                max="20000"
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
          </div>
        )}

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
