/**
 * Animation Tokens
 * Transitions, durations, easing curves, and keyframes
 */

// ==================== Transition Durations ====================
export const duration = {
  instant: '0ms',
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '1000ms',
} as const;

// ==================== Easing Functions ====================
export const easing = {
  // Standard
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Cubic bezier curves
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  emphasized: 'cubic-bezier(0.4, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',

  // Custom
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

// ==================== Transition Presets ====================
export const transitions = {
  // Common transitions
  all: `all ${duration.normal} ${easing.standard}`,
  colors: `color ${duration.normal} ${easing.standard}, background-color ${duration.normal} ${easing.standard}, border-color ${duration.normal} ${easing.standard}`,
  opacity: `opacity ${duration.normal} ${easing.standard}`,
  shadow: `box-shadow ${duration.normal} ${easing.standard}`,
  transform: `transform ${duration.normal} ${easing.standard}`,

  // Fast variants
  fast: {
    all: `all ${duration.fast} ${easing.standard}`,
    colors: `color ${duration.fast} ${easing.standard}, background-color ${duration.fast} ${easing.standard}, border-color ${duration.fast} ${easing.standard}`,
    opacity: `opacity ${duration.fast} ${easing.standard}`,
    shadow: `box-shadow ${duration.fast} ${easing.standard}`,
    transform: `transform ${duration.fast} ${easing.standard}`,
  },

  // Slow variants
  slow: {
    all: `all ${duration.slow} ${easing.standard}`,
    colors: `color ${duration.slow} ${easing.standard}, background-color ${duration.slow} ${easing.standard}, border-color ${duration.slow} ${easing.standard}`,
    opacity: `opacity ${duration.slow} ${easing.standard}`,
    shadow: `box-shadow ${duration.slow} ${easing.standard}`,
    transform: `transform ${duration.slow} ${easing.standard}`,
  },
} as const;

// ==================== Component Transitions ====================
export const componentTransitions = {
  button: {
    default: `all ${duration.fast} ${easing.standard}`,
    hover: `transform ${duration.fast} ${easing.standard}, box-shadow ${duration.fast} ${easing.standard}`,
  },
  link: {
    default: `color ${duration.fast} ${easing.standard}`,
  },
  card: {
    default: `box-shadow ${duration.normal} ${easing.standard}, transform ${duration.normal} ${easing.standard}`,
  },
  modal: {
    enter: `opacity ${duration.normal} ${easing.decelerate}, transform ${duration.normal} ${easing.decelerate}`,
    exit: `opacity ${duration.fast} ${easing.accelerate}, transform ${duration.fast} ${easing.accelerate}`,
  },
  dropdown: {
    enter: `opacity ${duration.fast} ${easing.decelerate}, transform ${duration.fast} ${easing.decelerate}`,
    exit: `opacity ${duration.fast} ${easing.accelerate}`,
  },
  tooltip: {
    enter: `opacity ${duration.fast} ${easing.standard}`,
    exit: `opacity ${duration.fast} ${easing.standard}`,
  },
  collapse: {
    enter: `height ${duration.normal} ${easing.standard}`,
    exit: `height ${duration.normal} ${easing.standard}`,
  },
} as const;

// ==================== Keyframe Animations ====================
export const keyframes = {
  // Fade
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },

  // Slide
  slideInUp: {
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInDown: {
    from: { transform: 'translateY(-100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInLeft: {
    from: { transform: 'translateX(-100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideInRight: {
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },

  // Scale
  scaleIn: {
    from: { transform: 'scale(0.9)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.9)', opacity: 0 },
  },

  // Spin
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },

  // Pulse
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },

  // Bounce
  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-25%)' },
  },

  // Shake
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
  },

  // Wiggle
  wiggle: {
    '0%, 100%': { transform: 'rotate(0deg)' },
    '25%': { transform: 'rotate(-3deg)' },
    '75%': { transform: 'rotate(3deg)' },
  },

  // Ping
  ping: {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '75%, 100%': { transform: 'scale(2)', opacity: 0 },
  },
} as const;

// ==================== Animation Presets ====================
export const animations = {
  fadeIn: `fadeIn ${duration.normal} ${easing.standard}`,
  fadeOut: `fadeOut ${duration.normal} ${easing.standard}`,
  slideInUp: `slideInUp ${duration.normal} ${easing.decelerate}`,
  slideInDown: `slideInDown ${duration.normal} ${easing.decelerate}`,
  slideInLeft: `slideInLeft ${duration.normal} ${easing.decelerate}`,
  slideInRight: `slideInRight ${duration.normal} ${easing.decelerate}`,
  scaleIn: `scaleIn ${duration.normal} ${easing.emphasized}`,
  scaleOut: `scaleOut ${duration.normal} ${easing.emphasized}`,
  spin: `spin ${duration.slowest} ${easing.linear} infinite`,
  pulse: `pulse ${duration.slower} ${easing.ease} infinite`,
  bounce: `bounce ${duration.slowest} ${easing.ease} infinite`,
  shake: `shake ${duration.slower} ${easing.ease}`,
  wiggle: `wiggle ${duration.slower} ${easing.ease}`,
  ping: `ping ${duration.slowest} ${easing.ease} infinite`,
} as const;

// ==================== Utility Functions ====================

/**
 * Create custom transition
 */
export function createTransition(
  property: string | string[],
  durationValue: keyof typeof duration = 'normal',
  easingValue: keyof typeof easing = 'standard'
): string {
  const props = Array.isArray(property) ? property : [property];
  const dur = duration[durationValue];
  const ease = easing[easingValue];
  return props.map(prop => `${prop} ${dur} ${ease}`).join(', ');
}

/**
 * Create custom animation
 */
export function createAnimation(
  name: string,
  durationValue: keyof typeof duration = 'normal',
  easingValue: keyof typeof easing = 'standard',
  iterationCount: number | 'infinite' = 1,
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse' = 'normal',
  fillMode: 'none' | 'forwards' | 'backwards' | 'both' = 'none'
): string {
  const dur = duration[durationValue];
  const ease = easing[easingValue];
  return `${name} ${dur} ${ease} ${iterationCount} ${direction} ${fillMode}`;
}

/**
 * Generate CSS keyframes string
 */
export function generateKeyframes(name: string, frames: Record<string, any>): string {
  const frameStrings = Object.entries(frames).map(([key, value]) => {
    const props = Object.entries(value as Record<string, any>)
      .map(([prop, val]) => `${prop}: ${val};`)
      .join(' ');
    return `${key} { ${props} }`;
  });
  return `@keyframes ${name} { ${frameStrings.join(' ')} }`;
}

// ==================== Type Exports ====================
export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
export type KeyframeKey = keyof typeof keyframes;
export type AnimationKey = keyof typeof animations;
