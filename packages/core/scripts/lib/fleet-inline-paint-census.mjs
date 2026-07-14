import { realpathSync } from "node:fs";
import { relative, sep } from "node:path";
import { collectSourceFiles } from "../runtime-svg-paint-census.mjs";

/** The ARC-09 lane owns these paths completely; fleet must never duplicate them. */
export const ARC09_INLINE_PAINT_FILES = Object.freeze([
  "primitives/display/Table/engines/modern.tsx",
  "primitives/display/Table/engines/rustic.tsx",
  "structures/workspace/field-filters-panel/index.tsx",
  "patterns/forms/filter-panel/engines/modern.tsx",
  "patterns/forms/filter-panel/engines/rustic.tsx",
  "structures/workspace/selection-preview-rail/index.tsx",
  "patterns/data/detail-panel/engines/modern.tsx",
  "patterns/data/detail-panel/engines/rustic.tsx",
  "patterns/data/data-table/engines/modern.tsx",
  "patterns/data/data-table/engines/rustic.tsx",
  "patterns/data/data-table/cell-editors/index.tsx",
  "patterns/data/data-table/DataTableMobileCards.tsx",
  "patterns/data/data-table/PatternDataTable.tsx",
]);

const ARC09_SET = new Set(ARC09_INLINE_PAINT_FILES);
const FLEET_TIERS = new Set([
  "patterns",
  "primitives",
  "structures",
  "surfaces",
]);

// This is the executable form of the existing scripts/skin-census.mjs law.
// Keep it deliberately aligned: TypeScript component sources only; Ant-owned
// classic engines plus actual test/story/type-only catalog files are out of
// lane. Historical `story-helpers.tsx` and `test-utils.tsx` baselines remain in
// lane because those names do not match the original executable exclusion law.
const EXCLUDE_RE =
  /(\/tests?\/|\.test\.|\.stories\.|\.types\.ts$|\/classic\.tsx$|\/engines\/classic\.tsx$|\/classic\/)/;

function normalizedRelativePath(componentsDir, file) {
  return relative(componentsDir, file).split(sep).join("/");
}

export function isFleetInlinePaintSourceFile(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  const [tier] = normalized.split("/");
  return (
    FLEET_TIERS.has(tier) &&
    /\.tsx?$/.test(normalized) &&
    !EXCLUDE_RE.test(`/${normalized}`) &&
    !ARC09_SET.has(normalized)
  );
}

/**
 * Enumerate the whole eligible fleet, including current zero-paint files.
 * Returning canonical paths sorted by repo-relative key makes baseline output
 * deterministic and lets the shared source walker handle symlinks safely.
 */
export function collectFleetInlinePaintSourceFiles(componentsDir) {
  const canonicalComponentsDir = realpathSync(componentsDir);
  return collectSourceFiles(canonicalComponentsDir)
    .filter((file) =>
      isFleetInlinePaintSourceFile(
        normalizedRelativePath(canonicalComponentsDir, file)
      )
    )
    .sort((left, right) => {
      const leftPath = normalizedRelativePath(canonicalComponentsDir, left);
      const rightPath = normalizedRelativePath(canonicalComponentsDir, right);
      return leftPath < rightPath ? -1 : leftPath > rightPath ? 1 : 0;
    });
}
