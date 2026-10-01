#!/usr/bin/env node
/**
 * channel-liveness-gate — the canonical PRODUCER for the generated-only
 * WO-CRA-23 evidence artifact `channel-liveness.json`.
 *
 * `evidence-contract/index.json` names this file twice: it is pre-declared
 * vocabulary in `roundLayout` (the union of allowed round artifacts) and it
 * is listed in `generatedOnly` (machine-produced, never hand-edited). The
 * modern-rescue canon (`README.md`, execution gate 5) reads "complete
 * control/family edges, recipe groups and CHANNEL LIVENESS" — this file is
 * the CHANNEL LIVENESS instrument for that gate. R7 stays disabled
 * (`program/index.json#r7Enabled === false`); this producer runs under R0-R6 only
 * and never touches `program/index.json`.
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
 * `baseline/index.json`'s own `_adoptions` note
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
 * independent auditors plus two model reviews (design authority, independent audit) found that
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
 *   node scripts/check/tokens/cascade/channels/liveness/index.mjs                  # human report
 *   node scripts/check/tokens/cascade/channels/liveness/index.mjs --check           # fail-closed CI gate (requires R1 artifact)
 *   node scripts/check/tokens/cascade/channels/liveness/index.mjs --check-dispositions # fail-closed OWNERSHIP gate: every non-LIVE row pinned, every pin still owed
 *   node scripts/check/tokens/cascade/channels/liveness/index.mjs --json             # full JSON report to stdout
 *   node scripts/check/tokens/cascade/channels/liveness/index.mjs --write [--round R1] [--artifact-path <p>]
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../../libraries/repo-root/index.mjs';

const require = createRequire(import.meta.url);
const postcssModule = require('postcss');
const postcss = postcssModule.default ?? postcssModule;

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPTS_DIR = dirname(SCRIPT_PATH);

export const CORE_ROOT = findPackageRoot(SCRIPTS_DIR);

/**
 * Where the SIBLING repos live -- `app-bithire` among them -- which is one
 * level above `ui-design-system`.
 *
 * A linked git worktree is not beside its siblings: it sits under its own
 * worktrees directory, so `parent-of-the-checkout` resolves to a directory that
 * has no `app-bithire` in it and the required consumerRoot reads as missing.
 * That demoted eleven externally-painted channels to a non-LIVE class, which
 * this gate would then report as eleven unowned rows -- a wrong measurement
 * dressed as a finding. A linked worktree's `.git` is a FILE pointing into the
 * main checkout's `.git/worktrees/<name>`, so the main checkout is readable
 * from it and the siblings are beside THAT.
 */
export function siblingReposRoot(fromDir = SCRIPTS_DIR) {
  const checkout = findRepoRoot(fromDir);
  const gitPath = join(checkout, '.git');
  const marker = `${sep}.git${sep}worktrees${sep}`;
  try {
    if (statSync(gitPath).isFile()) {
      const pointer = /^gitdir:\s*(.+)$/m.exec(readFileSync(gitPath, 'utf8'))?.[1]?.trim();
      if (pointer && pointer.includes(marker)) {
        return resolve(pointer.slice(0, pointer.indexOf(marker)), '..');
      }
    }
  } catch {
    // A checkout with no readable `.git` is the plain case: fall through.
  }
  return resolve(checkout, '..');
}

export const REPO_ROOT = siblingReposRoot();
export const DEFAULT_TENANT_THEME_CONTRACT = resolve(
  CORE_ROOT,
  'src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts',
);
/**
 * The channel assembly is one deriver per family behind a ranked merge, so the
 * compiler corpus is a DIRECTORY: every `<family>/index.ts` under the
 * derivation registry is a producer, and reading only one of them would leave
 * the others' channels unowned. A new family is covered the moment it lands.
 */
export const DEFAULT_BRAND_THEME_COMPILER_ROOT = resolve(
  CORE_ROOT,
  'src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation',
);
/**
 * Every family deriver under the registry, with the rank it declares.
 *
 * The rank is read from the source because it is what makes a repeated channel
 * legible: two families naming one channel at DIFFERENT ranks is precedence
 * (a tenant statement over a derivation), while two families naming it at the
 * SAME rank is a duplicate producer with no answer.
 *
 * THE REGISTRY IS A TREE, NOT A LIST. Reading only `<root>/<family>/index.ts`
 * was true when every family was one file. It stopped being true when families
 * grew sub-owners: `typography/{pairing,scale,weights,roles,numeric}` and
 * `elevation/{ladder,z-index}` hold the actual `vars[...]` assignments while
 * their parent only composes them, so a non-recursive read saw a parent that
 * emits nothing and called the family covered. The walk is recursive, and a
 * sub-owner INHERITS its family's rank: it is a layer of one authority, not a
 * competing one, which is exactly why the parent is the only file that states
 * a rank.
 */
const DECLARES_FAMILY = /\b(?:family|rank):\s*["']/;

export function collectFlatThemeCompilerSources(
  root = DEFAULT_BRAND_THEME_COMPILER_ROOT,
) {
  const sources = [];
  const walk = (directory, family, inheritedRank) => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries.filter((item) => item.isDirectory())) {
      const child = join(directory, entry.name);
      const file = join(child, 'index.ts');
      let rank = inheritedRank;
      const text = existsSync(file) ? readFileSync(file, 'utf8') : null;
      // In a family registry a first-level folder is a family only if it declares one; a helper that writes no channel is not.
      const helper = registry && text !== null && family === null && !DECLARES_FAMILY.test(text) && !/\bvars\[/.test(text);
      if (text !== null && !helper) {
        const declaredRank = /\brank:\s*["']([a-zA-Z-]+)["']/.exec(text)?.[1] ?? null;
        rank = declaredRank ?? inheritedRank ?? 'unranked';
        sources.push({
          path: file,
          relativePath: `packages/core/${relative(CORE_ROOT, file).split(sep).join('/')}`,
          text,
          rank,
          family: family ?? entry.name,
          declaresRank: declaredRank !== null,
        });
      }
      walk(child, family ?? entry.name, rank);
    }
  };
  let registry = false;
  try {
    registry = readdirSync(root, { withFileTypes: true }).some((entry) => {
      const file = join(root, entry.name, 'index.ts');
      return entry.isDirectory() && existsSync(file) && DECLARES_FAMILY.test(readFileSync(file, 'utf8'));
    });
  } catch {
    registry = false;
  }
  walk(root, null, null);
  return sources.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export const DEFAULT_FAMILY_INVENTORY = resolve(
  CORE_ROOT,
  'scripts/check/modern-rescue/family-inventory/index.json',
);
export const DEFAULT_EVIDENCE_CONTRACT = resolve(
  CORE_ROOT,
  'scripts/check/modern-rescue/evidence-contract/index.json',
);
export const DEFAULT_CI_GATES_MANIFEST = resolve(CORE_ROOT, 'scripts/check/automation/gates/manifest/index.mjs');
export const DEFAULT_PACKAGE_JSON = resolve(CORE_ROOT, 'package.json');
export const DEFAULT_CSS_ROOTS = Object.freeze([
  resolve(CORE_ROOT, 'src/foundation/tokens/css'),
  resolve(CORE_ROOT, 'src/components'),
]);
/**
 * The single declaration site of the `--ds-z-index-*` scale. The canonical
 * roster is MEASURED from this file on every run (`deriveCanonicalZScaleRoster`),
 * never listed by hand here; the z-index-single-scale invariant keeps every
 * band declared there and nowhere else.
 */
export const DEFAULT_Z_INDEX_SCALE_OWNER = resolve(
  CORE_ROOT,
  'src/foundation/tokens/css/foundation/base/z-index/index.css',
);
export const DEFAULT_EVIDENCE_ROOT = resolve(
  CORE_ROOT,
  'artifacts/quality/programs/modern-rescue',
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
    // The compiled artifact this app renders under; it decides which DS
    // declarations a consumer read actually resolves through (see `computeJoinedPaint`).
    vertical: 'bithire',
  }),
]);

/** The checkout a cited probe spec path is relative to (the workspace root, never a sibling repo). */
export const CHECKOUT_ROOT = findRepoRoot(SCRIPTS_DIR);

/**
 * Declared browser-probe evidence: the same declaration family as
 * `DEFAULT_CONSUMER_ROOTS` -- a frozen, read-only source this producer walks
 * but never executes -- for a terminal no stylesheet graph can contain (canvas
 * pixels, an inline style stamped on a portalled node). A valid entry
 * classifies its channel `LIVE_PROBE_PAINTED`, which is NARROWER than every
 * graph class in one stated way: it certifies paint through the cited probe,
 * not through the cascade graph. The citation is the contract and the spec's
 * own e2e leg is the execution, so the instrument proves only that the
 * citation still resolves, and it fails closed when it does not:
 *
 *   - the spec must exist under the checkout (`probe evidence spec missing`);
 *   - the comment-masked spec must contain no `.skip(` / `.fixme(` anywhere:
 *     a disabled probe is not evidence, and a certification spec is not where
 *     parked tests live (`probe evidence disabled`);
 *   - every cited title must be the verbatim first argument of a `test(...)`
 *     call in the comment-masked spec, so a renamed test breaks the gate
 *     (`probe evidence title missing`);
 *   - a LITERAL title binds only the channel its own call names: the channel
 *     literal, or a const bound to it, must appear between the title and the
 *     end of that `test(...)` call (`probe evidence unbound`);
 *   - a TEMPLATED title (`${...}`) is bound at spec level only: the spec must
 *     name the channel as a string literal somewhere. That proves the spec
 *     probes the channel, NOT that the cited parameterized test is the case
 *     that does (`probe evidence unbound`);
 *   - the channel must still be measured, and must not already paint through
 *     the graph -- a graph terminal is stronger evidence and the entry is then
 *     deleted (`probe evidence stale` / `probe evidence superseded`).
 *
 * A pin for a channel entered here is discharged by the ownership law in the
 * same commit: the row is LIVE, so `adjudicateDispositions` accuses the pin.
 * A probe row's residual design decision is registered with its owning work
 * order in the roadmap, never in this register.
 */
export const DEFAULT_PROBE_EVIDENCE = Object.freeze([
  Object.freeze({
    channel: '--ds-app-shell-navigation-drawer-body-padding',
    spec: 'packages/showroom/e2e/liveness/paint-probes.spec.ts',
    tests: Object.freeze(['--ds-app-shell-navigation-drawer-body-padding paints the Modern Sheet body']),
    proves:
      'the computed padding of the portalled Modern Sheet body follows the channel 0 -> 7px -> 13px -> 0 through the inline bodyStyle the app shell stamps',
    registered: '2026-10-01',
  }),
  Object.freeze({
    channel: '--ds-workspace-shell-particle-primary',
    spec: 'packages/showroom/e2e/liveness/paint-probes.spec.ts',
    tests: Object.freeze(['${probe.channel}: paints the canvas pixels at rest and under an override']),
    proves:
      'the workspace-shell canvas pixels (getImageData) carry the pinned rest ink, and an override of the channel lands as the dominant ink at a share above 0.9',
    registered: '2026-10-01',
  }),
  Object.freeze({
    channel: '--ds-workspace-shell-particle-secondary',
    spec: 'packages/showroom/e2e/liveness/paint-probes.spec.ts',
    tests: Object.freeze(['${probe.channel}: paints the canvas pixels at rest and under an override']),
    proves:
      'the workspace-shell ambient canvas pixels (getImageData) carry the pinned rest ink, and an override of the channel lands as the dominant ink at a share above 0.9',
    registered: '2026-10-01',
  }),
]);

