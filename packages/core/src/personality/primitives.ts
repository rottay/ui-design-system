/**
 * @fileoverview Personality primitive resolvers - Rottay Design System
 * @description Translate high-level personality tokens into CSS variables,
 * prop defaults, and lightweight style objects consumed by public primitives.
 *
 * @remarks
 * This module is the shared bridge between token context and component-level
 * behavior. Engines should consume these resolved values rather than reading
 * raw personality tokens ad hoc.
 */

import type { CSSProperties } from 'react';

import type { DesignTokens } from '../contracts';

type CssVariableMap = Record<`--${string}`, string | number>;
type VariableStyle = CSSProperties & Record<`--${string}`, string | number>;

// These lookup maps translate personality token values into CSS variable
// references. They exist so that engines and components never need to
// build shadow/radius/padding strings themselves -- the personality
// system acts as a centralized token-to-CSS bridge.
const CARD_ELEVATION_MAP = {
  sm: 'var(--ds-shadow-sm)',
  md: 'var(--ds-shadow-md)',
  lg: 'var(--ds-shadow-lg)',
} as const;

const CARD_HOVER_ELEVATION_MAP = {
  none: 'var(--ds-card-shadow)',
  'lift-one': 'var(--ds-shadow-md)',
  'lift-two': 'var(--ds-shadow-lg)',
} as const;

const CARD_PADDING_MAP = {
  compact: {
    prop: 'sm',
    css: 'var(--ds-card-padding-sm)',
  },
  normal: {
    prop: 'md',
    css: 'var(--ds-card-padding-md)',
  },
  spacious: {
    prop: 'lg',
    css: 'var(--ds-card-padding-lg)',
  },
} as const;

const BADGE_RADIUS_MAP = {
  rounded: {
    prop: 'lg',
    css: 'var(--ds-radius-lg)',
  },
  pill: {
    prop: 'full',
    css: 'var(--ds-radius-full)',
  },
  square: {
    prop: 'sm',
    css: 'var(--ds-radius-sm)',
  },
} as const;

const PULSE_SPEED_MAP = {
  none: '0s',
  slow: '1.9s',
  normal: '1.5s',
  fast: '1.1s',
} as const;

const HEADING_WEIGHT_BIAS_MAP = {
  lighter: 500,
  normal: 600,
  heavier: 700,
} as const;

const LABEL_TRANSFORM_MAP = {
  uppercase: 'uppercase',
  sentence: 'none',
  capitalize: 'capitalize',
} as const;

/** Build the hover transform shared by buttons, cards, and badges. */
function buildHoverTransform(tokens: DesignTokens, multiplier: number = 1): string {
  // Clamp values to sane minimums: negative lift or sub-1 scale would push
  // elements down or shrink them on hover, which is never the intended behavior.
  const hoverLift = Math.max(tokens.personality.animation.hoverLift * multiplier, 0);
  const hoverScale = Math.max(tokens.personality.animation.hoverScale, 1);

  // Identity transform is returned as an explicit string rather than 'none' so
  // that the transition property still animates back from a non-identity state.
  if (hoverLift === 0 && hoverScale === 1) {
    return 'translateY(0) scale(1)';
  }

  return `translateY(${hoverLift === 0 ? '0' : `-${hoverLift}px`}) scale(${hoverScale})`;
}

/** Build the pressed-state transform that follows the configured hover scale. */
function buildActiveTransform(tokens: DesignTokens): string {
  const hoverScale = Math.max(tokens.personality.animation.hoverScale, 1);
  // Active (pressed) state subtracts a small amount from the hover scale to
  // give tactile feedback. The 0.97 floor prevents excessive shrinking if
  // the hover scale itself is already close to 1. When hover has no scale
  // effect, a fixed 0.98 provides a subtle press feel.
  const activeScale = hoverScale > 1 ? Math.max(hoverScale - 0.02, 0.97) : 0.98;

  return `translateY(0) scale(${activeScale})`;
}

/**
 * Resolve the full CSS-variable map injected by `SystemCssVariablesBridge`.
 * Translates every personality token into a namespaced CSS custom property
 * and derives component-level shorthand variables (card, badge, button,
 * skeleton, divider, typography, toast, modal, notification).
 *
 * @param tokens - The full resolved design token tree
 * @returns Record of CSS custom property names to their computed values
 */
