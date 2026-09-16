#!/usr/bin/env node
/**
 * ONE DIRECTION AUTHORITY (WO-INV-01).
 *
 * The reading direction has one owner: `useOptionalDirection`, which derives it
 * from the active locale's `LocaleConfig`. A component that re-derives it by
 * measuring the DOM gets three defects for free -- it is unavailable during SSR,
 * so server markup always assumes LTR; it forces a style recalculation at the
 * moment a drag or a panel is deciding its geometry; and it re-derives from
 * paint a fact the provider already holds, so the two can disagree between
 * first paint and the effect that writes `dir` onto the document.
 *
 * WHY THIS GATE EXISTS, AND WHY IT COUNTS SHAPES RATHER THAN ONE STRING.
 * WO-INV-01's roster was built by `grep "closest('[dir]')"`. That grep is
 * spelling-bound, and the tree answered it with four spellings:
 *
 *     element.closest('[dir]')              <- the roster saw this one
 *     node.closest("[dir]")                 <- data-table; invisible to it
 *     element.closest<HTMLElement>('[dir]') <- ten sites; invisible to it
 *     element.closest?.('[dir]')            <- scroll-reveal; invisible to it
 *
 * and a fifth shape that never calls `closest` at all, `getComputedStyle(x)
 * .direction`. The sweep's own acceptance criterion -- that grep reading zero --
 * therefore went green while sixteen probes were still live. A gate keyed to
 * the same string would inherit the same blindness, so this one keys on the
 * `[dir]` SELECTOR LITERAL (any call spelling) and on the computed-style read,
 * and its drill plants each spelling to prove it.
 *
 * TWO CLASSES, MEASURED SEPARATELY.
 *
 *   NAMED EXCEPTIONS. A portal reads its ANCHOR's context to reproduce it
 *       outside the anchor's subtree: `dir` and `lang` and the DS scope
 *       attributes together, kept live by a MutationObserver. That asks what an
 *       ancestry declares, not what the app locale is, and the authority cannot
 *       answer it. Each is declared below BY PATH WITH ITS REASON, never
 *       silently, and a reason too short to be one fails the drill.
 *
 *   PINNED DEBT. Every other probe is the defect above, awaiting its migration
 *       lot. The baseline pins a COUNT PER FILE: a new probe in a pinned file
 *       grows its count and fails, a probe in an unpinned file fails as a new
 *       owner, and a migration that removes one fails with an instruction to
 *       lower the pin -- which is how the pin follows the tree DOWN and never
 *       up. Lines are deliberately not pinned: an edit above a probe would move
 *       every number without changing anything the law cares about.
 *
 * Usage:
 *   node scripts/check/localization/direction-authority/index.mjs          # report
 *   node scripts/check/localization/direction-authority/index.mjs --check  # exit 1 on any finding
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const BASELINE_PATH = join(HERE, 'baseline/index.json');

/** The one module allowed to answer "what is the reading direction". */
export const DIRECTION_AUTHORITY = 'src/infrastructure/runtime/i18n/composition/direction';

/** The scanned corpus: authored component source, tests and stories excluded. */
export const SCAN_ROOT = 'src/components';

/**
 * A `[dir]` selector literal handed to `closest`, in ANY call spelling: bare,
 * generic (`closest<HTMLElement>(`) and optional (`closest?.(`). The gap between
 * `closest` and `(` is what four separate censuses tripped over, so it is
 * matched rather than assumed away.
 */
