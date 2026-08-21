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
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  palette: {
    primaryColor: "#E8E8E0",
    onPrimaryColor: "#131210",
    primaryForegroundColor: "#131210",
    primaryHoverColor: "#F0F0E8",
    secondaryColor: "#A89880",
    secondaryHoverColor: "#B8A890",
    accentColor: "#A89880",
    accentHoverColor: "var(--ds-color-secondary-hover)",
    backgroundColor: "#131210",
    backgroundSecondaryColor: "#1C1A16",
    backgroundTertiaryColor: "#24221C",
    backgroundElevatedColor: "#2A2820",
    backgroundOverlayColor: "rgba(2, 6, 23, 0.88)",
    textPrimaryColor: "#E8E8E0",
    textSecondaryColor: "#A8A898",
    textTertiaryColor: "var(--ds-color-neutral-600)",
    textMutedColor: "#686858",
    textDisabledColor: "#484838",
    borderPrimaryColor: "#2E2C24",
    borderSecondaryColor: "#222018",
    borderFocusColor: "#A89880",
    linkColor: "var(--ds-color-primary)",
    linkHoverColor: "var(--ds-color-primary-hover)",
    linkVisitedColor: "var(--ds-color-neutral-600)",
    successBgColor: "var(--ds-color-success-50)",
    warningBgColor: "var(--ds-color-warning-50)",
    errorBgColor: "var(--ds-color-error-50)",
    infoBgColor: "var(--ds-color-info-50)",
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
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  surfaces: {
    borderRadius: {
      full: "9999px",
    },
  },
  /**
   * Familia mixta. Controles: chrome.families, palette.seeds, token-overrides, navigation.sidebar-tone.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  chrome: {
    controls: {
      buttonPrimary: {
        bg: "#E8E8E0",
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
        color: "#E8E8E0",
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
      border: "#2E2C24",
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
};

// ── RECIPES ──
// not authored by this vertical — capabilities.recipes states why.

// ── EXPRESSIVE ──
// not authored by this vertical — capabilities.expressive states why.

// ── PALETTE ──
/**
 * Familia mixta. Controles: palette.seeds, token-overrides.
 * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
 */
const PALETTE: BrandPalette = {
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
  primaryColor: '#171717',
  primaryHoverColor: '#262626',
  secondaryColor: '#7A6A5A',
  secondaryHoverColor: '#5A4A3A',
  accentColor: '#7A6A5A',
  accentHoverColor: '#5A4A3A',
  backgroundColor: '#FFFFFF',
  backgroundSecondaryColor: '#fafafa',
  backgroundTertiaryColor: '#f5f5f5',
  backgroundElevatedColor: '#ffffff',
  backgroundOverlayColor: 'rgba(0, 0, 0, 0.5)',
  textPrimaryColor: '#111111',
  textSecondaryColor: '#3d3d3d',
  textTertiaryColor: '#5c5c5c',
  textMutedColor: '#737373',
  textDisabledColor: '#b3b3b3',
  onPrimaryColor: '#ffffff',
  successColor: '#15803D',
  successBgColor: '#f0fdf4',
  warningColor: '#A16207',
  warningBgColor: '#fefce8',
  errorColor: '#B91C1C',
  errorBgColor: '#fef2f2',
  infoColor: '#475569',
  infoBgColor: '#f8fafc',

  borderPrimaryColor: 'rgba(0, 0, 0, 0.08)',
  borderSecondaryColor: 'rgba(0, 0, 0, 0.12)',
  borderColor: 'var(--ds-color-border-primary)',

  borderSubtleColor:
    'color-mix(in srgb, var(--ds-color-border-primary) 66.667%, transparent)',
  borderTertiaryColor:
    'color-mix(in srgb, var(--ds-color-border-primary) 66.667%, transparent)',
  successBorderColor: 'color-mix(in srgb, var(--ds-color-success) 20%, transparent)',
  warningBorderColor: 'color-mix(in srgb, var(--ds-color-warning) 20%, transparent)',
  errorBorderColor: 'color-mix(in srgb, var(--ds-color-error) 20%, transparent)',
  infoBorderColor: 'color-mix(in srgb, var(--ds-color-info) 20%, transparent)',
  borderFocusColor: '#171717',
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
};

// ── MOTION ──
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
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#171717', bgHover: '#262626', text: '#ffffff', color: '#ffffff', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
    buttonSecondary: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-shadow-button-hover)",
      shadowActive: "var(--ds-shadow-button-rest)", bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.04)', text: '#171717', color: '#171717', border: 'rgba(0, 0, 0, 0.15)' },
    buttonDefault: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-shadow-button-hover)",
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#FFFFFF', bgHover: '#FAFAFA', text: '#171717', color: '#171717', border: 'rgba(0, 0, 0, 0.1)' },
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
   * @domicile seed
   * @governor dial: palette.seeds
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
   * @domicile seed
   * @governor dial: palette.seeds
   */
  cardComponent: {
    bg: '#ffffff',
    border: 'rgba(0, 0, 0, 0.08)',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
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
  appearance: { defaultMode: DEFAULT_MODE },

  // modes — the other mode, as a typed overlay the compiler merges and diffs.
  modes: { [OVERLAY_MODE]: OVERLAY },

  // recipes — governed recipe-profile selection (DS-S001).
  // recipes: not authored — capabilities.recipes states why.

  // expressive — governed expressive-profile selection (C1b).
  // expressive: not authored — capabilities.expressive states why.

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
