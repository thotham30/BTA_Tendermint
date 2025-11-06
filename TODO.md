# Tendermint Consensus Visualizer - TODO List

## Overview

This document outlines all missing features and enhancements needed to create a complete Tendermint Protocol Visualizer. Each feature includes a detailed LLM prompt for implementation.

---

## Missing Features & Enhancements

### 1. **Byzantine Node Simulation** ❌ MISSING

**Priority:** HIGH  
**Status:** Not Started

Byzantine nodes are critical to understanding BFT consensus. The current implementation doesn't simulate faulty or malicious nodes.

#### Current State:

- All nodes behave honestly
- No simulation of Byzantine behavior (sending conflicting votes, proposals, or timeouts)
- No way to test consensus robustness under adversarial conditions

#### LLM Prompt:

```
You are implementing a Byzantine Node Simulation feature for a Tendermint Protocol Visualizer built with React and Vite.

CONTEXT:
The project visualizes Tendermint consensus in real-time. Currently all 4 validator nodes behave honestly. We need to add Byzantine node simulation to test BFT consensus robustness.

REQUIREMENTS:
1. Add Byzantine node configuration to ConsensusContext.jsx
   - Allow marking nodes as Byzantine (faulty or malicious) via a new control
   - Track Byzantine node count and behavior type (faulty, equivocator, silent)

2. Modify Node.jsx component to display Byzantine nodes differently:
   - Add a "⚠️ Byzantine" label for Byzantine nodes
   - Use different color scheme (e.g., dark red #8b0000 for faulty nodes)
   - Show behavior type on hover tooltip

3. Update NetworkSimulation.js to simulate Byzantine behavior:
   - Implement Byzantine vote simulation: Byzantine nodes send conflicting votes
   - Implement Byzantine proposal: Byzantine nodes propose invalid blocks
   - Implement Byzantine silence: Byzantine nodes don't participate
   - Byzantine node count affects consensus success rate (consensus still works if < 1/3 are Byzantine)

4. Add Byzantine Controls component:
   - Button to toggle Byzantine node simulation on/off
   - Dropdown to select number of Byzantine nodes (0-3 out of 4)
   - Dropdown to select Byzantine behavior type (faulty, equivocator, silent)
   - Display current Byzantine node count and type

5. Update LogsWindow.jsx to show Byzantine events:
   - Log when Byzantine nodes send conflicting votes
   - Log Byzantine proposal attempts
   - Log when Byzantine behavior is detected

6. Update ConsensusContext.jsx to manage Byzantine state:
   - Add byzantineCount state
   - Add byzantineType state (faulty, equivocator, silent)
   - Add toggleByzantine function
   - Pass Byzantine info to simulateConsensusStep

7. Update tendermintLogic.js:
   - Add isByzantine parameter to voteOnBlock function
   - Implement Byzantine voting logic: conflicting votes, invalid votes
   - Track how many Byzantine nodes are detected

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/utils/NetworkSimulation.js
- src/utils/tendermintLogic.js
- src/components/Node.jsx
- src/components/Controls.jsx
- src/components/LogsWindow.jsx
- src/styles/App.css (add Byzantine node styles)
- src/components/ByzantineControls.jsx (NEW FILE)

TECHNICAL DETAILS:
- Byzantine nodes should not affect overall consensus if < 1/3
- Track Byzantine detection rates in logs
- Visual feedback should be immediate and clear
- Ensure educational value: show why f < n/3 Byzantine nodes can be tolerated
```

---

### 2. **Network Partitioning Scenarios** ✅ COMPLETED

**Priority:** HIGH  
**Status:** Implemented

Network partitions test liveness and safety under communication failures.

#### Implementation Status:

- ✅ Network partition state management in ConsensusContext
- ✅ Three partition types: Single Node, Split, Gradual
- ✅ Real-time partition toggle controls
- ✅ Partition visualization with dashed borders and indicators
- ✅ Network statistics tracking (messages sent/delivered/lost)
- ✅ Integration with NetworkSimulation.js partition logic
- ✅ Partitioned node visual indicators (🔌 badge, dashed borders)
- ✅ Liveness/Safety indicator updates for partition awareness
- ✅ Comprehensive logging of partition events
- ✅ CSS styling for partition visualization
- ✅ Documentation in README.md with usage guide

#### Features Implemented:

1. **Network Partition State in ConsensusContext.jsx**:

   - partitionActive: boolean
   - partitionedNodes: array of node IDs
   - partitionType: "single", "split", or "gradual"
   - networkStats: tracking messages sent, delivered, lost

2. **NetworkPartition.jsx Component**:

   - Visual partition panel with statistics
   - Shows affected nodes and partition type
   - Displays network health metrics
   - Real-time message delivery rate

3. **Network Controls in Controls.jsx**:

   - Toggle partition on/off button
   - Partition type selector (Single Node, Split, Gradual)
   - Real-time partition configuration

4. **NetworkSimulation.js Updates**:

   - Partitioned nodes excluded from voting
   - Message tracking (sent/delivered/lost)
   - Partition impact on consensus calculations
   - Timeout handling for partitioned scenarios

5. **Node.jsx Updates**:

   - Dashed orange border for partitioned nodes
   - 🔌 Partition indicator badge
   - Network health indicator (📡)
   - Partition status in tooltips

6. **LogsWindow.jsx Updates**:

   - Partition status summary panel
   - Network statistics display
   - Delivery rate warnings
   - Partition-related log filtering

7. **Liveness/Safety Indicators**:

   - Show partition impact on liveness
   - Explain degradation due to partitions
   - Safety maintained despite partitions message

8. **CSS Styling**:
   - Partition node styles (dashed borders, animations)
   - Partition panel styling
   - Network health color coding
   - Responsive partition controls

**Files Modified:**

- ✅ src/context/ConsensusContext.jsx
- ✅ src/utils/NetworkSimulation.js
- ✅ src/components/Node.jsx
- ✅ src/components/Controls.jsx
- ✅ src/components/LogsWindow.jsx
- ✅ src/components/NetworkPartition.jsx (NEW)
- ✅ src/components/ConsensusVisualizer.jsx
- ✅ src/components/LivenessIndicator.jsx
- ✅ src/components/SafetyIndicator.jsx
- ✅ src/styles/Visualizer.css
- ✅ src/styles/App.css
- ✅ README.md

**No additional implementation needed** - Feature is production-ready and documented.

---

### 3. **Transaction Pool & Mempool Visualization** ❌ MISSING

**Priority:** MEDIUM  
**Status:** Not Started

Show actual transactions being proposed and committed.

