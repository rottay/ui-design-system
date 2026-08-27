/**
 * Rottay first-party vertical theme.
 *
 * Dark-first premium AI/security command center.
 * White primary on dark canvas, graphite environments, restrained accents.
 * Disciplined spring motion, mono pairing for data surfaces.
 *
 * Design: Vercel/Linear inspired - dark, sober, technical, premium.
 * Primary: #FFFFFF (white on dark), Canvas: #0C0C0E
 *
 * This file is the canonical authored source. foundation/tokens/css/facade/artifacts/rottay/index.css
 * is a generated build product — regenerate with `pnpm -C packages/core
 * build:vertical-css`; hand-edits fail `lint:artifacts`.
 *
 * NORMAL FORM. Every authored value of this vertical lives in the AUTHORED
 * DECISIONS block below, between the two fences. The exported object beneath
 * them is a contract skeleton: it names the families in the contract's own
 * order and references the decisions, so a brand change is a decision edit and
 * never a structural one. The same roster and the same skeleton, in the same
 * order with the same section comments, are authored in all three first-party
 * themes; a slot a vertical does not author carries a placeholder comment
 * rather than an invented value.
 */

import type {
  BrandCapabilityCatalog,
  BrandChrome,
  BrandMotion,
  BrandPalette,
  BrandRecipeSelection,
  BrandSurfaces,
  BrandThemeMode,
  BrandThemeModeOverlay,
  BrandTypography,
  FirstPartyBrandTheme,
} from '../../../../../contracts/composition/tenants/themes';

import seedValues from './seeds.json';

// ──────────────────────── AUTHORED DECISIONS ────────────────────────
// Every brand-specific value and every justified shipped pin of this vertical
// is authored below, in the roster order the skeleton consumes it. Nothing
// beneath END AUTHORED DECISIONS carries a value.

// ── IDENTITY ──
const THEME_ID = 'rottay' satisfies FirstPartyBrandTheme['id'];
const THEME_NAME = 'Rottay';
const DEFAULT_MODE = 'dark' satisfies BrandThemeMode;
const OVERLAY_MODE = 'light' satisfies BrandThemeMode;


// ── SEEDS — valores en ./seeds.json (ausencia = placeholder) ──
const SEED = seedValues.main;
const OVERLAY_SEED = seedValues.overlay;

// ── OVERLAY — the non-default mode ──
/**
 * LIGHT mode. Authored as a typed overlay of the semantic
 * families: the compiler merges it over the body above, runs the same
 * family compilers, and emits only what moves. These values shipped as a
 * hand-written block in this vertical's artifact extension until R1-P.
 *
 * The `ramps` entries are the steps this mode ships today. Most were
 * pinned by hand in that block; the rest are pinned here because moving
 * the ground would otherwise re-derive them, and re-deriving is a sighted
 * decision rather than an architectural one. Deleting a pin returns that
 * step to the OKLCH derivation.
 */
