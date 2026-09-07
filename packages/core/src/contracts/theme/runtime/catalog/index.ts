/**
 * @fileoverview The typed control catalog: the ONLY list of what a tenant can
 * decide, and the only source of a control's tier, closed domain, keypath,
 * declared fan-out and minimum families.
 *
 * It is the code form of `roadmap/kit-2026-09.md` (owner decisions D-27 and
 * D-28 (b), 2026-09-05). Every other listing is a generated view of this file:
 * the DB decision schema, the public control document and the gates that used
 * to read `governance/manifest/controls/**` all resolve here.
 *
 * FENCES.
 * - No import from `infrastructure/**`: a catalog that knows a compiler is a
 *   compiler input, not a contract.
 * - `THEME_CONTROL_CATALOG` is an array literal on purpose. The gate reader
 *   (`scripts/libraries/theme-catalog`) parses this file with the TypeScript
 *   AST, so a row computed at runtime would be invisible to every gate.
 * - The 29 rows are decisions. `THEME_CATALOG_ANNEX` carries the three kit
 *   section 3 entries that are NOT decisions, and `THEME_CATALOG_RETIRED` the
 *   two v1 controls the kit retires; neither may be counted toward the 29.
 *
 * @module Contracts/Theme/Catalog
 * @category Types
 * @package @rottay/design-system
 */

import {
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
  type ThemeDecisionId,
  type ThemeDecisionTier,
} from "@/contracts/theme/foundation/decisions";

/** The eight axes of the kit, in kit order. */
export const THEME_CONTROL_GROUPS = Object.freeze([
  "color",
  "typography",
  "shape",
  "rhythm",
  "depth",
  "states",
  "motion",
  "structure",
] as const);

export type ThemeControlGroup = (typeof THEME_CONTROL_GROUPS)[number];

/**
 * A closed domain. A control with an open domain is not admissible, so there
 * is deliberately no `{ kind: "free" }` member to fall back to.
 *
 * `registered` names the registry that closes the domain instead of restating
 * its ids: the registry is the authority and re-listing it here would be a
 * second vocabulary to keep in step.
 */
export type ThemeControlDomain =
  | { readonly kind: "enum"; readonly values: readonly string[] }
  | { readonly kind: "scale"; readonly bounds: { readonly min: number; readonly max: number } }
  | { readonly kind: "color-set"; readonly roles: readonly string[] }
  | {
      readonly kind: "record";
      readonly keys: readonly string[];
      /**
       * The closed vocabulary a key's value may take, where the row has one.
       * `motion.dial` and `chrome.anatomy` have none: their values are numbers
       * and per-family variants the family contract already closes.
       */
      readonly values?: readonly string[];
    }
  | { readonly kind: "registered"; readonly registry: string };

/**
 * The absolute family floor a causal gate holds the control to.
 *
 * Three kinds, one per rule of `roadmap/kit-2026-09.md` section 1:
 *
 * - `declared-ratio` — the approved cell states a target ratio in the
 *   25-family denominator of the cascade matrix (kit rows 1, 11, 15, 16, 17,
 *   22, 24). The ratio IS the floor.
 * - `declared-fan-out` — the floor is the row's own declared fan-out: every
 *   family it declares it consumes (kit rows 18, 19, 25-29). An empty
 *   `families` means the row names no separate family list, so the floor is
 *   whatever `produces` names; it never means "no floor".
 * - `owner-pending` — a broad-scope row whose absolute floor the kit fixes in
 *   this catalog "under owner approval" and nowhere else. No owner value has
 *   been recorded against this file yet, so the row carries the reference
 *   EXAMPLE and says so. `>= 20/25` is the kit's example and the kit forbids
 *   promoting it to a binding floor, so a causal gate must REFUSE to certify a
 *   row in this state rather than certify it against the example.
 */
