/**
 * @fileoverview Message Engine Exports - Rottay Design System
 * @description Barrel exports for all Message engine implementations.
 * Provides access to Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla) engines.
 *
 * @remarks
 * Each engine provides the same API but with different underlying implementations:
 * - **Titan**: Uses Ant Design's message system, supports static methods
 * - **Hermes**: Uses DaisyUI/Tailwind styling, requires provider context
 * - **Apollo**: Pure HTML/CSS implementation, requires provider context
 *
 * @example Importing a Specific Engine
 * ```tsx
 * import { titanMessage } from '@rottay/design-system/engines';
 *
 * // Use Titan's MessageProvider
 * const { MessageProvider, useMessage } = titanMessage;
 * ```
 *
 * @example Using Engine Types
 * ```tsx
 * import type { TitanMessageProvider, HermesMessageProvider, ApolloMessageProvider } from '@rottay/design-system';
 * ```
 *
 * @module Message/Engines
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Default Exports
// ============================================================================

/**
 * Titan engine (Ant Design) - Full-featured implementation with static methods.
 * @see {@link ./titan/index.tsx} for implementation details
 */
export { default as titanMessage } from './titan';

/**
 * Hermes engine (DaisyUI/Tailwind) - Lightweight utility-first implementation.
 * @see {@link ./hermes/index.tsx} for implementation details
 */
export { default as hermesMessage } from './hermes';

/**
 * Apollo engine (Vanilla HTML/CSS) - Zero-dependency accessible implementation.
 * @see {@link ./apollo/index.tsx} for implementation details
 */
export { default as apolloMessage } from './apollo';

// ============================================================================
// Engine Type Exports
// ============================================================================

/**
 * Type export for Titan engine's MessageProvider component.
 */
export type { MessageProvider as TitanMessageProvider } from './titan';

/**
 * Type export for Hermes engine's MessageProvider component.
 */
export type { MessageProvider as HermesMessageProvider } from './hermes';

/**
 * Type export for Apollo engine's MessageProvider component.
 */
export type { MessageProvider as ApolloMessageProvider } from './apollo';
