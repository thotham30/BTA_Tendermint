# ConfigManager Integration for Timeout Feature

## Summary of Changes

The timeout feature has been fully integrated with the ConfigManager system, allowing timeout settings to be:

- **Saved and loaded** from localStorage
- **Configured** through preset configurations
- **Validated** for correct values
- **Exported/imported** with other configuration settings
- **Modified** through the Configuration Panel UI

## Changes Made

### 1. **ConfigManager.js Updates**

#### Added Timeout Parameters to DEFAULT_CONFIG

```javascript
consensus: {
  roundTimeout: 5000,
  voteThreshold: 2 / 3,
  blockSize: 10,
  proposalDelay: 100,
  timeoutMultiplier: 1.5,           // NEW
  timeoutEscalationEnabled: true,    // NEW
}
```

#### Updated All Preset Configurations

**Small Network:**

- `timeoutMultiplier: 1.4` (faster escalation for small networks)
- `timeoutEscalationEnabled: true`

**Large Network:**

- `timeoutMultiplier: 1.6` (slower escalation for large networks)
- `timeoutEscalationEnabled: true`

**Byzantine Test:**

- `timeoutMultiplier: 1.8` (more aggressive escalation for Byzantine scenarios)
- `timeoutEscalationEnabled: true`

**Partition Test:**

- `timeoutMultiplier: 1.5` (balanced escalation)
- `timeoutEscalationEnabled: true`

#### Added Validation

```javascript
if (
  consensus.timeoutMultiplier !== undefined &&
  (consensus.timeoutMultiplier < 1.0 ||
    consensus.timeoutMultiplier > 3.0)
) {
  errors.push("Timeout multiplier must be between 1.0 and 3.0");
}
```

### 2. **ConsensusContext.jsx Updates**

#### Initialize from Config

```javascript
const [timeoutDuration, setTimeoutDuration] = useState(
  config.consensus.roundTimeout || 5000
);
const [baseTimeoutDuration, setBaseTimeoutDuration] = useState(
  config.consensus.roundTimeout || 5000
);
const [timeoutMultiplier, setTimeoutMultiplier] = useState(
  config.consensus.timeoutMultiplier || 1.5
);
const [timeoutEscalationEnabled, setTimeoutEscalationEnabled] =
  useState(config.consensus.timeoutEscalationEnabled !== false);
```

#### Update on Config Change

```javascript
const loadNewConfig = (newConfig) => {
  setConfig(newConfig);

  // Update timeout settings from new config
  const newBaseTimeout =
    newConfig.consensus.roundTimeout || 5000;
  const newMultiplier =
    newConfig.consensus.timeoutMultiplier || 1.5;
  const newEscalation =
    newConfig.consensus.timeoutEscalationEnabled !== false;

  setBaseTimeoutDuration(newBaseTimeout);
  setTimeoutDuration(newBaseTimeout);
  setTimeoutMultiplier(newMultiplier);
  setTimeoutEscalationEnabled(newEscalation);

  // ... rest of config loading
};
```

### 3. **Controls.jsx Updates**

#### Import saveConfig

```javascript
import {
  PRESET_CONFIGS,
  saveConfig,
} from "../utils/ConfigManager";
```

#### Sync with Config

```javascript
useEffect(() => {
  setLocalTimeout(baseTimeoutDuration);
  setLocalMultiplier(timeoutMultiplier);
  setLocalEscalation(timeoutEscalationEnabled);
}, [
  baseTimeoutDuration,
  timeoutMultiplier,
  timeoutEscalationEnabled,
]);
```

#### Save Changes to Config

```javascript
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
```

### 4. **ConfigurationPanel.jsx Updates**

Added three new fields to the Consensus tab:

#### Timeout Multiplier Slider

```jsx
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
    value={config.consensus.timeoutMultiplier || 1.5}
    onChange={(e) =>
      handleChange(
        "consensus",
        "timeoutMultiplier",
        parseFloat(e.target.value)
      )
    }
  />
  <span className="range-value">
    {(config.consensus.timeoutMultiplier || 1.5).toFixed(1)}x
  </span>
</div>
```

#### Timeout Escalation Toggle

```jsx
<div className="config-field">
  <label className="checkbox-label">
    <input
      type="checkbox"
      checked={
        config.consensus.timeoutEscalationEnabled !== false
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
```

## Benefits of ConfigManager Integration

### 1. **Persistence**

- Timeout settings are saved to localStorage
- Settings persist across browser sessions
- Users don't lose their preferred timeout configuration

### 2. **Presets**

- Each preset (Small, Large, Byzantine, Partition) has optimal timeout settings
- Quick switching between different scenarios
- Educational value - see how timeout settings vary by use case

