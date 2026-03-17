/**
 * @fileoverview Known tenants registry -- first-party tenants bundled with the DS.
 * @description Three built-in tenants ship with pre-computed CSS and personality:
 * - `rottay` -- Default/flagship. Indigo + purple, spring animations, glassmorphism.
 * - `bithire` -- Recruiting platform. Corporate blue, subtle animations, structured borders.
 * - `evnto` -- Event management. Orange + cyan, bounce animations, spacious density.
 *
 * Customer tenants should NOT be added here. They resolve from the remote API
 * or static file storage instead.
 *
 * WHY these live in the DS bundle:
 * First-party tenants need zero-latency resolution (no API call, no static file fetch)
 * because they are used in development, Storybook, and CI. The storage facade in
 * `tenancy/storage/index.ts` checks this registry (step 3) before attempting
 * slower network-based sources (static files, remote API).
 */

import type { TenantConfig, EngineName } from '../../contracts';

/**
 * First-party tenants that ship with the DS.
 *
 * Each entry is a complete `TenantConfig` including full `personality` tokens.
 * The personality section drives all visual differentiation -- animation timing,
 * chart rendering, typography casing, accent decorations, and card behavior --
 * without any per-tenant branching in component code.
 */
const KNOWN_TENANTS: Record<string, TenantConfig> = {
  /**
   * Rottay - Default tenant
   * AI-futuristic, modern startup aesthetic
   * Indigo + purple gradient, spring animations, glassmorphism
   */
  rottay: {
    slug: 'rottay',
    name: 'Rottay',
    engine: 'classic' as EngineName,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'Rottay',
      primaryColor: '#6366f1',
      secondaryColor: '#4F46E5',
      accentColor: '#a855f7',
      logo: undefined,
    },
    // Rottay personality: AI-futuristic startup aesthetic.
    // Spring physics give a high-tech feel; gradient accent bars and glass tooltips
    // reinforce the glassmorphism visual language. showBorder=false + hoverTint=true
    // creates the "floating card" look characteristic of the Rottay brand.
    personality: {
      animation: {
        intensity: 1.0,          // Full animation -- flagship should feel alive
        staggerDelay: 50,
        staggerMax: 400,
        entrance: 'spring',      // WHY spring: bouncy entrances match the futuristic aesthetic
        entranceDuration: 300,
        hoverLift: 2,
        hoverScale: 1.01,
        useSpring: true,         // Spring physics for react-spring/framer-motion integrations
        springTension: 170,
        springFriction: 26,
        pulseSpeed: 'normal',
        skeletonStyle: 'shimmer',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 800,
        lineStyle: 'smooth',     // WHY smooth: curved lines suit a modern dashboard
        showDots: false,         // Dots clutter the clean Rottay aesthetic
        useGradientFill: true,
        tooltipStyle: 'glass',   // Glassmorphism tooltip matches the overall brand
      },
      typography: {
        headingWeightBias: 'normal',
        headingLetterSpacing: '-0.025em',
        labelStyle: 'sentence',
      },
      accent: {
        barPosition: 'top',
        barThickness: 2,
        barStyle: 'gradient',    // WHY gradient: ties back to the indigo-purple palette
        iconContainerShape: 'rounded',
        badgeShape: 'rounded',
        dividerStyle: 'solid',
      },
      card: {
        defaultElevation: 'md',
        hoverElevation: 'lift-two',
        showBorder: false,       // No borders -- floating card aesthetic
        hoverTint: true,
        paddingDensity: 'normal',
      },
    },
  },

  /**
   * BitHire - Tech recruitment platform
   * Formal, LinkedIn-style, professional
   * Corporate blue, subtle animations, structured borders
   */
  bithire: {
    slug: 'bithire',
    name: 'BitHire',
    engine: 'classic' as EngineName,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'BitHire',
      primaryColor: '#0A66C2',
      secondaryColor: '#004182',
      accentColor: '#7FC15E',
      logo: undefined,
    },
    // BitHire personality: corporate/LinkedIn-style professionalism.
    // Low animation intensity and fade-only entrances keep the UI quiet and
    // data-focused. Compact padding and uppercase labels match the structured
    // feel of ATS (Applicant Tracking System) workflows.
    personality: {
      animation: {
        intensity: 0.4,          // Subtle -- recruiters value speed over spectacle
        staggerDelay: 30,
        staggerMax: 200,
        entrance: 'fade',        // WHY fade: minimal distraction in data-heavy screens
        entranceDuration: 150,
        hoverLift: 0,            // No lift -- structured/grounded feel
        hoverScale: 1.0,
        useSpring: false,        // Standard easing is more business-appropriate
        springTension: 170,
        springFriction: 26,
        pulseSpeed: 'slow',
        skeletonStyle: 'pulse',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 400,      // Fast -- data should appear quickly
        lineStyle: 'sharp',      // WHY sharp: precision matches recruiting analytics
        showDots: true,          // Dots aid precision reading of data points
        useGradientFill: false,
        tooltipStyle: 'detailed',
      },
      typography: {
        headingWeightBias: 'heavier',
        headingLetterSpacing: '-0.01em',
        labelStyle: 'uppercase', // WHY uppercase: formal label treatment
      },
      accent: {
        barPosition: 'left',     // WHY left: vertical accent bars mimic sidebar navigation
        barThickness: 3,
        barStyle: 'solid',
        iconContainerShape: 'circle',
        badgeShape: 'pill',
        dividerStyle: 'solid',
      },
      card: {
        defaultElevation: 'sm',
        hoverElevation: 'lift-one',
        showBorder: true,        // Borders provide clear structure in dense layouts
        hoverTint: false,
        paddingDensity: 'compact', // WHY compact: maximizes content density for tables/lists
      },
    },
  },

  /**
   * Evnto - Event management platform
   * Light minimal, elegant
   * Black text on white backgrounds, warm beige accents
   */
  evnto: {
    slug: 'evnto',
    name: 'Evnto',
    engine: 'classic' as EngineName,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'Evnto',
      primaryColor: '#171717',
      secondaryColor: '#b8a898',
      accentColor: '#b8a898',
      logo: undefined,
    },
    // Evnto personality: clean, professional, operator-focused.
    // Subtle animations and fade entrances create a polished feel.
    // Cards use borders (not shadows) for definition on white backgrounds.
    personality: {
      animation: {
        intensity: 0.6,
        staggerDelay: 40,
        staggerMax: 300,
        entrance: 'fade',
        entranceDuration: 250,
        hoverLift: 1,
        hoverScale: 1.005,
        useSpring: false,
        springTension: 170,
        springFriction: 26,
        pulseSpeed: 'normal',
        skeletonStyle: 'shimmer',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 600,
        lineStyle: 'smooth',
        showDots: false,
        useGradientFill: false,
        tooltipStyle: 'glass',
      },
      typography: {
        headingWeightBias: 'heavier',
        headingLetterSpacing: '-0.02em',
        labelStyle: 'uppercase',
      },
      accent: {
        barPosition: 'top',
        barThickness: 0,
        barStyle: 'solid',
        iconContainerShape: 'circle',
        badgeShape: 'pill',
        dividerStyle: 'solid',
      },
      card: {
        defaultElevation: 'sm',
        hoverElevation: 'lift-one',
        showBorder: true,
        hoverTint: false,
        paddingDensity: 'normal',
      },
    },
    tokenOverrides: {
      densityScale: 1.02,
      borderRadius: { sm: '8px', md: '10px', lg: '14px', xl: '20px' },
    },
  },
};

