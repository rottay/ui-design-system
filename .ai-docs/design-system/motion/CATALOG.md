# DS Motion System

## Effects (10 visual effects)
| Effect | Purpose |
|--------|---------|
| aurora | Aurora borealis background animation |
| glass-card | Glassmorphism card with blur + refraction |
| glow-effect | Neon/soft glow around elements |
| gradient-background | Animated mesh gradient backgrounds |
| grid-pattern | Dot/line grid background pattern |
| noise-texture | Subtle noise overlay texture |
| particles | Floating particle system |
| shimmer-text | Shimmering/glowing text effect |
| spotlight | Mouse-following spotlight effect |

## Motion Types (11 animation primitives)
| Motion | Purpose |
|--------|---------|
| count-up | Animated number counter (0 -> target) |
| fade-in | Opacity entrance animation |
| magnetic | Mouse-attracted magnetic effect |
| morph | Shape morphing transition |
| parallax | Scroll-linked parallax depth |
| scale-in | Scale entrance animation |
| scroll-reveal | Reveal on scroll intersection |
| slide-in | Directional slide entrance |
| stagger-children | Sequential child animations |
| text-reveal | Character-by-character text reveal |

## Personality-Driven Motion
Motion behavior is controlled by `tenantConfig.personality.animation`:
```ts
interface AnimationPersonality {
  entranceDuration: number;   // ms (default: 300)
  exitDuration: number;       // ms (default: 200)
  hoverScale: number;         // scale factor (default: 1.02)
  reducedMotion: boolean;     // respect prefers-reduced-motion
}
```

## Per-Vertical Defaults
| Vertical | Entrance | Hover Scale | Style |
|----------|----------|-------------|-------|
| evnto | 350ms | 1.03 | Expressive, lively |
| bithire | 200ms | 1.01 | Minimal, professional |
| platform | 250ms | 1.02 | Moderate, balanced |
