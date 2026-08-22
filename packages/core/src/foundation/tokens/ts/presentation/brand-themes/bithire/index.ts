/**
 * BitHire first-party vertical theme.
 *
 * Trusted recruiting workspace with an ownable blue identity.
 * Confident blue with mineral neutrals, softer radii and calm motion.
 * Data-dense without looking harsh.
 *
 * Design: a decision workspace with calm editorial hierarchy and one strong
 * signal per region. Surfaces stay light and information-dense, while a
 * restrained blue material layer distinguishes context, action and
 * evidence without turning the product into a decorative dashboard.
 *
 * This file is the canonical authored source. foundation/tokens/css/facade/artifacts/bithire/index.css
 * is a generated build product — regenerate with `pnpm -C packages/core
 * build:vertical-css`; hand-edits fail `lint:artifacts`.
 *
 * This vertical's artifact is PENDING REGENERATION for the Evidence Ledger
 * deltas of WO-DES-02; the authored source above it is the authority either
 * way (theming LAW 1).
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
  BrandExpressiveSelection,
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
const THEME_ID = "bithire" satisfies FirstPartyBrandTheme['id'];
const THEME_NAME = "BitHire";
const DEFAULT_MODE = "light" satisfies BrandThemeMode;
const OVERLAY_MODE = 'dark' satisfies BrandThemeMode;


// ── SEEDS — valores en ./seeds.json (ausencia = placeholder) ──
const SEED = seedValues.main;
const OVERLAY_SEED = seedValues.overlay;

// ── OVERLAY — the non-default mode ──
/**
 * DARK mode. Authored as a typed overlay of the semantic
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
        50: "#0d1b2a",
        100: "#112840",
        200: "#163555",
        300: "#1a4f80",
        400: "#1a6db5",
        500: "#1e84e6",
        600: "#3b9af0",
        700: "#6bb5f5",
        800: "#a0d0fa",
        900: "#d6eafd",
      },
      secondary: {
        50: "#0d1924",
        100: "#122638",
        200: "#19364f",
        300: "#245176",
        400: "#326b9a",
        500: "#4f8ec0",
        600: "#69a6d5",
        700: "#86bbe1",
        800: "#acd2ec",
        900: "#d6e9f7",
      },
      neutral: {
        50: "#0a0f18",
        100: "#0f1520",
        200: "#151d2b",
        300: "#1b2535",
        400: "#253545",
        500: "#3a4a5a",
        600: "#5a7085",
        700: "#7a90a5",
        800: "#9aacbf",
        900: "#c0cdd8",
      },
      success: {
        50: "#0d1b29",
        100: "#132b40",
        200: "#8CC4EA",
        300: "#66A8D3",
        400: "#448CB9",
        500: "#26719C",
        600: "#0A567D",
        700: "#003D5B",
        800: "#002539",
        900: "#000F1A",
      },
      warning: {
        50: "#1f1a0d",
        100: "#2e2615",
        200: "#E0B476",
        300: "#C7964B",
        400: "#AC7922",
        500: "#8E5F00",
        600: "#6D4800",
        700: "#4D3200",
        800: "#301E00",
        900: "#150B00",
      },
      error: {
        50: "#1f0d0d",
        100: "#2e1515",
        200: "#FF9E96",
        300: "#EA7A73",
        400: "#CF5A55",
        500: "#B03D3B",
        600: "#8D2526",
        700: "#691215",
        800: "#440609",
        900: "#1F0303",
      },
      info: {
        50: "#0d1b2a",
        100: "#112840",
        200: "#93BFF8",
        300: "#70A3E2",
        400: "#5186C9",
        500: "#376BAB",
        600: "#21518A",
        700: "#0F3867",
        800: "#052243",
        900: "#020D1E",
      },
      accent: {
        50: "#F1F8FF",
        100: "#C8DCEE",
        200: "#A6C0D7",
        300: "#86A4BE",
        400: "#6988A3",
        500: "#4F6D87",
        600: "#38536A",
        700: "#253B4D",
        800: "#142331",
      },
    },
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    primaryColor: "#1e84e6",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryHoverColor: "#2b8fef",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryHoverColor: "#69a6d5",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryColor: "#4f8ec0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    accentHoverColor: "#a6c6df",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundColor: "#0f1520",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundSecondaryColor: "#151d2b",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundTertiaryColor: "#1b2535",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundElevatedColor: "#1f2940",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundSurfaceColor: "#151d2b",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundOverlayColor: "rgba(20, 40, 59, 0.58)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textPrimaryColor: "#e4e8ed",
    /**
     * Raiz de tinta del tier de pagina (K3, F4A-6): sidebar, headers de tabla,
     * labels de formulario — el mobiliario de pagina, no el contenido.
     * @domicile seed
     * @governor dial: tenant-dial (tinta de pagina); calibracion en F4B
     */
    textPageColor: "#9aacbf",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textSecondaryColor: "#9aacbf",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textTertiaryColor: "#7a90a5",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textMutedColor: "#5a7085",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textDisabledColor: "#3a4a5a",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    onPrimaryColor: "#ffffff",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderColor: "#253545",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderSecondaryColor: "#1d2a38",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderTertiaryColor: "#182230",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderSubtleColor: "#132032",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderFocusColor: "#1a7fe0",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    linkColor: "#3b9af0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    linkHoverColor: "#6bb5f5",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    linkVisitedColor: "#a78bca",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    interactiveBorderColor: "#253545",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    interactiveBgHoverColor: "rgba(255, 255, 255, 0.04)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    interactiveBgActiveColor: "rgba(26, 127, 224, 0.12)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    interactiveBgMutedColor: "rgba(255, 255, 255, 0.03)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successColor: "#5ca6cf",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBgColor: "#132b40",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBorderColor: "rgba(92, 166, 207, 0.3)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningColor: "#d4943a",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBgColor: "#2e2615",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBorderColor: "rgba(212, 148, 58, 0.3)",
    /**
     * @domicile seed
     * @governor dial: token-overrides
     */
    errorColor: "#e04848",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBgColor: "#2e1515",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBorderColor: "rgba(224, 72, 72, 0.3)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoColor: "#1a7fe0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoBgColor: "#112840",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoBorderColor: "rgba(26, 127, 224, 0.3)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-info-300
     */
    infoInkColor: "var(--ds-color-info-300)",
  /**
   * @placeholder OVERLAY.palette.accentColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.aliases
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaBlack100
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaBlack50
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaError10
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaError20
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaInfo10
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaPrimary10
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaPrimary20
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaSecondary10
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaSecondary20
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaSuccess10
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaSuccess20
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaWarning10
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaWarning20
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.alphaWhite50
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.bgHoverColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.bgInfoColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.bgSubtleColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.neutralZeroColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.primaryForegroundColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.primarySubtleColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.ramps.accent.900
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.shadowColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.surfaceColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.surfaceMutedColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.surfaceSecondaryColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.textColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.textInverseColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  typography: {
    letterSpacing: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      display: "-0.02em",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      heading: "-0.01em",
    },
    lineHeight: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      body: 1.6,
    },
  },
  /**
   * Familia mixta. Controles: palette.seeds, surfaces.effect-intensity.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  surfaces: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderRadius: {
      full: "9999px",
    },
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadows: {
      sm: "0 1px 2px rgba(20, 40, 59, 0.06)",
      md: "0 4px 12px rgba(20, 40, 59, 0.08)",
      lg: "0 8px 24px rgba(20, 40, 59, 0.1)",
      xl: "0 16px 48px rgba(20, 40, 59, 0.12)",
    },
    surfaceRoles: {
      canvas: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-primary
         */
        background: "var(--ds-color-bg-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        foreground: "var(--ds-color-text-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary
         */
        texture: "radial-gradient(circle at 88% 4%, color-mix(in srgb, var(--ds-color-primary) 14%, transparent), transparent 30%)",
      },
      shell: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        background: "var(--ds-color-neutral-50)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-secondary
         */
        foreground: "var(--ds-color-text-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border-secondary
         */
        border: "var(--ds-color-border-secondary)",
      },
      panel: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-primary
         */
        background: "var(--ds-color-bg-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-surface
         */
        backgroundHover: "var(--ds-color-bg-surface)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-bg-surface
         */
        backgroundActive: "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-color-bg-surface))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-bg-surface
         */
        backgroundSelected: "color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-color-bg-surface))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-surface, --ds-color-bg-primary
         */
        backgroundDisabled: "color-mix(in srgb, var(--ds-color-bg-surface) 55%, var(--ds-color-bg-primary))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        foreground: "var(--ds-color-text-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-secondary
         */
        foregroundMuted: "var(--ds-color-text-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-muted
         */
        foregroundDisabled: "var(--ds-color-text-muted)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border
         */
        border: "var(--ds-color-border)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-500
         */
        borderStrong: "var(--ds-color-neutral-500)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-border
         */
        borderHover: "color-mix(in srgb, var(--ds-color-primary) 28%, var(--ds-color-border))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-border
         */
        borderActive: "color-mix(in srgb, var(--ds-color-primary) 44%, var(--ds-color-border))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-border
         */
        borderSelected: "color-mix(in srgb, var(--ds-color-primary) 58%, var(--ds-color-border))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border-secondary
         */
        borderDisabled: "var(--ds-color-border-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary
         */
        focusRing: "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        shadow: "0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 45%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        shadowHover: "0 10px 28px -22px color-mix(in srgb, var(--ds-color-neutral-50) 72%, transparent), 0 2px 6px color-mix(in srgb, var(--ds-color-neutral-50) 50%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        shadowActive: "0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 40%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50, --ds-color-primary
         */
        shadowSelected: "0 8px 24px -20px color-mix(in srgb, var(--ds-color-neutral-50) 68%, transparent), 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        highlight: "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)",
      },
      card: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-surface
         */
        background: "var(--ds-color-bg-surface)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-tertiary
         */
        backgroundHover: "var(--ds-color-bg-tertiary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-bg-tertiary
         */
        backgroundActive: "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-color-bg-tertiary))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-bg-surface
         */
        backgroundSelected: "color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-color-bg-surface))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-surface, --ds-color-bg-primary
         */
        backgroundDisabled: "color-mix(in srgb, var(--ds-color-bg-surface) 70%, var(--ds-color-bg-primary))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        foreground: "var(--ds-color-text-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-secondary
         */
        foregroundMuted: "var(--ds-color-text-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-muted
         */
        foregroundDisabled: "var(--ds-color-text-muted)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border
         */
        border: "var(--ds-color-border)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-500
         */
        borderStrong: "var(--ds-color-neutral-500)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-border
         */
        borderHover: "color-mix(in srgb, var(--ds-color-primary) 28%, var(--ds-color-border))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-border
         */
        borderActive: "color-mix(in srgb, var(--ds-color-primary) 44%, var(--ds-color-border))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-border
         */
        borderSelected: "color-mix(in srgb, var(--ds-color-primary) 58%, var(--ds-color-border))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border-secondary
         */
        borderDisabled: "var(--ds-color-border-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary
         */
        focusRing: "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        shadow: "0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 62%, transparent), 0 0 0 1px color-mix(in srgb, var(--ds-color-neutral-50) 40%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        shadowHover: "0 18px 38px -24px color-mix(in srgb, var(--ds-color-neutral-50) 78%, transparent), 0 3px 9px color-mix(in srgb, var(--ds-color-neutral-50) 58%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        shadowActive: "0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 55%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50, --ds-color-primary
         */
        shadowSelected: "0 10px 26px -20px color-mix(in srgb, var(--ds-color-neutral-50) 70%, transparent), 0 2px 6px color-mix(in srgb, var(--ds-color-neutral-50) 50%, transparent), 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        highlight: "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)",
      },
      inset: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        background: "var(--ds-color-neutral-50)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-secondary
         */
        foreground: "var(--ds-color-text-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border-secondary
         */
        border: "var(--ds-color-border-secondary)",
      },
      control: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-primary
         */
        background: "var(--ds-color-bg-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-surface
         */
        backgroundHover: "var(--ds-color-bg-surface)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-tertiary
         */
        backgroundActive: "var(--ds-color-bg-tertiary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-bg-primary
         */
        backgroundSelected: "color-mix(in srgb, var(--ds-color-primary) 16%, var(--ds-color-bg-primary))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-surface, --ds-color-bg-primary
         */
        backgroundDisabled: "color-mix(in srgb, var(--ds-color-bg-surface) 60%, var(--ds-color-bg-primary))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        foreground: "var(--ds-color-text-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-secondary
         */
        foregroundMuted: "var(--ds-color-text-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-muted
         */
        foregroundDisabled: "var(--ds-color-text-muted)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border
         */
        border: "var(--ds-color-border)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-500
         */
        borderStrong: "var(--ds-color-neutral-500)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-500
         */
        borderHover: "var(--ds-color-neutral-500)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-border
         */
        borderActive: "color-mix(in srgb, var(--ds-color-primary) 44%, var(--ds-color-border))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary, --ds-color-border
         */
        borderSelected: "color-mix(in srgb, var(--ds-color-primary) 58%, var(--ds-color-border))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border-secondary
         */
        borderDisabled: "var(--ds-color-border-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary
         */
        focusRing: "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        shadow: "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50, --ds-color-text-primary
         */
        shadowHover: "0 5px 14px color-mix(in srgb, var(--ds-color-neutral-50) 55%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        shadowActive: "inset 0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 70%, transparent)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50, --ds-color-primary
         */
        shadowSelected: "0 3px 10px color-mix(in srgb, var(--ds-color-neutral-50) 50%, transparent), 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
      },
      raised: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-elevated, --ds-color-bg-surface
         */
        background: "linear-gradient(180deg, var(--ds-color-bg-elevated) 0%, var(--ds-color-bg-surface) 100%)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        foreground: "var(--ds-color-text-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border
         */
        border: "var(--ds-color-border)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-50
         */
        shadow: "0 16px 36px -24px color-mix(in srgb, var(--ds-color-neutral-50) 80%, transparent), 0 4px 12px color-mix(in srgb, var(--ds-color-neutral-50) 58%, transparent)",
      },
      overlay: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-bg-elevated
         */
        background: "var(--ds-color-bg-elevated)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        foreground: "var(--ds-color-text-primary)",
      },
    },
    /**
     * @domicile derived
     * @governor deriva de: --ds-surface-card, --ds-surface-panel, --ds-surface-canvas
     */
    gradients: {
      surface: "linear-gradient(145deg, var(--ds-surface-card) 0%, var(--ds-surface-panel) 58%, var(--ds-surface-canvas) 100%)",
    },
  /**
   * @placeholder OVERLAY.surfaces.elevations
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.shadows.focusRing
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.shadows.focusRingError
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.shadows.inner
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.shadows.xs
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.shadows.xxl
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  },
  /**
   * Familia mixta. Controles: chrome.families, palette.seeds, shape.radius-scale, typography.scale, navigation.sidebar-tone.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  chrome: {
    controls: {
      buttonPrimary: {
        /**
         * @domicile seed
         * @governor dial: chrome.families
         */
        bg: "#1a7fe0",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        bgHover: "#2b8fef",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        color: "#ffffff",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonSecondary: {
        bg: "transparent",
        border: "#253545",
        color: "#9aacbf",
        bgHover: "#1b2535",
      },
      input: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bg: "#0f1520",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        border: "#253545",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        borderHover: "#3a4a5a",
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        borderFocus: "#1a7fe0",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        shadowFocus: "0 0 0 1px #1a7fe0",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        colorPlaceholder: "#5a7085",
        addon: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-surface-panel
           */
          bg: "var(--ds-surface-panel)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-neutral-500
           */
          border: "var(--ds-color-neutral-500)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-secondary
           */
          color: "var(--ds-color-text-secondary)",
        },
        affix: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-surface-panel
           */
          bg: "var(--ds-surface-panel)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-secondary
           */
          color: "var(--ds-color-text-secondary)",
        },
        autofill: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-surface-panel
           */
          bg: "var(--ds-surface-panel)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-primary
           */
          caret: "var(--ds-color-primary)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-primary
           */
          color: "var(--ds-color-text-primary)",
        },
        /**
         * @domicile derived
         * @governor deriva de: --ds-material-control-background-disabled
         */
        bgDisabled: "var(--ds-material-control-background-disabled)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border-secondary
         */
        borderDisabled: "var(--ds-color-border-secondary)",
        // Dark pins for the border COLOR channel — see the note above the
        // dark select block.
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-300
         */
        borderColor: "var(--ds-color-neutral-300)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-400
         */
        borderColorHover: "var(--ds-color-neutral-400)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary-500
         */
        borderColorFocus: "var(--ds-color-primary-500)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary
         */
        caretColor: "var(--ds-color-primary)",
        clear: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-material-control-background-hover
           */
          bgHover: "var(--ds-material-control-background-hover)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-neutral-500
           */
          borderHover: "var(--ds-color-neutral-500)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-tertiary
           */
          color: "var(--ds-color-text-tertiary)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-primary
           */
          colorHover: "var(--ds-color-text-primary)",
        },
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-muted
         */
        colorDisabled: "var(--ds-color-text-muted)",
        count: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-tertiary
           */
          color: "var(--ds-color-text-tertiary)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-error
           */
          colorError: "var(--ds-color-error)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-warning
           */
          colorWarning: "var(--ds-color-warning)",
        },
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-error, --ds-surface-card
         */
        errorBg: "color-mix(in srgb, var(--ds-color-error) 4%, var(--ds-surface-card))",
        helper: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-error
           */
          errorColor: "var(--ds-color-error)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-tertiary
           */
          color: "var(--ds-color-text-tertiary)",
        },
        filled: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-surface-panel
           */
          bg: "var(--ds-surface-panel)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-surface-control
           */
          bgFocus: "var(--ds-surface-control)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-material-control-background-hover
           */
          bgHover: "var(--ds-material-control-background-hover)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-border
           */
          border: "var(--ds-color-border)",
        },
        label: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-primary
           */
          color: "var(--ds-color-text-primary)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-tertiary
           */
          disabledColor: "var(--ds-color-text-tertiary)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-error
           */
          requiredColor: "var(--ds-color-error)",
        },
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary
         */
        loadingColor: "var(--ds-color-primary)",
        readOnly: {
          /**
           * @domicile derived
           * @governor deriva de: --ds-surface-panel
           */
          bg: "var(--ds-surface-panel)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-border
           */
          border: "var(--ds-color-border)",
          /**
           * @domicile derived
           * @governor deriva de: --ds-color-text-secondary
           */
          color: "var(--ds-color-text-secondary)",
        },
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-primary
         */
        selectionColor: "var(--ds-color-text-primary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-success, --ds-surface-card
         */
        successBg: "color-mix(in srgb, var(--ds-color-success) 4%, var(--ds-surface-card))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-warning, --ds-surface-card
         */
        warningBg: "color-mix(in srgb, var(--ds-color-warning) 5%, var(--ds-surface-card))",
      },
      disabled: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-material-control-background-disabled
         */
        bg: "var(--ds-material-control-background-disabled)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border-secondary
         */
        border: "var(--ds-color-border-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-border-secondary
         */
        borderColor: "var(--ds-color-border-secondary)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-text-muted
         */
        text: "var(--ds-color-text-muted)",
      },
      /*
       * DARK PINS. The channels below were previously scoped to
       * `:not([data-theme="dark"])` in the retired extension block, so dark
       * never saw them and fell through to the component layer's own
       * defaults. Promoting them into the theme body makes them reach both
       * modes, so each one is pinned here to exactly the expression dark
       * resolves to today. These pins preserve the current dark paint; they
       * are not a dark design, and each is the natural candidate for a
       * later, deliberate "let the premium treatment reach dark" decision.
       */
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-400
       */
      focusRingColor: "var(--ds-color-primary-400)",
      select: {
        /**
         * @domicile derived
         * @governor deriva de: --ds-surface-control, --ds-color-bg-input, --ds-color-white
         */
        bg: "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgHover:
          "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        bgFocus:
          "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-900
         */
        color: "var(--ds-color-neutral-900)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-400
         */
        colorPlaceholder: "var(--ds-color-neutral-400)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-300
         */
        borderColor: "var(--ds-color-neutral-300)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-400
         */
        borderColorHover: "var(--ds-color-neutral-400)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary-500
         */
        borderColorFocus: "var(--ds-color-primary-500)",
        // The one channel the retired dark block authored explicitly.
        /**
         * @domicile derived
         * @governor deriva de: --ds-surface-card
         */
        dropdownBg: "var(--ds-surface-card)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-200
         */
        dropdownBorderColor: "var(--ds-color-neutral-200)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-shadow-lg
         */
        dropdownShadow: "var(--ds-shadow-lg)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-100
         */
        optionBgHover: "var(--ds-color-neutral-100)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary-50
         */
        optionBgSelected: "var(--ds-color-primary-50)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-neutral-900
         */
        optionColor: "var(--ds-color-neutral-900)",
        /**
         * @domicile derived
         * @governor deriva de: --ds-color-primary-700
         */
        optionColorSelected: "var(--ds-color-primary-700)",
      },
    },
    // Dark pins for the rich-card interior; the frame channels above the
    // fold are mode-agnostic and are authored once in the theme body.
    premiumCard: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-card-background, --ds-card-bg
       */
      bg: "var(--ds-material-card-background, var(--ds-card-bg))",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      sheen:
        "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ds-card-bg) 42%, transparent), transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-rich-card-header-bg
       */
      headerBg: "var(--ds-rich-card-header-bg)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-rich-card-section-bg
       */
      sectionBg: "var(--ds-rich-card-section-bg)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-rich-card-section-alt-bg
       */
      sectionAltBg: "var(--ds-rich-card-section-alt-bg)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      footerBg:
        "color-mix(in srgb, var(--ds-color-bg-secondary) 72%, var(--ds-card-bg))",
    },
    // Dark pins for the semantic surface family. `radiusMd` is absent on
    // purpose: the body value and the consumer fallback are the same
    // expression, so dark is already unchanged without a pin.
    surface: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-sm
       */
      shadow: "var(--ds-shadow-sm)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-md
       */
      shadowHover: "var(--ds-shadow-md)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      iconBg:
        "linear-gradient(145deg, color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card-bg)), color-mix(in srgb, var(--ds-color-secondary) 10%, var(--ds-surface-card-bg)))",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      iconBorder:
        "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-surface-card-border))",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      chipBg:
        "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card-bg))",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      cardSideAccentSoft: "transparent",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-md
       */
      popoverShadow: "var(--ds-shadow-md)",
    },
    cardComponent: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgHover: "#1b2535",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      border: "#253545",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow: "0 4px 12px rgba(20, 40, 59, 0.16),\n    0 2px 4px rgba(20, 40, 59, 0.1)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowHover: "0 8px 24px rgba(20, 40, 59, 0.18),\n    0 4px 8px rgba(20, 40, 59, 0.12)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      bodyColor: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      color: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      colorMuted: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      footerBorder: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      footerBorderColor: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      footerColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card, --ds-surface-panel
       */
      headerBg: "linear-gradient(112deg, color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-surface-card)) 0%, var(--ds-surface-card) 54%, var(--ds-surface-panel) 100%)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      headerBorder: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      headerBorderColor: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      headerColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      imagePlaceholderBg: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      imagePlaceholderColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      subtitleColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      titleColor: "var(--ds-color-text-primary)",
    },
    table: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: OVERLAY_SEED.surface.card,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: OVERLAY_SEED.edge.divider,
      /**
       * @domicile derived
       * @governor deriva de: --ds-radius-lg
       */
      radius: "var(--ds-radius-lg)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      headerBg: OVERLAY_SEED.surface.raised,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      headerColor: "#9aacbf",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      headerFontSize: OVERLAY_SEED.typeDetail.tableHeaderSize,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      rowBg: OVERLAY_SEED.surface.card,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      rowBgHover: OVERLAY_SEED.surface.hoverTint,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      rowBgStriped: OVERLAY_SEED.surface.stripeTint,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      rowBgSelected: OVERLAY_SEED.surface.selectedTint,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      rowBorder: OVERLAY_SEED.edge.divider,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      cellPadding: OVERLAY_SEED.rhythm.tableCellPadding,
      /**
       * @domicile seed
       * @governor dial: typography.scale
       */
      cellFontSize: OVERLAY_SEED.typeDetail.tableCellSize,
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      actionBg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      actionBorder: "color-mix(in srgb, var(--ds-color-border) 70%, transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      filterRowBg: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      headerBgHover: "color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      headerBorder: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      headerShadow: "inset 0 -1px 0 color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      rowBgExpanded: "var(--ds-surface-panel)",
    },
    sidebar: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupFontSize: "11px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupColor: "#5a7085",
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
      itemFontWeightActive: "500",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemColor: "#9aacbf",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemColorActive: "#3b9af0",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgActive: "rgba(26, 127, 224, 0.12)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgHover: "rgba(255, 255, 255, 0.04)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemIndent: "6px",
      /**
       * @domicile seed
       * @governor dial: navigation.sidebar-tone
       */
      bg: "#0a0f18",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      footerBg: "#0a0f18",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: "#1d2a38",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      text: "#9aacbf",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textMuted: "#5a7085",
    },
    badge: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      countBg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      iconBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      ink: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-hover
       */
      inkHover: "var(--ds-color-primary-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      removeBg: "color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      removeHoverBg: "color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-hover
       */
      selectedInk: "var(--ds-color-primary-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      selectedSurface: "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      surface: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      surfaceHover: "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      surfacePressed: "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-surface-card))",
    },
    breadcrumb: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      colorActive: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      bg: "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      color: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      itemColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      separatorColor: "var(--ds-color-text-tertiary)",
    },
    collectionCard: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      bg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-card-background-hover
       */
      bgHover: "var(--ds-material-card-background-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      bodyColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      labelColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      statusBg: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-color-border
       */
      statusBorder: "color-mix(in srgb, var(--ds-color-primary) 32%, var(--ds-color-border))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-hover
       */
      statusColor: "var(--ds-color-primary-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      titleColor: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      valueColor: "var(--ds-color-text-primary)",
    },
    shell: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      commandHomeConsoleBg: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      commandHomeControlBg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-color-border
       */
      commandHomeControlBorder: "color-mix(in srgb, var(--ds-color-primary) 40%, var(--ds-color-border))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      commandHomeControlHoverBg: "color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      commandHomeHeroBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      commandHomeIconBg: "color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border, --ds-surface-card
       */
      commandHomeMeterBg: "color-mix(in srgb, var(--ds-color-border) 72%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      commandHomePanelBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      commandHomePanelBgStrong: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-color-border
       */
      commandHomePanelBorder: "color-mix(in srgb, var(--ds-color-primary) 55%, var(--ds-color-border))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-color-border
       */
      commandHomePanelBorderSoft: "color-mix(in srgb, var(--ds-color-primary) 40%, var(--ds-color-border))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      commandHomeSurfaceBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      commandRailBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-card-background-active
       */
      activeBg: "var(--ds-material-card-background-active)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-card-background-active
       */
      activeGradient: "var(--ds-material-card-background-active)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-canvas, --ds-surface-panel, --ds-surface-shell
       */
      bg: "linear-gradient(180deg, var(--ds-surface-canvas) 0%, var(--ds-surface-panel) 58%, var(--ds-surface-shell) 100%)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
    },
    compactCard: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      bg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-card-background-hover
       */
      bgHover: "var(--ds-material-card-background-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      bodyColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      labelColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      titleColor: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      valueColor: "var(--ds-color-text-primary)",
    },
    filterPill: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary
       */
      activeColor: "var(--ds-color-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      bg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      color: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      countBorder: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
    },
    search: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-muted
       */
      clearColor: "var(--ds-color-text-muted)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      iconColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      bg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      categoryColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      clearColorHover: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      color: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      emptyBg: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      inputBg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-500
       */
      inputBorder: "var(--ds-color-neutral-500)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      inputColor: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      placeholderColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      resultBg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      resultBgHover: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      resultBorder: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      resultMetaColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      resultTitleColor: "var(--ds-color-text-primary)",
    },
    layout: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      bg: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      headerBg: "color-mix(in srgb, var(--ds-surface-card) 92%, transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      headerBorder: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      siderBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      siderBorder: "var(--ds-color-border)",
    },
    listingGrid: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      cardBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      cardBorder: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      emptyBg: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      emptyBorder: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      skeletonBg: "var(--ds-surface-panel)",
    },
    metricCard: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      bg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      iconBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      labelColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border, --ds-surface-panel
       */
      meterTrack: "color-mix(in srgb, var(--ds-color-border) 48%, var(--ds-surface-panel))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      meterTrackBorder: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-hover
       */
      trendColor: "var(--ds-color-primary-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      valueColor: "var(--ds-color-text-primary)",
    },
    modal: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      bg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      bodyColor: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      closeBgHover: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      closeColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      closeColorHover: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      color: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-canvas
       */
      footerBg: "var(--ds-surface-canvas)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      footerBorder: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card, --ds-surface-panel
       */
      headerBg: "color-mix(in srgb, var(--ds-surface-card) 88%, var(--ds-surface-panel))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      headerBorder: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      subtitleColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      titleColor: "var(--ds-color-text-primary)",
    },
    signalCard: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary
       */
      badgeColor: "var(--ds-color-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      bg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      bodyColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      iconBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border, --ds-surface-panel
       */
      meterTrack: "color-mix(in srgb, var(--ds-color-border) 48%, var(--ds-surface-panel))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      meterTrackBorder: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-panel
       */
      sectionAltBg: "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-panel))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      sectionBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      titleColor: "var(--ds-color-text-primary)",
    },
    tabs: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      bgHover: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      colorActive: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      colorHover: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      activeBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-card-background-active
       */
      badgeBgActive: "var(--ds-material-card-background-active)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-color-border
       */
      badgeBorderActive: "color-mix(in srgb, var(--ds-color-primary) 32%, var(--ds-color-border))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-hover
       */
      badgeColorActive: "var(--ds-color-primary-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      border: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel, --ds-surface-card
       */
      listBg: "color-mix(in srgb, var(--ds-surface-panel) 82%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      listBorder: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      overflowControlBg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-panel
       */
      overflowControlBgHover: "var(--ds-surface-panel)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      panelBg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      panelBorder: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      panelHighlight: "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)",
    },
    tallCard: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card, --ds-surface-panel, --ds-surface-canvas
       */
      bg: "linear-gradient(145deg, var(--ds-surface-card) 0%, var(--ds-surface-panel) 72%, var(--ds-surface-canvas) 100%)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      bodyColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      labelColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      titleColor: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      valueColor: "var(--ds-color-text-primary)",
    },
    toolbar: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      bg: "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      borderBottom: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      color: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      controlBg: "var(--ds-surface-control)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-500
       */
      controlBorder: "var(--ds-color-neutral-500)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      controlColor: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      divider: "var(--ds-color-border-secondary)",
    },
    workspaceCard: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      bg: "var(--ds-surface-card)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-card-background-hover
       */
      bgHover: "var(--ds-material-card-background-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      bodyColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-canvas
       */
      footerBg: "var(--ds-surface-canvas)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border-secondary
       */
      footerBorder: "var(--ds-color-border-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      footerColor: "var(--ds-color-text-secondary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary, --ds-surface-card
       */
      iconBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary
       */
      iconColor: "var(--ds-color-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-tertiary
       */
      labelColor: "var(--ds-color-text-tertiary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      titleColor: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      valueColor: "var(--ds-color-text-primary)",
    },
    /**
     * @placeholder OVERLAY.chrome.alert
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.anchor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.avatar
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.backTop
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.borderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.defaultBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.defaultColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.errorBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.infoBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.primaryColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.secondaryBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.badge.textColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.breadcrumb.colorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.calendar
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.borderAccentHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.footerBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.imageLoadingActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.imageLoadingTrack
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.shadowElevated
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.collapse
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.autocomplete
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonDefault
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonError
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonGhost
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonInfo
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonLink
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonPrimary.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonPrimary.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonPrimary.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonSecondary.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonSecondary.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonText
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.checkbox
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.datePicker
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.form
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.bgFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.color
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.errorBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.errorColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.errorShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.successShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.warningShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.inputNumber
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.radio
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.rate
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.segmented
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.arrowColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.bgDisabled
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.borderFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.clearColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.colorDisabled
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.dropdownBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.errorBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.filledBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.optionColorDisabled
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.shadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select.tagBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.slider
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.switch
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.textarea
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.timePicker
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.toggle
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.transfer
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.upload
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.descriptions
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.drawer
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.dropdown
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.empty
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.floatButton
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.layout.dividerColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.layout.dividerTextColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.list
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.liveFeed
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.menu
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.message
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.modal.overlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.modal.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.notification
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.pagination
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.popover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.progress
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.result
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.search.commandPalette
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell.gridLine
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.childPaddingInline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.groupLetterSpacing
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.iconColumnSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.iconSize
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemChildHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemFontSizeChild
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemFontWeight
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemPaddingInline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.shellPaddingCollapsed
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.shellPaddingInline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.skeleton
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.spinner
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.statistic
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.statsGrid
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.steps
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.cardCoverOverlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.gradientDark
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.imageOverlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.overlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.pageShellSubtitleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.surface.watermarkColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.cellColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.loadingOverlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs.color
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tag
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.timeline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tooltip
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tree
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
};

// ── RECIPES ──
/*
 * R1 Cohort 1 RESELECTION. The K0.6 selection above was correct for the
 * posture this theme then declared (border-first, dense, ruled). The R1
 * art-direction contract changes that north star to an approachable,
 * information-rich professional-network hiring OS, and names the sharp
 * instrument posture as this tenant's leading contradiction.
 *
 * The move was FORCED by evidence, not preference. `technical-sharp@1` is
 * required by The Management, whose document had to leave `editorial-round@1`
 * (its `shape: 'round'` default routes buttons to `--ds-radius-full`, which no
 * allowlisted override can square, and pill controls are a forbiddenOutcome
 * there). With only two published profiles, both tenants collided on this
 * axis -- the compiler canary asserts a recipe-profile divergence and it went
 * red. `editorial-round@1` cannot absorb BitHire either: it was sighted and
 * REJECTED here, and its pill controls are forbidden for this direction too.
 *
 * `rottay/network-professional@1` is therefore added to the closed registry
 * and selected. It composes ONLY existing axis values -- no vocabulary was
 * extended -- and the previous id remains published and permanent per the
 * registry's supersede-never-reuse law.
 */
