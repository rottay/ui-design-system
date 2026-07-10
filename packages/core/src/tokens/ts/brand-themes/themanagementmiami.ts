/**
 * The Management Miami first-party vertical theme.
 *
 * Second tenant on the bithire vertical, authored to read as a different
 * company rather than a recolor (owner request 2026-07-09: "hacé que
 * themanagement y bithire se vean realmente distintas"). Reference: South
 * Florida hospitality/property brand — Art Deco geometry, warm earth palette,
 * editorial serif display type. Per the owner's 2026-07-09 decision there is
 * no convergence requirement between tenants in the same vertical: cadence,
 * density, separation strategy, accent grammar, and type ramp are all free to
 * differ from bithire's.
 *
 * Divergence from bithire (ranked by how fast a human perceives it):
 * 1. Typography — serif heading/display (Fraunces/Georgia fallback) against
 *    bithire's system sans stack; serif headings carry zero tracking (serifs
 *    read worse with negative tracking than sans does).
 * 2. Radius — a smaller, still-monotonic step scale (4/6/8/12) reads
 *    Deco-crisp against bithire's rounder 6/8/10/14.
 * 3. Motion — a spring-settled slide-up entrance against bithire's linear
 *    fade; different cadence, not a "more" or "less" version of it.
 * 4. Separation strategy — shadow-led, not border-led: cards carry no resting
 *    border and lean on a warm, low-contrast shadow instead of bithire's
 *    cool-bordered flat cards. Every border/shadow that does appear elsewhere
 *    (sidebar, table, toolbar) is warm-tempered (#E2D9CC / rgba(46,38,28,*))
 *    rather than bithire's cool blue-grey (#D3DEEA / rgba(22,42,67,*)).
 * 5. Accent grammar — top-position gradient accent bar, square badges/icon
 *    containers, dashed dividers, against bithire's left-solid bar and pill
 *    badges.
 * 6. Effects posture — a nonzero effect-intensity dial (soft gradient/glass)
 *    against bithire's flat zero-decoration law; this is a legitimate
 *    per-tenant choice, not a violation of bithire's own law (which only
 *    binds bithire).
 * 7. Palette, last (the channel a hue rotation alone would move) — gulf teal
 *    primary, sandstone secondary, terracotta accent, warm off-white canvas.
 *
 * SEMANTIC-COLLISION CONSTRAINT (owner decision 2026-07-09, invariant across
 * every tenant): success/warning/error/info must be mutually distinguishable
 * and distinguishable from primaryColor, by a measured hue/lightness
 * separation — not by a hue whitelist. This theme's primary is a teal
 * (H≈175°), so success was deliberately NOT drawn from the green family
 * nearest that hue; it sits at H≈95° (a moss/olive green), 80° of hue away
 * from primary. warning (H≈46°), error (H≈6°), and info (H≈224°) are each
 * 40°+ of hue from every other semantic and from primary — verified in
 * themanagementmiami-invariants.test.ts, which also drills the assertion by
 * temporarily colliding successColor with primaryColor and watching it fail.
 */

import type { BrandTheme } from '../../../contracts/themes';

