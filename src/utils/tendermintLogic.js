// src/utils/tendermintLogic.js
import { DEFAULTS } from "./ConfigManager";

/**
 * Consensus Step Definitions
 */
export const CONSENSUS_STEPS = {
  ROUND_START: 0,
  BLOCK_PROPOSAL: 1,
  PREVOTE: 2,
  PREVOTE_TALLY: 3,
  PRECOMMIT: 4,
  PRECOMMIT_TALLY: 5,
  COMMIT: 6,
  ROUND_COMPLETE: 7,
};

export const STEP_DESCRIPTIONS = {
  [CONSENSUS_STEPS.ROUND_START]:
    "Round Start - Initialize round and select proposer",
  [CONSENSUS_STEPS.BLOCK_PROPOSAL]:
    "Block Proposal - Proposer creates and broadcasts block",
  [CONSENSUS_STEPS.PREVOTE]:
    "Prevote Phase - Validators vote on the proposed block",
  [CONSENSUS_STEPS.PREVOTE_TALLY]:
    "Prevote Tally - Count prevotes and check if > 2/3",
  [CONSENSUS_STEPS.PRECOMMIT]:
    "Precommit Phase - Validators commit to the block",
  [CONSENSUS_STEPS.PRECOMMIT_TALLY]:
    "Precommit Tally - Count precommits and check if > 2/3",
  [CONSENSUS_STEPS.COMMIT]: "Commit - Block is finalized and added to chain",
  [CONSENSUS_STEPS.ROUND_COMPLETE]:
    "Round Complete - Reset for next round or timeout",
};

export const STEP_PHASES = {
  [CONSENSUS_STEPS.ROUND_START]: "initialization",
  [CONSENSUS_STEPS.BLOCK_PROPOSAL]: "proposal",
  [CONSENSUS_STEPS.PREVOTE]: "voting",
  [CONSENSUS_STEPS.PREVOTE_TALLY]: "voting",
  [CONSENSUS_STEPS.PRECOMMIT]: "voting",
  [CONSENSUS_STEPS.PRECOMMIT_TALLY]: "voting",
  [CONSENSUS_STEPS.COMMIT]: "commit",
  [CONSENSUS_STEPS.ROUND_COMPLETE]: "complete",
};

/**
 * Simple in-memory store for proposals observed, to detect equivocation.
 * Key: "<height>:<round>:<proposerId>" => Set of hashes
 *
 * In a real system, evidence would be signed and gossiped; here it's
 * a small simulator helper.
 */
const proposalsSeen = new Map();

/**
 * recordProposalEvidence(proposal)
 * proposal = { height, round, proposer, hash }
 * returns { equivocates: boolean, hashes: [..] }
 */
export function recordProposalEvidence(proposal) {
  if (!proposal || !proposal.height || !proposal.proposer) {
    return { equivocates: false, hashes: [] };
  }
  const key = `${proposal.height}:${proposal.round ?? 0}:${proposal.proposer}`;
  const set = proposalsSeen.get(key) || new Set();
  set.add(proposal.hash);
  proposalsSeen.set(key, set);

  if (set.size > 1) {
    return { equivocates: true, hashes: Array.from(set) };
  }
  return { equivocates: false, hashes: Array.from(set) };
}

/**
 * getNextProposer(nodes, round)
 * Round-robin proposer selection among online nodes (including Byzantine)
 */
export function getNextProposer(nodes, round) {
  const onlineNodes = nodes.filter((n) => n.isOnline);
  if (onlineNodes.length === 0) {
    return nodes[round % nodes.length];
  }
  return onlineNodes[round % onlineNodes.length];
}

/**
 * createBlock(proposerId, height, config, proposerNode = null)
 *
 * - normal proposers -> single hash (block.hash)
 * - equivocator proposers (byzantineType === "equivocator") -> returns hashPerTarget
 *   so simulate different validators observing different hashes in the same round.
 */