export type ThemeControlMinimumFamilies =
  | { readonly kind: "declared-ratio"; readonly families: number; readonly denominator: 25 }
  | { readonly kind: "declared-fan-out"; readonly families: readonly string[] }
  | { readonly kind: "owner-pending"; readonly referenceExample: 20; readonly denominator: 25 };

/** D-28 (b). `open` is the default: the vertical may neither lock nor is barred. */
export type ThemeControlEnvelope =
  | "locked-by-default"
  | "never-lockable"
  | "open";

/**
 * What the control moves TODAY, measured, not intended.
 *
 * `data-only` is F-35's disposition for an axis that reaches the lowering and
 * emits nothing: it is declared here rather than published as if it painted.
 * `not-yet-derived` is the ten kit rows marked `(new)`, which have no producer
 * anywhere yet; it is not a synonym of `data-only`.
 */
export type ThemeControlEffect =
  | "css-channels"
  | "root-attributes"
  | "data-only"
  | "not-yet-derived";

export interface ThemeControlRow {
  /** The kit row id, verbatim. Also the decision id and the document key. */
  readonly id: ThemeDecisionId;
  /** Row number 1-29 of the kit. Stable; never recycled. */
  readonly kitRow: number;
  readonly group: ThemeControlGroup;
  readonly tier: ThemeDecisionTier;
  readonly title: string;
  readonly domain: ThemeControlDomain;
  /** Where the value is authored today. `null` on a row with no keypath yet. */
  readonly keypath: {
    readonly document: string | null;
    readonly brandTheme: string | null;
  };
  /** Catalog inputs this row reads. A row never consumes a channel directly. */
  readonly consumes: readonly ThemeDecisionId[];
  /** The declared fan-out: what moving this row must move. */
  readonly produces: {
    readonly channels: readonly string[];
    readonly rootAttributes: readonly string[];
  };
  readonly minimumFamilies: ThemeControlMinimumFamilies;
  readonly envelope: ThemeControlEnvelope;
  readonly effect: ThemeControlEffect;
  /** What an absent value means: the rollback story is always "unset it". */
  readonly defaultBehavior: string;
}

