#!/usr/bin/env node
/**
 * tenant-channel-consumer-gate — the dead-channel ratchet (design section 7a).
 *
 * A tenant-facing visual channel is only honest if some real source READS it. A
 * schema-legal override token, an emitted chrome variable, an anatomy attribute
 * or a chart-series slot with ZERO consumers is the P-79 "declared, not honored"
 * class applied to theming: the editor exposes a dial that paints nothing.
 *
 * This gate enumerates every channel the tenant contract can drive, scans the
 * source tree for a consumer, and enforces a DECREASE-ONLY baseline: a channel
 * that is dead today may be recorded as accepted debt with a reason, but a NEW
 * dead channel (one not in the baseline) fails the build. Reviving a channel is
 * always allowed and is surfaced as a tightening opportunity.
 *
 * Channel inventory (never a hand-list of outputs):
 *   1. TENANT_THEME_OVERRIDE_TOKENS_V1            (the contract's override dials)
 *   2. Object.keys(chromeToVariables(<fully-populated chrome>))  (the REAL
 *      emitter, executed against a recursive Proxy so every optional field is
 *      truthy and every emitted name appears — refactors of the emitter are
 *      tracked automatically, with a floor check against a Proxy collapse)
 *   3. --ds-chart-series-1..10                    (the generated chart palette)
 *   4. [data-anatomy-<family>='<variant>']        (anatomy variant selectors,
 *      when the contract export is present in dist)
 *
 * Contract values are imported from ../dist (the same convention as
 * build-vertical-css.mjs), so the gate runs after a build. Anatomy is read
 * defensively: a dist that predates the anatomy contract simply omits those
 * channels rather than crashing.
 *
 * Usage:
 *   node scripts/tenant-channel-consumer-gate.mjs           # print the report
 *   node scripts/tenant-channel-consumer-gate.mjs --check   # exit 1 on a NEW dead channel
 *   node scripts/tenant-channel-consumer-gate.mjs --seed    # (re)author the baseline from the current dead set
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const srcDir = join(root, 'src');
const distDir = join(root, 'dist');
const baselinePath = join(here, 'tenant-channel-consumer-gate.baseline.json');

/**
 * Lowest plausible count of distinct emitted chrome variable names. The real
 * emitter produces >600; a Proxy that stopped populating the chrome object would
 * collapse this toward zero and silently shrink the inventory, so the gate
 * refuses to run below the floor.
 */
export const EMITTER_CHANNEL_FLOOR = 400;

/** cardComponent maps to `data-anatomy-card`; the rest are identity. Mirrors the
 *  compiler's ANATOMY_ATTRIBUTE_BY_FAMILY (tenant-theme compiler). */
export const ANATOMY_ATTRIBUTE_BY_FAMILY = {
  cardComponent: 'data-anatomy-card',
  table: 'data-anatomy-table',
  sidebar: 'data-anatomy-sidebar',
  layout: 'data-anatomy-layout',
};

export const CHART_SERIES_CHANNELS = Array.from(
  { length: 10 },
  (_unused, index) => `--ds-chart-series-${index + 1}`,
);

/**
 * A recursive Proxy that is truthy at every depth and coerces to a non-empty
 * string. Every `if (chrome.x.y)` and `if (x != null)` in the emitter passes, so
 * executing the emitter against it yields the maximal set of emitted names
 * without hand-listing them. Only the KEYS are collected downstream; the values
 * are irrelevant.
 */
