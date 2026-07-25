/**
 * The Management Miami tenant migration/regression fixture.
 *
 * This checked-in specimen is intentionally explicit-only: production tenant
 * identity is published from the tenancy DB and compiled by the runtime v2
 * contract. It must never be added to KNOWN_TENANTS, tokens.brandThemes, or a
 * shipped tenant CSS bundle. The fixture exists to make migrations and visual
 * regression evidence reproducible without becoming a second runtime truth.
 *
 * It is authored to read as a different
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
 *    (sidebar, table, toolbar) is warm-tempered (#9B8A73 / rgba(46,38,28,*))
 *    rather than bithire's cool blue-grey (#D3DEEA / rgba(22,42,67,*)).
 * 5. Accent grammar — top-position gradient accent bar, square badges/icon
 *    containers, dashed dividers, against bithire's left-solid bar and pill
 *    badges.
 * 6. Effects posture — a warmer, more expressive effect-intensity dial against
 *    bithire's quieter operational materiality; this is a legitimate
 *    per-tenant choice rather than a shared-vertical convergence rule.
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

import type { BrandTheme } from "../../../../../../contracts/composition/tenants/themes";

export const themanagementmiamiBrandTheme: BrandTheme = {
  id: "themanagementmiami",
  name: "The Management Miami",

  palette: {
    primaryColor: "#0F766E",
    secondaryColor: "#8C6D46",
    accentColor: "#B44F3C",
    textPrimaryColor: "#2E261C",
    textSecondaryColor: "#5C4F3D",
    textMutedColor: "#6B5B48",
    textDisabledColor: "#74644F",
    borderPrimaryColor: "#C8B9A5",
    borderSecondaryColor: "#E2D9CC",
    // Same Art Deco palette, lifted for AA text/non-text contrast on the
    // canonical dark canvas instead of reusing the light-ground seeds.
    darkPrimaryColor: "#4FB3AA",
    darkSecondaryColor: "#D0AE78",
    darkAccentColor: "#D97864",
    backgroundColor: "#FBF6EC",
    successColor: "#3F6F2A",
    warningColor: "#8A6B00",
    errorColor: "#C0392B",
    infoColor: "#5B6FA8",
  },

  typography: {
    fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
    fontFamilyHeading:
      "var(--ds-font-pack-editorial-display, Georgia, 'Times New Roman', serif)",
    fontFamilyMono: "'Courier New', Courier, monospace",
    fontFamilyDisplay:
      "var(--ds-font-pack-editorial-display, Georgia, 'Times New Roman', serif)",
    headingWeightBias: "normal",
    // Serifs refuse negative tracking (bithire's sans stack uses -0.01em).
    headingLetterSpacing: "0em",
    labelStyle: "capitalize",
    letterSpacing: {
      display: "0em",
      heading: "0em",
      body: "0.01em",
      mono: "0em",
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
    borderRadius: { sm: "4px", md: "6px", lg: "8px", xl: "12px" },
    // Shadow-led separation strategy: warm sepia shadows carry the depth work
    // that bithire assigns to cool-bordered flat cards.
    shadows: {
      sm: "0 1px 2px rgba(46, 38, 28, 0.06)",
      md: "0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)",
      lg: "0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)",
      xl: "0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)",
    },
    glass: {
      blur: "16px",
      background: "rgba(255, 254, 251, 0.55)",
      border: "rgba(226, 217, 204, 0.6)",
    },
    gradients: {
      primary: "linear-gradient(135deg, #0F766E, #B44F3C)",
      surface: "linear-gradient(180deg, #FFFEFB 0%, #FBF3E7 100%)",
      mesh: "radial-gradient(circle at 80% 15%, rgba(180, 79, 60, 0.12), transparent 60%)",
    },
    // Warmer and more expressive than the BitHire vertical baseline.
    effectIntensity: 0.45,
    overlays: {
      light: "rgba(46, 38, 28, 0.03)",
      medium: "rgba(46, 38, 28, 0.06)",
      heavy: "rgba(46, 38, 28, 0.12)",
    },
  },

  motion: {
    intensity: 0.62,
    entrance: "slideUp",
    entranceDuration: 260,
    hoverLift: 2,
    hoverScale: 1.0,
    useSpring: true,
    springTension: 210,
    springFriction: 24,
    staggerDelay: 40,
    staggerMax: 240,
    pulseSpeed: "normal",
    skeletonStyle: "shimmer",
    countUpEnabled: true,
  },

  charts: {
    animateOnMount: true,
    mountDuration: 500,
    lineStyle: "smooth",
    showDots: false,
    useGradientFill: true,
    tooltipStyle: "glass",
    colorScheme: "default",
  },

  chrome: {
    card: {
      defaultElevation: "lg",
      hoverElevation: "lift-two",
      // Shadow-led: no resting border on the card component itself.
      showBorder: false,
      hoverTint: false,
      paddingDensity: "spacious",
    },
    accent: {
      barPosition: "top",
      barThickness: 2,
      barStyle: "gradient",
      iconContainerShape: "square",
      badgeShape: "square",
      dividerStyle: "dashed",
    },
    sidebar: {
      bg: "#FFFEFB",
      footerBg: "#FBF3E7",
      border: "#9B8A73",
      text: "#2E261C",
      textMuted: "#74644F",
      groupFontSize: "0.6875rem",
      groupFontWeight: 700,
      groupColor: "#74644F",
      groupLetterSpacing: "0.08em",
      itemFontSize: "0.875rem",
      itemFontWeight: 400,
      itemFontWeightActive: 700,
      itemColor: "#5C4F3D",
      itemColorActive: "#0F766E",
      itemBgActive: "var(--ds-tint-8)",
      itemBgHover: "#FBF3E7",
      itemPadding: "8px 12px",
      iconSize: "18px",
    },
    layout: {
      bg: "#FFFEFB",
      headerBg: "rgba(255, 254, 251, 0.90)",
      headerBackdrop: "blur(10px)",
      headerBorder: "#9B8A73",
      siderBg: "#FFFEFB",
      siderBorder: "#9B8A73",
    },
    toolbar: {
      bg: "color-mix(in srgb, #0F766E 4%, #FFFEFB)",
      border: "#9B8A73",
      borderBottom: "color-mix(in srgb, #9B8A73 82%, transparent)",
      color: "#2E261C",
      shadow: "0 1px 2px rgba(46, 38, 28, 0.04)",
      radius: "8px",
      padding: "0.75rem 1rem",
      gap: "0.75rem",
      controlBg: "#FFFEFB",
      controlBorder: "#96856D",
      controlColor: "#2E261C",
      divider: "#EFE7D8",
    },
    filterPill: {
      bg: "#FFFEFB",
      border: "#9B8A73",
      color: "#5C4F3D",
      shadow: "0 1px 2px rgba(46, 38, 28, 0.03)",
      frameBorder: "color-mix(in srgb, #0F766E 10%, #9B8A73)",
      frameShadow:
        "0 1px 2px rgba(46, 38, 28, 0.03), inset 0 0 0 1px rgba(255, 254, 251, 0.5)",
      hoverBg: "var(--ds-tint-4)",
      hoverBorder: "color-mix(in srgb, #0F766E 16%, #9B8A73)",
      activeBg: "var(--ds-tint-8)",
      activeBorder: "color-mix(in srgb, #0F766E 28%, #9B8A73)",
      activeColor: "#0F766E",
      activeShadow:
        "inset 0 0 0 1px color-mix(in srgb, #0F766E 28%, #9B8A73), 0 1px 2px rgba(46, 38, 28, 0.05)",
      focusRing: "0 0 0 3px var(--ds-tint-24)",
      countBg: "#FFFEFB",
      countActiveBg: "#FFFEFB",
      countBorder: "color-mix(in srgb, #9B8A73 82%, transparent)",
      countActiveBorder: "color-mix(in srgb, #0F766E 24%, #96856D)",
      countRing: "inset 0 0 0 1px color-mix(in srgb, #9B8A73 82%, transparent)",
      countActiveRing:
        "inset 0 0 0 1px color-mix(in srgb, #0F766E 24%, #96856D)",
    },
    badge: {
      fontFamily: "Optima, Candara, 'Noto Sans', sans-serif",
      fontWeight: 600,
      letterSpacing: "0.025em",
      gap: "0.375rem",
      radius: "3px",
      chipRadius: "4px",
      pillRadius: "6px",
      surface: "#FFFEFB",
      ink: "#2E261C",
      frame: "#9B8A73",
      highlight: "inset 0 1px 0 rgba(255, 254, 251, 0.82)",
      shadow: "0 2px 5px rgba(46, 38, 28, 0.08)",
      surfaceHover: "#FBF3E7",
      inkHover: "#0B5A54",
      frameHover: "color-mix(in srgb, #0F766E 42%, #9B8A73)",
      shadowHover: "0 10px 22px -13px rgba(46, 38, 28, 0.48)",
      hoverTransform: "translateY(-2px)",
      surfacePressed: "#F5E9D8",
      framePressed: "#0F766E",
      pressTransform: "translateY(0) scale(0.98)",
      focusRing: "0 0 0 3px color-mix(in srgb, #0F766E 28%, transparent)",
      selectedSurface: "color-mix(in srgb, #0F766E 12%, #FFFEFB)",
      selectedInk: "#0B5A54",
      selectedFrame: "#0F766E",
      selectedShadow: "inset 0 0 0 1px rgba(15, 118, 110, 0.14), 0 2px 5px rgba(46, 38, 28, 0.08)",
      iconBg: "#FBF3E7",
      iconBorder: "#9B8A73",
      iconRadius: "2px",
      countBg: "#FBF3E7",
      countBorder: "#9B8A73",
      countRadius: "2px",
      countFontFamily: "'Courier New', Courier, monospace",
      removeBg: "#FBF3E7",
      removeBorder: "#9B8A73",
      removeRadius: "2px",
      removeHoverBg: "#F2DFC6",
      motionDuration: "190ms",
      motionEasing: "var(--ds-motion-spring, cubic-bezier(0.2, 0.8, 0.2, 1))",
      pulseDuration: "1.35s",
      pulseScale: 1.2,
      touchTarget: "2.875rem",
    },
    breadcrumb: {
      bg: "color-mix(in srgb, #0F766E 4%, #FFFEFB)",
      border: "color-mix(in srgb, #9B8A73 82%, transparent)",
      color: "#5C4F3D",
      linkColor: "#0F766E",
      itemColor: "#5C4F3D",
      colorHover: "#0B5A54",
      colorActive: "#2E261C",
      separatorColor: "#7D6D58",
      fontSize: "0.75rem",
      fontWeight: 400,
      padding: "0.625rem 1rem",
    },
    search: {
      bg: "#FFFEFB",
      border: "#9B8A73",
      color: "#2E261C",
      shadow:
        "0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)",
      radius: "12px",
      inputBg: "#FFFEFB",
      inputBorder: "#96856D",
      inputColor: "#2E261C",
      placeholderColor: "#7D6D58",
      iconColor: "#7D6D58",
      clearColor: "#74644F",
      clearColorHover: "#5C4F3D",
      resultBg: "#FFFEFB",
      resultBgHover: "#FBF3E7",
      resultBorder: "#EFE7D8",
      resultShadow: "0 1px 2px rgba(46, 38, 28, 0.04)",
      resultTitleColor: "#2E261C",
      resultMetaColor: "#74644F",
      categoryColor: "#74644F",
      emptyBg: "#FBF3E7",
    },
    controls: {
      fieldGeometry: {
        gap: "9px",
        radius: "6px",
        fontFamily: "var(--ds-font-family-body)",
        fontWeight: 400,
        letterSpacing: "0.012em",
        borderWidth: "1px",
        borderStyle: "solid",
        messageGap: "6px",
        groupGap: "0px",
        groupGapSeparated: "12px",
        groupOverlap: "-1px",
        groupMinItemWidth: "216px",
        formFieldGap: "8px",
        horizontalGap: "20px",
        labelOffsetY: "2px",
        requiredGap: "0.35em",
        formFieldDisabledOpacity: 0.58,
        labelFontSize: "13px",
        labelFontWeight: 700,
        labelLetterSpacing: "0.045em",
        labelLineHeight: "1.45",
        helperFontSize: "12px",
        helperLineHeight: "1.55",
        affixSize: "24px",
        affixSizeCompact: "20px",
        affixRadius: "4px",
        actionSize: "28px",
        actionRadius: "4px",
        touchTargetMin: "44px",
        loadingSize: "17px",
        loadingStroke: "2.25",
        loadingDuration: "920ms",
        textareaMinHeight: "120px",
        textareaMaxHeight: "480px",
        textareaPaddingX: "15px",
        textareaPaddingY: "12px",
        textareaRadius: "7px",
        textareaResize: "vertical",
        transitionDuration: "220ms",
        transitionTiming: "cubic-bezier(0.22, 1, 0.36, 1)",
        sm: { height: "34px", paddingX: "11px", paddingY: "6px", fontSize: "12px", lineHeight: "18px", iconSize: "15px", radius: "5px" },
        md: { height: "40px", paddingX: "14px", paddingY: "9px", fontSize: "14px", lineHeight: "22px", iconSize: "17px", radius: "6px" },
        lg: { height: "46px", paddingX: "16px", paddingY: "11px", fontSize: "15px", lineHeight: "24px", iconSize: "19px", radius: "7px" },
      },
      buttonPrimary: {
        bg: "#0F766E",
        bgHover: "#0B5A54",
        text: "#FFFEFB",
        color: "#FFFEFB",
        border: "transparent",
        shadow: "0 1px 2px rgba(46, 38, 28, 0.1)",
      },
      buttonSecondary: {
        bg: "transparent",
        bgHover: "var(--ds-tint-8)",
        text: "#0F766E",
        color: "#0F766E",
        border: "#0F766E",
      },
      buttonDefault: {
        bg: "#FFFEFB",
        bgHover: "#FBF3E7",
        text: "#2E261C",
        color: "#2E261C",
        border: "#96856D",
      },
      buttonGhost: {
        bg: "transparent",
        bgHover: "#FBF3E7",
        text: "#5C4F3D",
        color: "#5C4F3D",
      },
      disabled: {
        opacity: 0.45,
        bg: "#FBF8F2",
        text: "#74644F",
        border: "#EFE7D8",
        borderColor: "#EFE7D8",
      },
      input: {
        bg: "#FFFEFB",
        bgHover: "#FFFDF8",
        bgFocus: "#FFFFFF",
        border: "#96856D",
        borderHover: "#74644F",
        borderFocus: "#0F766E",
        shadowRest: "0 1px 0 rgba(46, 38, 28, 0.04)",
        shadowHover: "0 4px 14px rgba(46, 38, 28, 0.09)",
        shadowFocus: "0 0 0 2px rgba(15, 118, 110, 0.18), 0 4px 12px rgba(46, 38, 28, 0.08)",
        insetShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.72)",
        caretColor: "#0F766E",
        selectionBg: "rgba(15, 118, 110, 0.18)",
        selectionColor: "#2E261C",
        color: "#2E261C",
        colorPlaceholder: "#7D6D58",
        placeholderOpacity: 0.82,
        bgDisabled: "#FBF8F2",
        colorDisabled: "#74644F",
        borderDisabled: "#EFE7D8",
        disabledOpacity: 0.45,
        filled: { bg: "#FBF8F2", bgHover: "#F7F0E5", bgFocus: "#FFFEFB", border: "#C6B79F" },
        addon: { bg: "#F4EBDD", color: "#5C4F3D", border: "#96856D", radius: "6px", fontWeight: 700 },
        affix: { bg: "#FBF3E7", color: "#5C4F3D", border: "1px solid #EFE7D8", paddingX: "3px" },
        label: { color: "#5C4F3D", requiredColor: "#A54432", disabledColor: "#8B7C68" },
        helper: { color: "#74644F", errorColor: "#A54432", errorFontWeight: 700 },
        clear: { color: "#74644F", colorHover: "#2E261C", bg: "transparent", bgHover: "#F4EBDD", border: "1px solid transparent", borderHover: "#96856D", shadowHover: "0 2px 6px rgba(46, 38, 28, 0.12)", focusRing: "0 0 0 2px rgba(15, 118, 110, 0.22)", activeTransform: "scale(0.92) rotate(-2deg)" },
        readOnly: { bg: "#FBF8F2", color: "#5C4F3D", border: "#C6B79F", borderStyle: "dashed", cursor: "text" },
        loadingColor: "#0F766E",
        autofill: { bg: "#F7F0E5", color: "#2E261C", caret: "#0F766E" },
        count: { color: "#74644F", colorWarning: "#9A5A18", colorError: "#A54432" },
        successBorder: "#0F766E",
        successBg: "color-mix(in srgb, #0F766E 5%, #FFFEFB)",
        warningBorder: "#B26A20",
        warningBg: "color-mix(in srgb, #B26A20 6%, #FFFEFB)",
        errorBorder: "#A54432",
        errorBg: "color-mix(in srgb, #A54432 5%, #FFFEFB)",
        errorColor: "#2E261C",
      },
    },
    table: {
      bg: "#FFFEFB",
      border: "#9B8A73",
      radius: "8px",
      // White + hairline instead of bithire's tinted paper-band header.
      headerBg: "#FFFFFF",
      headerBgHover: "#FBF3E7",
      headerColor: "#5C4F3D",
      headerFontWeight: 700,
      headerFontSize: "0.6875rem",
      headerBorder: "color-mix(in srgb, #9B8A73 82%, transparent)",
      headerShadow:
        "inset 0 -1px 0 color-mix(in srgb, #9B8A73 82%, transparent)",
      rowBg: "#FFFEFB",
      rowBgHover: "#FBF3E7",
      rowBgStriped: "#FCF8F0",
      rowBgSelected: "var(--ds-tint-12)",
      rowBgExpanded: "#FBF3E7",
      rowBorder: "#EFE7D8",
      rowHoverShadow:
        "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 24%, transparent)",
      cellPadding: "0.75rem 1rem",
      cellFontSize: "0.875rem",
      cellColor: "#2E261C",
      filterRowBg: "#FBF3E7",
      filterFocusShadow:
        "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 14%, transparent), 0 0 8px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)",
      resizeBg: "color-mix(in srgb, #0F766E 22%, #9B8A73)",
      resizeBgHover: "#0F766E",
      reorderBg: "var(--ds-tint-12)",
      actionBg: "#FFFEFB",
      actionBorder: "color-mix(in srgb, #9B8A73 70%, transparent)",
      sheen: "none",
      pageButtonHoverShadow: "0 1px 2px rgba(46, 38, 28, 0.06)",
      loadingOverlayBg: "rgba(255, 254, 251, 0.7)",
    },
    cardComponent: {
      padding: "1.25rem",
      paddingSm: "1rem",
      paddingMd: "1.25rem",
      paddingLg: "1.5rem",
      paddingXl: "1.75rem",
      bg: "#FFFEFB",
      bgHover: "#FEFCF7",
      color: "#2E261C",
      colorMuted: "#74644F",
      // Shadow-led: no border color set here either — the card relies on
      // shadow (below) for separation, matching chrome.card.showBorder=false.
      border: "transparent",
      borderColor: "transparent",
      shadow:
        "0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)",
      shadowHover:
        "0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)",
      radius: "8px",
      focusRing: "0 0 0 3px var(--ds-tint-24)",
      hoverTransform: "translateY(-2px) scale(1)",
      headerBorder: "#EFE7D8",
      headerBorderColor: "#EFE7D8",
      headerBg: "color-mix(in srgb, #FFFEFB 82%, #FBF3E7)",
      headerColor: "#5C4F3D",
      headerPadding: "1.25rem",
      titleColor: "#2E261C",
      titleFontWeight: 600,
      subtitleColor: "#74644F",
      bodyColor: "#2E261C",
      bodyPadding: "1.25rem",
      footerBorder: "#EFE7D8",
      footerBorderColor: "#EFE7D8",
      footerBg: "#FBF3E7",
      footerColor: "#5C4F3D",
      footerPadding: "1.25rem",
      imagePlaceholderBg: "#FBF3E7",
      imagePlaceholderColor: "#7D6D58",
    },
    metricCard: {
      bg: "#FFFEFB",
      border: "color-mix(in srgb, #0F766E 10%, #9B8A73)",
      borderHover: "color-mix(in srgb, #0F766E 24%, #9B8A73)",
      selectedBorder: "color-mix(in srgb, #0F766E 58%, #9B8A73)",
      selectedRing: "0 0 0 3px var(--ds-tint-12)",
      shadow:
        "0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)",
      shadowHover:
        "0 14px 32px rgba(46, 38, 28, 0.12), 0 4px 10px rgba(46, 38, 28, 0.06)",
      sheen: "none",
      iconBg: "color-mix(in srgb, #0F766E 8%, #FFFEFB)",
      iconBorder: "color-mix(in srgb, #0F766E 24%, #9B8A73)",
      labelColor: "#74644F",
      valueColor: "#2E261C",
      trendColor: "#3F6F2A",
      meterTrack: "color-mix(in srgb, #9B8A73 48%, #FBF3E7)",
      meterTrackBorder: "color-mix(in srgb, #9B8A73 82%, transparent)",
      meterFill: "linear-gradient(90deg, #0F766E, #B44F3C)",
      meterFillSuccess: "#3F6F2A",
      meterFillWarning: "#8A6B00",
      meterFillError: "#C0392B",
      meterFillNeutral: "#7D6D58",
    },
    signalCard: {
      bg: "#FFFEFB",
      border: "#9B8A73",
      borderHover: "color-mix(in srgb, #0F766E 18%, #9B8A73)",
      shadow:
        "0 4px 10px rgba(46, 38, 28, 0.08), 0 1px 3px rgba(46, 38, 28, 0.05)",
      iconBg: "color-mix(in srgb, #0F766E 8%, #FFFEFB)",
      iconBorder: "color-mix(in srgb, #0F766E 24%, #9B8A73)",
      titleColor: "#2E261C",
      bodyColor: "#5C4F3D",
      badgeBg: "var(--ds-tint-8)",
      badgeBorder: "color-mix(in srgb, #0F766E 28%, #9B8A73)",
      badgeColor: "#0F766E",
      sectionBg: "#FFFEFB",
      sectionAltBg: "color-mix(in srgb, #0F766E 4%, #FBF3E7)",
      meterTrack: "color-mix(in srgb, #9B8A73 48%, #FBF3E7)",
      meterTrackBorder: "color-mix(in srgb, #9B8A73 82%, transparent)",
      meterFill: "linear-gradient(90deg, #0F766E, #B44F3C)",
    },
  },
};
