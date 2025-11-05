import React, { useState } from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function VotingHistory() {
  const {
    votingHistory,
    selectRoundForDetails,
    toggleVotingHistory,
  } = useConsensus();
  const [sortBy, setSortBy] = useState("roundNumber");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterResult, setFilterResult] = useState("all");

  if (votingHistory.length === 0) {
    return (
      <div className="voting-history-overlay">
        <div className="voting-history-panel">
          <div className="voting-history-header">
            <h2>Voting History</h2>
            <button
              className="close-btn"
              onClick={toggleVotingHistory}
            >
              ×
            </button>
          </div>
          <div className="voting-history-content">
            <p className="no-history">
              No voting rounds recorded yet. Start the simulation
              to see voting history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter and sort voting history
  let filteredHistory = [...votingHistory];

  if (filterResult !== "all") {
    filteredHistory = filteredHistory.filter(
      (round) => round.result === filterResult
    );
  }

  filteredHistory.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "roundNumber") {
      comparison = a.roundNumber - b.roundNumber;
    } else if (sortBy === "proposerId") {
      comparison = a.proposerId - b.proposerId;
    } else if (sortBy === "prevoteCount") {
      comparison = a.prevoteCount - b.prevoteCount;
    } else if (sortBy === "precommitCount") {
      comparison = a.precommitCount - b.precommitCount;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate statistics
  const approvedRounds = votingHistory.filter(
    (r) => r.result === "approved"
  ).length;
  const rejectedRounds = votingHistory.filter(
    (r) => r.result === "rejected"
  ).length;
  const successRate =
    votingHistory.length > 0
      ? ((approvedRounds / votingHistory.length) * 100).toFixed(
          1
        )
      : 0;

  const avgPrevotes =
    votingHistory.length > 0
      ? (
          votingHistory.reduce(
            (sum, r) => sum + r.prevoteCount,
            0
          ) / votingHistory.length
        ).toFixed(1)
      : 0;

  const avgPrecommits =
    votingHistory.length > 0
      ? (
          votingHistory.reduce(
            (sum, r) => sum + r.precommitCount,
            0
          ) / votingHistory.length
        ).toFixed(1)
      : 0;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleRowClick = (round) => {
    selectRoundForDetails(round);
  };

  return (
    <div className="voting-history-overlay">
      <div className="voting-history-panel">
        <div className="voting-history-header">
          <h2>Voting History</h2>
          <button
            className="close-btn"
            onClick={toggleVotingHistory}
          >
            ×
          </button>
        </div>

        {/* Statistics Summary */}
        <div className="history-stats">
          <div className="stat-card">
            <div className="stat-label">Total Rounds</div>
            <div className="stat-value">
              {votingHistory.length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Success Rate</div>
            <div className="stat-value stat-success">
              {successRate}%
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value stat-approved">
              {approvedRounds}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rejected</div>
            <div className="stat-value stat-rejected">
              {rejectedRounds}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Prevotes</div>
            <div className="stat-value">{avgPrevotes}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Precommits</div>
            <div className="stat-value">{avgPrecommits}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="history-filters">
          <label>
            Filter by Result:
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        {/* History Table */}
        <div className="voting-history-content">
          <table className="history-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("roundNumber")}>
                  Round{" "}
                  {sortBy === "roundNumber" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("proposerId")}>
                  Proposer{" "}
                  {sortBy === "proposerId" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("prevoteCount")}>
                  Prevotes{" "}
                  {sortBy === "prevoteCount" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("precommitCount")}>
                  Precommits{" "}
                  {sortBy === "precommitCount" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((round) => (
                <tr
                  key={round.roundNumber}
                  onClick={() => handleRowClick(round)}
                  className="history-row"
                >
                  <td>{round.roundNumber}</td>
                  <td>Node {round.proposerId}</td>
                  <td>
                    <span
                      className={
                        round.prevoteThresholdMet
                          ? "threshold-met-text"
                          : "threshold-not-met-text"
                      }
                    >
                      {round.prevoteCount}/
                      {
                        Object.keys(round.prevotesReceived)
                          .length
                      }
                      {round.prevoteThresholdMet && " ✓"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        round.precommitThresholdMet
                          ? "threshold-met-text"
                          : "threshold-not-met-text"
                      }
                    >
                      {round.precommitCount}/
                      {
                        Object.keys(round.precommitsReceived)
                          .length
                      }
                      {round.precommitThresholdMet && " ✓"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`result-badge result-${round.result}`}
                    >
                      {round.result}
                    </span>
                  </td>
                  <td className="time-column">
                    {new Date(
                      round.timestamp
                    ).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
