import React from "react";
import { motion } from "framer-motion";

export default function Node({ node }) {
  const { id, state, color } = node;

  return (
    <motion.div
      className="node"
      style={{ backgroundColor: color }}
      whileHover={{ scale: 1.1 }}
    >
      <div className="node-id">Node {id}</div>
      <div className="node-state">{state}</div>
    </motion.div>
  );
}
