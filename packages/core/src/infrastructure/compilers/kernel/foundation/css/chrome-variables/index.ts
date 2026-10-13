/**
 * @fileoverview Shared chrome CSS variable emission.
 *
 * Canonical mapping from a chrome object (sidebar, layout, shell, toolbar,
 * filter pills, breadcrumb, search, controls, table, cards, modal, tabs) to
 * flat --ds-* CSS variable declarations. Used by both runtime/brand-theme
 * (FlatTheme.chrome) and runtime/appearance (TenantAppearanceAdvanced.chrome)
 * — the two shapes are structurally identical because every field on
 * BrandChrome and its nested Brand*Chrome interfaces is already optional, so
 * BrandChrome and TenantAppearanceAdvanced['chrome'] are the same type.
 * Previously duplicated in both locations.
 */

import type {
  BrandChrome,
  BrandBadgeChrome,
  BrandSidebarChrome,
  FlatThemeMode,
  TenantAppearanceGeneral,
} from "@/foundation/contracts/composition/tenants/themes";

import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import { isTenantAuthoredField } from "@/foundation/contracts/composition/tenants/themes/iso";

import { applyRadiusDial } from "@/foundation/kernel/geometry/radius-dial";

import {
  setControlLeadVars,
  setButtonGeometryLeadVars,
  setButtonGeometryTailVars,
  setFieldGeometryVars,
  setSegmentedVars,
  setControlStateVars,
} from "./sections/buttons";

import {
  setTableVars,
  setCardComponentVars,
  setMetricCardVars,
  setSignalCardVars,
  setModalVars,
  setTabsVars,
  setCollapseVars,
} from "./sections/containers";

import {
  setInputVars,
  setSelectVars,
  setFieldFamilyVars,
} from "./sections/fields";

import {
  setSidebarLeafVars,
  setLayoutVars,
  setShellVars,
  setToolbarVars,
  setFilterPillVars,
  setBreadcrumbVars,
  setSearchVars,
} from "./sections/frame";

import {
  BADGE_CHROME_VARIABLES,
  FLAT_CHROME_FAMILY_VARIABLES,
  POPOVER_CHROME_VARIABLES,
  TOOLTIP_CHROME_VARIABLES,
} from "./tables";

import {
  setMappedChromeVars,
  setLegacyDangerButtonAlias,
  setCardBandVars,
  setListingGridVars,
  setListVars,
  setDetailVars,
  setSurfaceChromeVars,
  setButtonVariantVars,
  setLegacyButtonHoverBgAlias,
  setControlSizeVars,
  setSegmentedSizeVars,
  setPremiumCardVars,
} from "./writers";

/** Compile-time context this emitter needs beyond the chrome object itself. */
export interface ChromeVariableContext {
  /**
   * The `--ds-radius-scale` the VERTICAL BASELINE resolves to -- never the dial
   * this compilation emits. It is the divisor that lets an authored radius
   * literal reproduce the vertical's own pixel exactly while a tenant's dial
   * still moves it. Absent means no baseline was supplied, so the divisor is
   * the channel's own identity of 1.
   */
  radiusBaseline?: string | number;
  /** Effective Theme mode for semantic posture lowering. */
  mode?: FlatThemeMode;
  /**
   * The Theme paths this compilation's TENANT authored, when one exists.
   *
   * Absent means "no provenance supplied", which every static first-party
   * compile is: the ranked assignment then collapses to the unconditional one
   * it replaced, so the emitted bytes cannot move.
   */
  tenantAuthoredPaths?: TenantAuthoredPaths;
  /**
   * "" for the base block, "modes.<mode>." when this call is compiling a mode
   * overlay -- a mode block also honours the tenant's base-level statements.
   */
  modePrefix?: string;
}

/**
 * The producer-kind lattice, stated ONCE for the whole compiler.
 *
 * Every CSS value this compiler emits was produced by one of five kinds of
 * author, and the merge order between them is a decided law rather than an
 * artifact of statement order:
 *
 *   PROFILE(0) < BASELINE_LEAF(1) < BASELINE_RECIPE(2)
 *              < TENANT_DERIVED(3) < TENANT_LEAF(4)
 *
 * Read as two clauses. A profile fill is the weakest statement anyone makes,
 * so it loses to everything. Within one authority, a RECIPE (a semantic
 * posture such as a sidebar tone, or a seed the compiler expands) outranks a
 * concrete LEAF of the SAME authority's lower tier but never a leaf of a
 * HIGHER authority -- which is why a tenant's own explicit leaf beats the
 * tenant's own tone, and why a vertical baseline's leaf loses to anything the
 * tenant said at all.
 *
 * It is deliberately NOT wired into `mergeDeep` or `resolveTheme`: those two
 * are the fail-closed core of the Theme plane and stay byte-untouched. The
 * lattice is consulted at exactly two emission sites -- the primary-seed
 * derivation in `runtime/brand-theme` and the sidebar tone/leaf contest below
 * -- and both consult the closed field vocabulary
 * `CONSULTED_PROVENANCE_FIELDS`.
 */
