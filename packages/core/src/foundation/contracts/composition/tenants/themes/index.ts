/**
 * @fileoverview Theme contracts - Rottay Design System
 * @description Runtime theming types describing loaded theme state (ThemeConfig,
 * ThemeContextValue) rather than the lower-level token catalogs.
 *
 * @module Contracts/Themes
 * @category Types
 * @package @rottay/design-system
 */

import type { EngineName } from "../../../runtime/engine";
import type { FirstPartyVerticalId } from "../../../kernel/verticals";
import type {
  ChartPersonalityTokens,
  CardPersonalityTokens,
  AccentPersonalityTokens,
  PartialPersonalityTokens,
  PersonalityTokens,
} from "../../../kernel/tokens";
import type { TenantTokenOverrides } from "..";
import type {
  BrandRecipeSelection,
  BrandResponsiveSelection,
  BrandExpressiveAxisOverrides,
  BrandExpressiveSelection,
  BrandAppearance,
  BrandPalette,
  BrandTypography,
  BrandSurfaces,
  BrandMotion,
  BrandSurfaceChrome,
  BrandSidebarChrome,
  BrandLayoutChrome,
  BrandShellChrome,
  BrandToolbarChrome,
  BrandFilterPillChrome,
  BrandBadgeChrome,
  BrandBreadcrumbChrome,
  BrandSearchChrome,
  BrandButtonVariantChrome,
  BrandControlSizeChrome,
  BrandButtonGeometryChrome,
  BrandFieldGeometryChrome,
  BrandSemanticControlChrome,
  BrandTextareaChrome,
  BrandFormChrome,
  BrandSelectChrome,
  BrandAutocompleteChrome,
  BrandCheckboxChrome,
  BrandDatePickerChrome,
  BrandInputNumberChrome,
  BrandRadioChrome,
  BrandRateChrome,
  BrandSliderChrome,
  BrandSwitchChrome,
  BrandTimePickerChrome,
  BrandToggleChrome,
  BrandTransferChrome,
  BrandUploadChrome,
  BrandInputChrome,
  BrandTableChrome,
  BrandCardChrome,
  BrandPremiumCardChrome,
  BrandMetricCardChrome,
  BrandSignalCardChrome,
  BrandListingGridChrome,
  BrandListChrome,
  BrandDetailChrome,
  BrandModalChrome,
  BrandTooltipChrome,
  BrandPopoverChrome,
  BrandTabsChrome,
  BrandAlertChrome,
  BrandAnchorChrome,
  BrandAvatarChrome,
  BrandBackTopChrome,
  BrandCalendarChrome,
  BrandCollapseChrome,
  BrandDescriptionsChrome,
  BrandDrawerChrome,
  BrandDropdownChrome,
  BrandEmptyChrome,
  BrandFloatButtonChrome,
  BrandLiveFeedChrome,
  BrandMenuChrome,
  BrandMessageChrome,
  BrandNotificationChrome,
  BrandPaginationChrome,
  BrandProgressChrome,
  BrandResultChrome,
  BrandSkeletonChrome,
  BrandSpinnerChrome,
  BrandStatisticChrome,
  BrandStatsGridChrome,
  BrandStepsChrome,
  BrandTagChrome,
  BrandTimelineChrome,
  BrandTreeChrome,
} from "./brand";
import type { TenantAppearanceGeneral } from "./general";

export type * from "./brand";
export type * from "./general";

export interface ThemeConfig {
  name: string;
  extends?: string;
  /** Raw CSS variable/value map produced by the current theme source */
  variables: Record<string, string>;
  /** Optional engine-specific values if a theme needs renderer tuning */
  engineOverrides?: Partial<Record<EngineName, Record<string, unknown>>>;
  tenant?: string;
  cssUrl?: string;
  isLoaded?: boolean;
  isError?: boolean;
  isFallback?: boolean;
}

export interface ThemeContextValue {
  theme: string;
  /**
   * The mode the root actually resolves to: `auto` collapsed against the OS
   * preference, and `base` meaning "whatever default mode the vertical's own
   * compile declared". Computed once, here, so a consumer that needs the mode
   * never re-derives it from the theme string or from the DOM.
   */
  resolvedTheme: 'light' | 'dark' | 'base';
  setTheme: (theme: string) => void;
  config: ThemeConfig | null;
  tenant?: string;
  setTenant?: (tenant: string) => void;
  isLoading?: boolean;
  isFallback?: boolean;
}

