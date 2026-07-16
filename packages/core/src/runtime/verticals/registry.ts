/**
 * @fileoverview Built-in vertical preset registry — first-party Rottay
 * presets bundled with the DS.
 *
 * @description
 * Contains preset definitions for the three first-party Rottay products
 * (`evnto`, `bithire`, `platform`). Each vertical captures the full
 * personality, engine preference, and surface defaults for a product
 * domain.
 *
 * These are **bundled defaults**, not the only verticals the DS supports.
 * Custom verticals can be registered at runtime via the open-ended
 * `VerticalKey = string & {}` type so product teams can introduce new
 * verticals without waiting for a DS release. The three presets here
 * exist because Rottay's own apps use them and they serve as documented
 * baselines for testing, Storybook, and CI.
 *
 * Personality values are sourced from:
 * - Product profiles: `runtime/product-profiles/registry.ts`
 * - Tenant configs: `runtime/tenant/registry/`
 *
 * The vertical personality represents the "industry baseline" that sits
 * between `DEFAULT_PERSONALITY` and the product profile in the merge
 * chain.
 */

import type { VerticalKey, VerticalPreset } from './types';

/**
 * Registry of all known vertical presets.
 *
 * Values are intentionally derived from the existing product profiles and
 * tenant configurations that have been battle-tested across the three
 * Rottay applications.
 *
 * Verticals are the DS-owned fallback layer for domains. Real tenants should
 * reference these presets, not duplicate them one by one.
 */
export const VERTICAL_REGISTRY: Readonly<Record<string, VerticalPreset>> = {
  /**
   * Evnto - Event management platform
   *
   * Derived from: events.organizer product profile + evnto tenant personality
   * Personality: expressive, slideUp entrance, spring physics, comfortable layout
   */
  evnto: {
    key: 'evnto',
    label: 'Evnto',
    description: 'Event management vertical with expressive animations, comfortable layout, and live-status presentation.',
    engine: 'modern',
    motionProfile: 'expressive',
    density: 'comfortable',
    personality: {
      animation: {
        intensity: 1.2,
        staggerDelay: 65,
        staggerMax: 450,
        entrance: 'slideUp',
        entranceDuration: 350,
        hoverLift: 3,
        hoverScale: 1.02,
        useSpring: true,
        springTension: 200,
        springFriction: 18,
        pulseSpeed: 'fast',
        skeletonStyle: 'wave',
        countUpEnabled: true,
      },
      chart: {
        animateOnMount: true,
        mountDuration: 1000,
        lineStyle: 'smooth',
        showDots: true,
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
      densityScale: 1.05,
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
      listView: 'table',
      density: 'comfortable',
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
   * Personality: editorial, fade entrance, no spring, comfortable people-first layout
   */
  bithire: {
    key: 'bithire',
    label: 'BitHire',
    description: 'Recruiting vertical with editorial aesthetics, comfortable density, and people-first workflows.',
    engine: 'modern',
    motionProfile: 'calm',
    density: 'comfortable',
    personality: {
      animation: {
        intensity: 0.4,
        staggerDelay: 30,
        staggerMax: 200,
        entrance: 'fade',
        entranceDuration: 200,
        hoverLift: 1,
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
        mountDuration: 500,
        lineStyle: 'sharp',
        showDots: true,
        useGradientFill: false,
        tooltipStyle: 'detailed',
      },
      typography: {
        headingWeightBias: 'heavier',
        headingLetterSpacing: '-0.01em',
        labelStyle: 'sentence',
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
        paddingDensity: 'normal',
      },
    },
    tokenOverrides: {
      densityScale: 0.98,
    },
    defaultProductProfile: 'recruiting.operator',
    features: ['recruiting', 'candidates', 'interviews', 'offers'],
    surfaceDefaults: {
      listView: 'table',
      density: 'comfortable',
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
   * Personality: neutral, fade entrance, precise animations, compact density
   * Engine: modern is the flagship target; classic remains a supported engine path
   */
  platform: {
    key: 'platform',
    label: 'Platform',
    description: 'Admin vertical with sharp aesthetics, compact density, and operational dashboard defaults.',
    engine: 'modern',
    motionProfile: 'precise',
    density: 'compact',
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
        paddingDensity: 'compact',
      },
    },
    defaultProductProfile: 'platform.admin',
    features: ['admin', 'settings', 'users', 'billing'],
    surfaceDefaults: {
      listView: 'table',
      density: 'compact',
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
  // Unlike product profiles, verticals are optional. Callers can choose to
  // continue without one instead of forcing a DS-owned fallback.
  return VERTICAL_REGISTRY[key];
}
