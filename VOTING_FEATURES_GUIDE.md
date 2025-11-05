# Voting Features Quick Reference Guide

## Quick Start

### 1. Start the Simulation
```
Click "Start" button → Consensus begins → Voting starts automatically
```

### 2. View Live Voting
- **Circular Progress Indicators**: Shows prevote and precommit vote accumulation
- **Vote Breakdown Panel**: Lists each node's current vote status
- **Node Badges**: Look for ✓ (yes), ✗ (no), or ? (pending) on nodes

### 3. Toggle Voting Display
```
Click "👁️ Show/Hide Votes" button to show/hide voting details
```

### 4. Open Voting History
```
Click "📊 Voting History" button → View all past voting rounds
```

## Component Reference

### Voting Visualization (Circular Progress)
- **Blue**: Votes being collected
- **Orange**: Near threshold (70%+)
- **Green**: Threshold met (2/3+)
- Shows vote count and percentage

### Voting Breakdown Panel
- **Prevote Phase**: First voting phase
- **Precommit Phase**: Second voting phase (only if prevote passed)
- **Node List**: Each node's vote with Byzantine indicators
- **Statistics**: Vote counts, percentages, threshold status

### Voting History Modal
- **Stats Bar**: Total rounds, success rate, averages
- **Filter Dropdown**: Filter by approved/rejected/all
- **Sortable Columns**: Click headers to sort
- **Click Rows**: View detailed round information

### Voting Details Modal
- **Summary**: Round info, proposer, result, timestamp
- **Prevote/Precommit Breakdown**: Complete vote listing
- **Vote Changes**: Highlights nodes that changed votes (Byzantine behavior)
- **Timeline**: Chronological event sequence

### Voting Statistics
- **Overall Performance**: Success rate, totals
- **Vote Distribution**: Yes/no/pending counts
- **Node Reliability**: Participation rates per node
- **Anomaly Detection**: Byzantine behavior warnings

## Understanding Vote Indicators

### On Nodes
- **✓ Green Badge**: Node voted YES
- **✗ Red Badge**: Node voted NO
- **? Gray Badge**: Vote pending
- **⚠ Orange Badge**: Byzantine node

### In Breakdown Panel
- **✓ Green**: Threshold met
- **✗ Red**: Threshold not met
- **Byzantine Badge**: Highlights potentially malicious nodes

### In History Table
- **Green Count**: Threshold achieved
- **Red Count**: Threshold failed
- **Approved Badge**: Block committed
- **Rejected Badge**: Block rejected

## Byzantine Behavior Detection

The system automatically detects and reports:

1. **Silent Nodes** - Never cast votes
2. **Low Participation** - Vote in <50% of rounds
3. **Always-No Voters** - Always vote NO (potential attack)
4. **Conflicting Votes** - Change vote between prevote and precommit

Check the **Voting Statistics** component for anomaly warnings.

## Keyboard Shortcuts

- **ESC**: Close any open modal (History or Details)
- **Click Outside**: Close modals by clicking overlay

## Tips for Educational Use

1. **Start with 4 nodes** to clearly see voting patterns
2. **Add Byzantine nodes** (1-2) to observe fault tolerance
3. **Adjust speed** to slow down and watch votes accumulate
4. **Review history** after simulation to analyze patterns
5. **Check statistics** for anomaly detection demonstrations

## Common Scenarios

### Normal Consensus
- All nodes prevote YES
- Prevote threshold met (✓)
- All nodes precommit YES
- Precommit threshold met (✓)
- Block committed ✅

### Byzantine Node Present
- Some nodes vote NO or don't vote
- May still reach threshold if <1/3 Byzantine
- Watch for anomaly warnings in statistics
- Check vote changes in detailed view

### Network Issues
- Nodes go offline (gray color)
- Missing votes (? pending)
- May fail threshold
- Block rejected ❌

### Threshold Failure
- <2/3 nodes vote YES
- Prevote or precommit fails
- Round rejected
- No block committed

## Console Logs

Watch the **Logs Window** for:
- "Prevotes: X/Y (Threshold MET/NOT MET)"
- "Precommits: X/Y (Threshold MET/NOT MET)"
- Block proposal and commitment messages
- Byzantine detection warnings

## Configuration Tips

Experiment with these settings for different voting scenarios:

- **Node Count**: More nodes = more voting complexity
- **Byzantine Count**: Add 1-2 for fault tolerance testing
- **Byzantine Type**: 
  - `faulty` = random votes
  - `silent` = no votes
  - `equivocator` = inconsistent votes
- **Vote Threshold**: Adjust 2/3 requirement (not recommended to change)
- **Network Latency**: Affects vote timing
- **Downtime Percentage**: Simulates node failures

## Troubleshooting

**Q: Why don't I see voting breakdown?**
A: Click "Show Votes" button or ensure simulation is running

**Q: History shows no rounds?**
A: Start simulation and wait for at least one round to complete

**Q: Node badges not appearing?**
A: Badges only show when voting is active in current round

**Q: Statistics show anomalies?**
A: This is expected with Byzantine nodes or network issues

**Q: Circular progress not updating?**
A: Ensure simulation is running, not paused

## Data Export (Future Feature)

Currently not implemented, but would allow:
- Export voting history to JSON
- Download round details
- Save statistics for analysis

## Performance Notes

- History is stored in memory (resets on page refresh)
- Large node counts (10+) may slow animations
- Adjust simulation speed if updates are too fast
- Clear logs periodically for better performance

## Related Documentation

- See `VOTING_IMPLEMENTATION_SUMMARY.md` for technical details
- Check `README.md` for general project information
- Review `QUICK_REFERENCE.md` for other features

---

**Need Help?** Check the console logs for debugging information or review the implementation summary for technical details.
