# Tendermint Protocol Visualizer

An interactive web-based visualization tool for understanding and demonstrating the Tendermint consensus protocol, featuring real-time simulation of Byzantine fault-tolerant consensus with configurable network conditions and Byzantine node behaviors.

## Overview

This project provides a comprehensive educational and testing platform for the Tendermint Byzantine Fault Tolerant (BFT) consensus protocol. It simulates a network of validator nodes reaching consensus through multiple rounds of voting (prevote and precommit phases) while visualizing liveness and safety properties in real-time.

### Key Features

#### 1. **Consensus Simulation**

- **Two-Phase Voting**: Implements Tendermint's prevote and precommit voting phases
- **Round-Based Consensus**: Simulates multiple consensus rounds with rotating proposers
- **Block Creation**: Proposers create blocks with configurable transaction counts
- **Vote Threshold**: Configurable voting thresholds (default: 2/3+ majority)
- **Proposer Rotation**: Fair round-robin proposer selection among eligible nodes

#### 2. **Byzantine Fault Tolerance**

- **Byzantine Node Simulation**: Support for multiple Byzantine node types:
  - **Faulty**: Votes randomly on proposals
  - **Equivocator**: Sends conflicting votes to different nodes
  - **Silent**: Refuses to participate in voting
- **Byzantine Limit**: Enforces n/3 Byzantine fault tolerance guarantee
- **Visual Distinction**: Byzantine nodes displayed in red for easy identification

#### 3. **Timeout Mechanism**

- **Round Timeouts**: Configurable timeout duration for consensus rounds
- **Exponential Backoff**: Automatic timeout escalation on consecutive failures
- **Timeout Statistics**: Track timeout occurrences and escalation levels
- **Timeout Visualization**: Real-time display of timeout progress and history
- **Adaptive Timeouts**: Multiplier-based timeout increases (default: 1.5x)

#### 4. **Network Conditions**

- **Configurable Latency**: Simulate network delays (0-5000ms)
- **Packet Loss**: Simulate unreliable networks (0-100% packet loss)
- **Node Downtime**: Random node unavailability (0-100% downtime)
- **Response Variance**: Variable node response times

#### 5. **Voting Visualization**

- **Voting Breakdown**: Detailed view of prevotes and precommits per round
- **Voting History**: Historical record of all consensus rounds
- **Vote Tracking**: Individual node voting behavior visualization
- **Voting Statistics**: Aggregated metrics on voting patterns
- **Round Details**: Expandable view for examining specific rounds

#### 6. **Liveness & Safety Monitoring**

- **Liveness Indicator**: Tracks whether the network continues making progress
- **Safety Indicator**: Monitors for fork scenarios and conflicting commits
- **Real-time Status**: Visual indicators for both properties
- **Violation Detection**: Automatic detection and logging of property violations

#### 7. **Configuration Management**

- **Preset Configurations**: Pre-built scenarios (Small Network, Large Network, Byzantine Test, Partition Test)
- **Custom Configurations**: Full control over all simulation parameters
- **Config Validation**: Input validation with helpful error messages
- **Import/Export**: Save and load configurations as JSON files
- **Local Storage**: Automatic persistence of configuration settings

#### 8. **Real-Time Controls**

- **Start/Stop/Reset**: Full simulation control
- **Speed Control**: Adjustable simulation speed (0.5x to 5x)
- **Simulation Mode**: Toggle between Continuous and Step-by-Step modes
- **Configuration Panel**: Live parameter adjustment
- **Interactive UI**: Responsive controls with immediate feedback

#### 9. **Step-by-Step Mode** 🆕

- **Educational Mode**: Advance through consensus one step at a time
- **8 Defined Steps**:
  - Step 0: Round Start - Initialize round and select proposer
  - Step 1: Block Proposal - Proposer creates and broadcasts block
  - Step 2: Prevote - Validators vote on the proposed block
  - Step 3: Prevote Tally - Count prevotes and check if > 2/3
  - Step 4: Precommit - Validators commit to the block
  - Step 5: Precommit Tally - Count precommits and check if > 2/3
  - Step 6: Commit - Block is finalized and added to chain
  - Step 7: Round Complete - Reset for next round
