#!/usr/bin/env node
/**
 * artifact-coverage — which families a compiled tenant artifact can actually
 * reach, counted per family.
 *
 * THE QUESTION, and why no existing gate asks it. `read-without-producer` asks
 * whether a name the Modern skin reads is WRITTEN ANYWHERE in source.
 * `cascade-wiring` asks whether a channel has a path to a root. Both are source
 * questions. A tenant does not ship source: it ships ONE compiled artifact, and
 * a channel a family reads that the artifact never declares is a channel that
 * family will never see a tenant move, however many producers exist upstream.
 *
 * So the unit here is the family, and the measurement is a ratio per family:
 * of the `--ds-*` channels this family's Modern skin reads, how many does a
 * compiled first-party artifact declare. That ratio is published TWICE -- once
 * against the union of the three artifacts and once against each artifact
 * separately -- because they answer different questions and only the first one
 * used to be pinned. A family at ZERO on the union is a family the whole tenant
 * transport cannot touch; a family at zero on ONE artifact is a family that
 * tenant cannot touch.
 *
 * WHAT IT REPLACES. `variant-parity` and `mirror-parity` were retired by F-54
 * for measuring, respectively, docblock placeholders and the agreement of a
 * generated view with the tree it was generated from. This asks the causal
 * version of what they gestured at, over the same three artifacts.
 *
 * THE ARTIFACTS ARE READ, NOT REBUILT. `artifacts/generated/css/verticals/<v>/index.css`
 * is the repository-owned generated copy, and its freshness is already owned by
 * `vertical-css-source-staleness`, which recompiles each bundle from source in
 * memory and byte-compares. Recompiling here would be a second answer to a
 * question that already has an owner; what this gate adds is the coverage read
 * off whatever those files say today.
 *
 * DIRECTION. The read counters are EXACT pins, like every ratchet in this tree:
 * growth is a regression, and shrinkage is red with the instruction to lower the
 * pin in the same commit. The family POPULATION is not a counter at all -- it is
 * a named roster, because a count cannot see a rename (see `evaluateRoster`).
 * The vacuity guards are separate and blocking -- an artifact that declares
 * nothing, or a corpus with no families, is a broken scanner reporting a clean
 * tree.
 *
 * Usage:
 *   node scripts/check/theme/artifact-coverage/index.mjs            exit 1 on drift
 *   node scripts/check/theme/artifact-coverage/index.mjs --json     the measurement
 *   node scripts/check/theme/artifact-coverage/index.mjs --report   per-family rows
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import { catalogRevision, readChannels, skinFamilies, stripCssComments } from '../population/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);
export const BASELINE_PATH = join(HERE, 'baseline/index.json');
export const ARTIFACT_ROOT = 'artifacts/generated/css/verticals';

/** Every custom property a stylesheet DECLARES (writes), comments removed. */
export function declaredChannels(css) {
  const declared = new Set();
  for (const match of stripCssComments(css).matchAll(/(--[\w-]+)\s*:/gu)) declared.add(match[1]);
  return declared;
}

/** vertical -> the channels its compiled artifact declares. */
export function artifactChannels(root = DEFAULT_ROOT) {
  const base = join(root, ARTIFACT_ROOT);
  const byVertical = new Map();
  if (!existsSync(base)) return byVertical;
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = join(base, entry.name, 'index.css');
    if (!existsSync(file)) continue;
    byVertical.set(entry.name, declaredChannels(readFileSync(file, 'utf8')));
  }
  return byVertical;
}

