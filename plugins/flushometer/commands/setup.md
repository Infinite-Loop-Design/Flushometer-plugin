---
description: Install the animated flushometer statusline into your settings.json (plugins can't set statuslines directly)
allowed-tools: Bash(node:*)
---

Claude Code plugins cannot register a statusline on their own, so this wires it
into the user's `~/.claude/settings.json`, pointing at the bundled script.

!`node "${CLAUDE_PLUGIN_ROOT}/flushometer.js" setup`

Tell the user to **restart Claude Code** for the statusline to appear. Mention
they can remove it later with `/flushometer:setup` is not needed — the command
to undo is `node "${CLAUDE_PLUGIN_ROOT}/flushometer.js" setup --uninstall`.
