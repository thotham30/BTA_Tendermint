// src/utils/ConfigManager.js

const CONFIG_STORAGE_KEY = "tendermint_config";

// ============================================
// UI Configuration Constants
// ============================================

/**
 * Speed options for continuous mode simulation
 */
export const SPEED_OPTIONS = [
  { label: "0.25x", value: 0.25 },
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "4x", value: 4 },
];

/**
 * Step-by-Step Mode Configuration
 */
export const STEP_MODE_CONFIG = {
  autoPlayDelay: 2000, // milliseconds between auto-play steps
  historyLimit: 50, // maximum number of steps to keep in history
};

/**
 * Timeout Configuration Limits
 */
export const TIMEOUT_LIMITS = {
  maxTimeout: 30000, // Maximum timeout duration (30 seconds)
  minTimeout: 1000, // Minimum timeout duration (1 second)
  defaultEscalationMultiplier: 1.5,
};

/**
 * Animation and Visual Configuration
 */
export const VISUAL_CONFIG = {
  nodeHighlightDuration: 1000, // milliseconds
  phaseTransitionDuration: 300, // milliseconds
  pulseAnimationDuration: 2000, // milliseconds
  progressUpdateInterval: 100, // milliseconds for progress bars
};

/**
 * Default Values and Fallbacks
 */
export const DEFAULTS = {
  voteThreshold: 2 / 3,
  latency: 100,
  packetLoss: 0,
  downtimePercentage: 0,
  responseVariance: 50,
  roundTimeout: 5000,
  blockSize: 10,
  proposalDelay: 100,
};

// Default configuration
export const DEFAULT_CONFIG = {
  name: "Default",
  network: {
    nodeCount: 4,
    latency: 100, // ms
    packetLoss: 0, // percentage
    messageTimeout: 5000, // ms
  },
  consensus: {
    roundTimeout: 15000, // ms
    voteThreshold: (2 / 3).toFixed(2), // 2/3+ majority
    blockSize: 10, // transactions per block
    proposalDelay: 100, // ms
    timeoutMultiplier: 1.5, // Exponential backoff multiplier
    timeoutEscalationEnabled: true, // Enable timeout escalation
  },
  nodeBehavior: {
    byzantineCount: 0,
    byzantineType: "faulty", // faulty, equivocator, silent
    downtimePercentage: 0, // percentage
    responseVariance: 50, // ms
  },
  simulation: {
    transactionRate: "medium", // low, medium, high
    transactionPoolSize: 50,
    durationLimit: "off", // off, 5min, 10min, 30min
    logLevel: "normal", // minimal, normal, verbose
  },
};

// Preset configurations
export const PRESET_CONFIGS = {
  smallNetwork: {
    name: "Small Network",
    network: {
      nodeCount: 4,
      latency: 50,
      packetLoss: 0,
      messageTimeout: 3000,
    },
    consensus: {
      roundTimeout: 3000,
      voteThreshold: (2 / 3).toFixed(2),
      blockSize: 5,
      proposalDelay: 50,
      timeoutMultiplier: 1.4,
      timeoutEscalationEnabled: true,
    },
    nodeBehavior: {
      byzantineCount: 0,
      byzantineType: "faulty",
      downtimePercentage: 0,
      responseVariance: 25,
    },
    simulation: {
      transactionRate: "low",
      transactionPoolSize: 20,
      durationLimit: "off",
      logLevel: "normal",
    },
  },
  largeNetwork: {
    name: "Large Network",
    network: {
      nodeCount: 16,
      latency: 200,
      packetLoss: 0,
      messageTimeout: 8000,
    },
    consensus: {
      roundTimeout: 8000,
      voteThreshold: (2 / 3).toFixed(2),
      blockSize: 20,
      proposalDelay: 150,
      timeoutMultiplier: 1.6,
      timeoutEscalationEnabled: true,
    },
    nodeBehavior: {
      byzantineCount: 0,
      byzantineType: "faulty",
      downtimePercentage: 0,
      responseVariance: 100,
    },
    simulation: {
      transactionRate: "high",
      transactionPoolSize: 200,
      durationLimit: "off",
      logLevel: "normal",
    },
  },
  byzantineTest: {
    name: "Byzantine Test",
    network: {
      nodeCount: 7,
      latency: 100,
      packetLoss: 5,
      messageTimeout: 5000,
    },
    consensus: {
      roundTimeout: 5000,
      voteThreshold: (2 / 3).toFixed(2),
      blockSize: 10,
      proposalDelay: 100,
      timeoutMultiplier: 1.8,
      timeoutEscalationEnabled: true,
    },
    nodeBehavior: {
      byzantineCount: 2,
      byzantineType: "faulty",
      downtimePercentage: 0,
      responseVariance: 50,
    },
    simulation: {
      transactionRate: "medium",
      transactionPoolSize: 50,
      durationLimit: "off",
      logLevel: "verbose",
    },
  },
  partitionTest: {
    name: "Partition Test",
    network: {
      nodeCount: 6,
      latency: 150,
      packetLoss: 30,
      messageTimeout: 6000,
    },
    consensus: {
      roundTimeout: 6000,
      voteThreshold: (2 / 3).toFixed(2),
      blockSize: 10,
      proposalDelay: 100,
      timeoutMultiplier: 1.5,
      timeoutEscalationEnabled: true,
    },
    nodeBehavior: {
      byzantineCount: 0,
      byzantineType: "silent",
      downtimePercentage: 20,
      responseVariance: 100,
    },
    simulation: {
      transactionRate: "medium",
      transactionPoolSize: 50,
      durationLimit: "off",
      logLevel: "verbose",
    },
  },
};

