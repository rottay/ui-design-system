/**
 * @fileoverview Engine System - Rottay Design System
 * @description Central exports for the multi-engine architecture, providing
 * component factories, registries, error boundaries, and pluggable implementations.
 *
 * @remarks
 * The engine system enables components to render using different UI libraries:
 *
 * **Engines:**
 * - **Titan**: Ant Design - Full-featured enterprise components
 * - **Hermes**: DaisyUI/Tailwind - Lightweight, utility-first
 * - **Apollo**: Vanilla HTML/CSS - Zero dependencies
 * - **Athena**: Pluggable - Custom implementations
 *
 * **Subsystems:**
 * - **Registry**: Engine metadata and validation
 * - **Factory**: Component creation with lazy loading
 * - **Boundary**: Error handling and fallbacks
 * - **Athena**: Custom component registration
 *
 * @example Creating an engine-aware component
 * ```tsx
 * import { createEngineComponent } from '@rottay/design-system';
 *
 * export const Button = createEngineComponent('Button', {
 *   titan: () => import('./engines/titan'),
 *   hermes: () => import('./engines/hermes'),
 *   apollo: () => import('./engines/apollo'),
 * });
 * ```
 *
 * @example Registering custom implementations
 * ```tsx
 * import { registerAthenaComponent } from '@rottay/design-system';
 *
 * registerAthenaComponent('Button', MyCustomButton);
 * ```
 *
 * @see {@link createEngineComponent} - Component factory
 * @see {@link ENGINE_REGISTRY} - Engine metadata
 * @see {@link registerAthenaComponent} - Custom components
 * @module System/Engines
 * @category System
 * @package @rottay/design-system
 */
export * from './registry';
export * from './factory';
export * from './binding';
export * from './boundary';
export * from './athena';
