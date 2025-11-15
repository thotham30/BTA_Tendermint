// src/utils/GraphTopology.js
// Graph topology generation and utility functions for partially connected networks

/**
 * Edge representation in the graph
 * @typedef {Object} Edge
 * @property {number} source - Source node ID
 * @property {number} target - Target node ID
 * @property {number} latency - Edge-specific latency in ms (default: use global)
 * @property {number} packetLoss - Edge-specific packet loss 0-100% (default: use global)
 * @property {boolean} bidirectional - Whether edge is bidirectional (default: true)
 */

/**
 * Position in 2D space for graph layout
 * @typedef {Object} Position
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * Build a graph topology based on type and configuration
 * @param {string} type - Topology type: "full-mesh", "ring", "star", "random", "custom"
 * @param {number} nodeCount - Number of nodes in the graph
 * @param {Object} options - Additional options
 * @param {number} options.edgeProbability - Probability of edge in random graph (0-1)
 * @param {number} options.nodeDegree - Target average degree for random graph
 * @param {Edge[]} options.customEdges - Custom edges for "custom" topology
 * @returns {Edge[]} Array of edges
 */
export function buildTopology(type, nodeCount, options = {}) {
  const edges = [];
  const {
    edgeProbability = 0.3,
    nodeDegree = 2,
    customEdges = [],
  } = options;

  switch (type) {
    case "full-mesh":
      // Fully connected graph - all nodes connected to all others
      for (let i = 1; i <= nodeCount; i++) {
        for (let j = i + 1; j <= nodeCount; j++) {
          edges.push({
            source: i,
            target: j,
            latency: null, // Use global latency
            packetLoss: null, // Use global packet loss
            bidirectional: true,
          });
        }
      }
      break;

    case "ring":
      // Ring topology - each node connected to next (circular)
      for (let i = 1; i <= nodeCount; i++) {
        const next = (i % nodeCount) + 1;
        edges.push({
          source: i,
          target: next,
          latency: null,
          packetLoss: null,
          bidirectional: true,
        });
      }
      break;

    case "star":
      // Star topology - all nodes connected to node 1 (hub)
      const hub = 1;
      for (let i = 2; i <= nodeCount; i++) {
        edges.push({
          source: hub,
          target: i,
          latency: null,
          packetLoss: null,
          bidirectional: true,
        });
      }
      break;

    case "line":
      // Line topology - nodes connected in sequence (no loop)
      for (let i = 1; i < nodeCount; i++) {
        edges.push({
          source: i,
          target: i + 1,
          latency: null,
          packetLoss: null,
          bidirectional: true,
        });
      }
      break;

    case "random":
      // Random graph - edges added with probability
      for (let i = 1; i <= nodeCount; i++) {
        for (let j = i + 1; j <= nodeCount; j++) {
          if (Math.random() < edgeProbability) {
            edges.push({
              source: i,
              target: j,
              latency: null,
              packetLoss: null,
              bidirectional: true,
            });
          }
        }
      }
      break;

    case "random-degree":
      // Random graph with target average degree
      const targetEdges = Math.floor(
        (nodeCount * nodeDegree) / 2
      );
      const possibleEdges = [];

      // Generate all possible edges
      for (let i = 1; i <= nodeCount; i++) {
        for (let j = i + 1; j <= nodeCount; j++) {
          possibleEdges.push([i, j]);
        }
      }

      // Shuffle and take first targetEdges
      for (let i = possibleEdges.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [possibleEdges[i], possibleEdges[j]] = [
          possibleEdges[j],
          possibleEdges[i],
        ];
      }

      const selectedEdges = possibleEdges.slice(0, targetEdges);
      selectedEdges.forEach(([source, target]) => {
        edges.push({
          source,
          target,
          latency: null,
          packetLoss: null,
          bidirectional: true,
        });
      });
      break;

    case "custom":
      // Custom topology - use provided edges
      return customEdges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        latency: edge.latency ?? null,
        packetLoss: edge.packetLoss ?? null,
        bidirectional: edge.bidirectional ?? true,
      }));

    default:
      console.warn(
        `Unknown topology type: ${type}, defaulting to full-mesh`
      );
      return buildTopology("full-mesh", nodeCount, options);
  }

  return edges;
}

/**
 * Get all neighbors (directly connected nodes) for a given node
 * @param {number} nodeId - Node ID to find neighbors for
 * @param {Edge[]} edges - Array of edges
 * @returns {number[]} Array of neighbor node IDs
 */
