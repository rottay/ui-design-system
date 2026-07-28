#!/usr/bin/env node
/**
 * Artifact provenance and extension-budget gate (AD-2, Codex C2).
 *
 * A first-party artifact has exactly two authors: the BrandTheme, compiled by
 * `compileBrandTheme` into the base block, and a declared extension for what
 * the contract cannot express. The failure the first version of this gate
 * existed to prevent is an extension quietly re-declaring a channel the
 * compiler already emits for the SAME reachable state, so the authored theme
 * value never reaches a pixel and editing it changes nothing.
 *
 * That property is necessary and was not sufficient. The Codex acceptance audit
 * showed a green provenance result is compatible with 173 KB of application UI
 * living inside `bithire/_source/extension.css`: 15 `component-local` regions,
 * 462 `!important` declarations, Ant selectors, `.rt-*`/`.bithire-*` product
 * selectors. Headers made that debt declared; nothing made it bounded. So this
 * gate now carries three layers.
 *
 * 1. PROVENANCE (unchanged). Every declaration sits inside a region introduced
 *    by a machine-parseable header:
 *
 *      / * @ds-exception kind=<kind> owner=<owner> purpose="<one line>"
 *           reachability=<shipped|mode:dark|mode:light|media|subtree>
 *           [retire="<condition>"] * /
 *
 *    A header covers every top-level node from itself up to the next header.
 *    Legitimacy per kind:
 *      mode-block      values for the NON-default mode; the compiler owns the default
 *      media           @media/@supports-gated rules
 *      reduced-motion  prefers-reduced-motion zeroing
 *      component-local descendant-subtree scope; never competes at the tenant root
 *      structural      non-custom-property rules (keyframes, pseudo-elements, focus)
 *      capability-gap  base-state flat channel the contract cannot express -- the
 *                      only kind allowed to re-declare an emitted channel
 *
 * 2. RATCHETS. Per vertical, decrease-only budgets for bytes, rules,
 *    declarations, `!important`, paint literals, application-selector
 *    occurrences and framework/engine-selector occurrences. These bound volume;
 *    they say nothing about shape.
 *
 * 3. LAWS. Hard rules that no ratchet can buy out, each carrying a grandfather
 *    inventory keyed to what exists on the tree today so the current
 *    (non-compliant) state is green while any NEW instance is red:
 *      L-A  `component-local` is not a valid kind for a static theme artifact.
 *           The 15 that exist are grandfathered by region id pending the
 *           Phase-3 drain; a 16th is red.
 *      L-B  no NEW application (`.rt-*`, `.<vertical>-*`, `[data-<vertical>-*]`)
 *           or framework/engine (`.ant-*`, DaisyUI) selector token.
 *      L-C  no NEW `!important`, counted per selector.
 *      L-D  `media`/`reduced-motion` regions may only declare semantic root
 *           channels; a descendant skin hidden behind a media query is still an
 *           application skin.
 *      L-E  `structural` regions may not carry custom-property-free component
 *           paint beyond what they carry today.
 *      L-F  every capability-gap header carries owner= AND a non-empty retire=.
 *      L-G  a `capability-gap` region declares at most CAPABILITY_GAP_REGION_BUDGET
 *           channels. Layers 1 and 2 together still permitted one region to hold
 *           an entire hand-authored palette: the header made it declared and the
 *           per-vertical volume budget bounded only the FILE. A gap is a gap in
 *           the contract, which is a handful of channels; anything larger is a
 *           second theme system wearing one exception header. Regions above the
 *           budget today are grandfathered at their CURRENT size and may only
 *           shrink, so splitting one giant region into honest atomic gaps is
 *           always allowed and growing one never is.
 *      L-H  no NEW compiler-emitted channel is re-declared in an extension.
 *           `capabilityGaps` counts these; a count alone lets a drained channel
 *           fund a new one, so the law is keyed by channel NAME.
 *      L-I  a `capability-gap` region declares custom properties only. A gap is
 *           a missing typed CHANNEL; a real CSS property in that region is a raw
 *           CSS bag, which is authorship the contract was never asked about.
 *
 * The set of compiler-emitted channels is read from the GENERATED artifact's
 * compiled block, not from `dist/`: the artifact is the compiler's own output,
 * its freshness is already enforced by `build-vertical-artifacts.mjs --check`,
 * and depending on a build directory would make this gate lie whenever `dist`
 * lagged the source.
 *
 * Usage:
 *   node scripts/artifact-provenance-gate.mjs           # print the report
 *   node scripts/artifact-provenance-gate.mjs --check   # exit 1 on any finding
 *   node scripts/artifact-provenance-gate.mjs --seed    # (re)author the baseline
 *   node scripts/artifact-provenance-gate.mjs --seed --allow-growth
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

/**
 * How many channels one `capability-gap` region may declare (L-G).
 *
 * A capability gap names something the typed contract cannot express. That is a
 * handful of channels with one owner and one retirement condition. Ten leaves
 * room for a genuinely clustered gap (a status family, a ramp step set) while
 * making "declare the palette under one header" impossible.
 */
export const CAPABILITY_GAP_REGION_BUDGET = 10;

