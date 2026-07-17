'use client';

/**
 * @fileoverview Motion effects exports - Rottay Design System
 * @description Barrel for decorative motion/effect components such as glow,
 * aurora, gradients, and texture overlays.
 */

export { GlassCard } from './glass-card';
export { GradientBackground } from './gradient-background';
export { GlowEffect } from './glow-effect';
export { ShimmerText } from './shimmer-text';
export { Spotlight } from './spotlight';
export { Aurora } from './aurora';
// Keep the canvas runtime behind a render-triggered dynamic boundary. The
// package root may re-export this boundary without requesting the runtime chunk.
export { ParticleField, Particles } from './particles';
export { NoiseTexture } from './noise-texture';
export { GridPattern } from './grid-pattern';
export { EffectRuntimeProvider } from '@/infrastructure/runtime/effects/composition/react/provider';
export type { EffectRuntimeProviderProps } from '@/infrastructure/runtime/effects/composition/react/provider';
