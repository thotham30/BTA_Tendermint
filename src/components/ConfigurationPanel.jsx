import React, { useState, useEffect } from "react";
import {
  DEFAULT_CONFIG,
  PRESET_CONFIGS,
  validateConfig,
  saveConfig,
  exportConfig,
  importConfig,
  resetConfig,
  getConfigWarnings,
  estimateSuccessRate,
  estimateConsensusTime,
} from "../utils/ConfigManager";

export default function ConfigurationPanel({
  isOpen,
  onClose,
  currentConfig,
  onApplyConfig,
}) {
  const [config, setConfig] = useState(
    currentConfig || DEFAULT_CONFIG
  );
  console.log(config);

  const [activeTab, setActiveTab] = useState("network");
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
    }
  }, [currentConfig]);

  useEffect(() => {
    // Update warnings when config changes
    const newWarnings = getConfigWarnings(config);
    setWarnings(newWarnings);

    // Validate config
    const validation = validateConfig(config);
    setErrors(validation.errors);
  }, [config]);

  if (!isOpen) return null;

  const handleChange = (section, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleApply = () => {
    const validation = validateConfig(config);
    if (validation.valid) {
      saveConfig(config);
      onApplyConfig(config);
      onClose();
    }
  };

  const handleReset = () => {
    const defaultConfig = resetConfig();
    setConfig(defaultConfig);
  };

  const handlePreset = (presetName) => {
    const preset = PRESET_CONFIGS[presetName];
    if (preset) {
      setConfig(preset);
    }
  };

  const handleExport = () => {
    exportConfig(config);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = importConfig(event.target.result);
          if (result.success) {
            setConfig(result.config);
          } else {
            alert(`Import failed: ${result.error}`);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const tabs = [
    { id: "network", label: "Network" },
    { id: "consensus", label: "Consensus" },
    { id: "nodes", label: "Node Behavior" },
    { id: "simulation", label: "Simulation" },
  ];

  const successRate = estimateSuccessRate(config);
  const consensusTime = estimateConsensusTime(config);

  return (
    <div className="config-overlay" onClick={onClose}>
      <div
        className="config-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="config-header">
          <h2>Configuration</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Presets */}
        <div className="config-presets">
          <label>Quick Presets:</label>
          <div className="preset-buttons">
            <button onClick={() => handlePreset("smallNetwork")}>
              Small Network
            </button>
            <button onClick={() => handlePreset("largeNetwork")}>
              Large Network
            </button>
            <button
              onClick={() => handlePreset("byzantineTest")}
            >
              Byzantine Test
            </button>
            <button
              onClick={() => handlePreset("partitionTest")}
            >
              Partition Test
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="config-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="config-content">
          {/* Network Tab */}
          {activeTab === "network" && (
            <div className="config-section">
              <h3>Network Configuration</h3>

              <div className="config-field">
                <label>
                  Number of Nodes
                  <span className="field-desc">
                    Total nodes in the network (3-20)
                  </span>
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={config.network.nodeCount}
                  onChange={(e) =>
                    handleChange(
                      "network",
                      "nodeCount",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="config-field">
                <label>
                  Network Latency (ms)
                  <span className="field-desc">
                    Simulated network delay (0-5000ms)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={config.network.latency}
                  onChange={(e) =>
                    handleChange(
                      "network",
                      "latency",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span className="range-value">
                  {config.network.latency}ms
                </span>
              </div>

              <div className="config-field">
                <label>
                  Packet Loss Rate (%)
                  <span className="field-desc">
                    Percentage of messages that fail (0-100%)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={config.network.packetLoss}
                  onChange={(e) =>
                    handleChange(
                      "network",
                      "packetLoss",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span className="range-value">
                  {config.network.packetLoss}%
                </span>
              </div>

              <div className="config-field">
                <label>
                  Message Timeout (ms)
                  <span className="field-desc">
                    Time before message is considered lost
                    (1000-10000ms)
                  </span>
                </label>
                <input
                  type="number"
                  min="1000"
                  max="10000"
                  step="500"
                  value={config.network.messageTimeout}
                  onChange={(e) =>
                    handleChange(
                      "network",
                      "messageTimeout",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          )}

          {/* Consensus Tab */}
          {activeTab === "consensus" && (
            <div className="config-section">
              <h3>Consensus Configuration</h3>

              <div className="config-field">
                <label>
                  Round Timeout (ms)
                  <span className="field-desc">
                    Maximum time for a consensus round
                    (1000-10000ms)
                  </span>
                </label>
                <input
                  type="number"
                  min="1000"
                  max="10000"
                  step="500"
                  value={config.consensus.roundTimeout}
                  onChange={(e) =>
                    handleChange(
                      "consensus",
                      "roundTimeout",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="config-field">
                <label>
                  Vote Threshold
                  <span className="field-desc">
                    Required voting majority for consensus
                  </span>
                </label>
                <select
                  value={config.consensus.voteThreshold}
                  onChange={(e) =>
                    handleChange(
                      "consensus",
                      "voteThreshold",
                      parseFloat(e.target.value)
                    )
                  }
                >
                  <option value={0.5}>
                    1/2+ (Simple Majority)
                  </option>
                  <option value={0.67}>
                    2/3+ (Byzantine Fault Tolerant)
                  </option>
                  <option value={0.75}>
                    3/4+ (Higher Security)
                  </option>
                </select>
              </div>

              <div className="config-field">
                <label>
                  Block Size (transactions)
                  <span className="field-desc">
                    Number of transactions per block (1-100)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.consensus.blockSize}
                  onChange={(e) =>
                    handleChange(
                      "consensus",
                      "blockSize",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="config-field">
                <label>
                  Block Proposal Delay (ms)
                  <span className="field-desc">
                    Delay before proposing a block (0-1000ms)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={config.consensus.proposalDelay}
                  onChange={(e) =>
                    handleChange(
                      "consensus",
                      "proposalDelay",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span className="range-value">
                  {config.consensus.proposalDelay}ms
                </span>
              </div>

              <div className="config-field">
                <label>
                  Timeout Multiplier
                  <span className="field-desc">
                    Exponential backoff multiplier (1.0-3.0x)
                  </span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={
                    config.consensus.timeoutMultiplier || 1.5
                  }
                  onChange={(e) =>
                    handleChange(
                      "consensus",
                      "timeoutMultiplier",
                      parseFloat(e.target.value)
                    )
                  }
                />
                <span className="range-value">
                  {(
                    config.consensus.timeoutMultiplier || 1.5
                  ).toFixed(1)}
                  x
                </span>
              </div>

              <div className="config-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={
                      config.consensus
                        .timeoutEscalationEnabled !== false
                    }
                    onChange={(e) =>
                      handleChange(
                        "consensus",
                        "timeoutEscalationEnabled",
                        e.target.checked
                      )
                    }
                  />
                  <span>Enable Timeout Escalation</span>
                </label>
                <span className="field-desc">
                  Increases timeout duration after each failure
                </span>
              </div>
            </div>
          )}

          {/* Node Behavior Tab */}
          {activeTab === "nodes" && (
            <div className="config-section">
              <h3>Node Behavior Configuration</h3>

              <div className="config-field">
                <label>
                  Byzantine Nodes
                  <span className="field-desc">
                    Number of malicious nodes (safe limit: ≤
                    {Math.floor(config.network.nodeCount / 3)},
                    exceeding n/3 will cause protocol failure)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={config.network.nodeCount - 1}
                  value={config.nodeBehavior.byzantineCount}
                  onChange={(e) =>
                    handleChange(
                      "nodeBehavior",
                      "byzantineCount",
                      parseInt(e.target.value)
                    )
                  }
                />
                {config.nodeBehavior.byzantineCount >
                  Math.floor(config.network.nodeCount / 3) && (
                  <span
                    className="field-warning"
                    style={{
                      color: "#ff4444",
                      fontSize: "0.85em",
                      fontWeight: "bold",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    ⚠️ UNSAFE: Exceeds n/3 - protocol will fail!
                  </span>
                )}
              </div>

              <div className="config-field">
                <label>
                  Byzantine Node Type
                  <span className="field-desc">
                    Type of malicious behavior
                  </span>
                </label>
                <select
                  value={config.nodeBehavior.byzantineType}
                  onChange={(e) =>
                    handleChange(
                      "nodeBehavior",
                      "byzantineType",
                      e.target.value
                    )
                  }
                >
                  <option value="faulty">
                    Faulty (votes randomly)
                  </option>
                  <option value="equivocator">
                    Equivocator (sends conflicting votes)
                  </option>
                  <option value="silent">
                    Silent (doesn't respond)
                  </option>
                </select>
              </div>

              <div className="config-field">
                <label>
                  Node Downtime (%)
                  <span className="field-desc">
                    Percentage of time nodes are offline (0-100%)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={config.nodeBehavior.downtimePercentage}
                  onChange={(e) =>
                    handleChange(
                      "nodeBehavior",
                      "downtimePercentage",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span className="range-value">
                  {config.nodeBehavior.downtimePercentage}%
                </span>
              </div>

              <div className="config-field">
                <label>
                  Response Time Variance (ms)
                  <span className="field-desc">
                    Random delay added to node responses
                    (0-1000ms)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="25"
                  value={config.nodeBehavior.responseVariance}
                  onChange={(e) =>
                    handleChange(
                      "nodeBehavior",
                      "responseVariance",
                      parseInt(e.target.value)
                    )
                  }
                />
                <span className="range-value">
                  {config.nodeBehavior.responseVariance}ms
                </span>
              </div>
            </div>
          )}

          {/* Simulation Tab */}
          {activeTab === "simulation" && (
            <div className="config-section">
              <h3>Simulation Configuration</h3>

              <div className="config-field">
                <label>
                  Transaction Generation Rate
                  <span className="field-desc">
                    How quickly new transactions are created
                  </span>
                </label>
                <select
                  value={config.simulation.transactionRate}
                  onChange={(e) =>
                    handleChange(
                      "simulation",
                      "transactionRate",
                      e.target.value
                    )
                  }
                >
                  <option value="low">Low (1 tx/sec)</option>
                  <option value="medium">
                    Medium (5 tx/sec)
                  </option>
                  <option value="high">High (10 tx/sec)</option>
                </select>
              </div>

              <div className="config-field">
                <label>
                  Transaction Pool Size
                  <span className="field-desc">
                    Maximum pending transactions (10-1000)
                  </span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={config.simulation.transactionPoolSize}
                  onChange={(e) =>
                    handleChange(
                      "simulation",
                      "transactionPoolSize",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="config-field">
                <label>
                  Simulation Duration Limit
                  <span className="field-desc">
                    Auto-stop simulation after specified time
                  </span>
                </label>
                <select
                  value={config.simulation.durationLimit}
                  onChange={(e) =>
                    handleChange(
                      "simulation",
                      "durationLimit",
                      e.target.value
                    )
                  }
                >
                  <option value="off">Off (No limit)</option>
                  <option value="5min">5 minutes</option>
                  <option value="10min">10 minutes</option>
                  <option value="30min">30 minutes</option>
                </select>
              </div>

              <div className="config-field">
                <label>
                  Log Detail Level
                  <span className="field-desc">
                    Amount of information in logs
                  </span>
                </label>
                <select
                  value={config.simulation.logLevel}
                  onChange={(e) =>
                    handleChange(
                      "simulation",
                      "logLevel",
                      e.target.value
                    )
                  }
                >
                  <option value="minimal">
                    Minimal (Errors only)
                  </option>
                  <option value="normal">
                    Normal (Important events)
                  </option>
                  <option value="verbose">
                    Verbose (All details)
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Warnings and Errors */}
        {(warnings.length > 0 || errors.length > 0) && (
          <div className="config-alerts">
            {errors.length > 0 && (
              <div className="alert alert-error">
                <strong>Errors:</strong>
                <ul>
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {warnings.length > 0 && (
              <div className="alert alert-warning">
                <strong>Warnings:</strong>
                <ul>
                  {warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Estimates */}
        <div className="config-estimates">
          <div className="estimate-item">
            <span className="estimate-label">
              Expected Success Rate:
            </span>
            <span
              className={`estimate-value ${
                successRate < 50
                  ? "low"
                  : successRate < 80
                  ? "medium"
                  : "high"
              }`}
            >
              {successRate}%
            </span>
          </div>
          <div className="estimate-item">
            <span className="estimate-label">
              Avg. Consensus Time:
            </span>
            <span className="estimate-value">
              {(consensusTime / 1000).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="config-actions">
          <div className="action-group">
            <button
              className="btn-secondary"
              onClick={handleImport}
            >
              Import
            </button>
            <button
              className="btn-secondary"
              onClick={handleExport}
            >
              Export
            </button>
            <button
              className="btn-secondary"
              onClick={handleReset}
            >
              Reset to Default
            </button>
          </div>
          <div className="action-group">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleApply}
              disabled={errors.length > 0}
            >
              Apply Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
