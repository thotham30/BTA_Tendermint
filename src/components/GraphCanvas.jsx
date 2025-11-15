// src/components/GraphCanvas.jsx
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Node from "./Node";
import "../styles/GraphCanvas.css";

/**
 * GraphCanvas - SVG-based graph visualization for nodes and edges
 * Replaces the flexbox node container with a graph layout
 */
const GraphCanvas = ({
  nodes = [],
  edges = [],
  highlightedNodes = [],
  width = 800,
  height = 600,
  onNodeClick = null,
  onEdgeClick = null,
  showEdgeLabels = false,
}) => {
  const svgRef = useRef(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  // Calculate edge path (straight line for now, can be curved later)
  const getEdgePath = (sourceNode, targetNode) => {
    if (!sourceNode || !targetNode) return "";

    const sourcePos = sourceNode.position || { x: 0, y: 0 };
    const targetPos = targetNode.position || { x: 0, y: 0 };

    return `M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`;
  };

  // Get midpoint for edge labels
  const getEdgeMidpoint = (sourceNode, targetNode) => {
    if (!sourceNode || !targetNode) return { x: 0, y: 0 };

    const sourcePos = sourceNode.position || { x: 0, y: 0 };
    const targetPos = targetNode.position || { x: 0, y: 0 };

    return {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2,
    };
  };

  // Get edge color based on state
  const getEdgeColor = (edge) => {
    if (hoveredEdge === edge) return "#4a90e2";
    return "#ccc";
  };

  // Get edge width
  const getEdgeWidth = (edge) => {
    if (hoveredEdge === edge) return 3;
    return 2;
  };

  // Render arrow marker for directed edges
  const renderArrowMarker = () => (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,6 L9,3 z" fill="#666" />
      </marker>
      <marker
        id="arrowhead-hover"
        markerWidth="10"
        markerHeight="10"
        refX="9"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,6 L9,3 z" fill="#4a90e2" />
      </marker>
    </defs>
  );

  return (
    <div className="graph-canvas-container">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="graph-canvas-svg"
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#fafafa",
        }}
      >
        {renderArrowMarker()}

        {/* Render edges first (behind nodes) */}
        <g className="edges-layer">
          {edges.map((edge, index) => {
            const sourceNode = nodes.find(
              (n) => n.id === edge.source
            );
            const targetNode = nodes.find(
              (n) => n.id === edge.target
            );

            if (!sourceNode || !targetNode) return null;

            const path = getEdgePath(sourceNode, targetNode);
            const midpoint = getEdgeMidpoint(
              sourceNode,
              targetNode
            );
            const isHovered = hoveredEdge === edge;
            const edgeKey = `${edge.source}-${edge.target}-${index}`;

            return (
              <g key={edgeKey}>
                {/* Edge line */}
                <path
                  d={path}
                  stroke={getEdgeColor(edge)}
                  strokeWidth={getEdgeWidth(edge)}
                  fill="none"
                  className="graph-edge"
                  style={{
                    cursor: onEdgeClick ? "pointer" : "default",
                    transition: "all 0.2s",
                  }}
                  markerEnd={
                    !edge.bidirectional
                      ? isHovered
                        ? "url(#arrowhead-hover)"
                        : "url(#arrowhead)"
                      : undefined
                  }
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={() =>
                    onEdgeClick && onEdgeClick(edge)
                  }
                />

                {/* Edge label (optional) */}
                {showEdgeLabels && (
                  <text
                    x={midpoint.x}
                    y={midpoint.y - 5}
                    fontSize="10"
                    fill="#666"
                    textAnchor="middle"
                    className="edge-label"
                  >
                    {edge.latency ? `${edge.latency}ms` : ""}
                  </text>
                )}

                {/* Bidirectional indicator */}
                {edge.bidirectional && isHovered && (
                  <text
                    x={midpoint.x}
                    y={midpoint.y + 15}
                    fontSize="10"
                    fill="#4a90e2"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    ↔
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Render nodes on top of edges */}
        <g className="nodes-layer">
          {nodes.map((node) => {
            const isHighlighted = highlightedNodes.includes(
              node.id
            );
            const position = node.position || { x: 400, y: 300 };

            return (
              <g key={node.id} className="graph-node-group">
                {/* Node highlight circle */}
                {isHighlighted && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="60"
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth="3"
                    className="node-highlight-circle"
                  />
                )}

                {/* Node component (wrapped in foreignObject for HTML rendering) */}
                <foreignObject
                  x={position.x - 50}
                  y={position.y - 50}
                  width="100"
                  height="100"
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      width: "100px",
                      height: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Node
                      node={node}
                      isHighlighted={isHighlighted}
                      onClick={() =>
                        onNodeClick && onNodeClick(node)
                      }
                    />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-line bidirectional"></div>
          <span>Bidirectional</span>
        </div>
        <div className="legend-item">
          <div className="legend-line unidirectional"></div>
          <span>Unidirectional</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-node"
            style={{ background: "#ccc" }}
          ></div>
          <span>Idle</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-node"
            style={{ background: "#f9c74f" }}
          ></div>
          <span>Voting</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-node"
            style={{ background: "#90be6d" }}
          ></div>
          <span>Committed</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-node"
            style={{ background: "#ff6b6b" }}
          ></div>
          <span>Byzantine</span>
        </div>
      </div>
    </div>
  );
};

export default GraphCanvas;
