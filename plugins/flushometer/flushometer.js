#!/usr/bin/env node
/* =====================================================================
 * flushometer — translate LLM token usage into real-world equivalents:
 *   🚽 toilet flushes, ⚡ EV distance, 🛢️ gas-car distance.
 *
 * Usage:
 *   flushometer <tokens>              one-off report
 *   flushometer add <tokens>          add to running session tally
 *   flushometer total                 show the running tally
 *   flushometer reset                 clear the tally
 *   echo 175000 | flushometer         read tokens from stdin
 *
 * Flags:
 *   --scenario low|mid|high   pick the energy estimate (default: mid)
 *   --json                    machine-readable output
 *   --no-color                disable ANSI color
 *
 * NOTE: providers don't publish per-token energy/water numbers, so these
 * are transparent order-of-magnitude estimates. Tune FACTORS to taste.
 * ===================================================================== */

const fs = require('fs');
const os = require('os');
const path = require('path');

// ---- Estimation factors (all editable; sources noted) ----------------
const FACTORS = {
  // Wh consumed per 1,000 tokens for a large frontier model.
  // Range spans Google's 2025 Gemini disclosure (~0.24 Wh/prompt, low)
  // to legacy "ChatGPT ≈ 3 Wh/query" estimates (high).
  energyWhPer1k: { low: 0.3, mid: 1.0, high: 3.0 },

  waterLitersPerKwh: 2.5,   // cooling + electricity generation (WUE ~1.8–4)
  co2KgPerKwh:       0.40,  // grid average carbon intensity
  flushLiters:       6.0,   // liters per toilet flush (older 1.6 gpf)
  evKwhPerMile:      0.28,  // EV consumption (~Tesla-class)
  gasCo2KgPerMile:   0.404, // EPA avg passenger car tailpipe CO2
};

const TALLY_FILE = path.join(os.homedir(), '.flushometer-tally.json');

// ---- Core math -------------------------------------------------------
function compute(tokens, scenario = 'mid') {
  const whPer1k = FACTORS.energyWhPer1k[scenario] ?? FACTORS.energyWhPer1k.mid;
  const wh = (tokens / 1000) * whPer1k;
  const kwh = wh / 1000;
  const waterL = kwh * FACTORS.waterLitersPerKwh;
  const co2Kg = kwh * FACTORS.co2KgPerKwh;

  const flushes = waterL / FACTORS.flushLiters;
  const evMiles = kwh / FACTORS.evKwhPerMile;
  const gasMiles = co2Kg / FACTORS.gasCo2KgPerMile;

  return {
    tokens, scenario, whPer1k,
    energyWh: wh, energyKwh: kwh, waterLiters: waterL, co2Grams: co2Kg * 1000,
    flushes, evMiles, evKm: evMiles * 1.60934, gasMiles, gasKm: gasMiles * 1.60934,
  };
}

// ---- Formatting ------------------------------------------------------
let forceColor = false;
const useColor = () => !process.argv.includes('--no-color') &&
  (forceColor || process.stdout.isTTY);
