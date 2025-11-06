# Byzantine Node Simulation - Quick Reference Card

## 🚀 Quick Start

**Fastest Way to See Byzantine Nodes:**

1. Click **"⚙️ Configuration"**
2. Click **"Byzantine Test"** preset
3. Click **"Apply Configuration"**
4. Click **"Reset"** then **"Start"**

Result: 7 nodes, 2 Byzantine (red with ⚠️), faulty behavior

---

## 📊 Byzantine Behavior Types

| Type            | Vote Pattern    | Impact            | Use Case           |
| --------------- | --------------- | ----------------- | ------------------ |
| **Faulty**      | 50% yes, 50% no | Maximum chaos     | Stress testing     |
| **Equivocator** | 70% yes         | Safety violations | Double-voting test |
| **Silent**      | No votes        | Liveness issues   | Participation test |

---

## 🎯 Byzantine Tolerance Limits

| Nodes | Max Byzantine | %      |
| ----- | ------------- | ------ |
| 4     | 1             | 25%    |
| 7     | 2             | 28.6%  |
| 10    | 3             | 30%    |
| 16    | 5             | 31.25% |

**Formula**: Max = floor(n/3)

---

## 🔴 Visual Indicators

### Byzantine Node Appearance

- **Color**: Red (#ff6b6b) - ALWAYS
- **Badge**: ⚠️ warning symbol (top-right)
- **Tooltip**: Hover shows "Byzantine: [type]"
- **Proposer**: NEVER has 👑 crown (excluded from rotation)
- **Votes**: Shows ✓/✗ based on actual vote

### Color Guide

- 🔴 Red = Byzantine (any state)
- 🟡 Yellow = Honest voting
- 🟢 Green = Honest committed
- ⚪ Gray = Honest idle
- 🔴 Dark Red = Honest timeout

---

## ⚙️ Configuration Path

**Location**: ⚙️ Configuration → Node Behavior tab

### Byzantine Nodes (number input)

- Range: 0 to floor(nodeCount/3)
- Example: 7 nodes → max 2 Byzantine

### Byzantine Node Type (dropdown)

- Faulty (votes randomly)
- Equivocator (sends conflicting votes)
- Silent (doesn't respond)

---

## 📝 Common Scenarios

### Scenario 1: Basic BFT Demo

```
Nodes: 4
Byzantine: 1 (faulty)
Latency: 50ms
Packet Loss: 0%
```

**Result**: Occasional timeouts, mostly successful

### Scenario 2: Maximum Stress

```
Nodes: 7
Byzantine: 2 (faulty)
Latency: 100ms
Packet Loss: 5%
```

**Result**: Frequent timeouts, at BFT limit

### Scenario 3: Silent Attack

```
Nodes: 6
Byzantine: 2 (silent)
Latency: 100ms
Packet Loss: 0%
```

**Result**: Effective validators reduced, hard to reach threshold

---

## 🐛 Troubleshooting

### Can't set Byzantine count?

→ Exceeds n/3 limit. Increase total nodes first.

### Byzantine nodes not visible?

→ Check byzantineCount > 0, click Apply, then Reset.

### All consensus failing?

→ Too many Byzantine + high packet loss. Reduce both.

### Byzantine voting honestly?

→ Probabilistic behavior. Run 20+ rounds to see variance.

### No timeout stats showing?

→ Run longer. Stats appear after first timeout.

---

## 🔍 Where to Observe Byzantine Impact

### Continuous Mode

- **Voting Breakdown**: Click "👁️ Show Votes"
- **Logs Window**: Scroll to see timeout messages
- **Safety/Liveness**: Top indicators show violations
- **Voting History**: Click "📊 Voting History"

### Step-by-Step Mode

- **State Inspector**: Shows current proposer, votes, thresholds
- **Detailed Step View**: Tables with Byzantine node labels
- **Node Highlighting**: Byzantine nodes marked in red
- **Vote Tables**: ⚠️ badge next to Byzantine votes

---

## 📚 Key Formulas

### Byzantine Tolerance

```
f < n/3
f = floor((n-1)/3)
Required votes = ceil(2n/3)
```

### Success Rate Impact

```
successRate = 100 - (byzantineRatio × 150%)
byzantineRatio = byzantineCount / nodeCount
```

### Effective Validators

```
effective = nodeCount × (1 - downtime%) - silentByzantine
```

---

## 🎓 Educational Value

**Demonstrate**:

- ✅ Byzantine Generals Problem
- ✅ n/3 tolerance limit
- ✅ Why 2/3+ threshold is necessary
- ✅ Impact of malicious validators
- ✅ Difference between crash and Byzantine failures

**Best for Teaching**:

1. Start with 0 Byzantine (baseline)
2. Add 1 Byzantine (show tolerance)
3. Try to add more than n/3 (show limit)
4. Use Step-by-Step mode (see vote-by-vote)
5. Add packet loss (compound failures)

---

## 🔬 Testing Checklist

- [ ] Configure 4 nodes, 1 Byzantine (faulty)
- [ ] Verify red color and ⚠️ badge
- [ ] Check that Byzantine node never gets 👑
- [ ] Run 10 rounds, observe voting patterns
- [ ] Enable "Show Votes" panel
- [ ] Check Voting History
- [ ] Try equivocator type
- [ ] Try silent type
- [ ] Test at maximum (7 nodes, 2 Byzantine)
- [ ] Combine with 20% packet loss
- [ ] Use Step-by-Step mode
- [ ] Verify Byzantine labels in Detailed Step View

---

## 💡 Pro Tips

1. **Use Presets**: "Byzantine Test" is pre-configured perfectly
2. **Verbose Logs**: Set log level to "verbose" to see Byzantine activity
3. **Step-by-Step**: Best way to see individual Byzantine votes
4. **Compare**: Run same config with 0 vs max Byzantine
5. **Voting History**: Review past rounds to find patterns
6. **Packet Loss**: Add 5-10% to make Byzantine impact more visible
7. **Reset Often**: Click Reset between tests to clear history
8. **Tooltips**: Hover nodes to see Byzantine type
9. **Vote Badges**: Watch ✓/✗ on Byzantine nodes in real-time
10. **Timeout Stats**: Monitor timeout rate in logs window

---

## ⚡ One-Line Commands

**Check current config:**

```javascript
JSON.parse(localStorage.getItem("tendermint_config"));
```

**Max Byzantine for n nodes:**

```javascript
Math.floor(n / 3);
```

**Success rate estimate:**

```javascript
100 - (byzantineCount / nodeCount) * 150;
```

---

## 📖 Documentation Links

- **Full Guide**: `BYZANTINE_FEATURES_GUIDE.md`
- **README**: Main project documentation
- **Implementation**: See `tendermintLogic.js` → `voteOnBlock()`
- **Validation**: See `ConfigManager.js` → `validateConfig()`

---

## 🎯 Key Takeaways

1. **Byzantine nodes are FULLY IMPLEMENTED** ✅
2. **Visual indicators work perfectly** 🔴⚠️
3. **Three behavior types available** (faulty/equivocator/silent)
4. **n/3 limit strictly enforced** by validation
5. **Proposer exclusion prevents invalid blocks**
6. **Best way to learn BFT concepts** interactively

---

## 🚨 Important Notes

- Byzantine nodes = first N nodes (Node 1, Node 2, ...)
- Byzantine color = ALWAYS red (#ff6b6b)
- Byzantine type = set in config, applies to ALL Byzantine nodes
- Proposer rotation = EXCLUDES Byzantine nodes
- Validation = STRICT (n/3 limit cannot be exceeded)
- Reset required = after changing configuration

---

**Created**: November 2025  
**Version**: 1.0  
**Status**: ✅ Fully Implemented  
**Project**: Tendermint Protocol Visualizer