/** Reads a `--flag value` pair from argv; falls back to `fallback` when absent. */
function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : fallback;
}

// Overridable for the fixture-mode self-drills only; production invocation
// always reads the real package tree.
const ARTIFACTS_ROOT = argValue(
  '--artifacts-root',
  join(ROOT, 'src/foundation/tokens/css/facade/artifacts')
);
const BASELINE_PATH = argValue('--baseline', join(HERE, 'artifact-provenance-gate.baseline.json'));

export const EXCEPTION_KINDS = Object.freeze([
  'mode-block',
  'media',
  'reduced-motion',
  'component-local',
  'structural',
  'capability-gap',
]);

const REACHABILITY_VALUES = Object.freeze([
  'shipped',
  'mode:dark',
  'mode:light',
  'media',
  'subtree',
]);

const HEADER_MARKER = '@ds-exception';

/** The metrics carrying a decrease-only budget. Order is the report order. */
export const RATCHETED_METRICS = Object.freeze([
  'bytes',
  'rules',
  'declarations',
  'important',
  'literals',
  'appSelectors',
  'engineSelectors',
]);

// ── selector reasoning ──────────────────────────────────

/** Split a selector list on top-level commas (never inside `:is()`/`:where()`). */
export function splitArms(selector) {
  const arms = [];
  let depth = 0;
  let current = '';
  for (const ch of selector) {
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      if (current.trim()) arms.push(current.trim());
      current = '';
    } else current += ch;
  }
  if (current.trim()) arms.push(current.trim());
  return arms;
}

