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
  TIMEOUT_LIMITS,
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

  // Timeout state - initialize from config
  const [roundStartTime, setRoundStartTime] = useState(
    Date.now()
  );
  const [timeoutDuration, setTimeoutDuration] = useState(
    config.consensus.roundTimeout || 5000
  );
  const [baseTimeoutDuration, setBaseTimeoutDuration] = useState(
    config.consensus.roundTimeout || 5000
  );
  const [timeoutMultiplier, setTimeoutMultiplier] = useState(
    config.consensus.timeoutMultiplier || 1.5
  );
  const [roundTimeouts, setRoundTimeouts] = useState(0);
  const [consecutiveTimeouts, setConsecutiveTimeouts] =
    useState(0);
  const [timeoutEscalationEnabled, setTimeoutEscalationEnabled] =
    useState(
      config.consensus.timeoutEscalationEnabled !== false
    );
  const [timeoutHistory, setTimeoutHistory] = useState([]);
  const [currentProposer, setCurrentProposer] = useState(null);

  // Voting state
  const [votingHistory, setVotingHistory] = useState([]);
  const [currentRoundVotes, setCurrentRoundVotes] =
    useState(null);
  const [showVotingDetails, setShowVotingDetails] =
    useState(false);
  const [showVotingHistory, setShowVotingHistory] =
    useState(false);
  const [selectedRoundForDetails, setSelectedRoundForDetails] =
    useState(null);

  // Step-by-Step Mode State
  const [stepMode, setStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepHistory, setStepHistory] = useState([]);
  const [stepDescription, setStepDescription] =
    useState("Ready to start");
  const [autoPlaySteps, setAutoPlaySteps] = useState(false);
  const [stepState, setStepState] = useState(null); // Current step's detailed state
  const [highlightedNodes, setHighlightedNodes] = useState([]);

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
    // Reset timeout state
    setRoundStartTime(Date.now());
    setTimeoutDuration(baseTimeoutDuration);
    setRoundTimeouts(0);
    setConsecutiveTimeouts(0);
    setTimeoutHistory([]);
    setCurrentProposer(null);
    // Reset step mode state
    setCurrentStep(0);
    setStepHistory([]);
    setStepDescription("Ready to start");
    setStepState(null);
    setHighlightedNodes([]);
    addLog("Network reset successfully", "info");
  };

  const loadNewConfig = (newConfig) => {
    setConfig(newConfig);

    // Update timeout settings from new config
    const newBaseTimeout =
      newConfig.consensus.roundTimeout || 5000;
    const newMultiplier =
      newConfig.consensus.timeoutMultiplier || 1.5;
    const newEscalation =
      newConfig.consensus.timeoutEscalationEnabled !== false;

    setBaseTimeoutDuration(newBaseTimeout);
    setTimeoutDuration(newBaseTimeout);
    setTimeoutMultiplier(newMultiplier);
    setTimeoutEscalationEnabled(newEscalation);

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
    setRoundTimeouts(0);
    setConsecutiveTimeouts(0);
    setTimeoutHistory([]);
    setCurrentProposer(null);
    addLog(
      `Configuration "${newConfig.name}" applied`,
      "success"
    );
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };

  const updateTimeoutSettings = (
    duration,
    multiplier,
    escalationEnabled
  ) => {
    if (duration !== undefined) setTimeoutDuration(duration);
    if (multiplier !== undefined)
      setTimeoutMultiplier(multiplier);
    if (escalationEnabled !== undefined)
      setTimeoutEscalationEnabled(escalationEnabled);
  };

  const handleRoundTimeout = () => {
    const newTimeouts = roundTimeouts + 1;
    const newConsecutiveTimeouts = consecutiveTimeouts + 1;

    setRoundTimeouts(newTimeouts);
    setConsecutiveTimeouts(newConsecutiveTimeouts);

    // Record timeout event
    const timeoutEvent = {
      round,
      timestamp: Date.now(),
      duration: timeoutDuration,
      escalationLevel: newConsecutiveTimeouts,
      proposer: currentProposer,
    };
    setTimeoutHistory((prev) => [...prev, timeoutEvent]);

    // Apply exponential backoff if escalation is enabled
    if (timeoutEscalationEnabled) {
      const newTimeout = Math.min(
        timeoutDuration * timeoutMultiplier,
        TIMEOUT_LIMITS.maxTimeout
      );
      setTimeoutDuration(newTimeout);
      addLog(
        `Round ${round} timeout! Escalating timeout to ${Math.round(
          newTimeout
        )}ms (${newConsecutiveTimeouts}${
          newConsecutiveTimeouts === 1
            ? "st"
            : newConsecutiveTimeouts === 2
            ? "nd"
            : newConsecutiveTimeouts === 3
            ? "rd"
            : "th"
        } consecutive timeout)`,
        "warning"
      );
    } else {
      addLog(
        `Round ${round} timeout! Moving to next proposer`,
        "warning"
      );
    }

    // Reset round start time for new proposer
    setRoundStartTime(Date.now());
  };

  const handleSuccessfulCommit = () => {
    // Reset timeout duration and consecutive count on successful block commit
    if (consecutiveTimeouts > 0) {
      addLog(
        `Block committed! Resetting timeout duration to ${baseTimeoutDuration}ms`,
        "success"
      );
    }
    setTimeoutDuration(baseTimeoutDuration);
    setConsecutiveTimeouts(0);
    setRoundStartTime(Date.now());
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

  // Step-by-Step Mode Functions
  const toggleStepMode = () => {
    const newStepMode = !stepMode;
    setStepMode(newStepMode);

    if (newStepMode) {
      // Entering step mode - pause if running
      if (isRunning) {
        setIsRunning(false);
      }
      setCurrentStep(0);
      setStepDescription(
        "Round Start - Ready to begin consensus"
      );
      addLog("Switched to Step-by-Step Mode", "info");
    } else {
      // Exiting step mode
      setCurrentStep(0);
      setStepHistory([]);
      setStepState(null);
      setHighlightedNodes([]);
      addLog("Switched to Continuous Mode", "info");
    }
  };

  const nextStep = () => {
    if (!stepMode) return;

    // Save current state to history
    const historyEntry = {
      step: currentStep,
      nodes: [...nodes],
      blocks: [...blocks],
      round,
      description: stepDescription,
      stepState,
      timestamp: Date.now(),
    };
    setStepHistory((prev) => [...prev, historyEntry]);

    // Move to next step
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    if (!stepMode || stepHistory.length === 0) return;

    // Pop the last state from history
    const lastState = stepHistory[stepHistory.length - 1];
    setNodes(lastState.nodes);
    setBlocks(lastState.blocks);
    setRound(lastState.round);
    setCurrentStep(lastState.step);
    setStepDescription(lastState.description);
    setStepState(lastState.stepState);

    // Remove from history
    setStepHistory((prev) => prev.slice(0, -1));
    addLog(`Reverted to step ${lastState.step}`, "info");
  };

  const goToRoundStart = () => {
    if (!stepMode) return;

    setCurrentStep(0);
    setStepDescription("Round Start - Ready to begin consensus");
    setStepState(null);
    setHighlightedNodes([]);
    addLog("Returned to round start", "info");
  };

  const toggleAutoPlaySteps = () => {
    setAutoPlaySteps((prev) => !prev);
  };

  const updateStepState = (state) => {
    setStepState(state);
  };

  const updateStepDescription = (description) => {
    setStepDescription(description);
  };

  const updateHighlightedNodes = (nodeIds) => {
    setHighlightedNodes(nodeIds);
  };

  const updateNodes = (newNodes) => {
    setNodes(newNodes);
  };

  const addBlock = (newBlock) => {
    setBlocks((prev) => [...prev, newBlock]);
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
        timedOut,
        newProposer,
      } = simulateConsensusStep(nodes, blocks, config, {
        updateCurrentRoundVotes,
        finalizeRound,
        addLog,
        roundStartTime,
        timeoutDuration,
        handleRoundTimeout,
        currentRound: round,
      });

      setNodes(updatedNodes);

      // Update current proposer
      if (newProposer) {
        setCurrentProposer(newProposer);
      }

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

        // Handle successful commit
        handleSuccessfulCommit();
      } else if (timedOut) {
        // Timeout occurred but no new block
        // The handleRoundTimeout was already called in simulateConsensusStep
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
    roundStartTime,
    timeoutDuration,
    round,
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
        // Timeout-related state
        roundStartTime,
        timeoutDuration,
        baseTimeoutDuration,
        timeoutMultiplier,
        roundTimeouts,
        consecutiveTimeouts,
        timeoutEscalationEnabled,
        timeoutHistory,
        currentProposer,
        // Step-by-Step Mode state
        stepMode,
        currentStep,
        stepHistory,
        stepDescription,
        autoPlaySteps,
        stepState,
        highlightedNodes,
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
        // Timeout-related functions
        updateTimeoutSettings,
        handleRoundTimeout,
        handleSuccessfulCommit,
        // Step-by-Step Mode functions
        toggleStepMode,
        nextStep,
        previousStep,
        goToRoundStart,
        toggleAutoPlaySteps,
        updateStepState,
        updateStepDescription,
        updateHighlightedNodes,
        updateNodes,
        addBlock,
      }}
    >
      {children}
    </ConsensusContext.Provider>
  );
};

export const useConsensus = () => useContext(ConsensusContext);
