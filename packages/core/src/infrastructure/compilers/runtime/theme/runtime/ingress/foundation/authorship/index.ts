/**
 * @fileoverview Admission: which leaves this tenant actually authored.
 *
 * `collectPatchAuthoredPaths` is deliberately an OVER-APPROXIMATION -- it
 * enumerates container keys as well as leaves, and the v1 migration builds its
 * palette objects with every field present and most of them `undefined`, so
 * `authoredPaths.has("palette.textSecondaryColor")` is true for a document that
 * only ever set a background. Its own docblock says this is safe because its
 * two consumers are closed field vocabularies that were checked against it.
 *
 * An admission cannot use it. Refusing a tenant for an ink it never wrote, or
 * charging it for a `pro` decision it never activated, is exactly the kind of
 * wrong that makes a door untrustworthy -- so this owner answers the narrower
 * question the admission actually asks: which keypaths carry a DEFINED value.
 *
 * It lives in the INGRESS rather than beside the admission that first needed
 * it: the draft transport has to ask the same question while it is building its
 * patch, and a second copy of "which leaves did this tenant author" is the
 * defect class this programme keeps paying for.
 *
 * @module Compilers/Theme/Ingress/Foundation/Authorship
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  Theme,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";

/**
 * The five `Governed<T>` roots. Their authored paths are recorded unwrapped, so
 * `motion.value.intensity` is `motion.intensity` -- the same normalization
 * `collectPatchAuthoredPaths` performs, restated here because both readers must
 * agree on one spelling.
 */
const GOVERNED_UNWRAPPED_ROOTS: readonly string[] = [
  "charts",
  "motion",
  "recipes",
  "expressive",
  "responsive",
];

function unwrapGoverned(path: string): string {
  const segments = path.split(".");
  return segments.length > 1 &&
    segments[1] === "value" &&
    GOVERNED_UNWRAPPED_ROOTS.includes(segments[0])
    ? [segments[0], ...segments.slice(2)].join(".")
    : path;
}

/**
 * Every keypath of `patch` that carries a defined value, in FlatTheme space.
 *
 * A leaf is anything that is not a plain object: a primitive, or an array like
 * `charts.categoryColors`. Containers are not members -- a `{}` authors nothing
 * -- which is the whole difference from the over-approximating collector.
 */
export function authoredLeaves(patch: ThemeLayerPatch): ReadonlySet<string> {
  const leaves = new Set<string>();
  const walk = (value: unknown, path: string): void => {
    if (value === undefined) return;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      if (path !== "") leaves.add(unwrapGoverned(path));
      return;
    }
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walk(child, path === "" ? key : `${path}.${key}`);
    }
  };
  walk(patch, "");
  return leaves;
}

/**
 * The leaves this patch MOVED against the vertical it is a patch of.
 *
 * A tenant answers for what it CHANGED, and the two transports state a change
 * differently. A document carries only what the tenant chose, so every leaf in
 * it is a change. A `FlatTheme` draft is a whole theme: an editor opens the
 * vertical's own and edits a few leaves, so the patch still carries every value
 * the author never touched. Treating those as authorship blames a tenant for
 * the product's own ink -- and refuses a draft that changed nothing at all.
 *
 * The comparison is by VALUE at the same keypath, which is the same rule the
 * contrast station uses on the emission side. A patch leaf with no baseline
 * twin is a change by definition.
 */
export function movedLeaves(
  patch: ThemeLayerPatch,
  baseline: Theme | undefined
): ReadonlySet<string> {
  const leaves = authoredLeaves(patch);
  if (baseline === undefined) return leaves;
  const moved = new Set<string>();
  for (const leaf of leaves) {
    if (!sameLeafValue(readBaselineLeaf(baseline, leaf), readPatchLeaf(patch, leaf))) {
      moved.add(leaf);
    }
  }
  return moved;
}

/**
 * Two leaves at the same keypath, compared the way this owner defines a leaf.
 *
 * `!==` answers identity for the one leaf shape that is not a primitive: an
 * array like `charts.categoryColors`. A draft that was deep-copied -- which is
 * what serializing a theme and reading it back does -- then carries a NEW array
 * with the same elements, and identity calls it authorship. The elements are
 * primitives and their order is meaningful (a palette is a sequence), so the
 * comparison is element-wise with the index kept.
 */
function sameLeafValue(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => item === right[index])
    );
  }
  return left === right;
}