const OVERLAY: BrandThemeModeOverlay = {
  /**
   * Familia mixta. Controles: palette.seeds, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  palette: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    ramps: {
      primary: {
        50: "#FAFAF9",
        100: "#F4F4F3",
        200: "#E5E5E3",
        300: "#D4D4D2",
        400: "#A3A3A1",
        500: "#6B6B6B",
        600: "#525252",
        700: "#3D3D3D",
        800: "#2A2A2A",
        900: "#0A0A0A",
      },
      secondary: {
        50: "#FAFAF9",
        100: "#F4F4F3",
        200: "#E5E5E3",
        300: "#D4D4D2",
        400: "#A3A3A1",
        500: "#6B6B6B",
        600: "#525252",
        700: "#3D3D3D",
        800: "#2A2A2A",
        900: "#171717",
      },
      accent: {
        50: "#FAFAF9",
        100: "#F4F4F3",
        200: "#E5E5E3",
        300: "#D4D4D2",
        400: "#A3A3A1",
        500: "#6B6B6B",
        600: "#525252",
        700: "#3D3D3D",
        800: "#2A2A2A",
        900: "#171717",
      },
      neutral: {
        50: "#FAFAF9",
        100: "#F4F4F3",
        200: "#E5E5E3",
        300: "#D4D4D2",
        400: "#A3A3A1",
        500: "#6B6B6B",
        600: "#525252",
        700: "#3D3D3D",
        800: "#2A2A2A",
        900: "#171717",
      },
      success: {
        50: "rgba(22, 163, 74, 0.06)",
        100: "rgba(22, 163, 74, 0.10)",
        200: "#BBF7D0",
        300: "#86EFAC",
        400: "#4ADE80",
        500: "#22C55E",
        600: "#16A34A",
        700: "#15803D",
        800: "#166534",
        900: "#14532D",
      },
      warning: {
        50: "rgba(217, 119, 6, 0.06)",
        100: "rgba(217, 119, 6, 0.10)",
        200: "#FDE68A",
        300: "#FCD34D",
        400: "#FBBF24",
        500: "#F59E0B",
        600: "#D97706",
        700: "#B45309",
        800: "#92400E",
        900: "#78350F",
      },
      error: {
        50: "rgba(220, 38, 38, 0.06)",
        100: "rgba(220, 38, 38, 0.10)",
        200: "#FECACA",
        300: "#FCA5A5",
        400: "#F87171",
        500: "#EF4444",
        600: "#DC2626",
        700: "#B91C1C",
        800: "#991B1B",
        900: "#7F1D1D",
      },
      info: {
        50: "rgba(37, 99, 235, 0.06)",
        100: "rgba(37, 99, 235, 0.10)",
        200: "#BFDBFE",
        300: "#93C5FD",
        400: "#60A5FA",
        500: "#3B82F6",
        600: "#2563EB",
        700: "#1D4ED8",
        800: "#1E40AF",
        900: "#1E3A8A",
      },
    },
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    primaryColor: "#0A0A0A",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryHoverColor: "#2A2A2A",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryForegroundColor: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryColor: "#6B6B6B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryHoverColor: "#525252",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    accentColor: "#6B6B6B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    accentHoverColor: "#525252",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundColor: "#FAFAF9",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundSecondaryColor: "#F4F4F3",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundTertiaryColor: "#EDEDEC",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundElevatedColor: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundOverlayColor: "rgba(0, 0, 0, 0.48)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundSurfaceColor: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textPrimaryColor: "#1A1A1A",
    /**
     * Raiz de tinta del tier de pagina (K3, F4A-6): sidebar, headers de tabla,
     * labels de formulario — el mobiliario de pagina, no el contenido.
     * @domicile seed
     * @governor dial: tenant-dial (tinta de pagina); calibracion en F4B
     */
    textPageColor: "#6B6B6B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textSecondaryColor: "#6B6B6B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textTertiaryColor: "#8A8A8A",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textMutedColor: "#9C9C9C",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textDisabledColor: "#C4C4C2",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    onPrimaryColor: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderColor: "#E5E5E3",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderSecondaryColor: "#D4D4D2",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderSubtleColor: "#EDEDEC",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderTertiaryColor: "#EDEDEC",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderFocusColor: "rgba(10, 10, 10, 0.32)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    linkColor: "#1A1A1A",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    linkVisitedColor: "#6B6B6B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successColor: "#16A34A",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBgColor: "rgba(22, 163, 74, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBorderColor: "rgba(22, 163, 74, 0.20)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningColor: "#D97706",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBgColor: "rgba(217, 119, 6, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBorderColor: "rgba(217, 119, 6, 0.20)",
    /**
     * @domicile seed
     * @governor dial: token-overrides
     */
    errorColor: "#DC2626",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBgColor: "rgba(220, 38, 38, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBorderColor: "rgba(220, 38, 38, 0.20)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoColor: "#2563EB",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoBgColor: "rgba(37, 99, 235, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoBorderColor: "rgba(37, 99, 235, 0.20)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    interactiveBorderColor: "rgba(0, 0, 0, 0.12)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    interactiveBgHoverColor: "rgba(0, 0, 0, 0.03)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    interactiveBgActiveColor: "#EDEDEC",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    interactiveBgMutedColor: "#F4F4F3",

    // Light overlay for the T1 drain. A channel the dark body authors and
    // this mode does not restate keeps the dark value in light, so every
    // channel whose pre-drain light value differs is restated here — with
    // the value the light artifact block already shipped, or, where that
    // block was silent, with the expression the DS floor resolved to on
    // the light root.
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaBlack50: "rgba(0, 0, 0, 0.03)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaBlack100: "rgba(0, 0, 0, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaWhite50: "rgba(255, 255, 255, 0.50)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaPrimary10: "rgba(10, 10, 10, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaPrimary20: "rgba(10, 10, 10, 0.12)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaSecondary10: "rgba(107, 107, 107, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaSecondary20: "rgba(107, 107, 107, 0.14)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaSuccess10: "rgba(22, 163, 74, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaSuccess20: "rgba(22, 163, 74, 0.14)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaWarning10: "rgba(217, 119, 6, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaWarning20: "rgba(217, 119, 6, 0.14)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaError10: "rgba(220, 38, 38, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaError20: "rgba(220, 38, 38, 0.14)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alphaInfo10: "rgba(37, 99, 235, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bgHoverColor: "#F0EFEE",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-info-50
     */
    bgInfoColor: "var(--ds-color-info-50)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bgSubtleColor: "#F7F7F6",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-white
     */
    neutralZeroColor: "var(--ds-color-white)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primarySubtleColor: "rgba(10, 10, 10, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadowColor: "rgba(0, 0, 0, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    surfaceColor: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    surfaceMutedColor: "#EDEDEC",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-bg-secondary
     */
    surfaceSecondaryColor: "var(--ds-color-bg-secondary)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-primary
     */
    textColor: "var(--ds-color-text-primary)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textInverseColor: "#FAFAF9",

    aliases: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      textPrimary: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      textSecondary: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      textTertiary: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-disabled
       */
      textDisabled: "var(--ds-color-text-disabled)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textInverse: "#FAFAF9",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      borderColor: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-primary
       */
      borderColorDefault: "var(--ds-color-border-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-subtle
       */
      borderColorMuted: "var(--ds-color-border-subtle)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      borderColorStrong: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      borderColorHover: "var(--ds-color-border-secondary)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderColorFocus: "rgba(10, 10, 10, 0.40)",
    },
  /**
   * @placeholder OVERLAY.palette.infoInkColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.linkHoverColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  },
  /**
   * Familia mixta. Controles: palette.seeds, chrome.families, token-overrides, navigation.sidebar-tone.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  chrome: {
    controls: {
      input: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgHover: "#FAFAF9",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgFocus: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgDisabled: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        color: "#1A1A1A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        colorPlaceholder: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        colorDisabled: "#A1A1AA",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        border: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderHover: "#D4D4D2",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        borderFocus: "rgba(10, 10, 10, 0.40)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderDisabled: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        shadowFocus: "0 0 0 3px rgba(10, 10, 10, 0.08)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        successShadowFocus: "0 0 0 2px rgba(22, 163, 74, 0.14)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        warningShadowFocus: "0 0 0 2px rgba(217, 119, 6, 0.14)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorBorder: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorShadowFocus: "0 0 0 2px rgba(220, 38, 38, 0.14)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorColor: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        filled: {
          bg: "#F4F4F3",
          bgHover: "#EDEDEC",
          bgFocus: "#F4F4F3",
        },
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        addon: {
          bg: "#F4F4F3",
          color: "#6B6B6B",
          border: "#E5E5E3",
        },
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        clear: {
          color: "#9C9C9C",
        },
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        helper: {
          color: "#9C9C9C",
        },
      },
      buttonPrimary: {
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        bgHover: "#2A2A2A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgActive: "#3D3D3D",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        color: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        shadow: "0 1px 2px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        shadowHover: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonSecondary: {
        bg: "#FFFFFF",
        bgHover: "#F4F4F3",
        bgActive: "#EDEDEC",
        color: "#1A1A1A",
        border: "#E5E5E3",
        borderHover: "#D4D4D2",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonDefault: {
        bg: "#FFFFFF",
        bgHover: "#FAFAF9",
        bgActive: "#F4F4F3",
        color: "#1A1A1A",
        colorHover: '#1A1A1A',
        colorActive: '#1A1A1A',
        border: "#E5E5E3",
        borderHover: "#D4D4D2",
                  borderActive: '#C4C4C2',
},
      buttonGhost: {
        /**
         * @domicile seed
         * @governor dial: token-overrides
         */
        bg: 'transparent',
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        bgHover: "rgba(0, 0, 0, 0.04)",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        bgActive: "rgba(0, 0, 0, 0.08)",
                  /**
                   * @domicile seed
                   * @governor dial: token-overrides
                   */
                  colorHover: '#1A1A1A',
        /**
         * @domicile seed
         * @governor dial: token-overrides
         */
        border: 'transparent',
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        borderHover: 'transparent',
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderActive: 'transparent',
},
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonText: {
        bg: 'transparent',
        bgHover: "rgba(0, 0, 0, 0.04)",
        bgActive: "rgba(0, 0, 0, 0.08)",
                  colorHover: '#1A1A1A',
},
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonLink: {
        color: "#1A1A1A",
        colorHover: "#6B6B6B",
        colorActive: "#0A0A0A",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonError: {
        bg: "#DC2626",
        bgHover: "#B91C1C",
        bgActive: "#991B1B",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonInfo: {
        bg: "#2563EB",
        bgHover: "#1D4ED8",
        bgActive: "#1E40AF",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      disabled: {
        bg: "#F4F4F3",
        text: "#A1A1AA",
        border: "#E5E5E3",
        borderColor: "#E5E5E3",
      },
      segmented: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        itemBg: "transparent",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        itemBgSelected: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        itemColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        itemColorSelected: "#1A1A1A",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        shadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      select: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        color: "#1A1A1A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        colorPlaceholder: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        dropdownBg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        dropdownShadow:
          "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        optionBgHover: "#FAFAF9",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        optionBgSelected: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        optionColorSelected: "#1A1A1A",
        // ROTTAY-T2 MASS: light divergence for the drained select channels.
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        arrowColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgDisabled: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        border: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderFocus: "rgba(10, 10, 10, 0.40)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderHover: "#D4D4D2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        clearColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        colorDisabled: "#C4C4C2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        dropdownBorder: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorBorder: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        filledBg: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        optionColorDisabled: "#C4C4C2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        shadowFocus: "0 0 0 2px rgba(10, 10, 10, 0.08)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        tagBg: "#F4F4F3",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textarea: {
        bg: "#ffffff",
        bgDisabled: "#F4F4F3",
        filledBg: "#F4F4F3",
        color: "#1A1A1A",
        colorPlaceholder: "#9C9C9C",
        countColor: "#9C9C9C",
        border: "#E5E5E3",
        borderHover: "#D4D4D2",
        borderFocus: "rgba(10, 10, 10, 0.40)",
        shadowFocus: "0 0 0 2px rgba(10, 10, 10, 0.08)",
        errorBorder: "#DC2626",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      form: {
        helpColor: "#9C9C9C",
        extraColor: "#9C9C9C",
        successColor: "#16A34A",
        warningColor: "#D97706",
        errorColor: "#DC2626",
        requiredColor: "#DC2626",
      },
      autocomplete: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        border: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderFocus: "rgba(10, 10, 10, 0.40)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        clearColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        dropdownBg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        dropdownShadow:
          "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        emptyColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorBorder: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        optionBgHover: "#FAFAF9",
      },
      checkbox: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgDisabled: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        border: "#D4D4D2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderHover: "#A3A3A1",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        checkedColor: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial: token-overrides
         */
        errorBorder: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorColor: "#DC2626",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        focusRingColor: "rgba(10, 10, 10, 0.08)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        labelColor: "#1A1A1A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        labelColorDisabled: "#C4C4C2",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      datePicker: {
        bg: "#FFFFFF",
        bgDisabled: "#F4F4F3",
        border: "#E5E5E3",
        borderFocus: "rgba(10, 10, 10, 0.40)",
        borderHover: "#D4D4D2",
        clearColor: "#9C9C9C",
        color: "#1A1A1A",
        errorBorder: "#DC2626",
        iconColor: "#9C9C9C",
        separatorColor: "#9C9C9C",
        shadowFocus: "0 0 0 2px rgba(10, 10, 10, 0.08)",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      inputNumber: {
        addonBg: "#F4F4F3",
        addonBorder: "#E5E5E3",
        addonColor: "#6B6B6B",
        affixColor: "#9C9C9C",
        bg: "#FFFFFF",
        bgDisabled: "#F4F4F3",
        border: "#E5E5E3",
        borderFocus: "rgba(10, 10, 10, 0.40)",
        color: "#1A1A1A",
        controlColor: "#9C9C9C",
        errorBorder: "#DC2626",
        shadowFocus: "0 0 0 2px rgba(10, 10, 10, 0.08)",
      },
      radio: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgDisabled: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        border: "#D4D4D2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderHover: "#A3A3A1",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        checkedBg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        descriptionColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial: token-overrides
         */
        errorBorder: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorColor: "#DC2626",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        focusRingColor: "rgba(10, 10, 10, 0.08)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        labelColor: "#1A1A1A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        labelColorDisabled: "#C4C4C2",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      rate: {
        color: "#EDEDEC",
      },
      slider: {
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        handleBgDisabled: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        handleBorder: "#0A0A0A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        handleShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        markColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        railColor: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        trackColorDisabled: "#C4C4C2",
      },
      switch: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#D4D4D2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgHover: "#C4C4C2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        checkedBgHover: "#2A2A2A",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        labelColor: "#1A1A1A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        thumbBg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        thumbShadow: "0 1px 3px rgba(0, 0, 0, 0.10)",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      timePicker: {
        bg: "#FFFFFF",
        bgDisabled: "#F4F4F3",
        border: "#E5E5E3",
        borderFocus: "rgba(10, 10, 10, 0.40)",
        clearColor: "#9C9C9C",
        color: "#1A1A1A",
        errorBorder: "#DC2626",
        iconColor: "#9C9C9C",
        separatorColor: "#9C9C9C",
        shadowFocus: "0 0 0 2px rgba(10, 10, 10, 0.08)",
      },
      toggle: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        descriptionColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        dotBg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        dotShadow: "0 1px 2px rgba(0, 0, 0, 0.10)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorBg: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        errorColor: "#DC2626",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        innerLabelColor: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        labelColor: "#1A1A1A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        successBg: "#16A34A",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        trackBg: "#D4D4D2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        warningBg: "#D97706",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      transfer: {
        bg: "#FFFFFF",
        border: "#E5E5E3",
        headerBg: "#FAFAF9",
        headerBorder: "#E5E5E3",
        itemBgHover: "#FAFAF9",
      },
      upload: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        border: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderHover: "#D4D4D2",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        buttonBg: "#FFFFFF",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        buttonBorder: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        cardBg: "#FAFAF9",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        cardBorder: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        draggerBg: "#FAFAF9",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        draggerBgHover: "#F4F4F3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        draggerBorder: "#E5E5E3",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        draggerIconColor: "#9C9C9C",
        /**
         * @domicile seed
         * @governor dial: token-overrides
         */
        errorBorder: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        fileBg: "#FAFAF9",
        /**
         * @domicile seed
         * @governor dial: token-overrides
         */
        fileRemoveColor: "#DC2626",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        previewBackdrop: "rgba(0, 0, 0, 0.60)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        previewOverlay: "rgba(0, 0, 0, 0.40)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        progressTrack: "#EDEDEC",
      },
    },
    cardComponent: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgHover: "#FAFAF9",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      color: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      border: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderHover: "#D4D4D2",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderAccentHover: "rgba(10, 10, 10, 0.16)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowHover: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowElevated: "0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      headerBorder: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      headerColor: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      titleColor: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      imagePlaceholderBg: "#F4F4F3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      imagePlaceholderColor: "#9C9C9C",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      imageLoadingTrack: '#EDEDEC',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      imageLoadingActive: '#0A0A0A',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      footerBorder: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      footerBg: "#FAFAF9",
    },
    modal: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      color: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 12px 32px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.06)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      overlayBg: "rgba(0, 0, 0, 0.48)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      headerBg: "#FAFAF9",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      headerBorder: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      titleColor: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      subtitleColor: "#6B6B6B",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      footerBorder: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      footerBg: "#FAFAF9",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      closeColor: "#9C9C9C",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      closeColorHover: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      closeBgHover: "rgba(0, 0, 0, 0.04)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    table: {
      bg: OVERLAY_SEED.surface.card,
      border: OVERLAY_SEED.edge.strong,
      headerBg: OVERLAY_SEED.surface.wash,
      // Literal on purpose: an alias equal to the body emits NOTHING in a mode
      // block (diff-by-values) -- that is how F4A-6 drained this shield. D-1b.
      headerColor: "#6B6B6B",
      rowBg: OVERLAY_SEED.surface.card,
      rowBgHover: OVERLAY_SEED.surface.wash,
      rowBgStriped: OVERLAY_SEED.surface.wash,
      rowBgSelected: OVERLAY_SEED.veil.selected,
      loadingOverlayBg: OVERLAY_SEED.scrim.loading,
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    tabs: {
      border: "#E5E5E3",
      color: "#9C9C9C",
      colorHover: "#1A1A1A",
      colorActive: "#1A1A1A",
      bgHover: "rgba(0, 0, 0, 0.02)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    breadcrumb: {
      color: "#9C9C9C",
      colorHover: "#1A1A1A",
      colorActive: "#1A1A1A",
      separatorColor: "#D4D4D2",
    },
    sidebar: {
      /**
       * @domicile seed
       * @governor dial: navigation.sidebar-tone
       */
      bg: "#F4F4F3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      text: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textMuted: "#9C9C9C",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupFontSize: "11px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupColor: "#9C9C9C",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupLetterSpacing: "0.04em",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupMarginTop: "8px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupMarginBottom: "4px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupPaddingTop: "10px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemFontSize: "13px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemFontWeight: "400",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemFontWeightActive: "500",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemColor: "#6B6B6B",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgActive: "rgba(0, 0, 0, 0.06)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgHover: "rgba(0, 0, 0, 0.03)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemIndent: "6px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemPadding: "6px 10px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      iconSize: "16px",
      // Literal on purpose: an alias equal to the body emits NOTHING in a mode
      // block (diff-by-values) -- that is how F2.4 drained this shield. D-1b.
      footerBg: "#F4F4F3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shellPaddingInline: "initial",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shellPaddingCollapsed: "initial",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemHeight: "initial",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemChildHeight: "initial",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemFontSizeChild: "initial",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemPaddingInline: "initial",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      iconColumnSize: "initial",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemGap: "initial",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      childPaddingInline: "initial",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    layout: {
      bg: "#FAFAF9",
      headerBg: "rgba(250, 250, 249, 0.82)",
      headerBorder: "#E5E5E3",
      // Literal on purpose: an alias equal to the body emits NOTHING in a mode
      // block (diff-by-values) -- that is how F2.4 drained this shield. D-1.
      siderBg: "#F4F4F3",
      siderBorder: "#E5E5E3",
      dividerColor: "#E5E5E3",
      dividerTextColor: "#1A1A1A",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shell: {
      gridLine: "rgba(0, 0, 0, 0.03)",
    },
    badge: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderColor: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textColor: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      defaultBg: "#F4F4F3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      defaultColor: "#1A1A1A",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-white
       */
      primaryColor: "var(--ds-color-white, #ffffff)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      secondaryBg: "#F4F4F3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorBg: "#DC2626",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      infoBg: "#2563EB",
    },
    surface: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-overlay-scrim
       */
      overlayBg: "var(--ds-overlay-scrim)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      imageOverlayBg: "rgba(0, 0, 0, 0.60)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      cardCoverOverlayBg:
        "linear-gradient( to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.6) 100% )",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      gradientDark: "linear-gradient(135deg, #FAFAF9 0%, #F4F4F3 50%, #EDEDEC 100%)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      watermarkColor: "#EDEDEC",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      pageShellSubtitleColor: "var(--ds-color-text-secondary)",
    },
    list: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#ffffff",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-white
       */
      backgroundColor: "var(--ds-color-white, #ffffff)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-200
       */
      borderColor: "var(--ds-color-neutral-200, #e5e7eb)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textColor: "#1A1A1A",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-500
       */
      secondaryTextColor: "var(--ds-color-neutral-500, #6b7280)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-500
       */
      metaDescriptionColor: "var(--ds-color-neutral-500, #6b7280)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      splitColor: "#EDEDEC",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-bg-tertiary
       */
      skeletonBg: "var(--ds-color-bg-tertiary)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBackgroundColor: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgHover: "#FAFAF9",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-50
       */
      itemHoverBackgroundColor: "var(--ds-color-neutral-50, #f9fafb)",
    },
    popover: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#ffffff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      titleColor: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      titleBorder: "#E5E5E3",
    },
    tooltip: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      color: "#FAFAF9",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      defaultBg: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      defaultColor: "#FAFAF9",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      primaryColor: "#ffffff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      secondaryBg: "#ffffff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      secondaryColor: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorBg: "#DC2626",
    },
    search: {
      commandPalette: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        backdrop: "rgba(0, 0, 0, 0.40)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-elevated
         */
        bg: "var(--ds-color-bg-elevated)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border
         */
        border: "var(--ds-color-border)",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        itemHoverBg: "#FAFAF9",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-muted
         */
        groupColor: "var(--ds-color-text-muted)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-muted
         */
        emptyColor: "var(--ds-color-text-muted)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border
         */
        shortcutBorder: "var(--ds-color-border)",
      },
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    alert: {
      errorBg: "rgba(220, 38, 38, 0.06)",
      errorBorder: "rgba(220, 38, 38, 0.20)",
      errorColor: "#B91C1C",
      errorIcon: "#DC2626",
      infoBg: "rgba(37, 99, 235, 0.06)",
      infoBorder: "rgba(37, 99, 235, 0.20)",
      infoColor: "#1D4ED8",
      infoIcon: "#2563EB",
      successBg: "rgba(22, 163, 74, 0.06)",
      successBorder: "rgba(22, 163, 74, 0.20)",
      successColor: "#15803D",
      successIcon: "#16A34A",
      warningBg: "rgba(217, 119, 6, 0.06)",
      warningBorder: "rgba(217, 119, 6, 0.20)",
      warningColor: "#B45309",
      warningIcon: "#D97706",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    anchor: {
      linkColor: "#9C9C9C",
      linkColorActive: "#1A1A1A",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    avatar: {
      borderColor: "rgba(0, 0, 0, 0.06)",
      defaultBg: "#F4F4F3",
      errorBg: "rgba(220, 38, 38, 0.10)",
      errorColor: "#DC2626",
      gradientBg: "linear-gradient(135deg, #1A1A1A 0%, #6B6B6B 100%)",
      gradientColor: "#FFFFFF",
      groupBorder: "#FFFFFF",
      groupOverflowBg: "#F4F4F3",
      primaryColor: "#FFFFFF",
      secondaryBg: "#F4F4F3",
      statusBorder: "#FFFFFF",
      successBg: "rgba(22, 163, 74, 0.10)",
      successColor: "#16A34A",
      warningBg: "rgba(217, 119, 6, 0.10)",
      warningColor: "#D97706",
    },
    backTop: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      color: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 4px 12px rgba(0, 0, 0, 0.10)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    calendar: {
      bg: "#FFFFFF",
      border: "#E5E5E3",
      dayColorOther: "#C4C4C2",
      headerColor: "#1A1A1A",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    collapse: {
      bg: "#FFFFFF",
      border: "#E5E5E3",
      contentBg: "#FAFAF9",
      headerBg: "#FFFFFF",
      headerBgHover: "#FAFAF9",
      headerColor: "#1A1A1A",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    descriptions: {
      bg: "#FAFAF9",
      border: "#E5E5E3",
      contentColor: "#1A1A1A",
      labelColor: "#9C9C9C",
    },
    drawer: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      footerBorder: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      headerBorder: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      titleColor: "#1A1A1A",
    },
    dropdown: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgActive: "#F4F4F3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgHover: "#FAFAF9",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemColorActive: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemColorHover: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    empty: {
      descriptionColor: "#9C9C9C",
      iconColor: "#D4D4D2",
    },
    floatButton: {
      /**
       * @domicile seed
       * @governor dial: token-overrides
       */
      badgeBg: "#DC2626",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      defaultBg: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      primaryColor: "#FFFFFF",
    },
    liveFeed: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      badgeColor: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      emptyColor: "#9C9C9C",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      loadMoreColor: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      newBg: "rgba(37, 99, 235, 0.06)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      newBorder: "rgba(37, 99, 235, 0.20)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      newColor: "#2563EB",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      skeletonBg: "#EDEDEC",
    },
    menu: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#FAFAF9",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      darkBg: "#0A0A0A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      darkItemColor: "#A3A3A1",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      dividerColor: "#E5E5E3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupTitleColor: "#9C9C9C",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgActive: "rgba(0, 0, 0, 0.06)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgHover: "rgba(0, 0, 0, 0.03)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemColorActive: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemColorHover: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial: token-overrides
       */
      itemDangerColor: "#DC2626",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemHoverBg: "rgba(0, 0, 0, 0.03)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemSelectedBg: "rgba(0, 0, 0, 0.06)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      itemSelectedColor: "#1A1A1A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      submenuBg: "#FFFFFF",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    message: {
      bg: "#FFFFFF",
      closeColor: "#9C9C9C",
      closeColorHover: "#1A1A1A",
      shadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
    },
    notification: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 4px 24px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      titleColor: "#1A1A1A",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    pagination: {
      activeColor: "#FFFFFF",
      itemBgHover: "#FAFAF9",
      itemColorActive: "#FFFFFF",
      itemColorHover: "#1A1A1A",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    progress: {
      bg: "#EDEDEC",
      fillError: "#DC2626",
      fillSuccess: "#16A34A",
      fillWarning: "#D97706",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    result: {
      iconColor: "#FFFFFF",
      subtitleColor: "#6B6B6B",
      titleColor: "#1A1A1A",
    },
    skeleton: {
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      bg: "#EDEDEC",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      highlight: "#F4F4F3",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      waveGradient: "linear-gradient(90deg, #EDEDEC 25%, #F4F4F3 50%, #EDEDEC 75%)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    spinner: {
      track: "#EDEDEC",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    statistic: {
      valueColor: "#1A1A1A",
    },
    statsGrid: {
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      cardBg: "#FFFFFF",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      cardBorder: "#E5E5E3",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      cardFilledBg: "#FAFAF9",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      cardGlassBg: "rgba(255, 255, 255, 0.70)",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      cardGlassBorder: "#E5E5E3",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      descriptionColor: "#9C9C9C",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      skeletonBg: "#EDEDEC",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      skeletonWaveGradient: "linear-gradient( 90deg, rgba(0, 0, 0, 0.03) 25%, rgba(0, 0, 0, 0.06) 37%, rgba(0, 0, 0, 0.03) 63% )",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      trendNegative: "#DC2626",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      trendNeutral: "#9C9C9C",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      trendPositive: "#16A34A",
      /**
       * @domicile seed
       * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
       */
      valueColor: "#1A1A1A",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    steps: {
      connectorColor: "#E5E5E3",
      finishBg: "#16A34A",
      finishBorder: "#16A34A",
      itemBg: "#EDEDEC",
      itemColor: "#9C9C9C",
      itemColorActive: "#FFFFFF",
      waitBorder: "#D4D4D2",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    tag: {
      border: "#E5E5E3",
      defaultBg: "#F4F4F3",
      defaultBorder: "#E5E5E3",
      errorBg: "rgba(220, 38, 38, 0.08)",
      errorBorder: "rgba(220, 38, 38, 0.20)",
      errorColor: "#B91C1C",
      primaryColor: "#FFFFFF",
      secondaryBg: "#F4F4F3",
      secondaryBorder: "#E5E5E3",
      successBg: "rgba(22, 163, 74, 0.08)",
      successBorder: "rgba(22, 163, 74, 0.20)",
      successColor: "#15803D",
      warningBg: "rgba(217, 119, 6, 0.08)",
      warningBorder: "rgba(217, 119, 6, 0.20)",
      warningColor: "#B45309",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    timeline: {
      dotBorder: "#FFFFFF",
      lineColor: "#E5E5E3",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    tree: {
      nodeBgHover: "#FAFAF9",
      nodeBgSelected: "#F4F4F3",
      nodeColorSelected: "#1A1A1A",
    },
    /**
     * @placeholder OVERLAY.chrome.badge.countBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.iconBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.ink
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.inkHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.removeBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.removeHoverBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.selectedInk
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.selectedSurface
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.surface
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.surfaceHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.surfacePressed
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.breadcrumb.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.breadcrumb.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.breadcrumb.itemColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.bodyColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.colorMuted
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.footerBorderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.footerColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.headerBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.headerBorderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.subtitleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.collectionCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.compactCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonGhost.color
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonPrimary.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.focusRingColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.affix
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.autofill
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.borderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.borderColorFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.borderColorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.caretColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.clear.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.clear.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.clear.colorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.count
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.errorBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.filled.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.helper.errorColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.label
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.loadingColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.readOnly
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.selectionColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.successBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.warningBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.bgFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.borderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.borderColorFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.borderColorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.dropdownBorderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.optionColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.filterPill
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.listingGrid
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.metricCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.modal.bodyColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.premiumCard
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.categoryColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.clearColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.clearColorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.emptyBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.iconColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.inputBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.inputBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.inputColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.placeholderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.resultBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.resultBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.resultBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.resultMetaColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.resultTitleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.activeBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.activeGradient
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomeConsoleBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomeControlBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomeControlBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomeControlHoverBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomeHeroBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomeIconBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomeMeterBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomePanelBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomePanelBgStrong
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomePanelBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomePanelBorderSoft
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandHomeSurfaceBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.commandRailBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemColorActive
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.signalCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.cardSideAccentSoft
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.chipBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.iconBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.iconBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.popoverShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.actionBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.cellFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.cellPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.headerBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.headerFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @absent OVERLAY.chrome.table.rowBorder
     * @governor el main deriva --ds-border-color-muted y esa raiz resuelve #EDEDEC en light: el tema deja de autorar esta hoja en el plano no-default porque la derivacion ya la cubre byte-exacta (A2-3), no es gap
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.activeBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.badgeBgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.badgeBorderActive
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.badgeColorActive
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.listBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.listBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.overflowControlBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.overflowControlBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.panelBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.panelBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.panelHighlight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tallCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.toolbar
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.workspaceCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  surfaces: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderRadius: {
      full: "9999px",
    },
    shadows: {
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      sm: "0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      md: "0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      lg: "0 4px 8px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      xl: "0 8px 16px rgba(0, 0, 0, 0.06), 0 20px 48px rgba(0, 0, 0, 0.10)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      xxl: "0 12px 24px rgba(0, 0, 0, 0.08), 0 32px 64px rgba(0, 0, 0, 0.14)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: "0 0 0 3px rgba(10, 10, 10, 0.10)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      focusRingError: "0 0 0 3px rgba(220, 38, 38, 0.14)",
    },
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    elevations: {
      level1:
        "0 1px 2px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 2px 4px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-key-strength)), transparent), 0 4px 8px color-mix(in srgb, var(--ds-shadow-tint) calc(2% * var(--ds-shadow-ambient-strength)), transparent)",
      level2:
        "0 2px 4px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-key-strength)), transparent), 0 4px 8px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 8px 16px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-ambient-strength)), transparent)",
      level3:
        "0 2px 4px color-mix(in srgb, var(--ds-shadow-tint) calc(2% * var(--ds-shadow-key-strength)), transparent), 0 4px 8px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-key-strength)), transparent), 0 8px 16px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 16px 32px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-ambient-strength)), transparent)",
      level4:
        "0 4px 8px color-mix(in srgb, var(--ds-shadow-tint) calc(2% * var(--ds-shadow-key-strength)), transparent), 0 8px 16px color-mix(in srgb, var(--ds-shadow-tint) calc(3% * var(--ds-shadow-key-strength)), transparent), 0 16px 32px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 32px 64px color-mix(in srgb, var(--ds-shadow-tint) calc(6% * var(--ds-shadow-ambient-strength)), transparent)",
      level5:
        "0 8px 16px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), 0 16px 32px color-mix(in srgb, var(--ds-shadow-tint) calc(6% * var(--ds-shadow-key-strength)), transparent), 0 32px 64px color-mix(in srgb, var(--ds-shadow-tint) calc(8% * var(--ds-shadow-ambient-strength)), transparent)",
    },
  /**
   * @placeholder OVERLAY.surfaces.gradients
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; SURFACES lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.surfaceRoles
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  },
  /**
   * @placeholder OVERLAY.typography
   * @domicile unassigned
   * @governor none — gap aceptado: el modo de rottay no diverge en typography
   */
};

// ── RECIPES ──
/**
 * @domicile pro-expert
 * @governor capability: recipes (activa en rottay)
 */
const RECIPES: BrandRecipeSelection = { schemaVersion: 1, profile: 'rottay/technical-sharp@1' };

// ── EXPRESSIVE ──

/**
 * @placeholder EXPRESSIVE
 * @domicile unassigned
 * @governor none — gap aceptado: capability expressive no autorada en rottay (capabilities.expressive dice por que)
 */
// not authored by this vertical — capabilities.expressive states why.

// ── PALETTE ──
/**
 * Familia mixta. Controles: palette.seeds, token-overrides.
 * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
 */
/**
 * Punto superior: el literal de marca es legitimo aca y en ningun otro lado.
 * @domicile seed
 * @governor dial en F4B (semilla de color; el roster no le da dial hoy)
 */
const PALETTE: BrandPalette = {
  ramps: {
    primary: {
      50: "#0C0C0E",
      100: "#131316",
      200: "#1A1A1E",
      300: "#2A2A2F",
      400: "#6B6B72",
      500: "#A0A0A5",
      600: "#C0C0C4",
      700: "#D4D4D8",
      800: "#E4E4E8",
      900: "#ECECEC",
    },
    secondary: {
      50: "#0C0C0E",
      100: "#131316",
      200: "#1A1A1E",
      300: "#2A2A2F",
      400: "#6B6B72",
      500: "#A0A0A5",
      600: "#C0C0C4",
      700: "#D4D4D8",
      800: "#E4E4E8",
      900: "#ECECEC",
    },
    accent: {
      50: "#0C0C0E",
      100: "#131316",
      200: "#1A1A1E",
      300: "#2A2A2F",
      400: "#6B6B72",
      500: "#A0A0A5",
      600: "#C0C0C4",
      700: "#D4D4D8",
      800: "#E4E4E8",
      900: "#ECECEC",
    },
    success: {
      50: "rgba(34, 197, 94, 0.08)",
      100: "rgba(34, 197, 94, 0.12)",
      200: "#6EE7B7",
      300: "#34D399",
      400: "#22C55E",
      500: "#16A34A",
      600: "#15803D",
      700: "#166534",
      800: "#14532D",
      900: "#052E16",
    },
    warning: {
      50: "rgba(245, 158, 11, 0.08)",
      100: "rgba(245, 158, 11, 0.12)",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F",
    },
    error: {
      50: "rgba(239, 68, 68, 0.08)",
      100: "rgba(239, 68, 68, 0.12)",
      200: "#FECACA",
      300: "#FCA5A5",
      400: "#F87171",
      500: "#EF4444",
      600: "#DC2626",
      700: "#B91C1C",
      800: "#991B1B",
      900: "#7F1D1D",
    },
    info: {
      50: "rgba(59, 130, 246, 0.08)",
      100: "rgba(59, 130, 246, 0.12)",
      200: "#BFDBFE",
      300: "#93C5FD",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8",
      800: "#1E40AF",
      900: "#1E3A8A",
    },
    neutral: {
      50: "#101012",
      100: "#131316",
      200: "#1A1A1E",
      300: "#2A2A2F",
      400: "#6B6B72",
      500: "#A0A0A5",
      600: "#C0C0C4",
      700: "#D4D4D8",
      800: "#E4E4E8",
      900: "#ECECEC",
    },
  },
  // Light-mode runtime colors mirror the explicit light artifact.
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  primaryColor: '#FFFFFF',
  primaryHoverColor: '#E0E0E0',
  secondaryColor: '#A0A0A5',
  secondaryHoverColor: '#C0C0C4',
  accentColor: '#A0A0A5',
  accentHoverColor: '#C0C0C4',
  primaryForegroundColor: '#0C0C0E',
  backgroundColor: '#0C0C0E',
  backgroundSecondaryColor: '#0F0F12',
  backgroundTertiaryColor: '#141417',
  backgroundElevatedColor: '#18181C',
  backgroundSurfaceColor: '#18181B',
  backgroundOverlayColor: 'rgba(0, 0, 0, 0.64)',
  textPrimaryColor: '#F0F0F0',
  /**
   * Raiz de tinta del tier de pagina (K3, F4A-6): sidebar, headers de tabla,
   * labels de formulario — el mobiliario de pagina, no el contenido.
   * @domicile seed
   * @governor dial: tenant-dial (tinta de pagina); calibracion en F4B
   */
  textPageColor: '#A0A0A5',
  textSecondaryColor: '#B0B0B5',
  textTertiaryColor: '#9A9AA2',
  textMutedColor: '#96969E',
  textDisabledColor: '#555560',
  onPrimaryColor: '#0C0C0E',
  /**
   * @domicile seed
   * @governor dial en F4B (raiz autora del par border, K2: --ds-color-border)
   */
  borderColor: '#28282C',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  borderPrimaryColor: 'var(--ds-color-border)',
  borderSecondaryColor: '#252529',
  borderSubtleColor: '#161619',
  borderTertiaryColor: '#161619',
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  borderFocusColor: 'rgba(255, 255, 255, 0.20)',
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  linkColor: '#ECECEC',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-primary (semilla de marca, K1)
   */
  linkHoverColor: 'var(--ds-color-primary)',
  linkVisitedColor: '#A0A0A5',
  // Semantic: serious and muted. Dark-surface error/info sit at the 400 ramp
  // step so they clear APCA |Lc| 45 on the page ground while preserving the
  // automatic --ds-color-on-error / --ds-color-on-info emission. Light mode
  // keeps the 600-step authority (#DC2626 / #2563EB) via modes.light.palette.
  successColor: '#22C55E',
  successBgColor: 'rgba(34, 197, 94, 0.10)',
  successBorderColor: 'rgba(34, 197, 94, 0.22)',
  warningColor: '#F59E0B',
  warningBgColor: 'rgba(245, 158, 11, 0.10)',
  warningBorderColor: 'rgba(245, 158, 11, 0.22)',
  /**
   * @domicile seed
   * @governor dial: token-overrides
   */
  errorColor: '#F87171',
  errorBgColor: 'rgba(239, 68, 68, 0.10)',
  errorBorderColor: 'rgba(239, 68, 68, 0.22)',
  infoColor: '#60A5FA',
  infoBgColor: 'rgba(59, 130, 246, 0.10)',
  infoBorderColor: 'rgba(59, 130, 246, 0.22)',
  interactiveBgHoverColor: 'rgba(255, 255, 255, 0.04)',
  interactiveBgActiveColor: '#2A2A2F',
  interactiveBgMutedColor: '#1A1A1E',

  alphaBlack50: 'rgba(0, 0, 0, 0.12)',
  alphaBlack100: 'rgba(0, 0, 0, 0.20)',
  alphaWhite50: 'rgba(255, 255, 255, 0.04)',
  alphaPrimary10: 'rgba(255, 255, 255, 0.08)',
  alphaPrimary20: 'rgba(255, 255, 255, 0.14)',
  alphaSecondary10: 'rgba(160, 160, 165, 0.08)',
  alphaSecondary20: 'rgba(160, 160, 165, 0.14)',
  alphaSuccess20: 'rgba(34, 197, 94, 0.18)',
  alphaWarning20: 'rgba(245, 158, 11, 0.18)',
  alphaError20: 'rgba(239, 68, 68, 0.18)',
  bgInfoColor: 'rgba(59, 130, 246, 0.10)',
  bgSubtleColor: '#0D0D10',
  neutralZeroColor: '#0C0C0E',
  primarySubtleColor: 'rgba(255, 255, 255, 0.08)',
  shadowColor: 'rgba(0, 0, 0, 0.40)',
  surfaceColor: '#18181B',
  surfaceMutedColor: '#222226',
  surfaceSecondaryColor: '#1A1A1E',
  textColor: '#ECECEC',
  textInverseColor: '#0C0C0E',

  aliases: {
    textPrimary: '#ECECEC',
    textSecondary: '#A0A0A5',
    textTertiary: '#808085',
    textDisabled: '#4A4A4F',
    textInverse: '#0C0C0E',
    borderColor: '#2A2A2F',
    borderColorDefault: '#2A2A2F',
    borderColorMuted: '#222226',
    borderColorStrong: '#3A3A40',
    borderColorHover: '#3A3A40',
    borderColorFocus: 'rgba(255, 255, 255, 0.40)',
  },
};

// ── TYPOGRAPHY ──
/**
 * Familia mixta. Controles: typography.families, typography.pairing.
 * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
 */
const TYPOGRAPHY: BrandTypography = {
  /**
   * @domicile seed
   * @governor dial: typography.families
   */
  fontFamilyBase:
    "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  /**
   * @domicile seed
   * @governor dial: typography.pairing
   */
  fontFamilyHeading:
    "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  fontFamilyMono:
    "var(--ds-font-pack-plex-mono, 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace)",
  /**
   * @domicile seed
   * @governor dial: typography.families
   */
  fontFamilyDisplay:
    "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  headingWeightBias: 'normal',
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  headingLetterSpacing: '-0.025em',
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  labelStyle: 'sentence',
  letterSpacing: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    display: '-0.025em',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    heading: '-0.015em',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    body: '0',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    mono: '0',
  },
  lineHeight: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    display: 1.1,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    heading: 1.2,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    body: 1.6,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    tight: 1.25,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    relaxed: 1.75,
  },
};

// ── SURFACES ──
/**
 * Familia mixta. Controles: palette.seeds, surfaces.effect-intensity.
 * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
 */
const SURFACES: BrandSurfaces = {
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  densityScale: 1.0,
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '18px', full: '9999px' },
  shadows: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-1
     */
    sm: 'var(--ds-elevation-1)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-2
     */
    md: 'var(--ds-elevation-2)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-3
     */
    lg: 'var(--ds-elevation-3)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-4
     */
    xl: 'var(--ds-elevation-4)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-1
     */
    xs: 'var(--ds-elevation-1)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-5
     */
    xxl: 'var(--ds-elevation-5)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.30)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    focusRing: '0 0 0 3px rgba(255, 255, 255, 0.12)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    focusRingError: '0 0 0 3px rgba(239, 68, 68, 0.16)',
  },
  elevations: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    level0: 'none',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    level1:
      'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.28)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    level2:
      'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.44), 0 6px 16px rgba(0, 0, 0, 0.34)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    level3:
      'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 12px rgba(0, 0, 0, 0.46), 0 12px 28px rgba(0, 0, 0, 0.40)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    level4:
      'inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 12px 24px rgba(0, 0, 0, 0.50), 0 20px 44px rgba(0, 0, 0, 0.44), 0 0 24px color-mix(in srgb, var(--ds-color-primary, #ffffff) 8%, transparent)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    level5:
      'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.56), 0 32px 64px rgba(0, 0, 0, 0.48), 0 0 32px color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent)',
  },
  /**
   * @domicile seed
   * @governor dial: surfaces.effect-intensity
   */
  glass: { blur: 'none', background: 'none', border: 'none' },
  /**
   * @domicile seed
   * @governor mixta medida en una sola linea: primary y surface por dial surfaces.effect-intensity; mesh sin control atribuido (dial en F4B) — las 3 hojas comparten linea fuente y no admiten docblock propio sin reformatear
   */
  gradients: { primary: 'none', surface: 'none', mesh: 'none' },
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  overlays: {
    light: 'rgba(255, 255, 255, 0.03)',
    medium: 'rgba(255, 255, 255, 0.06)',
    heavy: 'rgba(255, 255, 255, 0.1)',
  },
  /**
   * @placeholder SURFACES.effectIntensity
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
};

// ── MOTION ──
/**
 * @domicile pro-expert
 * @governor capability: motion (activa en rottay)
 */
const MOTION: BrandMotion = {
  intensity: 1.0,
  entrance: 'spring',
  entranceDuration: 300,
  hoverLift: 2,
  hoverScale: 1.01,
  useSpring: true,
  springTension: 170,
  springFriction: 26,
  staggerDelay: 50,
  staggerMax: 400,
  pulseSpeed: 'normal',
  skeletonStyle: 'shimmer',
  countUpEnabled: true,
};

// ── CHARTS ──
/**
 * Enum de charts: personalidad de grafico; no baja a canal.
 */
const CHARTS: FirstPartyBrandTheme['charts'] = {
  animateOnMount: true,
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
  mountDuration: 800,
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
  lineStyle: 'smooth',
  showDots: false,
  useGradientFill: true,
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
  tooltipStyle: 'minimal',
};

// ── CHROME ──
const CHROME: BrandChrome = {
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  badge: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-radius-sm
     */
    radius: 'var(--ds-radius-sm)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-spacing-1
     */
    gap: 'var(--ds-spacing-1)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-font-weight-medium
     */
    fontWeight: 'var(--ds-font-weight-medium)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-line-height-none
     */
    lineHeight: 'var(--ds-line-height-none)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderColor: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textColor: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultBg: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultColor: '#ECECEC',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    primaryBg: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryColor: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    secondaryColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBg: '#16A34A',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBg: '#D97706',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBg: '#EF4444',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoBg: '#3B82F6',
    /**
     * @placeholder CHROME.badge.chipRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.countBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.countBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.countFontFamily
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.countRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.errorColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.focusRing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.fontFamily
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.frame
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.frameHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.framePressed
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.height
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.highlight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.hoverTransform
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.iconBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.iconBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.iconRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.infoColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.ink
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.inkHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.letterSpacing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.motionDuration
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.motionEasing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.paddingX
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.pillRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.pressTransform
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.pulseDuration
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.pulseScale
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.removeBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.removeBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.removeHoverBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.removeRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.selectedFrame
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.selectedInk
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.selectedShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.selectedSurface
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.successColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.surface
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.surfaceHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.surfacePressed
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.touchTarget
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.warningColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },

  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  card: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultElevation: 'md',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    hoverElevation: 'lift-two',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    showBorder: false,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    hoverTint: true,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    paddingDensity: 'normal',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  accent: {
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    barPosition: 'top',
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    barThickness: 2,
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    barStyle: 'gradient',
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    iconContainerShape: 'rounded',
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    badgeShape: 'rounded',
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    dividerStyle: 'solid',
  },
  /**
   * @domicile seed
   * @governor dial: navigation.sidebar-tone
   */
  /**
   * @placeholder CHROME.metricCard
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia metricCard (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.listingGrid
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia listingGrid (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.filterPill
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia filterPill (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.detail
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia detail (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.compactCard
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia compactCard (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.collectionCard
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia collectionCard (gobernaria chrome.families)
   */
  sidebar: {
    /**
     * @domicile seed
     * @governor dial: navigation.sidebar-tone
     */
    bg: '#0D0D10',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: '#18181C',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    text: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textMuted: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    width: '296px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    collapsedWidth: '96px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerHeight: '104px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupFontSize: '10.9px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupFontWeight: 600,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupLetterSpacing: '0.085em',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupMarginTop: '1px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupMarginBottom: '1px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupPaddingTop: '3px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontSize: '16.35px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemIndent: '8px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeight: 450,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeightActive: 600,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColor: '#A0A0A5',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    itemColorActive: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgActive: 'rgba(255, 255, 255, 0.07)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemPadding: '0 13px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconSize: '17.25px',
    /**
     * @domicile derived
     * @governor deriva de: --ds-sidebar-bg
     */
    footerBg: 'var(--ds-sidebar-bg)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shellPaddingInline: '10px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shellPaddingCollapsed: '8px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemHeight: '62px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemChildHeight: '45px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontSizeChild: '14.2px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemPaddingInline: '13px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconColumnSize: '20px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemGap: '9px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    childPaddingInline: '6px',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  layout: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBg: 'rgba(12, 12, 14, 0.82)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBackdrop: 'blur(12px)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorder: 'rgba(255, 255, 255, 0.05)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-sidebar-bg
     */
    siderBg: 'var(--ds-sidebar-bg)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    siderBorder: '#18181C',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    dividerColor: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    dividerTextColor: '#ECECEC',
    /**
     * @placeholder CHROME.layout.headerHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  shell: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gridSize: '28px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gridLine: 'rgba(255, 255, 255, 0.03)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gridOpacity: 0.9,
    /**
     * @placeholder CHROME.shell.activeBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.activeGradient
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandFont
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandGlow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandGridBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandGridBgStrong
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandGridLine
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandGridLineSoft
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandGridLineStrong
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandGridSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeCompactActionHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeConsoleBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeConsoleMinHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeConsolePadding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeControlBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeControlBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeControlHoverBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeControlHoverBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeGridLine
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeHeroBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeIconBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeIconBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeMaxWidth
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeMeterBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeMeterFill
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomePanelBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomePanelBgStrong
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomePanelBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomePanelBorderSoft
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomePanelGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomePanelShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandHomeSurfaceBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandLetterSpacing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandLine
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.commandRailBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.dropdownShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.overlay
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.shell.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  breadcrumb: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    colorHover: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    colorActive: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    separatorColor: '#4A4A4F',
    /**
     * @placeholder CHROME.breadcrumb.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.breadcrumb.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.breadcrumb.fontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.breadcrumb.fontWeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.breadcrumb.itemColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.breadcrumb.linkColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.breadcrumb.padding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },

  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  list: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#18181B',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundColor: '#18181B',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderColor: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textColor: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryTextColor: '#A0A0A5',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    metaDescriptionColor: '#A0A0A5',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    splitColor: '#222226',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    skeletonBg: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBackgroundColor: '#18181B',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgHover: '#222226',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemHoverBackgroundColor: '#222226',
    /**
     * @placeholder CHROME.list.previewMotionDuration
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.previewMotionEase
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.previewPanelBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.previewPanelBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.previewPanelShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.previewRailGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.shellSectionGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },

  popover: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    contentColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: '#ECECEC',
  },

  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  /**
   * @placeholder CHROME.toolbar
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia toolbar (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.tallCard
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia tallCard (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.signalCard
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia signalCard (gobernaria chrome.families)
   */
  tooltip: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultBg: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultColor: '#0C0C0E',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    primaryBg: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryColor: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryBg: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryColor: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBg: '#16A34A',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBg: '#D97706',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40)',
    /**
     * @placeholder CHROME.tooltip.zIndex
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },

  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  search: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandPalette: {
      backdrop: 'rgba(0, 0, 0, 0.60)',
      bg: '#1A1A1E',
      border: '#2A2A2F',
      itemHoverBg: 'rgba(255, 255, 255, 0.04)',
      groupColor: '#6B6B72',
      emptyColor: '#6B6B72',
      shortcutBorder: '#2A2A2F',
    },
    /**
     * @placeholder CHROME.search.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.categoryColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.clearColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.clearColorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.emptyBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.iconColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.inputBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.inputBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.inputColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.placeholderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.resultBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.resultBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.resultBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.resultMetaColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.resultShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.resultTitleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.search.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Familia mixta. Controles: palette.seeds, typography.scale, chrome.families, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  controls: {
    semantic: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      ink: 'var(--ds-color-text-primary)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      inkMuted: 'var(--ds-color-text-secondary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      onBrand:
        'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card-bg
       */
      surface: 'var(--ds-surface-card-bg)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      surfaceRaised:
        'color-mix(in srgb, var(--ds-control-surface) 86%, var(--ds-surface-panel-bg))',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      brandTint:
        'color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-control-surface))',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      brandTintHover:
        'color-mix(in srgb, var(--ds-color-primary) 15%, var(--ds-control-surface))',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      brandBorder:
        'color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border))',
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-icon-border
       */
      iconTileBorder: 'var(--ds-surface-icon-border)',
    },
    fieldGeometry: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-spacing-2
       */
      gap: 'var(--ds-spacing-2)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-font-weight-normal
       */
      fontWeight: 'var(--ds-font-weight-normal)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-letter-spacing-body
       */
      letterSpacing: 'var(--ds-letter-spacing-body, 0)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-font-size-xs
       */
      labelFontSize: 'var(--ds-font-size-xs)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-font-weight-medium
       */
      labelFontWeight: 'var(--ds-font-weight-medium)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-font-size-xs
       */
      helperFontSize: 'var(--ds-font-size-xs)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      loadingStroke: '1.5',
      /**
       * @domicile derived
       * @governor deriva de: --ds-motion-fast
       */
      transitionDuration: 'var(--ds-motion-fast)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-motion-ease-out
       */
      transitionTiming: 'var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
      xs: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        height: 'calc(var(--ds-input-md-height) - 0.5rem)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xs-height
         */
        paddingX: 'calc(var(--ds-input-xs-height) * 0.35)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xs-height
         */
        paddingY: 'calc(var(--ds-input-xs-height) * 0.2)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-font-size-xs
         */
        fontSize: 'var(--ds-font-size-xs)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-xs-size
         */
        iconSize: 'var(--ds-icon-xs-size)',
      },
      sm: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        height: 'calc(var(--ds-input-md-height) - 0.25rem)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-sm-height
         */
        paddingX: 'calc(var(--ds-input-sm-height) * 0.35)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-sm-height
         */
        paddingY: 'calc(var(--ds-input-sm-height) * 0.2)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-type-scale
         */
        fontSize: 'calc(0.8125rem * var(--ds-type-scale, 1))',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-sm-size
         */
        iconSize: 'calc(var(--ds-icon-sm-size) - 2px)',
      },
      md: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: '2.25rem',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        paddingX: 'calc(var(--ds-input-md-height) * 0.35)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        paddingY: 'calc(var(--ds-input-md-height) * 0.2)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-font-size-sm
         */
        fontSize: 'var(--ds-font-size-sm)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-sm-size
         */
        iconSize: 'var(--ds-icon-sm-size)',
      },
      lg: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        height: 'calc(var(--ds-input-md-height) + 0.375rem)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-lg-height
         */
        paddingX: 'calc(var(--ds-input-lg-height) * 0.35)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-lg-height
         */
        paddingY: 'calc(var(--ds-input-lg-height) * 0.2)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-font-size-base
         */
        fontSize: 'var(--ds-font-size-base)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-sm-size
         */
        iconSize: 'calc(var(--ds-icon-sm-size) + 2px)',
      },
      xl: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        height: 'calc(var(--ds-input-md-height) + 0.875rem)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xl-height
         */
        paddingX: 'calc(var(--ds-input-xl-height) * 0.35)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xl-height
         */
        paddingY: 'calc(var(--ds-input-xl-height) * 0.2)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-font-size-lg
         */
        fontSize: 'var(--ds-font-size-lg)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-md-size
         */
        iconSize: 'var(--ds-icon-md-size)',
      },
    },

    buttonGeometry: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-font-weight-medium
       */
      fontWeight: 'var(--ds-font-weight-medium)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-letter-spacing-body
       */
      letterSpacing: 'var(--ds-letter-spacing-body, 0)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-input-md-height
       */
      gap: 'calc(var(--ds-input-md-height) * 0.18)',
      xs: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xs-height
         */
        height: 'var(--ds-input-xs-height)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xs-height
         */
        paddingX: 'calc(var(--ds-input-xs-height) * 0.42)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xs-height
         */
        gap: 'calc(var(--ds-input-xs-height) * 0.18)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-font-size-xs
         */
        fontSize: 'var(--ds-font-size-xs)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-xs-size
         */
        iconSize: 'var(--ds-icon-xs-size)',
      },
      sm: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-sm-height
         */
        height: 'var(--ds-input-sm-height)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-sm-height
         */
        paddingX: 'calc(var(--ds-input-sm-height) * 0.42)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-sm-height
         */
        gap: 'calc(var(--ds-input-sm-height) * 0.18)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-type-scale
         */
        fontSize: 'calc(0.8125rem * var(--ds-type-scale, 1))',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-sm-size
         */
        iconSize: 'calc(var(--ds-icon-sm-size) - 2px)',
      },
      md: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        height: 'var(--ds-input-md-height)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        paddingX: 'calc(var(--ds-input-md-height) * 0.42)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-md-height
         */
        gap: 'calc(var(--ds-input-md-height) * 0.18)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-font-size-sm
         */
        fontSize: 'var(--ds-font-size-sm)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-sm-size
         */
        iconSize: 'var(--ds-icon-sm-size)',
      },
      lg: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-lg-height
         */
        height: 'var(--ds-input-lg-height)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-lg-height
         */
        paddingX: 'calc(var(--ds-input-lg-height) * 0.42)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-lg-height
         */
        gap: 'calc(var(--ds-input-lg-height) * 0.18)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-font-size-base
         */
        fontSize: 'var(--ds-font-size-base)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-sm-size
         */
        iconSize: 'calc(var(--ds-icon-sm-size) + 2px)',
      },
      xl: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xl-height
         */
        height: 'var(--ds-input-xl-height)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xl-height
         */
        paddingX: 'calc(var(--ds-input-xl-height) * 0.42)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-input-xl-height
         */
        gap: 'calc(var(--ds-input-xl-height) * 0.18)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-font-size-lg
         */
        fontSize: 'var(--ds-font-size-lg)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-line-height-tight
         */
        lineHeight: 'var(--ds-line-height-tight)',
        /**
         * @domicile derived
         * @governor deriva de: --ds-icon-md-size
         */
        iconSize: 'var(--ds-icon-md-size)',
      },
    },

    // ---- CTRL-04 PRESERVATION PINS (R1 Cohort 1) ----
    // NOT new product decisions. Each value is what this vertical ALREADY
    // resolves today, moved from an implicit engine-tier default onto
    // explicit ownership so the engine defaults can be deleted without
    // changing what this vertical paints. Pinned BY REFERENCE because
    // --ds-shadow-* are dark-aware and a literal would regress dark mode.
    // Generated from receipts/cohort-1-button-shadow-state-census.json.
    segmented: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBg: 'transparent',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgSelected: '#222226',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-muted
       */
      itemColor: 'var(--ds-color-text-muted)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
       */
      itemColorHover: 'var(--ds-color-text-page)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemColorSelected: '#ECECEC',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: '0 1px 2px rgba(0, 0, 0, 0.20)',
    },
    buttonAI: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest
       */
      shadow: "var(--ds-shadow-button-rest)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-hover
       */
      shadowHover: "var(--ds-shadow-button-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest
       */
      shadowActive: "var(--ds-shadow-button-rest)",
    },
    buttonDashed: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadow: "none",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-dashed-shadow
       */
      shadowHover: "var(--ds-button-dashed-shadow)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-dashed-shadow
       */
      shadowActive: "var(--ds-button-dashed-shadow)",
    },
    /**
     * @domicile seed
     * @governor mixta medida en linea compartida: 4 por dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a); 3 por dial: palette.seeds; 1 por dial: chrome.families — las 8 hojas comparten una sola linea fuente y no admiten docblock propio sin reformatear
     */
    buttonPrimary: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest, --ds-color-primary
       */
      shadowActive: "var(--ds-shadow-button-rest)", bg: 'var(--ds-color-primary)', bgHover: '#E0E0E0', bgActive: '#D4D4D8', text: '#0C0C0E', color: '#0C0C0E', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.30)', shadowHover: '0 2px 12px rgba(255, 255, 255, 0.08)' },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    buttonSecondary: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest
       */
      shadow: "var(--ds-shadow-button-rest)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-hover
       */
      shadowHover: "var(--ds-shadow-button-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest
       */
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#2A2A2F', bgHover: '#3A3A40', bgActive: '#4A4A4F', text: '#ECECEC', color: '#ECECEC', border: '#3A3A40', borderHover: 'rgba(255, 255, 255, 0.14)' },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    buttonDefault: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest
       */
      shadow: "var(--ds-shadow-button-rest)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-hover
       */
      shadowHover: "var(--ds-shadow-button-hover)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorHover: '#ECECEC',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorActive: '#ECECEC',
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest
       */
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#18181B', bgHover: '#222226', bgActive: '#2A2A2F', text: '#ECECEC', color: '#ECECEC', border: '#3A3A40', borderHover: 'rgba(255, 255, 255, 0.18)', borderActive: 'rgba(255, 255, 255, 0.22)',
},
    /**
     * @domicile seed
     * @governor mixta medida en linea compartida: 3 por dial: token-overrides; 2 por dial: palette.seeds; 1 por dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a) — las 6 hojas comparten una sola linea fuente y no admiten docblock propio sin reformatear
     */
    buttonGhost: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadow: "none",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-ghost-shadow
       */
      shadowHover: "var(--ds-button-ghost-shadow)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-ghost-shadow, --ds-color-text-page
       */
      shadowActive: "var(--ds-button-ghost-shadow)", bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', bgActive: 'rgba(255, 255, 255, 0.08)', text: '#A0A0A5', color: 'var(--ds-color-text-page)', colorHover: '#ECECEC',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      colorActive: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial: token-overrides
       */
      border: 'transparent',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderHover: 'transparent',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderActive: 'transparent',
},
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    buttonText: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadow: "none",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-text-shadow
       */
      shadowHover: "var(--ds-button-text-shadow)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-text-shadow, --ds-color-text-page
       */
      shadowActive: "var(--ds-button-text-shadow)", bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', bgActive: 'rgba(255, 255, 255, 0.08)', text: '#A0A0A5', color: 'var(--ds-color-text-page)', colorHover: '#ECECEC',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      colorActive: 'var(--ds-color-primary)',
},
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    buttonLink: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadow: "none",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-link-shadow
       */
      shadowHover: "var(--ds-button-link-shadow)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-link-shadow
       */
      shadowActive: "var(--ds-button-link-shadow)", color: '#ECECEC', colorHover: '#FFFFFF', colorActive: '#D4D4D8' },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    buttonSuccess: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-success-sm
       */
      shadow: "var(--ds-shadow-success-sm)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-success-shadow
       */
      shadowHover: "var(--ds-button-success-shadow)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-success-shadow
       */
      shadowActive: "var(--ds-button-success-shadow)", bg: '#16A34A', bgHover: '#15803D', bgActive: '#166534', text: '#ffffff', color: '#ffffff', border: 'transparent' },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    buttonWarning: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-warning-sm
       */
      shadow: "var(--ds-shadow-warning-sm)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-warning-shadow
       */
      shadowHover: "var(--ds-button-warning-shadow)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-warning-shadow
       */
      shadowActive: "var(--ds-button-warning-shadow)", bg: '#D97706', bgHover: '#B45309', bgActive: '#92400E', text: '#FFFFFF', color: '#FFFFFF', border: 'transparent' },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    buttonError: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-error-sm
       */
      shadow: "var(--ds-shadow-error-sm)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-error-sm
       */
      shadowHover: "var(--ds-shadow-error-sm)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-error-sm
       */
      shadowActive: "var(--ds-shadow-error-sm)", bg: '#EF4444', bgHover: '#DC2626', bgActive: '#B91C1C', text: '#ffffff', color: '#ffffff', border: 'transparent' },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    buttonInfo: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest
       */
      shadow: "var(--ds-shadow-button-rest)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-info-shadow
       */
      shadowHover: "var(--ds-button-info-shadow)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-info-shadow
       */
      shadowActive: "var(--ds-button-info-shadow)", bg: '#3B82F6', bgHover: '#2563EB', bgActive: '#1D4ED8', text: '#ffffff', color: '#ffffff', border: 'transparent' },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    disabled: { opacity: 0.4, bg: '#18181B', text: '#52525B', border: '#2A2A2F', borderColor: '#2A2A2F' },
    /**
     * @domicile derived
     * @governor deriva de: --ds-focus-ring
     */
    focusRing: 'var(--ds-focus-ring)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    focusRingColor: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textarea: {
      bg: '#131316',
      bgDisabled: '#101012',
      filledBg: '#1A1A1E',
      color: '#ECECEC',
      colorPlaceholder: '#6B6B72',
      countColor: '#6B6B72',
      border: '#2A2A2F',
      borderHover: '#3A3A40',
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      shadowFocus: '0 0 0 2px rgba(255, 255, 255, 0.10)',
      successBorder: '#16A34A',
      warningBorder: '#D97706',
    },
    form: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
       */
      labelColor: 'var(--ds-color-text-page)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelFontWeight: '600',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      helpColor: '#6B6B72',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      extraColor: '#6B6B72',
    },
    input: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgHover: '#1A1A1E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgFocus: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgDisabled: '#18181B',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      color: '#ECECEC',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorPlaceholder: '#6B6B72',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorDisabled: '#52525B',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: '#2A2A2F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderHover: '#3A3A40',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderDisabled: '#2A2A2F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      disabledOpacity: 0.4,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadowFocus: '0 0 0 3px rgba(255, 255, 255, 0.10)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      filled: { bg: '#1A1A1E', bgHover: '#222226', bgFocus: '#1A1A1E' },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      addon: { bg: '#1A1A1E', color: '#6B6B72', border: '#2A2A2F' },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      label: { color: 'var(--ds-color-text-page)' },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      helper: { color: '#6B6B72', errorFontWeight: 'var(--ds-font-weight-medium)' },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      clear: { color: '#6B6B72', colorHover: 'var(--ds-color-text-page)' },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      readOnly: { borderStyle: 'solid', cursor: 'text' },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      successBorder: '#16A34A',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      successShadowFocus: '0 0 0 2px rgba(34, 197, 94, 0.18)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      warningBorder: '#D97706',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      warningShadowFocus: '0 0 0 2px rgba(245, 158, 11, 0.18)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorBorder: '#EF4444',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorShadowFocus: '0 0 0 2px rgba(239, 68, 68, 0.18)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorColor: '#EF4444',
    },
    select: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: '#131316',
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control, --ds-color-bg-input, --ds-color-white
       */
      bgHover: 'var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))',
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control, --ds-color-bg-input, --ds-color-white
       */
      bgFocus: 'var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      color: '#ECECEC',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorPlaceholder: '#6B6B72',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-300
       */
      borderColor: 'var(--ds-color-neutral-300)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-400
       */
      borderColorHover: 'var(--ds-color-neutral-400)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-500
       */
      borderColorFocus: 'var(--ds-color-primary-500)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      dropdownBg: '#1A1A1E',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-200
       */
      dropdownBorderColor: 'var(--ds-color-neutral-200)',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      dropdownShadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionBgHover: 'rgba(255, 255, 255, 0.04)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionBgSelected: '#2A2A2F',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-900
       */
      optionColor: 'var(--ds-color-neutral-900)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionColorSelected: '#ECECEC',
      // ROTTAY-T2 MASS: the eighteen select channels drained from the artifact.
      // `border` is the artifact's `--ds-select-border` and is a different
      // channel from `borderColor` (`--ds-select-border-color`) above.
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      arrowColor: '#6B6B72',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgDisabled: '#101012',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: '#2A2A2F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderHover: '#3A3A40',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      checkColor: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      clearColor: '#6B6B72',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
       */
      clearColorHover: 'var(--ds-color-text-page)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorDisabled: '#4A4A4F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      dropdownBorder: '#2A2A2F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      filledBg: '#1A1A1E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionColorDisabled: '#4A4A4F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadowFocus: '0 0 0 2px rgba(255, 255, 255, 0.10)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      successBorder: '#16A34A',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      tagBg: '#2A2A2F',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
       */
      tagColor: 'var(--ds-color-text-page)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      warningBorder: '#D97706',
    },
    autocomplete: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: '#2A2A2F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      clearColor: '#6B6B72',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      dropdownBg: '#1A1A1E',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      dropdownShadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      emptyColor: '#6B6B72',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionBgHover: 'rgba(255, 255, 255, 0.04)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      warningBorder: '#D97706',
    },
    checkbox: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgDisabled: '#101012',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: 'rgba(255, 255, 255, 0.18)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderHover: 'rgba(255, 255, 255, 0.28)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      checkedBg: 'var(--ds-color-primary)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      checkedBorder: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      checkedColor: '#0C0C0E',
      /**
       * @domicile seed
       * @governor dial: token-overrides
       */
      errorBorder: '#EF4444',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRingColor: 'rgba(255, 255, 255, 0.12)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelColor: '#ECECEC',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelColorDisabled: '#4A4A4F',
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    datePicker: {
      bg: '#131316',
      bgDisabled: '#101012',
      border: '#2A2A2F',
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      borderHover: '#3A3A40',
      clearColor: '#6B6B72',
      color: '#ECECEC',
      iconColor: '#6B6B72',
      separatorColor: '#6B6B72',
      shadowFocus: '0 0 0 2px rgba(255, 255, 255, 0.10)',
      warningBorder: '#D97706',
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    inputNumber: {
      addonBg: '#1A1A1E',
      addonBorder: '#2A2A2F',
      addonColor: '#6B6B72',
      affixColor: '#6B6B72',
      bg: '#131316',
      bgDisabled: '#101012',
      border: '#2A2A2F',
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      color: '#ECECEC',
      controlColor: '#6B6B72',
      shadowFocus: '0 0 0 2px rgba(255, 255, 255, 0.10)',
      warningBorder: '#D97706',
    },
    radio: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgDisabled: '#101012',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: 'rgba(255, 255, 255, 0.18)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderHover: 'rgba(255, 255, 255, 0.28)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      checkedBg: '#131316',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      checkedBorder: 'var(--ds-color-primary)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      checkedDot: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      descriptionColor: '#6B6B72',
      /**
       * @domicile seed
       * @governor dial: token-overrides
       */
      errorBorder: '#EF4444',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRingColor: 'rgba(255, 255, 255, 0.12)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelColor: '#ECECEC',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelColorDisabled: '#4A4A4F',
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    rate: {
      color: '#4A4A4F',
    },
    slider: {
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      handleBg: '#FFFFFF',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      handleBgDisabled: '#4A4A4F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      handleBorder: '#0C0C0E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      handleShadow: '0 1px 3px rgba(0, 0, 0, 0.40)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      markColor: '#6B6B72',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      railColor: 'rgba(255, 255, 255, 0.10)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      trackColor: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      trackColorDisabled: '#4A4A4F',
    },
    switch: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: 'rgba(255, 255, 255, 0.14)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgHover: 'rgba(255, 255, 255, 0.18)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      checkedBg: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      checkedBgHover: '#E0E0E0',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelColor: '#ECECEC',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      thumbBg: '#0C0C0E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      thumbShadow: '0 1px 2px rgba(0, 0, 0, 0.30)',
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    timePicker: {
      bg: '#131316',
      bgDisabled: '#101012',
      border: '#2A2A2F',
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      clearColor: '#6B6B72',
      color: '#ECECEC',
      iconColor: '#6B6B72',
      separatorColor: '#6B6B72',
      shadowFocus: '0 0 0 2px rgba(255, 255, 255, 0.10)',
      warningBorder: '#D97706',
    },
    toggle: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      descriptionColor: '#6B6B72',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      dotBg: '#0C0C0E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      dotShadow: '0 1px 2px rgba(0, 0, 0, 0.30)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorBg: '#EF4444',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      innerLabelColor: '#0C0C0E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelColor: '#ECECEC',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      successBg: '#22C55E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      trackBg: 'rgba(255, 255, 255, 0.14)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      trackBgChecked: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      warningBg: '#F59E0B',
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    transfer: {
      bg: '#18181B',
      border: '#2A2A2F',
      headerBg: '#131316',
      headerBorder: '#2A2A2F',
      itemBgHover: 'rgba(255, 255, 255, 0.04)',
    },
    upload: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: 'rgba(255, 255, 255, 0.10)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderHover: 'rgba(255, 255, 255, 0.20)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonBg: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonBorder: '#2A2A2F',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
       */
      buttonColor: 'var(--ds-color-text-page)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      cardBg: '#1A1A1E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      cardBorder: '#2A2A2F',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      draggerBg: '#131316',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      draggerBgHover: '#1A1A1E',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      draggerBorder: '#2A2A2F',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary (semilla de marca, K1)
       */
      draggerBorderActive: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      draggerIconColor: '#6B6B72',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
       */
      draggerTextColor: 'var(--ds-color-text-page)',
      /**
       * @domicile seed
       * @governor dial: token-overrides
       */
      errorBorder: '#EF4444',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      fileBg: '#1A1A1E',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
       */
      fileColor: 'var(--ds-color-text-page)',
      /**
       * @domicile seed
       * @governor dial: token-overrides
       */
      fileRemoveColor: '#EF4444',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      previewBackdrop: 'rgba(0, 0, 0, 0.70)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      previewOverlay: 'rgba(0, 0, 0, 0.50)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary
       */
      progressBar: 'var(--ds-color-primary)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      progressTrack: '#222226',
    },
    /**
     * @placeholder CHROME.controls.buttonGeometry.lg.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGeometry.md.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGeometry.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGeometry.sm.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGeometry.xl.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGeometry.xs.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.actionRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.actionSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.affixRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.affixSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.affixSizeCompact
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.borderStyle
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.borderWidth
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.formFieldDisabledOpacity
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.formFieldGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.groupGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.groupGapSeparated
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.groupMinItemWidth
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.groupOverlap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.helperLineHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.horizontalGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.labelLetterSpacing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.labelLineHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.labelOffsetY
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.lg.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.loadingDuration
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.loadingSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.md.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.messageGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.requiredGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.sm.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.textareaMaxHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.textareaMinHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.textareaPaddingX
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.textareaPaddingY
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.textareaRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.textareaResize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.touchTargetMin
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.xl.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.fieldGeometry.xs.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.addon.fontWeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.addon.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.affix
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.autofill
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.borderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.borderColorFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.borderColorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.caretColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.clear.activeTransform
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.clear.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.clear.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.clear.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.clear.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.clear.focusRing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.clear.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.count
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.errorBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.filled.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.helper.errorColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.insetShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.label.disabledColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.label.requiredColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.loadingColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.placeholderOpacity
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.readOnly.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.readOnly.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.readOnly.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.selectionBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.selectionColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.shadowRest
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.successBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.warningBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.focusRing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.gap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.itemBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.itemFontWeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.itemFontWeightSelected
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.itemRadius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.itemShadowSelected
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.lg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.md
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.padding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.segmented.sm
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  surface: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overlayBg: 'rgba(0, 0, 0, 0.64)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    imageOverlayBg: 'rgba(0, 0, 0, 0.70)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    cardCoverOverlayBg:
      'linear-gradient( to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.8) 100% )',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gradientDark: 'linear-gradient(135deg, #0C0C0E 0%, #131316 50%, #1A1A1E 100%)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    watermarkColor: '#222226',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    pageShellSubtitleColor: '#A0A0A5',
    /**
     * @domicile derived
     * @governor deriva de: --ds-radius-md
     */
    radiusMd: 'var(--ds-radius-md)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-shadow-sm
     */
    shadow: 'var(--ds-shadow-sm)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-shadow-md
     */
    shadowHover: 'var(--ds-shadow-md)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    iconBg:
      'linear-gradient(145deg, color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card-bg)), color-mix(in srgb, var(--ds-color-secondary) 10%, var(--ds-surface-card-bg)))',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    iconBorder:
      'color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-surface-card-border))',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary, --ds-surface-card-bg
     */
    chipBg: 'color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card-bg))',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    cardSideAccentSoft: 'transparent',
    /**
     * @domicile derived
     * @governor deriva de: --ds-premium-card-grid-size
     */
    cardGridSize: 'var(--ds-premium-card-grid-size, 22px)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    cardGridLine:
      'color-mix(in srgb, var(--ds-signal-card-accent, var(--ds-color-primary)) 5%, transparent)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    cardGridBg:
      'linear-gradient(var(--ds-surface-card-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ds-surface-card-grid-line) 1px, transparent 1px)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-shadow-md
     */
    popoverShadow: 'var(--ds-shadow-md)',
  },
  premiumCard: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-material-card-background, --ds-card-bg
     */
    bg: 'var(--ds-material-card-background, var(--ds-card-bg))',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    sheen:
      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--ds-card-bg) 42%, transparent), transparent)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-rich-card-header-bg
     */
    headerBg: 'var(--ds-rich-card-header-bg)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-rich-card-section-bg
     */
    sectionBg: 'var(--ds-rich-card-section-bg)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-rich-card-section-alt-bg
     */
    sectionAltBg: 'var(--ds-rich-card-section-alt-bg)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-bg-secondary, --ds-card-bg
     */
    footerBg: 'color-mix(in srgb, var(--ds-color-bg-secondary) 72%, var(--ds-card-bg))',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border:
      'var(--ds-material-card-border, color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-card-border-color)))',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover:
      'var(--ds-material-card-border-hover, color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-material-card-border-strong, var(--ds-card-border-color))))',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    selectedBorder:
      'var(--ds-material-card-border-selected, color-mix(in srgb, var(--ds-color-primary) 46%, var(--ds-material-card-border-strong, var(--ds-card-border-color))))',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    selectedRing:
      'var(--ds-material-card-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 12%, transparent))',
  },
  table: {
    /**
     * @domicile seed
     * @governor coincide en color con la emision de tier.base.bg; byte-identico medido (#0C0C0E)
     */
    bg: SEED.surface.canvas,
    /**
     * @domicile seed
     * @governor coincide en color con la familia de rol borde del tema (#2A2A2F, 72 claves: border ×20, headerBorder ×4, borderColor ×4, footerBorder ×3, dividerColor ×2, cardBorder ×2, …): relacion por rol declarada; NO coincide con PALETTE.borderColor (rottay:3466, #28282C); la unica coincidencia en PALETTE es interactiveBgActiveColor (:3512), rol distinto: accidente declarado
     */
    border: SEED.edge.strong,
    /**
     * @domicile seed
     * @governor coincide en color con la familia de rol fondo secundario del tema (#131316, 22 claves: bg ×13, headerBg ×3, …): relacion por rol declarada; sin coincidencia en PALETTE (backgroundSecondaryColor #0F0F12, backgroundTertiaryColor #141417 difieren); converge internamente con CHROME.table.rowBgStriped
     */
    headerBg: SEED.surface.raised,
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    headerColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor sin coincidencia con PALETTE ni con raiz; converge con el valor autorado por bithire para el mismo eje (600) y diverge de evnto (500); cardinalidad medida 4, toda en claves de rol font-weight
     */
    headerFontWeight: SEED.typeDetail.tableHeaderWeight,
    /**
     * @domicile seed
     * @governor sin coincidencia medida con raiz ni canal vivo (limpia, K-4 packet v2); converge con el valor autorado por bithire para el mismo eje (0.6875rem)
     */
    headerFontSize: SEED.typeDetail.tableHeaderSize,
    /**
     * @domicile seed
     * @governor coincide en color con la emision de tier.base.bg; byte-identico medido (#0C0C0E)
     */
    rowBg: SEED.surface.canvas,
    /**
     * @domicile seed
     * @governor superposicion alfa propia del eje; 3 ocurrencias en el archivo: esta hoja, iconBg (:7686) y un ingrediente de gradiente (:7742), ambas de rol distinto: accidente declarado; sin coincidencia de mismo rol
     */
    rowBgHover: SEED.veil.hover,
    /**
     * @domicile seed
     * @governor coincide en color con la familia de rol fondo secundario del tema (#131316, 22 claves: bg ×13, headerBg ×3, …): relacion por rol declarada; sin coincidencia en PALETTE (backgroundSecondaryColor #0F0F12, backgroundTertiaryColor #141417 difieren); converge internamente con CHROME.table.headerBg
     */
    rowBgStriped: SEED.surface.raised,
    /**
     * @domicile seed
     * @governor 6 ocurrencias en el archivo; las otras 5 (headerBorder :4426, bgHover de botones :5669/:5710, closeBgHover :7566, borderColor :7977) son de rol distinto (hover/borde vs seleccionado): accidente declarado; NO coincide con --ds-select-option-bg-selected de rottay (#2A2A2F, artefacto, evidencia de valor) — a diferencia del mismo eje en bithire
     */
    rowBgSelected: SEED.veil.selected,
    /**
     * @domicile derived
     * @governor deriva de: --ds-border-color-muted (A2-3); medido dark #222226 / light #EDEDEC, identicos a lo shippeado; el pin del overlay se retira
     */
    rowBorder: 'var(--ds-border-color-muted)',
    /**
     * @domicile seed
     * @governor sin coincidencia medida con raiz ni canal vivo (limpia, K-4 packet v2)
     */
    cellPadding: SEED.rhythm.tableCellPadding,
    /**
     * @domicile derived
     * @governor deriva de: --ds-text-body-size (A2-4); 0.875rem plano-invariante medido; la mueve typography.scale
     */
    cellFontSize: 'calc(var(--ds-text-body-size) * var(--ds-type-scale, 1))',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text (A2-5); medido dark #ECECEC / light #1A1A1A, identicos a lo shippeado; el pin del overlay se retira
     */
    cellColor: 'var(--ds-color-text)',
    /**
     * @domicile seed
     * @governor sin coincidencia medida con raiz ni canal vivo (limpia, K-4 packet v2)
     */
    loadingOverlayBg: SEED.scrim.loading,
    /**
     * @domicile derived
     * @governor deriva de: --ds-input-md-height
     */
    headerBlockSize: 'calc(var(--ds-input-md-height) - 0.25rem)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-text-eyebrow-letter-spacing
     */
    headerLetterSpacing: `calc(var(--ds-text-eyebrow-letter-spacing, 0.08em) * ${SEED.typeDetail.tableHeaderTrackingRatio})`,
    /**
     * @domicile seed
     * @governor valor keyword none: declara ausencia de efecto, no un color; sin coincidencia de color posible
     */
    sheen: 'none',
  },
  /**
   * @absent CHROME.table.actionBg
   * @governor sin emision en :root; el skin resuelve --ds-table-action-bg con su propio fallback (data-table.css:697): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.actionBorder
   * @governor sin emision en :root; el skin resuelve --ds-table-action-border con su propio fallback (data-table.css:696): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.cellPaddingComfortable
   * @governor el eje de densidad de bithire (compact/comfortable/spacious) colapsa a un unico cellPadding en este tema: no hay eje de 3 peldanos que autorar, no es gap
   */
  /**
   * @absent CHROME.table.cellPaddingCompact
   * @governor el eje de densidad de bithire (compact/comfortable/spacious) colapsa a un unico cellPadding en este tema: no hay eje de 3 peldanos que autorar, no es gap
   */
  /**
   * @absent CHROME.table.cellPaddingSpacious
   * @governor el eje de densidad de bithire (compact/comfortable/spacious) colapsa a un unico cellPadding en este tema: no hay eje de 3 peldanos que autorar, no es gap
   */
  /**
   * @absent CHROME.table.filterFocusShadow
   * @governor canal muerto: sin coincidencia de raiz y 0 lecturas en modern/skin bajo --ds-table-filter-focus-shadow; el tema no autora esta hoja porque el canal no pinta, no por gap
   */
  /**
   * @absent CHROME.table.filterRowBg
   * @governor canal muerto: sin coincidencia de raiz y 0 lecturas en modern/skin bajo --ds-table-filter-row-bg; el tema no autora esta hoja porque el canal no pinta, no por gap
   */
  /**
   * @absent CHROME.table.headerBgHover
   * @governor sin coincidencia de raiz en default.css ni consumo medido en modern/skin bajo --ds-table-header-bg-hover (0 lecturas); el tema no autora esta hoja: minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.headerBorder
   * @governor sin emision en :root; el skin resuelve --ds-table-header-border con su propio fallback (data-table.css:1179): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.headerShadow
   * @governor sin emision en :root; el skin resuelve --ds-table-header-shadow con su propio fallback (data-table.css:1178): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.headerTextTransform
   * @governor coincide con la emision de raiz --ds-table-header-text-transform (default.css:1714): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.pageButtonHoverShadow
   * @governor sin emision en :root; el skin resuelve --ds-table-page-button-hover-shadow con su propio fallback (data-table.css:1519): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.radius
   * @governor coincide con la emision de raiz --ds-table-radius (default.css:1706): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.reorderBg
   * @governor sin emision en :root; el skin resuelve --ds-table-reorder-bg con su propio fallback (data-table.css:1251): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.resizeBg
   * @governor sin emision en :root; el skin resuelve --ds-table-resize-bg con su propio fallback (data-table.css:1278): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.resizeBgHover
   * @governor sin emision en :root; el skin resuelve --ds-table-resize-bg-hover con su propio fallback (data-table.css:1250): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.rowBgExpanded
   * @governor sin emision en :root; el skin resuelve --ds-table-row-bg-expanded con su propio fallback (data-table.css:1414): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.rowFocusShadow
   * @governor sin emision en :root; el skin resuelve --ds-table-row-focus-shadow con su propio fallback (data-table.css:1327): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.rowHoverShadow
   * @governor sin emision en :root; el skin resuelve --ds-table-row-hover-shadow con su propio fallback (data-table.css:1347): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * Familia mixta. Controles: typography.scale, palette.seeds.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  cardComponent: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-spacing-3
     */
    paddingSm: 'var(--ds-spacing-3)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-spacing-4
     */
    paddingMd: 'var(--ds-spacing-4)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-spacing-5
     */
    paddingLg: 'var(--ds-spacing-5)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-spacing-6
     */
    paddingXl: 'var(--ds-spacing-6)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-spacing-4, --ds-spacing-3
     */
    headerPadding: 'var(--ds-spacing-4) var(--ds-spacing-4) var(--ds-spacing-3)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-spacing-4
     */
    bodyPadding: 'var(--ds-spacing-4)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-spacing-3, --ds-spacing-4
     */
    footerPadding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-font-size-sm
     */
    titleFontSize: 'var(--ds-font-size-sm)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-font-weight-medium
     */
    titleFontWeight: 'var(--ds-font-weight-medium)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#18181B',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bgHover: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover: '#3A3A40',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderAccentHover: 'rgba(255, 255, 255, 0.14)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-1
     */
    shadow: 'var(--ds-elevation-1)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-2
     */
    shadowHover: 'var(--ds-elevation-2)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-elevation-3
     */
    shadowElevated: 'var(--ds-elevation-3)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerColor: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: '#ECECEC',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    subtitleColor: 'var(--ds-color-text-page)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    bodyColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBg: '#101012',
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        imagePlaceholderBg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    imagePlaceholderColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    imageLoadingTrack: '#222226',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    imageLoadingActive: '#ECECEC',
    /**
     * @placeholder CHROME.cardComponent.borderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.colorMuted
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.focusRing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.footerBorderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.footerColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.headerBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.headerBorderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.hoverTransform
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.padding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.titleLetterSpacing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
},
  modal: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: '0 24px 64px rgba(0, 0, 0, 0.40)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overlayBg: 'rgba(0, 0, 0, 0.64)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overlayBackdrop: 'blur(10px)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBg: '#222226',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    subtitleColor: '#6B6B72',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    bodyColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    closeColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    closeColorHover: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    closeBgHover: 'rgba(255, 255, 255, 0.05)',
  },
  tabs: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    colorHover: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    colorActive: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bgHover: 'rgba(255, 255, 255, 0.03)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    borderActive: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listBg: '#141416',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listRadius: '8px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listPadding: '3px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.035)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listTexture:
      'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.14) 0.5px, transparent 0.75px)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listTextureOpacity: 0.12,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.035)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemRadius: '6px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeight: 450,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeightActive: 620,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeBg: '#222226',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeShadow:
      'inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 1px 3px rgba(0, 0, 0, 0.34)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeHighlight:
      'linear-gradient(118deg, transparent 12%, rgba(255, 255, 255, 0.06) 48%, transparent 76%)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeHighlightOpacity: 0.46,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    pressedTransform: 'translateY(0) scale(0.985)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconBg: 'rgba(255, 255, 255, 0.025)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconBgActive: 'rgba(255, 255, 255, 0.055)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconPadding: '4px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeBg: 'rgba(255, 255, 255, 0.035)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeBgActive: 'rgba(255, 255, 255, 0.08)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeColorActive: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeBorderActive: '#3A3A40',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelBg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelRadius: '10px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelShadow: '0 14px 36px rgba(0, 0, 0, 0.18)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelTexture:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.025), transparent 42%)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overflowControlBg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overflowControlBgHover: '#222226',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overflowControlShadow: '0 2px 8px rgba(0, 0, 0, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overflowControlShadowHover: '0 6px 16px rgba(0, 0, 0, 0.30)',
    /**
     * @placeholder CHROME.tabs.activeRevealDuration
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.gap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.iconShadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.indicatorHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.itemGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.lgFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.lgHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.lgIconSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.lgPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.mdFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.mdHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.mdIconSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.mdPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.motionDuration
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.panelHighlight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.panelMotionDuration
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.smFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.smHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.smIconSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.smPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  alert: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBg: 'rgba(239, 68, 68, 0.10)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBorder: 'rgba(239, 68, 68, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorColor: '#FCA5A5',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorIcon: '#EF4444',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoBg: 'rgba(59, 130, 246, 0.10)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoBorder: 'rgba(59, 130, 246, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoColor: '#93C5FD',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoIcon: '#3B82F6',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBg: 'rgba(34, 197, 94, 0.10)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBorder: 'rgba(34, 197, 94, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successColor: '#6EE7B7',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successIcon: '#22C55E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBg: 'rgba(245, 158, 11, 0.10)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBorder: 'rgba(245, 158, 11, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningColor: '#FCD34D',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningIcon: '#F59E0B',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  anchor: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    inkColor: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    linkColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    linkColorActive: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  avatar: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderColor: 'rgba(255, 255, 255, 0.05)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    defaultColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBg: 'rgba(239, 68, 68, 0.14)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorColor: '#EF4444',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gradientBg: 'linear-gradient(135deg, #ECECEC 0%, #6B6B72 100%)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gradientColor: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupBorder: '#18181B',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupOverflowBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    groupOverflowColor: 'var(--ds-color-text-page)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    primaryBg: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryColor: '#0C0C0E',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    ringColor: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    secondaryColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    statusBorder: '#18181B',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBg: 'rgba(34, 197, 94, 0.14)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successColor: '#22C55E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBg: 'rgba(245, 158, 11, 0.14)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningColor: '#F59E0B',
  },
  backTop: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    bg: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: '0 4px 16px rgba(0, 0, 0, 0.30)',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  calendar: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    dayColorOther: '#4A4A4F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerColor: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  collapse: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#131316',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    contentBg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBg: '#131316',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBgHover: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerColor: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  descriptions: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#131316',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    contentColor: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    labelColor: '#6B6B72',
  },
  drawer: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#1A1A1E',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    bodyColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: '0 16px 48px rgba(0, 0, 0, 0.50)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: '#ECECEC',
  },
  dropdown: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgActive: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    itemColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorActive: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorHover: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  empty: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    descriptionColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconColor: '#4A4A4F',
  },
  /**
   * Familia mixta. Controles: token-overrides, palette.seeds.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  floatButton: {
    /**
     * @domicile seed
     * @governor dial: token-overrides
     */
    badgeBg: '#EF4444',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeColor: '#ffffff',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultBg: '#222226',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    defaultColor: 'var(--ds-color-text-page)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    descriptionColor: 'var(--ds-color-text-page)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    primaryBg: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryColor: '#0C0C0E',
  },
  liveFeed: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    badgeBg: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeColor: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#18181B',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    emptyColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    loadMoreColor: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    newBg: 'rgba(59, 130, 246, 0.10)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    newBorder: 'rgba(59, 130, 246, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    newColor: '#3B82F6',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    refreshColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    skeletonBg: '#2A2A2F',
  },
  /**
   * Familia mixta. Controles: palette.seeds, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  menu: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    darkBg: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    darkItemColor: '#A0A0A5',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    dividerColor: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    focusRingColor: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupTitleColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgActive: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    itemColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorActive: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorHover: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial: token-overrides
     */
    itemDangerColor: '#EF4444',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemHoverBg: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemSelectedBg: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    itemSelectedColor: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    submenuBg: '#131316',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  message: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    closeColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    closeColorHover: '#ECECEC',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
  },
  notification: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: '0 4px 24px rgba(0, 0, 0, 0.50), 0 0 0 1px #2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  pagination: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    activeBg: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeColor: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBg: 'transparent',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    itemBgActive: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBorder: 'transparent',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    itemColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorActive: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorHover: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  progress: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    fillError: '#EF4444',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    fillPrimary: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    fillSuccess: '#22C55E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    fillWarning: '#F59E0B',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  result: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconColor: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    subtitleColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: '#ECECEC',
  },
  skeleton: {
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    bg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    highlight: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    waveGradient: 'linear-gradient(90deg, #1A1A1E 25%, #2A2A2F 50%, #1A1A1E 75%)',
  },
  spinner: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    color: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    track: '#2A2A2F',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  statistic: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    prefixColor: 'var(--ds-color-text-page)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    suffixColor: 'var(--ds-color-text-page)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    titleColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    valueColor: '#ECECEC',
  },
  /**
   * Un solo control (token-overrides), pero ese control no figura como dial
   * de rottay en el roster: el tag queda pendiente de adjudicacion del DT.
   */
  statsGrid: {
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    cardBg: '#18181B',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    cardBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    cardFilledBg: '#1A1A1E',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    cardGlassBg: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    cardGlassBorder: '#2A2A2F',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    descriptionColor: '#6B6B72',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    labelColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    skeletonBg: '#2A2A2F',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    skeletonWaveGradient: 'linear-gradient( 90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 37%, rgba(255, 255, 255, 0.04) 63% )',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    trendNegative: '#EF4444',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    trendNeutral: '#6B6B72',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    trendPositive: '#22C55E',
    /**
     * @domicile seed
     * @governor seed de statsGrid: baja a canal --ds-stats-grid-* (chromeToVariables, STATS_GRID_CHROME_VARIABLES); ingresa por el control pro chrome.families (ingress chrome.*); token-overrides no es su dial (contrato: escape hatch, no el modelo; roster K4 medido); el dial propio, si existe, es decision F4B sobre la celda familia x control (F9)
     */
    valueColor: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  steps: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    connectorColor: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    connectorColorActive: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    finishBg: '#22C55E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    finishBorder: '#22C55E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    itemBgActive: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColor: '#6B6B72',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorActive: '#0C0C0E',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    processBg: 'var(--ds-color-primary)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    processBorder: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    waitBg: 'transparent',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    waitBorder: 'rgba(255, 255, 255, 0.14)',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  tag: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: '#2A2A2F',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultBg: '#222226',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultBorder: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    defaultColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBg: 'rgba(239, 68, 68, 0.12)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBorder: 'rgba(239, 68, 68, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorColor: '#F87171',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    primaryBg: 'var(--ds-color-primary)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    primaryBorder: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryColor: '#0C0C0E',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryBg: '#222226',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryBorder: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    secondaryColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBg: 'rgba(34, 197, 94, 0.12)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBorder: 'rgba(34, 197, 94, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successColor: '#34D399',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBg: 'rgba(245, 158, 11, 0.12)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBorder: 'rgba(245, 158, 11, 0.22)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningColor: '#FBBF24',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  timeline: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    contentColor: 'var(--ds-color-text-page)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    dotBg: 'var(--ds-color-primary)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    dotBorder: '#18181B',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    lineColor: '#2A2A2F',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  tree: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    nodeBgHover: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    nodeBgSelected: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    nodeColor: 'var(--ds-color-text-page)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    nodeColorSelected: '#ECECEC',
  },
  /**
   * @placeholder CHROME.workspaceCard
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia workspaceCard (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.collectionCard
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.compactCard
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.detail
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.filterPill
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.listingGrid
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.metricCard
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.signalCard
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.tallCard
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.workspaceCard
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
};

// ── CAPABILITIES ──
/**
 * Estado y prosa de capability: declara disposicion, no pinta.
 */
