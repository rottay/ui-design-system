#!/usr/bin/env node
/**
 * channel-liveness-gate — the canonical PRODUCER for the generated-only
 * WO-CRA-23 evidence artifact `channel-liveness.json`.
 *
 * `evidence-contract.json` names this file twice: it is pre-declared
 * vocabulary in `roundLayout` (the union of allowed round artifacts) and it
 * is listed in `generatedOnly` (machine-produced, never hand-edited). The
 * modern-rescue canon (`README.md`, execution gate 5) reads "complete
 * control/family edges, recipe groups and CHANNEL LIVENESS" — this file is
 * the CHANNEL LIVENESS instrument for that gate. R7 stays disabled
 * (`program.json#r7Enabled === false`); this producer runs under R0-R6 only
 * and never touches `program.json`.
 *
 * ============================================================================
 * WHAT THIS IS NOT (three existing instruments already own adjacent ground)
 * ============================================================================
 *
 * NOT `customization-surface-census.mjs` (the dead-writer census over the
 * whole ~7,454-name `--ds-*` universe). This producer's universe is far
 * narrower and NAMED: only channels declared by the tenant-theme contract
 * (`TENANT_THEME_OVERRIDE_TOKENS`, `TENANT_THEME_REFERENCE_TOKENS`) or
 * emitted by the brand-theme compiler.
 *
 * NOT `tenant-channel-consumer-gate.mjs` (the decrease-only dead-channel
 * ratchet with two `dist`-sourced baselines). This producer reads SOURCE
 * only (see "WHY SOURCE, NEVER DIST" below) and additionally covers
 * `TENANT_THEME_REFERENCE_TOKENS`, which that gate does not read at all.
 *
 * NOT `theme-channel-parity-gate.mjs` (the typed declared/emitted/consumed/
 * owned graph with its own decrease-only baseline file). This producer owns
 * no baseline file of its own (see "WHY NO BASELINE FILE").
 *
 * ============================================================================
 * WHY SOURCE, NEVER DIST, FOR THE BRAND-THEME COMPILER
 * ============================================================================
 *
 * `theme-channel-parity-gate.baseline.json`'s own `_adoptions` note
 * (`lane-a-tint-enumerability-2026-08-10`) records that `dist` was caught
 * carrying a STALE, pre-rewrite copy of the tint emitter while `src` had
 * already moved on — "the artifacts were never produced by the emitter this
 * change rewrites." Every extraction in this file reads `.ts` SOURCE text
 * directly and never imports `dist`, so `--check` never requires a fresh
 * build.
 *
 * ============================================================================
 * THE CORE CORRECTION (this revision): READ IS NOT PAINT
 * ============================================================================
 *
 * A prior revision of this file conflated "a `var(--ds-x)` occurrence exists
 * somewhere in authored CSS" with "this channel paints pixels." Three
 * independent auditors plus two model reviews (Kimi, Fable) found that
 * conflation, plus six more defects, all reproduced against this exact file.
 * This revision is a structural rewrite against that defect list:
 *
 *   1. READ vs PAINT is now a real PostCSS-based graph:
 *      `channel -> zero or more private custom properties -> a terminal
 *      NON-custom CSS property`. `buildPaintGraph` builds directed edges
 *      (`referenced-name -> declaring-custom-prop-name` for custom-property
 *      targets, `referenced-name -> {file,line,prop}` for terminal
 *      declaration targets) across the WHOLE corpus; `computePaint` runs a
 *      cycle-safe (visited-set) BFS from a channel name and only reports
 *      PAINT when a FINITE path reaches a terminal edge. A raw TS/TSX
 *      `var(--ds-x)` occurrence is never a graph node — it is always
 *      `READ_UNPROVEN`, never PAINT. Comments never count because only
 *      `postcss`-parsed `decl.value` text is scanned (never raw text).
 *   2. The R1 evidence artifact is mandatory under `--check`: missing,
 *      corrupt, or stale (source digest mismatch) all fail closed. `--write`
 *      refuses when the pure analysis is red (`failures.length > 0`) or
 *      limited (`analysisLimitations.length > 0`) — it never writes a
 *      document that asserts something the analysis itself could not prove.
 *      `ci-gates.manifest.mjs` wires only `--check` into CI, never `--write`.
 *   3. `TENANT_THEME_REFERENCE_TOKENS` membership proves AUTHORABILITY, not
 *      liveness: a channel declared there with no proven terminal (in-repo
 *      or external) classifies `AUTHORABLE_UNPROVEN_EFFECT`, and — like
 *      every other non-LIVE classification — is a standing NO-GO row (see
 *      point 8), not a protected bucket.
 *   4. `attributeFamily` returns the FULL `Set<canonicalId>` for a
 *      `sourceOwner` shared by more than one family row (never the first
 *      row); a read site landing on a shared owner is tallied
 *      `unattributedSharedReadSites`, distinct from a clean single-owner
 *      resolution. `classifySemanticOwner` returns `null` for an unmatched
 *      `--ds-*` prefix — there is no truthy `'other'` escape hatch — and a
 *      `null` owner trips the same `unclassified output` failure as a
 *      missing classification.
 *   5. Any repeated tint-ramp scale registration, any repeated direct
 *      `vars["--ds-x"] = ...` assignment, and any name emitted by BOTH the
 *      tint ramp AND a direct literal assignment are failures. Unresolved
 *      `TENANT_THEME_OVERRIDE_TOKENS`/`TENANT_THEME_REFERENCE_TOKENS` spread
 *      elements, and any `vars[\`...\`]` interpolated-template assignment in
 *      the brand-theme compiler this producer cannot resolve to concrete
 *      names (every one except the modeled tint-ramp `${scale}-N` pattern),
 *      are failures too — the corpus is never silently shrunk to dodge them.
 *   6. The source digest covers: this gate script's own source, the WO-CRA-23
 *      evidence contract (the closest thing this tree has to a schema for
 *      the artifact), `ci-gates.manifest.mjs` and `package.json` (the
 *      wiring), the tenant-theme contract, the brand-theme compiler, the
 *      family inventory, the DS corpus, AND every consumer root's corpus.
 *   7. `app-bithire` is a required, read-only, source-bound `consumerRoot`
 *      (see `DEFAULT_CONSUMER_ROOTS`). It gets the SAME PostCSS paint-graph
 *      treatment as the DS's own corpus, so a real external terminal chain
 *      (e.g. `--ds-tint-4` feeding a sidebar/live-scoring/detail-header
 *      declaration) classifies `LIVE_EXTERNAL_CONSUMER_PAINTED` — discovered
 *      from the corpus, never a hardcoded count. A missing or unreadable
 *      consumerRoot is a hard failure. `compareAgainstPrevious` also flags a
 *      previously-LIVE channel that has fully disappeared from the current
 *      declared/emitted universe (`removed protected channel`), not only a
 *      live-to-unread transition of a channel that is still present.
 *   8. No classification is named "dead" (this stays a liveness LEDGER, not
 *      a retirement instrument — an unproven channel might have a real
 *      consumer this producer's corpus cannot see), but nothing is a
 *      protected bucket either: every non-LIVE classification
 *      (`READ_NO_PRODUCTIVE_TERMINAL`, `READ_UNPROVEN`,
 *      `AUTHORABLE_UNPROVEN_EFFECT`, `UNREAD_OVERRIDE_ONLY_NO_KNOWN_ROUTE`,
 *      `UNREAD_EMITTED_NO_KNOWN_ROUTE`) is a STANDING failure row, listed
 *      exactly, every run — not just on a live-to-unread regression. There
 *      is deliberately no baseline/allowlist file that could "accept" one of
 *      these rows into silence.
 *
 * ============================================================================
 * WHY NO BASELINE FILE
 * ============================================================================
 *
 * This script's owned paths are exactly itself, its test file, and two
 * append-only entries each in `ci-gates.manifest.mjs` and `package.json` — no
 * `.baseline.json` is part of that grant, and per point 8 above there is
 * nothing for a baseline to accept anyway. The PREVIOUSLY WRITTEN
 * `channel-liveness.json` (read back at its own evidence-root path, if one
 * exists) doubles as the regression-ratchet anchor for the next
 * regeneration; on a checkout with no prior artifact, the three
 * `compareAgainstPrevious` regression checks are vacuously satisfied (there
 * is nothing to regress against) but the STANDING per-row checks in point 8
 * still apply unconditionally.
 *
 * ============================================================================
 * Usage
 * ============================================================================
 *   node scripts/tokens/channel-liveness-gate/index.mjs                  # human report
 *   node scripts/tokens/channel-liveness-gate/index.mjs --check           # fail-closed CI gate (requires R1 artifact)
 *   node scripts/tokens/channel-liveness-gate/index.mjs --json             # full JSON report to stdout
 *   node scripts/tokens/channel-liveness-gate/index.mjs --write [--round R1] [--artifact-path <p>]
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../lib/repo-root/index.mjs';

const require = createRequire(import.meta.url);
const postcssModule = require('postcss');
const postcss = postcssModule.default ?? postcssModule;

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPTS_DIR = dirname(SCRIPT_PATH);

export const CORE_ROOT = findPackageRoot(SCRIPTS_DIR);
// The monorepo root is the parent of this repo root: it is where sibling
// repos such as `app-bithire` live, one level above `ui-design-system`.
export const REPO_ROOT = resolve(findRepoRoot(SCRIPTS_DIR), '..');
export const DEFAULT_TENANT_THEME_CONTRACT = resolve(
  CORE_ROOT,
  'src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts',
);
export const DEFAULT_BRAND_THEME_COMPILER = resolve(
  CORE_ROOT,
  'src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
);
export const DEFAULT_FAMILY_INVENTORY = resolve(
  CORE_ROOT,
  'scripts/quality-evidence/programs/modern-rescue/family-inventory.json',
);
export const DEFAULT_EVIDENCE_CONTRACT = resolve(
  CORE_ROOT,
  'scripts/quality-evidence/programs/modern-rescue/evidence-contract.json',
);
export const DEFAULT_CI_GATES_MANIFEST = resolve(CORE_ROOT, 'scripts/ci/gates-manifest/index.mjs');
export const DEFAULT_PACKAGE_JSON = resolve(CORE_ROOT, 'package.json');
export const DEFAULT_CSS_ROOTS = Object.freeze([
  resolve(CORE_ROOT, 'src/foundation/tokens/css'),
  resolve(CORE_ROOT, 'src/ui'),
]);
export const DEFAULT_EVIDENCE_ROOT = resolve(
  CORE_ROOT,
  'test-artifacts/quality-evidence/wo-cra-23',
);
export const ARTIFACT_FILE_NAME = 'channel-liveness.json';
export const DEFAULT_ROUND = 'R1';

/**
 * `app-bithire` — a sibling repo, NOT part of this package — is a required,
 * READ-ONLY, source-bound external consumer of the tenant-theme surface.
 * The reference audit that produced defect 7 found real terminal CSS for
 * `--ds-tint-4` / `--ds-tint-16` there (sidebar, live-scoring, detail
 * header) that no in-repo instrument can see. This producer never writes
 * under this root and never imports it as a module — it only walks its CSS
 * and TS/TSX source text with the exact same paint-graph machinery used for
 * the DS's own corpus.
 */