export function resolvePersonalityCssVariables(tokens: DesignTokens): CssVariableMap {
  const cardPadding = CARD_PADDING_MAP[tokens.personality.card.paddingDensity];
  const badgeRadius = BADGE_RADIUS_MAP[tokens.personality.accent.badgeShape];
  const labelTransform = LABEL_TRANSFORM_MAP[tokens.personality.typography.labelStyle];
  const headingWeight = HEADING_WEIGHT_BIAS_MAP[tokens.personality.typography.headingWeightBias];
  const dividerStyle =
    tokens.personality.accent.dividerStyle === 'none'
      ? 'solid'
      : tokens.personality.accent.dividerStyle;
  // Spring-enabled personalities use the spring easing for button transitions
  // to match the bounce feel of their entrance animations. Non-spring
  // personalities get the standard ease-out to stay visually consistent.
  const buttonTransition = tokens.personality.animation.useSpring
    ? (tokens.transitions?.spring ?? 'var(--ds-transition-spring)')
    : (tokens.transitions?.normal ?? 'var(--ds-transition-normal)');
  const hoverTransform = buildHoverTransform(tokens);

  return {
    '--ds-personality-animation-intensity': tokens.personality.animation.intensity,
    '--ds-personality-animation-stagger-delay': `${tokens.personality.animation.staggerDelay}ms`,
    '--ds-personality-animation-stagger-max': `${tokens.personality.animation.staggerMax}ms`,
    '--ds-personality-animation-entrance': tokens.personality.animation.entrance,
    '--ds-personality-animation-entrance-duration': `${tokens.personality.animation.entranceDuration}ms`,
    '--ds-personality-animation-offset-distance': `${tokens.personality.animation.hoverLift + tokens.personality.animation.intensity * 12}px`,
    '--ds-personality-animation-hover-lift': `${tokens.personality.animation.hoverLift}px`,
    '--ds-personality-animation-hover-scale': tokens.personality.animation.hoverScale,
    '--ds-personality-animation-spring-tension': tokens.personality.animation.springTension,
    '--ds-personality-animation-spring-friction': tokens.personality.animation.springFriction,
    '--ds-personality-animation-pulse-speed': tokens.personality.animation.pulseSpeed,
    '--ds-personality-animation-skeleton-style': tokens.personality.animation.skeletonStyle,
    '--ds-personality-animation-count-up-enabled': tokens.personality.animation.countUpEnabled ? '1' : '0',
    '--ds-personality-chart-mount-duration': `${tokens.personality.chart.mountDuration}ms`,
    '--ds-personality-chart-line-style': tokens.personality.chart.lineStyle,
    '--ds-personality-chart-tooltip-style': tokens.personality.chart.tooltipStyle,
    '--ds-personality-card-padding-density': tokens.personality.card.paddingDensity,
    '--ds-personality-card-default-elevation': tokens.personality.card.defaultElevation,
    '--ds-personality-card-hover-elevation': tokens.personality.card.hoverElevation,
    '--ds-personality-card-show-border': tokens.personality.card.showBorder ? '1' : '0',
    '--ds-personality-card-hover-tint': tokens.personality.card.hoverTint ? '1' : '0',
    '--ds-personality-accent-bar-position': tokens.personality.accent.barPosition,
    '--ds-personality-accent-bar-style': tokens.personality.accent.barStyle,
    '--ds-personality-accent-bar-thickness': `${tokens.personality.accent.barThickness}px`,
    '--ds-personality-accent-badge-shape': tokens.personality.accent.badgeShape,
    '--ds-personality-accent-icon-shape': tokens.personality.accent.iconContainerShape,
    '--ds-personality-accent-divider-style': tokens.personality.accent.dividerStyle,
    '--ds-personality-typography-heading-letter-spacing': tokens.personality.typography.headingLetterSpacing,
    '--ds-personality-typography-heading-weight-bias': tokens.personality.typography.headingWeightBias,
    '--ds-personality-typography-label-style': tokens.personality.typography.labelStyle,
    '--ds-card-shadow': CARD_ELEVATION_MAP[tokens.personality.card.defaultElevation],
    '--ds-card-shadow-hover': CARD_HOVER_ELEVATION_MAP[tokens.personality.card.hoverElevation],
    '--ds-card-border': tokens.personality.card.showBorder ? 'var(--ds-color-border-primary)' : 'transparent',
    '--ds-card-border-hover': tokens.personality.card.showBorder ? 'var(--ds-color-border-secondary)' : 'transparent',
    '--ds-card-header-padding': cardPadding.css,
    '--ds-card-body-padding': cardPadding.css,
    '--ds-card-footer-padding': cardPadding.css,
    '--ds-card-bg-hover': tokens.personality.card.hoverTint
      ? 'color-mix(in srgb, var(--ds-card-bg) 90%, var(--ds-color-primary-100) 10%)'
      : 'var(--ds-card-bg)',
    '--ds-card-hover-transform': hoverTransform,
    '--ds-badge-radius': badgeRadius.css,
    '--ds-badge-hover-transform': hoverTransform,
    '--ds-divider-style': dividerStyle,
    '--ds-divider-color': tokens.personality.accent.dividerStyle === 'none'
      ? 'transparent'
      : 'var(--ds-color-border-primary)',
    '--ds-skeleton-animation-duration': PULSE_SPEED_MAP[tokens.personality.animation.pulseSpeed],
    '--ds-typography-heading-letter-spacing': tokens.personality.typography.headingLetterSpacing,
    '--ds-typography-heading-font-weight': headingWeight,
    '--ds-typography-label-transform': labelTransform,
    '--ds-button-transition': buttonTransition,
    '--ds-button-hover-transform': hoverTransform,
    '--ds-button-active-transform': buildActiveTransform(tokens),
    // Toast/message/notification durations are derived from entrance duration but
    // clamped to minimums. Too-fast enter animations look broken, and exits are
    // intentionally shorter (75-80% of enter) so dismissals feel snappy.
    '--ds-toast-enter-duration': `${Math.max(tokens.personality.animation.entranceDuration, 160)}ms`,
    '--ds-toast-exit-duration': `${Math.max(Math.round(tokens.personality.animation.entranceDuration * 0.75), 120)}ms`,
    '--ds-toast-enter-easing': tokens.personality.animation.useSpring
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--ds-toast-exit-easing': 'cubic-bezier(0.4, 0, 1, 1)',
    '--ds-message-enter-duration': `${Math.max(tokens.personality.animation.entranceDuration, 140)}ms`,
    '--ds-message-exit-duration': `${Math.max(Math.round(tokens.personality.animation.entranceDuration * 0.7), 120)}ms`,
    '--ds-message-enter-easing': tokens.personality.animation.useSpring
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.22, 1, 0.36, 1)',
    '--ds-message-exit-easing': 'cubic-bezier(0.4, 0, 1, 1)',
    '--ds-notification-enter-duration': `${Math.max(tokens.personality.animation.entranceDuration, 180)}ms`,
    '--ds-notification-exit-duration': `${Math.max(Math.round(tokens.personality.animation.entranceDuration * 0.8), 140)}ms`,
    '--ds-notification-enter-easing': tokens.personality.animation.useSpring
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.22, 1, 0.36, 1)',
    '--ds-notification-exit-easing': 'cubic-bezier(0.4, 0, 1, 1)',
    '--ds-modal-animation-duration': `${Math.max(tokens.personality.animation.entranceDuration, 180)}ms`,
    '--ds-modal-animation-timing': tokens.personality.animation.useSpring
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.22, 1, 0.36, 1)',
    '--ds-duration-fast': tokens.transitions?.fast ?? '200ms',
    '--ds-duration-normal': tokens.transitions?.normal ?? '300ms',
    '--ds-duration-slow': tokens.transitions?.slow ?? '400ms',
  };
}

