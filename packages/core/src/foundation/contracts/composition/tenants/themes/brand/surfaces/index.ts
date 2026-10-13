import type {
  SurfaceTokens,
  SemanticSurfaceRoleMap,
} from "../../../../../kernel/tokens";
import type {
  TenantGlassTokens,
  TenantGradientTokens,
  TenantOverlayStrengths,
  TenantOverlayTokens,
} from "../../..";

export interface BrandSurfaces {
  /** Governed button silhouette shared by static and DB Theme transports. */
  buttonStyle?: "sharp" | "soft" | "pill";
  /** Bounded multiplier for the canonical radius ramp. */
  radiusScale?: number;
  /** Governed elevation posture; values lower through the shared posture table. */
  elevation?: "flat" | "soft" | "elevated";
  surface?: Partial<SurfaceTokens>;
  /** Coordinated semantic surface roles shared by every component family. */
  surfaceRoles?: SemanticSurfaceRoleMap;
  /**
   * Schema-v1 spelling of `surfaceRoles`, admitted and read when
   * `surfaceRoles` is absent so stored theme documents keep resolving.
   * New static themes and DB payloads author `surfaceRoles`.
   */
  materials?: SemanticSurfaceRoleMap;
  /** `full` is the pill/circle radius, not a fifth step of the scale. */
  borderRadius?: Partial<Record<"sm" | "md" | "lg" | "xl" | "full", string>>;
  shadows?: Partial<
    Record<
      | "xs"
      | "sm"
      | "md"
      | "lg"
      | "xl"
      | "xxl"
      | "inner"
      | "focusRing"
      | "focusRingError",
      string
    >
  >;
  /**
   * The closed `--ds-elevation-0..5` ladder.
   *
   * Distinct from `elevation`, which selects a governed posture preset: this
   * is the ladder itself. A dark-first skin cannot reach its shadow stack
   * through the posture table, because a shadow that reads on a light ground
   * is not the same expression tinted differently — it carries an inset top
   * light the light-mode ladder has no term for.
   */
  elevations?: Partial<
    Record<
      "level0" | "level1" | "level2" | "level3" | "level4" | "level5",
      string
    >
  >;
  glass?: TenantGlassTokens;
  gradients?: TenantGradientTokens;
  overlays?: TenantOverlayTokens;
  overlayStrength?: TenantOverlayStrengths;
  densityScale?: number;
  /**
   * Semantic density posture for a code-owned static vertical: the FlatTheme
   * equivalent of `appearance.general.density`, resolved through the same
   * canonical factor table and emitted on the same `--ds-density-mode-factor`
   * channel. Without it a static vertical has a structural `densityScale` but
   * no posture authority at all, so a root `data-density` boundary is its only
   * semantic source.
   *
   * This is the semantic axis, NOT the structural one: `densityScale` remains
   * the independent white-labelable brand multiplier and must never be
   * reinterpreted as a posture — that would apply one brand decision twice.
   */
  density?: "compact" | "comfortable" | "normal" | "spacious";
  /**
   * Premium effect-intensity dial. Emitted as `--ds-effect-intensity` and
   * multiplies the gradient/glass/glow layer (engines/modern spec section 5):
   * `1` = full Quiet Premium (DS/rottay default), `0` = flat/zero-decoration.
   * First-party verticals may choose a restrained nonzero value; customer
   * tenant overrides remain bounded by their compiled policy. Defaults to `1`.
   */
  effectIntensity?: number;
  /**
   * Layout rhythm posture: the FlatTheme equivalent of `appearance.rhythm`,
   * resolved through the same `TENANT_THEME_RHYTHM_FACTORS` table and emitted
   * on the same `--ds-rhythm-scale` channel.
   *
   * ORTHOGONAL to `density`/`densityScale` and never a restatement of them.
   * Density owns how big a control is; rhythm owns how much room sits between
   * controls. `airy` on a compact vertical is a coherent, deliberate posture:
   * small controls with generous breathing room. Rhythm reaches only gap and
   * layout-padding chains, never a control height or touch target, so the
   * coarse-pointer floors are untouched by construction.
   *
   * Absent → `normal` (factor 1), which is byte-identical to today.
   *
   * The posture vocabulary is spelled out here rather than imported because
   * `tenant-theme` already imports this module; the union mirrors `density`
   * above. The MULTIPLIERS have exactly one source,
   * `TENANT_THEME_RHYTHM_FACTORS`.
   */
  rhythm?: "tight" | "normal" | "airy";
  /**
   * Interaction-state emphasis: how far a resting ground travels toward the
   * brand when a surface is hovered, pressed, selected or disabled.
   *
   * A CHARACTER decision, not a value: it moves `--ds-state-*`, and every
   * material root expresses its state facets in terms of those deltas, so one
   * posture reaches every family instead of the ~370 per-component channels
   * F-10 measured. Absent -> `medium`, which is byte-identical to the
   * foundation defaults that predate the decision.
   *
   * The vocabulary is spelled out here rather than imported because
   * `contracts/theme/foundation/decisions` already imports this module; its
   * `STATE_EMPHASIS_POSTURES` is the closed list and the catalog test compares
   * the two.
   */
  stateEmphasis?: "subtle" | "medium" | "strong";
  /**
   * Focus signature: the shape of the affordance every focusable surface
   * wears. Moves `--ds-focus-ring` and its two operands; absent -> `ring`,
   * the double ring the interaction contract already specifies.
   */
  focusStyle?: "ring" | "underline" | "glow";
  /**
   * Kit row 18: the weight of the keyline every bounded surface wears.
   *
   * DIRECT authorship of the three border-width ROLES
   * (`--ds-edge-{hairline,standard,emphasis}-width`), which is what a tenant
   * who wanted borderless chrome used to have to buy a shadow posture for.
   * No border style is stated here: a `0px` role width already draws nothing,
   * and the style token the skins compose beside these widths is
   * `--ds-edge-standard-style`, owned by the expressive `edge` axis.
   *
   * Structural `--ds-border-width-{0,1,2,4,8}` scale tokens stay untouched --
   * this posture modulates roles, never the scale -- and selection, error and
   * focus borders ride their own state channels, so no value here can make a
   * state border-only invisible.
   *
   * Absent -> the expressive `edge` axis default, byte-identical to today.
   */
  borderStyle?: "none" | "hairline" | "strong";
  /**
   * Kit row 12: whether a surface nested inside another steps its corner down
   * to stay concentric with the parent, or keeps the parent's own corner.
   *
   * The DS already derives a nested corner as `parent - inset`, where the inset
   * is the smaller of the container's padding and the larger of a governed
   * floor and half the parent radius. This decision states the two operands of
   * that derivation, so one word moves every surface that nests instead of a
   * per-family radius override: `concentric` restates today's law and
   * `uniform` zeroes both operands, which makes the nested corner equal the
   * parent's.
   *
   * Absent -> the derivation's own fallbacks, byte-identical to today.
   */
  nesting?: "concentric" | "uniform";
  /**
   * Kit row 14: how tall an interactive control stands, across every control
   * family at once.
   *
   * ORTHOGONAL to `density`, and deliberately a second factor rather than a
   * re-reading of the first: density scales control size AND the gaps around
   * it, this scales the control height only. A compact product with tall
   * controls is a coherent posture, and it is unreachable through `density`.
   *
   * Emitted as `--ds-control-height-scale` and multiplied in beside
   * `--ds-density-effective-scale` at the point every control family already
   * resolves its height, so the vertical's own size ramp is shifted rather
   * than replaced. The mechanical pointer-target floors still clamp the
   * result: a posture may not take a control below its minimum hit area.
   *
   * Absent -> factor 1, byte-identical to today.
   */
  controlHeight?: "compact" | "standard" | "tall";
}
