/**
 * Evnto first-party vertical theme.
 *
 * Premium wallet/fintech experience. White-first, black text, rounded,
 * fluid, safe, modern. Smooth reassuring transitions, soft spring.
 *
 * Design: Minimal light-first. Black primary on white canvas.
 * Warm beige/sand accents. Largest border radius of all brands.
 *
 * Source: tokens/css/artifacts/evnto/index.css (canonical visual reference).
 * This file MUST stay in sync with the CSS artifact.
 */

import type { BrandTheme } from '../../../contracts/themes';

export const evntoBrandTheme: BrandTheme = {
  id: 'evnto',
  name: 'Evnto',

  palette: {
    primaryColor: '#171717',
    secondaryColor: '#B8A898',
    accentColor: '#B8A898',
    darkPrimaryColor: '#E8E8E0',
    darkSecondaryColor: '#A89880',
    darkAccentColor: '#A89880',
    darkBackgroundColor: '#131210',
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

  surfaces: {
    densityScale: 1.125,
    borderRadius: { sm: '10px', md: '14px', lg: '18px', xl: '24px' },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
      md: '0 4px 12px rgba(0, 0, 0, 0.06)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.1)',
    },
    glass: { blur: 'none', background: 'none', border: 'none' },
    gradients: { primary: 'none', surface: 'none', mesh: 'none' },
    overlays: {
      light: 'rgba(0, 0, 0, 0.01)',
      medium: 'rgba(0, 0, 0, 0.03)',
      heavy: 'rgba(0, 0, 0, 0.06)',
    },
  },

  motion: {
    intensity: 1.5,
    entrance: 'bounce',
    entranceDuration: 500,
    hoverLift: 4,
    hoverScale: 1.03,
    useSpring: true,
    springTension: 200,
    springFriction: 18,
    staggerDelay: 80,
    staggerMax: 600,
    pulseSpeed: 'fast',
    skeletonStyle: 'wave',
    countUpEnabled: true,
  },

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
