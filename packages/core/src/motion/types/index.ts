/**
 * @fileoverview Motion component prop types for the design system animation layer.
 *
 * Organized into three categories:
 *
 * 1. **Entrance animations** -- FadeIn, SlideIn, ScaleIn, ScrollReveal, StaggerChildren.
 *    Most consume `BaseMotionProps`; ScrollReveal retains its timing fields
 *    only as deprecated source compatibility because its CSS timeline ignores them.
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
 *
 * ---
 *
 * ## The interruptibility law (choreography layer, WO-CRA-06)
 *
 * Interactive motion -- anything that can be re-triggered before it settles
 * (an overlay closing then reopening, a FLIP-ed element moving again before
 * its previous move finished) -- MUST be retargetable mid-flight. A fixed-
 * duration `@keyframes` animation is NOT retargetable: changing its
 * `animation-name` restarts a new animation from scratch, producing a visible
 * jump instead of a smooth reversal. Two sanctioned mechanisms:
 *
 * 1. **CSS transitions driven by `data-state`.** {@link usePresence} and
 *    {@link Presence} (`motion/hooks/use-presence`, `motion/primitives/presence`)
 *    expose `dataState: 'open' | 'closed'` (see {@link MotionDataState}
 *    below) for exactly this: style both states with plain `transition`, and
 *    the browser retargets automatically when `dataState` flips again before
 *    the previous transition finished. This is the preferred mechanism
 *    whenever a component's motion is a simple two-state (open/closed)
 *    visual, because it needs no imperative cancellation logic at all.
 * 2. **Web Animations API with `commitStyles()` where JS drives.**
 *    {@link useFlipLayout} (`motion/hooks/use-flip-layout`) is the JS-driven
 *    case: it measures real DOM rects, so it cannot be pure CSS. Before
 *    starting a new invert-play animation on a node, it calls
 *    `animation.commitStyles()` (bakes the current mid-flight frame into the
 *    node's style) then `animation.cancel()` on any animation already
 *    running there, so the new animation's start point is the node's ACTUAL
 *    current visual position, not a snap back to its resting state.
 *
 * A known, deliberate exception: `Modal`/`Drawer`/`Toast.Container`/
 * `Dropdown`/`ContextMenu` mirror their existing entrance `@keyframes` with
 * an exit counterpart (`*-enter` / `*-exit`) driven by `usePresence`, rather
 * than converting to `data-state` + `transition`. Keyframes here are for a
 * discrete, non-continuously-interactive state (open vs. closed), not a
 * value a user drags/hovers/presses through, and reusing the ALREADY-CORRECT
 * enter keyframe as the exit's mirror was the lower-risk change against
 * components with native `<dialog>`/portal/focus-trap timing. Re-opening one
 * of these while its exit keyframe is still playing does not smoothly
 * reverse -- it restarts. `useFlipLayout` and any NEW `data-state`-driven
 * component (Dropdown/ContextMenu's popover motion) do not have this gap.
 */

import { CSSProperties, ReactNode } from "react";

/**
 * The presence data-state contract: `'open'` while a node should be at its
 * resting visual state, `'closed'` from the moment exit is requested until
 * (see {@link usePresence}) its own exit transition/animation completes and
 * it unmounts. Style both states with a `transition` (not `@keyframes`) to
 * satisfy the interruptibility law above.
 */
export type MotionDataState = "open" | "closed";

/** Cardinal direction for directional entrance animations. */
export type AnimationDirection = "up" | "down" | "left" | "right";

// ---------------------------------------------------------------------------
// Entrance animation props
// ---------------------------------------------------------------------------

/**
 * Shared base props for all entrance-style motion components.
 * Canonical timing props carry an explicit `Ms` suffix. The un-suffixed props
 * remain as deprecated compatibility aliases for one minor release.
 */