// ── FlatTheme ──────────────────────────────────────────
// The canonical premium visual source of truth.
// Merge precedence: DS base -> vertical baseline -> FlatTheme -> generated artifacts.
//
// A FlatTheme captures the full visual identity that was previously split across
// TenantBranding (colors/fonts), TenantTokenOverrides (structural), and
// PersonalityTokens (animation/chart/typography/accent/card). It does NOT include
// tenant identity (logos, company name, plan, features) — those stay in TenantConfig.

/** The two modes a theme can be authored for. */
export type FlatThemeMode = "light" | "dark";

/**
 * One mode's values, as deep partials of the semantic families.
 *
 * A vertical authors its DEFAULT mode in the main FlatTheme body — those
 * fields are unchanged and a theme without `modes` compiles exactly as before.
 * The NON-default mode is authored here, and only where it diverges: the
 * compiler merges this over the base theme, runs the SAME family compilers,
 * and emits the difference. That is what makes a second mode a typed brand
 * decision instead of a hand-written stylesheet block — one source per
 * channel per mode, with no per-vertical branch anywhere in the compiler.
 *
 * `palette` is `Partial` only because `primaryColor` is required on the base;
 * every other family is already all-optional, so it is its own deep partial.
 */
export interface FlatThemeModeOverlay {
  palette?: Partial<BrandPalette>;
  typography?: BrandTypography;
  surfaces?: BrandSurfaces;
  chrome?: BrandChrome;
}

/** Typed per-mode overlays keyed by the mode they describe. */
export type FlatThemeModes = Partial<
  Record<FlatThemeMode, FlatThemeModeOverlay>
>;

/**
 * The optional FlatTheme families whose presence is a BRAND DECISION rather
 * than a schema accident.
 *
 * Every one of these is `?` on `FlatTheme` because a DB patch or a fixture may
 * legitimately omit it. That optionality is wrong for a first-party vertical:
 * "evnto ships no recipe selection" and "someone forgot to author evnto's
 * recipe selection" are indistinguishable from the source alone, and silent
 * absence is exactly how a vertical loses a capability without anyone noticing.
 * A first-party theme therefore states a disposition for each id instead of
 * omitting the key.
 */
export type BrandCapabilityId =
  | "motion"
  | "recipes"
  | "expressive"
  | "responsive";

/**
 * Why a capability is not active. Owned by its own leaf so that `themes/iso`
 * can read the runtime list without taking a value edge on this barrel.
 *
 * Only the TYPE is republished here, which is exactly what this barrel
 * published before the vocabulary gained a runtime list: re-exporting the
 * value would add a public runtime symbol to the package's supplier contract
 * for the sake of one internal validator.
 */
export type { BrandCapabilityAbsenceReason } from "./iso/capability-absence";
import type { BrandCapabilityAbsenceReason } from "./iso/capability-absence";

/**
 * A capability is either active (the corresponding FlatTheme field is
 * authored and live) or explicitly not — with a reason and a human note.
 *
 * `disabled` means the decision is made and closed. `unassigned` means the
 * decision is still open, which is what an art-direction proposal looks like
 * BEFORE a governed profile exists to select. Neither may be represented by
 * simply leaving the field out.
 */
export type BrandCapabilityDisposition =
  | { readonly status: "active" }
  | {
      readonly status: "disabled";
      readonly reason: BrandCapabilityAbsenceReason;
      readonly note: string;
    }
  | {
      readonly status: "unassigned";
      readonly reason: BrandCapabilityAbsenceReason;
      readonly note: string;
    };

/**
 * The complete disposition catalog. Every `BrandCapabilityId` must be keyed —
 * `Record` (not `Partial<Record>`) is the point: a missing key is a type error,
 * so the catalog cannot regress back into silent absence.
 */
export type BrandCapabilityCatalog = Readonly<
  Record<BrandCapabilityId, BrandCapabilityDisposition>
>;

