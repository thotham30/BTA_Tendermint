# Step-by-Step Mode Implementation Guide

## Overview

The Tendermint Protocol Visualizer now includes a comprehensive **Step-by-Step Mode** that allows users to advance through the consensus process one action at a time. This educational feature is perfect for learning, debugging, and presenting the Tendermint consensus algorithm.

## Features

### 1. **Mode Selection**

- Toggle between **Continuous Mode** (automatic execution) and **Step-by-Step Mode** (manual control)
- Located at the top of the Controls panel
- Easy switching with visual indicators

### 2. **Eight Consensus Steps**

Each consensus round is broken down into 8 distinct steps:

| Step | Name            | Description                           | Phase          |
| ---- | --------------- | ------------------------------------- | -------------- |
| 0    | Round Start     | Initialize round and select proposer  | Initialization |
| 1    | Block Proposal  | Proposer creates and broadcasts block | Proposal       |
| 2    | Prevote         | Validators vote on the proposed block | Voting         |
| 3    | Prevote Tally   | Count prevotes and check if > 2/3     | Voting         |
| 4    | Precommit       | Validators commit to the block        | Voting         |
| 5    | Precommit Tally | Count precommits and check if > 2/3   | Voting         |
| 6    | Commit          | Block is finalized and added to chain | Commit         |
| 7    | Round Complete  | Reset for next round                  | Complete       |

### 3. **Step Navigation Controls**

The **StepByStepControls** component provides:

- **⏮️ Start**: Jump to the beginning of the current round
- **⬅️ Previous**: Undo to the previous step (uses step history)
- **▶️ Auto / ⏸️ Pause**: Auto-play through steps with 2-second intervals
- **Next ➡️**: Advance to the next step
- **Progress Bar**: Visual indication of current step position

### 4. **State Inspector**

The **StateInspector** component displays:

- **Current Step Description**: Clear explanation of what's happening
- **Phase Badge**: Color-coded indicator (Initialization, Proposal, Voting, Commit, Complete)
- **Proposer Information**: Which node is proposing the current block
- **Block Details**: Height, transaction count, and hash
- **Network Status**: Total nodes, online nodes, Byzantine nodes, vote threshold
- **Prevote Statistics**: Vote count, percentage, threshold status with visual progress bar
- **Precommit Statistics**: Vote count, percentage, threshold status with visual progress bar
- **Commit Status**: Success or failure indicator

### 5. **Detailed Step View**

The **DetailedStepView** component shows:

- **Vote Tables**: Complete breakdown of prevotes and precommits
  - Node ID
  - Online/Offline status
  - Vote (Yes/No/No Vote)
  - Node type (Honest/Byzantine)
- **Vote Summary**: Quick statistics on vote counts and thresholds
- **Node State Cards**: Grid display of all nodes with:
  - Current state (Idle, Voting, Committed, etc.)
  - Online status
  - Byzantine indicator
  - Highlighting for active nodes

### 6. **Visual Enhancements**

- **Node Highlighting**: Active nodes glow with golden borders
- **Phase Color-Coding**:
  - 🟣 **Purple** - Initialization
  - 🟡 **Yellow** - Proposal
  - 🔵 **Blue** - Voting
  - 🟢 **Green** - Commit
  - ⚫ **Gray** - Complete
- **Pulse Animation**: Highlighted nodes pulse to draw attention
- **Progress Bars**: Visual representation of vote thresholds
- **Threshold Markers**: Gold markers showing the 2/3+ threshold line

### 7. **Layout Changes**

When in Step-by-Step Mode:

- **Split Layout**: Visualizer on left, Inspector & Details on right
- **Step Controls**: Prominently displayed above the main content
- **Logs**: Moved to bottom in compact view
- **Responsive**: Adapts to different screen sizes

## Usage Instructions

### Getting Started

1. **Launch the Application**

   ```bash
   npm run dev
   ```

2. **Select Step-by-Step Mode**

   - Click the "👣 Step-by-Step" button in the Mode Selection area
   - The interface will automatically switch to step mode layout

3. **Navigate Through Steps**

   - Click "Next ➡️" to advance to the next consensus step
   - Watch the State Inspector update with current step information
   - Observe node highlighting and phase changes

4. **Review Step Details**

   - Check the State Inspector for vote counts and thresholds
   - Scroll through the Detailed Step View for complete vote breakdowns
   - Monitor node states in the Node State Cards

5. **Use Auto-Play**

   - Click "▶️ Auto" to automatically advance through steps
   - Steps progress every 2 seconds
   - Click "⏸️ Pause" to stop auto-play

6. **Go Back**
   - Click "⬅️ Previous" to undo to the previous step
   - Use step history to review earlier phases
   - Click "⏮️ Start" to jump to Round Start

### Educational Use

Step-by-Step Mode is ideal for:

1. **Teaching Consensus**

   - Walk through each phase of Tendermint consensus
   - Explain how votes are collected and tallied
   - Demonstrate threshold requirements (2/3+)

2. **Understanding Byzantine Nodes**

   - Observe how Byzantine nodes vote differently
   - See the impact on consensus success
   - Identify Byzantine behavior in vote tables

3. **Debugging Network Issues**

   - Step through failed consensus rounds
   - Identify where votes are missing
   - Understand timeout conditions

4. **Demonstrating Liveness & Safety**
   - Show how consensus maintains safety with Byzantine nodes
   - Demonstrate liveness with network issues
   - Explain the role of vote thresholds

## Technical Architecture

### State Management

Step-by-Step Mode adds the following state to `ConsensusContext`:

- `stepMode`: Boolean flag for mode activation
- `currentStep`: Current step number (0-7)
- `stepHistory`: Array of previous states for undo
- `stepDescription`: Human-readable description of current step
- `autoPlaySteps`: Boolean for auto-play mode
- `stepState`: Detailed state object for current step
- `highlightedNodes`: Array of node IDs to highlight

### Step Execution

The `executeConsensusStep` function in `tendermintLogic.js`:

1. Takes the current step number and previous state
2. Executes the logic for that specific step
3. Returns updated node states, votes, and metadata
4. Updates are applied to the context

### Component Hierarchy

```
App
├── StepByStepControls (step mode only)
├── Main Content
│   ├── ConsensusVisualizer (with node highlighting)
│   └── Controls (with mode selection)
└── Right Panel (step mode only)
    ├── StateInspector
    └── DetailedStepView
```

## Phase Descriptions

### Initialization Phase (Purple)

**Step 0: Round Start**

- Proposer is selected using round-robin
- All nodes reset to Idle state
- Voting round is initialized

### Proposal Phase (Yellow)

**Step 1: Block Proposal**

- Selected proposer creates a new block
- Block includes transaction count and hash
- Proposer node is highlighted
- Block is broadcast to all validators

### Voting Phase (Blue)

**Steps 2-5: Prevote & Precommit**

- **Step 2**: All validators cast prevotes on the block
- **Step 3**: Prevotes are tallied, threshold checked (2/3+)
- **Step 4**: If prevotes pass, validators cast precommits
- **Step 5**: Precommits are tallied, threshold checked (2/3+)

All voting nodes are highlighted during these steps.

### Commit Phase (Green)

**Step 6: Commit**

- If precommit threshold is met, block is committed
- Block is added to the blockchain
- All nodes transition to Committed state
- If threshold not met, timeout occurs

### Complete Phase (Gray)

**Step 7: Round Complete**

- Round concludes
- Nodes return to Idle state
- Ready for next round with new proposer

## Troubleshooting

### Step Mode Not Activating

- Ensure continuous mode is paused first
- Check that the mode toggle button is clicked
- Verify no errors in browser console

### Steps Not Advancing

- Check that "Next" button is not disabled
- Verify you're not at the last step (7)
- Ensure step history is being maintained

### Vote Tables Empty

- Progress to at least Step 2 for prevotes
- Progress to at least Step 4 for precommits
- Check that nodes are online and voting

### Highlighting Not Showing

- Verify nodes are included in `highlightedNodes` array
- Check CSS for `.node-highlighted` class
- Ensure animations are enabled in browser

## Future Enhancements

Potential improvements to Step-by-Step Mode:

- Step annotations with educational tooltips
- Bookmarking specific steps for later review
- Export step sequence as slides or video
- Configurable auto-play delay
- Step-by-step replay of past consensus rounds
- Comparison mode (side-by-side steps)

## API Reference

### Context Methods

```javascript
// Toggle step-by-step mode
toggleStepMode();

// Navigate steps
nextStep();
previousStep();
goToRoundStart();

// Auto-play control
toggleAutoPlaySteps();

// State updates
updateStepState(state);
updateStepDescription(description);
updateHighlightedNodes(nodeIds);
updateNodes(newNodes);
addBlock(newBlock);
```

### Utility Functions

```javascript
// Execute a specific step
executeConsensusStep(
  step,
  nodes,
  blocks,
  config,
  previousStepState
);

// Get step information
getStepInfo(step);

// Get total number of steps
getTotalSteps();

// Step-by-step execution
executeStepMode(step, nodes, blocks, config, previousStepState);
```

## Conclusion

The Step-by-Step Mode transforms the Tendermint Protocol Visualizer into a powerful educational tool. By breaking down consensus into discrete, understandable steps with comprehensive state inspection, users can deeply understand how Byzantine Fault Tolerant consensus works in practice.

Whether you're teaching a class, debugging a complex consensus scenario, or simply learning about distributed systems, Step-by-Step Mode provides the clarity and control needed to master the Tendermint protocol.

---

**Last Updated**: November 6, 2025  
**Version**: 2.0.0  
**Feature**: Step-by-Step Mode