export interface BaseMotionProps {
  /** Animation duration in milliseconds. */
  durationMs?: number;
  /** Delay before the animation starts, in milliseconds. */
  delayMs?: number;
  /**
   * @deprecated Use `durationMs`. During the compatibility window, positive
   * values up to 10 are interpreted as seconds and all other values as ms.
   */
  duration?: number;
  /**
   * @deprecated Use `delayMs`. During the compatibility window, positive
   * values up to 10 are interpreted as seconds and all other values as ms.
   */
  delay?: number;
  /** If true, the viewport-triggered animation only plays on its first entry. */
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
  /**
   * @deprecated ScrollReveal's CSS scroll-timeline path cannot honor explicit
   * timing. This prop remains accepted for source compatibility and is ignored.
   */
  durationMs?: number;
  /**
   * @deprecated ScrollReveal's CSS scroll-timeline path cannot honor explicit
   * timing. This prop remains accepted for source compatibility and is ignored.
   */
  delayMs?: number;
  /**
   * @deprecated ScrollReveal never consumed this legacy timing prop. It remains
   * accepted for source compatibility and is ignored.
   */
  duration?: number;
  /**
   * @deprecated ScrollReveal never consumed this legacy timing prop. It remains
   * accepted for source compatibility and is ignored.
   */
  delay?: number;
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
  staggerDelayMs?: number;
  /** Initial delay before the first child animates, in milliseconds. */
  delayChildrenMs?: number;
  /** @deprecated Use `staggerDelayMs`; legacy seconds remain compatible for one minor. */
  staggerDelay?: number;
  /** @deprecated Use `delayChildrenMs`; legacy seconds remain compatible for one minor. */
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
  delayMs?: number;
  /** Total time in milliseconds from the first segment starting to the last settling. */
  durationMs?: number;
  /** @deprecated Use `delayMs`; legacy seconds remain compatible for one minor. */
  delay?: number;
  /** @deprecated Use `durationMs`; legacy seconds remain compatible for one minor. */
  duration?: number;
  /** Stagger unit: individual characters, whole words, or lines. */
  type?: "char" | "word" | "line";
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
  durationMs?: number;
  /** Delay in milliseconds before counting begins. */
  delayMs?: number;
  /** @deprecated Use `durationMs`; legacy seconds remain compatible for one minor. */
  duration?: number;
  /** @deprecated Use `delayMs`; legacy seconds remain compatible for one minor. */
  delay?: number;
  /** Text prepended to the displayed number (e.g. "$"). */
  prefix?: string;
  /** Text appended to the displayed number (e.g. "%"). */
  suffix?: string;
  /** Fixed decimal places for the default formatter (clamped to 0-20). */
  decimals?: number;
  /**
   * Explicit locale used by the default number formatter. Falls back to the
   * active I18nContext locale, then to deterministic standalone `en-US`.
   */
  locale?: string;
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
  intensity?: "sm" | "md" | "lg";
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
export interface ParticleFieldFocalArea {
  /** Normalized x coordinate (0-1) for the focal point. */
  x: number;
  /** Normalized y coordinate (0-1) for the focal point. */
  y: number;
  /** Normalized radius (0-1) for the focal area. */
  radius: number;
  /** Optional multiplier for emphasis. */
  strength?: number;
}

/** Rich animated point cloud / particle field rendered behind content. */
export interface ParticleFieldProps {
  /** Explicit particle count override. */
  count?: number;
  /** Particle fill color (CSS color value). */
  color?: string;
  /** Particle movement speed multiplier or explicit numeric drift. */
  speed?: number;
  /** Visual density preset. */
  density?: "low" | "medium" | "high";
  /** Global visual intensity preset. */
  intensity?: "low" | "medium" | "high";
  /** Mood preset affecting drift, clustering and contrast. */
  mood?: "calm" | "active" | "focus";
  /** Spatial pattern used to distribute the field. */
  pattern?: "ambient" | "orbital";
  /** Particle geometry. */
  shape?: "square" | "round";
  /** Minimum/maximum particle size in CSS pixels. */
  sizeRange?: [number, number];
  /** Base opacity for the entire field. */
  opacity?: number;
  /** Optional blend mode for the field. */
  blendMode?: CSSProperties["mixBlendMode"];
  /** Optional emphasis points that brighten nearby particles. */
  focalAreas?: ParticleFieldFocalArea[];
  /** Content rendered above the particle layer. */
  children?: ReactNode;
  /** Additional CSS class name. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/** Backward-compatible alias for the original particle effect props. */
export type ParticlesProps = ParticleFieldProps;

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
