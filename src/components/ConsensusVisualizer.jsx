import React from "react";
import { motion } from "framer-motion";
import Node from "./Node";
import Block from "./Block";
import { useConsensus } from "../context/ConsensusContext";
import "../styles/Visualizer.css";

export default function ConsensusVisualizer() {
  const { nodes, blocks, round } = useConsensus();

  return (
    <div className="visualizer-container">
      <h2>Consensus Round: {round}</h2>

      <div className="nodes-container">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Node node={node} />
          </motion.div>
        ))}
      </div>

      <div className="blocks-container">
        <h3>Committed Blocks</h3>
        <div className="blocks-scroll">
          {blocks.map((block, idx) => (
            <Block key={idx} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}