export const themanagementmiamiBrandTheme: BrandTheme = {
  id: 'themanagementmiami',
  name: 'The Management Miami',

  palette: {
    primaryColor: '#0F766E',
    secondaryColor: '#8C6D46',
    accentColor: '#E2725B',
    darkPrimaryColor: '#0F766E',
    darkSecondaryColor: '#8C6D46',
    darkAccentColor: '#E2725B',
    backgroundColor: '#FBF6EC',
    successColor: '#5B8A3A',
    warningColor: '#C39E22',
    errorColor: '#C0392B',
    infoColor: '#5B6FA8',
  },

  typography: {
    fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
    fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
    fontFamilyMono: "'Courier New', Courier, monospace",
    fontFamilyDisplay: "'Fraunces', Georgia, 'Times New Roman', serif",
    headingWeightBias: 'normal',
    // Serifs refuse negative tracking (bithire's sans stack uses -0.01em).
    headingLetterSpacing: '0em',
    labelStyle: 'capitalize',
    letterSpacing: {
      display: '0em',
      heading: '0em',
      body: '0.01em',
      mono: '0em',
    },
    lineHeight: {
      display: 1.15,
      heading: 1.3,
      body: 1.55,
      tight: 1.2,
      relaxed: 1.7,
    },
  },

  surfaces: {
    densityScale: 1.05,
    borderRadius: { sm: '4px', md: '6px', lg: '8px', xl: '12px' },
    // Shadow-led separation strategy: warm sepia shadows carry the depth work
    // that bithire assigns to cool-bordered flat cards.
    shadows: {
      sm: '0 1px 2px rgba(46, 38, 28, 0.06)',
      md: '0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)',
      lg: '0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)',
      xl: '0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)',
    },
    glass: { blur: '16px', background: 'rgba(255, 254, 251, 0.55)', border: 'rgba(226, 217, 204, 0.6)' },
    gradients: {
      primary: 'linear-gradient(135deg, #0F766E, #E2725B)',
      surface: 'linear-gradient(180deg, #FFFEFB 0%, #FBF3E7 100%)',
      mesh: 'radial-gradient(circle at 80% 15%, rgba(226, 114, 91, 0.12), transparent 60%)',
    },
    // Nonzero — the opposite dial position from bithire's zero-decoration law.
    // This is a per-tenant choice; it does not weaken bithire's own law.
    effectIntensity: 0.45,
    overlays: {
      light: 'rgba(46, 38, 28, 0.03)',
      medium: 'rgba(46, 38, 28, 0.06)',
      heavy: 'rgba(46, 38, 28, 0.12)',
    },
  },

  motion: {
    intensity: 0.62,
    entrance: 'slideUp',
    entranceDuration: 260,
    hoverLift: 2,
    hoverScale: 1.0,
    useSpring: true,
    springTension: 210,
    springFriction: 24,
    staggerDelay: 40,
    staggerMax: 240,
    pulseSpeed: 'normal',
    skeletonStyle: 'shimmer',
    countUpEnabled: true,
  },

  charts: {
    animateOnMount: true,
    mountDuration: 500,
    lineStyle: 'smooth',
    showDots: false,
    useGradientFill: true,
    tooltipStyle: 'glass',
    colorScheme: 'default',
  },

  chrome: {
    card: {
      defaultElevation: 'md',
      hoverElevation: 'lift-two',
      // Shadow-led: no resting border on the card component itself.
      showBorder: false,
      hoverTint: false,
      paddingDensity: 'spacious',
    },
    accent: {
      barPosition: 'top',
      barThickness: 2,
      barStyle: 'gradient',
      iconContainerShape: 'square',
      badgeShape: 'square',
      dividerStyle: 'dashed',
    },
    sidebar: {
      bg: '#FFFEFB',
      footerBg: '#FBF3E7',
      border: '#E2D9CC',
      text: '#2E261C',
      textMuted: '#8A7B64',
      groupFontSize: '0.6875rem',
      groupFontWeight: 700,
      groupColor: '#8A7B64',
      groupLetterSpacing: '0.08em',
      itemFontSize: '0.875rem',
      itemFontWeight: 400,
      itemFontWeightActive: 700,
      itemColor: '#5C4F3D',
      itemColorActive: '#0F766E',
      itemBgActive: 'var(--ds-tint-8)',
      itemBgHover: '#FBF3E7',
      itemPadding: '8px 12px',
      iconSize: '18px',
    },
    layout: {
      bg: '#FFFEFB',
      headerBg: 'rgba(255, 254, 251, 0.90)',
      headerBackdrop: 'blur(10px)',
      headerBorder: '#E2D9CC',
      siderBg: '#FFFEFB',
      siderBorder: '#E2D9CC',
    },
    toolbar: {
      bg: 'color-mix(in srgb, #0F766E 4%, #FFFEFB)',
      border: '#E2D9CC',
      borderBottom: 'color-mix(in srgb, #E2D9CC 82%, transparent)',
      color: '#2E261C',
      shadow: '0 1px 2px rgba(46, 38, 28, 0.04)',
      radius: '8px',
      padding: '0.75rem 1rem',
      gap: '0.75rem',
      controlBg: '#FFFEFB',
      controlBorder: '#D8CBB4',
      controlColor: '#2E261C',
      divider: '#EFE7D8',
    },
    filterPill: {
      bg: '#FFFEFB',
      border: '#E2D9CC',
      color: '#5C4F3D',
      shadow: '0 1px 2px rgba(46, 38, 28, 0.03)',
      frameBorder: 'color-mix(in srgb, #0F766E 10%, #E2D9CC)',
      frameShadow: '0 1px 2px rgba(46, 38, 28, 0.03), inset 0 0 0 1px rgba(255, 254, 251, 0.5)',
      hoverBg: 'var(--ds-tint-4)',
      hoverBorder: 'color-mix(in srgb, #0F766E 16%, #E2D9CC)',
      activeBg: 'var(--ds-tint-8)',
      activeBorder: 'color-mix(in srgb, #0F766E 28%, #E2D9CC)',
      activeColor: '#0F766E',
      activeShadow: 'inset 0 0 0 1px color-mix(in srgb, #0F766E 28%, #E2D9CC), 0 1px 2px rgba(46, 38, 28, 0.05)',
      focusRing: '0 0 0 3px var(--ds-tint-24)',
      countBg: '#FFFEFB',
      countActiveBg: '#FFFEFB',
      countBorder: 'color-mix(in srgb, #E2D9CC 82%, transparent)',
      countActiveBorder: 'color-mix(in srgb, #0F766E 24%, #D8CBB4)',
      countRing: 'inset 0 0 0 1px color-mix(in srgb, #E2D9CC 82%, transparent)',
      countActiveRing: 'inset 0 0 0 1px color-mix(in srgb, #0F766E 24%, #D8CBB4)',
    },
    breadcrumb: {
      bg: 'color-mix(in srgb, #0F766E 4%, #FFFEFB)',
      border: 'color-mix(in srgb, #E2D9CC 82%, transparent)',
      color: '#5C4F3D',
      linkColor: '#0F766E',
      itemColor: '#5C4F3D',
      colorHover: '#0B5A54',
      colorActive: '#2E261C',
      separatorColor: '#A8987C',
      fontSize: '0.75rem',
      fontWeight: 400,
      padding: '0.625rem 1rem',
    },
    search: {
      bg: '#FFFEFB',
      border: '#E2D9CC',
      color: '#2E261C',
      shadow: '0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)',
      radius: '12px',
      inputBg: '#FFFEFB',
      inputBorder: '#D8CBB4',
      inputColor: '#2E261C',
      placeholderColor: '#A8987C',
      iconColor: '#A8987C',
      clearColor: '#B7A98E',
      clearColorHover: '#5C4F3D',
      resultBg: '#FFFEFB',
      resultBgHover: '#FBF3E7',
      resultBorder: '#EFE7D8',
      resultShadow: '0 1px 2px rgba(46, 38, 28, 0.04)',
      resultTitleColor: '#2E261C',
      resultMetaColor: '#8A7B64',
      categoryColor: '#8A7B64',
      emptyBg: '#FBF3E7',
    },
    controls: {
      buttonPrimary: { bg: '#0F766E', bgHover: '#0B5A54', text: '#FFFEFB', color: '#FFFEFB', border: 'transparent', shadow: '0 1px 2px rgba(46, 38, 28, 0.1)' },
      buttonSecondary: { bg: 'transparent', bgHover: 'var(--ds-tint-8)', text: '#0F766E', color: '#0F766E', border: '#0F766E' },
      buttonDefault: { bg: '#FFFEFB', bgHover: '#FBF3E7', text: '#2E261C', color: '#2E261C', border: '#D8CBB4' },
      buttonGhost: { bg: 'transparent', bgHover: '#FBF3E7', text: '#5C4F3D', color: '#5C4F3D' },
      disabled: { opacity: 0.45, bg: '#FBF8F2', text: '#B7A98E', border: '#EFE7D8', borderColor: '#EFE7D8' },
      input: {
        bg: '#FFFEFB',
        border: '#D8CBB4',
        borderHover: '#B7A98E',
        borderFocus: '#0F766E',
        shadowFocus: '0 0 0 1px #0F766E',
        color: '#2E261C',
        colorPlaceholder: '#A8987C',
        bgDisabled: '#FBF8F2',
        colorDisabled: '#B7A98E',
        borderDisabled: '#EFE7D8',
        disabledOpacity: 0.45,
      },
    },
    table: {
      bg: '#FFFEFB',
      border: '#E2D9CC',
      radius: '8px',
      // White + hairline instead of bithire's tinted paper-band header.
      headerBg: '#FFFFFF',
      headerBgHover: '#FBF3E7',
      headerColor: '#5C4F3D',
      headerFontWeight: 700,
      headerFontSize: '0.6875rem',
      headerBorder: 'color-mix(in srgb, #E2D9CC 82%, transparent)',
      headerShadow: 'inset 0 -1px 0 color-mix(in srgb, #E2D9CC 82%, transparent)',
      rowBg: '#FFFEFB',
      rowBgHover: '#FBF3E7',
      rowBgStriped: '#FCF8F0',
      rowBgSelected: 'var(--ds-tint-12)',
      rowBgExpanded: '#FBF3E7',
      rowBorder: '#EFE7D8',
      rowHoverShadow: 'inset 1px 0 0 color-mix(in srgb, var(--ds-color-primary) 34%, transparent)',
      cellPadding: '0.75rem 1rem',
      cellFontSize: '0.875rem',
      cellColor: '#2E261C',
      filterRowBg: '#FBF3E7',
      filterFocusShadow: '0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 14%, transparent), 0 0 8px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)',
      resizeBg: 'color-mix(in srgb, #0F766E 22%, #E2D9CC)',
      resizeBgHover: '#0F766E',
      reorderBg: 'var(--ds-tint-12)',
      actionBg: '#FFFEFB',
      actionBorder: 'color-mix(in srgb, #E2D9CC 70%, transparent)',
      sheen: 'none',
      pageButtonHoverShadow: '0 1px 2px rgba(46, 38, 28, 0.06)',
      loadingOverlayBg: 'rgba(255, 254, 251, 0.7)',
    },
    cardComponent: {
      padding: '1.25rem',
      paddingSm: '1rem',
      paddingMd: '1.25rem',
      paddingLg: '1.5rem',
      paddingXl: '1.75rem',
      bg: '#FFFEFB',
      bgHover: '#FEFCF7',
      color: '#2E261C',
      colorMuted: '#8A7B64',
      // Shadow-led: no border color set here either — the card relies on
      // shadow (below) for separation, matching chrome.card.showBorder=false.
      border: 'transparent',
      borderColor: 'transparent',
      shadow: '0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)',
      shadowHover: '0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)',
      radius: '8px',
      focusRing: '0 0 0 3px var(--ds-tint-24)',
      hoverTransform: 'translateY(-2px) scale(1)',
      headerBorder: '#EFE7D8',
      headerBorderColor: '#EFE7D8',
      headerBg: 'color-mix(in srgb, #FFFEFB 82%, #FBF3E7)',
      headerColor: '#5C4F3D',
      headerPadding: '1.25rem',
      titleColor: '#2E261C',
      titleFontWeight: 600,
      subtitleColor: '#8A7B64',
      bodyColor: '#2E261C',
      bodyPadding: '1.25rem',
      footerBorder: '#EFE7D8',
      footerBorderColor: '#EFE7D8',
      footerBg: '#FBF3E7',
      footerColor: '#5C4F3D',
      footerPadding: '1.25rem',
      imagePlaceholderBg: '#FBF3E7',
      imagePlaceholderColor: '#A8987C',
    },
    metricCard: {
      bg: '#FFFEFB',
      border: 'color-mix(in srgb, #0F766E 10%, #E2D9CC)',
      borderHover: 'color-mix(in srgb, #0F766E 24%, #E2D9CC)',
      selectedBorder: 'color-mix(in srgb, #0F766E 58%, #E2D9CC)',
      selectedRing: '0 0 0 3px var(--ds-tint-12)',
      shadow: '0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)',
      shadowHover: '0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)',
      sheen: 'none',
      iconBg: 'color-mix(in srgb, #0F766E 8%, #FFFEFB)',
      iconBorder: 'color-mix(in srgb, #0F766E 24%, #E2D9CC)',
      labelColor: '#8A7B64',
      valueColor: '#2E261C',
      trendColor: '#5B8A3A',
      meterTrack: 'color-mix(in srgb, #E2D9CC 48%, #FBF3E7)',
      meterTrackBorder: 'color-mix(in srgb, #E2D9CC 82%, transparent)',
      meterFill: 'linear-gradient(90deg, #0F766E, #E2725B)',
      meterFillSuccess: '#5B8A3A',
      meterFillWarning: '#C39E22',
      meterFillError: '#C0392B',
      meterFillNeutral: '#A8987C',
    },
    signalCard: {
      bg: '#FFFEFB',
      border: '#E2D9CC',
      borderHover: 'color-mix(in srgb, #0F766E 18%, #E2D9CC)',
      shadow: '0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)',
      iconBg: 'color-mix(in srgb, #0F766E 8%, #FFFEFB)',
      iconBorder: 'color-mix(in srgb, #0F766E 24%, #E2D9CC)',
      titleColor: '#2E261C',
      bodyColor: '#5C4F3D',
      badgeBg: 'var(--ds-tint-8)',
      badgeBorder: 'color-mix(in srgb, #0F766E 28%, #E2D9CC)',
      badgeColor: '#0F766E',
      sectionBg: '#FFFEFB',
      sectionAltBg: 'color-mix(in srgb, #0F766E 4%, #FBF3E7)',
      meterTrack: 'color-mix(in srgb, #E2D9CC 48%, #FBF3E7)',
      meterTrackBorder: 'color-mix(in srgb, #E2D9CC 82%, transparent)',
      meterFill: 'linear-gradient(90deg, #0F766E, #E2725B)',
    },
  },
};
