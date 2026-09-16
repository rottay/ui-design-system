#!/usr/bin/env node
/**
 * PHYSICAL PROPERTIES (WO-INV-01) -- the paint half of the one-direction law.
 *
 * `direction-authority` governs how a component ASKS for the reading direction.
 * This gate governs what it does with the answer: a physical edge written into
 * a style object -- `marginLeft`, `paddingRight`, `left`, `borderRight`,
 * `textAlign: 'left'`, `float` -- does not follow the reading direction, so
 * under RTL it lands on the wrong side of the box. The logical spellings
 * (`marginInlineStart`, `insetInlineStart`, `textAlign: 'start'`) already are
 * the house idiom: six live owners use them today.
 *
 * SCOPE: TSX STYLE OBJECTS UNDER `src/components`. There is no `.css` under
 * that root -- skin stylesheets live in `src/foundation/tokens/css` and are
 * governed by their own owners -- so this gate reads what a component writes
 * inline, which is the only physical paint a component itself decides.
 *
 * FROZEN ENGINES ARE EXCLUDED BY PATH, not pinned. 223 of the 245 measured
 * sites live under `engines/classic/` or `engines/rustic/`, and the freeze law
 * already governs them with its own gate, where every exception is written and
 * content-pinned. A second ratchet over the same files would duplicate noise
 * rather than signal. If the freeze is ever lifted from one of them it enters
 * the live population at that moment and is pinned then.
 *
 * THREE BANDS, MEASURED APART.
 *
 *   NAMED EXCEPTIONS. A measured viewport coordinate is PHYSICAL by nature: a
 *       pointer position, a `getBoundingClientRect()` edge, an offscreen
 *       sentinel. Rewriting one as `insetInlineStart` would reinterpret the
 *       same number under RTL and put the panel on the wrong side -- the
 *       migration would be the bug. Each is declared by path WITH its reason.
 *
 *   PINNED DEBT. A physical edge that should be logical. Count per file,
 *       decrease-only: growth fails, a site in an unpinned file fails as a new
 *       owner, and a fix fails with an instruction to lower the pin.
 *
 *   INERT. `left: 0` beside `right: 0`, or a centred `left: '50%'` paired with
 *       a transform: both edges pinned or the box centred, so flipping the
 *       direction moves nothing. Counted rather than excluded by rule --
 *       proving symmetry pair-by-pair is fragile, and a pinned band is what
 *       stops tomorrow's unpaired `left: 0` from arriving unnoticed. Clearing
 *       one is a zero-pixel change.
 *
 * Usage:
 *   node scripts/check/localization/physical-properties/index.mjs          # report
 *   node scripts/check/localization/physical-properties/index.mjs --check  # exit 1 on any finding
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const BASELINE_PATH = join(HERE, 'baseline/index.json');

/** The scanned corpus: authored component source, tests and stories excluded. */
export const SCAN_ROOT = 'src/components';

/** Frozen by owner decision; the freeze gate governs them, not this one. */
export const FROZEN = /\/engines\/(classic|rustic)\//;

/**
 * The physical property names. Every one has a logical counterpart that follows
 * the reading direction; `textAlign` and `float` count only when their VALUE is
 * physical, since `center` and `none` are direction-neutral.
 */
export const PHYSICAL_PROPERTIES = Object.freeze([
  'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight',
  'left', 'right',
  'borderLeft', 'borderRight',
  'borderLeftWidth', 'borderRightWidth', 'borderLeftColor', 'borderRightColor',
  'borderLeftStyle', 'borderRightStyle',
  'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  'textAlign', 'float',
]);

const PHYSICAL = new Set(PHYSICAL_PROPERTIES);

/**
 * A key inside a style object, in ANY spelling: bare (`left:`), single- or
 * double-quoted (`'left':`), and backtick (`` `left`: ``). The quote is matched
 * rather than assumed away, because a spelling-bound detector is exactly how
 * WO-INV-01's own roster missed ten sites.
 */
