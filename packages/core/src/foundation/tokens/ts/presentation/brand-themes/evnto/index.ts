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
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        bgHover: "#F0F0E8",
        /**
         * @domicile seed
         * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
         */
        color: "#131210",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonSecondary: {
        bgHover: "#1C1A16",
        color: "#A8A898",
        border: "#2E2C24",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      buttonDefault: {
        bg: "#1C1A16",
        bgHover: "#24221C",
        border: "#2E2C24",
      },
      buttonGhost: {
        /**
         * @domicile seed
         * @governor dial: palette.seeds
         */
        bgHover: "rgba(255, 255, 255, 0.04)",
        /**
         * @domicile seed
         * @governor dial: token-overrides
         */
        color: "#A8A898",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      disabled: {
        bg: "#1C1A16",
        text: "#484838",
        border: "#222018",
        borderColor: "#222018",
      },
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      input: {
        bg: "#131210",
        border: "#2E2C24",
        bgDisabled: "#1C1A16",
        colorDisabled: "#484838",
        borderDisabled: "#222018",
        colorPlaceholder: "#686858",
      },
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-400
       */
      focusRingColor: "var(--ds-color-primary-400)",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    cardComponent: {
      bg: "#1C1A16",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    layout: {
      bg: "#131210",
      headerBg: "rgba(19, 18, 16, 0.92)",
      headerBorder: "#2E2C24",
      siderBorder: "#222018",
    },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    table: {
      headerBg: "#1C1A16",
      headerColor: "#A8A898",
      border: "#222018",
    },
    sidebar: {
      /**
       * @domicile seed
       * @governor dial: navigation.sidebar-tone
       */
      bg: "#0E0D0B",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      text: "#A8A898",
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
     * @placeholder OVERLAY.chrome.badge
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.breadcrumb
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.calendar
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.bodyColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.border
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
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.colorMuted
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.footerBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.footerBorder
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
     * @placeholder OVERLAY.chrome.cardComponent.headerBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.headerBorderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.headerColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.cardComponent.imagePlaceholderBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.imagePlaceholderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.shadowElevated
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.subtitleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.cardComponent.titleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.collapse
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.controls.autocomplete
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonDefault.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonDefault.borderActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonDefault.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonDefault.color
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonDefault.colorActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonDefault.colorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonError
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonGhost.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonGhost.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonGhost.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonGhost.borderActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonGhost.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonGhost.colorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.controls.buttonPrimary.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonPrimary.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonPrimary.shadow
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonPrimary.shadowHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonSecondary.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.buttonSecondary.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.controls.input.addon
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.controls.input.bgFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.bgHover
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
     * @placeholder OVERLAY.chrome.controls.input.borderFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.caretColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.clear
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.controls.input.errorBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.errorColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.errorShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.filled
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.helper
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.label
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.loadingColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.readOnly
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.selectionColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.shadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.successBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.successShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.input.warningBg
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
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.controls.select
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.filterPill
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
     * @placeholder OVERLAY.chrome.layout.siderBg
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.list
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.listingGrid
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.metricCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.modal
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.premiumCard
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.search
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.shell
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.border
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.childPaddingInline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.footerBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.groupColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.groupFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.groupLetterSpacing
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.groupMarginBottom
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.groupMarginTop
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.groupPaddingTop
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
     * @placeholder OVERLAY.chrome.sidebar.itemBgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemChildHeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemColor
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemColorActive
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.sidebar.itemFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.sidebar.itemFontWeightActive
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
     * @placeholder OVERLAY.chrome.sidebar.itemIndent
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
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
     * @placeholder OVERLAY.chrome.sidebar.textMuted
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.signalCard
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
     * @placeholder OVERLAY.chrome.surface
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.actionBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.actionBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.cellColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.cellFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.cellPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.filterRowBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.headerBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.headerBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.headerFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el modo no diverge en este slot; CHROME lo autora en el cuerpo y su valor sirve a los dos modos (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.headerShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.loadingOverlayBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.rowBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.rowBgExpanded
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.rowBgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.rowBgSelected
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.rowBgStriped
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.table.rowBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tabs
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tag
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tallCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.timeline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.toolbar
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tooltip
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.tree
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder OVERLAY.chrome.workspaceCard
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
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
    "var(--ds-font-pack-geometric-display, 'Outfit', ui-sans-serif, system-ui, -apple-system, sans-serif)",
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
    "var(--ds-font-pack-geometric-display, 'Outfit', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  headingWeightBias: 'heavier',
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  headingLetterSpacing: '-0.02em',
  /**
   * @domicile seed
   * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
   */
  labelStyle: 'capitalize',
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
    heading: '-0.02em',
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
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
  mountDuration: 1200,
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
  lineStyle: 'smooth',
  showDots: true,
  useGradientFill: true,
  /**
   * @domicile seed
   * @governor seed de personalidad de charts: el compilador la copia a chartPersonality y los renderers la consumen como argumento (gantt/bullet/gauge en ui/patterns/visualization/charts/runtime/chart-engine); no baja a canal (control null en mapa-familia-canales F4A-3a); ningun ingress de manifest/controls/*.json cubre charts.* (medido 0 de 20); gobernanza de control = celda de la cohorte chart en F9
   */
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
    paddingDensity: 'spacious',
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
    barThickness: 4,
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    barStyle: 'animated',
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    iconContainerShape: 'circle',
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
    badgeShape: 'pill',
    /**
     * @domicile seed
     * @governor seed de forma de accent: el compilador lo copia a PersonalityTokens.accent (compilers/kernel/runtime/brand-theme) y se consume como argumento de render (tenant-preview modern lo estampa inline); no baja a canal via chromeToVariables (medido 0 emisiones); ingresa por el control pro chrome.families (ingress chrome.*, manifest/controls/chrome.families.json); celda familia x control en F9
     */
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
    /**
     * @domicile seed
     * @governor dial: navigation.sidebar-tone
     */
    bg: '#fafafa',
    // Unauthored, so the sidebar edge resolved #404040 — a mid-grey rule
    // against a #fafafa rail. Points at the tenant's own border channel
    // rather than restating the layout block's literal.
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-border
     */
    border: 'var(--ds-color-border)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    text: '#171717',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    textMuted: '#525252',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupFontSize: '11px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupFontWeight: 600,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupColor: '#737373',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupLetterSpacing: '0.04em',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupMarginTop: "12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupMarginBottom: "4px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    groupPaddingTop: "12px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontSize: '14px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemIndent: "8px",
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeight: 400,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemFontWeightActive: 500,
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColor: '#3d3d3d',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemColorActive: '#171717',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgActive: 'rgba(0, 0, 0, 0.06)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemBgHover: 'rgba(0, 0, 0, 0.03)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    itemPadding: '8px 12px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    iconSize: '18px',
    /**
     * @placeholder CHROME.sidebar.childPaddingInline
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.collapsedWidth
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.sidebar.footerBg
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
    /**
     * @placeholder CHROME.sidebar.width
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
    bg: '#FFFFFF',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBg: 'rgba(255, 255, 255, 0.95)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBackdrop: 'blur(10px)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    headerBorder: 'rgba(0, 0, 0, 0.06)',
    /**
     * @domicile derived
     * @governor deriva de: --ds-sidebar-bg
     */
    siderBg: 'var(--ds-sidebar-bg)',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    siderBorder: 'rgba(0, 0, 0, 0.06)',
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
    gridSize: '0px',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gridLine: 'transparent',
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    gridOpacity: 0,
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
       * @governor deriva de: --ds-surface-card-bg
       */
      surface: "var(--ds-surface-card-bg)",
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      surfaceRaised:
        "color-mix(in srgb, var(--ds-control-surface) 86%, var(--ds-surface-panel-bg))",
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
       * @domicile derived
       * @governor deriva de: --ds-surface-icon-border
       */
      iconTileBorder: "var(--ds-surface-icon-border)",
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
      shadowActive: "var(--ds-button-info-shadow)",
    },
    /**
     * @domicile derived
     * @governor deriva de: --ds-shadow-error-sm
     */
    buttonError: {
      shadow: "var(--ds-shadow-error-sm)",
      shadowHover: "var(--ds-shadow-error-sm)",
      shadowActive: "var(--ds-shadow-error-sm)",
    },
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
      shadowActive: "var(--ds-button-warning-shadow)",
    },
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
      shadowActive: "var(--ds-button-success-shadow)",
    },
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
      shadowActive: "var(--ds-button-link-shadow)",
    },
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
       * @governor deriva de: --ds-button-text-shadow
       */
      shadowActive: "var(--ds-button-text-shadow)",
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
     * @governor mixta medida en linea compartida: 3 por dial: palette.seeds; 2 por dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a); 1 por dial: chrome.families — las 6 hojas comparten una sola linea fuente y no admiten docblock propio sin reformatear
     */
    buttonPrimary: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-hover
       */
      shadowHover: "var(--ds-shadow-button-hover)",
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest, --ds-color-primary
       */
      shadowActive: "var(--ds-shadow-button-rest)", bg: 'var(--ds-color-primary)', bgHover: '#262626', text: '#ffffff', color: '#ffffff', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
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
      shadowActive: "var(--ds-shadow-button-rest)", bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.04)', text: '#171717', color: '#171717', border: 'rgba(0, 0, 0, 0.15)' },
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
       * @domicile derived
       * @governor deriva de: --ds-shadow-button-rest, --ds-color-primary
       */
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#FFFFFF', bgHover: '#FAFAFA', text: '#171717', color: 'var(--ds-color-primary)', border: 'rgba(0, 0, 0, 0.1)' },
    /**
     * @domicile seed
     * @governor mixta medida en linea compartida: 2 por dial: token-overrides; 1 por dial: palette.seeds; 1 por dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a) — las 4 hojas comparten una sola linea fuente y no admiten docblock propio sin reformatear
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
       * @governor deriva de: --ds-button-ghost-shadow
       */
      shadowActive: "var(--ds-button-ghost-shadow)", bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.03)', text: '#525252', color: '#525252' },
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    disabled: { opacity: 0.4, bg: '#FAFAFA', text: 'rgba(0, 0, 0, 0.25)', border: 'rgba(0, 0, 0, 0.06)', borderColor: 'rgba(0, 0, 0, 0.06)' },
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-primary
     */
    focusRingColor: 'var(--ds-color-primary)',
    input: {
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bg: '#ffffff',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      border: 'rgba(0, 0, 0, 0.12)',
      /**
       * @domicile seed
       * @governor dial: palette.seeds
       */
      borderFocus: '#171717',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      shadowFocus: '0 0 0 1px rgba(23, 23, 23, 0.2)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      bgDisabled: '#FAFAFA',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      colorDisabled: 'rgba(0, 0, 0, 0.25)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      borderDisabled: 'rgba(0, 0, 0, 0.06)',
      /**
       * @domicile seed
       * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
       */
      disabledOpacity: 0.4,
    },
    select: {
      /**
       * @domicile derived
       * @governor deriva de: --ds-surface-control, --ds-color-bg-input, --ds-color-white
       */
      bg: 'var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))',
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
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-900
       */
      color: 'var(--ds-color-neutral-900)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-400
       */
      colorPlaceholder: 'var(--ds-color-neutral-400)',
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
       * @domicile derived
       * @governor deriva de: --ds-color-white
       */
      dropdownBg: 'var(--ds-color-white)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-200
       */
      dropdownBorderColor: 'var(--ds-color-neutral-200)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-shadow-lg
       */
      dropdownShadow: 'var(--ds-shadow-lg)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-100
       */
      optionBgHover: 'var(--ds-color-neutral-100)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-50
       */
      optionBgSelected: 'var(--ds-color-primary-50)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-neutral-900
       */
      optionColor: 'var(--ds-color-neutral-900)',
      /**
       * @domicile derived
       * @governor deriva de: --ds-color-primary-700
       */
      optionColorSelected: 'var(--ds-color-primary-700)',
    },
    /**
     * @placeholder CHROME.controls.autocomplete
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonDefault.bgActive
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
     * @placeholder CHROME.controls.buttonDefault.colorActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonDefault.colorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.border
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonError.text
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGeometry
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGhost.bgActive
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
     * @placeholder CHROME.controls.buttonGhost.colorActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonGhost.colorHover
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
     * @placeholder CHROME.controls.buttonInfo.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonInfo.text
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonLink.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonLink.colorActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonLink.colorHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonPrimary.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSecondary.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSecondary.borderHover
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
     * @placeholder CHROME.controls.buttonSuccess.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonSuccess.text
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.bg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.bgActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.colorActive
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.buttonText.colorHover
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
     * @placeholder CHROME.controls.buttonWarning.color
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
     * @placeholder CHROME.controls.fieldGeometry
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
     * @placeholder CHROME.controls.input.addon
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
     * @placeholder CHROME.controls.input.bgFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.bgHover
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
     * @placeholder CHROME.controls.input.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.caretColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.clear
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.color
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.colorPlaceholder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no lo autora en el cuerpo pero si en el overlay; el bloque que lo autora sirve su valor (posture unassigned, roster F4A-1c)
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
     * @placeholder CHROME.controls.input.errorBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.errorColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.errorShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.filled
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.helper
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.insetShadow
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.label
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
     * @placeholder CHROME.controls.input.readOnly
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
     * @placeholder CHROME.controls.input.successBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.successShadowFocus
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.warningBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.controls.input.warningBorder
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
     * @placeholder CHROME.controls.segmented
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
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  table: {
    /**
     * @domicile seed
     * @governor sin coincidencia con PALETTE, con raiz del catalogo ni con ninguna otra clave del tema: valor exclusivo de este eje (cardinalidad medida 1)
     */
    headerBg: 'rgba(0, 0, 0, 0.02)',
    /**
     * @domicile seed
     * @governor coincide en color con la emision de PALETTE.textMutedColor (#737373)
     */
    headerColor: '#737373',
    /**
     * @domicile seed
     * @governor coincide con itemFontWeightActive (evnto/index.ts:2656), mismo rol de font-weight: relacion declarada; DIVERGE del valor autorado por rottay y bithire para el mismo eje (600): divergencia medida declarada; cardinalidad medida 2
     */
    headerFontWeight: 500,
    /**
     * @domicile seed
     * @governor sin coincidencia con PALETTE ni con ninguna otra clave del tema (cardinalidad medida 1); NO converge con el valor autorado por bithire para el mismo eje (0.6875rem): la razon de convergencia que aplica en bithire seria falsa aqui
     */
    headerFontSize: '0.75rem',
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
   * @absent CHROME.table.bg
   * @governor coincide con la emision de raiz --ds-table-bg (default.css:1704): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.border
   * @governor autora el eje en el plano dark (evnto/index.ts:671, #222018) y declina deliberadamente el plano base; ambiguedad del prong (i) resuelta por declaracion (K5c clase b)
   */
  /**
   * @absent CHROME.table.cellColor
   * @governor sin emision en :root; el skin resuelve --ds-table-cell-color con su propio fallback (data-table.css:92): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.cellFontSize
   * @governor coincide con la emision de raiz --ds-table-cell-font-size (default.css:1727): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.cellPadding
   * @governor coincide con la emision de raiz --ds-table-cell-padding (default.css:1726): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
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
   * @absent CHROME.table.headerBlockSize
   * @governor coincide con la emision de raiz --ds-table-header-block-size (default.css:1715): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.headerBorder
   * @governor sin emision en :root; el skin resuelve --ds-table-header-border con su propio fallback (data-table.css:1179): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.headerLetterSpacing
   * @governor coincide con la emision de raiz --ds-table-header-letter-spacing (default.css:1713): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
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
   * @absent CHROME.table.loadingOverlayBg
   * @governor canal muerto: coincide con la raiz --ds-table-loading-overlay-bg (default.css:1723) pero 0 lecturas en modern/skin (data-table.css); el tema no autora esta hoja porque el canal no pinta ahi, no por gap
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
   * @absent CHROME.table.rowBg
   * @governor coincide con la emision de raiz --ds-table-row-bg (default.css:1718): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.rowBgExpanded
   * @governor sin emision en :root; el skin resuelve --ds-table-row-bg-expanded con su propio fallback (data-table.css:1414): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.rowBgHover
   * @governor coincide con la emision de raiz --ds-table-row-bg-hover (default.css:1719): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.rowBgSelected
   * @governor coincide con la emision de raiz --ds-table-row-bg-selected (default.css:1721): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.rowBgStriped
   * @governor coincide con la emision de raiz --ds-table-row-bg-striped (default.css:1720): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
   */
  /**
   * @absent CHROME.table.rowBorder
   * @governor coincide con la emision de raiz --ds-table-row-border (default.css:1722): el tema no autora esta hoja y hereda el default del sistema; minimalidad intencional, no gap
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
   * @absent CHROME.table.sheen
   * @governor sin emision en :root; el skin resuelve --ds-table-sheen con su propio fallback (data-table.css:1015): el tema no autora esta hoja y hereda el piso del skin; minimalidad intencional, no gap
   */
  cardComponent: {
    /**
     * @domicile seed
     * @governor dial en F4B (sin control atribuido en mapa-familia-canales F4A-3a)
     */
    bg: '#ffffff',
    /**
     * @domicile derived
     * @governor deriva de: --ds-color-border
     */
    border: 'var(--ds-color-border)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    /**
     * @domicile seed
     * @governor dial: palette.seeds
     */
    shadowHover: '0 4px 12px rgba(0, 0, 0, 0.1)',
    /**
     * @placeholder CHROME.cardComponent.bgHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.bodyColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.bodyPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.borderAccentHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.borderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.borderHover
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.color
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
     * @placeholder CHROME.cardComponent.footerBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.footerBorder
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
     * @placeholder CHROME.cardComponent.footerPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.headerBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.headerBorder
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.headerBorderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.headerColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.headerPadding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.hoverTransform
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
     * @placeholder CHROME.cardComponent.imagePlaceholderBg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.imagePlaceholderColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.padding
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.paddingLg
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.paddingMd
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.paddingSm
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.paddingXl
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.radius
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.shadowElevated
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.subtitleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.titleColor
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.titleFontSize
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.titleFontWeight
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
    /**
     * @placeholder CHROME.cardComponent.titleLetterSpacing
     * @domicile unassigned
     * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
     */
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
  /**
   * @placeholder CHROME.anchor
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.breadcrumb
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
   * @placeholder CHROME.modal
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
   * @placeholder CHROME.tabs
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.tooltip
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
   * @placeholder CHROME.badge
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
   * @placeholder CHROME.descriptions
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.detail
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.empty
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.filterPill
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.floatButton
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.list
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.listingGrid
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.liveFeed
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.metricCard
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
   * @placeholder CHROME.search
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder CHROME.signalCard
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
   * @placeholder CHROME.tallCard
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
  // ACTIVE. See the note on rottay's disposition. EVNTO_CANONICAL_MOTION is
  // shared with the vertical preset, but sharing a source does not make the
  // BrandTheme read of it inert: it still lowers through
  // `brandThemeToTokenOverrides` onto `--ds-motion-spring` and through
  // `brandThemeToPersonality` onto the animation personality.
  /**
   * @domicile pro-expert
   * @governor capability: motion (estado autorado: active)
   */
  motion: { status: 'active' },
  // Evnto is the one vertical with no governed recipe profile. It is a real
  // gap, not a decision: rottay selects technical-sharp and bithire selects
  // network-professional, so evnto currently inherits engine defaults.
  recipes: {
    /**
     * @domicile pro-expert
     * @governor capability: recipes (estado autorado: unassigned)
     */
    status: 'unassigned',
    /**
     * @domicile pro-expert
     * @governor capability: recipes (estado autorado: unassigned)
     */
    reason: 'pending-selection',
    note: 'No governed recipe profile authored for the editorial ticketing posture yet; falls back to engine defaults.',
  },
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
    note: 'No expressive profile sighted against the high-contrast editorial canvas yet.',
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
    note: 'Evnto rides the baseline container ladder; no posture override.',
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
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
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
  surfaces: { ...EVNTO_CANONICAL_SURFACES, ...SURFACES },

  // motion — compatibility choreography dial, governed as a capability.
  /**
   * @domicile unassigned
   * @governor el esqueleto cablea los planos, no autora pintura (ley F4A-3b hecha por hoja)
   */
  motion: EVNTO_CANONICAL_MOTION,

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
   * @placeholder THEME.recipes
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder THEME.surfaces
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
   * @placeholder MOTION
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora esta familia localmente; delega en el preset congelado EVNTO_CANONICAL_MOTION (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder RECIPES
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
  /**
   * @placeholder EXPRESSIVE
   * @domicile unassigned
   * @governor none — gap aceptado: el tema no autora este slot en ningun plano; lo resuelve el piso del design system (posture unassigned, roster F4A-1c)
   */
};
