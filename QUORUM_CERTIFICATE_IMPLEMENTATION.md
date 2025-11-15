# Quorum Certificate (QC) Implementation Guide

## Overview

This document describes the complete implementation of Quorum Certificates (QCs) in the Tendermint Protocol Visualizer. QCs are cryptographic proofs that a supermajority of validators voted for a specific block at a specific stage of consensus.

## What is a Quorum Certificate?

A Quorum Certificate contains:

1. **Block Height** - The height of the block in the chain
2. **Round Number** - The consensus round number
3. **Stage** - Either "prevote" or "precommit"
4. **Block Pointer** - Hash reference to the block
5. **List of Signatures** - Aggregated signatures from validators who voted YES

## Implementation Architecture

### 1. Core QC Generation Logic (`src/utils/tendermintLogic.js`)

#### QC Data Structure

```javascript
{
  height: number,              // Block height
  round: number,               // Round number
  stage: string,               // "prevote" or "precommit"
  blockHash: string,           // Block hash reference
  signatures: [                // List of validator signatures
    {
      nodeId: number,          // Validator ID
      vote: boolean,           // true/false/null
      signature: string,       // Simulated signature
      timestamp: number        // Vote timestamp
    }
  ],
  totalValidators: number,     // Total validator count
  signatureCount: number,      // Count of YES votes
  thresholdMet: boolean,       // Whether 2/3+ threshold met
  threshold: number,           // Required threshold (e.g., 0.6667)
  proposer: number,            // Block proposer ID
  createdAt: number,           // QC creation timestamp
  blockReference: {            // Full block reference
    height: number,
    hash: string,
    proposer: number,
    txCount: number
  }
}
```

#### Key Functions

**`generateQuorumCertificate(stage, votingRound, block, voteThreshold)`**

- Generates a QC when voting threshold is met
- Collects signatures from all validators who voted YES
- Only creates QC if `thresholdMet === true`
- Returns `null` if threshold not met

**`generateSimulatedSignature(nodeId, blockHash, stage)`**

- Creates simulated cryptographic signatures
- Format: `SIG_{nodeId}_{blockHash}_{stage}_{nonce}`
- Provides realistic signature visualization

#### Integration Points

**Updated Functions:**

- `createVotingRound()` - Now includes `prevoteQC` and `precommitQC` fields (initially `null`)
- `updatePrevotes()` - Calls `generateQuorumCertificate()` when prevote threshold met
- `updatePrecommits()` - Calls `generateQuorumCertificate()` when precommit threshold met
- `executeConsensusStep()` - Passes block parameter to update functions for QC generation

### 2. Network Simulation Integration (`src/utils/NetworkSimulation.js`)

**Changes:**

- Pass `block` parameter to `updatePrevotes()` and `updatePrecommits()`
- Attach precommit QC to committed blocks as `block.commitQC`
- QC generated automatically during normal consensus flow

**Commit Flow:**

```javascript
if (votingRound.precommitThresholdMet && !packetLossOccurred) {
  newBlock = block;
  if (votingRound.precommitQC) {
    newBlock.commitQC = votingRound.precommitQC; // Attach commit proof
  }
  finalizeVotingRound(votingRound, true);
}
```

### 3. State Management (`src/context/ConsensusContext.jsx`)

**New State:**

- `qcHistory` - Array storing all generated QCs across rounds

**New Functions:**

- `addQC(qc)` - Add QC to history (exposed in context)

**Enhanced Functions:**

- `finalizeRound()` - Now captures prevote/precommit QCs and adds to history

**Context Exposure:**

```javascript
{
  qcHistory,      // Array of all QCs
  addQC,          // Function to add QC
  // ... other context values
}
```

### 4. UI Components

#### QuorumCertificateViewer (`src/components/QuorumCertificateViewer.jsx`)

**Modes:**

1. **Full Mode** - Detailed QC display with expandable sections
2. **Compact Mode** - Badge-style display with popup on click

**Features:**

- QC summary (height, round, stage, block hash, signatures count)
- Threshold status indicator (✓ Met / ✗ Not Met)
- Expandable signature list with node IDs and signature strings
- Block reference section
- Phase color-coding (prevote: blue, precommit: green)

