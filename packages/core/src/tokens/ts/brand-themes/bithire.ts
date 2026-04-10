/**
 * BitHire first-party vertical theme.
 *
 * Trusted recruiting workspace. LinkedIn-adjacent trust (not a clone).
 * Blue family primary, softer radii, fast fades, calm forms.
 * Data-dense without looking harsh.
 *
 * H4 brief: deepen premium layer, soften corporate stiffness, give
 * sidebar/table/cards/forms more authored personality.
 *
 * Source data: vertical registry (bithire), personality preset (formal),
 * tenant CSS (tokens/css/artifacts/bithire/index.css).
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
    darkAccentColor: '#8FD16E',
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
    // H4: softer radii than classic enterprise
    borderRadius: { sm: '6px', md: '8px', lg: '12px', xl: '16px' },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
      md: '0 4px 12px rgba(0, 0, 0, 0.08)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.1)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.12)',
    },
    // BitHire: no glass, no gradients, subtle overlays (clean corporate)
    glass: { blur: 'none', background: 'none', border: 'none' },
    gradients: { primary: 'none', surface: 'none', mesh: 'none' },
    overlays: {
      light: 'rgba(0, 0, 0, 0.02)',
      medium: 'rgba(0, 0, 0, 0.04)',
      heavy: 'rgba(0, 0, 0, 0.08)',
    },
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
    // H4: clean, structured header; no heavy shell
    layout: {
      bg: '#FFFFFF',
      headerBg: 'rgba(255, 255, 255, 0.92)',
      headerBackdrop: 'blur(8px)',
      headerBorder: 'rgba(0, 0, 0, 0.08)',
      siderBg: '#FFFFFF',
      siderBorder: 'rgba(0, 0, 0, 0.08)',
    },
    // BitHire: intentionally minimal shell (no visible grid)
    shell: {
      gridSize: '0px',
      gridLine: 'transparent',
      gridOpacity: 0,
    },
    controls: {
      buttonPrimary: { bg: '#0A66C2', bgHover: '#004182', text: '#ffffff', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.1)' },
      buttonSecondary: { bg: 'transparent', bgHover: 'rgba(10, 102, 194, 0.08)', text: '#0A66C2', border: '#0A66C2' },
      // H4: refined, polished, mature
      buttonDefault: { bg: '#FFFFFF', bgHover: '#F8F8F8', text: 'rgba(0, 0, 0, 0.85)', border: 'rgba(0, 0, 0, 0.15)' },
      buttonGhost: { bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.04)', text: 'rgba(0, 0, 0, 0.65)' },
      input: { bg: '#ffffff', border: 'rgba(0, 0, 0, 0.15)', borderFocus: '#0A66C2', shadowFocus: '0 0 0 1px #0A66C2' },
      disabled: { opacity: 0.45, bg: '#F8F8F8', text: 'rgba(0, 0, 0, 0.3)', border: 'rgba(0, 0, 0, 0.08)' },
    },
    table: {
      headerBg: '#f3f2ef',
      headerColor: 'rgba(0, 0, 0, 0.6)',
      headerFontWeight: 600,
      headerFontSize: '0.75rem',
    },
  },
};
