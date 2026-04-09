/**
 * BitHire first-party brand theme.
 *
 * Light, LinkedIn-inspired corporate aesthetic. Indigo/blue primary,
 * formal animations, compact density, data-dense workflows.
 *
 * Source data: vertical registry (bithire), personality preset (formal),
 * tenant CSS (tokens/css/tenants/bithire/index.css).
 */

import type { BrandTheme } from '../../../contracts/themes';

export const bithireBrandTheme: BrandTheme = {
  id: 'bithire',
  name: 'BitHire',

  palette: {
    primaryColor: '#0A66C2',
    secondaryColor: '#004182',
    accentColor: '#7FC15E',
    darkPrimaryColor: '#4D9DE0',
    darkSecondaryColor: '#1A73E8',
    darkBackgroundColor: '#1B1B1F',
    successColor: '#057642',
    warningColor: '#C37D16',
    errorColor: '#CC1016',
    infoColor: '#0A66C2',
  },

  typography: {
    fontFamilyBase: 'var(--font-geist-sans)',
    fontFamilyHeading: 'var(--font-geist-sans)',
    fontFamilyMono: 'var(--font-geist-mono)',
    headingWeightBias: 'heavier',
    headingLetterSpacing: '-0.01em',
    labelStyle: 'uppercase',
  },

  surfaces: {
    densityScale: 0.95,
  },

  motion: {
    intensity: 0.4,
    entrance: 'fade',
    entranceDuration: 150,
    hoverLift: 0,
    hoverScale: 1.0,
    useSpring: false,
    springTension: 170,
    springFriction: 26,
    staggerDelay: 30,
    staggerMax: 200,
    pulseSpeed: 'slow',
    skeletonStyle: 'pulse',
    countUpEnabled: true,
  },

  charts: {
    animateOnMount: true,
    mountDuration: 400,
    lineStyle: 'sharp',
    showDots: true,
    useGradientFill: false,
    tooltipStyle: 'detailed',
  },

  chrome: {
    card: {
      defaultElevation: 'sm',
      hoverElevation: 'lift-one',
      showBorder: true,
      hoverTint: false,
      paddingDensity: 'compact',
    },
    accent: {
      barPosition: 'left',
      barThickness: 3,
      barStyle: 'solid',
      iconContainerShape: 'circle',
      badgeShape: 'pill',
      dividerStyle: 'solid',
    },
    sidebar: {
      bg: '#ffffff',
      border: 'rgba(0, 0, 0, 0.08)',
      text: 'rgba(0, 0, 0, 0.9)',
      textMuted: 'rgba(0, 0, 0, 0.55)',
      groupFontSize: '11px',
      groupFontWeight: 600,
      groupColor: 'rgba(0, 0, 0, 0.55)',
      groupLetterSpacing: '0.04em',
      itemFontSize: '13px',
      itemFontWeight: 400,
      itemFontWeightActive: 500,
      itemColor: 'rgba(0, 0, 0, 0.65)',
      itemColorActive: '#0A66C2',
      itemBgActive: 'rgba(10, 102, 194, 0.08)',
      itemBgHover: 'rgba(0, 0, 0, 0.04)',
      itemPadding: '6px 10px',
      iconSize: '16px',
    },
    controls: {
      buttonPrimary: { bg: '#0A66C2', bgHover: '#004182', text: '#ffffff' },
      buttonSecondary: { bg: 'transparent', bgHover: 'rgba(10, 102, 194, 0.08)', text: '#0A66C2', border: '#0A66C2' },
      input: { bg: '#ffffff', border: 'rgba(0, 0, 0, 0.15)', borderFocus: '#0A66C2', shadowFocus: '0 0 0 1px #0A66C2' },
    },
    table: {
      headerBg: '#f3f2ef',
      headerColor: 'rgba(0, 0, 0, 0.6)',
      headerFontWeight: 600,
      headerFontSize: '0.75rem',
    },
  },
};
