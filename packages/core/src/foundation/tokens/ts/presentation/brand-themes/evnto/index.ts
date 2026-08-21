/**
 * Evnto first-party vertical theme.
 *
 * Event marquee experience. White-first, high-contrast, rounded, fluid,
 * safe, modern. Expressive entrances without routine bounce.
 *
 * Design: Minimal light-first. Black primary on white canvas.
 * Warm beige/sand accents. Largest border radius of all brands.
 *
 * This file is the canonical authored source. foundation/tokens/css/facade/artifacts/evnto/index.css
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
  BrandPalette,
  BrandSurfaces,
  BrandThemeMode,
  BrandThemeModeOverlay,
  BrandTypography,
  FirstPartyBrandTheme,
} from '../../../../../contracts/composition/tenants/themes';
import {
  EVNTO_CANONICAL_MOTION,
  EVNTO_CANONICAL_SURFACES,
} from '@/foundation/presets/policy/experience-baselines/evnto';

// ──────────────────────── AUTHORED DECISIONS ────────────────────────
// Every brand-specific value and every justified shipped pin of this vertical
// is authored below, in the roster order the skeleton consumes it. Nothing
// beneath END AUTHORED DECISIONS carries a value.

// ── IDENTITY ──
const THEME_ID = 'evnto' satisfies FirstPartyBrandTheme['id'];
const THEME_NAME = 'Evnto';
const DEFAULT_MODE = 'light' satisfies BrandThemeMode;
const OVERLAY_MODE = 'dark' satisfies BrandThemeMode;

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
  palette: {
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    primaryColor: "#E8E8E0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    onPrimaryColor: "#131210",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryForegroundColor: "#131210",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    primaryHoverColor: "#F0F0E8",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryColor: "#A89880",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    secondaryHoverColor: "#B8A890",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    accentColor: "#A89880",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-secondary-hover
     */
    accentHoverColor: "var(--ds-color-secondary-hover)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundColor: "#131210",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundSecondaryColor: "#1C1A16",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundTertiaryColor: "#24221C",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundElevatedColor: "#2A2820",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    backgroundOverlayColor: "rgba(2, 6, 23, 0.88)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textPrimaryColor: "#E8E8E0",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textSecondaryColor: "#A8A898",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-neutral-600
     */
    textTertiaryColor: "var(--ds-color-neutral-600)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textMutedColor: "#686858",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textDisabledColor: "#484838",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderColor: "#2E2C24",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    borderSecondaryColor: "#222018",
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    borderFocusColor: "#A89880",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    linkColor: "var(--ds-color-primary)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary-hover
     */
    linkHoverColor: "var(--ds-color-primary-hover)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-neutral-600
     */
    linkVisitedColor: "var(--ds-color-neutral-600)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-success-50
     */
    successBgColor: "var(--ds-color-success-50)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-warning-50
     */
    warningBgColor: "var(--ds-color-warning-50)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-error-50
     */
    errorBgColor: "var(--ds-color-error-50)",
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-info-50
     */
    infoBgColor: "var(--ds-color-info-50)",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    ramps: {
      primary: {
        50: "#FCFCFC",
        100: "#DDDDDD",
        200: "#BFBFBF",
        300: "#A2A2A2",
        400: "#868686",
        500: "#6B6B6B",
        600: "#515151",
        700: "#393939",
        800: "#222222",
        900: "#0D0D0D",
      },
      secondary: {
        50: "#FFFBF7",
        100: "#E6DBD0",
        200: "#CBBDAF",
        300: "#AF9F90",
        400: "#948373",
        500: "#786858",
        600: "#5D4F41",
        700: "#42372B",
        800: "#292018",
        900: "#110C08",
      },
      accent: {
        50: "#FFFBF7",
        100: "#E6DBD0",
        200: "#CBBDAF",
        300: "#AF9F90",
        400: "#948373",
        500: "#786858",
        600: "#5D4F41",
        700: "#42372B",
        800: "#292018",
        900: "#110C08",
      },
      neutral: {
        50: "#0b1220",
        100: "#111827",
        200: "#1f2937",
        300: "#334155",
        400: "#475569",
        500: "#64748b",
        600: "#94a3b8",
        700: "#cbd5e1",
        800: "#e2e8f0",
        900: "#f8fafc",
      },
      success: {
        50: "#F5FFF6",
        100: "#B6EDC1",
        200: "#8AD49A",
        300: "#62B977",
        400: "#3D9D59",
        500: "#18803E",
        600: "#00632B",
        700: "#00461C",
        800: "#002B0E",
      },
      warning: {
        50: "#FFFBF7",
        100: "#FFD5AA",
        200: "#EAB37B",
        300: "#D29451",
        400: "#B6762A",
        500: "#985B00",
        600: "#754500",
        700: "#533000",
        800: "#341C00",
      },
      error: {
        50: "#FFFBFA",
        100: "#FFD1CA",
        200: "#FFA398",
        300: "#FE6F62",
        400: "#E24B41",
        500: "#C12825",
        600: "#9C030C",
        700: "#710005",
        800: "#480002",
      },
      info: {
        50: "#FAFCFF",
        100: "#D4DEED",
        200: "#B4C1D3",
        300: "#95A4B9",
        400: "#79889D",
        500: "#5E6D81",
        600: "#465365",
        700: "#2F3A49",
        800: "#1B232D",
      },
    },
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
   * @placeholder OVERLAY.palette.backgroundSurfaceColor
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
   * @placeholder OVERLAY.palette.borderSubtleColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.borderTertiaryColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.errorBorderColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.errorColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.infoBorderColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.infoColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.infoInkColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.interactiveBgActiveColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.interactiveBgHoverColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.interactiveBgMutedColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.interactiveBorderColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.neutralZeroColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.primarySubtleColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.ramps.error.900
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.ramps.info.900
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.ramps.success.900
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.ramps.warning.900
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.shadowColor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.successBorderColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.successColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
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
  /**
   * @placeholder OVERLAY.palette.textPageColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.warningBorderColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.palette.warningColor
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; PALETTE lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
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
   * @placeholder OVERLAY.surfaces.elevations
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.gradients
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.shadows
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder OVERLAY.surfaces.surfaceRoles
   * @domicile unassigned
   * @governor none — gap aceptado: el modo no diverge en este slot; SURFACES lo autora y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
   */
  },
  /**
   * Familia mixta. Controles: chrome.families, palette.seeds, token-overrides, navigation.sidebar-tone.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  chrome: {
    controls: {
      buttonPrimary: {
        bgHover: "#F0F0E8",
        color: "#131210",
      },
      buttonSecondary: {
        bgHover: "#1C1A16",
        color: "#A8A898",
        border: "#2E2C24",
      },
      buttonDefault: {
        bg: "#1C1A16",
        bgHover: "#24221C",
        border: "#2E2C24",
      },
      buttonGhost: {
        bgHover: "rgba(255, 255, 255, 0.04)",
        color: "#A8A898",
      },
      disabled: {
        bg: "#1C1A16",
        text: "#484838",
        border: "#222018",
        borderColor: "#222018",
      },
      input: {
        bg: "#131210",
        border: "#2E2C24",
        bgDisabled: "#1C1A16",
        colorDisabled: "#484838",
        borderDisabled: "#222018",
        colorPlaceholder: "#686858",
      },
      focusRingColor: "var(--ds-color-primary-400)",
    },
    cardComponent: {
      bg: "#1C1A16",
    },
    layout: {
      bg: "#131210",
      headerBg: "rgba(19, 18, 16, 0.92)",
      headerBorder: "#2E2C24",
      siderBorder: "#222018",
    },
    table: {
      headerBg: "#1C1A16",
      headerColor: "#A8A898",
      border: "#222018",
    },
    sidebar: {
      bg: "#0E0D0B",
      text: "#A8A898",
    },
  },
  /**
   * @placeholder OVERLAY.typography
   * @domicile unassigned
   * @governor none — gap aceptado: el modo de evnto no diverge en typography
   */
};

