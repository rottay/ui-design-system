/**
 * Vertical Preset Registry
 *
 * Built-in vertical presets derived from existing product profiles and
 * tenant configurations. Each vertical captures the full personality,
 * engine preference, and surface defaults for a Rottay product domain.
 *
 * Personality values are sourced from:
 * - Product profiles: src/product-profiles/registry.ts
 * - Tenant configs: src/tenancy/registry/index.ts
 *
 * The vertical personality represents the "industry baseline" that sits
 * between DEFAULT_PERSONALITY and the product profile in the merge chain.
 */

import type { VerticalKey, VerticalPreset } from './types';

/**
 * Registry of all known vertical presets.
 *
 * Values are intentionally derived from the existing product profiles and
 * tenant configurations that have been battle-tested across the three
 * Rottay applications.
 */
export const VERTICAL_REGISTRY: Record<string, VerticalPreset> = {
  /**
   * Evnto - Event management platform
   *
   * Derived from: events.organizer product profile + evnto tenant personality
   * Personality: playful, bounce entrance, spring physics, spacious layout
   */
  evnto: {
    key: 'evnto',
    label: 'Evnto',
    description: 'Event management vertical with expressive animations, spacious layout, and media-first presentation.',
    engine: 'modern',
    density: 'spacious',
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
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '24px',
      },
    },
    defaultProductProfile: 'events.organizer',
    features: ['events', 'ticketing', 'check-in', 'analytics'],
    surfaceDefaults: {
      listView: 'cards',
      density: 'spacious',
      schedulerView: 'week',
    },
    suggestedPalette: {
      primaryColor: '#FF6B35',
      secondaryColor: '#EA580C',
      accentColor: '#06b6d4',
    },
  },

  /**
   * BitHire - Tech recruitment platform
   *
   * Derived from: recruiting.operator product profile + bithire tenant personality
   * Personality: formal, fade entrance, no spring, compact data-dense layout
   */
  bithire: {
    key: 'bithire',
    label: 'BitHire',
    description: 'Recruiting vertical with formal aesthetics, compact density, and information-dense workflows.',
    engine: 'classic',
    density: 'compact',
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
    tokenOverrides: {
      densityScale: 0.95,
    },
    defaultProductProfile: 'recruiting.operator',
    features: ['recruiting', 'candidates', 'interviews', 'offers'],
    surfaceDefaults: {
      listView: 'table',
      density: 'compact',
      schedulerView: 'week',
    },
    suggestedPalette: {
      primaryColor: '#0A66C2',
      secondaryColor: '#004182',
      accentColor: '#7FC15E',
    },
  },

  /**
   * Platform - Admin portal
   *
   * Derived from: platform.admin product profile + rottay tenant personality
   * Personality: neutral, fade entrance, balanced animations, comfortable density
   */
  platform: {
    key: 'platform',
    label: 'Platform',
    description: 'Admin vertical with neutral aesthetics, comfortable density, and operational dashboard defaults.',
    engine: 'classic',
    density: 'comfortable',
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
    defaultProductProfile: 'platform.admin',
    features: ['admin', 'settings', 'users', 'billing'],
    surfaceDefaults: {
      listView: 'table',
      density: 'comfortable',
      schedulerView: 'month',
    },
    suggestedPalette: {
      primaryColor: '#6366F1',
    },
  },
};

/**
 * Resolves a vertical preset by key.
 *
 * Returns undefined for unknown keys so callers can decide their own
 * fallback strategy (unlike product profiles which always fall back to
 * a default). Verticals are optional -- the system works fine without one.
 */
export function getVerticalPreset(key: VerticalKey): VerticalPreset | undefined {
  return VERTICAL_REGISTRY[key];
}