/**
 * The flat projection of the governed `Theme`: the READ VIEW the lowering's
 * channel writers consume. It is not a transport and no productive owner
 * returns it as an authored draft (WO-DER-08).
 *
 * THE EXCEPTIONS ARE NAMED, and the list is the measured one rather than a
 * round number: (1) test/fixture material still authors this shape and is
 * lifted at the ingress door by `readThemeDraft`; (2) the superseded
 * `serializeFlatTheme` / `deserializeFlatTheme` window keeps a published
 * spelling alive until its named end trigger fires; (3) the ingress's own
 * draft constructors assemble a flat literal and lift it in the same
 * expression, because this shape is the type `liftAuthoredTheme` DECLARES as
 * its input -- retyping that input is the deferred (b) lot, and assembling a
 * `Theme` field by field instead would be a second interpretation of the same
 * bounded set; (4) `tenant-preview`'s superseded `brand-theme` source arm
 * carries an incoming serialized flat payload forward.
 */
export interface FlatTheme {
  /** Unique identifier for this brand theme */
  id: string;
  /** Display name */
  name: string;

  /** Which mode this theme's values are; drives the emitted `color-scheme`. */
  appearance?: BrandAppearance;
  /**
   * Values for the mode this theme is NOT authored in. Absent means the
   * vertical ships one mode.
   */
  modes?: FlatThemeModes;
  /** Light/dark palettes and semantic colors */
  palette?: BrandPalette;
  /** Font families and heading/label strategies */
  typography?: BrandTypography;
  /** Backgrounds, borders, elevation, glass/gradient/material posture */
  surfaces?: BrandSurfaces;
  /** Duration, entrance, hover energy, pulse/skeleton */
  motion?: BrandMotion;
  /** Chart palette posture, line style, tooltip style */
  charts?: Partial<ChartPersonalityTokens>;
  /** Governed recipe-profile selection (DS-S001). */
  recipes?: BrandRecipeSelection;
  /** Governed expressive-profile selection (C1b). */
  expressive?: BrandExpressiveSelection;
  /** Governed responsive-posture (container-ladder) selection (E2). */
  responsive?: BrandResponsiveSelection;
  /** Card and accent visual chrome */
  chrome?: BrandChrome;
  /**
   * Explicit disposition for every optional capability family.
   *
   * Optional on `FlatTheme` because DB documents stay partial patches and
   * fixtures author only what they exercise. REQUIRED on `ThemeSource`, the
   * shape the ISO normalizer lowers.
   */
  capabilities?: BrandCapabilityCatalog;
}

/**
 * A flat theme the ISO normalizer lowers without inference.
 *
 * The three families it reads directly are required, and `capabilities` states
 * a disposition for each optional family so nothing is inferred as active. The
 * governed selections are PARTIAL shapes because that is what the normalizer
 * merges over its own default shape: a source that activates a family while
 * deciding none of its leaves states exactly `{}`. Identity is open: the
 * neutral foundation is a source and is no first-party vertical.
 */
export interface ThemeSource
  extends Omit<FlatTheme, "recipes" | "expressive" | "responsive"> {
  readonly appearance: BrandAppearance;
  readonly palette: BrandPalette;
  readonly capabilities: BrandCapabilityCatalog;
  readonly recipes?: Partial<BrandRecipeSelection>;
  readonly expressive?: Partial<BrandExpressiveSelection>;
  readonly responsive?: Partial<BrandResponsiveSelection>;
}