/**
 * UNION AND PER ARTIFACT ARE DIFFERENT QUESTIONS, and this gate answers both
 * because two different readers ask it.
 *
 * `covered` is the UNION reach: of the channels a family reads, how many does
 * AT LEAST ONE shipped artifact declare. That is the right bottom line for the
 * unit `roadmap/evidence-graph.md` names -- "`artifact-coverage` per family" --
 * because a family that no artifact can touch is unreachable whichever tenant
 * you pick. On its own, though, it is a ratchet with a hole: 402 of the 8,302
 * covered reads rest on a channel at least one vertical does not declare, so
 * removing a channel from ONE artifact leaves every published number where it
 * was. STATUS indicator 4 ("Material roots emitted per artifact", target
 * 71/71/71) is asking the other question and would not have noticed.
 *
 * So `perVertical` is aggregated, pinned and evaluated alongside the union, and
 * `coveredEveryVertical` publishes the intersection -- the reads every artifact
 * declares, which is the only figure a per-artifact claim may quote.
 */
export function measure(root = DEFAULT_ROOT) {
  const byVertical = artifactChannels(root);
  const verticals = [...byVertical.keys()];
  const union = new Set([...byVertical.values()].flatMap((set) => [...set]));
  const everyVertical = new Set(
    [...union].filter((channel) => verticals.every((vertical) => byVertical.get(vertical).has(channel))),
  );
  const families = [];
  for (const [family, files] of skinFamilies(root)) {
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    // `--ds-*` only: a skin also reads `--_ds-*` privates and third-party
    // names, and neither is something a tenant artifact is supposed to declare.
    const reads = [...readChannels(css)].filter((channel) => channel.startsWith('--ds-'));
    const covered = reads.filter((channel) => union.has(channel));
    families.push({
      family,
      reads: reads.length,
      covered: covered.length,
      uncovered: reads.length - covered.length,
      coveredEveryVertical: reads.filter((channel) => everyVertical.has(channel)).length,
      perVertical: Object.fromEntries(
        [...byVertical].map(([vertical, set]) => [vertical, reads.filter((c) => set.has(c)).length]),
      ),
    });
  }
  families.sort((a, b) => a.family.localeCompare(b.family));
  const reads = families.reduce((total, row) => total + row.reads, 0);
  const covered = families.reduce((total, row) => total + row.covered, 0);
  const sum = (vertical) => families.reduce((total, row) => total + row.perVertical[vertical], 0);
  return {
    revision: catalogRevision().digest,
    verticals: Object.fromEntries([...byVertical].map(([vertical, set]) => [vertical, set.size])),
    unionChannels: union.size,
    everyVerticalChannels: everyVertical.size,
    families: families.length,
    // The population is pinned BY NAME, so the names are part of the
    // measurement rather than something a reader has to recover from `rows`.
    familyNames: families.map((row) => row.family),
    reads,
    covered,
    uncovered: reads - covered,
    // The per-artifact half. `covered` above is the union, so it cannot move
    // when one artifact stops declaring a channel the other two still do.
    coveredPerVertical: Object.fromEntries(verticals.map((vertical) => [vertical, sum(vertical)])),
    uncoveredPerVertical: Object.fromEntries(verticals.map((vertical) => [vertical, reads - sum(vertical)])),
    coveredEveryVertical: families.reduce((total, row) => total + row.coveredEveryVertical, 0),
    unreachableFamilies: families.filter((row) => row.reads > 0 && row.covered === 0).map((row) => row.family),
    unreachablePerVertical: Object.fromEntries(verticals.map((vertical) => [
      vertical,
      families.filter((row) => row.reads > 0 && row.perVertical[vertical] === 0).map((row) => row.family),
    ])),
    rows: families,
  };
}

/**
 * THE FAMILY POPULATION IS A NAMED SET, NOT A COUNTER, and the hole this closes
 * is why. `families` was pinned at 275 on 2026-09-11, when the tree held 275.
 * Eight family-cut commits then merged eleven skins into five, the counter read
 * 269 for four days, and all the gate could say was "coverage got WORSE" -- the
 * wrong verb for a merge, and without a single name to check. Worse, THREE of
 * those eight netted to zero (autocomplete -> auto-complete, overlay-modal ->
 * modal, skeleton-compounds -> skeleton-anatomy): a count pin cannot see a
 * rename at all, so a family could be replaced by an entirely different one and
 * nothing would move.
 *
 * So the pin is the roster, in the shape `unreachableFamilies` already uses. A
 * family arriving or leaving is named. It leaves only through `retiredFamilies`,
 * whose value is the written reason -- the lot and commit that merged it -- and
 * an empty reason is refused. What this CANNOT check is whether a reason is
 * true or still current; it enforces that the re-anchor is deliberate and
 * attributed, not that the author was honest.
 */
