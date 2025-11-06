import React from "react";
import { useConsensus } from "../context/ConsensusContext";
import {
  DEFAULTS,
  formatVoteThreshold,
} from "../utils/ConfigManager";

export default function StateInspector() {
  const {
    stepMode,
    stepState,
    stepDescription,
    currentStep,
    nodes,
    config,
  } = useConsensus();

  if (!stepMode || !stepState) {
    return (
      <div className="state-inspector">
        <h3>State Inspector</h3>
        <p className="no-state">
          Enable Step-by-Step Mode to inspect consensus state
        </p>
      </div>
    );
  }

  const voteThreshold =
    config?.consensus?.voteThreshold || DEFAULTS.voteThreshold;
  const thresholdPercentage = (voteThreshold * 100).toFixed(0);

  // Calculate vote statistics
  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter((n) => n.isOnline).length;
  const byzantineNodes = nodes.filter(
    (n) => n.isByzantine
  ).length;

  const prevoteStats = stepState.votingRound
    ? {
        total: Object.keys(
          stepState.votingRound.prevotesReceived
        ).length,
        yes: stepState.votingRound.prevoteCount,
        percentage:
          Object.keys(stepState.votingRound.prevotesReceived)
            .length > 0
            ? (
                (stepState.votingRound.prevoteCount /
                  Object.keys(
                    stepState.votingRound.prevotesReceived
                  ).length) *
                100
              ).toFixed(1)
            : 0,
        thresholdMet: stepState.votingRound.prevoteThresholdMet,
      }
    : null;

  const precommitStats = stepState.votingRound
    ? {
        total: Object.keys(
          stepState.votingRound.precommitsReceived
        ).length,
        yes: stepState.votingRound.precommitCount,
        percentage:
          Object.keys(stepState.votingRound.precommitsReceived)
            .length > 0
            ? (
                (stepState.votingRound.precommitCount /
                  Object.keys(
                    stepState.votingRound.precommitsReceived
                  ).length) *
                100
              ).toFixed(1)
            : 0,
        thresholdMet:
          stepState.votingRound.precommitThresholdMet,
      }
    : null;

  return (
    <div className="state-inspector">
      <h3>🔍 State Inspector</h3>

      {/* Current Step Description */}
      <div
        className={`step-description phase-${stepState.phase}`}
      >
        <h4>{stepDescription}</h4>
        <span className="phase-badge">{stepState.phase}</span>
      </div>

      {/* Proposer Information */}
      {stepState.proposer && (
        <div className="inspector-section">
          <h4>👤 Proposer</h4>
          <div className="proposer-info">
            <span className="node-id">
              Node {stepState.proposer.id}
            </span>
            {stepState.proposer.isByzantine && (
              <span className="byzantine-badge">Byzantine</span>
            )}
          </div>
        </div>
      )}

      {/* Block Information */}
      {stepState.block && (
        <div className="inspector-section">
          <h4>📦 Block</h4>
          <div className="block-info">
            <div className="info-row">
              <span className="label">Height:</span>
              <span className="value">
                {stepState.block.height}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Transactions:</span>
              <span className="value">
                {stepState.block.txCount}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Hash:</span>
              <span className="value hash">
                {stepState.block.hash}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Network Status */}
      <div className="inspector-section">
        <h4>🌐 Network Status</h4>
        <div className="network-stats">
          <div className="stat-item">
            <span className="stat-label">Total Nodes:</span>
            <span className="stat-value">{totalNodes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Online:</span>
            <span className="stat-value success">
              {onlineNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Byzantine:</span>
            <span className="stat-value warning">
              {byzantineNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Threshold:</span>
            <span className="stat-value">
              {formatVoteThreshold(voteThreshold)}
            </span>
          </div>
        </div>
      </div>

      {/* Prevote Statistics */}
      {prevoteStats && currentStep >= 2 && (
        <div className="inspector-section">
          <h4>🗳️ Prevotes</h4>
          <div className="vote-stats">
            <div className="vote-count">
              <span className="count-value">
                {prevoteStats.yes} / {prevoteStats.total}
              </span>
              <span className="count-label">Yes Votes</span>
            </div>
            <div className="vote-progress">
              <div
                className={`vote-progress-bar ${
                  prevoteStats.thresholdMet
                    ? "threshold-met"
                    : ""
                }`}
                style={{ width: `${prevoteStats.percentage}%` }}
              />
              <span
                className="threshold-marker"
                style={{ left: `${thresholdPercentage}%` }}
              >
                ⚡
              </span>
            </div>
            <div className="vote-percentage">
              {prevoteStats.percentage}%{" "}
              {prevoteStats.thresholdMet ? (
                <span className="threshold-badge success">
                  ✓ Threshold Met
                </span>
              ) : (
                <span className="threshold-badge">Pending</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Precommit Statistics */}
      {precommitStats && currentStep >= 4 && (
        <div className="inspector-section">
          <h4>✅ Precommits</h4>
          <div className="vote-stats">
            <div className="vote-count">
              <span className="count-value">
                {precommitStats.yes} / {precommitStats.total}
              </span>
              <span className="count-label">Yes Votes</span>
            </div>
            <div className="vote-progress">
              <div
                className={`vote-progress-bar ${
                  precommitStats.thresholdMet
                    ? "threshold-met"
                    : ""
                }`}
                style={{
                  width: `${precommitStats.percentage}%`,
                }}
              />
              <span
                className="threshold-marker"
                style={{ left: `${thresholdPercentage}%` }}
              >
                ⚡
              </span>
            </div>
            <div className="vote-percentage">
              {precommitStats.percentage}%{" "}
              {precommitStats.thresholdMet ? (
                <span className="threshold-badge success">
                  ✓ Threshold Met
                </span>
              ) : (
                <span className="threshold-badge">Pending</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Commit Status */}
      {currentStep >= 6 && stepState.committed !== undefined && (
        <div className="inspector-section">
          <h4>📝 Commit Status</h4>
          <div
            className={`commit-status ${
              stepState.committed ? "success" : "failed"
            }`}
          >
            {stepState.committed ? (
              <>
                <span className="status-icon">✅</span>
                <span className="status-text">
                  Block Committed
                </span>
              </>
            ) : (
              <>
                <span className="status-icon">❌</span>
                <span className="status-text">
                  Consensus Failed - Timeout
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
