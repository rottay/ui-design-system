/**
 * @fileoverview Admission: the APCA floor and the categorical chart floor.
 *
 * Both used to run only on the DB terminal, so a preview could paint a palette
 * under the governed floor and an author saw a theme publish would refuse
 * (F-13). They run here now, over the compile the door just produced against
 * the vertical's own compile, for every tenant-authored origin.
 *
 * The authorship feed is read from the intent's own PATCH rather than from a
 * normalized DOCUMENT. That is what makes the rule origin-agnostic: a v1
 * document, a v2 decision document and an unsaved `BrandTheme` draft all arrive
 * as authored Theme keypaths, and only the document ever had an
 * `appearance.general.palette.foreground` to read.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Runtime/Contrast
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type {
  Theme,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import { contrastRatio } from "@/foundation/kernel/accessibility/branding-contrast";
import {
  TEXT_CONTRAST_PAIRINGS,
  enforceTextContrast,
} from "@/foundation/kernel/accessibility/branding-contrast/text-contrast-autocorrect";
import {
  isHexColor,
  normalizeHexColor,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import { OVERRIDE_TOKEN_PATCHES } from "../../../../../runtime/ingress/foundation/document-patch";
import { isAuthoredLeaf, movedLeaves } from "../../foundation/authorship";
import type { ThemeAdmissionIssue } from "../../foundation/issues";

/**
 * Every governed INK channel, keyed on the Theme leaf that produces it.
 *
 * Derived from the override migration's own table rather than transcribed: a
 * second copy of "which channel is which keypath" is a second copy that drifts.
 * Restricted to the tokens that appear as a FOREGROUND of a governed pairing,
 * because that is the only question this set is asked -- did the tenant author
 * the INK of the pair being adjusted. A ground is attributed separately, by the
 * `changed` set, which is measured rather than declared.
 *
 * It answers for all three authoring spellings at once, because all three land
 * on one keypath: `appearance.general.palette.foreground.primary`, the
 * `--ds-color-text-primary` token override, and a `BrandTheme` draft that
 * writes `palette.textPrimaryColor` directly.
 */
const INK_CHANNELS_BY_LEAF: ReadonlyMap<string, readonly string[]> = (() => {
  const inks = new Set(TEXT_CONTRAST_PAIRINGS.map((pairing) => pairing.token));
  const index = new Map<string, string[]>();
  for (const [token, patch] of OVERRIDE_TOKEN_PATCHES) {
    if (!inks.has(token)) continue;
    for (const leaf of movedLeaves(patch, undefined)) {
      const existing = index.get(leaf);
      if (existing) existing.push(token);
      else index.set(leaf, [token]);
    }
  }
  return index;
})();

/**
 * The `chrome.sidebar` leaves that ATTRIBUTE a governed contrast pair.
 *
 * Both governed sidebar pairings -- `--ds-sidebar-text` over `--ds-sidebar-bg`,
 * and `--ds-sidebar-item-color-active` over `--ds-sidebar-item-bg-active` --
 * are reachable by a tenant, but nothing in this guard's authorship feed knew
 * that: the feed listed the four general foreground roles and the raw token
 * overrides only. The measured consequence (M5.2) is that an authored sub-floor
 * sidebar pair is ACCEPTED on all three verticals, because every first-party
 * `--ds-sidebar-item-bg-active` is an alpha or `color-mix` value, so the
 * baseline pair is unverifiable, and with neither side attributed the
 * adjustment reads as code-owned.
 *
 * Only these four channels are added, and only to the adjustment loop's
 * authorship test. The unverifiable loop below is deliberately NOT fed: a
 * tenant that authors an ink over the VERTICAL's alpha ground would otherwise
 * be rejected for a ground it never chose, which is the same misattribution
 * pointing the other way (measured as the WIDE variant in M5.4).
 */
export const SIDEBAR_CONTRAST_ATTRIBUTION: Readonly<Record<string, string>> = {
  "chrome.sidebar.bg": "--ds-sidebar-bg",
  "chrome.sidebar.text": "--ds-sidebar-text",
  "chrome.sidebar.itemBgActive": "--ds-sidebar-item-bg-active",
  "chrome.sidebar.itemColorActive": "--ds-sidebar-item-color-active",
};

function effectiveModeVariables(
  compiled: ThemeCompilation,
  mode: BrandThemeMode
): Record<string, string> {
  const block = compiled.modeBlocks?.find(
    (candidate) => candidate.mode === mode
  );
  return { ...compiled.cssVariables, ...block?.cssVariables };
}

