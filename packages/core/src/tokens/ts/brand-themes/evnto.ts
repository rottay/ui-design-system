/**
 * Evnto first-party brand theme.
 *
 * Light-first, minimal editorial aesthetic. Near-black text on white,
 * warm beige/sand accents. Bouncy animations, spacious layout.
 *
 * Source data: vertical registry (evnto), personality preset (playful),
 * tenant CSS (tokens/css/artifacts/evnto/index.css).
 */

import type { BrandTheme } from '../../../contracts/themes';

export const evntoBrandTheme: BrandTheme = {
  id: 'evnto',
  name: 'Evnto',

  palette: {
    primaryColor: '#171717',
    secondaryColor: '#B8A898',
    accentColor: '#06b6d4',
    darkPrimaryColor: '#F5F5F5',
    darkSecondaryColor: '#D4C4B0',
    darkBackgroundColor: '#171717',
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
    borderRadius: {
      sm: '10px',
      md: '14px',
      lg: '18px',
      xl: '24px',
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
    controls: {
      buttonPrimary: { bg: '#171717', bgHover: '#262626', text: '#ffffff' },
      buttonSecondary: { bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.04)', text: '#171717', border: 'rgba(0, 0, 0, 0.15)' },
      input: { bg: '#ffffff', border: 'rgba(0, 0, 0, 0.12)', borderFocus: '#171717', shadowFocus: '0 0 0 1px rgba(23, 23, 23, 0.2)' },
    },
    table: {
      headerBg: 'rgba(0, 0, 0, 0.02)',
    },
  },
};
