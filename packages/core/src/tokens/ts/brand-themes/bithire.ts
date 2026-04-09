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
  },
};