export const THEME_CONTROL_CATALOG = Object.freeze([
  {
    id: "palette.seeds",
    kitRow: 1,
    group: "color",
    tier: "standard",
    title: "Brand palette seeds",
    domain: { kind: "color-set", roles: ["primary", "secondary", "accent", "background"] },
    keypath: {
      document: "appearance.general.palette.{primary,secondary,accent,background}",
      brandTheme: "palette.{primaryColor,secondaryColor,accentColor,backgroundColor}",
    },
    consumes: [],
    produces: {
      channels: [
        "--ds-color-primary",
        "--ds-color-primary-500",
        "--ds-button-primary-bg",
        "--ds-chart-series-1",
        "--ds-color-text-on-primary",
      ],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "declared-ratio", families: 25, denominator: 25 },
    envelope: "never-lockable",
    effect: "css-channels",
    defaultBehavior: "vertical baseline palette",
  },
  {
    id: "palette.status-seeds",
    kitRow: 2,
    group: "color",
    tier: "standard",
    title: "Status tone seeds (success/warning/error/info)",
    domain: { kind: "color-set", roles: ["success", "warning", "error", "info"] },
    keypath: {
      document: "appearance.general.palette.status.{success,warning,error,info}",
      brandTheme: "palette.{successColor,warningColor,errorColor,infoColor}",
    },
    consumes: [],
    produces: {
      channels: [
        "--ds-color-success",
        "--ds-color-warning",
        "--ds-color-error",
        "--ds-color-info",
        "--ds-color-success-50",
        "--ds-color-success-100",
        "--ds-color-success-200",
        "--ds-color-success-300",
        "--ds-color-success-400",
        "--ds-color-success-500",
        "--ds-color-success-600",
        "--ds-color-success-700",
        "--ds-color-success-800",
        "--ds-color-success-900",
        "--ds-color-warning-50",
        "--ds-color-warning-100",
        "--ds-color-warning-200",
        "--ds-color-warning-300",
        "--ds-color-warning-400",
        "--ds-color-warning-500",
        "--ds-color-warning-600",
        "--ds-color-warning-700",
        "--ds-color-warning-800",
        "--ds-color-warning-900",
        "--ds-color-error-50",
        "--ds-color-error-100",
        "--ds-color-error-200",
        "--ds-color-error-300",
        "--ds-color-error-400",
        "--ds-color-error-500",
        "--ds-color-error-600",
        "--ds-color-error-700",
        "--ds-color-error-800",
        "--ds-color-error-900",
        "--ds-color-info-50",
        "--ds-color-info-100",
        "--ds-color-info-200",
        "--ds-color-info-300",
        "--ds-color-info-400",
        "--ds-color-info-500",
        "--ds-color-info-600",
        "--ds-color-info-700",
        "--ds-color-info-800",
        "--ds-color-info-900",
        "--ds-color-on-success",
        "--ds-color-on-warning",
        "--ds-color-on-error",
        "--ds-color-on-info",
        "--ds-tint-success-4",
        "--ds-tint-success-8",
        "--ds-tint-success-12",
        "--ds-tint-success-16",
        "--ds-tint-success-24",
        "--ds-tint-warning-4",
        "--ds-tint-warning-8",
        "--ds-tint-warning-12",
        "--ds-tint-warning-16",
        "--ds-tint-warning-24",
        "--ds-tint-error-4",
        "--ds-tint-error-8",
        "--ds-tint-error-12",
        "--ds-tint-error-16",
        "--ds-tint-error-24",
        "--ds-tint-info-4",
        "--ds-tint-info-8",
        "--ds-tint-info-12",
        "--ds-tint-info-16",
        "--ds-tint-info-24",
        "--ds-color-success-bg",
        "--ds-color-success-border",
        "--ds-color-warning-bg",
        "--ds-color-warning-border",
        "--ds-color-error-bg",
        "--ds-color-error-border",
        "--ds-color-info-bg",
        "--ds-color-info-border",
        "--ds-color-alpha-success-10",
        "--ds-color-alpha-success-20",
        "--ds-color-alpha-warning-10",
        "--ds-color-alpha-warning-20",
        "--ds-color-alpha-error-10",
        "--ds-color-alpha-error-20",
        "--ds-color-alpha-info-10",
      ],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "never-lockable",
    effect: "css-channels",
    defaultBehavior: "vertical baseline status tones",
  },
  {
    id: "palette.neutral-temperature",
    kitRow: 3,
    group: "color",
    tier: "standard",
    title: "Neutral temperature",
    domain: { kind: "enum", values: ["cool", "neutral", "warm"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["palette.seeds"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "not-yet-derived",
    defaultBehavior: "the vertical's neutral ramp, unchanged",
  },
  {
    id: "palette.contrast-posture",
    kitRow: 4,
    group: "color",
    tier: "pro",
    title: "Contrast posture",
    domain: { kind: "enum", values: ["soft", "standard", "high"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["palette.seeds", "palette.status-seeds"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "not-yet-derived",
    defaultBehavior: "the DS APCA floors, unchanged",
  },
  {
    id: "palette.dark-mode",
    kitRow: 5,
    group: "color",
    tier: "pro",
    title: "Mode selection",
    domain: { kind: "enum", values: ["light", "dark", "auto"] },
    keypath: {
      document: "appearance.general.palette.{backgroundMode,dark.*}",
      brandTheme: "modes.dark.palette.*",
    },
    consumes: ["palette.seeds"],
    produces: { channels: ["--ds-color-primary-500"], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "never-lockable",
    effect: "css-channels",
    defaultBehavior: "the vertical's own default mode",
  },
  {
    id: "typography.families",
    kitRow: 6,
    group: "typography",
    tier: "pro",
    title: "Registered font pack per role",
    domain: { kind: "registered", registry: "TENANT_THEME_FONT_PACK_IDS" },
    keypath: {
      document: "appearance.general.typography.{fontFamilyBase,fontFamilyHeading}",
      brandTheme: "typography.{fontFamilyBase,fontFamilyHeading,fontFamilyMono,fontFamilyDisplay}",
    },
    consumes: [],
    produces: {
      channels: [
        "--ds-font-family-base",
        "--ds-font-family-heading",
        "--ds-font-family-mono",
        "--ds-font-family-display",
      ],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "never-lockable",
    effect: "css-channels",
    defaultBehavior: "the pairing, or the vertical baseline families",
  },
  {
    id: "typography.pairing",
    kitRow: 7,
    group: "typography",
    tier: "standard",
    title: "Type pairing personality",
    domain: { kind: "enum", values: ["sober", "editorial", "geometric", "technical"] },
    keypath: {
      document: "appearance.general.typography.typePairing",
      brandTheme: "typography.typePairing",
    },
    consumes: [],
    produces: {
      channels: ["--ds-font-family-base", "--ds-font-family-heading"],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "vertical baseline families",
  },
  {
    id: "typography.scale",
    kitRow: 8,
    group: "typography",
    tier: "standard",
    title: "Type scale dial",
    domain: { kind: "scale", bounds: { min: 0.9, max: 1.1 } },
    keypath: {
      document: "appearance.general.typography.scale",
      brandTheme: "typography.scale",
    },
    consumes: [],
    produces: { channels: ["--ds-type-scale"], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "1; the vertical envelope may clamp tighter",
  },
  {
    id: "typography.role-weights",
    kitRow: 9,
    group: "typography",
    tier: "standard",
    title: "Role weights",
    domain: { kind: "enum", values: ["light", "regular", "strong"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["typography.families"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "not-yet-derived",
    defaultBehavior: "the vertical's authored role weights",
  },
  {
    id: "typography.numeric",
    kitRow: 10,
    group: "typography",
    tier: "pro",
    title: "Numeric posture",
    domain: { kind: "enum", values: ["proportional", "tabular"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["typography.families"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "not-yet-derived",
    defaultBehavior: "the numeric role of the base family",
  },
  {
    id: "shape.radius-scale",
    kitRow: 11,
    group: "shape",
    tier: "standard",
    title: "Radius scale dial",
    domain: { kind: "scale", bounds: { min: 0.75, max: 1.25 } },
    keypath: {
      document: "appearance.general.shape.radiusScale",
      brandTheme: "surfaces.radiusScale",
    },
    consumes: [],
    produces: { channels: ["--ds-radius-scale", "--ds-radius-md"], rootAttributes: [] },
    minimumFamilies: { kind: "declared-ratio", families: 24, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "1; the vertical envelope may clamp tighter",
  },
  {
    id: "shape.nesting",
    kitRow: 12,
    group: "shape",
    tier: "pro",
    title: "Nested radius law",
    domain: { kind: "enum", values: ["concentric", "uniform"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["shape.radius-scale"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "locked-by-default",
    effect: "not-yet-derived",
    defaultBehavior: "the vertical's nesting law",
  },
  {
    id: "shape.button-style",
    kitRow: 13,
    group: "shape",
    tier: "standard",
    title: "Button silhouette",
    domain: { kind: "enum", values: ["sharp", "soft", "pill"] },
    keypath: {
      document: "appearance.general.shape.buttonStyle",
      brandTheme: "surfaces.buttonStyle",
    },
    consumes: ["shape.radius-scale"],
    produces: { channels: ["--ds-radius-button"], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "vertical baseline silhouette",
  },
  {
    id: "shape.control-height",
    kitRow: 14,
    group: "shape",
    tier: "standard",
    title: "Control height",
    domain: { kind: "enum", values: ["compact", "standard", "tall"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["density.mode"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "not-yet-derived",
    defaultBehavior: "the density posture decides the control height",
  },
  {
    id: "density.mode",
    kitRow: 15,
    group: "rhythm",
    tier: "standard",
    title: "Density posture",
    domain: { kind: "enum", values: ["compact", "normal", "spacious"] },
    keypath: { document: "appearance.general.density", brandTheme: "surfaces.density" },
    consumes: [],
    produces: {
      channels: ["--ds-density-mode-factor", "--ds-density-scale"],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "declared-ratio", families: 24, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "normal; the structural density scale is a separate channel",
  },
  {
    id: "spacing.rhythm",
    kitRow: 16,
    group: "rhythm",
    tier: "standard",
    title: "Layout rhythm",
    domain: { kind: "enum", values: ["tight", "normal", "airy"] },
    keypath: { document: "appearance.general.rhythm", brandTheme: "surfaces.rhythm" },
    consumes: [],
    produces: {
      channels: ["--ds-rhythm-scale", "--ds-rhythm-effective-scale"],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "declared-ratio", families: 20, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "normal (factor 1); orthogonal to density.mode by construction",
  },
  {
    id: "surfaces.elevation-posture",
    kitRow: 17,
    group: "depth",
    tier: "standard",
    title: "Elevation posture",
    domain: { kind: "enum", values: ["flat", "soft", "elevated"] },
    keypath: {
      document: "appearance.general.surfaces.elevation",
      brandTheme: "surfaces.elevation",
    },
    consumes: [],
    produces: {
      channels: ["--ds-elevation-1", "--ds-elevation-2", "--ds-elevation-3"],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "declared-ratio", families: 25, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "soft; the DS shadow ramp untouched",
  },
  {
    id: "surfaces.border-style",
    kitRow: 18,
    group: "depth",
    tier: "standard",
    title: "Border style",
    domain: { kind: "enum", values: ["none", "hairline", "strong"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["palette.seeds"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: {
      kind: "declared-fan-out",
      families: ["card", "input", "table", "panel"],
    },
    envelope: "open",
    effect: "not-yet-derived",
    defaultBehavior: "the vertical's authored border weights",
  },
  {
    id: "surfaces.effect-intensity",
    kitRow: 19,
    group: "depth",
    tier: "standard",
    title: "Decoration intensity",
    domain: { kind: "scale", bounds: { min: 0, max: 1 } },
    keypath: {
      document: "appearance.general.surfaces.effectIntensity",
      brandTheme: "surfaces.effectIntensity",
    },
    consumes: [],
    produces: { channels: ["--ds-effect-intensity"], rootAttributes: [] },
    minimumFamilies: {
      kind: "declared-fan-out",
      families: ["glass", "blur", "glow"],
    },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "1 for the DS default; verticals author their own floor",
  },
  {
    id: "states.emphasis",
    kitRow: 20,
    group: "states",
    tier: "standard",
    title: "Interaction-state emphasis",
    domain: { kind: "enum", values: ["subtle", "medium", "strong"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["palette.seeds"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "open",
    effect: "not-yet-derived",
    defaultBehavior: "the hand-written per-family state channels",
  },
  {
    id: "states.focus-style",
    kitRow: 21,
    group: "states",
    tier: "standard",
    title: "Focus signature",
    domain: { kind: "enum", values: ["ring", "underline", "glow"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["palette.seeds"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "never-lockable",
    effect: "not-yet-derived",
    defaultBehavior: "the engine's authored focus ring",
  },
  {
    id: "motion.dial",
    kitRow: 22,
    group: "motion",
    tier: "standard",
    title: "Motion intensity and duration",
    domain: { kind: "record", keys: ["intensity", "durationScale", "ambient"] },
    keypath: {
      document: "appearance.general.motion.{intensity,durationScale,ambient}",
      brandTheme: "motion.{intensity,durationScale,ambient}",
    },
    consumes: [],
    produces: {
      channels: ["--ds-motion-intensity", "--ds-motion-duration-scale"],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "declared-ratio", families: 25, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "engine cadence unchanged",
  },
  {
    id: "motion.character",
    kitRow: 23,
    group: "motion",
    tier: "pro",
    title: "Motion character",
    domain: { kind: "enum", values: ["mechanical", "organic", "playful"] },
    keypath: { document: null, brandTheme: null },
    consumes: ["motion.dial"],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "owner-pending", referenceExample: 20, denominator: 25 },
    envelope: "locked-by-default",
    effect: "not-yet-derived",
    defaultBehavior: "the engine's authored eases and springs",
  },
  {
    id: "navigation.sidebar-tone",
    kitRow: 24,
    group: "structure",
    tier: "standard",
    title: "Sidebar tone",
    domain: { kind: "enum", values: ["subtle", "strong", "inverse"] },
    keypath: {
      document: "appearance.general.navigation.sidebarTone",
      brandTheme: "chrome.sidebar.tone",
    },
    consumes: ["palette.seeds"],
    produces: {
      channels: [
        "--ds-sidebar-bg",
        "--ds-sidebar-text",
        "--ds-sidebar-text-muted",
        "--ds-sidebar-item-bg-hover",
        "--ds-sidebar-item-bg-active",
        "--ds-sidebar-item-color-active",
      ],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "declared-ratio", families: 2, denominator: 25 },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "subtle",
  },
  {
    id: "experience.profile",
    kitRow: 25,
    group: "structure",
    tier: "standard",
    title: "Experience profile",
    domain: { kind: "registered", registry: "EXPERIENCE_PROFILE_REGISTRY" },
    keypath: {
      document: "appearance.general.experienceProfile",
      brandTheme: "expressive.experienceProfile",
    },
    consumes: [],
    produces: {
      channels: [
        "--ds-experience-profile",
        "--ds-letter-spacing-heading",
        "--ds-edge-standard-width",
        "--ds-material-canvas-texture",
        "--ds-elevation-lift-strength",
      ],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "declared-fan-out", families: [] },
    envelope: "locked-by-default",
    effect: "css-channels",
    defaultBehavior: "baseline identity; a selection composes closed per-axis postures",
  },
  {
    id: "profiles.expressive",
    kitRow: 26,
    group: "structure",
    tier: "pro",
    title: "Explicit expressive axes",
    domain: {
      kind: "record",
      keys: ["type", "geometry", "edge", "material", "elevation", "motif", "icon"],
      values: [
        "technical",
        "editorial",
        "humanist",
        "geometric",
        "sharp",
        "soft",
        "rounded",
        "pill-accented",
        "borderless-shadow",
        "hairline",
        "outlined",
        "ruled",
        "inset-double",
        "flat",
        "paper",
        "soft-depth",
        "frosted",
        "luminous",
        "hairline-lift",
        "dramatic",
        "luminous-glow",
        "none",
        "micro-grid",
        "dots",
        "pinstripe",
        "deco-fan",
        "ambient-orbs",
        "contour",
      ],
    },
    keypath: {
      document: "visualFoundation.advanced.profiles.{type,geometry,edge,material,elevation,motif}",
      brandTheme: "expressive.profiles.{type,geometry,edge,material,elevation,motif}",
    },
    consumes: ["experience.profile"],
    produces: {
      channels: [
        "--ds-select-group-text-transform",
        "--ds-radius-scale",
        "--ds-edge-emphasis-width",
        "--ds-material-card-highlight",
        "--ds-elevation-lift-strength",
        "--ds-material-canvas-texture",
      ],
      rootAttributes: [],
    },
    minimumFamilies: { kind: "declared-fan-out", families: [] },
    envelope: "open",
    effect: "css-channels",
    defaultBehavior: "each axis falls back to the experience composition, then to baseline",
  },
  {
    id: "recipe-profile",
    kitRow: 27,
    group: "structure",
    tier: "pro",
    title: "Family recipe profile",
    domain: { kind: "registered", registry: "RECIPE_PROFILE_REGISTRY" },
    keypath: {
      document: "visualFoundation.recipeProfile",
      brandTheme: "recipes.profile",
    },
    consumes: [],
    produces: { channels: ["--ds-recipe-profile"], rootAttributes: [] },
    minimumFamilies: {
      kind: "declared-fan-out",
      families: [
        "button",
        "card",
        "section-card",
        "tabs",
        "tag",
        "input",
        "select",
        "checkbox",
        "radio",
        "toggle",
      ],
    },
    envelope: "locked-by-default",
    effect: "css-channels",
    defaultBehavior: "no profile: family recipe defaults apply",
  },
  {
    id: "chrome.anatomy",
    kitRow: 28,
    group: "structure",
    tier: "pro",
    title: "Anatomy variants",
    domain: {
      kind: "record",
      keys: ["cardComponent", "table", "sidebar", "layout"],
    },
    keypath: {
      document: "visualFoundation.advanced.chrome.{cardComponent,table,sidebar,layout}.anatomy",
      brandTheme: "chrome.{cardComponent,table,sidebar,layout}.anatomy",
    },
    consumes: [],
    produces: {
      channels: [],
      rootAttributes: [
        "data-anatomy-card",
        "data-anatomy-table",
        "data-anatomy-sidebar",
        "data-anatomy-layout",
      ],
    },
    minimumFamilies: {
      kind: "declared-fan-out",
      families: ["cardComponent", "table", "sidebar", "layout"],
    },
    envelope: "open",
    effect: "root-attributes",
    defaultBehavior: "default anatomy; fails closed unless the vertical envelope opts in",
  },
  {
    id: "responsive.posture",
    kitRow: 29,
    group: "structure",
    tier: "pro",
    title: "Responsive posture",
    domain: { kind: "enum", values: ["compact", "balanced", "expansive"] },
    keypath: {
      document: "visualFoundation.advanced.responsivePosture",
      brandTheme: "responsive.posture",
    },
    consumes: [],
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: "declared-fan-out", families: [] },
    envelope: "open",
    effect: "data-only",
    defaultBehavior: "the vertical's responsive contract, unchanged",
  },
] as const satisfies readonly ThemeControlRow[]);

export type ThemeControlEntry = (typeof THEME_CONTROL_CATALOG)[number];

/** Non-decision entries the kit (section 3) requires the catalog to carry. */
export type ThemeCatalogAnnexStatus =
  | "sanctioned-escape-hatch"
  | "conditional"
  | "pending-consumer";

export interface ThemeCatalogAnnexEntry {
  readonly id: string;
  readonly tier: ThemeDecisionTier;
  readonly status: ThemeCatalogAnnexStatus;
  /** Why it is outside the 29, in one sentence. */
  readonly reason: string;
  /** D-28 (b) disposition, where the kit fixes one. */
  readonly envelope: ThemeControlEnvelope | null;
  /** Channels the entry declares today. `profiles.icon` declares none: that
   *  emptiness is exactly the condition its `conditional` status names. */
  readonly channels: readonly string[];
  /** The closed vocabulary the entry admits, where it has one. */
  readonly values: readonly string[];
}

export const THEME_CATALOG_ANNEX: readonly ThemeCatalogAnnexEntry[] =
  Object.freeze([
    {
      id: "sanctioned-overrides",
      tier: "pro",
      status: "sanctioned-escape-hatch",
      reason:
        "the only sanctioned escape hatch (D-03): a closed list of chrome.<family>.<channel>, never a decision and never an envelope entry",
      envelope: null,
      channels: [],
      values: [],
    },
    {
      id: "profiles.icon",
      tier: "pro",
      status: "conditional",
      reason:
        "kept only if --ds-icon-stroke-width becomes a real channel; today it is a declared head that is never written",
      envelope: null,
      channels: [],
      values: ["linear", "strong-outline", "duotone", "solid-active"],
    },
    {
      id: "signature.accent-bar",
      tier: "pro",
      status: "pending-consumer",
      reason: "no consumer exists yet, so it does not count toward the 29",
      envelope: "locked-by-default",
      channels: [],
      values: [],
    },
    {
      id: "signature.texture",
      tier: "pro",
      status: "pending-consumer",
      reason: "no consumer exists yet, so it does not count toward the 29",
      envelope: "locked-by-default",
      channels: [],
      values: [],
    },
  ]);

export interface ThemeCatalogRetiredEntry {
  readonly id: string;
  /** What a writer must use instead. Refusals quote this verbatim. */
  readonly replacedBy: string;
  /**
   * The channels the retired control declared while it was live.
   *
   * They are carried, not dropped: the cascade catalog and the root-exposure
   * laws still name these heads, and a head that silently stopped being
   * declared would flip a root's verdict without anybody deciding it.
   */
  readonly channels: readonly string[];
}

/**
 * The two v1 controls the kit retires, and what replaces each one.
 *
 * They stay named here so the door refuses them BY NAME with the replacement
 * in the message, instead of dropping them as unknown keys.
 */
export const THEME_CATALOG_RETIRED: readonly ThemeCatalogRetiredEntry[] =
  Object.freeze([
    {
      id: "token-overrides",
      replacedBy:
        "raw --ds-* authorship is retired by D-03; use overrides.chrome.<family>.<channel>",
      channels: [
        "--ds-color-error",
        "--ds-surface-card",
        "--ds-color-bg-overlay",
      ],
    },
    {
      id: "chrome.families",
      replacedBy:
        "the open chrome family map is retired; a channel is derived, or it is a sanctioned override",
      channels: [
        "--ds-button-primary-bg",
        "--ds-table-header-bg",
        "--ds-modal-bg",
      ],
    },
  ]);

/** Row lookup by id. The catalog is closed, so a miss is a caller error. */
const CATALOG_BY_ID = new Map<string, ThemeControlEntry>(
  THEME_CONTROL_CATALOG.map((row) => [row.id, row])
);

export function themeControl(id: ThemeDecisionId): ThemeControlEntry {
  const row = CATALOG_BY_ID.get(id);
  if (!row) {
    throw new Error(
      `theme catalog: unknown control "${id}"; the catalog is closed at ${THEME_CONTROL_CATALOG.length} rows`
    );
  }
  return row;
}

/**
 * The tier of a control, read from the ONE place that owns it.
 *
 * `THEME_DECISION_TIER_BY_ID` is the decisions contract's own copy of the same
 * fact; `THEME_CATALOG_TIER_AGREEMENT` below proves the two never disagree, so
 * a reader may use either without asking which is authoritative.
 */
export function themeControlTier(id: ThemeDecisionId): ThemeDecisionTier {
  return themeControl(id).tier;
}

/** The ids of the catalog, in kit row order. */
export const THEME_CONTROL_IDS: readonly ThemeDecisionId[] = Object.freeze(
  THEME_CONTROL_CATALOG.map((row) => row.id)
);

/**
 * Structural agreement with the decisions contract, evaluated at module load.
 *
 * The catalog and the decision id union are two files, and a row added to one
 * without the other is the exact drift F-04 recorded five times. Evaluating it
 * here rather than only in a test means a build that disagrees cannot load.
 */
export const THEME_CATALOG_TIER_AGREEMENT = ((): true => {
  const catalogIds = THEME_CONTROL_IDS.join("|");
  const decisionIds = THEME_DECISION_IDS.join("|");
  if (catalogIds !== decisionIds) {
    throw new Error(
      `theme catalog: rows disagree with ThemeDecisions.\n  catalog:   ${catalogIds}\n  decisions: ${decisionIds}`
    );
  }
  for (const row of THEME_CONTROL_CATALOG) {
    if (THEME_DECISION_TIER_BY_ID[row.id] !== row.tier) {
      throw new Error(
        `theme catalog: tier disagreement on "${row.id}": catalog ${row.tier}, decisions ${THEME_DECISION_TIER_BY_ID[row.id]}`
      );
    }
  }
  return true;
})();
