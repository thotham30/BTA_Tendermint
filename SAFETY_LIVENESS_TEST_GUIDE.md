# Safety & Liveness Verification - Quick Test Guide

## Quick Visual Proof

### What to Look For

| Property | Visual Indicator | Log Message | Metric |
|----------|-----------------|-------------|--------|
| **Safety** | Blue indicator ✅ | "Safety ✓ Confirmed" | No fork detected |
| **Safety Violated** | Red indicator ❌ | "Byzantine nodes exceed threshold" | Fork possible |
| **Liveness** | Green indicator ✅ | "Consensus progressing normally" | >80% block rate |
| **Liveness Degraded** | Orange indicator ⚠️ | "High timeout rate" | 40-80% block rate |
| **Liveness Violated** | Red indicator ❌ | "Consensus cannot progress" | <20% block rate |

---

## Hands-On Tests

### Test 1: Prove Safety Works ✅

**Goal:** Show that honest nodes never commit different blocks

**Steps:**
1. Open Configuration Panel
2. Set:
   - **Nodes:** 4
   - **Byzantine Count:** 1
   - **Mode:** Synchronous (no timeouts)
3. Click **Start Consensus**
4. Wait 10-15 seconds

**What to observe:**

📊 **UI Elements:**
```
✅ Safety Indicator: "Maintained" (Blue)
   └─ "No forks despite 1 Byzantine node (≤1 safe limit)"

✅ Blocks Panel: Shows sequence
   └─ Block #1, #2, #3, #4... in order (NO conflicting blocks)

✅ Node States: All showing "Committed" or "Voting"
   └─ No node has different block than others at same height
```

🔍 **In Logs Look For:**
```
✓ "Block #1 committed"
✓ "Safety ✓ Confirmed"
✓ "Byzantine Node 1 is proposer"
✓ "Consensus progressing normally"
```

❌ **Should NOT see:**
```
✗ "Byzantine nodes exceed threshold"
✗ "Fork detected"
✗ "Safety Violated"
```

**Proof:**
- Blocks 1, 2, 3... are all **unique and in order**
- All nodes agree on same block at each height
- **= No conflicting blocks = Safety maintained ✅**

---

### Test 2: Prove Liveness Works ✅

**Goal:** Show that system makes progress and commits blocks regularly

**Steps:**
1. Configuration:
   - **Nodes:** 6
   - **Byzantine Count:** 2
   - **Mode:** Synchronous
2. Click **Start Consensus**
3. Let it run for 20 seconds
4. Count the blocks and note the time

**What to observe:**

📊 **UI Elements:**
```
✅ Liveness Indicator: "Maintained" (Green)
   └─ "Consensus progressing normally"

📈 Blocks Panel: Rapid new blocks
   └─ Block #1, #2, #3, #4, #5... (continuous)

⏱️ Timing: New block every 1-2 seconds
   └─ Shows consistent progress
```

📊 **Metrics to check:**
```
Round: 20+
Blocks: 18+ (90% success rate)
Block Rate: High (blocks appearing regularly)
Timeout Count: 0-2 (not timing out)
```

🔍 **In Logs:**
```
✓ "Block #1 proposed by Node X"
✓ "Block #2 proposed by Node Y"
✓ "Block #3 proposed by Node Z"
✓ "Consensus progressing normally"
```

**Proof:**
- System commits new block every round (or mostly every round)
- Timeouts are rare
- **= System making progress = Liveness maintained ✅**

---

### Test 3: Show Safety Violation When Byzantine > n/3 ⚠️

**Goal:** Demonstrate that safety is violated when threshold exceeded

**Steps:**
1. Configuration:
   - **Nodes:** 4
   - **Byzantine Count:** 2 (EXCEEDS ⌊4/3⌋ = 1)
   - **Mode:** Synchronous
2. Click **Start Consensus**
3. Watch indicators

**What to observe:**

🚨 **UI Elements:**
```
❌ Safety Indicator: "Violated" (Red)
   └─ "CRITICAL: Byzantine nodes (2) exceed safe threshold (1)!"
   └─ "BFT assumptions violated, forks and conflicting commits possible!"

⚠️ Liveness Indicator: "Violated" (Red)
   └─ "Byzantine nodes exceed threshold"
```

🔍 **In Logs:**
```
⚠️ "Safety violation risk: Byzantine nodes (2) exceed safe threshold (1)"
⚠️ "Consensus failed: Too many Byzantine nodes (2/4)"
⚠️ "Safety violated: Byzantine nodes (2) exceed threshold (1)"
```