export interface BrandChrome {
  /** Card elevation, hover, border, padding personality */
  card?: Partial<CardPersonalityTokens>;
  /** Shared semantic surface paint consumed across component families */
  surface?: BrandSurfaceChrome;
  /** Accent bars, icon containers, badge shapes, dividers */
  accent?: Partial<AccentPersonalityTokens>;
  /** Sidebar navigation chrome (bg, text, item sizing, group headers) */
  sidebar?: BrandSidebarChrome;
  /** Layout header and sider shell chrome */
  layout?: BrandLayoutChrome;
  /** Shell background grid (for premium grid-overlay effects) */
  shell?: BrandShellChrome;
  /** Workspace/search/list toolbar chrome */
  toolbar?: BrandToolbarChrome;
  /** Filter pill/toggle chrome used by dense list filters */
  filterPill?: BrandFilterPillChrome;
  /** Badge / Chip / Pill microchannel chrome. */
  badge?: BrandBadgeChrome;
  /** Breadcrumb and breadcrumb-bar chrome */
  breadcrumb?: BrandBreadcrumbChrome;
  /** Global/local search chrome */
  search?: BrandSearchChrome;
  /** Button variant colors, input chrome, disabled states */
  controls?: BrandControlsChrome;
  /** Table header, row, and cell styling */
  table?: BrandTableChrome;
  /** Card component chrome (bg, border, shadow, header/body/footer) */
  cardComponent?: BrandCardChrome;
  /**
   * Base premium-card paint. The named card families below are specialisations
   * of the same anatomy; this slot paints the unspecialised `--ds-premium-card-*`
   * namespace they all fall back through.
   */
  premiumCard?: BrandPremiumCardChrome;
  /** Metric/stat cards used in dashboards and command headers */
  metricCard?: BrandMetricCardChrome;
  /** Signal/status cards used for operational insights */
  signalCard?: BrandSignalCardChrome;
  /** Workspace cards used inside command/list/detail workspaces */
  workspaceCard?: BrandPremiumCardChrome;
  /** Dense cards for compact lists, rails, and mobile fallbacks */
  compactCard?: BrandPremiumCardChrome;
  /** Tall cards for rich records, summaries, and media-forward layouts */
  tallCard?: BrandPremiumCardChrome;
  /** Collection item cards used by cards/grid view modes */
  collectionCard?: BrandPremiumCardChrome;
  /** Listing grid chrome shared by collection cards and skeleton/empty states */
  listingGrid?: BrandListingGridChrome;
  /** Collection list shell and preview-rail chrome */
  list?: BrandListChrome;
  /** Detail record surface chrome (hero header, section panels, rail width) */
  detail?: BrandDetailChrome;
  /** Modal/dialog chrome */
  modal?: BrandModalChrome;
  /** Tooltip micro-overlay chrome */
  tooltip?: BrandTooltipChrome;
  /** Popover contextual-surface chrome */
  popover?: BrandPopoverChrome;
  /** Tabs chrome */
  tabs?: BrandTabsChrome;
  /** Alert banner chrome: per-intent surface, border, text and icon paint */
  alert?: BrandAlertChrome;
  /** Anchor navigation chrome: ink rail and link states */
  anchor?: BrandAnchorChrome;
  /** Avatar chrome: default/semantic fills, ring, group overflow paint */
  avatar?: BrandAvatarChrome;
  /** Back-to-top affordance chrome */
  backTop?: BrandBackTopChrome;
  /** Calendar chrome: surface, border, header and out-of-month days */
  calendar?: BrandCalendarChrome;
  /** Collapse/accordion chrome: panel, header and content paint */
  collapse?: BrandCollapseChrome;
  /** Descriptions list chrome: surface, border, label and content */
  descriptions?: BrandDescriptionsChrome;
  /** Drawer chrome: surface, header/footer rules, title and elevation */
  drawer?: BrandDrawerChrome;
  /** Dropdown menu chrome: surface, elevation and item states */
  dropdown?: BrandDropdownChrome;
  /** Empty-state chrome: illustration and description paint */
  empty?: BrandEmptyChrome;
  /** Float button chrome: default/primary fills and badge paint */
  floatButton?: BrandFloatButtonChrome;
  /** Live feed chrome: surface, new-item highlight and loading paint */
  liveFeed?: BrandLiveFeedChrome;
  /** Menu chrome: surface, item states, dividers and the inverse variant */
  menu?: BrandMenuChrome;
  /** Transient message chrome: surface, elevation and close affordance */
  message?: BrandMessageChrome;
  /** Notification chrome: surface, elevation and title paint */
  notification?: BrandNotificationChrome;
  /** Pagination chrome: item states and the active page treatment */
  pagination?: BrandPaginationChrome;
  /** Progress chrome: track and per-intent fill paint */
  progress?: BrandProgressChrome;
  /** Result page chrome: icon, title and subtitle paint */
  result?: BrandResultChrome;
  /** Skeleton chrome: base fill, highlight and wave gradient */
  skeleton?: BrandSkeletonChrome;
  /** Spinner chrome: indicator and track paint */
  spinner?: BrandSpinnerChrome;
  /** Statistic chrome: title, value and affix paint */
  statistic?: BrandStatisticChrome;
  /** Stats grid chrome: card variants, trend paint and skeletons */
  statsGrid?: BrandStatsGridChrome;
  /** Steps chrome: connector, and the wait/process/finish item states */
  steps?: BrandStepsChrome;
  /** Tag chrome: default and per-intent surface, border and text paint */
  tag?: BrandTagChrome;
  /** Timeline chrome: rail, dot and content paint */
  timeline?: BrandTimelineChrome;
  /** Tree chrome: node states for hover and selection */
  tree?: BrandTreeChrome;
}

