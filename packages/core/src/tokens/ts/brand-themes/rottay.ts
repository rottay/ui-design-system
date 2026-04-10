/**
 * Rottay first-party brand theme.
 *
 * Dark-first, premium SaaS aesthetic. White accents on near-black canvas.
 * Spring animations, gradient accents, glass tooltips, medium hover lift.
 *
 * Source data: vertical registry (platform), personality preset (expressive),
 * tenant CSS (tokens/css/artifacts/rottay/index.css).
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
      itemFontSize: '16.35px',
      itemFontWeight: 450,
      itemFontWeightActive: 600,
      itemColor: '#A0A0A5',
      itemColorActive: '#FFFFFF',
      itemBgActive: 'rgba(255, 255, 255, 0.07)',
      itemBgHover: 'rgba(255, 255, 255, 0.04)',
      itemPadding: '0 13px',
      iconSize: '17.25px',
      footerBg: '#0D0D10',
    },
    layout: {
      bg: '#0C0C0E',
      headerBg: 'rgba(12, 12, 14, 0.82)',
      headerBackdrop: 'blur(12px)',
      headerBorder: 'rgba(255, 255, 255, 0.05)',
      siderBg: '#0D0D10',
      siderBorder: '#18181C',
    },
    shell: {
      gridSize: '28px',
      gridLine: 'rgba(255, 255, 255, 0.03)',
      gridOpacity: 0.9,
    },
    controls: {
      buttonPrimary: { bg: '#FFFFFF', bgHover: '#E0E0E0', text: '#0C0C0E', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.30)' },
      buttonSecondary: { bg: '#2A2A2F', bgHover: '#3A3A40', text: '#ECECEC', border: '#3A3A40' },
      buttonDefault: { bg: '#18181B', bgHover: '#222226', text: '#ECECEC', border: '#3A3A40' },
      buttonGhost: { bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', text: '#A0A0A5' },
    },
    table: {
      headerBg: '#131316',
      headerColor: '#A0A0A5',
      headerFontWeight: 600,
      headerFontSize: '0.6875rem',
    },
  },
};