// ── RECIPES ──

/**
 * @placeholder RECIPES
 * @domicile unassigned
 * @governor none — gap aceptado: capability recipes no autorada en evnto (capabilities.recipes dice por que)
 */
// not authored by this vertical — capabilities.recipes states why.

// ── EXPRESSIVE ──

/**
 * @placeholder EXPRESSIVE
 * @domicile unassigned
 * @governor none — gap aceptado: capability expressive no autorada en evnto (capabilities.expressive dice por que)
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
  /**
   * @placeholder PALETTE.aliases
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaBlack100
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaBlack50
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaError20
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaPrimary10
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaPrimary20
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaSecondary10
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaSecondary20
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaSuccess20
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaWarning20
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.alphaWhite50
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.backgroundSurfaceColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.bgInfoColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.bgSubtleColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.interactiveBgActiveColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.interactiveBgHoverColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.interactiveBgMutedColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.neutralZeroColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.primaryForegroundColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.primarySubtleColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  ramps: {
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  primaryColor: '#171717',
  primaryHoverColor: '#262626',
  /**
   * @placeholder PALETTE.ramps.accent
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.error
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.info
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.primary
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.secondary
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.success
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.ramps.warning
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  secondaryColor: '#7A6A5A',
  secondaryHoverColor: '#5A4A3A',
  accentColor: '#7A6A5A',
  accentHoverColor: '#5A4A3A',
  backgroundColor: '#FFFFFF',
  backgroundSecondaryColor: '#fafafa',
  backgroundTertiaryColor: '#f5f5f5',
  backgroundElevatedColor: '#ffffff',
  backgroundOverlayColor: 'rgba(0, 0, 0, 0.5)',
  /**
   * @placeholder PALETTE.shadowColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.surfaceColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.surfaceMutedColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.surfaceSecondaryColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.textColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  /**
   * @placeholder PALETTE.textInverseColor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora esta hoja de palette
   */
  textPrimaryColor: '#111111',
  /**
   * Raiz de tinta del tier de pagina (K3, F4A-6): sidebar, headers de tabla,
   * labels de formulario — el mobiliario de pagina, no el contenido.
   * @domicile seed
   * @governor dial: tenant-dial (tinta de pagina); calibracion en F4B
   */
  textPageColor: '#3d3d3d',
  textSecondaryColor: '#3d3d3d',
  textTertiaryColor: '#5c5c5c',
  textMutedColor: '#737373',
  textDisabledColor: '#b3b3b3',
  onPrimaryColor: '#ffffff',
  successColor: '#15803D',
  successBgColor: '#f0fdf4',
  warningColor: '#A16207',
  warningBgColor: '#fefce8',
  /**
   * @domicile seed
   * @governor dial: token-overrides
   */
  errorColor: '#B91C1C',
  errorBgColor: '#fef2f2',
  infoColor: '#475569',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  infoBgColor: '#f8fafc',

  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  borderPrimaryColor: 'var(--ds-color-border)',
  borderSecondaryColor: 'rgba(0, 0, 0, 0.12)',
  borderColor: 'rgba(0, 0, 0, 0.08)',

  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  borderSubtleColor:
    'color-mix(in srgb, var(--ds-color-border) 66.667%, transparent)',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  borderTertiaryColor:
    'color-mix(in srgb, var(--ds-color-border) 66.667%, transparent)',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  successBorderColor: 'color-mix(in srgb, var(--ds-color-success) 20%, transparent)',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  warningBorderColor: 'color-mix(in srgb, var(--ds-color-warning) 20%, transparent)',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  errorBorderColor: 'color-mix(in srgb, var(--ds-color-error) 20%, transparent)',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-border (raiz canonica del par, K2)
   */
  infoBorderColor: 'color-mix(in srgb, var(--ds-color-info) 20%, transparent)',
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  borderFocusColor: '#171717',
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  linkColor: '#171717',
  linkHoverColor: '#525252',
  linkVisitedColor: '#737373',
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
    "var(--ds-font-pack-geometric-display, 'Outfit', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  fontFamilyMono:
    "var(--ds-font-pack-plex-mono, 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace)",
  fontFamilyDisplay:
    "var(--ds-font-pack-geometric-display, 'Outfit', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  headingWeightBias: 'heavier',
  headingLetterSpacing: '-0.02em',
  labelStyle: 'capitalize',
  letterSpacing: {
    display: '-0.025em',
    heading: '-0.02em',
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
// `borderRadius` is spread by REFERENCE, never copied. The previous
// `{ ...canonical, full: '9999px' }` produced a second object that merely
// looked like the canonical one: the frozen source could no longer detect
// an edit to `sm`/`md`/`lg`/`xl` here, which is precisely the drift the
// per-axis identity invariant exists to prevent. The `full` key it added
// was not a divergence in the first place -- the foundation already
// declares `--ds-radius-full: 9999px` (`tokens/css/foundation/themes/
// default.css`), so the extension only restated the inherited value at
// tenant scope. Dropping it moves no pixel and restores one source.
/**
 * Familia mixta. Controles: palette.seeds, surfaces.effect-intensity.
 * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
 */
const SURFACES: BrandSurfaces = {
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  surfaceRoles: {
    card: {
      backgroundHover:
        'color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-color-bg-elevated))',
    },
    control: {
      backgroundHover:
        'color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-color-bg-elevated))',
    },
  },
  /**
   * @placeholder SURFACES.borderRadius
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.densityScale
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora este slot localmente; lo aporta el preset congelado EVNTO_CANONICAL_SURFACES via el spread de `surfaces` (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.effectIntensity
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.elevations
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.glass
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.gradients
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.overlays
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.shadows
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.canvas
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.background
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.backgroundActive
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.backgroundDisabled
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.backgroundSelected
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.border
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.borderActive
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.borderDisabled
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.borderHover
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.borderSelected
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.borderStrong
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.focusRing
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.foreground
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.foregroundDisabled
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.foregroundMuted
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.highlight
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.shadow
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.shadowActive
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.shadowHover
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.card.shadowSelected
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.background
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.backgroundActive
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.backgroundDisabled
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.backgroundSelected
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.border
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.borderActive
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.borderDisabled
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.borderHover
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.borderSelected
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.borderStrong
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.focusRing
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.foreground
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.foregroundDisabled
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.foregroundMuted
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.shadow
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.shadowActive
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.shadowHover
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.control.shadowSelected
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.inset
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.overlay
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.panel
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.raised
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder SURFACES.surfaceRoles.shell
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
};

// ── MOTION ──

/**
 * @placeholder MOTION
 * @domicile unassigned
 * @governor capability: motion — evnto no la autora localmente: delega en el preset congelado EVNTO_CANONICAL_MOTION
 */
// not authored as a local decision — this vertical references the canonical
// experience baseline in place, so the preset stays the single source.

// ── CHARTS ──
/**
 * Enum de charts: personalidad de grafico; no baja a canal.
 */
const CHARTS: FirstPartyBrandTheme['charts'] = {
  animateOnMount: true,
  mountDuration: 1200,
  lineStyle: 'smooth',
  showDots: true,
  useGradientFill: true,
  tooltipStyle: 'detailed',
};

// ── CHROME ──
const CHROME: BrandChrome = {
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  /**
   * @placeholder CHROME.calendar
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia calendar (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.breadcrumb
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia breadcrumb (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.badge
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia badge (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.backTop
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia backTop (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.avatar
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia avatar (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.anchor
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia anchor (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.alert
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia alert (gobernaria chrome.families)
   */
  card: {
    defaultElevation: 'md',
    hoverElevation: 'lift-two',
    showBorder: false,
    hoverTint: true,
    paddingDensity: 'spacious',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  accent: {
    barPosition: 'top',
    barThickness: 4,
    barStyle: 'animated',
    iconContainerShape: 'circle',
    badgeShape: 'pill',
    dividerStyle: 'dashed',
  },
  /**
   * @domicile seed
   * @governor dial: navigation.sidebar-tone
   */
  /**
   * @placeholder CHROME.search
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia search (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.result
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia result (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.progress
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia progress (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.popover
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia popover (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.pagination
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia pagination (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.notification
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia notification (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.modal
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia modal (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.metricCard
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia metricCard (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.message
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia message (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.menu
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia menu (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.liveFeed
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia liveFeed (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.listingGrid
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia listingGrid (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.list
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia list (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.floatButton
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia floatButton (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.filterPill
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia filterPill (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.empty
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia empty (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.dropdown
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia dropdown (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.drawer
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia drawer (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.detail
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia detail (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.descriptions
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia descriptions (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.compactCard
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia compactCard (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.collectionCard
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia collectionCard (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.collapse
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia collapse (gobernaria chrome.families)
   */
  sidebar: {
    bg: '#fafafa',
    // Unauthored, so the sidebar edge resolved #404040 — a mid-grey rule
    // against a #fafafa rail. Points at the tenant's own border channel
    // rather than restating the layout block's literal.
    border: 'var(--ds-color-border)',
    text: '#171717',
    textMuted: '#525252',
    groupFontSize: '11px',
    groupFontWeight: 600,
    groupColor: '#737373',
    groupLetterSpacing: '0.04em',
    groupMarginTop: "12px",
    groupMarginBottom: "4px",
    groupPaddingTop: "12px",
    itemFontSize: '14px',
    itemIndent: "8px",
    itemFontWeight: 400,
    itemFontWeightActive: 500,
    itemColor: '#3d3d3d',
    itemColorActive: '#171717',
    itemBgActive: 'rgba(0, 0, 0, 0.06)',
    itemBgHover: 'rgba(0, 0, 0, 0.03)',
    itemPadding: '8px 12px',
    iconSize: '18px',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  layout: {
    bg: '#FFFFFF',
    headerBg: 'rgba(255, 255, 255, 0.95)',
    headerBackdrop: 'blur(10px)',
    headerBorder: 'rgba(0, 0, 0, 0.06)',
    siderBg: 'var(--ds-sidebar-bg)',
    siderBorder: 'rgba(0, 0, 0, 0.06)',
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  shell: {
    gridSize: '0px',
    gridLine: 'transparent',
    gridOpacity: 0,
  },
  /**
   * Familia mixta. Controles: palette.seeds, chrome.families, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  controls: {
    // ---- CTRL-04 PRESERVATION PINS (R1 Cohort 1) ----
    // NOT new product decisions. Each value is what this vertical ALREADY
    // resolves today, moved from an implicit engine-tier default onto
    // explicit ownership so the engine defaults can be deleted without
    // changing what this vertical paints. Pinned BY REFERENCE because
    // --ds-shadow-* are dark-aware and a literal would regress dark mode.
    // Generated from receipts/cohort-1-button-shadow-state-census.json.
    semantic: {
      ink: "var(--ds-color-text-primary)",
      inkMuted: "var(--ds-color-text-secondary)",
      onBrand:
        "var(--ds-color-text-on-primary, var(--ds-color-text-inverse))",
      surface: "var(--ds-surface-card-bg)",
      surfaceRaised:
        "color-mix(in srgb, var(--ds-control-surface) 86%, var(--ds-surface-panel-bg))",
      brandTint:
        "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-control-surface))",
      brandTintHover:
        "color-mix(in srgb, var(--ds-color-primary) 15%, var(--ds-control-surface))",
      brandBorder:
        "color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border))",
      iconTileBorder: "var(--ds-surface-icon-border)",
    },
    buttonAI: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-shadow-button-hover)",
      shadowActive: "var(--ds-shadow-button-rest)",
    },
    buttonInfo: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-button-info-shadow)",
      shadowActive: "var(--ds-button-info-shadow)",
    },
    buttonError: {
      shadow: "var(--ds-shadow-error-sm)",
      shadowHover: "var(--ds-shadow-error-sm)",
      shadowActive: "var(--ds-shadow-error-sm)",
    },
    buttonWarning: {
      shadow: "var(--ds-shadow-warning-sm)",
      shadowHover: "var(--ds-button-warning-shadow)",
      shadowActive: "var(--ds-button-warning-shadow)",
    },
    buttonSuccess: {
      shadow: "var(--ds-shadow-success-sm)",
      shadowHover: "var(--ds-button-success-shadow)",
      shadowActive: "var(--ds-button-success-shadow)",
    },
    buttonLink: {
      shadow: "none",
      shadowHover: "var(--ds-button-link-shadow)",
      shadowActive: "var(--ds-button-link-shadow)",
    },
    buttonText: {
      shadow: "none",
      shadowHover: "var(--ds-button-text-shadow)",
      shadowActive: "var(--ds-button-text-shadow)",
    },
    buttonDashed: {
      shadow: "none",
      shadowHover: "var(--ds-button-dashed-shadow)",
      shadowActive: "var(--ds-button-dashed-shadow)",
    },
    buttonPrimary: {
      shadowHover: "var(--ds-shadow-button-hover)",
      shadowActive: "var(--ds-shadow-button-rest)", bg: 'var(--ds-color-primary)', bgHover: '#262626', text: '#ffffff', color: '#ffffff', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
    buttonSecondary: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-shadow-button-hover)",
      shadowActive: "var(--ds-shadow-button-rest)", bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.04)', text: '#171717', color: '#171717', border: 'rgba(0, 0, 0, 0.15)' },
    buttonDefault: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-shadow-button-hover)",
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#FFFFFF', bgHover: '#FAFAFA', text: '#171717', color: 'var(--ds-color-primary)', border: 'rgba(0, 0, 0, 0.1)' },
    buttonGhost: {
      shadow: "none",
      shadowHover: "var(--ds-button-ghost-shadow)",
      shadowActive: "var(--ds-button-ghost-shadow)", bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.03)', text: '#525252', color: '#525252' },
    disabled: { opacity: 0.4, bg: '#FAFAFA', text: 'rgba(0, 0, 0, 0.25)', border: 'rgba(0, 0, 0, 0.06)', borderColor: 'rgba(0, 0, 0, 0.06)' },
    focusRingColor: 'var(--ds-color-primary)',
    input: {
      bg: '#ffffff',
      border: 'rgba(0, 0, 0, 0.12)',
      borderFocus: '#171717',
      shadowFocus: '0 0 0 1px rgba(23, 23, 23, 0.2)',
      bgDisabled: '#FAFAFA',
      colorDisabled: 'rgba(0, 0, 0, 0.25)',
      borderDisabled: 'rgba(0, 0, 0, 0.06)',
      disabledOpacity: 0.4,
    },
    select: {
      bg: 'var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))',
      bgHover: 'var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))',
      bgFocus: 'var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))',
      color: 'var(--ds-color-neutral-900)',
      colorPlaceholder: 'var(--ds-color-neutral-400)',
      borderColor: 'var(--ds-color-neutral-300)',
      borderColorHover: 'var(--ds-color-neutral-400)',
      borderColorFocus: 'var(--ds-color-primary-500)',
      dropdownBg: 'var(--ds-color-white)',
      dropdownBorderColor: 'var(--ds-color-neutral-200)',
      dropdownShadow: 'var(--ds-shadow-lg)',
      optionBgHover: 'var(--ds-color-neutral-100)',
      optionBgSelected: 'var(--ds-color-primary-50)',
      optionColor: 'var(--ds-color-neutral-900)',
      optionColorSelected: 'var(--ds-color-primary-700)',
    },
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  /**
   * @placeholder CHROME.steps
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia steps (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.statsGrid
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia statsGrid (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.statistic
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia statistic (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.spinner
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia spinner (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.skeleton
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia skeleton (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.signalCard
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia signalCard (gobernaria chrome.families)
   */
  surface: {
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
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  table: {
    headerBg: 'rgba(0, 0, 0, 0.02)',
    headerColor: '#737373',
    headerFontWeight: 500,
    headerFontSize: '0.75rem',
  },
  /**
   * @domicile unassigned
   * @governor gap medido: gobierno parcial — palette.seeds alcanza 3 de 5 canales de la familia (2 sin control; mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja aterriza en su lote F4A-7…15
   */
  cardComponent: {
    bg: '#ffffff',
    border: 'var(--ds-color-border)',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  /**
   * @placeholder CHROME.tabs
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia tabs (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.tag
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia tag (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.tallCard
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia tallCard (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.timeline
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia timeline (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.toolbar
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia toolbar (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.tooltip
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia tooltip (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.tree
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia tree (gobernaria chrome.families)
   */
  /**
   * @placeholder CHROME.workspaceCard
   * @domicile unassigned
   * @governor none — gap aceptado: evnto no autora la familia workspaceCard (gobernaria chrome.families)
   */
};

// ── CAPABILITIES ──
/**
 * Estado y prosa de capability: declara disposicion, no pinta.
 */
const CAPABILITIES: BrandCapabilityCatalog = {
  // ACTIVE. See the note on rottay's disposition. EVNTO_CANONICAL_MOTION is
  // shared with the vertical preset, but sharing a source does not make the
  // BrandTheme read of it inert: it still lowers through
  // `brandThemeToTokenOverrides` onto `--ds-motion-spring` and through
  // `brandThemeToPersonality` onto the animation personality.
  motion: { status: 'active' },
  // Evnto is the one vertical with no governed recipe profile. It is a real
  // gap, not a decision: rottay selects technical-sharp and bithire selects
  // network-professional, so evnto currently inherits engine defaults.
  recipes: {
    status: 'unassigned',
    reason: 'pending-selection',
    note: 'No governed recipe profile authored for the editorial ticketing posture yet; falls back to engine defaults.',
  },
  expressive: {
    status: 'unassigned',
    reason: 'pending-selection',
    note: 'No expressive profile sighted against the high-contrast editorial canvas yet.',
  },
  responsive: {
    status: 'disabled',
    reason: 'not-authored',
    note: 'Evnto rides the baseline container ladder; no posture override.',
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
export const evntoBrandTheme: FirstPartyBrandTheme = {
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
  /**
   * @placeholder THEME.recipes
   * @domicile unassigned
   * @governor none — gap aceptado: capability recipes no autorada en evnto (capabilities.recipes dice por que)
   */

  // expressive — governed expressive-profile selection (C1b).
  /**
   * @placeholder THEME.expressive
   * @domicile unassigned
   * @governor none — gap aceptado: capability expressive no autorada en evnto (capabilities.expressive dice por que)
   */

  // palette — ramps and semantic colour channels.
  palette: PALETTE,

  // typography — shipped font packs and heading/label strategy.
  typography: TYPOGRAPHY,

  // surfaces — radius, elevation, glass/gradient/overlay posture.
  surfaces: { ...EVNTO_CANONICAL_SURFACES, ...SURFACES },

  // motion — compatibility choreography dial, governed as a capability.
  motion: EVNTO_CANONICAL_MOTION,

  // charts — chart personality posture.
  charts: CHARTS,

  // chrome — per-component chrome channels.
  chrome: CHROME,

  // capabilities — explicit disposition for every optional family.
  capabilities: CAPABILITIES,
};