export function makePopulatedChrome() {
  const target = () => 'x';
  const handler = {
    get(_target, property) {
      if (property === Symbol.toPrimitive) return () => 'x';
      if (property === Symbol.toStringTag) return 'String';
      if (property === 'toString' || property === 'valueOf') return () => 'x';
      if (typeof property === 'symbol') return undefined;
      return proxy;
    },
    apply() {
      return proxy;
    },
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}

/** Execute the real emitter against the populated chrome; return its emitted names. */
export function collectEmittedChannelNames(chromeToVariables) {
  const emitted = chromeToVariables(makePopulatedChrome());
  return Object.keys(emitted);
}

/** Build the anatomy attribute-selector channels from the contract variant map. */
export function anatomyChannelsFrom(variantMap) {
  const channels = [];
  if (!variantMap) return channels;
  for (const [family, variants] of Object.entries(variantMap)) {
    const attribute = ANATOMY_ATTRIBUTE_BY_FAMILY[family];
    if (!attribute || !Array.isArray(variants)) continue;
    for (const variant of variants) {
      if (variant === 'default') continue;
      channels.push({ selector: `[${attribute}='${variant}']`, family, variant });
    }
  }
  return channels;
}

/**
 * Every `--ds-*` name read through `var(...)` in a source blob. The capture runs
 * to the first non-`[a-z0-9-]` character, so `var(--ds-color-primary-500)`
 * yields the full name and never counts as a consumer of `--ds-color-primary`.
 */
export function extractConsumedVarNames(text) {
  const names = new Set();
  for (const match of text.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
    names.add(match[1]);
  }
  return names;
}

/** Every `[data-anatomy-<family>='<variant>']` attribute selector in a blob. */
export function extractConsumedAnatomySelectors(text) {
  const selectors = new Set();
  for (const match of text.matchAll(
    /\[\s*(data-anatomy-[a-z-]+)\s*=\s*['"]([a-z-]+)['"]\s*\]/gi,
  )) {
    selectors.add(`[${match[1]}='${match[2]}']`);
  }
  return selectors;
}

/** Reason attached to an accepted-dead channel when the baseline is authored. */
export function reasonFor(name) {
  if (name.startsWith('--ds-workspace-card-') || name.startsWith('--ds-tall-card-')) {
    return 'premium-card namespace emitted with no var() consumer (compactCard/collectionCard are the live premium-card channels); redundancy hand-off to the CONTRACT/SCHEMA/EMITTER owner';
  }
  if (name.startsWith('--ds-chart-series-')) {
    return 'generated by the tenant chart-series generator (W4-C); the palette resolver default that reads it lands with W5 CHT-03';
  }
  if (
    name.startsWith('--ds-compact-card-') ||
    name.startsWith('--ds-collection-card-') ||
    name.startsWith('--ds-signal-card-') ||
    name.startsWith('--ds-metric-card-') ||
    name.startsWith('--ds-listing-grid-')
  ) {
    return 'premium-card/listing chrome field emitted for tenant authoring; this sub-field has no skin consumer (the namespace is only partly consumed)';
  }
  if (name.startsWith('--ds-color-dark-')) {
    return 'dark-seed override token; consumed once dual-ramp light-dark derivation lands (W4-C2 / W6)';
  }
  if (name === '--ds-surface-border-width' || name === '--ds-surface-border-style') {
    return 'surface border dial with no skin consumer; a bordered-surface skin or a contract removal is a later increment';
  }
  if (name === '--ds-letter-spacing-mono') {
    return 'mono tracking dial with no mono-text consumer; outside the 7b heading/body/display bridge';
  }
  if (name === '--ds-line-height-tight' || name === '--ds-line-height-relaxed') {
    return 'line-height dial with no consumer; outside the 7b heading/body/display bridge';
  }
  if (name === '--ds-effect-intensity') {
    return 'effect-intensity dial with no consumer; the effect system reads per-effect tokens';
  }
  if (name.startsWith('[data-anatomy-')) {
    return 'anatomy variant selector with no skin block; the engine skin variant lands with the W4-A anatomy skins';
  }
  return 'contract/chrome channel emitted with no var() consumer in src; accepted debt pending a skin/component consumer or a contract removal';
}

/**
 * Pure evaluator. `varChannels` is the set of `--ds-*` channel names,
 * `anatomyChannels` the attribute-selector channels; `consumedVars` /
 * `consumedAnatomy` are the sets observed in source. Returns the dead set, the
 * NEW dead (not in baseline) that fails the build, and the revived (baselined
 * but now consumed) that can be tightened out.
 */
export function evaluateChannels({
  varChannels,
  anatomyChannels,
  consumedVars,
  consumedAnatomy,
  baseline,
}) {
  const dead = [];
  for (const name of varChannels) {
    if (!consumedVars.has(name)) dead.push(name);
  }
  for (const channel of anatomyChannels) {
    if (!consumedAnatomy.has(channel.selector)) dead.push(channel.selector);
  }
  const baselineNames = new Set(Object.keys(baseline?.channels ?? {}));
  const deadSet = new Set(dead);
  const newDead = dead.filter((name) => !baselineNames.has(name)).sort();
  const revived = [...baselineNames].filter((name) => !deadSet.has(name)).sort();
  return { dead: dead.sort(), newDead, revived };
}

const SKIP_DIR = new Set(['node_modules', 'tests', '__tests__', 'dist']);
function isScannableFile(path) {
  if (/\.(test|spec)\.(ts|tsx|mjs|js)$/.test(path)) return false;
  if (path.includes('/facade/artifacts/')) return false;
  return /\.(css|ts|tsx)$/.test(path);
}

export function collectSourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (SKIP_DIR.has(entry)) continue;
      collectSourceFiles(full, out);
    } else if (isScannableFile(full)) {
      out.push(full);
    }
  }
  return out;
}

