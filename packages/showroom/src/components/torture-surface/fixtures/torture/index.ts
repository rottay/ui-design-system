/**
 * PROVENANCE (COPY-FIRST, 2026-07-18)
 * -----------------------------------
 * Showroom-owned copy of the hostile-tenant whitelabel proof fixtures.
 *
 * Source: packages/core/src/foundation/tokens/ts/presentation/brand-themes/fixtures/torture/index.ts
 * Reason: commit 5d2157a8 drained these fixtures from the @rottay/design-system
 *         public barrel — tenant-named proof fixtures are not public DS API.
 *         The showroom is their sole consumer, so it now owns the copy.
 * Constraint: these are whitelabel PROBE fixtures, never product tenants. Values
 *         are a faithful copy of the source above (deep-equal verified). They are
 *         typed against the public BrandTheme contract only — no deep import into
 *         core source.
 */

/**
 * Hostile-tenant whitelabel PROOF FIXTURES (WO-GAT-03).
 *
 * These two BrandTheme objects are NOT product tenants. They exist for one
 * purpose: every themable channel they populate is deliberately pushed away
 * from both first-party themes (rottay, bithire) so that any component which
 * ignores the active tenant theme (a hardcoded color, radius, font, etc.) is
 * mechanically detectable by a whitelabel differential probe.
 *
 * They are never registered in `KNOWN_TENANTS`, `BUNDLED_TENANT_SLUGS`, or
 * `FIRST_PARTY_ARTIFACT_SPECS` — there is no generated CSS artifact for them.
 * They compile at render time via `compileBrandTheme`, the same as any
 * DB-driven tenant would.
 *
 * This file is runtime-pure: only a type-only import of `BrandTheme` is used,
 * so it carries zero side effects and can be imported from a plain Node or
 * Playwright context without pulling in the rest of the design system.
 */

import type { BrandTheme } from '@rottay/design-system';

/**
 * Torture fixture paired with the `dark` base theme.
 *
 * Character: near-black canvas, garish clashing palette (magenta primary,
 * acid-green secondary, amber accent), semantics shifted off rottay's, wide
 * monospace typography, non-monotonic radius scale, densest layout, heavy
 * saturated colored-glow shadows, and real glass/gradient/overlay values
 * (rottay uses `'none'` for these — a torture fixture never can, or a
 * hardcoded `'none'` fallback would look correct by accident).
 */
