# 🚽 Flushometer

### *You waste thousands of tokens a day — now you can watch them swirl down the drain.*

---

## The pitch

You burn millions of tokens a week and feel… nothing. No weight. No consequence. Just a number ticking up in a billing dashboard you never open.

**Flushometer fixes that.** It turns your raw LLM token usage into the only units the human brain actually respects: **toilet flushes, miles in an EV, and miles in a gas car.** Live. At the bottom of your screen. Pulsing, flowing, judging you gently in braille.

It's a conscience for your context window — and it costs **zero tokens** to run.

---

## What it does

Flushometer reads Claude Code's live session data and renders it as an **animated statusline meter** that updates every second:

```
⠹ 🚽 ░▓▒░··~· 0.438f  ⚡3.75mi 🛢️1.04mi  · 1,050,000t 98%
```

- 🚽 a flush counter with a flowing fill-bar that climbs toward your next whole flush
- ⚡ how far that energy would've carried an electric car
- 🛢️ the equivalent gas-car distance (carbon-matched)
- a spinning, color-pulsing readout of your **session token odometer** and live context %

And when you want the full breakdown, just ask:

```
/flushometer:flush 175000
```

…for a three-scenario (low · mid · high) report with energy, water, and carbon.

---

## Features

| | |
|---|---|
| 🎞️ **Animated statusline** | Braille spinner, flowing water-ripple fill-bar, and a toilet that pulses through four colors — refreshes every second. |
| 🧮 **Session odometer** | Accumulates a *lifetime total* that survives Claude Code's context compaction. Starts fresh each new session. |
| 💧🚗🛢️ **Three relatable units** | Toilet flushes, EV distance, gas-car distance — derived from energy, water, and carbon respectively. |
| 📊 **`/flushometer:flush` report** | On-demand low/mid/high breakdown with full energy/water/carbon figures. |
| 🧠 **Honest by design** | No fake precision. Every assumption lives in one editable `FACTORS` block, with `low / mid / high` scenarios because nobody publishes real per-token numbers. |
| 🪶 **Featherweight** | Zero dependencies. Pure Node. ~65 ms per tick, **zero tokens**, never touches your conversation. |
| 🧩 **One-command setup** | `/flushometer:setup` wires the statusline into your settings automatically. Cross-platform. Reversible. |
| 🔌 **Real Claude Code plugin** | Installs from a marketplace, namespaced commands, validated manifests. |

---

## Release notes — v1.0.0 🎉

**The "First Flush" release.**

### New
- 🚽 **Animated statusline meter** — flushes, EV miles, gas miles, token odometer, and live context %, refreshing every second.
- 🧮 **Per-session odometer** with high-water-mark accumulation that survives context compaction (and resets cleanly on a new session).
- 📊 **`/flushometer:flush [tokens]`** — full low·mid·high report; uses the running tally when no number is given.
- ⚙️ **`/flushometer:setup`** — auto-installs the statusline into `~/.claude/settings.json` cross-platform, since plugins can't register statuslines directly. Fully reversible with `--uninstall`.
- 🎚️ **Tunable everything** — `--scenario low|mid|high`, `--current` (instantaneous load vs. odometer), `--no-animate`, `--no-color`.

### Under the hood
- Zero runtime dependencies; requires Node ≥ 18.
- Estimates documented and editable in the `FACTORS` object.
- Both plugin and marketplace manifests pass `claude plugin validate`.

### Known quirks
- The statusline needs a one-time `/flushometer:setup` + restart (a Claude Code limitation, not ours — plugins can't set statuslines).
- Numbers are **order-of-magnitude estimates**, not telemetry. That's the point.

---

## The fine print (that we're weirdly proud of)

Flushometer will never tell you it *knows* exactly how much water your prompt used — because no one does. Vendors don't publish per-token energy or water figures, so we ship transparent low/mid/high bands and put every constant in plain sight. It's a vibe check with sources, not a meter with a calibration certificate.

Also: the irony is fully intentional. A tool that measures token waste that itself burns **no tokens**. Install it and the only thing going down the drain is your denial.

> **Flushometer — because awareness starts at the bowl.** 🚽

*MIT licensed. Built for Claude Code.*
