# 🚽 flushometer — Claude Code plugin marketplace

### *You waste thousands of tokens a day — now you can watch them swirl down the drain.*

This repo is a [Claude Code](https://claude.com/claude-code) **plugin marketplace** containing one plugin: **flushometer**, which shows your token usage as toilet flushes, EV distance, and gas-car distance — with an animated statusline.

## Install

```bash
# 1. Add this marketplace
/plugin marketplace add Infinite-Loop-Design/flushometer-plugin

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
Hosted at **https://github.com/Infinite-Loop-Design/flushometer-plugin** — others install with the two `/plugin` commands above. To fork your own copy, push this folder to a new repo and update the `owner`/`source` fields if your path differs.

MIT licensed.