function evaluateRoster(result, baseline, failures) {
  const roster = baseline.familyRoster;
  if (!Array.isArray(roster)) {
    failures.push('familyRoster: no roster — a family count without its names cannot see a rename');
    return;
  }
  const retired = baseline.retiredFamilies ?? {};
  if (baseline.families !== roster.length) {
    failures.push(
      `families: the pin ${baseline.families} and the roster of ${roster.length} names disagree `
      + '— re-anchor both in this commit',
    );
  }
  // EVERY NAME EVER PINNED stays in exactly one of the two sets, so a family
  // cannot leave the baseline by being quietly deleted from the roster: that
  // lowers the union and is refused by name here. Writing the reason into
  // `retiredFamilies` is the only move that keeps the union whole. What this
  // cannot do is stop an author who edits this integer too — like every
  // baseline in this tree, it makes the concession deliberate and reviewable,
  // it does not make it impossible.
  const union = roster.length + Object.keys(retired).length;
  if (typeof baseline.familiesEverPinned !== 'number') {
    failures.push('familiesEverPinned: no pin — without it a family can leave the roster with no record');
  } else if (union !== baseline.familiesEverPinned) {
    failures.push(
      `familiesEverPinned: ${union} families are accounted for (${roster.length} live + `
      + `${Object.keys(retired).length} retired) against the pinned ${baseline.familiesEverPinned} — a family `
      + 'left the baseline without a record, or a new one arrived and nobody raised the pin',
    );
  }
  const measured = new Set(result.familyNames);
  for (const family of result.familyNames) {
    if (!roster.includes(family)) {
      failures.push(`${family}: a skin family nobody pinned — add it to familyRoster in this commit`);
    }
  }
  for (const family of [...roster].sort()) {
    if (!measured.has(family)) {
      failures.push(
        `${family}: pinned as a skin family and its skin is gone — restore it, or move it to retiredFamilies `
        + 'with the lot and commit that merged it',
      );
    }
  }
  for (const [family, reason] of Object.entries(retired)) {
    if (measured.has(family)) {
      failures.push(`${family}: recorded as retired and its skin is back — move it to familyRoster`);
    }
    if (typeof reason !== 'string' || reason.trim() === '') {
      failures.push(`${family}: retired with no written reason — the reason IS the re-anchor`);
    }
    if (roster.includes(family)) {
      failures.push(`${family}: in familyRoster and retiredFamilies at once — the two sets are disjoint`);
    }
  }
}