/**
 * @domicile pro-expert
 * @governor capability: recipes (activa en bithire)
 */
const RECIPES: BrandRecipeSelection = { schemaVersion: 1, profile: "rottay/network-professional@1" };

// ── EXPRESSIVE ──
/*
 * C1b expressive selection. The composition DESCRIBES the identity this
 * theme already authors — technical tracking, sharp geometry, hairline
 * edges, flat material, keyline lift, no motif — so every authored field
 * above keeps winning and the expansion only adds the profile channels
 * (edge roles at their 1px floors, explicit 'none' textures, the
 * provenance marker). Review note for Codex: authored labelStyle
 * "sentence" and the authored table header chrome deliberately shield
 * this theme from the technical posture's uppercase defaults.
 */
/**
 * @domicile pro-expert
 * @governor capability: expressive (activa en bithire)
 */
const EXPRESSIVE: BrandExpressiveSelection = {
  schemaVersion: 1,
  experienceProfile: "rottay/bithire-technical@1",
  /*
   * R1 Cohort 1. The selected profile stays published and selected -- ids are
   * permanent -- and the axes the new direction actually moves are layered on
   * top through the sanctioned per-axis override surface. No second registry
   * entry is minted for a delta this small.
   *
   * The art-direction contract names this theme's leading contradiction
   * precisely: "sharp, hairline, flat and motif-free ... over-indexes on an
   * engineering instrument instead of a professional-network product". These
   * four axes are that sentence, inverted:
   *   type      technical -> humanist    (a people product, not an instrument)
   *   geometry  sharp     -> soft        (approachable silhouette, NOT pill --
   *                                       pill controls stay forbidden here)
   *   material  flat      -> soft-depth  (surfaces you can rest content on)
   *
   * `edge: 'hairline'` is deliberately NOT overridden. BitHire keeps its
   * hairline discipline, which is exactly what separates it from The
   * Management's ruled ledger edges on the edge-and-divider axis -- and it
   * keeps this from becoming a soft-everything recolor.
   *
   * `elevation` is deliberately NOT overridden either. Moving it to
   * 'soft-depth' makes this theme emit `--ds-elevation-lift-strength` INSTEAD
   * of `--ds-elevation-1` -- a vocabulary SPLIT rather than a divergence. The
   * db-row canary guards that exact distinction by name and caught the
   * attempt. The axis stays on the profile's `hairline-lift` until the lever
   * that keeps both tenants on the shared `--ds-elevation-*` vocabulary is
   * identified. Recorded as an open item rather than faked by splitting.
   */
  profiles: {
    type: "humanist",
    // 'rounded', NOT 'soft'. The Management's editorial posture already holds
    // 'soft', so choosing it here moved BitHire ONTO its counterpart and
    // collapsed the geometry axis -- the acid test measures separation, not
    // individual correctness, and it caught the convergence. 'rounded' is
    // both the more approachable network silhouette and the value that keeps
    // the two systems apart. It is an expressive axis, not a control shape:
    // pill CONTROLS remain forbidden and are governed by the recipe profile.
    geometry: "rounded",
    // `material` is deliberately left on the profile's 'flat'. The Management
    // authors 'paper'; overriding BitHire to 'soft-depth' collapsed the
    // materials axis in the compiled channel. Flat-vs-paper is a real,
    // legible material difference and it survives grayscale.
  },
};

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
  /**
   * @placeholder PALETTE.aliases
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaBlack100
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaBlack50
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaError20
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaPrimary10
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaPrimary20
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaSecondary10
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaSecondary20
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaSuccess20
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaWarning20
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaWhite50
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.bgInfoColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.bgSubtleColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.neutralZeroColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.primaryForegroundColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.primarySubtleColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  ramps: {
    neutral: {
      50: "#f3f2ef",
      100: "#eae9e5",
      200: "#e0dfdb",
      300: "#c7c5c0",
      400: "#a8a6a0",
      500: "#888d9e",
      600: "#666666",
      700: "#474747",
      800: "#2c2c2c",
      900: "#191919",
    },
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  primaryColor: "#3A6FB0",
  primaryHoverColor: "#2c5587",
  /**
   * @placeholder PALETTE.ramps.accent
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.error
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.info
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.primary
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.secondary
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.success
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.warning
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  secondaryColor: "#315F86",
  secondaryHoverColor: "#274e70",
  accentColor: "#86A6C2",
  accentHoverColor: "#6f92b0",
  backgroundColor: "#F4F8FB",
  backgroundSecondaryColor: "#f3f2ef",
  backgroundTertiaryColor: "#e8eef6",
  backgroundElevatedColor: "#ffffff",
  backgroundSurfaceColor: "#ffffff",
  /**
   * @placeholder PALETTE.shadowColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.surfaceColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.surfaceMutedColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.surfaceSecondaryColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.textColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.textInverseColor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora esta hoja de palette
   */
  textPrimaryColor: "#14283B",
  /**
   * Raiz de tinta del tier de pagina (K3, F4A-6): sidebar, headers de tabla,
   * labels de formulario — el mobiliario de pagina, no el contenido.
   * @domicile seed
   * @governor dial: tenant-dial (tinta de pagina); calibracion en F4B
   */
  textPageColor: "#53697E",
  textSecondaryColor: "#53697e",
  textTertiaryColor: "#7f859b",
  textMutedColor: "#8a9aaa",
  textDisabledColor: "#b2b6c5",
  onPrimaryColor: "#ffffff",
  /**
   * @domicile seed
   * @governor dial en F4B (raiz autora del par border, K2: --ds-color-border)
   */
  borderColor: "#d4e0ea",
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  borderPrimaryColor: "var(--ds-color-border)",
  borderSecondaryColor: "#c4d2de",
  borderTertiaryColor: "#e8e9f0",
  borderSubtleColor: "#e4e5ed",
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  borderFocusColor: "#3a6fb0",
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  linkColor: "#3a6fb0",
  linkHoverColor: "#2c5587",
  linkVisitedColor: "#6b3fa0",
  successColor: "#327CA8",
  successBgColor: "#f0fdf4",
  successBorderColor: "rgba(5, 118, 66, 0.25)",
  warningColor: "#D6A04E",
  warningBgColor: "#fffbeb",
  warningBorderColor: "rgba(231, 163, 62, 0.25)",
  /**
   * @domicile seed
   * @governor dial: token-overrides
   */
  errorColor: "#C5504C",
  errorBgColor: "#fef2f2",
  errorBorderColor: "rgba(204, 16, 22, 0.25)",
  infoColor: "#3A6FB0",
  infoBgColor: "#f0f7ff",
  infoBorderColor: "rgba(10, 102, 194, 0.25)",
  interactiveBgHoverColor: "rgba(10, 102, 194, 0.06)",
  interactiveBgActiveColor: "rgba(10, 102, 194, 0.08)",
  interactiveBgMutedColor: "#f4f8fd",
  backgroundOverlayColor: "rgba(20, 40, 59, 0.42)",
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
    "var(--ds-font-pack-grotesk-display, 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif)",
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
    "var(--ds-font-pack-grotesk-display, 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  headingWeightBias: "heavier",
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  headingLetterSpacing: "-0.025em",
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  labelStyle: "sentence",
  letterSpacing: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    display: "-0.035em",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    heading: "-0.025em",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    body: "0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    mono: "0",
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
    heading: 1.25,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    body: 1.55,
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
  // Operational recruiting surfaces need high information density without
  // shrinking touch targets. Component geometry below owns controls; this
  // multiplier tightens the surrounding spacing ramp.
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  densityScale: 0.9,
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  borderRadius: { sm: "7px", md: "10px", lg: "14px", xl: "18px", full: "9999px" },
  // Four deliberately quiet but perceptibly different levels. Borders keep
  // the information architecture explicit; elevation only explains nesting.
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  shadows: {
    sm: "0 1px 2px rgba(20, 40, 59, 0.08), 0 0 0 1px rgba(20, 40, 59, 0.025)",
    md: "0 10px 28px -18px rgba(20, 40, 59, 0.28), 0 2px 7px rgba(20, 40, 59, 0.08)",
    lg: "0 22px 52px -24px rgba(20, 40, 59, 0.34), 0 6px 18px rgba(20, 40, 59, 0.09)",
    xl: "0 34px 80px -28px rgba(20, 40, 59, 0.42), 0 12px 28px rgba(20, 40, 59, 0.11)",
  },
  surfaceRoles: {
    canvas: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      background: "#f8fbff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foreground: "#14283B",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      texture:
        "radial-gradient(circle at 88% 4%, rgba(58, 111, 176, 0.055), transparent 30%)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shell: {
      background: "#EEF4F8",
      foreground: "#14283B",
      border: "#D4E0EA",
    },
    panel: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      background:
        "#f4f8fd",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundHover:
        "linear-gradient(180deg, #FBFDFE 0%, #F2F8FC 100%)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundActive:
        "linear-gradient(180deg, #F6FAFC 0%, #EBF3F8 100%)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundSelected:
        "linear-gradient(180deg, #F8FBFF 0%, #EAF3FB 100%)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      backgroundDisabled: "#EFF3F6",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foreground: "#14283B",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foregroundMuted: "#60758A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foregroundDisabled: "#91A0AF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: "#D4E0EA",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderStrong: "#B9CCDC",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderHover: "#9CB8CE",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderActive: "#6F96B8",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderSelected: "#5F8DB6",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderDisabled: "#DEE6EC",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: "0 0 0 3px rgba(58, 111, 176, 0.14)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadow: "0 1px 2px rgba(20, 40, 59, 0.035)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowHover:
        "0 10px 28px -22px rgba(20, 40, 59, 0.28), 0 2px 6px rgba(20, 40, 59, 0.05)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadowActive: "0 1px 2px rgba(20, 40, 59, 0.025)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowSelected:
        "0 8px 24px -20px rgba(20, 40, 59, 0.26), 0 0 0 3px rgba(58, 111, 176, 0.14)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.84)",
    },
    card: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      background: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundHover: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundActive: "linear-gradient(180deg, #F7FAFC 0%, #F1F6FA 100%)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundSelected: "linear-gradient(180deg, #F8FBFF 0%, #EDF5FC 100%)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      backgroundDisabled: "#F3F6F8",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foreground: "#14283B",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foregroundMuted: "#60758A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foregroundDisabled: "#91A0AF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: "#D4E0EA",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderStrong: "#B9CCDC",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderHover: "#86A6C2",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderActive: "#6F96B8",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderSelected: "#5F8DB6",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderDisabled: "#DEE6EC",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: "0 0 0 3px rgba(58, 111, 176, 0.16)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadow:
        "0 1px 2px rgba(20, 40, 59, 0.08), 0 0 0 1px rgba(20, 40, 59, 0.025)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowHover:
        "0 18px 38px -24px rgba(20, 40, 59, 0.32), 0 3px 9px rgba(20, 40, 59, 0.08)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowActive: "0 1px 2px rgba(20, 40, 59, 0.06)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowSelected:
        "0 10px 26px -20px rgba(20, 40, 59, 0.3), 0 2px 6px rgba(20, 40, 59, 0.06), 0 0 0 3px rgba(58, 111, 176, 0.16)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    inset: {
      background: "#EDF3F7",
      foreground: "#31506B",
      border: "#D7E2EA",
    },
    control: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      background: "#FFFFFF",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundHover: "#FAFCFE",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundActive: "#F1F6FA",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      backgroundSelected: "#EDF5FC",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      backgroundDisabled: "#F2F5F7",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foreground: "#14283B",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foregroundMuted: "#60758A",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      foregroundDisabled: "#91A0AF",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: "#C7D6E2",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderStrong: "#86A6C2",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderHover: "#86A6C2",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderActive: "#6F96B8",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderSelected: "#5F8DB6",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderDisabled: "#DCE5EB",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      focusRing: "0 0 0 3px rgba(58, 111, 176, 0.16)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadow: "inset 0 1px 0 rgba(255, 255, 255, 0.92)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowHover:
        "0 5px 14px rgba(20, 40, 59, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.94)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadowActive: "inset 0 1px 2px rgba(20, 40, 59, 0.08)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      shadowSelected:
        "0 3px 10px rgba(20, 40, 59, 0.05), 0 0 0 3px rgba(58, 111, 176, 0.16)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    raised: {
      background: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%)",
      foreground: "#14283B",
      border: "#C7D6E2",
      shadow:
        "0 16px 36px -24px rgba(20, 40, 59, 0.36), 0 4px 12px rgba(20, 40, 59, 0.08)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overlay: {
      background: "#ffffff",
      foreground: "#14283B",
    },
  },
  /**
   * @domicile seed
   * @governor dial: surfaces.effect-intensity
   */
  glass: {
    blur: "12px",
    background: "rgba(255, 255, 255, 0.84)",
    border: "rgba(196, 210, 222, 0.86)",
  },
  gradients: {
    /**
     * @domicile seed
     * @governor dial: surfaces.effect-intensity
     */
    primary: "linear-gradient(135deg, #244D79 0%, #3A6FB0 54%, #86A6C2 100%)",
    /**
     * @domicile seed
     * @governor dial: surfaces.effect-intensity
     */
    surface: "linear-gradient(145deg, #FFFFFF 0%, #F7FAFC 58%, #F5F2EC 100%)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    mesh: "radial-gradient(circle at 84% 8%, rgba(58, 111, 176, 0.14), transparent 58%)",
  },
  // Quiet-premium materiality. This intentionally stays below the tenant
  // compiler's conservative range while allowing reusable DS primitives to
  // express depth, glass and gradient roles.
  /**
   * @domicile seed
   * @governor dial: surfaces.effect-intensity
   */
  effectIntensity: 0.58,
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  overlays: {
    light: "rgba(20, 40, 59, 0.02)",
    medium: "rgba(20, 40, 59, 0.04)",
    heavy: "rgba(20, 40, 59, 0.08)",
  },
  /**
   * @placeholder SURFACES.elevations
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.shadows.focusRing
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.shadows.focusRingError
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.shadows.inner
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.shadows.xs
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.shadows.xxl
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
};

// ── MOTION ──
/**
 * @domicile pro-expert
 * @governor capability: motion (activa en bithire)
 */