const KEY = /(?:^|[{,;\s])(['"`]?)([A-Za-z-]+)\1\s*:/g;

/** `textAlign` / `float` count only for a physical value. */
const PHYSICAL_VALUE = /^\s*['"`]?(left|right)\b/;

const VALUE_GATED = new Set(['textAlign', 'float']);

/** `element.style.left = ...` and `setProperty('margin-left', ...)`. */
const STYLE_ASSIGN = /\.style\.([A-Za-z]+)\s*=/g;
const SET_PROPERTY = /setProperty\(\s*['"]([a-z-]+)['"]/g;

const toPosix = (value) => value.split(sep).join('/');
const isAuthored = (name) =>
  /\.tsx?$/.test(name) && !/\.(test|spec|stories)\.tsx?$/.test(name);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'tests') continue;
      walk(full, out);
    } else if (isAuthored(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Comments are blanked, never deleted, so prose can never satisfy a check and line numbers survive. */
function blankComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/(^|\n)(\s*)\/\/[^\n]*/g, (match, head, indent) => head + indent);
}

/** Every `style={{ … }}` / `: CSSProperties = { … }` body, brace-balanced. */
function styleObjectSpans(text) {
  const spans = [];
  const opener = /style=\{\s*\{|:\s*(?:React\.)?CSSProperties\s*=\s*\{/g;
  let match;
  while ((match = opener.exec(text)) !== null) {
    const start = text.indexOf('{', match.index + (match[0].startsWith('style=') ? 'style='.length : 0));
    let depth = 0;
    for (let index = start; index < text.length; index += 1) {
      if (text[index] === '{') depth += 1;
      else if (text[index] === '}') {
        depth -= 1;
        if (depth === 0) {
          spans.push([start, index]);
          break;
        }
      }
    }
  }
  return spans;
}

/**
 * Every physical-property site under the scan root. `root` exists so the drill
 * can measure a sandbox copy; without it a planted red would prove nothing
 * about the real gate.
 */
export function physicalSites(root = ROOT) {
  const scanRoot = join(root, SCAN_ROOT);
  const sites = [];
  for (const file of walk(scanRoot)) {
    const path = toPosix(relative(scanRoot, file));
    if (FROZEN.test(`/${path}`)) continue;
    const text = blankComments(readFileSync(file, 'utf8'));
    const lineAt = (index) => text.slice(0, index).split('\n').length;
    const seen = new Set();
    const record = (index, property) => {
      const line = lineAt(index);
      const key = `${line}:${property}`;
      if (seen.has(key)) return;
      seen.add(key);
      sites.push({ path, line, property });
    };

    for (const [start, end] of styleObjectSpans(text)) {
      const body = text.slice(start, end + 1);
      KEY.lastIndex = 0;
      let match;
      while ((match = KEY.exec(body)) !== null) {
        const property = match[2];
        if (!PHYSICAL.has(property)) continue;
        if (VALUE_GATED.has(property) && !PHYSICAL_VALUE.test(body.slice(match.index + match[0].length))) {
          continue;
        }
        record(start + match.index, property);
      }
    }

    for (const [regex, transform] of [
      [STYLE_ASSIGN, (value) => value],
      [SET_PROPERTY, (value) => value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())],
    ]) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const property = transform(match[1]);
        if (PHYSICAL.has(property)) record(match.index, property);
      }
    }
  }
  return sites;
}

/** Site COUNT per file -- the unit the baseline pins. */
export function physicalCounts(root = ROOT) {
  const counts = {};
  for (const site of physicalSites(root)) counts[site.path] = (counts[site.path] ?? 0) + 1;
  return counts;
}

export function readBaseline(baselinePath = BASELINE_PATH) {
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

export function namedExceptions(baseline = readBaseline()) {
  return baseline.namedExceptions;
}

/**
 * The verdict. Each band answers for its own files; a file belongs to exactly
 * one band, which is what keeps the pin readable.
 */
export function judge(counts, baseline = readBaseline()) {
  const findings = [];
  const { namedExceptions: exceptions, pinnedDebt, inert } = baseline;

  const bandOf = (path) =>
    exceptions[path] ? 'exception' : pinnedDebt[path] ? 'debt' : inert[path] ? 'inert' : null;

  for (const [path, count] of Object.entries(counts).sort()) {
    const band = bandOf(path);
    if (band === null) {
      findings.push(
        `${path}: ${count} physical-property site(s) in a file no band declares. `
          + 'Write the logical spelling, or declare the file in the baseline with the reason it must stay physical.',
      );
      continue;
    }
    if (band === 'exception') continue;
    const pin = band === 'debt' ? pinnedDebt[path] : inert[path];
    if (count > pin.sites) {
      findings.push(`${path}: physical sites GREW from ${pin.sites} to ${count} (${band}).`);
    } else if (count < pin.sites) {
      findings.push(`${path}: physical sites FELL from ${pin.sites} to ${count} (${band}) -- lower the pin to ${count}.`);
    }
  }

  for (const [band, rows] of [['debt', pinnedDebt], ['inert', inert]]) {
    for (const [path, pin] of Object.entries(rows).sort()) {
      if (counts[path] === undefined) {
        findings.push(`${path}: pinned at ${pin.sites} ${band} site(s) and now has none -- remove the pin.`);
      }
    }
  }

  for (const path of Object.keys(exceptions).sort()) {
    if (counts[path] === undefined) {
      findings.push(`${path}: declared a named exception but holds no physical site -- retire the exception.`);
    }
  }

  return findings;
}

export function run(root = ROOT) {
  const counts = physicalCounts(root);
  return { counts, findings: judge(counts) };
}

function main() {
  const { counts, findings } = run();
  const baseline = readBaseline();
  const band = (rows) => Object.entries(counts).filter(([path]) => rows[path]);
  const total = (entries) => entries.reduce((sum, [, count]) => sum + count, 0);
  const debt = band(baseline.pinnedDebt);
  const inert = band(baseline.inert);
  const exceptions = band(baseline.namedExceptions);

  const lines = [
    '[physical-properties]',
    `  debt awaiting the logical spelling : ${total(debt)} in ${debt.length} file(s)`,
    `  inert (symmetric / centred)        : ${total(inert)} in ${inert.length} file(s)`,
    `  named exceptions (measured space)  : ${total(exceptions)} in ${exceptions.length} file(s)`,
    `  frozen engines                     : excluded by path (the freeze gate owns them)`,
  ];
  for (const [path, count] of debt.sort()) lines.push(`  DEBT  ${path}: ${count}`);
  for (const [path, count] of inert.sort()) lines.push(`  INERT ${path}: ${count}`);
  for (const finding of findings) lines.push(`  FINDING ${finding}`);
  lines.push(findings.length > 0 ? '[physical-properties] FAIL' : '[physical-properties] OK');

  process.stdout.write(`${lines.join('\n')}\n`);
  if (findings.length > 0 && process.argv.includes('--check')) process.exitCode = 1;
}

if (process.argv[1] && toPosix(process.argv[1]).endsWith('check/localization/physical-properties/index.mjs')) {
  main();
}