export const PRODUCER_RANK = {
  profile: 0,
  baselineLeaf: 1,
  baselineRecipe: 2,
  tenantDerived: 3,
  tenantLeaf: 4,
} as const;

type SidebarTone = NonNullable<
  NonNullable<TenantAppearanceGeneral["navigation"]>["sidebarTone"]
>;

/** Canonical semantic sidebar lowering used by both Theme transports. */
export function sidebarToneToChrome(
  tone: SidebarTone | undefined,
  mode: FlatThemeMode = "light"
): Partial<BrandSidebarChrome> {
  if (tone === "subtle") {
    return {
      bg: "var(--ds-color-bg-secondary)",
      text: "var(--ds-color-text-primary)",
      textMuted: "var(--ds-color-text-muted)",
      itemBgHover: "var(--ds-color-bg-hover)",
      itemBgActive: `var(--ds-color-primary-${mode === "dark" ? 200 : 100})`,
      itemColorActive: "var(--ds-color-primary-900)",
    };
  }
  if (tone === "strong") {
    if (mode === "dark") {
      return {
        bg: "var(--ds-color-primary-100)",
        text: "var(--ds-color-primary-900)",
        textMuted: "var(--ds-color-primary-700)",
        itemBgHover: "var(--ds-color-primary-200)",
        itemBgActive: "var(--ds-color-primary-300)",
        itemColorActive: "var(--ds-color-primary-900)",
      };
    }
    return {
      bg: "var(--ds-color-primary-900)",
      text: "var(--ds-color-white)",
      textMuted: "var(--ds-color-neutral-400)",
      itemBgHover: "var(--ds-color-primary-800)",
      itemBgActive: "var(--ds-color-primary-700)",
      itemColorActive: "var(--ds-color-white)",
    };
  }
  if (tone === "inverse") {
    return {
      bg: "var(--ds-color-neutral-900)",
      text: "var(--ds-color-neutral-100)",
      textMuted: "var(--ds-color-neutral-500)",
      itemBgHover: "var(--ds-color-neutral-800)",
      itemBgActive: "var(--ds-color-neutral-700)",
      itemColorActive:
        mode === "dark"
          ? "var(--ds-color-neutral-100)"
          : "var(--ds-color-white)",
    };
  }
  return {};
}

/**
 * The CLOSED table of sidebar channels a tone lowers into, mapped to the
 * `chrome.sidebar` leaf that states the SAME channel explicitly.
 *
 * These six rows are exactly the output vocabulary of `sidebarToneToChrome`;
 * no other sidebar field is contested, and no producer outside the tone
 * assignment consults provenance at all.
 */
export const SIDEBAR_TONE_LEAF_FIELDS: Readonly<Record<string, string>> = {
  "--ds-sidebar-bg": "chrome.sidebar.bg",
  "--ds-sidebar-text": "chrome.sidebar.text",
  "--ds-sidebar-text-muted": "chrome.sidebar.textMuted",
  "--ds-sidebar-item-bg-hover": "chrome.sidebar.itemBgHover",
  "--ds-sidebar-item-bg-active": "chrome.sidebar.itemBgActive",
  "--ds-sidebar-item-color-active": "chrome.sidebar.itemColorActive",
};

/** The Theme field carrying the semantic posture those six channels lower from. */
export const SIDEBAR_TONE_FIELD = "chrome.sidebar.tone";

/**
 * Lower the sidebar tone into its six channels UNDER the lattice.
 *
 * The tone is a recipe; the six `chrome.sidebar` colour leaves are leaves. Who
 * wins is decided per channel by `PRODUCER_RANK`, from which authority stated
 * each side:
 *
 *   tenant tone (3)   vs tenant leaf (4)   -> the leaf; a tenant's explicit
 *                                             statement beats its own posture
 *   tenant tone (3)   vs baseline leaf (1) -> the tone   (unchanged)
 *   baseline tone (2) vs tenant leaf (4)   -> the leaf
 *   baseline tone (2) vs baseline leaf (1) -> the tone   (unchanged)
 *
 * With no tenant provenance supplied every row collapses to the two unchanged
 * cases, so the emitted bytes are exactly what an unconditional assignment
 * produced -- which is what keeps first-party output byte-identical.
 */
