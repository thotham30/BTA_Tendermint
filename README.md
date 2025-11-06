# Tendermint Protocol Visualizer

An interactive web-based visualization tool for understanding and demonstrating the Tendermint consensus protocol, featuring real-time simulation of Byzantine fault-tolerant consensus with configurable network conditions and Byzantine node behaviors.

## Overview

This project provides a comprehensive educational and testing platform for the Tendermint Byzantine Fault Tolerant (BFT) consensus protocol. It simulates a network of validator nodes reaching consensus through multiple rounds of voting (prevote and precommit phases) while visualizing liveness and safety properties in real-time.

## Byzantine Node Simulation - Quick Reference

The visualizer includes **full Byzantine node simulation** to demonstrate Byzantine Fault Tolerance in action:

### Quick Access

- **Configuration**: Click "⚙️ Configuration" → "Node Behavior" tab
- **Quick Start**: Use "Byzantine Test" preset (7 nodes, 2 Byzantine)
- **Visual Indicator**: Byzantine nodes appear in **red** with ⚠️ badge

### Byzantine Behavior Types

| Type            | Behavior          | Voting Pattern      | Use Case                   |
| --------------- | ----------------- | ------------------- | -------------------------- |
| **Faulty**      | Votes randomly    | 50% yes, 50% no     | Test maximum chaos         |
| **Equivocator** | Conflicting votes | 70% yes (simulated) | Test double-voting         |
| **Silent**      | No participation  | null votes          | Test reduced validator set |

### Byzantine Tolerance Limits

| Total Nodes | Max Byzantine | Percentage | Vote Threshold |
| ----------- | ------------- | ---------- | -------------- |
| 4           | 1             | 25%        | 3/4 (75%)      |
| 7           | 2             | 28.6%      | 5/7 (71.4%)    |
| 10          | 3             | 30%        | 7/10 (70%)     |
| 16          | 5             | 31.25%     | 11/16 (68.75%) |

### Key Properties

- ✅ **Enforced n/3 Limit**: System prevents configuring > floor(n/3) Byzantine nodes
- ✅ **Proposer Exclusion**: Byzantine nodes never selected as proposer
- ✅ **Visual Distinction**: Red color, warning badge, hover tooltips
- ✅ **Step-by-Step Inspection**: See Byzantine votes in detailed breakdown
- ✅ **Real-time Logging**: Track Byzantine impact on consensus

### Implementation Status

✅ **FULLY IMPLEMENTED** - All features are production-ready:

- [x] Byzantine node configuration in ConsensusContext
- [x] Three Byzantine behavior types (faulty, equivocator, silent)
- [x] Visual indicators in Node component (red color, ⚠️ badge)
- [x] Byzantine vote simulation in tendermintLogic.js
- [x] Proposer exclusion for Byzantine nodes
- [x] Configuration validation (n/3 enforcement)
- [x] Byzantine detection and logging
- [x] Safety/liveness violation tracking
- [x] Preset configurations with Byzantine nodes
- [x] Step-by-step mode Byzantine identification

**No additional implementation needed** - Use this documentation to understand and test existing Byzantine features.

### Key Features

#### 1. **Consensus Simulation**

- **Two-Phase Voting**: Implements Tendermint's prevote and precommit voting phases
- **Round-Based Consensus**: Simulates multiple consensus rounds with rotating proposers
- **Block Creation**: Proposers create blocks with configurable transaction counts
- **Vote Threshold**: Configurable voting thresholds (default: 2/3+ majority)
- **Proposer Rotation**: Fair round-robin proposer selection among eligible nodes

#### 2. **Byzantine Fault Tolerance**

- **Byzantine Node Simulation**: Full support for three Byzantine node types:
  - **Faulty**: Votes randomly on proposals (50% approval rate)
  - **Equivocator**: Sends conflicting votes to different nodes (simulated with 70% approval rate)
  - **Silent**: Refuses to participate in voting (returns null votes)
- **Byzantine Configuration**:
  - Configurable Byzantine node count (0 to n/3, where n = total nodes)
  - Selectable Byzantine behavior type via Configuration Panel
  - Byzantine nodes cannot be selected as proposers (only honest nodes propose)
  - Real-time Byzantine node count display in Controls panel
- **Byzantine Limit Enforcement**: Strict n/3 Byzantine fault tolerance guarantee
  - System prevents configuring more than floor(n/3) Byzantine nodes
  - Configuration validation ensures Byzantine count stays within safe limits
  - Visual warnings when Byzantine count approaches maximum threshold
