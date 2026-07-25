/**
 * Rottay first-party vertical theme.
 *
 * Dark-first premium AI/security command center.
 * White primary on dark canvas, graphite environments, restrained accents.
 * Disciplined spring motion, mono pairing for data surfaces.
 *
 * Design: Vercel/Linear inspired - dark, sober, technical, premium.
 * Primary: #FFFFFF (white on dark), Canvas: #0C0C0E
 *
 * This file is the canonical authored source. foundation/tokens/css/facade/artifacts/rottay/index.css
 * is a generated build product — regenerate with `pnpm -C packages/core
 * build:vertical-css`; hand-edits fail `lint:artifacts`.
 */

import type { BrandTheme } from '../../../../../contracts/composition/tenants/themes';

export const rottayBrandTheme: BrandTheme = {
  id: 'rottay',
  name: 'Rottay',

  /**
   * Governed recipe profile (K0.6, 2026-07-23): selected from sighted
   * same-tree evidence (`/probe/k0-profiles`, captures under
   * test-artifacts/rottay-design-platform/K0-K1/captures). technical-sharp
   * matches this theme's declared graphite/mono/border-first posture;
   * editorial-round was sighted and rejected (illegible active pill tab on
   * the dark canvas). Explicit component props still win over profile
   * defaults.
   */
  recipes: { schemaVersion: 1, profile: 'rottay/technical-sharp@1' },

  palette: {
    // Light-mode runtime colors mirror the explicit light artifact.
    primaryColor: '#0A0A0A',
    secondaryColor: '#6B6B6B',
    accentColor: '#6B6B6B',
    darkPrimaryColor: '#FFFFFF',
    darkSecondaryColor: '#A0A0A5',
    darkAccentColor: '#A0A0A5',
    darkBackgroundColor: '#0C0C0E',
    // Semantic: serious and muted
    successColor: '#22C55E',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#3B82F6',
  },

  typography: {
    fontFamilyBase: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyHeading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Geist Mono', ui-monospace, monospace",
    fontFamilyDisplay: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    headingWeightBias: 'normal',
    headingLetterSpacing: '-0.025em',
    labelStyle: 'sentence',
    letterSpacing: {
      display: '-0.025em',
      heading: '-0.015em',
      body: '0',
      mono: '0',
    },
    lineHeight: {
      display: 1.1,
      heading: 1.2,
      body: 1.6,
      tight: 1.25,
      relaxed: 1.75,
    },
  },

  surfaces: {
    densityScale: 1.0,
    borderRadius: { sm: '6px', md: '10px', lg: '14px', xl: '18px' },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.28), 0 4px 12px rgba(0, 0, 0, 0.14)',
      md: '0 2px 4px rgba(0, 0, 0, 0.32), 0 8px 24px rgba(0, 0, 0, 0.18)',
      lg: '0 8px 20px rgba(0, 0, 0, 0.28), 0 16px 40px rgba(0, 0, 0, 0.22)',
      xl: '0 16px 40px rgba(0, 0, 0, 0.34), 0 24px 56px rgba(0, 0, 0, 0.28)',
    },
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
    tooltipStyle: 'minimal',
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
      buttonPrimary: { bg: '#FFFFFF', bgHover: '#E0E0E0', bgActive: '#D4D4D8', text: '#0C0C0E', color: '#0C0C0E', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.30)', shadowHover: '0 2px 12px rgba(255, 255, 255, 0.08)' },
      buttonSecondary: { bg: '#2A2A2F', bgHover: '#3A3A40', bgActive: '#4A4A4F', text: '#ECECEC', color: '#ECECEC', border: '#3A3A40', borderHover: 'rgba(255, 255, 255, 0.14)' },
      buttonDefault: { bg: '#18181B', bgHover: '#222226', bgActive: '#2A2A2F', text: '#ECECEC', color: '#ECECEC', border: '#3A3A40', borderHover: 'rgba(255, 255, 255, 0.18)' },
      buttonGhost: { bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', bgActive: 'rgba(255, 255, 255, 0.08)', text: '#A0A0A5', color: '#A0A0A5' },
      buttonText: { bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', bgActive: 'rgba(255, 255, 255, 0.08)', text: '#A0A0A5', color: '#A0A0A5' },
      buttonLink: { color: '#ECECEC', colorHover: '#FFFFFF', colorActive: '#D4D4D8' },
      buttonSuccess: { bg: '#16A34A', bgHover: '#15803D', bgActive: '#166534', text: '#ffffff', color: '#ffffff', border: 'transparent' },
      buttonWarning: { bg: '#D97706', bgHover: '#B45309', bgActive: '#92400E', text: '#FFFFFF', color: '#FFFFFF', border: 'transparent' },
      buttonError: { bg: '#EF4444', bgHover: '#DC2626', bgActive: '#B91C1C', text: '#ffffff', color: '#ffffff', border: 'transparent' },
      buttonInfo: { bg: '#3B82F6', bgHover: '#2563EB', bgActive: '#1D4ED8', text: '#ffffff', color: '#ffffff', border: 'transparent' },
      disabled: { opacity: 0.4, bg: '#18181B', text: '#52525B', border: '#2A2A2F', borderColor: '#2A2A2F' },
      focusRing: '0 0 0 2px rgba(255, 255, 255, 0.20)',
      input: {
        bg: '#131316',
        bgHover: '#1A1A1E',
        bgFocus: '#131316',
        bgDisabled: '#18181B',
        color: '#ECECEC',
        colorPlaceholder: '#6B6B72',
        colorDisabled: '#52525B',
        border: '#2A2A2F',
        borderHover: '#3A3A40',
        borderFocus: 'rgba(255, 255, 255, 0.36)',
        borderDisabled: '#2A2A2F',
        disabledOpacity: 0.4,
        shadowFocus: '0 0 0 3px rgba(255, 255, 255, 0.10)',
        filled: { bg: '#1A1A1E', bgHover: '#222226', bgFocus: '#1A1A1E' },
        addon: { bg: '#1A1A1E', color: '#6B6B72', border: '#2A2A2F' },
        label: { color: '#A0A0A5' },
        helper: { color: '#6B6B72' },
        clear: { color: '#6B6B72', colorHover: '#A0A0A5' },
        successBorder: '#16A34A',
        successShadowFocus: '0 0 0 2px rgba(34, 197, 94, 0.18)',
        warningBorder: '#D97706',
        warningShadowFocus: '0 0 0 2px rgba(245, 158, 11, 0.18)',
        errorBorder: '#EF4444',
        errorShadowFocus: '0 0 0 2px rgba(239, 68, 68, 0.18)',
        errorColor: '#EF4444',
      },
    },
    table: {
      bg: '#0C0C0E',
      border: '#2A2A2F',
      headerBg: '#131316',
      headerColor: '#A0A0A5',
      headerFontWeight: 600,
      headerFontSize: '0.6875rem',
      rowBg: '#0C0C0E',
      rowBgHover: 'rgba(255, 255, 255, 0.025)',
      rowBgStriped: '#131316',
      rowBgSelected: 'rgba(255, 255, 255, 0.05)',
      rowBorder: '#222226',
      cellPadding: '0.875rem 1rem',
      cellFontSize: '0.875rem',
      cellColor: '#ECECEC',
      loadingOverlayBg: 'rgba(12, 12, 14, 0.7)',
    },
    cardComponent: {
      bg: '#18181B',
      bgHover: '#1A1A1E',
      color: '#ECECEC',
      border: '#2A2A2F',
      borderHover: '#3A3A40',
      borderAccentHover: 'rgba(255, 255, 255, 0.14)',
      shadow: 'none',
      shadowHover: '0 8px 24px rgba(0, 0, 0, 0.20)',
      shadowElevated: '0 16px 40px rgba(0, 0, 0, 0.28)',
      headerBorder: '#2A2A2F',
      headerColor: '#ECECEC',
      titleColor: '#ECECEC',
      subtitleColor: '#A0A0A5',
      bodyColor: '#A0A0A5',
      footerBorder: '#2A2A2F',
      footerBg: '#101012',
    },
    modal: {
      bg: '#1A1A1E',
      color: '#ECECEC',
      shadow: '0 24px 64px rgba(0, 0, 0, 0.40)',
      overlayBg: 'rgba(0, 0, 0, 0.64)',
      overlayBackdrop: 'blur(10px)',
      headerBg: '#222226',
      headerBorder: '#2A2A2F',
      titleColor: '#ECECEC',
      subtitleColor: '#6B6B72',
      bodyColor: '#A0A0A5',
      footerBorder: '#2A2A2F',
      footerBg: '#1A1A1E',
      closeColor: '#6B6B72',
      closeColorHover: '#ECECEC',
      closeBgHover: 'rgba(255, 255, 255, 0.05)',
    },
    tabs: {
      border: '#2A2A2F',
      color: '#6B6B72',
      colorHover: '#ECECEC',
      colorActive: '#ECECEC',
      bgHover: 'rgba(255, 255, 255, 0.03)',
      borderActive: '#FFFFFF',
      listBg: '#141416',
      listBorder: '#2A2A2F',
      listRadius: '8px',
      listPadding: '3px',
      listShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.035)',
      listTexture:
        'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.14) 0.5px, transparent 0.75px)',
      listTextureOpacity: 0.12,
      listHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.035)',
      itemRadius: '6px',
      itemFontWeight: 450,
      itemFontWeightActive: 620,
      activeBg: '#222226',
      activeShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 1px 3px rgba(0, 0, 0, 0.34)',
      activeHighlight:
        'linear-gradient(118deg, transparent 12%, rgba(255, 255, 255, 0.06) 48%, transparent 76%)',
      activeHighlightOpacity: 0.46,
      pressedTransform: 'translateY(0) scale(0.985)',
      iconBg: 'rgba(255, 255, 255, 0.025)',
      iconBgActive: 'rgba(255, 255, 255, 0.055)',
      iconPadding: '4px',
      badgeBg: 'rgba(255, 255, 255, 0.035)',
      badgeBgActive: 'rgba(255, 255, 255, 0.08)',
      badgeColorActive: '#ECECEC',
      badgeBorderActive: '#3A3A40',
      panelBg: '#1A1A1E',
      panelBorder: '#2A2A2F',
      panelRadius: '10px',
      panelShadow: '0 14px 36px rgba(0, 0, 0, 0.18)',
      panelTexture:
        'linear-gradient(135deg, rgba(255, 255, 255, 0.025), transparent 42%)',
      overflowControlBg: '#1A1A1E',
      overflowControlBgHover: '#222226',
      overflowControlShadow: '0 2px 8px rgba(0, 0, 0, 0.22)',
      overflowControlShadowHover: '0 6px 16px rgba(0, 0, 0, 0.30)',
    },
  },
};
