// src/context/ConsensusContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
import { buildTopology } from "../utils/GraphTopology";

const ConsensusContext = createContext();

export const ConsensusProvider = ({ children }) => {
  // --------------------------
  // Core state
  // --------------------------
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

  // Graph topology state
  const [edges, setEdges] = useState([]);
  const [useGraphRouting, setUseGraphRouting] = useState(
    config?.network?.topology?.useGraphRouting || false
  );

  // Timeout state - initialize from config
  const [roundStartTime, setRoundStartTime] = useState(
    Date.now()
  );
  const [timeoutDuration, setTimeoutDuration] = useState(
    config.consensus.roundTimeout || 5000
  );
  const [baseTimeoutDuration, setBaseTimeoutDuration] = useState(
    config.consensus.roundTimeout || 15000
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
  const [stepState, setStepState] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [stepModeRound, setStepModeRound] = useState(0);

  // Network Partition State
  const [partitionActive, setPartitionActive] = useState(false);
  const [partitionedNodes, setPartitionedNodes] = useState([]);
  const [partitionType, setPartitionType] = useState("single");
  const [networkStats, setNetworkStats] = useState({
    messagesSent: 0,
    messagesDelivered: 0,
    messagesLost: 0,
  });

  // Network Mode State (synchronous vs asynchronous)
  const [isSynchronousMode, setIsSynchronousMode] =
    useState(true);

  // Quorum Certificate State
  const [qcHistory, setQcHistory] = useState([]);

  // Consistency checker state
  const [consistencyMaintained, setConsistencyMaintained] =
    useState(true);
  const [consistencyViolations, setConsistencyViolations] =
    useState([]); // [{ height, hashes: [...], source, blocks/rounds }]

  // --------------------------
  // Helpers: ID normalization
  // --------------------------
  const normalizeId = useCallback((id) => {
    if (id === undefined || id === null) return "";
    const asNum = Number(id);
    if (Number.isNaN(asNum)) return String(id);
    return String(asNum);
  }, []);

  const normalizeMapKeys = useCallback(
    (map = {}) => {
      const out = {};
      Object.entries(map || {}).forEach(([k, v]) => {
        out[normalizeId(k)] = v;
      });
      return out;
    },
    [normalizeId]
  );

  // --------------------------
  // Initialize nodes and edges
  // --------------------------
  useEffect(() => {
    const initialNodes = initializeNetwork(
      config.network.nodeCount,
      config
    );
    setNodes(initialNodes);

    // Initialize edges based on topology
    const topology = config?.network?.topology || {
      type: "full-mesh",
    };
    const initialEdges =
      config?.network?.edges && config.network.edges.length > 0
        ? config.network.edges
        : buildTopology(
            topology.type,
            config.network.nodeCount,
            {
              edgeProbability: topology.edgeProbability,
              nodeDegree: topology.nodeDegree,
            }
          );
    setEdges(initialEdges);

    // Set graph routing flag
    setUseGraphRouting(topology.useGraphRouting || false);
  }, [config.network.nodeCount, config.network.topology?.type]);

  // --------------------------
  // Logs & helpers
  // --------------------------
  const addLog = useCallback((message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  }, []);

  // --------------------------
  // Voting helpers & safety
  // --------------------------
  const buildEmptyVotingRound = useCallback(
    (roundNumber) => {
      const prevotesReceived = {};
      const precommitsReceived = {};
      (nodes || []).forEach((n) => {
        const nid = normalizeId(n.id);
        prevotesReceived[nid] = null;
        precommitsReceived[nid] = null;
      });

      return {
        roundNumber: roundNumber ?? round,
        roundHeight: blocks.length
          ? blocks[blocks.length - 1].height + 1
          : 1,
        timestamp: Date.now(),
        prevotesReceived,
        precommitsReceived,
        prevoteCount: 0,
        precommitCount: 0,
        prevoteThresholdMet: false,
        precommitThresholdMet: false,
      };
    },
    [nodes, normalizeId, blocks, round]
  );

  const trackVote = useCallback(
    (nodeId, vote, phase, roundNumber = round) => {
      const nid = normalizeId(nodeId);

      setCurrentRoundVotes((prev) => {
        const voting =
          prev && prev.roundNumber === roundNumber
            ? { ...prev }
            : buildEmptyVotingRound(roundNumber);

        voting.prevotesReceived = normalizeMapKeys(
          voting.prevotesReceived
        );
        voting.precommitsReceived = normalizeMapKeys(
          voting.precommitsReceived
        );

        if (!(nid in voting.prevotesReceived)) {
          voting.prevotesReceived[nid] = null;
        }
        if (!(nid in voting.precommitsReceived)) {
          voting.precommitsReceived[nid] = null;
        }

        if (phase === "prevote") {
          voting.prevotesReceived[nid] = vote;
          voting.prevoteCount = Object.values(
            voting.prevotesReceived
          ).filter((v) => v === true).length;
        } else if (phase === "precommit") {
          voting.precommitsReceived[nid] = vote;
          voting.precommitCount = Object.values(
            voting.precommitsReceived
          ).filter((v) => v === true).length;
        }

        const totalNodes =
          Object.keys(voting.prevotesReceived).length ||
          (nodes || []).length ||
          1;
        const voteThreshold =
          config?.consensus?.voteThreshold || 2 / 3;
        const requiredVotes = Math.ceil(
          totalNodes * voteThreshold
        );

        voting.prevoteThresholdMet =
          voting.prevoteCount >= requiredVotes;
        voting.precommitThresholdMet =
          voting.precommitCount >= requiredVotes;

        console.log(
          `[TRACK_VOTE] round=${voting.roundNumber} node=${nid} phase=${phase} vote=${vote} prevoteCount=${voting.prevoteCount} precommitCount=${voting.precommitCount} required=${requiredVotes}`
        );

        return voting;
      });
    },
    [
      buildEmptyVotingRound,
      normalizeMapKeys,
      normalizeId,
      nodes,
      round,
      config,
    ]
  );

  const updateCurrentRoundVotes = useCallback(
    (votingRound) => {
      if (!votingRound) return;

      const normalized = {
        ...votingRound,
        prevotesReceived: normalizeMapKeys(
          votingRound.prevotesReceived
        ),
        precommitsReceived: normalizeMapKeys(
          votingRound.precommitsReceived
        ),
        prevoteCount:
          votingRound.prevoteCount ??
          Object.values(
            votingRound.prevotesReceived || {}
          ).filter((v) => v === true).length,
        precommitCount:
          votingRound.precommitCount ??
          Object.values(
            votingRound.precommitsReceived || {}
          ).filter((v) => v === true).length,
      };

      (nodes || []).forEach((n) => {
        const nid = normalizeId(n.id);
        if (!(nid in normalized.prevotesReceived))
          normalized.prevotesReceived[nid] = null;
        if (!(nid in normalized.precommitsReceived))
          normalized.precommitsReceived[nid] = null;
      });

      const totalNodes =
        Object.keys(normalized.prevotesReceived).length ||
        (nodes || []).length ||
        1;
      const voteThreshold =
        config?.consensus?.voteThreshold || 2 / 3;
      const requiredVotes = Math.ceil(
        totalNodes * voteThreshold
      );
      normalized.prevoteThresholdMet =
        normalized.prevoteCount >= requiredVotes;
      normalized.precommitThresholdMet =
        normalized.precommitCount >= requiredVotes;

      console.log(
        "[UPDATE_CURRENT_ROUND_VOTES] normalized votingRound:",
        {
          roundNumber: normalized.roundNumber,
          prevoteCount: normalized.prevoteCount,
          precommitCount: normalized.precommitCount,
          prevotesReceived: normalized.prevotesReceived,
          precommitsReceived: normalized.precommitsReceived,
        }
      );

      setCurrentRoundVotes(normalized);
    },
    [normalizeMapKeys, nodes, normalizeId, config]
  );

  const finalizeRound = useCallback(
    (votingRound) => {
      if (!votingRound) return;

      const normalized = {
        ...votingRound,
        prevotesReceived: normalizeMapKeys(
          votingRound.prevotesReceived
        ),
        precommitsReceived: normalizeMapKeys(
          votingRound.precommitsReceived
        ),
      };

      // Add QCs to history if they exist
      if (normalized.prevoteQC) {
        setQcHistory((prev) => [...prev, normalized.prevoteQC]);
      }
      if (normalized.precommitQC) {
        setQcHistory((prev) => [
          ...prev,
          normalized.precommitQC,
        ]);
      }

      setVotingHistory((prev) => {
        const roundExists = prev.some(
          (vr) =>
            vr.roundNumber === normalized.roundNumber &&
            vr.roundHeight === normalized.roundHeight &&
            vr.timestamp === normalized.timestamp
        );
        if (roundExists) return prev;

        console.log(
          "[FINALIZE_ROUND] pushing votingRound to history:",
          normalized.roundNumber
        );
        return [...prev, normalized];
      });

      setCurrentRoundVotes((cur) => {
        if (!cur) return null;
        if (cur.roundNumber === normalized.roundNumber)
          return null;
        return cur;
      });
    },
    [normalizeMapKeys]
  );

  // Add QC to history
  const addQC = useCallback((qc) => {
    if (!qc) return;
    setQcHistory((prev) => [...prev, qc]);
  }, []);

  // --------------------------
  // Partition & network helpers
  // --------------------------
  const updateNetworkStats = (stats) => {
    setNetworkStats((prev) => ({
      messagesSent: prev.messagesSent + (stats.sent || 0),
      messagesDelivered:
        prev.messagesDelivered + (stats.delivered || 0),
      messagesLost: prev.messagesLost + (stats.lost || 0),
    }));
  };

  const resetNetworkStats = () => {
    setNetworkStats({
      messagesSent: 0,
      messagesDelivered: 0,
      messagesLost: 0,
    });
  };

  const togglePartition = () => {
    const newState = !partitionActive;
    setPartitionActive(newState);
    if (newState) {
      applyPartitionType(partitionType);
      addLog(
        `Network partition activated (${partitionType})`,
        "warning"
      );
    } else {
      setPartitionedNodes([]);
      addLog("Network partition deactivated", "success");
    }
  };

  const applyPartitionType = (type) => {
    const nodeCount = nodes.length;
    let partitioned = [];

    switch (type) {
      case "single":
        partitioned = [nodes[0]?.id].filter(Boolean);
        break;
      case "split":
        const half = Math.floor(nodeCount / 2);
        partitioned = nodes.slice(0, half).map((n) => n.id);
        break;
      case "gradual":
        const count = Math.max(1, Math.floor(nodeCount * 0.3));
        partitioned = nodes
          .slice()
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
          .map((n) => n.id);
        break;
      default:
        partitioned = [];
    }

    setPartitionedNodes(partitioned);
    addLog(
      `Partition type changed to ${type}, ${partitioned.length} nodes affected`,
      "info"
    );
  };

  const changePartitionType = (type) => {
    setPartitionType(type);
    if (partitionActive) {
      applyPartitionType(type);
    }
  };

  const toggleNetworkMode = () => {
    setIsSynchronousMode((prev) => !prev);
    addLog(
      `Network mode switched to ${
        !isSynchronousMode
          ? "Synchronous (no timeouts)"
          : "Partially Synchronous (with timeouts)"
      }`,
      "info"
    );
  };

  // --------------------------
  // Consistency detectors
  // --------------------------
  const detectConflictingCommitsFromBlocks = useCallback(
    (blocksArr = []) => {
      const byHeight = new Map();

      blocksArr.forEach((b, idx) => {
        const h = b?.height;
        const hash =
          b?.hash ?? b?.blockHash ?? `${b?.height}-${idx}`;
        if (!h) return;
        const entry = byHeight.get(h) || { hashes: new Map() };
        const map = entry.hashes;
        if (!map.has(hash)) map.set(hash, []);
        map
          .get(hash)
          .push({ hash, proposer: b.proposer, index: idx });
        byHeight.set(h, entry);
      });

      const violations = [];
      for (const [height, entry] of byHeight.entries()) {
        const distinct = Array.from(entry.hashes.keys());
        if (distinct.length > 1) {
          violations.push({
            height,
            hashes: distinct,
            blocks: distinct
              .map((h) => entry.hashes.get(h))
              .flat(),
            source: "blocks",
          });
        }
      }

      return { safety: violations.length === 0, violations };
    },
    []
  );

  const detectConflictingCommitsFromVotingHistory = useCallback(
    (history = []) => {
      const commitsByHeight = new Map();

      history.forEach((r) => {
        const committed =
          r?.precommitThresholdMet &&
          (r?.result === "approved" ||
            r?.result === "committed" ||
            r?.approved);
        if (!committed) return;

        const height =
          r.roundHeight ?? r.roundNumber ?? r?.height;
        const hash =
          r.committedBlockHash ??
          r.blockHash ??
          r.proposedBlockHash ??
          r.proposed?.hash ??
          null;
        if (!height || !hash) return;

        const entry = commitsByHeight.get(height) || new Map();
        if (!entry.has(hash)) entry.set(hash, []);
        entry.get(hash).push({
          roundNumber: r.roundNumber,
          roundHeight: r.roundHeight,
          hash,
          roundRef: r,
        });
        commitsByHeight.set(height, entry);
      });

      const violations = [];
      for (const [height, map] of commitsByHeight.entries()) {
        const distinct = Array.from(map.keys());
        if (distinct.length > 1) {
          violations.push({
            height,
            hashes: distinct,
            rounds: distinct.map((h) => map.get(h)).flat(),
            source: "votingHistory",
          });
        }
      }

      return { safety: violations.length === 0, violations };
    },
    []
  );

  // Run consistency detectors whenever blocks or votingHistory change
  useEffect(() => {
    try {
      const blocksResult = detectConflictingCommitsFromBlocks(
        blocks || []
      );
      const historyResult =
        detectConflictingCommitsFromVotingHistory(
          votingHistory || []
        );

      const merged = new Map();
      const pushViolation = (v) => {
        const key = `${v.height}:${v.hashes.sort().join("|")}:${
          v.source
        }`;
        if (!merged.has(key)) merged.set(key, v);
      };

      blocksResult.violations.forEach(pushViolation);
      historyResult.violations.forEach(pushViolation);

      const violations = Array.from(merged.values());
      const isConsistent = violations.length === 0;
      setConsistencyMaintained(isConsistent);
      setConsistencyViolations(violations);

      if (!isConsistent) {
        addLog(
          `Consistency violation detected: ${
            violations.length
          } conflicting height(s) — heights: ${violations
            .map((v) => v.height)
            .join(", ")}`,
          "error"
        );
        console.error("ConsistencyViolations:", violations);
      }
    } catch (err) {
      console.error("Consistency detector failed:", err);
    }
  }, [
    blocks,
    votingHistory,
    detectConflictingCommitsFromBlocks,
    detectConflictingCommitsFromVotingHistory,
    addLog,
  ]);

  // --------------------------
  // Round timeout & commit handlers
  // --------------------------
  const handleRoundTimeout = useCallback(() => {
    const newTimeouts = roundTimeouts + 1;
    const newConsecutiveTimeouts = consecutiveTimeouts + 1;

    setRoundTimeouts(newTimeouts);
    setConsecutiveTimeouts(newConsecutiveTimeouts);

    const timeoutEvent = {
      round,
      timestamp: Date.now(),
      duration: timeoutDuration,
      escalationLevel: newConsecutiveTimeouts,
      proposer: currentProposer,
    };
    setTimeoutHistory((prev) => [...prev, timeoutEvent]);

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

    setRoundStartTime(Date.now());
  }, [
    roundTimeouts,
    consecutiveTimeouts,
    round,
    timeoutDuration,
    timeoutMultiplier,
    timeoutEscalationEnabled,
    currentProposer,
    addLog,
  ]);

  const handleSuccessfulCommit = useCallback(() => {
    if (consecutiveTimeouts > 0) {
      addLog(
        `Block committed! Resetting timeout duration to ${baseTimeoutDuration}ms`,
        "success"
      );
    }
    setTimeoutDuration(baseTimeoutDuration);
    setConsecutiveTimeouts(0);
    setRoundStartTime(Date.now());
  }, [consecutiveTimeouts, baseTimeoutDuration, addLog]);

  // --------------------------
  // Control functions
  // --------------------------
  const startConsensus = () => {
    setIsRunning(true);
    setRoundStartTime(Date.now());
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
    setRoundStartTime(Date.now());
    setTimeoutDuration(baseTimeoutDuration);
    setRoundTimeouts(0);
    setConsecutiveTimeouts(0);
    setTimeoutHistory([]);
    setCurrentProposer(null);
    setCurrentStep(0);
    setStepHistory([]);
    setStepDescription("Ready to start");
    setStepState(null);
    setHighlightedNodes([]);
    setPartitionActive(false);
    setPartitionedNodes([]);
    setPartitionType("single");
    resetNetworkStats();
    addLog("Network reset successfully", "info");
  };

  const loadNewConfig = (newConfig) => {
    setConfig(newConfig);
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

  // Step-by-step helpers and other control functions
  const toggleStepMode = () => {
    const newStepMode = !stepMode;
    setStepMode(newStepMode);
    if (newStepMode) {
      if (isRunning) setIsRunning(false);
      setCurrentStep(0);
      setStepModeRound(0);
      setStepDescription(
        "Round Start - Ready to begin consensus"
      );
      addLog("Switched to Step-by-Step Mode", "info");
    } else {
      setCurrentStep(0);
      setStepHistory([]);
      setStepState(null);
      setHighlightedNodes([]);
      setStepModeRound(0);
      addLog("Switched to Continuous Mode", "info");
    }
  };

  const nextStep = () => {
    if (!stepMode) return;
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
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    if (!stepMode || stepHistory.length === 0) return;
    const lastState = stepHistory[stepHistory.length - 1];
    setNodes(lastState.nodes);
    setBlocks(lastState.blocks);
    setRound(lastState.round);
    setCurrentStep(lastState.step);
    setStepDescription(lastState.description);
    setStepState(lastState.stepState);
    setStepHistory((prev) => prev.slice(0, -1));
    addLog(`Reverted to step ${lastState.step}`, "info");
  };

  const goToRoundStart = () => {
    if (!stepMode) return;
    if (currentStep > 0) setStepModeRound((prev) => prev + 1);
    setCurrentStep(0);
    setStepDescription("Round Start - Ready to begin consensus");
    setStepState(null);
    setHighlightedNodes([]);
    addLog(
      `Starting Round ${
        stepModeRound + (currentStep > 0 ? 1 : 0)
      }`,
      "info"
    );
  };

  const toggleAutoPlaySteps = () => {
    setAutoPlaySteps((prev) => !prev);
  };

  const updateStepState = (state) => {
    setStepState(state);
    if (state?.proposer) setCurrentProposer(state.proposer);
  };

  const updateStepDescription = (description) => {
    setStepDescription(description);
  };

  const updateHighlightedNodes = (nodeIds) => {
    setHighlightedNodes(nodeIds);
  };

  const updateNodes = (newNodes) => {
    setNodes(newNodes || []);
  };

  const addBlock = (newBlock) => {
    setBlocks((prev) => [...prev, newBlock]);
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

  // --------------------------
  // Main loop: simulateConsensusStep
  // --------------------------
  useEffect(() => {
    if (!isRunning) return;
    const baseDelay = config.consensus.roundTimeout || 1500;
    const interval = setInterval(() => {
      const {
        updatedNodes,
        newBlock,
        newLiveness,
        newSafety,
        votingRound,
        timedOut,
        newProposer,
        debug,
      } = simulateConsensusStep(nodes, blocks, config, {
        updateCurrentRoundVotes,
        finalizeRound,
        addLog,
        roundStartTime,
        timeoutDuration,
        handleRoundTimeout,
        currentRound: round,
        isSynchronousMode,
        partitionActive,
        partitionedNodes,
        updateNetworkStats,
      });

      // Debugging
      console.log(
        "[SIM_STEP] round=",
        round,
        "timedOut=",
        timedOut,
        "newBlock=",
        !!newBlock,
        "newProposer=",
        newProposer?.id ?? newProposer
      );
      if (votingRound) {
        console.log("[SIM_STEP] votingRound:", {
          roundNumber: votingRound.roundNumber,
          prevoteCount: votingRound.prevoteCount,
          prevoteThresholdMet: votingRound.prevoteThresholdMet,
          prevotesReceived: votingRound.prevotesReceived,
          precommitCount: votingRound.precommitCount,
          precommitThresholdMet:
            votingRound.precommitThresholdMet,
          precommitsReceived: votingRound.precommitsReceived,
        });
      }
      if (debug) console.log("[SIM_STEP debug]", debug);

      if (updatedNodes) setNodes(updatedNodes);
      if (newProposer) setCurrentProposer(newProposer);

      if (newBlock) {
        setBlocks((prev) => [...prev, newBlock]);
        addLog(
          `Block #${newBlock.height} proposed by Node ${newBlock.proposer}`,
          "block"
        );

        if (votingRound) {
          addLog(
            `Prevotes: ${votingRound.prevoteCount}/${
              Object.keys(votingRound.prevotesReceived || {})
                .length
            } (Threshold ${
              votingRound.prevoteThresholdMet ? "MET" : "NOT MET"
            })`,
            votingRound.prevoteThresholdMet
              ? "success"
              : "warning"
          );
          addLog(
            `Precommits: ${votingRound.precommitCount}/${
              Object.keys(votingRound.precommitsReceived || {})
                .length
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

        handleSuccessfulCommit();
      } else if (timedOut) {
        // Timeout occurred but no new block
        // The handleRoundTimeout was already called in simulateConsensusStep
      } else {
        // Round completed without commit and without hitting timeout.
        // Reset the round start time so the next round starts with a fresh timer.
        setRoundStartTime(Date.now());
        addLog(
          `Round ${round} finished (no commit). Timer reset for next round.`,
          "info"
        );
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
    updateCurrentRoundVotes,
    finalizeRound,
    handleRoundTimeout,
    isSynchronousMode,
    partitionActive,
    partitionedNodes,
  ]);

  // --------------------------
  // Return context value
  // --------------------------
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
        // Graph topology state
        edges,
        useGraphRouting,
        setEdges,
        setUseGraphRouting,
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
        stepModeRound,
        // Network Partition state
        partitionActive,
        partitionedNodes,
        partitionType,
        networkStats,
        // Consistency checker
        consistencyMaintained,
        consistencyViolations,
        // Quorum Certificate state
        qcHistory,
        // Control functions
        startConsensus,
        stopConsensus,
        resetNetwork,
        changeSpeed,
        addLog,
        loadNewConfig,
        trackVote,
        updateCurrentRoundVotes,
        finalizeRound,
        addQC,
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
        // Network Partition functions
        togglePartition,
        changePartitionType,
        updateNetworkStats,
        resetNetworkStats,
        // Network Mode functions
        isSynchronousMode,
        toggleNetworkMode,
      }}
    >
      {children}
    </ConsensusContext.Provider>
  );
};

export const useConsensus = () => useContext(ConsensusContext);

export default ConsensusContext;