- **Visual Identification**:
  - Byzantine nodes displayed with red background color (#ff6b6b)
  - Warning indicator (⚠️) badge on Byzantine nodes
  - Hover tooltip shows Byzantine behavior type
  - Byzantine nodes remain red regardless of voting state
  - Clear visual distinction in all components (Node, DetailedStepView, VotingBreakdown)
- **Byzantine Detection**:
  - Tracks Byzantine voting behavior throughout consensus
  - Logs Byzantine participation and impact on voting thresholds
  - Safety violations triggered by excessive Byzantine interference
- **Preset Configurations**:
  - "Byzantine Test" preset with 7 nodes and 2 Byzantine nodes
  - Demonstrates BFT properties with 28% Byzantine node ratio

#### 3. **Timeout Mechanism**

- **Round Timeouts**: Configurable timeout duration for consensus rounds
- **Exponential Backoff**: Automatic timeout escalation on consecutive failures
- **Timeout Statistics**: Track timeout occurrences and escalation levels
- **Timeout Visualization**: Real-time display of timeout progress and history
- **Adaptive Timeouts**: Multiplier-based timeout increases (default: 1.5x)

#### 4. **Network Partitioning Simulation** 🆕

- **Partition Types**:
  - **Single Node Isolation**: Disconnect one node from the network
  - **Split Partition**: Divide network into two equal groups (e.g., 2 vs 2)
  - **Gradual Degradation**: Random nodes (~30%) experience connectivity issues
- **Real-time Partition Control**: Toggle network partitions on/off during simulation
- **Partition Visualization**:
  - Partitioned nodes displayed with dashed orange borders
  - 🔌 Partition indicator badge on affected nodes
  - Visual partition line showing communication disruption
- **Network Statistics Tracking**:
  - Messages sent, delivered, and lost
  - Message delivery rate percentage
  - Real-time network health metrics
- **Educational Value**:
  - Demonstrates liveness failures under network partitions
  - Shows why consensus requires majority connectivity
  - Tests Byzantine Fault Tolerance with combined network issues
  - Illustrates split-brain scenarios and safety preservation
- **Partition Impact**:
  - Partitioned nodes cannot vote or receive proposals
  - Consensus fails when <2/3 nodes can communicate
  - Increased timeout rates during partitions
  - Liveness degradation warnings in indicators

#### 5. **Network Conditions**

- **Configurable Latency**: Simulate network delays (0-5000ms)
- **Packet Loss**: Simulate unreliable networks (0-100% packet loss)
- **Node Downtime**: Random node unavailability (0-100% downtime)
- **Response Variance**: Variable node response times

#### 6. **Voting Visualization**

- **Voting Breakdown**: Detailed view of prevotes and precommits per round
- **Voting History**: Historical record of all consensus rounds
- **Vote Tracking**: Individual node voting behavior visualization
- **Voting Statistics**: Aggregated metrics on voting patterns
- **Round Details**: Expandable view for examining specific rounds

#### 7. **Liveness & Safety Monitoring**

- **Liveness Indicator**: Tracks whether the network continues making progress
- **Safety Indicator**: Monitors for fork scenarios and conflicting commits
- **Real-time Status**: Visual indicators for both properties
- **Violation Detection**: Automatic detection and logging of property violations
- **Partition Awareness**: Indicators show impact of network partitions on consensus properties

#### 8. **Configuration Management**

- **Preset Configurations**: Pre-built scenarios (Small Network, Large Network, Byzantine Test, Partition Test)
- **Custom Configurations**: Full control over all simulation parameters
- **Config Validation**: Input validation with helpful error messages
- **Import/Export**: Save and load configurations as JSON files
- **Local Storage**: Automatic persistence of configuration settings

#### 9. **Real-Time Controls**

- **Start/Stop/Reset**: Full simulation control
- **Speed Control**: Adjustable simulation speed (0.5x to 5x)
- **Simulation Mode**: Toggle between Continuous and Step-by-Step modes
- **Configuration Panel**: Live parameter adjustment
- **Interactive UI**: Responsive controls with immediate feedback
- **Network Partition Controls**: Toggle and configure network partitions in real-time

#### 10. **Step-by-Step Mode** 🆕

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

#### 11. **Logging System**

- **Comprehensive Logs**: Detailed event logging with timestamps
- **Log Categories**: Info, warning, error, success, and block events
- **Log Levels**: Configurable verbosity (minimal, normal, verbose)
- **Color-Coded**: Visual distinction between log types
- **Scrollable Window**: Persistent log history
- **Network Partition Logging**: Special indicators and stats for partition events

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
│   │   ├── DetailedStepView.jsx      # Detailed step breakdown 🆕
│   │   └── NetworkPartition.jsx      # Network partition visualization 🆕
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
    ├── BYZANTINE_FEATURES_GUIDE.md   # Complete Byzantine simulation guide 🆕
    ├── BYZANTINE_QUICK_REFERENCE.md  # Byzantine quick reference card 🆕
    ├── CONFIGMANAGER_INTEGRATION.md  # Config system documentation
    ├── TIMEOUT_IMPLEMENTATION_GUIDE.md
    ├── TIMEOUT_QUICK_REFERENCE.md
    ├── VOTING_FEATURES_GUIDE.md
    ├── VOTING_IMPLEMENTATION_SUMMARY.md
    ├── STEP_BY_STEP_MODE_GUIDE.md
    ├── STEP_MODE_QUICK_REF.md
    └── QUICK_REFERENCE.md
```

## Documentation

### Feature-Specific Guides

- **[Byzantine Features Guide](BYZANTINE_FEATURES_GUIDE.md)** 🆕: Complete guide to Byzantine node simulation
  - Configuration and setup
  - Three Byzantine behavior types explained
  - Visual indicators and UI
  - Testing scenarios with examples
  - Implementation deep dive
  - Troubleshooting common issues
- **[Byzantine Quick Reference](BYZANTINE_QUICK_REFERENCE.md)** 🆕: Quick reference card for Byzantine features

  - One-page cheat sheet
  - Common scenarios
  - Visual indicators
  - Configuration paths
  - Pro tips

- **[Step-by-Step Mode Guide](STEP_BY_STEP_MODE_GUIDE.md)**: Educational step-through mode
- **[Timeout Implementation Guide](TIMEOUT_IMPLEMENTATION_GUIDE.md)**: Timeout mechanism details
- **[Voting Features Guide](VOTING_FEATURES_GUIDE.md)**: Voting visualization features
- **[Configuration Manager Reference](CONFIGMANAGER_INTEGRATION.md)**: Config system documentation

### Quick References

- **[Quick Reference](QUICK_REFERENCE.md)**: General project quick reference
- **[Step Mode Quick Ref](STEP_MODE_QUICK_REF.md)**: Step-by-step mode commands
- **[Timeout Quick Reference](TIMEOUT_QUICK_REFERENCE.md)**: Timeout feature summary

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
  id: number,              // Unique node identifier (1-indexed)
  state: string,           // Current state: "Idle", "Voting", "Prevoting",
                           // "Precommitting", "Committed", "Timeout", "Proposing"
  color: string,           // Visual state indicator
                           // Byzantine nodes: always #ff6b6b (red)
                           // Honest nodes: #ccc (idle), #f9c74f (voting),
                           //               #90be6d (committed), #f94144 (timeout)
  isByzantine: boolean,    // Byzantine node flag
  byzantineType: string,   // "faulty", "equivocator", or "silent"
                           // Only relevant if isByzantine is true
  isOnline: boolean        // Availability status (affected by downtimePercentage)
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

- **byzantineCount**: Number of Byzantine nodes (0 to floor(n/3))
  - System enforces strict n/3 upper limit
  - Example: 4 nodes = max 1 Byzantine, 7 nodes = max 2 Byzantine
- **byzantineType**: Type of Byzantine behavior to simulate
  - **faulty**: Nodes vote randomly (50% yes, 50% no)
  - **equivocator**: Nodes send conflicting votes (70% approval rate simulated)
  - **silent**: Nodes don't participate in voting (null votes)
- **downtimePercentage**: Random node unavailability (0-100%)
  - Percentage of time nodes are offline
  - Applied independently of Byzantine behavior
- **responseVariance**: Node response time variance (0-1000ms)
  - Random delay added to node responses
  - Simulates network heterogeneity

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

## How to Use Byzantine Node Simulation

### Quick Start with Byzantine Test Preset

1. Click **"⚙️ Configuration"** button in the Controls panel
2. In the **Quick Presets** section, click **"Byzantine Test"**
3. This loads a preset with:
   - 7 validator nodes
   - 2 Byzantine nodes (28.6% - approaching the 33% limit)
   - "Faulty" Byzantine behavior (random voting)
   - 5% packet loss for added network stress
   - Verbose logging to track Byzantine activity
4. Click **"Apply Configuration"** to save
5. Start the simulation and observe:
   - Byzantine nodes appear in **red** with ⚠️ indicator
   - Consensus still works despite Byzantine nodes
   - Occasional timeouts when Byzantine votes prevent threshold
   - Safety violations if Byzantine interference is severe

### Manual Byzantine Configuration

#### Step 1: Open Configuration Panel

- Click **"⚙️ Configuration"** button in main Controls
- Navigate to **"Node Behavior"** tab

#### Step 2: Set Byzantine Node Count

- Use the **"Byzantine Nodes"** input field
- Valid range: 0 to floor(n/3) where n = total node count
- Examples:
  - 4 nodes → max 1 Byzantine node (25%)
  - 7 nodes → max 2 Byzantine nodes (28.6%)
  - 10 nodes → max 3 Byzantine nodes (30%)
- The system prevents exceeding n/3 limit

#### Step 3: Choose Byzantine Behavior Type

Select from dropdown:

- **Faulty (Default)**:
  - Votes randomly on each proposal
  - 50% approval rate
  - Most unpredictable behavior
  - Best for testing consensus resilience
- **Equivocator**:
  - Simulates sending conflicting votes
  - 70% approval rate (biased toward approval)
  - Tests double-voting detection
  - Can cause safety violations
- **Silent**:
  - Refuses to participate in voting
  - Returns null votes
  - Reduces effective validator set size
  - Tests liveness under reduced participation

#### Step 4: Apply and Test

1. Click **"Apply Configuration"**
2. Reset the network with **"Reset"** button
3. Start simulation and observe Byzantine behavior

### Visual Indicators

- **Red Node Background**: Byzantine nodes are always colored red (#ff6b6b)
- **⚠️ Warning Badge**: Appears on top-right of Byzantine nodes
- **Hover Tooltip**: Shows Byzantine behavior type (e.g., "Byzantine: faulty")
- **Proposer Exclusion**: Byzantine nodes never get the 👑 proposer crown
- **Vote Badges**: Byzantine nodes still show ✓/✗ vote badges based on their behavior

### Observing Byzantine Impact

#### In Continuous Mode:

1. Watch the **Voting Breakdown** panel (click "👁️ Show Votes")
2. Byzantine votes are mixed with honest votes
3. Monitor timeout rate in **Logs Window**
4. Check **Safety/Liveness Indicators** for violations

#### In Step-by-Step Mode:

1. Switch to **"👣 Step-by-Step"** mode
2. Advance through voting steps (Prevote, Precommit)
3. In **Detailed Step View**, Byzantine nodes are labeled
4. See exactly how Byzantine votes affect thresholds
5. Observe vote-by-vote breakdown in tables

#### In Voting History:

1. Click **"📊 Voting History"** button
2. Review past rounds and voting patterns
3. Identify rounds where Byzantine interference caused failures
4. Analyze prevote/precommit success rates

### Understanding n/3 Byzantine Tolerance

**The Theory:**

- Tendermint tolerates up to **f = ⌊(n-1)/3⌋** Byzantine nodes
- With n validators, you need **2f + 1 = ⌈2n/3⌉** votes for consensus
- This ensures that even if f nodes are Byzantine, there are still 2f + 1 honest nodes

**In Practice:**

- **4 nodes**: Tolerates 1 Byzantine (25%)
  - Need 3/4 votes (75%)
  - If 1 is Byzantine and 1 votes no → 2/4 votes (50%) → FAIL
- **7 nodes**: Tolerates 2 Byzantine (28.6%)
  - Need 5/7 votes (71.4%)
  - If 2 are Byzantine and random → still likely 5+ votes → SUCCESS
- **10 nodes**: Tolerates 3 Byzantine (30%)
  - Need 7/10 votes (70%)
  - More buffer for Byzantine interference

**Testing the Limit:**

1. Configure network with maximum Byzantine nodes (n/3)
2. Use "Faulty" type for maximum chaos
3. Add 5-10% packet loss
4. Observe increased timeout rates
5. Consensus should still work but with reduced efficiency

### Common Scenarios to Test

#### Scenario 1: Single Faulty Node (4 nodes, 1 Byzantine)

```
Purpose: Demonstrate basic BFT
Config: 4 nodes, 1 Byzantine (faulty), 0% packet loss
Expected: Occasional timeouts, mostly successful consensus
```

#### Scenario 2: Maximum Byzantine (7 nodes, 2 Byzantine)

```
Purpose: Test at the theoretical limit
Config: 7 nodes, 2 Byzantine (faulty), 5% packet loss
Expected: Frequent timeouts, safety/liveness violations possible
```

#### Scenario 3: Silent Byzantine (6 nodes, 2 silent)

```
Purpose: Test with non-participating nodes
Config: 6 nodes, 2 Byzantine (silent), 0% packet loss
Expected: Reduced vote counts, threshold harder to reach
```

#### Scenario 4: Equivocator Attack (7 nodes, 2 equivocators)

```
Purpose: Test double-voting detection
Config: 7 nodes, 2 Byzantine (equivocator), 0% packet loss
Expected: Conflicting votes, potential safety violations
```

#### Scenario 5: Combined Network + Byzantine Stress

```
Purpose: Real-world adversarial conditions
Config: 10 nodes, 3 Byzantine (faulty), 20% packet loss, 10% downtime
Expected: Severe consensus challenges, high timeout rate
```

### Troubleshooting

**Q: Why can't I set more than 1 Byzantine node with 4 nodes?**

- A: BFT requires < n/3 Byzantine nodes. With 4 nodes, max is floor(4/3) = 1.

**Q: Byzantine nodes show ⚠️ but still vote normally?**

- A: Byzantine behavior is probabilistic. "Faulty" nodes vote randomly (50/50 chance), so they sometimes agree with honest nodes.

**Q: Consensus keeps failing with Byzantine nodes?**

- A: This is expected! Byzantine nodes disrupt consensus. Reduce Byzantine count or improve network conditions.

**Q: Can Byzantine nodes be proposers?**

- A: No. The `getNextProposer()` function excludes Byzantine nodes from proposer rotation to ensure valid block proposals.

**Q: How do I see which votes are from Byzantine nodes?**

- A: Use Step-by-Step mode and check the Detailed Step View. Byzantine nodes are marked with red highlighting and labeled.

### Advanced: Byzantine + Network Partitions

Combine Byzantine nodes with high packet loss to simulate network partitions:

1. Set 7 nodes, 2 Byzantine (faulty)
2. Set 30-40% packet loss (simulates partition)
3. Observe: Byzantine nodes + partition = severe liveness violations
4. This demonstrates why BFT + reliable networking is crucial

### Educational Value

Use Byzantine simulation to teach:

- **BFT Fundamentals**: Why 2/3 threshold matters
- **Security**: How malicious nodes are tolerated
- **Trade-offs**: Performance vs fault tolerance
- **Real-world**: Byzantine Generals Problem in action
- **Limits**: What happens when f ≥ n/3

## How to Use Network Partition Simulation

### Quick Start

1. Start the simulation with any configuration
2. Click **"⚡ Enable Partition"** button in the Network Partition Controls section
3. Choose a partition type:
   - **🔴 Single Node**: Isolates one node from the network
   - **⚡ Split (50/50)**: Divides network into two equal groups
   - **📉 Gradual**: Random connectivity issues affecting ~30% of nodes
4. Observe consensus behavior:
   - Partitioned nodes show dashed orange borders with 🔌 indicator
   - Network statistics panel displays real-time message delivery rates
   - Liveness indicator shows degradation or violation
   - Logs track timeout events caused by partition

### Understanding Partition Types

#### Single Node Isolation

**What it does**: Disconnects one node from all others

**Expected behavior**:

- Isolated node cannot participate in voting
- Consensus continues with remaining nodes (if still > 2/3 threshold)
- Example: With 4 nodes, isolating 1 node leaves 3 nodes (75%) - consensus succeeds

**Use case**: Test system resilience to individual node failures

#### Split Partition (50/50)

**What it does**: Divides network into two equal-sized groups

**Expected behavior**:

- Each partition has 50% of nodes
- Neither partition reaches 2/3 threshold
- **Consensus fails completely** - demonstrating liveness violation
- Safety is maintained (no conflicting blocks committed)
- Example: 4 nodes split into 2+2 - neither group can reach 3/4 threshold

**Use case**: Demonstrate why consensus requires majority connectivity

#### Gradual Degradation

**What it does**: Random nodes (~30%) experience connectivity issues

**Expected behavior**:

- Some rounds succeed, some fail
- Intermittent timeouts
- Variable consensus success rate
- Demonstrates network instability effects

**Use case**: Simulate real-world network unreliability

### Observing Partition Effects

#### In the Visualizer

- **Partitioned Nodes**: Dashed orange border, 🔌 badge, "Partitioned" state
- **Network Partition Panel**: Shows affected nodes, delivery rate, messages lost
- **Visual Partition Line**: Animated dashed line indicating communication disruption

#### In Liveness Indicator

- **Degraded Status** (⚠️): When partition affects >30% of nodes
  - Shows percentage of partitioned nodes
  - Explains consensus slowdown
- **Violated Status** (❌): When consensus cannot progress
  - Indicates insufficient nodes for 2/3 threshold

#### In Safety Indicator

- **Maintained** (✅): No conflicting commits during partition
  - Shows safety property preserved despite liveness failure
- **Violated** (⚠️): Fork detected (rare, indicates split-brain scenario)
  - Warns about possible conflicting commits in separate partitions

#### In Logs Window

- **Partition Status Summary**: Real-time partition statistics
  - Affected node count
  - Message delivery rate
  - Messages lost count
- **Timeout Events**: Logs showing timeouts caused by partition
- **Consensus Failures**: Messages when threshold cannot be met

### Testing Scenarios with Network Partitions

#### Scenario 1: Minority Partition (4 nodes, 1 isolated)

```
Setup: 4 nodes → Enable Partition → Single Node type
Expected: Consensus succeeds with 3/4 nodes (75% > 67%)
Learning: System tolerates minority partition
```

#### Scenario 2: Split-Brain Test (4 nodes, 2+2 split)

```
Setup: 4 nodes → Enable Partition → Split (50/50) type
Expected: Complete liveness failure, no consensus possible
Learning: Demonstrates why 2/3 threshold is critical
```

#### Scenario 3: Partition Healing (toggle on/off)

```
Setup: 4 nodes → Enable Partition → Wait for timeouts → Disable Partition
Expected: Consensus resumes after partition healed
Learning: Shows network recovery behavior
```

#### Scenario 4: Byzantine Nodes + Partition (7 nodes, 2 Byzantine, split)

```
Setup: 7 nodes, 2 Byzantine → Enable Partition → Split type
Expected: Severe consensus degradation, both liveness and safety concerns
Learning: Combined adversarial conditions
```

#### Scenario 5: High Latency + Partition

```
Setup: Set network latency to 2000ms → Enable Partition → Gradual type
Expected: Very slow consensus with frequent timeouts
Learning: Network conditions compound partition effects
```

### Configuration Tips

**Optimal Testing Setup**:

- Use 6-7 nodes for best partition demonstration
- Enable verbose logging to see all partition events
- Use Partition Test preset as starting point

**Observing Specific Properties**:

- **Liveness**: Split partition shows clear liveness violation
- **Safety**: All partition types should maintain safety
- **Byzantine Tolerance**: Combine with Byzantine nodes to test limits

**Common Patterns**:

1. **Majority Connectivity**: Consensus works if >2/3 nodes can communicate
2. **Minority Isolation**: Small partitions don't prevent consensus
3. **Split-Brain**: Equal splits prevent all consensus
4. **Healing**: Consensus resumes when partition resolves

### Troubleshooting

**Q: Partition enabled but consensus still works?**

- A: Check partition type. "Single Node" with 6+ total nodes leaves enough for consensus.
- A: Verify affected nodes count in partition panel.

**Q: Why does safety indicator stay green during partition?**

- A: Safety is maintained! Tendermint prevents conflicting commits even when liveness fails.

**Q: Messages lost shows 0?**

- A: Messages are lost when sent to partitioned nodes. May take a few rounds to accumulate.

**Q: How to see which specific nodes are partitioned?**

- A: Look for dashed orange borders with 🔌 icon, or check "Affected Nodes" in partition panel.

**Q: Can partitioned nodes become proposers?**

- A: No, partitioned nodes are excluded from proposer selection like Byzantine nodes.

### Educational Value

Use network partition simulation to teach:

- **CAP Theorem**: Consistency vs Availability trade-off during partition
- **Liveness vs Safety**: Safety maintained even when liveness fails
- **2/3 Threshold**: Why BFT consensus requires supermajority
- **Split-Brain Scenarios**: Dangers of network partition in distributed systems
- **Partition Tolerance**: How Tendermint handles network failures
- **Real-World Failures**: Simulate datacenter disconnections, router failures, etc.

### Best Practices

1. **Start Simple**: Test single node isolation before split partitions
2. **Observe First**: Watch a few rounds before analyzing
3. **Use Step-by-Step Mode**: Combine with step mode for detailed inspection
4. **Compare Configs**: Run with/without partition to see difference
5. **Document Behavior**: Note which configurations cause which failures

## For LLM Context

This project simulates the Tendermint BFT consensus protocol with a React-based frontend. The core logic resides in `src/utils/` (consensus algorithm, network simulation, configuration). The UI components in `src/components/` provide visualization and controls. State is managed centrally via `ConsensusContext.jsx`. The system models Byzantine nodes, network failures, network partitions, voting phases, timeout mechanisms, and tracks liveness/safety properties in real-time. Configuration is highly flexible with validation, presets, and import/export capabilities.

**New Network Partition Feature**: The visualizer now supports real-time network partition simulation with three partition types (single node isolation, 50/50 split, gradual degradation). Partitioned nodes are visually distinct with dashed borders and cannot participate in consensus. The feature includes network statistics tracking (messages sent/delivered/lost), real-time delivery rate monitoring, and integration with liveness/safety indicators to show partition impact on consensus properties. This feature demonstrates CAP theorem principles, liveness vs safety trade-offs, and the importance of majority connectivity in BFT consensus.

**New Step-by-Step Mode**: The visualizer now supports an educational step-by-step mode where users can advance through consensus one action at a time. This mode breaks down each consensus round into 8 distinct steps (Round Start, Block Proposal, Prevote, Prevote Tally, Precommit, Precommit Tally, Commit, Round Complete). Each step provides detailed state inspection showing the proposer, block details, vote counts, threshold status, and node states. The mode includes visual highlighting of active nodes, phase color-coding, tabular vote breakdowns, and navigation controls (next/previous, go to start, auto-play). This feature is ideal for educational purposes, debugging, and understanding the consensus process in detail.

## Key Implementation Details

### File Responsibilities

- **`ConsensusContext.jsx`**: Central state hub managing all application state including nodes, blocks, voting rounds, timeouts, step-by-step mode state, and configuration. Provides hooks for all components to access and modify state. Byzantine configuration is managed through the config state object.

- **`tendermintLogic.js`**: Pure consensus logic implementing proposer selection (excludes Byzantine nodes), block creation, voting mechanics (with Byzantine behavior simulation), voting round data structure management, and step-by-step execution. Defines 8 consensus steps with descriptions and phase information. The `voteOnBlock` function implements three Byzantine behaviors:

  - **Faulty nodes**: Return random votes (Math.random() > 0.5)
  - **Equivocator nodes**: Return votes with 70% approval rate (Math.random() > 0.3)
  - **Silent nodes**: Return null votes (no participation)
  - Byzantine detection flag is set when any Byzantine node participates

- **`NetworkSimulation.js`**: Orchestrates consensus steps by calling tendermintLogic functions and applying network conditions (latency, packet loss, downtime). Handles timeout detection, state transitions, and step-by-step mode execution. The `initializeNetwork` function creates Byzantine nodes based on config:
  - First `byzantineCount` nodes are marked as Byzantine
  - Byzantine nodes get red color (#ff6b6b) and isByzantine flag
  - byzantineType is set from config (faulty/equivocator/silent)
- **`ConfigManager.js`**: Configuration management including validation, presets, import/export, and analytical functions (success rate estimation, consensus time estimation). Enforces Byzantine node limits with `getMaxByzantineNodes()` function. Validates that byzantineCount ≤ floor(nodeCount/3). Includes "Byzantine Test" preset with 7 nodes and 2 Byzantine nodes.

- **`Node.jsx`**: Individual node visualization component. Displays Byzantine indicator (⚠️) badge for Byzantine nodes. Shows Byzantine type in hover tooltip. Byzantine nodes maintain red color (#ff6b6b) regardless of voting state. Supports highlighting in step-by-step mode.

- **`ConfigurationPanel.jsx`**: Full configuration UI including Byzantine node settings:

  - Number input for byzantineCount with dynamic max value (floor(n/3))
  - Dropdown selector for byzantineType (faulty/equivocator/silent)
  - Real-time validation and error messages
  - Visual feedback when Byzantine count approaches maximum
  - Descriptive labels explaining each Byzantine behavior type

- **`Controls.jsx`**: Simulation controls showing current configuration summary including Byzantine node count. Displays "X byzantine" in config summary when byzantineCount > 0.

- **`ConsensusVisualizer.jsx`**: Main visualization component rendering nodes, blocks, and their connections. Integrates TimeoutVisualizer, VotingVisualization, and supports node highlighting in step-by-step mode. Byzantine nodes are rendered with distinct styling.

- **`StepByStepControls.jsx`**: Controls for step-by-step mode including next/previous buttons, auto-play toggle, and progress display. Executes steps and updates state accordingly.

- **`StateInspector.jsx`**: Displays current step information including proposer, block details, vote counts, thresholds, network status, and commit status. Shows phase-specific data with color-coded badges.

- **`DetailedStepView.jsx`**: Provides detailed tabular breakdown of votes, node states, and consensus progress. Shows vote-by-vote analysis with Byzantine node identification.

- **`NetworkPartition.jsx`**: Visualizes active network partitions with statistics panel showing affected nodes, message delivery rates, and network health metrics. Displays partition type, visual indicators, and real-time network statistics (messages sent/delivered/lost).

- **Voting Components**: Multiple specialized components (VotingBreakdown, VotingDetails, VotingHistory, VotingStatistics, VotingVisualization) provide comprehensive voting analysis from different perspectives.

- **Indicator Components**: LivenessIndicator and SafetyIndicator monitor and display the two critical consensus properties in real-time.

- **Controls**: Simulation controls (start/stop/reset), speed adjustment, and configuration panel for live parameter changes.

This architecture ensures separation of concerns, making it easy to understand, test, and extend individual features independently.

### Byzantine Node Implementation Deep Dive

#### Initialization (`NetworkSimulation.js`)

When the network is initialized, Byzantine nodes are created based on configuration:

```javascript
export function initializeNetwork(nodeCount, config) {
  const byzantineCount =
    config?.nodeBehavior?.byzantineCount || 0;

  return Array.from({ length: nodeCount }, (_, i) => {
    const isByzantine = i < byzantineCount;
    return {
      id: i + 1,
      state: "Idle",
      color: isByzantine ? "#ff6b6b" : "#ccc", // Red for Byzantine
      isByzantine,
      byzantineType:
        config?.nodeBehavior?.byzantineType || "faulty",
      isOnline: true,
    };
  });
}
```

**Key Points:**

- First `byzantineCount` nodes become Byzantine (nodes 1, 2, ..., byzantineCount)
- Byzantine nodes start with red color (#ff6b6b) and never change
- All Byzantine nodes share the same behavior type (from config)

#### Proposer Selection (`tendermintLogic.js`)

Byzantine nodes are excluded from proposer rotation:

```javascript
export function getNextProposer(nodes, round) {
  // Get only online, non-byzantine nodes for proposer selection
  const eligibleNodes = nodes.filter(
    (n) => n.isOnline && !n.isByzantine
  );
  if (eligibleNodes.length === 0) {
    // Fallback to all nodes if no eligible ones
    return nodes[round % nodes.length];
  }
  return eligibleNodes[round % eligibleNodes.length];
}
```

**Rationale:**

- Byzantine nodes might propose invalid blocks
- Ensures proposer is always honest (educational clarity)
- Falls back to any node if all nodes are Byzantine (edge case)

#### Voting Behavior (`tendermintLogic.js`)

Byzantine nodes vote differently based on their type:

```javascript
export function voteOnBlock(nodes, block, config) {
  let byzantineDetected = false;

  const votes = nodes.map((node) => {
    // Node is offline - no vote
    if (!node.isOnline) {
      return { nodeId: node.id, vote: null, isByzantine: false };
    }

    // Byzantine node behavior
    if (node.isByzantine) {
      byzantineDetected = true;
      switch (node.byzantineType) {
        case "faulty":
          // Votes randomly (50/50)
          return {
            nodeId: node.id,
            vote: Math.random() > 0.5,
            isByzantine: true,
          };
        case "equivocator":
          // Sends conflicting votes (simulated as 70% approval)
          return {
            nodeId: node.id,
            vote: Math.random() > 0.3,
            isByzantine: true,
          };
        case "silent":
          // Doesn't vote
          return {
            nodeId: node.id,
            vote: null,
            isByzantine: true,
          };
        default:
          return {
            nodeId: node.id,
            vote: Math.random() > 0.5,
            isByzantine: true,
          };
      }
    }

    // Honest node with response variance
    const baseApprovalRate = 0.9;
    const varianceImpact =
      (Math.random() * responseVariance) / 1000;
    const approval = Math.random() > 0.1 - varianceImpact;

    return {
      nodeId: node.id,
      vote: approval,
      isByzantine: false,
    };
  });

  // ... threshold checking logic
  return {
    votes,
    yesVotes,
    totalVotes,
    approved,
    byzantineDetected,
  };
}
```

**Behavior Breakdown:**

- **Faulty**: Pure random (50% yes, 50% no) - most chaotic
- **Equivocator**: 70% approval rate - simulates conflicting votes biased toward approval
- **Silent**: null vote - reduces effective validator set
- **Honest**: 90% base approval + variance - mostly agree, occasionally disagree

#### Visual Rendering (`Node.jsx`)

Byzantine nodes are rendered with distinctive visual indicators:

```javascript
export default function Node({ node, isHighlighted = false }) {
  const { id, state, color } = node; // color is always #ff6b6b for Byzantine
  const { currentRoundVotes, currentProposer } = useConsensus();

  // ... voting status logic

  return (
    <motion.div
      className={`node ${isProposer ? "node-proposer" : ""} ${
        isHighlighted ? "node-highlighted" : ""
      }`}
      style={{
        backgroundColor: color, // Red for Byzantine
        boxShadow: isHighlighted
          ? "0 0 20px rgba(255, 215, 0, 0.8)"
          : "none",
      }}
      whileHover={{ scale: 1.1 }}
    >
      <div className="node-id">Node {id}</div>
      <div className="node-state">{state}</div>
      {renderVoteBadge()}

      {/* Byzantine indicator badge */}
      {node.isByzantine && (
        <div
          className="byzantine-indicator"
          title={`Byzantine: ${node.byzantineType}`}
        >
          ⚠
        </div>
      )}

      {/* Proposer indicator (never shown for Byzantine) */}
      {isProposer && (
        <div
          className="proposer-indicator"
          title="Current Proposer"
        >
          👑
        </div>
      )}

      {isHighlighted && (
        <motion.div
          className="highlight-ring"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
```

**Visual Elements:**

- Red background color (unchanging)
- ⚠️ warning badge in top-right corner
- Hover tooltip showing Byzantine type
- Never shows proposer crown (👑)
- Still shows vote badges (✓/✗) based on voting behavior

#### Configuration Validation (`ConfigManager.js`)

Byzantine count is validated to enforce n/3 limit:

```javascript
export function validateConfig(config) {
  const errors = [];
  const { network, nodeBehavior } = config;

  // Node behavior validation
  const maxByzantine = Math.floor(network.nodeCount / 3);
  if (
    nodeBehavior.byzantineCount < 0 ||
    nodeBehavior.byzantineCount > maxByzantine
  ) {
    errors.push(
      `Byzantine nodes must be between 0 and ${maxByzantine} (less than n/3)`
    );
  }
  if (
    !["faulty", "equivocator", "silent"].includes(
      nodeBehavior.byzantineType
    )
  ) {
    errors.push("Invalid Byzantine type");
  }

  // ... other validations
  return { valid: errors.length === 0, errors };
}

export function getMaxByzantineNodes(nodeCount) {
  return Math.floor(nodeCount / 3);
}
```

**Validation Rules:**

- byzantineCount must be 0 ≤ count ≤ floor(n/3)
- byzantineType must be one of: "faulty", "equivocator", "silent"
- Configuration is rejected if validation fails

#### Impact on Consensus Success Rate

Byzantine nodes affect consensus success through multiple mechanisms:

```javascript
export function estimateSuccessRate(config) {
  const { network, nodeBehavior } = config;

  let successRate = 100;

  // Byzantine factor (higher impact than other factors)
  const byzantineRatio =
    nodeBehavior.byzantineCount / network.nodeCount;
  successRate -= byzantineRatio * 150; // 150% penalty per Byzantine ratio

  // Packet loss factor
  successRate -= network.packetLoss * 0.5;

  // Downtime factor
  successRate -= nodeBehavior.downtimePercentage * 0.3;

  return Math.max(0, Math.min(100, successRate)).toFixed(1);
}
```

**Impact Analysis:**

- 1 Byzantine node out of 4 (25%) → -37.5% success rate
- 2 Byzantine nodes out of 7 (28.6%) → -42.9% success rate
- 3 Byzantine nodes out of 10 (30%) → -45% success rate
- Combined with network issues, success rate drops significantly

#### Safety and Liveness Detection

Byzantine behavior can trigger safety/liveness violations:

```javascript
// In NetworkSimulation.js - simulateConsensusStep()
if (
  approved &&
  votingRound.precommitThresholdMet &&
  !packetLossOccurred
) {
  // Consensus succeeded
  newBlock = block;
  // ...
} else {
  // Consensus failed - check for violations
  const baseFailureRate = 0.1;
  const byzantineImpact =
    (config?.nodeBehavior?.byzantineCount || 0) / nodes.length;
  const networkImpact = packetLoss / 100;

  const livenessFailureRate =
    baseFailureRate + byzantineImpact + networkImpact;
  const safetyFailureRate =
    baseFailureRate / 2 + byzantineImpact * 2;

  newLiveness = Math.random() > livenessFailureRate;
  newSafety =
    Math.random() > safetyFailureRate || !byzantineDetected;
  // ...
}
```

**Violation Probability:**

- **Liveness**: Linear increase with Byzantine count (direct impact)
- **Safety**: Double impact from Byzantine nodes (Byzantine detection matters)
- Higher Byzantine count → more frequent violations

### Testing Byzantine Implementations

To verify Byzantine behavior:

1. **Unit Test Byzantine Voting:**

   ```javascript
   // Test faulty node voting distribution
   const faultyNode = {
     isByzantine: true,
     byzantineType: "faulty",
     isOnline: true,
   };
   const votes = Array.from(
     { length: 1000 },
     () => voteOnBlock([faultyNode], block, config).votes[0].vote
   );
   const yesCount = votes.filter((v) => v === true).length;
   // Should be approximately 500 (50%)
   ```

2. **Integration Test Proposer Exclusion:**

   ```javascript
   const nodes = initializeNetwork(4, {
     nodeBehavior: { byzantineCount: 2 },
   });
   for (let round = 0; round < 10; round++) {
     const proposer = getNextProposer(nodes, round);
     expect(proposer.isByzantine).toBe(false);
   }
   ```

3. **Visual Test Byzantine Indicators:**

   - Open Step-by-Step mode
   - Configure 7 nodes, 2 Byzantine
   - Verify red color, ⚠️ badge, and tooltip on nodes 1 and 2
   - Verify Byzantine nodes never get proposer crown

4. **Consensus Threshold Test:**
   ```javascript
   // 4 nodes, 1 Byzantine (faulty) - should still reach consensus most times
   // 4 nodes, 2 Byzantine - should fail (exceeds n/3)
   ```