**Props:**

- `qc` - QC object to display
- `stage` - "prevote" or "precommit"
- `compact` - Boolean for compact badge mode

#### Integration in Existing Components

**VotingBreakdown.jsx:**

- Shows compact QC badges after prevote/precommit phases
- Displays when threshold is met

**VotingDetails.jsx:**

- Full QC display in modal view
- Separate sections for prevote QC and precommit QC
- Precommit QC labeled as "Commit Proof"

**StateInspector.jsx:**

- Shows QC status in step-by-step mode
- Compact QC badges when QCs are generated
- Appears after step 3 (prevote tally) and step 5 (precommit tally)

**Block.jsx:**

- Shows 🔒 QC badge on committed blocks
- Click to expand and view full commit QC
- Visual indicator that block has cryptographic proof

### 5. Styling (`src/styles/QuorumCertificateViewer.css`)

**Key Styles:**

- Phase-specific colors (prevote: `#4a90e2`, precommit: `#90be6d`)
- Threshold status badges (met: green, not met: red)
- Responsive grid layout for signatures
- Hover effects and transitions
- Compact badge styling with popup positioning

## Usage Examples

### Example 1: Viewing QCs in Continuous Mode

1. Start simulation with default 4-node network
2. Click "👁️ Show Votes" to open VotingBreakdown
3. When prevote threshold is met, you'll see:
   ```
   [PREVOTE QC] 3/4 ✓
   ```
4. Click the badge to see full QC details
5. When precommit threshold is met, you'll see:
   ```
   [PRECOMMIT QC] 3/4 ✓
   ```
6. Committed blocks show 🔒 QC badge

### Example 2: Step-by-Step Mode QC Inspection

1. Switch to "👣 Step-by-Step" mode
2. Advance to Step 3 (Prevote Tally)
3. State Inspector shows "📜 Prevote QC Generated" with compact badge
4. Advance to Step 5 (Precommit Tally)
5. State Inspector shows "🔒 Precommit QC Generated (Commit Proof)"
6. Click badges to see full QC details

### Example 3: Byzantine Test with QCs

1. Load "Byzantine Test" preset (7 nodes, 2 Byzantine)
2. Start simulation
3. Observe QCs generated despite Byzantine nodes
4. Byzantine votes are included in QC signatures
5. QC shows 5/7 or 6/7 signatures (depending on Byzantine behavior)
6. Click "📊 Voting History" to see historical QCs

### Example 4: QC Failure Scenarios

**Network Partition:**

1. Enable network partition (single node or split)
2. Observe that QCs are NOT generated when threshold not met
3. VotingBreakdown shows "✗ Threshold Not Met"
4. No QC badges appear

**Too Many Byzantine Nodes:**

1. Configure 4 nodes with 2 Byzantine (exceeds n/3 limit)
2. Consensus frequently fails
3. QCs may not be generated if votes don't reach threshold
4. Logs show "Consensus failed: Too many Byzantine nodes"

## QC Generation Flow

```
Round Start
    ↓
Block Proposal (Proposer creates block)
    ↓
Prevote Phase (All nodes vote)
    ↓
Prevote Tally
    ├─→ Threshold Met? YES → Generate Prevote QC
    └─→ Threshold Met? NO → No QC
    ↓
Precommit Phase (All nodes vote if prevote passed)
    ↓
Precommit Tally
    ├─→ Threshold Met? YES → Generate Precommit QC (Commit Proof)
    └─→ Threshold Met? NO → No QC
    ↓
Commit
    ├─→ Block committed with QC attached
    └─→ QCs added to history
```

## QC Verification Properties

### Safety

- QC proves ≥2/3 validators agreed
- With at most f=⌊n/3⌋ Byzantine nodes, at least 2f+1 honest nodes signed
- Conflicting QCs at same height/round indicate equivocation (safety violation)

### Liveness

- QC generation requires network majority
- Network partitions prevent QC generation
- Byzantine nodes up to n/3 don't prevent QC generation

