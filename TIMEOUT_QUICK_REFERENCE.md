# Timeout Feature Quick Reference

## Quick Start

1. **Start Simulation**: Click "Start" button
2. **Watch Timer**: Circular countdown shows time remaining in current round
3. **Observe Proposer**: Node with 👑 icon is current proposer
4. **Monitor Stats**: Bottom panel shows timeout statistics

## Color Meanings

### Countdown Timer
- 🟢 **Green** (>50% time): Plenty of time, consensus progressing normally
- 🟡 **Yellow** (20-50% time): Warning, time running low
- 🔴 **Red** (<20% time): Critical, timeout imminent

### Node States
- 🟡 **Yellow/Orange** (#f9c74f): Voting in progress
- 🔴 **Red** (#f94144): Round timed out
- 🟢 **Green** (#90be6d): Block committed successfully
- ⚫ **Gray** (#666): Node offline

### Liveness Indicator
- 🟢 **Green**: Consensus healthy, progressing normally
- 🟡 **Orange**: Degraded (high timeouts or consecutive failures)
- 🔴 **Red**: Violated (cannot progress)

## Control Settings

### Initial Timeout
- **Default**: 5000ms (5 seconds)
- **Range**: 1000ms - 10000ms
- **Use Case**: Set based on expected network latency

### Escalation Multiplier
- **Default**: 1.5x
- **Range**: 1.1x - 2.0x
- **Effect**: How much timeout increases after each failure

### Timeout Escalation Toggle
- **ON** (default): Timeout duration increases after each failure
- **OFF**: Timeout stays constant (not recommended)

## Understanding the Display

### Timeout Visualizer
```
┌─────────────────────────────────┐
│ Round Timeout                   │
├─────────────────────────────────┤
│  ⭕ 4.2s      │ Timeout: 5000ms │
│   remaining   │ Escalation: 1st │
│               │ Proposer: Node 3│
└─────────────────────────────────┘
```

### Timeout Stats Panel
```
┌─────────────────────────────────────┐
│ Total: 5  Consecutive: 2  Rate: 25% │
│ Avg Duration: 5500ms  Max: 2x       │
└─────────────────────────────────────┘
```

## What Happens During Timeout

1. **Timer Reaches Zero**: Round timeout triggered
2. **Proposer Changes**: Next node becomes proposer
3. **Duration Increases**: If escalation enabled, timeout × multiplier
4. **Log Entry Created**: Event recorded in logs
5. **Stats Updated**: Counters and rates recalculated
6. **Visual Update**: Nodes turn red, new proposer highlighted

## What Happens on Success

1. **Block Committed**: 2/3+ nodes voted yes
2. **Timer Resets**: Timeout returns to base duration
3. **Consecutive Cleared**: Consecutive timeout counter reset to 0
4. **Visual Update**: Nodes turn green
5. **New Round Starts**: Fresh round with new proposer

## Warning Signs

### 🚨 High Timeout Rate (>40%)
- **Cause**: Network issues, Byzantine nodes, or insufficient timeout
- **Fix**: Increase initial timeout, check network settings

### 🚨 Many Consecutive Timeouts (>5)
- **Cause**: Persistent network failure or too many Byzantine nodes
- **Fix**: Reduce network latency, reduce Byzantine node count

### 🚨 Liveness Degraded
- **Meaning**: Consensus still working but slower than expected
- **Action**: Monitor timeout escalation, adjust settings if needed

## Timeout Escalation Example

```
Round 1:  5000ms → Timeout → Next proposer
Round 2:  7500ms (5000 × 1.5) → Timeout → Next proposer
Round 3: 11250ms (7500 × 1.5) → Timeout → Next proposer
Round 4: 16875ms (11250 × 1.5) → Success! → Reset to 5000ms
Round 5:  5000ms → Success!
```

## Best Practices

### For Testing
1. Start with default settings
2. Observe normal operation (should have few/no timeouts)
3. Add Byzantine nodes or increase latency
4. Watch timeout escalation behavior
5. Note how system adapts

### For Demonstrations
1. **Normal Network**: Show smooth operation with minimal timeouts
2. **Degraded Network**: Increase latency to 500ms, show timeouts
3. **Byzantine Attack**: Add 2-3 Byzantine nodes, show resilience
4. **Recovery**: Remove issues, show system recovery

### For Learning
1. Disable escalation, observe continuous timeouts
2. Enable escalation, observe adaptive behavior
3. Compare timeout rates with/without escalation
4. Understand relationship between timeouts and liveness

## Keyboard Shortcuts

- **Start/Pause**: Click Start/Pause button (no keyboard shortcut)
- **Reset**: Click Reset button (no keyboard shortcut)
- **Speed**: Click speed buttons (0.25x - 4x)

## Troubleshooting

### Timer Not Moving
- **Check**: Is simulation running? (Start button clicked?)
- **Check**: Speed set correctly? (Try 1x speed)

### Too Many Timeouts
- **Increase**: Initial timeout duration
- **Reduce**: Network latency
- **Reduce**: Number of Byzantine nodes
- **Check**: Timeout escalation enabled

### No Timeouts at All
- **This is good!** Means consensus is working efficiently
- **To test timeouts**: Increase network latency or add Byzantine nodes

### Escalation Not Working
- **Check**: Timeout escalation toggle enabled
- **Check**: Multiplier set correctly (should be >1.0)
- **Observe**: Stats panel for escalation level

## Educational Tips

1. **Compare with/without escalation**: See how exponential backoff helps
2. **Watch proposer rotation**: Understand how timeout triggers change
3. **Monitor liveness indicator**: See impact of timeouts on progress
4. **Read log messages**: Follow step-by-step what's happening
5. **Check timeout history**: Review chain of escalating timeouts

## Key Metrics to Watch

- **Timeout Rate**: Should be <30% for healthy network
- **Consecutive Timeouts**: Should reset to 0 frequently
- **Escalation Level**: Should rarely exceed 3-4x
- **Success Rate**: Should be >70% for healthy operation
- **Liveness Status**: Should stay "Maintained" most of the time

## Advanced Usage

### Testing Specific Scenarios
1. **Network Partition**: Set high packet loss (>20%)
2. **Byzantine Behavior**: Set 2-3 Byzantine nodes
3. **High Latency**: Set latency >500ms
4. **Combined Stress**: All of the above together

### Optimal Settings by Scenario
```
Small Network (4 nodes):
  Timeout: 3000ms, Multiplier: 1.4x

Large Network (10+ nodes):
  Timeout: 6000ms, Multiplier: 1.6x

High Latency (>500ms):
  Timeout: 8000ms, Multiplier: 1.5x

Byzantine Test (3+ Byzantine):
  Timeout: 5000ms, Multiplier: 1.8x
```

## Remember

- ✅ Timeouts are normal in distributed systems
- ✅ Exponential backoff prevents livelock
- ✅ Some timeouts show system is adaptive
- ✅ Zero timeouts = perfect conditions (rare in real world)
- ✅ High timeout rate = investigate network/Byzantine issues
