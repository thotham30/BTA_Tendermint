import React from "react";
import { useConsensus } from "../context/ConsensusContext";

export default function Controls() {
  const {
    isRunning,
    speed,
    startConsensus,
    stopConsensus,
    resetNetwork,
    changeSpeed,
  } = useConsensus();

  const speedOptions = [
    { label: "0.25x", value: 0.25 },
    { label: "0.5x", value: 0.5 },
    { label: "1x", value: 1 },
    { label: "2x", value: 2 },
    { label: "4x", value: 4 },
  ];

  return (
    <div className="controls">
      <div className="control-buttons">
        {!isRunning ? (
          <button onClick={startConsensus} className="start-btn">
            Start
          </button>
        ) : (
          <button onClick={stopConsensus} className="stop-btn">
            Pause
          </button>
        )}
        <button onClick={resetNetwork} className="reset-btn">
          Reset
        </button>
      </div>

      <div className="speed-controls">
        <label>Speed:</label>
        {speedOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => changeSpeed(option.value)}
            className={`speed-btn ${
              speed === option.value ? "active" : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