#### Current State:

- Blocks only show transaction count (not actual transactions)
- No transaction pool (mempool) visualization
- No way to see individual transactions

#### LLM Prompt:

```
You are implementing Transaction Pool and Mempool Visualization for a Tendermint Protocol Visualizer.

CONTEXT:
Currently, blocks only show a count of transactions (txCount: 1-10). We need to visualize actual transactions in a mempool, their journey through consensus, and commitment to blocks.

REQUIREMENTS:
1. Create Transaction model in tendermintLogic.js:
   - Transaction structure: { id, sender, recipient, amount, timestamp, status }
   - Possible statuses: pending, proposed, committed, expired
   - Generate sample transactions procedurally

2. Create Mempool.jsx component:
   - Display pending transactions in a scrollable list
   - Show transaction details: ID, sender, recipient, amount
   - Color-code by status: pending (blue), proposed (yellow), committed (green), expired (red)
   - Show count of pending/proposed/committed transactions

3. Update ConsensusContext.jsx:
   - Add mempool state: array of transactions
   - Add txPoolSize config: max number of pending transactions (default: 50)
   - Add generateTransactions function to create random transactions
   - Track transaction lifecycle: pending → proposed → committed

4. Update Block.jsx:
   - Instead of just txCount, show transaction IDs or hashes
   - Clickable transaction to see details (sender, recipient, amount)
   - Visual indicator of block weight/size based on transaction count

5. Create TransactionDetails.jsx component:
   - Modal/popup showing full transaction details
   - Show timestamp, sender, recipient, amount
   - Show which block it was committed to
   - Show block height and round

6. Update NetworkSimulation.js:
   - When a block is proposed, select transactions from mempool
   - Remove committed transactions from mempool
   - Add new transactions to mempool periodically
   - Implement transaction expiration (after N rounds)
   - Track transaction throughput (tx/block)

7. Update ConsensusVisualizer.jsx:
   - Add Mempool display on the left side showing pending transactions
   - Show transaction flow visualization (mempool → block → chain)
   - Display transaction statistics: total pending, avg block size

8. Update LogsWindow.jsx:
   - Log transaction events: new tx added, tx proposed, tx committed
   - Show transaction hashes in logs
   - Track and display transaction throughput per block

9. Update App.jsx layout:
   - Reorganize layout to show: Mempool | Nodes/Blocks | Logs
   - Show transaction flow from left to right

10. Add Transaction Counter to header:
    - Display: "Pending Transactions: X", "Committed: Y", "Throughput: Z tx/block"

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/utils/NetworkSimulation.js
- src/utils/tendermintLogic.js
- src/components/ConsensusVisualizer.jsx
- src/components/Block.jsx
- src/components/Controls.jsx
- src/components/LogsWindow.jsx
- src/components/Mempool.jsx (NEW FILE)
- src/components/TransactionDetails.jsx (NEW FILE)
- src/App.jsx
- src/styles/App.css
- src/styles/Visualizer.css

TECHNICAL DETAILS:
- Transaction generation should be random but realistic
- Transaction expiration should teach about timeout mechanisms
- Show how block proposal selects transactions from mempool
- Visual animation when transaction moves from mempool → block → committed
```

---

### 4. **Step-by-Step Mode with Detailed State Inspection** ❌ MISSING

**Priority:** MEDIUM  
**Status:** Not Started

Allow users to step through consensus one action at a time with detailed state inspection.

#### Current State:

- Only continuous simulation or paused state
- No ability to inspect intermediate consensus steps
- No way to see detailed state at each step

#### LLM Prompt:

```
You are implementing Step-by-Step Mode with Detailed State Inspection for a Tendermint Protocol Visualizer.

CONTEXT:
The visualizer currently runs in continuous mode or is paused. For educational purposes, we need a step-by-step mode where users can advance through consensus one action at a time and inspect detailed state at each step.

REQUIREMENTS:
1. Add Step-by-Step Mode State to ConsensusContext.jsx:
   - stepMode: boolean (enable/disable step-by-step mode)
   - currentStep: number (which step in the current round we're on)
   - stepHistory: array of step states for undo/redo
   - stepDescription: string (description of current step)

2. Define Consensus Steps in tendermintLogic.js:
   - Step 0: "Round Start" - Initialize round, select proposer
   - Step 1: "Block Proposal" - Proposer creates and broadcasts block
   - Step 2: "Prevote" - Validators vote on the proposed block
   - Step 3: "Prevote Tally" - Count prevotes, check if > 2/3
   - Step 4: "Precommit" - If prevotes pass, validators precommit
   - Step 5: "Precommit Tally" - Count precommits, check if > 2/3
   - Step 6: "Commit" - If precommits pass, block is committed
   - Step 7: "Round Complete" - Reset for next round or timeout

3. Create StepByStepControls.jsx component:
   - Toggle button: "Step-by-Step Mode"
   - "Next Step" button (only active in step mode)
   - "Previous Step" button (undo/redo)
   - "Go to Round Start" button (jump to beginning of current round)
   - "Auto-play Steps" toggle (play through steps automatically)
   - Display current step number and total steps in round

4. Create StateInspector.jsx component:
   - Show current step description
   - Display proposer for current round
   - Show current vote counts (prevotes, precommits)
   - Display each node's state and vote
   - Show 2/3+ threshold and current vote percentage
   - Display voting breakdown per node
   - Show timeout/deadline info

5. Update ConsensusVisualizer.jsx:
   - Highlight nodes involved in current step:
     * Proposer node: highlighted in step 1
     * Voting nodes: highlighted in steps 2-5
     * Committing node: highlighted in step 6
   - Animate state transitions between steps
   - Show vote progress bars during prevote/precommit steps

6. Update Controls.jsx:
   - Add mode selector: "Continuous" vs "Step-by-Step"
   - Show step-by-step controls when in step mode
   - Keep existing speed controls for continuous mode

7. Update LogsWindow.jsx:
   - Highlight current step in logs
   - Show step-by-step breakdown of events
   - Color-code by step phase
   - Link log entries to specific steps

8. Create DetailedStepView.jsx component:
   - Panel showing detailed state for current step
   - Show proposer and block details
   - Show vote breakdown in tabular form
   - Show vote thresholds and current count
   - Show which nodes voted and how

9. Update App.jsx layout:
   - Add StateInspector to the main view
   - Show step-by-step controls prominently in step mode
   - Reorganize layout to fit state inspection panel

10. Update styling:
    - Add visual highlighting for active nodes in current step
    - Add animations for state transitions between steps
    - Color-code consensus phases (proposal: yellow, voting: blue, commit: green)

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/utils/NetworkSimulation.js
- src/utils/tendermintLogic.js
- src/components/Controls.jsx
- src/components/ConsensusVisualizer.jsx
- src/components/Node.jsx
- src/components/LogsWindow.jsx
- src/components/StepByStepControls.jsx (NEW FILE)
- src/components/StateInspector.jsx (NEW FILE)
- src/components/DetailedStepView.jsx (NEW FILE)
- src/App.jsx
- src/styles/App.css
- src/styles/Visualizer.css

TECHNICAL DETAILS:
- Step mode should be pausable and resumable
- Each step should have a clear description and educational value
- State inspector should show all relevant data for understanding that step
- Support undo/redo for reviewing steps
- Color-code different consensus phases for clarity
- Show vote thresholds (2/3+) prominently
```