export function evaluate(result, baseline) {
  const failures = [];

  // Vacuity first. Every number below is a ratio over these, and a scanner that
  // stopped scanning makes all of them look better.
  if (result.families === 0) failures.push('zero skin families found — the corpus walk is broken');
  if (result.reads === 0) failures.push('zero channel reads found — the var() scan is broken');
  for (const [vertical, count] of Object.entries(result.verticals)) {
    if (count === 0) failures.push(`${vertical}: its compiled artifact declares no channel at all`);
  }
  const expected = Object.keys(baseline.verticals ?? {});
  for (const vertical of expected) {
    if (!Object.hasOwn(result.verticals, vertical)) {
      failures.push(`${vertical}: pinned but no compiled artifact was found`);
    }
  }
  for (const vertical of Object.keys(result.verticals)) {
    if (!expected.includes(vertical)) {
      failures.push(`${vertical}: a compiled artifact nobody pinned; add it to the baseline with its count`);
    }
  }

  const compare = (name, actual, pinned, direction) => {
    if (typeof pinned !== 'number') {
      failures.push(`${name}: no pin — an unpinned counter is not a ratchet`);
      return;
    }
    if (actual === pinned) return;
    if (direction === 'down' && actual > pinned) {
      failures.push(`${name}: ${actual} > pinned ${pinned} — coverage got WORSE`);
    } else if (direction === 'down') {
      failures.push(`${name}: ${actual} < pinned ${pinned} — it improved; lower the pin in this commit`);
    } else if (actual < pinned) {
      failures.push(`${name}: ${actual} < pinned ${pinned} — coverage got WORSE`);
    } else {
      failures.push(`${name}: ${actual} > pinned ${pinned} — it improved; raise the pin in this commit`);
    }
  };

  compare('uncovered reads (union)', result.uncovered, baseline.uncovered, 'down');
  compare('covered reads (union)', result.covered, baseline.covered, 'up');
  compare('covered reads (every artifact)', result.coveredEveryVertical, baseline.coveredEveryVertical, 'up');
  evaluateRoster(result, baseline, failures);

  // PER ARTIFACT. Without these three, a channel can leave one artifact and no
  // published counter moves, because the other two still carry it into the
  // union. This is the half STATUS indicator 4 is asking about.
  for (const [vertical, count] of Object.entries(result.coveredPerVertical)) {
    compare(`covered reads (${vertical})`, count, baseline.coveredPerVertical?.[vertical], 'up');
  }
  for (const [vertical, families] of Object.entries(result.unreachablePerVertical)) {
    const pinned = [...(baseline.unreachablePerVertical?.[vertical] ?? [])].sort();
    for (const family of [...families].sort()) {
      if (!pinned.includes(family)) {
        failures.push(
          `${family}: reads --ds-* channels and the ${vertical} artifact declares NONE of them — a family that `
          + 'tenant cannot reach',
        );
      }
    }
    for (const family of pinned) {
      if (!families.includes(family)) {
        failures.push(`${family}: pinned as unreachable on ${vertical} and is no longer; remove it from the baseline`);
      }
    }
  }

  const pinnedUnreachable = [...(baseline.unreachableFamilies ?? [])].sort();
  const actualUnreachable = [...result.unreachableFamilies].sort();
  for (const family of actualUnreachable) {
    if (!pinnedUnreachable.includes(family)) {
      failures.push(
        `${family}: reads --ds-* channels and NO compiled artifact declares one of them — a family no tenant can reach`,
      );
    }
  }
  for (const family of pinnedUnreachable) {
    if (!actualUnreachable.includes(family)) {
      failures.push(`${family}: pinned as unreachable and is no longer; remove it from the baseline`);
    }
  }
  return failures;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = measure();
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  if (process.argv.includes('--report')) {
    for (const row of result.rows) {
      console.log(`  ${row.family.padEnd(34)} ${String(row.covered).padStart(4)}/${String(row.reads).padEnd(4)} covered`);
    }
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const failures = evaluate(result, baseline);
  const percent = result.reads === 0 ? 0 : (result.covered / result.reads) * 100;
  const everyPercent = result.reads === 0 ? 0 : (result.coveredEveryVertical / result.reads) * 100;
  console.log(
    `artifact-coverage — ${result.families} families, ${result.covered}/${result.reads} channel reads `
    + `(${percent.toFixed(1)}%) declared by AT LEAST ONE compiled artifact, ${result.coveredEveryVertical} `
    + `(${everyPercent.toFixed(1)}%) by EVERY one; union ${result.unionChannels} channels, common `
    + `${result.everyVerticalChannels}, across ${Object.keys(result.verticals).length} verticals; `
    + `catalog ${result.revision}`,
  );
  console.log(
    `  per artifact: ${Object.entries(result.coveredPerVertical)
      .map(([vertical, count]) => `${vertical} ${count}/${result.reads}`).join(', ')}`,
  );
  if (failures.length > 0) {
    for (const failure of failures) console.error(`artifact-coverage FAIL — ${failure}`);
    process.exit(1);
  }
  console.log(`artifact-coverage OK — ${result.unreachableFamilies.length} unreachable famil(ies), exactly the pin.`);
}
