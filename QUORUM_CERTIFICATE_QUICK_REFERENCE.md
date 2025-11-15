# Quorum Certificate (QC) Quick Reference

## What You'll See

### 🎯 QC Badges in UI

**Compact Badge (VotingBreakdown, StateInspector):**

```
[PREVOTE QC] 5/7 ✓
[PRECOMMIT QC] 6/7 ✓
```

- Click to expand full details
- ✓ = Threshold met
- Numbers = Signatures collected / Total validators

**Block Badge:**

```
Block #5 🔒 QC
```

- Appears on committed blocks
- Click to view commit proof

### 📊 QC Information Displayed

| Field            | Description           | Example             |
| ---------------- | --------------------- | ------------------- |
| **Block Height** | Block number in chain | 5                   |
| **Round**        | Consensus round       | 5                   |
| **Stage**        | Voting phase          | prevote / precommit |
| **Block Hash**   | Block identifier      | abc12345            |
| **Proposer**     | Node that proposed    | Node 2              |
| **Signatures**   | Validator signatures  | 5/7                 |
| **Threshold**    | Met or not met        | ✓ Met (71.4%)       |
| **Created**      | Timestamp             | 10:30:45 AM         |

## Where to Find QCs

### 1. **VotingBreakdown Panel**

- Open with "👁️ Show Votes" button
- Compact QC badges after prevote/precommit sections
- Real-time QC generation

### 2. **VotingDetails Modal**

- Open with "📊 Voting History" → Select round
- Full QC display with signature tables
- Separate sections for prevote/precommit QCs

### 3. **StateInspector (Step Mode)**

- Enable "👣 Step-by-Step" mode
- QCs appear after step 3 (prevote) and step 5 (precommit)
- Compact badges with popup details

### 4. **Block Display**

- Committed blocks show 🔒 QC badge
- Click badge to expand commit proof
- Only appears on successfully committed blocks

## Quick Actions

### View Current Round QCs

1. Start simulation
2. Click "👁️ Show Votes"
3. Wait for threshold to be met
4. Click QC badge to expand

### Inspect Historical QCs

1. Click "📊 Voting History"
2. Select any round from list
3. Scroll to "Prevote/Precommit Quorum Certificate" sections
4. View full signature details

### Step-by-Step QC Analysis

1. Switch to "👣 Step-by-Step" mode
2. Advance to Step 3 (Prevote Tally)
3. State Inspector shows "📜 Prevote QC Generated"
4. Advance to Step 5 (Precommit Tally)
5. State Inspector shows "🔒 Precommit QC Generated"

### View Commit Proof on Block

1. Run simulation until block commits
2. Find committed block in blockchain display
3. Click 🔒 QC badge on block
4. View precommit QC (commit proof)

## When QCs Are Generated

✅ **Generated When:**

- Voting threshold reached (default: ≥ 2/3 validators)
- Validators vote YES for the block
- Network has majority connectivity

❌ **NOT Generated When:**

- Threshold not met (< 2/3 votes)
- Network partition splits validators
- Too many Byzantine nodes (> n/3)
- All validators vote NO or null

## QC Color Coding

| Stage         | Color           | Badge        |
| ------------- | --------------- | ------------ |
| **Prevote**   | Blue (#4a90e2)  | PREVOTE QC   |
| **Precommit** | Green (#90be6d) | PRECOMMIT QC |

## Threshold Status

| Status      | Badge     | Meaning                 |
| ----------- | --------- | ----------------------- |
| **Met**     | ✓ (Green) | ≥ 2/3 validators signed |
| **Not Met** | ✗ (Red)   | < 2/3 validators signed |

## Example Scenarios

### Scenario 1: Normal Consensus (4 nodes)

```
Round 1:
- Prevote: 4/4 nodes vote YES → [PREVOTE QC] 4/4 ✓
- Precommit: 4/4 nodes vote YES → [PRECOMMIT QC] 4/4 ✓
- Result: Block committed with QC
```

### Scenario 2: Byzantine Test (7 nodes, 2 Byzantine)

```
Round 5:
- Prevote: 5/7 nodes vote YES (2 Byzantine vote randomly) → [PREVOTE QC] 5/7 ✓
- Precommit: 6/7 nodes vote YES → [PRECOMMIT QC] 6/7 ✓
- Result: Block committed despite Byzantine nodes
```

### Scenario 3: Network Partition (4 nodes, 2 partitioned)

```
Round 3:
- Prevote: 2/4 nodes vote (2 partitioned) → No QC (50% < 67%)
- Precommit: Not reached
- Result: Consensus failed, no QC generated
```

## Keyboard Shortcuts (Step Mode)

- `→` or `Next` button - Advance step (generates QCs at step 3, 5)
- `←` or `Previous` button - Go back
- Click QC badge - Toggle QC details popup

## Troubleshooting

**"No QC available"**

- Threshold not met yet
- Wait for more validators to vote
- Check network connectivity

**QC shows fewer signatures than expected**

- Only YES votes are included in QC
- NO and null votes are excluded (by design)
- Byzantine nodes may vote randomly

**QC badge not appearing on block**

- Block may not be committed yet
- Precommit threshold might not be met
- Check for network partition or timeouts

## Pro Tips

💡 **Tip 1:** Use Step-by-Step mode to see exact moment QC is generated

💡 **Tip 2:** Byzantine Test preset is best for seeing QC behavior under attack

💡 **Tip 3:** Click QC badges to see full cryptographic signatures

💡 **Tip 4:** Compare prevote vs precommit QC signatures to detect vote changes

💡 **Tip 5:** QC on block = proof that block is finalized and cannot be reverted

## Technical Notes

- QCs contain simulated cryptographic signatures (format: `SIG_{nodeId}_{hash}_{stage}_{nonce}`)
- Precommit QC serves as the commit proof for the block
- QCs are stored in `qcHistory` state for all rounds
- QC generation is automatic when threshold is met (no manual action needed)

## Related Documentation

- Full Implementation Guide: `QUORUM_CERTIFICATE_IMPLEMENTATION.md`
- Byzantine Features: `BYZANTINE_FEATURES_GUIDE.md`
- Step-by-Step Mode: `STEP_BY_STEP_MODE_GUIDE.md`
- General Guide: `README.md`
