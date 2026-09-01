#!/usr/bin/env node
/**
 * @fileoverview DELIVERABLE 1 — the writeSet intersection checker.
 *
 * The programme's claim was that its lanes are "provably disjoint". Until
 * this file existed, `writeRoot` appeared in exactly one JSON document and in
 * no executable anywhere in the repository: the disjointness was prose. This
 * turns it into a computed verdict.
 *
 * FIVE RULES, EVERY ONE OF THEM COMPUTED.
 *
 *   R0 lane role      a lane is one of three shapes — a `family` bound to an
 *                     inventory row, a `domain` bound to a synthetic row, or
 *                     an `integrator` rooted in a declared shared region. Only
 *                     an integrator may declare its own root
 *   R1 bound          every declared pattern resolves inside its row's
 *                     `writeRoot` and outside its `writeExcludes`
 *   R2 collision      no two lanes share a file that EXISTS today
 *   R3 territory      no two lanes can both match a common path that does
 *                     not exist yet — reported with a synthesised witness
 *   R4 single-owner   no lane silently covers a file in an architecturally
 *                     shared region; at most one lane may CLAIM each such file
 *                     per plan, and at most one lane may hold a shared DOMAIN
 *                     per plan even when the files differ
 *
 * R2 IS NOT ENOUGH ON ITS OWN, and that is the whole reason R3 is here. Two
 * lanes rooted in the same directory with an empty intersection this
 * afternoon collide the moment either creates a file — which is precisely
 * what a writing lane is for. R2 proves today; R3 bounds tomorrow.
 *
 * There was a fifth rule. It checked that a sealed R0 ledger's `sharedSkinFiles`
 * summary agreed with the map re-derived from that same ledger's per-family
 * `skinFiles`, because the single-owner set was half-derived from it. That set
 * is now architectural — see `../../runtime/shared-files` — so the rule had
 * nothing left to protect, and a rule whose only subject is an archive is a
 * rule that makes the archive editable.
 *
 * USAGE
 *   node packages/core/scripts/check/orchestration/public/write-set-intersection/index.mjs \
 *        --plan <plan.json> [--json]
 *
 * The catalog is not an argument. `--inventory` / `--synthetic` are refused:
 * a run that could name its own ownership rows could bind any lane to any
 * subtree, which is not a check but a request.
 *
 * EXIT 0 clean · 1 violations found · 2 could not run.
 */
import { pathToFileURL } from 'node:url';
import { territoryOverlap } from '../../foundation/glob/index.mjs';
import { repoRoot } from '../../foundation/git/index.mjs';
import { buildSingleOwnerSet, singleOwnerHits } from '../../runtime/shared-files/index.mjs';
import { assertNoCatalogOverride } from '../../runtime/ownership-rows/index.mjs';
import { loadContext, readPlan, resolveLane } from '../../plans/index.mjs';
import { conclude, createFindings, EXIT, parseArgs } from '../../foundation/report/index.mjs';

const MAX_LISTED = 12;

function listCapped(items) {
  const shown = items.slice(0, MAX_LISTED).map((item) => `· ${item}`);
  if (items.length > MAX_LISTED) shown.push(`· … and ${items.length - MAX_LISTED} more`);
  return shown;
}

