/**
 * Evnto first-party vertical theme.
 *
 * Premium wallet/fintech experience. White-first, black text, rounded,
 * fluid, safe, modern. Smooth reassuring transitions, soft spring.
 *
 * H4 brief: move away from beige/editorial warmth. Become more clearly
 * wallet/fintech. Strengthen card/object feeling. Improve motion polish.
 *
 * Source data: vertical registry (evnto), personality preset (playful),
 * tenant CSS (tokens/css/artifacts/evnto/index.css).
 */

import type { BrandTheme } from '../../../contracts/themes';

export const evntoBrandTheme: BrandTheme = {
  id: 'evnto',
  name: 'Evnto',

  palette: {
    // H4: white + cool grays, deep charcoal, restrained financial green
    primaryColor: '#171717',
    secondaryColor: '#B8A898',
    accentColor: '#06b6d4',
    darkPrimaryColor: '#F5F5F5',
    darkSecondaryColor: '#D4C4B0',
    darkAccentColor: '#22D3EE',
    darkBackgroundColor: '#171717',
    // Semantic: financial-appropriate
    successColor: '#16A34A',
    warningColor: '#EAB308',
    errorColor: '#DC2626',
    infoColor: '#0EA5E9',
  },

  typography: {
    fontFamilyBase: 'var(--font-geist-sans)',
    fontFamilyHeading: 'var(--font-geist-sans)',
    fontFamilyMono: 'var(--font-geist-mono)',
    headingWeightBias: 'heavier',
    headingLetterSpacing: '-0.02em',
    labelStyle: 'capitalize',
  },

  surfaces: {
    densityScale: 1.125,
    // H4: largest radii of the three brands
    borderRadius: { sm: '10px', md: '14px', lg: '18px', xl: '24px' },
    // H4: softer shadows, more tactile containers
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
      md: '0 4px 12px rgba(0, 0, 0, 0.06)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.1)',
    },
    // H4: subtle glass possible, no gradients, soft overlays
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
    // H4: lighter shell and navigation feel
    layout: {
      bg: '#FFFFFF',
      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerBackdrop: 'blur(10px)',
      headerBorder: 'rgba(0, 0, 0, 0.06)',
      siderBg: '#FAFAFA',
      siderBorder: 'rgba(0, 0, 0, 0.06)',
    },
    // Evnto: intentionally minimal shell (clean wallet feel)
    shell: {
      gridSize: '0px',
      gridLine: 'transparent',
      gridOpacity: 0,
    },
    controls: {
      // H4: high clarity, soft curves, money-state feedback
      buttonPrimary: { bg: '#171717', bgHover: '#262626', text: '#ffffff', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
      buttonSecondary: { bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.04)', text: '#171717', border: 'rgba(0, 0, 0, 0.15)' },
      buttonDefault: { bg: '#FFFFFF', bgHover: '#FAFAFA', text: '#171717', border: 'rgba(0, 0, 0, 0.1)' },
      buttonGhost: { bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.03)', text: '#525252' },
      input: { bg: '#ffffff', border: 'rgba(0, 0, 0, 0.12)', borderFocus: '#171717', shadowFocus: '0 0 0 1px rgba(23, 23, 23, 0.2)' },
      disabled: { opacity: 0.4, bg: '#FAFAFA', text: 'rgba(0, 0, 0, 0.25)', border: 'rgba(0, 0, 0, 0.06)' },
    },
    table: {
      headerBg: 'rgba(0, 0, 0, 0.02)',
      headerColor: '#737373',
      headerFontWeight: 500,
      headerFontSize: '0.75rem',
    },
  },
};
