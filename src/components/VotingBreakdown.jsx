import React from "react";
import { useConsensus } from "../context/ConsensusContext";
import QuorumCertificateViewer from "./QuorumCertificateViewer";

export default function VotingBreakdown() {
  const { currentRoundVotes, nodes, config } = useConsensus();

  if (!currentRoundVotes) {
    return (
      <div className="voting-breakdown">
        <h3>Voting Breakdown</h3>
        <p className="no-voting-data">No active voting round</p>
      </div>
    );
  }

  const voteThreshold =
    config?.consensus?.voteThreshold || 2 / 3;
  const totalNodes = Object.keys(
    currentRoundVotes.prevotesReceived
  ).length;
  const requiredVotes = Math.ceil(totalNodes * voteThreshold);

  // Calculate prevote statistics
  const prevoteValues = Object.values(
    currentRoundVotes.prevotesReceived
  );
  const prevoteYes = prevoteValues.filter(
    (v) => v === true
  ).length;
  const prevoteNo = prevoteValues.filter(
    (v) => v === false
  ).length;
  const prevotePending = prevoteValues.filter(
    (v) => v === null
  ).length;
  const prevotePercentage =
    totalNodes > 0
      ? ((prevoteYes / totalNodes) * 100).toFixed(1)
      : 0;

  // Calculate precommit statistics
  const precommitValues = Object.values(
    currentRoundVotes.precommitsReceived
  );
  const precommitYes = precommitValues.filter(
    (v) => v === true
  ).length;
  const precommitNo = precommitValues.filter(
    (v) => v === false
  ).length;
  const precommitPending = precommitValues.filter(
    (v) => v === null
  ).length;
  const precommitPercentage =
    totalNodes > 0
      ? ((precommitYes / totalNodes) * 100).toFixed(1)
      : 0;

  const renderVoteIcon = (vote) => {
    if (vote === true)
      return <span className="vote-icon vote-yes">✓</span>;
    if (vote === false)
      return <span className="vote-icon vote-no">✗</span>;
    return <span className="vote-icon vote-pending">?</span>;
  };

  const getNodeById = (nodeId) => {
    return nodes.find((n) => n.id === nodeId);
  };

  return (
    <div className="voting-breakdown">
      <div className="voting-breakdown-header">
        <h3>
          Voting Breakdown - Round{" "}
          {currentRoundVotes.roundNumber}
        </h3>
        <div className="proposer-info">
          Proposer:{" "}
          <strong>Node {currentRoundVotes.proposerId}</strong>
        </div>
      </div>

      {/* Prevote Phase */}
      <div className="voting-phase">
        <div className="phase-header">
          <h4>Prevote Phase</h4>
          <div
            className={`phase-status ${
              currentRoundVotes.prevoteThresholdMet
                ? "threshold-met"
                : "threshold-not-met"
            }`}
          >
            {currentRoundVotes.prevoteThresholdMet
              ? "✓ Threshold Met"
              : "✗ Threshold Not Met"}
          </div>
        </div>

        <div className="vote-stats">
          <div className="stat-item">
            <span className="stat-label">Yes Votes:</span>
            <span className="stat-value vote-yes-text">
              {prevoteYes}/{totalNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">No Votes:</span>
            <span className="stat-value vote-no-text">
              {prevoteNo}/{totalNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">
              {prevotePending}/{totalNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Required:</span>
            <span className="stat-value threshold-value">
              {requiredVotes}/{totalNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Percentage:</span>
            <span className="stat-value">
              {prevotePercentage}%
            </span>
          </div>
        </div>

        <div className="node-votes">
          {Object.entries(
            currentRoundVotes.prevotesReceived
          ).map(([nodeId, vote]) => {
            const node = getNodeById(parseInt(nodeId));
            return (
              <div
                key={nodeId}
                className={`node-vote-item ${
                  node?.isByzantine ? "byzantine-node" : ""
                }`}
              >
                <span className="node-vote-label">
                  Node {nodeId}
                  {node?.isByzantine && (
                    <span className="byzantine-badge">
                      Byzantine
                    </span>
                  )}
                </span>
                {renderVoteIcon(vote)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prevote QC Display */}
      {currentRoundVotes.prevoteQC && (
        <QuorumCertificateViewer
          qc={currentRoundVotes.prevoteQC}
          stage="prevote"
          compact={true}
        />
      )}

      {/* Precommit Phase */}
      <div className="voting-phase">
        <div className="phase-header">
          <h4>Precommit Phase</h4>
          <div
            className={`phase-status ${
              currentRoundVotes.precommitThresholdMet
                ? "threshold-met"
                : "threshold-not-met"
            }`}
          >
            {currentRoundVotes.precommitThresholdMet
              ? "✓ Threshold Met"
              : "✗ Threshold Not Met"}
          </div>
        </div>

        <div className="vote-stats">
          <div className="stat-item">
            <span className="stat-label">Yes Votes:</span>
            <span className="stat-value vote-yes-text">
              {precommitYes}/{totalNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">No Votes:</span>
            <span className="stat-value vote-no-text">
              {precommitNo}/{totalNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending:</span>
            <span className="stat-value">
              {precommitPending}/{totalNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Required:</span>
            <span className="stat-value threshold-value">
              {requiredVotes}/{totalNodes}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Percentage:</span>
            <span className="stat-value">
              {precommitPercentage}%
            </span>
          </div>
        </div>

        <div className="node-votes">
          {Object.entries(
            currentRoundVotes.precommitsReceived
          ).map(([nodeId, vote]) => {
            const node = getNodeById(parseInt(nodeId));
            return (
              <div
                key={nodeId}
                className={`node-vote-item ${
                  node?.isByzantine ? "byzantine-node" : ""
                }`}
              >
                <span className="node-vote-label">
                  Node {nodeId}
                  {node?.isByzantine && (
                    <span className="byzantine-badge">
                      Byzantine
                    </span>
                  )}
                </span>
                {renderVoteIcon(vote)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Precommit QC Display */}
      {currentRoundVotes.precommitQC && (
        <QuorumCertificateViewer
          qc={currentRoundVotes.precommitQC}
          stage="precommit"
          compact={true}
        />
      )}

      <div className="voting-threshold-info">
        <p>
          <strong>Byzantine Fault Tolerance:</strong> Requires{" "}
          {(voteThreshold * 100).toFixed(0)}% ({requiredVotes}/
          {totalNodes} nodes) for consensus
        </p>
      </div>
    </div>
  );
}