/** True when the arm targets a descendant rather than the tenant root itself. */
export function armIsDescendant(arm) {
  let depth = 0;
  for (let i = 0; i < arm.length; i += 1) {
    const ch = arm[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (depth === 0 && /[\s>+~]/.test(ch) && arm.slice(i).trim().length > 0) return true;
  }
  return false;
}

/**
 * Which modes an arm can match. `:not([data-theme='dark'])` excludes dark;
 * a bare tenant selector matches every mode, including the default.
 */
export function armModes(arm) {
  const negated = [];
  const positive = arm.replace(/:not\(([^()]*)\)/g, (_match, inner) => {
    negated.push(inner);
    return ' ';
  });
  const negatedText = negated.join(' ');
  const testDark = (text) => /\[data-theme\s*=\s*['"]?dark['"]?\]/.test(text) || /\.dark\b/.test(text);
  const testLight = (text) => /\[data-theme\s*=\s*['"]?light['"]?\]/.test(text) || /\.light\b/.test(text);

  if (testDark(positive)) return ['dark'];
  if (testLight(positive)) return ['light'];
  const modes = ['default', 'light', 'dark'];
  return modes.filter((mode) => {
    if (mode === 'dark' && testDark(negatedText)) return false;
    if (mode === 'light' && testLight(negatedText)) return false;
    return true;
  });
}

/** True when the rule can author the tenant root in the given mode. */
export function ruleAuthorsRootInMode(rule, mode) {
  return splitArms(rule.selector).some((arm) => !armIsDescendant(arm) && armModes(arm).includes(mode));
}

/**
 * Grandfather identity for a selector. Extension selectors are authored across
 * many lines inside `:where(...)` lists, so the key has to survive
 * reformatting: everything else about the selector is its identity.
 */
export function normalizeSelector(selector) {
  return selector.replace(/\s+/g, ' ').trim();
}

/** Keyframe steps (`from`, `to`, `40%`) are not selectors; no selector law applies. */
function insideKeyframes(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && /keyframes$/.test(parent.name)) return true;
  }
  return false;
}

// ── vocabularies ────────────────────────────────────────

const FRAMEWORK_CLASS_MANIFEST = join(HERE, 'lib/daisy-painted-classes.json');

/**
 * The DaisyUI class vocabulary, read from the manifest the Modern-engine gates
 * already pin. A static theme artifact naming one of these is skinning the
 * framework layer the Modern engine is supposed to be draining.
 */
export function loadFrameworkClasses(manifestPath = FRAMEWORK_CLASS_MANIFEST) {
  if (!existsSync(manifestPath)) return new Set();
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  return new Set(Object.keys(manifest.classes ?? {}));
}

const CLASS_TOKEN = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;
const ATTR_TOKEN = /\[(data-[A-Za-z0-9_-]+)/g;

/** `.rt-*` is the app-owned composition prefix; each vertical also owns its own. */
function appPrefixes(slugs) {
  return ['rt', ...slugs];
}

/**
 * Application and framework selector tokens named by one selector, as the
 * canonical strings used in the grandfather inventory.
 */
export function selectorTokens(selector, { slugs = [], frameworkClasses = new Set() } = {}) {
  const prefixes = appPrefixes(slugs);
  const app = [];
  const engine = [];
  for (const [, className] of selector.matchAll(CLASS_TOKEN)) {
    if (prefixes.some((prefix) => className.startsWith(`${prefix}-`))) app.push(`.${className}`);
    else if (className.startsWith('ant-')) engine.push(`.${className}`);
    else if (frameworkClasses.has(className)) engine.push(`.${className}`);
  }
  for (const [, attribute] of selector.matchAll(ATTR_TOKEN)) {
    if (prefixes.some((prefix) => attribute.startsWith(`data-${prefix}-`))) app.push(`[${attribute}]`);
  }
  return { app, engine };
}

// ── paint literals ──────────────────────────────────────

// A literal is a value the BrandTheme could have owned but did not. Keywords
// (`transparent`, `currentColor`, `none`) name no value, and `color-mix()` is a
// derivation over channels rather than a literal, so neither is counted.
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/g;
const SPACING_LITERAL = /(?<![\w.#-])\d*\.?\d+(?:px|rem|em)\b/g;
const MOTION_LITERAL =
  /(?<![\w.#-])\d*\.?\d+m?s\b|\b(?:cubic-bezier|steps)\s*\(|\b(?:ease-in-out|ease-in|ease-out|ease|linear)\b/g;

/** Count color / spacing / motion literals in one declaration value. */
export function countLiterals(value) {
  return {
    color: [...value.matchAll(COLOR_LITERAL)].length,
    spacing: [...value.matchAll(SPACING_LITERAL)].length,
    motion: [...value.matchAll(MOTION_LITERAL)].length,
  };
}

// ── header parsing ──────────────────────────────────────

/**
 * Parse one `@ds-exception` header. Returns `{ ok: false, problems }` rather
 * than throwing: a malformed header is a gate finding, not a crash.
 */
export function parseExceptionHeader(text) {
  const body = text.slice(text.indexOf(HEADER_MARKER) + HEADER_MARKER.length);
  const fields = {};
  const pattern = /([a-z-]+)=(?:"([^"]*)"|([^\s"]+))/g;
  let match;
  while ((match = pattern.exec(body)) !== null) {
    fields[match[1]] = match[2] ?? match[3];
  }

  const problems = [];
  if (!fields.kind) problems.push('missing kind=');
  else if (!EXCEPTION_KINDS.includes(fields.kind)) problems.push(`unknown kind=${fields.kind}`);
  if (!fields.owner?.trim()) problems.push('missing owner=');
  if (!fields.purpose) problems.push('missing purpose="…"');
  if (!fields.reachability) problems.push('missing reachability=');
  else if (!REACHABILITY_VALUES.includes(fields.reachability)) {
    problems.push(`unknown reachability=${fields.reachability}`);
  }
  // L-F: an exception with no retirement condition is a permanent exception.
  if (fields.kind === 'capability-gap' && !fields.retire?.trim()) {
    problems.push('capability-gap must carry retire="…" (decrease-only ratchet)');
  }
  return { ok: problems.length === 0, fields, problems };
}

// ── artifact reading ────────────────────────────────────

const COMPILED_BLOCK_MARKER = 'Compiled from BrandTheme via compileBrandTheme';

/**
 * The channels the compiler emitted, read from the artifact's compiled block,
 * plus the `color-scheme` it declared (which names the vertical's default mode).
 */
export function readCompiledBlock(css) {
  const root = postcss.parse(css);
  const channels = new Set();
  let defaultMode = null;
  let seenMarker = false;
  root.walkComments((comment) => {
    if (comment.text.includes(COMPILED_BLOCK_MARKER)) seenMarker = true;
  });
  if (!seenMarker) return { channels, defaultMode, found: false };

  let inCompiledBlock = false;
  root.each((node) => {
    if (node.type === 'comment') {
      inCompiledBlock = node.text.includes(COMPILED_BLOCK_MARKER);
      return;
    }
    if (!inCompiledBlock || node.type !== 'rule') return;
    for (const decl of node.nodes ?? []) {
      if (decl.type !== 'decl') continue;
      if (decl.prop === 'color-scheme') defaultMode = decl.value.trim();
      else channels.add(decl.prop);
    }
    inCompiledBlock = false;
  });
  return { channels, defaultMode, found: true };
}

/**
 * A region's grandfather id. Ordinals are dense within a (kind, purpose)
 * family, which gives the identity the only property that matters here:
 * draining regions can only shrink the id set (still a subset of the
 * inventory, so still green), while adding one always mints an id nobody
 * baselined (red). Editing a region's body never changes its id; changing its
 * purpose mints a new family, which is also a new exception.
 */
function regionKey(header, counters) {
  const kind = header.fields.kind ?? 'malformed';
  const purpose = header.fields.purpose ?? '';
  const family = `${kind}#${createHash('sha1').update(purpose).digest('hex').slice(0, 8)}`;
  const ordinal = (counters.get(family) ?? 0) + 1;
  counters.set(family, ordinal);
  return `${family}#${ordinal}`;
}

/** Split an extension stylesheet into header-introduced regions. */
export function readExtensionRegions(css, file = 'extension.css') {
  const root = postcss.parse(css, { from: file });
  const regions = [];
  const orphans = [];
  const counters = new Map();
  root.each((node) => {
    if (node.type === 'comment' && node.text.includes(HEADER_MARKER)) {
      const header = parseExceptionHeader(node.text);
      regions.push({
        header,
        key: regionKey(header, counters),
        line: node.source?.start?.line ?? 0,
        nodes: [],
      });
      return;
    }
    if (node.type === 'comment') return;
    if (regions.length === 0) orphans.push(node);
    else regions.at(-1).nodes.push(node);
  });
  return { regions, orphans };
}

// ── metrics ─────────────────────────────────────────────

function emptyMetrics() {
  return {
    regions: 0,
    bytes: 0,
    lines: 0,
    rules: 0,
    declarations: 0,
    important: 0,
    literals: 0,
    colorLiterals: 0,
    spacingLiterals: 0,
    motionLiterals: 0,
    customProperties: 0,
    compiledRedeclarations: 0,
    rootArms: 0,
    descendantArms: 0,
    appSelectors: 0,
    engineSelectors: 0,
  };
}

function addMetrics(target, source) {
  for (const key of Object.keys(target)) target[key] += source[key] ?? 0;
  return target;
}

/** Visit every rule reachable from a top-level region node, at-rules included. */
function eachRule(node, visit) {
  if (node.type === 'rule') visit(node);
  for (const child of node.nodes ?? []) {
    if (child.type === 'rule' || child.type === 'atrule') eachRule(child, visit);
  }
}

// ── evaluation ──────────────────────────────────────────

/**
 * Evaluate one vertical.
 *
 * `capabilityGaps` counts every base-state declaration of a compiler-emitted
 * channel that survives inside a `capability-gap` region. `metrics` carries the
 * ratcheted volume. `observed` is the shape inventory the laws compare against
 * the grandfather list, and is what `--seed` writes back.
 */
export function evaluateVertical({
  slug,
  artifactCss,
  extensionCss,
  slugs = [slug],
  grandfather = {},
  frameworkClasses = new Set(),
}) {
  const violations = [];
  const lawFindings = [];
  const observed = {
    componentLocalRegions: [],
    appSelectorTokens: new Set(),
    engineSelectorTokens: new Set(),
    importantBySelector: new Map(),
    mediaDescendantSelectors: new Set(),
    structuralPaintSelectors: new Set(),
    capabilityGapRegionSizes: new Map(),
    capabilityGapChannels: new Set(),
    capabilityGapRawSelectors: new Set(),
  };
  const metrics = { total: emptyMetrics(), byKind: {} };
  metrics.total.bytes = Buffer.byteLength(extensionCss);

  const allowedComponentLocal = new Set(grandfather.componentLocalRegions ?? []);
  const allowedApp = new Set(grandfather.appSelectorTokens ?? []);
  const allowedEngine = new Set(grandfather.engineSelectorTokens ?? []);
  const allowedImportant = new Map(Object.entries(grandfather.importantBySelector ?? {}));
  const allowedMediaDescendant = new Set(grandfather.mediaDescendantSelectors ?? []);
  const allowedStructuralPaint = new Set(grandfather.structuralPaintSelectors ?? []);
  const allowedGapSizes = new Map(Object.entries(grandfather.capabilityGapRegionSizes ?? {}));
  const allowedGapChannels = new Set(grandfather.capabilityGapChannels ?? []);
  const allowedGapRaw = new Set(grandfather.capabilityGapRawSelectors ?? []);

  const { channels, defaultMode, found } = readCompiledBlock(artifactCss);
  if (!found) {
    violations.push({
      slug,
      line: 0,
      check: 'provenance',
      message: 'artifact has no compiled BrandTheme block',
    });
    return { slug, violations, lawFindings, capabilityGaps: 0, defaultMode: null, regions: 0, metrics, observed };
  }

  const { regions, orphans } = readExtensionRegions(extensionCss, `${slug}/_source/extension.css`);
  for (const node of orphans) {
    violations.push({
      slug,
      line: node.source?.start?.line ?? 0,
      check: 'provenance',
      message: `${node.type === 'rule' ? node.selector : `@${node.name}`} is not covered by an @ds-exception header`,
    });
  }

  let capabilityGaps = 0;
  for (const region of regions) {
    const { header } = region;
    if (!header.ok) {
      for (const problem of header.problems) {
        violations.push({
          slug,
          line: region.line,
          check: 'header',
          message: `malformed @ds-exception header: ${problem}`,
        });
      }
      continue;
    }
    const { kind } = header.fields;
    const kindMetrics = (metrics.byKind[kind] ??= emptyMetrics());
    kindMetrics.regions += 1;

    // L-A. A static theme artifact has no component-local authority at all;
    // the ones that exist are a drain backlog, not a shape to extend.
    if (kind === 'component-local') {
      observed.componentLocalRegions.push(region.key);
      if (!allowedComponentLocal.has(region.key)) {
        lawFindings.push({
          slug,
          line: region.line,
          check: 'law:component-local',
          message:
            `NEW kind=component-local region ${region.key}: component paint does not belong in a static ` +
            'theme artifact (Modern owns generic paint, app-bithire owns composition)',
        });
      }
    }

    let regionDeclarations = 0;
    for (const node of region.nodes) {
      const line = node.source?.start?.line ?? 0;
      kindMetrics.bytes += Buffer.byteLength(String(node));
      kindMetrics.lines += String(node).split('\n').length;

      if (node.type === 'atrule' && kind !== 'media' && kind !== 'reduced-motion' && kind !== 'structural') {
        violations.push({
          slug,
          line,
          check: 'provenance',
          message: `@${node.name} declared under kind=${kind}`,
        });
        continue;
      }

      eachRule(node, (rule) => {
        const ruleLine = rule.source?.start?.line ?? line;
        const isKeyframeStep = insideKeyframes(rule);
        kindMetrics.rules += 1;

        let importantHere = 0;
        let customProperties = 0;
        for (const decl of rule.nodes ?? []) {
          if (decl.type !== 'decl') continue;
          kindMetrics.declarations += 1;
          regionDeclarations += 1;
          if (decl.important) {
            kindMetrics.important += 1;
            importantHere += 1;
          }
          if (decl.prop.startsWith('--')) {
            kindMetrics.customProperties += 1;
            customProperties += 1;
          }
          if (channels.has(decl.prop)) kindMetrics.compiledRedeclarations += 1;
          const literals = countLiterals(decl.value);
          kindMetrics.colorLiterals += literals.color;
          kindMetrics.spacingLiterals += literals.spacing;
          kindMetrics.motionLiterals += literals.motion;
          kindMetrics.literals += literals.color + literals.spacing + literals.motion;
        }

        if (isKeyframeStep) return;

        const normalized = normalizeSelector(rule.selector);
        const arms = splitArms(rule.selector);
        const descendantArms = arms.filter((arm) => armIsDescendant(arm));
        kindMetrics.descendantArms += descendantArms.length;
        kindMetrics.rootArms += arms.length - descendantArms.length;

        // L-B. New product/framework vocabulary is a new UI system, whatever
        // the volume budget says.
        const tokens = selectorTokens(rule.selector, { slugs, frameworkClasses });
        kindMetrics.appSelectors += tokens.app.length;
        kindMetrics.engineSelectors += tokens.engine.length;
        // Occurrences feed the ratchet; the law is about vocabulary, so a
        // selector naming the same token in three arms is one finding.
        for (const token of new Set(tokens.app)) {
          observed.appSelectorTokens.add(token);
          if (!allowedApp.has(token)) {
            lawFindings.push({
              slug,
              line: ruleLine,
              check: 'law:app-selector',
              message: `NEW application selector token ${token}: product composition belongs in the app, not in a theme artifact`,
            });
          }
        }
        for (const token of new Set(tokens.engine)) {
          observed.engineSelectorTokens.add(token);
          if (!allowedEngine.has(token)) {
            lawFindings.push({
              slug,
              line: ruleLine,
              check: 'law:engine-selector',
              message: `NEW framework/engine selector token ${token}: engine internals are not a theme channel`,
            });
          }
        }

        // L-C. Counted per selector so a drain elsewhere cannot fund a new one.
        if (importantHere > 0) {
          observed.importantBySelector.set(
            normalized,
            (observed.importantBySelector.get(normalized) ?? 0) + importantHere
          );
          const allowance = Number(allowedImportant.get(normalized) ?? 0);
          const running = observed.importantBySelector.get(normalized);
          if (running > allowance) {
            lawFindings.push({
              slug,
              line: ruleLine,
              check: 'law:important',
              message:
                `NEW !important (${running} > ${allowance} grandfathered) on ${normalized.slice(0, 90)}` +
                `${normalized.length > 90 ? '…' : ''}: a theme channel never needs to out-rank the engine`,
            });
          }
        }

        // L-D. A media query gates WHEN a rule applies, not WHAT it may own.
        if (kind === 'media' || kind === 'reduced-motion') {
          const paintsDescendants = descendantArms.length > 0;
          const nonCustom = (rule.nodes ?? []).some(
            (decl) => decl.type === 'decl' && !decl.prop.startsWith('--')
          );
          if (paintsDescendants || nonCustom) {
            observed.mediaDescendantSelectors.add(normalized);
            if (!allowedMediaDescendant.has(normalized)) {
              lawFindings.push({
                slug,
                line: ruleLine,
                check: 'law:media-scope',
                message:
                  `kind=${kind} may only declare semantic root channels; ${normalized.slice(0, 90)}` +
                  `${normalized.length > 90 ? '…' : ''} is a descendant skin`,
              });
            }
          }
        }

        // L-I. A capability gap is a missing typed CHANNEL. A real CSS property
        // in that region is authorship the contract was never asked about, and
        // no channel name can ever retire it.
        if (kind === 'capability-gap') {
          const rawProps = (rule.nodes ?? [])
            .filter((decl) => decl.type === 'decl' && !decl.prop.startsWith('--'))
            .map((decl) => decl.prop);
          if (rawProps.length > 0) {
            observed.capabilityGapRawSelectors.add(normalized);
            if (!allowedGapRaw.has(normalized)) {
              lawFindings.push({
                slug,
                line: ruleLine,
                check: 'law:capability-gap-raw-css',
                message:
                  `kind=capability-gap declares real CSS (${[...new Set(rawProps)].slice(0, 4).join(', ')}) on ` +
                  `${normalized.slice(0, 90)}${normalized.length > 90 ? '…' : ''}: a gap is a missing channel, not a CSS bag`,
              });
            }
          }
        }

        // L-E. `structural` covers keyframes, pseudo-elements and focus order --
        // not a component skin that happens to declare no custom property.
        if (kind === 'structural' && customProperties === 0 && descendantArms.length > 0) {
          observed.structuralPaintSelectors.add(normalized);
          if (!allowedStructuralPaint.has(normalized)) {
            lawFindings.push({
              slug,
              line: ruleLine,
              check: 'law:structural-paint',
              message:
                `kind=structural carries component paint on ${normalized.slice(0, 90)}` +
                `${normalized.length > 90 ? '…' : ''}: no custom property, descendant scope`,
            });
          }
        }
      });

      if (node.type !== 'rule') continue;

      const authorsDefault = ruleAuthorsRootInMode(node, 'default');
      const nonDefaultMode = defaultMode === 'dark' ? 'light' : 'dark';

      if (kind === 'component-local' && splitArms(node.selector).some((arm) => !armIsDescendant(arm))) {
        violations.push({
          slug,
          line,
          check: 'provenance',
          message: `kind=component-local but ${node.selector} matches the tenant root`,
        });
        continue;
      }

      if (kind === 'mode-block') {
        // The compiler owns the default mode. A mode block that also matches it
        // is the exact shape that silently shadows the compiled block.
        if (authorsDefault) {
          violations.push({
            slug,
            line,
            check: 'provenance',
            message: `kind=mode-block also matches the DEFAULT mode (${defaultMode}); the compiler owns that state`,
          });
          continue;
        }
        if (!ruleAuthorsRootInMode(node, nonDefaultMode)) {
          violations.push({
            slug,
            line,
            check: 'provenance',
            message: `kind=mode-block matches neither ${nonDefaultMode} nor the root`,
          });
        }
        continue;
      }

      if (!authorsDefault) continue;

      const emitted = (node.nodes ?? []).filter(
        (decl) => decl.type === 'decl' && channels.has(decl.prop)
      );
      if (emitted.length === 0) continue;

      if (kind === 'capability-gap') {
        capabilityGaps += emitted.length;
        // L-H. Keyed by channel NAME: a count alone lets a drained channel fund
        // a newly re-declared one at a constant total.
        for (const decl of emitted) {
          observed.capabilityGapChannels.add(decl.prop);
          if (!allowedGapChannels.has(decl.prop)) {
            lawFindings.push({
              slug,
              line: decl.source?.start?.line ?? line,
              check: 'law:redeclared-emitted-channel',
              message:
                `NEW re-declaration of compiler-emitted channel ${decl.prop}: the BrandTheme already ` +
                'authors it, so the extension value is the one that reaches the pixel',
            });
          }
        }
        continue;
      }
      for (const decl of emitted) {
        violations.push({
          slug,
          line: decl.source?.start?.line ?? line,
          check: 'provenance',
          message: `${decl.prop} re-declares a compiler-emitted channel in the default state under kind=${kind}`,
        });
      }
    }

    // L-G. One header may not legalize a palette. A region over budget today is
    // grandfathered at its current size and may only shrink; splitting it into
    // atomic gaps is always green because each part is a new, smaller region.
    if (kind === 'capability-gap') {
      observed.capabilityGapRegionSizes.set(region.key, regionDeclarations);
      const ceiling = Math.max(
        CAPABILITY_GAP_REGION_BUDGET,
        Number(allowedGapSizes.get(region.key) ?? 0)
      );
      if (regionDeclarations > ceiling) {
        lawFindings.push({
          slug,
          line: region.line,
          check: 'law:capability-gap-budget',
          message:
            `capability-gap region ${region.key} declares ${regionDeclarations} channels ` +
            `(budget ${CAPABILITY_GAP_REGION_BUDGET}${
              allowedGapSizes.has(region.key) ? `, grandfathered ${allowedGapSizes.get(region.key)}` : ''
            }): a contract gap is a handful of channels, not a theme`,
        });
      }
    }
  }

  for (const kindMetrics of Object.values(metrics.byKind)) addMetrics(metrics.total, kindMetrics);
  metrics.total.bytes = Buffer.byteLength(extensionCss);
  metrics.total.lines = extensionCss.split('\n').length;

  return {
    slug,
    violations,
    lawFindings,
    capabilityGaps,
    defaultMode,
    regions: regions.length,
    metrics,
    observed,
  };
}

/** Every artifact slug that has both a generated artifact and a declared extension. */
export function discoverSlugs(artifactsRoot) {
  if (!existsSync(artifactsRoot)) return [];
  return readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter(
      (slug) =>
        existsSync(join(artifactsRoot, slug, 'index.css')) &&
        existsSync(join(artifactsRoot, slug, '_source/extension.css'))
    )
    .sort();
}

/** The grandfather inventory of one result, in the shape the baseline stores. */
export function inventoryOf(result) {
  return {
    componentLocalRegions: [...result.observed.componentLocalRegions].sort((a, b) =>
      a.localeCompare(b, 'en', { numeric: true })
    ),
    appSelectorTokens: [...result.observed.appSelectorTokens].sort(),
    engineSelectorTokens: [...result.observed.engineSelectorTokens].sort(),
    importantBySelector: Object.fromEntries(
      [...result.observed.importantBySelector.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
    ),
    mediaDescendantSelectors: [...result.observed.mediaDescendantSelectors].sort(),
    structuralPaintSelectors: [...result.observed.structuralPaintSelectors].sort(),
    capabilityGapRegionSizes: Object.fromEntries(
      [...result.observed.capabilityGapRegionSizes.entries()]
        .filter(([, size]) => size > CAPABILITY_GAP_REGION_BUDGET)
        .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    ),
    capabilityGapChannels: [...result.observed.capabilityGapChannels].sort(),
    capabilityGapRawSelectors: [...result.observed.capabilityGapRawSelectors].sort(),
  };
}

/** How many grandfathered debt items one result still carries. */
export function outstandingDebt(result) {
  const inventory = inventoryOf(result);
  return (
    result.capabilityGaps +
    inventory.componentLocalRegions.length +
    inventory.appSelectorTokens.length +
    inventory.engineSelectorTokens.length +
    Object.values(inventory.importantBySelector).reduce((sum, n) => sum + n, 0) +
    inventory.mediaDescendantSelectors.length +
    inventory.structuralPaintSelectors.length +
    inventory.capabilityGapRawSelectors.length +
    // Over-budget gap regions are debt in their own right; the channels inside
    // them are already counted by `capabilityGaps`, so only the regions count.
    Object.keys(inventory.capabilityGapRegionSizes).length
  );
}

export function run({ artifactsRoot = ARTIFACTS_ROOT, baseline = {}, frameworkClasses } = {}) {
  const slugs = discoverSlugs(artifactsRoot);
  const vocabulary = frameworkClasses ?? loadFrameworkClasses();
  const results = [];
  for (const slug of slugs) {
    results.push(
      evaluateVertical({
        slug,
        slugs,
        grandfather: baseline.grandfather?.[slug] ?? {},
        frameworkClasses: vocabulary,
        artifactCss: readFileSync(join(artifactsRoot, slug, 'index.css'), 'utf-8'),
        extensionCss: readFileSync(join(artifactsRoot, slug, '_source/extension.css'), 'utf-8'),
      })
    );
  }

  const growth = [];
  for (const result of results) {
    const allowed = baseline.capabilityGaps?.[result.slug];
    if (allowed == null) {
      growth.push({
        slug: result.slug,
        check: 'ratchet:capabilityGaps',
        message: `${result.slug}: ${result.capabilityGaps} capability-gap declaration(s) with no baseline entry`,
      });
    } else if (result.capabilityGaps > allowed) {
      growth.push({
        slug: result.slug,
        check: 'ratchet:capabilityGaps',
        message: `${result.slug}: ${result.capabilityGaps} capability-gap declaration(s), baseline allows ${allowed} (decrease-only)`,
      });
    }

    const budget = baseline.metrics?.[result.slug];
    if (!budget) {
      growth.push({
        slug: result.slug,
        check: 'ratchet:metrics',
        message: `${result.slug}: no metric budget in the baseline; run --seed`,
      });
      continue;
    }
    for (const metric of RATCHETED_METRICS) {
      const cap = budget[metric];
      const actual = result.metrics.total[metric];
      if (cap == null) {
        growth.push({
          slug: result.slug,
          check: `ratchet:${metric}`,
          message: `${result.slug}: ${metric} has no baseline entry; run --seed`,
        });
      } else if (actual > cap) {
        growth.push({
          slug: result.slug,
          check: `ratchet:${metric}`,
          message: `${result.slug}: ${metric} grew to ${actual}, baseline allows ${cap} (decrease-only)`,
        });
      }
    }
  }
  return { results, growth };
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return { capabilityGaps: {}, metrics: {}, grandfather: {} };
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
}

/** The baseline document `--seed` writes, exported so drills can seed fixtures. */
export function buildBaseline(results) {
  return {
    note:
      'Decrease-only. `capabilityGaps` and `metrics` are volume budgets; `grandfather` is the ' +
      'shape inventory the architecture laws (component-local regions, application/framework ' +
      'selector tokens, !important, media descendant skins, structural component paint, ' +
      'over-budget capability-gap regions, re-declared compiler-emitted channels, capability-gap ' +
      'raw CSS) are ' +
      'allowed to still see on this tree. Both shrink as the extensions drain; neither may grow. ' +
      'Re-seed only with a written exception -- `--seed` refuses growth without --allow-growth.',
    capabilityGaps: Object.fromEntries(results.map((r) => [r.slug, r.capabilityGaps])),
    metrics: Object.fromEntries(
      results.map((r) => [
        r.slug,
        Object.fromEntries(RATCHETED_METRICS.map((metric) => [metric, r.metrics.total[metric]])),
      ])
    ),
    grandfather: Object.fromEntries(results.map((r) => [r.slug, inventoryOf(r)])),
  };
}

// ── report ──────────────────────────────────────────────

const REPORT_COLUMNS = [
  ['regions', 'reg'],
  ['rules', 'rules'],
  ['declarations', 'decls'],
  ['important', '!imp'],
  ['colorLiterals', 'color'],
  ['spacingLiterals', 'space'],
  ['motionLiterals', 'motion'],
  ['customProperties', 'custom'],
  ['compiledRedeclarations', 'redecl'],
  ['rootArms', 'root'],
  ['descendantArms', 'desc'],
  ['appSelectors', 'app'],
  ['engineSelectors', 'engine'],
  ['lines', 'lines'],
  ['bytes', 'bytes'],
];

function printMetrics(result) {
  const header = ['kind'.padEnd(16), ...REPORT_COLUMNS.map(([, label]) => label.padStart(7))].join(' ');
  console.log(`  ${header}`);
  const rows = EXCEPTION_KINDS.filter((kind) => result.metrics.byKind[kind]).map((kind) => [
    kind,
    result.metrics.byKind[kind],
  ]);
  for (const [kind, metrics] of rows) {
    console.log(
      `  ${kind.padEnd(16)}${REPORT_COLUMNS.map(([key]) => String(metrics[key] ?? 0).padStart(8)).join('')}`
    );
  }
  console.log(
    `  ${'TOTAL'.padEnd(16)}${REPORT_COLUMNS.map(([key]) => String(result.metrics.total[key] ?? 0).padStart(8)).join('')}`
  );
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const check = process.argv.includes('--check');
  const seed = process.argv.includes('--seed');
  const quiet = process.argv.includes('--quiet');
  const existing = loadBaseline();
  const { results, growth } = run({ baseline: seed ? {} : existing });

  if (seed) {
    const next = buildBaseline(results);
    const grew = [];
    for (const result of results) {
      for (const metric of RATCHETED_METRICS) {
        const before = existing.metrics?.[result.slug]?.[metric];
        const after = next.metrics[result.slug][metric];
        if (before != null && after > before) grew.push(`${result.slug}.${metric}: ${before} → ${after}`);
      }
      const beforeGaps = existing.capabilityGaps?.[result.slug];
      const afterGaps = next.capabilityGaps[result.slug];
      if (beforeGaps != null && afterGaps > beforeGaps) {
        grew.push(`${result.slug}.capabilityGaps: ${beforeGaps} → ${afterGaps}`);
      }
    }
    if (grew.length > 0 && !process.argv.includes('--allow-growth')) {
      console.error('✗ --seed would RAISE a decrease-only budget:');
      for (const line of grew) console.error(`    ${line}`);
      console.error('\nDrain the debt, or re-run with --allow-growth and a written exception.');
      process.exit(1);
    }
    writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`Seeded ${BASELINE_PATH}`);
    process.exit(0);
  }

  let findings = 0;
  let debt = 0;
  for (const result of results) {
    const failures = [...result.violations, ...result.lawFindings];
    findings += failures.length;
    debt += outstandingDebt(result);
    const status = failures.length === 0 ? '✓' : '✗';
    const inventory = inventoryOf(result);
    console.log(
      `${status} ${result.slug}: ${result.regions} declared region(s), default mode ${
        result.defaultMode ?? 'undeclared'
      }, ${result.capabilityGaps} capability-gap declaration(s)`
    );
    if (!quiet) {
      printMetrics(result);
      console.log(
        `  grandfathered: ${inventory.componentLocalRegions.length} component-local region(s), ` +
          `${inventory.appSelectorTokens.length} app selector token(s), ` +
          `${inventory.engineSelectorTokens.length} framework selector token(s), ` +
          `${Object.keys(inventory.importantBySelector).length} selector(s) carrying !important, ` +
          `${inventory.mediaDescendantSelectors.length} media descendant skin(s), ` +
          `${inventory.structuralPaintSelectors.length} structural paint rule(s)`
      );
      const oversized = Object.entries(inventory.capabilityGapRegionSizes);
      console.log(
        `  gap debt: ${oversized.length} region(s) over the ${CAPABILITY_GAP_REGION_BUDGET}-channel budget` +
          `${oversized.length > 0 ? ` [${oversized.map(([, size]) => size).join(', ')}]` : ''}, ` +
          `${inventory.capabilityGapChannels.length} re-declared compiler channel(s), ` +
          `${inventory.capabilityGapRawSelectors.length} raw-CSS selector(s)`
      );
      if (inventory.componentLocalRegions.length > 0) {
        console.log(`  component-local drain backlog: ${inventory.componentLocalRegions.join(', ')}`);
      }
    }
    for (const failure of failures) {
      console.error(`    ${result.slug}/_source/extension.css:${failure.line} — [${failure.check}] ${failure.message}`);
    }
  }
  for (const breach of growth) console.error(`✗ [${breach.check}] ${breach.message}`);

  if (findings === 0 && growth.length === 0) {
    console.log(`\n✓ no debt growth (baseline: ${debt} items outstanding)`);
  }

  if (check && (findings > 0 || growth.length > 0)) {
    console.error(`\n${findings} extension finding(s), ${growth.length} ratchet breach(es).`);
    process.exit(1);
  }
}
