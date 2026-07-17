/**
 * @fileoverview Personality presets mapping keywords to full PersonalityTokens.
 * @description Four presets derived from existing product profiles:
 * - `formal` - BitHire / recruiting: compact, subtle animations, structured borders
 * - `neutral` - Platform admin: balanced defaults, sentence-case labels
 * - `playful` - Evnto / events: bouncy animations, spacious layout, gradient accents
 * - `expressive` - Rottay brand: spring animations, glassmorphism, medium lift
 *
 * Unknown preset names degrade to `neutral` rather than throwing.
 */

import type { PersonalityTokens } from '../../../../../../foundation/contracts/kernel/tokens/personality';

/**
 * Named personality keywords that map to full PersonalityTokens objects.
 *
 * WHY presets exist: creating a complete PersonalityTokens from scratch
 * requires filling ~30 fields across 5 dimensions. Presets let tenant
 * admins pick a starting point by keyword and optionally override
 * individual fields, greatly simplifying the tenant creation flow.
 */
export type PersonalityPreset = 'formal' | 'neutral' | 'playful' | 'expressive';

/**
 * Formal: modeled after recruiting.operator / BitHire.
 * Compact, restrained animations, structured borders, uppercase labels.
 *
 * WHY this is distinct from the BitHire registry entry: the registry is the
 * exact BitHire config (including branding colors). This preset captures
 * only the personality "feel" so other tenants can adopt it without
 * adopting BitHire's brand palette.
 */
const FORMAL_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 0.35,       // Even lower than BitHire registry -- pure formal baseline
    staggerDelay: 20,
    staggerMax: 120,
    entrance: 'fade',
    entranceDuration: 160,
    hoverLift: 0,          // No lift -- maximum groundedness
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
    iconContainerShape: 'square', // WHY square: more structured than rounded
    badgeShape: 'pill',
    dividerStyle: 'solid',
  },
  card: {
    defaultElevation: 'sm',
    hoverElevation: 'none',     // No elevation change -- flat and stable
    showBorder: true,
    hoverTint: false,
    paddingDensity: 'compact',
  },
};

/**
 * Neutral: modeled after generic.default / platform.admin.
 * Balanced animations, standard borders, sentence-case labels.
 *
 * This is also the safe fallback when `resolvePersonalityPreset()` receives
 * an unknown preset name. Values are deliberately middle-of-the-road so
 * they work acceptably with any brand palette.
 */
const NEUTRAL_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 0.45,       // Mild -- noticeable but not distracting
    staggerDelay: 40,
    staggerMax: 220,
    entrance: 'fade',
    entranceDuration: 220,
    hoverLift: 1,          // Minimal lift for interactive feedback
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
    labelStyle: 'sentence', // WHY sentence: most universally readable casing
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
 *
 * Slightly toned down from the Evnto registry entry (intensity 1.2 vs 1.5,
 * staggerMax 480 vs 600) so it can apply broadly without overwhelming
 * tenants that are not event-focused.
 */
const PLAYFUL_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 1.2,        // High but not exaggerated
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
    colorScheme: 'vibrant', // WHY vibrant: playful tenants benefit from saturated palettes
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
    dividerStyle: 'dashed', // WHY dashed: adds visual rhythm without heaviness
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
 * Expressive: modeled after the Rottay flagship tenant.
 * Spring animations, gradient accents, glass tooltips, medium lift.
 *
 * Uses the same values as the Rottay registry entry's personality section.
 * This preset captures the "AI-futuristic startup" feel so other tenants
 * can adopt it independently of the Rottay brand colors.
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

/**
 * Maps each preset keyword to its complete PersonalityTokens definition.
 * Kept as a plain Record so lookup is O(1) and the set of valid presets
 * is statically typed via the `PersonalityPreset` union.
 */
const PRESET_MAP: Record<PersonalityPreset, PersonalityTokens> = {
  formal: FORMAL_PERSONALITY,
  neutral: NEUTRAL_PERSONALITY,
  playful: PLAYFUL_PERSONALITY,
  expressive: EXPRESSIVE_PERSONALITY,
};

/**
 * Resolves a personality preset keyword to a full PersonalityTokens object.
 *
 * The return type is `Partial<PersonalityTokens>` so callers can spread the
 * result into a TenantConfig without a type assertion, even though the runtime
 * value is always a complete PersonalityTokens.
 *
 * Unknown preset names gracefully degrade to `neutral` rather than throwing.
 * This is intentional -- the tenant creation UI may receive user-typed input
 * and should not crash on typos.
 *
 * @param preset - One of `'formal'`, `'neutral'`, `'playful'`, `'expressive'`.
 * @returns A complete PersonalityTokens object typed as Partial for spread ergonomics.
 */
export function resolvePersonalityPreset(preset: string): Partial<PersonalityTokens> {
  const resolved = PRESET_MAP[preset as PersonalityPreset];
  if (resolved) {
    return resolved;
  }

  // Unknown preset names degrade to a safe neutral baseline rather than
  // forcing every caller to pre-validate or handle undefined.
  return PRESET_MAP.neutral;
}
