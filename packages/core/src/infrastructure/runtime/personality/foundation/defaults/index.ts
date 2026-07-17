/**
 * @fileoverview Default Personality Tokens - Rottay Design System
 * @description Baseline personality token values applied when a tenant or
 * product profile does not specify personality overrides. These defaults
 * produce behavior identical to the pre-personality system, ensuring
 * backward compatibility across all verticals.
 *
 * @module System/Personality/Defaults
 * @category System
 * @package @rottay/design-system
 */

import type { PersonalityTokens } from '../../../../../foundation/contracts/kernel/tokens/personality';

/**
 * Baseline personality tokens. Used as the bottom of the merge chain:
 * `DEFAULT_PERSONALITY -> vertical -> productProfile -> tenant`.
 *
 * Values are intentionally conservative (low intensity, no spring, no
 * hover lift) so the defaults feel neutral across all verticals.
 */
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