- **Step Navigation**:
  - Next/Previous buttons for manual control
  - Go to Round Start button
  - Auto-play mode with configurable delay
  - Step history for undo functionality
- **State Inspector**: Real-time view of consensus state at each step
  - Current proposer and block details
  - Vote counts and threshold status
  - Network statistics
  - Phase-specific information
- **Detailed Step View**: Comprehensive breakdown of each step
  - Tabular vote display with node-by-node breakdown
  - Vote thresholds with visual progress bars
  - Node state cards showing current status
  - Byzantine node identification
- **Visual Highlighting**: Nodes involved in current step are highlighted
- **Phase Color-Coding**:
  - Initialization: Purple
  - Proposal: Yellow
  - Voting: Blue
  - Commit: Green
  - Complete: Gray

#### 10. **Logging System**

- **Comprehensive Logs**: Detailed event logging with timestamps
- **Log Categories**: Info, warning, error, success, and block events
- **Log Levels**: Configurable verbosity (minimal, normal, verbose)
- **Color-Coded**: Visual distinction between log types
- **Scrollable Window**: Persistent log history

## Project Structure

```
BTA Project/
├── public/
│   └── index.html                    # Static HTML entry point
├── src/
│   ├── main.jsx                      # React entry point, renders App
│   ├── App.jsx                       # Main application component
│   ├── index.css                     # Global styles
│   │
│   ├── components/                   # React UI components
│   │   ├── ConsensusVisualizer.jsx   # Main visualization canvas
│   │   ├── Controls.jsx              # Simulation control buttons
│   │   ├── ConfigurationPanel.jsx    # Config editor interface
│   │   ├── Node.jsx                  # Individual node visualization
│   │   ├── Block.jsx                 # Block display component
│   │   ├── LivenessIndicator.jsx     # Liveness property monitor
│   │   ├── SafetyIndicator.jsx       # Safety property monitor
│   │   ├── LogsWindow.jsx            # Event log display
│   │   ├── TimeoutVisualizer.jsx     # Timeout progress display
│   │   ├── TimeoutStats.jsx          # Timeout statistics panel
│   │   ├── VotingBreakdown.jsx       # Current round vote details
│   │   ├── VotingDetails.jsx         # Detailed vote analysis
│   │   ├── VotingHistory.jsx         # Historical voting records
│   │   ├── VotingStatistics.jsx      # Voting metrics dashboard
│   │   ├── VotingVisualization.jsx   # Visual voting representation
│   │   ├── StepByStepControls.jsx    # Step-by-step mode controls 🆕
│   │   ├── StateInspector.jsx        # Step state inspection panel 🆕
│   │   └── DetailedStepView.jsx      # Detailed step breakdown 🆕
│   │
│   ├── context/
│   │   └── ConsensusContext.jsx      # Global state management via React Context
│   │                                 # Manages: nodes, blocks, rounds, config,
│   │                                 # voting, timeouts, logs, liveness/safety
│   │
│   ├── utils/                        # Core logic modules
│   │   ├── tendermintLogic.js        # Tendermint consensus algorithm
│   │   │                             # - Proposer selection
│   │   │                             # - Block creation
│   │   │                             # - Voting logic (prevote/precommit)
│   │   │                             # - VotingRound data structures
│   │   │                             # - Step definitions and execution 🆕
│   │   │
│   │   ├── NetworkSimulation.js      # Network layer simulation
│   │   │                             # - Node initialization
│   │   │                             # - Consensus step execution
│   │   │                             # - Timeout handling
│   │   │                             # - Network condition simulation
│   │   │                             # - Step-by-step mode execution 🆕
│   │   │
│   │   └── ConfigManager.js          # Configuration utilities
│   │                                 # - Default/preset configs
│   │                                 # - Validation logic
│   │                                 # - Import/export functions
│   │                                 # - Success rate estimation
│   │
│   ├── styles/                       # CSS styling
│       ├── App.css                   # Application-wide styles
│       └── Visualizer.css            # Visualization-specific styles
│
├── package.json                      # NPM dependencies and scripts
├── vite.config.js                    # Vite build configuration
├── eslint.config.js                  # ESLint linting rules
│
└── Documentation/                    # Implementation guides
    ├── CONFIGMANAGER_INTEGRATION.md  # Config system documentation
    ├── TIMEOUT_IMPLEMENTATION_GUIDE.md
    ├── TIMEOUT_QUICK_REFERENCE.md
    ├── VOTING_FEATURES_GUIDE.md
    ├── VOTING_IMPLEMENTATION_SUMMARY.md
    └── QUICK_REFERENCE.md
```