const MOTION: BrandMotion = {
  // Expressive-calm: fast enough for operational work, alive enough to make
  // interactive surfaces feel intentional.
  intensity: 0.55,
  entrance: "fade",
  entranceDuration: 200,
  hoverLift: 1,
  hoverScale: 1.0,
  useSpring: false,
  springTension: 170,
  springFriction: 26,
  staggerDelay: 30,
  staggerMax: 200,
  pulseSpeed: "slow",
  skeletonStyle: "pulse",
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
  mountDuration: 400,
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
  lineStyle: "smooth",
  showDots: false,
  useGradientFill: true,
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
  tooltipStyle: "detailed",
  // The monochrome family keeps dense recruiting charts legible; semantic
  // highlights still use success/warning/error at the call site.
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
  colorScheme: "monochrome",
};

// ── CHROME ──
const CHROME: BrandChrome = {
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  /**
   * @placeholder CHROME.calendar
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia calendar (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.backTop
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia backTop (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.avatar
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia avatar (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.anchor
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia anchor (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.alert
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia alert (gobernaria chrome.families)
   */
  card: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    defaultElevation: "md",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    hoverElevation: "lift-two",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    showBorder: true,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    hoverTint: true,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    paddingDensity: "compact",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  accent: {
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    barPosition: "none",
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    barThickness: 0,
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    barStyle: "solid",
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    iconContainerShape: "circle",
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    badgeShape: "pill",
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    dividerStyle: "solid",
  },
  /**
   * @domicile seed
   * @governor dial: navigation.sidebar-tone
   */
  /**
   * @placeholder CHROME.result
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia result (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.progress
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia progress (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.popover
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia popover (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.pagination
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia pagination (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.notification
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia notification (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.message
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia message (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.menu
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia menu (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.liveFeed
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia liveFeed (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.floatButton
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia floatButton (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.empty
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia empty (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.dropdown
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia dropdown (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.drawer
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia drawer (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.descriptions
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia descriptions (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.collapse
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia collapse (gobernaria chrome.families)
   */
  sidebar: {
    // Shell geometry is a brand decision, not a color-mode one: authored
    // here it reaches both modes, matching how rottay already ships it.
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    width: "256px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    collapsedWidth: "64px",
    /**
     * @domicile seed
     * @governor dial: navigation.sidebar-tone
     */
    bg: "#ffffff",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBg: "#F8FBFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    text: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textMuted: "#728398",
    // Type ramp alignment (design-language §2.1): group headers on the
    // detail size, items on the body size, active weight on the 400/600/700 ramp.
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupFontSize: "0.75rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupFontWeight: 600,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupColor: "#728398",
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
    itemFontSize: "0.875rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemIndent: "6px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeight: 400,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeightActive: 600,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColor: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorActive: "#3A6FB0",
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-8
     */
    itemBgActive: "var(--ds-tint-8)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgHover: "#F4F8FD",
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
    /**
     * @placeholder CHROME.sidebar.childPaddingInline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.headerHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.iconColumnSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.itemChildHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.itemFontSizeChild
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.itemGap
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.itemHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.itemPaddingInline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.shellPaddingCollapsed
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.shellPaddingInline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  layout: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerHeight: "56px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "#F4F7FA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBg: "rgba(255, 255, 255, 0.92)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBackdrop: "blur(8px)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorder: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    siderBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    siderBorder: "#D4E0EA",
    /**
     * @placeholder CHROME.layout.dividerColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.layout.dividerTextColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  shell: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gridSize: "0px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gridLine: "transparent",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gridOpacity: 0,
    // The page canvas gradient is the ONE allowed background gradient
    // (design-language §5 budget item 1).
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    bg: "linear-gradient(180deg, #F8FAFC 0%, #F3F7FA 58%, #EDF3F7 100%)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    overlay:
      "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 3.5%, transparent) 0%, transparent 42%, rgba(227, 240, 255, 0.48) 100%)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadow:
      "0 12px 34px -26px rgba(20, 40, 59, 0.36), 0 1px 3px rgba(20, 40, 59, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeBg: "#EDF2F6",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeGradient: "#EDF2F6",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    dropdownShadow:
      "0 12px 30px rgba(20, 40, 59, 0.10), 0 2px 8px rgba(20, 40, 59, 0.06)",
    // Decorative shimmers deleted per design-language §5 (skeletons stay
    // `pulse`; AI-live affordances are the sole shimmer exception and do
    // not read these tokens).
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandFont: "'SF Mono', 'Fira Code', Menlo, monospace",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandLetterSpacing: "0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandGridSize: "22px",
    // Blueprint grid overlays retired (design-language §5 / §6.4).
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandGridLineSoft: "transparent",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandGridLine: "transparent",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandGridLineStrong: "transparent",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandGridBg: "none",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandGridBgStrong: "none",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandGlow: "none",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandLine: "none",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandRailBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomeMaxWidth: "1120px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomeGap: "16px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomePanelGap: "14px",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeGridLine:
      "color-mix(in srgb, var(--ds-color-primary) 6%, transparent)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomePanelBorder: "#A9C9EA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomePanelBorderSoft: "#B7D3F2",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomePanelShadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomePanelBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomePanelBgStrong: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomeCompactActionHeight: "202px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomeConsoleMinHeight: "calc(100vh - 108px)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomeConsolePadding:
      "clamp(20px, 3vw, 34px) clamp(16px, 4vw, 56px) 24px",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeConsoleBg: "#F6FAFE",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeSurfaceBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeHeroBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeIconBg: "color-mix(in srgb, #3A6FB0 9%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeIconBorder: "color-mix(in srgb, #3A6FB0 32%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomeControlBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomeControlBorder: "#B7D3F2",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeControlHoverBg: "color-mix(in srgb, #3A6FB0 7%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeControlHoverBorder: "color-mix(in srgb, #3A6FB0 42%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    commandHomeMeterBg: "color-mix(in srgb, #D4E0EA 72%, transparent)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    commandHomeMeterFill: "linear-gradient(90deg, #315F86, #6F98BC)",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  /**
   * @placeholder CHROME.timeline
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia timeline (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.tag
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia tag (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.steps
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia steps (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.statsGrid
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia statsGrid (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.statistic
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia statistic (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.spinner
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia spinner (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.skeleton
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia skeleton (gobernaria chrome.families)
   */
  toolbar: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "color-mix(in srgb, #3A6FB0 4%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderBottom: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadow: "0 1px 2px rgba(20, 40, 59, 0.04)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    radius: "8px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    padding: "0.75rem 1rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gap: "0.75rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    controlBg: "#ffffff",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    controlBorder: "#C4D2DE",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    controlColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    divider: "#E3EAF0",
  },
  filterPill: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "#ffffff",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadow: "0 1px 2px rgba(20, 40, 59, 0.03)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary, --ds-color-border
     */
    frameBorder: "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-color-border))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    frameShadow:
      "0 1px 2px rgba(20, 40, 59, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary, --ds-control-surface
     */
    hoverBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-control-surface))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary, --ds-color-border
     */
    hoverBorder: "color-mix(in srgb, var(--ds-color-primary) 20%, var(--ds-color-border))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-8
     */
    activeBg: "var(--ds-tint-8)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary, --ds-color-border
     */
    activeBorder: "color-mix(in srgb, var(--ds-color-primary) 26%, var(--ds-color-border))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeColor: "#3A6FB0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeShadow:
      "inset 0 0 0 1px var(--ds-filter-pill-active-border), 0 1px 2px color-mix(in srgb, var(--ds-control-ink) 6%, transparent)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-24
     */
    focusRing: "0 0 0 3px var(--ds-tint-24)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-surface-panel, --ds-control-surface
     */
    countBg: "color-mix(in srgb, var(--ds-surface-panel) 78%, var(--ds-control-surface))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-control-surface
     */
    countActiveBg: "var(--ds-control-surface)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    countBorder: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    countActiveBorder: "color-mix(in srgb, #3A6FB0 24%, #C4D2DE)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    countRing: "none",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    countActiveRing:
      "none",
  },
  badge: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-font-family-base
     */
    fontFamily: "var(--ds-font-family-base)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    fontWeight: 700,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    letterSpacing: "-0.008em",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gap: "0.3125rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    height: "28px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    paddingX: "0.625rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    lineHeight: "1.2",
    /**
     * @domicile derived
     * @governor deriva de: --ds-control-surface-raised
     */
    defaultBg: "var(--ds-control-surface-raised)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-control-ink-muted
     */
    defaultColor: "var(--ds-control-ink-muted)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-control-brand-tint
     */
    primaryBg: "var(--ds-control-brand-tint)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    primaryColor: "var(--ds-color-primary)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-control-surface-raised
     */
    secondaryBg: "var(--ds-control-surface-raised)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-control-ink-muted
     */
    secondaryColor: "var(--ds-control-ink-muted)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    successBg:
      "color-mix(in srgb, var(--ds-color-success) 12%, var(--ds-control-surface))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-success
     */
    successColor: "var(--ds-color-success)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    warningBg:
      "color-mix(in srgb, var(--ds-color-warning) 16%, var(--ds-control-surface))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-warning-900, --ds-color-warning
     */
    warningColor: "var(--ds-color-warning-900, var(--ds-color-warning))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    errorBg:
      "color-mix(in srgb, var(--ds-color-error) 12%, var(--ds-control-surface))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-error
     */
    errorColor: "var(--ds-color-error)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoBg:
      "color-mix(in srgb, var(--ds-color-info, var(--ds-color-secondary, var(--ds-color-primary))) 12%, var(--ds-control-surface))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    infoColor:
      "var(--ds-color-info, var(--ds-color-secondary, var(--ds-color-primary)))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-radius-full
     */
    radius: "var(--ds-radius-full)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    chipRadius: "9px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    pillRadius: "9999px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    surface: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    ink: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    frame: "color-mix(in srgb, #3A6FB0 16%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.78)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    surfaceHover: "color-mix(in srgb, #3A6FB0 6%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    inkHover: "#2C5587",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    frameHover: "color-mix(in srgb, #3A6FB0 34%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadowHover: "0 8px 18px -13px rgba(20, 40, 59, 0.42)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    hoverTransform: "translateY(-1px)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    surfacePressed: "color-mix(in srgb, #3A6FB0 10%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    framePressed: "color-mix(in srgb, #3A6FB0 42%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    pressTransform: "translateY(0) scale(0.985)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    focusRing: "0 0 0 3px color-mix(in srgb, #3A6FB0 24%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    selectedSurface: "color-mix(in srgb, #3A6FB0 10%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    selectedInk: "#2C5587",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    selectedFrame: "color-mix(in srgb, #3A6FB0 38%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    selectedShadow: "inset 0 0 0 1px rgba(58, 111, 176, 0.10), 0 1px 2px rgba(20, 40, 59, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconBg: "color-mix(in srgb, #3A6FB0 8%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconBorder: "color-mix(in srgb, #3A6FB0 24%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconRadius: "6px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    countBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    countBorder: "color-mix(in srgb, #3A6FB0 20%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    countRadius: "9999px",
    /**
     * @domicile derived
     * @governor deriva de: --ds-font-family-mono
     */
    countFontFamily: "var(--ds-font-family-mono)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    removeBg: "color-mix(in srgb, #3A6FB0 5%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    removeBorder: "color-mix(in srgb, #3A6FB0 18%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    removeRadius: "9999px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    removeHoverBg: "color-mix(in srgb, #3A6FB0 12%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    motionDuration: "140ms",
    /**
     * @domicile derived
     * @governor deriva de: --ds-motion-ease-out
     */
    motionEasing: "var(--ds-motion-ease-out, ease-out)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    pulseDuration: "1.8s",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    pulseScale: 1.14,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    touchTarget: "2.75rem",
    /**
     * @placeholder CHROME.badge.borderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.badge.textColor
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
    bg: "color-mix(in srgb, #3A6FB0 4%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: "#53697E",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-secondary
     */
    linkColor: "var(--ds-color-text-secondary)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColor: "#53697E",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    colorHover: "var(--ds-color-primary)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    colorActive: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    separatorColor: "#8A9AAA",
    // Breadcrumbs sit on the detail step of the type ramp (design-language §2.1).
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    fontSize: "11px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    fontWeight: 400,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    padding: "0.625rem 1rem",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  search: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "#ffffff",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadow:
      "0 12px 30px rgba(20, 40, 59, 0.10), 0 2px 8px rgba(20, 40, 59, 0.06)",
    // Command palette / search modal rides the xl radius step (design-language §2.3).
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    radius: "14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    inputBg: "#ffffff",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    inputBorder: "#C4D2DE",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    inputColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    placeholderColor: "#8A9AAA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconColor: "#8A9AAA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    clearColor: "#AEBCC8",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    clearColorHover: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    resultBg: "#ffffff",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    resultBgHover: "#F4F8FD",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    resultBorder: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    resultShadow: "0 1px 2px rgba(20, 40, 59, 0.04)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    resultTitleColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    resultMetaColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    categoryColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    emptyBg: "#F4F8FD",
    /**
     * @placeholder CHROME.search.commandPalette
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.button-style, typography.scale, shape.radius-scale, chrome.families, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  controls: {
    semantic: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      ink: "var(--ds-color-text-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-secondary
       */
      inkMuted: "var(--ds-color-text-secondary)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      onBrand:
        "var(--ds-color-text-on-primary, var(--ds-color-text-inverse))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-card
       */
      surface: "var(--ds-surface-card)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      surfaceRaised:
        "color-mix(in srgb, var(--ds-surface-card) 86%, var(--ds-surface-panel))",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      brandTint:
        "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-control-surface))",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      brandTintHover:
        "color-mix(in srgb, var(--ds-color-primary) 15%, var(--ds-control-surface))",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      brandBorder:
        "color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border))",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      iconTileBorder:
        "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border))",
    },
    buttonGeometry: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      fontWeight: 600,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      letterSpacing: "-0.005em",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      gap: "6px",
      /**
       * @domicile seed
       * @governor dial: shape.button-style
       */
      radius: "9px",
      xs: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "26px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "8px",
        /**
         * @domicile seed
         * @governor dial: typography.scale
         */
        fontSize: "11px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "16px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "12px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        gap: "4px",
        /**
         * @domicile seed
         * @governor dial: shape.radius-scale
         */
        radius: "7px",
      },
      sm: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "32px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "11px",
        /**
         * @domicile seed
         * @governor dial: typography.scale
         */
        fontSize: "12px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "18px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "14px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        gap: "6px",
        /**
         * @domicile seed
         * @governor dial: shape.radius-scale
         */
        radius: "8px",
      },
      md: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "36px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "13px",
        /**
         * @domicile seed
         * @governor dial: typography.scale
         */
        fontSize: "13px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "20px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "15px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        gap: "6px",
        /**
         * @domicile seed
         * @governor dial: shape.radius-scale
         */
        radius: "9px",
      },
      lg: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "40px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "16px",
        /**
         * @domicile seed
         * @governor dial: typography.scale
         */
        fontSize: "14px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "22px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "16px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        gap: "7px",
        /**
         * @domicile seed
         * @governor dial: shape.radius-scale
         */
        radius: "10px",
      },
      xl: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "46px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "20px",
        /**
         * @domicile seed
         * @governor dial: typography.scale
         */
        fontSize: "15px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "24px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "18px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        gap: "8px",
        /**
         * @domicile seed
         * @governor dial: shape.radius-scale
         */
        radius: "11px",
      },
    },
    fieldGeometry: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      gap: "7px",
      /**
       * @domicile seed
       * @governor dial: shape.radius-scale
       */
      radius: "9px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      fontWeight: 400,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      letterSpacing: "0.005em",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderWidth: "1px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderStyle: "solid",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      messageGap: "4px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupGap: "0px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupGapSeparated: "8px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupOverlap: "-1px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      groupMinItemWidth: "192px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      formFieldGap: "6px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      horizontalGap: "16px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelOffsetY: "1px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      requiredGap: "0.25em",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      formFieldDisabledOpacity: 0.52,
      /**
       * @domicile seed
       * @governor dial: typography.scale
       */
      labelFontSize: "12px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelFontWeight: 600,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelLetterSpacing: "0.02em",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      labelLineHeight: "1.4",
      /**
       * @domicile seed
       * @governor dial: typography.scale
       */
      helperFontSize: "11px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      helperLineHeight: "1.45",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      affixSize: "22px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      affixSizeCompact: "18px",
      /**
       * @domicile seed
       * @governor dial: shape.radius-scale
       */
      affixRadius: "6px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      actionSize: "24px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      actionRadius: "6px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      touchTargetMin: "44px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      loadingSize: "16px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      loadingStroke: "1.75",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      loadingDuration: "700ms",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textareaMinHeight: "104px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textareaMaxHeight: "420px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textareaPaddingX: "12px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textareaPaddingY: "10px",
      /**
       * @domicile seed
       * @governor dial: shape.radius-scale
       */
      textareaRadius: "10px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      textareaResize: "vertical",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      transitionDuration: "160ms",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      transitionTiming: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      xs: {
        height: "28px",
        paddingX: "8px",
        paddingY: "4px",
        fontSize: "11px",
        lineHeight: "16px",
        iconSize: "13px",
        radius: "7px",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      sm: {
        height: "32px",
        paddingX: "10px",
        paddingY: "5px",
        fontSize: "12px",
        lineHeight: "18px",
        iconSize: "14px",
        radius: "8px",
      },
      md: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "36px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "11px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingY: "7px",
        /**
         * @domicile seed
         * @governor dial: typography.scale
         */
        fontSize: "13px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "20px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "15px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        radius: "9px",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      lg: {
        height: "40px",
        paddingX: "13px",
        paddingY: "8px",
        fontSize: "14px",
        lineHeight: "22px",
        iconSize: "16px",
        radius: "10px",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      xl: {
        height: "46px",
        paddingX: "15px",
        paddingY: "10px",
        fontSize: "15px",
        lineHeight: "24px",
        iconSize: "18px",
        radius: "11px",
      },
    },
    // R1 Cohort 1 — VERTICAL LEAK FIX.
    //
    // Every value in this group used to be a hardcoded BitHire blue literal.
    // That matters more than it looks: this BrandTheme compiles into the
    // vertical artifact, whose selector is
    //   :is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire']))
    // and the second arm matches EVERY tenant in the bithire vertical. So these
    // literals were not BitHire's paint — they were the whole vertical's paint,
    // and no tenant could reach them because no --ds-segmented-* token is in
    // TENANT_THEME_OVERRIDE_TOKENS. The Management rendered a pale-blue
    // segmented track for exactly this reason, and re-keying the skin plus
    // authoring the surface seed both failed to move it because this literal
    // outranked them.
    //
    // Each value now resolves through the tenant-reachable semantic authority
    // with the previous BitHire literal as the fallback, so BitHire's own paint
    // is unchanged where it authors nothing new, and any tenant in the vertical
    // can finally reach the group. Same defect class and same remedy as the
    // --ds-button-{size}-radius literal.
    //
    // GROUND comes from --ds-surface-control (the canonical ground authority);
    // STATES and FACETS come from --ds-material-control-* (which deliberately
    // has no base -background, since the role derives it from the seed).
    segmented: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control
       */
      bg: "var(--ds-surface-control, color-mix(in srgb, #EAF2FA 76%, #FFFFFF))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-border
       */
      border: "var(--ds-material-control-border, #C7D6E5)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-radius-md
       */
      radius: "var(--ds-radius-md, 10px)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      padding: "3px",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      gap: "2px",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-shadow
       */
      shadow: "var(--ds-material-control-shadow, inset 0 1px 0 rgba(255,255,255,0.82))",
      // itemBg stays transparent: the track ground shows through, so it is
      // already tenant-following and needs no channel of its own.
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBg: "transparent",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgHover:
        "var(--ds-material-control-background-hover, rgba(255,255,255,0.66))",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemBgSelected:
        "var(--ds-material-control-background-selected, #FFFFFF)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-foreground-muted
       */
      itemColor: "var(--ds-material-control-foreground-muted, #53697E)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-foreground
       */
      itemColorHover: "var(--ds-material-control-foreground, #233B55)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-foreground
       */
      itemColorSelected: "var(--ds-material-control-foreground, #14283B)",
      // Same ramp rebase as the button radii: a literal here is a vertical
      // leak that keeps every tenant in the vertical on BitHire geometry.
      // TMM authors --ds-radius-sm: 0px and therefore gets square segments;
      // BitHire, which authors no sm step of its own here, keeps 7px.
      /**
       * @domicile derived
       * @governor deriva de: --ds-radius-sm
       */
      itemRadius: "var(--ds-radius-sm, 7px)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemShadowSelected:
        "var(--ds-material-control-shadow-selected, 0 1px 2px rgba(22,42,67,0.10), 0 0 0 1px rgba(58,111,176,0.08))",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemFontWeight: 500,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      itemFontWeightSelected: 600,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      focusRing:
        "var(--ds-material-control-focus-ring, 0 0 0 3px rgba(58,111,176,0.18))",
      sm: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "28px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "9px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        fontSize: "11px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "16px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "13px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        gap: "5px",
        /**
         * @domicile derived
         * @governor deriva de: --ds-radius-sm
         */
        radius: "var(--ds-radius-sm, 6px)",
      },
      md: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "32px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "11px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        fontSize: "12px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "18px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "14px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        gap: "6px",
        /**
         * @domicile derived
         * @governor deriva de: --ds-radius-sm
         */
        radius: "var(--ds-radius-sm, 7px)",
      },
      lg: {
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        height: "38px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        paddingX: "14px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        fontSize: "13px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        lineHeight: "20px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        iconSize: "16px",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        gap: "7px",
        /**
         * @domicile derived
         * @governor deriva de: --ds-radius-sm
         */
        radius: "var(--ds-radius-sm, 8px)",
      },
    },
    buttonPrimary: {
      /**
       * @domicile seed
       * @governor dial: chrome.families
       */
      bg: "#3A6FB0",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      bgHover: "#2C5587",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgActive:
        "var(--ds-color-primary-active, var(--ds-button-primary-bg-hover))",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      text: "#ffffff",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-on-brand
       */
      color: "var(--ds-control-on-brand)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-button-primary-bg
       */
      border: "var(--ds-button-primary-bg)",
      // CTRL-04: the seventh instance of the vertical-literal class. A flat
      // literal here is the whole VERTICAL's primary depth, so a monochrome
      // tenant inherited BitHire's soft blue-tinted lift. Reads the control
      // role first; BitHire's own value stays as the fallback, which is its
      // direction's "subtle keyline plus low soft shadow on interactive".
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-shadow
       */
      shadow: "var(--ds-material-control-shadow, 0 1px 2px rgba(20, 40, 59, 0.1))",
    },
    buttonSecondary: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-brand-tint
       */
      bg: "var(--ds-control-brand-tint)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-brand-tint-hover
       */
      bgHover: "var(--ds-control-brand-tint-hover)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgActive:
        "color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-control-surface))",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      text: "#3A6FB0",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      color: "#3A6FB0",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-brand-border
       */
      border: "var(--ds-control-brand-border)",
    },
    buttonDefault: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-surface
       */
      bg: "var(--ds-control-surface)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-surface-raised
       */
      bgHover: "var(--ds-control-surface-raised)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgActive:
        "color-mix(in srgb, var(--ds-surface-panel) 82%, var(--ds-control-surface))",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      text: "#14283B",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-ink
       */
      color: "var(--ds-control-ink)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-ink
       */
      colorHover: "var(--ds-control-ink)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-ink
       */
      colorActive: "var(--ds-control-ink)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-border
       */
      border: "var(--ds-color-border)",
    },
    buttonGhost: {
      /**
       * @domicile seed
       * @governor dial: token-overrides
       */
      bg: "transparent",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-brand-tint
       */
      bgHover: "var(--ds-control-brand-tint)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-brand-tint-hover
       */
      bgActive: "var(--ds-control-brand-tint-hover)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      text: "#53697E",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-ink-muted
       */
      color: "var(--ds-control-ink-muted)",
            /**
             * @domicile derived
             * @governor deriva de: --ds-control-ink
             */
            colorHover: "var(--ds-control-ink)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-ink
       */
      colorActive: "var(--ds-control-ink)",
},
    buttonText: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "transparent",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-brand-tint
       */
      bgHover: "var(--ds-control-brand-tint)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-brand-tint-hover
       */
      bgActive: "var(--ds-control-brand-tint-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-ink
       */
      color: "var(--ds-control-ink)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-ink
       */
      colorHover: "var(--ds-control-ink)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-control-ink
       */
      colorActive: "var(--ds-control-ink)",
    },
    // Status and link variants. `buttonError` is the single owner of the
    // error/danger pair: the compiler spells one authored decision into both
    // vocabularies, so there is no `buttonDanger` field to author.
    buttonError: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-error
       */
      bg: "var(--ds-color-error)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-error-hover, --ds-color-error
       */
      bgHover: "var(--ds-color-error-hover, var(--ds-color-error))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-on-error, --ds-control-on-brand
       */
      color: "var(--ds-color-text-on-error, var(--ds-control-on-brand))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-error
       */
      border: "var(--ds-color-error)",
    },
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-on-success, --ds-control-on-brand
     */
    buttonSuccess: {
      color: "var(--ds-color-text-on-success, var(--ds-control-on-brand))",
    },
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-warning-900, --ds-control-ink
     */
    buttonWarning: {
      color: "var(--ds-color-warning-900, var(--ds-control-ink))",
    },
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-on-info, --ds-control-on-brand
     */
    buttonInfo: {
      color: "var(--ds-color-text-on-info, var(--ds-control-on-brand))",
    },
    buttonLink: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary
       */
      color: "var(--ds-color-primary)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-hover
       */
      colorHover: "var(--ds-color-primary-hover)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorActive:
        "var(--ds-color-primary-active, var(--ds-button-link-color-hover))",
    },
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    focusRingColor: "var(--ds-color-primary)",
    // Field and dropdown chrome. `light` is this theme's declared default
    // mode, so these light values belong in the body; `modes.dark` pins the
    // dark side to the value it resolves to today.
    select: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: "#ffffff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgHover: "#ffffff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgFocus: "#ffffff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      color: "#14283b",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorPlaceholder: "#8a9aaa",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderColor: "#c4d2de",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderColorHover: "#a8a7c6",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderColorFocus: "#3a6fb0",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      dropdownBg: "#ffffff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      dropdownBorderColor: "#d4e0ea",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-popover
       */
      dropdownShadow: "var(--ds-shadow-popover)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionBgHover: "#f4f8fd",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionBgSelected: "#e8f3ff",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionColor: "#14283b",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      optionColorSelected: "#3a6fb0",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    disabled: {
      opacity: 0.45,
      bg: "#F8FAFC",
      text: "#AEBCC8",
      border: "#E8EEF3",
      borderColor: "#E8EEF3",
    },
    // R1 Cohort 1 — same vertical-leak rebase as the segmented group and the
    // button/input radii. These were flat BitHire literals compiled into the
    // VERTICAL artifact, so tenants in the vertical inherited BitHire's
    // cool blue field chrome: measured --ds-input-border and
    // --ds-input-border-focus were BYTE-IDENTICAL under both tenants while the
    // grounds already diverged. A field is a control whose WELL is an inset
    // surface, so ground and edge resolve through the inset role and the
    // interactive edge/focus through the control role. BitHire's own values
    // stay as the fallbacks, so its paint is unchanged where it authors nothing.
    input: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-inset
       */
      bg: "var(--ds-surface-inset, #ffffff)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-inset
       */
      bgHover: "var(--ds-surface-inset, #ffffff)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-inset
       */
      bgFocus: "var(--ds-surface-inset, #FFFFFF)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-inset-border
       */
      border: "var(--ds-material-inset-border, #C4D2DE)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-border-hover
       */
      borderHover: "var(--ds-material-control-border-hover, #9DAFC0)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-border-active
       */
      borderFocus: "var(--ds-material-control-border-active, #3A6FB0)",
      // Border COLOR channel, upstream of the shorthands above: `input.css`
      // resolves --ds-input-border from --ds-input-border-color.
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderColor: "#c4d2de",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderColorHover: "#a8a7c6",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderColorFocus: "#3a6fb0",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-inset-shadow
       */
      shadowRest: "var(--ds-material-inset-shadow, 0 1px 2px rgba(20, 40, 59, 0.035))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-inset-shadow-hover
       */
      shadowHover: "var(--ds-material-inset-shadow-hover, 0 3px 10px rgba(20, 40, 59, 0.07))",
      /**
       * @domicile derived
       * @governor deriva de: --ds-material-control-focus-ring
       */
      shadowFocus: "var(--ds-material-control-focus-ring, 0 0 0 3px rgba(58, 111, 176, 0.16), 0 2px 8px rgba(20, 40, 59, 0.08))",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      insetShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.82)",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      caretColor: "#3A6FB0",
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      selectionBg: "rgba(58, 111, 176, 0.20)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      selectionColor: "#14283B",
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-text-primary
       */
      color: "var(--ds-color-text-primary)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorPlaceholder: "#8A9AAA",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      placeholderOpacity: 0.9,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgDisabled: "#F8F8F8",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorDisabled: "#AEBCC8",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderDisabled: "#E8EEF3",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      disabledOpacity: 0.45,
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      filled: { bg: "#F4F8FD", bgHover: "#EDF4FB", bgFocus: "#FFFFFF", border: "#D4E0EA" },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      addon: { bg: "#EEF4FA", color: "#53697E", border: "#C4D2DE", radius: "9px", fontWeight: 600 },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      affix: { bg: "#F4F8FD", color: "#53697E", border: "1px solid rgba(58, 111, 176, 0.08)", paddingX: "2px" },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      label: { color: "#233B55", requiredColor: "#B83A4B", disabledColor: "#8A9AAA" },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      helper: { color: "#71869A", errorColor: "#B83A4B", errorFontWeight: 600 },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      clear: { color: "#71869A", colorHover: "#14283B", bg: "transparent", bgHover: "#EAF2FA", border: "1px solid transparent", borderHover: "#C4D2DE", shadowHover: "0 1px 3px rgba(20, 40, 59, 0.10)", focusRing: "0 0 0 2px rgba(58, 111, 176, 0.20)", activeTransform: "scale(0.94)" },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      readOnly: { bg: "#F8FAFC", color: "#53697E", border: "#D4E0EA", borderStyle: "solid", cursor: "text" },
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      loadingColor: "#3A6FB0",
      /**
       * @domicile seed
       * @governor mixta medida en linea compartida: 2 por dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a); 1 por dial: palette.seeds — las 3 hojas comparten una sola linea fuente y no admiten docblock propio sin reformatear
       */
      autofill: { bg: "#F4F8FD", color: "#14283B", caret: "#3A6FB0" },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      count: { color: "#71869A", colorWarning: "#B56D13", colorError: "#B83A4B" },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      successBorder: "#2F8B68",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      successBg: "color-mix(in srgb, #2F8B68 4%, #FFFFFF)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      warningBorder: "#C9822B",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      warningBg: "color-mix(in srgb, #C9822B 5%, #FFFFFF)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorBorder: "#B83A4B",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorBg: "color-mix(in srgb, #B83A4B 4%, #FFFFFF)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      errorColor: "#14283B",
    },
    /**
     * @placeholder CHROME.controls.autocomplete
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonAI
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonDashed
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonDefault.borderActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonDefault.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonDefault.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonDefault.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonDefault.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.text
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGhost.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGhost.borderActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGhost.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGhost.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGhost.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGhost.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.text
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonLink.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonLink.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonLink.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonPrimary.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonPrimary.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSecondary.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSecondary.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSecondary.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSecondary.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.text
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.text
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonWarning.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonWarning.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonWarning.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonWarning.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonWarning.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonWarning.shadowActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonWarning.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonWarning.text
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.checkbox
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.datePicker
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.focusRing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.form
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.errorShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.successShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.warningShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.inputNumber
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.radio
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.rate
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.arrowColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.bgDisabled
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.borderFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.checkColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.clearColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.clearColorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.colorDisabled
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.dropdownBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.filledBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.optionColorDisabled
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.shadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.successBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.tagBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.tagColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.select.warningBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.slider
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.switch
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.textarea
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.timePicker
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.toggle
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.transfer
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.upload
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Familia mixta. Controles: shape.radius-scale, palette.seeds, typography.scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  table: {
    /**
     * @domicile seed
     * @governor coincide en color con la emision de las raices tier (tier.control.bg, tier.raised.bg, tier.page.bg, tier.overlay.bg); es el eje H4: coincide en base y diverge en dark; el fallback literal del skin es --ds-surface-card (data-table.css:288)
     */
    bg: "#ffffff",
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.borderColor (#d4e0ea)
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor el propio archivo declara la relacion en bithire/index.ts:7237 ("Tables/panels ride the lg radius step"), pero el valor DIVERGE del peldano: --ds-radius-lg efectivo de bithire = 14px (base calc(14px/1.25) × escala 1.25, artefacto bithire :812-:814; DS default 12px, default.css:774) frente a 10px autorado
     */
    // Tables/panels ride the lg radius step (design-language §2.3).
    radius: SEED.geometry.tableRadius,
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.backgroundSecondaryColor (#f3f2ef)
     */
    headerBg: SEED.surface.raised,
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.primaryColor (#3A6FB0), literal dentro de color-mix()
     */
    headerBgHover: `color-mix(in srgb, ${PALETTE.primaryColor} 5%, ${SEED.surface.mistTint})`,
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.textPageColor (#53697E)
     */
    headerColor: "#53697E",
    /**
     * @domicile seed
     * @governor coincide con la familia de rol font-weight del tema — groupFontWeight (bithire/index.ts:4346), itemFontWeightActive (:4391), labelFontWeight (:5791), itemFontWeightSelected (:6099) —: relacion por rol declarada; converge ademas con el valor autorado por rottay para el mismo eje (600) y diverge de evnto (500); cardinalidad medida 7
     */
    headerFontWeight: SEED.typeDetail.tableHeaderWeight,
    /**
     * @domicile seed
     * @governor sin coincidencia de raiz; razon falsable: converge con el valor autorado por rottay para el mismo eje (mismo valor, convergencia medida)
     */
    headerFontSize: SEED.typeDetail.tableHeaderSize,
    /**
     * @domicile seed
     * @governor sin coincidencia con PALETTE; DIVERGE de --ds-text-eyebrow-letter-spacing (0.08em), la rampa a la que default.css:1713 enruta este canal: divergencia medida declarada; cardinalidad medida 1
     */
    headerLetterSpacing: "0.065em",
    /**
     * @domicile seed
     * @governor coincide con --ds-text-eyebrow-transform (uppercase), la rampa a la que default.css:1714 enruta este canal: relacion por rol declarada; cardinalidad medida 1
     */
    headerTextTransform: "uppercase",
    /**
     * @domicile seed
     * @governor coincide con mdHeight (bithire/index.ts:8809), mismo rol de altura de control md: relacion declarada; NO coincide con --ds-input-md-height (artefacto bithire, 36px); cardinalidad medida 2
     */
    headerBlockSize: SEED.rhythm.tableHeaderBlockSize,
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.borderColor (#d4e0ea), literal dentro de color-mix()
     */
    headerBorder: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.borderColor (#d4e0ea), literal dentro de color-mix()
     */
    headerShadow:
      "inset 0 -1px 0 color-mix(in srgb, #D4E0EA 82%, transparent)",
    /**
     * @domicile seed
     * @governor coincide en color con la emision de las raices tier (tier.control.bg, tier.raised.bg, tier.page.bg, tier.overlay.bg); es el eje H4: coincide en base y diverge en dark; el fallback literal del skin es --ds-surface-card (data-table.css:288)
     */
    rowBg: "#ffffff",
    /**
     * @domicile seed
     * @governor coincide en color con itemBgHover (bithire/index.ts:4411) y resultBgHover (bithire/index.ts:5399), mismo rol de fondo hover: relacion declarada; sin coincidencia con PALETTE; cardinalidad medida 13
     */
    rowBgHover: "#F4F8FD",
    /**
     * @domicile seed
     * @governor sin coincidencia con PALETTE, con raiz del catalogo ni con ninguna otra clave del tema: valor exclusivo de este eje (cardinalidad medida 1)
     */
    rowBgStriped: SEED.surface.stripeTint,
    /**
     * @domicile seed
     * @governor coincide en color con --ds-select-option-bg-selected (#e8f3ff), mismo rol de fondo de opcion/fila seleccionada: relacion declarada; sin coincidencia con PALETTE; cardinalidad medida 1
     */
    rowBgSelected: SEED.surface.selectedTint,
    /**
     * @domicile seed
     * @governor coincide en color con el tinte compartido #F4F8FD del tema pero en roles distintos: accidente declarado; converge internamente con rowBgHover y filterRowBg del mismo bloque; cardinalidad medida 13
     */
    rowBgExpanded: "#F4F8FD",
    /**
     * @domicile seed
     * @governor coincide en color con la familia de rol borde/divisor del tema — divider (bithire/index.ts:4854), resultBorder (:5404), headerBorder (:7380), footerBorder (:7436) —: relacion por rol declarada; no coincide con PALETTE.borderColor (:3462, #d4e0ea); cardinalidad medida 13
     */
    rowBorder: SEED.edge.divider,
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    rowHoverShadow:
      "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 18%, transparent)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    rowFocusShadow:
      "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 28%, transparent), 0 4px 14px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)",
    /**
     * @domicile seed
     * @governor sin coincidencia con PALETTE ni con ninguna otra clave del tema: valor exclusivo de este eje (cardinalidad medida 1); es el peldano compacto del eje de densidad
     */
    cellPaddingCompact: SEED.rhythm.tableCellPaddingCompact,
    /**
     * @domicile seed
     * @governor coincide con padding (bithire/index.ts:8061), mismo rol de padding de celda/control: relacion declarada; cardinalidad medida 2
     */
    cellPaddingComfortable: SEED.rhythm.tableCellPaddingComfortable,
    /**
     * @domicile seed
     * @governor sin coincidencia con PALETTE ni con ninguna otra clave del tema: valor exclusivo de este eje (cardinalidad medida 1); es el peldano espacioso del eje de densidad
     */
    cellPaddingSpacious: SEED.rhythm.tableCellPaddingSpacious,
    /**
     * @domicile seed
     * @governor dial: typography.scale
     */
    cellFontSize: SEED.typeDetail.tableCellSize,
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-primary
     */
    cellColor: "var(--ds-color-text-primary)",
    /**
     * @domicile seed
     * @governor coincide en color con el tinte compartido #F4F8FD del tema pero en roles distintos (fondos de input/hover): accidente declarado; converge internamente con rowBgHover y rowBgExpanded del mismo bloque; cardinalidad medida 13
     */
    filterRowBg: "#F4F8FD",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    filterFocusShadow:
      "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 14%, transparent), 0 0 8px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)",
    /**
     * @domicile seed
     * @governor coincide en color con las emisiones de PALETTE.primaryColor (#3A6FB0) y PALETTE.borderColor (#d4e0ea), ambos literales dentro de color-mix()
     */
    resizeBg: "color-mix(in srgb, #3A6FB0 22%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.primaryColor (#3A6FB0)
     */
    resizeBgHover: "#3A6FB0",
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-12
     */
    reorderBg: "var(--ds-tint-12)",
    /**
     * @domicile seed
     * @governor coincide en color con la emision de las raices tier (tier.control.bg, tier.raised.bg, tier.page.bg, tier.overlay.bg)
     */
    actionBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.borderColor (#d4e0ea), literal dentro de color-mix()
     */
    actionBorder: "color-mix(in srgb, #D4E0EA 70%, transparent)",
    /**
     * @domicile seed
     * @governor valor keyword none: declara ausencia de efecto, no un color; sin coincidencia de color posible
     */
    sheen: "none",
    /**
     * @domicile seed
     * @governor coincide con el peldano sm de la escala de sombra del tema (bithire/index.ts:580), mismo rol de elevacion baja: relacion declarada; cardinalidad medida 8, toda en claves de rol shadow
     */
    pageButtonHoverShadow: SEED.material.pageButtonShadow,
    /**
     * @domicile seed
     * @governor sin coincidencia de raiz; razon falsable: el piso de default.css:1723 ya emite el mismo valor (rgba(255,255,255,0.7)); 0 consumo en modern/skin, consumido en rustic/skin/data-table.css:101
     */
    loadingOverlayBg: "rgba(255, 255, 255, 0.7)",
  },
  /**
   * @absent CHROME.table.cellPadding
   * @governor cubre el eje bajo otro nombre: bithire reemplaza cellPadding por sus 3 variantes de densidad (cellPaddingCompact/Comfortable/Spacious), ya autoradas; pseudo-silencio, no gap
   */
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale, typography.scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  cardComponent: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    padding: "1rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    paddingSm: "0.875rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    paddingMd: "1rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    paddingLg: "1.25rem",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    paddingXl: "1.5rem",
    /**
     * @domicile derived
     * @governor deriva de: --ds-surface-card
     */
    bg: "var(--ds-surface-card)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary, --ds-surface-card
     */
    bgHover: "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    color: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    colorMuted: "#728398",
    /**
     * @domicile derived
     * @governor deriva de: --ds-premium-card-border
     */
    border: "var(--ds-premium-card-border)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-premium-card-border
     */
    borderColor: "var(--ds-premium-card-border)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-premium-card-border-hover
     */
    borderHover: "var(--ds-premium-card-border-hover)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleLetterSpacing: "0",
    // Resting cards sit at elevation level-1 (design-language §2.4).
    /**
     * @domicile derived
     * @governor deriva de: --ds-surface-shadow, --ds-shadow-sm
     */
    shadow: "var(--ds-surface-shadow, var(--ds-shadow-sm))",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadowHover:
      "var(--ds-surface-shadow-hover, var(--ds-shadow-md))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-radius-md
     */
    radius: "var(--ds-radius-md)",
    // Focus ring rides the tint scale at tint-24/3px (design-language §2.5).
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-24
     */
    focusRing: "0 0 0 3px var(--ds-tint-24)",
    // Expressive-calm keeps the lift-one hover lift (2026-07-02-b).
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    hoverTransform: "translateY(-1px) scale(1)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorder: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorderColor: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBg:
      "linear-gradient(112deg, #EDF5FC 0%, #FFFFFF 54%, #F6F2EA 100%)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerColor: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerPadding: "12px 14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial: typography.scale
     */
    titleFontSize: "13px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleFontWeight: 600,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    subtitleColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bodyColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bodyPadding: "14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBorder: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBorderColor: "#E3EAF0",
    /**
     * @domicile derived
     * @governor deriva de: --ds-premium-card-footer-bg
     */
    footerBg: "var(--ds-premium-card-footer-bg)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerColor: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerPadding: "12px 14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    imagePlaceholderBg: "#F4F8FD",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    imagePlaceholderColor: "#8A9AAA",
    /**
     * @placeholder CHROME.cardComponent.borderAccentHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.imageLoadingActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.imageLoadingTrack
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.shadowElevated
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  // Rich card: mode-agnostic frame plus the banded interior. The interior
  // grounds are light-mode values (this theme's default mode); `modes.dark`
  // pins the dark side to the component layer's own defaults.
  premiumCard: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-surface-card
     */
    bg: "var(--ds-surface-card)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    sheen: "none",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBg:
      "color-mix(in srgb, var(--ds-surface-card) 82%, var(--ds-surface-panel))",
    /**
     * @domicile derived
     * @governor deriva de: --ds-surface-card
     */
    sectionBg: "var(--ds-surface-card)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    sectionAltBg:
      "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-panel))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBg:
      "color-mix(in srgb, var(--ds-surface-panel) 72%, var(--ds-surface-card))",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border:
      "color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-color-border))",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover:
      "color-mix(in srgb, var(--ds-color-primary) 28%, var(--ds-color-border))",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    selectedBorder:
      "color-mix(in srgb, var(--ds-color-primary) 46%, var(--ds-color-border))",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    selectedRing:
      "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)",
  },
  surface: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-radius-md
     */
    radiusMd: "var(--ds-radius-md)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadow:
      "0 1px 2px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent), 0 10px 24px color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shadowHover:
      "0 2px 5px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent), 0 14px 30px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    iconBg:
      "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    iconBorder:
      "color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-color-border))",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    chipBg:
      "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    cardSideAccentSoft:
      "color-mix(in srgb, var(--ds-color-primary) 7%, transparent)",
    // One authored elevation reaching the shadow scale and both picker
    // panels, which previously spelled it as three separate declarations.
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    popoverShadow:
      "0 12px 30px rgba(20, 40, 59, 0.1), 0 2px 8px rgba(20, 40, 59, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    cardGridSize: "22px",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    cardGridLine:
      "color-mix(in srgb, var(--ds-signal-card-accent, var(--ds-color-primary)) 5%, transparent)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    cardGridBg:
      "linear-gradient(var(--ds-surface-card-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ds-surface-card-grid-line) 1px, transparent 1px), linear-gradient(115deg, transparent 0%, color-mix(in srgb, var(--ds-surface-card) 34%, transparent) 46%, transparent 66%)",
    /**
     * @placeholder CHROME.surface.cardCoverOverlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.surface.gradientDark
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.surface.imageOverlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.surface.overlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.surface.pageShellSubtitleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.surface.watermarkColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  tooltip: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    zIndex: 2700,
    /**
     * @placeholder CHROME.tooltip.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.defaultBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.defaultColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.primaryBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.primaryColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.secondaryBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.secondaryColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.successBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tooltip.warningBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * Familia mixta. Controles: palette.seeds, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  metricCard: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border: "color-mix(in srgb, #3A6FB0 10%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover: "color-mix(in srgb, #3A6FB0 24%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    selectedBorder: "color-mix(in srgb, #3A6FB0 58%, #D4E0EA)",
    // Selected state rides the tint scale at tint-12 (design-language §2.5).
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-12
     */
    selectedRing: "0 0 0 3px var(--ds-tint-12)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadowHover:
      "0 2px 6px rgba(20, 40, 59, 0.08), 0 12px 28px rgba(20, 40, 59, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    sheen: "none",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    iconBg: "color-mix(in srgb, #3A6FB0 8%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    iconBorder: "color-mix(in srgb, #3A6FB0 24%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    labelColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    valueColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    trendColor: "#315F86",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    meterTrack: "color-mix(in srgb, #D4E0EA 48%, #F4F8FD)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    meterTrackBorder: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    // The Confidence Meter — the ONE sanctioned multi-hue gradient (S5).
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    meterFill: "linear-gradient(90deg, #315F86, #86A6C2)",
    // Status meter variants are solid tone colors (design-language §5).
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    meterFillSuccess: "#327CA8",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    meterFillWarning: "#D6A04E",
    /**
     * @domicile seed
     * @governor dial: token-overrides
     */
    meterFillError: "#C5504C",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    meterFillNeutral: "#8A9AAA",
  },
  signalCard: {
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    bg: "#ffffff",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    topLineDisplay: "none",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover: "color-mix(in srgb, #3A6FB0 18%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    iconBg: "color-mix(in srgb, #3A6FB0 8%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    iconBorder: "color-mix(in srgb, #3A6FB0 24%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bodyColor: "#53697E",
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-8
     */
    badgeBg: "var(--ds-tint-8)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    badgeBorder: "color-mix(in srgb, #3A6FB0 28%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    badgeColor: "#3A6FB0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    sectionBg: "#ffffff",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    sectionAltBg: "color-mix(in srgb, #3A6FB0 4%, #F4F8FD)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    meterTrack: "color-mix(in srgb, #D4E0EA 48%, #F4F8FD)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    meterTrackBorder: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    meterFill: "linear-gradient(90deg, #315F86, #86A6C2)",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  /**
   * @placeholder CHROME.tree
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no autora la familia tree (gobernaria chrome.families)
   */
  workspaceCard: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bgHover: "#FBFCFE",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover: "color-mix(in srgb, #3A6FB0 25%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: "0 1px 2px rgba(20, 40, 59, 0.045)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadowHover:
      "0 12px 28px -18px rgba(20, 40, 59, 0.28), 0 2px 6px rgba(20, 40, 59, 0.05)",
    /**
     * @domicile seed
     * @governor dial: shape.radius-scale
     */
    radius: "14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    padding: "16px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gap: "12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconBg: "color-mix(in srgb, #3A6FB0 8%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconBorder: "color-mix(in srgb, #3A6FB0 22%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconColor: "#3A6FB0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bodyColor: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    labelColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    valueColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBg: "#F8FBFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBorder: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerColor: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    hoverTransform: "translateY(-1px)",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  compactCard: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bgHover: "#F9FBFE",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover: "color-mix(in srgb, #3A6FB0 22%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: "0 1px 2px rgba(20, 40, 59, 0.04)",
    /**
     * @domicile seed
     * @governor dial: shape.radius-scale
     */
    radius: "10px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    padding: "10px 12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gap: "8px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bodyColor: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    labelColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    valueColor: "#14283B",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  tallCard: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "linear-gradient(145deg, #FFFFFF 0%, #F8FBFF 72%, #F6F2EA 100%)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover: "color-mix(in srgb, #3A6FB0 25%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow:
      "0 14px 34px -26px rgba(20, 40, 59, 0.32), 0 1px 2px rgba(20, 40, 59, 0.05)",
    /**
     * @domicile seed
     * @governor dial: shape.radius-scale
     */
    radius: "18px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    padding: "20px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gap: "16px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bodyColor: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    labelColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    valueColor: "#14283B",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  collectionCard: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    bgHover: "#F9FBFE",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    border: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderHover: "color-mix(in srgb, #3A6FB0 26%, #D4E0EA)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    selectedBorder: "#3A6FB0",
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-12
     */
    selectedRing: "0 0 0 3px var(--ds-tint-12)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: "0 1px 2px rgba(20, 40, 59, 0.05)",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadowHover:
      "0 12px 28px -18px rgba(20, 40, 59, 0.28), 0 2px 6px rgba(20, 40, 59, 0.05)",
    /**
     * @domicile seed
     * @governor dial: shape.radius-scale
     */
    radius: "12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    padding: "14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gap: "10px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bodyColor: "#53697E",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    labelColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    valueColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    statusBg: "#EDF5FA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    statusBorder: "#C5DCEB",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    statusColor: "#285F84",
  },
  listingGrid: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gap: "12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    minCardWidth: "260px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    minCompactWidth: "220px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    minTallWidth: "300px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    cardGap: "10px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    cardBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    cardBorder: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    cardShadow: "0 1px 2px rgba(20, 40, 59, 0.05)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-tint-12
     */
    selectedRing: "0 0 0 3px var(--ds-tint-12)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    emptyBg: "#FBFCFE",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    emptyBorder: "#D4E0EA",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    skeletonBg: "#EEF3F8",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  list: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    previewRailGap: "clamp(14px, 1.45vw, 22px)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    previewPanelBg:
      "linear-gradient( 180deg, color-mix(in srgb, var(--ds-surface-card) 96%, var(--ds-color-primary) 2%), color-mix(in srgb, var(--ds-surface-panel) 36%, var(--ds-surface-card)) )",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    previewPanelBorder:
      "color-mix( in srgb, var(--ds-color-primary) 14%, var(--ds-color-border) )",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    previewPanelShadow:
      "0 10px 24px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-surface-card) 76%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    previewMotionDuration: "180ms",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    previewMotionEase: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    shellSectionGap: "14px",
    /**
     * @placeholder CHROME.list.backgroundColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.borderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.itemBackgroundColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.itemBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.itemHoverBackgroundColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.metaDescriptionColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.secondaryTextColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.skeletonBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.splitColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.list.textColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  detail: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    railWidth: "clamp(280px, 22vw, 340px)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    heroBg:
      "linear-gradient( 180deg, color-mix( in srgb, var(--ds-control-surface) 98%, var(--ds-color-primary) 2% ), color-mix(in srgb, var(--ds-surface-panel) 54%, var(--ds-control-surface)) )",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    heroBorder:
      "color-mix( in srgb, var(--ds-color-text-primary) 9%, transparent )",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    heroShadow:
      "0 1px 2px color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent), 0 12px 28px color-mix(in srgb, var(--ds-color-primary) 5%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-surface-card) 76%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    sectionBg:
      "linear-gradient( 180deg, var(--ds-surface-card) 0%, color-mix(in srgb, var(--ds-surface-panel) 34%, var(--ds-surface-card)) 100% )",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    sectionBorder:
      "color-mix( in srgb, var(--ds-color-primary) 11%, var(--ds-color-border) )",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    sectionShadow:
      "0 1px 2px color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent), 0 8px 20px color-mix(in srgb, var(--ds-color-text-primary) 3%, transparent)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    heroSpine: "color-mix(in srgb, var(--ds-color-primary) 46%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    controlBg:
      "color-mix(in srgb, var(--ds-control-surface) 92%, var(--ds-surface-card-bg, var(--ds-color-bg-primary)))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    controlBorder:
      "color-mix(in srgb, var(--ds-color-text-primary) 10%, var(--ds-color-border-secondary))",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    controlBorderHover:
      "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border-secondary))",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    continuousBoundary:
      "color-mix(in srgb, var(--ds-color-text-primary) 7.5%, transparent)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    continuousSurface:
      "color-mix(in srgb, var(--ds-surface-card-bg, var(--ds-surface-card)) 94%, transparent)",
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
    color: "#14283B",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow:
      "0 28px 72px rgba(20, 40, 59, 0.18), 0 8px 24px rgba(20, 40, 59, 0.10)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overlayBg: "rgba(20, 40, 59, 0.30)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overlayBackdrop: "blur(8px)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBg: "color-mix(in srgb, #FFFFFF 88%, #F4F8FD)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorder: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    titleColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    subtitleColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bodyColor: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBorder: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    footerBg: "#F8FBFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    closeColor: "#728398",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    closeColorHover: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    closeBgHover: "#F4F8FD",
  },
  tabs: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    border: "#E3EAF0",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-secondary
     */
    color: "var(--ds-color-text-secondary)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    colorHover: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    colorActive: "#14283B",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bgHover: "#F4F8FD",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderActive: "#3A6FB0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listBg: "color-mix(in srgb, #F4F8FD 82%, #FFFFFF)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listBorder: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listRadius: "10px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listPadding: "3px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listShadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.88), 0 1px 2px rgba(20, 40, 59, 0.04)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listTexture:
      "radial-gradient(circle at 1px 1px, rgba(58, 111, 176, 0.18) 0.55px, transparent 0.75px)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listTextureOpacity: 0.14,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    listHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.84)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gap: "3px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemGap: "6px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemRadius: "8px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeight: 450,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeightActive: 650,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeShadow: "0 1px 2px rgba(20, 40, 59, 0.07)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeHighlight:
      "linear-gradient(118deg, transparent 12%, rgba(255, 255, 255, 0.72) 48%, transparent 76%)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    activeHighlightOpacity: 0.42,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    pressedTransform: "translateY(0) scale(0.985)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconPadding: "4px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconShadowActive:
      "inset 0 0 0 1px rgba(58, 111, 176, 0.16), 0 3px 8px rgba(58, 111, 176, 0.08)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeBgActive: "#EAF2FC",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeColorActive: "#285A94",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    badgeBorderActive: "#C8D9EB",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    indicatorHeight: "2px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelBorder: "#E3EAF0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelRadius: "12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelShadow:
      "0 1px 2px rgba(20, 40, 59, 0.04), 0 10px 26px rgba(20, 40, 59, 0.04)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelTexture:
      "linear-gradient(135deg, rgba(58, 111, 176, 0.035), transparent 42%)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    panelHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.92)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overflowControlBg: "#FFFFFF",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overflowControlBgHover: "#F4F8FD",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overflowControlShadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    overflowControlShadowHover: "0 5px 14px rgba(20, 40, 59, 0.10)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-motion-feedback
     */
    motionDuration: "var(--ds-motion-feedback, 140ms)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-motion-feedback
     */
    activeRevealDuration: "var(--ds-motion-feedback, 140ms)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-motion-reveal
     */
    panelMotionDuration: "var(--ds-motion-reveal, 180ms)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    smHeight: "30px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    smPadding: "0 10px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    smFontSize: "12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    smIconSize: "14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    mdHeight: "34px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    mdPadding: "0 12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    mdFontSize: "13px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    mdIconSize: "15px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    lgHeight: "38px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    lgPadding: "0 14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    lgFontSize: "14px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    lgIconSize: "16px",
    /**
     * @placeholder CHROME.tabs.badgeBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.iconBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.tabs.iconBgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
  },
  /**
   * @placeholder CHROME.anchor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.drawer
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.dropdown
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.menu
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.message
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.notification
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.popover
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.alert
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.avatar
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.backTop
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.calendar
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.collapse
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.descriptions
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.empty
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.floatButton
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.liveFeed
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.pagination
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.progress
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.result
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.skeleton
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.spinner
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.statistic
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.statsGrid
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.steps
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.tag
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.timeline
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.tree
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
};

// ── CAPABILITIES ──
/**
 * Estado y prosa de capability: declara disposicion, no pinta.
 */
const CAPABILITIES: BrandCapabilityCatalog = {
  // ACTIVE. See the note on rottay's disposition: the authored block is read
  // by `brandThemeToTokenOverrides` and `brandThemeToPersonality`, both of
  // which are on the shipped artifact path. BitHire additionally sets
  // `useSpring: false`, which is itself a live decision the compiler reads
  // to SUPPRESS spring lowering — a channel that can be switched off is by
  // definition a channel that is on.
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
  /**
   * @domicile pro-expert
   * @governor capability: expressive (estado autorado: active)
   */
  expressive: { status: 'active' },
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
    note: 'BitHire rides the baseline container ladder; no posture override.',
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
export const bithireBrandTheme: FirstPartyBrandTheme = {
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
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  expressive: EXPRESSIVE,

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
   * @placeholder CAPABILITIES.expressive.note
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CAPABILITIES.expressive.reason
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
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
};