**Proof:**
- System correctly detects when Byzantine threshold exceeded
- Automatically sets Safety = false
- **= System properly enforces BFT guarantees ✅**

---

### Test 4: Show Liveness Degradation with Partition 🔴

**Goal:** Demonstrate that network partitions affect liveness

**Steps:**
1. Configuration:
   - **Nodes:** 6
   - **Byzantine Count:** 1
   - **Mode:** Synchronous
2. Click **Start Consensus**
3. Wait 5 seconds (let it run)
4. Click **Network Partition** toggle to activate
5. Select partition type: "split" (50% of nodes)
6. Watch for 10 more seconds

**What to observe:**

🚨 **UI Elements - Before Partition:**
```
✅ Liveness: "Maintained" (Green)
📈 Block rate: High (new blocks every 1-2 sec)
Blocks committed: 4-5
```

🚨 **UI Elements - After Partition:**
```
⚠️ Liveness: "Degraded" (Orange) or "Violated" (Red)
   └─ "Network partition preventing consensus progress"

📊 Blocks panel: Stops growing or grows slowly
   └─ Same blocks visible for 5+ seconds

🔌 Nodes: 3 marked as "Partitioned" (dashed border)
   └─ Partitioned nodes cannot vote
```

🔍 **In Logs After Partition:**
```
⚠️ "Network partition activated (split)"
⚠️ "3 partitioned nodes unable to vote in prevote"
⚠️ "Consensus failed: 3 nodes partitioned, threshold not met"
```

**Proof:**
- System can't reach 2/3 threshold with 50% partitioned
- Progress stops (as expected in partitioned network)
- **= Liveness depends on network connectivity ✅**

---

### Test 5: Recovery Test (Liveness Returns) 🔄

**Goal:** Show that liveness recovers when conditions improve

**Steps:**
1. From Test 4, after partition is active:
   - Wait 5 more seconds
2. Click **Network Partition** toggle to deactivate
3. Watch indicators recover

**What to observe:**

🚨 **UI Elements - Before Deactivating:**
```
⚠️ Liveness: "Degraded" or "Violated"
📈 Blocks: Stopped or very slow (same block for 5+ sec)
```

✅ **UI Elements - After Deactivating:**
```
✅ Liveness: Returns to "Maintained" (Green)
   └─ "Consensus progressing normally"

📈 Blocks: Start committing again
   └─ New block every 1-2 seconds

✅ All nodes: "Voting" or "Committed" (no partitioned)
   └─ No more dashed borders
```

🔍 **In Logs After Deactivating:**
```
✓ "Network partition deactivated"
✓ "Block #X committed"
✓ "Liveness ✓ Confirmed"
✓ "Consensus progressing normally"
```

**Proof:**
- Liveness is **a property that depends on conditions**
- When conditions improve, property is restored
- **= System property management is working ✅**

---

## Metric Interpretation Guide

### Safety Metrics

**Byzantine Node Status:**
```
Safe Zone:        Byzantine Count ≤ ⌊n/3⌋
├─ 3 nodes:       ≤ 1 Byzantine ✅
├─ 4 nodes:       ≤ 1 Byzantine ✅
├─ 6 nodes:       ≤ 2 Byzantine ✅
└─ 10 nodes:      ≤ 3 Byzantine ✅

Unsafe Zone:      Byzantine Count > ⌊n/3⌋
├─ 3 nodes:       ≥ 2 Byzantine ❌
├─ 4 nodes:       ≥ 2 Byzantine ❌
├─ 6 nodes:       ≥ 3 Byzantine ❌
└─ 10 nodes:      ≥ 4 Byzantine ❌
```

### Liveness Metrics

**Block Commit Rate** (blocks committed / total rounds):
```
> 90%  ✅ Excellent - Liveness Maintained
80-90% ✅ Good - Liveness Maintained
70-80% ⚠️ Acceptable - Liveness Maintained (slight delays)
40-70% ⚠️ Degraded - Liveness Degraded (frequent timeouts)
< 40%  ❌ Poor - Liveness Violated (progress blocked)
```

**Timeout Rate** (timeouts / total rounds):
```
0-10%   ✅ Excellent - Network healthy
10-30%  ✅ Good - Minor network issues
30-50%  ⚠️ Degraded - Significant issues
> 50%   ❌ Violated - Too many failures
```

