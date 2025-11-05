import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  initializeNetwork,
  simulateConsensusStep,
} from "../utils/NetworkSimulation";
import {
  loadConfig,
  DEFAULT_CONFIG,
} from "../utils/ConfigManager";

const ConsensusContext = createContext();

export const ConsensusProvider = ({ children }) => {
  const [config, setConfig] = useState(
    loadConfig() || DEFAULT_CONFIG
  );
  const [nodes, setNodes] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [round, setRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [liveness, setLiveness] = useState(true);
  const [safety, setSafety] = useState(true);
  const [speed, setSpeed] = useState(1); // 1x speed by default
  const [logs, setLogs] = useState([]);

  // Voting state
  const [votingHistory, setVotingHistory] = useState([]);
  const [currentRoundVotes, setCurrentRoundVotes] =
    useState(null);
  const [showVotingDetails, setShowVotingDetails] =
    useState(true);
  const [showVotingHistory, setShowVotingHistory] =
    useState(false);
  const [selectedRoundForDetails, setSelectedRoundForDetails] =
    useState(null);

  useEffect(() => {
    const initialNodes = initializeNetwork(
      config.network.nodeCount,
      config
    );
    setNodes(initialNodes);
  }, [config.network.nodeCount]);

  const startConsensus = () => {
    setIsRunning(true);
    addLog("Consensus simulation started", "success");
  };

  const stopConsensus = () => {
    setIsRunning(false);
    addLog("Consensus simulation stopped", "warning");
  };

  const resetNetwork = () => {
    setNodes(
      initializeNetwork(config.network.nodeCount, config)
    );
    setBlocks([]);
    setRound(0);
    setLiveness(true);
    setSafety(true);
    setIsRunning(false);
    setLogs([]);
    setVotingHistory([]);
    setCurrentRoundVotes(null);
    setSelectedRoundForDetails(null);
    addLog("Network reset successfully", "info");
  };

  const loadNewConfig = (newConfig) => {
    setConfig(newConfig);
    setNodes(
      initializeNetwork(newConfig.network.nodeCount, newConfig)
    );
    setBlocks([]);
    setRound(0);
    setLiveness(true);
    setSafety(true);
    setIsRunning(false);
    setVotingHistory([]);
    setCurrentRoundVotes(null);
    setSelectedRoundForDetails(null);
    addLog(
      `Configuration "${newConfig.name}" applied`,
      "success"
    );
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  };

  const trackVote = (nodeId, vote, phase) => {
    if (currentRoundVotes) {
      setCurrentRoundVotes((prev) => {
        const updated = { ...prev };
        if (phase === "prevote") {
          updated.prevotesReceived[nodeId] = vote;
        } else if (phase === "precommit") {
          updated.precommitsReceived[nodeId] = vote;
        }
        return updated;
      });
    }
  };

  const updateCurrentRoundVotes = (votingRound) => {
    setCurrentRoundVotes(votingRound);
  };

  const finalizeRound = (votingRound) => {
    setVotingHistory((prev) => [...prev, votingRound]);
    setCurrentRoundVotes(null);
  };

  const toggleVotingDetails = () => {
    setShowVotingDetails((prev) => !prev);
  };

  const toggleVotingHistory = () => {
    setShowVotingHistory((prev) => !prev);
  };

  const selectRoundForDetails = (round) => {
    setSelectedRoundForDetails(round);
  };

  useEffect(() => {
    if (!isRunning) return;
    const baseDelay = config.consensus.roundTimeout || 1500; // Use config or default
    const interval = setInterval(() => {
      const {
        updatedNodes,
        newBlock,
        newLiveness,
        newSafety,
        votingRound,
      } = simulateConsensusStep(nodes, blocks, config, {
        updateCurrentRoundVotes,
        finalizeRound,
        addLog,
      });
      setNodes(updatedNodes);
      if (newBlock) {
        setBlocks((prev) => [...prev, newBlock]);
        addLog(
          `Block #${newBlock.height} proposed by Node ${newBlock.proposer}`,
          "block"
        );

        // Log voting results
        if (votingRound) {
          addLog(
            `Prevotes: ${votingRound.prevoteCount}/${
              Object.keys(votingRound.prevotesReceived).length
            } (Threshold ${
              votingRound.prevoteThresholdMet ? "MET" : "NOT MET"
            })`,
            votingRound.prevoteThresholdMet
              ? "success"
              : "warning"
          );
          addLog(
            `Precommits: ${votingRound.precommitCount}/${
              Object.keys(votingRound.precommitsReceived).length
            } (Threshold ${
              votingRound.precommitThresholdMet
                ? "MET"
                : "NOT MET"
            })`,
            votingRound.precommitThresholdMet
              ? "success"
              : "warning"
          );
        }
      }
      setRound((prev) => prev + 1);

      if (newLiveness !== liveness) {
        addLog(
          `Liveness ${
            newLiveness ? "✓ Confirmed" : "✗ Violated"
          }`,
          newLiveness ? "success" : "error"
        );
        setLiveness(newLiveness);
      } else {
        setLiveness(newLiveness);
      }

      if (newSafety !== safety) {
        addLog(
          `Safety ${newSafety ? "✓ Confirmed" : "✗ Violated"}`,
          newSafety ? "success" : "error"
        );
        setSafety(newSafety);
      } else {
        setSafety(newSafety);
      }

      if (config.simulation.logLevel !== "minimal") {
        addLog(
          `Round ${Math.floor(
            Date.now() / 1000
          )}: Consensus step executed`,
          "info"
        );
      }
    }, baseDelay / speed);

    return () => clearInterval(interval);
  }, [
    isRunning,
    nodes,
    blocks,
    speed,
    liveness,
    safety,
    config,
  ]);

  return (
    <ConsensusContext.Provider
      value={{
        config,
        nodes,
        blocks,
        round,
        liveness,
        safety,
        isRunning,
        speed,
        logs,
        votingHistory,
        currentRoundVotes,
        showVotingDetails,
        showVotingHistory,
        selectedRoundForDetails,
        startConsensus,
        stopConsensus,
        resetNetwork,
        changeSpeed,
        addLog,
        loadNewConfig,
        trackVote,
        updateCurrentRoundVotes,
        finalizeRound,
        toggleVotingDetails,
        toggleVotingHistory,
        selectRoundForDetails,
      }}
    >
      {children}
    </ConsensusContext.Provider>
  );
};

export const useConsensus = () => useContext(ConsensusContext);