export function checkPlan({ plan, context }) {
  const { add, findings } = createFindings();
  const lanes = plan.lanes.map((lane) => resolveLane(lane, context));
  const singleOwner = buildSingleOwnerSet();

  // R0 — is the lane even a legal SHAPE? This runs first because the other
  // rules all reason about a bound, and a lane that invented its own bound has
  // already escaped the catalog before any of them look at it.
  for (const lane of lanes) {
    for (const violation of lane.roleViolations) {
      add({
        rule: 'R0-lane-role',
        message: `lane ${lane.id} [${lane.laneRole}]: ${violation.message}`,
      });
    }
  }

  // R1 — containment of each declaration inside its own bound.
  for (const lane of lanes) {
    for (const violation of lane.boundViolations) {
      if (violation.kind === 'pattern-escapes-writeRoot') {
        add({
          rule: 'R1-bound',
          message: `lane ${lane.id}: pattern "${violation.pattern}" reaches outside its writeRoot`,
          details: [`writeRoot: ${violation.writeRoot}`, `pattern anchors at: ${violation.anchor}`],
        });
      } else {
        add({
          rule: 'R1-bound',
          message: `lane ${lane.id}: pattern "${violation.pattern}" lands inside a declared writeExclude`,
          details: [`writeExclude: ${violation.exclude}`, `pattern anchors at: ${violation.anchor}`],
        });
      }
    }
    if (lane.filesOutsideBound.length > 0) {
      add({
        rule: 'R1-bound',
        message: `lane ${lane.id}: ${lane.filesOutsideBound.length} existing file(s) matched by the writeSet fall outside writeRoot ${lane.writeRoot}`,
        details: listCapped(lane.filesOutsideBound),
      });
    }
  }

  // R2 — pairwise intersection over files that exist. Computed, never asserted.
  for (let i = 0; i < lanes.length; i += 1) {
    for (let j = i + 1; j < lanes.length; j += 1) {
      const left = lanes[i];
      const right = lanes[j];
      const shared = left.files.filter((file) => right.fileSet.has(file));
      if (shared.length === 0) continue;
      add({
        rule: 'R2-collision',
        message: `lanes ${left.id} and ${right.id} both write ${shared.length} existing file(s)`,
        details: listCapped(shared),
      });
    }
  }

  // R3 — territory overlap: paths that do not exist yet but both lanes claim.
  for (let i = 0; i < lanes.length; i += 1) {
    for (let j = i + 1; j < lanes.length; j += 1) {
      const left = lanes[i];
      const right = lanes[j];
      // Both lanes' exclusions enter the decision procedure. That is what
      // resolves the three nested `writeRoot` pairs the ledger already
      // carries, and it is the only way two lanes sharing a directory can be
      // proven apart by shape.
      const exclusions = [...left.excludeTerritories, ...right.excludeTerritories];
      const witnesses = [];
      for (const leftTerritory of left.territories) {
        for (const rightTerritory of right.territories) {
          const overlap = territoryOverlap(leftTerritory, rightTerritory, exclusions);
          if (!overlap) continue;
          witnesses.push({
            witness: overlap.witness,
            exact: Boolean(overlap.exact),
            approximated: Boolean(overlap.approximated),
            undecided: Boolean(overlap.undecided),
            left: leftTerritory.source,
            right: rightTerritory.source,
          });
        }
      }
      if (witnesses.length === 0) continue;

      // A pair already reported by R2 is the same collision seen twice; keep
      // the territory finding only when it predicts something new.
      const novel = witnesses.filter((entry) => !left.fileSet.has(entry.witness) || !right.fileSet.has(entry.witness));
      if (novel.length === 0) continue;
      add({
        rule: 'R3-territory',
        message: `lanes ${left.id} and ${right.id} claim overlapping territory — a file created there would belong to both`,
        details: listCapped(
          novel.map(
            (entry) =>
              `witness ${entry.witness}  ←  ${left.id}:"${entry.left}"  ×  ${right.id}:"${entry.right}"` +
              `${entry.undecided ? '  [decision procedure hit its cap — reported as a collision, which is the conservative direction]' : entry.approximated ? '  [widened reduction — verdict is conservative]' : ''}`,
          ),
        ),
      });
    }
  }

  // R4 — single-owner shared files.
  const claimants = new Map();
  for (const lane of lanes) {
    for (const claim of lane.claimsSharedFiles) {
      if (singleOwnerHits(claim, singleOwner).length === 0) {
        add({
          rule: 'R4-single-owner',
          message: `lane ${lane.id} claims "${claim}" as a shared file, but it is not in the single-owner set — the claim is meaningless and hides what it is really writing`,
        });
        continue;
      }
      if (!lane.files.includes(claim) && !lane.declaredWriteSet.includes(claim)) {
        add({
          rule: 'R4-single-owner',
          message: `lane ${lane.id} claims "${claim}" but its own writeSet does not cover it`,
        });
      }
      if (!claimants.has(claim)) claimants.set(claim, []);
      claimants.get(claim).push(lane.id);
    }
  }
  for (const [file, ids] of claimants) {
    if (ids.length > 1) {
      add({
        rule: 'R4-single-owner',
        message: `${ids.length} lanes claim single-owner file "${file}": ${ids.join(', ')} — single ownership, always`,
      });
    }
  }

  // SINGLETON PER DOMAIN, NOT PER FILE. Per-file singleton lets two lanes hold
  // two different skin sheets at once, which is the scenario the rule exists to
  // prevent: shared CSS is one cascade, and two writers in it produce
  // interleaved change neither can review. A domain admits ONE integrator.
  const domainClaimants = new Map();
  for (const lane of lanes) {
    for (const claim of lane.claimsSharedFiles) {
      for (const hit of singleOwnerHits(claim, singleOwner)) {
        if (!domainClaimants.has(hit.domain)) domainClaimants.set(hit.domain, new Map());
        const byLane = domainClaimants.get(hit.domain);
        if (!byLane.has(lane.id)) byLane.set(lane.id, []);
        byLane.get(lane.id).push(claim);
      }
    }
  }
  for (const [domain, byLane] of domainClaimants) {
    if (byLane.size <= 1) continue;
    add({
      rule: 'R4-single-owner',
      message: `${byLane.size} lanes hold the "${domain}" domain in one plan: ${[...byLane.keys()].join(', ')} — a shared domain admits one integrator, even when the files differ`,
      details: [...byLane].map(([id, claims]) => `${id} claims ${claims.length}: ${listCapped(claims).join('  ')}`),
    });
  }
  for (const lane of lanes) {
    const claimed = new Set(lane.claimsSharedFiles);
    const uncovered = [];
    for (const file of lane.files) {
      if (claimed.has(file)) continue;
      const hits = singleOwnerHits(file, singleOwner);
      if (hits.length > 0) uncovered.push({ file, reason: hits[0].reason, origin: hits[0].origin });
    }
    if (uncovered.length === 0) continue;
    add({
      rule: 'R4-single-owner',
      message: `lane ${lane.id} covers ${uncovered.length} single-owner file(s) without declaring claimsSharedFiles`,
      details: listCapped(uncovered.map((entry) => `${entry.file}  [${entry.origin}] ${entry.reason}`)),
    });
  }

  const summary = `${lanes.length} lanes · ${lanes.reduce((total, lane) => total + lane.files.length, 0)} covered files · ${singleOwner.length} single-owner entries · ${context.universe.length} files in the universe`;
  return { findings, lanes, summary, singleOwner };
}

