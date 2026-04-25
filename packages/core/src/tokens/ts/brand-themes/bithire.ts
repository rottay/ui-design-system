/**
 * BitHire first-party vertical theme.
 *
 * Trusted recruiting workspace. LinkedIn-adjacent trust (not a clone).
 * Blue family primary, softer radii, fast fades, calm forms.
 * Data-dense without looking harsh.
 *
 * Design: Professional corporate, clean with LinkedIn Blue (#0A66C2).
 * Light backgrounds, system fonts, subtle shadows. BitHire intentionally
 * remains clear-mode even if a host shell sets `.dark`.
 *
 * Source: tokens/css/artifacts/bithire/index.css (canonical visual reference).
 * This file MUST stay in sync with the CSS artifact.
 */

import type { BrandTheme } from '../../../contracts/themes';

export const bithireBrandTheme: BrandTheme = {
  id: 'bithire',
  name: 'BitHire',

  palette: {
    primaryColor: '#0A66C2',
    secondaryColor: '#057642',
    accentColor: '#5A9640',
    darkPrimaryColor: '#0A66C2',
    darkSecondaryColor: '#057642',
    darkAccentColor: '#5A9640',
    darkBackgroundColor: '#F8FBFF',
    successColor: '#057642',
    warningColor: '#E7A33E',
    errorColor: '#CC1016',
    infoColor: '#0A66C2',
  },

  typography: {
    fontFamilyBase: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    fontFamilyHeading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    fontFamilyMono: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace",
    fontFamilyDisplay: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    headingWeightBias: 'heavier',
    headingLetterSpacing: '-0.01em',
    labelStyle: 'uppercase',
    letterSpacing: {
      display: '-0.02em',
      heading: '-0.01em',
      body: '0',
      mono: '0',
    },
    lineHeight: {
      display: 1.1,
      heading: 1.25,
      body: 1.6,
      tight: 1.25,
      relaxed: 1.75,
    },
  },

  surfaces: {
    densityScale: 0.95,
    borderRadius: { sm: '6px', md: '8px', lg: '12px', xl: '16px' },
    shadows: {
      sm: '0 1px 2px rgba(22, 42, 67, 0.06)',
      md: '0 4px 12px rgba(22, 42, 67, 0.08)',
      lg: '0 8px 24px rgba(22, 42, 67, 0.1)',
      xl: '0 16px 48px rgba(22, 42, 67, 0.12)',
    },
    glass: { blur: 'none', background: 'none', border: 'none' },
    gradients: { primary: 'none', surface: 'none', mesh: 'none' },
    overlays: {
      light: 'rgba(22, 42, 67, 0.02)',
      medium: 'rgba(22, 42, 67, 0.04)',
      heavy: 'rgba(22, 42, 67, 0.08)',
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
      footerBg: '#F8FBFF',
      border: '#D3DEEA',
      text: '#162A43',
      textMuted: '#6B7F95',
      groupFontSize: '11px',
      groupFontWeight: 600,
      groupColor: '#6B7F95',
      groupLetterSpacing: '0.04em',
      itemFontSize: '13px',
      itemFontWeight: 400,
      itemFontWeightActive: 500,
      itemColor: '#52677E',
      itemColorActive: '#0A66C2',
      itemBgActive: 'rgba(10, 102, 194, 0.08)',
      itemBgHover: '#F4F8FD',
      itemPadding: '6px 10px',
      iconSize: '16px',
    },
    layout: {
      bg: '#FFFFFF',
      headerBg: 'rgba(255, 255, 255, 0.92)',
      headerBackdrop: 'blur(8px)',
      headerBorder: '#D3DEEA',
      siderBg: '#FFFFFF',
      siderBorder: '#D3DEEA',
    },
    shell: {
      gridSize: '0px',
      gridLine: 'transparent',
      gridOpacity: 0,
    },
    controls: {
      buttonPrimary: { bg: '#0A66C2', bgHover: '#004182', text: '#ffffff', color: '#ffffff', border: 'transparent', shadow: '0 1px 2px rgba(22, 42, 67, 0.1)' },
      buttonSecondary: { bg: 'transparent', bgHover: 'rgba(10, 102, 194, 0.08)', text: '#0A66C2', color: '#0A66C2', border: '#0A66C2' },
      buttonDefault: { bg: '#FFFFFF', bgHover: '#F4F8FD', text: '#162A43', color: '#162A43', border: '#BCCBDC' },
      buttonGhost: { bg: 'transparent', bgHover: '#F4F8FD', text: '#52677E', color: '#52677E' },
      disabled: { opacity: 0.45, bg: '#F8FAFC', text: '#A7B2C0', border: '#E2EAF3', borderColor: '#E2EAF3' },
      input: {
        bg: '#ffffff',
        border: '#BCCBDC',
        borderHover: '#90A6BE',
        borderFocus: '#0A66C2',
        shadowFocus: '0 0 0 1px #0A66C2',
        color: '#162A43',
        colorPlaceholder: '#8795A6',
        bgDisabled: '#F8F8F8',
        colorDisabled: '#A7B2C0',
        borderDisabled: '#E2EAF3',
        disabledOpacity: 0.45,
      },
    },
    table: {
      bg: '#ffffff',
      border: '#D3DEEA',
      headerBg: '#f3f2ef',
      headerColor: '#52677E',
      headerFontWeight: 600,
      headerFontSize: '0.75rem',
      rowBg: '#ffffff',
      rowBgHover: '#F4F8FD',
      rowBgStriped: '#FAFCFF',
      rowBgSelected: '#E8F3FF',
      rowBorder: '#DEE8F2',
      cellPadding: '0.875rem 1rem',
      cellFontSize: '0.875rem',
      cellColor: '#162A43',
    },
    cardComponent: {
      bg: '#ffffff',
      bgHover: '#F9FBFE',
      border: '#D3DEEA',
      shadow: '0 1px 2px rgba(22, 42, 67, 0.05), 0 8px 22px rgba(22, 42, 67, 0.06)',
      shadowHover: '0 2px 6px rgba(22, 42, 67, 0.08), 0 12px 28px rgba(22, 42, 67, 0.08)',
    },
  },
};