export function createBlock(proposerId, height, config, proposerNode = null) {
  const blockSize = config?.consensus?.blockSize || DEFAULTS.blockSize;
  const txCount = Math.floor(Math.random() * blockSize) + 1;

  let isMalicious = false;
  if (proposerNode && proposerNode.isByzantine) {
    // 70% chance to behave "maliciously" in proposer's content
    isMalicious = Math.random() > 0.3;
  }

  // If proposer is an explicit equivocator, create different hashes per "target"
  if (proposerNode?.isByzantine && proposerNode.byzantineType === "equivocator") {
    const hashA = Math.random().toString(36).substring(2, 10);
    const hashB = Math.random().toString(36).substring(2, 10);
    return {
      height,
      proposer: proposerId,
      txCount,
      hash: `${hashA}|${hashB}`, // meta representation
      timestamp: Date.now(),
      isMalicious,
      byzantineType: proposerNode?.byzantineType || null,
      hashPerTarget: { variantA: hashA, variantB: hashB },
    };
  }

  // Normal single-hash proposal
  return {
    height,
    proposer: proposerId,
    txCount: isMalicious ? Math.floor(txCount * 1.5) : txCount,
    hash: Math.random().toString(36).substring(2, 10),
    timestamp: Date.now(),
    isMalicious,
    byzantineType: proposerNode?.byzantineType || null,
  };
}

/**
 * voteOnBlock(nodes, block, config, totalValidators = null)
 *
 * - nodes: array of node objects considered "votable" (e.g., online subset)
 * - totalValidators: optional canonical denominator (full validator set) to compute approval.
 *
 * Returns { votes, yesVotes, totalVotes, approved, byzantineDetected }
 */
export function voteOnBlock(nodes, block, config, totalValidators = null) {
  const voteThreshold = config?.consensus?.voteThreshold || DEFAULTS.voteThreshold;
  const responseVariance = config?.nodeBehavior?.responseVariance || DEFAULTS.responseVariance;

  let byzantineDetected = false;

  const votes = nodes.map((node) => {
    // Offline -> no vote
    if (!node.isOnline) {
      return { nodeId: node.id, vote: null, isByzantine: false };
    }

    // Byzantine behaviors
    if (node.isByzantine) {
      byzantineDetected = true;
      switch (node.byzantineType) {
        case "faulty":
          return { nodeId: node.id, vote: Math.random() > 0.5, isByzantine: true };
        case "equivocator":
          // equivocator might vote unpredictably
          return { nodeId: node.id, vote: Math.random() > 0.3, isByzantine: true };
        case "silent":
          return { nodeId: node.id, vote: null, isByzantine: true };
        default:
          return { nodeId: node.id, vote: Math.random() > 0.5, isByzantine: true };
      }
    }

    // Honest node: validate block content
    if (block.isMalicious) {
      return { nodeId: node.id, vote: false, isByzantine: false, reason: "Malicious block detected" };
    }

    // For valid blocks, honest nodes vote yes
    return { nodeId: node.id, vote: true, isByzantine: false };
  });

  const yesVotes = votes.filter((v) => v.vote === true).length;
  const votedNodesCount = votes.length;

  // Denominator: prefer explicit totalValidators (full validator set)
  const denominator = totalValidators !== null ? totalValidators : votedNodesCount;
  const approved = denominator > 0 && yesVotes / denominator >= voteThreshold;

  return {
    votes,
    yesVotes,
    totalVotes: votedNodesCount,
    approved,
    byzantineDetected,
  };
}

/**
 * createVotingRound(roundNumber, roundHeight, proposerId, nodes)
 *
 * Returns a structure tracking votes (keys are numeric node ids).
 */
export function createVotingRound(roundNumber, roundHeight, proposerId, nodes) {
  const prevotesReceived = {};
  const precommitsReceived = {};

  nodes.forEach((node) => {
    prevotesReceived[node.id] = null;
    precommitsReceived[node.id] = null;
  });

  return {
    roundNumber,
    roundHeight,
    proposerId,
    prevotesReceived,
    precommitsReceived,
    timestamp: Date.now(),
    result: "pending",
    prevoteCount: 0,
    precommitCount: 0,
    prevoteThresholdMet: false,
    precommitThresholdMet: false,
  };
}

/**
 * updatePrevotes(votingRound, votes, voteThreshold)
 */