/**
 * Resolve card prop defaults from personality tokens.
 * Engines call this once to derive `bordered`, `hoverable`, and `padding`
 * without reading the token context themselves.
 *
 * @param tokens - The full resolved design token tree
 * @returns Default card props derived from personality settings
 */
export function resolveCardPersonalityDefaults(tokens: DesignTokens) {
  const density = CARD_PADDING_MAP[tokens.personality.card.paddingDensity];

  return {
    bordered: tokens.personality.card.showBorder,
    // A card is considered "hoverable" if any hover effect is configured. This
    // compound check lets the three different hover mechanisms (shadow lift,
    // translateY lift, scale) independently contribute to the hover behavior
    // without requiring consumers to check all three.
    hoverable:
      tokens.personality.card.hoverElevation !== 'none' ||
      tokens.personality.animation.hoverLift > 0 ||
      tokens.personality.animation.hoverScale > 1,
    padding: density.prop,
  } as const;
}

/**
 * Resolve badge shape defaults from the active accent personality.
 *
 * @param tokens - The full resolved design token tree
 * @returns Default badge radius prop
 */
export function resolveBadgePersonalityDefaults(tokens: DesignTokens) {
  return {
    radius: BADGE_RADIUS_MAP[tokens.personality.accent.badgeShape].prop,
  } as const;
}

