# ConfigManager Reference Guide

## Overview

The `ConfigManager.js` module serves as the centralized configuration hub for the Tendermint Protocol Visualizer. All configuration constants, default values, validation logic, and configuration-related utilities are consolidated in this file.

## Purpose

Previously, configuration values and constants were scattered throughout the codebase. This consolidation provides:

1. **Single Source of Truth**: All config values in one place
2. **Easy Maintenance**: Update values once, affect entire app
3. **Type Safety**: Consistent validation and defaults
4. **Reusability**: Shared utilities across components
5. **Documentation**: Clear understanding of all config options

## Configuration Exports

### UI Configuration Constants

#### `SPEED_OPTIONS`

Speed multipliers for continuous mode simulation.

```javascript
export const SPEED_OPTIONS = [
  { label: "0.25x", value: 0.25 },
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "4x", value: 4 },
];
```

**Usage**: Controls component for simulation speed selection.

#### `STEP_MODE_CONFIG`

Configuration for step-by-step mode behavior.

```javascript
export const STEP_MODE_CONFIG = {
  autoPlayDelay: 2000, // milliseconds between auto-play steps
  historyLimit: 50, // maximum number of steps to keep in history
};
```

**Usage**: StepByStepControls component for auto-play timing.

#### `TIMEOUT_LIMITS`

Boundaries for timeout duration and escalation.

```javascript
export const TIMEOUT_LIMITS = {
  maxTimeout: 30000, // Maximum timeout duration (30s)
  minTimeout: 1000, // Minimum timeout duration (1s)
  defaultEscalationMultiplier: 1.5, // Default escalation multiplier
};
```

**Usage**: ConsensusContext for timeout management and escalation.

#### `VISUAL_CONFIG`

Animation and visual effect durations.

```javascript
export const VISUAL_CONFIG = {
  nodeHighlightDuration: 1000, // milliseconds
  phaseTransitionDuration: 300, // milliseconds
  pulseAnimationDuration: 2000, // milliseconds
  progressUpdateInterval: 100, // milliseconds for progress bars
};
```

**Usage**: Components for animations and visual transitions.

#### `DEFAULTS`

Default values and fallbacks for configuration parameters.

```javascript
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
```

**Usage**: Used throughout the application when config values are undefined or missing.

### Configuration Objects

#### `DEFAULT_CONFIG`

Complete default configuration for the application.

```javascript
export const DEFAULT_CONFIG = {
  name: "Default",
  network: {
    nodeCount: 4,
    latency: 100,
    packetLoss: 0,
    messageTimeout: 5000,
  },
  consensus: {
    roundTimeout: 5000,
    voteThreshold: 0.67,
    blockSize: 10,
    proposalDelay: 100,
    timeoutMultiplier: 1.5,
    timeoutEscalationEnabled: true,
  },
  nodeBehavior: {
    byzantineCount: 0,
    byzantineType: "faulty",
    downtimePercentage: 0,
    responseVariance: 50,
  },
  simulation: {
    transactionRate: "medium",
    transactionPoolSize: 50,
    durationLimit: "off",
    logLevel: "normal",
  },
};
```

#### `PRESET_CONFIGS`

Pre-configured scenarios for different testing scenarios.

Available presets:

- **smallNetwork**: Minimal 3-node network, low latency
- **largeNetwork**: 16-node network, high transaction rate
- **byzantineTest**: 7 nodes with 2 Byzantine nodes
- **partitionTest**: Network with high packet loss and downtime

## Validation Functions

### `validateConfig(config)`

Validates all configuration parameters.

**Returns**: `{ valid: boolean, errors: string[] }`

**Validation Rules**:

- Node count: 3-20
- Latency: 0-5000ms
- Packet loss: 0-100%
- Message timeout: 1000-10000ms
- Round timeout: 1000-10000ms
- Vote threshold: 0.5-1.0
- Block size: 1-100 transactions
- Proposal delay: 0-1000ms
- Timeout multiplier: 1.0-3.0
- Byzantine nodes: 0 to n/3
- Byzantine type: faulty, equivocator, silent
- Downtime: 0-100%
- Response variance: 0-1000ms
- Transaction rate: low, medium, high
- Pool size: 10-1000
- Duration limit: off, 5min, 10min, 30min
- Log level: minimal, normal, verbose

**Example**:

```javascript
const validation = validateConfig(myConfig);
if (!validation.valid) {
  console.error("Errors:", validation.errors);
}
```

### `getConfigWarnings(config)`