---

### 5. **Message Passing Visualization** ❌ MISSING

**Priority:** MEDIUM  
**Status:** Not Started

Show actual message exchange between nodes with animation.

#### Current State:

- No visualization of message passing
- Nodes just update state instantly
- No way to see communication delays or message flow

#### LLM Prompt:

```
You are implementing Message Passing Visualization for a Tendermint Protocol Visualizer.

CONTEXT:
Currently, consensus messages (proposals, votes, precommits) are instant and invisible. To improve educational value, we need to visualize actual message passing between nodes with animated arrows showing message flow and types.

REQUIREMENTS:
1. Create Message model in tendermintLogic.js:
   - Message types: PROPOSAL, PREVOTE, PRECOMMIT, TIMEOUT
   - Message structure: { id, type, from, to, payload, timestamp, status }
   - Possible statuses: sent, in-transit, delivered, failed

2. Update NetworkSimulation.js:
   - Instead of instant voting, create messages and track them
   - Messages have a delivery time based on network latency
   - Implement message queue for each node
   - Track message statistics: sent, delivered, failed

3. Create MessageVisualization.jsx component:
   - Render animated arrows between nodes
   - Arrow color by message type:
     * PROPOSAL: yellow
     * PREVOTE: blue
     * PRECOMMIT: green
     * TIMEOUT: red
   - Arrow animation: travel from sender to receiver
   - Show message type label on arrow
   - Fade out when delivered

4. Update ConsensusVisualizer.jsx:
   - Add MessageVisualization overlay
   - Show all active messages (in-transit)
   - Render on top of node visualization
   - Update in real-time as messages are sent/received

5. Create MessageQueue.jsx component:
   - Show pending messages for each node
   - Display message type, sender, and estimated delivery time
   - Update as messages are processed
   - Show message latency

6. Update Node.jsx:
   - Show message indicator badge when node receives messages
   - Pulse animation for new messages
   - Show count of pending messages

7. Update ConsensusContext.jsx:
   - Add messages state: array of all messages
   - Add messageDelayMs config: network latency (default: 100ms)
   - Add processMessages function to handle message delivery
   - Track message statistics

8. Update Controls.jsx:
   - Add "Message Visualization" toggle on/off
   - Add slider for message delay (0-500ms)
   - Option to show/hide message labels
   - Option to slow down message animations

9. Update LogsWindow.jsx:
   - Log message events: sent, delivered, failed
   - Show message source and destination
   - Track message statistics in logs

10. Update SafetyIndicator and LivenessIndicator:
    - Consider message loss in calculations
    - Show how message failures affect consensus properties

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/utils/NetworkSimulation.js
- src/utils/tendermintLogic.js
- src/components/ConsensusVisualizer.jsx
- src/components/Node.jsx
- src/components/Controls.jsx
- src/components/LogsWindow.jsx
- src/components/MessageVisualization.jsx (NEW FILE)
- src/components/MessageQueue.jsx (NEW FILE)
- src/styles/Visualizer.css
- src/styles/App.css

TECHNICAL DETAILS:
- Use Framer Motion for smooth message animations
- Messages should move from sender to receiver over time
- Message delay should affect consensus timing
- Different message types should be visually distinct
- Show message statistics: throughput, latency, loss rate
- Educational goal: show how message delays affect consensus rounds
```

---

### 6. **Configurable Network Parameters** ❌ MISSING

**Priority:** MEDIUM  
**Status:** Not Started

Allow users to configure network, consensus, and node parameters interactively.

#### Current State:

- Only 4 nodes hardcoded
- No ability to change number of nodes
- No configuration for consensus parameters
- Limited speed control (only simulation speed)

#### LLM Prompt:

```
You are implementing Configurable Network Parameters for a Tendermint Protocol Visualizer.

CONTEXT:
The visualizer currently has hardcoded values (4 nodes, fixed timeout, fixed byzantine threshold). For full educational value, users should be able to configure all important parameters and see how they affect consensus behavior.

REQUIREMENTS:
1. Create ConfigurationPanel.jsx component:
   - Modal/panel with all configurable parameters
   - Organized into sections: Network, Consensus, Node Behavior, Simulation
   - Save/Load/Reset configurations
   - Show descriptions and ranges for each parameter

2. Add Network Configuration:
   - Number of nodes: 3-20 (default: 4)
   - Network latency: 0-5000ms (default: 100ms)
   - Packet loss rate: 0-100% (default: 0%)
   - Message timeout: 1000-10000ms (default: 5000ms)

3. Add Consensus Configuration:
   - Round timeout: 1000-10000ms (default: 5000ms)
   - Vote threshold: 2/3+, 1/2+, custom (default: 2/3+)
   - Block size: transactions per block (default: 10)
   - Block proposal delay: 0-1000ms (default: 100ms)

4. Add Node Behavior Configuration:
   - Byzantine node count: 0-n/3 (default: 0)
   - Byzantine node type: faulty, equivocator, silent (default: faulty)
   - Node downtime percentage: 0-100% (default: 0%)
   - Node response time variance: 0-1000ms (default: 50ms)

5. Add Simulation Configuration:
   - Transaction generation rate: low, medium, high (default: medium)
   - Transaction pool size: 10-1000 (default: 50)
   - Simulation duration limit: off, 5 min, 10 min, 30 min
   - Log detail level: minimal, normal, verbose (default: normal)

6. Create ConfigManager utility:
   - Save configurations to localStorage
   - Load saved configurations
   - Export configurations as JSON
   - Import configurations from JSON
   - Reset to defaults

7. Update ConsensusContext.jsx:
   - Add config state object
   - Add loadConfig function
   - Pass config to simulation functions
   - Allow runtime config updates (where applicable)

8. Update NetworkSimulation.js and tendermintLogic.js:
   - Accept configuration parameters
   - Use parameters instead of hardcoded values
   - Dynamically adjust behavior based on config

9. Update Controls.jsx:
   - Add "Configuration" button to open ConfigurationPanel
   - Show active configuration name
   - Quick presets: "Small Network", "Large Network", "Byzantine Test", "Partition Test"

10. Update App.jsx:
    - Add configuration panel toggle
    - Display currently active configuration
    - Show configuration summary (nodes: 4, latency: 100ms, etc.)

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/utils/NetworkSimulation.js
- src/utils/tendermintLogic.js
- src/components/Controls.jsx
- src/components/App.jsx
- src/components/ConfigurationPanel.jsx (NEW FILE)
- src/utils/ConfigManager.js (NEW FILE)
- src/styles/App.css

TECHNICAL DETAILS:
- Validate parameter ranges before applying
- Show warnings for invalid configurations (e.g., byzantine >= n/3)
- Save configuration state to localStorage for persistence
- Allow preset configurations for common scenarios
- Show impact of configuration changes on consensus (estimated time, success rate, etc.)
- Provide helpful descriptions for each parameter
```