function assignToneUnderTenantLeaves(
  vars: Record<string, string>,
  toneVars: Readonly<Record<string, string>>,
  context: ChromeVariableContext
): void {
  const authoredPaths = context.tenantAuthoredPaths;
  const toneRank =
    authoredPaths !== undefined &&
    isTenantAuthoredField(authoredPaths, SIDEBAR_TONE_FIELD, context.modePrefix)
      ? PRODUCER_RANK.tenantDerived
      : PRODUCER_RANK.baselineRecipe;
  for (const [channel, value] of Object.entries(toneVars)) {
    const leafField = SIDEBAR_TONE_LEAF_FIELDS[channel];
    const leafRank =
      authoredPaths !== undefined &&
      leafField !== undefined &&
      isTenantAuthoredField(authoredPaths, leafField, context.modePrefix)
        ? PRODUCER_RANK.tenantLeaf
        : PRODUCER_RANK.baselineLeaf;
    if (toneRank <= leafRank) continue;
    vars[channel] = value;
  }
}

export function sidebarToneToVariables(
  tone: SidebarTone | undefined,
  mode: FlatThemeMode = "light"
): Record<string, string> {
  const chrome = sidebarToneToChrome(tone, mode);
  const vars: Record<string, string> = {};
  if (chrome.bg) vars["--ds-sidebar-bg"] = chrome.bg;
  if (chrome.text) vars["--ds-sidebar-text"] = chrome.text;
  if (chrome.textMuted) vars["--ds-sidebar-text-muted"] = chrome.textMuted;
  if (chrome.itemBgHover)
    vars["--ds-sidebar-item-bg-hover"] = chrome.itemBgHover;
  if (chrome.itemBgActive)
    vars["--ds-sidebar-item-bg-active"] = chrome.itemBgActive;
  if (chrome.itemColorActive)
    vars["--ds-sidebar-item-color-active"] = chrome.itemColorActive;
  return vars;
}

function setBadgeChromeVars(
  vars: Record<string, string>,
  badge: BrandBadgeChrome | undefined
): void {
  if (!badge) return;
  for (const key of Object.keys(BADGE_CHROME_VARIABLES) as Array<
    keyof BrandBadgeChrome
  >) {
    const value = badge[key];
    if (value !== undefined && value !== null) {
      vars[BADGE_CHROME_VARIABLES[key]] = String(value);
    }
  }
}

/**
 * Pre-cut channel names the frozen Classic and Rustic skins still read, each
 * restated from the family channel a vertical authored under its current name.
 */
export const FROZEN_ENGINE_COMPAT_CHANNELS: Readonly<Record<`--ds-${string}`, `--ds-${string}`>> = {
  "--ds-autocomplete-bg": "--ds-auto-complete-bg",
  "--ds-autocomplete-border": "--ds-auto-complete-border",
  "--ds-autocomplete-border-focus": "--ds-auto-complete-border-focus",
  "--ds-autocomplete-clear-color": "--ds-auto-complete-clear-color",
  "--ds-autocomplete-dropdown-bg": "--ds-auto-complete-dropdown-bg",
  "--ds-autocomplete-dropdown-shadow": "--ds-auto-complete-dropdown-shadow",
  "--ds-autocomplete-empty-color": "--ds-auto-complete-empty-color",
  "--ds-autocomplete-error-border": "--ds-auto-complete-error-border",
  "--ds-autocomplete-option-bg-hover": "--ds-auto-complete-option-bg-hover",
  "--ds-autocomplete-warning-border": "--ds-auto-complete-warning-border",
  "--ds-datepicker-bg": "--ds-date-picker-bg",
  "--ds-datepicker-bg-disabled": "--ds-date-picker-bg-disabled",
  "--ds-datepicker-border": "--ds-date-picker-border",
  "--ds-datepicker-border-focus": "--ds-date-picker-border-focus",
  "--ds-datepicker-clear-color": "--ds-date-picker-clear-color",
  "--ds-datepicker-color": "--ds-date-picker-color",
  "--ds-datepicker-error-border": "--ds-date-picker-error-border",
  "--ds-datepicker-icon-color": "--ds-date-picker-icon-color",
  "--ds-datepicker-panel-shadow": "--ds-date-picker-panel-shadow",
  "--ds-datepicker-separator-color": "--ds-date-picker-separator-color",
  "--ds-datepicker-shadow-focus": "--ds-date-picker-shadow-focus",
  "--ds-datepicker-warning-border": "--ds-date-picker-warning-border",
  "--ds-message-bg": "--ds-notifier-message-bg",
  "--ds-message-close-color": "--ds-notifier-message-close-color",
  "--ds-message-close-color-hover": "--ds-notifier-message-close-color-hover",
  "--ds-message-shadow": "--ds-notifier-message-shadow",
  "--ds-notification-bg": "--ds-notifier-notification-bg",
  "--ds-notification-shadow": "--ds-notifier-notification-shadow",
  "--ds-notification-title-color": "--ds-notifier-notification-title-color",
  "--ds-timepicker-bg": "--ds-time-picker-bg",
  "--ds-timepicker-bg-disabled": "--ds-time-picker-bg-disabled",
  "--ds-timepicker-border": "--ds-time-picker-border",
  "--ds-timepicker-border-focus": "--ds-time-picker-border-focus",
  "--ds-timepicker-clear-color": "--ds-time-picker-clear-color",
  "--ds-timepicker-color": "--ds-time-picker-color",
  "--ds-timepicker-error-border": "--ds-time-picker-error-border",
  "--ds-timepicker-icon-color": "--ds-time-picker-icon-color",
  "--ds-timepicker-separator-color": "--ds-time-picker-separator-color",
  "--ds-timepicker-shadow-focus": "--ds-time-picker-shadow-focus",
  "--ds-timepicker-warning-border": "--ds-time-picker-warning-border",
};

