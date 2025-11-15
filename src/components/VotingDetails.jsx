import React from "react";
import { useConsensus } from "../context/ConsensusContext";
import QuorumCertificateViewer from "./QuorumCertificateViewer";

export default function VotingDetails() {
  const {
    selectedRoundForDetails,
    selectRoundForDetails,
    nodes,
    config,
  } = useConsensus();

  if (!selectedRoundForDetails) {
    return null;
  }

  const round = selectedRoundForDetails;
  const voteThreshold =
    config?.consensus?.voteThreshold || 2 / 3;
  const totalNodes = Object.keys(round.prevotesReceived).length;
  const requiredVotes = Math.ceil(totalNodes * voteThreshold);

  const getNodeById = (nodeId) => {
    return nodes.find((n) => n.id === parseInt(nodeId));
  };

  const renderVoteIcon = (vote) => {
    if (vote === true)
      return <span className="vote-icon vote-yes">✓ Yes</span>;
    if (vote === false)
      return <span className="vote-icon vote-no">✗ No</span>;
    return (
      <span className="vote-icon vote-pending">? Pending</span>
    );
  };

  // Check for vote changes between prevote and precommit
  const getVoteChanges = () => {
    const changes = [];
    Object.keys(round.prevotesReceived).forEach((nodeId) => {
      const prevote = round.prevotesReceived[nodeId];
      const precommit = round.precommitsReceived[nodeId];
      if (
        prevote !== precommit &&
        prevote !== null &&
        precommit !== null
      ) {
        changes.push({
          nodeId: parseInt(nodeId),
          prevote,
          precommit,
        });
      }
    });
    return changes;
  };

  const voteChanges = getVoteChanges();

  // Calculate voting timeline (simulated)
  const getVotingTimeline = () => {
    const timeline = [];
    const baseTime = round.timestamp;

    // Add proposal event
    timeline.push({
      time: new Date(baseTime).toLocaleTimeString(),
      event: `Block proposed by Node ${round.proposerId}`,
      type: "proposal",
    });

    // Add prevote events
    Object.entries(round.prevotesReceived).forEach(
      ([nodeId, vote], index) => {
        if (vote !== null) {
          timeline.push({
            time: new Date(
              baseTime + (index + 1) * 100
            ).toLocaleTimeString(),
            event: `Node ${nodeId} prevoted ${
              vote ? "YES" : "NO"
            }`,
            type: vote ? "prevote-yes" : "prevote-no",
          });
        }
      }
    );

    // Add prevote threshold event
    if (round.prevoteThresholdMet) {
      timeline.push({
        time: new Date(baseTime + 1000).toLocaleTimeString(),
        event: `Prevote threshold reached (${round.prevoteCount}/${totalNodes})`,
        type: "threshold",
      });
    }

    // Add precommit events
    Object.entries(round.precommitsReceived).forEach(
      ([nodeId, vote], index) => {
        if (vote !== null) {
          timeline.push({
            time: new Date(
              baseTime + 1500 + (index + 1) * 100
            ).toLocaleTimeString(),
            event: `Node ${nodeId} precommitted ${
              vote ? "YES" : "NO"
            }`,
            type: vote ? "precommit-yes" : "precommit-no",
          });
        }
      }
    );

    // Add final result
    timeline.push({
      time: new Date(baseTime + 3000).toLocaleTimeString(),
      event: `Round ${
        round.result === "approved" ? "APPROVED" : "REJECTED"
      }`,
      type:
        round.result === "approved" ? "approved" : "rejected",
    });

    return timeline;
  };

  const timeline = getVotingTimeline();

  return (
    <div className="voting-details-overlay">
      <div className="voting-details-modal">
        <div className="voting-details-header">
          <h2>
            Round {round.roundNumber} - Detailed Voting
            Information
          </h2>
          <button
            className="close-btn"
            onClick={() => selectRoundForDetails(null)}
          >
            ×
          </button>
        </div>

        <div className="voting-details-content">
          {/* Summary */}
          <div className="details-section">
            <h3>Summary</h3>
            <div className="details-summary">
              <div className="summary-row">
                <span className="summary-label">
                  Round Number:
                </span>
                <span className="summary-value">
                  {round.roundNumber}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Proposer:</span>
                <span className="summary-value">
                  Node {round.proposerId}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Result:</span>
                <span
                  className={`summary-value result-${round.result}`}
                >
                  {round.result.toUpperCase()}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Timestamp:</span>
                <span className="summary-value">
                  {new Date(round.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">
                  Required Votes:
                </span>
                <span className="summary-value">
                  {requiredVotes}/{totalNodes} (
                  {(voteThreshold * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Prevote Phase */}
          <div className="details-section">
            <h3>
              Prevote Phase
              <span
                className={`phase-badge ${
                  round.prevoteThresholdMet
                    ? "threshold-met"
                    : "threshold-not-met"
                }`}
              >
                {round.prevoteThresholdMet
                  ? "✓ Threshold Met"
                  : "✗ Threshold Not Met"}
              </span>
            </h3>
            <div className="vote-details-grid">
              {Object.entries(round.prevotesReceived).map(
                ([nodeId, vote]) => {
                  const node = getNodeById(nodeId);
                  return (
                    <div
                      key={nodeId}
                      className={`vote-detail-item ${
                        node?.isByzantine ? "byzantine-item" : ""
                      }`}
                    >
                      <span className="vote-node-label">
                        Node {nodeId}
                        {node?.isByzantine && (
                          <span className="byzantine-badge-small">
                            Byzantine
                          </span>
                        )}
                      </span>
                      {renderVoteIcon(vote)}
                    </div>
                  );
                }
              )}
            </div>
            <div className="phase-summary">
              Total: {round.prevoteCount}/{totalNodes} yes votes
              (
              {((round.prevoteCount / totalNodes) * 100).toFixed(
                1
              )}
              %)
            </div>
          </div>

          {/* Prevote QC */}
          {round.prevoteQC && (
            <div className="details-section">
              <h3>Prevote Quorum Certificate</h3>
              <QuorumCertificateViewer
                qc={round.prevoteQC}
                stage="prevote"
              />
            </div>
          )}

          {/* Precommit Phase */}
          <div className="details-section">
            <h3>
              Precommit Phase
              <span
                className={`phase-badge ${
                  round.precommitThresholdMet
                    ? "threshold-met"
                    : "threshold-not-met"
                }`}
              >
                {round.precommitThresholdMet
                  ? "✓ Threshold Met"
                  : "✗ Threshold Not Met"}
              </span>
            </h3>
            <div className="vote-details-grid">
              {Object.entries(round.precommitsReceived).map(
                ([nodeId, vote]) => {
                  const node = getNodeById(nodeId);
                  return (
                    <div
                      key={nodeId}
                      className={`vote-detail-item ${
                        node?.isByzantine ? "byzantine-item" : ""
                      }`}
                    >
                      <span className="vote-node-label">
                        Node {nodeId}
                        {node?.isByzantine && (
                          <span className="byzantine-badge-small">
                            Byzantine
                          </span>
                        )}
                      </span>
                      {renderVoteIcon(vote)}
                    </div>
                  );
                }
              )}
            </div>
            <div className="phase-summary">
              Total: {round.precommitCount}/{totalNodes} yes
              votes (
              {(
                (round.precommitCount / totalNodes) *
                100
              ).toFixed(1)}
              %)
            </div>
          </div>

          {/* Precommit QC */}
          {round.precommitQC && (
            <div className="details-section">
              <h3>
                Precommit Quorum Certificate (Commit Proof)
              </h3>
              <QuorumCertificateViewer
                qc={round.precommitQC}
                stage="precommit"
              />
            </div>
          )}

          {/* Vote Changes */}
          {voteChanges.length > 0 && (
            <div className="details-section">
              <h3>⚠️ Vote Changes Detected</h3>
              <div className="vote-changes">
                {voteChanges.map(
                  ({ nodeId, prevote, precommit }) => (
                    <div
                      key={nodeId}
                      className="vote-change-item"
                    >
                      <span className="change-node">
                        Node {nodeId}:
                      </span>
                      <span className="change-detail">
                        Changed from {prevote ? "YES" : "NO"}{" "}
                        (prevote) to {precommit ? "YES" : "NO"}{" "}
                        (precommit)
                      </span>
                    </div>
                  )
                )}
              </div>
              <p className="vote-change-warning">
                Note: Vote changes between phases may indicate
                Byzantine behavior or network issues.
              </p>
            </div>
          )}

          {/* Voting Timeline */}
          <div className="details-section">
            <h3>Voting Timeline</h3>
            <div className="voting-timeline">
              {timeline.map((event, index) => (
                <div
                  key={index}
                  className={`timeline-event timeline-${event.type}`}
                >
                  <span className="timeline-time">
                    {event.time}
                  </span>
                  <span className="timeline-event-text">
                    {event.event}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
