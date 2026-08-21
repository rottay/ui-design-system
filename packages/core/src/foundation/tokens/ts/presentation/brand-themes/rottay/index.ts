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

// ──────────────────────── AUTHORED DECISIONS ────────────────────────
// Every brand-specific value and every justified shipped pin of this vertical
// is authored below, in the roster order the skeleton consumes it. Nothing
// beneath END AUTHORED DECISIONS carries a value.

// ── IDENTITY ──
const THEME_ID = 'rottay' satisfies FirstPartyBrandTheme['id'];
const THEME_NAME = 'Rottay';
const DEFAULT_MODE = 'dark' satisfies BrandThemeMode;
const OVERLAY_MODE = 'light' satisfies BrandThemeMode;

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
        bg: "#FFFFFF",
        bgHover: "#FAFAF9",
        bgFocus: "#FFFFFF",
        bgDisabled: "#F4F4F3",
        color: "#1A1A1A",
        colorPlaceholder: "#9C9C9C",
        colorDisabled: "#A1A1AA",
        border: "#E5E5E3",
        borderHover: "#D4D4D2",
        borderFocus: "rgba(10, 10, 10, 0.40)",
        borderDisabled: "#E5E5E3",
        shadowFocus: "0 0 0 3px rgba(10, 10, 10, 0.08)",
        successShadowFocus: "0 0 0 2px rgba(22, 163, 74, 0.14)",
        warningShadowFocus: "0 0 0 2px rgba(217, 119, 6, 0.14)",
        errorBorder: "#DC2626",
        errorShadowFocus: "0 0 0 2px rgba(220, 38, 38, 0.14)",
        errorColor: "#DC2626",
        filled: {
          bg: "#F4F4F3",
          bgHover: "#EDEDEC",
          bgFocus: "#F4F4F3",
        },
        addon: {
          bg: "#F4F4F3",
          color: "#6B6B6B",
          border: "#E5E5E3",
        },
        clear: {
          color: "#9C9C9C",
        },
        helper: {
          color: "#9C9C9C",
        },
      },
      buttonPrimary: {
        bgHover: "#2A2A2A",
        bgActive: "#3D3D3D",
        color: "#FFFFFF",
        shadow: "0 1px 2px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06)",
        shadowHover: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      buttonSecondary: {
        bg: "#FFFFFF",
        bgHover: "#F4F4F3",
        bgActive: "#EDEDEC",
        color: "#1A1A1A",
        border: "#E5E5E3",
        borderHover: "#D4D4D2",
      },
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
        bg: 'transparent',
        bgHover: "rgba(0, 0, 0, 0.04)",
        bgActive: "rgba(0, 0, 0, 0.08)",
                  colorHover: '#1A1A1A',
        border: 'transparent',
        borderHover: 'transparent',
        borderActive: 'transparent',
},
      buttonText: {
        bg: 'transparent',
        bgHover: "rgba(0, 0, 0, 0.04)",
        bgActive: "rgba(0, 0, 0, 0.08)",
                  colorHover: '#1A1A1A',
},
      buttonLink: {
        color: "#1A1A1A",
        colorHover: "#6B6B6B",
        colorActive: "#0A0A0A",
      },
      buttonError: {
        bg: "#DC2626",
        bgHover: "#B91C1C",
        bgActive: "#991B1B",
      },
      buttonInfo: {
        bg: "#2563EB",
        bgHover: "#1D4ED8",
        bgActive: "#1E40AF",
      },
      disabled: {
        bg: "#F4F4F3",
        text: "#A1A1AA",
        border: "#E5E5E3",
        borderColor: "#E5E5E3",
      },
      segmented: {
        bg: "#F4F4F3",
        itemBg: "transparent",
        itemBgSelected: "#FFFFFF",
        itemColor: "#9C9C9C",
        itemColorSelected: "#1A1A1A",
        shadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      select: {
        bg: "#FFFFFF",
        color: "#1A1A1A",
        colorPlaceholder: "#9C9C9C",
        dropdownBg: "#FFFFFF",
        dropdownShadow:
          "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        optionBgHover: "#FAFAF9",
        optionBgSelected: "#F4F4F3",
        optionColorSelected: "#1A1A1A",
        // ROTTAY-T2 MASS: light divergence for the drained select channels.
        arrowColor: "#9C9C9C",
        bgDisabled: "#F4F4F3",
        border: "#E5E5E3",
        borderFocus: "rgba(10, 10, 10, 0.40)",
        borderHover: "#D4D4D2",
        clearColor: "#9C9C9C",
        colorDisabled: "#C4C4C2",
        dropdownBorder: "#E5E5E3",
        errorBorder: "#DC2626",
        filledBg: "#F4F4F3",
        optionColorDisabled: "#C4C4C2",
        shadowFocus: "0 0 0 2px rgba(10, 10, 10, 0.08)",
        tagBg: "#F4F4F3",
      },
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
      form: {
        helpColor: "#9C9C9C",
        extraColor: "#9C9C9C",
        successColor: "#16A34A",
        warningColor: "#D97706",
        errorColor: "#DC2626",
        requiredColor: "#DC2626",
      },
      autocomplete: {
        bg: "#FFFFFF",
        border: "#E5E5E3",
        borderFocus: "rgba(10, 10, 10, 0.40)",
        clearColor: "#9C9C9C",
        dropdownBg: "#FFFFFF",
        dropdownShadow:
          "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        emptyColor: "#9C9C9C",
        errorBorder: "#DC2626",
        optionBgHover: "#FAFAF9",
      },
      checkbox: {
        bg: "#FFFFFF",
        bgDisabled: "#F4F4F3",
        border: "#D4D4D2",
        borderHover: "#A3A3A1",
        checkedColor: "#FFFFFF",
        errorBorder: "#DC2626",
        errorColor: "#DC2626",
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        focusRingColor: "rgba(10, 10, 10, 0.08)",
        labelColor: "#1A1A1A",
        labelColorDisabled: "#C4C4C2",
      },
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
        bg: "#FFFFFF",
        bgDisabled: "#F4F4F3",
        border: "#D4D4D2",
        borderHover: "#A3A3A1",
        checkedBg: "#FFFFFF",
        descriptionColor: "#9C9C9C",
        errorBorder: "#DC2626",
        errorColor: "#DC2626",
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        focusRingColor: "rgba(10, 10, 10, 0.08)",
        labelColor: "#1A1A1A",
        labelColorDisabled: "#C4C4C2",
      },
      rate: {
        color: "#EDEDEC",
      },
      slider: {
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        handleBgDisabled: "#F4F4F3",
        handleBorder: "#0A0A0A",
        handleShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        markColor: "#9C9C9C",
        railColor: "#E5E5E3",
        trackColorDisabled: "#C4C4C2",
      },
      switch: {
        bg: "#D4D4D2",
        bgHover: "#C4C4C2",
        checkedBgHover: "#2A2A2A",
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        labelColor: "#1A1A1A",
        thumbBg: "#FFFFFF",
        thumbShadow: "0 1px 3px rgba(0, 0, 0, 0.10)",
      },
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
        descriptionColor: "#9C9C9C",
        dotBg: "#FFFFFF",
        dotShadow: "0 1px 2px rgba(0, 0, 0, 0.10)",
        errorBg: "#DC2626",
        errorColor: "#DC2626",
        focusRing: "0 0 0 2px rgba(10, 10, 10, 0.12)",
        innerLabelColor: "#FFFFFF",
        labelColor: "#1A1A1A",
        successBg: "#16A34A",
        trackBg: "#D4D4D2",
        warningBg: "#D97706",
      },
      transfer: {
        bg: "#FFFFFF",
        border: "#E5E5E3",
        headerBg: "#FAFAF9",
        headerBorder: "#E5E5E3",
        itemBgHover: "#FAFAF9",
      },
      upload: {
        bg: "#FFFFFF",
        border: "#E5E5E3",
        borderHover: "#D4D4D2",
        buttonBg: "#FFFFFF",
        buttonBorder: "#E5E5E3",
        cardBg: "#FAFAF9",
        cardBorder: "#E5E5E3",
        draggerBg: "#FAFAF9",
        draggerBgHover: "#F4F4F3",
        draggerBorder: "#E5E5E3",
        draggerIconColor: "#9C9C9C",
        errorBorder: "#DC2626",
        fileBg: "#FAFAF9",
        fileRemoveColor: "#DC2626",
        previewBackdrop: "rgba(0, 0, 0, 0.60)",
        previewOverlay: "rgba(0, 0, 0, 0.40)",
        progressTrack: "#EDEDEC",
      },
    },
    cardComponent: {
      bg: "#FFFFFF",
      bgHover: "#FAFAF9",
      color: "#1A1A1A",
      border: "#E5E5E3",
      borderHover: "#D4D4D2",
      borderAccentHover: "rgba(10, 10, 10, 0.16)",
      shadow: "0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
      shadowHover: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)",
      shadowElevated: "0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)",
      headerBorder: "#E5E5E3",
      headerColor: "#1A1A1A",
      titleColor: "#1A1A1A",
      imagePlaceholderBg: "#F4F4F3",
      imagePlaceholderColor: "#9C9C9C",
      imageLoadingTrack: '#EDEDEC',
      imageLoadingActive: '#0A0A0A',
      footerBorder: "#E5E5E3",
      footerBg: "#FAFAF9",
    },
    modal: {
      bg: "#FFFFFF",
      color: "#1A1A1A",
      shadow: "0 12px 32px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.06)",
      overlayBg: "rgba(0, 0, 0, 0.48)",
      headerBg: "#FAFAF9",
      headerBorder: "#E5E5E3",
      titleColor: "#1A1A1A",
      subtitleColor: "#6B6B6B",
      footerBorder: "#E5E5E3",
      footerBg: "#FAFAF9",
      closeColor: "#9C9C9C",
      closeColorHover: "#1A1A1A",
      closeBgHover: "rgba(0, 0, 0, 0.04)",
    },
    table: {
      bg: "#FFFFFF",
      border: "#E5E5E3",
      headerBg: "#FAFAF9",
      rowBg: "#FFFFFF",
      rowBgHover: "#FAFAF9",
      rowBgStriped: "#FAFAF9",
      rowBgSelected: "rgba(10, 10, 10, 0.04)",
      rowBorder: "#EDEDEC",
      loadingOverlayBg: "rgba(255, 255, 255, 0.7)",
      cellColor: "#1A1A1A",
    },
    tabs: {
      border: "#E5E5E3",
      color: "#9C9C9C",
      colorHover: "#1A1A1A",
      colorActive: "#1A1A1A",
      bgHover: "rgba(0, 0, 0, 0.02)",
    },
    breadcrumb: {
      color: "#9C9C9C",
      colorHover: "#1A1A1A",
      colorActive: "#1A1A1A",
      separatorColor: "#D4D4D2",
    },
    sidebar: {
      bg: "#F4F4F3",
      border: "#E5E5E3",
      text: "#1A1A1A",
      textMuted: "#9C9C9C",
      groupFontSize: "11px",
      groupColor: "#9C9C9C",
      groupLetterSpacing: "0.04em",
      groupMarginTop: "8px",
      groupMarginBottom: "4px",
      groupPaddingTop: "10px",
      itemFontSize: "13px",
      itemFontWeight: "400",
      itemFontWeightActive: "500",
      itemColor: "#6B6B6B",
      itemBgActive: "rgba(0, 0, 0, 0.06)",
      itemBgHover: "rgba(0, 0, 0, 0.03)",
      itemIndent: "6px",
      itemPadding: "6px 10px",
      iconSize: "16px",
      shellPaddingInline: "initial",
      shellPaddingCollapsed: "initial",
      itemHeight: "initial",
      itemChildHeight: "initial",
      itemFontSizeChild: "initial",
      itemPaddingInline: "initial",
      iconColumnSize: "initial",
      itemGap: "initial",
      childPaddingInline: "initial",
    },
    layout: {
      bg: "#FAFAF9",
      headerBg: "rgba(250, 250, 249, 0.82)",
      headerBorder: "#E5E5E3",
      siderBorder: "#E5E5E3",
      dividerColor: "#E5E5E3",
      dividerTextColor: "#1A1A1A",
    },
    shell: {
      gridLine: "rgba(0, 0, 0, 0.03)",
    },
    badge: {
      borderColor: "#E5E5E3",
      textColor: "#1A1A1A",
      defaultBg: "#F4F4F3",
      defaultColor: "#1A1A1A",
      primaryColor: "var(--ds-color-white, #ffffff)",
      secondaryBg: "#F4F4F3",
      errorBg: "#DC2626",
      infoBg: "#2563EB",
    },
    surface: {
      overlayBg: "var(--ds-overlay-scrim)",
      imageOverlayBg: "rgba(0, 0, 0, 0.60)",
      cardCoverOverlayBg:
        "linear-gradient( to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.6) 100% )",
      gradientDark: "linear-gradient(135deg, #FAFAF9 0%, #F4F4F3 50%, #EDEDEC 100%)",
      watermarkColor: "#EDEDEC",
      pageShellSubtitleColor: "var(--ds-color-text-secondary)",
    },
    list: {
      bg: "#ffffff",
      backgroundColor: "var(--ds-color-white, #ffffff)",
      borderColor: "var(--ds-color-neutral-200, #e5e7eb)",
      textColor: "#1A1A1A",
      secondaryTextColor: "var(--ds-color-neutral-500, #6b7280)",
      metaDescriptionColor: "var(--ds-color-neutral-500, #6b7280)",
      splitColor: "#EDEDEC",
      skeletonBg: "var(--ds-color-bg-tertiary)",
      itemBackgroundColor: "#FFFFFF",
      itemBgHover: "#FAFAF9",
      itemHoverBackgroundColor: "var(--ds-color-neutral-50, #f9fafb)",
    },
    popover: {
      bg: "#ffffff",
      border: "#E5E5E3",
      shadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
      titleColor: "#1A1A1A",
      titleBorder: "#E5E5E3",
    },
    tooltip: {
      bg: "#1A1A1A",
      color: "#FAFAF9",
      shadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
      defaultBg: "#1A1A1A",
      defaultColor: "#FAFAF9",
      primaryColor: "#ffffff",
      secondaryBg: "#ffffff",
      secondaryColor: "#1A1A1A",
      errorBg: "#DC2626",
    },
    search: {
      commandPalette: {
        backdrop: "rgba(0, 0, 0, 0.40)",
        bg: "var(--ds-color-bg-elevated)",
        border: "var(--ds-color-border)",
        itemHoverBg: "#FAFAF9",
        groupColor: "var(--ds-color-text-muted)",
        emptyColor: "var(--ds-color-text-muted)",
        shortcutBorder: "var(--ds-color-border)",
      },
    },
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
    anchor: {
      linkColor: "#9C9C9C",
      linkColorActive: "#1A1A1A",
    },
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
      color: "#FFFFFF",
      shadow: "0 4px 12px rgba(0, 0, 0, 0.10)",
    },
    calendar: {
      bg: "#FFFFFF",
      border: "#E5E5E3",
      dayColorOther: "#C4C4C2",
      headerColor: "#1A1A1A",
    },
    collapse: {
      bg: "#FFFFFF",
      border: "#E5E5E3",
      contentBg: "#FAFAF9",
      headerBg: "#FFFFFF",
      headerBgHover: "#FAFAF9",
      headerColor: "#1A1A1A",
    },
    descriptions: {
      bg: "#FAFAF9",
      border: "#E5E5E3",
      contentColor: "#1A1A1A",
      labelColor: "#9C9C9C",
    },
    drawer: {
      bg: "#FFFFFF",
      footerBorder: "#E5E5E3",
      headerBorder: "#E5E5E3",
      shadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
      titleColor: "#1A1A1A",
    },
    dropdown: {
      bg: "#FFFFFF",
      itemBgActive: "#F4F4F3",
      itemBgHover: "#FAFAF9",
      itemColorActive: "#1A1A1A",
      itemColorHover: "#1A1A1A",
      shadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
    },
    empty: {
      descriptionColor: "#9C9C9C",
      iconColor: "#D4D4D2",
    },
    floatButton: {
      badgeBg: "#DC2626",
      defaultBg: "#FFFFFF",
      primaryColor: "#FFFFFF",
    },
    liveFeed: {
      badgeColor: "#FFFFFF",
      bg: "#FFFFFF",
      border: "#E5E5E3",
      emptyColor: "#9C9C9C",
      loadMoreColor: "#1A1A1A",
      newBg: "rgba(37, 99, 235, 0.06)",
      newBorder: "rgba(37, 99, 235, 0.20)",
      newColor: "#2563EB",
      skeletonBg: "#EDEDEC",
    },
    menu: {
      bg: "#FAFAF9",
      darkBg: "#0A0A0A",
      darkItemColor: "#A3A3A1",
      dividerColor: "#E5E5E3",
      groupTitleColor: "#9C9C9C",
      itemBgActive: "rgba(0, 0, 0, 0.06)",
      itemBgHover: "rgba(0, 0, 0, 0.03)",
      itemColorActive: "#1A1A1A",
      itemColorHover: "#1A1A1A",
      itemDangerColor: "#DC2626",
      itemHoverBg: "rgba(0, 0, 0, 0.03)",
      itemSelectedBg: "rgba(0, 0, 0, 0.06)",
      itemSelectedColor: "#1A1A1A",
      submenuBg: "#FFFFFF",
    },
    message: {
      bg: "#FFFFFF",
      closeColor: "#9C9C9C",
      closeColorHover: "#1A1A1A",
      shadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
    },
    notification: {
      bg: "#FFFFFF",
      shadow: "0 4px 24px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04)",
      titleColor: "#1A1A1A",
    },
    pagination: {
      activeColor: "#FFFFFF",
      itemBgHover: "#FAFAF9",
      itemColorActive: "#FFFFFF",
      itemColorHover: "#1A1A1A",
    },
    progress: {
      bg: "#EDEDEC",
      fillError: "#DC2626",
      fillSuccess: "#16A34A",
      fillWarning: "#D97706",
    },
    result: {
      iconColor: "#FFFFFF",
      subtitleColor: "#6B6B6B",
      titleColor: "#1A1A1A",
    },
    skeleton: {
      bg: "#EDEDEC",
      highlight: "#F4F4F3",
      waveGradient: "linear-gradient(90deg, #EDEDEC 25%, #F4F4F3 50%, #EDEDEC 75%)",
    },
    spinner: {
      track: "#EDEDEC",
    },
    statistic: {
      valueColor: "#1A1A1A",
    },
    statsGrid: {
      cardBg: "#FFFFFF",
      cardBorder: "#E5E5E3",
      cardFilledBg: "#FAFAF9",
      cardGlassBg: "rgba(255, 255, 255, 0.70)",
      cardGlassBorder: "#E5E5E3",
      descriptionColor: "#9C9C9C",
      skeletonBg: "#EDEDEC",
      skeletonWaveGradient: "linear-gradient( 90deg, rgba(0, 0, 0, 0.03) 25%, rgba(0, 0, 0, 0.06) 37%, rgba(0, 0, 0, 0.03) 63% )",
      trendNegative: "#DC2626",
      trendNeutral: "#9C9C9C",
      trendPositive: "#16A34A",
      valueColor: "#1A1A1A",
    },
    steps: {
      connectorColor: "#E5E5E3",
      finishBg: "#16A34A",
      finishBorder: "#16A34A",
      itemBg: "#EDEDEC",
      itemColor: "#9C9C9C",
      itemColorActive: "#FFFFFF",
      waitBorder: "#D4D4D2",
    },
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
    timeline: {
      dotBorder: "#FFFFFF",
      lineColor: "#E5E5E3",
    },
    tree: {
      nodeBgHover: "#FAFAF9",
      nodeBgSelected: "#F4F4F3",
      nodeColorSelected: "#1A1A1A",
    },
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
  fontFamilyBase:
    "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  fontFamilyHeading:
    "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  fontFamilyMono:
    "var(--ds-font-pack-plex-mono, 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace)",
  fontFamilyDisplay:
    "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  headingWeightBias: 'normal',
  headingLetterSpacing: '-0.025em',
  labelStyle: 'sentence',
  letterSpacing: {
    display: '-0.025em',
    heading: '-0.015em',
    body: '0',
    mono: '0',
  },
  lineHeight: {
    display: 1.1,
    heading: 1.2,
    body: 1.6,
    tight: 1.25,
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
  mountDuration: 800,
  lineStyle: 'smooth',
  showDots: false,
  useGradientFill: true,
  tooltipStyle: 'minimal',
};

