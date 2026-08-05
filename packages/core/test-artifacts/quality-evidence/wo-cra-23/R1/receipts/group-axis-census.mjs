/**
 * Cohort 1 semantic-group axis census.
 *
 * WHY THIS EXISTS. R1 objective: "extract reusable semantic group recipes
 * instead of copying styles". Before anything can be extracted, the claim that
 * styles were COPIED has to be measured rather than asserted. This script reads
 * the modern engine skin files for the four Cohort 1 semantic groups and reports,
 * per family, which expressive axis channels that family actually consumes.
 *
 * A group is COHERENT when every member reads the same axis set. Anything else
 * means the group has no shared grammar and a tenant axis selection cannot move
 * it as a unit — which is precisely why two tenants read as one product with a
 * different colour.
 *
 * OWNERSHIP. This lives under the round evidence tree, not under
 * packages/core/scripts/, because R1 declares packages/core/scripts/** a
 * no-write domain: a canary lane may not edit its own judge. It is therefore a
 * measurement tool the lane runs, never a repo gate. Promoting it to a gate is
 * an integrator request for a later round.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..', '..', '..', '..', '..');
const SKIN = path.join(
  CORE,
  'src/foundation/tokens/css/runtime/engines/modern/skin',
);

/**
 * Semantic groups and their Cohort 1 members, keyed by the skin file that owns
 * each family's modern paint. `overlay-modal` is Modal's skin file name.
 */
export const COHORT_1_GROUPS = Object.freeze({
  control: ['button', 'segmented'],
  field: ['input', 'select', 'form-field'],
  overlay: ['overlay-modal', 'drawer', 'popover', 'dropdown'],
  feedback: ['alert', 'skeleton', 'spinner'],
});

/**
 * The expressive axes, expressed as the public channel families a skin reads to
 * honour them. These are the channels `expressive-profiles/expansion` emits, so
 * "does this family read the axis" is answerable by grep rather than by opinion.
 */
export const AXIS_CHANNELS = Object.freeze({
  edge: /--ds-edge-[a-z-]+/g,
  material: /--ds-material-[a-z-]+/g,
  elevation: /--ds-elevation-[a-z-]+/g,
  divider: /--ds-divider-[a-z-]+/g,
  motif: /--ds-motif-[a-z-]+/g,
  shadowStrength: /--ds-shadow-(?:key|ambient)-strength/g,
  motionRecipe: /--ds-recipe-[a-z-]+/g,
  typePosture:
    /--ds-(?:letter-spacing-[a-z-]+|[a-z-]*text-transform|type-[a-z-]+)/g,
  density: /--ds-density[a-z-]*/g,
});

export const AXIS_NAMES = Object.freeze(Object.keys(AXIS_CHANNELS));

function readSkin(family) {
  const file = path.join(SKIN, `${family}.css`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}


/**
 * SURFACE APPLICABILITY — derived, never asserted.
 *
 * Raw coherence divides shared axes by the UNION of axes any member reads. That
 * penalises a group whose members have genuinely different paint surfaces, and
 * it moved the wrong way for a good change: adopting the edge axis into input
 * and select grew the union 3 -> 4 while the shared set stayed {density}, so
 * 0.333 became 0.25 even though nothing degraded and two members GAINED an axis.
 *
 * So applicability is measured from the stylesheet itself. A family that
 * declares no border/background/box-shadow anywhere cannot carry edge, material
 * or elevation — form-field is a label/help/gap wrapper with no painted surface,
 * and giving it a border to satisfy a metric would box the field, which the
 * project's own forms-are-not-card-stacks rule forbids.
 *
 * This is reported ALONGSIDE the raw number, never instead of it.
 */
const SURFACE_PROBES = {
  edge: /border(-[a-z]+)?\s*:/,
  material: /background(-[a-z]+)?\s*:/,
  elevation: /box-shadow\s*:/,
  divider: /border(-[a-z]+)?\s*:/,
  shadowStrength: /box-shadow\s*:/,
  motif: /background(-[a-z]+)?\s*:/,
};

export function applicableAxes(family) {
  const css = readSkin(family);
  if (css === null) return null;
  const notApplicable = [];
  for (const [axis, probe] of Object.entries(SURFACE_PROBES)) {
    if (!probe.test(css)) notApplicable.push(axis);
  }
  return { notApplicable };
}

/** Axis -> distinct channel names this family reads. Absent axis = not read. */
export function censusFamily(family) {
  const css = readSkin(family);
  if (css === null) return { family, missingStylesheet: true, axes: {} };

  const axes = {};
  for (const [axis, pattern] of Object.entries(AXIS_CHANNELS)) {
    const hits = css.match(new RegExp(pattern.source, 'g'));
    if (hits) axes[axis] = [...new Set(hits)].sort();
  }
  return { family, missingStylesheet: false, axes };
}

/**
 * A group's coherence is the intersection of its members' axis sets over their
 * union. 1 means every member speaks the same grammar; 0 means the members
 * share nothing and the "group" exists only in prose.
 */
export function censusGroup(groupId, families) {
  const members = families.map(censusFamily);
  const sets = members.map((m) => new Set(Object.keys(m.axes)));
  const union = new Set(sets.flatMap((s) => [...s]));
  const shared = [...union].filter((axis) => sets.every((s) => s.has(axis)));
  const missing = [...union].filter((axis) => !shared.includes(axis));

  // Surface-adjusted: an axis a member has no paint surface for is excluded
  // from that member's union contribution, so the ratio measures adoption
  // rather than surface diversity.
  const applicability = Object.fromEntries(families.map((f) => [f, applicableAxes(f)]));
  const adjustedUnion = [...union].filter((axis) =>
    families.some((f) => !(applicability[f]?.notApplicable ?? []).includes(axis)),
  );
  const adjustedShared = adjustedUnion.filter((axis) =>
    families.every((f, i) => sets[i].has(axis) || (applicability[f]?.notApplicable ?? []).includes(axis)),
  );

  return {
    group: groupId,
    memberCount: members.length,
    applicability,
    surfaceAdjustedCoherence:
      adjustedUnion.length === 0 ? 0 : Number((adjustedShared.length / adjustedUnion.length).toFixed(3)),
    surfaceAdjustedShared: adjustedShared.sort(),
    members,
    sharedAxes: shared.sort(),
    unsharedAxes: missing.sort(),
    coherence: union.size === 0 ? 0 : Number((shared.length / union.size).toFixed(3)),
    membersReadingNoAxis: members
      .filter((m) => Object.keys(m.axes).length === 0)
      .map((m) => m.family),
  };
}

export function censusAll(groups = COHORT_1_GROUPS) {
  const results = Object.entries(groups).map(([id, fams]) => censusGroup(id, fams));
  return {
    schemaVersion: 1,
    censusId: 'wo-cra-23-R1-C1-group-axis-census',
    skinRoot: path.relative(path.resolve(CORE, '..', '..'), SKIN),
    axesConsidered: AXIS_NAMES,
    groups: results,
    summary: {
      groupsMeasured: results.length,
      groupsFullyCoherent: results.filter((g) => g.coherence === 1).length,
      familiesReadingNoAxis: results.flatMap((g) => g.membersReadingNoAxis),
      worstGroup: results.reduce((a, b) => (a.coherence <= b.coherence ? a : b)).group,
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  process.stdout.write(`${JSON.stringify(censusAll(), null, 2)}\n`);
}
