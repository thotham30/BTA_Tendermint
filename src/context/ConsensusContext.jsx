import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeNetwork, simulateConsensusStep } from "../utils/NetworkSimulation";

const ConsensusContext = createContext();

export const ConsensusProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [round, setRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [liveness, setLiveness] = useState(true);
  const [safety, setSafety] = useState(true);

  useEffect(() => {
    const initialNodes = initializeNetwork(4);
    setNodes(initialNodes);
  }, []);

  const startConsensus = () => {
    setIsRunning(true);
  };

  const stopConsensus = () => {
    setIsRunning(false);
  };

  const resetNetwork = () => {
    setNodes(initializeNetwork(4));
    setBlocks([]);
    setRound(0);
    setLiveness(true);
    setSafety(true);
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const { updatedNodes, newBlock, newLiveness, newSafety } =
        simulateConsensusStep(nodes, blocks);
      setNodes(updatedNodes);
      if (newBlock) setBlocks((prev) => [...prev, newBlock]);
      setRound((prev) => prev + 1);
      setLiveness(newLiveness);
      setSafety(newSafety);
    }, 1500);

    return () => clearInterval(interval);
  }, [isRunning, nodes, blocks]);

  return (
    <ConsensusContext.Provider
      value={{
        nodes,
        blocks,
        round,
        liveness,
        safety,
        isRunning,
        startConsensus,
        stopConsensus,
        resetNetwork,
      }}
    >
      {children}
    </ConsensusContext.Provider>
  );
};

export const useConsensus = () => useContext(ConsensusContext);