---

### 7. **Real-time Statistics Dashboard** ❌ MISSING

**Priority:** MEDIUM  
**Status:** Not Started

Display detailed metrics and statistics about consensus performance.

#### Current State:

- Only basic indicators (safety/liveness)
- No performance metrics
- No statistics tracking
- No consensus efficiency analysis

#### LLM Prompt:

```
You are implementing a Real-time Statistics Dashboard for a Tendermint Protocol Visualizer.

CONTEXT:
The visualizer currently shows only basic safety/liveness indicators. To help users understand consensus performance, we need a comprehensive statistics dashboard showing metrics like throughput, latency, round duration, and Byzantine resilience.

REQUIREMENTS:
1. Create StatisticsTracker utility:
   - Track metrics per round, per block, and overall
   - Calculate averages, min/max, standard deviation
   - Export statistics for analysis

2. Create StatsDashboard.jsx component:
   - Organized into tabs: Performance, Network, Consensus, Byzantine
   - Real-time metric updates
   - Charts showing trends over time
   - Summary cards with key metrics

3. Performance Metrics:
   - Rounds completed
   - Blocks committed
   - Average round duration (ms)
   - Consensus success rate (%)
   - Throughput (blocks/second, transactions/second)
   - Average block size (tx count)

4. Network Metrics:
   - Messages sent/received
   - Message delivery rate (%)
   - Average message latency (ms)
   - Network bandwidth (messages/sec)
   - Packet loss rate (%)
   - Network partitions detected

5. Consensus Metrics:
   - Byzantine tolerance achieved (nodes/total)
   - Consensus phases: proposal (%), prevote (%), precommit (%)
   - Vote distribution per round (average prevotes, precommits)
   - Timeout occurrences and rate
   - Safety violations: 0, Liveness violations: 0

6. Byzantine Metrics (when Byzantine nodes are active):
   - Byzantine nodes count and type
   - Detected Byzantine behavior instances
   - Attack success rate (%)
   - Network resilience score
   - Threshold margin (current Byzantine nodes vs max tolerable)

7. Create Charts using Recharts library:
   - Rounds Duration (line chart over time)
   - Block Production Rate (bar chart)
   - Network Health (area chart)
   - Message Flow (stacked bar chart)
   - Vote Distribution (pie chart per round)

8. Add Export Functionality:
   - Export statistics as CSV
   - Export as JSON for further analysis
   - Export charts as images (PNG)
   - Copy statistics to clipboard

9. Update ConsensusContext.jsx:
   - Add statistics state
   - Track metrics during simulation
   - Expose statistics via context
   - Calculate running averages and trends

10. Create DetailedStats.jsx component:
    - Expandable sections for each metric category
    - Show detailed breakdowns
    - Display comparisons (current vs average vs best)
    - Show historical data with date/time

11. Update App.jsx:
    - Add Statistics tab or panel
    - Show summary stats in header
    - Link to detailed statistics dashboard

12. Update LogsWindow.jsx:
    - Add statistics export button
    - Show key metrics in separate section

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/components/App.jsx
- src/components/LogsWindow.jsx
- src/utils/StatisticsTracker.js (NEW FILE)
- src/components/StatsDashboard.jsx (NEW FILE)
- src/components/DetailedStats.jsx (NEW FILE)
- src/styles/App.css

DEPENDENCIES TO ADD:
- recharts (for charts and graphs)

TECHNICAL DETAILS:
- Use rolling window for memory efficiency (keep last N rounds)
- Calculate statistics incrementally for performance
- Show trends: improving/degrading indicators
- Highlight anomalies in data
- Provide baseline for comparison (theoretical vs actual)
- Color-code metrics: green (good), yellow (warning), red (critical)
```

---

### 8. **Round Timeouts & Timeout Escalation** ❌ MISSING

**Priority:** HIGH  
**Status:** Not Started

Implement realistic timeout mechanism that teaches Byzantine FT timeout escalation.

#### Current State:

- Timeouts are simulated randomly
- No realistic timeout mechanism
- No timeout escalation (exponential backoff)
- Timeout doesn't actually pause consensus

#### LLM Prompt:

