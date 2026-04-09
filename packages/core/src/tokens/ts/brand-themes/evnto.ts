/**
 * Evnto first-party brand theme.
 *
 * Light-first, minimal editorial aesthetic. Near-black text on white,
 * warm beige/sand accents. Bouncy animations, spacious layout.
 *
 * Source data: vertical registry (evnto), personality preset (playful),
 * tenant CSS (tokens/css/tenants/evnto/index.css).
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
  },
};
