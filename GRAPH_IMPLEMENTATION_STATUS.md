# Graph-Based Partially Connected Network - Implementation Status

## Phase 1: Foundation & Data Structures ✅ COMPLETED

### Summary

Successfully implemented the foundational infrastructure for graph-based partially connected networks. The system now supports multiple network topologies while maintaining **backward compatibility** with the existing fully-connected broadcast model via a feature flag.

---

## 🎯 What Has Been Implemented

### 1. **GraphTopology.js** - Complete Graph Topology Utility ✅

**Location:** `src/utils/GraphTopology.js`

**Features:**

- **Topology Generation Functions:**

  - `full-mesh` - All nodes connected to all others (original behavior)
  - `ring` - Circular topology where each node connects to next
  - `star` - Hub-and-spoke topology with one central node
  - `line` - Linear chain of nodes
  - `random` - Random edges with configurable probability
  - `random-degree` - Random graph with target average node degree
  - `custom` - User-defined edge configuration

- **Graph Analysis Functions:**

  - `getNeighbors(nodeId, edges)` - Get directly connected nodes
  - `isReachable(sourceId, targetId, edges)` - BFS reachability check
  - `getReachableNodes(nodeId, edges)` - Find all nodes reachable from source
  - `findShortestPath(sourceId, targetId, edges)` - BFS shortest path
  - `getGraphStatistics(nodeCount, edges)` - Compute degree, diameter, connectivity

- **Layout Algorithms:**

  - `calculateCircularLayout()` - Arrange nodes in circle
  - `calculateForceDirectedLayout()` - Spring-mass physics simulation

- **Edge Management:**
  - `addEdge(edges, source, target, options)` - Add new edge
  - `removeEdge(edges, source, target)` - Remove edge
  - `toggleEdgeBidirectional(edges, source, target)` - Toggle directionality

### 2. **MessageQueue.js** - Message Routing System ✅

**Location:** `src/utils/MessageQueue.js`

**Features:**

- **Message Object Structure:**

  ```javascript
  {
    id: string,           // Unique identifier
    sender: number,       // Sender node ID
    receiver: number,     // Receiver node ID
    type: string,         // "proposal", "prevote", "precommit", "decision"
    content: object,      // Message payload
    timestamp: number,    // Creation time
    ttl: number,          // Time-to-live (hops remaining)
    path: number[]        // Path taken (for debugging/visualization)
  }
  ```

- **Routing Functions:**
  - `createMessage()` - Create message with metadata
  - `sendMessage()` - Direct peer-to-peer delivery with latency & packet loss
  - `broadcastToNeighbors()` - Send to all directly connected neighbors
  - `floodMessage()` - Multi-hop gossip protocol (simulates message propagation)
  - `processInbox()` - Process incoming messages for a node
  - `getMessageStatistics()` - Aggregate queue statistics

### 3. **ConfigManager.js Updates** ✅

**Location:** `src/utils/ConfigManager.js`

**New Configuration Schema:**

```javascript
network: {
  nodeCount: 4,
  latency: 100,           // Global latency fallback
  packetLoss: 0,          // Global packet loss fallback
  messageTimeout: 5000,
  topology: {
    type: "full-mesh",                    // Topology type
    edgeProbability: 0.3,                 // For random graphs
    nodeDegree: 2,                        // For random-degree graphs
    useGraphRouting: false,               // Feature flag (false = broadcast, true = graph)
  },
  edges: [],              // Array of edge objects (populated by topology generator)
}
```

**Validation:**

- Added topology type validation
- Edge probability validation (0-1)
- Node degree validation (1 to nodeCount-1)
- Edge structure validation (source, target, self-loop checks)

**Preset Updates:**

- `smallNetwork` - Full-mesh (4 nodes)
- `largeNetwork` - Full-mesh (16 nodes)
- `byzantineTest` - Ring topology (7 nodes)
- `partitionTest` - Random-degree topology (6 nodes, degree=3)