/** Walk a plain keypath; the patch is already in unwrapped FlatTheme space. */
function readPatchLeaf(patch: ThemeLayerPatch, path: string): unknown {
  return readUnwrapped(patch as unknown as Record<string, unknown>, path);
}

function readBaselineLeaf(baseline: Theme, path: string): unknown {
  return readUnwrapped(baseline as unknown as Record<string, unknown>, path);
}

/**
 * Read a leaf by its unwrapped path, putting the `Governed` hop back.
 *
 * `authoredLeaves` records `motion.intensity`, never `motion.value.intensity`,
 * so a reader that walks the raw object would answer `undefined` for every
 * governed leaf -- and `undefined === undefined` would call every one of them
 * unmoved.
 */
function readUnwrapped(root: Record<string, unknown>, path: string): unknown {
  const segments = path.split(".");
  let cursor: unknown = root;
  for (let index = 0; index < segments.length; index += 1) {
    if (cursor === null || typeof cursor !== "object") return undefined;
    const key = segments[index];
    cursor = (cursor as Record<string, unknown>)[key];
    const governedRoot =
      (index === 0 && GOVERNED_UNWRAPPED_ROOTS.includes(key)) ||
      (index === 2 && segments[0] === "modes" && GOVERNED_UNWRAPPED_ROOTS.includes(key));
    if (governedRoot && cursor !== null && typeof cursor === "object") {
      cursor = (cursor as { value?: unknown }).value;
    }
  }
  return cursor;
}

/** True when the tenant authored this field, at the base level or in a mode. */
export function isAuthoredLeaf(
  leaves: ReadonlySet<string>,
  field: string
): boolean {
  return (
    leaves.has(field) ||
    leaves.has(`modes.light.${field}`) ||
    leaves.has(`modes.dark.${field}`)
  );
}

/**
 * True when any authored leaf sits at or below one of these prefixes.
 *
 * Both spellings of every leaf are offered: the raw one and the one with its
 * `modes.<mode>.` prefix removed. A catalog row may be keyed either way -- 
 * `palette.dark-mode` claims `modes.dark.palette.*` while `palette.seeds`
 * claims `palette.{...}` -- and a dark seed genuinely activates both. Stripping
 * only, or matching only, would silently drop one of the two rows.
 */
export function authoredUnderPrefix(
  leaves: ReadonlySet<string>,
  prefixes: readonly string[]
): boolean {
  for (const leaf of leaves) {
    const stripped = /^modes\.[a-z]+\.(.+)$/u.exec(leaf)?.[1];
    for (const spelling of stripped === undefined ? [leaf] : [leaf, stripped]) {
      if (
        prefixes.some(
          (prefix) => spelling === prefix || spelling.startsWith(`${prefix}.`)
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * The patch a WHOLE-THEME draft really authors: its moved leaves and no others.
 *
 * A document carries only what its tenant chose, so its patch is authorship by
 * construction. A `FlatTheme` draft is the theme the studio opened, so the
 * projection of it carries every value the author never touched -- and those
 * values then reach the tenant posture floors, where they are read as a tenant
 * re-dialling a knob it merely inherited. That is how one preset's two radius
 * statements ranked differently on the two doors: the draft door saw
 * `surfaces.radiusScale` as the tenant's, took the vertical's dial position
 * from the expressive profile instead, and divided by the profile default.
 *
 * Pruning is by the SAME comparison `movedLeaves` makes, which is the same one
 * the ledger's CARRIED class and the contrast station make. A family whose
 * every leaf is carried drops out entirely, so the baseline's own governed
 * wrapper survives the merge untouched -- the merged theme is unchanged, and
 * only the authorship attribution is corrected.
 */
export function movedThemePatch(
  patch: ThemeLayerPatch,
  baseline: Theme | undefined
): ThemeLayerPatch {
  if (baseline === undefined) return patch;
  const moved = movedLeaves(patch, baseline);
  const prune = (value: unknown, path: string): unknown => {
    if (value === undefined) return undefined;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return path !== "" && moved.has(unwrapGoverned(path)) ? value : undefined;
    }
    const kept: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const survivor = prune(child, path === "" ? key : `${path}.${key}`);
      if (survivor !== undefined) kept[key] = survivor;
    }
    return Object.keys(kept).length === 0 ? undefined : kept;
  };
  return (prune(patch, "") ?? {}) as ThemeLayerPatch;
}
