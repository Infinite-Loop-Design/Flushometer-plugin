# 🚽 flushometer (Claude Code plugin)

### *You waste thousands of tokens a day — now you can watch them swirl down the drain.*

Translate **token usage** into real-world equivalents — **toilet flushes, EV distance, gas-car distance** — as an **animated statusline** and an on-demand `/flushometer:flush` report.

```
⠹ 🚽 ░▓▒░··~· 0.438f  ⚡3.75mi 🛢️1.04mi  · 1,050,000t 98%
```

## What you get
- **`/flushometer:flush [tokens]`** — full low·mid·high report (uses the running tally if no number given).
- **`/flushometer:setup`** — installs the animated statusline into your `~/.claude/settings.json` (plugins can't set statuslines directly, so this does it for you). Restart Claude Code afterward.

The statusline is a **per-session odometer**: it reads Claude Code's `context_window` payload and accumulates a lifetime total that survives context compaction, resetting fresh each new session.

## Remove
```bash
node "${CLAUDE_PLUGIN_ROOT}/flushometer.js" setup --uninstall
```
…or just `/plugin uninstall flushometer` (and delete the `statusLine` block from `settings.json`).

## Accuracy
These are **transparent order-of-magnitude estimates**, not measurements — providers don't publish per-token energy/water figures. All assumptions live in the `FACTORS` object at the top of `flushometer.js`. Pick a scenario with `--scenario low|mid|high`.

| Factor | Default | Basis |
|---|---|---|
| Energy | 0.3 / 1.0 / 3.0 Wh per 1k tokens | Google 2025 Gemini disclosure → legacy ChatGPT-query estimates |
| Water | 2.5 L/kWh | data-center cooling + generation (WUE ~1.8–4) |
| Carbon | 0.40 kg CO₂/kWh | grid average |
| Flush | 6 L | older 1.6 gpf toilet |
| EV | 0.28 kWh/mi | Tesla-class |
| Gas | 0.404 kg CO₂/mi | EPA average car |

MIT licensed.