/** Refined grouped-choice chrome for the Modern Segmented primitive. */
export interface BrandSegmentedChrome {
  bg?: string;
  border?: string;
  radius?: string;
  padding?: string;
  gap?: string;
  shadow?: string;
  itemBg?: string;
  itemBgHover?: string;
  itemBgSelected?: string;
  itemColor?: string;
  itemColorHover?: string;
  itemColorSelected?: string;
  itemRadius?: string;
  itemFontWeight?: string | number;
  itemFontWeightSelected?: string | number;
  sm?: BrandControlSizeChrome;
  md?: BrandControlSizeChrome;
  lg?: BrandControlSizeChrome;
}

export interface BrandControlsChrome {
  /** Shared semantic paint consumed by buttons, pills and dense controls. */
  semantic?: BrandSemanticControlChrome;
  /**
   * Multi-line field chrome. A textarea is not a tall Input: it carries its
   * own resting/filled grounds and a character-count ink that the single-line
   * field has no term for, so it does not inherit `input` here.
   */
  textarea?: BrandTextareaChrome;
  /** Field-label, help, and validation-message ink shared by every form row. */
  form?: BrandFormChrome;
  /** Button optical geometry. Paint stays in the variant blocks below. */
  buttonGeometry?: BrandButtonGeometryChrome;
  /** Input/select optical geometry shared by field-like controls. */
  fieldGeometry?: BrandFieldGeometryChrome;
  /** Grouped-choice geometry and paint for Segmented. */
  segmented?: BrandSegmentedChrome;
  /** Primary button chrome */
  buttonPrimary?: BrandButtonVariantChrome;
  /** Secondary button chrome */
  buttonSecondary?: BrandButtonVariantChrome;
  /** Default button chrome */
  buttonDefault?: BrandButtonVariantChrome;
  /** Ghost button chrome */
  buttonGhost?: BrandButtonVariantChrome;
  /** Text button chrome */
  buttonText?: BrandButtonVariantChrome;
  /** Dashed-outline button chrome */
  buttonDashed?: BrandButtonVariantChrome;
  /** Link button chrome */
  buttonLink?: BrandButtonVariantChrome;
  /** Success semantic button */
  buttonSuccess?: BrandButtonVariantChrome;
  /** Warning semantic button */
  buttonWarning?: BrandButtonVariantChrome;
  /** Error/danger semantic button */
  buttonError?: BrandButtonVariantChrome;
  /** Info semantic button */
  buttonInfo?: BrandButtonVariantChrome;
  /** AI-assisted action. Palette is authored independently from primary. */
  buttonAI?: BrandButtonVariantChrome;
  /** Disabled state treatment (shared across control types) */
  disabled?: {
    opacity?: number;
    bg?: string;
    text?: string;
    border?: string;
    borderColor?: string;
  };
  /** Focus ring */
  focusRing?: string;
  /**
   * Focus ring COLOR, independent of the composed `focusRing` shadow above.
   * Components that build their own ring geometry read the colour alone.
   */
  focusRingColor?: string;
  /** Input field chrome */
  input?: BrandInputChrome;
  /** Select/combobox chrome (trigger, dropdown panel, options) */
  select?: BrandSelectChrome;
  /**
   * ROTTAY-T2 MASS. Twelve control families that had no typed owner and were
   * therefore authored as raw `--ds-*` rows inside the rottay artifact
   * extension. Each is a CLOSED interface over the channels its family
   * actually paints -- not an open map, and not a per-brand dialect: the
   * common `chromeToVariables` lowering emits the same names for the static
   * `FlatTheme` transport and the DB `TenantThemeDocument` transport.
   *
   * The field name is the camelCase of the channel suffix, and the lowering
   * names each channel after its family folder: `autocomplete` lowers to
   * `--ds-auto-complete-*`, `datePicker` to `--ds-date-picker-*`,
   * `inputNumber` to `--ds-input-number-*` and `timePicker` to `--ds-time-picker-*`.
   */
  autocomplete?: BrandAutocompleteChrome;
  checkbox?: BrandCheckboxChrome;
  datePicker?: BrandDatePickerChrome;
  inputNumber?: BrandInputNumberChrome;
  radio?: BrandRadioChrome;
  rate?: BrandRateChrome;
  slider?: BrandSliderChrome;
  switch?: BrandSwitchChrome;
  timePicker?: BrandTimePickerChrome;
  toggle?: BrandToggleChrome;
  transfer?: BrandTransferChrome;
  upload?: BrandUploadChrome;
}

