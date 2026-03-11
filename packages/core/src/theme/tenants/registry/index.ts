/**
 * Known Tenants Registry
 *
 * Built-in configurations for known tenants.
 * These are the "official" tenants that ship with the design system.
 *
 * For new/custom tenants:
 * - Use the remote API (configureTenantApi)
 * - Or provide config via DesignSystemProvider props
 *
 * The CSS styles for these tenants are included in the design system bundle.
 */

import type { TenantConfig, EngineName } from '../../../core/types';

/**
 * Known tenant configurations
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
    personality: {
      animation: {
        intensity: 1.0,
        staggerDelay: 50,
        staggerMax: 400,
        entrance: 'spring',
        entranceDuration: 300,
        hoverLift: 2,
        hoverScale: 1.01,
        useSpring: true,
        springTension: 170,
        springFriction: 26,
        pulseSpeed: 'normal',
        skeletonStyle: 'shimmer',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 800,
        lineStyle: 'smooth',
        showDots: false,
        useGradientFill: true,
        tooltipStyle: 'glass',
      },
      typography: {
        headingWeightBias: 'normal',
        headingLetterSpacing: '-0.025em',
        labelStyle: 'sentence',
      },
      accent: {
        barPosition: 'top',
        barThickness: 2,
        barStyle: 'gradient',
        iconContainerShape: 'rounded',
        badgeShape: 'rounded',
        dividerStyle: 'solid',
      },
      card: {
        defaultElevation: 'md',
        hoverElevation: 'lift-two',
        showBorder: false,
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
    personality: {
      animation: {
        intensity: 0.4,
        staggerDelay: 30,
        staggerMax: 200,
        entrance: 'fade',
        entranceDuration: 150,
        hoverLift: 0,
        hoverScale: 1.0,
        useSpring: false,
        springTension: 170,
        springFriction: 26,
        pulseSpeed: 'slow',
        skeletonStyle: 'pulse',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 400,
        lineStyle: 'sharp',
        showDots: true,
        useGradientFill: false,
        tooltipStyle: 'detailed',
      },
      typography: {
        headingWeightBias: 'heavier',
        headingLetterSpacing: '-0.01em',
        labelStyle: 'uppercase',
      },
      accent: {
        barPosition: 'left',
        barThickness: 3,
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
        paddingDensity: 'compact',
      },
    },
  },

  /**
   * Evnto - Event management platform
   * Fun, animated, vibrant
   * Orange + cyan, bounce animations, spacious layout
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
      primaryColor: '#f97316',
      secondaryColor: '#EA580C',
      accentColor: '#06b6d4',
      logo: undefined,
    },
    personality: {
      animation: {
        intensity: 1.5,
        staggerDelay: 80,
        staggerMax: 600,
        entrance: 'bounce',
        entranceDuration: 500,
        hoverLift: 4,
        hoverScale: 1.03,
        useSpring: true,
        springTension: 200,
        springFriction: 18,
        pulseSpeed: 'fast',
        skeletonStyle: 'wave',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 1200,
        lineStyle: 'smooth',
        showDots: true,
        useGradientFill: true,
        tooltipStyle: 'detailed',
      },
      typography: {
        headingWeightBias: 'heavier',
        headingLetterSpacing: '-0.02em',
        labelStyle: 'capitalize',
      },
      accent: {
        barPosition: 'top',
        barThickness: 4,
        barStyle: 'animated',
        iconContainerShape: 'circle',
        badgeShape: 'pill',
        dividerStyle: 'dashed',
      },
      card: {
        defaultElevation: 'md',
        hoverElevation: 'lift-two',
        showBorder: false,
        hoverTint: true,
        paddingDensity: 'spacious',
      },
    },
    tokenOverrides: {
      densityScale: 1.125,
      borderRadius: { sm: '10px', md: '14px', lg: '18px', xl: '24px' },
    },
  },

  /**
   * The Management Miami - Premium hospitality and talent recruiting
   * Green primary, professional, LinkedIn-style structure
   */
  themanagementmiami: {
    slug: 'themanagementmiami',
    name: 'The Management Miami',
    engine: 'classic' as EngineName,
    theme: 'base',
    plan: 'enterprise',
    features: ['*'],
    branding: {
      companyName: 'The Management Miami',
      primaryColor: '#16a34a',
      accentColor: '#15803d',
      logo: undefined,
    },
    personality: {
      animation: {
        intensity: 0.4,
        staggerDelay: 30,
        staggerMax: 200,
        entrance: 'fade',
        entranceDuration: 150,
        hoverLift: 0,
        hoverScale: 1.0,
        useSpring: false,
        springTension: 170,
        springFriction: 26,
        pulseSpeed: 'slow',
        skeletonStyle: 'pulse',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 400,
        lineStyle: 'sharp',
        showDots: true,
        useGradientFill: false,
        tooltipStyle: 'detailed',
      },
      typography: {
        headingWeightBias: 'heavier',
        headingLetterSpacing: '-0.01em',
        labelStyle: 'uppercase',
      },
      accent: {
        barPosition: 'left',
        barThickness: 3,
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
        paddingDensity: 'compact',
      },
    },
  },
};

/**
 * Default tenant slug (used when no tenant is specified)
 */
export const DEFAULT_TENANT_SLUG = 'rottay';

/**
 * Get known tenant configuration
 * Returns undefined if tenant is not in the registry
 */
export function getKnownTenantConfig(slug: string): TenantConfig | undefined {
  return KNOWN_TENANTS[slug.toLowerCase()];
}

/**
 * Check if a tenant is known (has built-in config)
 */
export function isKnownTenant(slug: string): boolean {
  return slug.toLowerCase() in KNOWN_TENANTS;
}

/**
 * Get all known tenant slugs
 */
export function getKnownTenantSlugs(): string[] {
  return Object.keys(KNOWN_TENANTS);
}

/**
 * Get default tenant config
 */
export function getDefaultTenant(): TenantConfig {
  return KNOWN_TENANTS[DEFAULT_TENANT_SLUG];
}