Returns non-blocking warnings about configuration.

**Returns**: `string[]`

**Warning Conditions**:

- Byzantine nodes at maximum (n/3)
- High packet loss (>20%)
- High downtime (>30%)
- Large network with high latency

**Example**:

```javascript
const warnings = getConfigWarnings(config);
warnings.forEach((w) => console.warn(w));
```

## Storage Functions

### `saveConfig(config)`

Saves configuration to localStorage after validation.

**Returns**: `{ success: boolean, error?: string }`

**Example**:

```javascript
const result = saveConfig(newConfig);
if (result.success) {
  console.log("Config saved!");
} else {
  console.error(result.error);
}
```

### `loadConfig()`

Loads configuration from localStorage.

**Returns**: `Config object` (returns DEFAULT_CONFIG if none found or invalid)

**Example**:

```javascript
const config = loadConfig();
```

### `resetConfig()`

Clears localStorage and returns DEFAULT_CONFIG.

**Returns**: `DEFAULT_CONFIG`

**Example**:

```javascript
const config = resetConfig();
```

## Import/Export Functions

### `exportConfig(config)`

Downloads configuration as JSON file.

**Side Effect**: Triggers browser download

**Example**:

```javascript
exportConfig(currentConfig);
// Downloads: tendermint-config-[timestamp].json
```

### `importConfig(jsonString)`

Parses and validates JSON configuration.

**Returns**: `{ success: boolean, config?: Config, error?: string }`

**Example**:

```javascript
const result = importConfig(fileContent);
if (result.success) {
  loadNewConfig(result.config);
} else {
  alert(result.error);
}
```

## Analysis Functions

### `estimateSuccessRate(config)`

Estimates consensus success rate based on network conditions.

**Returns**: `string` (percentage with 1 decimal place)

**Factors**:

- Byzantine node ratio (high impact)
- Packet loss rate
- Node downtime percentage

**Example**:

```javascript
const rate = estimateSuccessRate(config);
console.log(`Expected success: ${rate}%`);
```

### `estimateConsensusTime(config)`

Estimates average time to reach consensus.

**Returns**: `number` (milliseconds)

**Factors**:

- Round timeout
- Network latency (x3 for round trips)
- Network size
- Failure probability

**Example**:

```javascript
const time = estimateConsensusTime(config);
console.log(`Expected time: ${time}ms`);
```

## Utility Functions

### `getConfigValue(config, path, fallback)`

Safely retrieves nested configuration value with fallback.

**Parameters**:

- `config`: Configuration object
- `path`: Dot-notation path (e.g., "network.latency")
- `fallback`: Default value if not found

**Returns**: Value at path or fallback

**Example**:

```javascript
const latency = getConfigValue(config, "network.latency", 100);
const threshold = getConfigValue(
  config,
  "consensus.voteThreshold",
  0.67
);
```

### `formatVoteThreshold(threshold)`

Formats vote threshold for display.

**Returns**: `string` (formatted threshold)

**Formats**:

- 0.67 → "2/3+"
- 0.5 → "1/2+"
- 0.75 → "3/4+"
- Other → "XX%"

**Example**:

```javascript
const display = formatVoteThreshold(0.67);
// Returns: "2/3+"
```

### `getMaxByzantineNodes(nodeCount)`

Calculates maximum allowed Byzantine nodes (n/3).

**Returns**: `number`

**Example**:

```javascript
const maxByzantine = getMaxByzantineNodes(7);
// Returns: 2
```

### `canReachConsensus(config)`

Checks if configuration allows consensus to be reached.

**Returns**: `boolean`

**Checks**:

- Sufficient online nodes
- Byzantine nodes within limit (≤ n/3)
- Enough effective nodes to meet threshold

**Example**:

```javascript
if (!canReachConsensus(config)) {
  alert("Configuration cannot reach consensus!");
}
```

### `getConfigSummary(config)`

Generates a summary object for display.

**Returns**: `object` with formatted values

**Example**:

```javascript
const summary = getConfigSummary(config);
// Returns:
{
  nodes: 4,
  latency: "100ms",
  threshold: "2/3+",
  byzantine: 0,
  packetLoss: "0%",
  downtime: "0%",
  canConsensus: true
}
```

## Usage Examples

### Component Integration

#### Using SPEED_OPTIONS in Controls

