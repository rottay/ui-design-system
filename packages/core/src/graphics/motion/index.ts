'use client';

/**
 * @fileoverview Motion public exports - Rottay Design System
 * @description Barrel for motion primitives, effects, hooks, and shared types.
 *
 * @remarks
 * Consumers should import from here when they want the public motion API rather
 * than reaching into effect- or primitive-specific folders directly.
 */

// Dependency-free public contracts
export type * from './foundation/contracts';

// React-owned hooks, primitives and effects
export * from './react';