/**
 * Slug used when no tenant is specified. Rottay is the flagship product so it
 * makes sense as the implicit default for development, Storybook, and CI.
 */
export const DEFAULT_TENANT_SLUG = 'rottay';

/**
 * Looks up a first-party tenant by slug.
 *
 * Slugs are case-insensitive -- the registry normalizes to lowercase internally.
 * Returns `undefined` for customer tenants that are not in the built-in set;
 * the storage facade will then fall through to static/remote sources.
 *
 * @param slug - Tenant identifier (e.g. 'rottay', 'bithire', 'evnto').
 * @returns The full TenantConfig if found, otherwise `undefined`.
 */
export function getKnownTenantConfig(slug: string): TenantConfig | undefined {
  return KNOWN_TENANTS[slug.toLowerCase()];
}

/**
 * Checks whether a tenant slug has a built-in configuration in this registry.
 *
 * @param slug - Tenant identifier to check.
 * @returns `true` if the tenant ships with the DS bundle.
 */
export function isKnownTenant(slug: string): boolean {
  return slug.toLowerCase() in KNOWN_TENANTS;
}

/**
 * Returns an array of all first-party tenant slugs registered in the DS.
 * Useful for build-time asset generation and Storybook tenant selectors.
 *
 * @returns Array of slug strings (e.g. `['rottay', 'bithire', 'evnto']`).
 */
export function getKnownTenantSlugs(): string[] {
  return Object.keys(KNOWN_TENANTS);
}

/**
 * Returns the default (Rottay) tenant configuration.
 * Convenience shortcut equivalent to `getKnownTenantConfig(DEFAULT_TENANT_SLUG)!`.
 *
 * @returns The Rottay TenantConfig -- guaranteed to exist.
 */
export function getDefaultTenant(): TenantConfig {
  return KNOWN_TENANTS[DEFAULT_TENANT_SLUG];
}