export function updatePrevotes(votingRound, votes, voteThreshold) {
  votes.forEach(({ nodeId, vote }) => {
    votingRound.prevotesReceived[nodeId] = vote;
  });

  const allVotes = Object.values(votingRound.prevotesReceived);
  const yesPrevotes = allVotes.filter((v) => v === true).length;
  const totalNodes = allVotes.length;

  votingRound.prevoteCount = yesPrevotes;
  votingRound.prevoteThresholdMet = totalNodes > 0 && yesPrevotes / totalNodes >= voteThreshold;

  return votingRound;
}

/**
 * updatePrecommits(votingRound, votes, voteThreshold)
 */
export function updatePrecommits(votingRound, votes, voteThreshold) {
  votes.forEach(({ nodeId, vote }) => {
    votingRound.precommitsReceived[nodeId] = vote;
  });

  const allVotes = Object.values(votingRound.precommitsReceived);
  const yesPrecommits = allVotes.filter((v) => v === true).length;
  const totalNodes = allVotes.length;

  votingRound.precommitCount = yesPrecommits;
  votingRound.precommitThresholdMet = totalNodes > 0 && yesPrecommits / totalNodes >= voteThreshold;

  return votingRound;
}

/**
 * finalizeVotingRound(votingRound, approved)
 */
export function finalizeVotingRound(votingRound, approved) {
  votingRound.result = approved ? "approved" : "rejected";
  return votingRound;
}

/**
 * executeConsensusStep(step, nodes, blocks, config, previousStepState = null, customRound = null)
 *
 * Small step-machine exposing internal step states for step-by-step mode.
 */
