import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function Controls() {
  const { isRunning, startConsensus, stopConsensus, resetNetwork } = useConsensus();

  return (
    <div className="controls">
      {!isRunning ? (
        <button onClick={startConsensus} className="start-btn">Start</button>
      ) : (
        <button onClick={stopConsensus} className="stop-btn">Pause</button>
      )}
      <button onClick={resetNetwork} className="reset-btn">Reset</button>
    </div>
  );
}
