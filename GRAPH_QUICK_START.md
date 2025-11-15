# Graph-Based Network - Quick Start Guide

## 🚀 Quick Start

### Testing the Implementation (Current State)

1. **Default Mode (No Changes)**

   - System works exactly as before
   - Nodes displayed in flexbox grid
   - Fully connected broadcast

2. **Enable Graph Visualization Only**

   Edit `src/utils/ConfigManager.js`:

   ```javascript
   export const DEFAULT_CONFIG = {
     network: {
       topology: {
         type: "ring", // Try: ring, star, line, random
         useGraphRouting: false, // Keep false for now
       },
     },
   };
   ```

   **Result:** Nodes displayed as graph, but still uses broadcast logic

3. **Test Different Topologies**

   Available types:

   - `"full-mesh"` - All connected (original)
   - `"ring"` - Circular chain
   - `"star"` - Hub-and-spoke
   - `"line"` - Linear chain
   - `"random"` - Random edges (set `edgeProbability: 0.3`)
   - `"random-degree"` - Random with target degree (set `nodeDegree: 3`)

## 📁 File Structure

### New Files

```
src/
├── utils/
│   ├── GraphTopology.js         ✅ Topology generation & graph algorithms
│   └── MessageQueue.js          ✅ Message routing system
├── components/
│   └── GraphCanvas.jsx          ✅ SVG graph visualization
└── styles/
    └── GraphCanvas.css          ✅ Graph styling
```

### Modified Files

```
src/
├── utils/
│   ├── ConfigManager.js         ✅ Added topology config
│   └── NetworkSimulation.js    ✅ Initialize graph data
├── context/
│   └── ConsensusContext.jsx    ✅ Added edges state
└── components/
    └── ConsensusVisualizer.jsx ✅ Conditional rendering
```

## 🎯 Key Functions

### GraphTopology.js

```javascript
// Generate topology
const edges = buildTopology("ring", 4);

// Get neighbors
const neighbors = getNeighbors(nodeId, edges);

// Check reachability
const canReach = isReachable(node1, node2, edges);

// Find path
const path = findShortestPath(node1, node2, edges);

// Calculate layout
const positions = calculateCircularLayout(4);
const positions2 = calculateForceDirectedLayout(4, edges);
```

### MessageQueue.js

```javascript
// Create message
const msg = createMessage(sender, receiver, "prevote", {
  vote: true,
});

// Send to neighbor
const result = sendMessage(
  sender,
  receiver,
  "prevote",
  content,
  edges
);

// Flood network
const floodResult = floodMessage(
  origin,
  "proposal",
  block,
  nodes,
  edges,
  config
);
```

## 🔧 Configuration Options

### Topology Configuration

```javascript
network: {
  topology: {
    type: "ring",                // Topology type
    edgeProbability: 0.3,        // For random (0-1)
    nodeDegree: 2,               // For random-degree
    useGraphRouting: false,      // Feature flag
  },
  edges: [],                     // Custom edges (advanced)
}
```

### Edge Structure

```javascript
{
  source: 1,                     // Source node ID
  target: 2,                     // Target node ID
  latency: 100,                  // Edge latency (null = use global)
  packetLoss: 5,                 // Packet loss % (null = use global)
  bidirectional: true,           // Two-way edge
}
```

## 🎨 Visualization

### GraphCanvas Props

```javascript
<GraphCanvas
  nodes={nodes} // Array of nodes with position
  edges={edges} // Array of edges
  highlightedNodes={[1, 2]} // Node IDs to highlight
  width={800} // SVG width
  height={600} // SVG height
  showEdgeLabels={true} // Show latency on edges
  onNodeClick={(node) => {}} // Click handler
  onEdgeClick={(edge) => {}} // Click handler
/>
```

## ⚠️ Important Warnings

### DO NOT Enable `useGraphRouting: true` Yet

❌ **This will break consensus!**

The routing logic (Phase 2) is not implemented yet. If you enable it:

- Messages won't propagate correctly
- Consensus will fail
- Voting won't work

**Safe to do:**
✅ Change `topology.type` (visualization only)
✅ View different graph layouts
✅ Inspect node positions and edges

**Unsafe until Phase 2:**
❌ Set `useGraphRouting: true`
❌ Expect neighbor-aware routing

## 🧪 Testing Scenarios

### Scenario 1: Ring Visualization

```javascript
// ConfigManager.js
topology: { type: "ring", useGraphRouting: false }
```

**Expected:** 4 nodes in circle, each connected to next
**Behavior:** Still broadcasts to all (not just neighbors)

### Scenario 2: Star Visualization

```javascript
topology: { type: "star", useGraphRouting: false }
```

**Expected:** Node 1 in center, others around it
**Behavior:** Still broadcasts to all

### Scenario 3: Random Graph

```javascript
topology: {
  type: "random",
  edgeProbability: 0.4,
  useGraphRouting: false
}
```

**Expected:** Random edges between nodes
**Behavior:** Still broadcasts to all

## 📊 Debugging

### Check Node Structure

