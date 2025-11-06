import React from "react";

export default function Block({ block, nodes }) {
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
    </div>
  );
}