/**
 * Validates configuration parameters
 * Returns { valid: boolean, errors: string[] }
 */
export function validateConfig(config) {
  const errors = [];
  const { network, consensus, nodeBehavior, simulation } =
    config;

  // Network validation
  if (network.nodeCount < 3 || network.nodeCount > 20) {
    errors.push("Number of nodes must be between 3 and 20");
  }
  if (network.latency < 0 || network.latency > 5000) {
    errors.push("Network latency must be between 0 and 5000ms");
  }
  if (network.packetLoss < 0 || network.packetLoss > 100) {
    errors.push("Packet loss rate must be between 0% and 100%");
  }
  if (
    network.messageTimeout < 1000 ||
    network.messageTimeout > 10000
  ) {
    errors.push(
      "Message timeout must be between 1000 and 10000ms"
    );
  }

  // Consensus validation
  if (
    consensus.roundTimeout < 1000 ||
    consensus.roundTimeout > 20000
  ) {
    errors.push(
      "Round timeout must be between 1000 and 20000ms"
    );
  }
  if (
    consensus.voteThreshold < 0.5 ||
    consensus.voteThreshold > 1
  ) {
    errors.push("Vote threshold must be between 0.5 and 1");
  }
  if (consensus.blockSize < 1 || consensus.blockSize > 100) {
    errors.push(
      "Block size must be between 1 and 100 transactions"
    );
  }
  if (
    consensus.proposalDelay < 0 ||
    consensus.proposalDelay > 1000
  ) {
    errors.push("Proposal delay must be between 0 and 1000ms");
  }
  if (
    consensus.timeoutMultiplier !== undefined &&
    (consensus.timeoutMultiplier < 1.0 ||
      consensus.timeoutMultiplier > 3.0)
  ) {
    errors.push(
      "Timeout multiplier must be between 1.0 and 3.0"
    );
  }

  // Node behavior validation
  // Allow Byzantine nodes to exceed n/3 for testing protocol failure scenarios
  if (
    nodeBehavior.byzantineCount < 0 ||
    nodeBehavior.byzantineCount >= network.nodeCount
  ) {
    errors.push(
      `Byzantine nodes must be between 0 and ${
        network.nodeCount - 1
      }`
    );
  }
  if (
    !["faulty", "equivocator", "silent"].includes(
      nodeBehavior.byzantineType
    )
  ) {
    errors.push("Invalid Byzantine type");
  }
  if (
    nodeBehavior.downtimePercentage < 0 ||
    nodeBehavior.downtimePercentage > 100
  ) {
    errors.push("Node downtime must be between 0% and 100%");
  }
  if (
    nodeBehavior.responseVariance < 0 ||
    nodeBehavior.responseVariance > 1000
  ) {
    errors.push(
      "Response variance must be between 0 and 1000ms"
    );
  }

  // Simulation validation
  if (
    !["low", "medium", "high"].includes(
      simulation.transactionRate
    )
  ) {
    errors.push("Invalid transaction rate");
  }
  if (
    simulation.transactionPoolSize < 10 ||
    simulation.transactionPoolSize > 1000
  ) {
    errors.push(
      "Transaction pool size must be between 10 and 1000"
    );
  }
  if (
    !["off", "5min", "10min", "30min"].includes(
      simulation.durationLimit
    )
  ) {
    errors.push("Invalid duration limit");
  }
  if (
    !["minimal", "normal", "verbose"].includes(
      simulation.logLevel
    )
  ) {
    errors.push("Invalid log level");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Save configuration to localStorage
 */
export function saveConfig(config) {
  try {
    const validation = validateConfig(config);
    if (!validation.valid) {
      throw new Error(
        `Invalid configuration: ${validation.errors.join(", ")}`
      );
    }
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify(config)
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Load configuration from localStorage
 */
export function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      const validation = validateConfig(config);
      if (validation.valid) {
        return config;
      }
    }
  } catch (error) {
    console.error("Failed to load config:", error);
  }
  return DEFAULT_CONFIG;
}

/**
 * Reset configuration to defaults
 */
export function resetConfig() {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  return DEFAULT_CONFIG;
}

/**
 * Export configuration as JSON
 */
export function exportConfig(config) {
  const dataStr = JSON.stringify(config, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," +
    encodeURIComponent(dataStr);

  const exportFileDefaultName = `tendermint-config-${Date.now()}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

/**
 * Import configuration from JSON
 */
export function importConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    const validation = validateConfig(config);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(", "),
      };
    }
    return { success: true, config };
  } catch (error) {
    return { success: false, error: "Invalid JSON format" };
  }
}

/**
 * Get configuration warnings (non-blocking issues)
 */
export function getConfigWarnings(config) {
  const warnings = [];
  const { network, nodeBehavior } = config;

  // Check if byzantine nodes exceed safety threshold (n/3)
  const maxByzantine = Math.floor(network.nodeCount / 3);
  if (nodeBehavior.byzantineCount > maxByzantine) {
    warnings.push(
      `⚠️ CRITICAL: Byzantine nodes (${nodeBehavior.byzantineCount}) exceed safety threshold (${maxByzantine}). Protocol WILL fail!`
    );
  } else if (
    nodeBehavior.byzantineCount === maxByzantine &&
    maxByzantine > 0
  ) {
    warnings.push(
      "Byzantine nodes at maximum safe threshold (n/3). Consensus may fail frequently."
    );
  }

  // Check for high packet loss
  if (network.packetLoss > 20) {
    warnings.push(
      "High packet loss may significantly impact consensus performance."
    );
  }

  // Check for high downtime
  if (nodeBehavior.downtimePercentage > 30) {
    warnings.push(
      "High node downtime may affect network liveness."
    );
  }

  // Check for network size vs latency
  if (network.nodeCount > 10 && network.latency > 300) {
    warnings.push(
      "Large network with high latency may result in slow consensus."
    );
  }

  return warnings;
}

/**
 * Estimate consensus success rate based on configuration
 */
export function estimateSuccessRate(config) {
  const { network, nodeBehavior } = config;

  let successRate = 100;

  // Byzantine factor
  const byzantineRatio =
    nodeBehavior.byzantineCount / network.nodeCount;
  successRate -= byzantineRatio * 150; // Higher impact

  // Packet loss factor
  successRate -= network.packetLoss * 0.5;

  // Downtime factor
  successRate -= nodeBehavior.downtimePercentage * 0.3;

  return Math.max(0, Math.min(100, successRate)).toFixed(1);
}

/**
 * Estimate average consensus time based on configuration
 */
export function estimateConsensusTime(config) {
  const { network, consensus, nodeBehavior } = config;

  let baseTime = consensus.roundTimeout;

  // Latency impact
  baseTime += network.latency * 3; // Multiple round trips

  // Network size impact
  baseTime += (network.nodeCount - 4) * 50;

  // Byzantine/failure impact
  const failureProbability =
    nodeBehavior.byzantineCount / network.nodeCount +
    network.packetLoss / 100 +
    nodeBehavior.downtimePercentage / 100;

  baseTime *= 1 + failureProbability;

  return Math.round(baseTime);
}

/**
 * Get default value with fallback
 */
export function getConfigValue(config, path, fallback) {
  const keys = path.split(".");
  let value = config;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return fallback;
    }
  }

  return value !== undefined ? value : fallback;
}

/**
 * Format vote threshold for display
 */
export function formatVoteThreshold(threshold) {
  const numThreshold = parseFloat(threshold);

  if (
    numThreshold === 0.67 ||
    Math.abs(numThreshold - 2 / 3) < 0.01
  ) {
    return "2/3+";
  } else if (numThreshold === 0.5) {
    return "1/2+";
  } else if (numThreshold === 0.75) {
    return "3/4+";
  } else {
    return `${(numThreshold * 100).toFixed(0)}%`;
  }
}

/**
 * Calculate maximum allowed Byzantine nodes
 */
export function getMaxByzantineNodes(nodeCount) {
  return Math.floor(nodeCount / 3);
}

/**
 * Check if configuration allows consensus
 */
export function canReachConsensus(config) {
  const { network, nodeBehavior } = config;
  const onlineNodes =
    network.nodeCount *
    (1 - nodeBehavior.downtimePercentage / 100);
  const maxByzantine = getMaxByzantineNodes(network.nodeCount);

  // Need at least 2/3 of nodes online and working
  const requiredNodes = Math.ceil(
    network.nodeCount *
      parseFloat(config.consensus.voteThreshold)
  );
  const effectiveNodes =
    onlineNodes - nodeBehavior.byzantineCount;

  return (
    effectiveNodes >= requiredNodes &&
    nodeBehavior.byzantineCount <= maxByzantine
  );
}

/**
 * Get configuration summary for display
 */
export function getConfigSummary(config) {
  return {
    nodes: config.network.nodeCount,
    latency: `${config.network.latency}ms`,
    threshold: formatVoteThreshold(
      config.consensus.voteThreshold
    ),
    byzantine: config.nodeBehavior.byzantineCount,
    packetLoss: `${config.network.packetLoss}%`,
    downtime: `${config.nodeBehavior.downtimePercentage}%`,
    canConsensus: canReachConsensus(config),
  };
}