```
You are implementing Round Timeouts and Timeout Escalation for a Tendermint Protocol Visualizer.

CONTEXT:
Tendermint uses a timeout mechanism where if consensus doesn't progress, the round times out and the next proposer is selected. For realistic simulation, we need to implement actual timeout tracking, escalation (exponential backoff), and visualize timeout behavior.

REQUIREMENTS:
1. Update ConsensusContext.jsx:
   - Add roundStartTime tracking
   - Add timeoutDuration state (initial timeout)
   - Add timeoutMultiplier config (e.g., 1.5 for each timeout)
   - Add roundTimeouts counter
   - Implement checkRoundTimeout function

2. Implement Timeout Logic in NetworkSimulation.js:
   - Check elapsed time since round start
   - If elapsed > timeout duration, trigger round timeout
   - On timeout: increment timeout counter, move to next proposer
   - Implement exponential backoff: next_timeout = current_timeout * multiplier
   - Track timeout escalation: timeout_duration increases each timeout
   - Reset timeout_duration on successful block commit

3. Create TimeoutVisualizer.jsx component:
   - Visual countdown timer for current round
   - Circular progress bar showing time remaining
   - Color: green (plenty of time), yellow (warning), red (critical)
   - Show current timeout duration
   - Show escalation level (1st timeout, 2nd timeout, etc.)

4. Update Node.jsx:
   - Add "Timeout" state (red color #f94144)
   - Distinguish between "Voting", "Timeout", "Committed"
   - Show node's vote count visually
   - Indicate which nodes voted vs timed out

5. Update ConsensusVisualizer.jsx:
   - Highlight proposer node prominently
   - Show current round timeout status
   - Display proposer name/ID clearly
   - Show when proposer changes due to timeout

6. Update Controls.jsx:
   - Add slider for initial timeout (1000-10000ms, default 5000ms)
   - Add slider for timeout multiplier (1.1-2.0, default 1.5)
   - Toggle "Timeout Escalation" on/off
   - Display current timeout value and escalation level

7. Update LogsWindow.jsx:
   - Log timeout events: "Round X timeout, proposer change to Node Y"
   - Log timeout escalation: "Timeout duration increased to Xms"
   - Show timeout statistics: total timeouts, average duration
   - Warn if too many timeouts (potential liveness issue)

8. Create TimeoutStats.jsx component:
   - Show timeout history
   - Display timeout escalation chain
   - Show average timeout duration
   - Alert if timeouts are excessive

9. Update SafetyIndicator.jsx and LivenessIndicator.jsx:
   - Consider timeout behavior in calculations
   - Excessive timeouts indicate liveness issues
   - Show if timeouts are normal or anomalous

10. Educational enhancements:
    - Explain timeout mechanism in tooltip
    - Show "why timeouts matter" in UI
    - Link timeout behavior to Byzantine FT properties
    - Show timeout vs network latency relationship

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/utils/NetworkSimulation.js
- src/utils/tendermintLogic.js
- src/components/Node.jsx
- src/components/ConsensusVisualizer.jsx
- src/components/Controls.jsx
- src/components/LogsWindow.jsx
- src/components/TimeoutVisualizer.jsx (NEW FILE)
- src/components/TimeoutStats.jsx (NEW FILE)
- src/styles/App.css
- src/styles/Visualizer.css

TECHNICAL DETAILS:
- Timeout duration should be configurable
- Implement exponential backoff: new_timeout = timeout * multiplier
- Reset timeout on successful block commit
- Track timeout escalation chain (1st, 2nd, 3rd timeout)
- Show timeout deadline in UI with countdown
- Color-code urgency: green (safe), yellow (30% remaining), red (10% remaining)
- Educational goal: show why exponential backoff prevents livelock
```

---

### 9. **Vote Visualization & Voting History** ❌ MISSING

**Priority:** MEDIUM  
**Status:** Not Started

Show detailed voting patterns and history for analysis.

#### Current State:

- Vote counts are calculated but not visualized
- No way to see which nodes voted yes/no
- No voting history
- No vote timeline

#### LLM Prompt:

```
You are implementing Vote Visualization and Voting History for a Tendermint Protocol Visualizer.

CONTEXT:
The consensus simulation calculates votes, but users can't see voting details or patterns. We need to visualize voting breakdown, show which nodes voted how, and provide voting history for educational analysis.

REQUIREMENTS:
1. Create VotingRound data structure in tendermintLogic.js:
   - roundNumber, roundHeight
   - prevotesReceived: { nodeId: boolean, ... }
   - precommitsReceived: { nodeId: boolean, ... }
   - timestamp
   - result: approved/rejected

2. Update ConsensusContext.jsx:
   - Add votingHistory state: array of VotingRound objects
   - Add currentRoundVotes tracking
   - Add trackVote function
   - Add trackRoundVotes function

3. Create VotingBreakdown.jsx component:
   - Display current round vote counts
   - Show 2/3+ threshold prominently
   - Display vote percentage (X/4 votes = Y%)
   - Show "Prevote Phase" vs "Precommit Phase"
   - List each node and their vote

4. Create VotingVisualization.jsx component:
   - Circular progress showing vote count vs threshold
   - Color coded:
     * Blue: current votes
     * Green: threshold met
     * Red: threshold not met
   - Animated fill as votes come in
   - Show vote count and percentage

5. Update Node.jsx:
   - Add visual indicator of node's vote
   - Show checkmark for yes vote
   - Show X for no vote
   - Show ? for pending vote
   - Add vote count badge

6. Create VotingHistory.jsx component:
   - Table showing all past voting rounds
   - Columns: Round, Proposer, Prevotes, Precommits, Result
   - Sortable and filterable
   - Click to see voting details
   - Show voting trends (success rate, vote distribution)

7. Create VotingDetails.jsx component:
   - Modal showing detailed voting info for a round
   - List all nodes and their votes in prevote phase
   - List all nodes and their votes in precommit phase
   - Highlight nodes that changed their vote
   - Show voting timeline

8. Create VotingStatistics.jsx component:
   - Average prevotes per round
   - Average precommits per round
   - Vote distribution analysis
   - Byzantine behavior detection (conflicting votes)
   - Node voting reliability (% votes cast)

9. Update Controls.jsx:
   - Add "Voting History" button to view voting data
   - Add "Voting Details" toggle to show/hide voting breakdown
   - Option to pause and review current round votes

10. Update LogsWindow.jsx:
    - Log each vote received: "Node 2 voted YES in prevote phase"
    - Log vote milestones: "Prevote threshold reached (3/4)"
    - Show voting progress in real-time

11. Update ConsensusVisualizer.jsx:
    - Add VotingBreakdown display during voting phase
    - Show voting progress in real-time
    - Highlight proposer and voting nodes
    - Animate vote count changes

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/utils/NetworkSimulation.js
- src/utils/tendermintLogic.js
- src/components/Node.jsx
- src/components/ConsensusVisualizer.jsx
- src/components/Controls.jsx
- src/components/LogsWindow.jsx
- src/components/VotingBreakdown.jsx (NEW FILE)
- src/components/VotingVisualization.jsx (NEW FILE)
- src/components/VotingHistory.jsx (NEW FILE)
- src/components/VotingDetails.jsx (NEW FILE)
- src/components/VotingStatistics.jsx (NEW FILE)
- src/styles/App.css
- src/styles/Visualizer.css

TECHNICAL DETAILS:
- Store voting history for analysis across rounds
- Calculate vote distribution statistics
- Detect anomalies: nodes that always/never vote, conflicting votes
- Show voting timeline: when each vote arrived
- Educational goal: show voting threshold requirement (2/3+) and Byzantine fault tolerance
```

---

### 10. **Preset Scenarios & Educational Demos** ❌ MISSING

**Priority:** MEDIUM  
**Status:** Not Started

Pre-configured scenarios to demonstrate specific consensus behaviors.

#### Current State:

- Only default configuration
- No guided learning scenarios
- Users must configure manually

