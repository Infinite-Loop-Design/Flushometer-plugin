---
description: Token usage as toilet flushes / EV miles / gas miles (low·mid·high)
allowed-tools: Bash(node:*)
---

Flushometer report for `$ARGUMENTS` tokens (omit the number to use the running tally):

!`node "${CLAUDE_PLUGIN_ROOT}/flushometer.js" range $ARGUMENTS --no-color`

Summarize the three scenarios in one line and call out the mid estimate.