export const DEFAULT_CONSUMER_ROOTS = Object.freeze([
  Object.freeze({
    id: 'app-bithire',
    label: 'app-bithire (external consuming app; read-only, source-bound)',
    root: resolve(REPO_ROOT, 'app-bithire/src'),
    required: true,
  }),
]);

const ANY_VAR_REF_RE = /var\(\s*(--[a-zA-Z0-9_-]+)/g;

/* ---------------------------------------------------------------------- */
/* 1. Generic quote-aware, depth-tracked source-text parsing primitives   */
/* ---------------------------------------------------------------------- */

/**
 * Slice the balanced bracket block that starts at the LAST character of
 * `markerText` (which must itself end with `openChar`) and ends at its
 * matching `closeChar`, tracking nested brackets AND skipping the content of
 * any `'`/`"`/`` ` `` quoted span so a stray bracket character inside a
 * string can never desynchronize the depth count. Returns the slice
 * EXCLUDING the outer brackets, or `null` when the marker or a balanced
 * close cannot be found (fail soft — callers decide whether that is fatal).
 */
export function extractBracketBlock(sourceText, markerText, openChar = '[', closeChar = ']') {
  const markerIndex = sourceText.indexOf(markerText);
  if (markerIndex === -1) return null;
  const openIndex = markerIndex + markerText.length - 1;
  if (sourceText[openIndex] !== openChar) return null;
  let depth = 0;
  let quote = null;
  let index = openIndex;
  for (; index < sourceText.length; index += 1) {
    const ch = sourceText[index];
    if (quote) {
      if (ch === '\\') {
        index += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    const commentEnd = commentSpanEnd(sourceText, index);
    if (commentEnd !== -1) {
      index = commentEnd;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === openChar) depth += 1;
    else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return null;
  return sourceText.slice(openIndex + 1, index);
}

/**
 * If a comment starts at `index`, return the index of its LAST character;
 * otherwise `-1`.
 *
 * Both scanners below were quote-aware but not comment-aware, which is not a
 * cosmetic gap: an ordinary apostrophe in an ordinary sentence opens a phantom
 * quote span that runs until the next apostrophe anywhere in the file, and the
 * closing bracket disappears inside it. That is exactly how the real contract
 * broke — `TENANT_THEME_OVERRIDE_TOKENS` carries a `//` note containing
 * "A tenant's dark values", and `extractOverrideTokens` started reporting the
 * array literal as an unbalanced bracket block.
 *
 * A `/` that is not followed by `/` or `*` is left alone, so division and the
 * `--ds-*` names themselves are unaffected. An unterminated block comment
 * consumes to end-of-input, which keeps the caller's fail-soft `null` contract
 * rather than silently truncating the block.
 */
function commentSpanEnd(sourceText, index) {
  if (sourceText[index] !== '/') return -1;
  const next = sourceText[index + 1];
  if (next === '/') {
    const newline = sourceText.indexOf('\n', index + 2);
    return newline === -1 ? sourceText.length - 1 : newline - 1;
  }
  if (next === '*') {
    const close = sourceText.indexOf('*/', index + 2);
    return close === -1 ? sourceText.length - 1 : close + 1;
  }
  return -1;
}

/**
 * Split a comma-separated literal-array BODY (the content already sliced by
 * `extractBracketBlock`) into its top-level elements. `(`, `[`, `{` and
 * quoted spans (including backtick template literals, so a `${...}`
 * interpolation's own commas never split an element) are tracked so a
 * nested call such as `TENANT_THEME_COLOR_ROLES.flatMap((role) => ...)`
 * stays one element.
 */
export function splitTopLevelListItems(text) {
  const items = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (let index = 0; index < text.length; index += 1) {
    const ch = text[index];
    if (quote) {
      current += ch;
      if (ch === '\\') {
        current += text[index + 1] ?? '';
        index += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    // Comments are DROPPED, not carried into the item text: an item is later
    // matched for its quoted channel name, and a comment can contain both an
    // apostrophe and a comma, so keeping it would either desynchronize the
    // quote state or split one element into two.
    const commentEnd = commentSpanEnd(text, index);
    if (commentEnd !== -1) {
      index = commentEnd;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      depth += 1;
      current += ch;
      continue;
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      depth -= 1;
      current += ch;
      continue;
    }
    if (ch === ',' && depth === 0) {
      items.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim().length > 0) items.push(current.trim());
  return items.filter((item) => item.length > 0);
}

/** A flat `const NAME = [ "a", "b", 1, 2 ] as const;` literal array of strings/numbers. */
export function extractFlatLiteralArray(sourceText, marker) {
  const block = extractBracketBlock(sourceText, `${marker} = [`, '[', ']');
  if (block == null) return [];
  const values = [];
  const re = /"([^"]*)"|'([^']*)'|(-?\d+(?:\.\d+)?)/g;
  let match;
  while ((match = re.exec(block)) !== null) {
    values.push(match[1] ?? match[2] ?? match[3]);
  }
  return values;
}

function buildLineIndex(text) {
  const offsets = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') offsets.push(index + 1);
  }
  return offsets;
}

function lineForOffset(offsets, index) {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (offsets[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

/* ---------------------------------------------------------------------- */
/* 2. DECLARED — TENANT_THEME_OVERRIDE_TOKENS / TENANT_THEME_REFERENCE_TOKENS */
/* ---------------------------------------------------------------------- */

/**
 * Resolve `TENANT_THEME_OVERRIDE_TOKENS` in full, including its two
 * generated spreads (`TENANT_SEMANTIC_SURFACE_TOKENS`, `--ds-material-*`;
 * `TENANT_SEMANTIC_TYPOGRAPHY_TOKENS`, `--ds-type-*`), by resolving each
 * spread identifier against its own named role/facet arrays rather than a
 * hand-typed name list. Any spread this function does not recognize is
 * reported in `unresolvedSpreads` — the CALLER treats that as a hard
 * failure (see defect 5: "unresolved spreads ... must FAIL"), this
 * extraction function itself stays fail-soft so it is independently testable.
 */
export function extractOverrideTokens(sourceText) {
  const nameIndex = sourceText.indexOf('TENANT_THEME_OVERRIDE_TOKENS');
  if (nameIndex === -1) {
    throw new Error('TENANT_THEME_OVERRIDE_TOKENS not found in tenant-theme contract source');
  }
  const eqIndex = sourceText.indexOf('= [', nameIndex);
  const block = eqIndex === -1 ? null : extractBracketBlock(sourceText.slice(eqIndex), '= [', '[', ']');
  if (block == null) {
    throw new Error('TENANT_THEME_OVERRIDE_TOKENS array literal is not a balanced bracket block');
  }
  const names = new Set();
  const unresolvedSpreads = [];
  for (const item of splitTopLevelListItems(block)) {
    const literal = item.match(/^"(--ds-[a-z0-9-]+)"$/);
    if (literal) {
      names.add(literal[1]);
      continue;
    }
    const spread = item.match(/^\.\.\.([A-Za-z0-9_]+)$/);
    if (!spread) {
      unresolvedSpreads.push(item);
      continue;
    }
    if (spread[1] === 'TENANT_SEMANTIC_SURFACE_TOKENS') {
      const roles = extractFlatLiteralArray(sourceText, 'TENANT_SEMANTIC_SURFACE_ROLES');
      const facets = extractFlatLiteralArray(sourceText, 'TENANT_SEMANTIC_SURFACE_FACETS');
      for (const role of roles) for (const facet of facets) names.add(`--ds-material-${role}-${facet}`);
    } else if (spread[1] === 'TENANT_SEMANTIC_TYPOGRAPHY_TOKENS') {
      const roles = extractFlatLiteralArray(sourceText, 'TENANT_SEMANTIC_TYPOGRAPHY_ROLES');
      const facets = extractFlatLiteralArray(sourceText, 'TENANT_SEMANTIC_TYPOGRAPHY_FACETS');
      for (const role of roles) for (const facet of facets) names.add(`--ds-type-${role}-${facet}`);
    } else {
      unresolvedSpreads.push(item);
    }
  }
  return { names, unresolvedSpreads };
}

/**
 * Resolve `TENANT_THEME_REFERENCE_TOKENS` in full: the override-token spread
 * (union with the already-resolved override set), every literal name
 * (including `--ds-tint-4` and `--ds-tint-16`, literal here — NOT part of
 * either generated family), and the two generated families —
 * `--ds-color-${role}-${step}` and `--ds-tint-${role}-${step}`.
 */
export function extractReferenceTokens(sourceText, overrideNames) {
  const nameIndex = sourceText.indexOf('TENANT_THEME_REFERENCE_TOKENS');
  if (nameIndex === -1) {
    throw new Error('TENANT_THEME_REFERENCE_TOKENS not found in tenant-theme contract source');
  }
  const setIndex = sourceText.indexOf('new Set([', nameIndex);
  const block = setIndex === -1 ? null : extractBracketBlock(sourceText.slice(setIndex), 'new Set([', '[', ']');
  if (block == null) {
    throw new Error('TENANT_THEME_REFERENCE_TOKENS new Set([...]) is not a balanced bracket block');
  }
  const names = new Set();
  const unresolvedSpreads = [];
  for (const item of splitTopLevelListItems(block)) {
    const literal = item.match(/^"(--ds-[a-z0-9-]+)"$/);
    if (literal) {
      names.add(literal[1]);
      continue;
    }
    if (/^\.\.\.TENANT_THEME_OVERRIDE_TOKENS$/.test(item)) {
      for (const name of overrideNames) names.add(name);
      continue;
    }
    if (item.includes('TENANT_THEME_COLOR_ROLES') && item.includes('flatMap')) {
      const template = item.match(/`(--ds-[a-z-]+)\$\{role\}-\$\{step\}`/);
      if (template) {
        const prefix = template[1];
        const roles = extractFlatLiteralArray(sourceText, 'TENANT_THEME_COLOR_ROLES');
        const steps = extractFlatLiteralArray(sourceText, 'TENANT_THEME_COLOR_STEPS');
        for (const role of roles) for (const step of steps) names.add(`${prefix}${role}-${step}`);
        continue;
      }
      unresolvedSpreads.push(item);
      continue;
    }
    if (item.startsWith('...([') && item.includes('flatMap') && item.includes('--ds-tint-')) {
      const groups = [...item.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
      const template = item.match(/`(--ds-[a-z-]+)\$\{role\}-\$\{step\}`/);
      if (groups.length >= 2 && template) {
        const roles = [...groups[0].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
        const steps = [...groups[1].matchAll(/(\d+)/g)].map((m) => m[1]);
        const prefix = template[1];
        for (const role of roles) for (const step of steps) names.add(`${prefix}${role}-${step}`);
        continue;
      }
      unresolvedSpreads.push(item);
      continue;
    }
    unresolvedSpreads.push(item);
  }
  return { names, unresolvedSpreads };
}

/* ---------------------------------------------------------------------- */
/* 3. EMITTED — brand-theme compiler source                               */
/* ---------------------------------------------------------------------- */

/**
 * Resolve the tint ramp emitted by `setTintRampVariables`: read the literal
 * suffixes directly from the function BODY (so a future sixth step is
 * discovered, never hand-typed), then every literal-argument call site, and
 * cross-multiply.
 */
export function extractTintRampEmissions(sourceText) {
  const offsets = buildLineIndex(sourceText);
  const defIndex = sourceText.indexOf('function setTintRampVariables');
  if (defIndex === -1) return { names: new Set(), suffixes: [], callSites: [], definitionLine: null };
  const bodyOpen = sourceText.indexOf('{', defIndex);
  const body = extractBracketBlock(sourceText.slice(bodyOpen), '{', '{', '}') ?? '';
  const suffixes = [...new Set([...body.matchAll(/\$\{scale\}(-\d+)`/g)].map((m) => m[1]))].sort(
    (a, b) => Math.abs(Number(a)) - Math.abs(Number(b)),
  );
  const callRe = /setTintRampVariables\(\s*vars\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/g;
  const callSites = [];
  let match;
  while ((match = callRe.exec(sourceText)) !== null) {
    callSites.push({
      scale: match[1],
      colorVar: match[2],
      line: lineForOffset(offsets, match.index),
    });
  }
  const names = new Set();
  for (const site of callSites) for (const suffix of suffixes) names.add(`${site.scale}${suffix}`);
  return { names, suffixes, callSites, definitionLine: lineForOffset(offsets, defIndex) };
}

/**
 * Every `vars["--ds-x"] = ...` / `vars['--ds-x'] = ...` direct literal
 * assignment in the file, with line numbers. Multiple sites per name are
 * kept (never deduped) so the caller can fail on repetition (defect 5).
 */
export function extractDirectVarsAssignments(sourceText) {
  const offsets = buildLineIndex(sourceText);
  const sites = new Map();
  const re = /vars\[\s*(['"])(--ds-[a-z0-9-]+)\1\s*\]\s*=/g;
  let match;
  while ((match = re.exec(sourceText)) !== null) {
    const name = match[2];
    const list = sites.get(name) ?? [];
    list.push({ line: lineForOffset(offsets, match.index) });
    sites.set(name, list);
  }
  return sites;
}

/**
 * Every `vars[\`...\`] = ...` INTERPOLATED-template assignment, with its raw
 * template text and line. The tint-ramp's own `` `${scale}-N` `` shape is the
 * only interpolated pattern this producer resolves to concrete names (see
 * `extractTintRampEmissions`); the caller filters that shape out and treats
 * every remaining interpolated assignment as an unresolved emission pattern
 * (defect 5: "must FAIL", never silently dropped).
 */
export function extractInterpolatedAssignments(sourceText) {
  const offsets = buildLineIndex(sourceText);
  const sites = [];
  const re = /vars\[\s*`([^`]*)`\s*\]\s*=/g;
  let match;
  while ((match = re.exec(sourceText)) !== null) {
    sites.push({ raw: match[1], line: lineForOffset(offsets, match.index) });
  }
  return sites;
}

const RESOLVED_TINT_RAMP_TEMPLATE = /^\$\{scale\}-\d+$/;

/** Interpolated assignments minus the one shape this producer resolves elsewhere. */
export function findUnresolvedInterpolatedAssignments(sourceText) {
  return extractInterpolatedAssignments(sourceText).filter(
    (site) => !RESOLVED_TINT_RAMP_TEMPLATE.test(site.raw),
  );
}

/** Any scale registered by more than one `setTintRampVariables` call site, matching or not. */
export function findDuplicateTintScales(callSites) {
  const byScale = new Map();
  for (const site of callSites) {
    const list = byScale.get(site.scale) ?? [];
    list.push(site);
    byScale.set(site.scale, list);
  }
  const duplicates = [];
  for (const [scale, sites] of byScale) {
    if (sites.length > 1) {
      duplicates.push({ scale, sites, colorVars: [...new Set(sites.map((s) => s.colorVar))] });
    }
  }
  return duplicates;
}

/** Any channel name assigned by more than one direct `vars["--ds-x"] = ...` site. */
export function findDuplicateDirectAssignments(directEmission) {
  const duplicates = [];
  for (const [name, sites] of directEmission) {
    if (sites.length > 1) duplicates.push({ name, sites });
  }
  return duplicates;
}

/** Any channel name emitted by BOTH the tint ramp AND a direct literal assignment. */
export function findTintDirectOverlap(tintNames, directEmission) {
  return [...tintNames].filter((name) => directEmission.has(name)).sort();
}

/* ---------------------------------------------------------------------- */
/* 4. Corpus collection                                                   */
/* ---------------------------------------------------------------------- */

/** Not authored, scannable source. */
const EXCLUDED_CORPUS_PATH =
  /(?:^|\/)(?:classic-only|generated|dist|node_modules|coverage|__snapshots__|tests|fixtures|\.next|build)(?:\/|$)|(?:^|\/)facade\/artifacts(?:\/|$)/u;
const TEST_OR_STORY_FILE = /\.(?:test|spec|stories)\.(?:ts|tsx|css)$/u;

export function isScannableCorpusFile(posixRelativePath, fileName) {
  if (EXCLUDED_CORPUS_PATH.test(posixRelativePath)) return false;
  if (TEST_OR_STORY_FILE.test(fileName)) return false;
  return true;
}

/** Walk `roots`, returning absolute file paths whose name ends with one of `extensions`. */
export function collectSourceFiles(roots, extensions, baseRoot) {
  const files = [];
  const seen = new Set();
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        const rel = relative(baseRoot, full).split(sep).join('/');
        if (entry.isDirectory()) {
          if (EXCLUDED_CORPUS_PATH.test(`${rel}/`)) continue;
          walk(full);
          continue;
        }
        if (!extensions.some((ext) => entry.name.endsWith(ext))) continue;
        if (!isScannableCorpusFile(rel, entry.name)) continue;
        if (seen.has(full)) continue;
        seen.add(full);
        files.push(full);
      }
    };
    walk(root);
  }
  return files.sort();
}

/** Read `files` into `{file, text}` pairs, `file` as a `baseRoot`-relative POSIX path. */
export function readStylesheets(files, baseRoot) {
  return files.map((file) => ({
    file: relative(baseRoot, file).split(sep).join('/'),
    text: readFileSync(file, 'utf8'),
  }));
}

export const FROZEN_ENGINE_PATH = /(^|\/)engines\/(classic|rustic)\//;
export const MODERN_ENGINE_PATH = /(^|\/)(engines|engine-styles)\/modern\//;

/** Three DS-internal consumer scopes: modern-reachable = modern-engine ∪ engine-neutral. */
export function classifyConsumerScope(posixRelativePath) {
  if (FROZEN_ENGINE_PATH.test(posixRelativePath)) return 'frozen-engine';
  if (MODERN_ENGINE_PATH.test(posixRelativePath)) return 'modern-engine';
  return 'engine-neutral';
}

/* ---------------------------------------------------------------------- */
/* 5. THE PAINT GRAPH — separates READ from terminal PAINT (defect 1)     */
/* ---------------------------------------------------------------------- */

/**
 * Build a directed graph over an ENTIRE CSS corpus:
 *   - `customEdges.get(referencedName)` -> Array of `{file, line, targetProp,
 *     scope}` — one entry per custom-property declaration whose OWN value
 *     reads `referencedName` via `var(...)` (`--y: var(--x)` records the
 *     edge `x -> y` WITH the site where that happened, so a "read but no
 *     terminal" row can still cite exactly where the read is).
 *   - `terminalEdges.get(referencedName)` -> Array of `{file, line, prop,
 *     scope}` for every NON-custom (terminal) CSS property declaration whose
 *     value reads `referencedName` via `var(...)`.
 * Both maps are keyed by ANY `--*` custom-property name, not just `--ds-*`,
 * because an intermediate hop in a real chain is very often a
 * component-local custom property (`--button-accent`, `--sidebar-tint`)
 * rather than another `--ds-*` name. Only `postcss`-parsed declaration
 * values are scanned — CSS comments are separate AST nodes and never reach
 * `decl.value`, so they never count (defect 1).
 */
export function buildPaintGraph(stylesheets, scopeClassifier = () => 'engine-neutral') {
  const customEdges = new Map();
  const terminalEdges = new Map();
  const parseErrors = [];
  for (const { file, text } of stylesheets) {
    let root;
    try {
      root = postcss.parse(text, { from: file });
    } catch (error) {
      parseErrors.push({ file, message: error instanceof Error ? error.message : String(error) });
      continue;
    }
    const scope = scopeClassifier(file);
    root.walkDecls((decl) => {
      const prop = String(decl.prop ?? '');
      const value = String(decl.value ?? '');
      const isCustomTarget = prop.startsWith('--');
      const re = new RegExp(ANY_VAR_REF_RE.source, 'g');
      let match;
      while ((match = re.exec(value)) !== null) {
        const referenced = match[1];
        if (referenced === prop) continue; // a channel referencing itself is not a chain hop
        const line = decl.source?.start?.line ?? 0;
        if (isCustomTarget) {
          const list = customEdges.get(referenced) ?? [];
          list.push({ file, line, targetProp: prop, scope });
          customEdges.set(referenced, list);
        } else {
          const list = terminalEdges.get(referenced) ?? [];
          list.push({ file, line, prop, scope });
          terminalEdges.set(referenced, list);
        }
      }
    });
  }
  return { customEdges, terminalEdges, parseErrors };
}

/**
 * Cycle-safe (visited-set) BFS from `startName` over `graph.customEdges`,
 * collecting every terminal edge reachable via a FINITE chain. A cycle
 * (`--a` feeds `--b` feeds `--a`) is visited once per node and then
 * naturally stops contributing new nodes — it can never manufacture a
 * terminal that is not otherwise reachable, and it can never hang.
 */
export function computePaint(graph, startName) {
  const visited = new Set([startName]);
  const queue = [startName];
  const terminalSites = [];
  while (queue.length > 0) {
    const node = queue.shift();
    const terminals = graph.terminalEdges.get(node) ?? [];
    for (const terminal of terminals) terminalSites.push({ ...terminal, via: node });
    const next = graph.customEdges.get(node) ?? [];
    for (const edge of next) {
      if (!visited.has(edge.targetProp)) {
        visited.add(edge.targetProp);
        queue.push(edge.targetProp);
      }
    }
  }
  return {
    painted: terminalSites.length > 0,
    terminalSites,
    reachedCustomProps: [...visited],
  };
}

/** Raw-text `var(--ds-x)` reads in TS/TSX inline-style carriers — always READ_UNPROVEN, never PAINT. */
export function scanTsReads(stylesheets) {
  const reads = new Map();
  for (const { file, text } of stylesheets) {
    const offsets = buildLineIndex(text);
    const re = /var\(\s*(--ds-[a-z0-9-]+)/g;
    let match;
    while ((match = re.exec(text)) !== null) {
      const list = reads.get(match[1]) ?? [];
      list.push({ file, line: lineForOffset(offsets, match.index) });
      reads.set(match[1], list);
    }
  }
  return reads;
}

/* ---------------------------------------------------------------------- */
/* 6. Canonical family attribution (defect 4: Set<canonicalId>, never one row) */
/* ---------------------------------------------------------------------- */

export function loadFamilyRows(inventoryPath = DEFAULT_FAMILY_INVENTORY) {
  const raw = readFileSync(inventoryPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.rows) || parsed.rows.length === 0) {
    throw new Error(`family inventory carries no rows: ${inventoryPath}`);
  }
  return { rows: parsed.rows, raw };
}

/**
 * `ownerPrefixes` groups every family row by its OWN `sourceOwner` value
 * (never a hand-typed name list) and sorts longest-`sourceOwner`-first (most
 * specific wins). A `sourceOwner` shared by more than one row's `id` carries
 * ALL of those ids together — `attributeFamily` below returns the whole
 * group, never row index 0.
 */
export function buildFamilyIndex(rows) {
  const bySourceOwner = new Map();
  for (const row of rows) {
    const list = bySourceOwner.get(row.sourceOwner) ?? [];
    list.push(row.id);
    bySourceOwner.set(row.sourceOwner, list);
  }
  const ownerPrefixes = [...bySourceOwner.entries()]
    .map(([sourceOwner, ids]) => ({ sourceOwner, ids: [...ids].sort() }))
    .sort((a, b) => b.sourceOwner.length - a.sourceOwner.length);
  const categoryDirs = new Set(
    rows.map((row) => row.sourceOwner.slice(0, row.sourceOwner.lastIndexOf('/'))),
  );
  return { ownerPrefixes, categoryDirs };
}

const UI_ROOT_PREFIX = 'packages/core/src/ui/';

/**
 * CLAUDE.md's own component-taxonomy section names these as non-family
 * support owners for `patterns/`: `foundation/`, `runtime/`, `tooling/`
 * (`facade/` and `tests/` are the corpus/inventory-support siblings, holding
 * zero `family-inventory.json` rows). `primitives/foundation` is
 * DELIBERATELY absent: it is a real, populated family group per
 * `family-inventory.json` itself — this list is scoped per FULL path, never
 * a bare segment-name blocklist, for exactly that reason.
 */
const KNOWN_NON_FAMILY_TERRITORY = Object.freeze([
  'patterns/foundation',
  'patterns/runtime',
  'patterns/tooling',
  'patterns/facade',
  'patterns/tests',
]);

function isKnownNonFamilyTerritory(packagesRelativePath) {
  if (!packagesRelativePath.startsWith(UI_ROOT_PREFIX)) return false;
  const withinUi = packagesRelativePath.slice(UI_ROOT_PREFIX.length);
  return KNOWN_NON_FAMILY_TERRITORY.some(
    (prefix) => withinUi === prefix || withinUi.startsWith(`${prefix}/`),
  );
}

/**
 * `packagesRelativePath` must be `packages/core/...`-prefixed, matching
 * `family-inventory.json`'s own `sourceOwner` convention. A site under a
 * SHARED `sourceOwner` (more than one canonical id) resolves `status:
 * 'resolved-shared'` and returns ALL of those ids — the caller tallies the
 * SITE as `unattributedShared` (it cannot honestly attribute the read to one
 * specific family) while still recording every id in the channel's
 * `familyIds` (defect 4: "A shared owner returns ALL its IDs").
 */
export function attributeFamily(packagesRelativePath, index) {
  for (const owner of index.ownerPrefixes) {
    if (
      packagesRelativePath === owner.sourceOwner ||
      packagesRelativePath.startsWith(`${owner.sourceOwner}/`)
    ) {
      return {
        ids: new Set(owner.ids),
        status: owner.ids.length > 1 ? 'resolved-shared' : 'resolved',
      };
    }
  }
  if (isKnownNonFamilyTerritory(packagesRelativePath)) {
    return { ids: new Set(), status: 'unattributed' };
  }
  for (const categoryDir of index.categoryDirs) {
    if (
      packagesRelativePath === categoryDir ||
      packagesRelativePath.startsWith(`${categoryDir}/`)
    ) {
      return { ids: new Set(), status: 'unknown-family', categoryDir };
    }
  }
  return { ids: new Set(), status: 'unattributed' };
}

/* ---------------------------------------------------------------------- */
/* 7. Semantic owner — an unknown owner FAILS, no truthy 'other' (defect 4) */
/* ---------------------------------------------------------------------- */

/**
 * A closed prefix -> BrandTheme-taxonomy-owner table, exhaustive against the
 * current declared/emitted universe. Unlike a prior revision of this file,
 * an unmatched prefix returns `null` — there is no `'other'` escape hatch —
 * so a genuinely new, un-mapped prefix family trips the same
 * `unclassified output` failure as a missing classification, rather than
 * silently passing as a real value.
 */
export const SEMANTIC_OWNER_RULES = Object.freeze([
  [/^--ds-tint-(success|warning|error|info)-/, (m) => `palette.tint-ramp.${m[1]}`],
  [/^--ds-tint-/, () => 'palette.tint-ramp.primary'],
  [/^--ds-chart-/, () => 'charts'],
  [/^--ds-color-/, () => 'palette'],
  [/^--ds-material-/, () => 'surfaces.material'],
  [/^--ds-surface-/, () => 'surfaces'],
  [/^--ds-font-family-/, () => 'typography'],
  [/^--ds-letter-spacing-/, () => 'typography'],
  [/^--ds-line-height-/, () => 'typography'],
  [/^--ds-type-/, () => 'typography'],
  [/^--ds-text-eyebrow(?:-|$)/, () => 'typography.eyebrow'],
  [/^--ds-rhythm-/, () => 'surfaces.rhythm'],
  [/^--ds-motion-ease-/, () => 'motion.easing'],
  [/^--ds-ease-/, () => 'motion.easing'],
  [/^--ds-motion-spring-/, () => 'motion.spring'],
  [/^--ds-motion-/, () => 'motion'],
  [/^--ds-radius-/, () => 'surfaces.radius'],
  [/^--ds-shadow-/, () => 'surfaces.shadow'],
  [/^--ds-elevation-/, () => 'surfaces.elevation'],
  [/^--ds-glass-/, () => 'surfaces.glass'],
  [/^--ds-gradient-/, () => 'surfaces.gradient'],
  [/^--ds-overlay-/, () => 'surfaces.overlay'],
  [/^--ds-density-/, () => 'surfaces.density'],
  [/^--ds-effect-/, () => 'surfaces.effect'],
]);

export function classifySemanticOwner(name) {
  for (const [pattern, toOwner] of SEMANTIC_OWNER_RULES) {
    const match = name.match(pattern);
    if (match) return toOwner(match);
  }
  return null;
}

/* ---------------------------------------------------------------------- */
/* 8. Liveness classification — no "dead" wording, but no protected bucket */
/* ---------------------------------------------------------------------- */

export const LIVENESS = Object.freeze({
  modernPainted: 'LIVE_MODERN_PAINTED',
  frozenEnginePainted: 'LIVE_FROZEN_ENGINE_PAINTED',
  externalConsumerPainted: 'LIVE_EXTERNAL_CONSUMER_PAINTED',
  readNoProductiveTerminal: 'READ_NO_PRODUCTIVE_TERMINAL',
  readUnproven: 'READ_UNPROVEN',
  authorableUnprovenEffect: 'AUTHORABLE_UNPROVEN_EFFECT',
  unreadOverrideOnly: 'UNREAD_OVERRIDE_ONLY_NO_KNOWN_ROUTE',
  unreadEmittedNoRoute: 'UNREAD_EMITTED_NO_KNOWN_ROUTE',
});

/** The three (and only three) classifications that count as proven liveness. */
export const LIVE_CLASSIFICATIONS = new Set([
  LIVENESS.modernPainted,
  LIVENESS.frozenEnginePainted,
  LIVENESS.externalConsumerPainted,
]);

/**
 * Every classification that is NOT proven liveness. Per defect 3 and defect
 * 8 there is no protected bucket among these — every row landing here is a
 * standing NO-GO finding, every run, regardless of whether it is a brand new
 * channel or one that has looked this way for a hundred prior runs. This is
 * the deliberate replacement for the prior revision's "declaredReference is
 * a protected bucket that never fails" design, which is exactly what defect
 * 3 named as wrong ("the reference allowlist only proves authorability ...
 * it never proves liveness").
 */
export const UNPROVEN_CLASSIFICATIONS = new Set([
  LIVENESS.readNoProductiveTerminal,
  LIVENESS.readUnproven,
  LIVENESS.authorableUnprovenEffect,
  LIVENESS.unreadOverrideOnly,
  LIVENESS.unreadEmittedNoRoute,
]);

/**
 * Exhaustive over the row shape this file ever constructs (universe =
 * declaredOverride ∪ declaredReference ∪ emitted, so at least one of
 * `declaredOverride`/`declaredReference`/emitted always holds) — every
 * branch below is reachable, none is dead code.
 */
export function classifyLiveness({
  declaredOverride,
  declaredReference,
  dsModernPainted,
  dsFrozenOnlyPainted,
  externalConsumerPainted,
  cssReadNoTerminal,
  tsReadOnly,
}) {
  if (dsModernPainted) {
    return {
      classification: LIVENESS.modernPainted,
      reason: 'a finite PostCSS custom-property chain from this channel reaches a terminal (non-custom) declaration in Modern-reachable authored source (modern-engine or engine-neutral scope)',
    };
  }
  if (dsFrozenOnlyPainted) {
    return {
      classification: LIVENESS.frozenEnginePainted,
      reason: 'a finite PostCSS chain from this channel reaches a terminal declaration, but every such terminal site is confined to a frozen Classic/Rustic engine file; paints nothing under the Modern engine',
    };
  }
  if (externalConsumerPainted) {
    return {
      classification: LIVENESS.externalConsumerPainted,
      reason: 'zero in-repo (DS) terminal paint, but a finite PostCSS chain from this channel reaches a terminal declaration in a required external consumerRoot (app-bithire) -- KEEP because of that external terminal chain only',
    };
  }
  if (cssReadNoTerminal) {
    return {
      classification: LIVENESS.readNoProductiveTerminal,
      reason: 'this channel is read inside at least one private custom-property declaration (DS or consumerRoot), but no finite chain from it reaches any terminal (non-custom) CSS declaration anywhere scanned -- read, never proven to paint',
    };
  }
  if (tsReadOnly) {
    return {
      classification: LIVENESS.readUnproven,
      reason: 'the only evidence for this channel is a raw var() occurrence in TS/TSX inline-style source (DS or consumerRoot); a raw TS/TSX occurrence is never treated as proof of paint',
    };
  }
  if (declaredReference) {
    return {
      classification: LIVENESS.authorableUnprovenEffect,
      reason: 'declared on TENANT_THEME_REFERENCE_TOKENS, the closed var()-reference allowlist an authored tenant Advanced document may cite -- that membership proves AUTHORABILITY, never liveness; with zero proven terminal (in-repo or external) this is a standing unproven finding, not a protected bucket',
    };
  }
  if (declaredOverride) {
    return {
      classification: LIVENESS.unreadOverrideOnly,
      reason: 'declared on TENANT_THEME_OVERRIDE_TOKENS (a tenant-settable dial) with zero proven terminal and no reference-token declaration at all',
    };
  }
  return {
    classification: LIVENESS.unreadEmittedNoRoute,
    reason: 'emitted by the brand-theme compiler with zero proven terminal and not declared on either tenant-facing allowlist',
  };
}

/* ---------------------------------------------------------------------- */
/* 9. Digest + regression ratchet against the persisted artifact          */
/* ---------------------------------------------------------------------- */

/**
 * Covers: this gate script's own source, the evidence contract (the closest
 * thing this tree has to a schema for the artifact), the CI wiring
 * (`ci-gates.manifest.mjs`, `package.json`), the raw family inventory, the
 * tenant-theme contract and brand-theme compiler, the DS corpus, and every
 * consumer root's corpus (defect 6).
 */
export function computeInputsDigest({
  gateScriptSource,
  evidenceContractRaw,
  ciGatesManifestRaw,
  packageJsonRaw,
  tenantThemeSource,
  brandThemeSource,
  familyInventoryRaw,
  cssStylesheets,
  tsStylesheets,
  consumerCorpora = [],
}) {
  const parts = [
    `gate-script:${sha256(gateScriptSource)}`,
    `evidence-contract:${sha256(evidenceContractRaw)}`,
    `ci-gates-manifest:${sha256(ciGatesManifestRaw)}`,
    `package-json:${sha256(packageJsonRaw)}`,
    `tenant-theme-contract:${sha256(tenantThemeSource)}`,
    `brand-theme-compiler:${sha256(brandThemeSource)}`,
    `family-inventory:${sha256(familyInventoryRaw)}`,
  ];
  for (const { file, text } of cssStylesheets) parts.push(`css:${file}:${sha256(text)}`);
  for (const { file, text } of tsStylesheets) parts.push(`ts:${file}:${sha256(text)}`);
  for (const consumer of consumerCorpora) {
    for (const { file, text } of consumer.cssStylesheets ?? []) {
      parts.push(`consumer-css:${consumer.id}:${file}:${sha256(text)}`);
    }
    for (const { file, text } of consumer.tsStylesheets ?? []) {
      parts.push(`consumer-ts:${consumer.id}:${file}:${sha256(text)}`);
    }
  }
  parts.sort();
  return sha256(parts.join('\n'));
}

/**
 * Ratchet the CURRENT rows against the PREVIOUSLY WRITTEN artifact.
 * `previousArtifact` is the parsed prior `channel-liveness.json`, or `null`
 * when none exists yet (every comparison below is then vacuously satisfied).
 */
export function compareAgainstPrevious(currentRows, previousArtifact) {
  const failures = [];
  if (!previousArtifact || !Array.isArray(previousArtifact.channels)) return failures;
  const currentByName = new Map(currentRows.map((row) => [row.name, row]));
  const previousByName = new Map(previousArtifact.channels.map((row) => [row.name, row]));

  for (const row of currentRows) {
    const previous = previousByName.get(row.name);
    if (!previous) continue;
    if (LIVE_CLASSIFICATIONS.has(previous.classification) && UNPROVEN_CLASSIFICATIONS.has(row.classification)) {
      failures.push(
        `new dead name: ${row.name} was live (${previous.classification}) in the previously written evidence artifact and now has zero proven terminal (${row.classification}) -- regenerate with --write and account for the regression before shipping`,
      );
    }
    if (UNPROVEN_CLASSIFICATIONS.has(previous.classification) && LIVE_CLASSIFICATIONS.has(row.classification)) {
      failures.push(
        `stale revived debt: ${row.name} was recorded unproven (${previous.classification}) in the previously written evidence artifact and is now proven live (${row.classification}) -- the persisted snapshot is stale; regenerate with --write rather than carrying it forward silently`,
      );
    }
  }

  // Defect 7's closing law: detect REMOVAL of a previously protected/live
  // channel, not only a live -> unread transition of a channel that is
  // still present in the universe.
  for (const previous of previousArtifact.channels) {
    if (LIVE_CLASSIFICATIONS.has(previous.classification) && !currentByName.has(previous.name)) {
      failures.push(
        `removed protected channel: ${previous.name} was previously ${previous.classification} in the previously written evidence artifact and is no longer declared or emitted at all -- confirm this retirement is intentional before regenerating`,
      );
    }
  }

  return failures;
}

/* ---------------------------------------------------------------------- */
/* 10. Consumer-root loading (defect 7)                                   */
/* ---------------------------------------------------------------------- */

/**
 * Load one consumerRoot's CSS + TS/TSX corpus. NEVER writes anything under
 * `consumerRoot.root` -- read-only, source-bound. A `required` consumerRoot
 * that cannot be found or read is reported as `ok: false`; the caller turns
 * that into a hard failure rather than silently treating the channel
 * universe as smaller than it really is (defect 7: "A missing consumerRoot
 * FAILS").
 */
export function loadConsumerRootCorpus(consumerRoot) {
  const { root } = consumerRoot;
  if (!existsSync(root)) {
    return {
      ok: false,
      error: `consumerRoot "${consumerRoot.id}" resolved path does not exist or is not readable from this process: ${root}`,
      cssStylesheets: [],
      tsStylesheets: [],
      cssFileCount: 0,
      tsFileCount: 0,
    };
  }
  try {
    const cssFiles = collectSourceFiles([root], ['.css'], root);
    const tsFiles = collectSourceFiles([root], ['.ts', '.tsx'], root);
    const cssStylesheets = readStylesheets(cssFiles, root).map(({ file, text }) => ({
      file: `${consumerRoot.id}/${file}`,
      text,
    }));
    const tsStylesheets = readStylesheets(tsFiles, root).map(({ file, text }) => ({
      file: `${consumerRoot.id}/${file}`,
      text,
    }));
    return {
      ok: true,
      cssStylesheets,
      tsStylesheets,
      cssFileCount: cssFiles.length,
      tsFileCount: tsFiles.length,
    };
  } catch (error) {
    return {
      ok: false,
      error: `consumerRoot "${consumerRoot.id}" read failed: ${error instanceof Error ? error.message : String(error)}`,
      cssStylesheets: [],
      tsStylesheets: [],
      cssFileCount: 0,
      tsFileCount: 0,
    };
  }
}

/* ---------------------------------------------------------------------- */
/* 11. The pure analyzer                                                  */
/* ---------------------------------------------------------------------- */

const CONSUMER_SITE_CAP = 20;

/**
 * Pure: every input arrives as already-read text/data, so hermetic fixtures
 * exercise every fail-closed condition without touching the filesystem
 * (`runGate` below is the only impure caller, and it is a thin IO wrapper).
 *
 * `drill` accepts exactly one value, `'unclassified-output'`, injecting a
 * synthetic row with no classification/owner. `classifyLiveness` is TOTAL
 * over every row this function can ever construct from real inputs, so there
 * is no other reachable NORMAL input that leaves a row unclassified; an
 * UNKNOWN `semanticOwner` (defect 4) is reachable through ordinary fixture
 * input alone (a name whose prefix is not in `SEMANTIC_OWNER_RULES`) and
 * needs no drill.
 */
export function analyzeChannelLiveness({
  tenantThemeSource,
  brandThemeSource,
  familyRows,
  cssStylesheets,
  tsStylesheets,
  consumerRoots = [],
  previousArtifact = null,
  enforceArtifactFreshness = false,
  drill = null,
}) {
  const failures = [];
  const analysisLimitations = [];

  if (!Array.isArray(cssStylesheets) || cssStylesheets.length === 0) {
    failures.push('zero corpus: the authored CSS corpus (foundation/tokens/css/** + ui/**) resolved to zero stylesheets');
  }
  if (!Array.isArray(tsStylesheets) || tsStylesheets.length === 0) {
    failures.push('zero corpus: the authored TS/TSX corpus (foundation/tokens/css/** + ui/**) resolved to zero sources');
  }

  // --- DECLARED -----------------------------------------------------
  const { names: declaredOverride, unresolvedSpreads: overrideUnresolved } = extractOverrideTokens(tenantThemeSource);
  const { names: declaredReference, unresolvedSpreads: referenceUnresolved } = extractReferenceTokens(
    tenantThemeSource,
    declaredOverride,
  );
  for (const item of overrideUnresolved) {
    failures.push(`unresolved spread: TENANT_THEME_OVERRIDE_TOKENS contains an unresolved spread element "${item}" -- the DECLARED override universe cannot be trusted while this is unresolved`);
  }
  for (const item of referenceUnresolved) {
    failures.push(`unresolved spread: TENANT_THEME_REFERENCE_TOKENS contains an unresolved spread element "${item}" -- the DECLARED reference universe cannot be trusted while this is unresolved`);
  }

  // --- EMITTED --------------------------------------------------------
  const tintEmission = extractTintRampEmissions(brandThemeSource);
  const directEmission = extractDirectVarsAssignments(brandThemeSource);
  const unresolvedInterpolated = findUnresolvedInterpolatedAssignments(brandThemeSource);
  const duplicateTintScales = findDuplicateTintScales(tintEmission.callSites);
  const duplicateDirectAssignments = findDuplicateDirectAssignments(directEmission);
  const tintDirectOverlap = findTintDirectOverlap(tintEmission.names, directEmission);

  for (const duplicate of duplicateTintScales) {
    failures.push(
      `duplicate owner: tint scale "${duplicate.scale}" is registered by setTintRampVariables at ${duplicate.sites.length} call sites (lines ${duplicate.sites.map((s) => s.line).join(', ')}) -- a channel family may have exactly one producer`,
    );
  }
  for (const duplicate of duplicateDirectAssignments) {
    failures.push(
      `duplicate producer: ${duplicate.name} is assigned by ${duplicate.sites.length} direct \`vars[...]\` sites (lines ${duplicate.sites.map((s) => s.line).join(', ')}) in the brand-theme compiler -- a channel may have exactly one producer`,
    );
  }
  if (tintDirectOverlap.length > 0) {
    failures.push(
      `tint x direct overlap: ${tintDirectOverlap.join(', ')} ${tintDirectOverlap.length === 1 ? 'is' : 'are'} emitted by BOTH the tint ramp and a direct literal assignment -- two producers disagree about the same channel`,
    );
  }
  for (const site of unresolvedInterpolated) {
    failures.push(
      `unresolved emission pattern: vars[\`${site.raw}\`] at brand-theme/index.ts:${site.line} is an interpolated template assignment this producer cannot resolve to concrete channel names -- the corpus is never shrunk to avoid this finding`,
    );
  }

  const emittedNames = new Set([...tintEmission.names, ...directEmission.keys()]);
  const universe = new Set([...declaredOverride, ...declaredReference, ...emittedNames]);

  // --- consumerRoots (defect 7) ----------------------------------------
  const consumerResults = consumerRoots.map((consumerRoot) => ({
    consumerRoot,
    load: loadConsumerRootCorpus(consumerRoot),
  }));
  for (const { consumerRoot, load } of consumerResults) {
    if (!load.ok && consumerRoot.required) {
      failures.push(`required consumerRoot missing: ${load.error}`);
    }
  }

  // --- Paint graphs (defect 1) ------------------------------------------
  const dsGraph = buildPaintGraph(cssStylesheets, (file) => classifyConsumerScope(file));
  for (const error of dsGraph.parseErrors) failures.push(`corpus parse error: ${error.file}: ${error.message}`);
  const externalGraph = buildPaintGraph(
    consumerResults.flatMap(({ load }) => load.cssStylesheets),
    () => 'external-consumer',
  );
  for (const error of externalGraph.parseErrors) failures.push(`corpus parse error (consumerRoot): ${error.file}: ${error.message}`);

  const tsReadsDs = scanTsReads(tsStylesheets);
  const tsReadsExternal = scanTsReads(consumerResults.flatMap(({ load }) => load.tsStylesheets));

  // --- Family attribution -----------------------------------------------
  const familyIndex = buildFamilyIndex(familyRows);
  const brandThemeRelative = 'packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts';

  function producerFor(name) {
    if (tintEmission.names.has(name)) {
      const site = tintEmission.callSites.find((candidate) =>
        tintEmission.suffixes.some((suffix) => `${candidate.scale}${suffix}` === name),
      );
      return {
        kind: 'tint-ramp',
        scale: site?.scale ?? null,
        colorVar: site?.colorVar ?? null,
        callSite: site ? `${brandThemeRelative}:${site.line}` : null,
        definitionSite: tintEmission.definitionLine ? `${brandThemeRelative}:${tintEmission.definitionLine}` : null,
      };
    }
    if (directEmission.has(name)) {
      return {
        kind: 'direct-literal',
        sites: directEmission.get(name).map((site) => `${brandThemeRelative}:${site.line}`),
      };
    }
    return null;
  }

  const channels = [];
  let attributedReadSites = 0;
  let unattributedReadSites = 0;
  let unattributedSharedReadSites = 0;
  let unknownFamilySites = 0;
  const unknownFamilyFindings = [];

  for (const name of [...universe].sort()) {
    const dsPaint = computePaint(dsGraph, name);
    const externalPaint = computePaint(externalGraph, name);
    const dsModernPainted = dsPaint.terminalSites.some((site) => site.scope !== 'frozen-engine');
    const dsFrozenOnlyPainted = dsPaint.painted && !dsModernPainted;
    const externalConsumerPainted = !dsPaint.painted && externalPaint.painted;

    const dsCssEvidence = dsPaint.painted || dsGraph.customEdges.has(name);
    const externalCssEvidence = externalPaint.painted || externalGraph.customEdges.has(name);
    const anyPaint = dsPaint.painted || externalPaint.painted;
    const cssReadNoTerminal = (dsCssEvidence || externalCssEvidence) && !anyPaint;

    const dsTsSites = tsReadsDs.get(name) ?? [];
    const externalTsSites = tsReadsExternal.get(name) ?? [];
    const tsReadOnly = !dsCssEvidence && !externalCssEvidence && (dsTsSites.length > 0 || externalTsSites.length > 0);

    // Family attribution over every site with a real chain -- DS terminal
    // sites, DS custom-property REFERENCE sites (where `name` itself is read
    // inside another custom property's declaration -- the exact site a
    // READ_NO_PRODUCTIVE_TERMINAL row needs for provenance), and DS TS reads.
    const dsCustomRefSites = dsGraph.customEdges.get(name) ?? [];
    const externalCustomRefSites = externalGraph.customEdges.get(name) ?? [];
    const familyIds = new Set();
    let sharedFamilyAttribution = false;
    const allDsSites = [
      ...dsPaint.terminalSites.map((s) => ({ file: s.file, line: s.line })),
      ...dsCustomRefSites.map((s) => ({ file: s.file, line: s.line })),
      ...dsTsSites,
    ];
    for (const site of allDsSites) {
      const packagesRelative = `packages/core/${site.file}`;
      const attribution = attributeFamily(packagesRelative, familyIndex);
      if (attribution.status === 'resolved') {
        for (const id of attribution.ids) familyIds.add(id);
        attributedReadSites += 1;
      } else if (attribution.status === 'resolved-shared') {
        for (const id of attribution.ids) familyIds.add(id);
        sharedFamilyAttribution = true;
        unattributedSharedReadSites += 1;
      } else if (attribution.status === 'unknown-family') {
        unknownFamilySites += 1;
        unknownFamilyFindings.push({ name, site: `${site.file}:${site.line}`, categoryDir: attribution.categoryDir });
      } else {
        unattributedReadSites += 1;
      }
    }

    const producer = producerFor(name);
    const semanticOwner = classifySemanticOwner(name);
    const { classification, reason } = classifyLiveness({
      declaredOverride: declaredOverride.has(name),
      declaredReference: declaredReference.has(name),
      dsModernPainted,
      dsFrozenOnlyPainted,
      externalConsumerPainted,
      cssReadNoTerminal,
      tsReadOnly,
    });

    const consumerSites = [
      ...dsPaint.terminalSites.map((s) => `ds-terminal:${s.file}:${s.line} (${s.prop})`),
      ...externalPaint.terminalSites.map((s) => `external-terminal:${s.file}:${s.line} (${s.prop})`),
      ...dsCustomRefSites.map((s) => `ds-custom-ref:${s.file}:${s.line} (feeds --${s.targetProp.replace(/^--/, '')})`),
      ...externalCustomRefSites.map((s) => `external-custom-ref:${s.file}:${s.line} (feeds --${s.targetProp.replace(/^--/, '')})`),
      ...dsTsSites.map((s) => `ds-ts-unproven:${s.file}:${s.line}`),
      ...externalTsSites.map((s) => `external-ts-unproven:${s.file}:${s.line}`),
    ];

    channels.push({
      name,
      declaredOverride: declaredOverride.has(name),
      declaredReference: declaredReference.has(name),
      emitted: emittedNames.has(name),
      emittedVia: tintEmission.names.has(name) ? 'tint-ramp' : directEmission.has(name) ? 'direct-literal' : null,
      producer,
      semanticOwner,
      familyIds: [...familyIds].sort(),
      sharedFamilyAttribution,
      reads: {
        dsTerminal: dsPaint.terminalSites.length,
        externalTerminal: externalPaint.terminalSites.length,
        dsTs: dsTsSites.length,
        externalTs: externalTsSites.length,
        total: dsPaint.terminalSites.length + externalPaint.terminalSites.length + dsTsSites.length + externalTsSites.length,
      },
      dsModernPainted,
      dsFrozenOnlyPainted,
      externalConsumerPainted,
      cssReadNoTerminal,
      tsReadOnly,
      consumerSites: consumerSites.slice(0, CONSUMER_SITE_CAP),
      consumerSitesTruncated: consumerSites.length > CONSUMER_SITE_CAP,
      classification,
      classificationReason: reason,
    });
  }

  if (drill === 'unclassified-output') {
    channels.push({
      name: '--ds-drill-synthetic-unclassified',
      declaredOverride: false,
      declaredReference: false,
      emitted: true,
      emittedVia: null,
      producer: null,
      semanticOwner: null,
      familyIds: [],
      sharedFamilyAttribution: false,
      reads: { dsTerminal: 0, externalTerminal: 0, dsTs: 0, externalTs: 0, total: 0 },
      dsModernPainted: false,
      dsFrozenOnlyPainted: false,
      externalConsumerPainted: false,
      cssReadNoTerminal: false,
      tsReadOnly: false,
      consumerSites: [],
      consumerSitesTruncated: false,
      classification: null,
      classificationReason: null,
    });
  }

  const unclassified = channels.filter((row) => !row.classification || !row.semanticOwner);
  if (unclassified.length > 0) {
    failures.push(`unclassified output: ${unclassified.length} channel row(s) missing classification/semanticOwner: ${unclassified.map((r) => r.name).join(', ')}`);
  }

  if (unknownFamilySites > 0) {
    const sample = unknownFamilyFindings.slice(0, 8).map((f) => `${f.name} @ ${f.site} (under ${f.categoryDir})`);
    failures.push(
      `unknown family: ${unknownFamilySites} consumer site(s) sit inside a known family category directory but resolve to no canonical family-inventory row -- the inventory has drifted: ${sample.join('; ')}${unknownFamilyFindings.length > 8 ? ', …' : ''}`,
    );
  }

  // --- STOP NO-GO: every non-LIVE row is a standing finding (defects 3, 8) --
  const unprovenRows = channels.filter((row) => row.classification && UNPROVEN_CLASSIFICATIONS.has(row.classification));
  if (unprovenRows.length > 0) {
    const byBucket = new Map();
    for (const row of unprovenRows) {
      const list = byBucket.get(row.classification) ?? [];
      list.push(row.name);
      byBucket.set(row.classification, list);
    }
    for (const [classification, names] of byBucket) {
      failures.push(
        `STOP NO-GO: ${names.length} channel(s) classified ${classification} (no proven terminal, no proven external evidence, no retirement) -- exact rows: ${names.join(', ')}`,
      );
    }
  }

  const sourceDigest = computeInputsDigest({
    gateScriptSource: readFileSync(SCRIPT_PATH, 'utf8'),
    evidenceContractRaw: readFileSync(DEFAULT_EVIDENCE_CONTRACT, 'utf8'),
    ciGatesManifestRaw: readFileSync(DEFAULT_CI_GATES_MANIFEST, 'utf8'),
    packageJsonRaw: readFileSync(DEFAULT_PACKAGE_JSON, 'utf8'),
    tenantThemeSource,
    brandThemeSource,
    familyInventoryRaw: JSON.stringify(familyRows),
    cssStylesheets,
    tsStylesheets,
    consumerCorpora: consumerResults.map(({ consumerRoot, load }) => ({
      id: consumerRoot.id,
      cssStylesheets: load.cssStylesheets,
      tsStylesheets: load.tsStylesheets,
    })),
  });

  if (previousArtifact) {
    // The raw digest-staleness comparison only matters when something is
    // TRUSTING the on-disk artifact as current (`--check`). It must NOT
    // block `--write`, whose entire job is to refresh that exact digest --
    // treating "the old artifact doesn't match fresh reality yet" as a
    // reason to refuse to fix it would make `--write` permanently unable to
    // regenerate a stale artifact. The regression ratchet
    // (`compareAgainstPrevious`) stays active unconditionally: it protects
    // against silently writing OVER a real regression, which is a different
    // concern from "the digest changed because time passed".
    if (enforceArtifactFreshness && previousArtifact.sourceDigest && previousArtifact.sourceDigest !== sourceDigest) {
      failures.push(
        `stale output: channel-liveness.json sourceDigest (${previousArtifact.sourceDigest}) does not match the freshly computed digest (${sourceDigest}) -- regenerate with --write`,
      );
    }
    failures.push(...compareAgainstPrevious(channels, previousArtifact));
  }

  const byClassification = {};
  for (const value of Object.values(LIVENESS)) byClassification[value] = 0;
  for (const row of channels) if (row.classification) byClassification[row.classification] += 1;

  return {
    ok: failures.length === 0,
    failures,
    analysisLimitations,
    sourceDigest,
    consumerRoots: consumerResults.map(({ consumerRoot, load }) => ({
      id: consumerRoot.id,
      root: relative(REPO_ROOT, consumerRoot.root).split(sep).join('/'),
      required: consumerRoot.required,
      ok: load.ok,
      error: load.ok ? null : load.error,
      cssFileCount: load.cssFileCount,
      tsFileCount: load.tsFileCount,
    })),
    counts: {
      universe: universe.size,
      declaredOverride: declaredOverride.size,
      declaredReference: declaredReference.size,
      emitted: emittedNames.size,
      attributedReadSites,
      unattributedReadSites,
      unattributedSharedReadSites,
      unknownFamilySites,
      byClassification,
    },
    channels,
  };
}

/* ---------------------------------------------------------------------- */
/* 12. runGate — the only impure entry point                              */
/* ---------------------------------------------------------------------- */

/** Highest existing `R<N>` directory under the evidence root, or `null`. */
export function resolveCurrentRound(evidenceRoot = DEFAULT_EVIDENCE_ROOT) {
  if (!existsSync(evidenceRoot)) return null;
  const rounds = readdirSync(evidenceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^R\d+$/.test(entry.name))
    .map((entry) => Number(entry.name.slice(1)));
  if (rounds.length === 0) return null;
  return `R${Math.max(...rounds)}`;
}

export function defaultArtifactPath({ evidenceRoot = DEFAULT_EVIDENCE_ROOT, round = DEFAULT_ROUND } = {}) {
  return join(evidenceRoot, round ?? DEFAULT_ROUND, ARTIFACT_FILE_NAME);
}

export function runGate({
  tenantThemeContractPath = DEFAULT_TENANT_THEME_CONTRACT,
  brandThemeCompilerPath = DEFAULT_BRAND_THEME_COMPILER,
  familyInventoryPath = DEFAULT_FAMILY_INVENTORY,
  cssRoots = DEFAULT_CSS_ROOTS,
  consumerRoots = DEFAULT_CONSUMER_ROOTS,
  evidenceRoot = DEFAULT_EVIDENCE_ROOT,
  round = DEFAULT_ROUND,
  artifactPath = undefined,
  requireArtifact = false,
  drill = null,
} = {}) {
  const tenantThemeSource = readFileSync(tenantThemeContractPath, 'utf8');
  const brandThemeSource = readFileSync(brandThemeCompilerPath, 'utf8');
  const { rows: familyRows } = loadFamilyRows(familyInventoryPath);

  const cssFiles = collectSourceFiles(cssRoots, ['.css'], CORE_ROOT);
  const tsFiles = collectSourceFiles(cssRoots, ['.ts', '.tsx'], CORE_ROOT);
  const cssStylesheets = readStylesheets(cssFiles, CORE_ROOT);
  const tsStylesheets = readStylesheets(tsFiles, CORE_ROOT);

  const resolvedArtifactPath = artifactPath === undefined ? defaultArtifactPath({ evidenceRoot, round }) : artifactPath;

  // Defect 2: under `--check` (requireArtifact === true), the artifact is
  // MANDATORY -- missing is a real failure, not an informational note.
  // Plain report mode (requireArtifact === false, e.g. before the first
  // --write) still surfaces the same fact as a non-blocking note so the
  // human-readable report stays useful before any artifact exists.
  let previousArtifact = null;
  let evidenceNote = null;
  const preFailures = [];
  if (!existsSync(resolvedArtifactPath)) {
    if (requireArtifact) {
      preFailures.push(
        `missing artifact: ${relative(CORE_ROOT, resolvedArtifactPath)} is required by --check and has not been written -- run --write to (re)generate it`,
      );
    } else {
      evidenceNote = `${relative(CORE_ROOT, resolvedArtifactPath)} has not been written yet -- run --write to (re)generate it; this producer still reports the live state below`;
    }
  } else {
    try {
      previousArtifact = JSON.parse(readFileSync(resolvedArtifactPath, 'utf8'));
    } catch (error) {
      preFailures.push(
        `stale output: ${relative(CORE_ROOT, resolvedArtifactPath)} is present but not valid JSON (${error instanceof Error ? error.message : String(error)}) -- regenerate with --write`,
      );
    }
  }

  const result = analyzeChannelLiveness({
    tenantThemeSource,
    brandThemeSource,
    familyRows,
    cssStylesheets,
    tsStylesheets,
    consumerRoots,
    previousArtifact,
    enforceArtifactFreshness: requireArtifact,
    drill,
  });

  const failures = [...preFailures, ...result.failures];
  return {
    ok: failures.length === 0,
    failures,
    evidenceNote,
    result,
    resolvedArtifactPath,
    corpus: { cssFileCount: cssFiles.length, tsFileCount: tsFiles.length },
  };
}

/* ---------------------------------------------------------------------- */
/* 13. Reporting + CLI                                                    */
/* ---------------------------------------------------------------------- */

export function buildArtifact(gateRun, { round = DEFAULT_ROUND, evidenceRoot = DEFAULT_EVIDENCE_ROOT } = {}) {
  const { result, corpus } = gateRun;
  return {
    schemaVersion: 2,
    generatedBy: 'scripts/tokens/channel-liveness-gate/index.mjs --write',
    roundId: round ?? DEFAULT_ROUND,
    sourceDigest: result.sourceDigest,
    scopeLaw:
      'Tenant-channel liveness ledger scoped to TENANT_THEME_OVERRIDE_TOKENS ∪ TENANT_THEME_REFERENCE_TOKENS ∪ brand-theme-compiler-emitted names, plus the app-bithire external consumerRoot. NOT the customization-surface-census.mjs dead-writer census. NOT tenant-channel-consumer-gate.mjs. NOT theme-channel-parity-gate.mjs. No classification asserts a channel is dead, but membership on TENANT_THEME_REFERENCE_TOKENS never protects a row from a NO-GO finding by itself -- only a proven finite terminal-paint chain (in-repo or via a required consumerRoot) does that.',
    inputs: {
      tenantThemeContract: relative(CORE_ROOT, DEFAULT_TENANT_THEME_CONTRACT).split(sep).join('/'),
      brandThemeCompiler: relative(CORE_ROOT, DEFAULT_BRAND_THEME_COMPILER).split(sep).join('/'),
      familyInventory: relative(CORE_ROOT, DEFAULT_FAMILY_INVENTORY).split(sep).join('/'),
      evidenceContract: relative(CORE_ROOT, DEFAULT_EVIDENCE_CONTRACT).split(sep).join('/'),
      ciGatesManifest: relative(CORE_ROOT, DEFAULT_CI_GATES_MANIFEST).split(sep).join('/'),
      packageJson: relative(CORE_ROOT, DEFAULT_PACKAGE_JSON).split(sep).join('/'),
      cssRoots: DEFAULT_CSS_ROOTS.map((root) => relative(CORE_ROOT, root).split(sep).join('/')),
      cssFileCount: corpus.cssFileCount,
      tsFileCount: corpus.tsFileCount,
    },
    consumerRoots: result.consumerRoots,
    counts: result.counts,
    analysisLimitations: result.analysisLimitations,
    channels: result.channels,
  };
}

export function formatReport(gateRun) {
  const { ok, failures, evidenceNote, result, corpus, resolvedArtifactPath } = gateRun;
  const lines = [];
  lines.push(
    `channel-liveness-gate: universe=${result.counts.universe} declaredOverride=${result.counts.declaredOverride} declaredReference=${result.counts.declaredReference} emitted=${result.counts.emitted}`,
  );
  lines.push(`  corpus: css=${corpus.cssFileCount} ts=${corpus.tsFileCount}`);
  lines.push(
    `  family attribution: resolved=${result.counts.attributedReadSites} unattributed=${result.counts.unattributedReadSites} unattributedShared=${result.counts.unattributedSharedReadSites} unknown=${result.counts.unknownFamilySites}`,
  );
  lines.push('  consumerRoots:');
  for (const consumer of result.consumerRoots) {
    lines.push(
      `    ${consumer.id}: ${consumer.ok ? `ok css=${consumer.cssFileCount} ts=${consumer.tsFileCount}` : `FAILED -- ${consumer.error}`}`,
    );
  }
  lines.push('  by classification:');
  for (const [classification, count] of Object.entries(result.counts.byClassification)) {
    lines.push(`    ${classification}: ${count}`);
  }
  if (resolvedArtifactPath) {
    lines.push(`  artifact path (freshness/ratchet anchor): ${relative(CORE_ROOT, resolvedArtifactPath)}`);
  }
  if (evidenceNote) {
    lines.push(`  evidence note (non-blocking): ${evidenceNote}`);
  }
  const tintProbe = result.channels.filter((row) => row.name === '--ds-tint-4' || row.name === '--ds-tint-16');
  for (const row of tintProbe) {
    lines.push(
      `  ${row.name}: classification=${row.classification} declaredReference=${row.declaredReference} externalConsumerPainted=${row.externalConsumerPainted} reads.total=${row.reads.total}`,
    );
  }
  if (ok) {
    lines.push('channel-liveness-gate OK');
  } else {
    lines.push(`channel-liveness-gate FAIL -- ${failures.length} finding(s):`);
    for (const failure of failures) lines.push(`  - ${failure}`);
  }
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const write = args.includes('--write');
  const json = args.includes('--json');
  const roundFlagIndex = args.indexOf('--round');
  const round = roundFlagIndex === -1 ? DEFAULT_ROUND : args[roundFlagIndex + 1] ?? DEFAULT_ROUND;
  const artifactFlagIndex = args.indexOf('--artifact-path');
  const artifactPath = artifactFlagIndex === -1 ? undefined : resolve(args[artifactFlagIndex + 1]);

  if (write) {
    // --write's own job is to (re)create the artifact, so it must NOT
    // require the artifact to already exist; it evaluates the PURE
    // analysis (`result`) instead of the full `gateRun` (which would
    // otherwise always be red the very first time there is nothing to
    // write yet).
    const gateRun = runGate({ round, artifactPath, requireArtifact: false });
    const { result } = gateRun;
    if (!result.ok || result.analysisLimitations.length > 0) {
      console.error('[channel-liveness-gate] --write REFUSED: the analysis is red or limited; a generated-only artifact must never assert what the analysis could not prove.');
      console.error(formatReport(gateRun));
      process.exitCode = 1;
      return;
    }
    const evidenceRoot = DEFAULT_EVIDENCE_ROOT;
    const targetPath = artifactPath ?? defaultArtifactPath({ evidenceRoot, round });
    const artifact = buildArtifact(gateRun, { round, evidenceRoot });
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `${JSON.stringify(artifact, null, 2)}\n`);
    console.log(`[channel-liveness-gate] wrote ${relative(CORE_ROOT, targetPath)} (${artifact.channels.length} channels)`);
    return;
  }

  const gateRun = runGate({ round, artifactPath, requireArtifact: check });

  if (json) {
    process.stdout.write(`${JSON.stringify(buildArtifact(gateRun, { round }), null, 2)}\n`);
    return;
  }

  const report = formatReport(gateRun);
  if (gateRun.ok) console.log(report);
  else console.error(report);

  if (check) process.exitCode = gateRun.ok ? 0 : 1;
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