export function getNeighbors(nodeId, edges) {
  const neighbors = new Set();

  edges.forEach((edge) => {
    if (edge.source === nodeId) {
      neighbors.add(edge.target);
    }
    if (edge.bidirectional && edge.target === nodeId) {
      neighbors.add(edge.source);
    }
    // For unidirectional edges, only source can reach target
    if (!edge.bidirectional && edge.target === nodeId) {
      // Don't add anything - target can't reach source
    }
  });

  return Array.from(neighbors);
}

/**
 * Check if there's a path between two nodes (reachability via BFS)
 * @param {number} sourceId - Source node ID
 * @param {number} targetId - Target node ID
 * @param {Edge[]} edges - Array of edges
 * @param {number} nodeCount - Total number of nodes
 * @returns {boolean} True if target is reachable from source
 */
export function isReachable(
  sourceId,
  targetId,
  edges,
  nodeCount
) {
  if (sourceId === targetId) return true;

  const visited = new Set();
  const queue = [sourceId];
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getNeighbors(current, edges);

    for (const neighbor of neighbors) {
      if (neighbor === targetId) return true;

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

/**
 * Get all nodes reachable from a given node (BFS traversal)
 * @param {number} nodeId - Starting node ID
 * @param {Edge[]} edges - Array of edges
 * @returns {Set<number>} Set of reachable node IDs (including nodeId itself)
 */
export function getReachableNodes(nodeId, edges) {
  const reachable = new Set([nodeId]);
  const queue = [nodeId];
  const visited = new Set([nodeId]);

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getNeighbors(current, edges);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        reachable.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return reachable;
}

/**
 * Find shortest path between two nodes (returns node IDs in path)
 * @param {number} sourceId - Source node ID
 * @param {number} targetId - Target node ID
 * @param {Edge[]} edges - Array of edges
 * @returns {number[]|null} Array of node IDs in path, or null if no path exists
 */
export function findShortestPath(sourceId, targetId, edges) {
  if (sourceId === targetId) return [sourceId];

  const visited = new Set();
  const queue = [[sourceId]];
  visited.add(sourceId);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    const neighbors = getNeighbors(current, edges);

    for (const neighbor of neighbors) {
      if (neighbor === targetId) {
        return [...path, neighbor];
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null; // No path found
}

/**
 * Calculate circular layout positions for nodes
 * @param {number} nodeCount - Number of nodes
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} radius - Radius of circle
 * @returns {Position[]} Array of positions (1-indexed, [0] is null)
 */
export function calculateCircularLayout(
  nodeCount,
  centerX = 400,
  centerY = 300,
  radius = 200
) {
  const positions = [null]; // Index 0 unused (nodes are 1-indexed)

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2; // Start at top
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  return positions;
}

/**
 * Calculate force-directed layout positions (simplified spring model)
 * @param {number} nodeCount - Number of nodes
 * @param {Edge[]} edges - Array of edges
 * @param {Object} options - Layout options
 * @returns {Position[]} Array of positions (1-indexed, [0] is null)
 */
export function calculateForceDirectedLayout(
  nodeCount,
  edges,
  options = {}
) {
  const {
    width = 800,
    height = 600,
    iterations = 100,
    springLength = 100,
    springStrength = 0.01,
    repulsionStrength = 1000,
  } = options;

  // Initialize random positions
  const positions = [null];
  for (let i = 1; i <= nodeCount; i++) {
    positions.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
    });
  }

  // Build adjacency for faster lookup
  const adjacency = new Map();
  for (let i = 1; i <= nodeCount; i++) {
    adjacency.set(i, getNeighbors(i, edges));
  }

  // Simulation loop
  for (let iter = 0; iter < iterations; iter++) {
    // Calculate forces
    const forces = Array(nodeCount + 1)
      .fill(null)
      .map(() => ({ x: 0, y: 0 }));

    // Repulsion between all nodes
    for (let i = 1; i <= nodeCount; i++) {
      for (let j = i + 1; j <= nodeCount; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsionStrength / (distance * distance);

        forces[i].x -= (dx / distance) * force;
        forces[i].y -= (dy / distance) * force;
        forces[j].x += (dx / distance) * force;
        forces[j].y += (dy / distance) * force;
      }
    }

    // Spring attraction for connected nodes
    edges.forEach((edge) => {
      const { source, target } = edge;
      const dx = positions[target].x - positions[source].x;
      const dy = positions[target].y - positions[source].y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = springStrength * (distance - springLength);

      forces[source].x += (dx / distance) * force;
      forces[source].y += (dy / distance) * force;
      forces[target].x -= (dx / distance) * force;
      forces[target].y -= (dy / distance) * force;
    });

    // Apply forces with damping
    const damping = 0.8;
    for (let i = 1; i <= nodeCount; i++) {
      positions[i].vx =
        (positions[i].vx + forces[i].x) * damping;
      positions[i].vy =
        (positions[i].vy + forces[i].y) * damping;
      positions[i].x += positions[i].vx;
      positions[i].y += positions[i].vy;

      // Keep within bounds
      positions[i].x = Math.max(
        50,
        Math.min(width - 50, positions[i].x)
      );
      positions[i].y = Math.max(
        50,
        Math.min(height - 50, positions[i].y)
      );
    }
  }

  // Clean up velocity properties
  return positions.map((pos) =>
    pos ? { x: pos.x, y: pos.y } : null
  );
}

/**
 * Get graph statistics
 * @param {number} nodeCount - Number of nodes
 * @param {Edge[]} edges - Array of edges
 * @returns {Object} Graph statistics
 */
export function getGraphStatistics(nodeCount, edges) {
  // Calculate node degrees
  const degrees = Array(nodeCount + 1).fill(0);
  edges.forEach((edge) => {
    degrees[edge.source]++;
    if (edge.bidirectional) {
      degrees[edge.target]++;
    } else {
      // Unidirectional edge only counts for source
    }
  });

  const validDegrees = degrees.slice(1); // Remove index 0
  const avgDegree =
    validDegrees.reduce((a, b) => a + b, 0) / nodeCount;
  const maxDegree = Math.max(...validDegrees);
  const minDegree = Math.min(...validDegrees);

  // Calculate connectivity (is graph connected?)
  const reachableFromNode1 = getReachableNodes(1, edges);
  const isConnected = reachableFromNode1.size === nodeCount;

  // Calculate diameter (longest shortest path)
  let diameter = 0;
  if (isConnected) {
    for (let i = 1; i <= nodeCount; i++) {
      for (let j = i + 1; j <= nodeCount; j++) {
        const path = findShortestPath(i, j, edges);
        if (path) {
          diameter = Math.max(diameter, path.length - 1);
        }
      }
    }
  }

  return {
    nodeCount,
    edgeCount: edges.length,
    avgDegree: avgDegree.toFixed(2),
    maxDegree,
    minDegree,
    isConnected,
    diameter: isConnected ? diameter : Infinity,
    density: (
      (2 * edges.length) /
      (nodeCount * (nodeCount - 1))
    ).toFixed(3),
  };
}

/**
 * Add an edge to the graph
 * @param {Edge[]} edges - Current edges
 * @param {number} source - Source node ID
 * @param {number} target - Target node ID
 * @param {Object} options - Edge options
 * @returns {Edge[]} New edges array
 */
export function addEdge(edges, source, target, options = {}) {
  // Check if edge already exists
  const exists = edges.some(
    (e) =>
      (e.source === source && e.target === target) ||
      (e.bidirectional &&
        e.source === target &&
        e.target === source)
  );

  if (exists) {
    console.warn(
      `Edge already exists between nodes ${source} and ${target}`
    );
    return edges;
  }

  const newEdge = {
    source,
    target,
    latency: options.latency ?? null,
    packetLoss: options.packetLoss ?? null,
    bidirectional: options.bidirectional ?? true,
  };

  return [...edges, newEdge];
}

/**
 * Remove an edge from the graph
 * @param {Edge[]} edges - Current edges
 * @param {number} source - Source node ID
 * @param {number} target - Target node ID
 * @returns {Edge[]} New edges array
 */
export function removeEdge(edges, source, target) {
  return edges.filter(
    (e) =>
      !(
        (e.source === source && e.target === target) ||
        (e.bidirectional &&
          e.source === target &&
          e.target === source)
      )
  );
}

/**
 * Toggle edge bidirectionality
 * @param {Edge[]} edges - Current edges
 * @param {number} source - Source node ID
 * @param {number} target - Target node ID
 * @returns {Edge[]} New edges array
 */
export function toggleEdgeBidirectional(edges, source, target) {
  return edges.map((e) => {
    if (
      (e.source === source && e.target === target) ||
      (e.source === target && e.target === source)
    ) {
      return { ...e, bidirectional: !e.bidirectional };
    }
    return e;
  });
}