### 4. **NetworkSimulation.js Updates** ✅

**Location:** `src/utils/NetworkSimulation.js`

**Enhanced `initializeNetwork()` Function:**

```javascript
// Now generates:
// 1. Network topology (edges) based on config
// 2. Node positions using layout algorithms
// 3. Neighbor lists for each node
// 4. Message queues (inbox, outbox)
```

**New Node Structure:**

```javascript
{
  id: number,
  state: string,
  color: string,
  isByzantine: boolean,
  byzantineType: string,
  isOnline: boolean,

  // NEW FIELDS
  neighbors: number[],            // IDs of directly connected nodes
  position: { x: number, y: number },   // Graph layout coordinates
  inbox: Message[],               // Incoming message queue
  outbox: Message[],              // Outgoing message queue
}
```

### 5. **ConsensusContext.jsx Updates** ✅

**Location:** `src/context/ConsensusContext.jsx`

**New State Variables:**

```javascript
const [edges, setEdges] = useState([]); // Network edges
const [useGraphRouting, setUseGraphRouting] = useState(false); // Feature flag
```

**Initialization Logic:**

- Automatically builds topology on nodeCount or topology type change
- Positions nodes using appropriate layout algorithm
- Populates neighbor lists
- Exposes edges via context for visualization

**Context API Additions:**

```javascript
{
  edges,                 // Current network edges
  useGraphRouting,       // Graph routing flag
  setEdges,              // Update edges
  setUseGraphRouting,    // Toggle routing mode
  // ... existing context
}
```

### 6. **GraphCanvas Component** ✅

**Location:** `src/components/GraphCanvas.jsx`

**Features:**

- **SVG-based graph rendering** (replaces CSS flexbox)
- **Edge rendering:**
  - Bidirectional edges (solid lines)
  - Unidirectional edges (arrows)
  - Hover effects with color/width changes
  - Optional edge labels (latency, packet loss)
- **Node rendering:**
  - Positioned at calculated x/y coordinates
  - Uses existing Node component (via foreignObject)
  - Highlight circles for step-by-step mode
  - Maintains all existing node states/colors
- **Legend:**
  - Edge types (bidirectional ↔, unidirectional →)
  - Node states (Idle, Voting, Committed, Byzantine)
- **Interactive:**
  - Click handlers for nodes and edges
  - Hover effects
  - Extensible for drag-and-drop (future)

**CSS Styling:**
**Location:** `src/styles/GraphCanvas.css`

- Smooth transitions for edge hover
- Pulse animation for highlighted nodes
- Responsive legend layout

### 7. **ConsensusVisualizer.jsx Updates** ✅

**Location:** `src/components/ConsensusVisualizer.jsx`

**Conditional Rendering:**

```javascript
{
  useGraphRouting || edges.length > 0 ? (
    <GraphCanvas
      nodes={nodes}
      edges={edges}
      highlightedNodes={highlightedNodes}
    />
  ) : (
    <div className="nodes-container">
      {/* Original flexbox layout */}
    </div>
  );
}
```

**Backward Compatibility:**

- If `useGraphRouting = false` and no custom edges → uses original flexbox layout
- If `useGraphRouting = true` or custom edges exist → uses GraphCanvas
- All existing features (step-by-step, voting, timeouts) work in both modes

---

## 🔧 How to Use

### Option 1: Default Behavior (Fully Connected)

**No changes required!** The system defaults to:

- `topology.type = "full-mesh"`
- `topology.useGraphRouting = false`
- Uses original broadcast logic
- Displays nodes in flexbox layout

### Option 2: Enable Graph Visualization (No Logic Change)

Update configuration:

```javascript
network: {
  topology: {
    type: "ring",              // or "star", "random", etc.
    useGraphRouting: false,    // Keep broadcast logic
  }
}
```

**Result:**

- Nodes displayed in graph layout
- Edges visible
- Still uses broadcast (all nodes receive messages)
- Good for **visualization only**