## Technical Architecture

### State Management

- **React Context API**: Centralized state management through `ConsensusContext`
- **Global State**: Nodes, blocks, rounds, configuration, voting data, timeouts, logs
- **Real-time Updates**: Automatic re-rendering on state changes

### Consensus Flow

1. **Initialization**: Network created with configured number of nodes
2. **Proposer Selection**: Round-robin selection among eligible nodes
3. **Block Proposal**: Proposer creates block with transactions
4. **Prevote Phase**: All nodes vote on the proposed block
5. **Threshold Check**: Verify 2/3+ prevotes received
6. **Precommit Phase**: If prevotes pass, nodes precommit
7. **Commit/Timeout**: Block committed if 2/3+ precommits, else timeout
8. **Next Round**: Process repeats with new proposer

### Data Structures

#### Node Object

```javascript
{
  id: number,              // Unique node identifier
  state: string,           // "Idle", "Voting", "Committed", "Timeout"
  color: string,           // Visual state indicator
  isByzantine: boolean,    // Byzantine node flag
  byzantineType: string,   // "faulty", "equivocator", "silent"
  isOnline: boolean        // Availability status
}
```

#### Block Object

```javascript
{
  height: number,          // Block number
  proposer: number,        // Proposer node ID
  txCount: number,         // Number of transactions
  hash: string,            // Block hash
  timestamp: number        // Creation time
}
```

#### VotingRound Object

```javascript
{
  roundNumber: number,           // Round identifier
  roundHeight: number,           // Block height
  proposerId: number,            // Proposer node ID
  prevotesReceived: {},          // Map of nodeId -> vote
  precommitsReceived: {},        // Map of nodeId -> vote
  timestamp: number,             // Round start time
  result: string,                // "approved", "rejected", "pending"
  prevoteCount: number,          // Positive prevote count
  precommitCount: number,        // Positive precommit count
  prevoteThresholdMet: boolean,  // 2/3+ prevotes achieved
  precommitThresholdMet: boolean // 2/3+ precommits achieved
}
```

## Configuration Parameters

### Network Settings

- **nodeCount**: Number of validator nodes (3-20)
- **latency**: Network delay in milliseconds (0-5000ms)
- **packetLoss**: Packet loss percentage (0-100%)
- **messageTimeout**: Message timeout duration (1000-10000ms)

### Consensus Settings

- **roundTimeout**: Round timeout duration (1000-10000ms)
- **voteThreshold**: Required vote percentage (0.5-1.0, default: 0.67)
- **blockSize**: Transactions per block (1-100)
- **proposalDelay**: Proposal delay in milliseconds (0-1000ms)
- **timeoutMultiplier**: Timeout escalation multiplier (1.0-3.0)
- **timeoutEscalationEnabled**: Enable/disable timeout backoff

### Node Behavior

- **byzantineCount**: Number of Byzantine nodes (0 to n/3)
- **byzantineType**: Type of Byzantine behavior
- **downtimePercentage**: Random node unavailability (0-100%)
- **responseVariance**: Node response time variance (0-1000ms)

### Simulation Settings

- **transactionRate**: Transaction generation rate (low/medium/high)
- **transactionPoolSize**: Pool size (10-1000)
- **durationLimit**: Simulation time limit (off/5min/10min/30min)
- **logLevel**: Logging verbosity (minimal/normal/verbose)

