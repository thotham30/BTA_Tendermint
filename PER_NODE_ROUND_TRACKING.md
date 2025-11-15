# Per-Node Round Tracking

## Overview

In a **partially connected network**, different nodes may be in **different rounds** if they cannot communicate with each other. This feature allows you to track and visualize each node's individual round number.

## What Changed

### 1. **Node Data Structure**

Each node now has a `round` field:

```javascript
{
  id: 1,
  state: "Idle",
  round: 0,  // ← NEW: Individual round tracking
  neighbors: [2, 4],
  position: { x: 400, y: 300 },
  // ... other fields
}
```

### 2. **Visual Display**

#### On Each Node

- **Round badge** appears at the top center of each node
- Shows "R0", "R1", "R2", etc.
- Blue gradient background for easy visibility
- Visible on both graph canvas and regular node view

#### In State Inspector

When in **Step-by-Step Mode**:

- New section: **🔄 Individual Node Rounds**
- Grid layout showing all nodes and their current rounds
- Color coding:
  - **Blue border**: Normal nodes
  - **Orange border**: Byzantine nodes
  - **Gray dashed border**: Offline nodes
- Hover to see node ID and round number

## How to View Per-Node Rounds

### Method 1: Hover Over Nodes

Simply hover your mouse over any node to see its tooltip:

```
Node 3 - Idle - Round 2
```

### Method 2: State Inspector (Step-by-Step Mode)

1. Enable **Step-by-Step Mode**
2. Look for the **"🔄 Individual Node Rounds"** section
3. See a grid of all nodes with their current rounds

### Method 3: Console Inspection

Check node data directly:

```javascript
// In browser console
nodes.forEach((n) =>
  console.log(`Node ${n.id}: Round ${n.round}`)
);
```

## When Nodes Have Different Rounds

### Scenario 1: Fully Connected Network

```
Node 1: Round 3
Node 2: Round 3
Node 3: Round 3
Node 4: Round 3
```

✅ **All nodes synchronized** - this is normal behavior

### Scenario 2: Partitioned Network

```
Partition A:
  Node 1: Round 5
  Node 2: Round 5

Partition B:
  Node 3: Round 3
  Node 4: Round 3
```

⚠️ **Nodes desynchronized** - partitions progress independently

### Scenario 3: Isolated Node

```
Node 1: Round 7
Node 2: Round 7
Node 3: Round 0  ← Isolated!
Node 4: Round 7
```

❌ **Node 3 stuck** - cannot reach others, cannot progress

## Testing Per-Node Round Tracking

### Test 1: Ring Topology

**Setup:**

```javascript
{
  nodeCount: 4,
  topology: { type: "ring", useGraphRouting: true }
}
```

**Expected:**

- All nodes progress together (fully connected ring)
- All show same round number
- Messages take multiple hops but all arrive

### Test 2: Partitioned Network

**Setup:**

```javascript
{
  nodeCount: 6,
  topology: { type: "custom", useGraphRouting: true },
  edges: [
    // Partition 1
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    // Partition 2
    { source: 4, target: 5 },
    { source: 5, target: 6 },
    // NO CONNECTION BETWEEN PARTITIONS
  ]
}
```

**Expected:**

- Partition 1 (nodes 1,2,3) may reach different rounds than Partition 2 (4,5,6)
- Each partition progresses independently
- Visual: Different round numbers in State Inspector

### Test 3: Star with Isolated Nodes

**Setup:**

```javascript
{
  nodeCount: 5,
  topology: { type: "star", useGraphRouting: true },
  // Manually disconnect one peripheral node
  edges: [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4 },
    // Node 5 not connected!
  ]
}
```

**Expected:**

- Nodes 1,2,3,4 progress normally
- Node 5 stuck at Round 0 (isolated)
- Visual: Node 5 shows R0 while others show R3+

## Important Notes

### Current Implementation

⚠️ **Note:** The current implementation tracks a **global round** in ConsensusContext. The `node.round` field is initialized but may need additional logic to update per-node rounds during consensus in graph routing mode.

### Future Enhancement

To fully implement per-node round progression:

1. **Update round on message receipt:**

   ```javascript
   // In message handling logic
   if (message.round > node.round) {
     node.round = message.round;
   }
   ```

2. **Track voting rounds per node:**

   ```javascript
   // Each node tracks which round it voted in
   node.lastVotedRound = round;
   ```

3. **Timeout handling per node:**
   ```javascript
   // Nodes advance round on timeout independently
   if (nodeTimeout(node)) {
     node.round++;
   }
   ```

## Debugging Round Desynchronization

### Check Network Connectivity

```javascript
import { getReachableNodes } from "./utils/GraphTopology";

// Check which nodes can reach each other
for (let i = 1; i <= nodeCount; i++) {
  const reachable = getReachableNodes(i, edges);
  console.log(`Node ${i} can reach:`, Array.from(reachable));
}
```

### Expected Patterns

- **Fully connected:** All nodes reach all nodes
- **Partitioned:** Nodes only reach those in same partition
- **Isolated:** Node only reaches itself

### Why Rounds Differ

1. **Network partition:** Separated groups progress independently
2. **Proposer unreachable:** Some nodes can't receive proposals
3. **Asymmetric connectivity:** Node A → B works, but B → A doesn't
4. **Message delays:** Routing takes multiple hops in graph topology

## Educational Value

This feature demonstrates:

1. **Distributed System Reality**

   - Nodes don't magically synchronize
   - Network topology affects consensus progression
   - Partitions cause divergence

2. **Consensus Protocol Challenges**

   - Not all nodes see same information simultaneously
   - Rounds may progress at different rates
   - Synchrony assumptions can break

3. **Graph Routing Impact**
   - Full mesh vs. partial connectivity
   - Message propagation delays
   - Reachability determines progress

## Visual Examples

### Synchronized Network

```
┌─────────┐  ┌─────────┐
│ Node 1  │──│ Node 2  │
│  R: 3   │  │  R: 3   │
└─────────┘  └─────────┘
     │            │
     └────────────┘
```

### Desynchronized Network

```
┌─────────┐  ┌─────────┐
│ Node 1  │  │ Node 3  │  ← No connection!
│  R: 5   │  │  R: 2   │
└─────────┘  └─────────┘
     │
     │
┌─────────┐
│ Node 2  │
│  R: 5   │
└─────────┘
```

## Troubleshooting

### Nodes Show R0 Even When Running

**Cause:** Per-node round updates not implemented in consensus logic  
**Solution:** Currently showing initialization value; full implementation requires updating consensus step logic

### All Nodes Always Same Round

**Cause:** Using broadcast mode instead of graph routing  
**Solution:** Set `useGraphRouting: true` in ConfigManager

### Round Numbers Don't Match Global Round

**Cause:** This is expected! In partial connectivity, nodes progress independently  
**Solution:** Not a bug - this demonstrates distributed systems reality

## Future Improvements

1. **Round update logic:** Automatically update `node.round` during consensus steps
2. **Round history:** Track round progression over time per node
3. **Synchronization metrics:** Show how "in sync" nodes are
4. **Visual indicators:** Color-code nodes by round number
5. **Round difference warnings:** Alert when nodes drift too far apart

---

**Summary:** Per-node round tracking provides visibility into how individual nodes progress through consensus rounds in partially connected networks, revealing the impact of network topology on distributed consensus.
