import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function LivenessIndicator() {
  const { liveness } = useConsensus();

  return (
    <div
      className="indicator"
      style={{
        backgroundColor: liveness ? "green" : "red",
      }}
    >
      <h4>Liveness: {liveness ? "Maintained ✅" : "Violated ⚠️"}</h4>
    </div>
  );
}
