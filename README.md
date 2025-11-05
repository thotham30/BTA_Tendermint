# Tendermint Protocol Visualizer

A web-based interactive visualization tool for understanding the Tendermint consensus algorithm. This educational project demonstrates how distributed nodes reach consensus while maintaining safety and liveness properties.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
http://localhost:5173
```

## 📖 What is Tendermint?

Tendermint is a Byzantine Fault Tolerant (BFT) consensus algorithm that allows a network of nodes to agree on a shared state, even when some nodes are faulty or malicious. It guarantees two critical properties:

- **Safety**: All honest nodes agree on the same value (no forks)
- **Liveness**: The system continues making progress (nodes eventually commit blocks)

## 🎯 Project Features

- **Real-time Consensus Visualization**: Watch nodes progress through consensus rounds
- **Safety & Liveness Indicators**: Monitor the health and progress of the network
- **Interactive Controls**:
  - Start/Pause simulation
  - Reset network to initial state
  - Adjust simulation speed (0.25x to 4x)
- **Block Chain View**: See blocks as they are committed to the chain
- **Node State Tracking**: Observe each node's state (Idle, Voting, Committed, Timeout)

## 🏗️ How It Works

### Architecture Overview

The project is built with **React** and **Vite**, using a context-based state management pattern. Here's how the components work together:

```
App.jsx (Root Component)
    ├── ConsensusProvider (Context) - Manages simulation state
    │
    ├── LivenessIndicator - Shows if network is making progress
    ├── SafetyIndicator - Shows if all nodes agree (no forks)
    │
    ├── ConsensusVisualizer - Displays nodes and blocks
    │   ├── Node components - Individual validator nodes
    │   └── Block components - Committed blocks in the chain
    │
    └── Controls - User interface for controlling simulation
        ├── Start/Pause buttons
        └── Speed control (0.25x, 0.5x, 1x, 2x, 4x)
```

### Core Components

#### 1. **ConsensusContext** (`src/context/ConsensusContext.jsx`)

The heart of the simulation, managing:

- **State Management**: Tracks nodes, blocks, rounds, and consensus properties
- **Simulation Loop**: Runs consensus steps at configurable intervals
- **Speed Control**: Adjusts simulation speed (base: 1500ms, modified by speed multiplier)

Key states:

```javascript
- nodes: Array of validator nodes with their states
- blocks: Array of committed blocks
- round: Current consensus round number
- isRunning: Whether simulation is active
- speed: Current speed multiplier (0.25x to 4x)
- liveness: Boolean indicating network progress
- safety: Boolean indicating no forks/conflicts
```

#### 2. **Network Simulation** (`src/utils/NetworkSimulation.js`)

Handles the consensus algorithm logic:

**`initializeNetwork(nodeCount)`**

- Creates validator nodes with initial "Idle" state
- Each node gets a unique ID and color

**`simulateConsensusStep(nodes, blocks)`**

- **Step 1**: Select proposer using round-robin
- **Step 2**: Proposer creates a new block
- **Step 3**: All nodes vote on the block
- **Step 4**: If 2/3+ votes approve, block is committed
- **Step 5**: Update node states and safety/liveness indicators

#### 3. **Tendermint Logic** (`src/utils/tendermintLogic.js`)

Implements core consensus functions:

- `getNextProposer()`: Determines which node proposes next block
- `createBlock()`: Constructs a new block with proposer and round info
- `voteOnBlock()`: Simulates voting process and calculates approval

#### 4. **Controls Component** (`src/components/Controls.jsx`)

Provides user interface for:

- **Start/Pause**: Begin or pause the consensus simulation
- **Reset**: Return network to initial state
- **Speed Control**: Buttons to adjust simulation speed
  - 0.25x (slowest - 6000ms per step)
  - 0.5x (slow - 3000ms per step)
  - 1x (normal - 1500ms per step)
  - 2x (fast - 750ms per step)
  - 4x (fastest - 375ms per step)

#### 5. **Visualization Components**

- **ConsensusVisualizer**: Container displaying all nodes and blocks
- **Node**: Shows individual validator state with color coding:
  - Gray (#ccc): Idle
  - Yellow (#f9c74f): Voting
  - Green (#90be6d): Committed
  - Red (#f94144): Timeout
- **Block**: Displays committed blocks with proposer and round info
- **LivenessIndicator**: Green if progressing, red if stalled
- **SafetyIndicator**: Green if safe (no forks), red if violated

### Consensus Flow

1. **Round Start**: System selects a proposer based on round number
2. **Propose**: Proposer creates and broadcasts a block
3. **Prevote**: All nodes vote on the proposed block
4. **Precommit**: If 2/3+ prevotes received, nodes precommit
5. **Commit**: If 2/3+ precommits received, block is finalized
6. **Next Round**: Increment round and repeat with new proposer

### State Transitions

```
Idle → Voting → Committed (success)
                ↓
            Timeout (failure) → Next Round
```

## 🎨 Customization

### Adjust Number of Nodes

In `ConsensusContext.jsx`:

```javascript
const initialNodes = initializeNetwork(4); // Change 4 to desired number
```

### Modify Base Speed

In `ConsensusContext.jsx`:

```javascript
const baseDelay = 1500; // Change to desired milliseconds
```

### Adjust Failure Probabilities

In `NetworkSimulation.js`:

```javascript
newLiveness = Math.random() > 0.1; // 10% chance liveness fails
newSafety = Math.random() > 0.05; // 5% chance safety fails
```

## 📁 Project Structure

```
src/
├── App.jsx                      # Root component
├── main.jsx                     # Application entry point
├── index.css                    # Global styles
├── components/
│   ├── ConsensusVisualizer.jsx  # Main visualization container
│   ├── Node.jsx                 # Individual node display
│   ├── Block.jsx                # Block display
│   ├── Controls.jsx             # Control panel with speed options
│   ├── LivenessIndicator.jsx    # Liveness status display
│   └── SafetyIndicator.jsx      # Safety status display
├── context/
│   └── ConsensusContext.jsx     # State management & simulation logic
├── utils/
│   ├── NetworkSimulation.js     # Network simulation functions
│   └── tendermintLogic.js       # Tendermint consensus logic
├── styles/
│   ├── App.css                  # Main application styles
│   └── Visualizer.css           # Visualization-specific styles
└── data/
    └── sampleNetwork.json       # Sample network configuration
```

## 🎓 Educational Purpose

This visualizer is designed to help students and developers understand:

- How Byzantine Fault Tolerant consensus works
- The role of proposers and validators in distributed systems
- How safety and liveness properties are maintained
- The impact of network conditions on consensus
- Round-based consensus protocols

## 🔧 Technologies Used

- **React 18**: Component-based UI framework
- **Vite**: Fast build tool and dev server
- **Context API**: State management
- **CSS3**: Modern styling with flexbox and animations

## 🚀 Future Enhancements

- Add Byzantine node behavior simulation
- Implement network partitioning scenarios
- Add transaction pool visualization
- Export consensus logs for analysis
- Add step-by-step mode for detailed observation
- Visualize message passing between nodes
- Add configuration panel for consensus parameters

## 📚 Learn More

- [Tendermint Core Documentation](https://docs.tendermint.com/)
- [Byzantine Fault Tolerance](https://en.wikipedia.org/wiki/Byzantine_fault)
- [Consensus Algorithms](<https://en.wikipedia.org/wiki/Consensus_(computer_science)>)

## 📄 License

This project is intended for educational and demonstration purposes.
