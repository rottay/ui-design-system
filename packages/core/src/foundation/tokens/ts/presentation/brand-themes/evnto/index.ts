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
 */

import type { BrandTheme } from '../../../../../contracts/composition/tenants/themes';
import {
  EVNTO_CANONICAL_MOTION,
  EVNTO_CANONICAL_SURFACES,
} from '@/foundation/presets/policy/experience-baselines/evnto';

export const evntoBrandTheme: BrandTheme = {
  id: 'evnto',
  name: 'Evnto',

  appearance: { defaultMode: 'light' },

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
  modes: {
    dark: {
      palette: {
        primaryColor: "#E8E8E0",
        onPrimaryColor: "#131210",
        primaryForegroundColor: "#131210",
        primaryHoverColor: "#F0F0E8",
        secondaryColor: "#A89880",
        secondaryHoverColor: "#B8A890",
        accentColor: "#A89880",
        backgroundColor: "#131210",
        backgroundSecondaryColor: "#1C1A16",
        backgroundTertiaryColor: "#24221C",
        backgroundElevatedColor: "#2A2820",
        textPrimaryColor: "#E8E8E0",
        textSecondaryColor: "#A8A898",
        textMutedColor: "#686858",
        textDisabledColor: "#484838",
        borderPrimaryColor: "#2E2C24",
        borderSecondaryColor: "#222018",
        borderFocusColor: "#A89880",
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
      surfaces: {
        borderRadius: {
          full: "9999px",
        },
      },
      chrome: {
        controls: {
          buttonPrimary: {
            bg: "#E8E8E0",
            color: "#131210",
          },
          buttonSecondary: {
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
          },
        },
        cardComponent: {
          bg: "#1C1A16",
          border: "#2E2C24",
        },
        layout: {
          bg: "#131210",
          headerBg: "rgba(19, 18, 16, 0.92)",
          headerBorder: "#2E2C24",
          siderBg: "#0E0D0B",
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
    },
  },

  palette: {
    primaryColor: '#171717',
    secondaryColor: '#7A6A5A',
    accentColor: '#7A6A5A',
    darkPrimaryColor: '#E8E8E0',
    darkSecondaryColor: '#A89880',
    darkAccentColor: '#A89880',
    backgroundColor: '#FFFFFF',
    backgroundSecondaryColor: '#fafafa',
    backgroundTertiaryColor: '#f5f5f5',
    backgroundElevatedColor: '#ffffff',
    darkBackgroundColor: '#131210',
    onPrimaryColor: '#ffffff',
    successColor: '#15803D',
    warningColor: '#A16207',
    errorColor: '#B91C1C',
    infoColor: '#475569',
  },

  typography: {
    fontFamilyBase: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyHeading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'SF Mono', 'Fira Code', Menlo, monospace",
    fontFamilyDisplay: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
  },

  surfaces: EVNTO_CANONICAL_SURFACES,

  motion: EVNTO_CANONICAL_MOTION,

  charts: {
    animateOnMount: true,
    mountDuration: 1200,
    lineStyle: 'smooth',
    showDots: true,
    useGradientFill: true,
    tooltipStyle: 'detailed',
  },

  chrome: {
    card: {
      defaultElevation: 'md',
      hoverElevation: 'lift-two',
      showBorder: false,
      hoverTint: true,
      paddingDensity: 'spacious',
    },
    accent: {
      barPosition: 'top',
      barThickness: 4,
      barStyle: 'animated',
      iconContainerShape: 'circle',
      badgeShape: 'pill',
      dividerStyle: 'dashed',
    },
    sidebar: {
      bg: '#fafafa',
      text: '#171717',
      textMuted: '#525252',
      groupFontSize: '11px',
      groupFontWeight: 600,
      groupColor: '#737373',
      groupLetterSpacing: '0.04em',
      itemFontSize: '14px',
      itemFontWeight: 400,
      itemFontWeightActive: 500,
      itemColor: '#3d3d3d',
      itemColorActive: '#171717',
      itemBgActive: 'rgba(0, 0, 0, 0.06)',
      itemBgHover: 'rgba(0, 0, 0, 0.03)',
      itemPadding: '8px 12px',
      iconSize: '18px',
    },
    layout: {
      bg: '#FFFFFF',
      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerBackdrop: 'blur(10px)',
      headerBorder: 'rgba(0, 0, 0, 0.06)',
      siderBg: '#FAFAFA',
      siderBorder: 'rgba(0, 0, 0, 0.06)',
    },
    shell: {
      gridSize: '0px',
      gridLine: 'transparent',
      gridOpacity: 0,
    },
    controls: {
      buttonPrimary: { bg: '#171717', bgHover: '#262626', text: '#ffffff', color: '#ffffff', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
      buttonSecondary: { bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.04)', text: '#171717', color: '#171717', border: 'rgba(0, 0, 0, 0.15)' },
      buttonDefault: { bg: '#FFFFFF', bgHover: '#FAFAFA', text: '#171717', color: '#171717', border: 'rgba(0, 0, 0, 0.1)' },
      buttonGhost: { bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.03)', text: '#525252', color: '#525252' },
      disabled: { opacity: 0.4, bg: '#FAFAFA', text: 'rgba(0, 0, 0, 0.25)', border: 'rgba(0, 0, 0, 0.06)', borderColor: 'rgba(0, 0, 0, 0.06)' },
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
    },
    table: {
      headerBg: 'rgba(0, 0, 0, 0.02)',
      headerColor: '#737373',
      headerFontWeight: 500,
      headerFontSize: '0.75rem',
    },
    cardComponent: {
      bg: '#ffffff',
      border: 'rgba(0, 0, 0, 0.08)',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      shadowHover: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  },
};