const CAPABILITIES: BrandCapabilityCatalog = {
  // ACTIVE, because the compilers actually read it.
  //
  // This was authored as `disabled`/`superseded` with the note "feeds the
  // compatibility bridge only". That was false, and provably so:
  // `brandThemeToTokenOverrides` lowers the authored spring physics into
  // `TenantTokenOverrides.motion.spring`, which `useTokens` resolves onto
  // the shipped `--ds-motion-spring` channel, and `brandThemeToPersonality`
  // maps the whole block onto `PersonalityTokens.animation`. Both are
  // production compilers on the artifact path, not a bridge.
  //
  // `BrandMotion` IS still slated for retirement in favour of MotionProfile
  // + TenantMotionDial. A disposition records what the code does TODAY, not
  // what a migration intends; declaring the destination early is how a
  // catalog that exists to prevent silent gaps becomes the thing asserting
  // one. When the last consumer goes, this flips — and
  // `tests/capability-honesty.test.ts` fails until it does.
  /**
   * @domicile pro-expert
   * @governor capability: motion (estado autorado: active)
   */
  motion: { status: 'active' },
  /**
   * @domicile pro-expert
   * @governor capability: recipes (estado autorado: active)
   */
  recipes: { status: 'active' },
  // Sighted selection pending. Rottay is the neutral baseline, so an
  // expressive profile is a real decision rather than a default, and no
  // governed id has been sighted against this canvas yet.
  expressive: {
    /**
     * @domicile pro-expert
     * @governor capability: expressive (estado autorado: unassigned)
     */
    status: 'unassigned',
    /**
     * @domicile pro-expert
     * @governor capability: expressive (estado autorado: unassigned)
     */
    reason: 'pending-selection',
    note: 'No expressive profile sighted against the Rottay dark canvas yet.',
  },
  responsive: {
    /**
     * @domicile pro-expert
     * @governor capability: responsive (estado autorado: disabled)
     */
    status: 'disabled',
    /**
     * @domicile pro-expert
     * @governor capability: responsive (estado autorado: disabled)
     */
    reason: 'not-authored',
    note: 'Rottay rides the baseline container ladder; no posture override.',
  },
  engineBridge: {
    /**
     * @domicile pro-expert
     * @governor capability: engineBridge (estado autorado: disabled)
     */
    status: 'disabled',
    /**
     * @domicile pro-expert
     * @governor capability: engineBridge (estado autorado: disabled)
     */
    reason: 'not-authored',
    note: 'No engine-specific bridge values; modern reads the compiled tokens directly.',
  },
};