function main(argv) {
  const { flags } = parseArgs(argv);
  const planPath = flags.get('plan');
  if (!planPath || planPath === true) {
    console.error('usage: write-set-intersection --plan <plan.json> [--json]');
    return EXIT.USAGE;
  }

  let context;
  let plan;
  try {
    assertNoCatalogOverride(flags);
    const root = repoRoot();
    plan = readPlan(planPath);
    context = loadContext({ root });
  } catch (error) {
    console.error(`✗ write-set-intersection could not run: ${error.message}`);
    return EXIT.USAGE;
  }

  let result;
  try {
    result = checkPlan({ plan, context });
  } catch (error) {
    console.error(`✗ write-set-intersection could not run: ${error.message}`);
    return EXIT.USAGE;
  }

  if (!flags.get('json')) {
    console.log(`plan: ${plan.planId ?? planPath}`);
    for (const lane of result.lanes) {
      console.log(
        `  lane ${lane.id.padEnd(10)} row=${(lane.rowId ?? '<explicit>').padEnd(34)} files=${String(lane.files.length).padStart(4)}  root=${lane.writeRoot}`,
      );
    }
  }

  return conclude({ name: 'write-set-intersection', findings: result.findings, json: flags.get('json'), summary: result.summary });
}

/**
 * Exact entrypoint identity.
 *
 * A suffix test (`argv[1].endsWith("x/index.mjs")`) matches ANY path ending
 * that way. The drill folder for this module ends the same way, so importing
 * this file from its own drill ran main() and exited the process before a
 * single drill executed. Compare the resolved URL instead.
 */
function isEntrypoint(moduleUrl) {
  return process.argv[1] !== undefined && moduleUrl === pathToFileURL(process.argv[1]).href;
}

if (isEntrypoint(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
