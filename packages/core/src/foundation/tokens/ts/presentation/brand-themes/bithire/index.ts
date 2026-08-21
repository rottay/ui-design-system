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

// ──────────────────────── AUTHORED DECISIONS ────────────────────────
// Every brand-specific value and every justified shipped pin of this vertical
// is authored below, in the roster order the skeleton consumes it. Nothing
// beneath END AUTHORED DECISIONS carries a value.

// ── IDENTITY ──
const THEME_ID = "bithire" satisfies FirstPartyBrandTheme['id'];
const THEME_NAME = "BitHire";
const DEFAULT_MODE = "light" satisfies BrandThemeMode;
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
   * Familia mixta. Controles: palette.seeds, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  palette: {
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
    primaryColor: "#1e84e6",
    primaryHoverColor: "#2b8fef",
    secondaryHoverColor: "#69a6d5",
    secondaryColor: "#4f8ec0",
    accentHoverColor: "#a6c6df",
    backgroundColor: "#0f1520",
    backgroundSecondaryColor: "#151d2b",
    backgroundTertiaryColor: "#1b2535",
    backgroundElevatedColor: "#1f2940",
    backgroundSurfaceColor: "#151d2b",
    backgroundOverlayColor: "rgba(20, 40, 59, 0.58)",
    textPrimaryColor: "#e4e8ed",
    /**
     * Raiz de tinta del tier de pagina (K3, F4A-6): sidebar, headers de tabla,
     * labels de formulario — el mobiliario de pagina, no el contenido.
     * @domicile seed
     * @governor dial: tenant-dial (tinta de pagina); calibracion en F4B
     */
    textPageColor: "#9aacbf",
    textSecondaryColor: "#9aacbf",
    textTertiaryColor: "#7a90a5",
    textMutedColor: "#5a7085",
    textDisabledColor: "#3a4a5a",
    onPrimaryColor: "#ffffff",
    borderColor: "#253545",
    borderSecondaryColor: "#1d2a38",
    borderTertiaryColor: "#182230",
    borderSubtleColor: "#132032",
    borderFocusColor: "#1a7fe0",
    linkColor: "#3b9af0",
    linkHoverColor: "#6bb5f5",
    linkVisitedColor: "#a78bca",
    interactiveBorderColor: "#253545",
    interactiveBgHoverColor: "rgba(255, 255, 255, 0.04)",
    interactiveBgActiveColor: "rgba(26, 127, 224, 0.12)",
    interactiveBgMutedColor: "rgba(255, 255, 255, 0.03)",
    successColor: "#5ca6cf",
    successBgColor: "#132b40",
    successBorderColor: "rgba(92, 166, 207, 0.3)",
    warningColor: "#d4943a",
    warningBgColor: "#2e2615",
    warningBorderColor: "rgba(212, 148, 58, 0.3)",
    errorColor: "#e04848",
    errorBgColor: "#2e1515",
    errorBorderColor: "rgba(224, 72, 72, 0.3)",
    infoColor: "#1a7fe0",
    infoBgColor: "#112840",
    infoBorderColor: "rgba(26, 127, 224, 0.3)",
    infoInkColor: "var(--ds-color-info-300)",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  typography: {
    letterSpacing: {
      display: "-0.02em",
      heading: "-0.01em",
    },
    lineHeight: {
      body: 1.6,
    },
  },
  /**
   * Familia mixta. Controles: palette.seeds, surfaces.effect-intensity.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  surfaces: {
    borderRadius: {
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px rgba(20, 40, 59, 0.06)",
      md: "0 4px 12px rgba(20, 40, 59, 0.08)",
      lg: "0 8px 24px rgba(20, 40, 59, 0.1)",
      xl: "0 16px 48px rgba(20, 40, 59, 0.12)",
    },
    surfaceRoles: {
      canvas: {
        background: "var(--ds-color-bg-primary)",
        foreground: "var(--ds-color-text-primary)",
        texture: "radial-gradient(circle at 88% 4%, color-mix(in srgb, var(--ds-color-primary) 14%, transparent), transparent 30%)",
      },
      shell: {
        background: "var(--ds-color-neutral-50)",
        foreground: "var(--ds-color-text-secondary)",
        border: "var(--ds-color-border-secondary)",
      },
      panel: {
        background: "var(--ds-color-bg-primary)",
        backgroundHover: "var(--ds-color-bg-surface)",
        backgroundActive: "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-color-bg-surface))",
        backgroundSelected: "color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-color-bg-surface))",
        backgroundDisabled: "color-mix(in srgb, var(--ds-color-bg-surface) 55%, var(--ds-color-bg-primary))",
        foreground: "var(--ds-color-text-primary)",
        foregroundMuted: "var(--ds-color-text-secondary)",
        foregroundDisabled: "var(--ds-color-text-muted)",
        border: "var(--ds-color-border)",
        borderStrong: "var(--ds-color-neutral-500)",
        borderHover: "color-mix(in srgb, var(--ds-color-primary) 28%, var(--ds-color-border))",
        borderActive: "color-mix(in srgb, var(--ds-color-primary) 44%, var(--ds-color-border))",
        borderSelected: "color-mix(in srgb, var(--ds-color-primary) 58%, var(--ds-color-border))",
        borderDisabled: "var(--ds-color-border-secondary)",
        focusRing: "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        shadow: "0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 45%, transparent)",
        shadowHover: "0 10px 28px -22px color-mix(in srgb, var(--ds-color-neutral-50) 72%, transparent), 0 2px 6px color-mix(in srgb, var(--ds-color-neutral-50) 50%, transparent)",
        shadowActive: "0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 40%, transparent)",
        shadowSelected: "0 8px 24px -20px color-mix(in srgb, var(--ds-color-neutral-50) 68%, transparent), 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        highlight: "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)",
      },
      card: {
        background: "var(--ds-color-bg-surface)",
        backgroundHover: "var(--ds-color-bg-tertiary)",
        backgroundActive: "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-color-bg-tertiary))",
        backgroundSelected: "color-mix(in srgb, var(--ds-color-primary) 14%, var(--ds-color-bg-surface))",
        backgroundDisabled: "color-mix(in srgb, var(--ds-color-bg-surface) 70%, var(--ds-color-bg-primary))",
        foreground: "var(--ds-color-text-primary)",
        foregroundMuted: "var(--ds-color-text-secondary)",
        foregroundDisabled: "var(--ds-color-text-muted)",
        border: "var(--ds-color-border)",
        borderStrong: "var(--ds-color-neutral-500)",
        borderHover: "color-mix(in srgb, var(--ds-color-primary) 28%, var(--ds-color-border))",
        borderActive: "color-mix(in srgb, var(--ds-color-primary) 44%, var(--ds-color-border))",
        borderSelected: "color-mix(in srgb, var(--ds-color-primary) 58%, var(--ds-color-border))",
        borderDisabled: "var(--ds-color-border-secondary)",
        focusRing: "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        shadow: "0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 62%, transparent), 0 0 0 1px color-mix(in srgb, var(--ds-color-neutral-50) 40%, transparent)",
        shadowHover: "0 18px 38px -24px color-mix(in srgb, var(--ds-color-neutral-50) 78%, transparent), 0 3px 9px color-mix(in srgb, var(--ds-color-neutral-50) 58%, transparent)",
        shadowActive: "0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 55%, transparent)",
        shadowSelected: "0 10px 26px -20px color-mix(in srgb, var(--ds-color-neutral-50) 70%, transparent), 0 2px 6px color-mix(in srgb, var(--ds-color-neutral-50) 50%, transparent), 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        highlight: "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)",
      },
      inset: {
        background: "var(--ds-color-neutral-50)",
        foreground: "var(--ds-color-text-secondary)",
        border: "var(--ds-color-border-secondary)",
      },
      control: {
        background: "var(--ds-color-bg-primary)",
        backgroundHover: "var(--ds-color-bg-surface)",
        backgroundActive: "var(--ds-color-bg-tertiary)",
        backgroundSelected: "color-mix(in srgb, var(--ds-color-primary) 16%, var(--ds-color-bg-primary))",
        backgroundDisabled: "color-mix(in srgb, var(--ds-color-bg-surface) 60%, var(--ds-color-bg-primary))",
        foreground: "var(--ds-color-text-primary)",
        foregroundMuted: "var(--ds-color-text-secondary)",
        foregroundDisabled: "var(--ds-color-text-muted)",
        border: "var(--ds-color-border)",
        borderStrong: "var(--ds-color-neutral-500)",
        borderHover: "var(--ds-color-neutral-500)",
        borderActive: "color-mix(in srgb, var(--ds-color-primary) 44%, var(--ds-color-border))",
        borderSelected: "color-mix(in srgb, var(--ds-color-primary) 58%, var(--ds-color-border))",
        borderDisabled: "var(--ds-color-border-secondary)",
        focusRing: "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
        shadow: "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)",
        shadowHover: "0 5px 14px color-mix(in srgb, var(--ds-color-neutral-50) 55%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)",
        shadowActive: "inset 0 1px 2px color-mix(in srgb, var(--ds-color-neutral-50) 70%, transparent)",
        shadowSelected: "0 3px 10px color-mix(in srgb, var(--ds-color-neutral-50) 50%, transparent), 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)",
      },
      raised: {
        background: "linear-gradient(180deg, var(--ds-color-bg-elevated) 0%, var(--ds-color-bg-surface) 100%)",
        foreground: "var(--ds-color-text-primary)",
        border: "var(--ds-color-border)",
        shadow: "0 16px 36px -24px color-mix(in srgb, var(--ds-color-neutral-50) 80%, transparent), 0 4px 12px color-mix(in srgb, var(--ds-color-neutral-50) 58%, transparent)",
      },
      overlay: {
        background: "var(--ds-color-bg-elevated)",
        foreground: "var(--ds-color-text-primary)",
      },
    },
    gradients: {
      surface: "linear-gradient(145deg, var(--ds-surface-card) 0%, var(--ds-surface-panel) 58%, var(--ds-surface-canvas) 100%)",
    },
  },
  /**
   * Familia mixta. Controles: chrome.families, palette.seeds, shape.radius-scale, typography.scale, navigation.sidebar-tone.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  chrome: {
    controls: {
      buttonPrimary: {
        bg: "#1a7fe0",
        bgHover: "#2b8fef",
        color: "#ffffff",
      },
      buttonSecondary: {
        bg: "transparent",
        border: "#253545",
        color: "#9aacbf",
        bgHover: "#1b2535",
      },
      input: {
        bg: "#0f1520",
        border: "#253545",
        borderHover: "#3a4a5a",
        borderFocus: "#1a7fe0",
        shadowFocus: "0 0 0 1px #1a7fe0",
        colorPlaceholder: "#5a7085",
        addon: {
          bg: "var(--ds-surface-panel)",
          border: "var(--ds-color-neutral-500)",
          color: "var(--ds-color-text-secondary)",
        },
        affix: {
          bg: "var(--ds-surface-panel)",
          color: "var(--ds-color-text-secondary)",
        },
        autofill: {
          bg: "var(--ds-surface-panel)",
          caret: "var(--ds-color-primary)",
          color: "var(--ds-color-text-primary)",
        },
        bgDisabled: "var(--ds-material-control-background-disabled)",
        borderDisabled: "var(--ds-color-border-secondary)",
        // Dark pins for the border COLOR channel — see the note above the
        // dark select block.
        borderColor: "var(--ds-color-neutral-300)",
        borderColorHover: "var(--ds-color-neutral-400)",
        borderColorFocus: "var(--ds-color-primary-500)",
        caretColor: "var(--ds-color-primary)",
        clear: {
          bgHover: "var(--ds-material-control-background-hover)",
          borderHover: "var(--ds-color-neutral-500)",
          color: "var(--ds-color-text-tertiary)",
          colorHover: "var(--ds-color-text-primary)",
        },
        colorDisabled: "var(--ds-color-text-muted)",
        count: {
          color: "var(--ds-color-text-tertiary)",
          colorError: "var(--ds-color-error)",
          colorWarning: "var(--ds-color-warning)",
        },
        errorBg: "color-mix(in srgb, var(--ds-color-error) 4%, var(--ds-surface-card))",
        helper: {
          errorColor: "var(--ds-color-error)",
          color: "var(--ds-color-text-tertiary)",
        },
        filled: {
          bg: "var(--ds-surface-panel)",
          bgFocus: "var(--ds-surface-control)",
          bgHover: "var(--ds-material-control-background-hover)",
          border: "var(--ds-color-border)",
        },
        label: {
          color: "var(--ds-color-text-primary)",
          disabledColor: "var(--ds-color-text-tertiary)",
          requiredColor: "var(--ds-color-error)",
        },
        loadingColor: "var(--ds-color-primary)",
        readOnly: {
          bg: "var(--ds-surface-panel)",
          border: "var(--ds-color-border)",
          color: "var(--ds-color-text-secondary)",
        },
        selectionColor: "var(--ds-color-text-primary)",
        successBg: "color-mix(in srgb, var(--ds-color-success) 4%, var(--ds-surface-card))",
        warningBg: "color-mix(in srgb, var(--ds-color-warning) 5%, var(--ds-surface-card))",
      },
      disabled: {
        bg: "var(--ds-material-control-background-disabled)",
        border: "var(--ds-color-border-secondary)",
        borderColor: "var(--ds-color-border-secondary)",
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
      focusRingColor: "var(--ds-color-primary-400)",
      select: {
        bg: "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
        bgHover:
          "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
        bgFocus:
          "var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))",
        color: "var(--ds-color-neutral-900)",
        colorPlaceholder: "var(--ds-color-neutral-400)",
        borderColor: "var(--ds-color-neutral-300)",
        borderColorHover: "var(--ds-color-neutral-400)",
        borderColorFocus: "var(--ds-color-primary-500)",
        // The one channel the retired dark block authored explicitly.
        dropdownBg: "var(--ds-surface-card)",
        dropdownBorderColor: "var(--ds-color-neutral-200)",
        dropdownShadow: "var(--ds-shadow-lg)",
        optionBgHover: "var(--ds-color-neutral-100)",
        optionBgSelected: "var(--ds-color-primary-50)",
        optionColor: "var(--ds-color-neutral-900)",
        optionColorSelected: "var(--ds-color-primary-700)",
      },
    },
    // Dark pins for the rich-card interior; the frame channels above the
    // fold are mode-agnostic and are authored once in the theme body.
    premiumCard: {
      bg: "var(--ds-material-card-background, var(--ds-card-bg))",
      sheen:
        "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ds-card-bg) 42%, transparent), transparent)",
      headerBg: "var(--ds-rich-card-header-bg)",
      sectionBg: "var(--ds-rich-card-section-bg)",
      sectionAltBg: "var(--ds-rich-card-section-alt-bg)",
      footerBg:
        "color-mix(in srgb, var(--ds-color-bg-secondary) 72%, var(--ds-card-bg))",
    },
    // Dark pins for the semantic surface family. `radiusMd` is absent on
    // purpose: the body value and the consumer fallback are the same
    // expression, so dark is already unchanged without a pin.
    surface: {
      shadow: "var(--ds-shadow-sm)",
      shadowHover: "var(--ds-shadow-md)",
      iconBg:
        "linear-gradient(145deg, color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card-bg)), color-mix(in srgb, var(--ds-color-secondary) 10%, var(--ds-surface-card-bg)))",
      iconBorder:
        "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-surface-card-border))",
      chipBg:
        "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card-bg))",
      cardSideAccentSoft: "transparent",
      popoverShadow: "var(--ds-shadow-md)",
    },
    cardComponent: {
      bgHover: "#1b2535",
      border: "#253545",
      shadow: "0 4px 12px rgba(20, 40, 59, 0.16),\n    0 2px 4px rgba(20, 40, 59, 0.1)",
      shadowHover: "0 8px 24px rgba(20, 40, 59, 0.18),\n    0 4px 8px rgba(20, 40, 59, 0.12)",
      bodyColor: "var(--ds-color-text-primary)",
      color: "var(--ds-color-text-primary)",
      colorMuted: "var(--ds-color-text-tertiary)",
      footerBorder: "var(--ds-color-border-secondary)",
      footerBorderColor: "var(--ds-color-border-secondary)",
      footerColor: "var(--ds-color-text-secondary)",
      headerBg: "linear-gradient(112deg, color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-surface-card)) 0%, var(--ds-surface-card) 54%, var(--ds-surface-panel) 100%)",
      headerBorder: "var(--ds-color-border-secondary)",
      headerBorderColor: "var(--ds-color-border-secondary)",
      headerColor: "var(--ds-color-text-secondary)",
      imagePlaceholderBg: "var(--ds-surface-panel)",
      imagePlaceholderColor: "var(--ds-color-text-tertiary)",
      subtitleColor: "var(--ds-color-text-tertiary)",
      titleColor: "var(--ds-color-text-primary)",
    },
    table: {
      bg: "#0f1520",
      border: "#1d2a38",
      radius: "var(--ds-radius-lg)",
      headerBg: "#151d2b",
      headerColor: "#9aacbf",
      headerFontSize: "0.75rem",
      rowBg: "#0f1520",
      rowBgHover: "#1b2535",
      rowBgStriped: "#131a26",
      rowBgSelected: "#112840",
      rowBorder: "#1d2a38",
      cellPadding: "0.875rem 1rem",
      cellFontSize: "0.875rem",
      actionBg: "var(--ds-surface-control)",
      actionBorder: "color-mix(in srgb, var(--ds-color-border) 70%, transparent)",
      filterRowBg: "var(--ds-surface-panel)",
      headerBgHover: "color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-surface-card))",
      headerBorder: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      headerShadow: "inset 0 -1px 0 color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      rowBgExpanded: "var(--ds-surface-panel)",
    },
    sidebar: {
      groupFontSize: "11px",
      groupColor: "#5a7085",
      groupMarginTop: "8px",
      groupMarginBottom: "4px",
      groupPaddingTop: "10px",
      itemFontSize: "13px",
      itemFontWeightActive: "500",
      itemColor: "#9aacbf",
      itemColorActive: "#3b9af0",
      itemBgActive: "rgba(26, 127, 224, 0.12)",
      itemBgHover: "rgba(255, 255, 255, 0.04)",
      itemIndent: "6px",
      bg: "#0a0f18",
      footerBg: "#0a0f18",
      border: "#1d2a38",
      text: "#9aacbf",
      textMuted: "#5a7085",
    },
    badge: {
      countBg: "var(--ds-surface-control)",
      iconBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
      ink: "var(--ds-color-text-primary)",
      inkHover: "var(--ds-color-primary-hover)",
      removeBg: "color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-surface-card))",
      removeHoverBg: "color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card))",
      selectedInk: "var(--ds-color-primary-hover)",
      selectedSurface: "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-surface-card))",
      surface: "var(--ds-surface-control)",
      surfaceHover: "color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-surface-card))",
      surfacePressed: "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-surface-card))",
    },
    breadcrumb: {
      colorActive: "var(--ds-color-text-primary)",
      bg: "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card))",
      border: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      color: "var(--ds-color-text-secondary)",
      itemColor: "var(--ds-color-text-secondary)",
      separatorColor: "var(--ds-color-text-tertiary)",
    },
    collectionCard: {
      bg: "var(--ds-surface-card)",
      bgHover: "var(--ds-material-card-background-hover)",
      bodyColor: "var(--ds-color-text-secondary)",
      border: "var(--ds-color-border)",
      labelColor: "var(--ds-color-text-tertiary)",
      statusBg: "var(--ds-surface-panel)",
      statusBorder: "color-mix(in srgb, var(--ds-color-primary) 32%, var(--ds-color-border))",
      statusColor: "var(--ds-color-primary-hover)",
      titleColor: "var(--ds-color-text-primary)",
      valueColor: "var(--ds-color-text-primary)",
    },
    shell: {
      commandHomeConsoleBg: "var(--ds-surface-panel)",
      commandHomeControlBg: "var(--ds-surface-control)",
      commandHomeControlBorder: "color-mix(in srgb, var(--ds-color-primary) 40%, var(--ds-color-border))",
      commandHomeControlHoverBg: "color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card))",
      commandHomeHeroBg: "var(--ds-surface-card)",
      commandHomeIconBg: "color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card))",
      commandHomeMeterBg: "color-mix(in srgb, var(--ds-color-border) 72%, var(--ds-surface-card))",
      commandHomePanelBg: "var(--ds-surface-card)",
      commandHomePanelBgStrong: "var(--ds-surface-card)",
      commandHomePanelBorder: "color-mix(in srgb, var(--ds-color-primary) 55%, var(--ds-color-border))",
      commandHomePanelBorderSoft: "color-mix(in srgb, var(--ds-color-primary) 40%, var(--ds-color-border))",
      commandHomeSurfaceBg: "var(--ds-surface-card)",
      commandRailBg: "var(--ds-surface-card)",
      activeBg: "var(--ds-material-card-background-active)",
      activeGradient: "var(--ds-material-card-background-active)",
      bg: "linear-gradient(180deg, var(--ds-surface-canvas) 0%, var(--ds-surface-panel) 58%, var(--ds-surface-shell) 100%)",
      border: "var(--ds-color-border)",
    },
    compactCard: {
      bg: "var(--ds-surface-card)",
      bgHover: "var(--ds-material-card-background-hover)",
      bodyColor: "var(--ds-color-text-secondary)",
      border: "var(--ds-color-border)",
      labelColor: "var(--ds-color-text-tertiary)",
      titleColor: "var(--ds-color-text-primary)",
      valueColor: "var(--ds-color-text-primary)",
    },
    filterPill: {
      activeColor: "var(--ds-color-primary)",
      bg: "var(--ds-surface-control)",
      border: "var(--ds-color-border)",
      color: "var(--ds-color-text-secondary)",
      countBorder: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
    },
    search: {
      clearColor: "var(--ds-color-text-muted)",
      iconColor: "var(--ds-color-text-tertiary)",
      bg: "var(--ds-surface-control)",
      border: "var(--ds-color-border)",
      categoryColor: "var(--ds-color-text-tertiary)",
      clearColorHover: "var(--ds-color-text-secondary)",
      color: "var(--ds-color-text-primary)",
      emptyBg: "var(--ds-surface-panel)",
      inputBg: "var(--ds-surface-control)",
      inputBorder: "var(--ds-color-neutral-500)",
      inputColor: "var(--ds-color-text-primary)",
      placeholderColor: "var(--ds-color-text-tertiary)",
      resultBg: "var(--ds-surface-control)",
      resultBgHover: "var(--ds-surface-panel)",
      resultBorder: "var(--ds-color-border-secondary)",
      resultMetaColor: "var(--ds-color-text-tertiary)",
      resultTitleColor: "var(--ds-color-text-primary)",
    },
    layout: {
      bg: "var(--ds-surface-panel)",
      headerBg: "color-mix(in srgb, var(--ds-surface-card) 92%, transparent)",
      headerBorder: "var(--ds-color-border)",
      siderBg: "var(--ds-surface-card)",
      siderBorder: "var(--ds-color-border)",
    },
    listingGrid: {
      cardBg: "var(--ds-surface-card)",
      cardBorder: "var(--ds-color-border)",
      emptyBg: "var(--ds-surface-panel)",
      emptyBorder: "var(--ds-color-border)",
      skeletonBg: "var(--ds-surface-panel)",
    },
    metricCard: {
      bg: "var(--ds-surface-card)",
      iconBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
      labelColor: "var(--ds-color-text-tertiary)",
      meterTrack: "color-mix(in srgb, var(--ds-color-border) 48%, var(--ds-surface-panel))",
      meterTrackBorder: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      trendColor: "var(--ds-color-primary-hover)",
      valueColor: "var(--ds-color-text-primary)",
    },
    modal: {
      bg: "var(--ds-surface-card)",
      bodyColor: "var(--ds-color-text-primary)",
      closeBgHover: "var(--ds-surface-panel)",
      closeColor: "var(--ds-color-text-tertiary)",
      closeColorHover: "var(--ds-color-text-primary)",
      color: "var(--ds-color-text-primary)",
      footerBg: "var(--ds-surface-canvas)",
      footerBorder: "var(--ds-color-border-secondary)",
      headerBg: "color-mix(in srgb, var(--ds-surface-card) 88%, var(--ds-surface-panel))",
      headerBorder: "var(--ds-color-border-secondary)",
      subtitleColor: "var(--ds-color-text-tertiary)",
      titleColor: "var(--ds-color-text-primary)",
    },
    signalCard: {
      badgeColor: "var(--ds-color-primary)",
      bg: "var(--ds-surface-card)",
      bodyColor: "var(--ds-color-text-secondary)",
      border: "var(--ds-color-border)",
      iconBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
      meterTrack: "color-mix(in srgb, var(--ds-color-border) 48%, var(--ds-surface-panel))",
      meterTrackBorder: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      sectionAltBg: "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-panel))",
      sectionBg: "var(--ds-surface-card)",
      titleColor: "var(--ds-color-text-primary)",
    },
    tabs: {
      bgHover: "var(--ds-surface-panel)",
      colorActive: "var(--ds-color-text-primary)",
      colorHover: "var(--ds-color-text-primary)",
      activeBg: "var(--ds-surface-card)",
      badgeBgActive: "var(--ds-material-card-background-active)",
      badgeBorderActive: "color-mix(in srgb, var(--ds-color-primary) 32%, var(--ds-color-border))",
      badgeColorActive: "var(--ds-color-primary-hover)",
      border: "var(--ds-color-border-secondary)",
      listBg: "color-mix(in srgb, var(--ds-surface-panel) 82%, var(--ds-surface-card))",
      listBorder: "var(--ds-color-border-secondary)",
      overflowControlBg: "var(--ds-surface-control)",
      overflowControlBgHover: "var(--ds-surface-panel)",
      panelBg: "var(--ds-surface-card)",
      panelBorder: "var(--ds-color-border-secondary)",
      panelHighlight: "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)",
    },
    tallCard: {
      bg: "linear-gradient(145deg, var(--ds-surface-card) 0%, var(--ds-surface-panel) 72%, var(--ds-surface-canvas) 100%)",
      bodyColor: "var(--ds-color-text-secondary)",
      border: "var(--ds-color-border)",
      labelColor: "var(--ds-color-text-tertiary)",
      titleColor: "var(--ds-color-text-primary)",
      valueColor: "var(--ds-color-text-primary)",
    },
    toolbar: {
      bg: "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card))",
      border: "var(--ds-color-border)",
      borderBottom: "color-mix(in srgb, var(--ds-color-border) 82%, transparent)",
      color: "var(--ds-color-text-primary)",
      controlBg: "var(--ds-surface-control)",
      controlBorder: "var(--ds-color-neutral-500)",
      controlColor: "var(--ds-color-text-primary)",
      divider: "var(--ds-color-border-secondary)",
    },
    workspaceCard: {
      bg: "var(--ds-surface-card)",
      bgHover: "var(--ds-material-card-background-hover)",
      bodyColor: "var(--ds-color-text-secondary)",
      border: "var(--ds-color-border)",
      footerBg: "var(--ds-surface-canvas)",
      footerBorder: "var(--ds-color-border-secondary)",
      footerColor: "var(--ds-color-text-secondary)",
      iconBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
      iconColor: "var(--ds-color-primary)",
      labelColor: "var(--ds-color-text-tertiary)",
      titleColor: "var(--ds-color-text-primary)",
      valueColor: "var(--ds-color-text-primary)",
    },
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
  fontFamilyBase:
    "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  fontFamilyHeading:
    "var(--ds-font-pack-grotesk-display, 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  fontFamilyMono:
    "var(--ds-font-pack-plex-mono, 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace)",
  fontFamilyDisplay:
    "var(--ds-font-pack-grotesk-display, 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif)",
  headingWeightBias: "heavier",
  headingLetterSpacing: "-0.025em",
  labelStyle: "sentence",
  letterSpacing: {
    display: "-0.035em",
    heading: "-0.025em",
    body: "0",
    mono: "0",
  },
  lineHeight: {
    display: 1.1,
    heading: 1.25,
    body: 1.55,
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
  // Operational recruiting surfaces need high information density without
  // shrinking touch targets. Component geometry below owns controls; this
  // multiplier tightens the surrounding spacing ramp.
  densityScale: 0.9,
  borderRadius: { sm: "7px", md: "10px", lg: "14px", xl: "18px", full: "9999px" },
  // Four deliberately quiet but perceptibly different levels. Borders keep
  // the information architecture explicit; elevation only explains nesting.
  shadows: {
    sm: "0 1px 2px rgba(20, 40, 59, 0.08), 0 0 0 1px rgba(20, 40, 59, 0.025)",
    md: "0 10px 28px -18px rgba(20, 40, 59, 0.28), 0 2px 7px rgba(20, 40, 59, 0.08)",
    lg: "0 22px 52px -24px rgba(20, 40, 59, 0.34), 0 6px 18px rgba(20, 40, 59, 0.09)",
    xl: "0 34px 80px -28px rgba(20, 40, 59, 0.42), 0 12px 28px rgba(20, 40, 59, 0.11)",
  },
  surfaceRoles: {
    canvas: {
      background: "#f8fbff",
      foreground: "#14283B",
      texture:
        "radial-gradient(circle at 88% 4%, rgba(58, 111, 176, 0.055), transparent 30%)",
    },
    shell: {
      background: "#EEF4F8",
      foreground: "#14283B",
      border: "#D4E0EA",
    },
    panel: {
      background:
        "#f4f8fd",
      backgroundHover:
        "linear-gradient(180deg, #FBFDFE 0%, #F2F8FC 100%)",
      backgroundActive:
        "linear-gradient(180deg, #F6FAFC 0%, #EBF3F8 100%)",
      backgroundSelected:
        "linear-gradient(180deg, #F8FBFF 0%, #EAF3FB 100%)",
      backgroundDisabled: "#EFF3F6",
      foreground: "#14283B",
      foregroundMuted: "#60758A",
      foregroundDisabled: "#91A0AF",
      border: "#D4E0EA",
      borderStrong: "#B9CCDC",
      borderHover: "#9CB8CE",
      borderActive: "#6F96B8",
      borderSelected: "#5F8DB6",
      borderDisabled: "#DEE6EC",
      focusRing: "0 0 0 3px rgba(58, 111, 176, 0.14)",
      shadow: "0 1px 2px rgba(20, 40, 59, 0.035)",
      shadowHover:
        "0 10px 28px -22px rgba(20, 40, 59, 0.28), 0 2px 6px rgba(20, 40, 59, 0.05)",
      shadowActive: "0 1px 2px rgba(20, 40, 59, 0.025)",
      shadowSelected:
        "0 8px 24px -20px rgba(20, 40, 59, 0.26), 0 0 0 3px rgba(58, 111, 176, 0.14)",
      highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.84)",
    },
    card: {
      background: "#FFFFFF",
      backgroundHover: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%)",
      backgroundActive: "linear-gradient(180deg, #F7FAFC 0%, #F1F6FA 100%)",
      backgroundSelected: "linear-gradient(180deg, #F8FBFF 0%, #EDF5FC 100%)",
      backgroundDisabled: "#F3F6F8",
      foreground: "#14283B",
      foregroundMuted: "#60758A",
      foregroundDisabled: "#91A0AF",
      border: "#D4E0EA",
      borderStrong: "#B9CCDC",
      borderHover: "#86A6C2",
      borderActive: "#6F96B8",
      borderSelected: "#5F8DB6",
      borderDisabled: "#DEE6EC",
      focusRing: "0 0 0 3px rgba(58, 111, 176, 0.16)",
      shadow:
        "0 1px 2px rgba(20, 40, 59, 0.08), 0 0 0 1px rgba(20, 40, 59, 0.025)",
      shadowHover:
        "0 18px 38px -24px rgba(20, 40, 59, 0.32), 0 3px 9px rgba(20, 40, 59, 0.08)",
      shadowActive: "0 1px 2px rgba(20, 40, 59, 0.06)",
      shadowSelected:
        "0 10px 26px -20px rgba(20, 40, 59, 0.3), 0 2px 6px rgba(20, 40, 59, 0.06), 0 0 0 3px rgba(58, 111, 176, 0.16)",
      highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    },
    inset: {
      background: "#EDF3F7",
      foreground: "#31506B",
      border: "#D7E2EA",
    },
    control: {
      background: "#FFFFFF",
      backgroundHover: "#FAFCFE",
      backgroundActive: "#F1F6FA",
      backgroundSelected: "#EDF5FC",
      backgroundDisabled: "#F2F5F7",
      foreground: "#14283B",
      foregroundMuted: "#60758A",
      foregroundDisabled: "#91A0AF",
      border: "#C7D6E2",
      borderStrong: "#86A6C2",
      borderHover: "#86A6C2",
      borderActive: "#6F96B8",
      borderSelected: "#5F8DB6",
      borderDisabled: "#DCE5EB",
      focusRing: "0 0 0 3px rgba(58, 111, 176, 0.16)",
      shadow: "inset 0 1px 0 rgba(255, 255, 255, 0.92)",
      shadowHover:
        "0 5px 14px rgba(20, 40, 59, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.94)",
      shadowActive: "inset 0 1px 2px rgba(20, 40, 59, 0.08)",
      shadowSelected:
        "0 3px 10px rgba(20, 40, 59, 0.05), 0 0 0 3px rgba(58, 111, 176, 0.16)",
    },
    raised: {
      background: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFD 100%)",
      foreground: "#14283B",
      border: "#C7D6E2",
      shadow:
        "0 16px 36px -24px rgba(20, 40, 59, 0.36), 0 4px 12px rgba(20, 40, 59, 0.08)",
    },
    overlay: {
      background: "#ffffff",
      foreground: "#14283B",
    },
  },
  glass: {
    blur: "12px",
    background: "rgba(255, 255, 255, 0.84)",
    border: "rgba(196, 210, 222, 0.86)",
  },
  gradients: {
    primary: "linear-gradient(135deg, #244D79 0%, #3A6FB0 54%, #86A6C2 100%)",
    surface: "linear-gradient(145deg, #FFFFFF 0%, #F7FAFC 58%, #F5F2EC 100%)",
    mesh: "radial-gradient(circle at 84% 8%, rgba(58, 111, 176, 0.14), transparent 58%)",
  },
  // Quiet-premium materiality. This intentionally stays below the tenant
  // compiler's conservative range while allowing reusable DS primitives to
  // express depth, glass and gradient roles.
  effectIntensity: 0.58,
  overlays: {
    light: "rgba(20, 40, 59, 0.02)",
    medium: "rgba(20, 40, 59, 0.04)",
    heavy: "rgba(20, 40, 59, 0.08)",
  },
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
  mountDuration: 400,
  lineStyle: "smooth",
  showDots: false,
  useGradientFill: true,
  tooltipStyle: "detailed",
  // The monochrome family keeps dense recruiting charts legible; semantic
  // highlights still use success/warning/error at the call site.
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
    defaultElevation: "md",
    hoverElevation: "lift-two",
    showBorder: true,
    hoverTint: true,
    paddingDensity: "compact",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  accent: {
    barPosition: "none",
    barThickness: 0,
    barStyle: "solid",
    iconContainerShape: "circle",
    badgeShape: "pill",
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
    width: "256px",
    collapsedWidth: "64px",
    bg: "#ffffff",
    footerBg: "#F8FBFF",
    border: "#D4E0EA",
    text: "#14283B",
    textMuted: "#728398",
    // Type ramp alignment (design-language §2.1): group headers on the
    // detail size, items on the body size, active weight on the 400/600/700 ramp.
    groupFontSize: "0.75rem",
    groupFontWeight: 600,
    groupColor: "#728398",
    groupLetterSpacing: "0.04em",
    groupMarginTop: "8px",
    groupMarginBottom: "4px",
    groupPaddingTop: "10px",
    itemFontSize: "0.875rem",
    itemIndent: "6px",
    itemFontWeight: 400,
    itemFontWeightActive: 600,
    itemColor: "#53697E",
    itemColorActive: "#3A6FB0",
    itemBgActive: "var(--ds-tint-8)",
    itemBgHover: "#F4F8FD",
    itemPadding: "6px 10px",
    iconSize: "16px",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  layout: {
    headerHeight: "56px",
    bg: "#F4F7FA",
    headerBg: "rgba(255, 255, 255, 0.92)",
    headerBackdrop: "blur(8px)",
    headerBorder: "#D4E0EA",
    siderBg: "#FFFFFF",
    siderBorder: "#D4E0EA",
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  shell: {
    gridSize: "0px",
    gridLine: "transparent",
    gridOpacity: 0,
    // The page canvas gradient is the ONE allowed background gradient
    // (design-language §5 budget item 1).
    bg: "linear-gradient(180deg, #F8FAFC 0%, #F3F7FA 58%, #EDF3F7 100%)",
    border: "#D4E0EA",
    overlay:
      "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 3.5%, transparent) 0%, transparent 42%, rgba(227, 240, 255, 0.48) 100%)",
    shadow:
      "0 12px 34px -26px rgba(20, 40, 59, 0.36), 0 1px 3px rgba(20, 40, 59, 0.08)",
    activeBg: "#EDF2F6",
    activeGradient: "#EDF2F6",
    dropdownShadow:
      "0 12px 30px rgba(20, 40, 59, 0.10), 0 2px 8px rgba(20, 40, 59, 0.06)",
    // Decorative shimmers deleted per design-language §5 (skeletons stay
    // `pulse`; AI-live affordances are the sole shimmer exception and do
    // not read these tokens).
    commandFont: "'SF Mono', 'Fira Code', Menlo, monospace",
    commandLetterSpacing: "0",
    commandGridSize: "22px",
    // Blueprint grid overlays retired (design-language §5 / §6.4).
    commandGridLineSoft: "transparent",
    commandGridLine: "transparent",
    commandGridLineStrong: "transparent",
    commandGridBg: "none",
    commandGridBgStrong: "none",
    commandGlow: "none",
    commandLine: "none",
    commandRailBg: "#FFFFFF",
    commandHomeMaxWidth: "1120px",
    commandHomeGap: "16px",
    commandHomePanelGap: "14px",
    commandHomeGridLine:
      "color-mix(in srgb, var(--ds-color-primary) 6%, transparent)",
    commandHomePanelBorder: "#A9C9EA",
    commandHomePanelBorderSoft: "#B7D3F2",
    commandHomePanelShadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    commandHomePanelBg: "#FFFFFF",
    commandHomePanelBgStrong: "#FFFFFF",
    commandHomeCompactActionHeight: "202px",
    commandHomeConsoleMinHeight: "calc(100vh - 108px)",
    commandHomeConsolePadding:
      "clamp(20px, 3vw, 34px) clamp(16px, 4vw, 56px) 24px",
    commandHomeConsoleBg: "#F6FAFE",
    commandHomeSurfaceBg: "#FFFFFF",
    commandHomeHeroBg: "#FFFFFF",
    commandHomeIconBg: "color-mix(in srgb, #3A6FB0 9%, #FFFFFF)",
    commandHomeIconBorder: "color-mix(in srgb, #3A6FB0 32%, #D4E0EA)",
    commandHomeControlBg: "#FFFFFF",
    commandHomeControlBorder: "#B7D3F2",
    commandHomeControlHoverBg: "color-mix(in srgb, #3A6FB0 7%, #FFFFFF)",
    commandHomeControlHoverBorder: "color-mix(in srgb, #3A6FB0 42%, #D4E0EA)",
    commandHomeMeterBg: "color-mix(in srgb, #D4E0EA 72%, transparent)",
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
    bg: "color-mix(in srgb, #3A6FB0 4%, #FFFFFF)",
    border: "#D4E0EA",
    borderBottom: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    color: "#14283B",
    shadow: "0 1px 2px rgba(20, 40, 59, 0.04)",
    radius: "8px",
    padding: "0.75rem 1rem",
    gap: "0.75rem",
    controlBg: "#ffffff",
    controlBorder: "#C4D2DE",
    controlColor: "#14283B",
    divider: "#E3EAF0",
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  filterPill: {
    bg: "#ffffff",
    border: "#D4E0EA",
    color: "#53697E",
    shadow: "0 1px 2px rgba(20, 40, 59, 0.03)",
    frameBorder: "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-color-border))",
    frameShadow:
      "0 1px 2px rgba(20, 40, 59, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
    hoverBg: "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-control-surface))",
    hoverBorder: "color-mix(in srgb, var(--ds-color-primary) 20%, var(--ds-color-border))",
    activeBg: "var(--ds-tint-8)",
    activeBorder: "color-mix(in srgb, var(--ds-color-primary) 26%, var(--ds-color-border))",
    activeColor: "#3A6FB0",
    activeShadow:
      "inset 0 0 0 1px var(--ds-filter-pill-active-border), 0 1px 2px color-mix(in srgb, var(--ds-control-ink) 6%, transparent)",
    focusRing: "0 0 0 3px var(--ds-tint-24)",
    countBg: "color-mix(in srgb, var(--ds-surface-panel) 78%, var(--ds-control-surface))",
    countActiveBg: "var(--ds-control-surface)",
    countBorder: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    countActiveBorder: "color-mix(in srgb, #3A6FB0 24%, #C4D2DE)",
    countRing: "none",
    countActiveRing:
      "none",
  },
  /**
   * @domicile seed
   * @governor dial: typography.families
   */
  badge: {
    fontFamily: "var(--ds-font-family-base)",
    fontWeight: 700,
    letterSpacing: "-0.008em",
    gap: "0.3125rem",
    height: "28px",
    paddingX: "0.625rem",
    lineHeight: "1.2",
    defaultBg: "var(--ds-control-surface-raised)",
    defaultColor: "var(--ds-control-ink-muted)",
    primaryBg: "var(--ds-control-brand-tint)",
    primaryColor: "var(--ds-color-primary)",
    secondaryBg: "var(--ds-control-surface-raised)",
    secondaryColor: "var(--ds-control-ink-muted)",
    successBg:
      "color-mix(in srgb, var(--ds-color-success) 12%, var(--ds-control-surface))",
    successColor: "var(--ds-color-success)",
    warningBg:
      "color-mix(in srgb, var(--ds-color-warning) 16%, var(--ds-control-surface))",
    warningColor: "var(--ds-color-warning-900, var(--ds-color-warning))",
    errorBg:
      "color-mix(in srgb, var(--ds-color-error) 12%, var(--ds-control-surface))",
    errorColor: "var(--ds-color-error)",
    infoBg:
      "color-mix(in srgb, var(--ds-color-info, var(--ds-color-secondary, var(--ds-color-primary))) 12%, var(--ds-control-surface))",
    infoColor:
      "var(--ds-color-info, var(--ds-color-secondary, var(--ds-color-primary)))",
    radius: "var(--ds-radius-full)",
    chipRadius: "9px",
    pillRadius: "9999px",
    surface: "#FFFFFF",
    ink: "#14283B",
    frame: "color-mix(in srgb, #3A6FB0 16%, #D4E0EA)",
    highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.78)",
    shadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    surfaceHover: "color-mix(in srgb, #3A6FB0 6%, #FFFFFF)",
    inkHover: "#2C5587",
    frameHover: "color-mix(in srgb, #3A6FB0 34%, #D4E0EA)",
    shadowHover: "0 8px 18px -13px rgba(20, 40, 59, 0.42)",
    hoverTransform: "translateY(-1px)",
    surfacePressed: "color-mix(in srgb, #3A6FB0 10%, #FFFFFF)",
    framePressed: "color-mix(in srgb, #3A6FB0 42%, #D4E0EA)",
    pressTransform: "translateY(0) scale(0.985)",
    focusRing: "0 0 0 3px color-mix(in srgb, #3A6FB0 24%, transparent)",
    selectedSurface: "color-mix(in srgb, #3A6FB0 10%, #FFFFFF)",
    selectedInk: "#2C5587",
    selectedFrame: "color-mix(in srgb, #3A6FB0 38%, #D4E0EA)",
    selectedShadow: "inset 0 0 0 1px rgba(58, 111, 176, 0.10), 0 1px 2px rgba(20, 40, 59, 0.06)",
    iconBg: "color-mix(in srgb, #3A6FB0 8%, #FFFFFF)",
    iconBorder: "color-mix(in srgb, #3A6FB0 24%, #D4E0EA)",
    iconRadius: "6px",
    countBg: "#FFFFFF",
    countBorder: "color-mix(in srgb, #3A6FB0 20%, #D4E0EA)",
    countRadius: "9999px",
    countFontFamily: "var(--ds-font-family-mono)",
    removeBg: "color-mix(in srgb, #3A6FB0 5%, #FFFFFF)",
    removeBorder: "color-mix(in srgb, #3A6FB0 18%, #D4E0EA)",
    removeRadius: "9999px",
    removeHoverBg: "color-mix(in srgb, #3A6FB0 12%, #FFFFFF)",
    motionDuration: "140ms",
    motionEasing: "var(--ds-motion-ease-out, ease-out)",
    pulseDuration: "1.8s",
    pulseScale: 1.14,
    touchTarget: "2.75rem",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  breadcrumb: {
    bg: "color-mix(in srgb, #3A6FB0 4%, #FFFFFF)",
    border: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    color: "#53697E",
    linkColor: "var(--ds-color-text-secondary)",
    itemColor: "#53697E",
    colorHover: "var(--ds-color-primary)",
    colorActive: "#14283B",
    separatorColor: "#8A9AAA",
    // Breadcrumbs sit on the detail step of the type ramp (design-language §2.1).
    fontSize: "11px",
    fontWeight: 400,
    padding: "0.625rem 1rem",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  search: {
    bg: "#ffffff",
    border: "#D4E0EA",
    color: "#14283B",
    shadow:
      "0 12px 30px rgba(20, 40, 59, 0.10), 0 2px 8px rgba(20, 40, 59, 0.06)",
    // Command palette / search modal rides the xl radius step (design-language §2.3).
    radius: "14px",
    inputBg: "#ffffff",
    inputBorder: "#C4D2DE",
    inputColor: "#14283B",
    placeholderColor: "#8A9AAA",
    iconColor: "#8A9AAA",
    clearColor: "#AEBCC8",
    clearColorHover: "#53697E",
    resultBg: "#ffffff",
    resultBgHover: "#F4F8FD",
    resultBorder: "#E3EAF0",
    resultShadow: "0 1px 2px rgba(20, 40, 59, 0.04)",
    resultTitleColor: "#14283B",
    resultMetaColor: "#728398",
    categoryColor: "#728398",
    emptyBg: "#F4F8FD",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.button-style, typography.scale, shape.radius-scale, chrome.families, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  controls: {
    semantic: {
      ink: "var(--ds-color-text-primary)",
      inkMuted: "var(--ds-color-text-secondary)",
      onBrand:
        "var(--ds-color-text-on-primary, var(--ds-color-text-inverse))",
      surface: "var(--ds-surface-card)",
      surfaceRaised:
        "color-mix(in srgb, var(--ds-surface-card) 86%, var(--ds-surface-panel))",
      brandTint:
        "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-control-surface))",
      brandTintHover:
        "color-mix(in srgb, var(--ds-color-primary) 15%, var(--ds-control-surface))",
      brandBorder:
        "color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border))",
      iconTileBorder:
        "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border))",
    },
    buttonGeometry: {
      fontWeight: 600,
      letterSpacing: "-0.005em",
      gap: "6px",
      radius: "9px",
      xs: {
        height: "26px",
        paddingX: "8px",
        fontSize: "11px",
        lineHeight: "16px",
        iconSize: "12px",
        gap: "4px",
        radius: "7px",
      },
      sm: {
        height: "32px",
        paddingX: "11px",
        fontSize: "12px",
        lineHeight: "18px",
        iconSize: "14px",
        gap: "6px",
        radius: "8px",
      },
      md: {
        height: "36px",
        paddingX: "13px",
        fontSize: "13px",
        lineHeight: "20px",
        iconSize: "15px",
        gap: "6px",
        radius: "9px",
      },
      lg: {
        height: "40px",
        paddingX: "16px",
        fontSize: "14px",
        lineHeight: "22px",
        iconSize: "16px",
        gap: "7px",
        radius: "10px",
      },
      xl: {
        height: "46px",
        paddingX: "20px",
        fontSize: "15px",
        lineHeight: "24px",
        iconSize: "18px",
        gap: "8px",
        radius: "11px",
      },
    },
    fieldGeometry: {
      gap: "7px",
      radius: "9px",
      fontWeight: 400,
      letterSpacing: "0.005em",
      borderWidth: "1px",
      borderStyle: "solid",
      messageGap: "4px",
      groupGap: "0px",
      groupGapSeparated: "8px",
      groupOverlap: "-1px",
      groupMinItemWidth: "192px",
      formFieldGap: "6px",
      horizontalGap: "16px",
      labelOffsetY: "1px",
      requiredGap: "0.25em",
      formFieldDisabledOpacity: 0.52,
      labelFontSize: "12px",
      labelFontWeight: 600,
      labelLetterSpacing: "0.02em",
      labelLineHeight: "1.4",
      helperFontSize: "11px",
      helperLineHeight: "1.45",
      affixSize: "22px",
      affixSizeCompact: "18px",
      affixRadius: "6px",
      actionSize: "24px",
      actionRadius: "6px",
      touchTargetMin: "44px",
      loadingSize: "16px",
      loadingStroke: "1.75",
      loadingDuration: "700ms",
      textareaMinHeight: "104px",
      textareaMaxHeight: "420px",
      textareaPaddingX: "12px",
      textareaPaddingY: "10px",
      textareaRadius: "10px",
      textareaResize: "vertical",
      transitionDuration: "160ms",
      transitionTiming: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      xs: {
        height: "28px",
        paddingX: "8px",
        paddingY: "4px",
        fontSize: "11px",
        lineHeight: "16px",
        iconSize: "13px",
        radius: "7px",
      },
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
        height: "36px",
        paddingX: "11px",
        paddingY: "7px",
        fontSize: "13px",
        lineHeight: "20px",
        iconSize: "15px",
        radius: "9px",
      },
      lg: {
        height: "40px",
        paddingX: "13px",
        paddingY: "8px",
        fontSize: "14px",
        lineHeight: "22px",
        iconSize: "16px",
        radius: "10px",
      },
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
      bg: "var(--ds-surface-control, color-mix(in srgb, #EAF2FA 76%, #FFFFFF))",
      border: "var(--ds-material-control-border, #C7D6E5)",
      radius: "var(--ds-radius-md, 10px)",
      padding: "3px",
      gap: "2px",
      shadow: "var(--ds-material-control-shadow, inset 0 1px 0 rgba(255,255,255,0.82))",
      // itemBg stays transparent: the track ground shows through, so it is
      // already tenant-following and needs no channel of its own.
      itemBg: "transparent",
      itemBgHover:
        "var(--ds-material-control-background-hover, rgba(255,255,255,0.66))",
      itemBgSelected:
        "var(--ds-material-control-background-selected, #FFFFFF)",
      itemColor: "var(--ds-material-control-foreground-muted, #53697E)",
      itemColorHover: "var(--ds-material-control-foreground, #233B55)",
      itemColorSelected: "var(--ds-material-control-foreground, #14283B)",
      // Same ramp rebase as the button radii: a literal here is a vertical
      // leak that keeps every tenant in the vertical on BitHire geometry.
      // TMM authors --ds-radius-sm: 0px and therefore gets square segments;
      // BitHire, which authors no sm step of its own here, keeps 7px.
      itemRadius: "var(--ds-radius-sm, 7px)",
      itemShadowSelected:
        "var(--ds-material-control-shadow-selected, 0 1px 2px rgba(22,42,67,0.10), 0 0 0 1px rgba(58,111,176,0.08))",
      itemFontWeight: 500,
      itemFontWeightSelected: 600,
      focusRing:
        "var(--ds-material-control-focus-ring, 0 0 0 3px rgba(58,111,176,0.18))",
      sm: {
        height: "28px",
        paddingX: "9px",
        fontSize: "11px",
        lineHeight: "16px",
        iconSize: "13px",
        gap: "5px",
        radius: "var(--ds-radius-sm, 6px)",
      },
      md: {
        height: "32px",
        paddingX: "11px",
        fontSize: "12px",
        lineHeight: "18px",
        iconSize: "14px",
        gap: "6px",
        radius: "var(--ds-radius-sm, 7px)",
      },
      lg: {
        height: "38px",
        paddingX: "14px",
        fontSize: "13px",
        lineHeight: "20px",
        iconSize: "16px",
        gap: "7px",
        radius: "var(--ds-radius-sm, 8px)",
      },
    },
    buttonPrimary: {
      bg: "#3A6FB0",
      bgHover: "#2C5587",
      bgActive:
        "var(--ds-color-primary-active, var(--ds-button-primary-bg-hover))",
      text: "#ffffff",
      color: "var(--ds-control-on-brand)",
      border: "var(--ds-button-primary-bg)",
      // CTRL-04: the seventh instance of the vertical-literal class. A flat
      // literal here is the whole VERTICAL's primary depth, so a monochrome
      // tenant inherited BitHire's soft blue-tinted lift. Reads the control
      // role first; BitHire's own value stays as the fallback, which is its
      // direction's "subtle keyline plus low soft shadow on interactive".
      shadow: "var(--ds-material-control-shadow, 0 1px 2px rgba(20, 40, 59, 0.1))",
    },
    buttonSecondary: {
      bg: "var(--ds-control-brand-tint)",
      bgHover: "var(--ds-control-brand-tint-hover)",
      bgActive:
        "color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-control-surface))",
      text: "#3A6FB0",
      color: "#3A6FB0",
      border: "var(--ds-control-brand-border)",
    },
    buttonDefault: {
      bg: "var(--ds-control-surface)",
      bgHover: "var(--ds-control-surface-raised)",
      bgActive:
        "color-mix(in srgb, var(--ds-surface-panel) 82%, var(--ds-control-surface))",
      text: "#14283B",
      color: "var(--ds-control-ink)",
      colorHover: "var(--ds-control-ink)",
      colorActive: "var(--ds-control-ink)",
      border: "var(--ds-color-border)",
    },
    buttonGhost: {
      bg: "transparent",
      bgHover: "var(--ds-control-brand-tint)",
      bgActive: "var(--ds-control-brand-tint-hover)",
      text: "#53697E",
      color: "var(--ds-control-ink-muted)",
            colorHover: "var(--ds-control-ink)",
      colorActive: "var(--ds-control-ink)",
},
    buttonText: {
      bg: "transparent",
      bgHover: "var(--ds-control-brand-tint)",
      bgActive: "var(--ds-control-brand-tint-hover)",
      color: "var(--ds-control-ink)",
      colorHover: "var(--ds-control-ink)",
      colorActive: "var(--ds-control-ink)",
    },
    // Status and link variants. `buttonError` is the single owner of the
    // error/danger pair: the compiler spells one authored decision into both
    // vocabularies, so there is no `buttonDanger` field to author.
    buttonError: {
      bg: "var(--ds-color-error)",
      bgHover: "var(--ds-color-error-hover, var(--ds-color-error))",
      color: "var(--ds-color-text-on-error, var(--ds-control-on-brand))",
      border: "var(--ds-color-error)",
    },
    buttonSuccess: {
      color: "var(--ds-color-text-on-success, var(--ds-control-on-brand))",
    },
    buttonWarning: {
      color: "var(--ds-color-warning-900, var(--ds-control-ink))",
    },
    buttonInfo: {
      color: "var(--ds-color-text-on-info, var(--ds-control-on-brand))",
    },
    buttonLink: {
      color: "var(--ds-color-primary)",
      colorHover: "var(--ds-color-primary-hover)",
      colorActive:
        "var(--ds-color-primary-active, var(--ds-button-link-color-hover))",
    },
    focusRingColor: "var(--ds-color-primary)",
    // Field and dropdown chrome. `light` is this theme's declared default
    // mode, so these light values belong in the body; `modes.dark` pins the
    // dark side to the value it resolves to today.
    select: {
      bg: "#ffffff",
      bgHover: "#ffffff",
      bgFocus: "#ffffff",
      color: "#14283b",
      colorPlaceholder: "#8a9aaa",
      borderColor: "#c4d2de",
      borderColorHover: "#a8a7c6",
      borderColorFocus: "#3a6fb0",
      dropdownBg: "#ffffff",
      dropdownBorderColor: "#d4e0ea",
      dropdownShadow: "var(--ds-shadow-popover)",
      optionBgHover: "#f4f8fd",
      optionBgSelected: "#e8f3ff",
      optionColor: "#14283b",
      optionColorSelected: "#3a6fb0",
    },
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
      bg: "var(--ds-surface-inset, #ffffff)",
      bgHover: "var(--ds-surface-inset, #ffffff)",
      bgFocus: "var(--ds-surface-inset, #FFFFFF)",
      border: "var(--ds-material-inset-border, #C4D2DE)",
      borderHover: "var(--ds-material-control-border-hover, #9DAFC0)",
      borderFocus: "var(--ds-material-control-border-active, #3A6FB0)",
      // Border COLOR channel, upstream of the shorthands above: `input.css`
      // resolves --ds-input-border from --ds-input-border-color.
      borderColor: "#c4d2de",
      borderColorHover: "#a8a7c6",
      borderColorFocus: "#3a6fb0",
      shadowRest: "var(--ds-material-inset-shadow, 0 1px 2px rgba(20, 40, 59, 0.035))",
      shadowHover: "var(--ds-material-inset-shadow-hover, 0 3px 10px rgba(20, 40, 59, 0.07))",
      shadowFocus: "var(--ds-material-control-focus-ring, 0 0 0 3px rgba(58, 111, 176, 0.16), 0 2px 8px rgba(20, 40, 59, 0.08))",
      insetShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.82)",
      caretColor: "#3A6FB0",
      selectionBg: "rgba(58, 111, 176, 0.20)",
      selectionColor: "#14283B",
      color: "var(--ds-color-text-primary)",
      colorPlaceholder: "#8A9AAA",
      placeholderOpacity: 0.9,
      bgDisabled: "#F8F8F8",
      colorDisabled: "#AEBCC8",
      borderDisabled: "#E8EEF3",
      disabledOpacity: 0.45,
      filled: { bg: "#F4F8FD", bgHover: "#EDF4FB", bgFocus: "#FFFFFF", border: "#D4E0EA" },
      addon: { bg: "#EEF4FA", color: "#53697E", border: "#C4D2DE", radius: "9px", fontWeight: 600 },
      affix: { bg: "#F4F8FD", color: "#53697E", border: "1px solid rgba(58, 111, 176, 0.08)", paddingX: "2px" },
      label: { color: "#233B55", requiredColor: "#B83A4B", disabledColor: "#8A9AAA" },
      helper: { color: "#71869A", errorColor: "#B83A4B", errorFontWeight: 600 },
      clear: { color: "#71869A", colorHover: "#14283B", bg: "transparent", bgHover: "#EAF2FA", border: "1px solid transparent", borderHover: "#C4D2DE", shadowHover: "0 1px 3px rgba(20, 40, 59, 0.10)", focusRing: "0 0 0 2px rgba(58, 111, 176, 0.20)", activeTransform: "scale(0.94)" },
      readOnly: { bg: "#F8FAFC", color: "#53697E", border: "#D4E0EA", borderStyle: "solid", cursor: "text" },
      loadingColor: "#3A6FB0",
      autofill: { bg: "#F4F8FD", color: "#14283B", caret: "#3A6FB0" },
      count: { color: "#71869A", colorWarning: "#B56D13", colorError: "#B83A4B" },
      successBorder: "#2F8B68",
      successBg: "color-mix(in srgb, #2F8B68 4%, #FFFFFF)",
      warningBorder: "#C9822B",
      warningBg: "color-mix(in srgb, #C9822B 5%, #FFFFFF)",
      errorBorder: "#B83A4B",
      errorBg: "color-mix(in srgb, #B83A4B 4%, #FFFFFF)",
      errorColor: "#14283B",
    },
  },
  /**
   * Familia mixta. Controles: shape.radius-scale, palette.seeds, typography.scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  table: {
    bg: "#ffffff",
    border: "#D4E0EA",
    // Tables/panels ride the lg radius step (design-language §2.3).
    radius: "10px",
    headerBg: "#f3f2ef",
    headerBgHover: "color-mix(in srgb, #3A6FB0 5%, #F5F8FA)",
    headerColor: "#53697E",
    headerFontWeight: 600,
    headerFontSize: "0.6875rem",
    headerLetterSpacing: "0.065em",
    headerTextTransform: "uppercase",
    headerBlockSize: "34px",
    headerBorder: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    headerShadow:
      "inset 0 -1px 0 color-mix(in srgb, #D4E0EA 82%, transparent)",
    rowBg: "#ffffff",
    rowBgHover: "#F4F8FD",
    rowBgStriped: "#FAFCFF",
    rowBgSelected: "#E8F3FF",
    rowBgExpanded: "#F4F8FD",
    rowBorder: "#E3EAF0",
    rowHoverShadow:
      "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 18%, transparent)",
    rowFocusShadow:
      "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 28%, transparent), 0 4px 14px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)",
    cellPaddingCompact: "7px 10px",
    cellPaddingComfortable: "10px 12px",
    cellPaddingSpacious: "14px 16px",
    cellFontSize: "0.8125rem",
    cellColor: "var(--ds-color-text-primary)",
    filterRowBg: "#F4F8FD",
    filterFocusShadow:
      "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 14%, transparent), 0 0 8px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)",
    resizeBg: "color-mix(in srgb, #3A6FB0 22%, #D4E0EA)",
    resizeBgHover: "#3A6FB0",
    reorderBg: "var(--ds-tint-12)",
    actionBg: "#FFFFFF",
    actionBorder: "color-mix(in srgb, #D4E0EA 70%, transparent)",
    sheen: "none",
    pageButtonHoverShadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    loadingOverlayBg: "rgba(255, 255, 255, 0.7)",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale, typography.scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  cardComponent: {
    padding: "1rem",
    paddingSm: "0.875rem",
    paddingMd: "1rem",
    paddingLg: "1.25rem",
    paddingXl: "1.5rem",
    bg: "var(--ds-surface-card)",
    bgHover: "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card))",
    color: "#14283B",
    colorMuted: "#728398",
    border: "var(--ds-premium-card-border)",
    borderColor: "var(--ds-premium-card-border)",
    borderHover: "var(--ds-premium-card-border-hover)",
    titleLetterSpacing: "0",
    // Resting cards sit at elevation level-1 (design-language §2.4).
    shadow: "var(--ds-surface-shadow, var(--ds-shadow-sm))",
    shadowHover:
      "var(--ds-surface-shadow-hover, var(--ds-shadow-md))",
    radius: "var(--ds-radius-md)",
    // Focus ring rides the tint scale at tint-24/3px (design-language §2.5).
    focusRing: "0 0 0 3px var(--ds-tint-24)",
    // Expressive-calm keeps the lift-one hover lift (2026-07-02-b).
    hoverTransform: "translateY(-1px) scale(1)",
    headerBorder: "#E3EAF0",
    headerBorderColor: "#E3EAF0",
    headerBg:
      "linear-gradient(112deg, #EDF5FC 0%, #FFFFFF 54%, #F6F2EA 100%)",
    headerColor: "#53697E",
    headerPadding: "12px 14px",
    titleColor: "#14283B",
    titleFontSize: "13px",
    titleFontWeight: 600,
    subtitleColor: "#728398",
    bodyColor: "#14283B",
    bodyPadding: "14px",
    footerBorder: "#E3EAF0",
    footerBorderColor: "#E3EAF0",
    footerBg: "var(--ds-premium-card-footer-bg)",
    footerColor: "#53697E",
    footerPadding: "12px 14px",
    imagePlaceholderBg: "#F4F8FD",
    imagePlaceholderColor: "#8A9AAA",
  },
  // Rich card: mode-agnostic frame plus the banded interior. The interior
  // grounds are light-mode values (this theme's default mode); `modes.dark`
  // pins the dark side to the component layer's own defaults.
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  premiumCard: {
    bg: "var(--ds-surface-card)",
    sheen: "none",
    headerBg:
      "color-mix(in srgb, var(--ds-surface-card) 82%, var(--ds-surface-panel))",
    sectionBg: "var(--ds-surface-card)",
    sectionAltBg:
      "color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-surface-panel))",
    footerBg:
      "color-mix(in srgb, var(--ds-surface-panel) 72%, var(--ds-surface-card))",
    border:
      "color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-color-border))",
    borderHover:
      "color-mix(in srgb, var(--ds-color-primary) 28%, var(--ds-color-border))",
    selectedBorder:
      "color-mix(in srgb, var(--ds-color-primary) 46%, var(--ds-color-border))",
    selectedRing:
      "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)",
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  surface: {
    radiusMd: "var(--ds-radius-md)",
    shadow:
      "0 1px 2px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent), 0 10px 24px color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)",
    shadowHover:
      "0 2px 5px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent), 0 14px 30px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)",
    iconBg:
      "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
    iconBorder:
      "color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-color-border))",
    chipBg:
      "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))",
    cardSideAccentSoft:
      "color-mix(in srgb, var(--ds-color-primary) 7%, transparent)",
    // One authored elevation reaching the shadow scale and both picker
    // panels, which previously spelled it as three separate declarations.
    popoverShadow:
      "0 12px 30px rgba(20, 40, 59, 0.1), 0 2px 8px rgba(20, 40, 59, 0.06)",
    cardGridSize: "22px",
    cardGridLine:
      "color-mix(in srgb, var(--ds-signal-card-accent, var(--ds-color-primary)) 5%, transparent)",
    cardGridBg:
      "linear-gradient(var(--ds-surface-card-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ds-surface-card-grid-line) 1px, transparent 1px), linear-gradient(115deg, transparent 0%, color-mix(in srgb, var(--ds-surface-card) 34%, transparent) 46%, transparent 66%)",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  tooltip: {
    zIndex: 2700,
  },
  /**
   * Familia mixta. Controles: palette.seeds, token-overrides.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  metricCard: {
    bg: "#FFFFFF",
    border: "color-mix(in srgb, #3A6FB0 10%, #D4E0EA)",
    borderHover: "color-mix(in srgb, #3A6FB0 24%, #D4E0EA)",
    selectedBorder: "color-mix(in srgb, #3A6FB0 58%, #D4E0EA)",
    // Selected state rides the tint scale at tint-12 (design-language §2.5).
    selectedRing: "0 0 0 3px var(--ds-tint-12)",
    shadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    shadowHover:
      "0 2px 6px rgba(20, 40, 59, 0.08), 0 12px 28px rgba(20, 40, 59, 0.08)",
    sheen: "none",
    iconBg: "color-mix(in srgb, #3A6FB0 8%, #FFFFFF)",
    iconBorder: "color-mix(in srgb, #3A6FB0 24%, #D4E0EA)",
    labelColor: "#728398",
    valueColor: "#14283B",
    trendColor: "#315F86",
    meterTrack: "color-mix(in srgb, #D4E0EA 48%, #F4F8FD)",
    meterTrackBorder: "color-mix(in srgb, #D4E0EA 82%, transparent)",
    // The Confidence Meter — the ONE sanctioned multi-hue gradient (S5).
    meterFill: "linear-gradient(90deg, #315F86, #86A6C2)",
    // Status meter variants are solid tone colors (design-language §5).
    meterFillSuccess: "#327CA8",
    meterFillWarning: "#D6A04E",
    meterFillError: "#C5504C",
    meterFillNeutral: "#8A9AAA",
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  signalCard: {
    bg: "#ffffff",
    topLineDisplay: "none",
    border: "#D4E0EA",
    borderHover: "color-mix(in srgb, #3A6FB0 18%, #D4E0EA)",
    shadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    iconBg: "color-mix(in srgb, #3A6FB0 8%, #FFFFFF)",
    iconBorder: "color-mix(in srgb, #3A6FB0 24%, #D4E0EA)",
    titleColor: "#14283B",
    bodyColor: "#53697E",
    badgeBg: "var(--ds-tint-8)",
    badgeBorder: "color-mix(in srgb, #3A6FB0 28%, #D4E0EA)",
    badgeColor: "#3A6FB0",
    sectionBg: "#ffffff",
    sectionAltBg: "color-mix(in srgb, #3A6FB0 4%, #F4F8FD)",
    meterTrack: "color-mix(in srgb, #D4E0EA 48%, #F4F8FD)",
    meterTrackBorder: "color-mix(in srgb, #D4E0EA 82%, transparent)",
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
    bg: "#FFFFFF",
    bgHover: "#FBFCFE",
    border: "#D4E0EA",
    borderHover: "color-mix(in srgb, #3A6FB0 25%, #D4E0EA)",
    shadow: "0 1px 2px rgba(20, 40, 59, 0.045)",
    shadowHover:
      "0 12px 28px -18px rgba(20, 40, 59, 0.28), 0 2px 6px rgba(20, 40, 59, 0.05)",
    radius: "14px",
    padding: "16px",
    gap: "12px",
    iconBg: "color-mix(in srgb, #3A6FB0 8%, #FFFFFF)",
    iconBorder: "color-mix(in srgb, #3A6FB0 22%, #D4E0EA)",
    iconColor: "#3A6FB0",
    titleColor: "#14283B",
    bodyColor: "#53697E",
    labelColor: "#728398",
    valueColor: "#14283B",
    footerBg: "#F8FBFF",
    footerBorder: "#E3EAF0",
    footerColor: "#53697E",
    hoverTransform: "translateY(-1px)",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  compactCard: {
    bg: "#FFFFFF",
    bgHover: "#F9FBFE",
    border: "#D4E0EA",
    borderHover: "color-mix(in srgb, #3A6FB0 22%, #D4E0EA)",
    shadow: "0 1px 2px rgba(20, 40, 59, 0.04)",
    radius: "10px",
    padding: "10px 12px",
    gap: "8px",
    titleColor: "#14283B",
    bodyColor: "#53697E",
    labelColor: "#728398",
    valueColor: "#14283B",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  tallCard: {
    bg: "linear-gradient(145deg, #FFFFFF 0%, #F8FBFF 72%, #F6F2EA 100%)",
    border: "#D4E0EA",
    borderHover: "color-mix(in srgb, #3A6FB0 25%, #D4E0EA)",
    shadow:
      "0 14px 34px -26px rgba(20, 40, 59, 0.32), 0 1px 2px rgba(20, 40, 59, 0.05)",
    radius: "18px",
    padding: "20px",
    gap: "16px",
    titleColor: "#14283B",
    bodyColor: "#53697E",
    labelColor: "#728398",
    valueColor: "#14283B",
  },
  /**
   * Familia mixta. Controles: palette.seeds, shape.radius-scale.
   * Los tags por hoja/grupo aterrizan en su lote de reescritura F4A-5..15.
   */
  collectionCard: {
    bg: "#FFFFFF",
    bgHover: "#F9FBFE",
    border: "#D4E0EA",
    borderHover: "color-mix(in srgb, #3A6FB0 26%, #D4E0EA)",
    selectedBorder: "#3A6FB0",
    selectedRing: "0 0 0 3px var(--ds-tint-12)",
    shadow: "0 1px 2px rgba(20, 40, 59, 0.05)",
    shadowHover:
      "0 12px 28px -18px rgba(20, 40, 59, 0.28), 0 2px 6px rgba(20, 40, 59, 0.05)",
    radius: "12px",
    padding: "14px",
    gap: "10px",
    titleColor: "#14283B",
    bodyColor: "#53697E",
    labelColor: "#728398",
    valueColor: "#14283B",
    statusBg: "#EDF5FA",
    statusBorder: "#C5DCEB",
    statusColor: "#285F84",
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  listingGrid: {
    gap: "12px",
    minCardWidth: "260px",
    minCompactWidth: "220px",
    minTallWidth: "300px",
    cardGap: "10px",
    cardBg: "#FFFFFF",
    cardBorder: "#D4E0EA",
    cardShadow: "0 1px 2px rgba(20, 40, 59, 0.05)",
    selectedRing: "0 0 0 3px var(--ds-tint-12)",
    emptyBg: "#FBFCFE",
    emptyBorder: "#D4E0EA",
    skeletonBg: "#EEF3F8",
  },
  /**
   * Vocabulario de forma: el compilador lo consume como argumento; no baja a canal. Disposicion: F4A-close.
   */
  list: {
    previewRailGap: "clamp(14px, 1.45vw, 22px)",
    previewPanelBg:
      "linear-gradient( 180deg, color-mix(in srgb, var(--ds-surface-card) 96%, var(--ds-color-primary) 2%), color-mix(in srgb, var(--ds-surface-panel) 36%, var(--ds-surface-card)) )",
    previewPanelBorder:
      "color-mix( in srgb, var(--ds-color-primary) 14%, var(--ds-color-border) )",
    previewPanelShadow:
      "0 10px 24px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-surface-card) 76%, transparent)",
    previewMotionDuration: "180ms",
    previewMotionEase: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    shellSectionGap: "14px",
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  detail: {
    railWidth: "clamp(280px, 22vw, 340px)",
    heroBg:
      "linear-gradient( 180deg, color-mix( in srgb, var(--ds-control-surface) 98%, var(--ds-color-primary) 2% ), color-mix(in srgb, var(--ds-surface-panel) 54%, var(--ds-control-surface)) )",
    heroBorder:
      "color-mix( in srgb, var(--ds-color-text-primary) 9%, transparent )",
    heroShadow:
      "0 1px 2px color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent), 0 12px 28px color-mix(in srgb, var(--ds-color-primary) 5%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-surface-card) 76%, transparent)",
    sectionBg:
      "linear-gradient( 180deg, var(--ds-surface-card) 0%, color-mix(in srgb, var(--ds-surface-panel) 34%, var(--ds-surface-card)) 100% )",
    sectionBorder:
      "color-mix( in srgb, var(--ds-color-primary) 11%, var(--ds-color-border) )",
    sectionShadow:
      "0 1px 2px color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent), 0 8px 20px color-mix(in srgb, var(--ds-color-text-primary) 3%, transparent)",
    heroSpine: "color-mix(in srgb, var(--ds-color-primary) 46%, transparent)",
    controlBg:
      "color-mix(in srgb, var(--ds-control-surface) 92%, var(--ds-surface-card-bg, var(--ds-color-bg-primary)))",
    controlBorder:
      "color-mix(in srgb, var(--ds-color-text-primary) 10%, var(--ds-color-border-secondary))",
    controlBorderHover:
      "color-mix(in srgb, var(--ds-color-primary) 22%, var(--ds-color-border-secondary))",
    continuousBoundary:
      "color-mix(in srgb, var(--ds-color-text-primary) 7.5%, transparent)",
    continuousSurface:
      "color-mix(in srgb, var(--ds-surface-card-bg, var(--ds-surface-card)) 94%, transparent)",
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  modal: {
    bg: "#FFFFFF",
    color: "#14283B",
    shadow:
      "0 28px 72px rgba(20, 40, 59, 0.18), 0 8px 24px rgba(20, 40, 59, 0.10)",
    overlayBg: "rgba(20, 40, 59, 0.30)",
    overlayBackdrop: "blur(8px)",
    headerBg: "color-mix(in srgb, #FFFFFF 88%, #F4F8FD)",
    headerBorder: "#E3EAF0",
    titleColor: "#14283B",
    subtitleColor: "#728398",
    bodyColor: "#14283B",
    footerBorder: "#E3EAF0",
    footerBg: "#F8FBFF",
    closeColor: "#728398",
    closeColorHover: "#14283B",
    closeBgHover: "#F4F8FD",
  },
  /**
   * @domicile seed
   * @governor dial: palette.seeds
   */
  tabs: {
    border: "#E3EAF0",
    color: "var(--ds-color-text-secondary)",
    colorHover: "#14283B",
    colorActive: "#14283B",
    bgHover: "#F4F8FD",
    borderActive: "#3A6FB0",
    listBg: "color-mix(in srgb, #F4F8FD 82%, #FFFFFF)",
    listBorder: "#E3EAF0",
    listRadius: "10px",
    listPadding: "3px",
    listShadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.88), 0 1px 2px rgba(20, 40, 59, 0.04)",
    listTexture:
      "radial-gradient(circle at 1px 1px, rgba(58, 111, 176, 0.18) 0.55px, transparent 0.75px)",
    listTextureOpacity: 0.14,
    listHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.84)",
    gap: "3px",
    itemGap: "6px",
    itemRadius: "8px",
    itemFontWeight: 450,
    itemFontWeightActive: 650,
    activeBg: "#FFFFFF",
    activeShadow: "0 1px 2px rgba(20, 40, 59, 0.07)",
    activeHighlight:
      "linear-gradient(118deg, transparent 12%, rgba(255, 255, 255, 0.72) 48%, transparent 76%)",
    activeHighlightOpacity: 0.42,
    pressedTransform: "translateY(0) scale(0.985)",
    iconPadding: "4px",
    iconShadowActive:
      "inset 0 0 0 1px rgba(58, 111, 176, 0.16), 0 3px 8px rgba(58, 111, 176, 0.08)",
    badgeBgActive: "#EAF2FC",
    badgeColorActive: "#285A94",
    badgeBorderActive: "#C8D9EB",
    indicatorHeight: "2px",
    panelBg: "#FFFFFF",
    panelBorder: "#E3EAF0",
    panelRadius: "12px",
    panelShadow:
      "0 1px 2px rgba(20, 40, 59, 0.04), 0 10px 26px rgba(20, 40, 59, 0.04)",
    panelTexture:
      "linear-gradient(135deg, rgba(58, 111, 176, 0.035), transparent 42%)",
    panelHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.92)",
    overflowControlBg: "#FFFFFF",
    overflowControlBgHover: "#F4F8FD",
    overflowControlShadow: "0 1px 2px rgba(20, 40, 59, 0.06)",
    overflowControlShadowHover: "0 5px 14px rgba(20, 40, 59, 0.10)",
    motionDuration: "var(--ds-motion-feedback, 140ms)",
    activeRevealDuration: "var(--ds-motion-feedback, 140ms)",
    panelMotionDuration: "var(--ds-motion-reveal, 180ms)",
    smHeight: "30px",
    smPadding: "0 10px",
    smFontSize: "12px",
    smIconSize: "14px",
    mdHeight: "34px",
    mdPadding: "0 12px",
    mdFontSize: "13px",
    mdIconSize: "15px",
    lgHeight: "38px",
    lgPadding: "0 14px",
    lgFontSize: "14px",
    lgIconSize: "16px",
  },
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
  motion: { status: 'active' },
  recipes: { status: 'active' },
  expressive: { status: 'active' },
  responsive: {
    status: 'disabled',
    reason: 'not-authored',
    note: 'BitHire rides the baseline container ladder; no posture override.',
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
export const bithireBrandTheme: FirstPartyBrandTheme = {
  id: THEME_ID,
  name: THEME_NAME,

  // appearance — which mode the authored decisions above ARE.
  appearance: { defaultMode: DEFAULT_MODE },

  // modes — the other mode, as a typed overlay the compiler merges and diffs.
  modes: { [OVERLAY_MODE]: OVERLAY },

  // recipes — governed recipe-profile selection (DS-S001).
  recipes: RECIPES,

  // expressive — governed expressive-profile selection (C1b).
  expressive: EXPRESSIVE,

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
