import React from "react";
import { motion } from "framer-motion";
import { useConsensus } from "../context/ConsensusContext";

export default function VotingVisualization() {
  const { currentRoundVotes, config } = useConsensus();

  if (!currentRoundVotes) {
    return null;
  }

  const voteThreshold =
    config?.consensus?.voteThreshold || 2 / 3;
  const totalNodes = Object.keys(
    currentRoundVotes.prevotesReceived
  ).length;
  const requiredVotes = Math.ceil(totalNodes * voteThreshold);

  // Calculate prevote progress
  const prevoteValues = Object.values(
    currentRoundVotes.prevotesReceived
  );
  const prevoteYes = prevoteValues.filter(
    (v) => v === true
  ).length;
  const prevoteProgress = (prevoteYes / totalNodes) * 100;
  const prevoteThresholdProgress =
    (requiredVotes / totalNodes) * 100;

  // Calculate precommit progress
  const precommitValues = Object.values(
    currentRoundVotes.precommitsReceived
  );
  const precommitYes = precommitValues.filter(
    (v) => v === true
  ).length;
  const precommitProgress = (precommitYes / totalNodes) * 100;
  const precommitThresholdProgress =
    (requiredVotes / totalNodes) * 100;

  const getProgressColor = (progress, thresholdProgress) => {
    if (progress >= thresholdProgress) return "#10b981"; // Green
    if (progress >= thresholdProgress * 0.7) return "#f59e0b"; // Orange
    return "#3b82f6"; // Blue
  };

  const CircularProgress = ({
    progress,
    thresholdProgress,
    label,
    votes,
    total,
  }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (progress / 100) * circumference;
    const thresholdDashoffset =
      circumference - (thresholdProgress / 100) * circumference;
    const color = getProgressColor(progress, thresholdProgress);

    return (
      <div className="circular-progress-container">
        <div className="circular-progress-label">{label}</div>
        <svg
          className="circular-progress"
          width="140"
          height="140"
          viewBox="0 0 120 120"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#334155"
            strokeWidth="10"
          />

          {/* Threshold marker */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={thresholdDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            opacity="0.5"
          />

          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Center text */}
          <text
            x="60"
            y="55"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="#f1f5f9"
          >
            {votes}/{total}
          </text>
          <text
            x="60"
            y="72"
            textAnchor="middle"
            fontSize="14"
            fill="#94a3b8"
          >
            {progress.toFixed(0)}%
          </text>
        </svg>
        <div className="threshold-indicator">
          Threshold: {requiredVotes}/{total} nodes
        </div>
      </div>
    );
  };

  return (
    <div className="voting-visualization">
      <h3>Vote Progress</h3>
      <div className="progress-circles">
        <CircularProgress
          progress={prevoteProgress}
          thresholdProgress={prevoteThresholdProgress}
          label="Prevote"
          votes={prevoteYes}
          total={totalNodes}
        />
        <CircularProgress
          progress={precommitProgress}
          thresholdProgress={precommitThresholdProgress}
          label="Precommit"
          votes={precommitYes}
          total={totalNodes}
        />
      </div>

      <div className="voting-status">
        {currentRoundVotes.prevoteThresholdMet &&
        currentRoundVotes.precommitThresholdMet ? (
          <div className="status-message status-success">
            ✓ Consensus Reached - Block will be committed
          </div>
        ) : currentRoundVotes.prevoteThresholdMet ? (
          <div className="status-message status-progress">
            ⏳ Prevote passed - Waiting for precommit threshold
          </div>
        ) : (
          <div className="status-message status-pending">
            ⏳ Waiting for prevote threshold
          </div>
        )}
      </div>
    </div>
  );
}