```javascript
import { SPEED_OPTIONS } from "../utils/ConfigManager";

function Controls() {
  const { speed, changeSpeed } = useConsensus();

  return (
    <div>
      {SPEED_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => changeSpeed(option.value)}
          className={speed === option.value ? "active" : ""}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

#### Using DEFAULTS in Logic

```javascript
import { DEFAULTS } from "../utils/ConfigManager";

function calculateVotes(config) {
  const threshold =
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold;
  const latency = config?.network?.latency || DEFAULTS.latency;

  // Use threshold and latency...
}
```

#### Using formatVoteThreshold in Display

```javascript
import { formatVoteThreshold } from "../utils/ConfigManager";

function ConfigDisplay({ config }) {
  return (
    <div>
      Threshold:{" "}
      {formatVoteThreshold(config.consensus.voteThreshold)}
    </div>
  );
}
```

#### Using Validation Before Save

```javascript
import {
  validateConfig,
  saveConfig,
} from "../utils/ConfigManager";

function saveUserConfig(config) {
  const validation = validateConfig(config);

  if (!validation.valid) {
    alert(`Invalid config: ${validation.errors.join(", ")}`);
    return;
  }

  const result = saveConfig(config);
  if (result.success) {
    console.log("Config saved successfully!");
  }
}
```

## Migration from Old Code

### Before (Scattered Constants)

```javascript
// In Controls.jsx
const speedOptions = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  ...
];

// In NetworkSimulation.js
const latency = config?.network?.latency || 100;

// In App.jsx
const threshold = config.consensus.voteThreshold === 0.67 ? "2/3+" : ...;

// In ConsensusContext.jsx
const maxTimeout = 30000;
```

### After (Centralized)

```javascript
// All files import from ConfigManager
import {
  SPEED_OPTIONS,
  DEFAULTS,
  TIMEOUT_LIMITS,
  formatVoteThreshold,
} from "../utils/ConfigManager";

// Use exports
const latency = config?.network?.latency || DEFAULTS.latency;
const threshold = formatVoteThreshold(
  config.consensus.voteThreshold
);
const maxTimeout = TIMEOUT_LIMITS.maxTimeout;
```

## Benefits of Consolidation

### 1. Easy Updates

Change a value once, affects entire application:

```javascript
// Want to change auto-play delay? Update in one place:
export const STEP_MODE_CONFIG = {
  autoPlayDelay: 3000,  // Changed from 2000
  ...
};
```

### 2. Consistency

All components use the same defaults:

```javascript
// Always gets the same default
const threshold =
  config?.voteThreshold || DEFAULTS.voteThreshold;
```

### 3. Validation

Centralized validation rules:

```javascript
// All configs validated the same way
const validation = validateConfig(anyConfig);
```

### 4. Documentation

Single place to understand all config options and their constraints.

### 5. Testing

Easy to test with mock configs:

```javascript
import { DEFAULTS } from "../utils/ConfigManager";

const testConfig = {
  ...DEFAULT_CONFIG,
  network: {
    ...DEFAULT_CONFIG.network,
    nodeCount: 10,
  },
};
```

## Best Practices

1. **Always Use DEFAULTS**: Never hardcode fallback values

   ```javascript
   ❌ const latency = config?.network?.latency || 100;
   ✅ const latency = config?.network?.latency || DEFAULTS.latency;
   ```

2. **Validate Before Save**: Always validate user input

   ```javascript
   const validation = validateConfig(userConfig);
   if (validation.valid) {
     saveConfig(userConfig);
   }
   ```

3. **Use Helper Functions**: Don't reimplement logic

   ```javascript
   ❌ const display = threshold === 0.67 ? "2/3+" : `${threshold * 100}%`;
   ✅ const display = formatVoteThreshold(threshold);
   ```

4. **Check Warnings**: Display non-blocking issues

   ```javascript
   const warnings = getConfigWarnings(config);
   warnings.forEach((w) => showWarning(w));
   ```

5. **Import Only What You Need**: Keep imports clean
   ```javascript
   import {
     DEFAULTS,
     formatVoteThreshold,
   } from "../utils/ConfigManager";
   ```

## Future Enhancements

Potential additions to ConfigManager:

- **Config Profiles**: Multiple saved configurations
- **Config Comparison**: Compare two configurations
- **Config Templates**: More preset scenarios
- **Dynamic Validation**: Context-aware validation
- **Config History**: Track configuration changes
- **Config Recommendations**: Suggest optimal settings
- **Config Migration**: Version upgrading logic

---

**Last Updated**: November 6, 2025  
**Version**: 2.0.0  
**Module**: ConfigManager Consolidation