const SELECTOR_PROBE = /closest[^(]*\(\s*['"`]\[dir\]/;

/** A computed-style direction read, with or without the `window.` receiver. */
const COMPUTED_PROBE = /getComputedStyle\s*\([^)]*\)\s*\.\s*direction/;

/**
 * Anchor/portal context readers. NOT the defect above: each reads the anchor's
 * declared ancestry so a portal rendered outside that subtree can reproduce it.
 */
export const NAMED_EXCEPTIONS = Object.freeze({
  'primitives/runtime/overlay/portal-scope/index.tsx':
    "readLocaleContext(anchor) snapshots the anchor's `dir` AND `lang` AND its data-{ds-root,vertical,tenant,theme,engine,density} scope, and a MutationObserver over the anchor's ancestor chain keeps that snapshot live. The question is what this anchor's ancestry declares, so a portal rendered outside the subtree can reproduce it; the locale cannot answer it, and swapping direction alone would make it the one field of the snapshot that stops following the anchor while every sibling field still does.",
  'primitives/display/tooltip/engines/modern/index.tsx':
    'The tooltip carries its own copy of the portal-scope reader for the same reason: the floating panel is rendered outside the anchor subtree and must inherit the anchor context, not the app locale. It is a duplicate of the shared reader, which is its own consolidation question, but the READ is legitimate.',
  'primitives/overlay/popover/engines/modern/index.tsx':
    'The popover carries its own copy of the portal-scope reader, identical in purpose to the tooltip one: the panel is portalled away from the anchor and reproduces the anchor ancestry, direction included, rather than the locale.',
});

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

/**
 * Every DOM direction probe under the scan root, keyed by the file that holds
 * it. `root` exists so the drill can measure a sandbox copy instead of the real
 * tree; without it a planted red would prove nothing about the real gate.
 */
export function probeSites(root = ROOT) {
  const scanRoot = join(root, SCAN_ROOT);
  const sites = [];
  for (const file of walk(scanRoot)) {
    const path = toPosix(relative(join(root, SCAN_ROOT), file));
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        const kinds = [];
        if (SELECTOR_PROBE.test(line)) kinds.push('selector');
        if (COMPUTED_PROBE.test(line)) kinds.push('computed');
        if (kinds.length > 0) {
          sites.push({ path, line: index + 1, kinds, text: line.trim().slice(0, 100) });
        }
      });
  }
  return sites;
}

/** Probe COUNT per file -- the unit the baseline pins. */
export function probeCounts(root = ROOT) {
  const counts = {};
  for (const site of probeSites(root)) counts[site.path] = (counts[site.path] ?? 0) + 1;
  return counts;
}

export function readBaseline(baselinePath = BASELINE_PATH) {
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

/**
 * The verdict. A finding is a sentence a reader can act on, never a number
 * alone: it names the file, what moved and which direction it may move in.
 */
export function judge(counts, baseline = readBaseline()) {
  const findings = [];
  const pinned = baseline.pinnedDebt;

  for (const [path, count] of Object.entries(counts).sort()) {
    if (NAMED_EXCEPTIONS[path]) continue;
    const pin = pinned[path];
    if (pin === undefined) {
      findings.push(
        `${path}: ${count} DOM direction probe(s) in a file the baseline does not pin. `
          + 'Adopt `useOptionalDirection`, or declare the file in NAMED_EXCEPTIONS with the reason it is not the same read.',
      );
      continue;
    }
    if (count > pin.probes) {
      findings.push(`${path}: probes GREW from ${pin.probes} to ${count}. The direction authority is \`${DIRECTION_AUTHORITY}\`.`);
    } else if (count < pin.probes) {
      findings.push(`${path}: probes FELL from ${pin.probes} to ${count} -- lower the pin to ${count}.`);
    }
  }

  for (const [path, pin] of Object.entries(pinned).sort()) {
    if (counts[path] === undefined) {
      findings.push(`${path}: pinned at ${pin.probes} probe(s) and now has none -- remove the pin.`);
    }
  }

  for (const path of Object.keys(NAMED_EXCEPTIONS)) {
    if (counts[path] === undefined) {
      findings.push(`${path}: declared a named exception but holds no probe -- retire the exception.`);
    }
  }

  return findings;
}

export function run(root = ROOT) {
  const counts = probeCounts(root);
  return { counts, findings: judge(counts) };
}

function main() {
  const { counts, findings } = run();
  const debt = Object.entries(counts).filter(([path]) => !NAMED_EXCEPTIONS[path]);
  const exceptions = Object.entries(counts).filter(([path]) => NAMED_EXCEPTIONS[path]);
  const total = (entries) => entries.reduce((sum, [, count]) => sum + count, 0);

  const lines = [
    '[direction-authority]',
    `  authority                    : ${DIRECTION_AUTHORITY}`,
    `  probes awaiting migration    : ${total(debt)} in ${debt.length} file(s)`,
    `  named exceptions (anchor/portal): ${total(exceptions)} in ${exceptions.length} file(s)`,
  ];
  for (const [path, count] of debt.sort()) lines.push(`  DEBT ${path}: ${count}`);
  for (const finding of findings) lines.push(`  FINDING ${finding}`);
  lines.push(findings.length > 0 ? '[direction-authority] FAIL' : '[direction-authority] OK');

  process.stdout.write(`${lines.join('\n')}\n`);
  if (findings.length > 0 && process.argv.includes('--check')) process.exitCode = 1;
}

if (process.argv[1] && toPosix(process.argv[1]).endsWith('check/localization/direction-authority/index.mjs')) {
  main();
}
