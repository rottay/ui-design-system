/**
 * @fileoverview The canonical runtime leaf schema for the total nested Theme.
 *
 * @module Contracts/Themes/Iso/Schema
 * @category Types
 * @package @rottay/design-system
 */

/**
 * The kinds a `ThemeLayerPatch` leaf may carry at one keypath.
 *
 * WHY THIS OWNER EXISTS. `mergeThemePatches` used the BASELINE VALUE as its
 * only schema: it refused a patch whose kind disagreed with whatever the base
 * happened to hold. That is not a schema, it is a sample. It cannot decide an
 * OPTIONAL leaf the baseline leaves `undefined` -- a boolean on the declared
 * string `palette.successBgColor` was accepted -- it cannot type the elements
 * of an EMPTY array, and it refused legal documents at the 44 leaves the
 * contract declares as `number | string`. The declaration decides here; the
 * baseline is consulted only where this schema has nothing to say.
 *
 * TOTALITY. The map below carries only the leaves that are NOT plain strings.
 * `themes/iso/tests/leaf-schema.test.ts` re-derives the complete kind map from
 * the TypeScript declarations of `Theme` and asserts this file is exactly its
 * non-string subset, so a new non-string leaf turns that test red rather than
 * silently inheriting the string default.
 */
export type ThemeLeafKind = "string" | "number" | "boolean";

const STRING: readonly ThemeLeafKind[] = Object.freeze(["string"]);
const NUMBER: readonly ThemeLeafKind[] = Object.freeze(["number"]);
const BOOLEAN: readonly ThemeLeafKind[] = Object.freeze(["boolean"]);
const NUMBER_OR_STRING: readonly ThemeLeafKind[] = Object.freeze([
  "number",
  "string",
]);

/** Every leaf the Theme declares as something other than a plain string. */
export const THEME_LEAF_KINDS: Readonly<Record<string, readonly ThemeLeafKind[]>> =
  Object.freeze({
  "charts.animateOnMount": BOOLEAN,
  "charts.mountDuration": NUMBER,
  "charts.showDots": BOOLEAN,
  "charts.useGradientFill": BOOLEAN,
  "chrome.accent.barThickness": NUMBER,
  "chrome.badge.countFontWeight": NUMBER_OR_STRING,
  "chrome.badge.disabledOpacity": NUMBER,
  "chrome.badge.fontWeight": NUMBER_OR_STRING,
  "chrome.badge.loadingOpacity": NUMBER,
  "chrome.badge.pulseScale": NUMBER,
  "chrome.badge.removeOpacity": NUMBER,
  "chrome.breadcrumb.fontWeight": NUMBER_OR_STRING,
  "chrome.card.hoverTint": BOOLEAN,
  "chrome.card.showBorder": BOOLEAN,
  "chrome.cardComponent.disabledOpacity": NUMBER,
  "chrome.cardComponent.loadingCoverOpacity": NUMBER,
  "chrome.cardComponent.loadingSkeletonOpacity": NUMBER,
  "chrome.cardComponent.stateOverlayActiveOpacity": NUMBER,
  "chrome.cardComponent.stateOverlayHoverOpacity": NUMBER,
  "chrome.cardComponent.stateOverlaySelectedOpacity": NUMBER,
  "chrome.cardComponent.textureOpacity": NUMBER,
  "chrome.cardComponent.titleFontWeight": NUMBER_OR_STRING,
  "chrome.controls.buttonGeometry.fontWeight": NUMBER_OR_STRING,
  "chrome.controls.disabled.opacity": NUMBER,
  "chrome.controls.fieldGeometry.fontWeight": NUMBER_OR_STRING,
  "chrome.controls.fieldGeometry.formFieldDisabledOpacity": NUMBER,
  "chrome.controls.fieldGeometry.labelFontWeight": NUMBER_OR_STRING,
  "chrome.controls.form.labelFontWeight": NUMBER_OR_STRING,
  "chrome.controls.input.addon.fontWeight": NUMBER_OR_STRING,
  "chrome.controls.input.disabledOpacity": NUMBER,
  "chrome.controls.input.helper.errorFontWeight": NUMBER_OR_STRING,
  "chrome.controls.input.placeholderOpacity": NUMBER,
  "chrome.controls.segmented.itemFontWeight": NUMBER_OR_STRING,
  "chrome.controls.segmented.itemFontWeightSelected": NUMBER_OR_STRING,
  "chrome.shell.gridOpacity": NUMBER,
  "chrome.sidebar.groupFontWeight": NUMBER_OR_STRING,
  "chrome.sidebar.itemFontWeight": NUMBER_OR_STRING,
  "chrome.sidebar.itemFontWeightActive": NUMBER_OR_STRING,
  "chrome.table.headerFontWeight": NUMBER_OR_STRING,
  "chrome.tabs.activeHighlightOpacity": NUMBER,
  "chrome.tabs.badgeFontWeight": NUMBER_OR_STRING,
  "chrome.tabs.disabledOpacity": NUMBER,
  "chrome.tabs.itemFontWeight": NUMBER_OR_STRING,
  "chrome.tabs.itemFontWeightActive": NUMBER_OR_STRING,
  "chrome.tabs.listTextureOpacity": NUMBER,
  "chrome.tooltip.zIndex": NUMBER_OR_STRING,
  "expressive.schemaVersion": NUMBER,
  "motion.countUpEnabled": BOOLEAN,
  "motion.durationScale": NUMBER,
  "motion.entranceDuration": NUMBER,
  "motion.hoverLift": NUMBER,
  "motion.hoverScale": NUMBER,
  "motion.intensity": NUMBER,
  "motion.springFriction": NUMBER,
  "motion.springTension": NUMBER,
  "motion.staggerDelay": NUMBER,
  "motion.staggerMax": NUMBER,
  "motion.useSpring": BOOLEAN,
  "recipes.schemaVersion": NUMBER,
  "responsive.schemaVersion": NUMBER,
  "surfaces.densityScale": NUMBER,
  "surfaces.effectIntensity": NUMBER,
  "surfaces.radiusScale": NUMBER,
  "surfaces.surface.useGlass": BOOLEAN,
  "surfaces.surface.useGradients": BOOLEAN,
  "typography.lineHeight.body": NUMBER,
  "typography.lineHeight.display": NUMBER,
  "typography.lineHeight.heading": NUMBER,
  "typography.lineHeight.relaxed": NUMBER,
  "typography.lineHeight.tight": NUMBER,
  "typography.roles.*.fontWeight": NUMBER_OR_STRING,
  "typography.roles.*.lineHeight": NUMBER_OR_STRING,
  "typography.scale": NUMBER,
  });