/**
 * Resolve button-level motion CSS variables derived from personality tokens.
 *
 * @param tokens - The full resolved design token tree
 * @returns CSSProperties containing button transition, hover, and active transforms
 */
export function resolveButtonPersonalityStyle(tokens: DesignTokens): CSSProperties {
  const variables = resolvePersonalityCssVariables(tokens);

  return {
    ['--ds-button-transition' as const]: variables['--ds-button-transition'],
    ['--ds-button-hover-transform' as const]: variables['--ds-button-hover-transform'],
    ['--ds-button-active-transform' as const]: variables['--ds-button-active-transform'],
  } as VariableStyle;
}

/**
 * Resolve skeleton animation defaults from personality tokens.
 *
 * @param tokens - The full resolved design token tree
 * @returns Skeleton animation type ('pulse' | 'wave') and duration CSS variable
 */
export function resolveSkeletonPersonalityDefaults(tokens: DesignTokens) {
  const variables = resolvePersonalityCssVariables(tokens);
  const animation =
    tokens.personality.animation.skeletonStyle === 'pulse' ? 'pulse' : 'wave';

  return {
    animation,
    style: {
      ['--ds-skeleton-animation-duration' as const]:
        variables['--ds-skeleton-animation-duration'],
    } as VariableStyle,
  } as const;
}

/**
 * Resolve divider styling defaults from the active accent personality.
 *
 * @param tokens - The full resolved design token tree
 * @returns Divider variant and CSS variable style object
 */
export function resolveDividerPersonalityDefaults(tokens: DesignTokens) {
  const variables = resolvePersonalityCssVariables(tokens);
  const style = tokens.personality.accent.dividerStyle;

  return {
    variant: style === 'none' ? 'solid' : style,
    style: {
      ['--ds-divider-style' as const]: variables['--ds-divider-style'],
      ['--ds-divider-color' as const]: variables['--ds-divider-color'],
    } as VariableStyle,
  } as const;
}

/**
 * Resolve heading typography tokens into inline CSS for typography compounds.
 *
 * @param tokens - The full resolved design token tree
 * @returns CSSProperties with letter-spacing and font-weight for headings
 */
export function resolveTypographyHeadingStyle(tokens: DesignTokens): CSSProperties {
  return {
    letterSpacing: tokens.personality.typography.headingLetterSpacing,
    fontWeight: HEADING_WEIGHT_BIAS_MAP[tokens.personality.typography.headingWeightBias],
  };
}

/**
 * Resolve label-specific text treatment (uppercase, capitalize, or sentence).
 *
 * @param tokens - The full resolved design token tree
 * @param isLabel - Whether the text element is a label
 * @returns CSSProperties with textTransform for labels, empty object otherwise
 */
export function resolveTypographyTextStyle(tokens: DesignTokens, isLabel: boolean): CSSProperties {
  return isLabel
    ? {
        textTransform: LABEL_TRANSFORM_MAP[tokens.personality.typography.labelStyle],
      }
    : {};
}

/**
 * Resolve statistic-specific personality variables (e.g. count-up animation).
 *
 * @param tokens - The full resolved design token tree
 * @returns CSSProperties with the count-up enablement CSS variable
 */
export function resolveStatisticPersonalityStyle(tokens: DesignTokens): CSSProperties {
  return {
    ['--ds-statistic-count-up-enabled' as const]:
      tokens.personality.animation.countUpEnabled ? '1' : '0',
  } as VariableStyle;
}

/**
 * Merge a base style object with personality-derived styles.
 * Base styles take precedence over personality styles so explicit
 * component overrides are never clobbered.
 *
 * @param baseStyle - Explicit inline styles from the component
 * @param personalityStyle - Personality-derived styles
 * @returns Merged CSSProperties, or undefined if both inputs are falsy
 */
export function mergePersonalityStyle(
  baseStyle: CSSProperties | undefined,
  personalityStyle: CSSProperties | undefined
): CSSProperties | undefined {
  if (!baseStyle && !personalityStyle) {
    return undefined;
  }

  // Personality styles are spread first so explicit component styles always win.
  // This is critical for components that need to override personality-derived
  // values (e.g., a Card with an explicit boxShadow prop).
  return {
    ...(personalityStyle ?? {}),
    ...(baseStyle ?? {}),
  };
}