export const tortureDarkBrandTheme: BrandTheme = {
  id: 'torture-dark',
  name: 'Torture Dark',

  palette: {
    primaryColor: '#CC0088',
    secondaryColor: '#557700',
    accentColor: '#B37700',
    darkPrimaryColor: '#FF00AA',
    darkSecondaryColor: '#B6FF00',
    darkAccentColor: '#FFB300',
    darkBackgroundColor: '#050307',
    successColor: '#00FFC2',
    warningColor: '#FF7A00',
    errorColor: '#FF0055',
    infoColor: '#00E5FF',
  },

  typography: {
    fontFamilyBase: "'Courier New', ui-monospace, monospace",
    fontFamilyHeading: "'Courier New', ui-monospace, monospace",
    fontFamilyMono: "'Consolas', 'Andale Mono', monospace",
    fontFamilyDisplay: "'Courier New', ui-monospace, monospace",
    // Contract only allows 'lighter' | 'normal' | 'heavier'. rottay uses
    // 'normal' and bithire uses 'heavier', so 'lighter' is the only value
    // left that differs from both first-party themes.
    headingWeightBias: 'lighter',
    headingLetterSpacing: '0.14em',
    labelStyle: 'uppercase',
    letterSpacing: {
      display: '0.08em',
      heading: '0.10em',
      body: '0.04em',
      mono: '0.05em',
    },
    lineHeight: {
      display: 0.95,
      heading: 1.05,
      body: 2.2,
      tight: 0.85,
      relaxed: 2.6,
    },
  },

  surfaces: {
    densityScale: 0.72,
    borderRadius: { sm: '0px', md: '26px', lg: '2px', xl: '44px' },
    shadows: {
      sm: '0 2px 6px rgba(255, 0, 170, 0.55)',
      md: '0 6px 18px rgba(182, 255, 0, 0.45), 0 2px 8px rgba(255, 0, 170, 0.35)',
      lg: '0 14px 34px rgba(255, 179, 0, 0.50), 0 4px 14px rgba(255, 0, 170, 0.40)',
      xl: '0 26px 60px rgba(0, 229, 255, 0.45), 0 10px 30px rgba(182, 255, 0, 0.35)',
    },
    glass: { blur: '18px', background: 'rgba(255, 0, 170, 0.14)', border: 'rgba(182, 255, 0, 0.35)' },
    gradients: {
      primary: 'linear-gradient(135deg, #FF00AA, #B6FF00)',
      surface: 'linear-gradient(180deg, #0D0510, #050307)',
      mesh: 'radial-gradient(circle at 20% 20%, rgba(255, 0, 170, 0.25), transparent 60%)',
    },
    overlays: {
      light: 'rgba(255, 0, 170, 0.10)',
      medium: 'rgba(182, 255, 0, 0.16)',
      heavy: 'rgba(0, 229, 255, 0.24)',
    },
  },

  motion: {
    intensity: 1.6,
    entrance: 'bounce',
    entranceDuration: 900,
    hoverLift: 8,
    hoverScale: 1.15,
    useSpring: true,
    springTension: 40,
    springFriction: 4,
    staggerDelay: 140,
    staggerMax: 1200,
    pulseSpeed: 'fast',
    // Contract only allows 'pulse' | 'shimmer' | 'wave'. rottay uses
    // 'shimmer' and bithire uses 'pulse', so 'wave' is the only value left.
    skeletonStyle: 'wave',
    // rottay and bithire both set this true, so false is the only value
    // that differs from both.
    countUpEnabled: false,
  },

  charts: {
    // rottay and bithire both set this true, so false is the only value
    // that differs from both.
    animateOnMount: false,
    mountDuration: 50,
    // Contract only allows 'sharp' | 'smooth' | 'step'. rottay uses 'smooth'
    // and bithire uses 'sharp', so 'step' is the only value left.
    lineStyle: 'step',
    showDots: true,
    useGradientFill: false,
    // Contract only allows 'minimal' | 'detailed' | 'glass'. rottay uses
    // 'minimal' and bithire uses 'detailed', so 'glass' is the only value left.
    tooltipStyle: 'glass',
  },

  chrome: {
    card: {
      // Contract only allows 'sm' | 'md' | 'lg'. rottay uses 'md' and
      // bithire uses 'sm', so 'lg' is the only value left.
      defaultElevation: 'lg',
      // Contract only allows 'none' | 'lift-one' | 'lift-two'. rottay uses
      // 'lift-two' and bithire uses 'lift-one', so 'none' is the only value left.
      hoverElevation: 'none',
      showBorder: true,
      // rottay and bithire both set this true, so false is the only value
      // that differs from both.
      hoverTint: false,
      // Contract only allows 'compact' | 'normal' | 'spacious'. rottay uses
      // 'normal' and bithire uses 'compact', so 'spacious' is the only value left.
      paddingDensity: 'spacious',
    },
    accent: {
      // Contract only allows 'top' | 'left' | 'none'. rottay uses 'top' and
      // bithire uses 'left', so 'none' is the only value left.
      barPosition: 'none',
      barThickness: 7,
      // Contract only allows 'solid' | 'gradient' | 'animated'. rottay uses
      // 'gradient' and bithire uses 'solid', so 'animated' is the only value left.
      barStyle: 'animated',
      iconContainerShape: 'square',
      // Contract only allows 'rounded' | 'pill' | 'square'. rottay uses
      // 'rounded' and bithire uses 'pill', so 'square' is the only value left.
      badgeShape: 'square',
      dividerStyle: 'dashed',
    },
    sidebar: {
      bg: '#0A0510',
      border: '#3D0030',
      text: '#FF66CC',
      textMuted: '#996680',
      width: '410px',
      collapsedWidth: '140px',
      headerHeight: '150px',
      groupFontSize: '18px',
      groupFontWeight: 900,
      groupColor: '#B6FF00',
      groupLetterSpacing: '0.30em',
      itemFontSize: '22px',
      itemFontWeight: 300,
      itemFontWeightActive: 900,
      itemColor: '#FFB300',
      itemColorActive: '#00E5FF',
      itemBgActive: 'rgba(255, 0, 170, 0.45)',
      itemBgHover: 'rgba(182, 255, 0, 0.30)',
      itemPadding: '2px 30px',
      iconSize: '30px',
      footerBg: '#050307',
    },
    layout: {
      bg: '#050307',
      headerBg: 'rgba(255, 0, 170, 0.14)',
      headerBackdrop: 'blur(28px)',
      headerBorder: 'rgba(182, 255, 0, 0.4)',
      siderBg: '#0A0510',
      siderBorder: '#3D0030',
    },
    shell: {
      gridSize: '64px',
      gridLine: 'rgba(255, 0, 170, 0.35)',
      gridOpacity: 0.15,
    },
    controls: {
      buttonPrimary: {
        bg: '#FF00AA',
        bgHover: '#CC0088',
        bgActive: '#990066',
        text: '#1A0014',
        color: '#1A0014',
        border: '#33001F',
        shadow: '0 2px 8px rgba(255, 0, 170, 0.5)',
        shadowHover: '0 6px 20px rgba(182, 255, 0, 0.4)',
      },
      buttonSecondary: {
        bg: '#1A2600',
        bgHover: '#243300',
        bgActive: '#2E4000',
        text: '#D4FF66',
        color: '#D4FF66',
        border: '#334D00',
        borderHover: 'rgba(182, 255, 0, 0.4)',
      },
      buttonDefault: {
        bg: '#12000D',
        bgHover: '#1F0016',
        bgActive: '#2B001F',
        text: '#FF99DD',
        color: '#FF99DD',
        border: '#4D0033',
        borderHover: 'rgba(255, 0, 170, 0.45)',
      },
      buttonGhost: {
        // rottay and bithire both use the literal 'transparent' string here,
        // so a near-invisible real color is used instead — visually ghost-like
        // but textually distinct from both.
        bg: 'rgba(255, 0, 170, 0.02)',
        bgHover: 'rgba(255, 0, 170, 0.18)',
        bgActive: 'rgba(255, 0, 170, 0.28)',
        text: '#FFB300',
        color: '#FFB300',
      },
      buttonText: {
        bg: 'rgba(182, 255, 0, 0.02)',
        bgHover: 'rgba(182, 255, 0, 0.16)',
        bgActive: 'rgba(182, 255, 0, 0.26)',
        text: '#00E5FF',
        color: '#00E5FF',
      },
      buttonLink: { color: '#FF66CC', colorHover: '#FFAADD', colorActive: '#CC0088' },
      buttonSuccess: { bg: '#00CC9B', bgHover: '#00A37A', bgActive: '#007A5C', text: '#001A13', color: '#001A13', border: '#003326' },
      buttonWarning: { bg: '#FF9500', bgHover: '#CC7700', bgActive: '#995900', text: '#331500', color: '#331500', border: '#663000' },
      buttonError: { bg: '#FF0055', bgHover: '#CC0044', bgActive: '#990033', text: '#330011', color: '#330011', border: '#66001F' },
      buttonInfo: { bg: '#00E5FF', bgHover: '#00B8CC', bgActive: '#008A99', text: '#001A1E', color: '#001A1E', border: '#003D42' },
      disabled: { opacity: 0.85, bg: '#220018', text: '#663355', border: '#440022', borderColor: '#440022' },
      focusRing: '0 0 0 4px rgba(255, 0, 170, 0.55)',
      input: {
        bg: '#1A0014',
        bgHover: '#2B0020',
        bgFocus: '#33001F',
        bgDisabled: '#1F0016',
        color: '#FF99DD',
        colorPlaceholder: '#B3668F',
        colorDisabled: '#663355',
        border: '#661144',
        borderHover: '#803060',
        borderFocus: 'rgba(255, 0, 170, 0.6)',
        borderDisabled: '#4D0033',
        disabledOpacity: 0.9,
        shadowFocus: '0 0 0 5px rgba(255, 0, 170, 0.4)',
        filled: { bg: '#2B0020', bgHover: '#3D002B', bgFocus: '#2B0020' },
        addon: { bg: '#2B0020', color: '#B3668F', border: '#4D0033' },
        label: { color: '#FFB300' },
        helper: { color: '#B3668F' },
        clear: { color: '#B3668F', colorHover: '#FFB300' },
        successBorder: '#00CC9B',
        successShadowFocus: '0 0 0 4px rgba(0, 255, 194, 0.35)',
        warningBorder: '#FF9500',
        warningShadowFocus: '0 0 0 4px rgba(255, 122, 0, 0.35)',
        errorBorder: '#FF0055',
        errorShadowFocus: '0 0 0 4px rgba(255, 0, 85, 0.35)',
        errorColor: '#FF0055',
      },
    },
    table: {
      bg: '#050307',
      border: '#4D0033',
      headerBg: '#1A0014',
      headerColor: '#FF66CC',
      headerFontWeight: 900,
      headerFontSize: '0.55rem',
      rowBg: '#050307',
      rowBgHover: 'rgba(255, 0, 170, 0.12)',
      rowBgStriped: '#12000D',
      rowBgSelected: 'rgba(182, 255, 0, 0.16)',
      rowBorder: '#33001F',
      cellPadding: '1.75rem 2rem',
      cellFontSize: '1.0625rem',
      cellColor: '#FFCCE8',
      loadingOverlayBg: 'rgba(5, 3, 7, 0.85)',
    },
    cardComponent: {
      bg: '#120010',
      bgHover: '#1F001C',
      color: '#FFCCE8',
      border: '#4D0033',
      borderHover: '#801A55',
      borderAccentHover: 'rgba(182, 255, 0, 0.35)',
      shadow: '0 4px 14px rgba(255, 0, 170, 0.5)',
      shadowHover: '0 10px 28px rgba(182, 255, 0, 0.4)',
      shadowElevated: '0 20px 50px rgba(0, 229, 255, 0.4)',
      headerBorder: '#4D0033',
      headerColor: '#FF99DD',
      titleColor: '#FFCCE8',
      subtitleColor: '#FFB300',
      bodyColor: '#D9A3CC',
      footerBorder: '#4D0033',
      footerBg: '#0A0009',
    },
    modal: {
      bg: '#1F0016',
      color: '#FFCCE8',
      shadow: '0 30px 70px rgba(255, 0, 170, 0.5)',
      overlayBg: 'rgba(182, 255, 0, 0.35)',
      overlayBackdrop: 'blur(24px)',
      headerBg: '#33001F',
      headerBorder: '#66002B',
      titleColor: '#FF99DD',
      subtitleColor: '#FFB300',
      bodyColor: '#D9A3CC',
      footerBorder: '#66002B',
      footerBg: '#1F0016',
      closeColor: '#B3668F',
      closeColorHover: '#FF66CC',
      closeBgHover: 'rgba(255, 0, 170, 0.18)',
    },
    tabs: {
      border: '#4D0033',
      color: '#B3668F',
      colorHover: '#FF99DD',
      colorActive: '#FF66CC',
      bgHover: 'rgba(255, 0, 170, 0.1)',
      borderActive: '#FF00AA',
    },
  },
};

