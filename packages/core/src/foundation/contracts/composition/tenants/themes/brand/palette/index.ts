/** Palette roles that carry a `--ds-color-{role}-{50..900}` ramp. */
export type BrandRampRole =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

/** The nine steps of a ramp, plus the 50 tint. */
export type BrandRampStep =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

/** Hand-authored ramp steps for one role. Absent steps stay derived. */
export type BrandColorRamp = Partial<Record<BrandRampStep, string>>;

/**
 * Ramp steps authored by hand instead of derived from the role's seed.
 *
 * `deriveTenantColorRamps` turns one seed into a perceptually even ramp, which
 * is what a tenant with no design capacity should get. A brand that HAS tuned
 * its ramp could not express it: the seed field owned all ten steps, so the
 * only way to ship hand values was a stylesheet block outside the contract —
 * which is precisely the duplicate authority this contract exists to remove.
 * An authored step wins over the derived one; the rest of the ramp keeps
 * deriving. `neutral` has no seed of its own and is therefore authored-only.
 */
export type BrandColorRamps = Partial<Record<BrandRampRole, BrandColorRamp>>;

export interface BrandPalette {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  /** Hand-authored ramp steps; anything absent stays derived from the seed. */
  ramps?: BrandColorRamps;
  /** Hover state of the primary seed. */
  primaryHoverColor?: string;
  /** Hover state of the secondary seed. */
  secondaryHoverColor?: string;
  /** Hover state of the accent seed. */
  accentHoverColor?: string;
  /** Ink that stays legible ON the primary color. */
  onPrimaryColor?: string;
  /** Ink for solid primary surfaces (Badge and every filled primary fill). */
  primaryForegroundColor?: string;
  /** Global reading ink used on the tenant canvas and neutral surfaces. */
  textPrimaryColor?: string;
  /** Supporting copy that must remain readable at normal text sizes. */
  textSecondaryColor?: string;
  /** Quiet metadata/captions; still expected to meet accessible text contrast. */
  textMutedColor?: string;
  /** The third ink step, between muted and disabled. */
  textTertiaryColor?: string;
  /** Disabled ink. Components remain responsible for non-color disabled cues. */
  textDisabledColor?: string;
  /** Default neutral separator on cards, controls, rows and page regions. */
  borderPrimaryColor?: string;
  /** Quieter nested separator used inside already-bounded surfaces. */
  borderSecondaryColor?: string;
  /** The unqualified separator token components fall back to. */
  borderColor?: string;
  /** Third separator step for deeply nested bounded surfaces. */
  borderTertiaryColor?: string;
  /** The quietest separator: a hairline that reads as texture, not structure. */
  borderSubtleColor?: string;
  /** Separator of the focused control. Not the focus ring itself. */
  borderFocusColor?: string;
  /**
   * The page ground of the mode this palette authors. Reaches
   * `--ds-color-bg-primary`, `--ds-color-bg` and `--ds-color-background`.
   *
   * There is no `dark`-prefixed twin. A palette authors exactly one mode --
   * the theme's `appearance.defaultMode` at the top level, or the overlay's
   * own mode inside `modes.{light,dark}` -- so "the ground" is never
   * ambiguous and never needs a second field to disambiguate it. Without this
   * field a tenant cannot choose the surface its product sits on, which is
   * the most visible thing a white-label system owns.
   */
  backgroundColor?: string;
  /** The ground one step off the page: panels, wells, quiet bands. */
  backgroundSecondaryColor?: string;
  /** The ground two steps off the page. */
  backgroundTertiaryColor?: string;
  /** The ground of a surface that reads as lifted (menus, popovers, cards). */
  backgroundElevatedColor?: string;
  /** The ground of a bounded content surface. */
  backgroundSurfaceColor?: string;
  /** The scrim drawn over the page behind a modal or drawer. */
  backgroundOverlayColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  /** Ground of a success surface (alert/banner/tag fill). */
  successBgColor?: string;
  /** Separator of a success surface. */
  successBorderColor?: string;
  /** Ground of a warning surface. */
  warningBgColor?: string;
  /** Separator of a warning surface. */
  warningBorderColor?: string;
  /** Ground of an error surface. */
  errorBgColor?: string;
  /** Separator of an error surface. */
  errorBorderColor?: string;
  /** Ground of an informational surface. */
  infoBgColor?: string;
  /** Separator of an informational surface. */
  infoBorderColor?: string;
  /**
   * Ink written ON an informational surface. Defaults to `infoColor` in the
   * base layer; a dark mode that keeps the accent readable against a tinted
   * ground overrides it independently.
   */
  infoInkColor?: string;
  /** Link ink at rest. */
  linkColor?: string;
  /** Link ink on hover. */
  linkHoverColor?: string;
  /** Link ink once visited. */
  linkVisitedColor?: string;
  /** Ground an interactive affordance takes on hover. */
  interactiveBgHoverColor?: string;
  /** Ground an interactive affordance takes while active/pressed. */
  interactiveBgActiveColor?: string;
  /**
   * Translucent wash steps. These are the tint/scrim layers a skin paints ON
   * a ground rather than a ground themselves, so they carry an alpha channel
   * by construction and cannot be derived from an opaque seed without knowing
   * what sits underneath.
   */
  alphaBlack50?: string;
  alphaBlack100?: string;
  alphaWhite50?: string;
  alphaPrimary10?: string;
  alphaPrimary20?: string;
  alphaSecondary10?: string;
  alphaSecondary20?: string;
  alphaSuccess10?: string;
  alphaSuccess20?: string;
  alphaWarning10?: string;
  alphaWarning20?: string;
  alphaError10?: string;
  alphaError20?: string;
  alphaInfo10?: string;
  /** Ground a neutral region takes on hover. */
  bgHoverColor?: string;
  /** Ground of an informational region, on the `--ds-color-bg-*` spelling. */
  bgInfoColor?: string;
  /** The quietest ground step off the page. */
  bgSubtleColor?: string;
  /**
   * Step 0 of the neutral ramp. A dark-first theme inverts this end of the
   * ramp, so it is authored rather than derived from the light-mode white.
   */
  neutralZeroColor?: string;
  /** The primary seed at wash strength, used for selected/active grounds. */
  primarySubtleColor?: string;
  /** The tint every elevation shadow is mixed from. */
  shadowColor?: string;
  /** Ground of a bounded content surface, on the `--ds-color-surface` name. */
  surfaceColor?: string;
  /** Quieted content surface. */
  surfaceMutedColor?: string;
  /** Second content surface step. */
  surfaceSecondaryColor?: string;
  /** Reading ink on the `--ds-color-text` name. */
  textColor?: string;
  /** Ink that stays legible on an inverted ground. */
  textInverseColor?: string;
  /** Kit row 3. `neutral` is the achromatic resting position. */
  neutralTemperature?: "cool" | "neutral" | "warm";
  /** Kit row 4. `standard` is the resting posture. */
  contrastPosture?: "soft" | "standard" | "high";
  /**
   * Component-facing alias channels. These are separate CSS names from the
   * semantic palette above (`--ds-text-primary` is not `--ds-color-text-primary`),
   * and a theme that moves one without the other is making two decisions, so
   * they get their own typed leaves instead of being folded into the semantic
   * field they usually track.
   */
  aliases?: BrandPaletteAliases;
}

/**
 * The unprefixed `--ds-text-*` / `--ds-border-color*` alias namespace.
 *
 * Every one of these has a `:root` floor in the DS theme that forwards to the
 * semantic palette. A tenant that authors here overrides the forward, which is
 * exactly what a skin whose ink ladder differs from its semantic ladder needs.
 */
export interface BrandPaletteAliases {
  textPrimary?: string;
  textSecondary?: string;
  textDisabled?: string;
  borderColorDefault?: string;
  borderColorMuted?: string;
  borderColorStrong?: string;
  borderColorHover?: string;
  borderColorFocus?: string;
}
