# Network Topology Configuration UI Guide

## Overview

You can now configure network topology and graph-based routing directly from the Configuration Panel UI!

## How to Access

1. Click the **⚙️ Configure** button in the main interface
2. Navigate to the **Network** tab
3. Scroll down to the **Network Topology** section

## Configuration Options

### 1. Topology Type

Select the network structure from the dropdown:

| Topology          | Description                          | Best For                          |
| ----------------- | ------------------------------------ | --------------------------------- |
| **Full Mesh**     | All nodes connected to all others    | Default, maximum connectivity     |
| **Ring**          | Circular chain (each node → next)    | Testing multi-hop propagation     |
| **Star**          | Hub-and-spoke (all nodes → node 1)   | Single point of failure scenarios |
| **Line**          | Sequential chain (1→2→3→4...)        | Maximum propagation delay         |
| **Random**        | Probabilistic connections            | Realistic network modeling        |
| **Random Degree** | Fixed number of connections per node | Balanced connectivity             |

### 2. Graph-Based Routing Toggle

**☑️ Enable Graph-Based Routing**

- **Unchecked (default)**: Broadcast mode - all nodes can communicate directly (original behavior)
- **Checked**: Graph routing - messages only travel along edges (partial connectivity)

**When to Enable:**

- Testing consensus on partially connected networks
- Demonstrating impact of network topology on consensus
- Simulating realistic peer-to-peer networks
- Educational demos showing distributed systems challenges

**When to Disable:**

- Testing basic Tendermint logic without topology constraints
- Maximum performance/speed
- Simplified visualization

### 3. Additional Parameters

#### For Random Topology:

**Edge Probability** (slider: 0-100%)

- Probability that any two nodes will be connected
- Lower values = sparser network
- Higher values = denser network (approaching full mesh)
- Example: 30% means each pair of nodes has 30% chance of connection

#### For Random Degree Topology:

**Node Degree** (input: 1-10)

- Number of connections each node will have
- Ensures consistent connectivity
- Example: degree=3 means each node connects to 3 others

## Quick Presets

### New: Graph Routing Preset

Click the **Graph Routing** button (blue) to load:

- 7 nodes in ring topology
- Graph-based routing **enabled**
- Longer timeouts for multi-hop propagation
- No Byzantine nodes (for clearer demonstration)

This preset is ready-to-use for testing graph routing features!

## Visual Indicators

When graph routing is enabled and topology is not full-mesh:

**ℹ️ Info Box Appears:**

```
Graph Routing Enabled: Messages will only propagate along
[topology-type] topology edges. Isolated nodes cannot
participate in consensus.
```

This warning reminds you that nodes need connectivity to participate!

## Example Configurations

### 1. Ring Topology with Graph Routing

```
Topology Type: Ring
Graph-Based Routing: ✅ Enabled

Result: Messages take multiple hops to reach opposite nodes
Educational Value: Shows multi-hop propagation delays
```

### 2. Star Topology with Byzantine Hub

```
Topology Type: Star
Graph-Based Routing: ✅ Enabled
Byzantine Nodes: 1 (Node 1 will be hub)

Result: Hub controls all communication
Educational Value: Demonstrates single point of failure
```

### 3. Random Sparse Network

```
Topology Type: Random
Edge Probability: 20%
Graph-Based Routing: ✅ Enabled

Result: May create isolated nodes or partitions
Educational Value: Shows impact of network fragmentation
```

### 4. Balanced Random Network

```
Topology Type: Random Degree
Node Degree: 3
Graph-Based Routing: ✅ Enabled

Result: Every node has exactly 3 connections
Educational Value: Predictable connectivity with partial network
```

## Testing Workflow

### Basic Test:

1. Open Configuration Panel
2. Go to Network tab
3. Change **Topology Type** to "Ring"
4. Enable **Graph-Based Routing** checkbox
5. Click **Apply Configuration**
6. Start consensus and observe multi-hop message propagation

### Advanced Test:

1. Select preset: **Graph Routing**
2. Optionally modify:
   - Change topology type (try Star or Line)
   - Adjust node count
   - Add Byzantine nodes
3. Apply and run
4. Use **Step-by-Step Mode** to see per-node rounds
5. Check **State Inspector** for individual node rounds

## Tips

### Performance Considerations

- **Ring/Line topologies**: Increase round timeout to allow multi-hop propagation
- **Sparse random topologies**: May create disconnected components
- **Star with Byzantine hub**: Peripheral nodes will be isolated if hub is Byzantine

### Debugging

- Enable graph routing and check console for messages like:
  ```
  [SIM] useGraphRouting: true
  Graph Routing: Proposer 1 can reach 7/7 nodes
  ```
- Use **GraphCanvas** view to visualize connections
- Check **Individual Node Rounds** section to see if nodes are progressing

### Common Issues

**Issue:** Consensus never completes

- **Cause:** Network is partitioned (disconnected components)
- **Solution:** Increase edge probability or use denser topology

**Issue:** Some nodes stuck at Round 0

- **Cause:** Nodes are isolated (no edges)
- **Solution:** Check topology visualization, ensure all nodes have connections

**Issue:** Unexpected failures with Byzantine nodes

- **Cause:** Byzantine node positioned at critical connection point
- **Solution:** This is expected! Demonstrates topology impact on fault tolerance

## Keyboard Shortcuts

While Configuration Panel is open:

- `Esc` - Close panel
- `Tab` - Navigate between fields
- `Enter` - Apply configuration (when focused on input)

## Saving Configurations

### Export Configuration

1. Configure topology settings
2. Click **Export** button
3. Save JSON file with your topology settings

### Import Configuration

1. Click **Import** button
2. Select previously exported JSON file
3. Topology settings will be loaded

## Advanced: Custom Topologies

For custom edge configurations, you can:

1. Export current config
2. Edit JSON file manually
3. Modify `network.edges` array
4. Import modified config

Example custom edge:

```json
{
  "source": 1,
  "target": 5,
  "latency": null,
  "packetLoss": null,
  "bidirectional": true
}
```

## Related Documentation

- `PHASE_2_IMPLEMENTATION.md` - Technical details of graph routing implementation
- `PER_NODE_ROUND_TRACKING.md` - How to track individual node rounds
- `GRAPH_QUICK_START.md` - Quick start guide for graph features

## Summary

The new topology UI provides:

- ✅ 6 topology types to choose from
- ✅ Graph routing toggle (broadcast vs. partial connectivity)
- ✅ Dynamic parameters (edge probability, node degree)
- ✅ Visual feedback and warnings
- ✅ Quick preset for graph routing demo
- ✅ Export/import for saving custom topologies

**You can now experiment with different network structures and see how topology affects consensus directly from the UI!**
