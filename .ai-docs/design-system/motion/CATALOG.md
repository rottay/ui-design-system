# Motion System Catalog

Source: `ui-design-system/packages/core/src/motion/`

The motion subsystem provides animation components, visual effects, and hooks for building personality-aware animated interfaces. All exports are marked `'use client'`.

---

## Architecture

The motion system is organized into four layers:

```
motion/
  motion/     -> Entrance + interactive animation components (10)
  effects/    -> Decorative visual effect components (9)
  hooks/      -> Animation utility hooks (6)
  types/      -> Shared TypeScript prop definitions
```

---

## Motion Components (Entrance + Interactive)

Source: `motion/motion/`

### Entrance Animations

All entrance components share `BaseMotionProps`: `duration`, `delay`, `once`, `className`, `children`, `style`.

| Component | Props | Purpose |
|-----------|-------|---------|
| FadeIn | `direction?` (up/down/left/right), `distance?` | Opacity entrance with optional directional translate offset |
| SlideIn | `direction?`, `distance?` | Directional slide entrance without opacity change |
| ScaleIn | `initialScale?` | Grow-from-small entrance (default ~0.9 to 1) |
| ScrollReveal | `threshold?`, `rootMargin?` | IntersectionObserver-driven reveal when element enters viewport |
| StaggerChildren | `staggerDelay?`, `delayChildren?` | Orchestrates staggered entrance of child elements |

### Interactive Animations

| Component | Props | Purpose |
|-----------|-------|---------|
| Parallax | `speed?`, `children`, `className?` | Scroll-linked vertical parallax. `speed < 1` = slow-follow, `> 1` = faster-than-scroll |
| Magnetic | `strength?`, `children`, `className?` | Pointer-tracking magnetic attraction -- element subtly follows cursor |
| TextReveal | `text`, `type?` (char/word/line), `delay?`, `duration?` | Progressive text reveal with stagger granularity |
| CountUp | `from?`, `to`, `duration?`, `delay?`, `prefix?`, `suffix?`, `formatter?` | Numeric counter interpolating from start to target value |
| Morph | `children`, `layoutId?` | Layout-animation wrapper for shared-element transitions |

---

## Decorative Effects

Source: `motion/effects/`

| Component | Props | Purpose |
|-----------|-------|---------|
| GlassCard | `blur?`, `bgOpacity?`, `borderOpacity?`, `children` | Frosted-glass card using backdrop-filter |
| GradientBackground | `colors?`, `animate?`, `duration?`, `children?` | Animated gradient background cycling through color stops |
| GlowEffect | `color?`, `intensity?` (sm/md/lg), `children` | Outer glow/halo effect wrapping content |
| ShimmerText | `text` | Animated shimmer/shine sweep across text |
| Spotlight | `size?`, `color?`, `children` | Cursor-tracking radial gradient spotlight overlay |
| Aurora | `colors?`, `speed?`, `children?` | Animated aurora borealis background with blended color blobs |
| Particles | `count?`, `color?`, `speed?`, `children?` | Floating particle field rendered behind content |
| NoiseTexture | `opacity?`, `children?` | SVG noise texture overlay for subtle grain effects |
| GridPattern | `size?`, `color?`, `opacity?`, `animate?`, `children?` | CSS grid dot/line pattern overlay |

---

## Hooks

Source: `motion/hooks/`

| Hook | Return | Purpose |
|------|--------|---------|
| `useReducedMotion` | `boolean` | Detects user `prefers-reduced-motion` preference (from framer-motion) |
| `useInView` | `UseInViewResult` (ref, inView) | IntersectionObserver hook with options (`threshold`, `rootMargin`, `once`) |
| `useMousePosition` | `MousePosition` (x, y) | Tracks cursor position relative to viewport |
| `useScrollProgress` | `number` (0-1) | Scroll progress as a normalized value |
| `useSmoothCounter` | `number` | Smooth numeric interpolation for animated counters |
| `useMotionPersonality` | (see below) | Bridge between token personality and motion primitives |

---

## Personality-Driven Motion

Source: `motion/hooks/use-motion-personality/`

The `useMotionPersonality` hook resolves motion defaults from the active product profile + tenant/theme tokens. When a motion component does not receive explicit props, it inherits values from the personality system.

### Resolved Values

| Property | Source | Behavior with `prefers-reduced-motion` |
|----------|--------|---------------------------------------|
| `shouldReduceMotion` | OS/browser setting | -- |
| `entrance` | `tokens.personality.animation.entrance` | Unchanged |
| `useSpring` | `tokens.personality.animation.useSpring` | Unchanged |
| `durationSeconds` | `entranceDuration / 1000` (min 0.16s) | 0 |
| `delaySeconds` | `staggerDelay / 1000` | 0 |
| `offsetDistance` | `18 * intensity` (min 12px) | 0 |
| `initialScale` | `hoverScale - 0.04` (min 0.88) | 1 |
| `hoverLift` | `animation.hoverLift` | Unchanged |
| `hoverScale` | `animation.hoverScale` | Unchanged |
| `springTension` | `animation.springTension` | Unchanged |
| `springFriction` | `animation.springFriction` | Unchanged |
| `pulseSpeed` | `animation.pulseSpeed` | Unchanged |
| `skeletonStyle` | `animation.skeletonStyle` | Unchanged |
| `countUpEnabled` | `animation.countUpEnabled` | Unchanged |

When `prefers-reduced-motion` is enabled, all time-based and distance-based values are zeroed so elements appear in their final position immediately.

### Personality Impact on Motion

The personality system controls animation behavior through the token context. A "playful" personality produces:
- Longer entrance durations
- Greater offset distances (elements travel further)
- Stronger spring physics (more bounce)
- Visible hover lifts and scale transforms

A "formal" personality produces:
- Shorter, subtler animations
- Minimal offset and scale transforms
- Tighter spring physics (less bounce)
- Restrained hover effects

---

## Motion Tokens (Engine-Level)

Each engine defines its own base motion values:

| Token | Classic | Modern | Rustic |
|-------|---------|--------|--------|
| `motion.hover` | 150ms ease | 200ms cubic-bezier | 100ms ease |
| `motion.transform` | none | translateY(-1px) | none |

These engine-level tokens feed into the personality resolution pipeline via `useTokens()`.

---

## Summary

| Category | Count |
|----------|------:|
| Entrance animation components | 5 |
| Interactive animation components | 5 |
| Decorative effect components | 9 |
| Hooks | 6 |
| **Total exports** | **25** |
