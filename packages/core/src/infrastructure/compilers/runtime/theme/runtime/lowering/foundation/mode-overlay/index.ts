/**
 * @fileoverview Mode-overlay merge policy over a base theme.
 *
 * @module Compilers/Theme/Lowering/Foundation/mode-overlay
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  BrandPalette,
  BrandTheme,
  BrandThemeModeOverlay,
} from "@/foundation/contracts/composition/tenants/themes";
import { completeChromeShape } from "@/foundation/contracts/composition/tenants/themes/iso";

/**
 * Merge one mode overlay over the base theme.
 *
 * Plain-object branches recurse so a partial like `chrome.controls.input.bg`
 * replaces one leaf and leaves its siblings alone; everything else (strings,
 * numbers, arrays) is a leaf and is replaced wholesale. `undefined` in the
 * overlay means "not authored", never "unset".
 */
function mergeModeOverlay<T>(base: T, overlay: unknown): T {
  if (overlay === undefined) return base;
  if (
    !overlay ||
    typeof overlay !== "object" ||
    Array.isArray(overlay) ||
    !base ||
    typeof base !== "object" ||
    Array.isArray(base)
  ) {
    return overlay as T;
  }
  const merged: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  };
  for (const [key, value] of Object.entries(overlay)) {
    if (value === undefined) continue;
    merged[key] = mergeModeOverlay(
      (base as Record<string, unknown>)[key],
      value
    );
  }
  return merged as T;
}

/** Apply a mode overlay to a BrandTheme, leaving identity fields alone. */
export function applyModeOverlay(
  bt: BrandTheme,
  overlay: BrandThemeModeOverlay
): BrandTheme {
  return {
    ...bt,
    palette: mergeModeOverlay(bt.palette, overlay.palette) as
      | BrandPalette
      | undefined,
    typography: mergeModeOverlay(bt.typography, overlay.typography),
    surfaces: mergeModeOverlay(bt.surfaces, overlay.surfaces),
    // The merge base is completed to the canonical chrome shape so both
    // transports place an overlay-only key at the SAME (shape) position:
    // sparse static chrome would otherwise APPEND it while the ISO bridge's
    // materialized chrome carries the shape slot, and the authored-order
    // emitters make that placement observable in the mode block's css.
    chrome: mergeModeOverlay(completeChromeShape(bt.chrome), overlay.chrome),
  };
}

/**
 * Compile every authored mode overlay into its delta over the base block.
 *
 * The overlay goes through the SAME family compilers as the base — there is no
 * second emission path and no per-vertical branch. Only channels whose value
 * actually moves are kept: everything the mode does not restate keeps
 * cascading from the base block, which is also what lets a `var()` chain
 * authored once (the tint scale mixes against `--ds-color-bg-primary`)
 * re-resolve against the mode's own ground instead of being duplicated.
 */
export function modeOverlayHasValues(overlay: BrandThemeModeOverlay): boolean {
  for (const family of Object.values(overlay)) {
    if (family && typeof family === "object") {
      for (const value of Object.values(family)) {
        if (value === undefined) continue;
        if (value !== null && typeof value === "object") {
          if (modeOverlayHasValues(value as BrandThemeModeOverlay)) return true;
        } else {
          return true;
        }
      }
    }
  }
  return false;
}