/**
 * Map a chrome object (FlatTheme.chrome or TenantAppearanceAdvanced.chrome)
 * to flat CSS variable declarations.
 *
 * This is the explicit chrome channel — sidebar, layout, shell, controls,
 * and table are NOT shoehorned into tokenOverrides or personality.
 */
export function chromeToVariables(
  chrome: BrandChrome | undefined,
  context: ChromeVariableContext = {}
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!chrome) return vars;

  // Sidebar
  if (chrome.sidebar) {
    const s = chrome.sidebar;
    setSidebarLeafVars(vars, chrome);
    // A semantic posture is a high-level decision and therefore wins over the
    // code-owned vertical's concrete baseline leaves. It is lowered last, once
    // per effective mode, into the same plain canonical channels -- but it does
    // NOT win over an explicit leaf of a higher authority, so the assignment is
    // ranked rather than unconditional. See `assignToneUnderTenantLeaves`.
    assignToneUnderTenantLeaves(
      vars,
      sidebarToneToVariables(s.tone, context.mode),
      context
    );
  }

  setLayoutVars(vars, chrome);
  setShellVars(vars, chrome);
  setToolbarVars(vars, chrome);
  setFilterPillVars(vars, chrome);

  // Badge / Chip / Pill — dedicated microchannel, independent from filters.
  setBadgeChromeVars(vars, chrome.badge);

  setBreadcrumbVars(vars, chrome);
  setSearchVars(vars, chrome);

  // Controls — all button variants
  if (chrome.controls) {
    const c = chrome.controls;

    setControlLeadVars(vars, chrome);

    if (c.buttonGeometry) {
      const geometry = c.buttonGeometry;
      setButtonGeometryLeadVars(vars, chrome);
      if (geometry.gap) {
        vars["--ds-button-gap"] = geometry.gap;
        for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
          vars[`--ds-button-${size}-gap`] = geometry.gap;
        }
      }
      if (geometry.radius) {
        vars["--ds-radius-button"] = geometry.radius;
        for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
          vars[`--ds-button-${size}-radius`] = geometry.radius;
        }
      }
      setButtonGeometryTailVars(vars, chrome);
      setControlSizeVars(vars, "button", "xs", geometry.xs);
      setControlSizeVars(vars, "button", "sm", geometry.sm);
      setControlSizeVars(vars, "button", "md", geometry.md);
      setControlSizeVars(vars, "button", "lg", geometry.lg);
      setControlSizeVars(vars, "button", "xl", geometry.xl);
    }

    if (c.fieldGeometry) {
      const geometry = c.fieldGeometry;
      setFieldGeometryVars(vars, chrome);
      setControlSizeVars(vars, "input", "xs", geometry.xs);
      setControlSizeVars(vars, "input", "sm", geometry.sm);
      setControlSizeVars(vars, "input", "md", geometry.md);
      setControlSizeVars(vars, "input", "lg", geometry.lg);
      setControlSizeVars(vars, "input", "xl", geometry.xl);
    }

    if (c.segmented) {
      const segmented = c.segmented;
      setSegmentedVars(vars, chrome);
      setSegmentedSizeVars(vars, "sm", segmented.sm);
      setSegmentedSizeVars(vars, "md", segmented.md);
      setSegmentedSizeVars(vars, "lg", segmented.lg);
    }

    setButtonVariantVars(vars, "primary", c.buttonPrimary);
    setButtonVariantVars(vars, "secondary", c.buttonSecondary);
    setButtonVariantVars(vars, "default", c.buttonDefault);
    setButtonVariantVars(vars, "ghost", c.buttonGhost);
    setButtonVariantVars(vars, "text", c.buttonText);
    setButtonVariantVars(vars, "dashed", c.buttonDashed);
    setButtonVariantVars(vars, "link", c.buttonLink);
    setButtonVariantVars(vars, "success", c.buttonSuccess);
    setButtonVariantVars(vars, "warning", c.buttonWarning);
    setButtonVariantVars(vars, "error", c.buttonError);
    setButtonVariantVars(vars, "info", c.buttonInfo);
    setButtonVariantVars(vars, "ai", c.buttonAI);

    setLegacyDangerButtonAlias(vars, c.buttonError);
    setLegacyButtonHoverBgAlias(vars, "primary", c.buttonPrimary);
    setLegacyButtonHoverBgAlias(vars, "secondary", c.buttonSecondary);
    setLegacyButtonHoverBgAlias(vars, "default", c.buttonDefault);
    setLegacyButtonHoverBgAlias(vars, "ghost", c.buttonGhost);
    setLegacyButtonHoverBgAlias(vars, "text", c.buttonText);
    setLegacyButtonHoverBgAlias(vars, "dashed", c.buttonDashed);
    setLegacyButtonHoverBgAlias(vars, "link", c.buttonLink);

    setControlStateVars(vars, chrome);

    setInputVars(vars, chrome);
    setSelectVars(vars, chrome);
    setFieldFamilyVars(vars, chrome);
  }

  setTableVars(vars, chrome);
  setCardComponentVars(vars, chrome);

  // Metric/stat card chrome
  if (chrome.metricCard) {
    const mc = chrome.metricCard;
    setPremiumCardVars(vars, "metric-card", mc);
    setMetricCardVars(vars, chrome);
  }

  // Signal/status card chrome
  if (chrome.signalCard) {
    const sc = chrome.signalCard;
    setPremiumCardVars(vars, "signal-card", sc);
    setSignalCardVars(vars, chrome);
  }

  setPremiumCardVars(vars, "premium-card", chrome.premiumCard);
  setPremiumCardVars(vars, "workspace-card", chrome.workspaceCard);
  setPremiumCardVars(vars, "compact-card", chrome.compactCard);
  setPremiumCardVars(vars, "tall-card", chrome.tallCard);
  setPremiumCardVars(vars, "collection-card", chrome.collectionCard);
  setCardBandVars(vars, chrome);
  setListingGridVars(vars, chrome.listingGrid);
  setListVars(vars, chrome.list);
  setDetailVars(vars, chrome.detail);

  setModalVars(vars, chrome);

  setMappedChromeVars(vars, chrome.tooltip, TOOLTIP_CHROME_VARIABLES);
  if (chrome.tooltip?.zIndex != null) {
    // Scale-shaped and component-shaped spellings of one stacking decision.
    const z = String(chrome.tooltip.zIndex);
    vars["--ds-z-index-tooltip"] = z;
    vars["--ds-tooltip-z-index"] = z;
  }
  setMappedChromeVars(vars, chrome.popover, POPOVER_CHROME_VARIABLES);
  setSurfaceChromeVars(vars, chrome.surface);

  setTabsVars(vars, chrome);
  setCollapseVars(vars, chrome);

  for (const [family, mapping] of FLAT_CHROME_FAMILY_VARIABLES) {
    setMappedChromeVars(
      vars,
      chrome[family] as Record<string, string> | undefined,
      mapping as Readonly<Record<string, string>>
    );
  }

  for (const [legacy, current] of Object.entries(FROZEN_ENGINE_COMPAT_CHANNELS)) {
    if (vars[current] !== undefined) vars[legacy] = vars[current];
  }

  // Last, over the composed map: one owner for the law, and a radius channel
  // added to any block above inherits it without a second edit.
  applyRadiusDial(vars, context.radiusBaseline);

  return vars;
}
