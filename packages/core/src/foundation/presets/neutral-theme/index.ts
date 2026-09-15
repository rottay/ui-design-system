/**
 * @fileoverview The neutral foundation: the structural Theme every vertical
 * preset is composed over. It states no colour, no typeface and no shadow of
 * its own -- every chromatic value is a preset decision or a CSS default.
 *
 * @module Foundation/Presets/neutral-theme
 * @category Foundation
 * @package @rottay/design-system
 */

import type {
  BrandPalette,
  ThemeSource,
} from "@/foundation/contracts/composition/tenants/themes";
import {
  normalizeThemeSource,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";

export const NEUTRAL_THEME_ID = "neutral";
export const NEUTRAL_THEME_NAME = "Neutral foundation";

/**
 * Every family is declared and every leaf is undecided. The ISO normalization
 * gives each family its total default shape, so a preset patch lands on a
 * structure that already exists instead of inventing one.
 */
const NEUTRAL_SOURCE: ThemeSource = {
  id: NEUTRAL_THEME_ID,
  name: NEUTRAL_THEME_NAME,
  appearance: { defaultMode: "light" },
  modes: {},
  // The neutral decides no seed; the palette contract requires one, so this
  // is the one place the foundation states its emptiness explicitly.
  palette: {} as BrandPalette,
  typography: {},
  surfaces: {},
  motion: {},
  charts: {},
  recipes: {},
  expressive: {},
  responsive: {},
  chrome: {},
  capabilities: {
    motion: { status: "active" },
    recipes: { status: "active" },
    expressive: { status: "active" },
    responsive: { status: "active" },
  },
};

function deepFreezeTheme<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreezeTheme(child);
    }
  }
  return value;
}

// The neutral is not a first-party identity; the resolver stamps the slug it
// composes for. The source states its own dispositions, so nothing is inferred.
export const NEUTRAL_THEME: Theme = deepFreezeTheme(normalizeThemeSource(NEUTRAL_SOURCE));
