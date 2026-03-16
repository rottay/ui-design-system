/**
 * @fileoverview Motion component prop types for the design system animation layer.
 *
 * Organized into three categories:
 *
 * 1. **Entrance animations** -- FadeIn, SlideIn, ScaleIn, ScrollReveal, StaggerChildren.
 *    Controlled via `BaseMotionProps` (duration, delay, once, style).
 *
 * 2. **Interactive effects** -- Parallax, Magnetic, TextReveal, CountUp, Morph.
 *    Driven by scroll position, pointer movement, or numeric interpolation.
 *
 * 3. **Decorative effects** -- GlassCard, GradientBackground, GlowEffect,
 *    ShimmerText, Spotlight, Aurora, Particles, NoiseTexture, GridPattern.
 *    Visual flourishes layered behind or around content.
 *
 * All interfaces follow the same convention: required children/content prop,
 * optional styling overrides (className, style), and effect-specific knobs.
 *
 * @example
 * ```tsx
 * import type { FadeInProps, ParallaxProps } from '@rottay/design-system';
 * ```
 */

import { CSSProperties, ReactNode } from 'react';

/** Cardinal direction for directional entrance animations. */
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

// ---------------------------------------------------------------------------
// Entrance animation props
// ---------------------------------------------------------------------------

/**
 * Shared base props for all entrance-style motion components.
 * `once` controls whether the animation replays on re-mount or only fires once.
 */
export interface BaseMotionProps {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** If true, the animation only plays once (not on re-mount). */
  once?: boolean;
  /** Additional CSS class name applied to the wrapper element. */
  className?: string;
  /** Content to animate. */
  children?: ReactNode;
  /** Inline styles applied to the wrapper element. */
  style?: CSSProperties;
}

/** Fade entrance with optional directional translate offset. */
export interface FadeInProps extends BaseMotionProps {
  /** Direction from which the element fades in. */
  direction?: AnimationDirection;
  /** Translate distance in pixels for the directional offset. */
  distance?: number;
}

/** Slide entrance -- similar to FadeIn but without opacity change. */
export interface SlideInProps extends BaseMotionProps {
  /** Direction from which the element slides in. */
  direction?: AnimationDirection;
  /** Translation distance in pixels. */
  distance?: number;
}

/** Scale entrance -- element grows from `initialScale` to 1. */
export interface ScaleInProps extends BaseMotionProps {
  /** Starting scale factor (0-1). Defaults to ~0.9 in implementations. */
  initialScale?: number;
}

/**
 * IntersectionObserver-driven reveal animation.
 * `threshold` and `rootMargin` mirror the IntersectionObserver API.
 */
export interface ScrollRevealProps extends BaseMotionProps {
  /** Fraction of element visible before triggering (0-1). */
  threshold?: number;
  /** CSS margin string applied to the observer root. */
  rootMargin?: string;
}

/**
 * Orchestrates staggered entrance of child elements.
 * Each child is delayed by `staggerDelay` ms after the previous one.
 */
export interface StaggerChildrenProps extends BaseMotionProps {
  /** Delay between consecutive children, in milliseconds. */
  staggerDelay?: number;
  /** Initial delay before the first child animates. */
  delayChildren?: number;
}

// ---------------------------------------------------------------------------
// Interactive effect props
// ---------------------------------------------------------------------------

/**
 * Scroll-linked vertical parallax effect.
 * `speed` < 1 creates a slow-follow effect; > 1 moves faster than scroll.
 */