// ── CHROME ──
const CHROME: BrandChrome = {
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  badge: {
    radius: 'var(--ds-radius-sm)',
    gap: 'var(--ds-spacing-1)',
    fontWeight: 'var(--ds-font-weight-medium)',
    lineHeight: 'var(--ds-line-height-none)',
    borderColor: '#2A2A2F',
    textColor: '#ECECEC',
    defaultBg: '#2A2A2F',
    defaultColor: '#ECECEC',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    primaryBg: 'var(--ds-color-primary)',
    primaryColor: '#0C0C0E',
    secondaryBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    secondaryColor: 'var(--ds-color-text-page)',
    successBg: '#16A34A',
    warningBg: '#D97706',
    errorBg: '#EF4444',
    infoBg: '#3B82F6',
  },

  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  card: {
    defaultElevation: 'md',
    hoverElevation: 'lift-two',
    showBorder: false,
    hoverTint: true,
    paddingDensity: 'normal',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  accent: {
    barPosition: 'top',
    barThickness: 2,
    barStyle: 'gradient',
    iconContainerShape: 'rounded',
    badgeShape: 'rounded',
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
    bg: '#0D0D10',
    border: '#18181C',
    text: '#ECECEC',
    textMuted: '#6B6B72',
    width: '296px',
    collapsedWidth: '96px',
    headerHeight: '104px',
    groupFontSize: '10.9px',
    groupFontWeight: 600,
    groupColor: '#6B6B72',
    groupLetterSpacing: '0.085em',
    groupMarginTop: '1px',
    groupMarginBottom: '1px',
    groupPaddingTop: '3px',
    itemFontSize: '16.35px',
    itemIndent: '8px',
    itemFontWeight: 450,
    itemFontWeightActive: 600,
    itemColor: '#A0A0A5',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    itemColorActive: 'var(--ds-color-primary)',
    itemBgActive: 'rgba(255, 255, 255, 0.07)',
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    itemPadding: '0 13px',
    iconSize: '17.25px',
    footerBg: 'var(--ds-sidebar-bg)',
    shellPaddingInline: '10px',
    shellPaddingCollapsed: '8px',
    itemHeight: '62px',
    itemChildHeight: '45px',
    itemFontSizeChild: '14.2px',
    itemPaddingInline: '13px',
    iconColumnSize: '20px',
    itemGap: '9px',
    childPaddingInline: '6px',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  layout: {
    bg: '#0C0C0E',
    headerBg: 'rgba(12, 12, 14, 0.82)',
    headerBackdrop: 'blur(12px)',
    headerBorder: 'rgba(255, 255, 255, 0.05)',
    siderBg: 'var(--ds-sidebar-bg)',
    siderBorder: '#18181C',
    dividerColor: '#2A2A2F',
    dividerTextColor: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  shell: {
    gridSize: '28px',
    gridLine: 'rgba(255, 255, 255, 0.03)',
    gridOpacity: 0.9,
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  breadcrumb: {
    color: '#6B6B72',
    colorHover: '#ECECEC',
    colorActive: '#ECECEC',
    separatorColor: '#4A4A4F',
  },

  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  list: {
    bg: '#18181B',
    backgroundColor: '#18181B',
    borderColor: '#2A2A2F',
    textColor: '#ECECEC',
    secondaryTextColor: '#A0A0A5',
    metaDescriptionColor: '#A0A0A5',
    splitColor: '#222226',
    skeletonBg: '#2A2A2F',
    itemBackgroundColor: '#18181B',
    itemBgHover: '#222226',
    itemHoverBackgroundColor: '#222226',
  },

  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 1 de 6 canales de la familia (5 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  popover: {
    bg: '#1A1A1E',
    border: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    contentColor: 'var(--ds-color-text-page)',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
    titleBorder: '#2A2A2F',
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
    bg: '#ECECEC',
    color: '#0C0C0E',
    defaultBg: '#ECECEC',
    defaultColor: '#0C0C0E',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    primaryBg: 'var(--ds-color-primary)',
    primaryColor: '#0C0C0E',
    secondaryBg: '#2A2A2F',
    secondaryColor: '#ECECEC',
    successBg: '#16A34A',
    warningBg: '#D97706',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40)',
  },

  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  search: {
    commandPalette: {
      backdrop: 'rgba(0, 0, 0, 0.60)',
      bg: '#1A1A1E',
      border: '#2A2A2F',
      itemHoverBg: 'rgba(255, 255, 255, 0.04)',
      groupColor: '#6B6B72',
      emptyColor: '#6B6B72',
      shortcutBorder: '#2A2A2F',
    },
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
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 6 de 19 canales de la familia (13 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  surface: {
    overlayBg: 'rgba(0, 0, 0, 0.64)',
    imageOverlayBg: 'rgba(0, 0, 0, 0.70)',
    cardCoverOverlayBg:
      'linear-gradient( to bottom, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.8) 100% )',
    gradientDark: 'linear-gradient(135deg, #0C0C0E 0%, #131316 50%, #1A1A1E 100%)',
    watermarkColor: '#222226',
    pageShellSubtitleColor: '#A0A0A5',
    radiusMd: 'var(--ds-radius-md)',
    shadow: 'var(--ds-shadow-sm)',
    shadowHover: 'var(--ds-shadow-md)',
    iconBg:
      'linear-gradient(145deg, color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card-bg)), color-mix(in srgb, var(--ds-color-secondary) 10%, var(--ds-surface-card-bg)))',
    iconBorder:
      'color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-surface-card-border))',
    chipBg: 'color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card-bg))',
    cardSideAccentSoft: 'transparent',
    cardGridSize: 'var(--ds-premium-card-grid-size, 22px)',
    cardGridLine:
      'color-mix(in srgb, var(--ds-signal-card-accent, var(--ds-color-primary)) 5%, transparent)',
    cardGridBg:
      'linear-gradient(var(--ds-surface-card-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ds-surface-card-grid-line) 1px, transparent 1px)',
    popoverShadow: 'var(--ds-shadow-md)',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 5 de 10 canales de la familia (5 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  premiumCard: {
    bg: 'var(--ds-material-card-background, var(--ds-card-bg))',
    sheen:
      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--ds-card-bg) 42%, transparent), transparent)',
    headerBg: 'var(--ds-rich-card-header-bg)',
    sectionBg: 'var(--ds-rich-card-section-bg)',
    sectionAltBg: 'var(--ds-rich-card-section-alt-bg)',
    footerBg: 'color-mix(in srgb, var(--ds-color-bg-secondary) 72%, var(--ds-card-bg))',
    border:
      'var(--ds-material-card-border, color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-card-border-color)))',
    borderHover:
      'var(--ds-material-card-border-hover, color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-material-card-border-strong, var(--ds-card-border-color))))',
    selectedBorder:
      'var(--ds-material-card-border-selected, color-mix(in srgb, var(--ds-color-primary) 46%, var(--ds-material-card-border-strong, var(--ds-card-border-color))))',
    selectedRing:
      'var(--ds-material-card-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 12%, transparent))',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — typography.scale alcanza 1 de 18 canales de la familia (17 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  table: {
    bg: '#0C0C0E',
    border: '#2A2A2F',
    headerBg: '#131316',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    headerColor: 'var(--ds-color-text-page)',
    headerFontWeight: 600,
    headerFontSize: '0.6875rem',
    rowBg: '#0C0C0E',
    rowBgHover: 'rgba(255, 255, 255, 0.025)',
    rowBgStriped: '#131316',
    rowBgSelected: 'rgba(255, 255, 255, 0.05)',
    rowBorder: '#222226',
    cellPadding: '0.875rem 1rem',
    cellFontSize: '0.875rem',
    cellColor: '#ECECEC',
    loadingOverlayBg: 'rgba(12, 12, 14, 0.7)',
    headerBlockSize: 'calc(var(--ds-input-md-height) - 0.25rem)',
    headerLetterSpacing: 'calc(var(--ds-text-eyebrow-letter-spacing, 0.08em) * 0.75)',
    sheen: 'none',
  },
  /**
   * Familia mixta. Controles: typography.scale, palette.seeds.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  cardComponent: {
    paddingSm: 'var(--ds-spacing-3)',
    paddingMd: 'var(--ds-spacing-4)',
    paddingLg: 'var(--ds-spacing-5)',
    paddingXl: 'var(--ds-spacing-6)',
    headerPadding: 'var(--ds-spacing-4) var(--ds-spacing-4) var(--ds-spacing-3)',
    bodyPadding: 'var(--ds-spacing-4)',
    footerPadding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
    titleFontSize: 'var(--ds-font-size-sm)',
    titleFontWeight: 'var(--ds-font-weight-medium)',
    bg: '#18181B',
    bgHover: '#1A1A1E',
    color: '#ECECEC',
    border: '#2A2A2F',
    borderHover: '#3A3A40',
    borderAccentHover: 'rgba(255, 255, 255, 0.14)',
    shadow: 'var(--ds-elevation-1)',
    shadowHover: 'var(--ds-elevation-2)',
    shadowElevated: 'var(--ds-elevation-3)',
    headerBorder: '#2A2A2F',
    headerColor: '#ECECEC',
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
    footerBorder: '#2A2A2F',
    footerBg: '#101012',
        imagePlaceholderBg: '#1A1A1E',
    imagePlaceholderColor: '#6B6B72',
    imageLoadingTrack: '#222226',
    imageLoadingActive: '#ECECEC',
},
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 1 de 15 canales de la familia (14 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  modal: {
    bg: '#1A1A1E',
    color: '#ECECEC',
    shadow: '0 24px 64px rgba(0, 0, 0, 0.40)',
    overlayBg: 'rgba(0, 0, 0, 0.64)',
    overlayBackdrop: 'blur(10px)',
    headerBg: '#222226',
    headerBorder: '#2A2A2F',
    titleColor: '#ECECEC',
    subtitleColor: '#6B6B72',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    bodyColor: 'var(--ds-color-text-page)',
    footerBorder: '#2A2A2F',
    footerBg: '#1A1A1E',
    closeColor: '#6B6B72',
    closeColorHover: '#ECECEC',
    closeBgHover: 'rgba(255, 255, 255, 0.05)',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 1 de 38 canales de la familia (37 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  tabs: {
    border: '#2A2A2F',
    color: '#6B6B72',
    colorHover: '#ECECEC',
    colorActive: '#ECECEC',
    bgHover: 'rgba(255, 255, 255, 0.03)',
    borderActive: 'var(--ds-color-primary)',
    listBg: '#141416',
    listBorder: '#2A2A2F',
    listRadius: '8px',
    listPadding: '3px',
    listShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.035)',
    listTexture:
      'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.14) 0.5px, transparent 0.75px)',
    listTextureOpacity: 0.12,
    listHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.035)',
    itemRadius: '6px',
    itemFontWeight: 450,
    itemFontWeightActive: 620,
    activeBg: '#222226',
    activeShadow:
      'inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 1px 3px rgba(0, 0, 0, 0.34)',
    activeHighlight:
      'linear-gradient(118deg, transparent 12%, rgba(255, 255, 255, 0.06) 48%, transparent 76%)',
    activeHighlightOpacity: 0.46,
    pressedTransform: 'translateY(0) scale(0.985)',
    iconBg: 'rgba(255, 255, 255, 0.025)',
    iconBgActive: 'rgba(255, 255, 255, 0.055)',
    iconPadding: '4px',
    badgeBg: 'rgba(255, 255, 255, 0.035)',
    badgeBgActive: 'rgba(255, 255, 255, 0.08)',
    badgeColorActive: '#ECECEC',
    badgeBorderActive: '#3A3A40',
    panelBg: '#1A1A1E',
    panelBorder: '#2A2A2F',
    panelRadius: '10px',
    panelShadow: '0 14px 36px rgba(0, 0, 0, 0.18)',
    panelTexture:
      'linear-gradient(135deg, rgba(255, 255, 255, 0.025), transparent 42%)',
    overflowControlBg: '#1A1A1E',
    overflowControlBgHover: '#222226',
    overflowControlShadow: '0 2px 8px rgba(0, 0, 0, 0.22)',
    overflowControlShadowHover: '0 6px 16px rgba(0, 0, 0, 0.30)',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  alert: {
    errorBg: 'rgba(239, 68, 68, 0.10)',
    errorBorder: 'rgba(239, 68, 68, 0.22)',
    errorColor: '#FCA5A5',
    errorIcon: '#EF4444',
    infoBg: 'rgba(59, 130, 246, 0.10)',
    infoBorder: 'rgba(59, 130, 246, 0.22)',
    infoColor: '#93C5FD',
    infoIcon: '#3B82F6',
    successBg: 'rgba(34, 197, 94, 0.10)',
    successBorder: 'rgba(34, 197, 94, 0.22)',
    successColor: '#6EE7B7',
    successIcon: '#22C55E',
    warningBg: 'rgba(245, 158, 11, 0.10)',
    warningBorder: 'rgba(245, 158, 11, 0.22)',
    warningColor: '#FCD34D',
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
    linkColor: '#6B6B72',
    linkColorActive: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  avatar: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    defaultBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    defaultColor: 'var(--ds-color-text-page)',
    errorBg: 'rgba(239, 68, 68, 0.14)',
    errorColor: '#EF4444',
    gradientBg: 'linear-gradient(135deg, #ECECEC 0%, #6B6B72 100%)',
    gradientColor: '#0C0C0E',
    groupBorder: '#18181B',
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
    primaryColor: '#0C0C0E',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    ringColor: 'var(--ds-color-primary)',
    secondaryBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    secondaryColor: 'var(--ds-color-text-page)',
    statusBorder: '#18181B',
    successBg: 'rgba(34, 197, 94, 0.14)',
    successColor: '#22C55E',
    warningBg: 'rgba(245, 158, 11, 0.14)',
    warningColor: '#F59E0B',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 1 de 3 canales de la familia (2 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  backTop: {
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    bg: 'var(--ds-color-primary)',
    color: '#0C0C0E',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.30)',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  calendar: {
    bg: '#1A1A1E',
    border: '#2A2A2F',
    dayColorOther: '#4A4A4F',
    headerColor: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  collapse: {
    bg: '#131316',
    border: '#2A2A2F',
    contentBg: '#1A1A1E',
    headerBg: '#131316',
    headerBgHover: '#1A1A1E',
    headerColor: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  descriptions: {
    bg: '#131316',
    border: '#2A2A2F',
    contentColor: '#ECECEC',
    labelColor: '#6B6B72',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 1 de 6 canales de la familia (5 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  drawer: {
    bg: '#1A1A1E',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    bodyColor: 'var(--ds-color-text-page)',
    footerBorder: '#2A2A2F',
    headerBorder: '#2A2A2F',
    shadow: '0 16px 48px rgba(0, 0, 0, 0.50)',
    titleColor: '#ECECEC',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 1 de 7 canales de la familia (6 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  dropdown: {
    bg: '#1A1A1E',
    itemBgActive: '#2A2A2F',
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    itemColor: 'var(--ds-color-text-page)',
    itemColorActive: '#ECECEC',
    itemColorHover: '#ECECEC',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  empty: {
    descriptionColor: '#6B6B72',
    iconColor: '#4A4A4F',
  },
  /**
   * Familia mixta. Controles: token-overrides, palette.seeds.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  floatButton: {
    badgeBg: '#EF4444',
    badgeColor: '#ffffff',
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
    primaryBg: 'var(--ds-color-primary)',
    primaryColor: '#0C0C0E',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 2 de 11 canales de la familia (9 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  liveFeed: {
    badgeBg: 'var(--ds-color-primary)',
    badgeColor: '#0C0C0E',
    bg: '#18181B',
    border: '#2A2A2F',
    emptyColor: '#6B6B72',
    loadMoreColor: '#ECECEC',
    newBg: 'rgba(59, 130, 246, 0.10)',
    newBorder: 'rgba(59, 130, 246, 0.22)',
    newColor: '#3B82F6',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    refreshColor: 'var(--ds-color-text-page)',
    skeletonBg: '#2A2A2F',
  },
  /**
   * Familia mixta. Controles: palette.seeds, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  menu: {
    bg: '#0C0C0E',
    darkBg: '#0C0C0E',
    darkItemColor: '#A0A0A5',
    dividerColor: '#2A2A2F',
    focusRingColor: 'var(--ds-color-primary)',
    groupTitleColor: '#6B6B72',
    itemBgActive: '#2A2A2F',
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    itemColor: 'var(--ds-color-text-page)',
    itemColorActive: '#ECECEC',
    itemColorHover: '#ECECEC',
    itemDangerColor: '#EF4444',
    itemHoverBg: 'rgba(255, 255, 255, 0.04)',
    itemSelectedBg: '#2A2A2F',
    itemSelectedColor: '#ECECEC',
    submenuBg: '#131316',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  message: {
    bg: '#1A1A1E',
    closeColor: '#6B6B72',
    closeColorHover: '#ECECEC',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 1 de 3 canales de la familia (2 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  notification: {
    bg: '#1A1A1E',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.50), 0 0 0 1px #2A2A2F',
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
    activeColor: '#0C0C0E',
    itemBg: 'transparent',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    itemBgActive: 'var(--ds-color-primary)',
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    itemBorder: 'transparent',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    itemColor: 'var(--ds-color-text-page)',
    itemColorActive: '#0C0C0E',
    itemColorHover: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  progress: {
    bg: '#2A2A2F',
    fillError: '#EF4444',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    fillPrimary: 'var(--ds-color-primary)',
    fillSuccess: '#22C55E',
    fillWarning: '#F59E0B',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  result: {
    iconColor: '#0C0C0E',
    subtitleColor: '#6B6B72',
    titleColor: '#ECECEC',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 2 de 3 canales de la familia (1 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  skeleton: {
    bg: '#1A1A1E',
    highlight: '#2A2A2F',
    waveGradient: 'linear-gradient(90deg, #1A1A1E 25%, #2A2A2F 50%, #1A1A1E 75%)',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 1 de 2 canales de la familia (1 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  spinner: {
    color: 'var(--ds-color-primary)',
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
    valueColor: '#ECECEC',
  },
  /**
   * Un solo control (token-overrides), pero ese control no figura como dial
   * de rottay en el roster: el tag queda pendiente de adjudicacion del DT.
   */
  statsGrid: {
    cardBg: '#18181B',
    cardBorder: '#2A2A2F',
    cardFilledBg: '#1A1A1E',
    cardGlassBg: 'rgba(255, 255, 255, 0.04)',
    cardGlassBorder: '#2A2A2F',
    descriptionColor: '#6B6B72',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    labelColor: 'var(--ds-color-text-page)',
    skeletonBg: '#2A2A2F',
    skeletonWaveGradient: 'linear-gradient( 90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 37%, rgba(255, 255, 255, 0.04) 63% )',
    trendNegative: '#EF4444',
    trendNeutral: '#6B6B72',
    trendPositive: '#22C55E',
    valueColor: '#ECECEC',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  steps: {
    connectorColor: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    connectorColorActive: 'var(--ds-color-primary)',
    finishBg: '#22C55E',
    finishBorder: '#22C55E',
    itemBg: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary (semilla de marca, K1)
     */
    itemBgActive: 'var(--ds-color-primary)',
    itemColor: '#6B6B72',
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
    waitBg: 'transparent',
    waitBorder: 'rgba(255, 255, 255, 0.14)',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  tag: {
    border: '#2A2A2F',
    defaultBg: '#222226',
    defaultBorder: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    defaultColor: 'var(--ds-color-text-page)',
    errorBg: 'rgba(239, 68, 68, 0.12)',
    errorBorder: 'rgba(239, 68, 68, 0.22)',
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
    primaryColor: '#0C0C0E',
    secondaryBg: '#222226',
    secondaryBorder: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    secondaryColor: 'var(--ds-color-text-page)',
    successBg: 'rgba(34, 197, 94, 0.12)',
    successBorder: 'rgba(34, 197, 94, 0.22)',
    successColor: '#34D399',
    warningBg: 'rgba(245, 158, 11, 0.12)',
    warningBorder: 'rgba(245, 158, 11, 0.22)',
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
    dotBorder: '#18181B',
    lineColor: '#2A2A2F',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  tree: {
    nodeBgHover: 'rgba(255, 255, 255, 0.04)',
    nodeBgSelected: '#2A2A2F',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-text-page (raiz de tinta de pagina, K3)
     */
    nodeColor: 'var(--ds-color-text-page)',
    nodeColorSelected: '#ECECEC',
  },
  /**
   * @placeholder CHROME.workspaceCard
   * @domicile unassigned
   * @governor none — gap aceptado: rottay no autora la familia workspaceCard (gobernaria chrome.families)
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
  motion: { status: 'active' },
  recipes: { status: 'active' },
  // Sighted selection pending. Rottay is the neutral baseline, so an
  // expressive profile is a real decision rather than a default, and no
  // governed id has been sighted against this canvas yet.
  expressive: {
    status: 'unassigned',
    reason: 'pending-selection',
    note: 'No expressive profile sighted against the Rottay dark canvas yet.',
  },
  responsive: {
    status: 'disabled',
    reason: 'not-authored',
    note: 'Rottay rides the baseline container ladder; no posture override.',
  },
  engineBridge: {
    status: 'disabled',
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
  modes: { [OVERLAY_MODE]: OVERLAY },

  // recipes — governed recipe-profile selection (DS-S001).
  recipes: RECIPES,

  // expressive — governed expressive-profile selection (C1b).
  /**
   * @placeholder THEME.expressive
   * @domicile unassigned
   * @governor none — gap aceptado: capability expressive no autorada en rottay (capabilities.expressive dice por que)
   */

  // palette — ramps and semantic colour channels.
  palette: PALETTE,

  // typography — shipped font packs and heading/label strategy.
  typography: TYPOGRAPHY,

  // surfaces — radius, elevation, glass/gradient/overlay posture.
  surfaces: SURFACES,

  // motion — compatibility choreography dial, governed as a capability.
  motion: MOTION,

  // charts — chart personality posture.
  charts: CHARTS,

  // chrome — per-component chrome channels.
  chrome: CHROME,

  // capabilities — explicit disposition for every optional family.
  capabilities: CAPABILITIES,
};