### Option 3: Full Graph-Based Routing (Future)

```javascript
network: {
  topology: {
    type: "ring",
    useGraphRouting: true,     // Enable neighbor-aware routing
  }
}
```

**Result:**

- Graph visualization
- Messages only sent to neighbors
- Multi-hop flooding
- Consensus uses reachable nodes only
- **(Requires Phase 2 implementation)**

---

## 🚀 Next Steps (Not Yet Implemented)

### Phase 2: Message Routing Logic (High Priority)

**Files to Modify:**

- `src/utils/tendermintLogic.js`
  - Update `voteOnBlock()` to filter by neighbors
  - Update `getNextProposer()` to check reachability
  - Add flooding simulation for multi-hop message propagation
- `src/context/ConsensusContext.jsx`
  - Replace broadcast loops with `floodMessage()` calls
  - Update threshold calculations to use reachable node count
  - Integrate message queues into consensus loop

### Phase 3: UI Configuration (Medium Priority)

**New Components:**

- `src/components/TopologySelector.jsx`
  - Dropdown for topology type
  - Sliders for edgeProbability, nodeDegree
  - Toggle for useGraphRouting
- `src/components/TopologyEditor.jsx`
  - Interactive edge addition/removal
  - Click-drag between nodes to create edges
  - Edge property editor (latency, packet loss, bidirectional)
- Update `src/components/ConfigurationPanel.jsx`
  - Add topology configuration section
  - Integrate TopologySelector

### Phase 4: Enhanced Visualizations (Low Priority)

- Animate message flow along edges (pulsing dots)
- Show reachability warnings in LivenessIndicator
- Display "Reachable Votes" vs "Unreachable Votes" in VotingBreakdown
- Add graph metrics panel (diameter, connectivity %, node degrees)

### Phase 5: Testing & Documentation

- Unit tests for graph algorithms
- Integration tests for different topologies
- Performance testing with 20 nodes
- User guide for topology configuration

---

## 📊 Current Status Summary

| Task                         | Status         | Priority |
| ---------------------------- | -------------- | -------- |
| Graph topology generation    | ✅ Complete    | Critical |
| Node data structure updates  | ✅ Complete    | Critical |
| Configuration schema         | ✅ Complete    | Critical |
| Message queue system         | ✅ Complete    | Critical |
| Graph visualization (SVG)    | ✅ Complete    | High     |
| Backward compatibility       | ✅ Complete    | Critical |
| Neighbor-aware routing logic | ⏳ Not Started | Critical |
| Consensus threshold updates  | ⏳ Not Started | Critical |
| Topology selector UI         | ⏳ Not Started | Medium   |
| Interactive edge editor      | ⏳ Not Started | Low      |
| Message flow animation       | ⏳ Not Started | Low      |
| Reachability warnings        | ⏳ Not Started | Medium   |

---

## ⚠️ Important Notes

### Backward Compatibility

✅ **NO BREAKING CHANGES**

- Existing simulations work unchanged
- Default configuration uses full-mesh with broadcast
- Original flexbox layout still available
- All existing features (Byzantine nodes, partitions, timeouts) preserved

### Feature Flag System

The `useGraphRouting` flag provides safe migration:

- `false` (default) → Original broadcast behavior
- `true` → Neighbor-aware routing (requires Phase 2)
- Can be toggled per simulation

### Testing Before Production

Before enabling `useGraphRouting = true`:

1. Implement Phase 2 (neighbor-aware routing)
2. Test with ring topology (4 nodes)
3. Verify consensus still reaches with 2/3 threshold
4. Test Byzantine node in star topology (hub vs peripheral)
5. Verify liveness/safety guarantees maintained

### Performance Considerations

- Force-directed layout runs 50-100 iterations (configurable)
- BFS reachability checks are O(V+E) per query
- Consider caching reachability for large graphs (>15 nodes)
- SVG rendering performs well up to ~20 nodes/edges

