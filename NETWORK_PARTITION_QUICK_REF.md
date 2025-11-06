# Network Partition Quick Reference

## Quick Access

**Location**: Controls Panel → "🔌 Network Partition Simulation" section

**Toggle**: Click "⚡ Enable Partition" button

**Visual Indicator**: Partitioned nodes show dashed orange borders with 🔌 badge

---

## Partition Types

| Type              | Icon | What It Does            | Use Case                          |
| ----------------- | ---- | ----------------------- | --------------------------------- |
| **Single Node**   | 🔴   | Isolates 1 node         | Test minority partition tolerance |
| **Split (50/50)** | ⚡   | Divides network in half | Demonstrate liveness failure      |
| **Gradual**       | 📉   | Random ~30% affected    | Simulate network instability      |

---

## Visual Indicators

### On Nodes

- **Dashed Orange Border**: Node is partitioned
- **🔌 Badge**: Partition indicator (top-left)
- **📡 Badge**: Network health issues (bottom-left)
- **Orange Color**: Partitioned state (#f59e0b)

### In UI

- **Network Partition Panel**: Shows statistics when active
- **Liveness Indicator**: Shows degradation/violation
- **Logs Window**: Partition status summary at top

---

## Network Statistics

| Metric                 | Description             | Warning Level |
| ---------------------- | ----------------------- | ------------- |
| **Messages Sent**      | Total messages sent     | -             |
| **Messages Delivered** | Successfully delivered  | -             |
| **Messages Lost**      | Lost due to partition   | Any > 0       |
| **Delivery Rate**      | % of messages delivered | < 70%         |

---

## Expected Behaviors

### With 4 Nodes

| Partition Type | Affected Nodes | Threshold Met? | Consensus?  |
| -------------- | -------------- | -------------- | ----------- |
| Single Node    | 1 (25%)        | 3/4 = 75% ✅   | **Success** |
| Split (50/50)  | 2 (50%)        | 2/4 = 50% ❌   | **Fails**   |
| Gradual        | ~1 (25%)       | 3/4 = 75% ✅   | **Success** |

### With 7 Nodes

| Partition Type | Affected Nodes | Threshold Met? | Consensus?  |
| -------------- | -------------- | -------------- | ----------- |
| Single Node    | 1 (14%)        | 6/7 = 86% ✅   | **Success** |
| Split (50/50)  | 3 (43%)        | 4/7 = 57% ❌   | **Fails**   |
| Gradual        | ~2 (29%)       | 5/7 = 71% ✅   | **Success** |

**Rule**: Need > 2/3 (67%) nodes to reach consensus

---

## Liveness Indicator States

| State          | Icon | Meaning         | Partition Impact               |
| -------------- | ---- | --------------- | ------------------------------ |
| **Maintained** | ✅   | Normal progress | No partition or < 30% affected |
| **Degraded**   | ⚠️   | Slowed progress | 30-50% nodes affected          |
| **Violated**   | ❌   | No progress     | > 50% affected or split-brain  |

---

## Safety Indicator States

| State          | Icon | Meaning       | Partition Behavior                  |
| -------------- | ---- | ------------- | ----------------------------------- |
| **Maintained** | ✅   | No forks      | Safety preserved despite partition  |
| **Violated**   | ⚠️   | Fork detected | Rare: possible split-brain scenario |

**Key Principle**: Safety maintained even when liveness fails!

---

## Common Scenarios

### Scenario 1: Test Minority Tolerance

```
Nodes: 4 | Type: Single Node
Result: Consensus succeeds with 3/4 nodes
Learning: Minority partitions don't prevent consensus
```

### Scenario 2: Demonstrate Split-Brain

```
Nodes: 4 | Type: Split (50/50)
Result: Complete liveness failure
Learning: Need 2/3 majority for consensus
```

### Scenario 3: Combined Stress Test

```
Nodes: 7 | Byzantine: 2 | Type: Split
Result: Severe degradation
Learning: Multiple adversarial conditions
```

### Scenario 4: Partition Healing

```
1. Enable partition → Wait for timeouts
2. Disable partition → Consensus resumes
Learning: Network recovery behavior
```

---

## Troubleshooting

### Q: Partition enabled but consensus still works?

**A**: Check partition type. With 6+ nodes, single node partition leaves enough for consensus (>2/3).

### Q: Why does safety stay green?

**A**: Safety is maintained! Tendermint prevents forks even during partitions.

### Q: No messages lost?

**A**: Messages accumulate over rounds. Wait a few rounds to see statistics.

### Q: Which nodes are partitioned?

**A**: Look for dashed orange borders with 🔌 icon. Also shown in partition panel under "Affected Nodes".

---

## Key Concepts

### CAP Theorem

- **C**onsistency: Maintained (safety preserved)
- **A**vailability: Sacrificed (liveness fails)
- **P**artition Tolerance: Demonstrated

### Liveness vs Safety

- **Liveness**: Progress continues (violated during partition)
- **Safety**: No forks (maintained during partition)

### 2/3 Threshold

- Need **>2/3 nodes** to commit blocks
- Example: 4 nodes need 3 votes (75%)
- Example: 7 nodes need 5 votes (71.4%)

---

## Pro Tips

1. **Start Simple**: Test single node before split partitions
2. **Watch Logs**: Partition events are clearly logged
3. **Use Step Mode**: Combine with step-by-step for detailed inspection
4. **Try Different Sizes**: More nodes = better partition demonstrations
5. **Combine Features**: Test with Byzantine nodes for realistic scenarios

---

## Keyboard Shortcuts

_Note: Currently no keyboard shortcuts for partition controls. Use mouse/touch._

---

## Related Features

- **Byzantine Nodes**: Combine for adversarial network testing
- **Timeout Mechanism**: Watch escalation during partitions
- **Step-by-Step Mode**: Inspect partition effects per step
- **Voting History**: Review how partitions affected voting

---

## Implementation Status

✅ **FULLY IMPLEMENTED** - All features production-ready

- [x] Three partition types
- [x] Real-time toggle controls
- [x] Visual indicators on nodes
- [x] Network statistics tracking
- [x] Liveness/safety integration
- [x] Comprehensive logging
- [x] Full documentation

---

## Quick Command Reference

| Action            | Location       | Button/Control          |
| ----------------- | -------------- | ----------------------- |
| Enable partition  | Controls panel | "⚡ Enable Partition"   |
| Disable partition | Controls panel | "🔌 Disable Partition"  |
| Change type       | Controls panel | Type selector buttons   |
| View stats        | Below nodes    | Network Partition Panel |
| Check impact      | Indicators     | Liveness/Safety panels  |
| See events        | Right panel    | Logs Window             |

---

**For full documentation**: See `README.md` section "How to Use Network Partition Simulation"

**For implementation details**: See `NETWORK_PARTITION_IMPLEMENTATION.md`

---

_Last Updated: November 6, 2025_
