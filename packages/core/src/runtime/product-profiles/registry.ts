/**
 * @fileoverview Product profile registry with built-in presets.
 *
 * Profiles describe product mood and interaction density at a domain level.
 * They do NOT encode per-page behavior -- pages express their own structure
 * through surface configs in the app layer.
 *
 * Four built-in profiles ship with the DS:
 * - `generic.default`     -- Safe baseline for new products
 * - `events.organizer`    -- Expressive, spacious, media-first (Evnto)
 * - `recruiting.operator` -- Compact, formal, data-dense (BitHire)
 * - `platform.admin`      -- Neutral, comfortable, operational (Platform)
 */

import type { ProductProfile, ProductProfileKey } from '../../contracts/product-profiles';

/**
 * A neutral fallback used when no explicit product profile is provided.
 */
export const DEFAULT_PRODUCT_PROFILE_KEY: ProductProfileKey = 'generic.default';

/**
 * First-party profiles that cover the initial rollout targets.
 *
 * Values here are conservative on purpose. Tenant overrides can still push the
 * brand harder without forcing the DS to guess the final product tone.
 */
export const PRODUCT_PROFILES: Record<string, ProductProfile> = {
  'generic.default': {
    key: 'generic.default',
    label: 'Generic Default',
    description: 'Safe baseline profile for products that have not opted into a domain-specific tone yet.',
    personality: {
      animation: {
        intensity: 0.45,
        staggerDelay: 40,
        staggerMax: 220,
        entrance: 'fade',
        entranceDuration: 220,
        hoverLift: 1,
        hoverScale: 1.0,
        useSpring: false,
        springTension: 170,
        springFriction: 22,
        pulseSpeed: 'normal',
        skeletonStyle: 'shimmer',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 700,
        lineStyle: 'sharp',
        showDots: true,
        useGradientFill: false,
        tooltipStyle: 'detailed',
      },
      typography: {
        headingWeightBias: 'normal',
        headingLetterSpacing: '-0.01em',
        labelStyle: 'sentence',
      },
      accent: {
        barPosition: 'top',
        barThickness: 3,
        barStyle: 'solid',
        iconContainerShape: 'rounded',
        badgeShape: 'rounded',
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
    surfaceDefaults: {
      listView: 'table',
      density: 'comfortable',
      schedulerView: 'month',
    },
  },
  'events.organizer': {
    key: 'events.organizer',
    label: 'Events Organizer',
    description: 'A more expressive profile for event operations, discovery, and media-first collections.',
    personality: {
      animation: {
        intensity: 1.05,
        staggerDelay: 55,
        staggerMax: 320,
        entrance: 'slideUp',
        entranceDuration: 280,
        hoverLift: 3,
        hoverScale: 1.015,
        useSpring: true,
        springTension: 200,
        springFriction: 20,
        pulseSpeed: 'fast',
        skeletonStyle: 'shimmer',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 950,
        lineStyle: 'smooth',
        showDots: false,
        useGradientFill: true,
        tooltipStyle: 'glass',
      },
      typography: {
        headingWeightBias: 'heavier',
        headingLetterSpacing: '-0.02em',
        labelStyle: 'capitalize',
      },
      accent: {
        barPosition: 'top',
        barThickness: 4,
        barStyle: 'gradient',
        iconContainerShape: 'circle',
        badgeShape: 'pill',
        dividerStyle: 'solid',
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
      densityScale: 1.05,
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
      shadows: {
        md: '0 16px 48px rgba(17, 24, 39, 0.12)',
        lg: '0 24px 64px rgba(17, 24, 39, 0.16)',
      },
    },
    surfaceDefaults: {
      listView: 'cards',
      density: 'spacious',
      schedulerView: 'week',
    },
  },
  'recruiting.operator': {
    key: 'recruiting.operator',
    label: 'Recruiting Operator',
    description: 'Compact, controlled, and information-dense profile for recruiting workflows.',
    personality: {
      animation: {
        intensity: 0.35,
        staggerDelay: 20,
        staggerMax: 120,
        entrance: 'fade',
        entranceDuration: 160,
        hoverLift: 0,
        hoverScale: 1.0,
        useSpring: false,
        springTension: 170,
        springFriction: 24,
        pulseSpeed: 'slow',
        skeletonStyle: 'pulse',
        countUpEnabled: false,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 600,
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
        iconContainerShape: 'square',
        badgeShape: 'pill',
        dividerStyle: 'solid',
      },
      card: {
        defaultElevation: 'sm',
        hoverElevation: 'none',
        showBorder: true,
        hoverTint: false,
        paddingDensity: 'compact',
      },
    },
    tokenOverrides: {
      densityScale: 0.95,
    },
    surfaceDefaults: {
      listView: 'table',
      density: 'compact',
      schedulerView: 'week',
    },
  },
  'platform.admin': {
    key: 'platform.admin',
    label: 'Platform Admin',
    description: 'Neutral admin profile tuned for breadth, tooling, and operational dashboards.',
    personality: {
      animation: {
        intensity: 0.4,
        staggerDelay: 24,
        staggerMax: 160,
        entrance: 'fade',
        entranceDuration: 180,
        hoverLift: 1,
        hoverScale: 1.0,
        useSpring: false,
        springTension: 170,
        springFriction: 22,
        pulseSpeed: 'normal',
        skeletonStyle: 'shimmer',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 720,
        lineStyle: 'sharp',
        showDots: true,
        useGradientFill: false,
        tooltipStyle: 'detailed',
      },
      typography: {
        headingWeightBias: 'normal',
        headingLetterSpacing: '-0.015em',
        labelStyle: 'sentence',
      },
      accent: {
        barPosition: 'top',
        barThickness: 3,
        barStyle: 'solid',
        iconContainerShape: 'rounded',
        badgeShape: 'rounded',
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
    surfaceDefaults: {
      listView: 'table',
      density: 'comfortable',
      schedulerView: 'month',
    },
  },
};

/**
 * Resolves a product profile by key.
 *
 * Unknown keys fall back to the generic profile so the caller never has to
 * handle an undefined profile branch.
 */
export function getProductProfile(profileKey?: ProductProfileKey | null): ProductProfile {
  if (!profileKey) {
    return PRODUCT_PROFILES[DEFAULT_PRODUCT_PROFILE_KEY];
  }

  // Product profiles always resolve to something concrete so consumers never
  // need optional chaining just to access token defaults.
  return PRODUCT_PROFILES[profileKey] ?? PRODUCT_PROFILES[DEFAULT_PRODUCT_PROFILE_KEY];
}
