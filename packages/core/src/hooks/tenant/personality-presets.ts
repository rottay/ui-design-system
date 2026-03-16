/**
 * @fileoverview Personality Presets - Rottay Design System
 * @description Maps human-friendly personality labels (`formal`, `neutral`,
 * `playful`, `expressive`) to complete PersonalityTokens objects. These presets
 * allow new tenants to receive a coherent visual identity from a single keyword
 * during onboarding, without manually configuring 30+ individual token values.
 *
 * Each preset was derived from real product profiles:
 * - `formal` -> BitHire (recruiting, professional tone)
 * - `neutral` -> Platform Admin (balanced, general-purpose)
 * - `playful` -> Evnto (events, energetic feel)
 * - `expressive` -> Rottay brand (refined, spring-based motion)
 *
 * @example Applying a preset during tenant creation
 * ```ts
 * import { resolvePersonalityPreset } from '@rottay/design-system';
 *
 * const tokens = resolvePersonalityPreset('playful');
 * // tokens.animation.entrance === 'bounce'
 * // tokens.card.paddingDensity === 'spacious'
 * ```
 *
 * @module System/Hooks/Tenant/PersonalityPresets
 * @category System
 * @package @rottay/design-system
 */

import type { PersonalityTokens } from '../../contracts/tokens/personality';

/**
 * The four supported personality presets. Each maps to a complete set of
 * PersonalityTokens covering animation, chart, typography, accent, and card styles.
 */
export type PersonalityPreset = 'formal' | 'neutral' | 'playful' | 'expressive';

/**
 * Formal: modeled after recruiting.operator / BitHire.
 * Compact, restrained animations, structured borders, uppercase labels.
 *
 * Design rationale: recruiting and enterprise contexts demand a professional,
 * no-nonsense feel. Animations are minimal (0.35 intensity, no spring physics)
 * to avoid distracting users during data-heavy workflows like candidate review.
 */
const FORMAL_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 0.35,          // Low intensity: subtle motion only
    staggerDelay: 20,         // Fast stagger: lists appear near-instantly
    staggerMax: 120,
    entrance: 'fade',         // Simple fade avoids flashy transitions
    entranceDuration: 160,
    hoverLift: 0,             // No lift: flat, document-like feel
    hoverScale: 1.0,          // No scale: cards stay static on hover
    useSpring: false,         // No spring physics: predictable, linear easing
    springTension: 170,
    springFriction: 24,
    pulseSpeed: 'slow',
    skeletonStyle: 'pulse',
    countUpEnabled: true,
  },
  chart: {
    animateOnMount: true,
    mountDuration: 600,
    lineStyle: 'sharp',       // Sharp line joins for precise data visualization
    showDots: true,
    useGradientFill: false,   // No gradient: clean, minimal chart backgrounds
    tooltipStyle: 'detailed',
    colorScheme: 'default',
  },
  typography: {
    headingWeightBias: 'heavier',
    headingLetterSpacing: '-0.01em',
    labelStyle: 'uppercase',  // Uppercase labels reinforce structured formality
  },
  accent: {
    barPosition: 'left',      // Left bar: vertical accent common in enterprise UIs
    barThickness: 3,
    barStyle: 'solid',
    iconContainerShape: 'square',
    badgeShape: 'pill',
    dividerStyle: 'solid',
  },
  card: {
    defaultElevation: 'sm',
    hoverElevation: 'none',   // No hover elevation: flat, static card surfaces
    showBorder: true,         // Visible borders: clear content boundaries
    hoverTint: false,
    paddingDensity: 'compact', // Compact: maximizes data density
  },
};

/**
 * Neutral: modeled after generic.default / platform.admin.
 * Balanced animations, standard borders, sentence-case labels.
 *
 * Design rationale: serves as the safe default for tenants that haven't
 * customized their personality. Every value is intentionally "middle of the
 * road" so it works acceptably for any product vertical.
 */
const NEUTRAL_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 0.45,          // Moderate: noticeable but not distracting
    staggerDelay: 40,
    staggerMax: 220,
    entrance: 'fade',
    entranceDuration: 220,
    hoverLift: 1,             // Slight lift: gives interactive feedback
    hoverScale: 1.0,
    useSpring: false,         // Linear easing: predictable, professional
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
    labelStyle: 'sentence',   // Sentence case: friendly but not informal
  },
  accent: {
    barPosition: 'top',       // Top bar: widely recognized card accent pattern
    barThickness: 3,
    barStyle: 'solid',
    iconContainerShape: 'rounded',
    badgeShape: 'rounded',
    dividerStyle: 'solid',
  },
  card: {
    defaultElevation: 'sm',
    hoverElevation: 'lift-one', // Subtle lift on hover for interactivity
    showBorder: true,
    hoverTint: false,
    paddingDensity: 'normal',
  },
};

/**
 * Playful: modeled after events.organizer / Evnto.
 * Bouncy animations, spacious cards, gradient accents, pill badges.
 *
 * Design rationale: event platforms benefit from energy and delight.
 * Spring physics, bouncy entrances, and vibrant charts create an engaging
 * experience that matches the excitement of event planning.
 */