// ── Tenant Appearance ───────────────────────────────────
// DB-owned customization layered on top of the vertical theme.
// Split into General (safe presets) and Advanced (fine-grained).
// See docs/premium-styling-track/02-customization-model.md.

/**
 * Pro-tier, fine-grained customization for DB-driven tenants.
 *
 * Every field maps directly to a CSS variable compiled by the appearance
 * compiler. All fields are optional and additive - tenants only set what
 * they want to override. Everything else inherits from FlatTheme or DS base.
 *
 * ~140 CSS variables exposed across all chrome categories.
 * Previously: ~20 fields. Now: full chrome parity with FlatTheme.
 */
export interface TenantAppearanceAdvanced {
  chrome?: {
    /** Full sidebar chrome (17 fields) */
    sidebar?: Partial<BrandSidebarChrome>;
    /** Layout header and sider shell chrome */
    layout?: Partial<BrandLayoutChrome>;
    /** Shell background grid (premium atmosphere effects) */
    shell?: Partial<BrandShellChrome>;
    /** Workspace/search/list toolbar chrome */
    toolbar?: Partial<BrandToolbarChrome>;
    /** Filter pill/toggle chrome used by dense list filters */
    filterPill?: Partial<BrandFilterPillChrome>;
    /** Badge / Chip / Pill microchannel chrome */
    badge?: Partial<BrandBadgeChrome>;
    /** Breadcrumb and breadcrumb-bar chrome */
    breadcrumb?: Partial<BrandBreadcrumbChrome>;
    /** Global/local search chrome */
    search?: Partial<BrandSearchChrome>;
    /** All button variants + full input chrome + disabled + focus */
    controls?: Partial<BrandControlsChrome>;
    /** Table header, row, cell, loading chrome */
    table?: Partial<BrandTableChrome>;
    /** Card component chrome (bg, border, shadow, header/body/footer) */
    cardComponent?: Partial<BrandCardChrome>;
    /** Metric/stat cards used in dashboards and command headers */
    metricCard?: Partial<BrandMetricCardChrome>;
    /** Signal/status cards used for operational insights */
    signalCard?: Partial<BrandSignalCardChrome>;
    /** Workspace cards used inside command/list/detail workspaces */
    workspaceCard?: Partial<BrandPremiumCardChrome>;
    /** Dense cards for compact lists, rails, and mobile fallbacks */
    compactCard?: Partial<BrandPremiumCardChrome>;
    /** Tall cards for rich records, summaries, and media-forward layouts */
    tallCard?: Partial<BrandPremiumCardChrome>;
    /** Collection item cards used by cards/grid view modes */
    collectionCard?: Partial<BrandPremiumCardChrome>;
    /** Listing grid chrome shared by collection cards and skeleton/empty states */
    listingGrid?: Partial<BrandListingGridChrome>;
    /** Modal/dialog chrome (bg, overlay, header/body/footer, close) */
    modal?: Partial<BrandModalChrome>;
    /** Tooltip material, geometry, density and motion chrome */
    tooltip?: Partial<BrandTooltipChrome>;
    /** Popover material, geometry, density and motion chrome */
    popover?: Partial<BrandPopoverChrome>;
    /** Tabs chrome (border, color states) */
    tabs?: Partial<BrandTabsChrome>;
    /** Alert banner chrome: per-intent surface, border, text and icon paint */
    alert?: Partial<BrandAlertChrome>;
    /** Anchor navigation chrome: ink rail and link states */
    anchor?: Partial<BrandAnchorChrome>;
    /** Avatar chrome: default/semantic fills, ring, group overflow paint */
    avatar?: Partial<BrandAvatarChrome>;
    /** Back-to-top affordance chrome */
    backTop?: Partial<BrandBackTopChrome>;
    /** Calendar chrome: surface, border, header and out-of-month days */
    calendar?: Partial<BrandCalendarChrome>;
    /** Collapse/accordion chrome: panel, header and content paint */
    collapse?: Partial<BrandCollapseChrome>;
    /** Descriptions list chrome: surface, border, label and content */
    descriptions?: Partial<BrandDescriptionsChrome>;
    /** Drawer chrome: surface, header/footer rules, title and elevation */
    drawer?: Partial<BrandDrawerChrome>;
    /** Dropdown menu chrome: surface, elevation and item states */
    dropdown?: Partial<BrandDropdownChrome>;
    /** Empty-state chrome: illustration and description paint */
    empty?: Partial<BrandEmptyChrome>;
    /** Float button chrome: default/primary fills and badge paint */
    floatButton?: Partial<BrandFloatButtonChrome>;
    /** Live feed chrome: surface, new-item highlight and loading paint */
    liveFeed?: Partial<BrandLiveFeedChrome>;
    /** Menu chrome: surface, item states, dividers and the inverse variant */
    menu?: Partial<BrandMenuChrome>;
    /** Transient message chrome: surface, elevation and close affordance */
    message?: Partial<BrandMessageChrome>;
    /** Notification chrome: surface, elevation and title paint */
    notification?: Partial<BrandNotificationChrome>;
    /** Pagination chrome: item states and the active page treatment */
    pagination?: Partial<BrandPaginationChrome>;
    /** Progress chrome: track and per-intent fill paint */
    progress?: Partial<BrandProgressChrome>;
    /** Result page chrome: icon, title and subtitle paint */
    result?: Partial<BrandResultChrome>;
    /** Skeleton chrome: base fill, highlight and wave gradient */
    skeleton?: Partial<BrandSkeletonChrome>;
    /** Spinner chrome: indicator and track paint */
    spinner?: Partial<BrandSpinnerChrome>;
    /** Statistic chrome: title, value and affix paint */
    statistic?: Partial<BrandStatisticChrome>;
    /** Stats grid chrome: card variants, trend paint and skeletons */
    statsGrid?: Partial<BrandStatsGridChrome>;
    /** Steps chrome: connector, and the wait/process/finish item states */
    steps?: Partial<BrandStepsChrome>;
    /** Tag chrome: default and per-intent surface, border and text paint */
    tag?: Partial<BrandTagChrome>;
    /** Timeline chrome: rail, dot and content paint */
    timeline?: Partial<BrandTimelineChrome>;
    /** Tree chrome: node states for hover and selection */
    tree?: Partial<BrandTreeChrome>;
  };
  /** Allowlisted raw token overrides. Keys must start with `--ds-`. Max 200. */
  tokenOverrides?: Record<`--ds-${string}`, string | number>;
  /**
   * Pro explicit per-axis expressive overrides (C1b), mirrored from the
   * document write-contract so the normalized compiler/compat shape carries
   * the same selection the artifact was compiled from.
   */
  profiles?: BrandExpressiveAxisOverrides;
  /**
   * Governed responsive-posture selection (E2), mirrored from the document
   * write-contract for the same reason as `profiles`: the adaptive runtime
   * reads the ladder id off this shape, so it must survive normalization.
   */
  responsivePosture?: string;
}

/** Combined tenant appearance (General + Advanced). */
export interface TenantAppearance {
  general?: TenantAppearanceGeneral;
  advanced?: TenantAppearanceAdvanced;
  /**
   * Governed recipe-profile selection compiled from the DB-owned appearance
   * document. The value is validated against the closed DS registry before it
   * reaches this runtime-facing shape.
   */
  recipeProfile?: string;
}