### 3. **Validation**

- Ensures timeout multiplier is between 1.0 and 3.0
- Prevents invalid configurations
- Provides clear error messages

### 4. **Export/Import**

- Users can share timeout configurations
- Educational institutions can distribute specific configs
- Reproducible experiments and demonstrations

### 5. **Central Management**

- All configuration in one place
- Consistent UI for all settings
- Easy to extend with new timeout-related parameters

## Usage Examples

### Setting Timeout via ConfigManager

```javascript
import {
  DEFAULT_CONFIG,
  saveConfig,
} from "../utils/ConfigManager";

const myConfig = {
  ...DEFAULT_CONFIG,
  consensus: {
    ...DEFAULT_CONFIG.consensus,
    roundTimeout: 7000,
    timeoutMultiplier: 1.6,
    timeoutEscalationEnabled: true,
  },
};

saveConfig(myConfig);
```

### Creating Custom Preset

```javascript
export const PRESET_CONFIGS = {
  // ... existing presets

  customTimeout: {
    name: "Custom Timeout Test",
    network: {
      nodeCount: 5,
      latency: 200,
      packetLoss: 10,
      messageTimeout: 6000,
    },
    consensus: {
      roundTimeout: 6000,
      voteThreshold: 2 / 3,
      blockSize: 10,
      proposalDelay: 100,
      timeoutMultiplier: 2.0, // Aggressive escalation
      timeoutEscalationEnabled: true,
    },
    // ... other settings
  },
};
```

### Loading Config with Timeout Settings

```javascript
import { loadConfig } from "../utils/ConfigManager";

const config = loadConfig();
console.log(config.consensus.roundTimeout); // 5000
console.log(config.consensus.timeoutMultiplier); // 1.5
console.log(config.consensus.timeoutEscalationEnabled); // true
```

## Configuration Flow

```
User Action → Controls Component → Context State → ConfigManager
     ↓              ↓                    ↓              ↓
  Slider        Update Local         Update           Save to
  Changed        State              Timeout          localStorage
                    ↓               Settings             ↓
                Save Config     ← ← ← ← ← ← ← ← ← ← ← ←
```

## Best Practices

### 1. **Always validate before saving**

```javascript
const validation = validateConfig(config);
if (validation.valid) {
  saveConfig(config);
}
```

### 2. **Provide defaults for backward compatibility**

```javascript
const timeoutMultiplier =
  config.consensus.timeoutMultiplier || 1.5;
const escalationEnabled =
  config.consensus.timeoutEscalationEnabled !== false;
```

### 3. **Update all state when loading new config**

```javascript
const loadNewConfig = (newConfig) => {
  // Update React state
  setBaseTimeoutDuration(
    newConfig.consensus.roundTimeout || 5000
  );

  // Update config
  setConfig(newConfig);

  // Save to localStorage
  saveConfig(newConfig);
};
```

### 4. **Use presets for common scenarios**

```javascript
// Don't manually set each parameter
const preset = PRESET_CONFIGS["byzantineTest"];
loadNewConfig(preset);
```

## Testing Recommendations

### Test Timeout Persistence

1. Set custom timeout values
2. Refresh the page
3. Verify settings are retained

### Test Preset Loading

1. Load each preset (Small, Large, Byzantine, Partition)
2. Verify timeout settings match expected values
3. Confirm escalation behavior

### Test Configuration Panel

1. Open Configuration Panel
2. Navigate to Consensus tab
3. Adjust timeout multiplier and escalation toggle
4. Apply configuration
5. Verify changes take effect

### Test Export/Import

1. Configure custom timeout settings
2. Export configuration
3. Reset to defaults
4. Import saved configuration
5. Verify timeout settings restored

## Future Enhancements

### Additional Parameters

- `maxTimeoutDuration`: Cap for escalation (currently hardcoded at 30s)
- `minTimeoutDuration`: Floor for de-escalation
- `timeoutStrategy`: 'exponential' | 'linear' | 'adaptive'
- `timeoutResetDelay`: How many successful commits before reset

### Advanced Validation

- Warn if timeout < network latency \* 3
- Suggest optimal timeout based on network size and latency
- Detect timeout values that may cause liveness issues

### Analytics

- Track timeout effectiveness across configurations
- Suggest optimal timeout settings based on usage patterns
- Compare timeout rates across presets

## Conclusion

The timeout feature is now fully integrated with ConfigManager, providing:

- ✅ Persistent storage
- ✅ Preset configurations
- ✅ Validation and error checking
- ✅ Export/Import capabilities
- ✅ UI configuration interface
- ✅ Backward compatibility

This integration ensures timeout settings are treated as first-class configuration parameters alongside network, consensus, and node behavior settings.