const c = (code, s) => (useColor() ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = (s) => c('1', s), dim = (s) => c('2', s);
const cyan = (s) => c('36', s), green = (s) => c('32', s), yellow = (s) => c('33', s);

function num(n, dp = 2) {
  if (n === 0) return '0';
  if (n < 0.01) return n.toExponential(1);
  return n.toLocaleString('en-US', { maximumFractionDigits: dp, minimumFractionDigits: 0 });
}

function report(r, label = 'Token usage') {
  const lines = [];
  lines.push('');
  lines.push(bold('  🚽 flushometer ') + dim(`— ${label}`));
  lines.push(dim('  ────────────────────────────────────────────'));
  lines.push('  ' + bold(num(r.tokens, 0)) + ' tokens' +
    dim(`   (${r.scenario} estimate · ${r.whPer1k} Wh/1k)`));
  lines.push('');
  lines.push('  ' + dim('energy ') + cyan(`${num(r.energyWh)} Wh`) +
    dim(`   water `) + cyan(`${num(r.waterLiters)} L`) +
    dim(`   carbon `) + cyan(`${num(r.co2Grams)} g CO₂`));
  lines.push('');
  lines.push('  ' + yellow('🚽 ') + bold(num(r.flushes)) + ' toilet flushes');
  lines.push('  ' + green('⚡ ') + bold(num(r.evMiles)) + ' mi ' + dim(`/ ${num(r.evKm)} km in an EV`));
  lines.push('  ' + c('31', '🛢️  ') + bold(num(r.gasMiles)) + ' mi ' + dim(`/ ${num(r.gasKm)} km in a gas car`));
  lines.push('');
  lines.push(dim('  estimates only — tune FACTORS in flushometer.js'));
  lines.push('');
  return lines.join('\n');
}

// ---- Animated statusline --------------------------------------------
// Frame is derived from wall-clock seconds so each statusline refresh
// advances the animation. `--frame N` forces a frame (for demos/tests).
function animFrame() {
  const i = process.argv.indexOf('--frame');
  if (i !== -1) return parseInt(process.argv[i + 1], 10) || 0;
  return Math.floor(Date.now() / 1000);
}

const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SHADE = ['▓', '▒', '░'];
const PULSE = ['36', '34', '35', '33']; // cyan→blue→magenta→yellow

// A bar whose filled portion (progress toward the NEXT whole flush) flows,
// and whose empty portion shows a drifting water ripple.
function flowBar(len, frac, frame) {
  const filled = Math.max(0, Math.min(len, Math.round(frac * len)));
  let s = '';
  for (let i = 0; i < len; i++) {
    if (i < filled) s += green(SHADE[(i + frame) % SHADE.length]);
    else s += dim((i + frame) % 4 === 0 ? '~' : '·');
  }
  return s;
}

function statusline(r, tokens, pct, animate) {
  if (!animate) {
    return yellow('🚽') + bold(num(r.flushes, 3)) + '  ' +
      green('⚡') + bold(num(r.evMiles, 2)) + 'mi  ' +
      c('31', '🛢️') + bold(num(r.gasMiles, 2)) + 'mi  ' +
      dim('· ') + cyan(num(tokens, 0)) + dim(' tok') + pct;
  }
  const f = animFrame();
  const spin = c(PULSE[f % PULSE.length], SPIN[f % SPIN.length]);
  const bowl = c(PULSE[f % PULSE.length], '🚽');
  const frac = r.flushes > 0 ? (r.flushes % 1 || 1) : 0;
  const bar = flowBar(8, frac, f);
  return `${spin} ${bowl} ${bar} ${bold(num(r.flushes, 3))}${dim('f')}  ` +
    `${green('⚡')}${bold(num(r.evMiles, 2))}${dim('mi')} ` +
    `${c('31', '🛢️')}${bold(num(r.gasMiles, 2))}${dim('mi')}  ` +
    `${dim('·')} ${cyan(num(tokens, 0))}${dim('t')}${pct}`;
}

// ---- Session odometer ------------------------------------------------
// The statusline payload reports CURRENT context-window occupancy, which
// drops when Claude Code compacts context. To show a true lifetime total
// we accumulate via a high-water mark per session: when current exceeds
// the prior peak, add the delta; when it drops (compaction), keep the
// total and rebase the peak. Monotonic — only ever climbs.
function accumulate(sessionId, current) {
  const file = path.join(os.tmpdir(), `flushometer-sess-${sessionId || 'default'}.json`);
  let st = { peak: 0, total: 0 };
  try { st = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* fresh */ }
  if (current >= st.peak) { st.total += current - st.peak; st.peak = current; }
  else { st.peak = current; } // context shrank (compaction) — keep total
  try { fs.writeFileSync(file, JSON.stringify(st)); } catch { /* read-only tmp */ }
  return st.total;
}

// ---- Tally persistence ----------------------------------------------
function loadTally() {
  try { return JSON.parse(fs.readFileSync(TALLY_FILE, 'utf8')); }
  catch { return { tokens: 0, entries: 0, since: new Date().toISOString() }; }
}
function saveTally(t) { fs.writeFileSync(TALLY_FILE, JSON.stringify(t, null, 2)); }

// ---- CLI -------------------------------------------------------------
function parseTokens(s) {
  if (s == null) return NaN;
  const n = Number(String(s).replace(/[_,\s]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}
function getScenario() {
  const i = process.argv.indexOf('--scenario');
  return i !== -1 ? (process.argv[i + 1] || 'mid') : 'mid';
}
function out(r, label) {
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else console.log(report(r, label));
}

function main(argv) {
  const args = argv.filter(a => !a.startsWith('--') &&
    a !== getScenario()).slice(2);
  const cmd = args[0];
  const scenario = getScenario();

  if (cmd === 'statusline') {
    // Reads Claude Code's session JSON from stdin, prints ONE animated line.
    // Claude Code re-runs this on `refreshInterval`, so the time-based frame
    // counter advances each refresh → the bar flows and the spinner spins.
    const animate = !process.argv.includes('--no-animate');
    let buf = '';
    process.stdin.on('data', d => (buf += d));
    process.stdin.on('end', () => {
      forceColor = true; // Claude Code statusline renders ANSI even when piped
      let p = {};
      try { p = JSON.parse(buf); } catch { /* leave empty */ }
      const cw = p.context_window || {};
      const current = (cw.total_input_tokens || 0) + (cw.total_output_tokens || 0);
      // Default: lifetime odometer. `--current` shows instantaneous load.
      const tokens = process.argv.includes('--current')
        ? current : accumulate(p.session_id, current);
      const r = compute(tokens, scenario);
      const pct = cw.used_percentage != null ? ` ${dim(cw.used_percentage + '%')}` : '';
      process.stdout.write(statusline(r, tokens, pct, animate));
    });
    return;
  }
  if (cmd === 'setup') {
    // Cross-platform: wire the statusline + /flush into the user's ~/.claude,
    // deriving all paths at runtime (no hardcoded locations). Reversible.
    const uninstall = process.argv.includes('--uninstall');
    const force = process.argv.includes('--force');
    const claudeDir = path.join(os.homedir(), '.claude');
    const settingsPath = path.join(claudeDir, 'settings.json');
    const cmdsDir = path.join(claudeDir, 'commands');
    const flushMd = path.join(cmdsDir, 'flush.md');
    const scriptAbs = __filename;
    const scriptFwd = scriptAbs.replace(/\\/g, '/'); // node accepts / on Windows
    const ours = (s) => typeof s === 'string' && /flushometer/i.test(s);

    let settings = {};
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch { /* fresh */ }

    if (uninstall) {
      if (ours(settings.statusLine && settings.statusLine.command)) delete settings.statusLine;
      try { fs.unlinkSync(flushMd); } catch { /* already gone */ }
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
      console.log(dim('  flushometer removed from ~/.claude. Restart Claude Code.'));
      return;
    }

    if (settings.statusLine && !ours(settings.statusLine.command) && !force) {
      return fail('you already have a statusLine. Re-run with --force to replace it, ' +
        'or add this manually:\n    "command": ' + JSON.stringify(`node "${scriptAbs}" statusline`));
    }
    settings.statusLine = {
      type: 'command',
      command: `node "${scriptAbs}" statusline`,
      refreshInterval: 1,
      padding: 1,
    };
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

    fs.mkdirSync(cmdsDir, { recursive: true });
    fs.writeFileSync(flushMd,
      '---\n' +
      'allowed-tools: Bash(node:*)\n' +
      'description: Flushometer — token usage as toilet flushes / EV miles / gas miles (low·mid·high)\n' +
      '---\n\n' +
      'Flushometer report for `$ARGUMENTS` tokens (omit to use the running tally):\n\n' +
      '!`node "' + scriptFwd + '" range $ARGUMENTS --no-color`\n');

    console.log(green('  ✓ ') + 'statusline + /flush installed into ' + dim(claudeDir));
    console.log(dim('  Restart Claude Code to activate. Undo with: ') + 'flushometer setup --uninstall');
    return;
  }
  if (cmd === 'range') {
    // Full report across low/mid/high for a token count (or the tally).
    const tokens = !Number.isNaN(parseTokens(args[1])) ? parseTokens(args[1]) : loadTally().tokens;
    if (process.argv.includes('--json')) {
      console.log(JSON.stringify(['low', 'mid', 'high'].map(s => compute(tokens, s)), null, 2));
    } else {
      for (const s of ['low', 'mid', 'high']) console.log(report(compute(tokens, s), `${s} estimate`));
    }
    return;
  }
  if (cmd === 'reset') {
    saveTally({ tokens: 0, entries: 0, since: new Date().toISOString() });
    console.log(dim('  tally reset.'));
    return;
  }
  if (cmd === 'total') {
    const t = loadTally();
    out(compute(t.tokens, scenario),
      `session total · ${t.entries} entries since ${t.since.slice(0, 10)}`);
    return;
  }
  if (cmd === 'add') {
    const tokens = parseTokens(args[1]);
    if (Number.isNaN(tokens)) return fail('add needs a token count, e.g. `flushometer add 175000`');
    const t = loadTally();
    t.tokens += tokens; t.entries += 1;
    saveTally(t);
    out(compute(t.tokens, scenario),
      `session total (+${num(tokens, 0)}) · ${t.entries} entries`);
    return;
  }

  // one-off: arg or stdin
  const tokens = parseTokens(cmd);
  if (!Number.isNaN(tokens)) return out(compute(tokens, scenario));

  if (!process.stdin.isTTY) {
    let buf = '';
    process.stdin.on('data', d => (buf += d));
    process.stdin.on('end', () => {
      const t = parseTokens(buf.trim());
      if (Number.isNaN(t)) return fail('no valid token count on stdin');
      out(compute(t, scenario));
    });
    return;
  }
  usage();
}

function fail(msg) { console.error(c('31', '  error: ') + msg); process.exitCode = 1; }
function usage() {
  console.log(`
  ${bold('flushometer')} — token usage as toilet flushes, EV & gas distance

  ${cyan('flushometer <tokens>')}        one-off report
  ${cyan('flushometer range [tokens]')}  low/mid/high report (used by /flush)
  ${cyan('flushometer add <tokens>')}    add to running session tally
  ${cyan('flushometer total')}           show the running tally
  ${cyan('flushometer reset')}           clear the tally
  ${cyan('echo 175000 | flushometer')}   read from stdin

  ${cyan('flushometer setup')}           wire statusline + /flush into ~/.claude
  ${cyan('flushometer setup --uninstall')}  remove them again

  flags: --scenario low|mid|high   --json   --no-color
`);
}

if (require.main === module) main(process.argv);
module.exports = { compute, FACTORS };
