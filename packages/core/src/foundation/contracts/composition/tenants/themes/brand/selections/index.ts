/**
 * Governed recipe-profile selection (DS-S001). The id must exist in the
 * closed first-party registry
 * (`foundation/tokens/ts/presentation/recipe-profiles`); the compiler
 * validates fail-closed, so an unknown id or foreign schema version compiles
 * to engine defaults instead of painting garbage. Contracts stay `string`
 * here because foundation contracts cannot depend on the registry module.
 */
export interface BrandRecipeSelection {
  /** Selection-contract version; see RECIPE_PROFILE_SCHEMA_VERSION. */
  schemaVersion: number;
  /** Namespaced versioned id, e.g. `rottay/technical-sharp@1`. */
  profile: string;
}

/**
 * Governed responsive-posture selection (E2) — the static counterpart of the
 * document's `visualFoundation.advanced.responsivePosture`, so a vertical can
 * author the ladder its product actually needs without a DB row. The id must
 * exist in the closed registry
 * (`foundation/tokens/ts/presentation/responsive-postures`); the runtime
 * resolves fail-closed to the baseline ladder. `string` here for the same
 * reason as `BrandRecipeSelection.profile`: foundation contracts cannot depend
 * on the registry module.
 */
export interface BrandResponsiveSelection {
  /** Selection-contract version; see RESPONSIVE_POSTURE_SCHEMA_VERSION. */
  schemaVersion: number;
  /** Bare registry id: `compact`, `balanced` or `expansive`. */
  posture: string;
}

/**
 * Explicit per-axis expressive overrides layered over the selected
 * experience profile. Values stay `string` for the same reason as
 * `BrandRecipeSelection.profile`: contracts cannot depend on the registry
 * module, so the compilers sanitize every axis against the closed
 * vocabularies fail-closed (an unknown value is dropped, never painted).
 */
export interface BrandExpressiveAxisOverrides {
  type?: string;
  geometry?: string;
  edge?: string;
  material?: string;
  elevation?: string;
  motif?: string;
  /** Declared vocabulary; carries no v1 expansion rows (not open yet). */
  icon?: string;
}

/**
 * Governed expressive-profile selection (C1b). A theme SELECTS a versioned
 * experience id and may override individual axes; it never authors profile
 * content. Resolution is fail-closed against the closed registry in
 * `foundation/tokens/ts/presentation/expressive-profiles`.
 */
export interface BrandExpressiveSelection {
  /** Selection-contract version; see EXPRESSIVE_PROFILE_SCHEMA_VERSION. */
  schemaVersion: number;
  /** Namespaced versioned id, e.g. `rottay/bithire-technical@1`. */
  experienceProfile?: string;
  /** Explicit per-axis overrides; each axis wins over the experience id. */
  profiles?: BrandExpressiveAxisOverrides;
}

/**
 * Mode posture of the palette a FlatTheme actually authors.
 *
 * A theme declares one default mode and its values ARE that mode: bithire and
 * evnto author light palettes, rottay authors a dark one. The compiler emits
 * `color-scheme: <defaultMode>` on the base block so form controls, scrollbars
 * and the UA canvas agree with the paint, and the root-state contract resolves
 * a `data-theme` of `base` (or absent) through this field instead of assuming
 * light. Non-default-mode values are authored as declared mode blocks.
 */
export interface BrandAppearance {
  defaultMode: "light" | "dark";
}