#### LLM Prompt:

```
You are implementing Preset Scenarios and Educational Demos for a Tendermint Protocol Visualizer.

CONTEXT:
The visualizer is educational but users must manually configure everything to see specific behaviors. We should provide pre-built scenarios that demonstrate key consensus concepts like Byzantine fault tolerance, network partitions, and timeout escalation.

REQUIREMENTS:
1. Create ScenarioManager.js utility:
   - Define preset scenarios with configurations
   - Load scenario configuration into context
   - Track which scenario is active
   - Support custom scenario creation

2. Implement Preset Scenarios:

   A. "Normal Operation" (default):
      - 4 honest nodes, no network issues
      - Show normal consensus flow
      - Demonstrates basic BFT

   B. "Byzantine Nodes Simulation":
      - 4 nodes, 1 Byzantine (faulty)
      - Consensus still succeeds (1 < 4/3)
      - Educational: Show Byzantine tolerance
      - Auto-run, show how consensus handles it

   C. "Network Partition":
      - 4 nodes split into 2x2 partition
      - Show liveness failure (no consensus)
      - Show safety maintained (no forks)
      - Educational: Show why consensus needs communication

   D. "Timeout Escalation":
      - 4 honest nodes
      - Simulate increasing timeouts
      - Show exponential backoff
      - Educational: Show timeout mechanism

   E. "High Latency Network":
      - 4 honest nodes
      - 2000ms network latency
      - Show consensus works but slower
      - Educational: Show resilience to delay

   F. "Unreliable Network":
      - 4 honest nodes
      - 50% packet loss rate
      - Show consensus adapts
      - Educational: Show resilience to message loss

   G. "Byzantine Majority Failure":
      - 4 nodes, 2 Byzantine (equivocators)
      - Show consensus fails/forks
      - Educational: Show why we need f < n/3

   H. "Network Healing":
      - Start with partition
      - Heal partition over time
      - Show consensus recovery
      - Educational: Show partition healing

3. Create ScenarioSelector.jsx component:
   - Dropdown menu of preset scenarios
   - Brief description for each
   - Difficulty level indicator
   - Estimated duration
   - Click to load scenario
   - Show active scenario name

4. Create ScenarioDescriptor.jsx component:
   - Title, description, learning objectives
   - What to watch for / expected behavior
   - Links to documentation
   - Key concepts taught
   - "Start Demo" button

5. Create ScenarioGuide.jsx component:
   - Step-by-step guide for each scenario
   - Checkpoints: "Watch for X behavior"
   - Annotations explaining what's happening
   - Questions for learning (not required to answer)
   - "Next Checkpoint" button

6. Update Controls.jsx:
   - Add "Load Scenario" button
   - Show active scenario name and description
   - Add "Guide Mode" toggle for annotations
   - "Checkpoint Progress" indicator

7. Create Annotations system:
   - Position-independent annotations that follow UI elements
   - Highlight important elements (nodes, blocks, indicators)
   - Show educational tooltips
   - Dismiss individually or all at once

8. Update App.jsx:
   - Add scenario display panel
   - Show scenario description and objectives
   - Display active scenario name
   - Show guide/checkpoint progress

9. Create ScenarioData.js file:
   - All scenario definitions
   - Configuration for each scenario
   - Expected outcomes/behaviors
   - Learning objectives
   - Annotations/guide steps

10. Add Scenario Analytics:
    - Track which scenarios users run
    - Measure learning effectiveness
    - Show scenario completion time
    - Highlight key behaviors demonstrated

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/components/Controls.jsx
- src/components/App.jsx
- src/utils/ScenarioManager.js (NEW FILE)
- src/data/ScenarioData.js (NEW FILE)
- src/components/ScenarioSelector.jsx (NEW FILE)
- src/components/ScenarioDescriptor.jsx (NEW FILE)
- src/components/ScenarioGuide.jsx (NEW FILE)
- src/components/Annotations.jsx (NEW FILE)
- src/styles/App.css

SCENARIO CONFIGURATIONS TO CREATE:
1. Normal Operation - 4 nodes, all honest
2. Byzantine Tolerance - 4 nodes, 1 Byzantine
3. Network Partition - 4 nodes, 2x2 split
4. Timeout Escalation - Show exponential backoff
5. High Latency - 2000ms delay, still works
6. Unreliable Network - 50% packet loss
7. Byzantine Failure - 2 Byzantine (consensus fails)
8. Network Healing - Partition then heals

TECHNICAL DETAILS:
- Scenarios should be self-contained configurations
- Support manual scenario customization
- Save favorite scenarios locally
- Show expected duration for each scenario
- Provide educational annotations
- Link to relevant documentation
- Show key metrics to watch for each scenario
```

---

### 11. **Dark/Light Theme Support** ❌ MISSING

**Priority:** LOW  
**Status:** Not Started

Add theme switching for better accessibility and user preference.

#### Current State:

- Only dark theme hardcoded
- No theme toggle
- No light theme styles

#### LLM Prompt:

```
You are implementing Dark/Light Theme Support for a Tendermint Protocol Visualizer.

CONTEXT:
The visualizer currently only has a dark theme hardcoded into CSS. For better accessibility and user experience, we should support both dark and light themes with easy switching.

REQUIREMENTS:
1. Create ThemeContext.js:
   - Manage theme state (light/dark)
   - Provide theme toggle function
   - Persist theme preference to localStorage

2. Create theme configuration files:
   - colors.light.js: Light theme color palette
   - colors.dark.js: Dark theme color palette
   - Define colors for: background, text, accent, nodes, blocks, etc.

3. Update CSS:
   - Convert hardcoded colors to CSS variables
   - Create light theme CSS variables
   - Create dark theme CSS variables
   - Apply CSS variables throughout stylesheets

4. Create ThemeToggle.jsx component:
   - Button in header to toggle theme
   - Show current theme
   - Icon changes based on theme (sun/moon)
   - Smooth transition between themes

5. Update App.jsx:
   - Wrap with ThemeProvider
   - Apply theme class to root element
   - Pass theme to all components via context

6. Update all component CSS:
   - Replace hardcoded colors with CSS variables
   - Ensure readability in both themes
   - Test contrast ratios (WCAG compliance)

7. Light Theme Specifications:
   - Background: light gray/white
   - Text: dark gray/black
   - Accents: vibrant colors
   - Nodes: pastel colors
   - Good contrast for readability

8. Dark Theme Specifications (existing):
   - Background: dark blue/black
   - Text: light gray/white
   - Accents: vibrant colors
   - Nodes: current colors
   - Comfortable for extended viewing

FILES TO MODIFY:
- src/context/ThemeContext.jsx (NEW FILE)
- src/styles/App.css
- src/styles/Visualizer.css
- src/styles/colors.light.js (NEW FILE)
- src/styles/colors.dark.js (NEW FILE)
- src/components/App.jsx
- All component files (to use CSS variables)

TECHNICAL DETAILS:
- Store theme preference in localStorage
- Use system preference as default (prefers-color-scheme)
- Smooth transitions between themes (0.3s)
- Ensure accessibility in both themes
- Test all components in both themes
```

