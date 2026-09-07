/**
 * @fileoverview `ThemePatch` — what a tenant may author, and nothing else.
 *
 * F-06 measured the old shape: a patch typed over the WHOLE resolved `Theme`
 * reached 28 % of its keypaths through the document and left 519 with no door
 * at all, so "customizable" was an undeclared fraction. The patch is typed over
 * the DECISIONS instead: the closed catalog plus the one sanctioned escape
 * hatch of D-03. The Theme-shaped layer the resolver merges keeps its own name,
 * `ThemeLayerPatch`, so the two never pass for each other.
 *
 * @module Contracts/Theme/Patch
 * @category Types
 * @package @rottay/design-system
 */

import type { DeepPartial } from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  THEME_DECISION_IDS,
  type SanctionedOverrides,
  type ThemeDecisions,
} from "@/contracts/theme/foundation/decisions";

/**
 * The authoring patch: a partial set of decisions plus sanctioned overrides.
 *
 * `DeepPartial` because a decision whose value is a map (`palette.seeds`,
 * `motion.dial`, `chrome.anatomy`) may be authored one key at a time; the key
 * sets themselves stay closed, and the document validator closes them.
 */
export type ThemePatch = DeepPartial<ThemeDecisions & SanctionedOverrides>;

/** The two top-level groups a patch may name. */
export const THEME_PATCH_GROUPS: readonly string[] = Object.freeze([
  ...THEME_DECISION_IDS,
  "chrome",
]);

export class ThemePatchError extends Error {
  constructor(message: string) {
    super(`ThemePatch: ${message}`);
    this.name = "ThemePatchError";
  }
}

const GROUPS = new Set<string>(THEME_PATCH_GROUPS);

/**
 * Refuses, by name, any key that is neither a decision nor `chrome`.
 *
 * The type already forbids them, but a patch arrives as untrusted JSON from a
 * database row or an HTTP body, where the type erases. `id` and `name` get
 * their own message: they are the shape F-70 found the old patch accepting,
 * and a caller that sends them is trying to restate the identity of the theme
 * rather than mistyping a decision.
 */
export function assertThemePatch(patch: unknown): ThemePatch {
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
    throw new ThemePatchError("must be an object");
  }
  for (const key of Object.keys(patch)) {
    if (key === "id" || key === "name") {
      throw new ThemePatchError(
        `"${key}" is theme identity, not a decision; it is supplied by the row, never by a patch`
      );
    }
    if (key.startsWith("--")) {
      throw new ThemePatchError(
        `raw channel "${key}"; a patch carries decisions and \`chrome.<family>.<channel>\` overrides only (D-03)`
      );
    }
    if (!GROUPS.has(key)) {
      throw new ThemePatchError(
        `unsupported key "${key}"; the catalog is closed at ${THEME_DECISION_IDS.length} decisions plus \`chrome\``
      );
    }
  }
  return patch as ThemePatch;
}