/**
 * Torture fixture paired with the `light` base theme.
 *
 * Character: glare-white canvas, violent violet primary, hot-orange
 * secondary, teal accent, semantics shifted off bithire's, wide serif
 * typography, non-monotonic radius scale at the opposite extremes from the
 * dark fixture, densest layout, heavy saturated colored-glow shadows, and
 * real glass/gradient/overlay values.
 */
export const tortureLightBrandTheme: BrandTheme = {
  id: 'torture-light',
  name: 'Torture Light',

  palette: {
    primaryColor: '#7A00FF',
    secondaryColor: '#FF5A00',
    accentColor: '#00B3A4',
    darkPrimaryColor: '#9B33FF',
    darkSecondaryColor: '#FF7A33',
    darkAccentColor: '#33CCBD',
    backgroundColor: '#FDFDFF',
    // A hostile dark ground so the fixture declares BOTH grounds and the probe
    // list stays fully covered. torture-light is rendered in clear mode, so this
    // value is never painted -- it exists to be declared.
    darkBackgroundColor: '#12001F',
    successColor: '#00B37A',
    warningColor: '#E6B800',
    errorColor: '#E60039',
    infoColor: '#00A3CC',
  },

  typography: {
    fontFamilyBase: "Georgia, 'Times New Roman', serif",
    fontFamilyHeading: "Georgia, 'Times New Roman', serif",
    fontFamilyMono: "'Courier New', 'Lucida Console', monospace",
    fontFamilyDisplay: "Georgia, 'Times New Roman', serif",
    // Contract only allows 'lighter' | 'normal' | 'heavier'. rottay uses
    // 'normal' and bithire uses 'heavier', so 'lighter' is the only value left.
    headingWeightBias: 'lighter',
    headingLetterSpacing: '0.16em',
    labelStyle: 'capitalize',
    letterSpacing: {
      display: '0.09em',
      heading: '0.12em',
      body: '0.05em',
      mono: '0.06em',
    },
    lineHeight: {
      display: 0.9,
      heading: 1.35,
      body: 2.4,
      tight: 0.8,
      relaxed: 2.8,
    },
  },

  surfaces: {
    densityScale: 0.68,
    borderRadius: { sm: '1px', md: '32px', lg: '3px', xl: '48px' },
    shadows: {
      sm: '0 2px 6px rgba(122, 0, 255, 0.45)',
      md: '0 6px 18px rgba(255, 90, 0, 0.40), 0 2px 8px rgba(122, 0, 255, 0.30)',
      lg: '0 14px 34px rgba(0, 179, 164, 0.42), 0 4px 14px rgba(255, 90, 0, 0.32)',
      xl: '0 26px 60px rgba(122, 0, 255, 0.40), 0 10px 30px rgba(0, 179, 164, 0.30)',
    },
    glass: { blur: '22px', background: 'rgba(122, 0, 255, 0.12)', border: 'rgba(255, 90, 0, 0.32)' },
    gradients: {
      primary: 'linear-gradient(135deg, #7A00FF, #FF5A00)',
      surface: 'linear-gradient(180deg, #FFFFFF, #F3E9FF)',
      mesh: 'radial-gradient(circle at 80% 20%, rgba(122, 0, 255, 0.20), transparent 60%)',
    },
    overlays: {
      light: 'rgba(122, 0, 255, 0.08)',
      medium: 'rgba(255, 90, 0, 0.14)',
      heavy: 'rgba(0, 179, 164, 0.22)',
    },
  },

  motion: {
    intensity: 0.05,
    entrance: 'slideUp',
    entranceDuration: 20,
    hoverLift: 11,
    hoverScale: 0.85,
    useSpring: false,
    springTension: 500,
    springFriction: 60,
    staggerDelay: 5,
    staggerMax: 60,
    pulseSpeed: 'none',
    // Contract only allows 'pulse' | 'shimmer' | 'wave'. rottay uses
    // 'shimmer' and bithire uses 'pulse', so 'wave' is the only value left.
    skeletonStyle: 'wave',
    // rottay and bithire both set this true, so false is the only value
    // that differs from both.
    countUpEnabled: false,
  },

  charts: {
    // rottay and bithire both set this true, so false is the only value
    // that differs from both.
    animateOnMount: false,
    mountDuration: 3000,
    // Contract only allows 'sharp' | 'smooth' | 'step'. rottay uses 'smooth'
    // and bithire uses 'sharp', so 'step' is the only value left.
    lineStyle: 'step',
    showDots: false,
    useGradientFill: true,
    // Contract only allows 'minimal' | 'detailed' | 'glass'. rottay uses
    // 'minimal' and bithire uses 'detailed', so 'glass' is the only value left.
    tooltipStyle: 'glass',
  },

  chrome: {
    card: {
      // Contract only allows 'sm' | 'md' | 'lg'. rottay uses 'md' and
      // bithire uses 'sm', so 'lg' is the only value left.
      defaultElevation: 'lg',
      // Contract only allows 'none' | 'lift-one' | 'lift-two'. rottay uses
      // 'lift-two' and bithire uses 'lift-one', so 'none' is the only value left.
      hoverElevation: 'none',
      showBorder: false,
      // rottay and bithire both set this true, so false is the only value
      // that differs from both.
      hoverTint: false,
      // Contract only allows 'compact' | 'normal' | 'spacious'. rottay uses
      // 'normal' and bithire uses 'compact', so 'spacious' is the only value left.
      paddingDensity: 'spacious',
    },
    accent: {
      // Contract only allows 'top' | 'left' | 'none'. rottay uses 'top' and
      // bithire uses 'left', so 'none' is the only value left.
      barPosition: 'none',
      barThickness: 9,
      // Contract only allows 'solid' | 'gradient' | 'animated'. rottay uses
      // 'gradient' and bithire uses 'solid', so 'animated' is the only value left.
      barStyle: 'animated',
      iconContainerShape: 'none',
      // Contract only allows 'rounded' | 'pill' | 'square'. rottay uses
      // 'rounded' and bithire uses 'pill', so 'square' is the only value left.
      badgeShape: 'square',
      dividerStyle: 'dotted',
    },
    sidebar: {
      bg: '#FFF4FE',
      border: '#FFD400',
      text: '#7A00FF',
      textMuted: '#B366FF',
      width: '350px',
      collapsedWidth: '120px',
      headerHeight: '130px',
      groupFontSize: '20px',
      groupFontWeight: 800,
      groupColor: '#FF5A00',
      groupLetterSpacing: '0.26em',
      itemFontSize: '20px',
      itemFontWeight: 300,
      itemFontWeightActive: 850,
      itemColor: '#00B3A4',
      itemColorActive: '#7A00FF',
      itemBgActive: 'rgba(122, 0, 255, 0.22)',
      itemBgHover: 'rgba(255, 90, 0, 0.16)',
      itemPadding: '3px 26px',
      iconSize: '26px',
      footerBg: '#FDFDFF',
    },
    layout: {
      bg: '#FDFDFF',
      headerBg: 'rgba(122, 0, 255, 0.10)',
      headerBackdrop: 'blur(32px)',
      headerBorder: 'rgba(255, 90, 0, 0.4)',
      siderBg: '#FFF4FE',
      siderBorder: '#FFD400',
    },
    shell: {
      gridSize: '4px',
      gridLine: 'rgba(122, 0, 255, 0.35)',
      gridOpacity: 0.55,
    },
    controls: {
      buttonPrimary: {
        bg: '#7A00FF',
        bgHover: '#6600CC',
        bgActive: '#5200A3',
        text: '#FFF9E6',
        color: '#FFF9E6',
        border: '#F0E0FF',
        shadow: '0 2px 8px rgba(122, 0, 255, 0.4)',
        shadowHover: '0 6px 20px rgba(255, 90, 0, 0.35)',
      },
      buttonSecondary: {
        bg: '#FFE8D9',
        bgHover: '#FFD9BF',
        bgActive: '#FFC9A6',
        text: '#B34700',
        color: '#B34700',
        border: '#FFB380',
        borderHover: 'rgba(255, 90, 0, 0.4)',
      },
      buttonDefault: {
        bg: '#F3E9FF',
        bgHover: '#E6D2FF',
        bgActive: '#D9BAFF',
        text: '#4B0082',
        color: '#4B0082',
        border: '#C299FF',
        borderHover: 'rgba(122, 0, 255, 0.35)',
      },
      buttonGhost: {
        // rottay and bithire both use the literal 'transparent' string here,
        // so a near-invisible real color is used instead — visually ghost-like
        // but textually distinct from both.
        bg: 'rgba(122, 0, 255, 0.02)',
        bgHover: 'rgba(122, 0, 255, 0.14)',
        bgActive: 'rgba(122, 0, 255, 0.22)',
        text: '#00B3A4',
        color: '#00B3A4',
      },
      buttonText: {
        bg: 'rgba(255, 90, 0, 0.02)',
        bgHover: 'rgba(255, 90, 0, 0.14)',
        bgActive: 'rgba(255, 90, 0, 0.22)',
        text: '#00A3CC',
        color: '#00A3CC',
      },
      buttonLink: { color: '#7A00FF', colorHover: '#9B4DFF', colorActive: '#5200A3' },
      buttonSuccess: { bg: '#00A36B', bgHover: '#007A50', bgActive: '#005C3C', text: '#EFFFF8', color: '#EFFFF8', border: '#B8FFE0' },
      buttonWarning: { bg: '#E6A000', bgHover: '#B87F00', bgActive: '#8F6300', text: '#FFFBEB', color: '#FFFBEB', border: '#FFE8A3' },
      buttonError: { bg: '#E6003D', bgHover: '#B80030', bgActive: '#8F0025', text: '#FFEBF1', color: '#FFEBF1', border: '#FFB8CC' },
      buttonInfo: { bg: '#0099B8', bgHover: '#007A93', bgActive: '#005C70', text: '#EBFAFF', color: '#EBFAFF', border: '#A3E8F5' },
      disabled: { opacity: 0.15, bg: '#FFF0FA', text: '#D9A3CC', border: '#FFD9F0', borderColor: '#FFD9F0' },
      focusRing: '0 0 0 4px rgba(122, 0, 255, 0.5)',
      input: {
        bg: '#FFF5E0',
        bgHover: '#FFEAD1',
        bgFocus: '#FFF0D9',
        bgDisabled: '#FFF7EE',
        color: '#4B0082',
        colorPlaceholder: '#8A5CC2',
        colorDisabled: '#D9A3CC',
        border: '#FFB84D',
        borderHover: '#FFCC80',
        borderFocus: 'rgba(122, 0, 255, 0.55)',
        borderDisabled: '#FFE0CC',
        disabledOpacity: 0.1,
        shadowFocus: '0 0 0 5px rgba(122, 0, 255, 0.35)',
        filled: { bg: '#FFEAD1', bgHover: '#FFDDC2', bgFocus: '#FFEAD1' },
        addon: { bg: '#FFEAD1', color: '#8A5CC2', border: '#FFE0CC' },
        label: { color: '#00B3A4' },
        helper: { color: '#8A5CC2' },
        clear: { color: '#8A5CC2', colorHover: '#00B3A4' },
        successBorder: '#00A36B',
        successShadowFocus: '0 0 0 4px rgba(0, 179, 122, 0.3)',
        warningBorder: '#E6A000',
        warningShadowFocus: '0 0 0 4px rgba(230, 184, 0, 0.3)',
        errorBorder: '#E6003D',
        errorShadowFocus: '0 0 0 4px rgba(230, 0, 61, 0.3)',
        errorColor: '#E6003D',
      },
    },
    table: {
      bg: '#FDFDFF',
      border: '#FFD400',
      headerBg: '#FFF0D9',
      headerColor: '#7A00FF',
      headerFontWeight: 300,
      headerFontSize: '1.15rem',
      rowBg: '#FDFDFF',
      rowBgHover: 'rgba(122, 0, 255, 0.08)',
      rowBgStriped: '#FFF8EE',
      rowBgSelected: 'rgba(255, 90, 0, 0.14)',
      rowBorder: '#FFE066',
      cellPadding: '0.25rem 0.375rem',
      cellFontSize: '0.70rem',
      cellColor: '#4B0082',
      loadingOverlayBg: 'rgba(253, 253, 255, 0.85)',
    },
    cardComponent: {
      bg: '#FFF9F0',
      bgHover: '#FFF0DC',
      color: '#4B0082',
      border: '#FFD466',
      borderHover: '#FFC233',
      borderAccentHover: 'rgba(0, 179, 164, 0.35)',
      shadow: '0 4px 14px rgba(122, 0, 255, 0.4)',
      shadowHover: '0 10px 28px rgba(255, 90, 0, 0.35)',
      shadowElevated: '0 20px 50px rgba(0, 179, 164, 0.35)',
      headerBorder: '#FFD466',
      headerColor: '#7A00FF',
      titleColor: '#4B0082',
      subtitleColor: '#B34700',
      bodyColor: '#6B2FA3',
      footerBorder: '#FFD466',
      footerBg: '#FFFCF7',
    },
    modal: {
      bg: '#FFF0FA',
      color: '#4B0082',
      shadow: '0 30px 70px rgba(122, 0, 255, 0.4)',
      overlayBg: 'rgba(255, 90, 0, 0.30)',
      overlayBackdrop: 'blur(28px)',
      headerBg: '#F3E0FF',
      headerBorder: '#E0C2FF',
      titleColor: '#7A00FF',
      subtitleColor: '#B34700',
      bodyColor: '#6B2FA3',
      footerBorder: '#E0C2FF',
      footerBg: '#FFF0FA',
      closeColor: '#B366FF',
      closeColorHover: '#7A00FF',
      closeBgHover: 'rgba(122, 0, 255, 0.14)',
    },
    tabs: {
      border: '#FFD466',
      color: '#8A5CC2',
      colorHover: '#4B0082',
      colorActive: '#7A00FF',
      bgHover: 'rgba(122, 0, 255, 0.08)',
      borderActive: '#7A00FF',
    },
  },
};

/**
 * The CSS variables the whitelabel probe asserts on. Every one of these MUST
 * resolve to a different value under a torture fixture than under the
 * matching first-party theme; the unit test enforces it.
 */
export const TORTURE_PROBE_VARS: readonly string[] = [
  '--ds-button-primary-bg',
  '--ds-button-primary-color',
  '--ds-button-secondary-bg',
  '--ds-input-bg',
  '--ds-input-border',
  '--ds-input-color',
  '--ds-card-bg',
  '--ds-card-border',
  '--ds-table-header-bg',
  '--ds-table-header-color',
  '--ds-table-cell-color',
  '--ds-modal-bg',
  '--ds-tabs-border',
  '--ds-tab-color-active',
  '--ds-radius-sm',
  '--ds-radius-md',
  '--ds-radius-lg',
  '--ds-radius-xl',
  '--ds-font-family-base',
];
