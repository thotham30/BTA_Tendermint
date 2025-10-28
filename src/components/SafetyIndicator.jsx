
import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function SafetyIndicator() {
  const { safety } = useConsensus();

  return (
    <div
      className="indicator"
      style={{
        backgroundColor: safety ? "blue" : "orange",
      }}
    >
      <h4>Safety: {safety ? "Maintained ✅" : "Violated ⚠️"}</h4>
    </div>
  );
}
