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
 *   1. TENANT_THEME_OVERRIDE_TOKENS            (the contract's override dials)
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
 * ENGINE=MODERN VIEW (--modern)
 * -----------------------------
 * The global check above scans ALL of `src/`, so a channel read only by
 * `engines/rustic/skin/tabs.css` counts as alive. Under the 2026-07-25 engine
 * freeze that verdict is misleading: Classic and Rustic are read-only, all
 * visual effort is Modern, and a dial whose only consumer is a frozen engine
 * paints NOTHING for the engine anyone is shipping. The modern view scores the
 * same inventory against modern-reachable consumers only, and reports four
 * distinct states:
 *
 *   DECLARED — the tenant contract exposes the channel as a dial
 *              (TENANT_THEME_OVERRIDE_TOKENS, the 10 chart-series slots, the
 *              anatomy variant selectors). "A customer can set this."
 *   EMITTED  — a compiler actually writes the channel (a key of
 *              chromeToVariables against the populated chrome). "Something
 *              produces a value for this."
 *   CONSUMED — at least one scannable first-party source reads it via `var()`
 *              or the anatomy attribute selector, in ANY engine. "Some source
 *              reads it." (the global check's notion of alive)
 *   PAINTED  — at least one CONSUMING file is modern-reachable, i.e. its path
 *              is not under `engines/classic/` or `engines/rustic/`.
 *              "It can change a pixel under the engine we ship."
 *
 * A channel that is CONSUMED but not PAINTED is dead-in-modern. The modern view
 * REPORTS; it never deletes a channel, and it carries its own decrease-only
 * baseline so it can ratchet later without failing today's build.
 *
 * Usage:
 *   node scripts/tenant-channel-consumer-gate.mjs                # print the report
 *   node scripts/tenant-channel-consumer-gate.mjs --check        # exit 1 on a NEW dead channel
 *   node scripts/tenant-channel-consumer-gate.mjs --seed         # (re)author the baseline from the current dead set
 *   node scripts/tenant-channel-consumer-gate.mjs --modern       # print the engine=modern four-state report
 *   node scripts/tenant-channel-consumer-gate.mjs --modern-check # exit 1 on a NEW dead-in-modern channel
 *   node scripts/tenant-channel-consumer-gate.mjs --modern-seed  # (re)author the modern baseline
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const srcDir = join(root, 'src');
const distDir = join(root, 'dist');
const baselinePath = join(here, 'tenant-channel-consumer-gate.baseline.json');
const modernBaselinePath = join(here, 'tenant-channel-consumer-gate.modern.baseline.json');

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
  if (name.startsWith('--ds-material-')) {
    return 'legacy-prefixed semantic surface-role channel landed ahead of a public SemanticSurface consumer; the prefix is compiler compatibility, not an external Material framework';
  }
  if (name.startsWith('--ds-type-')) {
    return 'semantic typography facet emitted by the compiler but not yet consumed by a DS typography role; not accepted as visually effective until the role reads this exact facet';
  }
  if (name === '--ds-input-search-icon-color') {
    return 'input search-icon channel emitted before the Modern search action consumed it; keep baselined only if that consumer is removed';
  }
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

/* -------------------------------------------------------------------------- */
/* engine=modern view                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The frozen engines (policy 2026-07-25). This restates the law owned by
 * engine-freeze-gate.mjs (`FROZEN`); the two regexes are asserted equal by
 * engine-freeze-gate.test.mjs rather than imported, so neither gate has to load
 * the other's module graph.
 */
export const FROZEN_ENGINE_PATH = /(^|\/)engines\/(classic|rustic)\//;

/**
 * Sources that only exist for the Modern engine. `engines/modern/` covers the
 * component implementations and the CSS skin tree
 * (`foundation/tokens/css/runtime/engines/modern/`); `engine-styles/modern/`
 * covers the pattern-level modern style owner.
 */
export const MODERN_ENGINE_PATH = /(^|\/)(engines|engine-styles)\/modern\//;

/**
 * Three scopes, because "not frozen" and "modern" are different claims:
 *   frozen-engine — renders only under Classic/Rustic; paints nothing in Modern
 *   modern-engine — the Modern engine's own implementation/skin
 *   engine-neutral— shared component/token source that renders under EVERY
 *                   engine, Modern included
 * Modern-reachable = modern-engine ∪ engine-neutral.
 */
export function classifyConsumerScope(path) {
  const posix = path.split(sep).join('/');
  if (FROZEN_ENGINE_PATH.test(posix)) return 'frozen-engine';
  if (MODERN_ENGINE_PATH.test(posix)) return 'modern-engine';
  return 'engine-neutral';
}

/** An empty per-scope consumption record, the shape scanConsumers fills. */
export function emptyScopeIndex() {
  return {
    'frozen-engine': new Set(),
    'modern-engine': new Set(),
    'engine-neutral': new Set(),
  };
}

/**
 * Pure evaluator for the modern view. `scopes` is the per-scope consumption
 * index (var names and anatomy selectors share one namespace here — anatomy
 * selectors are `[...]`-prefixed and cannot collide with `--ds-*` names).
 *
 * Returns, per channel, the four states plus the two dead-in-modern classes:
 *   deadGlobal     — never consumed by any source (already the global gate's set)
 *   frozenOnly     — CONSUMED, but every consumer is a frozen-engine file
 * and the ratchet fields (newDead/revived) against the modern baseline.
 */
export function evaluateModernView({
  channels,
  declaredNames,
  emittedNames,
  scopes,
  baseline,
}) {
  const declared = new Set(declaredNames);
  const emitted = new Set(emittedNames);
  const frozen = scopes['frozen-engine'];
  const modern = scopes['modern-engine'];
  const neutral = scopes['engine-neutral'];

  const rows = [];
  for (const name of channels) {
    const byFrozen = frozen.has(name);
    const byModern = modern.has(name);
    const byNeutral = neutral.has(name);
    rows.push({
      name,
      declared: declared.has(name),
      emitted: emitted.has(name),
      consumed: byFrozen || byModern || byNeutral,
      painted: byModern || byNeutral,
      modernEngineConsumer: byModern,
    });
  }

  const deadGlobal = rows.filter((row) => !row.consumed).map((row) => row.name);
  const frozenOnly = rows.filter((row) => row.consumed && !row.painted).map((row) => row.name);
  const deadInModern = [...deadGlobal, ...frozenOnly].sort();
  /* Diagnostic only, never a state: PAINTED channels whose only consumers are
     engine-neutral. They DO paint in Modern (shared source renders under every
     engine); they simply have no Modern-specific skin block. Counting these as
     dead is the over-count that produces the "658 channels paint nothing in
     modern" figure — the honest dead-in-modern number is deadInModern. */
  const paintedWithoutModernBlock = rows
    .filter((row) => row.painted && !row.modernEngineConsumer)
    .map((row) => row.name);

  const baselineNames = new Set(Object.keys(baseline?.channels ?? {}));
  const deadSet = new Set(deadInModern);
  const newDead = deadInModern.filter((name) => !baselineNames.has(name)).sort();
  const revived = [...baselineNames].filter((name) => !deadSet.has(name)).sort();

  return {
    rows,
    counts: {
      inventoried: rows.length,
      declared: rows.filter((row) => row.declared).length,
      emitted: rows.filter((row) => row.emitted).length,
      consumed: rows.filter((row) => row.consumed).length,
      painted: rows.filter((row) => row.painted).length,
    },
    deadGlobal: deadGlobal.sort(),
    frozenOnly: frozenOnly.sort(),
    deadInModern,
    paintedWithoutModernBlock: paintedWithoutModernBlock.sort(),
    newDead,
    revived,
  };
}

/** Reason attached to a dead-in-modern channel when the modern baseline is authored. */
export function modernReasonFor(name, frozenOnlySet) {
  if (frozenOnlySet.has(name)) {
    return `consumed ONLY by frozen Classic/Rustic sources; paints nothing under the Modern engine. Needs a modern skin/component consumer, or a contract removal — never a silent delete. (${reasonFor(name)})`;
  }
  return reasonFor(name);
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

function loadModernBaseline() {
  if (!existsSync(modernBaselinePath)) return { channels: {} };
  return JSON.parse(readFileSync(modernBaselinePath, 'utf8'));
}

/**
 * One pass over the source tree that produces BOTH the union sets the global
 * check has always used and the per-scope index the modern view needs. The
 * union is derived from the scopes, so the two views can never disagree about
 * what "consumed" means.
 */
export function scanConsumers(files, readFile = (path) => readFileSync(path, 'utf8')) {
  const vars = emptyScopeIndex();
  const anatomy = emptyScopeIndex();
  const files_by_scope = { 'frozen-engine': 0, 'modern-engine': 0, 'engine-neutral': 0 };
  for (const file of files) {
    const scope = classifyConsumerScope(file);
    files_by_scope[scope] += 1;
    const text = readFile(file);
    for (const name of extractConsumedVarNames(text)) vars[scope].add(name);
    for (const selector of extractConsumedAnatomySelectors(text)) anatomy[scope].add(selector);
  }
  const union = (index) =>
    new Set([...index['frozen-engine'], ...index['modern-engine'], ...index['engine-neutral']]);
  return {
    vars,
    anatomy,
    filesByScope: files_by_scope,
    consumedVars: union(vars),
    consumedAnatomy: union(anatomy),
    /** var names and anatomy selectors merged per scope, for the modern evaluator. */
    merged: {
      'frozen-engine': new Set([...vars['frozen-engine'], ...anatomy['frozen-engine']]),
      'modern-engine': new Set([...vars['modern-engine'], ...anatomy['modern-engine']]),
      'engine-neutral': new Set([...vars['engine-neutral'], ...anatomy['engine-neutral']]),
    },
  };
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

/**
 * The engine=modern view: report the four states, and ratchet dead-in-modern
 * against its own decrease-only baseline. It never mutates the global baseline
 * and never deletes a channel — a dead-in-modern channel is a REPORT that a
 * modern consumer (or a contract removal) is owed.
 */
function runModernView({
  mode,
  quiet,
  overrideTokens,
  emittedNames,
  anatomyChannels,
  anatomyVariants,
  varChannels,
  scan,
}) {
  const anatomySelectors = anatomyChannels.map((channel) => channel.selector);
  const channels = [...varChannels, ...anatomySelectors];
  const declaredNames = [...overrideTokens, ...CHART_SERIES_CHANNELS, ...anatomySelectors];
  const baseline = loadModernBaseline();

  const view = evaluateModernView({
    channels,
    declaredNames,
    emittedNames,
    scopes: scan.merged,
    baseline,
  });
  const frozenOnlySet = new Set(view.frozenOnly);

  if (mode === 'modern-seed') {
    const ledger = {};
    for (const name of view.deadInModern) {
      ledger[name] = {
        state: frozenOnlySet.has(name) ? 'consumed-frozen-only' : 'never-consumed',
        reason: modernReasonFor(name, frozenOnlySet),
      };
    }
    const payload = {
      _comment:
        'Decrease-only ledger of tenant visual channels that paint NOTHING under the Modern engine. ' +
        'A channel is dead-in-modern when it is never consumed at all, or when every consumer that ' +
        'reads it lives under engines/classic or engines/rustic (frozen since 2026-07-25). This view ' +
        'REPORTS: it never deletes a channel. `--modern-check` fails only on a channel that is NOT ' +
        'listed here, so the list can shrink and never grow.',
      view: 'engine=modern',
      states:
        'DECLARED = the contract exposes the dial | EMITTED = a compiler writes it | ' +
        'CONSUMED = some source reads it in any engine | PAINTED = a modern-reachable source reads it ' +
        '(not under engines/classic|rustic). CONSUMED and not PAINTED = dead-in-modern.',
      generatedFrom: {
        channelsInventoried: view.counts.inventoried,
        declared: view.counts.declared,
        emitted: view.counts.emitted,
        consumed: view.counts.consumed,
        painted: view.counts.painted,
        neverConsumed: view.deadGlobal.length,
        consumedFrozenOnly: view.frozenOnly.length,
        paintedWithoutModernBlock: view.paintedWithoutModernBlock.length,
        sourceFilesByScope: scan.filesByScope,
        anatomyContractPresent: Boolean(anatomyVariants),
      },
      channels: ledger,
    };
    writeFileSync(modernBaselinePath, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(
      `[tenant-channel-consumer-gate] engine=modern: seeded ${view.deadInModern.length} dead-in-modern channels to ${modernBaselinePath}`,
    );
    return;
  }

  if (!quiet) {
    console.log('[tenant-channel-consumer-gate] engine=modern view');
    console.log(`  channels inventoried    : ${view.counts.inventoried}`);
    console.log(`  DECLARED (contract dial): ${view.counts.declared}`);
    console.log(`  EMITTED  (compiler writes): ${view.counts.emitted}`);
    console.log(`  CONSUMED (read anywhere): ${view.counts.consumed}`);
    console.log(`  PAINTED  (read by a modern-reachable source): ${view.counts.painted}`);
    console.log(`  dead in modern          : ${view.deadInModern.length}`);
    console.log(`    never consumed at all : ${view.deadGlobal.length}`);
    console.log(`    consumed by frozen engines only : ${view.frozenOnly.length}`);
    console.log(`  baselined debt          : ${Object.keys(baseline.channels ?? {}).length}`);
    console.log(`  new dead in modern      : ${view.newDead.length}`);
    console.log(`  revived (tighten)       : ${view.revived.length}`);
    console.log(
      `  diagnostic: PAINTED but with no modern-engine block (engine-neutral consumers only): ${view.paintedWithoutModernBlock.length}`,
    );
    console.log(
      `  source files by scope   : frozen ${scan.filesByScope['frozen-engine']} | modern ${scan.filesByScope['modern-engine']} | engine-neutral ${scan.filesByScope['engine-neutral']}`,
    );
    if (view.frozenOnly.length > 0) {
      console.log('  consumed ONLY by classic/rustic (paints nothing in modern):');
      for (const name of view.frozenOnly.slice(0, 40)) console.log(`    - ${name}`);
      if (view.frozenOnly.length > 40) {
        console.log(`    ... and ${view.frozenOnly.length - 40} more`);
      }
    }
  }

  if (mode === 'modern-check') {
    if (view.revived.length > 0) {
      console.log(
        `[tenant-channel-consumer-gate] engine=modern: ${view.revived.length} baselined channel(s) now paint in modern; run --modern-seed to tighten:`,
      );
      for (const name of view.revived.slice(0, 20)) console.log(`  + ${name}`);
    }
    if (view.newDead.length > 0) {
      console.error(
        `[tenant-channel-consumer-gate] engine=modern FAIL: ${view.newDead.length} new channel(s) that paint nothing under Modern:`,
      );
      for (const name of view.newDead) {
        console.error(`  - ${name}  (${modernReasonFor(name, frozenOnlySet)})`);
      }
      console.error(
        'Wire a modern-reachable consumer (modern skin/component or engine-neutral source), or record it ' +
          'in the modern baseline with a reason. Never delete the channel to make this pass.',
      );
      process.exit(1);
    }
    console.log('[tenant-channel-consumer-gate] engine=modern OK — no new dead-in-modern channels.');
  }
}

async function main() {
  const mode = process.argv.includes('--modern-check')
    ? 'modern-check'
    : process.argv.includes('--modern-seed')
      ? 'modern-seed'
      : process.argv.includes('--modern')
        ? 'modern'
        : process.argv.includes('--check')
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

  const overrideTokens = contract.TENANT_THEME_OVERRIDE_TOKENS;
  if (!Array.isArray(overrideTokens) || overrideTokens.length === 0) {
    throw new Error('TENANT_THEME_OVERRIDE_TOKENS not found in dist contract.');
  }
  const anatomyVariants = contract.TENANT_THEME_ANATOMY_VARIANTS ?? null;

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

  const scan = scanConsumers(collectSourceFiles(srcDir));
  const { consumedVars, consumedAnatomy } = scan;

  if (mode === 'modern' || mode === 'modern-check' || mode === 'modern-seed') {
    runModernView({
      mode,
      quiet,
      overrideTokens,
      emittedNames,
      anatomyChannels,
      anatomyVariants,
      varChannels,
      scan,
    });
    return;
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
