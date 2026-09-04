/**
 * @fileoverview The palette/typography/surface channel assembly for one theme.
 *
 * @module Compilers/Theme/Lowering/Runtime/variables
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  TENANT_THEME_RHYTHM_FACTORS,
  TENANT_THEME_RHYTHM_SCALE_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { deriveChartSeriesPalette } from "@/foundation/kernel/color/oklch/chart-series";
import type { RampSurface } from "@/foundation/kernel/color/oklch/ramp";
import { withArabicSafeFallback } from "@/foundation/kernel/typography";
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import {
  expandExpressiveProfiles,
  expressiveTypeRoleOverlay,
} from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import { isHexColor } from "@/infrastructure/compilers/kernel/foundation/css/color-math";
import { derivePaletteSemantics } from "@/infrastructure/compilers/kernel/foundation/css/color-math/palette-derivations";
import {
  ON_TONE_ROLES,
  deriveReadableInk,
  onToneChannel,
} from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import {
  DARK_DEFAULT_GROUND,
  LIGHT_DEFAULT_GROUND,
  brandThemeRampSurface,
} from "../../foundation/ground";
import { semanticSurfaceRolesToCssVariables } from "../../foundation/materials";
import { setMotionVariables } from "../../foundation/motion";
import {
  deriveExtendedPaletteFloor,
  deriveStatusTintFloor,
  setExtendedPaletteVariables,
} from "../../foundation/palette";
import { deriveTenantColorRamps } from "../../foundation/ramps";
import { omitUndefined } from "../../foundation/shape";
import { setTintScaleVariables } from "../../foundation/tint";
import { setTypeRampVariables } from "../../foundation/type-ramp";
import { setSemanticTypographyVariables } from "../../foundation/typography";

/**
 * Compile one BrandTheme block.
 *
 * `surface` is the mode the block is FOR. It defaults to the theme's declared
 * default mode, and `compileModeBlocks` passes the overlay's own mode when it
 * re-enters with a merged theme — so a light overlay on a dark-default theme
 * derives its ramp against a light surface rather than inheriting the base
 * theme's. All three first-party verticals pin every derivable role in their
 * overlays today, so threading it is zero-delta on the committed artifacts and
 * only decides what an UNPINNED overlay role derives to.
 */
