# Step-by-Step Mode - Quick Reference

## 🎯 Quick Start

1. Click **"👣 Step-by-Step"** button in Controls
2. Use **Next ➡️** to advance through steps
3. View state in **State Inspector** panel
4. Check detailed votes in **Detailed Step View**

## 📋 8 Consensus Steps

| #   | Step            | Phase    | Color     |
| --- | --------------- | -------- | --------- |
| 0   | Round Start     | Init     | 🟣 Purple |
| 1   | Block Proposal  | Proposal | 🟡 Yellow |
| 2   | Prevote         | Voting   | 🔵 Blue   |
| 3   | Prevote Tally   | Voting   | 🔵 Blue   |
| 4   | Precommit       | Voting   | 🔵 Blue   |
| 5   | Precommit Tally | Voting   | 🔵 Blue   |
| 6   | Commit          | Commit   | 🟢 Green  |
| 7   | Round Complete  | Complete | ⚫ Gray   |

## 🎮 Controls

| Button      | Action                     |
| ----------- | -------------------------- |
| ⏮️ Start    | Jump to Round Start        |
| ⬅️ Previous | Go back one step           |
| ▶️ Auto     | Auto-play steps (2s delay) |
| ⏸️ Pause    | Stop auto-play             |
| Next ➡️     | Advance to next step       |

## 📊 State Inspector Shows

- ✅ Current step description
- 👤 Proposer node
- 📦 Block details (height, txs, hash)
- 🌐 Network stats (nodes, online, Byzantine)
- 🗳️ Prevote counts & threshold
- ✅ Precommit counts & threshold
- 📝 Commit status

## 🔍 Detailed Step View Shows

- 📋 Vote tables (prevotes & precommits)
- 🎯 Node-by-node breakdown
- ⚠️ Byzantine node identification
- 🟢 Yes/❌ No/➖ No Vote indicators
- 💻 Node state cards

## 🎨 Visual Indicators

- **Golden Glow**: Highlighted active nodes
- **Pulsing Border**: Node currently participating
- **Progress Bar**: Vote threshold visualization
- **⚡ Threshold Marker**: 2/3+ line indicator
- **Phase Badge**: Current consensus phase

## 💡 Common Use Cases

### Teaching

1. Enable step mode
2. Use Next to walk through each phase
3. Explain State Inspector data at each step
4. Show vote tables for transparency

### Debugging

1. Enable step mode
2. Advance to failed step
3. Check Detailed Step View for missing votes
4. Identify offline or Byzantine nodes

### Presenting

1. Enable step mode
2. Use Auto-play for smooth progression
3. Pause at key steps to explain
4. Use Previous to review important phases

## 🔧 Key Components

### New Components

- `StepByStepControls.jsx` - Navigation controls
- `StateInspector.jsx` - Step state display
- `DetailedStepView.jsx` - Vote breakdowns

### Modified Components

- `ConsensusContext.jsx` - Added step state
- `Controls.jsx` - Added mode selector
- `ConsensusVisualizer.jsx` - Added highlighting
- `Node.jsx` - Added highlight support
- `App.jsx` - Added step mode layout

### Utilities

- `tendermintLogic.js` - Step definitions & execution
- `NetworkSimulation.js` - Step mode support

## 📝 State Structure

```javascript
// Step-by-step state
{
  stepMode: boolean,
  currentStep: 0-7,
  stepHistory: [...],
  stepDescription: string,
  autoPlaySteps: boolean,
  stepState: {
    step: number,
    description: string,
    phase: string,
    proposer: object,
    highlightedNodes: [ids],
    block: object,
    votingRound: object,
    nodes: [...]
  }
}
```

## 🎯 Step Execution Flow

1. User clicks Next
2. `nextStep()` increments `currentStep`
3. `useEffect` triggers in StepByStepControls
4. `executeStepMode()` called with current step
5. `executeConsensusStep()` returns new state
6. Context updates with new state
7. Components re-render with new data

## 🚀 Tips & Tricks

- **Reset Anytime**: Click Reset to start fresh
- **Switch Modes**: Toggle between Continuous and Step-by-Step
- **Auto-Play Speed**: 2 seconds per step (hardcoded)
- **History Depth**: Unlimited step history
- **Phase Colors**: Help identify current consensus phase
- **Threshold Visual**: Watch progress bar fill to threshold marker

## ⚠️ Important Notes

- Step mode disables continuous simulation
- Speed controls hidden in step mode
- Logs show at bottom in step mode
- History allows undo to previous steps
- Byzantine nodes always shown in red
- Vote tables appear from Step 2 onwards

## 🔗 Related Documentation

- `STEP_BY_STEP_MODE_GUIDE.md` - Complete implementation guide
- `README.md` - Project overview with step mode features
- `QUICK_REFERENCE.md` - General project reference

---

**Version**: 2.0.0  
**Feature**: Step-by-Step Mode  
**Updated**: November 6, 2025
