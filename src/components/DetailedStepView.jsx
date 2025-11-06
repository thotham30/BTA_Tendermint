import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function DetailedStepView() {
  const { stepMode, stepState, currentStep, nodes } =
    useConsensus();

  if (!stepMode || !stepState) {
    return null;
  }

  // Don't show details for early steps
  if (currentStep < 2) {
    return null;
  }

  const renderVoteTable = (votes, voteType) => {
    if (!votes) return null;

    return (
      <div className="vote-table">
        <h4>{voteType}</h4>
        <table>
          <thead>
            <tr>
              <th>Node ID</th>
              <th>Status</th>
              <th>Vote</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(votes).map(([nodeId, vote]) => {
              const node = nodes.find(
                (n) => n.id === parseInt(nodeId)
              );
              return (
                <tr
                  key={nodeId}
                  className={
                    vote === true
                      ? "vote-yes"
                      : vote === false
                      ? "vote-no"
                      : "vote-null"
                  }
                >
                  <td>
                    <span className="node-id-badge">
                      Node {nodeId}
                    </span>
                  </td>
                  <td>
                    {node?.isOnline ? (
                      <span className="status-online">●</span>
                    ) : (
                      <span className="status-offline">○</span>
                    )}
                  </td>
                  <td>
                    {vote === true ? (
                      <span className="vote-badge yes">
                        ✓ Yes
                      </span>
                    ) : vote === false ? (
                      <span className="vote-badge no">✗ No</span>
                    ) : (
                      <span className="vote-badge null">
                        - No Vote
                      </span>
                    )}
                  </td>
                  <td>
                    {node?.isByzantine ? (
                      <span className="type-badge byzantine">
                        Byzantine
                      </span>
                    ) : (
                      <span className="type-badge honest">
                        Honest
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="detailed-step-view">
      <h3>📊 Detailed Vote Breakdown</h3>

      {/* Prevote Details */}
      {stepState.votingRound && currentStep >= 2 && (
        <div className="vote-section">
          {renderVoteTable(
            stepState.votingRound.prevotesReceived,
            "Prevote Results"
          )}
          <div className="vote-summary">
            <div className="summary-stat">
              <span className="stat-label">Total Prevotes:</span>
              <span className="stat-value">
                {stepState.votingRound.prevoteCount}
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Threshold:</span>
              <span
                className={`stat-value ${
                  stepState.votingRound.prevoteThresholdMet
                    ? "success"
                    : "warning"
                }`}
              >
                {stepState.votingRound.prevoteThresholdMet
                  ? "✓ Met"
                  : "✗ Not Met"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Precommit Details */}
      {stepState.votingRound && currentStep >= 4 && (
        <div className="vote-section">
          {renderVoteTable(
            stepState.votingRound.precommitsReceived,
            "Precommit Results"
          )}
          <div className="vote-summary">
            <div className="summary-stat">
              <span className="stat-label">
                Total Precommits:
              </span>
              <span className="stat-value">
                {stepState.votingRound.precommitCount}
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Threshold:</span>
              <span
                className={`stat-value ${
                  stepState.votingRound.precommitThresholdMet
                    ? "success"
                    : "warning"
                }`}
              >
                {stepState.votingRound.precommitThresholdMet
                  ? "✓ Met"
                  : "✗ Not Met"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Node States */}
      <div className="node-states-section">
        <h4>Node States</h4>
        <div className="node-states-grid">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`node-state-card ${
                node.isByzantine ? "byzantine" : ""
              } ${
                stepState.highlightedNodes.includes(node.id)
                  ? "highlighted"
                  : ""
              }`}
            >
              <div className="node-state-header">
                <span className="node-state-id">
                  Node {node.id}
                </span>
                {node.isByzantine && (
                  <span className="byzantine-indicator">⚠️</span>
                )}
              </div>
              <div className="node-state-info">
                <span className="state-label">State:</span>
                <span
                  className={`state-value state-${node.state.toLowerCase()}`}
                >
                  {node.state}
                </span>
              </div>
              <div className="node-state-info">
                <span className="state-label">Online:</span>
                <span
                  className={`state-value ${
                    node.isOnline ? "online" : "offline"
                  }`}
                >
                  {node.isOnline ? "✓" : "✗"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
