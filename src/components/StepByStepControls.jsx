import React, { useEffect } from "react";
import { useConsensus } from "../context/ConsensusContext";
import { getTotalSteps } from "../utils/tendermintLogic";
import { executeStepMode } from "../utils/NetworkSimulation";
import { STEP_MODE_CONFIG } from "../utils/ConfigManager";

export default function StepByStepControls() {
  const {
    stepMode,
    currentStep,
    stepHistory,
    autoPlaySteps,
    nodes,
    blocks,
    config,
    stepState,
    nextStep,
    previousStep,
    goToRoundStart,
    toggleAutoPlaySteps,
    updateStepState,
    updateStepDescription,
    updateHighlightedNodes,
    updateNodes,
    addBlock,
    addLog,
    updateCurrentRoundVotes,
    finalizeRound,
  } = useConsensus();

  const totalSteps = getTotalSteps();

  // Execute step when currentStep changes
  useEffect(() => {
    if (!stepMode) return;

    const result = executeStepMode(
      currentStep,
      nodes,
      blocks,
      config,
      stepState
    );

    updateStepState(result.stepState);
    updateStepDescription(result.stepState.description);
    updateHighlightedNodes(result.stepState.highlightedNodes);

    // Update nodes with step-specific states
    if (result.updatedNodes) {
      updateNodes(result.updatedNodes);
    }

    // Update voting round if available
    if (result.votingRound && updateCurrentRoundVotes) {
      updateCurrentRoundVotes(result.votingRound);
    }

    // Commit block if this is the commit step and block was committed
    if (result.committed && result.newBlock) {
      addBlock(result.newBlock);
      if (finalizeRound && result.votingRound) {
        finalizeRound(result.votingRound);
      }
    }

    // Log the step
    addLog(
      `Step ${currentStep + 1}/${totalSteps}: ${
        result.stepState.description
      }`,
      "info"
    );
  }, [currentStep, stepMode]);

  // Auto-play steps
  useEffect(() => {
    if (!autoPlaySteps || !stepMode) return;

    const interval = setInterval(() => {
      if (currentStep < totalSteps - 1) {
        nextStep();
      } else {
        toggleAutoPlaySteps(); // Stop at end
      }
    }, STEP_MODE_CONFIG.autoPlayDelay);

    return () => clearInterval(interval);
  }, [autoPlaySteps, currentStep, stepMode, totalSteps]);

  if (!stepMode) return null;

  return (
    <div className="step-controls">
      <div className="step-info">
        <h3>Step-by-Step Mode</h3>
        <div className="step-progress">
          <span className="step-counter">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentStep + 1) / totalSteps) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="step-buttons">
        <button
          onClick={goToRoundStart}
          disabled={currentStep === 0}
          className="step-btn"
          title="Go to round start"
        >
          ⏮️ Start
        </button>
        <button
          onClick={previousStep}
          disabled={stepHistory.length === 0}
          className="step-btn"
          title="Previous step"
        >
          ⬅️ Previous
        </button>
        <button
          onClick={toggleAutoPlaySteps}
          className={`step-btn ${autoPlaySteps ? "active" : ""}`}
          title="Auto-play steps"
        >
          {autoPlaySteps ? "⏸️ Pause" : "▶️ Auto"}
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep >= totalSteps - 1}
          className="step-btn"
          title="Next step"
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
}