**Consecutive Timeouts:**
```
0-1    ✅ Normal - System recovers
2-3    ⚠️ Concerning - Multiple failures
> 3    ❌ Problematic - System stuck
```

---

## Visual Evidence Checklist

### ✅ Safety Evidence (Check all these):
- [ ] Safety indicator shows **Blue ✅**
- [ ] Message shows "No conflicting blocks"
- [ ] Blocks list shows **sequential, unique blocks** (1, 2, 3, 4...)
- [ ] **No** message about "Fork detected"
- [ ] Byzantine count **≤ ⌊n/3⌋**

### ✅ Liveness Evidence (Check all these):
- [ ] Liveness indicator shows **Green ✅**
- [ ] Message shows "Consensus progressing normally"
- [ ] New blocks appear **every 1-2 seconds**
- [ ] **No** message about "Cannot progress"
- [ ] Block commit rate **> 80%**
- [ ] Timeout count **< 20% of rounds**

### ⚠️ Degraded Liveness Evidence (Check these):
- [ ] Liveness indicator shows **Orange ⚠️**
- [ ] Blocks appear but **slowly** (every 3-5 seconds)
- [ ] Block commit rate **40-80%**
- [ ] Reason visible: "Network partition" or "High timeout rate"
- [ ] Message: "Progress slowed"

### ❌ Violated Property Evidence (Check these):
- [ ] Indicator shows **Red ❌**
- [ ] **One or more** of:
  - Byzantine count **> ⌊n/3⌋**
  - No blocks for **10+ seconds**
  - **50%+ of network partitioned**
- [ ] Critical message in logs
- [ ] Status shows reason (e.g., "Too many Byzantine", "Partition blocks progress")

---

## Expected Results Summary

| Configuration | Safety | Liveness | Why |
|---|---|---|---|
| 4 nodes, 1 Byz, Sync | ✅ | ✅ | 1 < 4/3 threshold |
| 4 nodes, 2 Byz, Sync | ❌ | ❌ | 2 > 4/3 threshold |
| 6 nodes, 2 Byz, Sync | ✅ | ✅ | 2 < 6/3 threshold |
| 6 nodes, 2 Byz, 50% Partition | ✅ | ⚠️ | Byzantine OK, partition affects progress |
| 6 nodes, 2 Byz, 33% Partition | ✅ | ✅ | Partition small enough, still can reach 2/3 |

---

## Common Questions Answered

**Q: Why does Safety show ✅ but we sometimes see consensus fail?**
A: Safety means "no conflicting blocks", not "every block succeeds". Failed rounds (no block) don't violate safety. Liveness (not safety) handles progress.

**Q: Can safety ever recover from ❌?**
A: No. If Byzantine > n/3, the system is fundamentally broken. You must reduce Byzantine nodes (reset) to recover.

**Q: Can liveness recover from ⚠️?**
A: Yes! Liveness recovers when conditions improve (partition ends, network stabilizes, or Byzantine nodes reduced).

**Q: What does "Degraded" liveness mean?**
A: System is making progress but slower than normal. Some rounds timeout. This is temporary and recovers.

**Q: How long should I run the test?**
A: At least 20 seconds to see enough rounds (20+ rounds at 1 sec per round). This gives statistical significance.

---

## Running Full Verification

### Complete Test Sequence (5 minutes):

1. **Test 1 (2 min):** Safety proof with 1 Byzantine
   - Verify: Blue safety ✅, Sequential blocks, No forks

2. **Test 2 (2 min):** Liveness proof with 2 Byzantine
   - Verify: Green liveness ✅, Regular blocks, High commit rate

3. **Test 3 (1 min):** Safety violation with 2 Byzantine in 4-node network
   - Verify: Red safety ❌, Critical message shown

4. **Test 4 (2 min):** Liveness degradation with partition
   - Verify: Orange/red liveness ⚠️/❌, Blocked progress, Partition message

5. **Test 5 (1 min):** Liveness recovery
   - Verify: Green liveness ✅, Blocks resume, Message shows recovery

**Total Evidence:** 5 minutes of visual proof that both Safety and Liveness are maintained according to theory ✅

---

## Where to Report Results

After running tests, document:
1. **Configuration used** (nodes, Byzantine count, network settings)
2. **Visual indicators** (final state of Safety/Liveness)
3. **Key metrics** (block rate, timeout count)
4. **Log messages** (confirming theory predictions)
5. **Screenshot/Recording** (of complete test run)

This constitutes **empirical proof** that the Tendermint implementation correctly maintains Safety and Liveness properties. ✅
