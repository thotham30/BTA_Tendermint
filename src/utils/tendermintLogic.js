// src/utils/tendermintLogic.js

import { DEFAULTS } from "./ConfigManager";

/**
 * Consensus Step Definitions
 * Each step represents a distinct phase in the Tendermint consensus process
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
  [CONSENSUS_STEPS.COMMIT]:
    "Commit - Block is finalized and added to chain",
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
 * VotingRound data structure for tracking consensus voting
 * @typedef {Object} VotingRound
 * @property {number} roundNumber - The round number
 * @property {number} roundHeight - The block height
 * @property {number} proposerId - The proposer node ID
 * @property {Object} prevotesReceived - Map of nodeId -> vote (true/false/null)
 * @property {Object} precommitsReceived - Map of nodeId -> vote (true/false/null)
 * @property {number} timestamp - When the round started
 * @property {string} result - 'approved', 'rejected', or 'pending'
 * @property {number} prevoteCount - Number of prevotes received
 * @property {number} precommitCount - Number of precommits received
 * @property {boolean} prevoteThresholdMet - Whether 2/3+ prevotes achieved
 * @property {boolean} precommitThresholdMet - Whether 2/3+ precommits achieved
 */

export function getNextProposer(nodes, round) {
  // Get only online, non-byzantine nodes for proposer selection
  const eligibleNodes = nodes.filter(
    (n) => n.isOnline && !n.isByzantine
  );
  if (eligibleNodes.length === 0) {
    // Fallback to all nodes if no eligible ones
    return nodes[round % nodes.length];
  }
  return eligibleNodes[round % eligibleNodes.length];
}

export function createBlock(proposerId, height, config) {
  const blockSize =
    config?.consensus?.blockSize || DEFAULTS.blockSize;
  const txCount = Math.floor(Math.random() * blockSize) + 1;

  return {
    height,
    proposer: proposerId,
    txCount,
    hash: Math.random().toString(36).substring(2, 10),
    timestamp: Date.now(),
  };
}

export function voteOnBlock(nodes, block, config) {
  const voteThreshold =
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold;
  const responseVariance =
    config?.nodeBehavior?.responseVariance ||
    DEFAULTS.responseVariance;

  let byzantineDetected = false;

  const votes = nodes.map((node) => {
    // Node is offline - no vote
    if (!node.isOnline) {
      return { nodeId: node.id, vote: null, isByzantine: false };
    }

    // Byzantine node behavior
    if (node.isByzantine) {
      byzantineDetected = true;
      switch (node.byzantineType) {
        case "faulty":
          // Votes randomly
          return {
            nodeId: node.id,
            vote: Math.random() > 0.5,
            isByzantine: true,
          };
        case "equivocator":
          // Sends conflicting votes (simulated as random)
          return {
            nodeId: node.id,
            vote: Math.random() > 0.3,
            isByzantine: true,
          };
        case "silent":
          // Doesn't vote
          return {
            nodeId: node.id,
            vote: null,
            isByzantine: true,
          };
        default:
          return {
            nodeId: node.id,
            vote: Math.random() > 0.5,
            isByzantine: true,
          };
      }
    }

    // Honest node with response variance
    const baseApprovalRate = 0.9;
    const varianceImpact =
      (Math.random() * responseVariance) / 1000;
    const approval = Math.random() > 0.1 - varianceImpact;

    return {
      nodeId: node.id,
      vote: approval,
      isByzantine: false,
    };
  });

  // Count valid yes votes (excluding null votes)
  const validVotes = votes.filter((v) => v.vote !== null);
  const yesVotes = validVotes.filter((v) => v.vote).length;
  const totalVotes = validVotes.length;

  // Check if threshold is met
  const approved =
    totalVotes > 0 && yesVotes / totalVotes >= voteThreshold;

  return {
    votes,
    yesVotes,
    totalVotes,
    approved,
    byzantineDetected,
  };
}

/**
 * Create a VotingRound object for tracking consensus rounds
 */