/** Resolve simple code-owned var() aliases for contrast measurement only. */
function resolveContrastVariables(
  variables: Readonly<Record<string, string>>,
  mode: BrandThemeMode
): Record<string, string> {
  const foundationConstants: Readonly<Record<string, string>> = {
    "--ds-color-black": "#000000",
    "--ds-color-white": "#ffffff",
  };
  const resolved: Record<string, string> = {};
  const resolving = new Set<string>();
  const resolveValue = (value: string): string => {
    const modePair = /^light-dark\(\s*([^,]+?)\s*,\s*([^,]+?)\s*\)$/i.exec(
      value.trim()
    );
    if (modePair) {
      return resolveValue(mode === "dark" ? modePair[2] : modePair[1]);
    }
    const match = /^var\(\s*(--ds-[a-z0-9-]+)(?:\s*,\s*(.+))?\)$/i.exec(
      value.trim()
    );
    if (!match) return value;
    const [, reference, fallback] = match;
    if (resolving.has(reference))
      return fallback ? resolveValue(fallback) : value;
    const referenced = variables[reference] ?? foundationConstants[reference];
    if (referenced === undefined)
      return fallback ? resolveValue(fallback) : value;
    resolving.add(reference);
    const result = resolveValue(referenced);
    resolving.delete(reference);
    return result;
  };
  for (const [channel, value] of Object.entries(variables)) {
    resolving.add(channel);
    resolved[channel] = resolveValue(value);
    resolving.delete(channel);
  }
  return resolved;
}

/**
 * The ink channels this tenant authored, named as channels.
 *
 * The `modes.` prefix is folded in because a dark-only ink is still an authored
 * ink, and the pair it belongs to is evaluated per mode anyway.
 */
export function authoredForegroundChannels(
  leaves: ReadonlySet<string>
): ReadonlySet<string> {
  const channels = new Set<string>();
  for (const [leaf, tokens] of INK_CHANNELS_BY_LEAF) {
    if (!isAuthoredLeaf(leaves, leaf)) continue;
    for (const token of tokens) channels.add(token);
  }
  return channels;
}

/**
 * APCA is an ingestion floor, never a second compiler. Evaluate the final
 * common-compiler result and reject an unsafe tenant-authored change; do not
 * rewrite the Theme or the emitted variables. A pair is tenant-relevant when
 * either its ink or its ground differs from the code-owned vertical baseline.
 */
export function contrastIssues(
  compiled: ThemeCompilation,
  baseline: ThemeCompilation,
  patch: ThemeLayerPatch,
  baselineTheme?: Theme
): ThemeAdmissionIssue[] {
  const issues: ThemeAdmissionIssue[] = [];
  // MOVED, not merely carried: a draft opened on the vertical's own theme
  // carries its inks, and blaming a tenant for the product's ink is the same
  // misattribution the sidebar note below records pointing the other way.
  const leaves = movedLeaves(patch, baselineTheme);
  const authoredForegrounds = authoredForegroundChannels(leaves);
  for (const mode of ["light", "dark"] as const) {
    const expected = effectiveModeVariables(compiled, mode);
    const original = effectiveModeVariables(baseline, mode);
    const changed = new Set(
      Object.keys(expected).filter((key) => expected[key] !== original[key])
    );
    if (changed.size === 0) continue;
    // Narrow, mode-aware chrome attribution. Kept OUT of `authoredForegrounds`
    // so it reaches the adjustment loop's authorship test and nothing else.
    const authoredChromeChannels = new Set<string>();
    for (const [field, channel] of Object.entries(
      SIDEBAR_CONTRAST_ATTRIBUTION
    )) {
      if (leaves.has(field) || leaves.has(`modes.${mode}.${field}`)) {
        authoredChromeChannels.add(channel);
      }
    }
    const modeAppearance = {
      general: { palette: { backgroundMode: mode } },
    } as const;
    const result = enforceTextContrast(
      resolveContrastVariables(expected, mode),
      modeAppearance
    );
    const baselineResult = enforceTextContrast(
      resolveContrastVariables(original, mode),
      modeAppearance
    );
    for (const adjustment of result.adjustments) {
      const groundChanged =
        !adjustment.pairedWith.startsWith("default:") &&
        changed.has(adjustment.pairedWith);
      if (!changed.has(adjustment.token) && !groundChanged) continue;
      const baselineAdjustment = baselineResult.adjustments.find(
        (candidate) =>
          candidate.token === adjustment.token &&
          candidate.pairedWith === adjustment.pairedWith
      );
      const directAuthorship =
        authoredForegrounds.has(adjustment.token) ||
        authoredChromeChannels.has(adjustment.token);
      // Absence of a baseline adjustment is two different facts, and treating
      // them as one blamed tenants for code-owned pairs. Either the baseline
      // pair was measured and cleared the floor -- so a new adjustment really
      // is a regression this tenant caused -- or the baseline pair could not
      // be measured at all (an alpha ground yields `non-hex-ground`), in which
      // case there is no comparable baseline and the adjustment is only the
      // tenant's when the tenant authored one side of the pair.
      const baselineUnverifiable = baselineResult.unverifiable.some(
        (candidate) =>
          candidate.token === adjustment.token &&
          candidate.pairedWith === adjustment.pairedWith
      );
      const pairAuthorship =
        directAuthorship ||
        authoredForegrounds.has(adjustment.pairedWith) ||
        authoredChromeChannels.has(adjustment.pairedWith);
      const regressed =
        baselineAdjustment !== undefined
          ? Math.abs(adjustment.lcBefore) + Number.EPSILON <
            Math.abs(baselineAdjustment.lcBefore)
          : !baselineUnverifiable || pairAuthorship;
      if (!directAuthorship && !regressed) continue;
      issues.push({
        code: "invalid_value",
        path: "$.visualFoundation",
        message:
          `${mode} ${
            adjustment.token
          } has APCA Lc ${adjustment.lcBefore.toFixed(1)} ` +
          `against ${adjustment.pairedWith}; authored tenant colors must meet the governed floor`,
      });
    }
    for (const unverifiable of result.unverifiable) {
      const groundChanged =
        !unverifiable.pairedWith.startsWith("default:") &&
        changed.has(unverifiable.pairedWith);
      if (!changed.has(unverifiable.token) && !groundChanged) continue;
      const unchangedBaseline = baselineResult.unverifiable.some(
        (candidate) =>
          candidate.token === unverifiable.token &&
          candidate.pairedWith === unverifiable.pairedWith &&
          candidate.value === unverifiable.value
      );
      if (!authoredForegrounds.has(unverifiable.token) && unchangedBaseline) {
        continue;
      }
      issues.push({
        code: "invalid_value",
        path: "$.visualFoundation",
        message:
          `${mode} ${unverifiable.token} cannot be APCA-verified against ` +
          `${unverifiable.pairedWith} (${unverifiable.reason})`,
      });
    }
  }
  return issues;
}

