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

import type {
  AccentPersonalityTokens,
  AnimationPersonalityTokens,
  CardPersonalityTokens,
  ChartPersonalityTokens,
  DesignTokens,
  TransitionTokens,
  TypographyPersonalityTokens,
} from '@/foundation/contracts';

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
function buildHoverTransform(hoverLift: number, hoverScale: number, multiplier: number = 1): string {
  // Clamp values to sane minimums: negative lift or sub-1 scale would push
  // elements down or shrink them on hover, which is never the intended behavior.
  const lift = Math.max(hoverLift * multiplier, 0);
  const scale = Math.max(hoverScale, 1);

  // Identity transform is returned as an explicit string rather than 'none' so
  // that the transition property still animates back from a non-identity state.
  if (lift === 0 && scale === 1) {
    return 'translateY(0) scale(1)';
  }

  return `translateY(${lift === 0 ? '0' : `-${lift}px`}) scale(${scale})`;
}

/** Build the pressed-state transform that follows the configured hover scale. */
function buildActiveTransform(hoverScale: number): string {
  const scale = Math.max(hoverScale, 1);
  // Active (pressed) state subtracts a small amount from the hover scale to
  // give tactile feedback. The 0.97 floor prevents excessive shrinking if
  // the hover scale itself is already close to 1. When hover has no scale
  // effect, a fixed 0.98 provides a subtle press feel.
  const activeScale = scale > 1 ? Math.max(scale - 0.02, 0.97) : 0.98;

  return `translateY(0) scale(${activeScale})`;
}

/**
 * Deep-partial personality input: every dimension is optional, and every
 * field within a present dimension is independently optional. A tenant
 * declares only the fields it customizes, never a full dimension.
 */
type PartialPersonalityInput = {
  animation?: Partial<AnimationPersonalityTokens>;
  chart?: Partial<ChartPersonalityTokens>;
  typography?: Partial<TypographyPersonalityTokens>;
  accent?: Partial<AccentPersonalityTokens>;
  card?: Partial<CardPersonalityTokens>;
};

type PartialCssVariableMap = Record<`--${string}`, string | number | undefined>;

/**
 * Derive personality-driven CSS custom properties from a possibly-partial
 * personality object. Each variable is emitted only when every field it
 * depends on is defined -- a field the caller never declared produces no
 * entry, rather than a guessed default, so a sparse tenant delta never masks
 * a value an earlier layer of the CSS cascade already supplies.
 *
 * `resolvePersonalityCssVariables` below calls this with a fully-resolved
 * personality (every field always defined), which is why every variable it
 * documents is always present in its output.
 *
 * @param personality - Personality fields to derive variables from; a
 *   dimension or field the caller has not declared may be omitted
 * @param transitions - Transition duration/easing tokens; only consulted by
 *   the button-transition and duration-alias variables
 * @returns Record of CSS custom property names to computed values, or
 *   `undefined` for a variable whose source field(s) were not declared
 */