```javascript
console.log(nodes[0]);
// Expected output:
{
  id: 1,
  neighbors: [2, 4],           // ✅ Should be populated
  position: { x: 400, y: 100 }, // ✅ Should have coordinates
  inbox: [],                    // ✅ Should exist
  outbox: [],                   // ✅ Should exist
  // ... other fields
}
```

### Check Edges

```javascript
console.log(edges);
// Expected output for ring with 4 nodes:
[
  { source: 1, target: 2, bidirectional: true, ... },
  { source: 2, target: 3, bidirectional: true, ... },
  { source: 3, target: 4, bidirectional: true, ... },
  { source: 4, target: 1, bidirectional: true, ... },
]
```

### Verify Graph Statistics

```javascript
import { getGraphStatistics } from './utils/GraphTopology';

const stats = getGraphStatistics(4, edges);
console.log(stats);
// Expected for ring:
{
  nodeCount: 4,
  edgeCount: 4,
  avgDegree: "2.00",
  maxDegree: 2,
  minDegree: 2,
  isConnected: true,
  diameter: 2,              // Max hops between any two nodes
  density: "0.667"
}
```

## 🔄 Switching Topologies at Runtime

### Method 1: Edit Config (Reload Required)

```javascript
// src/utils/ConfigManager.js
export const DEFAULT_CONFIG = {
  network: {
    topology: { type: "star" }, // Change this
  },
};
```

### Method 2: Via Context (Dynamic)

```javascript
// In a component
const { setEdges, config } = useConsensus();

const changeTopology = (type) => {
  const newEdges = buildTopology(type, config.network.nodeCount);
  setEdges(newEdges);
};

// Usage
<button onClick={() => changeTopology("ring")}>Ring</button>
<button onClick={() => changeTopology("star")}>Star</button>
```

## 📈 Performance Notes

### Layout Calculation

- **Circular:** Instant (mathematical formula)
- **Force-Directed:** ~50ms for 10 nodes, ~200ms for 20 nodes
- **Configurable iterations:** Reduce for faster, increase for prettier

### Graph Algorithms

- **Get Neighbors:** O(E) where E = edge count
- **Reachability (BFS):** O(V + E) where V = nodes, E = edges
- **Shortest Path:** O(V + E)
- **All-Pairs Shortest Path:** O(V² × (V + E)) - expensive!

### Rendering

- **SVG Performance:** Good up to ~20 nodes, 50 edges
- **Optimization:** Use `shouldComponentUpdate` for Node components
- **Alternative:** Canvas API for >50 nodes (requires rewrite)

## 🎓 Understanding the Code

### How Nodes Get Positioned

```
initializeNetwork()
  → buildTopology() → edges[]
  → calculateCircularLayout()/calculateForceDirectedLayout() → positions[]
  → Create nodes with position field
```

### How Edges Are Rendered

```
GraphCanvas component
  → Map over edges[]
  → Find source & target nodes
  → Extract positions
  → Draw SVG <path> between positions
  → Add arrow marker for unidirectional
```

### Feature Flag Flow

```
useGraphRouting = false:
  → simulateConsensusStep() uses broadcast
  → All nodes receive messages
  → Original logic

useGraphRouting = true (Phase 2):
  → floodMessage() with neighbors
  → Multi-hop propagation
  → Reachability-based voting
```

## 🛠️ Common Tasks

### Add a New Topology Type

1. Edit `GraphTopology.js`:

   ```javascript
   case "my-topology":
     // Generate edges
     for (...) {
       edges.push({ source, target, ... });
     }
     break;
   ```

2. Update validation in `ConfigManager.js`:

   ```javascript
   const validTopologies = [..., "my-topology"];
   ```

3. Test:
   ```javascript
   topology: {
     type: "my-topology";
   }
   ```

### Customize Edge Appearance

Edit `GraphCanvas.jsx`:

```javascript
const getEdgeColor = (edge) => {
  if (edge.source === 1) return "#ff6b6b"; // Hub edges red
  return "#ccc";
};
```

### Add Edge Labels

```javascript
<GraphCanvas showEdgeLabels={true} />
```

Labels show latency by default. Customize in `GraphCanvas.jsx`.

## 📞 Support

### Issues? Check:

1. ✅ No console errors?
2. ✅ Nodes have `neighbors` and `position` fields?
3. ✅ Edges array populated?
4. ✅ GraphCanvas imported correctly?
5. ✅ `useGraphRouting` is `false`?

### Common Errors

**"Cannot read property 'x' of undefined"**
→ Node missing position. Check `initializeNetwork()`.

**"Edges not rendering"**
→ Check `edges` array in ConsensusContext. Should be populated.

**"Nodes overlapping in graph"**
→ Force-directed layout needs more iterations:

```javascript
calculateForceDirectedLayout(nodeCount, edges, {
  iterations: 100,
});
```

**"Consensus failing unexpectedly"**
→ Did you set `useGraphRouting: true`? Set it back to `false`.

---

**Next Steps:** Wait for Phase 2 implementation before enabling `useGraphRouting`.

**Questions?** Check `GRAPH_IMPLEMENTATION_STATUS.md` for detailed architecture.