const CHART_CATEGORY_TOKEN = /^--ds-chart-category-(?:[1-9]|10)$/;
const CHART_CATEGORY_MIN_CONTRAST = 3;
export const DEFAULT_CHART_GROUNDS = {
  light: "#FFFFFF",
  dark: "#0C0C0E",
} as const;
const CHART_SURFACE_TOKENS = [
  "--ds-color-bg-primary",
  "--ds-color-background",
  "--ds-color-bg",
  "--ds-card-bg",
  "--ds-metric-card-bg",
  "--ds-table-bg",
] as const;

/**
 * Guard tenant-authored categorical channels before they become chart marks.
 * Exact duplicates are not a palette, and every supplied mark color must keep
 * the WCAG 2.2 non-text/UI 3:1 floor against the concrete chart surfaces the
 * same artifact emits. Chart anatomy still supplies labels/patterns; color is
 * never the sole cue.
 *
 * `extraGrounds` is the one input this rule cannot derive from the intent.
 * `backgroundMode` is v1 transport metadata that deliberately never reaches the
 * `Theme` ("runtime selection metadata, not Theme authority"), so the canvas a
 * v1 document declares is knowable to the DB terminal and to nobody else. The
 * terminal supplies it; the door measures the mode the compile itself declares.
 * One rule, one message, two callers -- not two rules.
 */
export function chartCategoryIssues(
  variables: Readonly<Record<string, string>>,
  grounds: Iterable<string>
): ThemeAdmissionIssue[] {
  const categories = Object.entries(variables).filter(([token]) =>
    CHART_CATEGORY_TOKEN.test(token)
  );
  if (categories.length === 0) return [];

  const issues: ThemeAdmissionIssue[] = [];
  const seen = new Map<string, string>();
  for (const [token, value] of categories) {
    const canonical = value.toUpperCase();
    const previous = seen.get(canonical);
    if (previous) {
      issues.push({
        code: "invalid_value",
        path: `$.visualFoundation.advanced.tokenOverrides[${JSON.stringify(
          token
        )}]`,
        message: `Chart category duplicates ${previous}; categorical channels must be unique`,
      });
    } else {
      seen.set(canonical, token);
    }
  }

  const measured = new Set<string>();
  for (const ground of grounds) {
    if (isHexColor(ground)) measured.add(normalizeHexColor(ground).toUpperCase());
  }
  for (const token of CHART_SURFACE_TOKENS) {
    const value = variables[token];
    if (value && /^#[0-9a-fA-F]{6}$/.test(value)) measured.add(value.toUpperCase());
  }

  for (const [token, value] of categories) {
    for (const ground of measured) {
      const ratio = contrastRatio(value, ground);
      if (ratio + Number.EPSILON < CHART_CATEGORY_MIN_CONTRAST) {
        issues.push({
          code: "invalid_value",
          path: `$.visualFoundation.advanced.tokenOverrides[${JSON.stringify(
            token
          )}]`,
          message: `Chart category contrast ${ratio.toFixed(
            2
          )}:1 on ${ground} is below ${CHART_CATEGORY_MIN_CONTRAST}:1`,
        });
      }
    }
  }

  return issues;
}

/**
 * The grounds the COMPILE itself declares: the default page ground of the mode
 * this theme renders in. Origin-agnostic, so preview and draft get a floor
 * where they previously had none.
 */
export function compiledChartGrounds(
  compiled: ThemeCompilation
): readonly string[] {
  return [
    compiled.colorScheme === "dark"
      ? DEFAULT_CHART_GROUNDS.dark
      : DEFAULT_CHART_GROUNDS.light,
  ];
}