/**
 * Every leaf whose Theme declaration is a CLOSED union of string literals.
 *
 * A kind is not a domain. `appearance.defaultMode` and `surfaces.buttonStyle`
 * are both declared `string` by the kind map -- correctly, because a literal
 * union IS a string -- so an ingested `"potato"` passed every check the merge
 * had and reached the lowering, where it either painted an invented channel or
 * died much later inside whatever reader first called a string method on it.
 * The option domain is what refuses it at the boundary that owns the contract.
 *
 * Open leaves are deliberately absent: a declaration that widens to `string`,
 * or that puts a `number` beside its literals, is the contract saying the
 * value set is not closed, and this map must never narrow one.
 *
 * `themes/iso/tests/leaf-schema.test.ts` re-derives these domains from the same
 * TypeScript declarations it re-derives the kinds from and compares them
 * exactly, so a renamed, added or removed option turns that test red rather
 * than leaving the runtime refusing a legal value.
 */
export const THEME_LEAF_OPTIONS: Readonly<Record<string, readonly string[]>> =
  Object.freeze({
  "appearance.defaultMode": Object.freeze(["dark", "light"]),
  "capabilities.*.reason": Object.freeze(["not-authored", "pending-selection", "superseded"]),
  "capabilities.*.status": Object.freeze(["active", "disabled", "unassigned"]),
  "charts.colorScheme": Object.freeze(["accessible", "default", "monochrome", "pastel", "vibrant"]),
  "charts.lineStyle": Object.freeze(["sharp", "smooth", "step"]),
  "charts.tooltipStyle": Object.freeze(["detailed", "glass", "minimal"]),
  "chrome.accent.badgeShape": Object.freeze(["pill", "rounded", "square"]),
  "chrome.accent.barPosition": Object.freeze(["left", "none", "top"]),
  "chrome.accent.barStyle": Object.freeze(["animated", "gradient", "solid"]),
  "chrome.accent.dividerStyle": Object.freeze(["dashed", "dotted", "none", "solid"]),
  "chrome.accent.iconContainerShape": Object.freeze(["circle", "none", "rounded", "square"]),
  "chrome.card.defaultElevation": Object.freeze(["lg", "md", "sm"]),
  "chrome.card.hoverElevation": Object.freeze(["lift-one", "lift-two", "none"]),
  "chrome.card.paddingDensity": Object.freeze(["compact", "normal", "spacious"]),
  "chrome.cardComponent.anatomy": Object.freeze(["default", "framed", "ghost", "underline"]),
  "chrome.controls.buttonGeometry.groupMobileDirection": Object.freeze(["column", "row"]),
  "chrome.layout.anatomy": Object.freeze(["default", "flat", "floating"]),
  "chrome.sidebar.anatomy": Object.freeze(["default", "panel", "rail"]),
  "chrome.sidebar.tone": Object.freeze(["inverse", "strong", "subtle"]),
  "chrome.table.anatomy": Object.freeze(["default", "open", "ruled", "zebra"]),
  "motion.ambient": Object.freeze(["off", "subtle"]),
  "motion.entrance": Object.freeze(["bounce", "fade", "none", "slideUp", "spring"]),
  "motion.pulseSpeed": Object.freeze(["fast", "none", "normal", "slow"]),
  "motion.skeletonStyle": Object.freeze(["pulse", "shimmer", "wave"]),
  "surfaces.buttonStyle": Object.freeze(["pill", "sharp", "soft"]),
  "surfaces.density": Object.freeze(["comfortable", "compact", "normal", "spacious"]),
  "surfaces.elevation": Object.freeze(["elevated", "flat", "soft"]),
  "surfaces.focusStyle": Object.freeze(["glow", "ring", "underline"]),
  "surfaces.rhythm": Object.freeze(["airy", "normal", "tight"]),
  "surfaces.stateEmphasis": Object.freeze(["medium", "strong", "subtle"]),
  "typography.headingWeightBias": Object.freeze(["heavier", "lighter", "normal"]),
  "typography.labelStyle": Object.freeze(["capitalize", "sentence", "uppercase"]),
  "typography.roles.*.textTransform": Object.freeze(["capitalize", "lowercase", "none", "uppercase"]),
  "typography.typePairing": Object.freeze(["editorial", "geometric", "sober", "technical"]),
  });

