import React, { useState } from "react";
import QuorumCertificateViewer from "./QuorumCertificateViewer";

export default function Block({ block, nodes }) {
  const [showQC, setShowQC] = useState(false);

  // Find the proposer node to check if it's Byzantine
  const proposerNode = nodes?.find(
    (n) => n.id === block.proposer
  );
  const isByzantineProposer = proposerNode?.isByzantine || false;

  return (
    <div
      className={`block ${
        block.isMalicious ? "block-malicious" : ""
      } ${
        isByzantineProposer ? "block-byzantine-proposer" : ""
      }`}
      style={{
        borderColor: block.isMalicious
          ? "#ef4444"
          : isByzantineProposer
          ? "#f59e0b"
          : undefined,
        borderWidth: block.isMalicious ? "2px" : undefined,
      }}
    >
      <h4>
        Block #{block.height}
        {isByzantineProposer && " ⚠️"}
        {block.isMalicious && " ❌"}
        {block.commitQC && (
          <span
            className="qc-badge-inline"
            onClick={() => setShowQC(!showQC)}
            style={{
              cursor: "pointer",
              marginLeft: "8px",
              fontSize: "0.8em",
            }}
          >
            🔒 QC
          </span>
        )}
      </h4>
      <p>
        Proposer: Node {block.proposer}
        {isByzantineProposer && " (Byzantine)"}
      </p>
      <p>Tx Count: {block.txCount}</p>
      {block.isMalicious && (
        <p
          style={{
            color: "#ef4444",
            fontSize: "0.85em",
            fontWeight: "bold",
          }}
        >
          Malicious Block (Rejected)
        </p>
      )}
      {showQC && block.commitQC && (
        <div style={{ marginTop: "12px" }}>
          <QuorumCertificateViewer
            qc={block.commitQC}
            stage="precommit"
          />
        </div>
      )}
    </div>
  );
}