---

## 🎨 Visual Examples

### Full-Mesh (Default)

```
    1 ← → 2
    ↕ ⤫ ⤬ ↕
    4 ← → 3
```

All nodes connected. Same as original behavior.

### Ring Topology

```
    1 → 2
    ↑   ↓
    4 ← 3
```

Message takes 2 hops to reach opposite node.

### Star Topology

```
      2
      ↑
  1 ← 3 → 4
      ↓
      5
```

Node 3 is hub. If hub fails, network partitions.

### Random Topology (probability=0.4)

```
    1 ← → 2
    ↓     ↓
    4 → 3
```

Partial connectivity. Some nodes may be isolated.

---

## 🐛 Known Limitations

1. **No Routing Logic Yet**

   - `useGraphRouting = true` will **not work correctly** until Phase 2
   - Messages still broadcast even with graph visualization
   - Workaround: Keep `useGraphRouting = false` for now

2. **No UI for Topology Selection**

   - Must edit configuration JSON manually
   - No visual editor for custom edges
   - Workaround: Use preset topologies or edit `DEFAULT_CONFIG`

3. **Force-Directed Layout Not Optimized**

   - May look messy for random graphs
   - No repulsion for overlapping nodes
   - Workaround: Use circular layout for rings/stars

4. **No Message Flow Animation**
   - Edges are static (don't show message propagation)
   - Workaround: Use step-by-step mode with node highlights

---

## 📚 Architecture Decisions

### Why SVG Instead of Canvas?

- Easier DOM manipulation
- CSS styling support
- Better accessibility
- React-friendly (foreignObject for nodes)
- Good enough performance for <20 nodes

### Why Feature Flag Instead of Direct Replace?

- Safe migration path
- Can A/B test routing logic
- Easier debugging (compare old vs new)
- Rollback safety

### Why Not Use D3.js/Cytoscape?

- Simpler implementation for MVP
- Lighter bundle size
- More control over rendering
- Can migrate later if needed

### Why Calculate Layout in initializeNetwork?

- Positions stored in node state
- Consistent across re-renders
- Can implement drag-and-drop later
- Separation of concerns (layout vs rendering)

---

## ✅ Testing Checklist

### Phase 1 (Current) - Foundation ✅

- [x] Nodes have `neighbors`, `position`, `inbox`, `outbox` fields
- [x] Edges generated for all topology types
- [x] GraphCanvas renders nodes at correct positions
- [x] Edges display with hover effects
- [x] Backward compatibility maintained (flexbox still works)
- [x] No errors in console
- [x] Configuration validation works

### Phase 2 (Next) - Routing Logic

- [ ] Messages only sent to neighbors when `useGraphRouting = true`
- [ ] Multi-hop flooding works correctly
- [ ] Consensus reaches with 4-node ring (2 hops)
- [ ] Consensus fails with disconnected graph
- [ ] Proposer reachability checked before selection
- [ ] Vote threshold uses reachable node count

### Phase 3 (Next) - UI

- [ ] Topology selector changes graph type
- [ ] Edge editor allows adding/removing edges
- [ ] Configuration panel shows topology settings
- [ ] Preset configurations load correctly

---

## 🎓 Educational Value

This implementation demonstrates:

1. **Graph Theory Concepts:**

   - Connectivity, diameter, shortest paths
   - Reachability via BFS
   - Different graph topologies

2. **Distributed Systems:**

   - Gossip protocols (message flooding)
   - Partial failures (unreachable nodes)
   - Consensus in partitioned networks

3. **Software Architecture:**
   - Feature flags for safe migration
   - Backward compatibility
   - Separation of concerns (layout, routing, rendering)
   - Incremental refactoring

---

**Last Updated:** November 15, 2025  
**Phase 1 Status:** ✅ Complete  
**Phase 2 Status:** ⏳ Ready to Start  
**Overall Progress:** 40% Complete
