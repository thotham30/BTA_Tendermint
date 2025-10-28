import React from "react";

export default function Block({ block }) {
  return (
    <div className="block">
      <h4>Block #{block.height}</h4>
      <p>Proposer: Node {block.proposer}</p>
      <p>Tx Count: {block.txCount}</p>
    </div>
  );
}
