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
 * @module Compilers/Theme/Facade/Foundation/Admission/Foundation/Authorship
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
 * Every keypath of `patch` that carries a defined value, in BrandTheme space.
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
 * it is a change. A `BrandTheme` draft is a whole theme: an editor opens the
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
    if (readBaselineLeaf(baseline, leaf) !== readPatchLeaf(patch, leaf)) {
      moved.add(leaf);
    }
  }
  return moved;
}

/** Walk a plain keypath; the patch is already in unwrapped BrandTheme space. */
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