## Technology Stack

- **React 18**: UI framework with hooks
- **Vite**: Fast build tool and dev server
- **Framer Motion**: Animation library for smooth transitions
- **JavaScript/JSX**: Core programming language
- **CSS3**: Styling with modern features
- **LocalStorage API**: Configuration persistence

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Use Cases

1. **Education**: Learn Tendermint consensus mechanics visually with step-by-step mode for detailed instruction
2. **Research**: Test Byzantine fault tolerance under various conditions
3. **Network Analysis**: Study consensus performance with different parameters
4. **Debugging**: Understand timeout mechanisms and vote propagation
5. **Demonstration**: Present BFT consensus concepts to audiences with interactive step-by-step progression
6. **Interactive Learning**: Use step-by-step mode to understand each phase of consensus in detail

## For LLM Context

This project simulates the Tendermint BFT consensus protocol with a React-based frontend. The core logic resides in `src/utils/` (consensus algorithm, network simulation, configuration). The UI components in `src/components/` provide visualization and controls. State is managed centrally via `ConsensusContext.jsx`. The system models Byzantine nodes, network failures, voting phases, timeout mechanisms, and tracks liveness/safety properties in real-time. Configuration is highly flexible with validation, presets, and import/export capabilities.

**New Step-by-Step Mode**: The visualizer now supports an educational step-by-step mode where users can advance through consensus one action at a time. This mode breaks down each consensus round into 8 distinct steps (Round Start, Block Proposal, Prevote, Prevote Tally, Precommit, Precommit Tally, Commit, Round Complete). Each step provides detailed state inspection showing the proposer, block details, vote counts, threshold status, and node states. The mode includes visual highlighting of active nodes, phase color-coding, tabular vote breakdowns, and navigation controls (next/previous, go to start, auto-play). This feature is ideal for educational purposes, debugging, and understanding the consensus process in detail.

## Key Implementation Details

### File Responsibilities

- **`ConsensusContext.jsx`**: Central state hub managing all application state including nodes, blocks, voting rounds, timeouts, step-by-step mode state, and configuration. Provides hooks for all components to access and modify state.

- **`tendermintLogic.js`**: Pure consensus logic implementing proposer selection, block creation, voting mechanics, voting round data structure management, and step-by-step execution. Defines 8 consensus steps with descriptions and phase information. No side effects.

- **`NetworkSimulation.js`**: Orchestrates consensus steps by calling tendermintLogic functions and applying network conditions (latency, packet loss, downtime). Handles timeout detection, state transitions, and step-by-step mode execution.

- **`ConfigManager.js`**: Configuration management including validation, presets, import/export, and analytical functions (success rate estimation, consensus time estimation).

- **`ConsensusVisualizer.jsx`**: Main visualization component rendering nodes, blocks, and their connections. Integrates TimeoutVisualizer, VotingVisualization, and supports node highlighting in step-by-step mode.

- **`StepByStepControls.jsx`**: Controls for step-by-step mode including next/previous buttons, auto-play toggle, and progress display. Executes steps and updates state accordingly.

- **`StateInspector.jsx`**: Displays current step information including proposer, block details, vote counts, thresholds, network status, and commit status. Shows phase-specific data with color-coded badges.

- **`DetailedStepView.jsx`**: Provides detailed tabular breakdown of votes, node states, and consensus progress. Shows vote-by-vote analysis with Byzantine node identification.

- **Voting Components**: Multiple specialized components (VotingBreakdown, VotingDetails, VotingHistory, VotingStatistics, VotingVisualization) provide comprehensive voting analysis from different perspectives.

- **Indicator Components**: LivenessIndicator and SafetyIndicator monitor and display the two critical consensus properties in real-time.

- **Controls**: Simulation controls (start/stop/reset), speed adjustment, and configuration panel for live parameter changes.

This architecture ensures separation of concerns, making it easy to understand, test, and extend individual features independently.
