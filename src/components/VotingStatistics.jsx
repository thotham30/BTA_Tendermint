import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function VotingStatistics() {
  const { votingHistory, nodes } = useConsensus();

  if (votingHistory.length === 0) {
    return (
      <div className="voting-statistics">
        <h3>Voting Statistics</h3>
        <p className="no-stats">No voting data available yet.</p>
      </div>
    );
  }

  // Calculate overall statistics
  const totalRounds = votingHistory.length;
  const approvedRounds = votingHistory.filter(
    (r) => r.result === "approved"
  ).length;
  const rejectedRounds = votingHistory.filter(
    (r) => r.result === "rejected"
  ).length;
  const successRate = (
    (approvedRounds / totalRounds) *
    100
  ).toFixed(1);

  // Calculate average votes
  const avgPrevotes = (
    votingHistory.reduce((sum, r) => sum + r.prevoteCount, 0) /
    totalRounds
  ).toFixed(2);
  const avgPrecommits = (
    votingHistory.reduce((sum, r) => sum + r.precommitCount, 0) /
    totalRounds
  ).toFixed(2);

  // Node voting reliability
  const nodeVotingStats = {};
  nodes.forEach((node) => {
    nodeVotingStats[node.id] = {
      prevotesCast: 0,
      precommitsCast: 0,
      prevoteYes: 0,
      precommitYes: 0,
      totalPossible: totalRounds,
    };
  });

  votingHistory.forEach((round) => {
    Object.entries(round.prevotesReceived).forEach(
      ([nodeId, vote]) => {
        if (vote !== null && nodeVotingStats[nodeId]) {
          nodeVotingStats[nodeId].prevotesCast++;
          if (vote === true)
            nodeVotingStats[nodeId].prevoteYes++;
        }
      }
    );

    Object.entries(round.precommitsReceived).forEach(
      ([nodeId, vote]) => {
        if (vote !== null && nodeVotingStats[nodeId]) {
          nodeVotingStats[nodeId].precommitsCast++;
          if (vote === true)
            nodeVotingStats[nodeId].precommitYes++;
        }
      }
    );
  });

  // Detect anomalies
  const detectAnomalies = () => {
    const anomalies = [];

    // Check for nodes that never vote
    Object.entries(nodeVotingStats).forEach(
      ([nodeId, stats]) => {
        const participation = (
          (stats.prevotesCast / stats.totalPossible) *
          100
        ).toFixed(0);

        if (
          stats.prevotesCast === 0 &&
          stats.totalPossible > 0
        ) {
          anomalies.push({
            type: "silent",
            nodeId,
            description: `Node ${nodeId} has not cast any votes in ${stats.totalPossible} rounds`,
          });
        } else if (
          participation < 50 &&
          stats.totalPossible >= 3
        ) {
          anomalies.push({
            type: "low-participation",
            nodeId,
            description: `Node ${nodeId} has low participation rate (${participation}%)`,
          });
        }

        // Check for always voting no
        if (stats.prevotesCast > 3 && stats.prevoteYes === 0) {
          anomalies.push({
            type: "always-no",
            nodeId,
            description: `Node ${nodeId} always votes NO (potential Byzantine behavior)`,
          });
        }

        // Check for conflicting votes (vote changes between prevote and precommit)
        let voteChanges = 0;
        votingHistory.forEach((round) => {
          const prevote = round.prevotesReceived[nodeId];
          const precommit = round.precommitsReceived[nodeId];
          if (
            prevote !== null &&
            precommit !== null &&
            prevote !== precommit
          ) {
            voteChanges++;
          }
        });

        if (voteChanges > 0) {
          anomalies.push({
            type: "conflicting",
            nodeId,
            description: `Node ${nodeId} changed votes ${voteChanges} time(s) between prevote and precommit`,
          });
        }
      }
    );

    return anomalies;
  };

  const anomalies = detectAnomalies();

  // Vote distribution analysis
  const voteDistribution = {
    prevoteYes: 0,
    prevoteNo: 0,
    prevotePending: 0,
    precommitYes: 0,
    precommitNo: 0,
    precommitPending: 0,
  };

  votingHistory.forEach((round) => {
    Object.values(round.prevotesReceived).forEach((vote) => {
      if (vote === true) voteDistribution.prevoteYes++;
      else if (vote === false) voteDistribution.prevoteNo++;
      else voteDistribution.prevotePending++;
    });

    Object.values(round.precommitsReceived).forEach((vote) => {
      if (vote === true) voteDistribution.precommitYes++;
      else if (vote === false) voteDistribution.precommitNo++;
      else voteDistribution.precommitPending++;
    });
  });

  return (
    <div className="voting-statistics">
      <h3>Voting Statistics & Analysis</h3>

      {/* Overall Stats */}
      <div className="stats-section">
        <h4>Overall Performance</h4>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-box-label">Total Rounds</div>
            <div className="stat-box-value">{totalRounds}</div>
          </div>
          <div className="stat-box stat-success-box">
            <div className="stat-box-label">Success Rate</div>
            <div className="stat-box-value">{successRate}%</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Approved</div>
            <div className="stat-box-value stat-approved">
              {approvedRounds}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Rejected</div>
            <div className="stat-box-value stat-rejected">
              {rejectedRounds}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Avg Prevotes</div>
            <div className="stat-box-value">{avgPrevotes}</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Avg Precommits</div>
            <div className="stat-box-value">{avgPrecommits}</div>
          </div>
        </div>
      </div>

      {/* Vote Distribution */}
      <div className="stats-section">
        <h4>Vote Distribution</h4>
        <div className="distribution-grid">
          <div className="distribution-item">
            <span className="distribution-label">
              Prevote YES:
            </span>
            <span className="distribution-value vote-yes-text">
              {voteDistribution.prevoteYes}
            </span>
          </div>
          <div className="distribution-item">
            <span className="distribution-label">
              Prevote NO:
            </span>
            <span className="distribution-value vote-no-text">
              {voteDistribution.prevoteNo}
            </span>
          </div>
          <div className="distribution-item">
            <span className="distribution-label">
              Prevote Pending:
            </span>
            <span className="distribution-value">
              {voteDistribution.prevotePending}
            </span>
          </div>
          <div className="distribution-item">
            <span className="distribution-label">
              Precommit YES:
            </span>
            <span className="distribution-value vote-yes-text">
              {voteDistribution.precommitYes}
            </span>
          </div>
          <div className="distribution-item">
            <span className="distribution-label">
              Precommit NO:
            </span>
            <span className="distribution-value vote-no-text">
              {voteDistribution.precommitNo}
            </span>
          </div>
          <div className="distribution-item">
            <span className="distribution-label">
              Precommit Pending:
            </span>
            <span className="distribution-value">
              {voteDistribution.precommitPending}
            </span>
          </div>
        </div>
      </div>

      {/* Node Reliability */}
      <div className="stats-section">
        <h4>Node Voting Reliability</h4>
        <div className="reliability-table">
          <table>
            <thead>
              <tr>
                <th>Node</th>
                <th>Participation</th>
                <th>Prevotes</th>
                <th>Precommits</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(nodeVotingStats).map(
                ([nodeId, stats]) => {
                  const participation = (
                    (stats.prevotesCast / stats.totalPossible) *
                    100
                  ).toFixed(0);
                  const node = nodes.find(
                    (n) => n.id === parseInt(nodeId)
                  );
                  return (
                    <tr
                      key={nodeId}
                      className={
                        node?.isByzantine ? "byzantine-row" : ""
                      }
                    >
                      <td>
                        Node {nodeId}
                        {node?.isByzantine && (
                          <span className="byzantine-badge-small">
                            B
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            participation >= 80
                              ? "participation-high"
                              : participation >= 50
                              ? "participation-medium"
                              : "participation-low"
                          }
                        >
                          {participation}%
                        </span>
                      </td>
                      <td>
                        {stats.prevoteYes}/{stats.prevotesCast}
                      </td>
                      <td>
                        {stats.precommitYes}/
                        {stats.precommitsCast}
                      </td>
                      <td>
                        {stats.prevotesCast === 0 ? (
                          <span className="status-badge status-silent">
                            Silent
                          </span>
                        ) : participation >= 80 ? (
                          <span className="status-badge status-reliable">
                            Reliable
                          </span>
                        ) : (
                          <span className="status-badge status-unreliable">
                            Unreliable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <div className="stats-section anomalies-section">
          <h4>⚠️ Detected Anomalies ({anomalies.length})</h4>
          <div className="anomalies-list">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className={`anomaly-item anomaly-${anomaly.type}`}
              >
                <span className="anomaly-type">
                  {anomaly.type.toUpperCase()}
                </span>
                <span className="anomaly-description">
                  {anomaly.description}
                </span>
              </div>
            ))}
          </div>
          <p className="anomaly-note">
            <strong>Note:</strong> Anomalies may indicate
            Byzantine nodes, network issues, or intentional
            malicious behavior.
          </p>
        </div>
      )}
    </div>
  );
}
