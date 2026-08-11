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

  appearance: { defaultMode: 'dark' },

  /**
   * LIGHT mode. Authored as a typed overlay of the semantic
   * families: the compiler merges it over the body above, runs the same
   * family compilers, and emits only what moves. These values shipped as a
   * hand-written block in this vertical's artifact extension until R1-P.
   *
   * The `ramps` entries are the steps this mode ships today. Most were
   * pinned by hand in that block; the rest are pinned here because moving
   * the ground would otherwise re-derive them, and re-deriving is a sighted
   * decision rather than an architectural one. Deleting a pin returns that
   * step to the OKLCH derivation.
   */
  modes: {
    light: {
      palette: {
        ramps: {
          primary: {
            50: "#FAFAF9",
            100: "#F4F4F3",
            200: "#E5E5E3",
            300: "#D4D4D2",
            400: "#A3A3A1",
            500: "#6B6B6B",
            600: "#525252",
            700: "#3D3D3D",
            800: "#2A2A2A",
            900: "#0A0A0A",
          },
          secondary: {
            50: "#FAFAF9",
            100: "#F4F4F3",
            200: "#E5E5E3",
            300: "#D4D4D2",
            400: "#A3A3A1",
            500: "#6B6B6B",
            600: "#525252",
            700: "#3D3D3D",
            800: "#2A2A2A",
            900: "#171717",
          },
          accent: {
            50: "#FAFAF9",
            100: "#F4F4F3",
            200: "#E5E5E3",
            300: "#D4D4D2",
            400: "#A3A3A1",
            500: "#6B6B6B",
            600: "#525252",
            700: "#3D3D3D",
            800: "#2A2A2A",
            900: "#171717",
          },
          neutral: {
            50: "#FAFAF9",
            100: "#F4F4F3",
            200: "#E5E5E3",
            300: "#D4D4D2",
            400: "#A3A3A1",
            500: "#6B6B6B",
            600: "#525252",
            700: "#3D3D3D",
            800: "#2A2A2A",
            900: "#171717",
          },
          success: {
            50: "rgba(22, 163, 74, 0.06)",
            100: "rgba(22, 163, 74, 0.10)",
            200: "#BBF7D0",
            300: "#86EFAC",
            400: "#4ADE80",
            500: "#22C55E",
            600: "#16A34A",
            700: "#15803D",
            800: "#166534",
            900: "#14532D",
          },
          warning: {
            50: "rgba(217, 119, 6, 0.06)",
            100: "rgba(217, 119, 6, 0.10)",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#F59E0B",
            600: "#D97706",
            700: "#B45309",
            800: "#92400E",
            900: "#78350F",
          },
          error: {
            50: "rgba(220, 38, 38, 0.06)",
            100: "rgba(220, 38, 38, 0.10)",
            200: "#FECACA",
            300: "#FCA5A5",
            400: "#F87171",
            500: "#EF4444",
            600: "#DC2626",
            700: "#B91C1C",
            800: "#991B1B",
            900: "#7F1D1D",
          },
          info: {
            50: "rgba(37, 99, 235, 0.06)",
            100: "rgba(37, 99, 235, 0.10)",
            200: "#BFDBFE",
            300: "#93C5FD",
            400: "#60A5FA",
            500: "#3B82F6",
            600: "#2563EB",
            700: "#1D4ED8",
            800: "#1E40AF",
            900: "#1E3A8A",
          },
        },
        primaryColor: "#0A0A0A",
        primaryHoverColor: "#2A2A2A",
        primaryForegroundColor: "#FFFFFF",
        secondaryColor: "#6B6B6B",
        secondaryHoverColor: "#525252",
        accentColor: "#6B6B6B",
        accentHoverColor: "#525252",
        backgroundColor: "#FAFAF9",
        backgroundSecondaryColor: "#F4F4F3",
        backgroundTertiaryColor: "#EDEDEC",
        backgroundElevatedColor: "#FFFFFF",
        backgroundOverlayColor: "rgba(0, 0, 0, 0.48)",
        backgroundSurfaceColor: "#FFFFFF",
        textPrimaryColor: "#1A1A1A",
        textSecondaryColor: "#6B6B6B",
        textTertiaryColor: "#8A8A8A",
        textMutedColor: "#9C9C9C",
        textDisabledColor: "#C4C4C2",
        onPrimaryColor: "#FFFFFF",
        borderColor: "#E5E5E3",
        borderPrimaryColor: "#E5E5E3",
        borderSecondaryColor: "#D4D4D2",
        borderSubtleColor: "#EDEDEC",
        borderTertiaryColor: "#EDEDEC",
        borderFocusColor: "rgba(10, 10, 10, 0.32)",
        linkColor: "#1A1A1A",
        linkHoverColor: "#0A0A0A",
        linkVisitedColor: "#6B6B6B",
        successColor: "#16A34A",
        successBgColor: "rgba(22, 163, 74, 0.06)",
        successBorderColor: "rgba(22, 163, 74, 0.20)",
        warningColor: "#D97706",
        warningBgColor: "rgba(217, 119, 6, 0.06)",
        warningBorderColor: "rgba(217, 119, 6, 0.20)",
        errorColor: "#DC2626",
        errorBgColor: "rgba(220, 38, 38, 0.06)",
        errorBorderColor: "rgba(220, 38, 38, 0.20)",
        infoColor: "#2563EB",
        infoBgColor: "rgba(37, 99, 235, 0.06)",
        infoBorderColor: "rgba(37, 99, 235, 0.20)",
        interactiveBorderColor: "rgba(0, 0, 0, 0.12)",
        interactiveBgHoverColor: "rgba(0, 0, 0, 0.03)",
        interactiveBgActiveColor: "#EDEDEC",
        interactiveBgMutedColor: "#F4F4F3",
      },
      chrome: {
        controls: {
          input: {
            bg: "#FFFFFF",
            bgHover: "#FAFAF9",
            bgFocus: "#FFFFFF",
            bgDisabled: "#F4F4F3",
            color: "#1A1A1A",
            colorPlaceholder: "#9C9C9C",
            colorDisabled: "#A1A1AA",
            border: "#E5E5E3",
            borderHover: "#D4D4D2",
            borderFocus: "rgba(10, 10, 10, 0.40)",
            borderDisabled: "#E5E5E3",
            shadowFocus: "0 0 0 3px rgba(10, 10, 10, 0.08)",
            successShadowFocus: "0 0 0 2px rgba(22, 163, 74, 0.14)",
            warningShadowFocus: "0 0 0 2px rgba(217, 119, 6, 0.14)",
            errorBorder: "#DC2626",
            errorShadowFocus: "0 0 0 2px rgba(220, 38, 38, 0.14)",
            errorColor: "#DC2626",
            filled: {
              bg: "#F4F4F3",
              bgHover: "#EDEDEC",
              bgFocus: "#F4F4F3",
            },
            addon: {
              bg: "#F4F4F3",
              color: "#6B6B6B",
              border: "#E5E5E3",
            },
            clear: {
              color: "#9C9C9C",
              colorHover: "#6B6B6B",
            },
            label: {
              color: "#6B6B6B",
            },
            helper: {
              color: "#9C9C9C",
            },
          },
          buttonPrimary: {
            bg: "#0A0A0A",
            bgHover: "#2A2A2A",
            bgActive: "#3D3D3D",
            color: "#FFFFFF",
            shadow: "0 1px 2px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06)",
            shadowHover: "0 2px 8px rgba(0, 0, 0, 0.12)",
          },
          buttonSecondary: {
            bg: "#FFFFFF",
            bgHover: "#F4F4F3",
            bgActive: "#EDEDEC",
            color: "#1A1A1A",
            border: "#E5E5E3",
            borderHover: "#D4D4D2",
          },
          buttonDefault: {
            bg: "#FFFFFF",
            bgHover: "#FAFAF9",
            bgActive: "#F4F4F3",
            color: "#1A1A1A",
            border: "#E5E5E3",
            borderHover: "#D4D4D2",
          },
          buttonGhost: {
            bgHover: "rgba(0, 0, 0, 0.04)",
            bgActive: "rgba(0, 0, 0, 0.08)",
            color: "#6B6B6B",
          },
          buttonText: {
            bgHover: "rgba(0, 0, 0, 0.04)",
            bgActive: "rgba(0, 0, 0, 0.08)",
            color: "#6B6B6B",
          },
          buttonLink: {
            color: "#1A1A1A",
            colorHover: "#6B6B6B",
            colorActive: "#0A0A0A",
          },
          buttonError: {
            bg: "#DC2626",
            bgHover: "#B91C1C",
            bgActive: "#991B1B",
          },
          buttonInfo: {
            bg: "#2563EB",
            bgHover: "#1D4ED8",
            bgActive: "#1E40AF",
          },
          disabled: {
            bg: "#F4F4F3",
            text: "#A1A1AA",
            border: "#E5E5E3",
            borderColor: "#E5E5E3",
          },
          segmented: {
            bg: "#F4F4F3",
            itemBg: "transparent",
            itemBgSelected: "#FFFFFF",
            itemColor: "#9C9C9C",
            itemColorHover: "#6B6B6B",
            itemColorSelected: "#1A1A1A",
            shadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
          },
        },
        cardComponent: {
          bg: "#FFFFFF",
          bgHover: "#FAFAF9",
          color: "#1A1A1A",
          border: "#E5E5E3",
          borderHover: "#D4D4D2",
          borderAccentHover: "rgba(10, 10, 10, 0.16)",
          shadow: "0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
          shadowHover: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)",
          shadowElevated: "0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)",
          headerBorder: "#E5E5E3",
          headerColor: "#1A1A1A",
          titleColor: "#1A1A1A",
          subtitleColor: "#6B6B6B",
          imagePlaceholderBg: "#F4F4F3",
          imagePlaceholderColor: "#9C9C9C",
          bodyColor: "#6B6B6B",
          footerBorder: "#E5E5E3",
          footerBg: "#FAFAF9",
        },
        modal: {
          bg: "#FFFFFF",
          color: "#1A1A1A",
          shadow: "0 12px 32px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.06)",
          overlayBg: "rgba(0, 0, 0, 0.48)",
          headerBg: "#FAFAF9",
          headerBorder: "#E5E5E3",
          titleColor: "#1A1A1A",
          subtitleColor: "#6B6B6B",
          bodyColor: "#6B6B6B",
          footerBorder: "#E5E5E3",
          footerBg: "#FAFAF9",
          closeColor: "#9C9C9C",
          closeColorHover: "#1A1A1A",
          closeBgHover: "rgba(0, 0, 0, 0.04)",
        },
        table: {
          bg: "#FFFFFF",
          border: "#E5E5E3",
          headerBg: "#FAFAF9",
          headerColor: "#6B6B6B",
          rowBg: "#FFFFFF",
          rowBgHover: "#FAFAF9",
          rowBgStriped: "#FAFAF9",
          rowBgSelected: "rgba(10, 10, 10, 0.04)",
          rowBorder: "#EDEDEC",
          loadingOverlayBg: "rgba(255, 255, 255, 0.7)",
          cellColor: "#1A1A1A",
        },
        tabs: {
          border: "#E5E5E3",
          color: "#9C9C9C",
          colorHover: "#1A1A1A",
          colorActive: "#1A1A1A",
          bgHover: "rgba(0, 0, 0, 0.02)",
          borderActive: "#0A0A0A",
        },
        breadcrumb: {
          color: "#9C9C9C",
          colorHover: "#1A1A1A",
          colorActive: "#1A1A1A",
          separatorColor: "#D4D4D2",
        },
        sidebar: {
          bg: "#F4F4F3",
          border: "#E5E5E3",
          text: "#1A1A1A",
          textMuted: "#9C9C9C",
          groupFontSize: "11px",
          groupColor: "#9C9C9C",
          groupLetterSpacing: "0.04em",
          groupMarginTop: "8px",
          groupMarginBottom: "4px",
          groupPaddingTop: "10px",
          itemFontSize: "13px",
          itemFontWeight: "400",
          itemFontWeightActive: "500",
          itemColor: "#6B6B6B",
          itemColorActive: "#0A0A0A",
          itemBgActive: "rgba(0, 0, 0, 0.06)",
          itemBgHover: "rgba(0, 0, 0, 0.03)",
          itemIndent: "6px",
          itemPadding: "6px 10px",
          iconSize: "16px",
          footerBg: "#F4F4F3",
        },
        layout: {
          bg: "#FAFAF9",
          headerBg: "rgba(250, 250, 249, 0.82)",
          headerBorder: "#E5E5E3",
          siderBg: "#F4F4F3",
          siderBorder: "#E5E5E3",
        },
        shell: {
          gridLine: "rgba(0, 0, 0, 0.03)",
        },
      },
      surfaces: {
        borderRadius: {
          full: "9999px",
        },
        shadows: {
          sm: "0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
          md: "0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)",
          lg: "0 4px 8px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08)",
          xl: "0 8px 16px rgba(0, 0, 0, 0.06), 0 20px 48px rgba(0, 0, 0, 0.10)",
        },
      },
    },
  },

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
    /**
     * Hand-tuned ramp steps. Rottay does not want the even OKLCH derivation
     * for these roles: the steps are set against its own dark canvas. They
     * shipped as a root block in the artifact extension until the contract
     * could express a ramp step, which is what `ramps` is for.
     */
    ramps: {
      primary: {
        50: "#0C0C0E",
        100: "#131316",
        200: "#1A1A1E",
        300: "#2A2A2F",
        400: "#6B6B72",
        500: "#A0A0A5",
        600: "#C0C0C4",
        700: "#D4D4D8",
        800: "#E4E4E8",
        900: "#ECECEC",
      },
      secondary: {
        50: "#0C0C0E",
        100: "#131316",
        200: "#1A1A1E",
        300: "#2A2A2F",
        400: "#6B6B72",
        500: "#A0A0A5",
        600: "#C0C0C4",
        700: "#D4D4D8",
        800: "#E4E4E8",
        900: "#ECECEC",
      },
      accent: {
        50: "#0C0C0E",
        100: "#131316",
        200: "#1A1A1E",
        300: "#2A2A2F",
        400: "#6B6B72",
        500: "#A0A0A5",
        600: "#C0C0C4",
        700: "#D4D4D8",
        800: "#E4E4E8",
        900: "#ECECEC",
      },
      success: {
        50: "rgba(34, 197, 94, 0.08)",
        100: "rgba(34, 197, 94, 0.12)",
        200: "#6EE7B7",
        300: "#34D399",
        400: "#22C55E",
        500: "#16A34A",
        600: "#15803D",
        700: "#166534",
        800: "#14532D",
        900: "#052E16",
      },
      warning: {
        50: "rgba(245, 158, 11, 0.08)",
        100: "rgba(245, 158, 11, 0.12)",
        200: "#FDE68A",
        300: "#FCD34D",
        400: "#FBBF24",
        500: "#F59E0B",
        600: "#D97706",
        700: "#B45309",
        800: "#92400E",
        900: "#78350F",
      },
      error: {
        50: "rgba(239, 68, 68, 0.08)",
        100: "rgba(239, 68, 68, 0.12)",
        200: "#FECACA",
        300: "#FCA5A5",
        400: "#F87171",
        500: "#EF4444",
        600: "#DC2626",
        700: "#B91C1C",
        800: "#991B1B",
        900: "#7F1D1D",
      },
      info: {
        50: "rgba(59, 130, 246, 0.08)",
        100: "rgba(59, 130, 246, 0.12)",
        200: "#BFDBFE",
        300: "#93C5FD",
        400: "#60A5FA",
        500: "#3B82F6",
        600: "#2563EB",
        700: "#1D4ED8",
        800: "#1E40AF",
        900: "#1E3A8A",
      },
    },
    // Light-mode runtime colors mirror the explicit light artifact.
    primaryColor: '#FFFFFF',
    secondaryColor: '#A0A0A5',
    accentColor: '#A0A0A5',
    darkPrimaryColor: '#FFFFFF',
    darkSecondaryColor: '#A0A0A5',
    darkAccentColor: '#A0A0A5',
    darkBackgroundColor: '#0C0C0E',
    backgroundSecondaryColor: '#0F0F12',
    backgroundTertiaryColor: '#141417',
    backgroundElevatedColor: '#18181C',
    onPrimaryColor: '#0C0C0E',
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
      sm: 'var(--ds-elevation-1)',
      md: 'var(--ds-elevation-2)',
      lg: 'var(--ds-elevation-3)',
      xl: 'var(--ds-elevation-4)',
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
    /**
     * A status badge on a control plane is a label on a record, not a button.
     * The pill shape the DS and both sibling verticals use belongs to consumer
     * surfaces; Rottay squares it off onto the same radius ramp its inputs and
     * cards ride, which is what `technical-sharp` means in practice.
     */
    badge: {
      radius: 'var(--ds-radius-sm)',
      gap: 'var(--ds-spacing-1)',
      fontWeight: 'var(--ds-font-weight-medium)',
      lineHeight: 'var(--ds-line-height-none)',
    },

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
      /**
       * The control ramp. Rottay is a console: a screen is a table of rows with
       * inline controls, so the DS baseline (40px md, 56px xl) spends a third of
       * the viewport on air. One seed — `--ds-input-md-height` — sets the row,
       * and every other size is an offset from it, so a tenant that moves the
       * seed moves the whole ladder including Button.
       *
       * The sizes are px and not `calc(… * var(--ds-density-*))`: the consumers
       * already apply density themselves (`input.css`, `date-picker.css`,
       * `tree-select.css`, `button.css` all wrap these tokens in
       * `* var(--ds-density-effective-scale)`), so a factor here would apply
       * twice. Height is the seed; padding and gap derive from it optically.
       */
      fieldGeometry: {
        gap: 'var(--ds-spacing-2)',
        fontWeight: 'var(--ds-font-weight-normal)',
        letterSpacing: 'var(--ds-letter-spacing-body)',
        labelFontSize: 'var(--ds-font-size-xs)',
        labelFontWeight: 'var(--ds-font-weight-medium)',
        helperFontSize: 'var(--ds-font-size-xs)',
        loadingStroke: '1.5',
        transitionDuration: 'var(--ds-motion-fast)',
        transitionTiming: 'var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
        xs: {
          height: 'calc(var(--ds-input-md-height) - 0.5rem)',
          paddingX: 'calc(var(--ds-input-xs-height) * 0.35)',
          paddingY: 'calc(var(--ds-input-xs-height) * 0.2)',
          fontSize: 'var(--ds-font-size-xs)',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'var(--ds-icon-xs-size)',
        },
        sm: {
          height: 'calc(var(--ds-input-md-height) - 0.25rem)',
          paddingX: 'calc(var(--ds-input-sm-height) * 0.35)',
          paddingY: 'calc(var(--ds-input-sm-height) * 0.2)',
          fontSize: 'calc(0.8125rem * var(--ds-type-scale, 1))',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'calc(var(--ds-icon-sm-size) - 2px)',
        },
        md: {
          height: '2.25rem',
          paddingX: 'calc(var(--ds-input-md-height) * 0.35)',
          paddingY: 'calc(var(--ds-input-md-height) * 0.2)',
          fontSize: 'var(--ds-font-size-sm)',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'var(--ds-icon-sm-size)',
        },
        lg: {
          height: 'calc(var(--ds-input-md-height) + 0.375rem)',
          paddingX: 'calc(var(--ds-input-lg-height) * 0.35)',
          paddingY: 'calc(var(--ds-input-lg-height) * 0.2)',
          fontSize: 'var(--ds-font-size-base)',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'calc(var(--ds-icon-sm-size) + 2px)',
        },
        xl: {
          height: 'calc(var(--ds-input-md-height) + 0.875rem)',
          paddingX: 'calc(var(--ds-input-xl-height) * 0.35)',
          paddingY: 'calc(var(--ds-input-xl-height) * 0.2)',
          fontSize: 'var(--ds-font-size-lg)',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'var(--ds-icon-md-size)',
        },
      },

      /**
       * Button rides the same row height as the field, so a control strip lines
       * up without per-screen correction. Buttons take more horizontal room than
       * fields (0.42 of the height against 0.35) because a label needs shoulders
       * where a value does not.
       */
      buttonGeometry: {
        fontWeight: 'var(--ds-font-weight-medium)',
        letterSpacing: 'var(--ds-letter-spacing-body)',
        gap: 'calc(var(--ds-input-md-height) * 0.18)',
        xs: {
          height: 'var(--ds-input-xs-height)',
          paddingX: 'calc(var(--ds-input-xs-height) * 0.42)',
          gap: 'calc(var(--ds-input-xs-height) * 0.18)',
          fontSize: 'var(--ds-font-size-xs)',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'var(--ds-icon-xs-size)',
        },
        sm: {
          height: 'var(--ds-input-sm-height)',
          paddingX: 'calc(var(--ds-input-sm-height) * 0.42)',
          gap: 'calc(var(--ds-input-sm-height) * 0.18)',
          fontSize: 'calc(0.8125rem * var(--ds-type-scale, 1))',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'calc(var(--ds-icon-sm-size) - 2px)',
        },
        md: {
          height: 'var(--ds-input-md-height)',
          paddingX: 'calc(var(--ds-input-md-height) * 0.42)',
          gap: 'calc(var(--ds-input-md-height) * 0.18)',
          fontSize: 'var(--ds-font-size-sm)',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'var(--ds-icon-sm-size)',
        },
        lg: {
          height: 'var(--ds-input-lg-height)',
          paddingX: 'calc(var(--ds-input-lg-height) * 0.42)',
          gap: 'calc(var(--ds-input-lg-height) * 0.18)',
          fontSize: 'var(--ds-font-size-base)',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'calc(var(--ds-icon-sm-size) + 2px)',
        },
        xl: {
          height: 'var(--ds-input-xl-height)',
          paddingX: 'calc(var(--ds-input-xl-height) * 0.42)',
          gap: 'calc(var(--ds-input-xl-height) * 0.18)',
          fontSize: 'var(--ds-font-size-lg)',
          lineHeight: 'var(--ds-line-height-tight)',
          iconSize: 'var(--ds-icon-md-size)',
        },
      },

      // ---- CTRL-04 PRESERVATION PINS (R1 Cohort 1) ----
      // NOT new product decisions. Each value is what this vertical ALREADY
      // resolves today, moved from an implicit engine-tier default onto
      // explicit ownership so the engine defaults can be deleted without
      // changing what this vertical paints. Pinned BY REFERENCE because
      // --ds-shadow-* are dark-aware and a literal would regress dark mode.
      // Generated from receipts/cohort-1-button-shadow-state-census.json.
      buttonAI: {
        shadow: "var(--ds-shadow-button-rest)",
        shadowHover: "var(--ds-shadow-button-hover)",
        shadowActive: "var(--ds-shadow-button-rest)",
      },
      buttonDashed: {
        shadow: "none",
        shadowHover: "var(--ds-button-dashed-shadow)",
        shadowActive: "var(--ds-button-dashed-shadow)",
      },
      buttonPrimary: {
        shadowActive: "var(--ds-shadow-button-rest)", bg: '#FFFFFF', bgHover: '#E0E0E0', bgActive: '#D4D4D8', text: '#0C0C0E', color: '#0C0C0E', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.30)', shadowHover: '0 2px 12px rgba(255, 255, 255, 0.08)' },
      buttonSecondary: {
        shadow: "var(--ds-shadow-button-rest)",
        shadowHover: "var(--ds-shadow-button-hover)",
        shadowActive: "var(--ds-shadow-button-rest)", bg: '#2A2A2F', bgHover: '#3A3A40', bgActive: '#4A4A4F', text: '#ECECEC', color: '#ECECEC', border: '#3A3A40', borderHover: 'rgba(255, 255, 255, 0.14)' },
      buttonDefault: {
        shadow: "var(--ds-shadow-button-rest)",
        shadowHover: "var(--ds-shadow-button-hover)",
        shadowActive: "var(--ds-shadow-button-rest)", bg: '#18181B', bgHover: '#222226', bgActive: '#2A2A2F', text: '#ECECEC', color: '#ECECEC', border: '#3A3A40', borderHover: 'rgba(255, 255, 255, 0.18)' },
      buttonGhost: {
        shadow: "none",
        shadowHover: "var(--ds-button-ghost-shadow)",
        shadowActive: "var(--ds-button-ghost-shadow)", bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', bgActive: 'rgba(255, 255, 255, 0.08)', text: '#A0A0A5', color: '#A0A0A5' },
      buttonText: {
        shadow: "none",
        shadowHover: "var(--ds-button-text-shadow)",
        shadowActive: "var(--ds-button-text-shadow)", bg: 'transparent', bgHover: 'rgba(255, 255, 255, 0.05)', bgActive: 'rgba(255, 255, 255, 0.08)', text: '#A0A0A5', color: '#A0A0A5' },
      buttonLink: {
        shadow: "none",
        shadowHover: "var(--ds-button-link-shadow)",
        shadowActive: "var(--ds-button-link-shadow)", color: '#ECECEC', colorHover: '#FFFFFF', colorActive: '#D4D4D8' },
      buttonSuccess: {
        shadow: "var(--ds-shadow-success-sm)",
        shadowHover: "var(--ds-button-success-shadow)",
        shadowActive: "var(--ds-button-success-shadow)", bg: '#16A34A', bgHover: '#15803D', bgActive: '#166534', text: '#ffffff', color: '#ffffff', border: 'transparent' },
      buttonWarning: {
        shadow: "var(--ds-shadow-warning-sm)",
        shadowHover: "var(--ds-button-warning-shadow)",
        shadowActive: "var(--ds-button-warning-shadow)", bg: '#D97706', bgHover: '#B45309', bgActive: '#92400E', text: '#FFFFFF', color: '#FFFFFF', border: 'transparent' },
      buttonError: {
        shadow: "var(--ds-shadow-error-sm)",
        shadowHover: "var(--ds-shadow-error-sm)",
        shadowActive: "var(--ds-shadow-error-sm)", bg: '#EF4444', bgHover: '#DC2626', bgActive: '#B91C1C', text: '#ffffff', color: '#ffffff', border: 'transparent' },
      buttonInfo: {
        shadow: "var(--ds-shadow-button-rest)",
        shadowHover: "var(--ds-button-info-shadow)",
        shadowActive: "var(--ds-button-info-shadow)", bg: '#3B82F6', bgHover: '#2563EB', bgActive: '#1D4ED8', text: '#ffffff', color: '#ffffff', border: 'transparent' },
      disabled: { opacity: 0.4, bg: '#18181B', text: '#52525B', border: '#2A2A2F', borderColor: '#2A2A2F' },
      focusRing: 'var(--ds-focus-ring)',
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
        helper: { color: '#6B6B72', errorFontWeight: 'var(--ds-font-weight-medium)' },
        clear: { color: '#6B6B72', colorHover: '#A0A0A5' },
        /**
         * A read-only field in a control plane is a fact, not an empty slot: it
         * carries an id you are about to copy. The DS baseline dashes the border
         * and blocks the caret, which reads as "disabled". Rottay keeps the solid
         * border and the text cursor.
         */
        readOnly: { borderStyle: 'solid', cursor: 'text' },
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
      /**
       * The header is a fixed rail on the control ladder rather than `auto`, so a
       * table lines up with the toolbar controls above it.
       */
      headerBlockSize: 'calc(var(--ds-input-md-height) - 0.25rem)',
      /**
       * 0.08em is eyebrow tracking for a two-word label. A data header is read in
       * columns, not as prose; three quarters of the eyebrow keeps the channel and
       * closes the letters up.
       */
      headerLetterSpacing: 'calc(var(--ds-text-eyebrow-letter-spacing) * 0.75)',
      /** No sheen. The baseline gradient is transparent-to-transparent anyway. */
      sheen: 'none',
    },
    cardComponent: {
      /**
       * One padding ladder. The DS ships two that disagree — `--ds-card-{size}-padding`
       * (12/16/24/32) and `--ds-card-padding-{size}` (16/20/28/40) — and a card
       * gets whichever its skin happens to read. `paddingSm..Xl` writes both names
       * from one field, so Rottay has a single answer, and each step sits on the
       * spacing ramp so the density dial reaches it.
       */
      paddingSm: 'var(--ds-spacing-3)',
      paddingMd: 'var(--ds-spacing-4)',
      paddingLg: 'var(--ds-spacing-5)',
      paddingXl: 'var(--ds-spacing-6)',
      headerPadding: 'var(--ds-spacing-4) var(--ds-spacing-4) var(--ds-spacing-3)',
      bodyPadding: 'var(--ds-spacing-4)',
      footerPadding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
      /** A console card title names a panel; it is a label, not a headline. */
      titleFontSize: 'var(--ds-font-size-sm)',
      titleFontWeight: 'var(--ds-font-weight-medium)',
      bg: '#18181B',
      bgHover: '#1A1A1E',
      color: '#ECECEC',
      border: '#2A2A2F',
      borderHover: '#3A3A40',
      borderAccentHover: 'rgba(255, 255, 255, 0.14)',
      shadow: 'var(--ds-elevation-1)',
      shadowHover: 'var(--ds-elevation-2)',
      shadowElevated: 'var(--ds-elevation-3)',
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