export function brandThemeToCssVariables(
  bt: BrandTheme,
  surface: RampSurface = brandThemeRampSurface(bt),
  tenantPosture?: AppearancePostureFields,
  // E-2: the floor's second half -- the tenant's OWN typography slice.
  tenantTypography?: BrandTheme["typography"]
): Record<string, string> {
  // C1b expressive expansion — resolved HERE (not in the orchestration) so
  // compileModeBlocks, which re-invokes this function per authored mode
  // overlay, re-expands automatically and every mode block sees the same
  // profile layer. Fail-closed: an invalid selection expands to nothing.
  const expressiveAxes = resolveExpressiveAxes(
    bt.expressive?.experienceProfile,
    sanitizeExpressiveOverrides(bt.expressive?.profiles),
    bt.expressive?.schemaVersion
  );
  const expansion = expandExpressiveProfiles(expressiveAxes);

  // A compiled BrandTheme is the complete static baseline for a first-party
  // product. Keep the three ramp axes explicit in that artifact instead of
  // relying on the consumer-side `var(--ds-*-scale, 1)` fallbacks: a DB
  // TenantTheme artifact emits the same canonical properties, so both sides
  // of the cascade remain observable and comparable without a second app-side
  // theme channel. Type and radius are neutral until a bounded appearance
  // override retunes them; density preserves the authored BrandTheme value.
  const vars: Record<string, string> = {
    "--ds-type-scale": "1",
    "--ds-radius-scale": "1",
    "--ds-density-scale": String(bt.surfaces?.densityScale ?? 1),
  };
  // Static/DB parity for the rhythm axis (E1): the SAME factor table the
  // appearance compiler uses lowers `surfaces.rhythm` here, so a static
  // vertical and a DB tenant authoring the same word get the same scale.
  // Absent -> no emission (the :root seed 1 governs; zero-delta).
  //
  // FAILING CLOSED IS PART OF THE PARITY, not an extra. `BrandTheme` is typed,
  // but it is also plain data by the time it reaches this compiler — it
  // crosses the RSC/JSON boundary and arrives through the compatibility
  // `TenantConfig.brandTheme` field, where no type survives. A bare bracket
  // read of the factor table therefore resolves INHERITED members:
  // `rhythm: 'toString'` returned a function and emitted its source text into
  // the channel, `'__proto__'` emitted `[object Object]`, and an object whose
  // `toString()` says `'tight'` was silently accepted by key coercion. Any of
  // those makes `clamp(0.8, var(--ds-rhythm-scale, 1), 1.25)` invalid at
  // computed-value time for every consumer of the effective channel — the
  // opposite of the documented "absent behaves like the pre-rhythm cascade".
  // The DB path rejects all of them at document validation, so an own-property
  // + numeric guard is what makes the two ingress paths fail closed the same
  // way. The clamp mirrors the DB lowering for the same reason: one envelope,
  // both paths, even though the three canonical postures sit inside it.
  const authoredRhythm = bt.surfaces?.rhythm;
  if (
    typeof authoredRhythm === "string" &&
    Object.prototype.hasOwnProperty.call(
      TENANT_THEME_RHYTHM_FACTORS,
      authoredRhythm
    )
  ) {
    const rhythmFactor =
      TENANT_THEME_RHYTHM_FACTORS[
        authoredRhythm as keyof typeof TENANT_THEME_RHYTHM_FACTORS
      ];
    if (typeof rhythmFactor === "number" && Number.isFinite(rhythmFactor)) {
      vars["--ds-rhythm-scale"] = String(
        Math.min(
          TENANT_THEME_RHYTHM_SCALE_BOUNDS.max,
          Math.max(TENANT_THEME_RHYTHM_SCALE_BOUNDS.min, rhythmFactor)
        )
      );
    }
  }
  // Profile channels land OVER the neutral structural seeds and UNDER every
  // authored write below: each authored field emits only when present, so
  // the later assignments restore exactly the "authored wins over profile"
  // precedence without a second writer per channel.
  //
  // SCOPE (option B): this and every writer below decide precedence WITHIN the
  // VERTICAL floor. Between floors it is `tenantPosture`, applied LAST. The `--ds-type-{role}-*`
  // rows seeded here are intentionally restated by the semantic-typography
  // emitter at the end of this function, which receives the same table as a
  // role overlay — one owner, identical values.
  Object.assign(vars, expansion.variables);
  // Field-backed expressive defaults use the SAME lowering as DB Appearance.
  // Before this bridge a static selection changed density/radius only while
  // type pairing, button silhouette, elevation and motion were DB-only.
  Object.assign(vars, appearancePostureToVariables(expansion.fieldDefaults));
  // Every Standard posture, regardless of whether it arrived from a static
  // Theme or a DB ThemePatch, lowers through this one canonical table. The
  // expressive profile already wrote its defaults above; these authored fields
  // intentionally overwrite only the channels they own.
  Object.assign(
    vars,
    appearancePostureToVariables({
      typePairing: bt.typography?.typePairing,
      typeScale: bt.typography?.scale,
      buttonStyle: bt.surfaces?.buttonStyle,
      radiusScale: bt.surfaces?.radiusScale,
      density: bt.surfaces?.density,
      motion: bt.motion
        ? {
            intensity: bt.motion.intensity,
            durationScale: bt.motion.durationScale,
            ambient: bt.motion.ambient,
          }
        : undefined,
      elevation: bt.surfaces?.elevation,
    })
  );
  if (bt.palette) {
    // Semantic defaults come FIRST, so every authored layer outranks them:
    // the palette literals immediately below restate their own channels, and
    // the orchestration merges the chrome map after this whole object. A
    // theme that authors its button chrome therefore keeps its exact pixels
    // while a palette-only theme stops being inert — the seeds reach the
    // buttons, focus ring, links, interactive states and grounds instead of
    // stopping at the ramps. Seed resolution mirrors `deriveTenantColorRamps`:
    // a dark-surface tenant derives from its dark seeds against its own dark
    // ground. A ground is derived only when the palette actually declares one,
    // so an absent seed never claims a channel.
    // The seed every derived channel below reads. One palette, one primary,
    // one ground -- a mode overlay re-enters this function with its own
    // merged palette, so the other mode resolves its own seed here rather
    // than being smuggled through a second field on this one.
    const effectivePrimary = bt.palette.primaryColor;
    Object.assign(
      vars,
      derivePaletteSemantics({
        primary: effectivePrimary,
        background: bt.palette.backgroundColor,
      })
    );

    // Light-mode palette (default)
    if (bt.palette.primaryColor)
      vars["--ds-color-primary"] = bt.palette.primaryColor;
    if (bt.palette.secondaryColor)
      vars["--ds-color-secondary"] = bt.palette.secondaryColor;
    if (bt.palette.accentColor)
      vars["--ds-color-accent"] = bt.palette.accentColor;
    if (bt.palette.textPrimaryColor)
      vars["--ds-color-text-primary"] = bt.palette.textPrimaryColor;
    if (bt.palette.textSecondaryColor)
      vars["--ds-color-text-secondary"] = bt.palette.textSecondaryColor;
    if (bt.palette.textPageColor)
      vars["--ds-color-text-page"] = bt.palette.textPageColor;
    if (bt.palette.textMutedColor)
      vars["--ds-color-text-muted"] = bt.palette.textMutedColor;
    if (bt.palette.textDisabledColor)
      vars["--ds-color-text-disabled"] = bt.palette.textDisabledColor;
    if (bt.palette.borderPrimaryColor)
      vars["--ds-color-border-primary"] = bt.palette.borderPrimaryColor;
    if (bt.palette.borderSecondaryColor)
      vars["--ds-color-border-secondary"] = bt.palette.borderSecondaryColor;
    if (bt.palette.successColor)
      vars["--ds-color-success"] = bt.palette.successColor;
    if (bt.palette.warningColor)
      vars["--ds-color-warning"] = bt.palette.warningColor;
    if (bt.palette.errorColor) vars["--ds-color-error"] = bt.palette.errorColor;
    if (bt.palette.infoColor) vars["--ds-color-info"] = bt.palette.infoColor;
    // Readable ink over each hex status tone, from the shared derivation the
    // DB path also uses. A mode overlay re-enters this function with its own
    // merged palette, so a dark-mode tone re-derives its own ink; a future
    // authored on-<tone> field would simply overwrite these entries below.
    for (const role of ON_TONE_ROLES) {
      const seed = bt.palette[`${role}Color`];
      if (seed && isHexColor(seed)) {
        vars[onToneChannel(role)] = deriveReadableInk(seed);
      }
    }
    // The unauthored floor for the four channels a theme MAY author, merged
    // UNDER `setExtendedPaletteVariables` so any authored value overwrites its
    // own channel and leaves the other three derived. This compiler is now
    // the only author of all four: the runtime generator that used to derive
    // them from an NTSC luma threshold is gone, so there is no second emitter
    // to collide with and no reason to keep the floor exported-but-unwired.
    Object.assign(vars, deriveExtendedPaletteFloor(effectivePrimary));
    // The status-tint floor, guarded per tone by that tone's own seed
    // (see `deriveStatusTintFloor`). Same precedence slot as the floor above:
    // merged before the authored ceiling so a per-channel override still wins.
    Object.assign(vars, deriveStatusTintFloor(bt.palette));
    setExtendedPaletteVariables(vars, bt.palette);

    // This mode's ground. A theme declares one ground in the plain channel;
    // its other mode declares that mode's ground in its own overlay, which
    // compiles into a mode block. There is no `--ds-color-dark-bg` twin,
    // because a channel nothing paints from is not a mode.
    if (bt.palette.backgroundColor) {
      vars["--ds-color-bg-primary"] = bt.palette.backgroundColor;
      vars["--ds-color-bg"] = bt.palette.backgroundColor;
      vars["--ds-color-background"] = bt.palette.backgroundColor;
    }

    // The semantic control surface, which `--ds-surface-control` derives from
    // and every modern input control falls back to. It belongs here and not in
    // the chrome emitter: a mode overlay restates it through this same path,
    // so the value is always the one that mode authored.
    const inputBg = bt.chrome?.controls?.input?.bg;
    if (inputBg) vars["--ds-color-bg-input"] = inputBg;
  }
  if (bt.typography) {
    const ty = bt.typography;
    if (ty.fontFamilyBase)
      vars["--ds-font-family-base"] = withArabicSafeFallback(ty.fontFamilyBase);
    if (ty.fontFamilyHeading)
      vars["--ds-font-family-heading"] = withArabicSafeFallback(
        ty.fontFamilyHeading
      );
    if (ty.fontFamilyMono) vars["--ds-font-family-mono"] = ty.fontFamilyMono;
    if (ty.fontFamilyDisplay)
      vars["--ds-font-family-display"] = withArabicSafeFallback(
        ty.fontFamilyDisplay
      );
    if (ty.letterSpacing) {
      if (ty.letterSpacing.display)
        vars["--ds-letter-spacing-display"] = ty.letterSpacing.display;
      if (ty.letterSpacing.heading)
        vars["--ds-letter-spacing-heading"] = ty.letterSpacing.heading;
      if (ty.letterSpacing.body)
        vars["--ds-letter-spacing-body"] = ty.letterSpacing.body;
      if (ty.letterSpacing.mono)
        vars["--ds-letter-spacing-mono"] = ty.letterSpacing.mono;
    }
    if (ty.lineHeight) {
      if (ty.lineHeight.display != null)
        vars["--ds-line-height-display"] = String(ty.lineHeight.display);
      if (ty.lineHeight.heading != null)
        vars["--ds-line-height-heading"] = String(ty.lineHeight.heading);
      if (ty.lineHeight.body != null)
        vars["--ds-line-height-body"] = String(ty.lineHeight.body);
      if (ty.lineHeight.tight != null)
        vars["--ds-line-height-tight"] = String(ty.lineHeight.tight);
      if (ty.lineHeight.relaxed != null)
        vars["--ds-line-height-relaxed"] = String(ty.lineHeight.relaxed);
    }
  }
  if (bt.surfaces) {
    const su = bt.surfaces;
    Object.assign(
      vars,
      semanticSurfaceRolesToCssVariables(su.surfaceRoles ?? su.materials)
    );
    if (su.borderRadius) {
      // sm/md/lg/xl are emitted as the `-base` OPERANDS of the foundation dial,
      // never as resolved radii. themes/default.css computes each step as
      // `calc(base * var(--ds-radius-scale, 1))`, and a flat `--ds-radius-*` at
      // tenant scope replaces that calc entirely — sanctioned for a Pro tenant's
      // token set ("explicit beats dial"), but when the static compiler takes
      // that path for every code-owned vertical the dial can never move them.
      //
      // The divisor is the scale THIS theme emits, so the foundation calc
      // reproduces the authored value at today's dial while leaving the dial
      // live. The division is expressed in CSS rather than evaluated here: the
      // browser then multiplies and divides in one pass, which is exact for any
      // scale instead of correct only for the ones that divide evenly.
      //
      // Written as explicit per-step assignments, not a loop: the typed graph
      // both parity gates share seeds identifier domains from initializers, so
      // a `for…of` binding has none and the template key degrades to a wildcard
      // that resolves to no concrete channel.
      const radiusScale = Number(vars["--ds-radius-scale"] ?? "1");
      const dialed =
        Number.isFinite(radiusScale) && radiusScale > 0 && radiusScale !== 1;
      const radiusBase = (authored: string) =>
        dialed ? `calc(${authored} / ${radiusScale})` : authored;
      if (su.borderRadius.sm)
        vars["--ds-radius-sm-base"] = radiusBase(su.borderRadius.sm);
      if (su.borderRadius.md)
        vars["--ds-radius-md-base"] = radiusBase(su.borderRadius.md);
      if (su.borderRadius.lg)
        vars["--ds-radius-lg-base"] = radiusBase(su.borderRadius.lg);
      if (su.borderRadius.xl)
        vars["--ds-radius-xl-base"] = radiusBase(su.borderRadius.xl);
      // `full` is a pill radius, outside the dial ramp (themes/default.css).
      if (su.borderRadius.full) vars["--ds-radius-full"] = su.borderRadius.full;
    }
    if (su.shadows) {
      if (su.shadows.sm) vars["--ds-shadow-sm"] = su.shadows.sm;
      if (su.shadows.md) vars["--ds-shadow-md"] = su.shadows.md;
      if (su.shadows.lg) vars["--ds-shadow-lg"] = su.shadows.lg;
      if (su.shadows.xl) vars["--ds-shadow-xl"] = su.shadows.xl;
      if (su.shadows.xs) vars["--ds-shadow-xs"] = su.shadows.xs;
      // `2xl` cannot be an identifier, so the field is `xxl` and the channel
      // keeps the scale's own spelling.
      if (su.shadows.xxl) vars["--ds-shadow-2xl"] = su.shadows.xxl;
      if (su.shadows.inner) vars["--ds-shadow-inner"] = su.shadows.inner;
      if (su.shadows.focusRing)
        vars["--ds-shadow-focus-ring"] = su.shadows.focusRing;
      if (su.shadows.focusRingError)
        vars["--ds-shadow-focus-ring-error"] = su.shadows.focusRingError;
    }
    if (su.elevations) {
      /* AGED CLAUSE RE-SEATED IN E-1. It said "an authored ladder is the
       * ceiling it states outright, and it is never the other way around" --
       * true before option B, when nothing ran after this block. Measured now:
       * the tenant floor lowers LAST (`if (tenantPosture)`, below) in the base
       * AND every mode block, so the ladder is the ceiling only against the
       * VERTICAL's posture; a TENANT selection discards it, overlay ladders
       * included (they stop emitting once equal to the base). rottay shows it:
       * six authored levels, three channels moved in both modes. Both doors
       * agree -- the static arm always applied the floor last, and since E-1
       * the DB door supplies floors too. */
      if (su.elevations.level0) vars["--ds-elevation-0"] = su.elevations.level0;
      if (su.elevations.level1) vars["--ds-elevation-1"] = su.elevations.level1;
      if (su.elevations.level2) vars["--ds-elevation-2"] = su.elevations.level2;
      if (su.elevations.level3) vars["--ds-elevation-3"] = su.elevations.level3;
      if (su.elevations.level4) vars["--ds-elevation-4"] = su.elevations.level4;
      if (su.elevations.level5) vars["--ds-elevation-5"] = su.elevations.level5;
    }
    if (su.glass) {
      // 'none' is legacy zero-decoration suppression. The premium.css defaults + the
      // --ds-effect-intensity dial now own collapse, so a 'none' override must NOT be
      // emitted: doing so clobbered premium.css at runtime for every non-zero-intensity
      // tenant (including rottay, killing its surface tint). A tenant stays flat via
      // --ds-effect-intensity: 0 (bithire), not by nulling the role token. Only a real
      // (non-'none') value is emitted.
      if (su.glass.background && su.glass.background !== "none")
        vars["--ds-glass-bg"] = su.glass.background;
      if (su.glass.border && su.glass.border !== "none")
        vars["--ds-glass-border"] = su.glass.border;
      if (su.glass.blur && su.glass.blur !== "none")
        vars["--ds-glass-blur"] = su.glass.blur;
    }
    if (su.gradients) {
      if (su.gradients.primary && su.gradients.primary !== "none")
        vars["--ds-gradient-primary"] = su.gradients.primary;
      if (su.gradients.surface && su.gradients.surface !== "none")
        vars["--ds-gradient-surface"] = su.gradients.surface;
      if (su.gradients.mesh && su.gradients.mesh !== "none")
        vars["--ds-gradient-mesh"] = su.gradients.mesh;
    }
    if (su.overlays) {
      if (su.overlays.light) vars["--ds-overlay-light"] = su.overlays.light;
      if (su.overlays.medium) vars["--ds-overlay-medium"] = su.overlays.medium;
      if (su.overlays.heavy) vars["--ds-overlay-heavy"] = su.overlays.heavy;
    }
    // Premium effect-intensity dial (engines/modern spec section 5). Multiplies the
    // gradient/glass/glow layer via --ds-effect-intensity; 0 collapses it to flat.
    // Defaults to 1 (full Quiet Premium) when the theme does not set it.
    vars["--ds-effect-intensity"] = String(su.effectIntensity ?? 1);
  }
  // One ramp, on the surface THIS block compiles for. A mode overlay re-enters
  // this function with its own merged palette and its own mode, so its ramp
  // derives against its own ground through the same call — one channel family,
  // two blocks, never a namespaced twin.
  Object.assign(vars, deriveTenantColorRamps(bt.palette, surface));
  const chartSeed = bt.palette?.primaryColor;
  if (chartSeed && isHexColor(chartSeed)) {
    const chartGrounds = [
      bt.palette?.backgroundColor ??
        (surface === "dark" ? DARK_DEFAULT_GROUND : LIGHT_DEFAULT_GROUND),
      ...Object.values(
        bt.surfaces?.surfaceRoles ?? bt.surfaces?.materials ?? {}
      )
        .map((role) => role?.background)
        .filter((value): value is string => typeof value === "string"),
    ];
    deriveChartSeriesPalette(chartSeed, chartGrounds, surface).forEach(
      (color, index) => {
        vars[`--ds-chart-series-${index + 1}`] = color;
      }
    );
  }
  bt.charts?.categoryColors?.forEach((color, index) => {
    if (index < 10 && color) vars[`--ds-chart-category-${index + 1}`] = color;
  });
  setTintScaleVariables(vars, bt);
  setTypeRampVariables(vars);
  // `labelStyle` is an AUTHORED case decision and must sit in the authored
  // layer of the single role emitter — above any expressive profile overlay.
  // Historically it fed personality only, which let the label role channel
  // silently ignore it; the finer `typography.roles.label` surface still
  // wins over this mapping when both are authored.
  const authoredLabelCase: "uppercase" | "capitalize" | "none" | undefined =
    bt.typography?.labelStyle === undefined
      ? undefined
      : bt.typography.labelStyle === "uppercase"
      ? "uppercase"
      : bt.typography.labelStyle === "capitalize"
      ? "capitalize"
      : "none";
  const authoredRoles =
    authoredLabelCase === undefined
      ? bt.typography?.roles
      : {
          ...bt.typography?.roles,
          label: {
            textTransform: authoredLabelCase,
            ...omitUndefined(bt.typography?.roles?.label),
          },
        };
  setSemanticTypographyVariables(
    vars,
    authoredRoles,
    expressiveTypeRoleOverlay(expressiveAxes)
  );
  setMotionVariables(vars, bt);
  // THE TENANT FLOOR (option B): tenant override > tenant profile > vertical
  // theme > DS defaults. Applied last rather than gated per field: a per-field
  // gate must enumerate every authored writer, and would miss the one that
  // started this packet. Absent => identity.
  // E-1 widened WHO reaches it, not what it does: the DB door supplies floors
  // now too. It runs per BLOCK, so an overlay the floor overwrites stops
  // diverging and drops out of that block's delta -- measured on bithire, whose
  // dark `--ds-letter-spacing-heading` delta disappears once a tenant's
  // `typePairing` governs dark as well as light. Adjudicated: that is the
  // selection reaching both modes, which is what option B says.
  if (tenantPosture) {
    Object.assign(vars, appearancePostureToVariables(tenantPosture));
  }
  /* E-2: the tenant's own literal over the tenant's own pairing (the posture
   * above rewrites these five). Each field keeps the body's treatment (`:888+`):
   * wrapped, mono raw, line-height String()-ed. A VERTICAL literal is not in
   * the patch, so a tenant pairing still outranks it (option B / F4B-11). */
  if (tenantTypography) {
    const tl = tenantTypography;
    if (tl.fontFamilyBase)
      vars["--ds-font-family-base"] = withArabicSafeFallback(tl.fontFamilyBase);
    if (tl.fontFamilyHeading)
      vars["--ds-font-family-heading"] = withArabicSafeFallback(tl.fontFamilyHeading);
    if (tl.fontFamilyMono) vars["--ds-font-family-mono"] = tl.fontFamilyMono;
    if (tl.letterSpacing?.heading)
      vars["--ds-letter-spacing-heading"] = tl.letterSpacing.heading;
    if (tl.lineHeight?.display != null)
      vars["--ds-line-height-display"] = String(tl.lineHeight.display);
  }
  return vars;
}
