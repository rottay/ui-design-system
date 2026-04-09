/**
 * Rottay first-party brand theme.
 *
 * Dark-first, premium SaaS aesthetic. White accents on near-black canvas.
 * Spring animations, gradient accents, glass tooltips, medium hover lift.
 *
 * Source data: vertical registry (platform), personality preset (expressive),
 * tenant CSS (tokens/css/tenants/rottay/index.css).
 */

import type { BrandTheme } from '../../../contracts/themes';

export const rottayBrandTheme: BrandTheme = {
  id: 'rottay',
  name: 'Rottay',

  palette: {
    primaryColor: '#6366F1',
    secondaryColor: '#A1A1AA',
    accentColor: '#14B8A6',
    darkPrimaryColor: '#818CF8',
    darkSecondaryColor: '#A1A1AA',
    darkBackgroundColor: '#0C0C0E',
  },

  typography: {
    fontFamilyBase: 'var(--font-geist-sans)',
    fontFamilyHeading: 'var(--font-geist-sans)',
    fontFamilyMono: 'var(--font-geist-mono)',
    headingWeightBias: 'normal',
    headingLetterSpacing: '-0.025em',
    labelStyle: 'sentence',
  },

  surfaces: {
    densityScale: 1.0,
  },

  motion: {
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
  },

  charts: {
    animateOnMount: true,
    mountDuration: 800,
    lineStyle: 'smooth',
    showDots: false,
    useGradientFill: true,
    tooltipStyle: 'glass',
  },

  chrome: {
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
  },
};