---

### 12. **Responsiveness & Mobile Support** ❌ MISSING

**Priority:** LOW  
**Status:** Not Started

Make visualizer responsive for tablets and mobile devices.

#### Current State:

- Desktop-focused layout
- Not optimized for smaller screens
- No touch interactions

#### LLM Prompt:

```
You are implementing Responsiveness and Mobile Support for a Tendermint Protocol Visualizer.

CONTEXT:
The visualizer is currently designed for desktop. To improve accessibility, we should make it responsive and usable on tablets and mobile devices with touch-friendly controls.

REQUIREMENTS:
1. Update layout for responsive breakpoints:
   - Desktop (> 1200px): Current layout
   - Tablet (768px - 1200px): Adjusted layout
   - Mobile (< 768px): Stack everything vertically

2. Mobile-specific layout:
   - Visualizer: Full width
   - Logs: Below visualizer, collapsible
   - Controls: Full width, large buttons
   - Stats: Swipeable panels
   - Mempool: Scrollable list

3. Update components for mobile:
   - Larger touch targets (min 44px)
   - Reduce node size on small screens
   - Stack indicators vertically on mobile
   - Horizontal scroll for blocks/transactions

4. Add Touch Interactions:
   - Swipe to navigate between tabs
   - Long-press for context menu
   - Pinch to zoom on visualizer
   - Tap to inspect node/block details

5. Update Controls for Mobile:
   - Larger buttons
   - Simplified layout (hide speed buttons by default)
   - Dropdown menus instead of inline buttons
   - Bottom action bar (fixed)

6. Optimize for Mobile Performance:
   - Reduce animation complexity on mobile
   - Lazy load statistics
   - Optimize re-renders
   - Reduce log window updates on mobile

7. Add Mobile Navigation:
   - Bottom navigation bar
   - Swipeable page sections
   - Tab-based interface
   - Collapsible panels

FILES TO MODIFY:
- src/styles/App.css
- src/styles/Visualizer.css
- All component files (add responsive classes)
- src/components/App.jsx

MEDIA QUERIES TO ADD:
- @media (max-width: 768px) { ... }
- @media (max-width: 480px) { ... }

TECHNICAL DETAILS:
- Use mobile-first CSS approach
- Test on actual devices (iOS, Android)
- Ensure touch targets are at least 44x44px
- Support landscape and portrait orientations
- Optimize performance for mobile devices
```

---

### 13. **Documentation & Help System** ❌ MISSING

**Priority:** MEDIUM  
**Status:** Not Started

Add comprehensive documentation and in-app help.

#### Current State:

- Only README.md documentation
- No in-app help or tooltips
- No concept explanations
- No learning resources

#### LLM Prompt:

```
You are implementing Documentation and Help System for a Tendermint Protocol Visualizer.

CONTEXT:
While the project has a README, it lacks in-app help, concept explanations, and interactive learning resources. Users new to Tendermint need guidance on concepts, consensus phases, and what they're observing.

REQUIREMENTS:
1. Create Help/Documentation system:
   - In-app help accessible via ? button
   - Context-sensitive help (help for current view)
   - Searchable help database
   - Glossary of terms

2. Create HelpPanel.jsx component:
   - Modal/sidebar with help content
   - Search functionality
   - Tabs: Overview, Concepts, Controls, FAQ
   - Link to external resources

3. Implement Concept Guides:
   - What is Tendermint?
   - Byzantine Fault Tolerance
   - Consensus Rounds
   - Prevote and Precommit phases
   - Liveness and Safety
   - Network Partitions
   - Byzantine Nodes
   - Timeouts and Escalation

4. Create Glossary:
   - Define all technical terms
   - Abbreviations: BFT, PBS, MEV, etc.
   - Searchable index
   - Visual examples for complex concepts

5. Add Interactive Tutorials:
   - Tutorial: Understanding Consensus
   - Tutorial: Byzantine Fault Tolerance
   - Tutorial: Network Effects
   - Tutorial: Byzantine Attacks
   - Each tutorial is interactive

6. Create ContextualHelp component:
   - Tooltips for UI elements
   - "Learn More" links
   - Explain what's happening in current view
   - Suggest relevant scenarios

7. Add FAQ Section:
   - Common questions
   - Troubleshooting
   - "Why is X happening?"
   - Links to documentation

8. Create LearningPath component:
   - Suggested learning order for concepts
   - Progress tracking
   - Difficulty levels (beginner, intermediate, advanced)
   - Estimated time to complete

9. Update Components with Help:
   - Add ? icon to major components
   - Tooltips on hover
   - "What is this?" links
   - Educational annotations

10. Create HelpContent.md file:
    - All help text and tutorials
    - Organized by topic
    - Includes code examples and visuals

FILES TO MODIFY:
- src/components/App.jsx
- src/components/HelpPanel.jsx (NEW FILE)
- src/components/Glossary.jsx (NEW FILE)
- src/components/Tutorials.jsx (NEW FILE)
- src/components/ContextualHelp.jsx (NEW FILE)
- src/data/HelpContent.md (NEW FILE)
- src/styles/App.css

CONTENT TO CREATE:
1. Tendermint Overview
2. Byzantine Fault Tolerance
3. Consensus Phases (Propose, Prevote, Precommit, Commit)
4. Liveness Definition
5. Safety Definition
6. Network Partitions
7. Byzantine Nodes & Attacks
8. Timeouts & Round Escalation
9. Message Passing
10. Vote Distribution
11. Frequently Asked Questions

TECHNICAL DETAILS:
- Help content should be markdown-based
- Support rich formatting (code blocks, lists, etc.)
- Search by keyword and concept
- Suggest related topics
- Link concepts together
- Provide visual examples
```

---

### 14. **Export & Analysis Tools** ❌ MISSING

**Priority:** LOW  
**Status:** Not Started

Export consensus data for external analysis.

#### Current State:

- No export functionality
- No data analysis tools
- Cannot save simulation runs

#### LLM Prompt:

