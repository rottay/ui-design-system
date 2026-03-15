/**
 * Default personality tokens.
 * Applied when a tenant does not specify personality overrides.
 * Produces behavior identical to the pre-personality system.
 */

import type { PersonalityTokens } from '../contracts/tokens/personality';

export const DEFAULT_PERSONALITY: PersonalityTokens = {
  animation: {
    intensity: 0.5,
    staggerDelay: 40,
    staggerMax: 300,
    entrance: 'fade',
    entranceDuration: 200,
    hoverLift: 0,
    hoverScale: 1.0,
    useSpring: false,
    springTension: 170,
    springFriction: 26,
    pulseSpeed: 'normal',
    skeletonStyle: 'pulse',
    countUpEnabled: false,
  },
  chart: {
    animateOnMount: true,
    mountDuration: 500,
    lineStyle: 'sharp',
    showDots: true,
    useGradientFill: false,
    tooltipStyle: 'minimal',
    colorScheme: 'default',
  },
  typography: {
    headingWeightBias: 'normal',
    headingLetterSpacing: '-0.01em',
    labelStyle: 'uppercase',
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