const PLAYFUL_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 1.2,           // High intensity: motion-rich, attention-grabbing
    staggerDelay: 65,         // Longer stagger: visible cascading entrance effect
    staggerMax: 480,
    entrance: 'bounce',       // Bounce entrance: playful, energetic first impression
    entranceDuration: 400,
    hoverLift: 4,             // Noticeable lift: cards feel physically interactive
    hoverScale: 1.03,         // Slight scale-up: reinforces the tactile feel
    useSpring: true,          // Spring physics: organic, bouncy motion curves
    springTension: 200,       // Higher tension: snappy spring response
    springFriction: 18,       // Lower friction: more oscillation before settling
    pulseSpeed: 'fast',
    skeletonStyle: 'wave',
    countUpEnabled: true,
  },
  chart: {
    animateOnMount: true,
    mountDuration: 1000,      // Longer mount: dramatic chart reveal
    lineStyle: 'smooth',      // Smooth curves: organic, friendly data visualization
    showDots: true,
    useGradientFill: true,    // Gradient fills: visually rich chart areas
    tooltipStyle: 'detailed',
    colorScheme: 'vibrant',   // Vibrant: saturated, energetic color palette
  },
  typography: {
    headingWeightBias: 'heavier',
    headingLetterSpacing: '-0.02em',
    labelStyle: 'capitalize', // Capitalize: friendly but structured
  },
  accent: {
    barPosition: 'top',
    barThickness: 4,          // Thicker bar: bolder accent presence
    barStyle: 'animated',     // Animated bar: adds movement to card headers
    iconContainerShape: 'circle',
    badgeShape: 'pill',
    dividerStyle: 'dashed',   // Dashed dividers: softer separation
  },
  card: {
    defaultElevation: 'md',   // Medium elevation: floating card feel
    hoverElevation: 'lift-two', // Strong lift: cards feel like they pop up
    showBorder: false,        // No border: relies on shadow for definition
    hoverTint: true,          // Tint on hover: adds color feedback
    paddingDensity: 'spacious', // Spacious: breathing room for event content
  },
};

/**
 * Expressive: modeled after Rottay tenant.
 * Spring animations, gradient accents, glass tooltips, medium lift.
 *
 * Design rationale: the Rottay brand identity uses refined motion and subtle
 * gradients to feel premium without being over-the-top. Spring physics provide
 * natural movement, while glass tooltips and gradient accents add polish.
 */
const EXPRESSIVE_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 1.0,           // Full intensity: rich but controlled motion
    staggerDelay: 50,
    staggerMax: 400,
    entrance: 'spring',       // Spring entrance: natural, physics-based reveal
    entranceDuration: 300,
    hoverLift: 2,             // Moderate lift: noticeable but refined
    hoverScale: 1.01,         // Barely perceptible scale: premium subtlety
    useSpring: true,          // Spring physics: organic, natural-feeling motion
    springTension: 170,       // Standard tension: balanced responsiveness
    springFriction: 26,       // Higher friction than playful: settles faster
    pulseSpeed: 'normal',
    skeletonStyle: 'shimmer',
    countUpEnabled: true,
  },
  chart: {
    animateOnMount: true,
    mountDuration: 800,
    lineStyle: 'smooth',      // Smooth curves: polished, premium look
    showDots: false,          // No dots: cleaner line charts
    useGradientFill: true,    // Gradient fills: rich visual depth
    tooltipStyle: 'glass',    // Glass tooltips: frosted/blurred premium feel
    colorScheme: 'default',
  },
  typography: {
    headingWeightBias: 'normal',
    headingLetterSpacing: '-0.025em', // Tighter tracking: refined, modern typography
    labelStyle: 'sentence',
  },
  accent: {
    barPosition: 'top',
    barThickness: 2,          // Thin bar: subtle, elegant accent
    barStyle: 'gradient',     // Gradient bar: branded, visually distinct
    iconContainerShape: 'rounded',
    badgeShape: 'rounded',
    dividerStyle: 'solid',
  },
  card: {
    defaultElevation: 'md',
    hoverElevation: 'lift-two',
    showBorder: false,        // Borderless: relies on shadow for premium feel
    hoverTint: true,          // Color tint on hover: interactive polish
    paddingDensity: 'normal',
  },
};

/** Lookup table mapping each preset keyword to its full token configuration. */
const PRESET_MAP: Record<PersonalityPreset, PersonalityTokens> = {
  formal: FORMAL_PERSONALITY,
  neutral: NEUTRAL_PERSONALITY,
  playful: PLAYFUL_PERSONALITY,
  expressive: EXPRESSIVE_PERSONALITY,
};

/**
 * Resolves a personality preset keyword to a full PersonalityTokens object.
 *
 * Accepts any string and performs a safe lookup against known presets.
 * Unknown or misspelled presets silently fall back to `neutral` rather than
 * throwing, because this function is often called with user-provided input
 * during tenant onboarding where a crash would block the entire flow.
 *
 * @param preset - One of 'formal', 'neutral', 'playful', 'expressive'.
 *   Unknown values fall back to 'neutral'.
 * @returns A complete PersonalityTokens object (typed as Partial for
 *   spread compatibility with TenantConfig, which may override individual fields).
 *
 * @example
 * ```ts
 * const tokens = resolvePersonalityPreset('playful');
 * // tokens.animation.entrance === 'bounce'
 *
 * const fallback = resolvePersonalityPreset('unknown');
 * // fallback === NEUTRAL_PERSONALITY (silent fallback)
 * ```
 */
export function resolvePersonalityPreset(preset: string): Partial<PersonalityTokens> {
  // Cast to PersonalityPreset for the lookup; the fallback below handles misses.
  const resolved = PRESET_MAP[preset as PersonalityPreset];
  if (resolved) {
    return resolved;
  }

  // Neutral is the safest default: it works acceptably for any product vertical
  // and avoids surprising animations or visual noise for misconfigured tenants.
  return PRESET_MAP.neutral;
}
