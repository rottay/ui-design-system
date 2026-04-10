'use client';

/**
 * @fileoverview Motion public exports - Rottay Design System
 * @description Barrel for motion primitives, effects, hooks, and shared types.
 *
 * @remarks
 * Consumers should import from here when they want the public motion API rather
 * than reaching into effect- or primitive-specific folders directly.
 */

// Types
export type * from './types';

// Motion primitives (entrance animations, interactive effects)
export * from './primitives';

// Visual effects
export * from './effects';

// Hooks
export * from './hooks';