/**
 * Keypaths whose value the Theme declares as `unknown`, where no kind can be
 * refused. Empty since `engineBridge` — the only such family — was retired:
 * every Theme leaf now has a declared kind.
 */
export const THEME_ANY_LEAF_PATTERNS: readonly string[] = Object.freeze([]);

/** The kind every leaf carries unless the map above says otherwise. */
export const THEME_DEFAULT_LEAF_KINDS = STRING;

/**
 * Normalize a merge keypath into the spelling this schema is keyed by.
 *
 * Three rewrites, each of them a fact about the Theme rather than a
 * convenience: `$` is the merge's root marker; a mode overlay mirrors the root
 * families, so `modes.dark.chrome.card.hoverTint` IS `chrome.card.hoverTint`;
 * and a `Governed<T>` family is spelled with and without its `value` wrapper
 * depending on the transport (`migrateV1` wraps, a leaf-built probe patch does
 * not), so the wrapper is dropped rather than doubled in the map.
 */
const GOVERNED_FAMILIES: ReadonlySet<string> = new Set([
  "motion",
  "charts",
  "recipes",
  "expressive",
  "responsive",
]);

export function normalizeThemeLeafPath(path: string): string {
  const segments = path
    .replace(/\[\d+\]/g, "[]")
    .split(".")
    .filter((segment) => segment.length > 0 && segment !== "$");
  if (segments[0] === "modes" && segments.length > 2) segments.splice(0, 2);
  if (
    segments.length > 1 &&
    GOVERNED_FAMILIES.has(segments[0]!) &&
    segments[1] === "value"
  ) {
    segments.splice(1, 1);
  }
  return segments.join(".");
}

function matchesPattern(pattern: string, segments: readonly string[]): boolean {
  const parts = pattern.split(".");
  if (parts.length !== segments.length) return false;
  return parts.every((part, index) => part === "*" || part === segments[index]);
}

/** An exact keying, then the wildcard patterns, against one declaration map. */
function declaredFor<T>(
  map: Readonly<Record<string, T>>,
  normalized: string
): T | undefined {
  if (Object.prototype.hasOwnProperty.call(map, normalized)) return map[normalized];
  const segments = normalized.split(".");
  for (const [pattern, declared] of Object.entries(map)) {
    if (pattern.includes("*") && matchesPattern(pattern, segments)) return declared;
  }
  return undefined;
}

/**
 * The kinds admissible at one merge keypath, or `null` where the Theme
 * declares an opaque value and no kind can be refused.
 */
export function themeLeafKinds(path: string): readonly ThemeLeafKind[] | null {
  const normalized = normalizeThemeLeafPath(path);
  if (Object.prototype.hasOwnProperty.call(THEME_LEAF_KINDS, normalized)) {
    return THEME_LEAF_KINDS[normalized]!;
  }
  const segments = normalized.split(".");
  for (const pattern of THEME_ANY_LEAF_PATTERNS) {
    if (matchesPattern(pattern, segments)) return null;
  }
  return declaredFor(THEME_LEAF_KINDS, normalized) ?? THEME_DEFAULT_LEAF_KINDS;
}

/**
 * The closed option domain at one merge keypath, or `null` where the Theme
 * leaves the value set open.
 */
export function themeLeafOptions(path: string): readonly string[] | null {
  return declaredFor(THEME_LEAF_OPTIONS, normalizeThemeLeafPath(path)) ?? null;
}
