import type { TenantMotionDial } from "../../../../runtime/motion";

/**
 * Code-owned presentation recipes a tenant theme may select.
 *
 * A profile selects a reviewed DS presentation posture; it does not open a
 * tenant-authored CSS, component-topology, icon-glyph or motion-recipe channel.
 */
/**
 * Safe, high-signal customization for most tenant admins.
 *
 * Every field in this interface has a real runtime consumer. Fields that
 * were declared but never wired have been removed or narrowed:
 * - typography.scale and shape.radiusScale resolve through the calc()-wrapped
 *   ramp definitions (`--ds-type-scale` / `--ds-radius-scale` multipliers)
 * - motion is deliberately bounded to a semantic dial; arbitrary timing,
 *   springs, keyframes and topology remain owned by the vertical envelope
 * - media (logo/logoMark/favicon): removed (no CSS reader — re-add when
 *   sidebar/header components consume --ds-tenant-logo vars)
 * - data.chartColorFamily: removed (no chart palette system)
 */
export interface TenantAppearanceGeneral {
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    /** Clear-scheme page canvas. Advanced remains available for nested surfaces. */
    background?: string;
    /** Global reading hierarchy for ordinary tenant-authored surfaces. */
    foreground?: {
      primary?: string;
      secondary?: string;
      muted?: string;
      disabled?: string;
    };
    /** Neutral separator hierarchy; component-specific borders stay in chrome. */
    border?: {
      primary?: string;
      secondary?: string;
    };
    /**
     * Status tone seeds. VOCABULARIO CERRADO: estas cuatro y ninguna mas.
     *
     * Agrupadas en un sub-objeto y no como hermanas de `primary` por la misma
     * gramatica que ya usan `foreground` y `border`: agrupar por eje hace el
     * vocabulario cerrado VISIBLE en el tipo, de modo que una quinta clave no
     * compila en vez de descubrirse en runtime.
     *
     * `neutral` NO vive aqui y no es un olvido: no tiene semilla en ninguna via
     * (`neutral has no seed of its own and is therefore authored-only`), asi que
     * darle un dial seria una perilla que no mueve nada. Su adjudicacion subio
     * al owner; hasta que vuelva, se gobierna dentro de `palette.seeds`.
     *
     * Sin gemelo en `dark`: el modo oscuro de estas semillas es un lote propio
     * con su propio cero-delta, y `dark.status` se rechaza fail-closed.
     */
    status?: {
      success?: string;
      warning?: string;
      error?: string;
      info?: string;
    };
    /**
     * The two palette POSTURES (kit rows 3 and 4). No `dark` twin: they state
     * the whole neutral axis, so a per-mode variant would be a second axis.
     */
    neutralTemperature?: "cool" | "neutral" | "warm";
    contrastPosture?: "soft" | "standard" | "high";
    /** Feeds ThemeProvider theme resolution (not a CSS variable). */
    backgroundMode?: "light" | "dark" | "auto";
    /**
     * Optional dark-scheme seeds. Under backgroundMode `auto` they enable
     * dual-ramp `light-dark()` emission; under `light`/`dark` they are inert
     * so single-mode tenants keep their deterministic single-value artifact.
     */
    dark?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      foreground?: {
        primary?: string;
        secondary?: string;
        muted?: string;
        disabled?: string;
      };
      border?: {
        primary?: string;
        secondary?: string;
      };
    };
  };
  typography?: {
    fontFamilyBase?: string;
    fontFamilyHeading?: string;
    /**
     * No pairing expands into the display role, so this is the only way it
     * reaches `--ds-font-family-display`; absent, the floor forwards to base.
     */
    fontFamilyDisplay?: string;
    /**
     * Compiler-owned font pairing preset applied before the free-form
     * families; explicit fontFamilyBase/Heading always win.
     */
    typePairing?: "sober" | "editorial" | "geometric" | "technical";
    /** Multiplies the font-size ramp through `--ds-type-scale`. */
    scale?: number;
    /**
     * Kit row 9: the weight posture the role vocabulary wears. Lowers through
     * `derivation/typography/weights` onto the two ladder channels AND the nine
     * `--ds-type-<role>-font-weight` channels.
     */
    roleWeights?: "light" | "regular" | "strong";
    /**
     * Kit row 10: the figure posture the role vocabulary wears. Lowers through
     * `derivation/typography/numeric` onto the nine
     * `--ds-type-<role>-font-variant-numeric` channels.
     */
    numeric?: "proportional" | "tabular";
  };
  shape?: {
    buttonStyle?: "sharp" | "soft" | "pill";
    /** Multiplies the radius ramp through `--ds-radius-scale`. */
    radiusScale?: number;
    /**
     * Kit row 12: the nested-radius law. Lowers through
     * `derivation/shape/nesting` onto the two operands of the concentric
     * derivation every nesting surface already reads.
     */
    nesting?: "concentric" | "uniform";
    /**
     * Kit row 14: the control-height posture. Lowers through
     * `derivation/shape/control-height` onto `--ds-control-height-scale`,
     * which every control family multiplies beside the density scale.
     */
    controlHeight?: "compact" | "standard" | "tall";
  };
  /** Semantic spacing mode shared by CSS and numeric useTokens consumers. */
  density?: "compact" | "normal" | "spacious";
  /**
   * Layout rhythm posture, emitted as `--ds-rhythm-scale`.
   *
   * A SECOND, orthogonal spacing axis, not a restatement of `density`:
   * density scales control SIZES, rhythm scales the space BETWEEN them. Both
   * factors can appear in one chain without double-counting, because they
   * multiply different things. Rhythm never reaches a control height or a
   * touch target, so the coarse-pointer floors hold by construction.
   *
   * Absent → `normal` (factor 1), byte-identical to today.
   */
  rhythm?: "tight" | "normal" | "airy";
  /**
   * Tenant-owned motion preference. Values are clamped by the runtime policy;
   * tenants cannot inject choreography, loops, keyframes or spring physics.
   *
   * `character` (kit row 23) rides the same group without entering
   * `TenantMotionDial`: the dial is the three bounded SPEED inputs and its key
   * set is closed by `MOTION_DIAL_KEYS`, which the `motion.dial` decision is
   * judged against. Widening that type would let one decision's domain answer
   * for another's.
   */
  motion?: TenantMotionDial & {
    character?: "mechanical" | "organic" | "playful";
  };
  /**
   * The two interaction-state decisions (kit rows 20 and 21). Emphasis is the
   * delta every state expresses; focus is the signature every focusable
   * surface wears. Both lower through `derivation/states`.
   */
  states?: {
    emphasis?: "subtle" | "medium" | "strong";
    focusStyle?: "ring" | "underline" | "glow";
  };
  surfaces?: {
    elevation?: "flat" | "soft" | "elevated";
    /**
     * Coordinated visual-detail dial consumed by every Modern material.
     * `0` produces flat operational chrome; `1` enables the full reviewed
     * gradient, glass, glow and texture layer. The tenant compiler clamps it
     * to both the global safety bounds and the owning vertical envelope.
     */
    effectIntensity?: number;
    /**
     * Kit row 18: the keyline weight every bounded surface wears. Lowers
     * through `derivation/elevation/border` onto the three
     * `--ds-edge-*-width` roles, independently of the elevation posture above.
     */
    borderStyle?: "none" | "hairline" | "strong";
  };
  navigation?: {
    sidebarTone?: "subtle" | "strong" | "inverse";
  };
  /**
   * Governed experience-profile selection (C1b): one namespaced versioned id
   * from the closed first-party registry, e.g. `rottay/management-editorial@1`.
   * The schema closes the enum over published ids and the compilers revalidate
   * fail-closed; the value never carries CSS or profile content.
   */
  experienceProfile?: string;
}