// ────────────────────── END AUTHORED DECISIONS ──────────────────────
// Nothing below carries a value. The exported object names the contract's
// families in the contract's own order and references the decisions above.

/**
 * Esqueleto de contrato: nombra las familias en el orden del contrato y
 * referencia las decisiones; ninguna hoja de aca abajo carga valor.
 */
export const rottayBrandTheme: FirstPartyBrandTheme = {
  id: THEME_ID,
  name: THEME_NAME,

  // appearance — which mode the authored decisions above ARE.
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a) — selecciona qué bloque del tema se emite por defecto
   */
  appearance: { defaultMode: DEFAULT_MODE },

  // modes — the other mode, as a typed overlay the compiler merges and diffs.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  modes: { [OVERLAY_MODE]: OVERLAY },

  // recipes — governed recipe-profile selection (DS-S001).
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  recipes: RECIPES,

  // expressive — governed expressive-profile selection (C1b).
  /**
   * @placeholder THEME.expressive
   * @domicile unassigned
   * @governor none — gap aceptado: capability expressive no autorada en rottay (capabilities.expressive dice por que)
   */

  // palette — ramps and semantic colour channels.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  palette: PALETTE,

  // typography — shipped font packs and heading/label strategy.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  typography: TYPOGRAPHY,

  // surfaces — radius, elevation, glass/gradient/overlay posture.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  surfaces: SURFACES,

  // motion — compatibility choreography dial, governed as a capability.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  motion: MOTION,

  // charts — chart personality posture.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  charts: CHARTS,

  // chrome — per-component chrome channels.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  chrome: CHROME,

  // capabilities — explicit disposition for every optional family.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  capabilities: CAPABILITIES,
  /**
   * @placeholder CAPABILITIES.recipes.note
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CAPABILITIES.recipes.reason
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHARTS.colorScheme
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder THEME.expressive
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.typography
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.toolbar
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder EXPRESSIVE
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
};
