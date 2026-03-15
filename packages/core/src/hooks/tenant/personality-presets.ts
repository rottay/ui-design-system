/**
 * Personality Presets
 *
 * Maps human-friendly personality labels to complete PersonalityTokens.
 * These presets are derived from existing product profiles and known tenant
 * configurations so new tenants get a coherent visual identity from a
 * single keyword.
 */

import type { PersonalityTokens } from '../../core/types/tokens/personality';

export type PersonalityPreset = 'formal' | 'neutral' | 'playful' | 'expressive';

/**
 * Formal: modeled after recruiting.operator / BitHire.
 * Compact, restrained animations, structured borders, uppercase labels.
 */
const FORMAL_PERSONALITY: PersonalityTokens = {
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
    countUpEnabled: true,
  },
  chart: {
    animateOnMount: true,
    mountDuration: 600,
    lineStyle: 'sharp',
    showDots: true,
    useGradientFill: false,
    tooltipStyle: 'detailed',
    colorScheme: 'default',
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
};

/**
 * Neutral: modeled after generic.default / platform.admin.
 * Balanced animations, standard borders, sentence-case labels.
 */
const NEUTRAL_PERSONALITY: PersonalityTokens = {
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
    colorScheme: 'default',
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
};

/**
 * Playful: modeled after events.organizer / Evnto.
 * Bouncy animations, spacious cards, gradient accents, pill badges.
 */
const PLAYFUL_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 1.2,
    staggerDelay: 65,
    staggerMax: 480,
    entrance: 'bounce',
    entranceDuration: 400,
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
    mountDuration: 1000,
    lineStyle: 'smooth',
    showDots: true,
    useGradientFill: true,
    tooltipStyle: 'detailed',
    colorScheme: 'vibrant',
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
};

/**
 * Expressive: modeled after Rottay tenant.
 * Spring animations, gradient accents, glass tooltips, medium lift.
 */
const EXPRESSIVE_PERSONALITY: PersonalityTokens = {
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
    colorScheme: 'default',
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
};

const PRESET_MAP: Record<PersonalityPreset, PersonalityTokens> = {
  formal: FORMAL_PERSONALITY,
  neutral: NEUTRAL_PERSONALITY,
  playful: PLAYFUL_PERSONALITY,
  expressive: EXPRESSIVE_PERSONALITY,
};

/**
 * Resolve a personality preset keyword to a full PersonalityTokens object.
 *
 * @param preset - One of 'formal', 'neutral', 'playful', 'expressive'
 * @returns Partial<PersonalityTokens> that can be spread into a TenantConfig
 */
export function resolvePersonalityPreset(preset: string): Partial<PersonalityTokens> {
  const resolved = PRESET_MAP[preset as PersonalityPreset];
  if (resolved) {
    return resolved;
  }

  // Fallback to neutral for unknown presets
  return PRESET_MAP.neutral;
}
