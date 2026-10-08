/**
 * The structure baseline's only producers. Both are decrease-only for debt.
 *
 * tightenStructureBaseline (--update-baseline): drops resolved finding ids and
 * stale law pins and writes nothing else. It refuses, and writes nothing, on any
 * new finding, any new law member, an unpinned law or a changed law definition.
 * The inventory snapshot is carried forward untouched: it is a report, not debt.
 *
 * reanchorStructureBaseline (--re-anchor): the one sighted act that may raise a
 * pin, and only PER LAW. A law re-keys to its measured members only when it is
 * unpinned or its own definition changed (a D2/D3 ruling flips a constant).
 * Every other law is tightened exactly as --update-baseline does: a new member
 * refuses the whole run. It re-anchors the inventory snapshot and never admits a
 * new finding id.
 */

import { compareStructureBaseline } from '../index.mjs';
import { STRUCTURE_LAWS, changedLawDefinitions, compareStructureLaws } from '../laws/index.mjs';

function findingIds(result) {
  const findings = {};
  for (const entry of result.findings) (findings[entry.rule] ??= []).push(entry.id);
  return Object.fromEntries(Object.keys(findings).sort().map((rule) => [rule, [...findings[rule]].sort()]));
}

function pinLaws(laws) {
  return {
    definitions: laws.definitions,
    members: Object.fromEntries(STRUCTURE_LAWS.map((law) => [law, [...laws.members[law]].sort()])),
  };
}

export function tightenStructureBaseline({ result, laws, baseline }) {
  const findings = compareStructureBaseline(result, baseline);
  const lawComparison = compareStructureLaws(laws, baseline.laws);
  const refused = [];
  if (findings.added.length > 0) refused.push(`${findings.added.length} new finding(s): ${findings.added.slice(0, 5).join(', ')}`);
  if (!baseline.laws) refused.push('the baseline pins no structure laws: adopt them with one sighted --re-anchor');
  else {
    for (const law of changedLawDefinitions(laws, baseline.laws)) refused.push(`${law}: definition changed: re-key it with one sighted --re-anchor`);
  }
  for (const law of STRUCTURE_LAWS) {
    const added = lawComparison.added[law] ?? [];
    if (baseline.laws && added.length > 0) refused.push(`${law}: ${added.length} new member(s): ${added.slice(0, 5).join(', ')}`);
  }
  if (refused.length > 0) return { refused, baseline };
  return {
    refused,
    removed: {
      findings: findings.resolved,
      laws: Object.fromEntries(STRUCTURE_LAWS.map((law) => [law, lawComparison.stale[law] ?? []])),
    },
    baseline: {
      ...baseline,
      snapshot: { ...baseline.snapshot, findings: findingIds(result) },
      laws: pinLaws(laws),
    },
  };
}

export function reanchorStructureBaseline({ result, laws, baseline }) {
  const findings = compareStructureBaseline(result, baseline);
  const lawComparison = compareStructureLaws(laws, baseline.laws);
  const rekeyed = changedLawDefinitions(laws, baseline.laws);
  const refused = [];
  if (findings.added.length > 0) refused.push(`${findings.added.length} new finding(s): a re-anchor never admits a finding id`);
  if (rekeyed.length === 0) refused.push('no law is unpinned and no law definition changed: only --update-baseline (tighten) may write');
  for (const law of STRUCTURE_LAWS) {
    if (rekeyed.includes(law)) continue;
    const added = lawComparison.added[law] ?? [];
    if (added.length > 0) refused.push(`${law}: definition unchanged, so ${added.length} new member(s) refuse the re-anchor: ${added.slice(0, 5).join(', ')}`);
  }
  if (refused.length > 0) return { refused, baseline };
  return {
    refused,
    rekeyed,
    previous: { inventory: baseline.snapshot?.inventory ?? null, laws: baseline.laws ?? null },
    baseline: {
      ...baseline,
      snapshot: { inventory: result.inventory, findings: findingIds(result) },
      laws: pinLaws(laws),
    },
  };
}