export function executeConsensusStep(
  step,
  nodes,
  blocks,
  config,
  previousStepState = null,
  customRound = null
) {
  const round = customRound !== null ? customRound : blocks.length;
  const voteThreshold = config?.consensus?.voteThreshold || DEFAULTS.voteThreshold;

  switch (step) {
    case CONSENSUS_STEPS.ROUND_START: {
      const proposer = getNextProposer(nodes, round);
      return {
        step: CONSENSUS_STEPS.ROUND_START,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.ROUND_START],
        phase: STEP_PHASES[CONSENSUS_STEPS.ROUND_START],
        proposer,
        highlightedNodes: [proposer.id],
        block: null,
        votingRound: null,
        nodes: nodes.map((n) => ({ ...n, state: "Idle", color: n.isByzantine ? "#ff6b6b" : "#ccc" })),
      };
    }

    case CONSENSUS_STEPS.BLOCK_PROPOSAL: {
      const proposer = previousStepState?.proposer || getNextProposer(nodes, round);
      const block = createBlock(proposer.id, round + 1, config, proposer);
      const votingRound = createVotingRound(round + 1, round + 1, proposer.id, nodes);
      return {
        step: CONSENSUS_STEPS.BLOCK_PROPOSAL,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.BLOCK_PROPOSAL],
        phase: STEP_PHASES[CONSENSUS_STEPS.BLOCK_PROPOSAL],
        proposer,
        highlightedNodes: [proposer.id],
        block,
        votingRound,
        nodes: nodes.map((n) => ({ ...n, state: n.id === proposer.id ? "Proposing" : "Idle", color: n.id === proposer.id ? "#f9c74f" : n.isByzantine ? "#ff6b6b" : "#ccc" })),
      };
    }

    case CONSENSUS_STEPS.PREVOTE: {
      const { block, votingRound, proposer } = previousStepState;
      // Simple prevote using all nodes as "votable" (simulate synchronous voting)
      const prevoteResult = voteOnBlock(nodes, block, config, Object.keys(votingRound.prevotesReceived).length || nodes.length);
      updatePrevotes(votingRound, prevoteResult.votes, voteThreshold);
      return {
        step: CONSENSUS_STEPS.PREVOTE,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.PREVOTE],
        phase: STEP_PHASES[CONSENSUS_STEPS.PREVOTE],
        proposer,
        highlightedNodes: nodes.map((n) => n.id),
        block,
        votingRound,
        prevoteResult,
        nodes: nodes.map((n) => ({ ...n, state: "Prevoting", color: n.isByzantine ? "#ff6b6b" : "#4a90e2" })),
      };
    }

    case CONSENSUS_STEPS.PREVOTE_TALLY: {
      const { block, votingRound, proposer, prevoteResult } = previousStepState;
      return {
        step: CONSENSUS_STEPS.PREVOTE_TALLY,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.PREVOTE_TALLY],
        phase: STEP_PHASES[CONSENSUS_STEPS.PREVOTE_TALLY],
        proposer,
        highlightedNodes: [],
        block,
        votingRound,
        prevoteResult,
        nodes: nodes.map((n) => ({ ...n, state: "Waiting", color: n.isByzantine ? "#ff6b6b" : "#ccc" })),
      };
    }

    case CONSENSUS_STEPS.PRECOMMIT: {
      const { block, votingRound, proposer, prevoteResult } = previousStepState;
      let precommitResult;
      if (votingRound.prevoteThresholdMet) {
        precommitResult = voteOnBlock(nodes, block, config, Object.keys(votingRound.precommitsReceived).length || nodes.length);
        updatePrecommits(votingRound, precommitResult.votes, voteThreshold);
      } else {
        precommitResult = { votes: prevoteResult.votes.map((v) => ({ ...v, vote: null })), approved: false };
      }
      return {
        step: CONSENSUS_STEPS.PRECOMMIT,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.PRECOMMIT],
        phase: STEP_PHASES[CONSENSUS_STEPS.PRECOMMIT],
        proposer,
        highlightedNodes: votingRound.prevoteThresholdMet ? nodes.map((n) => n.id) : [],
        block,
        votingRound,
        prevoteResult,
        precommitResult,
        nodes: nodes.map((n) => ({ ...n, state: votingRound.prevoteThresholdMet ? "Precommitting" : "Waiting", color: votingRound.prevoteThresholdMet ? (n.isByzantine ? "#ff6b6b" : "#4a90e2") : (n.isByzantine ? "#ff6b6b" : "#ccc") })),
      };
    }

    case CONSENSUS_STEPS.PRECOMMIT_TALLY: {
      const { block, votingRound, proposer, prevoteResult, precommitResult } = previousStepState;
      return {
        step: CONSENSUS_STEPS.PRECOMMIT_TALLY,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.PRECOMMIT_TALLY],
        phase: STEP_PHASES[CONSENSUS_STEPS.PRECOMMIT_TALLY],
        proposer,
        highlightedNodes: [],
        block,
        votingRound,
        prevoteResult,
        precommitResult,
        nodes: nodes.map((n) => ({ ...n, state: "Waiting", color: n.isByzantine ? "#ff6b6b" : "#ccc" })),
      };
    }

    case CONSENSUS_STEPS.COMMIT: {
      const { block, votingRound, proposer, prevoteResult, precommitResult } = previousStepState;
      const committed = votingRound.precommitThresholdMet && precommitResult && precommitResult.approved !== false;
      if (votingRound.precommitThresholdMet) {
        finalizeVotingRound(votingRound, true);
      } else {
        finalizeVotingRound(votingRound, false);
      }
      return {
        step: CONSENSUS_STEPS.COMMIT,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.COMMIT],
        phase: STEP_PHASES[CONSENSUS_STEPS.COMMIT],
        proposer,
        highlightedNodes: committed ? nodes.map((n) => n.id) : [],
        block: votingRound.precommitThresholdMet ? block : null,
        votingRound,
        prevoteResult,
        precommitResult,
        committed: votingRound.precommitThresholdMet,
        nodes: nodes.map((n) => ({ ...n, state: votingRound.precommitThresholdMet ? "Committed" : "Timeout", color: votingRound.precommitThresholdMet ? (n.isByzantine ? "#ff6b6b" : "#90be6d") : (n.isByzantine ? "#ff6b6b" : "#f94144") })),
      };
    }

    case CONSENSUS_STEPS.ROUND_COMPLETE: {
      const { committed, block, votingRound } = previousStepState;
      return {
        step: CONSENSUS_STEPS.ROUND_COMPLETE,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.ROUND_COMPLETE],
        phase: STEP_PHASES[CONSENSUS_STEPS.ROUND_COMPLETE],
        proposer: null,
        highlightedNodes: [],
        block: committed ? block : null,
        votingRound,
        committed,
        nodes: nodes.map((n) => ({ ...n, state: "Idle", color: n.isByzantine ? "#ff6b6b" : "#ccc" })),
      };
    }

    default:
      return null;
  }
}

/**
 * Get the total number of steps in a consensus round
 */
export function getTotalSteps() {
  return Object.keys(CONSENSUS_STEPS).length;
}