export function createVotingRound(
  roundNumber,
  roundHeight,
  proposerId,
  nodes
) {
  const prevotesReceived = {};
  const precommitsReceived = {};

  // Initialize all nodes with null votes
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
 * Update voting round with prevotes
 */
export function updatePrevotes(
  votingRound,
  votes,
  voteThreshold
) {
  votes.forEach(({ nodeId, vote }) => {
    votingRound.prevotesReceived[nodeId] = vote;
  });

  const validPrevotes = Object.values(
    votingRound.prevotesReceived
  ).filter((v) => v !== null);
  const yesPrevotes = validPrevotes.filter(
    (v) => v === true
  ).length;

  votingRound.prevoteCount = yesPrevotes;
  votingRound.prevoteThresholdMet =
    validPrevotes.length > 0 &&
    yesPrevotes / validPrevotes.length >= voteThreshold;

  return votingRound;
}

/**
 * Update voting round with precommits
 */
export function updatePrecommits(
  votingRound,
  votes,
  voteThreshold
) {
  votes.forEach(({ nodeId, vote }) => {
    votingRound.precommitsReceived[nodeId] = vote;
  });

  const validPrecommits = Object.values(
    votingRound.precommitsReceived
  ).filter((v) => v !== null);
  const yesPrecommits = validPrecommits.filter(
    (v) => v === true
  ).length;

  votingRound.precommitCount = yesPrecommits;
  votingRound.precommitThresholdMet =
    validPrecommits.length > 0 &&
    yesPrecommits / validPrecommits.length >= voteThreshold;

  return votingRound;
}

/**
 * Finalize voting round with result
 */
export function finalizeVotingRound(votingRound, approved) {
  votingRound.result = approved ? "approved" : "rejected";
  return votingRound;
}

/**
 * Execute a specific consensus step
 * Returns the state after executing that step
 */
export function executeConsensusStep(
  step,
  nodes,
  blocks,
  config,
  previousStepState = null
) {
  const round = blocks.length;
  const voteThreshold =
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold;

  switch (step) {
    case CONSENSUS_STEPS.ROUND_START: {
      // Step 0: Initialize round and select proposer
      const proposer = getNextProposer(nodes, round);
      return {
        step: CONSENSUS_STEPS.ROUND_START,
        description:
          STEP_DESCRIPTIONS[CONSENSUS_STEPS.ROUND_START],
        phase: STEP_PHASES[CONSENSUS_STEPS.ROUND_START],
        proposer,
        highlightedNodes: [proposer.id],
        block: null,
        votingRound: null,
        nodes: nodes.map((n) => ({
          ...n,
          state: "Idle",
          color: n.isByzantine ? "#ff6b6b" : "#ccc",
        })),
      };
    }

    case CONSENSUS_STEPS.BLOCK_PROPOSAL: {
      // Step 1: Proposer creates block
      const proposer =
        previousStepState?.proposer ||
        getNextProposer(nodes, round);
      const block = createBlock(proposer.id, round + 1, config);
      const votingRound = createVotingRound(
        round + 1,
        round + 1,
        proposer.id,
        nodes
      );

      return {
        step: CONSENSUS_STEPS.BLOCK_PROPOSAL,
        description:
          STEP_DESCRIPTIONS[CONSENSUS_STEPS.BLOCK_PROPOSAL],
        phase: STEP_PHASES[CONSENSUS_STEPS.BLOCK_PROPOSAL],
        proposer,
        highlightedNodes: [proposer.id],
        block,
        votingRound,
        nodes: nodes.map((n) => ({
          ...n,
          state: n.id === proposer.id ? "Proposing" : "Idle",
          color:
            n.id === proposer.id
              ? "#f9c74f"
              : n.isByzantine
              ? "#ff6b6b"
              : "#ccc",
        })),
      };
    }

    case CONSENSUS_STEPS.PREVOTE: {
      // Step 2: All nodes vote on the block
      const { block, votingRound, proposer } = previousStepState;
      const prevoteResult = voteOnBlock(nodes, block, config);
      updatePrevotes(
        votingRound,
        prevoteResult.votes,
        voteThreshold
      );

      return {
        step: CONSENSUS_STEPS.PREVOTE,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.PREVOTE],
        phase: STEP_PHASES[CONSENSUS_STEPS.PREVOTE],
        proposer,
        highlightedNodes: nodes.map((n) => n.id),
        block,
        votingRound,
        prevoteResult,
        nodes: nodes.map((n) => ({
          ...n,
          state: "Prevoting",
          color: n.isByzantine ? "#ff6b6b" : "#4a90e2",
        })),
      };
    }

    case CONSENSUS_STEPS.PREVOTE_TALLY: {
      // Step 3: Count prevotes and check threshold
      const { block, votingRound, proposer, prevoteResult } =
        previousStepState;

      return {
        step: CONSENSUS_STEPS.PREVOTE_TALLY,
        description:
          STEP_DESCRIPTIONS[CONSENSUS_STEPS.PREVOTE_TALLY],
        phase: STEP_PHASES[CONSENSUS_STEPS.PREVOTE_TALLY],
        proposer,
        highlightedNodes: [],
        block,
        votingRound,
        prevoteResult,
        nodes: nodes.map((n) => ({
          ...n,
          state: "Waiting",
          color: n.isByzantine ? "#ff6b6b" : "#ccc",
        })),
      };
    }

    case CONSENSUS_STEPS.PRECOMMIT: {
      // Step 4: If prevotes pass, nodes precommit
      const { block, votingRound, proposer, prevoteResult } =
        previousStepState;

      let precommitResult;
      if (votingRound.prevoteThresholdMet) {
        precommitResult = voteOnBlock(nodes, block, config);
        updatePrecommits(
          votingRound,
          precommitResult.votes,
          voteThreshold
        );
      } else {
        // No precommit if prevote didn't pass
        precommitResult = {
          votes: prevoteResult.votes.map((v) => ({
            ...v,
            vote: null,
          })),
          approved: false,
        };
      }

      return {
        step: CONSENSUS_STEPS.PRECOMMIT,
        description:
          STEP_DESCRIPTIONS[CONSENSUS_STEPS.PRECOMMIT],
        phase: STEP_PHASES[CONSENSUS_STEPS.PRECOMMIT],
        proposer,
        highlightedNodes: votingRound.prevoteThresholdMet
          ? nodes.map((n) => n.id)
          : [],
        block,
        votingRound,
        prevoteResult,
        precommitResult,
        nodes: nodes.map((n) => ({
          ...n,
          state: votingRound.prevoteThresholdMet
            ? "Precommitting"
            : "Waiting",
          color: votingRound.prevoteThresholdMet
            ? n.isByzantine
              ? "#ff6b6b"
              : "#4a90e2"
            : n.isByzantine
            ? "#ff6b6b"
            : "#ccc",
        })),
      };
    }

    case CONSENSUS_STEPS.PRECOMMIT_TALLY: {
      // Step 5: Count precommits and check threshold
      const {
        block,
        votingRound,
        proposer,
        prevoteResult,
        precommitResult,
      } = previousStepState;

      return {
        step: CONSENSUS_STEPS.PRECOMMIT_TALLY,
        description:
          STEP_DESCRIPTIONS[CONSENSUS_STEPS.PRECOMMIT_TALLY],
        phase: STEP_PHASES[CONSENSUS_STEPS.PRECOMMIT_TALLY],
        proposer,
        highlightedNodes: [],
        block,
        votingRound,
        prevoteResult,
        precommitResult,
        nodes: nodes.map((n) => ({
          ...n,
          state: "Waiting",
          color: n.isByzantine ? "#ff6b6b" : "#ccc",
        })),
      };
    }

    case CONSENSUS_STEPS.COMMIT: {
      // Step 6: Commit block if precommits pass
      const {
        block,
        votingRound,
        proposer,
        prevoteResult,
        precommitResult,
      } = previousStepState;

      const committed =
        votingRound.precommitThresholdMet &&
        precommitResult.approved;

      if (committed) {
        finalizeVotingRound(votingRound, true);
      } else {
        finalizeVotingRound(votingRound, false);
      }

      return {
        step: CONSENSUS_STEPS.COMMIT,
        description: STEP_DESCRIPTIONS[CONSENSUS_STEPS.COMMIT],
        phase: STEP_PHASES[CONSENSUS_STEPS.COMMIT],
        proposer,
        highlightedNodes: committed
          ? nodes.map((n) => n.id)
          : [],
        block: committed ? block : null,
        votingRound,
        prevoteResult,
        precommitResult,
        committed,
        nodes: nodes.map((n) => ({
          ...n,
          state: committed ? "Committed" : "Timeout",
          color: committed
            ? n.isByzantine
              ? "#ff6b6b"
              : "#90be6d"
            : n.isByzantine
            ? "#ff6b6b"
            : "#f94144",
        })),
      };
    }

    case CONSENSUS_STEPS.ROUND_COMPLETE: {
      // Step 7: Reset for next round
      const { committed, block, votingRound } =
        previousStepState;

      return {
        step: CONSENSUS_STEPS.ROUND_COMPLETE,
        description:
          STEP_DESCRIPTIONS[CONSENSUS_STEPS.ROUND_COMPLETE],
        phase: STEP_PHASES[CONSENSUS_STEPS.ROUND_COMPLETE],
        proposer: null,
        highlightedNodes: [],
        block: committed ? block : null,
        votingRound,
        committed,
        nodes: nodes.map((n) => ({
          ...n,
          state: "Idle",
          color: n.isByzantine ? "#ff6b6b" : "#ccc",
        })),
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
