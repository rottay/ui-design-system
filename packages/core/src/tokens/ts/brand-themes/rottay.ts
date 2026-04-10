/**
 * Rottay first-party vertical theme.
 *
 * Dark-first premium AI/security command center.
 * Graphite environments, restrained cobalt/cyan accents, crisp off-white type.
 * Disciplined spring motion, mono pairing for data surfaces.
 *
 * H4 brief: dark, sober, technical, premium. Reduce purple/teal SaaS energy.
 * Strengthen shell and layout as identity. Controls feel tool-like, not app-generic.
 *
 * Source data: vertical registry (platform), personality preset (expressive),
 * tenant CSS (tokens/css/artifacts/rottay/index.css).
 */

import type { BrandTheme } from '../../../contracts/themes';

export const rottayBrandTheme: BrandTheme = {
  id: 'rottay',
  name: 'Rottay',

  palette: {
    // H4: reduce purple/teal SaaS energy. Restrained cobalt + icy cyan.
    primaryColor: '#3B82F6',       // restrained cobalt (was indigo #6366F1)
    secondaryColor: '#71717A',     // steel/graphite neutral (was zinc #A1A1AA)
    accentColor: '#06B6D4',        // icy cyan, used sparingly (was teal #14B8A6)
    darkPrimaryColor: '#60A5FA',   // lighter cobalt for dark surfaces
    darkSecondaryColor: '#A1A1AA', // steel on dark
    darkAccentColor: '#22D3EE',    // brighter cyan for dark contrast
    darkBackgroundColor: '#0C0C0E',
    // Semantic: serious and muted, not candy-bright
    successColor: '#16A34A',       // darker green (serious)
    warningColor: '#CA8A04',       // amber (not bright yellow)
    errorColor: '#DC2626',         // deep red
    infoColor: '#3B82F6',          // matches primary cobalt
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
    // Sharp and restrained (H4: slightly sharper corners than other brands)
    borderRadius: { sm: '4px', md: '6px', lg: '8px', xl: '12px' },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      md: '0 4px 12px rgba(0, 0, 0, 0.25)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.3)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.35)',
    },
    // Rottay: no glass, no gradients, subtle overlays (H4: low-gloss, serious)
    glass: { blur: 'none', background: 'none', border: 'none' },
    gradients: { primary: 'none', surface: 'none', mesh: 'none' },
    overlays: {
      light: 'rgba(255, 255, 255, 0.03)',
      medium: 'rgba(255, 255, 255, 0.06)',
      heavy: 'rgba(255, 255, 255, 0.1)',
    },
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
      input: { bg: '#18181B', border: '#3A3A40', borderFocus: '#3B82F6', shadowFocus: '0 0 0 1px rgba(59, 130, 246, 0.3)' },
      disabled: { opacity: 0.4, bg: '#18181B', text: '#52525B', border: '#2A2A2F' },
    },
    table: {
      headerBg: '#131316',
      headerColor: '#A0A0A5',
      headerFontWeight: 600,
      headerFontSize: '0.6875rem',
    },
  },
};
