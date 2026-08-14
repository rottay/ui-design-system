/**
 * Evnto first-party vertical theme.
 *
 * Event marquee experience. White-first, high-contrast, rounded, fluid,
 * safe, modern. Expressive entrances without routine bounce.
 *
 * Design: Minimal light-first. Black primary on white canvas.
 * Warm beige/sand accents. Largest border radius of all brands.
 *
 * This file is the canonical authored source. foundation/tokens/css/facade/artifacts/evnto/index.css
 * is a generated build product — regenerate with `pnpm -C packages/core
 * build:vertical-css`; hand-edits fail `lint:artifacts`.
 */

import type { FirstPartyBrandTheme } from '../../../../../contracts/composition/tenants/themes';
import {
  EVNTO_CANONICAL_MOTION,
  EVNTO_CANONICAL_SURFACES,
} from '@/foundation/presets/policy/experience-baselines/evnto';

export const evntoBrandTheme: FirstPartyBrandTheme = {
  id: 'evnto',
  name: 'Evnto',

  appearance: { defaultMode: 'light' },

  /**
   * DARK mode. Authored as a typed overlay of the semantic
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
    dark: {
      palette: {
        primaryColor: "#E8E8E0",
        onPrimaryColor: "#131210",
        primaryForegroundColor: "#131210",
        primaryHoverColor: "#F0F0E8",
        secondaryColor: "#A89880",
        secondaryHoverColor: "#B8A890",
        accentColor: "#A89880",
        backgroundColor: "#131210",
        backgroundSecondaryColor: "#1C1A16",
        backgroundTertiaryColor: "#24221C",
        backgroundElevatedColor: "#2A2820",
        textPrimaryColor: "#E8E8E0",
        textSecondaryColor: "#A8A898",
        textMutedColor: "#686858",
        textDisabledColor: "#484838",
        borderPrimaryColor: "#2E2C24",
        borderSecondaryColor: "#222018",
        borderFocusColor: "#A89880",
        linkColor: "var(--ds-color-primary)",
        linkHoverColor: "var(--ds-color-primary-hover)",
        linkVisitedColor: "var(--ds-color-neutral-600)",
        ramps: {
          primary: {
            50: "#FCFCFC",
            100: "#DDDDDD",
            200: "#BFBFBF",
            300: "#A2A2A2",
            400: "#868686",
            500: "#6B6B6B",
            600: "#515151",
            700: "#393939",
            800: "#222222",
            900: "#0D0D0D",
          },
          secondary: {
            50: "#FFFBF7",
            100: "#E6DBD0",
            200: "#CBBDAF",
            300: "#AF9F90",
            400: "#948373",
            500: "#786858",
            600: "#5D4F41",
            700: "#42372B",
            800: "#292018",
            900: "#110C08",
          },
          accent: {
            50: "#FFFBF7",
            100: "#E6DBD0",
            200: "#CBBDAF",
            300: "#AF9F90",
            400: "#948373",
            500: "#786858",
            600: "#5D4F41",
            700: "#42372B",
            800: "#292018",
            900: "#110C08",
          },
          success: {
            50: "#F5FFF6",
            100: "#B6EDC1",
            200: "#8AD49A",
            300: "#62B977",
            400: "#3D9D59",
            500: "#18803E",
            600: "#00632B",
            700: "#00461C",
            800: "#002B0E",
          },
          warning: {
            50: "#FFFBF7",
            100: "#FFD5AA",
            200: "#EAB37B",
            300: "#D29451",
            400: "#B6762A",
            500: "#985B00",
            600: "#754500",
            700: "#533000",
            800: "#341C00",
          },
          error: {
            50: "#FFFBFA",
            100: "#FFD1CA",
            200: "#FFA398",
            300: "#FE6F62",
            400: "#E24B41",
            500: "#C12825",
            600: "#9C030C",
            700: "#710005",
            800: "#480002",
          },
          info: {
            50: "#FAFCFF",
            100: "#D4DEED",
            200: "#B4C1D3",
            300: "#95A4B9",
            400: "#79889D",
            500: "#5E6D81",
            600: "#465365",
            700: "#2F3A49",
            800: "#1B232D",
          },
        },
      },
      surfaces: {
        borderRadius: {
          full: "9999px",
        },
      },
      chrome: {
        controls: {
          buttonPrimary: {
            bg: "#E8E8E0",
            color: "#131210",
          },
          buttonSecondary: {
            color: "#A8A898",
            border: "#2E2C24",
          },
          buttonDefault: {
            bg: "#1C1A16",
            bgHover: "#24221C",
            color: "#E8E8E0",
            border: "#2E2C24",
          },
          buttonGhost: {
            bgHover: "rgba(255, 255, 255, 0.04)",
            color: "#A8A898",
          },
          disabled: {
            bg: "#1C1A16",
            text: "#484838",
            border: "#222018",
            borderColor: "#222018",
          },
          input: {
            bg: "#131210",
            border: "#2E2C24",
            bgDisabled: "#1C1A16",
            colorDisabled: "#484838",
            borderDisabled: "#222018",
          },
        },
        cardComponent: {
          bg: "#1C1A16",
          border: "#2E2C24",
        },
        layout: {
          bg: "#131210",
          headerBg: "rgba(19, 18, 16, 0.92)",
          headerBorder: "#2E2C24",
          siderBg: "#0E0D0B",
          siderBorder: "#222018",
        },
        table: {
          headerBg: "#1C1A16",
          headerColor: "#A8A898",
          border: "#222018",
        },
        sidebar: {
          bg: "#0E0D0B",
          text: "#A8A898",
        },
      },
    },
  },

  palette: {
    primaryColor: '#171717',
    secondaryColor: '#7A6A5A',
    accentColor: '#7A6A5A',
    backgroundColor: '#FFFFFF',
    backgroundSecondaryColor: '#fafafa',
    backgroundTertiaryColor: '#f5f5f5',
    backgroundElevatedColor: '#ffffff',
    onPrimaryColor: '#ffffff',
    successColor: '#15803D',
    warningColor: '#A16207',
    errorColor: '#B91C1C',
    infoColor: '#475569',

    /**
     * The six border channels this vertical used to leave silent, and so
     * inherited from `themes/default.css` — the DS's own tenant-less DARK
     * fallback set. This is a LEAK REPAIR, not a derivation: measured before
     * this block existed, `--ds-color-border-subtle` and `-tertiary` painted
     * #161619 hairlines on the WHITE light ground, and all four status borders
     * painted DS hues rather than the seeds above. Repairing it moves pixels
     * on purpose; it is not a value-preserving edit.
     *
     * The vertical's own #171717-on-#FFFFFF ink/surface pair is deliberate and
     * is NOT the fault here — `deriveBorderSubtle` cannot even run on it (its
     * `isHexColor` gate rejects the translucent light border), and composited
     * first it lands ≈#F2F2F2. The seed was simply missing.
     *
     * Authored as formulas over this vertical's own channels, never as
     * literals: a baked hex would freeze today's rendering as if it were a
     * design choice and would leave the channels unreachable from the palette.
     * Each string is mode-blind, so `compileModeBlocks` emits it once in the
     * unconditional block and it re-resolves against whichever seed each mode
     * declares.
     *
     * A 2/3 wash IS the DS's `BORDER_SUBTLE_GROUND_STEP` derivation — one
     * third of the way from the border back to the ground — expressed without
     * naming the ground, so it stays correct on cards and sunken regions
     * rather than only on the page canvas, and it survives this vertical's
     * translucent light border. The seed is `-primary` rather than
     * `--ds-color-border` because the latter is itself unauthored here and
     * still resolves to the DS dark fallback in dark mode.
     *
     * `-tertiary` repeats the formula rather than aliasing `-subtle`: the two
     * are one value in `themes/default.css` and in the former default theme, so the
     * equality this vertical already paints is preserved, but as two
     * independent channels a tenant can still move apart.
     *
     * The status washes keep the 20% strength these channels already paint;
     * only the hue moves, from the DS defaults onto the seeds above.
     */
    /**
     * The seventh channel of the same leak: unauthored here, so dark resolved
     * `themes/default.css`'s `#1C1C20` — a cool grey on this vertical's warm
     * `#131210` ground. Mode-blind on purpose: the light extension declares
     * `--ds-color-border` at a higher specificity and keeps winning there, so
     * this reaches only the mode that had no author.
     */
    borderColor: 'var(--ds-color-border-primary)',

    borderSubtleColor:
      'color-mix(in srgb, var(--ds-color-border-primary) 66.667%, transparent)',
    borderTertiaryColor:
      'color-mix(in srgb, var(--ds-color-border-primary) 66.667%, transparent)',
    successBorderColor: 'color-mix(in srgb, var(--ds-color-success) 20%, transparent)',
    warningBorderColor: 'color-mix(in srgb, var(--ds-color-warning) 20%, transparent)',
    errorBorderColor: 'color-mix(in srgb, var(--ds-color-error) 20%, transparent)',
    infoBorderColor: 'color-mix(in srgb, var(--ds-color-info) 20%, transparent)',
    borderFocusColor: '#171717',
    linkColor: '#171717',
    linkHoverColor: '#525252',
    linkVisitedColor: '#737373',
  },

  /**
   * Editorial ticketing/wallet posture: a geometric display face carries the
   * headline register, a humanist face carries reading copy, mono carries
   * codes and times. That split is what makes the type feel graphic rather
   * than administrative.
   *
   * Every family named here is physically shipped as a font pack (see
   * FONT_PACK_MANIFEST). This previously named 'Inter', 'JetBrains Mono' and
   * 'Fira Code' — none of which the package ships, so the "contemporary
   * strong typography" this vertical claims resolved to the visitor's OS
   * default in practice.
   */
  typography: {
    fontFamilyBase:
      "var(--ds-font-pack-humanist-text, 'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif)",
    fontFamilyHeading:
      "var(--ds-font-pack-geometric-display, 'Outfit', ui-sans-serif, system-ui, -apple-system, sans-serif)",
    fontFamilyMono:
      "var(--ds-font-pack-plex-mono, 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace)",
    fontFamilyDisplay:
      "var(--ds-font-pack-geometric-display, 'Outfit', ui-sans-serif, system-ui, -apple-system, sans-serif)",
    headingWeightBias: 'heavier',
    headingLetterSpacing: '-0.02em',
    labelStyle: 'capitalize',
    letterSpacing: {
      display: '-0.025em',
      heading: '-0.02em',
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

  /**
   * The shared baseline, plus the two semantic surface roles whose HOVER
   * ground this vertical never authored. Measured: both resolved `#18181C`,
   * so a card or control on the white canvas turned near-black under the
   * cursor. `glass` stays `none` from the baseline — that is this vertical's
   * deliberate choice, not a gap.
   *
   * The wash is the grammar `card.css` already falls back to, so the repaired
   * value is the one the DS itself intends, and it tracks the tenant's own
   * primary and elevated ground instead of a literal.
   */
  surfaces: {
    ...EVNTO_CANONICAL_SURFACES,
    surfaceRoles: {
      card: {
        backgroundHover:
          'color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-color-bg-elevated))',
      },
      control: {
        backgroundHover:
          'color-mix(in srgb, var(--ds-color-primary) 4%, var(--ds-color-bg-elevated))',
      },
    },
  },

  motion: EVNTO_CANONICAL_MOTION,

  charts: {
    animateOnMount: true,
    mountDuration: 1200,
    lineStyle: 'smooth',
    showDots: true,
    useGradientFill: true,
    tooltipStyle: 'detailed',
  },

  chrome: {
    card: {
      defaultElevation: 'md',
      hoverElevation: 'lift-two',
      showBorder: false,
      hoverTint: true,
      paddingDensity: 'spacious',
    },
    accent: {
      barPosition: 'top',
      barThickness: 4,
      barStyle: 'animated',
      iconContainerShape: 'circle',
      badgeShape: 'pill',
      dividerStyle: 'dashed',
    },
    sidebar: {
      bg: '#fafafa',
      // Unauthored, so the sidebar edge resolved #404040 — a mid-grey rule
      // against a #fafafa rail. Points at the tenant's own border channel
      // rather than restating the layout block's literal.
      border: 'var(--ds-color-border)',
      text: '#171717',
      textMuted: '#525252',
      groupFontSize: '11px',
      groupFontWeight: 600,
      groupColor: '#737373',
      groupLetterSpacing: '0.04em',
      itemFontSize: '14px',
      itemFontWeight: 400,
      itemFontWeightActive: 500,
      itemColor: '#3d3d3d',
      itemColorActive: '#171717',
      itemBgActive: 'rgba(0, 0, 0, 0.06)',
      itemBgHover: 'rgba(0, 0, 0, 0.03)',
      itemPadding: '8px 12px',
      iconSize: '18px',
    },
    layout: {
      bg: '#FFFFFF',
      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerBackdrop: 'blur(10px)',
      headerBorder: 'rgba(0, 0, 0, 0.06)',
      siderBg: '#FAFAFA',
      siderBorder: 'rgba(0, 0, 0, 0.06)',
    },
    shell: {
      gridSize: '0px',
      gridLine: 'transparent',
      gridOpacity: 0,
    },
    controls: {
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
      buttonInfo: {
        shadow: "var(--ds-shadow-button-rest)",
        shadowHover: "var(--ds-button-info-shadow)",
        shadowActive: "var(--ds-button-info-shadow)",
      },
      buttonError: {
        shadow: "var(--ds-shadow-error-sm)",
        shadowHover: "var(--ds-shadow-error-sm)",
        shadowActive: "var(--ds-shadow-error-sm)",
      },
      buttonWarning: {
        shadow: "var(--ds-shadow-warning-sm)",
        shadowHover: "var(--ds-button-warning-shadow)",
        shadowActive: "var(--ds-button-warning-shadow)",
      },
      buttonSuccess: {
        shadow: "var(--ds-shadow-success-sm)",
        shadowHover: "var(--ds-button-success-shadow)",
        shadowActive: "var(--ds-button-success-shadow)",
      },
      buttonLink: {
        shadow: "none",
        shadowHover: "var(--ds-button-link-shadow)",
        shadowActive: "var(--ds-button-link-shadow)",
      },
      buttonText: {
        shadow: "none",
        shadowHover: "var(--ds-button-text-shadow)",
        shadowActive: "var(--ds-button-text-shadow)",
      },
      buttonDashed: {
        shadow: "none",
        shadowHover: "var(--ds-button-dashed-shadow)",
        shadowActive: "var(--ds-button-dashed-shadow)",
      },
      buttonPrimary: {
        shadowHover: "var(--ds-shadow-button-hover)",
        shadowActive: "var(--ds-shadow-button-rest)", bg: '#171717', bgHover: '#262626', text: '#ffffff', color: '#ffffff', border: 'transparent', shadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
      buttonSecondary: {
        shadow: "var(--ds-shadow-button-rest)",
        shadowHover: "var(--ds-shadow-button-hover)",
        shadowActive: "var(--ds-shadow-button-rest)", bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.04)', text: '#171717', color: '#171717', border: 'rgba(0, 0, 0, 0.15)' },
      buttonDefault: {
        shadow: "var(--ds-shadow-button-rest)",
        shadowHover: "var(--ds-shadow-button-hover)",
        shadowActive: "var(--ds-shadow-button-rest)", bg: '#FFFFFF', bgHover: '#FAFAFA', text: '#171717', color: '#171717', border: 'rgba(0, 0, 0, 0.1)' },
      buttonGhost: {
        shadow: "none",
        shadowHover: "var(--ds-button-ghost-shadow)",
        shadowActive: "var(--ds-button-ghost-shadow)", bg: 'transparent', bgHover: 'rgba(0, 0, 0, 0.03)', text: '#525252', color: '#525252' },
      disabled: { opacity: 0.4, bg: '#FAFAFA', text: 'rgba(0, 0, 0, 0.25)', border: 'rgba(0, 0, 0, 0.06)', borderColor: 'rgba(0, 0, 0, 0.06)' },
      input: {
        bg: '#ffffff',
        border: 'rgba(0, 0, 0, 0.12)',
        borderFocus: '#171717',
        shadowFocus: '0 0 0 1px rgba(23, 23, 23, 0.2)',
        bgDisabled: '#FAFAFA',
        colorDisabled: 'rgba(0, 0, 0, 0.25)',
        borderDisabled: 'rgba(0, 0, 0, 0.06)',
        disabledOpacity: 0.4,
      },
    },
    table: {
      headerBg: 'rgba(0, 0, 0, 0.02)',
      headerColor: '#737373',
      headerFontWeight: 500,
      headerFontSize: '0.75rem',
    },
    cardComponent: {
      bg: '#ffffff',
      border: 'rgba(0, 0, 0, 0.08)',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      shadowHover: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  },

  /**
   * Explicit disposition for every optional capability family. Evnto authored
   * NONE of these keys before; absence read as "nothing selected" and as
   * "nobody looked" simultaneously.
   */
  capabilities: {
    // ACTIVE. See the note on rottay's disposition. EVNTO_CANONICAL_MOTION is
    // shared with the vertical preset, but sharing a source does not make the
    // BrandTheme read of it inert: it still lowers through
    // `brandThemeToTokenOverrides` onto `--ds-motion-spring` and through
    // `brandThemeToPersonality` onto the animation personality.
    motion: { status: 'active' },
    // Evnto is the one vertical with no governed recipe profile. It is a real
    // gap, not a decision: rottay selects technical-sharp and bithire selects
    // network-professional, so evnto currently inherits engine defaults.
    recipes: {
      status: 'unassigned',
      reason: 'pending-selection',
      note: 'No governed recipe profile authored for the editorial ticketing posture yet; falls back to engine defaults.',
    },
    expressive: {
      status: 'unassigned',
      reason: 'pending-selection',
      note: 'No expressive profile sighted against the high-contrast editorial canvas yet.',
    },
    responsive: {
      status: 'disabled',
      reason: 'not-authored',
      note: 'Evnto rides the baseline container ladder; no posture override.',
    },
    engineBridge: {
      status: 'disabled',
      reason: 'not-authored',
      note: 'No engine-specific bridge values; modern reads the compiled tokens directly.',
    },
  },
};