function loadBaseline() {
  if (!existsSync(baselinePath)) return { channels: {} };
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

async function importDist(relativePath) {
  const full = join(distDir, relativePath);
  if (!existsSync(full)) {
    throw new Error(
      `Missing ${full}. The dead-channel gate imports contract values from dist; run the build before this gate.`,
    );
  }
  return import(pathToFileURL(full).href);
}

async function main() {
  const mode = process.argv.includes('--check')
    ? 'check'
    : process.argv.includes('--seed')
      ? 'seed'
      : 'report';
  const quiet = process.argv.includes('--quiet');

  const contract = await importDist(
    'foundation/contracts/composition/tenants/themes/tenant-theme/index.js',
  );
  const emitterModule = await importDist(
    'infrastructure/compilers/kernel/foundation/css/chrome-variables/index.js',
  );

  const overrideTokens = contract.TENANT_THEME_OVERRIDE_TOKENS_V1;
  if (!Array.isArray(overrideTokens) || overrideTokens.length === 0) {
    throw new Error('TENANT_THEME_OVERRIDE_TOKENS_V1 not found in dist contract.');
  }
  const anatomyVariants = contract.TENANT_THEME_ANATOMY_VARIANTS_V1 ?? null;

  const emittedNames = collectEmittedChannelNames(emitterModule.chromeToVariables);
  if (emittedNames.length < EMITTER_CHANNEL_FLOOR) {
    throw new Error(
      `Emitter produced only ${emittedNames.length} channels (< ${EMITTER_CHANNEL_FLOOR}). The populated-chrome Proxy likely stopped driving the emitter; refusing to run with a collapsed inventory.`,
    );
  }

  const varChannels = new Set([
    ...overrideTokens,
    ...emittedNames,
    ...CHART_SERIES_CHANNELS,
  ]);
  const anatomyChannels = anatomyChannelsFrom(anatomyVariants);

  const consumedVars = new Set();
  const consumedAnatomy = new Set();
  for (const file of collectSourceFiles(srcDir)) {
    const text = readFileSync(file, 'utf8');
    for (const name of extractConsumedVarNames(text)) consumedVars.add(name);
    for (const selector of extractConsumedAnatomySelectors(text)) consumedAnatomy.add(selector);
  }

  const baseline = loadBaseline();
  const { dead, newDead, revived } = evaluateChannels({
    varChannels,
    anatomyChannels,
    consumedVars,
    consumedAnatomy,
    baseline,
  });

  if (mode === 'seed') {
    const channels = {};
    for (const name of dead) channels[name] = { reason: reasonFor(name) };
    const payload = {
      _comment:
        'Decrease-only accepted-debt ledger for tenant visual channels with zero source consumers. A NEW dead channel (not listed here) fails tenant-channel-consumer-gate --check. Revive a channel by wiring a var()/selector consumer, or tighten this list once revived.',
      generatedFrom: {
        overrideTokens: overrideTokens.length,
        emittedChromeChannels: emittedNames.length,
        chartSeriesChannels: CHART_SERIES_CHANNELS.length,
        anatomyChannels: anatomyChannels.length,
        anatomyContractPresent: Boolean(anatomyVariants),
      },
      channels,
    };
    writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(
      `[tenant-channel-consumer-gate] seeded ${dead.length} accepted-dead channels to ${baselinePath}`,
    );
    return;
  }

  const totalChannels = varChannels.size + anatomyChannels.length;
  if (!quiet || mode !== 'check') {
    console.log('[tenant-channel-consumer-gate]');
    console.log(`  channels inventoried : ${totalChannels}`);
    console.log(`    override tokens    : ${overrideTokens.length}`);
    console.log(`    emitted chrome     : ${emittedNames.length}`);
    console.log(`    chart-series       : ${CHART_SERIES_CHANNELS.length}`);
    console.log(
      `    anatomy selectors  : ${anatomyChannels.length}${anatomyVariants ? '' : ' (contract absent in dist — skipped)'}`,
    );
    console.log(`  dead channels        : ${dead.length}`);
    console.log(`  baselined debt       : ${Object.keys(baseline.channels ?? {}).length}`);
    console.log(`  new dead (fail)      : ${newDead.length}`);
    console.log(`  revived (tighten)    : ${revived.length}`);
  }

  if (mode === 'check') {
    if (revived.length > 0) {
      console.log(
        `[tenant-channel-consumer-gate] ${revived.length} baselined channel(s) now consumed; run --seed to tighten:`,
      );
      for (const name of revived.slice(0, 20)) console.log(`  + ${name}`);
    }
    if (newDead.length > 0) {
      console.error(
        `[tenant-channel-consumer-gate] FAIL: ${newDead.length} new dead channel(s) with zero consumers:`,
      );
      for (const name of newDead) console.error(`  - ${name}  (${reasonFor(name)})`);
      console.error(
        'Wire a var()/selector consumer, or add it to the baseline with a reason if it is accepted debt.',
      );
      process.exit(1);
    }
    console.log('[tenant-channel-consumer-gate] OK — no new dead channels.');
    return;
  }

  if (dead.length > 0 && !quiet) {
    console.log('  dead channel sample  :');
    for (const name of dead.slice(0, 30)) console.log(`    - ${name}`);
    if (dead.length > 30) console.log(`    ... and ${dead.length - 30} more`);
  }
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[tenant-channel-consumer-gate] ${error.message}`);
    process.exit(1);
  });
}
