# 🚽 flushometer — Claude Code plugin marketplace

This repo is a [Claude Code](https://claude.com/claude-code) **plugin marketplace** containing one plugin: **flushometer**, which shows your token usage as toilet flushes, EV distance, and gas-car distance — with an animated statusline.

## Install

```bash
# 1. Add this marketplace (replace with your GitHub owner/repo once pushed)
/plugin marketplace add <owner>/flushometer-plugin

# 2. Install the plugin
/plugin install flushometer@flushometer

# 3. Turn on the animated statusline (plugins can't set it directly)
/flushometer:setup
#    …then restart Claude Code.
```

Try it locally before pushing anywhere:
```bash
/plugin marketplace add C:/Users/Caleb/Desktop/WhiteScrape/flushometer-plugin
/plugin install flushometer@flushometer
```

## Use
- `/flushometer:flush 175000` — report for a token count
- `/flushometer:flush` — report for the running tally
- statusline updates every second once `/flushometer:setup` has run

## Layout
```
flushometer-plugin/
├── .claude-plugin/
│   └── marketplace.json          ← marketplace listing (this repo)
└── plugins/
    └── flushometer/
        ├── .claude-plugin/
        │   └── plugin.json        ← plugin manifest
        ├── commands/
        │   ├── flush.md           ← /flushometer:flush
        │   └── setup.md           ← /flushometer:setup
        ├── flushometer.js         ← zero-dependency CLI (the engine)
        ├── README.md
        └── LICENSE
```

## Sharing it
1. Create an empty GitHub repo (e.g. `flushometer-plugin`).
2. Push this folder to it.
3. Fill in the `owner` fields in `.claude-plugin/marketplace.json` and `plugins/flushometer/.claude-plugin/plugin.json`.
4. Others install with the two `/plugin` commands above, pointing at `<your-owner>/flushometer-plugin`.

MIT licensed.