```
You are implementing Export and Analysis Tools for a Tendermint Protocol Visualizer.

CONTEXT:
Users may want to analyze consensus behavior, generate reports, or share results. We should provide export functionality and analysis tools to support this.

REQUIREMENTS:
1. Create ExportManager.js utility:
   - Export simulation data as JSON
   - Export as CSV for spreadsheet analysis
   - Export logs as plaintext
   - Export statistics and charts

2. Add Export functionality:
   - Export button in UI
   - Choose export format (JSON, CSV, PDF)
   - Choose what to export (logs, stats, blocks, votes, etc.)
   - Filename suggestions with timestamp

3. Export Formats:

   A. JSON Export:
      - Complete simulation state
      - All blocks and transactions
      - Vote history
      - Network events
      - Metrics and statistics

   B. CSV Export:
      - Logs as rows (timestamp, type, message)
      - Blocks as rows (height, proposer, txs)
      - Votes as rows (round, voter, vote)
      - Network events as rows
      - Statistics as rows (metric, value)

   C. PDF Report Export:
      - Summary of simulation run
      - Charts and graphs
      - Statistics table
      - Key events timeline
      - Configuration used

4. Create AnalysisTools.jsx component:
   - Open exported data
   - View statistics
   - Generate reports
   - Compare multiple runs

5. Add Comparison Tools:
   - Compare two simulation runs
   - Show differences in metrics
   - Highlight anomalies
   - Generate comparison report

6. Create ReportGenerator.js:
   - Generate HTML report
   - Include charts and graphs
   - Summary statistics
   - Configuration details
   - Download as PDF/HTML

FILES TO MODIFY:
- src/context/ConsensusContext.jsx
- src/components/Controls.jsx
- src/utils/ExportManager.js (NEW FILE)
- src/utils/ReportGenerator.js (NEW FILE)
- src/components/ExportDialog.jsx (NEW FILE)
- src/components/AnalysisTools.jsx (NEW FILE)

EXPORT OPTIONS TO IMPLEMENT:
1. Export Logs (JSON, CSV, TXT)
2. Export Blocks (JSON, CSV)
3. Export Voting History (JSON, CSV)
4. Export Statistics (JSON, CSV)
5. Export Full Simulation (JSON)
6. Export as Report (PDF, HTML)

TECHNICAL DETAILS:
- Use libraries: jsPDF, csv-parser for export
- Include metadata: timestamp, configuration, version
- Support large datasets efficiently
- Generate human-readable exports
```

---

## Implementation Priority & Dependencies

### Phase 1 (HIGH Priority - Core Features):

1. **Byzantine Node Simulation** - Enables testing core BFT property
2. **Round Timeouts & Escalation** - Critical for realistic consensus
3. **Network Partitioning** - Tests safety/liveness under failures
4. **Step-by-Step Mode** - Essential for education

### Phase 2 (MEDIUM Priority - Extended Features):

5. **Transaction Pool & Mempool** - Realistic blockchain simulation
6. **Message Passing Visualization** - Shows communication clearly
7. **Vote Visualization** - Teaches voting mechanism
8. **Real-time Statistics Dashboard** - Performance monitoring
9. **Configurable Parameters** - Flexible testing
10. **Preset Scenarios** - Guided learning

### Phase 3 (LOW Priority - Polish & Accessibility):

11. **Dark/Light Theme** - UX improvement
12. **Responsive Design** - Mobile support
13. **Documentation & Help** - Learning support
14. **Export & Analysis** - Advanced analysis

---

## Testing Checklist for Each Feature

### Byzantine Nodes:

- [ ] Consensus succeeds with 1 Byzantine node (1 < 4/3)
- [ ] Consensus fails with 2 Byzantine nodes (2 > 4/3)
- [ ] Byzantine behaviors are correctly simulated
- [ ] UI shows Byzantine nodes clearly

### Network Partitioning:

- [ ] Partitioned nodes cannot reach consensus
- [ ] Unpartitioned nodes continue normally
- [ ] Safety maintained (no forks)
- [ ] Liveness violated in partitioned group

### Transactions:

- [ ] Transactions are correctly added to blocks
- [ ] Mempool size is reasonable
- [ ] Transaction throughput is tracked
- [ ] Committed transactions are removed from mempool

### Message Passing:

- [ ] Messages are animated correctly
- [ ] Message delivery follows network latency
- [ ] Message loss is properly simulated
- [ ] Message statistics are accurate

### Step-by-Step Mode:

- [ ] Each step can be advanced/reversed
- [ ] State is correctly restored on reverse
- [ ] Step descriptions are clear
- [ ] All data is visible at each step

### Statistics:

- [ ] All metrics are calculated correctly
- [ ] Charts update in real-time
- [ ] Export functionality works
- [ ] Statistical accuracy verified

---

## Code Organization Best Practices

### For New Components:

```
src/components/NewFeature.jsx    - Main component
src/components/NewFeature/       - Sub-components if needed
  - SubComponent1.jsx
  - SubComponent2.jsx
src/utils/NewFeatureLogic.js     - Business logic
src/styles/NewFeature.css        - Component styles
```

### For New Utilities:

```
src/utils/FeatureManager.js      - Manager/coordinator
src/utils/featureHelpers.js      - Helper functions
src/utils/featureTypes.js        - Type definitions
```

### State Management:

- Use ConsensusContext for shared state
- Keep component-local state in useState
- Document context additions clearly

---

## Performance Considerations

- Keep simulation loop efficient (< 50ms per step)
- Lazy-load statistics calculations
- Limit log history (rolling window of last N entries)
- Optimize re-renders with React.memo
- Avoid creating new objects in render methods

---

## Educational Value Goals

Each feature should:

1. **Teach a concept** - What does it demonstrate?
2. **Show visually** - How is it displayed?
3. **Allow testing** - Can users experiment?
4. **Provide feedback** - What happens when it fails?
5. **Enable comparison** - Can users see before/after?

---

## Version History

- **v1.0** - Basic Tendermint consensus visualization
- **v2.0** - Added LogsWindow and real-time event tracking
- **v3.0** (planned) - Byzantine nodes, network partitioning, transactions
- **v4.0** (planned) - Advanced features and analysis tools

---

## Notes for Next LLM

When implementing any feature from this TODO:

1. Follow the exact LLM prompt provided
2. Maintain consistent code style with existing project
3. Update this TODO when feature is complete
4. Update README.md to document new features
5. Add tests for new functionality
6. Test with different network configurations
7. Ensure educational value is clear
8. Add tooltips/help for users

---

**Last Updated:** 2025-11-05
**Status:** 14 features identified, 0 implemented (Phase 1)