export interface ParallaxProps {
  /** Parallax speed multiplier relative to scroll position. */
  speed?: number;
  /** Content to apply the parallax effect to. */
  children: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/**
 * Pointer-tracking magnetic attraction effect.
 * The element subtly follows the cursor within its bounding box.
 */
export interface MagneticProps {
  /** Attraction strength multiplier (higher = more movement). */
  strength?: number;
  /** Content that reacts to cursor proximity. */
  children: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/**
 * Progressive text reveal that animates characters, words, or lines.
 * `type` determines the granularity of the stagger.
 */
export interface TextRevealProps {
  /** The text string to reveal. */
  text: string;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
  /** Delay in milliseconds before the reveal starts. */
  delay?: number;
  /** Total animation duration in milliseconds. */
  duration?: number;
  /** Stagger unit: individual characters, whole words, or lines. */
  type?: 'char' | 'word' | 'line';
}

/**
 * Numeric counter that interpolates from `from` to `to`.
 * Optional `formatter` allows locale-aware number formatting.
 */
export interface CountUpProps {
  /** Starting value (defaults to 0). */
  from?: number;
  /** Target value the counter animates toward. */
  to: number;
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Delay in milliseconds before counting begins. */
  delay?: number;
  /** Text prepended to the displayed number (e.g. "$"). */
  prefix?: string;
  /** Text appended to the displayed number (e.g. "%"). */
  suffix?: string;
  /** Custom number formatting function (e.g. toLocaleString). */
  formatter?: (value: number) => string;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/**
 * Layout-animation wrapper that morphs between positions.
 * `layoutId` links sibling Morph instances for shared-element transitions.
 */
export interface MorphProps {
  /** Content to morph. */
  children: ReactNode;
  /** Shared identifier for cross-component layout transitions. */
  layoutId?: string;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

// ---------------------------------------------------------------------------
// Decorative effect props
// ---------------------------------------------------------------------------

/**
 * Frosted-glass card effect using backdrop-filter.
 * Opacity values are 0-1 floats controlling the RGBA alpha channels.
 */
export interface GlassCardProps {
  /** Blur radius in pixels for the backdrop filter. */
  blur?: number;
  /** Background alpha (0 = fully transparent, 1 = opaque). */
  bgOpacity?: number;
  /** Border alpha (0 = invisible, 1 = fully opaque). */
  borderOpacity?: number;
  /** Card content. */
  children: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** Animated gradient background that cycles through the provided color stops. */
export interface GradientBackgroundProps {
  /** Array of CSS color values for the gradient stops. */
  colors?: string[];
  /** Whether the gradient animates (rotates/shifts). */
  animate?: boolean;
  /** Animation cycle duration in milliseconds. */
  duration?: number;
  /** Content rendered on top of the gradient. */
  children?: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** Outer glow/halo effect wrapping child content. */
export interface GlowEffectProps {
  /** Glow color (CSS color value). */
  color?: string;
  /** Glow spread size. */
  intensity?: 'sm' | 'md' | 'lg';
  /** Content to wrap with the glow effect. */
  children: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** Animated shimmer/shine sweep across text content. */
export interface ShimmerTextProps {
  /** The text to display with the shimmer effect. */
  text: string;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** Cursor-tracking spotlight radial gradient overlay. */
export interface SpotlightProps {
  /** Spotlight circle diameter in pixels. */
  size?: number;
  /** Spotlight color (CSS color value). */
  color?: string;
  /** Content illuminated by the spotlight. */
  children: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** Animated aurora borealis background effect with blended color blobs. */
export interface AuroraProps {
  /** Array of CSS color values for the aurora blobs. */
  colors?: string[];
  /** Animation speed multiplier. */
  speed?: number;
  /** Content rendered above the aurora effect. */
  children?: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** Animated floating particle field rendered behind content. */
export interface ParticlesProps {
  /** Number of particles to render. */
  count?: number;
  /** Particle fill color (CSS color value). */
  color?: string;
  /** Particle movement speed multiplier. */
  speed?: number;
  /** Content rendered above the particle layer. */
  children?: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** SVG noise texture overlay for subtle grain effects. */
export interface NoiseTextureProps {
  /** Noise layer opacity (0-1). */
  opacity?: number;
  /** Content rendered beneath the noise overlay. */
  children?: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** CSS grid dot/line pattern overlay, optionally animated. */
export interface GridPatternProps {
  /** Grid cell size in pixels. */
  size?: number;
  /** Grid line/dot color (CSS color value). */
  color?: string;
  /** Pattern layer opacity (0-1). */
  opacity?: number;
  /** Whether the grid pattern animates (e.g. pulsing dots). */
  animate?: boolean;
  /** Content rendered above the grid pattern. */
  children?: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}