### Validity

- QC includes cryptographic signatures (simulated)
- Block hash binds QC to specific block
- Round and height prevent replay attacks

## Testing Checklist

- [x] QC generated on prevote threshold met (4 nodes, 3 votes)
- [x] QC generated on precommit threshold met (4 nodes, 3 votes)
- [x] QC NOT generated when threshold not met
- [x] QC attached to committed blocks as `commitQC`
- [x] QC contains correct signatures (only YES votes)
- [x] QC stored in voting history
- [x] QC displayed in VotingBreakdown (compact mode)
- [x] QC displayed in VotingDetails (full mode)
- [x] QC displayed in StateInspector (step-by-step mode)
- [x] QC badge shown on committed blocks
- [x] Byzantine votes included in QC when they vote YES
- [x] QC works with Byzantine Test preset (7 nodes, 2 Byzantine)
- [x] QC fails gracefully with network partitions
- [x] QC signature count matches yes vote count
- [x] QC threshold status correctly reflects consensus state

## Advanced Features

### QC History Tracking

- All generated QCs stored in `qcHistory` state
- Can be used to build QC browser component
- Enables historical QC analysis

### QC Export (Future Enhancement)

- Export QCs as JSON for external verification
- Import QCs for replay/analysis
- Compare QCs across different scenarios

### Equivocation Detection via QCs

- Multiple QCs at same height/round indicate equivocation
- Can be used to prove Byzantine behavior
- Safety violation detection

## Performance Considerations

- QC generation is O(n) where n = validator count
- Maximum 20 validators (from config validation)
- QC objects are lightweight (~1-2KB each)
- No performance impact on simulation

## Troubleshooting

**QC not appearing:**

- Check that threshold is actually met (look at vote counts)
- Verify prevote/precommit threshold is ≥ 2/3
- Check console for errors in QC generation

**QC shows wrong signature count:**

- QC only includes YES votes (by design)
- Check `prevotesReceived`/`precommitsReceived` maps
- Verify vote values are `true` (not just truthy)

**QC not attached to block:**

- Ensure precommit threshold is met
- Check that `packetLossOccurred` is false
- Verify block is actually committed (not timeout)

**Compact QC badge not clickable:**

- Check that CSS is loaded properly
- Verify React state updates are working
- Check browser console for errors

## Code Locations

| Feature              | File Path                                    | Lines                          |
| -------------------- | -------------------------------------------- | ------------------------------ |
| QC Data Structure    | `src/utils/tendermintLogic.js`               | Definition in comments         |
| QC Generation        | `src/utils/tendermintLogic.js`               | `generateQuorumCertificate()`  |
| Signature Simulation | `src/utils/tendermintLogic.js`               | `generateSimulatedSignature()` |
| VotingRound with QCs | `src/utils/tendermintLogic.js`               | `createVotingRound()`          |
| QC Integration       | `src/utils/NetworkSimulation.js`             | `simulateConsensusStep()`      |
| QC State Management  | `src/context/ConsensusContext.jsx`           | `qcHistory`, `addQC()`         |
| QC Viewer Component  | `src/components/QuorumCertificateViewer.jsx` | Full file                      |
| QC Styles            | `src/styles/QuorumCertificateViewer.css`     | Full file                      |
| VotingBreakdown QC   | `src/components/VotingBreakdown.jsx`         | After phase sections           |
| VotingDetails QC     | `src/components/VotingDetails.jsx`           | Separate sections              |
| StateInspector QC    | `src/components/StateInspector.jsx`          | After vote stats               |
| Block QC Badge       | `src/components/Block.jsx`                   | In block header                |

## Summary

The Quorum Certificate implementation is now **fully integrated** into the Tendermint Protocol Visualizer. QCs are automatically generated when voting thresholds are met, stored in state, and displayed across multiple UI components. This provides users with visibility into the cryptographic proofs that underpin consensus decisions, making the visualizer more educational and accurate to real-world blockchain protocols.

**Key Achievement:** Users can now see exactly which validators signed off on each block at both the prevote and precommit stages, providing complete transparency into the consensus process.