const TEST_CALL_RE = /(?<![.\w$])test(?:\.only)?(\()\s*(['"`])/dg;

function skipQuoted(text, index) {
  const quote = text[index];
  let cursor = index + 1;
  while (cursor < text.length && text[cursor] !== quote) cursor += text[cursor] === '\\' ? 2 : 1;
  return cursor + 1;
}

/** The index just past the `)` that closes the call opened at `open`. */
function callEnd(text, open) {
  const closers = [')'];
  let cursor = open + 1;
  while (cursor < text.length && closers.length > 0) {
    const char = text[cursor];
    if (closers.at(-1) === '`') {
      if (char === '\\') cursor += 2;
      else if (char === '`') (closers.pop(), (cursor += 1));
      else if (char === '$' && text[cursor + 1] === '{') (closers.push('}'), (cursor += 2));
      else cursor += 1;
      continue;
    }
    if (char === "'" || char === '"') {
      cursor = skipQuoted(text, cursor);
      continue;
    }
    if (char === '`') closers.push('`');
    else if (char === '(') closers.push(')');
    else if (char === '{') closers.push('}');
    else if (char === '[') closers.push(']');
    else if (char === ')' || char === '}' || char === ']') closers.pop();
    cursor += 1;
  }
  return Math.min(cursor, text.length);
}

/** Every `test(...)` call in a comment-masked spec: verbatim title, whether it is a `${...}` template, and its span to the closing paren. */
export function extractSpecTests(specText) {
  const scanned = maskSourceComments(specText);
  const tests = [];
  for (const match of scanned.matchAll(TEST_CALL_RE)) {
    const quote = match[2];
    const start = match.indices[2][1];
    const close = skipQuoted(scanned, start - 1) - 1;
    const title = scanned.slice(start, close);
    tests.push({
      title,
      templated: quote === '`' && title.includes('${'),
      span: scanned.slice(start - 1, callEnd(scanned, match.indices[1][0])),
    });
  }
  return tests;
}

/** The verbatim first-argument titles of every `test(...)` call in a comment-masked spec. */
export function extractSpecTestTitles(specText) {
  return new Set(extractSpecTests(specText).map((entry) => entry.title));
}

/**
 * Validate every declared probe citation against the spec text on disk.
 * Returns the channels whose citation resolves, and a named failure for every
 * one that does not; an invalid entry never classifies its channel.
 */
export function loadProbeEvidence(entries = DEFAULT_PROBE_EVIDENCE, { checkoutRoot = CHECKOUT_ROOT } = {}) {
  const failures = [];
  const valid = new Map();
  const specs = [];
  const seen = new Set();
  for (const entry of entries) {
    const label = entry?.channel ?? '(no channel)';
    if (seen.has(entry?.channel)) {
      failures.push(`probe evidence duplicate: ${label} is cited more than once -- a channel has exactly one probe citation`);
      continue;
    }
    seen.add(entry?.channel);
    const malformed =
      typeof entry?.channel !== 'string' ||
      !entry.channel.startsWith('--ds-') ||
      typeof entry.spec !== 'string' ||
      entry.spec.startsWith('/') ||
      entry.spec.split('/').includes('..') ||
      !Array.isArray(entry.tests) ||
      entry.tests.length === 0 ||
      entry.tests.some((title) => typeof title !== 'string' || title.trim() === '') ||
      typeof entry.proves !== 'string' ||
      entry.proves.trim() === '' ||
      entry.proves.includes('\n');
    if (malformed) {
      failures.push(
        `probe evidence malformed: ${label} -- an entry names a --ds-* channel, a checkout-relative spec path, at least one test title and a one-line statement of what the probe proves`,
      );
      continue;
    }
    const specPath = resolve(checkoutRoot, entry.spec);
    let specText;
    try {
      specText = readFileSync(specPath, 'utf8');
    } catch {
      failures.push(
        `probe evidence spec missing: ${entry.channel} cites ${entry.spec}, which does not exist under the checkout -- a moved or deleted probe spec leaves the citation proving nothing`,
      );
      continue;
    }
    specs.push({ file: entry.spec, text: specText });
    const scanned = maskSourceComments(specText);
    const disabled = /\.(?:skip|fixme)\(/.test(scanned);
    if (disabled) {
      failures.push(
        `probe evidence disabled: ${entry.channel} cites ${entry.spec}, which contains .skip( or .fixme( -- a disabled probe proves nothing, and a certification spec carries no parked tests`,
      );
    }
    const declared = extractSpecTests(specText);
    const missing = entry.tests.filter((title) => !declared.some((probe) => probe.title === title));
    for (const title of missing) {
      failures.push(
        `probe evidence title missing: ${entry.channel} cites "${title}" in ${entry.spec}, and no test(...) in that spec declares that title verbatim -- a renamed test is a broken citation, never a silent one`,
      );
    }
    const escaped = entry.channel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const literal = new RegExp(`(['"\`])${escaped}\\1`);
    const aliases = [...scanned.matchAll(new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*(?::[^=;]+)?=\\s*(['"\`])${escaped}\\2`, 'g'))].map(
      (match) => new RegExp(`(?<![\\w$.])${match[1].replace(/\$/g, '\\$')}(?![\\w$])`),
    );
    const names = (text) => literal.test(text) || aliases.some((alias) => alias.test(text));
    let bound = true;
    for (const title of entry.tests.filter((cited) => !missing.includes(cited))) {
      const cases = declared.filter((probe) => probe.title === title);
      if (cases.some((probe) => probe.templated)) {
        if (!literal.test(scanned)) {
          bound = false;
          failures.push(
            `probe evidence unbound: ${entry.spec} never names ${entry.channel} as a string literal -- the cited probe cannot be proving a channel it does not mention`,
          );
        }
      } else if (!cases.some((probe) => names(probe.span))) {
        bound = false;
        failures.push(
          `probe evidence unbound: ${entry.channel} cites "${title}" in ${entry.spec}, and that test's own call never names the channel (a string literal or a const bound to one) -- a literal title binds only the channel its own probe reads`,
        );
      }
    }
    if (missing.length === 0 && bound && !disabled) {
      valid.set(entry.channel, { spec: entry.spec, tests: [...entry.tests], proves: entry.proves, registered: entry.registered ?? null });
    }
  }
  return { valid, failures, specs };
}

/**
 * The compiled first-party tenant artifacts: one `<vertical>/index.css` per
 * vertical, the committed compileTheme output the parity gates hold equal to
 * the compiler. They enter the measurement in two roles and no other:
 *
 *   - EMISSION: a name declared in an artifact is emitted, whatever the source
 *     extractor can or cannot see (the tint and colour ramps are written by
 *     lowering helpers outside the derivation root).
 *   - CUSTOM-PROPERTY EDGES: `--a: var(--b)` in an artifact is the value one
 *     compiler step hands another (`--ds-alert-error-wash-subtle:
 *     var(--ds-tint-error-4)`), so it is an edge exactly like an authored one.
 *
 * Never a TERMINAL: a non-custom declaration in an artifact is the compiler's
 * own scope chrome, and letting the compiler's output certify the compiler's
 * channels would be the instrument grading itself. Paint is still only proven
 * at an authored stylesheet terminal (DS or consumerRoot).
 */
export const DEFAULT_COMPILED_ARTIFACT_ROOT = resolve(CORE_ROOT, 'src/foundation/tokens/css/facade/artifacts');

/** Every `<vertical>/index.css` under the artifact root, as `{ vertical, file, text }`. */
export function loadCompiledArtifacts(root = DEFAULT_COMPILED_ARTIFACT_ROOT) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, 'index.css')))
    .map((entry) => entry.name)
    .sort()
    .map((vertical) => {
      const path = join(root, vertical, 'index.css');
      return {
        vertical,
        file: relative(CORE_ROOT, path).split(sep).join('/'),
        text: readFileSync(path, 'utf8'),
      };
    });
}

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
 * The source with every line and block comment blanked and every byte offset,
 * length and newline position preserved, so a line number stays exact.
 */
export function maskSourceComments(sourceText) {
  const blank = (slice) => slice.replace(/[^\n]/g, ' ');
  let out = '';
  let index = 0;
  while (index < sourceText.length) {
    const char = sourceText[index];
    const next = sourceText[index + 1];
    const escaped = sourceText[index - 1] === '\\';
    if (char === '/' && next === '/' && !escaped) {
      const end = sourceText.indexOf('\n', index);
      const stop = end === -1 ? sourceText.length : end;
      out += blank(sourceText.slice(index, stop));
      index = stop;
    } else if (char === '/' && next === '*' && !escaped) {
      const end = sourceText.indexOf('*/', index + 2);
      const stop = end === -1 ? sourceText.length : end + 2;
      out += blank(sourceText.slice(index, stop));
      index = stop;
    } else if (char === '"' || char === "'" || char === '`') {
      let cursor = index + 1;
      while (cursor < sourceText.length && sourceText[cursor] !== char) {
        cursor += sourceText[cursor] === '\\' ? 2 : 1;
      }
      const stop = Math.min(cursor + 1, sourceText.length);
      out += sourceText.slice(index, stop);
      index = stop;
    } else {
      out += char;
      index += 1;
    }
  }
  return out;
}

/**
 * Every `vars["--ds-x"] = ...` / `vars['--ds-x'] = ...` direct literal
 * assignment in the file, with line numbers. Multiple sites per name are
 * kept (never deduped) so the caller can fail on repetition (defect 5).
 * A name quoted inside a comment is prose about an emission, not one.
 */
export function extractDirectVarsAssignments(sourceText) {
  const offsets = buildLineIndex(sourceText);
  const scanned = maskSourceComments(sourceText);
  const sites = new Map();
  const re = /vars\[\s*(['"])(--ds-[a-z0-9-]+)\1\s*\]\s*=/g;
  let match;
  while ((match = re.exec(scanned)) !== null) {
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
    sites.push({ raw: match[1], line: lineForOffset(offsets, match.index), index: match.index });
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

/* ---------------------------------------------------------------------- */
/* 3b. Emission keys that are NOT string literals                         */
/* ---------------------------------------------------------------------- */

/*
 * A `vars[...]` key is a string literal in most families, and the literal
 * scanner above owns those. It is not always one:
 *
 *   vars[DENSITY_MODE_FACTOR_VARIABLE] = ...            a named constant
 *   if (PAIRING_CHANNELS.has(channel)) vars[channel] =  a named roster
 *   vars[`--ds-z-index-${band}`] = ...                  a template over a table
 *
 * The first two were invisible to BOTH scanners -- not reported, not counted,
 * silently absent from the emitted universe. The third was reported as an
 * unresolved pattern, which is honest but leaves the channels uncounted. The
 * resolver below turns each shape into concrete names when its domain is a
 * literal this file (or one import hop away) states, and reports it as an
 * unresolved emission pattern when it is not. A negated membership guard is
 * deliberately in the second class: the complement of a roster over a table
 * computed elsewhere is not enumerable from source.
 */

const TS_MODULE_SUFFIXES = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
const MAX_ROSTER_HOPS = 4;

/** The in-package module a derivation import names, or null for anything else. */
export function resolveDerivationImport(fromFile, specifier, coreRoot = CORE_ROOT) {
  const base = specifier.startsWith('@/')
    ? join(coreRoot, 'src', specifier.slice(2))
    : specifier.startsWith('.') ? resolve(dirname(fromFile), specifier) : null;
  if (base === null) return null;
  return TS_MODULE_SUFFIXES.map((suffix) => `${base}${suffix}`).find((candidate) => existsSync(candidate)) ?? null;
}

/** Every `const NAME = <expr>` initializer in a module, by name. */
export function topLevelConstExpressions(sourceText) {
  const found = new Map();
  const re = /(?:^|[\n;])\s*(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*(?::[^=;]*)?=\s*/gu;
  let match;
  while ((match = re.exec(sourceText)) !== null) {
    const start = match.index + match[0].length;
    let depth = 0;
    let quote = null;
    let index = start;
    for (; index < sourceText.length; index += 1) {
      const ch = sourceText[index];
      if (quote) {
        if (ch === '\\') index += 1;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '(' || ch === '[' || ch === '{') { depth += 1; continue; }
      if (ch === ')' || ch === ']' || ch === '}') { depth -= 1; continue; }
      if (ch === ';' && depth === 0) break;
    }
    found.set(match[1], sourceText.slice(start, index).trim());
  }
  return found;
}

/** Every named import binding in a module, as `local -> { specifier, imported }`. */
export function namedImportBindings(sourceText) {
  const bindings = new Map();
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/gu;
  let match;
  while ((match = re.exec(sourceText)) !== null) {
    for (const raw of match[1].split(',')) {
      const parts = raw.trim().replace(/^type\s+/u, '').split(/\s+as\s+/u);
      if (parts[0].length === 0) continue;
      bindings.set((parts[1] ?? parts[0]).trim(), { specifier: match[2], imported: parts[0].trim() });
    }
  }
  return bindings;
}

function moduleFacts(file, text, cache) {
  const known = cache.get(file);
  if (known) return known;
  const facts = { file, text, consts: topLevelConstExpressions(text), imports: namedImportBindings(text) };
  cache.set(file, facts);
  return facts;
}

const OBJECT_KEY_RE = /^(?:(['"])([^'"]+)\1|([A-Za-z_$][\w$]*))\s*:/u;

/**
 * The literal names an expression enumerates, or null when it does not
 * enumerate literally. Null is the fail-closed answer: the caller turns it
 * into a reported unresolved pattern and never into "emits nothing".
 */
function enumerateLiterals(expression, facts, cache, coreRoot, depth) {
  if (depth > MAX_ROSTER_HOPS) return null;
  const text = expression.replace(/\s+as\s+const\s*$/u, '').trim();
  const single = /^(['"])([^'"]*)\1$/u.exec(text);
  if (single) return [single[2]];
  const call = /^(?:new\s+Set(?:<[^>]*>)?|Object\.freeze|Object\.keys|Object\.entries|Object\.values)\s*\(/u.exec(text);
  if (call) {
    const inner = extractBracketBlock(text, text.slice(0, call[0].length), '(', ')');
    return inner === null ? null : enumerateLiterals(inner, facts, cache, coreRoot, depth + 1);
  }
  if (text.startsWith('[')) {
    const body = extractBracketBlock(text, '[', '[', ']');
    if (body === null) return null;
    const names = [];
    for (const item of splitTopLevelListItems(body)) {
      const literal = /^(['"])([^'"]*)\1$/u.exec(item);
      if (literal) { names.push(literal[2]); continue; }
      const spread = /^\.\.\.\s*([A-Za-z_$][\w$]*)$/u.exec(item);
      const identifier = spread ?? /^([A-Za-z_$][\w$]*)$/u.exec(item);
      if (!identifier) return null;
      const nested = resolveRoster(identifier[1], facts, cache, coreRoot, depth + 1);
      if (nested === null) return null;
      names.push(...nested);
    }
    return names;
  }
  if (text.startsWith('{')) {
    const body = extractBracketBlock(text, '{', '{', '}');
    if (body === null) return null;
    const keys = [];
    for (const item of splitTopLevelListItems(body)) {
      const key = OBJECT_KEY_RE.exec(item);
      if (!key) return null;
      keys.push(key[2] ?? key[3]);
    }
    return keys;
  }
  if (/^[A-Za-z_$][\w$]*$/u.test(text)) return resolveRoster(text, facts, cache, coreRoot, depth + 1);
  return null;
}

/**
 * An enumeration that came back EMPTY is not an answer.
 *
 * `typography/scale` declares `const entries: string[] = []` and fills it in a
 * loop; reading its initializer literally yields zero names, which would have
 * certified "this template emits nothing" for a template that emits the whole
 * type ramp. An empty literal domain is therefore refused like any other shape
 * this resolver cannot read.
 */
function nonEmpty(names) {
  return names === null || names.length === 0 ? null : names;
}

/** The literal names one identifier stands for, following at most one import chain. */
function resolveRoster(name, facts, cache, coreRoot, depth) {
  if (depth > MAX_ROSTER_HOPS) return null;
  const own = facts.consts.get(name);
  if (own !== undefined) return enumerateLiterals(own, facts, cache, coreRoot, depth);
  const imported = facts.imports.get(name);
  if (!imported || facts.file === null) return null;
  const target = resolveDerivationImport(facts.file, imported.specifier, coreRoot);
  if (target === null) return null;
  let text;
  try {
    text = readFileSync(target, 'utf8');
  } catch {
    return null;
  }
  return resolveRoster(imported.imported, moduleFacts(target, text, cache), cache, coreRoot, depth + 1);
}

/**
 * A family's `produces:` roster, read as the emission oracle: exact names, `prefix*` globs, and every member this
 * reader could not enumerate (reported, never dropped). A spread resolves through the same literal resolver as keys.
 */
export function extractProducesRoster(sourceText, { file = null, coreRoot = CORE_ROOT } = {}) {
  const offsets = buildLineIndex(sourceText);
  const cache = new Map();
  const facts = moduleFacts(file ?? '<inline>', sourceText, cache);
  const roster = { exact: [], globs: [], unresolved: [] };
  const marker = /\bproduces:\s*\[/gu;
  let match;
  while ((match = marker.exec(sourceText)) !== null) {
    const line = lineForOffset(offsets, match.index);
    const body = extractBracketBlock(sourceText.slice(match.index), match[0], '[', ']');
    if (body === null) {
      roster.unresolved.push({ raw: 'produces: [', line, reason: 'the roster array does not close' });
      continue;
    }
    for (const item of splitTopLevelListItems(body)) {
      const literal = /^(['"])([^'"]*)\1$/u.exec(item);
      if (literal) {
        const entry = literal[2];
        if (/^--ds-[a-z0-9-]*\*$/u.test(entry)) roster.globs.push({ prefix: entry.slice(0, -1), line });
        else if (/^--ds-[a-z0-9-]+$/u.test(entry)) roster.exact.push({ name: entry, line });
        else roster.unresolved.push({ raw: item, line, reason: 'a roster literal that is neither a channel name nor a `prefix*` glob' });
        continue;
      }
      const spread = /^\.\.\.\s*(?:\(\s*([\s\S]*?)\s+as\s+[\s\S]*\)|([\s\S]+))$/u.exec(item);
      const names = spread === null ? null : nonEmpty(enumerateLiterals((spread[1] ?? spread[2]).trim(), facts, cache, coreRoot, 0));
      if (names === null) {
        roster.unresolved.push({ raw: item, line, reason: 'a roster member this reader cannot enumerate to literal names' });
        continue;
      }
      for (const name of names) {
        if (/^--ds-[a-z0-9-]+$/u.test(name)) roster.exact.push({ name, line });
        else roster.unresolved.push({ raw: name, line, reason: 'a spread roster member that is not a channel name' });
      }
    }
  }
  return roster;
}

/** True when `name` is one of the roster's exact names or sits under one of its globs. */
export function rosterCovers(roster, name) {
  return roster.exact.some((entry) => entry.name === name) || roster.globs.some((glob) => name.startsWith(glob.prefix));
}

/** Every `vars[<identifier>] = ...` assignment, with the guard that precedes it. */
export function extractIdentifierVarsAssignments(sourceText) {
  const offsets = buildLineIndex(sourceText);
  const sites = [];
  const re = /vars\[\s*([A-Za-z_$][\w$]*)\s*\]\s*=/gu;
  let match;
  while ((match = re.exec(sourceText)) !== null) {
    const window = sourceText.slice(Math.max(0, match.index - 240), match.index);
    const guard = /(!?)\s*([A-Za-z_$][\w$]*)\.has\(\s*([A-Za-z_$][\w$]*)\s*\)[^;{}]*$/u.exec(window);
    sites.push({
      key: match[1],
      guard: guard && guard[3] === match[1] ? { roster: guard[2], negated: guard[1] === '!' } : null,
      line: lineForOffset(offsets, match.index),
    });
  }
  return sites;
}

/**
 * The brace depth before each offset of `text`, counted from zero at its start;
 * braces inside quoted strings are not structure.
 */
function braceDepths(text) {
  const depths = new Array(text.length + 1);
  let depth = 0;
  let quote = null;
  for (let index = 0; index < text.length; index += 1) {
    depths[index] = depth;
    const ch = text[index];
    if (quote) {
      if (ch === '\\') {
        index += 1;
        depths[index] = depth;
      } else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '{') depth += 1;
    else if (ch === '}') depth -= 1;
  }
  depths[text.length] = depth;
  return depths;
}

/**
 * Whether the loop body that starts at `span`'s first byte still encloses its
 * end: a braced body never returns to depth zero, an unbraced one never leaves
 * its single statement.
 */
function bodyEncloses(span) {
  const depths = braceDepths(span);
  const open = /^\s*/u.exec(span)[0].length;
  if (span[open] === '{') {
    for (let index = open + 1; index <= span.length; index += 1) if (depths[index] < 1) return false;
    return true;
  }
  for (let index = 0; index < span.length; index += 1) {
    if (depths[index] < 0 || (depths[index] === 0 && span[index] === ';')) return false;
  }
  return depths[span.length] >= 0;
}

/**
 * The nearest `for (const <key> ...  of <iterable>)` before `siteIndex` whose
 * body encloses the site: the iterable it binds `key` over, every name the
 * header binds, and the offset where the header closes, or null.
 */
function binderIterable(sourceText, key, siteIndex = sourceText.length) {
  const scanned = maskSourceComments(sourceText);
  const re = new RegExp(
    `for\\s*\\(\\s*const\\s+(\\[\\s*${key}\\s*(?:,[^\\]]*)?\\]|${key})\\s+of\\s+`,
    'gu',
  );
  const headers = [];
  let match;
  while ((match = re.exec(scanned)) !== null && match.index < siteIndex) headers.push(match);
  for (const header of headers.reverse()) {
    const bindings = header[1].replace(/^\[|\]$/gu, '').split(',').map((name) => name.trim()).filter((name) => /^[A-Za-z_$][\w$]*$/u.test(name));
    const start = header.index + header[0].length;
    const rest = scanned.slice(start, siteIndex);
    let depth = 0;
    let headerEnd = null;
    for (let index = 0; index < rest.length; index += 1) {
      const ch = rest[index];
      if (ch === '(' || ch === '[' || ch === '{') depth += 1;
      else if (ch === ']' || ch === '}') depth -= 1;
      else if (ch === ')') {
        if (depth === 0) {
          headerEnd = start + index + 1;
          break;
        }
        depth -= 1;
      }
    }
    if (headerEnd === null || !bodyEncloses(scanned.slice(headerEnd, siteIndex))) continue;
    return { iterable: rest.slice(0, headerEnd - start - 1).trim(), bindings, headerEnd };
  }
  return null;
}

/**
 * The keys a loop body skips before it reaches the assignment.
 *
 * `derivation/responsive` iterates the whole breakpoint table and skips its
 * floor (`if (step === PROJECTION_FLOOR) continue`), so the floor is a member of
 * the table and never an emission. Reading the table without the guard measured
 * `--ds-breakpoint-xs` emitted while no compile produces it.
 *
 * `span` runs from the end of the nearest loop header whose body encloses the
 * assignment to the assignment. A `continue` guard is read only when it sits
 * directly in that body (brace depth one) as its own statement (preceded by
 * `{`, `;` or `}`); a guard nested under another `if`, inside an inner loop
 * or block, or in an unbraced body returns null. A read guard is classified by
 * what its condition tests:
 *   - the key against one literal (`key === X` / `X === key`, X stated or a
 *     constant enumerating to exactly one): that key is skipped for every theme;
 *   - any name the loop header binds (the key or a destructured sibling such as
 *     the table value) in any other bare position (`key !== X`,
 *     `SET.has(key)`, `px < 1`): a structural filter over a constant table that
 *     this reader cannot enumerate -- null;
 *   - only theme data, including data indexed by the key (`if (!roles[key])`,
 *     `if (!tokens)`): a tenant-conditional emission, read exactly like an
 *     `if (x) vars[...] = ...` around the assignment -- it skips no key.
 * Any `continue` in the span that is not the body of a read guard returns
 * null: a skip this reader cannot name is never read as "skips nothing".
 */
export function loopSkippedKeys(span, key, facts, cache, coreRoot, bindings = [key]) {
  const scanned = maskSourceComments(span);
  const depths = braceDepths(scanned);
  const skipped = new Set();
  let read = 0;
  const guardStart = /\bif\s*\(/gu;
  let match;
  while ((match = guardStart.exec(scanned)) !== null) {
    const condition = extractBracketBlock(scanned.slice(match.index), match[0], '(', ')');
    if (condition === null) return null;
    const after = scanned.slice(match.index + match[0].length + condition.length + 1);
    if (!/^\s*\{?\s*continue\b/u.test(after)) continue;
    const preceding = /\S?\s*$/u.exec(scanned.slice(0, match.index))[0].trim();
    if (depths[match.index] !== 1 || !['{', ';', '}'].includes(preceding)) return null;
    read += 1;
    const equality = new RegExp(`^\\s*(?:${key}\\s*===?\\s*([^\\s()]+)|([^\\s()]+)\\s*===?\\s*${key})\\s*$`, 'u').exec(condition);
    if (equality) {
      const values = enumerateLiterals(equality[1] ?? equality[2], facts, cache, coreRoot, 0);
      if (values === null || values.length !== 1) return null;
      skipped.add(values[0]);
      continue;
    }
    const bound = bindings.map((name) => name.replace(/\$/gu, '\\$')).join('|');
    const bareBinding = new RegExp(`(?<![\\w$.]|\\[\\s*)(?:${bound})(?![\\w$]|\\s*\\])`, 'u');
    if (bareBinding.test(condition)) return null;
  }
  const continues = scanned.match(/\bcontinue\b/gu)?.length ?? 0;
  return continues === read ? skipped : null;
}

/**
 * The concrete channel names a module emits through a non-literal key, and the
 * shapes it emits through a key this resolver refuses to guess at.
 */
export function extractKeyedVarsEmissions(sourceText, { file = null, coreRoot = CORE_ROOT } = {}) {
  const cache = new Map();
  const facts = moduleFacts(file ?? '<inline>', sourceText, cache);
  const resolved = new Map();
  const unresolved = [];
  const add = (name, line) => resolved.set(name, [...(resolved.get(name) ?? []), { line }]);

  for (const site of findUnresolvedInterpolatedAssignments(sourceText)) {
    const parts = /^([^$]*)\$\{\s*([A-Za-z_$][\w$]*)\s*\}([^$]*)$/u.exec(site.raw);
    const binder = parts === null ? null : binderIterable(sourceText, parts[2], site.index);
    const keys = binder === null ? null : nonEmpty(enumerateLiterals(binder.iterable, facts, cache, coreRoot, 0));
    const skipped = keys === null
      ? null
      : loopSkippedKeys(sourceText.slice(binder.headerEnd, site.index), parts[2], facts, cache, coreRoot, binder.bindings);
    if (keys !== null && skipped === null) {
      unresolved.push({
        raw: `\`${site.raw}\``,
        line: site.line,
        reason: `the loop over \`${parts[2]}\` skips keys through a \`continue\` this resolver cannot read, so the emitted subset of the table is not enumerable`,
      });
      continue;
    }
    if (keys === null) {
      unresolved.push({
        raw: `\`${site.raw}\``,
        line: site.line,
        reason: parts === null
          ? 'the template is not a single interpolation over an enumerable domain'
          : `\`${parts[2]}\` is not bound by a \`for ... of\` over a NON-EMPTY literal table this resolver can read`,
      });
      continue;
    }
    for (const key of keys) if (!skipped.has(key)) add(`${parts[1]}${key}${parts[3]}`, site.line);
  }

  for (const site of extractIdentifierVarsAssignments(sourceText)) {
    if (site.guard !== null && site.guard.negated) {
      unresolved.push({
        raw: `${site.key}`,
        line: site.line,
        reason: `the key is filtered by \`!${site.guard.roster}.has(...)\`, and the COMPLEMENT of a roster over a table computed elsewhere is not enumerable from source`,
      });
      continue;
    }
    const source = site.guard === null ? site.key : site.guard.roster;
    const names = nonEmpty(resolveRoster(source, facts, cache, coreRoot, 0));
    if (names === null) {
      unresolved.push({
        raw: `${site.key}`,
        line: site.line,
        reason: site.guard === null
          ? `\`${site.key}\` is not a constant this resolver can read as a channel name`
          : `\`${site.guard.roster}\` is not a roster this resolver can enumerate`,
      });
      continue;
    }
    for (const name of names) add(name, site.line);
  }
  return { resolved, unresolved };
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

/**
 * Any channel name assigned by more than one direct `vars["--ds-x"] = ...` site
 * AT THE SAME RANK.
 *
 * Two sites at different ranks are the ranked merge doing its job: the tenant
 * family restates the five type channels the vertical's typography family
 * derives, and the merge decides between them by authority. Two sites at ONE
 * rank have no such answer, which is what this reports.
 */
export function findDuplicateDirectAssignments(directEmission) {
  const duplicates = [];
  for (const [name, sites] of directEmission) {
    const byRank = new Map();
    for (const site of sites) {
      const rank = site.rank ?? 'unranked';
      byRank.set(rank, [...(byRank.get(rank) ?? []), site]);
    }
    for (const [rank, ranked] of byRank) {
      if (ranked.length > 1) duplicates.push({ name, rank, sites: ranked });
    }
  }
  return duplicates;
}

/**
 * Any channel emitted at ONE rank from two different family files.
 *
 * The site-level rule above is the right one for literal assignments inside a
 * single owner, where a second write is sequential refinement -- a posture
 * floor then an authored ceiling, which `typography/pairing` does on purpose.
 * Two FILES at one rank have no such reading: nothing orders them, so this is
 * the shape that stays a defect once roster-resolved emissions join the census.
 */
export function findCrossFileProducerCollisions(directEmission, rosterEmission) {
  const byName = new Map();
  for (const emission of [directEmission, rosterEmission]) {
    for (const [name, sites] of emission) {
      const ranks = byName.get(name) ?? new Map();
      for (const site of sites) {
        const rank = site.rank ?? 'unranked';
        ranks.set(rank, new Set([...(ranks.get(rank) ?? []), site.file ?? 'brand-theme/index.ts']));
      }
      byName.set(name, ranks);
    }
  }
  const collisions = [];
  for (const [name, ranks] of byName) {
    for (const [rank, files] of ranks) {
      if (files.size > 1) collisions.push({ name, rank, files: [...files].sort() });
    }
  }
  return collisions.sort((a, b) => a.name.localeCompare(b.name));
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
  // name -> Set<vertical> for every custom property a compiled artifact declares.
  const compiledDeclarations = new Map();
  for (const { file, text, compiledVertical = null } of stylesheets) {
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
      // A compiled artifact contributes declarations and custom-property edges, never a terminal.
      if (compiledVertical !== null && !isCustomTarget) return;
      if (compiledVertical !== null) {
        compiledDeclarations.set(prop, (compiledDeclarations.get(prop) ?? new Set()).add(compiledVertical));
      }
      const re = new RegExp(ANY_VAR_REF_RE.source, 'g');
      let match;
      while ((match = re.exec(value)) !== null) {
        const referenced = match[1];
        if (referenced === prop) continue; // a channel referencing itself is not a chain hop
        const line = decl.source?.start?.line ?? 0;
        if (isCustomTarget) {
          const list = customEdges.get(referenced) ?? [];
          list.push(compiledVertical === null
            ? { file, line, targetProp: prop, scope }
            : { file, line, targetProp: prop, scope, compiledVertical });
          customEdges.set(referenced, list);
        } else {
          const list = terminalEdges.get(referenced) ?? [];
          list.push({ file, line, prop, scope });
          terminalEdges.set(referenced, list);
        }
      }
    });
  }
  return { customEdges, terminalEdges, parseErrors, compiledDeclarations };
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

/**
 * The consumer-side paint of a channel, with the DS graph JOINED to the
 * consumer graph.
 *
 * A consumerRoot reads DS channels the DS composes: app-bithire paints
 * `font: var(--ds-text-body)`, and `--ds-text-body` is composed from
 * `--ds-text-body-weight` in the compiled artifact. Two separate graphs never
 * see that facet reach the consumer's `font:`. This walk expands every node
 * through the consumer's own edges AND the DS edges that resolve under the
 * consumer's vertical, and counts only CONSUMER terminals (DS terminals are
 * `computePaint(dsGraph)`'s, never re-credited here).
 *
 * Which DS edges resolve under the vertical is cascade, and it is modeled once:
 * the vertical's compiled artifact is unlayered and tenant-scoped, so when it
 * declares a property, an authored DS declaration of that same property (an
 * `@layer` `:root` relay) never computes for this consumer, and its edges do not
 * join. Another vertical's artifact never joins at all. The rule is applied per
 * property, whatever selector inside the artifact declares it -- a property the
 * artifact declares only in one mode shadows the relay in both, which can only
 * under-credit, never invent a route. `--ds-text-inverse` is that case: the
 * `themes/default` relay `--ds-sidebar-text: var(--ds-text-inverse)` is what the
 * consumer would reach, and the bithire artifact re-declares `--ds-sidebar-text`.
 */
export function computeJoinedPaint(dsGraph, consumerGraph, startName, vertical) {
  const shadowed = (prop) => dsGraph.compiledDeclarations?.get(prop)?.has(vertical) === true;
  const resolves = (edge) => (edge.compiledVertical === undefined ? !shadowed(edge.targetProp) : edge.compiledVertical === vertical);
  const visited = new Set([startName]);
  const queue = [startName];
  const terminalSites = [];
  const joinedVia = [];
  while (queue.length > 0) {
    const node = queue.shift();
    for (const terminal of consumerGraph.terminalEdges.get(node) ?? []) terminalSites.push({ ...terminal, via: node });
    const next = [
      ...(consumerGraph.customEdges.get(node) ?? []).map((edge) => ({ edge, side: 'consumer' })),
      ...(dsGraph.customEdges.get(node) ?? []).filter(resolves).map((edge) => ({ edge, side: 'ds' })),
    ];
    for (const { edge, side } of next) {
      if (visited.has(edge.targetProp)) continue;
      visited.add(edge.targetProp);
      queue.push(edge.targetProp);
      if (side === 'ds') joinedVia.push({ file: edge.file, line: edge.line, from: node, targetProp: edge.targetProp });
    }
  }
  return {
    painted: terminalSites.length > 0,
    terminalSites,
    reachedCustomProps: [...visited],
    joinedVia,
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

const UI_ROOT_PREFIX = 'packages/core/src/components/';

/**
 * CLAUDE.md's own component-taxonomy section names these as non-family
 * support owners for `patterns/`: `foundation/`, `runtime/`, `tooling/`
 * (`facade/` and `tests/` are the corpus/inventory-support siblings, holding
 * zero `family-inventory/index.json` rows). `primitives/foundation` is
 * DELIBERATELY absent: it is a real, populated family group per
 * `family-inventory/index.json` itself — this list is scoped per FULL path, never
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
 * `family-inventory/index.json`'s own `sourceOwner` convention. A site under a
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
 * A closed prefix -> FlatTheme-taxonomy-owner table, exhaustive against the
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
  // The color-picker family namespace shares the palette prefix, so it resolves first.
  [/^--ds-color-picker-/, () => 'chrome.color-picker'],
  [/^--ds-color-/, () => 'palette'],
  [/^--ds-material-/, () => 'surfaces.material'],
  // The surface-lifecycle chrome family shares the surfaces prefix, so it resolves first.
  [/^--ds-surface-lifecycle-/, () => 'chrome.surface-lifecycle'],
  // Same shape: `surface-chrome` is a chrome deriver, not a surfaces sub-owner.
  [/^--ds-surface-chrome-/, () => 'chrome.surface-chrome'],
  [/^--ds-surface-/, () => 'surfaces'],
  [/^--ds-font-family-/, () => 'typography'],
  // The frozen-engine spellings of cut families (FROZEN_ENGINE_COMPAT_CHANNELS) belong to the family they restate.
  [/^--ds-(autocomplete|datepicker|timepicker)-/, (m) => `chrome.${{ autocomplete: 'auto-complete', datepicker: 'date-picker', timepicker: 'time-picker' }[m[1]]}`],
  [/^--ds-(?:message|notification(?!-center))-/, () => 'chrome.notifier'],
  [/^--ds-text-(?:primary|secondary|tertiary|disabled|inverse)$/, () => 'palette'],
  [/^--ds-edge-/, () => 'surfaces.edge'],
  [/^--ds-page-header-/, () => 'chrome.page-shell'],
  [/^--ds-control-height-scale$/, () => 'shape.control-height'],
  // The three families the recursive producer walk made visible. A census that
  // newly SEES a channel must be able to name its owner, or it has traded one
  // hole for another.
  [/^--ds-font-weight-/, () => 'typography'],
  [/^--ds-z-index-/, () => 'surfaces.elevation.stacking'],
  [/^--ds-breakpoint-/, () => 'responsive'],
  [/^--ds-letter-spacing-/, () => 'typography'],
  [/^--ds-line-height-/, () => 'typography'],
  [/^--ds-type-/, () => 'typography'],
  // The named type ramp: the six entries and their facets, all written by one
  // sub-owner (derivation/typography/scale, which states them literally in
  // TYPE_SCALE_ENTRIES / TYPE_SCALE_FACET_CHANNELS). Eyebrow is an entry like
  // the other five, not an owner of its own.
  [/^--ds-text-(?:detail|body|emphasis|title|display|eyebrow)(?:-|$)/, () => 'typography.scale'],
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
  // The interaction vocabulary: the deltas `states.emphasis` moves, and the
  // ring `states.focus-style` shapes. They are a family of their own rather
  // than a `surfaces.*` sub-owner: a state is a moment of an interaction, not
  // a property of the surface it happens on, and the material roots read them
  // instead of restating them.
  [/^--ds-state-/, () => 'states'],
  [/^--ds-focus-ring/, () => 'states.focus'],
  // A family cut's deriver owns its family namespace (roadmap/family-cut-template.md 1.1).
  [/^--ds-(button|checkbox|radio|toggle|segmented|input-number|password-input|otp-input|tag-input|form-header|form-sections|form-surface|form-field|textarea|input|form|select|auto-complete|cascader|tree-select|mentions|transfer|date-picker|time-picker|modal|drawer|sheet|alert-dialog|confirm-dialog|popover|dropdown|hover-card|tooltip|tour|notifier|notification-center|alert|menu|tabs|breadcrumb|pagination|stepper|sidebar-surface|card|active-filters-bar|aspect-ratio|avatar|badge|box|calendar-view|collapse|column-menu|column-settings|container|data-table|descriptions|divider|file-manager|filter-chip|filter-panel|flex|grid|kanban-board|list|saved-views|space|splitter|stack|table|tag|toolbar|tree|widget-board|action-dock|app-shell|command-palette|page-shell|scope-switcher|search-command-bar|shortcuts-overlay|surface-chrome|view-mode-switcher|workspace-shell|cockpit-header|workbench-header|mobile-header|stats-header|section-frame|collection-header|dashboard-header|detail-header|detail-form-surface|header-surface|record|guided-draft-form|edit-header|edit-fields-if-present|wizard-surface|header)-/, (m) => `chrome.${m[1]}`],
  // Two published bands are spelled unlike their family: `--ds-section-card-*`
  // (`surface-chrome` deriver) and `--ds-shell-*` (app-shell skin contract).
  [/^--ds-section-card-/, () => 'chrome.surface-chrome'],
  [/^--ds-shell-/, () => 'chrome.app-shell'],
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

/**
 * Three partitions, none of them protected: LIVE (a proven terminal chain),
 * UNPROVEN (a standing effect finding that must carry a work-order pin) and
 * STRUCTURAL (a measured constant that must carry an invariant pin). A row
 * lands in exactly one, and every partition has a law that can turn it red.
 */
export const LIVENESS = Object.freeze({
  modernPainted: 'LIVE_MODERN_PAINTED',
  frozenEnginePainted: 'LIVE_FROZEN_ENGINE_PAINTED',
  externalConsumerPainted: 'LIVE_EXTERNAL_CONSUMER_PAINTED',
  probePainted: 'LIVE_PROBE_PAINTED',
  readNoProductiveTerminal: 'READ_NO_PRODUCTIVE_TERMINAL',
  readUnproven: 'READ_UNPROVEN',
  authorableUnprovenEffect: 'AUTHORABLE_UNPROVEN_EFFECT',
  unreadOverrideOnly: 'UNREAD_OVERRIDE_ONLY_NO_KNOWN_ROUTE',
  unreadEmittedNoRoute: 'UNREAD_EMITTED_NO_KNOWN_ROUTE',
  structuralConstant: 'STRUCTURAL_CONSTANT',
});

/** The three classifications that prove paint through the cascade graph. */
export const GRAPH_LIVE_CLASSIFICATIONS = new Set([
  LIVENESS.modernPainted,
  LIVENESS.frozenEnginePainted,
  LIVENESS.externalConsumerPainted,
]);

/** Proven liveness: the graph classes plus a resolving browser-probe citation (`DEFAULT_PROBE_EVIDENCE`). */
export const LIVE_CLASSIFICATIONS = new Set([...GRAPH_LIVE_CLASSIFICATIONS, LIVENESS.probePainted]);

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
 * The third partition: NEITHER proven liveness NOR an unproven effect.
 *
 * A structural constant is a channel whose contract is to be DECLARED, not
 * read. The floor of the single z-index scale (`--ds-z-index-base: 0`) is what
 * "no stacking" means, so a read of it would be a defect, not a terminal, and
 * classifying it UNREAD_EMITTED_NO_KNOWN_ROUTE would register an effect that
 * nothing owes. It is STILL NOT A PROTECTED BUCKET, and the difference from the
 * "declaredReference never fails" design defect 3 removed is enforced, not
 * asserted: membership is MEASURED from the declaration site on every run
 * (`deriveCanonicalZScaleRoster`, never a list kept here); a measured row must
 * carry a structural pin naming the invariant that sustains it, or it is a
 * STOP NO-GO row (`adjudicateDispositions`); and every drift fails closed --
 * a band that leaves the roster re-measures as UNREAD_EMITTED_NO_KNOWN_ROUTE
 * and its pin drifts, a band that gains a reader measures LIVE and its pin is
 * discharged. `assessChannelEffect` never counts it, because it is not an
 * emission waiting for an effect. Precedence is untouched: paint, reads and
 * the tenant allowlists all still win over roster membership, which only
 * re-reads what would otherwise fall to the final unread-emitted fallback.
 */
export const STRUCTURAL_CLASSIFICATIONS = new Set([LIVENESS.structuralConstant]);

/**
 * The canonical z-scale roster, derived from the declaration site's text:
 * every `--ds-z-index-*` declared directly under `:root` whose value is a
 * bare unsigned integer literal -- the same `\d+` grammar the
 * z-index-single-scale invariant reads a band with. Aliases (`var(...)`,
 * `calc(...)`) are not bands and stay out. Parsed with PostCSS so a name
 * inside a comment never counts. A parse error propagates: an unmeasurable
 * roster is a broken measurement, never an empty one.
 */
export function deriveCanonicalZScaleRoster(cssText) {
  const roster = new Set();
  const root = postcss.parse(cssText);
  root.walkRules((rule) => {
    if (rule.selector.trim() !== ':root') return;
    rule.walkDecls((decl) => {
      if (decl.parent !== rule) return;
      if (!decl.prop.startsWith('--ds-z-index-')) return;
      if (/^\d+$/.test(decl.value.trim())) roster.add(decl.prop);
    });
  });
  return roster;
}

/* ---------------------------------------------------------------------- */
/* 8b. Disposition registry -- WHO owns every standing non-LIVE row       */
/* ---------------------------------------------------------------------- */

/**
 * WHAT A PIN IS, AND WHAT IT IS NOT.
 *
 * This is NOT the baseline/allowlist the section "WHY NO BASELINE FILE" above
 * refuses, and the difference is the whole design. A baseline accepts a row
 * into SILENCE: the row stops being printed, the count goes down, and nobody
 * can tell a drained finding from an accepted one. A pin does the opposite. It
 * leaves the row exactly where it is -- measured, classified, named in the
 * report with its owner on every run -- and adds the one thing the row was
 * missing, which is a work order that has agreed to resolve it. The debt is not
 * declared resolved by being pinned; it is declared OWNED.
 *
 * That is what makes this gate blockable. Before the registry the gate had a
 * standing red with no address, so it could only be excluded from CI wholesale
 * (`blocking: false`), which meant a genuinely NEW dead channel landed in
 * exactly the same silence as the 44 known ones. With the registry the gate
 * fails on the three transitions that actually matter:
 *
 *   (a) UNREGISTERED -- a non-LIVE row nobody pinned. This is the new dead
 *       channel the exclusion used to hide, and it is now a hard red.
 *   (b) STALE -- a pin whose channel is no longer in the measured universe.
 *       The name was renamed or removed and the pin is pointing at nothing, so
 *       an owner is carrying an obligation that no longer exists.
 *   (c) DISCHARGED -- a pin whose channel now classifies LIVE. The work landed;
 *       the pin must be deleted in the same commit. THE TABLE ONLY SHRINKS.
 *
 * A fourth, (d) DRIFTED, falls out of the same reading: a pin declares the
 * class it was registered against, so a row that moved from one non-LIVE class
 * to another is re-adjudicated by its owner rather than silently re-covered.
 *
 * A STRUCTURAL pin is the one pin that registers no obligation. It names an
 * INVARIANT instead of an owner, because the row it covers is a measured
 * structural constant (`STRUCTURAL_CLASSIFICATIONS`): nothing is owed but the
 * roster law that keeps the band declared, and the same four laws apply to it
 * (a missing pin, a stale pin, a discharged pin, a drifted pin all fail). It
 * is retired in the same commit that retires the band from the canonical roster.
 *
 * WHY IN THE SCRIPT AND NOT IN A JSON FILE. `computeInputsDigest` already
 * covers this script's own source, so a pin edit invalidates the evidence
 * artifact exactly like a classifier edit does -- no second digest input, no
 * file that can drift out from under the artifact that quotes it.
 *
 * REGISTERED 2026-09-11 by the DT from audit 100 (`dt-adjudication.md` F2), one
 * owner per class group, reproducing the run it was registered against:
 * 25 AUTHORABLE_UNPROVEN_EFFECT + 13 UNREAD_EMITTED_NO_KNOWN_ROUTE +
 * 5 READ_NO_PRODUCTIVE_TERMINAL + 1 READ_UNPROVEN = 44 channels.
 */
export const CHANNEL_DISPOSITIONS = Object.freeze([
  Object.freeze({
    owner: 'WO-EVI-02',
    classification: LIVENESS.authorableUnprovenEffect,
    registered: '2026-09-17',
    reason:
      'the authorable set the preset conversion closed without deciding: the accent ramp (a palette.seeds role with no emitter), --ds-color-info-300, the glass and overlay surfaces, and the 16/24 steps of the four status tint ramps. WO-DER-06 went done on 2026-09-15 with all 24 rows still non-LIVE, and its own reader-or-retire lot disposed only what it could measure (the switch namespace, the two profiles, --ds-color-text-page, --ds-elevation-border-style); proving or refusing an effect is the causal-gates obligation, and a change of owner is not resolution. The pin clears per channel when the by-axis effect proof lands a terminal for it, or when the channel retires together with its producers and its authorable catalog entry in the same commit -- never by deleting a ramp step to reach green',
    channels: Object.freeze([
      '--ds-color-accent-50',
      '--ds-color-accent-100',
      '--ds-color-accent-200',
      '--ds-color-accent-300',
      '--ds-color-accent-400',
      '--ds-color-accent-500',
      '--ds-color-accent-600',
      '--ds-color-accent-700',
      '--ds-color-accent-800',
      '--ds-color-accent-900',
      '--ds-color-info-300',
      '--ds-glass-bg',
      '--ds-glass-border',
      '--ds-overlay-heavy',
      '--ds-overlay-light',
      '--ds-overlay-medium',
      '--ds-tint-error-16',
      '--ds-tint-error-24',
      '--ds-tint-info-16',
      '--ds-tint-info-24',
      '--ds-tint-success-16',
      '--ds-tint-success-24',
      '--ds-tint-warning-16',
      '--ds-tint-warning-24',
    ]),
  }),
  Object.freeze({
    owner: 'WO-EVI-02',
    classification: LIVENESS.readUnproven,
    registered: '2026-09-17',
    reason:
      'the only evidence is a raw TS/TSX var() occurrence with no stylesheet terminal, so the step is read without being painted. WO-DER-06 went done on 2026-09-15 without deciding it and the preset conversion it named as the decider is finished, so the proof belongs to the causal gates. The pin clears when the TSX read is proven to reach a terminal or a stylesheet reader is wired, or when the step retires from the secondary ramp with its producers -- never by counting a TS occurrence as paint',
    channels: Object.freeze(['--ds-color-secondary-400']),
  }),
  Object.freeze({
    owner: 'WO-RET-01',
    classification: LIVENESS.readNoProductiveTerminal,
    registered: '2026-09-25',
    reason:
      'dead by CASCADE, not by absence: the palette roster declares the ink (it joins the universe through the emission oracle) and its only DS read is the legacy relay themes/default:973 `--ds-sidebar-text: var(--ds-text-inverse)` on :root inside @layer rottay-tokens, which the consumerRoot does read (app-bithire sidebar styles, seven terminal color declarations). Every first-party artifact re-declares --ds-sidebar-text on its html[data-tenant]/[data-vertical] scope, outranking the relay, but that emission is conditional (chrome-variables `if (chrome.text)` / `if (s.text)`), so the relay WOULD compute for a tenant whose sidebar tone lowers no text. The cross-corpus relay blindness WO-EVI-02 owned is closed (LIV-3): the join follows the relay into the consumer graph and measures it outranked, because the bithire artifact the consumerRoot renders under declares --ds-sidebar-text itself -- so the RNPT reading is the cascade, not the instrument. The pin clears ONLY when the ink retires WITH its palette roster entry, or a DS reader is wired; removing the relay alone drifts the row to UNREAD_EMITTED_NO_KNOWN_ROUTE, which this register accuses as a drifted pin. Owner re-adjudicated 2026-10-01: WO-RET-02 is done, WO-DER-06 measured done the same day, so the pin moves to WO-RET-01, the open retirement lane whose acceptance the exit text already describes',
    channels: Object.freeze(['--ds-text-inverse']),
  }),
  Object.freeze({
    owner: 'WO-RET-01',
    classification: LIVENESS.unreadEmittedNoRoute,
    registered: '2026-10-01',
    reason:
      'inert by construction, a retire candidate: both hold `0` (foundation/type-ramp:79, the browser default) and have zero readers anywhere -- no var() in the DS corpus, the app-bithire consumerRoot or any other Rottay source, measured 2026-10-01 (LV-2, re-grepped by LIV-2) -- and neither appears in its entry shorthand (derivation/typography/scale:91 composes weight, size and line-height only), so unlike the shorthand-fed facets there is no route for the graph to be blind to. Retirement is NOT this pin: it is a contract edit that removes the two facets from setTypeRampVariables and from TYPE_SCALE_FACET_CHANNELS together (the family suite pins those two tables equal) and deletes this pin in the same commit. --ds-text-detail-letter-spacing holds the same `0` but is NOT a candidate: it has a reader (app-bithire surface-shell/typography:19) and measures LIVE_EXTERNAL_CONSUMER_PAINTED. The pin clears only with that retirement, or if a reader lands and the row measures LIVE',
    channels: Object.freeze([
      '--ds-text-body-letter-spacing',
      '--ds-text-emphasis-letter-spacing',
    ]),
  }),
]);

/** A pin addresses a work order, never a person, a lane or a date. */
export const DISPOSITION_OWNER_PATTERN = /^WO-[A-Z]{3,4}-\d{2}(?:\.\.\d{2})?$/;

/** channel -> its single registered disposition, plus any channel registered twice. */
export function buildDispositionIndex(dispositions = CHANNEL_DISPOSITIONS) {
  const index = new Map();
  const duplicates = [];
  for (const group of dispositions) {
    for (const channel of group.channels) {
      if (index.has(channel)) {
        duplicates.push(channel);
        continue;
      }
      index.set(channel, {
        channel,
        owner: group.owner,
        invariant: group.invariant,
        classification: group.classification,
        registered: group.registered,
        reason: group.reason,
      });
    }
  }
  return { index, duplicates: [...new Set(duplicates)].sort() };
}

/**
 * The measurement against the registry, in both directions.
 *
 * Both directions are the point. Reading only rows -> pins would let the table
 * grow stale pins forever; reading only pins -> rows would let an unowned new
 * dead channel through. Every pinned row is returned so the report can keep
 * printing it WITH its owner: a pinned finding is still a finding.
 */
export function adjudicateDispositions(channels, { dispositions = CHANNEL_DISPOSITIONS } = {}) {
  const failures = [];
  const { index, duplicates } = buildDispositionIndex(dispositions);
  for (const channel of duplicates) {
    failures.push(
      `duplicate pin: ${channel} is registered more than once in CHANNEL_DISPOSITIONS -- a channel has exactly one owner`,
    );
  }
  const isStructuralPin = (pin) => STRUCTURAL_CLASSIFICATIONS.has(pin.classification);
  const pinAddress = (pin) => (isStructuralPin(pin) ? `invariant ${pin.invariant}` : pin.owner);
  for (const pin of index.values()) {
    if (isStructuralPin(pin)) {
      if (typeof pin.invariant !== 'string' || pin.invariant.trim() === '') {
        failures.push(
          `invalid structural pin: ${pin.channel} is registered as ${pin.classification} with no invariant -- a structural constant is sustained by a named invariant, not by a work order, and a pin that names neither registers nothing`,
        );
      }
      if (pin.owner !== undefined) {
        failures.push(
          `invalid structural pin: ${pin.channel} is registered as ${pin.classification} and also names an owner "${pin.owner}" -- a structural constant owes no work; it names its invariant and nothing else`,
        );
      }
      continue;
    }
    if (!DISPOSITION_OWNER_PATTERN.test(pin.owner)) {
      failures.push(
        `invalid pin: ${pin.channel} is pinned to "${pin.owner}", which is not a work-order id -- a pin registers OWNERSHIP, and an owner that is not a work order owns nothing`,
      );
    }
  }

  const measured = new Map(channels.filter((row) => row.classification).map((row) => [row.name, row]));
  const pinned = [];
  const structural = [];
  const unregistered = new Map();
  const unpinnedStructural = [];
  for (const row of channels) {
    if (!row.classification) continue;
    const pin = index.get(row.name);
    // The symmetric law for the third partition: a measured structural row is
    // not a finding, but it is not free either -- it must carry a structural
    // pin, and a drifted pin is accused once, below, against the PIN.
    if (STRUCTURAL_CLASSIFICATIONS.has(row.classification)) {
      if (pin !== undefined && pin.classification === row.classification) {
        structural.push({ ...pin });
        continue;
      }
      if (pin !== undefined) continue;
      unpinnedStructural.push(row.name);
      continue;
    }
    if (!UNPROVEN_CLASSIFICATIONS.has(row.classification)) continue;
    if (pin !== undefined && pin.classification === row.classification) {
      pinned.push({ ...pin });
      continue;
    }
    // A pin whose class drifted is accused once, below, against the PIN -- not
    // a second time here as though the channel had never been registered.
    if (pin !== undefined) continue;
    const list = unregistered.get(row.classification) ?? [];
    list.push(row.name);
    unregistered.set(row.classification, list);
  }
  if (unpinnedStructural.length > 0) {
    failures.push(
      `STOP NO-GO: ${unpinnedStructural.length} channel(s) classified ${LIVENESS.structuralConstant} with NO registered structural pin (a measured structural constant must name the invariant that sustains it, or it is an unread emission wearing a different word) -- exact rows: ${unpinnedStructural.sort().join(', ')}`,
    );
  }
  for (const [classification, names] of unregistered) {
    failures.push(
      `STOP NO-GO: ${names.length} channel(s) classified ${classification} with NO registered owner (no proven terminal, no proven external evidence, no retirement, no pin) -- exact rows: ${names.sort().join(', ')}`,
    );
  }

  for (const pin of index.values()) {
    const row = measured.get(pin.channel);
    const address = pinAddress(pin);
    if (row === undefined) {
      failures.push(
        `stale pin: ${pin.channel} is pinned to ${address} as ${pin.classification} and no longer exists in the measured universe -- the pin points at nothing; remove it in the same commit that removed the channel`,
      );
      continue;
    }
    if (LIVE_CLASSIFICATIONS.has(row.classification)) {
      failures.push(
        isStructuralPin(pin)
          ? `discharged pin: ${pin.channel} is pinned to ${address} as ${pin.classification} and now classifies ${row.classification} -- a band that gained a reader is no longer a structural constant, so delete the pin; this table only shrinks`
          : `discharged pin: ${pin.channel} is pinned to ${address} as ${pin.classification} and now classifies ${row.classification} -- the work landed, so delete the pin; this table only shrinks`,
      );
      continue;
    }
    if (row.classification !== pin.classification) {
      failures.push(
        `drifted pin: ${pin.channel} is pinned to ${address} as ${pin.classification} and now measures ${row.classification} -- the debt changed shape; re-register it against the class it is actually in`,
      );
    }
  }

  const byOwner = {};
  for (const entry of [...pinned].sort((a, b) => a.channel.localeCompare(b.channel))) {
    (byOwner[entry.owner] ??= []).push(entry.channel);
  }
  const byInvariant = {};
  for (const entry of [...structural].sort((a, b) => a.channel.localeCompare(b.channel))) {
    (byInvariant[entry.invariant] ??= []).push(entry.channel);
  }
  const structuralPins = [...index.values()].filter(isStructuralPin).length;
  return {
    failures,
    pinned,
    structural,
    byOwner,
    byInvariant,
    registered: index.size,
    ownerPins: index.size - structuralPins,
    structuralPins,
  };
}

/**
 * The effect verdict, apart from ownership: a pin names who owes a terminal but
 * never supplies one, so every UNPROVEN row stays an effect failure, pinned or
 * not. A STRUCTURAL row is not counted: it is not an emission waiting for an
 * effect, and its own law (measured membership plus a structural pin) is
 * enforced by `adjudicateDispositions`, never relaxed here.
 */
export function assessChannelEffect(channels) {
  const rows = [];
  const byClassification = new Map();
  for (const row of channels) {
    if (!row.classification || !UNPROVEN_CLASSIFICATIONS.has(row.classification)) continue;
    rows.push(row.name);
    const list = byClassification.get(row.classification) ?? [];
    list.push(row.name);
    byClassification.set(row.classification, list);
  }
  const failures = [...byClassification].map(
    ([classification, names]) =>
      `unproven effect: ${names.length} channel(s) classified ${classification} (no proven terminal, no proven external evidence, no retirement; a pin registers who owes the effect, not the effect) -- exact rows: ${names.sort().join(', ')}`,
  );
  return { ok: failures.length === 0, failures, rows: rows.sort() };
}

/**
 * Exhaustive over the row shape this file ever constructs (universe =
 * declaredOverride ∪ declaredReference ∪ emitted, so at least one of
 * `declaredOverride`/`declaredReference`/emitted always holds) — every
 * branch below is reachable, none is dead code. `canonicalRosterMember` is
 * read LAST, immediately before the unread-emitted fallback, so it can only
 * re-read a row that no paint, read or tenant-allowlist signal claimed.
 */
export function classifyLiveness({
  declaredOverride,
  declaredReference,
  dsModernPainted,
  dsFrozenOnlyPainted,
  externalConsumerPainted,
  probePainted = false,
  cssReadNoTerminal,
  tsReadOnly,
  canonicalRosterMember = false,
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
  if (probePainted) {
    return {
      classification: LIVENESS.probePainted,
      reason: 'zero terminal paint through the cascade graph (DS or consumerRoot); paint is certified by a declared browser probe whose cited spec and test titles resolve -- NOT through the cascade graph: the instrument proves the citation, the probe spec\'s own e2e leg proves the paint, and only for the scene that probe renders',
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
  if (canonicalRosterMember) {
    return {
      classification: LIVENESS.structuralConstant,
      reason: 'a canonical band of the single z-index scale, declared at its one declaration site and sustained by the z-index-single-scale invariant; a band is declared, never read by design (reading the floor is the same as declaring no stacking), so this is a structural constant, not an emission waiting for an effect',
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
  flatThemeSources = [],
  familyInventoryRaw,
  cssStylesheets,
  tsStylesheets,
  consumerCorpora = [],
  compiledArtifacts = [],
  probeSpecs = [],
}) {
  const parts = [
    `gate-script:${sha256(gateScriptSource)}`,
    `evidence-contract:${sha256(evidenceContractRaw)}`,
    `ci-gates-manifest:${sha256(ciGatesManifestRaw)}`,
    `package-json:${sha256(packageJsonRaw)}`,
    `tenant-theme-contract:${sha256(tenantThemeSource)}`,
    `family-inventory:${sha256(familyInventoryRaw)}`,
  ];
  for (const source of flatThemeSources) {
    parts.push(`brand-theme-compiler:${source.relativePath}:${sha256(source.text)}`);
  }
  for (const { file, text } of cssStylesheets) parts.push(`css:${file}:${sha256(text)}`);
  for (const { file, text } of tsStylesheets) parts.push(`ts:${file}:${sha256(text)}`);
  for (const { file, text } of compiledArtifacts) parts.push(`compiled-artifact:${file}:${sha256(text)}`);
  for (const { file, text } of probeSpecs) parts.push(`probe-spec:${file}:${sha256(text)}`);
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
  flatThemeSource,
  flatThemeSources,
  familyRows,
  cssStylesheets,
  tsStylesheets,
  consumerRoots = [],
  probeEvidence = [],
  checkoutRoot = CHECKOUT_ROOT,
  compiledArtifacts = undefined,
  previousArtifact = null,
  enforceArtifactFreshness = false,
  dispositions = CHANNEL_DISPOSITIONS,
  zScaleOwnerPath = DEFAULT_Z_INDEX_SCALE_OWNER,
  drill = null,
}) {
  const failures = [];
  const analysisLimitations = [];

  // `undefined` is a hermetic fixture that models no compile; an EMPTY list is
  // a broken read of the artifact root, which would silently drop every
  // compiled edge and every compiled emission.
  if (Array.isArray(compiledArtifacts) && compiledArtifacts.length === 0) {
    failures.push('zero corpus: the compiled first-party artifacts (facade/artifacts/<vertical>/index.css) resolved to zero files');
  }
  const artifacts = compiledArtifacts ?? [];
  const compiledVerticals = new Set(artifacts.map((artifact) => artifact.vertical));
  for (const consumerRoot of consumerRoots) {
    if (consumerRoot.vertical !== undefined && !compiledVerticals.has(consumerRoot.vertical)) {
      failures.push(
        `consumer join unreadable: consumerRoot "${consumerRoot.id}" renders under vertical "${consumerRoot.vertical}" and no compiled artifact for it was read -- without it the join cannot tell which DS declaration a consumer read resolves through`,
      );
    }
  }

  // The canonical z-scale roster is measured from its declaration site once
  // per run. An unreadable site is a broken measurement and fails by name; it
  // is never an empty roster that quietly drifts every band to unread.
  let canonicalZScaleRoster = new Set();
  try {
    canonicalZScaleRoster = deriveCanonicalZScaleRoster(readFileSync(zScaleOwnerPath, 'utf8'));
  } catch (error) {
    failures.push(
      `z-scale owner unreadable: ${relative(CORE_ROOT, zScaleOwnerPath).split(sep).join('/')} could not be read or parsed (${error instanceof Error ? error.message : String(error)}) -- the canonical z-scale roster cannot be measured, so no channel may classify ${LIVENESS.structuralConstant} this run`,
    );
  }

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
  // One entry per family deriver. A single `flatThemeSource` string is still
  // accepted, and behaves as one unranked producer, so every drill fixture in
  // this gate's own test keeps its shape.
  const compilerSources =
    flatThemeSources ??
    (flatThemeSource === undefined
      ? []
      : [{ relativePath: 'brand-theme/index.ts', text: flatThemeSource, rank: 'unranked' }]);

  const tintNames = new Set();
  const tintCallSites = [];
  let tintSuffixes = [];
  let tintDefinitionSite = null;
  const directEmission = new Map();
  const rosterEmission = new Map();
  const unresolvedInterpolated = [];
  const familyOfFile = new Map();
  const familyRosters = new Map();
  for (const source of compilerSources) {
    if (source.family !== undefined) {
      familyOfFile.set(source.relativePath, source.family);
      const roster = extractProducesRoster(source.text, { file: source.path ?? null });
      const own = familyRosters.get(source.family) ?? { exact: [], globs: [], unresolved: [] };
      for (const key of ['exact', 'globs', 'unresolved']) {
        own[key].push(...roster[key].map((entry) => ({ ...entry, file: source.relativePath, rank: source.rank })));
      }
      familyRosters.set(source.family, own);
    }
    const tint = extractTintRampEmissions(source.text);
    for (const name of tint.names) tintNames.add(name);
    for (const site of tint.callSites) {
      tintCallSites.push({ ...site, file: source.relativePath, rank: source.rank });
    }
    if (tint.suffixes.length > 0) tintSuffixes = tint.suffixes;
    if (tint.definitionLine !== null && tintDefinitionSite === null) {
      tintDefinitionSite = `${source.relativePath}:${tint.definitionLine}`;
    }
    for (const [name, sites] of extractDirectVarsAssignments(source.text)) {
      const merged = directEmission.get(name) ?? [];
      for (const site of sites) {
        merged.push({ ...site, file: source.relativePath, rank: source.rank });
      }
      directEmission.set(name, merged);
    }
    // The non-literal keys: a named constant, a roster membership guard, or a
    // template over a literal table. Each resolves to concrete names or is
    // reported; neither shape is dropped.
    const keyed = extractKeyedVarsEmissions(source.text, { file: source.path ?? null });
    for (const [name, sites] of keyed.resolved) {
      const merged = rosterEmission.get(name) ?? [];
      for (const site of sites) {
        merged.push({ ...site, file: source.relativePath, rank: source.rank });
      }
      rosterEmission.set(name, merged);
    }
    for (const site of keyed.unresolved) {
      unresolvedInterpolated.push({ ...site, file: source.relativePath });
    }
  }
  // The emission oracle: every exact name a family roster declares is emitted, attributed to that roster.
  const oracleEmission = new Map();
  for (const roster of familyRosters.values()) {
    for (const entry of roster.exact) {
      oracleEmission.set(entry.name, [...(oracleEmission.get(entry.name) ?? []), entry]);
    }
    for (const entry of roster.unresolved) {
      failures.push(`unresolved roster member: ${entry.raw} at ${entry.file}:${entry.line} -- ${entry.reason}; a roster the oracle cannot read is never read as smaller`);
    }
  }
  const oracleClosedPatterns = [];
  for (let index = unresolvedInterpolated.length - 1; index >= 0; index -= 1) {
    const site = unresolvedInterpolated[index];
    const roster = familyRosters.get(familyOfFile.get(site.file));
    if (roster && roster.exact.length > 0 && roster.globs.length === 0 && roster.unresolved.length === 0) {
      oracleClosedPatterns.push({ ...site, family: familyOfFile.get(site.file), names: [...new Set(roster.exact.map((entry) => entry.name))].sort() });
      unresolvedInterpolated.splice(index, 1);
    }
  }
  const tintEmission = {
    names: tintNames,
    suffixes: tintSuffixes,
    callSites: tintCallSites,
    definitionSite: tintDefinitionSite,
  };
  const duplicateTintScales = findDuplicateTintScales(tintCallSites);
  const duplicateDirectAssignments = findDuplicateDirectAssignments(directEmission);
  const tintDirectOverlap = findTintDirectOverlap(tintEmission.names, directEmission);

  for (const duplicate of duplicateTintScales) {
    failures.push(
      `duplicate owner: tint scale "${duplicate.scale}" is registered by setTintRampVariables at ${duplicate.sites.length} call sites (${duplicate.sites.map((s) => `${s.file ?? 'brand-theme/index.ts'}:${s.line}`).join(', ')}) -- a channel family may have exactly one producer`,
    );
  }
  for (const duplicate of duplicateDirectAssignments) {
    failures.push(
      `duplicate producer: ${duplicate.name} is assigned by ${duplicate.sites.length} direct \`vars[...]\` sites at rank "${duplicate.rank}" (${duplicate.sites.map((s) => `${s.file ?? 'brand-theme/index.ts'}:${s.line}`).join(', ')}) -- a channel has exactly one producing family per rank`,
    );
  }
  if (tintDirectOverlap.length > 0) {
    failures.push(
      `tint x direct overlap: ${tintDirectOverlap.join(', ')} ${tintDirectOverlap.length === 1 ? 'is' : 'are'} emitted by BOTH the tint ramp and a direct literal assignment -- two producers disagree about the same channel`,
    );
  }
  for (const site of unresolvedInterpolated) {
    failures.push(
      `unresolved emission pattern: vars[${site.raw}] at ${site.file ?? 'brand-theme/index.ts'}:${site.line} is an emission this producer cannot resolve to concrete channel names -- ${site.reason ?? 'the key is not a literal'}; the corpus is never shrunk to avoid this finding`,
    );
  }
  for (const collision of findCrossFileProducerCollisions(directEmission, rosterEmission)) {
    failures.push(
      `duplicate producer: ${collision.name} is emitted at rank "${collision.rank}" by ${collision.files.length} different family files (${collision.files.join(', ')}) -- a channel has exactly one producing family per rank`,
    );
  }

  // The roster law: a resolved write of a family whose roster exists must sit inside that roster.
  const resolvedWrites = [
    ...[...directEmission].flatMap(([name, sites]) => sites.map((site) => ({ name, site }))),
    ...[...rosterEmission].flatMap(([name, sites]) => sites.map((site) => ({ name, site }))),
    ...tintEmission.callSites.flatMap((site) => tintEmission.suffixes.map((suffix) => ({ name: `${site.scale}${suffix}`, site }))),
  ];
  const outsideRoster = new Set();
  for (const { name, site } of resolvedWrites) {
    const family = familyOfFile.get(site.file);
    const roster = family === undefined ? undefined : familyRosters.get(family);
    if (!roster || roster.exact.length + roster.globs.length === 0 || rosterCovers(roster, name)) continue;
    outsideRoster.add(`${name} @ ${site.file}:${site.line} (family ${family})`);
  }
  for (const entry of [...outsideRoster].sort()) {
    failures.push(`produced outside its roster: ${entry} -- a family's produces: roster is its declared output, so a write it does not declare is either a stale roster or an undeclared emission`);
  }

  const emittedNames = new Set([...tintEmission.names, ...directEmission.keys(), ...rosterEmission.keys(), ...oracleEmission.keys()]);
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

  // --- Declared browser-probe evidence ----------------------------------
  const probes = loadProbeEvidence(probeEvidence, { checkoutRoot });
  failures.push(...probes.failures);

  // --- Paint graphs (defect 1) ------------------------------------------
  const dsGraph = buildPaintGraph(
    [
      ...(cssStylesheets ?? []),
      ...artifacts.map(({ vertical, file, text }) => ({ file, text, compiledVertical: vertical })),
    ],
    (file) => classifyConsumerScope(file),
  );
  for (const error of dsGraph.parseErrors) failures.push(`corpus parse error: ${error.file}: ${error.message}`);
  // One graph per consumerRoot, so each joins the DS under its own vertical.
  const consumerGraphs = consumerResults.map(({ consumerRoot, load }) => {
    const graph = buildPaintGraph(load.cssStylesheets, () => 'external-consumer');
    for (const error of graph.parseErrors) failures.push(`corpus parse error (consumerRoot): ${error.file}: ${error.message}`);
    return { consumerRoot, graph };
  });
  const externalGraph = {
    customEdges: new Map(),
    terminalEdges: new Map(),
  };
  for (const { graph } of consumerGraphs) {
    for (const key of ['customEdges', 'terminalEdges']) {
      for (const [name, edges] of graph[key]) externalGraph[key].set(name, [...(externalGraph[key].get(name) ?? []), ...edges]);
    }
  }
  const externalPaintOf = (name) => {
    const terminalSites = [];
    for (const { consumerRoot, graph } of consumerGraphs) {
      const own = computePaint(graph, name);
      const ownSites = new Set(own.terminalSites.map((site) => `${site.file}:${site.line}:${site.prop}`));
      const reached = consumerRoot.vertical !== undefined && compiledVerticals.has(consumerRoot.vertical)
        ? computeJoinedPaint(dsGraph, graph, name, consumerRoot.vertical)
        : own;
      for (const site of reached.terminalSites) {
        terminalSites.push({ ...site, joined: !ownSites.has(`${site.file}:${site.line}:${site.prop}`) });
      }
    }
    return { painted: terminalSites.length > 0, terminalSites };
  };

  const tsReadsDs = scanTsReads(tsStylesheets);
  const tsReadsExternal = scanTsReads(consumerResults.flatMap(({ load }) => load.tsStylesheets));

  // --- Family attribution -----------------------------------------------
  const familyIndex = buildFamilyIndex(familyRows);
  const siteLabel = (site) =>
    `${site.file ?? 'brand-theme/index.ts'}:${site.line}`;

  // Three emission shapes carry provenance: the tint ramp, the direct literal,
  // and the roster-keyed site a deriver emits through a membership guard.
  function producerFor(name) {
    if (tintEmission.names.has(name)) {
      const site = tintEmission.callSites.find((candidate) =>
        tintEmission.suffixes.some((suffix) => `${candidate.scale}${suffix}` === name),
      );
      return {
        kind: 'tint-ramp',
        scale: site?.scale ?? null,
        colorVar: site?.colorVar ?? null,
        callSite: site ? siteLabel(site) : null,
        definitionSite: tintEmission.definitionSite,
      };
    }
    if (directEmission.has(name)) {
      const sites = directEmission.get(name);
      return {
        kind: 'direct-literal',
        family: [...new Set(sites.map((site) => site.rank ?? 'unranked'))].sort(),
        sites: sites.map(siteLabel),
      };
    }
    if (rosterEmission.has(name)) {
      const sites = rosterEmission.get(name);
      return {
        kind: 'keyed-resolved',
        family: [...new Set(sites.map((site) => site.rank ?? 'unranked'))].sort(),
        sites: sites.map(siteLabel),
      };
    }
    if (oracleEmission.has(name)) {
      const sites = oracleEmission.get(name);
      return {
        kind: 'produces-roster',
        family: [...new Set(sites.map((site) => site.rank ?? 'unranked'))].sort(),
        sites: sites.map(siteLabel),
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
    const externalPaint = externalPaintOf(name);
    const dsModernPainted = dsPaint.terminalSites.some((site) => site.scope !== 'frozen-engine');
    const dsFrozenOnlyPainted = dsPaint.painted && !dsModernPainted;
    const externalConsumerPainted = !dsPaint.painted && externalPaint.painted;
    const probe = probes.valid.get(name) ?? null;
    const probePainted = probe !== null && !dsPaint.painted && !externalPaint.painted;

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
    // A compiled artifact is not an authored read site, so it attributes to no family.
    const allDsSites = [
      ...dsPaint.terminalSites.map((s) => ({ file: s.file, line: s.line })),
      ...dsCustomRefSites.filter((s) => s.compiledVertical === undefined).map((s) => ({ file: s.file, line: s.line })),
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
      probePainted,
      cssReadNoTerminal,
      tsReadOnly,
      canonicalRosterMember: canonicalZScaleRoster.has(name),
    });

    const consumerSites = [
      ...(probePainted ? probe.tests.map((title) => `probe-painted:${probe.spec} :: ${title}`) : []),
      ...dsPaint.terminalSites.map((s) => `ds-terminal:${s.file}:${s.line} (${s.prop})`),
      ...externalPaint.terminalSites.map((s) => `${s.joined ? 'external-terminal-joined' : 'external-terminal'}:${s.file}:${s.line} (${s.prop}${s.joined ? ` via ${s.via}` : ''})`),
      ...dsCustomRefSites.map((s) => `${s.compiledVertical === undefined ? 'ds-custom-ref' : 'ds-compiled-ref'}:${s.file}:${s.line} (feeds --${s.targetProp.replace(/^--/, '')})`),
      ...externalCustomRefSites.map((s) => `external-custom-ref:${s.file}:${s.line} (feeds --${s.targetProp.replace(/^--/, '')})`),
      ...dsTsSites.map((s) => `ds-ts-unproven:${s.file}:${s.line}`),
      ...externalTsSites.map((s) => `external-ts-unproven:${s.file}:${s.line}`),
    ];

    // Emitted is a fact about output: the source extractor's proof OR a
    // first-party compiled artifact that declares the name. `compiledIn` names
    // which artifacts, so a source-only emission (tenant-conditional) stays
    // distinguishable from one every vertical ships.
    const compiledIn = [...(dsGraph.compiledDeclarations.get(name) ?? [])].sort();
    const sourceEmitted = emittedNames.has(name);
    channels.push({
      name,
      declaredOverride: declaredOverride.has(name),
      declaredReference: declaredReference.has(name),
      emitted: sourceEmitted || compiledIn.length > 0,
      sourceEmitted,
      compiledIn,
      emittedVia: tintEmission.names.has(name)
        ? 'tint-ramp'
        : directEmission.has(name)
          ? 'direct-literal'
          : rosterEmission.has(name)
            ? 'keyed-resolved'
            : oracleEmission.has(name)
              ? 'produces-roster'
              : compiledIn.length > 0
                ? 'compiled-artifact'
                : null,
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
      probePainted,
      // Which kind of proof a LIVE row stands on; a probe row is certified by
      // its cited probe, never by the cascade graph.
      paintEvidence: GRAPH_LIVE_CLASSIFICATIONS.has(classification)
        ? 'css-graph'
        : classification === LIVENESS.probePainted
          ? 'browser-probe'
          : null,
      probeEvidence: probePainted ? { ...probe, certifies: 'paint through the cited browser probe, not through the cascade graph' } : null,
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
      sourceEmitted: true,
      compiledIn: [],
      emittedVia: null,
      producer: null,
      semanticOwner: null,
      familyIds: [],
      sharedFamilyAttribution: false,
      reads: { dsTerminal: 0, externalTerminal: 0, dsTs: 0, externalTs: 0, total: 0 },
      dsModernPainted: false,
      dsFrozenOnlyPainted: false,
      externalConsumerPainted: false,
      probePainted: false,
      paintEvidence: null,
      probeEvidence: null,
      cssReadNoTerminal: false,
      tsReadOnly: false,
      consumerSites: [],
      consumerSitesTruncated: false,
      classification: null,
      classificationReason: null,
    });
  }

  const rowByName = new Map(channels.map((row) => [row.name, row]));
  for (const [channel, probe] of probes.valid) {
    const row = rowByName.get(channel);
    if (row === undefined) {
      failures.push(
        `probe evidence stale: ${channel} is cited to ${probe.spec} and no longer exists in the measured universe -- delete the entry in the same commit that removed the channel`,
      );
    } else if (GRAPH_LIVE_CLASSIFICATIONS.has(row.classification)) {
      failures.push(
        `probe evidence superseded: ${channel} is cited to ${probe.spec} and now classifies ${row.classification} through the cascade graph -- a graph terminal is the stronger proof, so delete the entry; this table only shrinks`,
      );
    }
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

  // --- STOP NO-GO: every non-LIVE row is still a standing finding (defects 3,
  // 8), and it must additionally carry a registered owner. The adjudication
  // reds on an unregistered row, a stale pin, a discharged pin and a drifted
  // pin; the effect verdict keeps every non-LIVE row red, pinned or not.
  const adjudication = adjudicateDispositions(channels, { dispositions });
  failures.push(...adjudication.failures);
  const effect = assessChannelEffect(channels);

  const sourceDigest = computeInputsDigest({
    gateScriptSource: readFileSync(SCRIPT_PATH, 'utf8'),
    evidenceContractRaw: readFileSync(DEFAULT_EVIDENCE_CONTRACT, 'utf8'),
    ciGatesManifestRaw: readFileSync(DEFAULT_CI_GATES_MANIFEST, 'utf8'),
    packageJsonRaw: readFileSync(DEFAULT_PACKAGE_JSON, 'utf8'),
    tenantThemeSource,
    flatThemeSources: compilerSources,
    familyInventoryRaw: JSON.stringify(familyRows),
    cssStylesheets,
    tsStylesheets,
    consumerCorpora: consumerResults.map(({ consumerRoot, load }) => ({
      id: consumerRoot.id,
      cssStylesheets: load.cssStylesheets,
      tsStylesheets: load.tsStylesheets,
    })),
    compiledArtifacts: artifacts,
    probeSpecs: probes.specs,
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
    ok: failures.length === 0 && effect.ok,
    failures,
    // Ownership PASS is not effect PASS: a fully pinned universe still fails here.
    effect,
    analysisLimitations,
    oracleClosedPatterns,
    sourceDigest,
    // A pinned finding is still a finding: it is published, with its owner, on
    // every run. Nothing here is a count that went down.
    dispositions: {
      registered: adjudication.registered,
      ownerPins: adjudication.ownerPins,
      structuralPins: adjudication.structuralPins,
      pinnedRows: adjudication.pinned.length,
      structuralRows: adjudication.structural.length,
      // The subset of `failures` the ownership law itself produced, so the
      // blocking leg can be exactly that law and nothing else.
      failures: adjudication.failures,
      byOwner: adjudication.byOwner,
      byInvariant: adjudication.byInvariant,
      pinned: [...adjudication.pinned].sort((a, b) => a.channel.localeCompare(b.channel)),
      structural: [...adjudication.structural].sort((a, b) => a.channel.localeCompare(b.channel)),
    },
    probeEvidence: {
      declared: probeEvidence.length,
      valid: probes.valid.size,
      rows: channels
        .filter((row) => row.classification === LIVENESS.probePainted)
        .map((row) => ({ channel: row.name, ...row.probeEvidence })),
    },
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
      emittedRows: channels.filter((row) => row.emitted).length,
      compiledRows: channels.filter((row) => row.compiledIn?.length > 0).length,
      compiledArtifacts: artifacts.length,
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
  flatThemeCompilerRoot = DEFAULT_BRAND_THEME_COMPILER_ROOT,
  familyInventoryPath = DEFAULT_FAMILY_INVENTORY,
  cssRoots = DEFAULT_CSS_ROOTS,
  compiledArtifactRoot = DEFAULT_COMPILED_ARTIFACT_ROOT,
  consumerRoots = DEFAULT_CONSUMER_ROOTS,
  probeEvidence = DEFAULT_PROBE_EVIDENCE,
  evidenceRoot = DEFAULT_EVIDENCE_ROOT,
  round = DEFAULT_ROUND,
  artifactPath = undefined,
  requireArtifact = false,
  dispositions = CHANNEL_DISPOSITIONS,
  drill = null,
} = {}) {
  const tenantThemeSource = readFileSync(tenantThemeContractPath, 'utf8');
  const flatThemeSources = collectFlatThemeCompilerSources(flatThemeCompilerRoot);
  const { rows: familyRows } = loadFamilyRows(familyInventoryPath);

  const cssFiles = collectSourceFiles(cssRoots, ['.css'], CORE_ROOT);
  const tsFiles = collectSourceFiles(cssRoots, ['.ts', '.tsx'], CORE_ROOT);
  const cssStylesheets = readStylesheets(cssFiles, CORE_ROOT);
  const tsStylesheets = readStylesheets(tsFiles, CORE_ROOT);
  const compiledArtifacts = loadCompiledArtifacts(compiledArtifactRoot);

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
    flatThemeSources,
    familyRows,
    cssStylesheets,
    tsStylesheets,
    consumerRoots,
    probeEvidence,
    compiledArtifacts,
    previousArtifact,
    enforceArtifactFreshness: requireArtifact,
    dispositions,
    drill,
  });

  const failures = [...preFailures, ...result.failures];
  return {
    ok: failures.length === 0 && result.effect.ok,
    failures,
    evidenceNote,
    result,
    resolvedArtifactPath,
    corpus: {
      cssFileCount: cssFiles.length,
      tsFileCount: tsFiles.length,
      compilerFileCount: flatThemeSources.length,
      compiledArtifactCount: compiledArtifacts.length,
    },
  };
}

/* ---------------------------------------------------------------------- */
/* 13. Reporting + CLI                                                    */
/* ---------------------------------------------------------------------- */

export function buildArtifact(gateRun, { round = DEFAULT_ROUND, evidenceRoot = DEFAULT_EVIDENCE_ROOT } = {}) {
  const { result, corpus } = gateRun;
  return {
    schemaVersion: 2,
    generatedBy: 'scripts/check/tokens/cascade/channels/liveness/index.mjs --write',
    roundId: round ?? DEFAULT_ROUND,
    sourceDigest: result.sourceDigest,
    scopeLaw:
      'Tenant-channel liveness ledger scoped to TENANT_THEME_OVERRIDE_TOKENS ∪ TENANT_THEME_REFERENCE_TOKENS ∪ brand-theme-compiler-emitted names, plus the app-bithire external consumerRoot. NOT the customization-surface-census.mjs dead-writer census. NOT tenant-channel-consumer-gate.mjs. NOT theme-channel-parity-gate.mjs. No classification asserts a channel is dead, but membership on TENANT_THEME_REFERENCE_TOKENS never protects a row from a NO-GO finding by itself -- only a proven finite terminal-paint chain (in-repo or via a required consumerRoot) does that.',
    inputs: {
      tenantThemeContract: relative(CORE_ROOT, DEFAULT_TENANT_THEME_CONTRACT).split(sep).join('/'),
      flatThemeCompiler: relative(CORE_ROOT, DEFAULT_BRAND_THEME_COMPILER_ROOT).split(sep).join('/'),
      familyInventory: relative(CORE_ROOT, DEFAULT_FAMILY_INVENTORY).split(sep).join('/'),
      evidenceContract: relative(CORE_ROOT, DEFAULT_EVIDENCE_CONTRACT).split(sep).join('/'),
      ciGatesManifest: relative(CORE_ROOT, DEFAULT_CI_GATES_MANIFEST).split(sep).join('/'),
      packageJson: relative(CORE_ROOT, DEFAULT_PACKAGE_JSON).split(sep).join('/'),
      cssRoots: DEFAULT_CSS_ROOTS.map((root) => relative(CORE_ROOT, root).split(sep).join('/')),
      compiledArtifactRoot: relative(CORE_ROOT, DEFAULT_COMPILED_ARTIFACT_ROOT).split(sep).join('/'),
      compiledArtifactCount: corpus.compiledArtifactCount ?? 0,
      cssFileCount: corpus.cssFileCount,
      tsFileCount: corpus.tsFileCount,
    },
    consumerRoots: result.consumerRoots,
    probeEvidence: result.probeEvidence,
    counts: result.counts,
    analysisLimitations: result.analysisLimitations,
    // The ledger records WHO owns every standing non-LIVE row it publishes, so
    // a reader of the artifact alone can tell an owned debt from an orphan one.
    dispositions: result.dispositions,
    channels: result.channels,
  };
}

export function formatReport(gateRun, { effectBlocks = true } = {}) {
  const { ok, failures, evidenceNote, result, corpus, resolvedArtifactPath } = gateRun;
  const lines = [];
  lines.push(
    `channel-liveness-gate: universe=${result.counts.universe} declaredOverride=${result.counts.declaredOverride} declaredReference=${result.counts.declaredReference} emitted=${result.counts.emitted}`,
  );
  lines.push(`  corpus: css=${corpus.cssFileCount} ts=${corpus.tsFileCount} compiledArtifacts=${corpus.compiledArtifactCount ?? 0}`);
  lines.push(
    `  emission: ${result.counts.emittedRows ?? result.counts.emitted} row(s) emitted (source proof or compiled artifact), ${result.counts.compiledRows ?? 0} declared by a compiled first-party artifact`,
  );
  lines.push(
    `  family attribution: resolved=${result.counts.attributedReadSites} unattributed=${result.counts.unattributedReadSites} unattributedShared=${result.counts.unattributedSharedReadSites} unknown=${result.counts.unknownFamilySites}`,
  );
  const oracleOnly = result.channels.filter((row) => row.emittedVia === 'produces-roster').length;
  lines.push(`  emission oracle: ${oracleOnly} name(s) emitted only by a family's produces: roster`);
  for (const site of result.oracleClosedPatterns ?? []) {
    lines.push(`    pattern closed by its exact roster: vars[${site.raw}] at ${site.file}:${site.line} -> ${site.family} {${site.names.join(', ')}}`);
  }
  lines.push('  consumerRoots:');
  for (const consumer of result.consumerRoots) {
    lines.push(
      `    ${consumer.id}: ${consumer.ok ? `ok css=${consumer.cssFileCount} ts=${consumer.tsFileCount}` : `FAILED -- ${consumer.error}`}`,
    );
  }
  if (result.probeEvidence) {
    lines.push(
      `  probe-painted rows (certified by a cited browser probe, NOT through the cascade graph): ${result.probeEvidence.rows.length} of ${result.probeEvidence.declared} declared citation(s)`,
    );
    for (const row of result.probeEvidence.rows) {
      lines.push(`    ${row.channel}: ${row.spec} :: ${row.tests.map((title) => `"${title}"`).join(', ')} -- ${row.proves}`);
    }
  }
  lines.push('  by classification:');
  for (const [classification, count] of Object.entries(result.counts.byClassification)) {
    lines.push(`    ${classification}: ${count}`);
  }
  // The pinned rows are PRINTED, every run, with their owners. A pin registers
  // ownership; it does not declare the debt resolved, and a reader who cannot
  // see the rows cannot tell the difference.
  if (result.dispositions) {
    lines.push(
      `  pinned dispositions (ownership registered -- the debt is NOT resolved): ${result.dispositions.pinnedRows} row(s) of ${result.dispositions.ownerPins ?? result.dispositions.registered} owner pin(s)`,
    );
    for (const [owner, names] of Object.entries(result.dispositions.byOwner)) {
      lines.push(`    ${owner} (${names.length}): ${names.join(', ')}`);
    }
    lines.push(
      `  structural constants (measured from the declaration site, pinned to an invariant -- not owed, not protected): ${result.dispositions.structuralRows ?? 0} row(s) of ${result.dispositions.structuralPins ?? 0} structural pin(s)`,
    );
    for (const [invariant, names] of Object.entries(result.dispositions.byInvariant ?? {})) {
      lines.push(`    ${invariant} (${names.length}): ${names.join(', ')}`);
    }
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
  if (result.effect && !result.effect.ok) {
    lines.push(
      `  effect verdict FAIL (ownership does not discharge it${effectBlocks ? '' : '; not part of this leg'}): ${result.effect.rows.length} non-LIVE row(s)`,
    );
    for (const failure of result.effect.failures) lines.push(`    - ${failure}`);
  }
  if (ok) {
    lines.push('channel-liveness-gate OK');
  } else {
    const effectRed = effectBlocks && result.effect && !result.effect.ok ? ' and the effect verdict above' : '';
    lines.push(`channel-liveness-gate FAIL -- ${failures.length} finding(s)${effectRed}:`);
    for (const failure of failures) lines.push(`  - ${failure}`);
  }
  return lines.join('\n');
}

/** The artifact asserts liveness, so only a green, unlimited analysis may write it. */
export function mayWriteArtifact(result) {
  return result.ok && result.effect.ok && result.analysisLimitations.length === 0;
}

/**
 * The preconditions without which an adjudication would be measured against the
 * WRONG classification, and therefore red for the wrong reason.
 *
 * A missing consumerRoot silently demotes every externally-painted channel to a
 * non-LIVE class, which would read as eleven unregistered rows. That must fail
 * as what it is -- a broken measurement -- and not as an ownership finding.
 */
const DISPOSITION_PRECONDITION_PREFIXES = Object.freeze([
  'zero corpus',
  'required consumerRoot missing',
  'consumer join unreadable',
  'unclassified output',
  'z-scale owner unreadable',
  'unresolved roster member',
  'probe evidence',
]);

/** Exactly the ownership law, plus the preconditions that make it readable. */
export function dispositionFailures(result) {
  return [
    ...result.failures.filter((failure) =>
      DISPOSITION_PRECONDITION_PREFIXES.some((prefix) => failure.startsWith(prefix))),
    ...(result.dispositions?.failures ?? []),
  ];
}

/* ---------------------------------------------------------------------- */
/* 11. Reconciliation against a real first-party compile (post-build)     */
/* ---------------------------------------------------------------------- */

/**
 * The names a first-party compile emits that the source universe cannot see yet, each group owned by the work order
 * that brings it in. Exact names, never a prefix: a new gap must be red, and a closed gap discharges its pin.
 */
export const FORWARD_GAP_PINS = Object.freeze([
  Object.freeze({
    owner: 'WO-EVI-02',
    registered: '2026-09-25',
    roster: '--ds-motion-*',
    reason: 'the motion family writes its duration, easing and offset roles through object-literal tables merged by Object.assign and through vars[channel] over MOTION_DIAL_CHANNELS and the lowering/foundation motion helpers -- shapes the source extractor does not model',
    channels: Object.freeze([
      '--ds-motion-attention',
      '--ds-motion-calm',
      '--ds-motion-deliberate',
      '--ds-motion-disclosure',
      '--ds-motion-ease-enter',
      '--ds-motion-ease-exit',
      '--ds-motion-ease-in-out',
      '--ds-motion-ease-move',
      '--ds-motion-ease-out',
      '--ds-motion-ease-standard',
      '--ds-motion-fast',
      '--ds-motion-feedback',
      '--ds-motion-glacial',
      '--ds-motion-instant',
      '--ds-motion-normal',
      '--ds-motion-offset-in',
      '--ds-motion-panel-offset',
      '--ds-motion-rearrange',
      '--ds-motion-resize',
      '--ds-motion-reveal',
      '--ds-motion-scale-in',
      '--ds-motion-slow',
    ]),
  }),
  Object.freeze({
    owner: 'WO-EVI-02',
    registered: '2026-09-25',
    roster: '--ds-color-*',
    reason: 'written by helpers outside the corpus root (lowering/foundation palette, ramps and seeds, the kernel chrome-variables table); all eleven are bithire-only, document-driven emissions',
    channels: Object.freeze([
      '--ds-color-border-focus',
      '--ds-color-link',
      '--ds-color-link-hover',
      '--ds-color-on-error',
      '--ds-color-on-info',
      '--ds-color-on-success',
      '--ds-color-on-warning',
      '--ds-color-primary-foreground',
      '--ds-color-primary-rgb',
      '--ds-color-secondary-rgb',
      '--ds-color-text-on-primary',
    ]),
  }),
  Object.freeze({
    owner: 'WO-EVI-02',
    registered: '2026-09-25',
    roster: '--ds-type-*',
    reason: 'the --ds-type-<role> composites are written through a computed key with no literal anywhere in src',
    channels: Object.freeze([
      '--ds-type-body',
      '--ds-type-caption',
      '--ds-type-code',
      '--ds-type-display',
      '--ds-type-label',
      '--ds-type-numeric',
      '--ds-type-page-title',
      '--ds-type-section-title',
      '--ds-type-supporting',
    ]),
  }),
  Object.freeze({
    owner: 'WO-EVI-02',
    registered: '2026-09-25',
    roster: '--ds-font-weight-*',
    reason: 'typography/weights merges its weight table through Object.assign, a shape the source extractor does not model',
    channels: Object.freeze([
      '--ds-font-weight-body',
      '--ds-font-weight-bold',
      '--ds-font-weight-medium',
      '--ds-font-weight-normal',
      '--ds-font-weight-regular',
      '--ds-font-weight-semibold',
    ]),
  }),
  Object.freeze({
    owner: 'WO-EVI-02',
    registered: '2026-09-25',
    roster: '--ds-sidebar-*',
    reason: 'written by the kernel chrome-variables sidebar table outside the corpus root',
    channels: Object.freeze([
      '--ds-sidebar-bg',
      '--ds-sidebar-item-bg-active',
      '--ds-sidebar-item-bg-hover',
      '--ds-sidebar-item-color-active',
      '--ds-sidebar-text',
      '--ds-sidebar-text-muted',
    ]),
  }),
  Object.freeze({
    owner: 'WO-EVI-02',
    registered: '2026-09-25',
    roster: '--ds-button-primary-*',
    reason: 'written by helpers outside the corpus root (lowering/foundation seeds and palette, kernel chrome-variables); bithire-only, document-driven',
    channels: Object.freeze([
      '--ds-button-primary-bg',
      '--ds-button-primary-bg-hover',
      '--ds-button-primary-border',
      '--ds-button-primary-color',
    ]),
  }),
  Object.freeze({
    owner: 'WO-EVI-02',
    registered: '2026-09-25',
    roster: '--ds-ease-*',
    reason: 'the motion family\'s easing aliases, merged through the same Object.assign tables as its --ds-motion-* roles',
    channels: Object.freeze([
      '--ds-ease-exit',
      '--ds-ease-standard',
    ]),
  }),
]);

/**
 * Both directions between the source universe and a real compile of the first-party verticals. Forward: compiled names
 * the universe lacks, each owned by a pin and covered by a family roster. Reverse: universe rows marked emitted that no
 * first-party compile produces (tenant- or engine-conditional emissions), named every run, never dropped.
 */
export function reconcileCompiledEmission({ channels, compiled, rosters, pins = FORWARD_GAP_PINS }) {
  const failures = [];
  const universe = new Map(channels.map((row) => [row.name, row]));
  const union = new Map();
  for (const [vertical, names] of compiled) {
    for (const name of names) union.set(name, [...(union.get(name) ?? []), vertical]);
  }
  const coverOf = (name) => rosters.filter((roster) => rosterCovers(roster, name)).map((roster) => roster.family);
  const outsideAnyRoster = [...union.keys()].filter((name) => coverOf(name).length === 0).sort();
  for (const name of outsideAnyRoster) {
    failures.push(`compiled outside every roster: ${name} is emitted by a first-party compile and declared by no family produces: roster`);
  }
  const pinOf = new Map();
  for (const pin of pins) for (const name of pin.channels) pinOf.set(name, pin);
  const forward = [...union.keys()].filter((name) => !universe.has(name)).sort().map((name) => ({
    name,
    verticals: union.get(name),
    rosterFamilies: coverOf(name),
    owner: pinOf.get(name)?.owner ?? null,
  }));
  for (const row of forward.filter((entry) => entry.owner === null)) {
    failures.push(`unowned forward gap: ${row.name} is emitted by ${row.verticals.join('/')} and absent from the source universe with no owner pin`);
  }
  const forwardNames = new Set(forward.map((row) => row.name));
  for (const pin of pins) {
    for (const name of pin.channels.filter((channel) => !forwardNames.has(channel))) {
      failures.push(`discharged forward pin: ${name} (${pin.owner}) is no longer a forward gap -- it joined the universe or left the compile, so delete it; this table only shrinks`);
    }
  }
  const reverse = channels
    .filter((row) => row.emitted && !union.has(row.name))
    .map((row) => ({ name: row.name, emittedVia: row.emittedVia, classification: row.classification }))
    .sort((left, right) => left.name.localeCompare(right.name));
  return { ok: failures.length === 0, failures, forward, reverse, outsideAnyRoster, compiledNames: union.size };
}

/** Every family roster of the compiler registry, attributed to its family. */
export function collectFamilyRosters(sources = collectFlatThemeCompilerSources()) {
  const byFamily = new Map();
  for (const source of sources) {
    const roster = extractProducesRoster(source.text, { file: source.path ?? null });
    const own = byFamily.get(source.family) ?? { family: source.family, exact: [], globs: [], unresolved: [] };
    for (const key of ['exact', 'globs', 'unresolved']) own[key].push(...roster[key]);
    byFamily.set(source.family, own);
  }
  return [...byFamily.values()];
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const checkDispositions = args.includes('--check-dispositions');
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
    if (!mayWriteArtifact(result)) {
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


  // THE OWNERSHIP LAW ON ITS OWN, which is the leg that blocks. The full
  // `--check` additionally requires the R1 artifact and the standing analysis
  // finding this producer refuses to hide (the family-inventory drift; the
  // typography/scale emitter patterns drained 2026-10-01 when the ramp was
  // stated literally); those have their own owners and are
  // recorded as such in the gate manifest. This leg answers one question -- is
  // every non-LIVE row owned, and does every pin still find its channel in the
  // class it was registered against -- and it answers it fail-closed.
  if (checkDispositions) {
    const blocking = dispositionFailures(gateRun.result);
    const report = formatReport(
      { ...gateRun, ok: blocking.length === 0, failures: blocking },
      { effectBlocks: false },
    );
    if (blocking.length === 0) console.log(report);
    else console.error(report);
    process.exitCode = blocking.length === 0 ? 0 : 1;
    return;
  }

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
