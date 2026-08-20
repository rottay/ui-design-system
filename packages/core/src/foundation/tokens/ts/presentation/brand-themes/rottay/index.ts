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
  palette: {
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
    primaryColor: "#0A0A0A",
    primaryHoverColor: "#2A2A2A",
    primaryForegroundColor: "#FFFFFF",
    secondaryColor: "#6B6B6B",
    secondaryHoverColor: "#525252",
    accentColor: "#6B6B6B",
    accentHoverColor: "#525252",
    backgroundColor: "#FAFAF9",
    backgroundSecondaryColor: "#F4F4F3",
    backgroundTertiaryColor: "#EDEDEC",
    backgroundElevatedColor: "#FFFFFF",
    backgroundOverlayColor: "rgba(0, 0, 0, 0.48)",
    backgroundSurfaceColor: "#FFFFFF",
    textPrimaryColor: "#1A1A1A",
    textSecondaryColor: "#6B6B6B",
    textTertiaryColor: "#8A8A8A",
    textMutedColor: "#9C9C9C",
    textDisabledColor: "#C4C4C2",
    onPrimaryColor: "#FFFFFF",
    borderColor: "#E5E5E3",
    borderPrimaryColor: "#E5E5E3",
    borderSecondaryColor: "#D4D4D2",
    borderSubtleColor: "#EDEDEC",
    borderTertiaryColor: "#EDEDEC",
    borderFocusColor: "rgba(10, 10, 10, 0.32)",
    linkColor: "#1A1A1A",
    linkHoverColor: "#0A0A0A",
    linkVisitedColor: "#6B6B6B",
    successColor: "#16A34A",
    successBgColor: "rgba(22, 163, 74, 0.06)",
    successBorderColor: "rgba(22, 163, 74, 0.20)",
    warningColor: "#D97706",
    warningBgColor: "rgba(217, 119, 6, 0.06)",
    warningBorderColor: "rgba(217, 119, 6, 0.20)",
    errorColor: "#DC2626",
    errorBgColor: "rgba(220, 38, 38, 0.06)",
    errorBorderColor: "rgba(220, 38, 38, 0.20)",
    infoColor: "#2563EB",
    infoBgColor: "rgba(37, 99, 235, 0.06)",
    infoBorderColor: "rgba(37, 99, 235, 0.20)",
    interactiveBorderColor: "rgba(0, 0, 0, 0.12)",
    interactiveBgHoverColor: "rgba(0, 0, 0, 0.03)",
    interactiveBgActiveColor: "#EDEDEC",
    interactiveBgMutedColor: "#F4F4F3",

    // Light overlay for the T1 drain. A channel the dark body authors and
    // this mode does not restate keeps the dark value in light, so every
    // channel whose pre-drain light value differs is restated here — with
    // the value the light artifact block already shipped, or, where that
    // block was silent, with the expression the DS floor resolved to on
    // the light root.
    alphaBlack50: "rgba(0, 0, 0, 0.03)",
    alphaBlack100: "rgba(0, 0, 0, 0.06)",
    alphaWhite50: "rgba(255, 255, 255, 0.50)",
    alphaPrimary10: "rgba(10, 10, 10, 0.06)",
    alphaPrimary20: "rgba(10, 10, 10, 0.12)",
    alphaSecondary10: "rgba(107, 107, 107, 0.08)",
    alphaSecondary20: "rgba(107, 107, 107, 0.14)",
    alphaSuccess10: "rgba(22, 163, 74, 0.08)",
    alphaSuccess20: "rgba(22, 163, 74, 0.14)",
    alphaWarning10: "rgba(217, 119, 6, 0.08)",
    alphaWarning20: "rgba(217, 119, 6, 0.14)",
    alphaError10: "rgba(220, 38, 38, 0.08)",
    alphaError20: "rgba(220, 38, 38, 0.14)",
    alphaInfo10: "rgba(37, 99, 235, 0.08)",
    bgHoverColor: "#F0EFEE",
    bgInfoColor: "var(--ds-color-info-50)",
    bgSubtleColor: "#F7F7F6",
    neutralZeroColor: "var(--ds-color-white)",
    primarySubtleColor: "rgba(10, 10, 10, 0.06)",
    shadowColor: "rgba(0, 0, 0, 0.08)",
    surfaceColor: "#FFFFFF",
    surfaceMutedColor: "#EDEDEC",
    surfaceSecondaryColor: "var(--ds-color-bg-secondary)",
    textColor: "var(--ds-color-text-primary)",
    textInverseColor: "#FAFAF9",

    aliases: {
      textPrimary: "var(--ds-color-text-primary)",
      textSecondary: "var(--ds-color-text-secondary)",
      textTertiary: "var(--ds-color-text-tertiary)",
      textDisabled: "var(--ds-color-text-disabled)",
      textInverse: "#FAFAF9",
      borderColor: "var(--ds-color-border)",
      borderColorDefault: "var(--ds-color-border-primary)",
      borderColorMuted: "var(--ds-color-border-subtle)",
      borderColorStrong: "var(--ds-color-border-secondary)",
      borderColorHover: "var(--ds-color-border-secondary)",
      borderColorFocus: "rgba(10, 10, 10, 0.40)",
    },
  },
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
          colorHover: "#6B6B6B",
        },
        label: {
          color: "#6B6B6B",
        },
        helper: {
          color: "#9C9C9C",
        },
      },
      buttonPrimary: {
        bg: "#0A0A0A",
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
        color: "#6B6B6B",
                  colorHover: '#1A1A1A',
        colorActive: '#0A0A0A',
        border: 'transparent',
        borderHover: 'transparent',
        borderActive: 'transparent',
},
      buttonText: {
        bg: 'transparent',
        bgHover: "rgba(0, 0, 0, 0.04)",
        bgActive: "rgba(0, 0, 0, 0.08)",
        color: "#6B6B6B",
                  colorHover: '#1A1A1A',
        colorActive: '#0A0A0A',
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
        itemColorHover: "#6B6B6B",
        itemColorSelected: "#1A1A1A",
        shadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      /**
       * Light divergence for the eight `controls.select` channels Rottay
       * actually authors per mode. The remaining seven ride DS baseline
       * expressions that already resolve per mode, so they carry no
       * overlay row.
       */
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
        checkColor: "#0A0A0A",
        clearColor: "#9C9C9C",
        clearColorHover: "#6B6B6B",
        colorDisabled: "#C4C4C2",
        dropdownBorder: "#E5E5E3",
        errorBorder: "#DC2626",
        filledBg: "#F4F4F3",
        optionColorDisabled: "#C4C4C2",
        shadowFocus: "0 0 0 2px rgba(10, 10, 10, 0.08)",
        tagBg: "#F4F4F3",
        tagColor: "#6B6B6B",
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
        labelColor: "#6B6B6B",
        helpColor: "#9C9C9C",
        extraColor: "#9C9C9C",
        successColor: "#16A34A",
        warningColor: "#D97706",
        errorColor: "#DC2626",
        requiredColor: "#DC2626",
      },
      /**
       * ROTTAY-T2 MASS light overlay. Three kinds of row live here: a light
       * value that genuinely diverges from dark, a light restatement that
       * stops a migrated dark value from bleeding into light (those light
       * channels resolve to the DS floor and are therefore not migrated),
       * and a light-only value whose dark twin already matches the floor.
       */
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
        checkedBg: "#0A0A0A",
        checkedBorder: "#0A0A0A",
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
        checkedBorder: "#0A0A0A",
        checkedDot: "#0A0A0A",
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
        trackColor: "#0A0A0A",
        trackColorDisabled: "#C4C4C2",
      },
      switch: {
        bg: "#D4D4D2",
        bgHover: "#C4C4C2",
        checkedBg: "#0A0A0A",
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
        trackBgChecked: "#0A0A0A",
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
        buttonColor: "#6B6B6B",
        cardBg: "#FAFAF9",
        cardBorder: "#E5E5E3",
        draggerBg: "#FAFAF9",
        draggerBgHover: "#F4F4F3",
        draggerBorder: "#E5E5E3",
        draggerBorderActive: "#0A0A0A",
        draggerIconColor: "#9C9C9C",
        draggerTextColor: "#6B6B6B",
        errorBorder: "#DC2626",
        fileBg: "#FAFAF9",
        fileColor: "#6B6B6B",
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
      subtitleColor: "#6B6B6B",
      imagePlaceholderBg: "#F4F4F3",
      imagePlaceholderColor: "#9C9C9C",
      imageLoadingTrack: '#EDEDEC',
      imageLoadingActive: '#0A0A0A',
      bodyColor: "#6B6B6B",
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
      bodyColor: "#6B6B6B",
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
      headerColor: "#6B6B6B",
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
      itemColorActive: "#0A0A0A",
      itemBgActive: "rgba(0, 0, 0, 0.06)",
      itemBgHover: "rgba(0, 0, 0, 0.03)",
      itemIndent: "6px",
      itemPadding: "6px 10px",
      iconSize: "16px",
      /**
       * The nine geometry channels the dark body authors have no
       * root-level DS floor to restate — their only other declarations sit
       * on descendant selectors inside the shell and skin stylesheets. A
       * light root that inherited the dark body's geometry would be a new
       * value, not the pre-drain one, so the mode resets them instead.
       */
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
      siderBg: "#F4F4F3",
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
      primaryBg: "#0A0A0A",
      primaryColor: "var(--ds-color-white, #ffffff)",
      secondaryBg: "#F4F4F3",
      secondaryColor: "#6B6B6B",
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
      contentColor: "#6B6B6B",
    },
    tooltip: {
      bg: "#1A1A1A",
      color: "#FAFAF9",
      shadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
      defaultBg: "#1A1A1A",
      defaultColor: "#FAFAF9",
      primaryBg: "#0A0A0A",
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
      inkColor: "#0A0A0A",
      linkColor: "#9C9C9C",
      linkColorActive: "#1A1A1A",
    },
    avatar: {
      borderColor: "rgba(0, 0, 0, 0.06)",
      defaultBg: "#F4F4F3",
      defaultColor: "#6B6B6B",
      errorBg: "rgba(220, 38, 38, 0.10)",
      errorColor: "#DC2626",
      gradientBg: "linear-gradient(135deg, #1A1A1A 0%, #6B6B6B 100%)",
      gradientColor: "#FFFFFF",
      groupBorder: "#FFFFFF",
      groupOverflowBg: "#F4F4F3",
      groupOverflowColor: "#6B6B6B",
      primaryBg: "#0A0A0A",
      primaryColor: "#FFFFFF",
      ringColor: "#0A0A0A",
      secondaryBg: "#F4F4F3",
      secondaryColor: "#6B6B6B",
      statusBorder: "#FFFFFF",
      successBg: "rgba(22, 163, 74, 0.10)",
      successColor: "#16A34A",
      warningBg: "rgba(217, 119, 6, 0.10)",
      warningColor: "#D97706",
    },
    backTop: {
      bg: "#0A0A0A",
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
      bodyColor: "#6B6B6B",
      footerBorder: "#E5E5E3",
      headerBorder: "#E5E5E3",
      shadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
      titleColor: "#1A1A1A",
    },
    dropdown: {
      bg: "#FFFFFF",
      itemBgActive: "#F4F4F3",
      itemBgHover: "#FAFAF9",
      itemColor: "#6B6B6B",
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
      defaultColor: "#6B6B6B",
      descriptionColor: "#6B6B6B",
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
      refreshColor: "#6B6B6B",
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
      itemColor: "#6B6B6B",
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
      activeBg: "#0A0A0A",
      activeColor: "#FFFFFF",
      itemBgActive: "#0A0A0A",
      itemBgHover: "#FAFAF9",
      itemColor: "#6B6B6B",
      itemColorActive: "#FFFFFF",
      itemColorHover: "#1A1A1A",
    },
    progress: {
      bg: "#EDEDEC",
      fillError: "#DC2626",
      fillPrimary: "#0A0A0A",
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
      prefixColor: "#6B6B6B",
      suffixColor: "#6B6B6B",
      titleColor: "#6B6B6B",
      valueColor: "#1A1A1A",
    },
    statsGrid: {
      cardBg: "#FFFFFF",
      cardBorder: "#E5E5E3",
      cardFilledBg: "#FAFAF9",
      cardGlassBg: "rgba(255, 255, 255, 0.70)",
      cardGlassBorder: "#E5E5E3",
      descriptionColor: "#9C9C9C",
      labelColor: "#6B6B6B",
      skeletonBg: "#EDEDEC",
      skeletonWaveGradient: "linear-gradient( 90deg, rgba(0, 0, 0, 0.03) 25%, rgba(0, 0, 0, 0.06) 37%, rgba(0, 0, 0, 0.03) 63% )",
      trendNegative: "#DC2626",
      trendNeutral: "#9C9C9C",
      trendPositive: "#16A34A",
      valueColor: "#1A1A1A",
    },
    steps: {
      connectorColor: "#E5E5E3",
      connectorColorActive: "#0A0A0A",
      finishBg: "#16A34A",
      finishBorder: "#16A34A",
      itemBg: "#EDEDEC",
      itemBgActive: "#0A0A0A",
      itemColor: "#9C9C9C",
      itemColorActive: "#FFFFFF",
      processBg: "#0A0A0A",
      processBorder: "#0A0A0A",
      waitBorder: "#D4D4D2",
    },
    tag: {
      border: "#E5E5E3",
      defaultBg: "#F4F4F3",
      defaultBorder: "#E5E5E3",
      defaultColor: "#6B6B6B",
      errorBg: "rgba(220, 38, 38, 0.08)",
      errorBorder: "rgba(220, 38, 38, 0.20)",
      errorColor: "#B91C1C",
      primaryBg: "#0A0A0A",
      primaryBorder: "#0A0A0A",
      primaryColor: "#FFFFFF",
      secondaryBg: "#F4F4F3",
      secondaryBorder: "#E5E5E3",
      secondaryColor: "#6B6B6B",
      successBg: "rgba(22, 163, 74, 0.08)",
      successBorder: "rgba(22, 163, 74, 0.20)",
      successColor: "#15803D",
      warningBg: "rgba(217, 119, 6, 0.08)",
      warningBorder: "rgba(217, 119, 6, 0.20)",
      warningColor: "#B45309",
    },
    timeline: {
      contentColor: "#6B6B6B",
      dotBg: "#0A0A0A",
      dotBorder: "#FFFFFF",
      lineColor: "#E5E5E3",
    },
    tree: {
      nodeBgHover: "#FAFAF9",
      nodeBgSelected: "#F4F4F3",
      nodeColor: "#6B6B6B",
      nodeColorSelected: "#1A1A1A",
    },
  },
  surfaces: {
    borderRadius: {
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      md: "0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)",
      lg: "0 4px 8px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08)",
      xl: "0 8px 16px rgba(0, 0, 0, 0.06), 0 20px 48px rgba(0, 0, 0, 0.10)",
      xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
      xxl: "0 12px 24px rgba(0, 0, 0, 0.08), 0 32px 64px rgba(0, 0, 0, 0.14)",
      inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
      focusRing: "0 0 0 3px rgba(10, 10, 10, 0.10)",
      focusRingError: "0 0 0 3px rgba(220, 38, 38, 0.14)",
    },
    /**
     * The light ladder is the DS floor expression, restated because the
     * dark body now authors `elevations` and would otherwise carry into
     * light. `level0` is `none` in both, so it is not restated.
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
  },
};

// ── RECIPES ──
/**
 * Governed recipe profile (K0.6, 2026-07-23): selected from sighted
 * same-tree evidence (`/probe/k0-profiles`, captures under
 * test-artifacts/rottay-design-platform/K0-K1/captures). technical-sharp
 * matches this theme's declared graphite/mono/border-first posture;
 * editorial-round was sighted and rejected (illegible active pill tab on
 * the dark canvas). Explicit component props still win over profile
 * defaults.
 */
const RECIPES: BrandRecipeSelection = { schemaVersion: 1, profile: 'rottay/technical-sharp@1' };

// ── EXPRESSIVE ──
// not authored by this vertical — capabilities.expressive states why.

// ── PALETTE ──
const PALETTE: BrandPalette = {
  /**
   * Hand-tuned ramp steps. Rottay does not want the even OKLCH derivation
   * for these roles: the steps are set against its own dark canvas. They
   * shipped as a root block in the artifact extension until the contract
   * could express a ramp step, which is what `ramps` is for.
   */
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
  textSecondaryColor: '#B0B0B5',
  textTertiaryColor: '#9A9AA2',
  textMutedColor: '#96969E',
  textDisabledColor: '#555560',
  onPrimaryColor: '#0C0C0E',
  borderColor: '#28282C',
  borderPrimaryColor: '#28282C',
  borderSecondaryColor: '#252529',
  borderSubtleColor: '#161619',
  borderTertiaryColor: '#161619',
  borderFocusColor: 'rgba(255, 255, 255, 0.20)',
  linkColor: '#ECECEC',
  linkHoverColor: '#FFFFFF',
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
  errorColor: '#F87171',
  errorBgColor: 'rgba(239, 68, 68, 0.10)',
  errorBorderColor: 'rgba(239, 68, 68, 0.22)',
  infoColor: '#60A5FA',
  infoBgColor: 'rgba(59, 130, 246, 0.10)',
  infoBorderColor: 'rgba(59, 130, 246, 0.22)',
  interactiveBgHoverColor: 'rgba(255, 255, 255, 0.04)',
  interactiveBgActiveColor: '#2A2A2F',
  interactiveBgMutedColor: '#1A1A1E',

  /**
   * Drained from the artifact extension's hand-written root block (T1).
   * Rottay's default mode is dark, so these are the dark values and they
   * apply in BOTH modes; `modes.light` restates only the ones that move.
   * Every value here is the byte the extension already shipped.
   */
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

  /**
   * The unprefixed alias namespace (`--ds-text-*`, `--ds-border-color*`).
   * Same drain, same rule: one field reaches exactly one channel, so the
   * value that shipped moves into the contract without changing.
   */
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
 * Neutral sober core. Rottay is the baseline the other two verticals are
 * read against, so it deliberately does NOT reach for a display face: one
 * humanist text family carries base, heading and display, and the mono
 * register carries the operational/data surfaces.
 *
 * Every family named here is physically shipped as a font pack (see
 * FONT_PACK_MANIFEST). This previously named 'Inter', 'JetBrains Mono' and
 * 'Geist Mono' — none of which the package ships. Naming an unpackaged
 * family is not a typography decision, it is a bet on the visitor's machine,
 * and it silently resolved to whatever the OS fallback was.
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
const SURFACES: BrandSurfaces = {
  densityScale: 1.0,
  borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '18px', full: '9999px' },
  shadows: {
    sm: 'var(--ds-elevation-1)',
    md: 'var(--ds-elevation-2)',
    lg: 'var(--ds-elevation-3)',
    xl: 'var(--ds-elevation-4)',
    xs: 'var(--ds-elevation-1)',
    /** `2xl` is not an identifier; the field is `xxl`, the channel keeps `2xl`. */
    xxl: 'var(--ds-elevation-5)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.30)',
    focusRing: '0 0 0 3px rgba(255, 255, 255, 0.12)',
    focusRingError: '0 0 0 3px rgba(239, 68, 68, 0.16)',
  },
  /**
   * The authored elevation ladder, drained from the artifact extension.
   * `shadows.sm..xl` above forward to these levels, so the ladder has to be
   * a contract field rather than a hand-written root block or the forward
   * resolves against the DS floor instead of Rottay's own dark ramp.
   */
  elevations: {
    level0: 'none',
    level1:
      'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.28)',
    level2:
      'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.44), 0 6px 16px rgba(0, 0, 0, 0.34)',
    level3:
      'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 12px rgba(0, 0, 0, 0.46), 0 12px 28px rgba(0, 0, 0, 0.40)',
    level4:
      'inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 12px 24px rgba(0, 0, 0, 0.50), 0 20px 44px rgba(0, 0, 0, 0.44), 0 0 24px color-mix(in srgb, var(--ds-color-primary, #ffffff) 8%, transparent)',
    level5:
      'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.56), 0 32px 64px rgba(0, 0, 0, 0.48), 0 0 32px color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent)',
  },
  glass: { blur: 'none', background: 'none', border: 'none' },
  gradients: { primary: 'none', surface: 'none', mesh: 'none' },
  overlays: {
    light: 'rgba(255, 255, 255, 0.03)',
    medium: 'rgba(255, 255, 255, 0.06)',
    heavy: 'rgba(255, 255, 255, 0.1)',
  },
};

// ── MOTION ──
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
   * A status badge on a control plane is a label on a record, not a button.
   * The pill shape the DS and both sibling verticals use belongs to consumer
   * surfaces; Rottay squares it off onto the same radius ramp its inputs and
   * cards ride, which is what `technical-sharp` means in practice.
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
    primaryBg: '#FFFFFF',
    primaryColor: '#0C0C0E',
    secondaryBg: '#2A2A2F',
    secondaryColor: '#A0A0A5',
    successBg: '#16A34A',
    warningBg: '#D97706',
    errorBg: '#EF4444',
    infoBg: '#3B82F6',
  },

  card: {
    defaultElevation: 'md',
    hoverElevation: 'lift-two',
    showBorder: false,
    hoverTint: true,
    paddingDensity: 'normal',
  },
  accent: {
    barPosition: 'top',
    barThickness: 2,
    barStyle: 'gradient',
    iconContainerShape: 'rounded',
    badgeShape: 'rounded',
    dividerStyle: 'solid',
  },
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
    itemColorActive: '#FFFFFF',
    itemBgActive: 'rgba(255, 255, 255, 0.07)',
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    itemPadding: '0 13px',
    iconSize: '17.25px',
    footerBg: 'var(--ds-sidebar-bg)',
    /**
     * Sidebar geometry, drained from the artifact extension root block.
     * These nine channels have no root-level DS floor — their only other
     * declarations are on descendant selectors inside the shell and skin
     * stylesheets — so `modes.light` resets them with `initial` rather than
     * restating a floor that does not exist.
     */
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
  layout: {
    bg: '#0C0C0E',
    headerBg: 'rgba(12, 12, 14, 0.82)',
    headerBackdrop: 'blur(12px)',
    headerBorder: 'rgba(255, 255, 255, 0.05)',
    siderBg: '#0D0D10',
    siderBorder: '#18181C',
    dividerColor: '#2A2A2F',
    dividerTextColor: '#ECECEC',
  },
  shell: {
    gridSize: '28px',
    gridLine: 'rgba(255, 255, 255, 0.03)',
    gridOpacity: 0.9,
  },
  breadcrumb: {
    color: '#6B6B72',
    colorHover: '#ECECEC',
    colorActive: '#ECECEC',
    separatorColor: '#4A4A4F',
  },

  /**
   * List, popover, tooltip and command-palette chrome, drained from the
   * artifact extension root block. `list` carries both channel spellings the
   * DS ships (`--ds-list-bg` and `--ds-list-background-color`) because both
   * have live readers; one field per channel, no aliasing in the compiler.
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

  popover: {
    bg: '#1A1A1E',
    border: '#2A2A2F',
    contentColor: '#A0A0A5',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
    titleBorder: '#2A2A2F',
    titleColor: '#ECECEC',
  },

  tooltip: {
    bg: '#ECECEC',
    color: '#0C0C0E',
    defaultBg: '#ECECEC',
    defaultColor: '#0C0C0E',
    primaryBg: '#FFFFFF',
    primaryColor: '#0C0C0E',
    secondaryBg: '#2A2A2F',
    secondaryColor: '#ECECEC',
    successBg: '#16A34A',
    warningBg: '#D97706',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40)',
  },

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
  controls: {
    /**
     * The control ramp. Rottay is a console: a screen is a table of rows with
     * inline controls, so the DS baseline (40px md, 56px xl) spends a third of
     * the viewport on air. One seed — `--ds-input-md-height` — sets the row,
     * and every other size is an offset from it, so a tenant that moves the
     * seed moves the whole ladder including Button.
     *
     * The sizes are px and not `calc(… * var(--ds-density-*))`: the consumers
     * already apply density themselves (`input.css`, `date-picker.css`,
     * `tree-select.css`, `button.css` all wrap these tokens in
     * `* var(--ds-density-effective-scale)`), so a factor here would apply
     * twice. Height is the seed; padding and gap derive from it optically.
     */
    semantic: {
      ink: 'var(--ds-color-text-primary)',
      inkMuted: 'var(--ds-color-text-secondary)',
      onBrand:
        'var(--ds-color-text-on-primary, var(--ds-color-text-inverse))',
      surface: 'var(--ds-surface-card-bg)',
      surfaceRaised:
        'color-mix(in srgb, var(--ds-control-surface) 86%, var(--ds-surface-panel-bg))',
      brandTint:
        'color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-control-surface))',
      brandTintHover:
        'color-mix(in srgb, var(--ds-color-primary) 15%, var(--ds-control-surface))',
      brandBorder:
        'color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border))',
      iconTileBorder: 'var(--ds-surface-icon-border)',
    },
    fieldGeometry: {
      gap: 'var(--ds-spacing-2)',
      fontWeight: 'var(--ds-font-weight-normal)',
      letterSpacing: 'var(--ds-letter-spacing-body, 0)',
      labelFontSize: 'var(--ds-font-size-xs)',
      labelFontWeight: 'var(--ds-font-weight-medium)',
      helperFontSize: 'var(--ds-font-size-xs)',
      loadingStroke: '1.5',
      transitionDuration: 'var(--ds-motion-fast)',
      transitionTiming: 'var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
      xs: {
        height: 'calc(var(--ds-input-md-height) - 0.5rem)',
        paddingX: 'calc(var(--ds-input-xs-height) * 0.35)',
        paddingY: 'calc(var(--ds-input-xs-height) * 0.2)',
        fontSize: 'var(--ds-font-size-xs)',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'var(--ds-icon-xs-size)',
      },
      sm: {
        height: 'calc(var(--ds-input-md-height) - 0.25rem)',
        paddingX: 'calc(var(--ds-input-sm-height) * 0.35)',
        paddingY: 'calc(var(--ds-input-sm-height) * 0.2)',
        fontSize: 'calc(0.8125rem * var(--ds-type-scale, 1))',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'calc(var(--ds-icon-sm-size) - 2px)',
      },
      md: {
        height: '2.25rem',
        paddingX: 'calc(var(--ds-input-md-height) * 0.35)',
        paddingY: 'calc(var(--ds-input-md-height) * 0.2)',
        fontSize: 'var(--ds-font-size-sm)',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'var(--ds-icon-sm-size)',
      },
      lg: {
        height: 'calc(var(--ds-input-md-height) + 0.375rem)',
        paddingX: 'calc(var(--ds-input-lg-height) * 0.35)',
        paddingY: 'calc(var(--ds-input-lg-height) * 0.2)',
        fontSize: 'var(--ds-font-size-base)',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'calc(var(--ds-icon-sm-size) + 2px)',
      },
      xl: {
        height: 'calc(var(--ds-input-md-height) + 0.875rem)',
        paddingX: 'calc(var(--ds-input-xl-height) * 0.35)',
        paddingY: 'calc(var(--ds-input-xl-height) * 0.2)',
        fontSize: 'var(--ds-font-size-lg)',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'var(--ds-icon-md-size)',
      },
    },

    /**
     * Button rides the same row height as the field, so a control strip lines
     * up without per-screen correction. Buttons take more horizontal room than
     * fields (0.42 of the height against 0.35) because a label needs shoulders
     * where a value does not.
     */
    buttonGeometry: {
      fontWeight: 'var(--ds-font-weight-medium)',
      letterSpacing: 'var(--ds-letter-spacing-body, 0)',
      gap: 'calc(var(--ds-input-md-height) * 0.18)',
      xs: {
        height: 'var(--ds-input-xs-height)',
        paddingX: 'calc(var(--ds-input-xs-height) * 0.42)',
        gap: 'calc(var(--ds-input-xs-height) * 0.18)',
        fontSize: 'var(--ds-font-size-xs)',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'var(--ds-icon-xs-size)',
      },
      sm: {
        height: 'var(--ds-input-sm-height)',
        paddingX: 'calc(var(--ds-input-sm-height) * 0.42)',
        gap: 'calc(var(--ds-input-sm-height) * 0.18)',
        fontSize: 'calc(0.8125rem * var(--ds-type-scale, 1))',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'calc(var(--ds-icon-sm-size) - 2px)',
      },
      md: {
        height: 'var(--ds-input-md-height)',
        paddingX: 'calc(var(--ds-input-md-height) * 0.42)',
        gap: 'calc(var(--ds-input-md-height) * 0.18)',
        fontSize: 'var(--ds-font-size-sm)',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'var(--ds-icon-sm-size)',
      },
      lg: {
        height: 'var(--ds-input-lg-height)',
        paddingX: 'calc(var(--ds-input-lg-height) * 0.42)',
        gap: 'calc(var(--ds-input-lg-height) * 0.18)',
        fontSize: 'var(--ds-font-size-base)',
        lineHeight: 'var(--ds-line-height-tight)',
        iconSize: 'calc(var(--ds-icon-sm-size) + 2px)',
      },
      xl: {
        height: 'var(--ds-input-xl-height)',
        paddingX: 'calc(var(--ds-input-xl-height) * 0.42)',
        gap: 'calc(var(--ds-input-xl-height) * 0.18)',
        fontSize: 'var(--ds-font-size-lg)',
        lineHeight: 'var(--ds-line-height-tight)',
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
      bg: '#131316',
      itemBg: 'transparent',
      itemBgSelected: '#222226',
      itemColor: 'var(--ds-color-text-muted)',
      itemColorHover: '#A0A0A5',
      itemColorSelected: '#ECECEC',
      shadow: '0 1px 2px rgba(0, 0, 0, 0.20)',
    },
    buttonAI: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-shadow-button-hover)",
      shadowActive: "var(--ds-shadow-button-rest)",
    },
    buttonDashed: {
      shadow: "none",
      shadowHover: "var(--ds-button-dashed-shadow)",
      shadowActive: "var(--ds-button-dashed-shadow)",
    },
    buttonPrimary: {
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#FFFFFF', bgHover: '#E0E0E0', bgActive: '#D4D4D8', text: '#0C0C0E', color: '#0C0C0E', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.30)', shadowHover: '0 2px 12px rgba(255, 255, 255, 0.08)' },
    buttonSecondary: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-shadow-button-hover)",
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#2A2A2F', bgHover: '#3A3A40', bgActive: '#4A4A4F', text: '#ECECEC', color: '#ECECEC', border: '#3A3A40', borderHover: 'rgba(255, 255, 255, 0.14)' },
    buttonDefault: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-shadow-button-hover)",
      colorHover: '#ECECEC',
      colorActive: '#ECECEC',
      shadowActive: "var(--ds-shadow-button-rest)", bg: '#18181B', bgHover: '#222226', bgActive: '#2A2A2F', text: '#ECECEC', color: '#ECECEC', border: '#3A3A40', borderHover: 'rgba(255, 255, 255, 0.18)', borderActive: 'rgba(255, 255, 255, 0.22)',
},
    buttonGhost: {
      shadow: "none",
      shadowHover: "var(--ds-button-ghost-shadow)",
      shadowActive: "var(--ds-button-ghost-shadow)", bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', bgActive: 'rgba(255, 255, 255, 0.08)', text: '#A0A0A5', color: '#A0A0A5', colorHover: '#ECECEC',
      colorActive: '#FFFFFF',
      border: 'transparent',
      borderHover: 'transparent',
      borderActive: 'transparent',
},
    buttonText: {
      shadow: "none",
      shadowHover: "var(--ds-button-text-shadow)",
      shadowActive: "var(--ds-button-text-shadow)", bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', bgActive: 'rgba(255, 255, 255, 0.08)', text: '#A0A0A5', color: '#A0A0A5', colorHover: '#ECECEC',
      colorActive: '#FFFFFF',
},
    buttonLink: {
      shadow: "none",
      shadowHover: "var(--ds-button-link-shadow)",
      shadowActive: "var(--ds-button-link-shadow)", color: '#ECECEC', colorHover: '#FFFFFF', colorActive: '#D4D4D8' },
    buttonSuccess: {
      shadow: "var(--ds-shadow-success-sm)",
      shadowHover: "var(--ds-button-success-shadow)",
      shadowActive: "var(--ds-button-success-shadow)", bg: '#16A34A', bgHover: '#15803D', bgActive: '#166534', text: '#ffffff', color: '#ffffff', border: 'transparent' },
    buttonWarning: {
      shadow: "var(--ds-shadow-warning-sm)",
      shadowHover: "var(--ds-button-warning-shadow)",
      shadowActive: "var(--ds-button-warning-shadow)", bg: '#D97706', bgHover: '#B45309', bgActive: '#92400E', text: '#FFFFFF', color: '#FFFFFF', border: 'transparent' },
    buttonError: {
      shadow: "var(--ds-shadow-error-sm)",
      shadowHover: "var(--ds-shadow-error-sm)",
      shadowActive: "var(--ds-shadow-error-sm)", bg: '#EF4444', bgHover: '#DC2626', bgActive: '#B91C1C', text: '#ffffff', color: '#ffffff', border: 'transparent' },
    buttonInfo: {
      shadow: "var(--ds-shadow-button-rest)",
      shadowHover: "var(--ds-button-info-shadow)",
      shadowActive: "var(--ds-button-info-shadow)", bg: '#3B82F6', bgHover: '#2563EB', bgActive: '#1D4ED8', text: '#ffffff', color: '#ffffff', border: 'transparent' },
    disabled: { opacity: 0.4, bg: '#18181B', text: '#52525B', border: '#2A2A2F', borderColor: '#2A2A2F' },
    focusRing: 'var(--ds-focus-ring)',
    /**
     * The focus ring's own colour channel. Authored once here and NOT
     * restated in `modes.light`: it forwards to `--ds-color-primary`, which
     * each mode already re-grounds, so a second authority would only be a
     * chance to disagree with the seed.
     */
    focusRingColor: 'var(--ds-color-primary)',
    /** Textarea and form-field chrome, drained from the extension root block. */
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
      labelColor: '#A0A0A5',
      labelFontWeight: '600',
      helpColor: '#6B6B72',
      extraColor: '#6B6B72',
    },
    input: {
      bg: '#131316',
      bgHover: '#1A1A1E',
      bgFocus: '#131316',
      bgDisabled: '#18181B',
      color: '#ECECEC',
      colorPlaceholder: '#6B6B72',
      colorDisabled: '#52525B',
      border: '#2A2A2F',
      borderHover: '#3A3A40',
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      borderDisabled: '#2A2A2F',
      disabledOpacity: 0.4,
      shadowFocus: '0 0 0 3px rgba(255, 255, 255, 0.10)',
      filled: { bg: '#1A1A1E', bgHover: '#222226', bgFocus: '#1A1A1E' },
      addon: { bg: '#1A1A1E', color: '#6B6B72', border: '#2A2A2F' },
      label: { color: '#A0A0A5' },
      helper: { color: '#6B6B72', errorFontWeight: 'var(--ds-font-weight-medium)' },
      clear: { color: '#6B6B72', colorHover: '#A0A0A5' },
      /**
       * A read-only field in a control plane is a fact, not an empty slot: it
       * carries an id you are about to copy. The DS baseline dashes the border
       * and blocks the caret, which reads as "disabled". Rottay keeps the solid
       * border and the text cursor.
       */
      readOnly: { borderStyle: 'solid', cursor: 'text' },
      successBorder: '#16A34A',
      successShadowFocus: '0 0 0 2px rgba(34, 197, 94, 0.18)',
      warningBorder: '#D97706',
      warningShadowFocus: '0 0 0 2px rgba(245, 158, 11, 0.18)',
      errorBorder: '#EF4444',
      errorShadowFocus: '0 0 0 2px rgba(239, 68, 68, 0.18)',
      errorColor: '#EF4444',
    },
    /**
     * Field and dropdown chrome. MASS C3-BITHIRE-ALL introduced
     * `controls.select` as a closed semantic family, so all three
     * first-party themes author the same keyset.
     *
     * Rottay's extension still declares the rustic-shaped `--ds-select-border*`
     * spelling; the values below are the ones this brand resolves TODAY, so
     * the compiled block adds no divergence and the rottay drain tranche can
     * delete those extension rows without a paint change. The `borderColor*`,
     * `bgHover`, `bgFocus`, `dropdownBorderColor` and `optionColor` channels
     * had no brand row at all and carry the DS baseline expression they
     * currently fall through to.
     */
    select: {
      bg: '#131316',
      bgHover: 'var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))',
      bgFocus: 'var(--ds-surface-control, var(--ds-color-bg-input, var(--ds-color-white)))',
      color: '#ECECEC',
      colorPlaceholder: '#6B6B72',
      borderColor: 'var(--ds-color-neutral-300)',
      borderColorHover: 'var(--ds-color-neutral-400)',
      borderColorFocus: 'var(--ds-color-primary-500)',
      dropdownBg: '#1A1A1E',
      dropdownBorderColor: 'var(--ds-color-neutral-200)',
      dropdownShadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
      optionBgHover: 'rgba(255, 255, 255, 0.04)',
      optionBgSelected: '#2A2A2F',
      optionColor: 'var(--ds-color-neutral-900)',
      optionColorSelected: '#ECECEC',
      // ROTTAY-T2 MASS: the eighteen select channels drained from the artifact.
      // `border` is the artifact's `--ds-select-border` and is a different
      // channel from `borderColor` (`--ds-select-border-color`) above.
      arrowColor: '#6B6B72',
      bgDisabled: '#101012',
      border: '#2A2A2F',
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      borderHover: '#3A3A40',
      checkColor: '#FFFFFF',
      clearColor: '#6B6B72',
      clearColorHover: '#A0A0A5',
      colorDisabled: '#4A4A4F',
      dropdownBorder: '#2A2A2F',
      filledBg: '#1A1A1E',
      optionColorDisabled: '#4A4A4F',
      shadowFocus: '0 0 0 2px rgba(255, 255, 255, 0.10)',
      successBorder: '#16A34A',
      tagBg: '#2A2A2F',
      tagColor: '#A0A0A5',
      warningBorder: '#D97706',
    },
    /**
     * ROTTAY-T2 MASS. Twelve control families drained from the artifact
     * extension into the typed Theme. Dark is the authored default, so every
     * body row below is the exact literal the extension painted in the dark
     * block; `modes.light` restates only what diverges. Channels whose paint
     * the cascade already resolves identically (36 rows from `default.css`
     * plus 5 component `:root` floors) carry no field at all; that is why
     * `inputNumber.controlBg` and `rate`'s active/hover rows are absent.
     * `rate` rides in this tranche because its channels are authored inside
     * the same control block of the artifact, even though the family
     * inventory files it under feedback.
     */
    autocomplete: {
      bg: '#131316',
      border: '#2A2A2F',
      borderFocus: 'rgba(255, 255, 255, 0.36)',
      clearColor: '#6B6B72',
      dropdownBg: '#1A1A1E',
      dropdownShadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
      emptyColor: '#6B6B72',
      optionBgHover: 'rgba(255, 255, 255, 0.04)',
      warningBorder: '#D97706',
    },
    checkbox: {
      bg: '#131316',
      bgDisabled: '#101012',
      border: 'rgba(255, 255, 255, 0.18)',
      borderHover: 'rgba(255, 255, 255, 0.28)',
      checkedBg: '#FFFFFF',
      checkedBorder: '#FFFFFF',
      checkedColor: '#0C0C0E',
      errorBorder: '#EF4444',
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      focusRingColor: 'rgba(255, 255, 255, 0.12)',
      labelColor: '#ECECEC',
      labelColorDisabled: '#4A4A4F',
    },
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
      bg: '#131316',
      bgDisabled: '#101012',
      border: 'rgba(255, 255, 255, 0.18)',
      borderHover: 'rgba(255, 255, 255, 0.28)',
      checkedBg: '#131316',
      checkedBorder: '#FFFFFF',
      checkedDot: '#FFFFFF',
      descriptionColor: '#6B6B72',
      errorBorder: '#EF4444',
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      focusRingColor: 'rgba(255, 255, 255, 0.12)',
      labelColor: '#ECECEC',
      labelColorDisabled: '#4A4A4F',
    },
    rate: {
      color: '#4A4A4F',
    },
    slider: {
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      handleBg: '#FFFFFF',
      handleBgDisabled: '#4A4A4F',
      handleBorder: '#0C0C0E',
      handleShadow: '0 1px 3px rgba(0, 0, 0, 0.40)',
      markColor: '#6B6B72',
      railColor: 'rgba(255, 255, 255, 0.10)',
      trackColor: '#FFFFFF',
      trackColorDisabled: '#4A4A4F',
    },
    switch: {
      bg: 'rgba(255, 255, 255, 0.14)',
      bgHover: 'rgba(255, 255, 255, 0.18)',
      checkedBg: '#FFFFFF',
      checkedBgHover: '#E0E0E0',
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      labelColor: '#ECECEC',
      thumbBg: '#0C0C0E',
      thumbShadow: '0 1px 2px rgba(0, 0, 0, 0.30)',
    },
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
      descriptionColor: '#6B6B72',
      dotBg: '#0C0C0E',
      dotShadow: '0 1px 2px rgba(0, 0, 0, 0.30)',
      errorBg: '#EF4444',
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      innerLabelColor: '#0C0C0E',
      labelColor: '#ECECEC',
      successBg: '#22C55E',
      trackBg: 'rgba(255, 255, 255, 0.14)',
      trackBgChecked: '#FFFFFF',
      warningBg: '#F59E0B',
    },
    transfer: {
      bg: '#18181B',
      border: '#2A2A2F',
      headerBg: '#131316',
      headerBorder: '#2A2A2F',
      itemBgHover: 'rgba(255, 255, 255, 0.04)',
    },
    upload: {
      bg: '#131316',
      border: 'rgba(255, 255, 255, 0.10)',
      borderHover: 'rgba(255, 255, 255, 0.20)',
      buttonBg: '#131316',
      buttonBorder: '#2A2A2F',
      buttonColor: '#A0A0A5',
      cardBg: '#1A1A1E',
      cardBorder: '#2A2A2F',
      draggerBg: '#131316',
      draggerBgHover: '#1A1A1E',
      draggerBorder: '#2A2A2F',
      draggerBorderActive: '#FFFFFF',
      draggerIconColor: '#6B6B72',
      draggerTextColor: '#A0A0A5',
      errorBorder: '#EF4444',
      fileBg: '#1A1A1E',
      fileColor: '#A0A0A5',
      fileRemoveColor: '#EF4444',
      previewBackdrop: 'rgba(0, 0, 0, 0.70)',
      previewOverlay: 'rgba(0, 0, 0, 0.50)',
      progressBar: 'var(--ds-color-primary)',
      progressTrack: '#222226',
    },
  },
  /**
   * Shared card/panel surface algebra. New in MASS C3-BITHIRE-ALL; Rottay has
   * no brand divergence here yet, so every value is the expression this brand
   * resolves today from the DS baseline. Authoring the keyset makes the family
   * a real cross-vertical capability instead of a BitHire-only appendage.
   */
  surface: {
    /**
     * Page-level scrims, gradients and watermark ink, drained from the
     * artifact extension root block.
     */
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
   * Rich-card frame and banded interior. Same tranche, same rule: the keyset
   * is shared with BitHire and Evnto; the values are Rottay's current
   * resolution, so nothing repaints.
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
  table: {
    bg: '#0C0C0E',
    border: '#2A2A2F',
    headerBg: '#131316',
    headerColor: '#A0A0A5',
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
    /**
     * The header is a fixed rail on the control ladder rather than `auto`, so a
     * table lines up with the toolbar controls above it.
     */
    headerBlockSize: 'calc(var(--ds-input-md-height) - 0.25rem)',
    /**
     * 0.08em is eyebrow tracking for a two-word label. A data header is read in
     * columns, not as prose; three quarters of the eyebrow keeps the channel and
     * closes the letters up.
     */
    headerLetterSpacing: 'calc(var(--ds-text-eyebrow-letter-spacing, 0.08em) * 0.75)',
    /** No sheen. The baseline gradient is transparent-to-transparent anyway. */
    sheen: 'none',
  },
  cardComponent: {
    /**
     * One padding ladder. The DS ships two that disagree — `--ds-card-{size}-padding`
     * (12/16/24/32) and `--ds-card-padding-{size}` (16/20/28/40) — and a card
     * gets whichever its skin happens to read. `paddingSm..Xl` writes both names
     * from one field, so Rottay has a single answer, and each step sits on the
     * spacing ramp so the density dial reaches it.
     */
    paddingSm: 'var(--ds-spacing-3)',
    paddingMd: 'var(--ds-spacing-4)',
    paddingLg: 'var(--ds-spacing-5)',
    paddingXl: 'var(--ds-spacing-6)',
    headerPadding: 'var(--ds-spacing-4) var(--ds-spacing-4) var(--ds-spacing-3)',
    bodyPadding: 'var(--ds-spacing-4)',
    footerPadding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
    /** A console card title names a panel; it is a label, not a headline. */
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
    subtitleColor: '#A0A0A5',
    bodyColor: '#A0A0A5',
    footerBorder: '#2A2A2F',
    footerBg: '#101012',
        imagePlaceholderBg: '#1A1A1E',
    imagePlaceholderColor: '#6B6B72',
    imageLoadingTrack: '#222226',
    imageLoadingActive: '#ECECEC',
},
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
    bodyColor: '#A0A0A5',
    footerBorder: '#2A2A2F',
    footerBg: '#1A1A1E',
    closeColor: '#6B6B72',
    closeColorHover: '#ECECEC',
    closeBgHover: 'rgba(255, 255, 255, 0.05)',
  },
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
  anchor: {
    inkColor: '#FFFFFF',
    linkColor: '#6B6B72',
    linkColorActive: '#ECECEC',
  },
  avatar: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    defaultBg: '#2A2A2F',
    defaultColor: '#A0A0A5',
    errorBg: 'rgba(239, 68, 68, 0.14)',
    errorColor: '#EF4444',
    gradientBg: 'linear-gradient(135deg, #ECECEC 0%, #6B6B72 100%)',
    gradientColor: '#0C0C0E',
    groupBorder: '#18181B',
    groupOverflowBg: '#2A2A2F',
    groupOverflowColor: '#A0A0A5',
    primaryBg: '#FFFFFF',
    primaryColor: '#0C0C0E',
    ringColor: '#FFFFFF',
    secondaryBg: '#2A2A2F',
    secondaryColor: '#A0A0A5',
    statusBorder: '#18181B',
    successBg: 'rgba(34, 197, 94, 0.14)',
    successColor: '#22C55E',
    warningBg: 'rgba(245, 158, 11, 0.14)',
    warningColor: '#F59E0B',
  },
  backTop: {
    bg: '#FFFFFF',
    color: '#0C0C0E',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.30)',
  },
  calendar: {
    bg: '#1A1A1E',
    border: '#2A2A2F',
    dayColorOther: '#4A4A4F',
    headerColor: '#ECECEC',
  },
  collapse: {
    bg: '#131316',
    border: '#2A2A2F',
    contentBg: '#1A1A1E',
    headerBg: '#131316',
    headerBgHover: '#1A1A1E',
    headerColor: '#ECECEC',
  },
  descriptions: {
    bg: '#131316',
    border: '#2A2A2F',
    contentColor: '#ECECEC',
    labelColor: '#6B6B72',
  },
  drawer: {
    bg: '#1A1A1E',
    bodyColor: '#A0A0A5',
    footerBorder: '#2A2A2F',
    headerBorder: '#2A2A2F',
    shadow: '0 16px 48px rgba(0, 0, 0, 0.50)',
    titleColor: '#ECECEC',
  },
  dropdown: {
    bg: '#1A1A1E',
    itemBgActive: '#2A2A2F',
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    itemColor: '#A0A0A5',
    itemColorActive: '#ECECEC',
    itemColorHover: '#ECECEC',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
  },
  empty: {
    descriptionColor: '#6B6B72',
    iconColor: '#4A4A4F',
  },
  floatButton: {
    badgeBg: '#EF4444',
    badgeColor: '#ffffff',
    defaultBg: '#222226',
    defaultColor: '#A0A0A5',
    descriptionColor: '#A0A0A5',
    primaryBg: 'var(--ds-color-primary)',
    primaryColor: '#0C0C0E',
  },
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
    refreshColor: '#A0A0A5',
    skeletonBg: '#2A2A2F',
  },
  menu: {
    bg: '#0C0C0E',
    darkBg: '#0C0C0E',
    darkItemColor: '#A0A0A5',
    dividerColor: '#2A2A2F',
    focusRingColor: 'var(--ds-color-primary)',
    groupTitleColor: '#6B6B72',
    itemBgActive: '#2A2A2F',
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    itemColor: '#A0A0A5',
    itemColorActive: '#ECECEC',
    itemColorHover: '#ECECEC',
    itemDangerColor: '#EF4444',
    itemHoverBg: 'rgba(255, 255, 255, 0.04)',
    itemSelectedBg: '#2A2A2F',
    itemSelectedColor: '#ECECEC',
    submenuBg: '#131316',
  },
  message: {
    bg: '#1A1A1E',
    closeColor: '#6B6B72',
    closeColorHover: '#ECECEC',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.40), 0 0 0 1px #2A2A2F',
  },
  notification: {
    bg: '#1A1A1E',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.50), 0 0 0 1px #2A2A2F',
    titleColor: '#ECECEC',
  },
  pagination: {
    activeBg: '#FFFFFF',
    activeColor: '#0C0C0E',
    itemBg: 'transparent',
    itemBgActive: '#FFFFFF',
    itemBgHover: 'rgba(255, 255, 255, 0.04)',
    itemBorder: 'transparent',
    itemColor: '#A0A0A5',
    itemColorActive: '#0C0C0E',
    itemColorHover: '#ECECEC',
  },
  progress: {
    bg: '#2A2A2F',
    fillError: '#EF4444',
    fillPrimary: '#FFFFFF',
    fillSuccess: '#22C55E',
    fillWarning: '#F59E0B',
  },
  result: {
    iconColor: '#0C0C0E',
    subtitleColor: '#6B6B72',
    titleColor: '#ECECEC',
  },
  skeleton: {
    bg: '#1A1A1E',
    highlight: '#2A2A2F',
    waveGradient: 'linear-gradient(90deg, #1A1A1E 25%, #2A2A2F 50%, #1A1A1E 75%)',
  },
  spinner: {
    color: 'var(--ds-color-primary)',
    track: '#2A2A2F',
  },
  statistic: {
    prefixColor: '#A0A0A5',
    suffixColor: '#A0A0A5',
    titleColor: '#A0A0A5',
    valueColor: '#ECECEC',
  },
  statsGrid: {
    cardBg: '#18181B',
    cardBorder: '#2A2A2F',
    cardFilledBg: '#1A1A1E',
    cardGlassBg: 'rgba(255, 255, 255, 0.04)',
    cardGlassBorder: '#2A2A2F',
    descriptionColor: '#6B6B72',
    labelColor: '#A0A0A5',
    skeletonBg: '#2A2A2F',
    skeletonWaveGradient: 'linear-gradient( 90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 37%, rgba(255, 255, 255, 0.04) 63% )',
    trendNegative: '#EF4444',
    trendNeutral: '#6B6B72',
    trendPositive: '#22C55E',
    valueColor: '#ECECEC',
  },
  steps: {
    connectorColor: '#2A2A2F',
    connectorColorActive: '#FFFFFF',
    finishBg: '#22C55E',
    finishBorder: '#22C55E',
    itemBg: '#2A2A2F',
    itemBgActive: '#FFFFFF',
    itemColor: '#6B6B72',
    itemColorActive: '#0C0C0E',
    processBg: '#FFFFFF',
    processBorder: '#FFFFFF',
    waitBg: 'transparent',
    waitBorder: 'rgba(255, 255, 255, 0.14)',
  },
  tag: {
    border: '#2A2A2F',
    defaultBg: '#222226',
    defaultBorder: '#2A2A2F',
    defaultColor: '#A0A0A5',
    errorBg: 'rgba(239, 68, 68, 0.12)',
    errorBorder: 'rgba(239, 68, 68, 0.22)',
    errorColor: '#F87171',
    primaryBg: '#FFFFFF',
    primaryBorder: '#FFFFFF',
    primaryColor: '#0C0C0E',
    secondaryBg: '#222226',
    secondaryBorder: '#2A2A2F',
    secondaryColor: '#A0A0A5',
    successBg: 'rgba(34, 197, 94, 0.12)',
    successBorder: 'rgba(34, 197, 94, 0.22)',
    successColor: '#34D399',
    warningBg: 'rgba(245, 158, 11, 0.12)',
    warningBorder: 'rgba(245, 158, 11, 0.22)',
    warningColor: '#FBBF24',
  },
  timeline: {
    contentColor: '#A0A0A5',
    dotBg: '#FFFFFF',
    dotBorder: '#18181B',
    lineColor: '#2A2A2F',
  },
  tree: {
    nodeBgHover: 'rgba(255, 255, 255, 0.04)',
    nodeBgSelected: '#2A2A2F',
    nodeColor: '#A0A0A5',
    nodeColorSelected: '#ECECEC',
  },
};

// ── CAPABILITIES ──
/**
 * Explicit disposition for every optional capability family.
 *
 * The three first-party themes previously disagreed on which of these keys
 * existed at all — rottay had `recipes` but no `expressive`, bithire had
 * both, evnto had neither — and nothing distinguished "this vertical ships
 * no expressive selection" from "nobody got round to authoring one". These
 * entries say which it is.
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

export const rottayBrandTheme: FirstPartyBrandTheme = {
  id: THEME_ID,
  name: THEME_NAME,

  // appearance — which mode the authored decisions above ARE.
  appearance: { defaultMode: DEFAULT_MODE },

  // modes — the other mode, as a typed overlay the compiler merges and diffs.
  modes: { [OVERLAY_MODE]: OVERLAY },

  // recipes — governed recipe-profile selection (DS-S001).
  recipes: RECIPES,

  // expressive — governed expressive-profile selection (C1b).
  // expressive: not authored — capabilities.expressive states why.

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