export function resolvePartialPersonalityCssVariables(
  personality: PartialPersonalityInput | undefined,
  transitions?: Partial<TransitionTokens>,
): PartialCssVariableMap {
  if (!personality) {
    return {};
  }

  const animation = personality.animation;
  const chart = personality.chart;
  const typography = personality.typography;
  const accent = personality.accent;
  const card = personality.card;

  const hoverLiftValue = animation?.hoverLift;
  const hoverScaleValue = animation?.hoverScale;
  const intensityValue = animation?.intensity;
  const entranceDurationValue = animation?.entranceDuration;
  const useSpringValue = animation?.useSpring;

  // Card padding density feeds three separate CSS variables (header/body/
  // footer), so it is resolved once rather than per-key.
  const cardPadding = card?.paddingDensity !== undefined ? CARD_PADDING_MAP[card.paddingDensity] : undefined;

  // Shared by card, badge, and button: identical formula, computed once.
  const hoverTransformValue =
    hoverLiftValue !== undefined || hoverScaleValue !== undefined
      ? buildHoverTransform(hoverLiftValue ?? 0, hoverScaleValue ?? 1)
      : undefined;

  // Spring-enabled personalities use the spring easing for button transitions
  // to match the bounce feel of their entrance animations. Non-spring
  // personalities get the standard ease-out to stay visually consistent.
  const buttonTransitionValue =
    useSpringValue !== undefined
      ? useSpringValue
        ? (transitions?.spring ?? 'var(--ds-transition-spring)')
        : (transitions?.normal ?? 'var(--ds-transition-normal)')
      : undefined;

  return {
    '--ds-personality-animation-intensity': animation?.intensity,
    '--ds-personality-animation-stagger-delay':
      animation?.staggerDelay !== undefined ? `${animation.staggerDelay}ms` : undefined,
    '--ds-personality-animation-stagger-max':
      animation?.staggerMax !== undefined ? `${animation.staggerMax}ms` : undefined,
    '--ds-personality-animation-entrance': animation?.entrance,
    '--ds-personality-animation-entrance-duration':
      entranceDurationValue !== undefined ? `${entranceDurationValue}ms` : undefined,
    // Composite of two independent fields with no natural neutral value for
    // intensity, so both must be declared rather than defaulting either one.
    '--ds-personality-animation-offset-distance':
      hoverLiftValue !== undefined && intensityValue !== undefined
        ? `${hoverLiftValue + intensityValue * 12}px`
        : undefined,
    '--ds-personality-animation-hover-lift': hoverLiftValue !== undefined ? `${hoverLiftValue}px` : undefined,
    '--ds-personality-animation-hover-scale': hoverScaleValue,
    '--ds-personality-animation-spring-tension': animation?.springTension,
    '--ds-personality-animation-spring-friction': animation?.springFriction,
    '--ds-personality-animation-pulse-speed': animation?.pulseSpeed,
    '--ds-personality-animation-skeleton-style': animation?.skeletonStyle,
    '--ds-personality-animation-count-up-enabled':
      animation?.countUpEnabled !== undefined ? (animation.countUpEnabled ? '1' : '0') : undefined,
    '--ds-personality-chart-mount-duration':
      chart?.mountDuration !== undefined ? `${chart.mountDuration}ms` : undefined,
    '--ds-personality-chart-line-style': chart?.lineStyle,
    '--ds-personality-chart-tooltip-style': chart?.tooltipStyle,
    '--ds-personality-card-padding-density': card?.paddingDensity,
    '--ds-personality-card-default-elevation': card?.defaultElevation,
    '--ds-personality-card-hover-elevation': card?.hoverElevation,
    '--ds-personality-card-show-border': card?.showBorder !== undefined ? (card.showBorder ? '1' : '0') : undefined,
    '--ds-personality-card-hover-tint': card?.hoverTint !== undefined ? (card.hoverTint ? '1' : '0') : undefined,
    '--ds-personality-accent-bar-position': accent?.barPosition,
    '--ds-personality-accent-bar-style': accent?.barStyle,
    '--ds-personality-accent-bar-thickness':
      accent?.barThickness !== undefined ? `${accent.barThickness}px` : undefined,
    '--ds-personality-accent-badge-shape': accent?.badgeShape,
    '--ds-personality-accent-icon-shape': accent?.iconContainerShape,
    '--ds-personality-accent-divider-style': accent?.dividerStyle,
    '--ds-personality-typography-heading-letter-spacing': typography?.headingLetterSpacing,
    '--ds-personality-typography-heading-weight-bias': typography?.headingWeightBias,
    '--ds-personality-typography-label-style': typography?.labelStyle,
    '--ds-card-shadow': card?.defaultElevation !== undefined ? CARD_ELEVATION_MAP[card.defaultElevation] : undefined,
    '--ds-card-shadow-hover':
      card?.hoverElevation !== undefined ? CARD_HOVER_ELEVATION_MAP[card.hoverElevation] : undefined,
    '--ds-card-border':
      card?.showBorder !== undefined
        ? card.showBorder
          ? 'var(--ds-color-border-primary)'
          : 'transparent'
        : undefined,
    '--ds-card-border-hover':
      card?.showBorder !== undefined
        ? card.showBorder
          ? 'var(--ds-color-border-secondary)'
          : 'transparent'
        : undefined,
    '--ds-card-header-padding': cardPadding?.css,
    '--ds-card-body-padding': cardPadding?.css,
    '--ds-card-footer-padding': cardPadding?.css,
    '--ds-card-bg-hover':
      card?.hoverTint !== undefined
        ? card.hoverTint
          ? 'color-mix(in srgb, var(--ds-card-bg) 90%, var(--ds-color-primary-100) 10%)'
          : 'var(--ds-card-bg)'
        : undefined,
    '--ds-card-hover-transform': hoverTransformValue,
    '--ds-badge-radius': accent?.badgeShape !== undefined ? BADGE_RADIUS_MAP[accent.badgeShape].css : undefined,
    '--ds-badge-hover-transform': hoverTransformValue,
    '--ds-divider-style':
      accent?.dividerStyle !== undefined
        ? accent.dividerStyle === 'none'
          ? 'solid'
          : accent.dividerStyle
        : undefined,
    '--ds-divider-color':
      accent?.dividerStyle !== undefined
        ? accent.dividerStyle === 'none'
          ? 'transparent'
          : 'var(--ds-color-border-primary)'
        : undefined,
    '--ds-skeleton-animation-duration':
      animation?.pulseSpeed !== undefined ? PULSE_SPEED_MAP[animation.pulseSpeed] : undefined,
    '--ds-typography-heading-letter-spacing': typography?.headingLetterSpacing,
    '--ds-typography-heading-font-weight':
      typography?.headingWeightBias !== undefined
        ? HEADING_WEIGHT_BIAS_MAP[typography.headingWeightBias]
        : undefined,
    '--ds-typography-label-transform':
      typography?.labelStyle !== undefined ? LABEL_TRANSFORM_MAP[typography.labelStyle] : undefined,
    '--ds-button-transition': buttonTransitionValue,
    '--ds-button-hover-transform': hoverTransformValue,
    '--ds-button-active-transform': hoverScaleValue !== undefined ? buildActiveTransform(hoverScaleValue) : undefined,
    // Toast/message/notification durations are derived from entrance duration but
    // clamped to minimums. Too-fast enter animations look broken, and exits are
    // intentionally shorter (75-80% of enter) so dismissals feel snappy.
    '--ds-toast-enter-duration':
      entranceDurationValue !== undefined ? `${Math.max(entranceDurationValue, 160)}ms` : undefined,
    '--ds-toast-exit-duration':
      entranceDurationValue !== undefined
        ? `${Math.max(Math.round(entranceDurationValue * 0.75), 120)}ms`
        : undefined,
    '--ds-toast-enter-easing':
      useSpringValue !== undefined
        ? useSpringValue
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.4, 0, 0.2, 1)'
        : undefined,
    '--ds-toast-exit-easing': 'cubic-bezier(0.4, 0, 1, 1)',
    '--ds-message-enter-duration':
      entranceDurationValue !== undefined ? `${Math.max(entranceDurationValue, 140)}ms` : undefined,
    '--ds-message-exit-duration':
      entranceDurationValue !== undefined
        ? `${Math.max(Math.round(entranceDurationValue * 0.7), 120)}ms`
        : undefined,
    '--ds-message-enter-easing':
      useSpringValue !== undefined
        ? useSpringValue
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.22, 1, 0.36, 1)'
        : undefined,
    '--ds-message-exit-easing': 'cubic-bezier(0.4, 0, 1, 1)',
    '--ds-notification-enter-duration':
      entranceDurationValue !== undefined ? `${Math.max(entranceDurationValue, 180)}ms` : undefined,
    '--ds-notification-exit-duration':
      entranceDurationValue !== undefined
        ? `${Math.max(Math.round(entranceDurationValue * 0.8), 140)}ms`
        : undefined,
    '--ds-notification-enter-easing':
      useSpringValue !== undefined
        ? useSpringValue
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.22, 1, 0.36, 1)'
        : undefined,
    '--ds-notification-exit-easing': 'cubic-bezier(0.4, 0, 1, 1)',
    '--ds-modal-animation-duration':
      entranceDurationValue !== undefined ? `${Math.max(entranceDurationValue, 180)}ms` : undefined,
    '--ds-modal-animation-timing':
      useSpringValue !== undefined
        ? useSpringValue
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.22, 1, 0.36, 1)'
        : undefined,
    // Foundation default lives in foundation/tokens/css/foundation/animations/transitions.css
    // (--ds-duration-fast|normal|slow); falling back to that chain's own
    // underlying primitives here, instead of a re-declared literal, keeps the
    // foundation file the single numeric source when transitions is absent.
    '--ds-duration-fast': transitions?.fast ?? 'var(--duration-faster)',
    '--ds-duration-normal': transitions?.normal ?? 'var(--duration-fast)',
    '--ds-duration-slow': transitions?.slow ?? 'var(--duration-normal)',
  };
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
  const resolved = resolvePartialPersonalityCssVariables(tokens.personality, tokens.transitions);

  // tokens.personality has every field populated (DEFAULT_PERSONALITY is the
  // floor of its merge chain), so every key above is always defined here;
  // this filter exists to satisfy CssVariableMap's non-optional value type.
  const variables: CssVariableMap = {};
  for (const [name, value] of Object.entries(resolved)) {
    if (value !== undefined) {
      variables[name as `--${string}`] = value;
    }
  }
  return variables;
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
