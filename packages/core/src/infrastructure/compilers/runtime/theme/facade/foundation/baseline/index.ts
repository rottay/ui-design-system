/**
 * @fileoverview Where a vertical's baseline comes from: its authored theme, or
 * the neutral foundation with the vertical's preset admitted over it through
 * the same door every document takes.
 *
 * @module Compilers/Theme/Facade/Foundation/baseline
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantThemeDocumentAny } from "@/contracts/theme/presentation/document";
import {
  mergeThemePatches,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { NEUTRAL_THEME } from "@/foundation/presets/neutral-theme";
import { VERTICAL_THEME_PRESETS } from "@/foundation/presets/verticals";
import { FIRST_PARTY_VERTICALS } from "@/foundation/presets/verticals/roster";
import { admitDocument } from "../../../runtime/ingress";
import { baselineFor as authoredBaselineFor } from "../../../runtime/resolution";

export const THEME_BASELINE_SOURCES = Object.freeze([
  "brand-theme",
  "neutral-preset",
] as const);
export type ThemeBaselineSource = (typeof THEME_BASELINE_SOURCES)[number];

function cloneThemeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneThemeValue(item)) as unknown as T;
  }
  if (value === null || typeof value !== "object") return value;
  const copy: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    copy[key] = cloneThemeValue(child);
  }
  return copy as unknown as T;
}

const NEUTRAL_PRESET_BASELINES = new Map<FirstPartyVerticalId, Theme>();

/**
 * The roster row, not the foundation, names the vertical and its resting
 * mode: the neutral states `light` only as a placeholder, and a preset never
 * writes `appearance.defaultMode`.
 */
function neutralPresetBaseline(vertical: FirstPartyVerticalId): Theme {
  let composed = NEUTRAL_PRESET_BASELINES.get(vertical);
  if (composed === undefined) {
    const row = FIRST_PARTY_VERTICALS[vertical];
    const { patch } = admitDocument({
      vertical,
      document: VERTICAL_THEME_PRESETS[vertical].document as TenantThemeDocumentAny,
    });
    const foundation = cloneThemeValue(NEUTRAL_THEME);
    composed = mergeThemePatches(
      {
        ...foundation,
        id: vertical,
        name: row.name,
        appearance: { ...foundation.appearance, defaultMode: row.defaultMode },
      },
      patch
    );
    NEUTRAL_PRESET_BASELINES.set(vertical, composed);
  }
  return cloneThemeValue(composed);
}

/** The baseline a vertical names under one source, cloned for this request and labelled with the slug. */
export function baselineFor(
  vertical: FirstPartyVerticalId,
  slug: string,
  source: ThemeBaselineSource = "brand-theme"
): Theme {
  if (!THEME_BASELINE_SOURCES.includes(source)) {
    throw new Error(
      `baselineFor: unknown baseline source ${JSON.stringify(source)}; ` +
        `the closed set is ${THEME_BASELINE_SOURCES.map((s) => `"${s}"`).join(", ")}`
    );
  }
  if (source === "brand-theme") return authoredBaselineFor(vertical, slug);
  const baseline = neutralPresetBaseline(vertical);
  return baseline.id === slug ? baseline : { ...baseline, id: slug };
}
