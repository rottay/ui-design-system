/**
 * @fileoverview Message Engine Exports - Rottay Design System
 * @description Barrel exports for all Message engine implementations.
 * Provides access to Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla) engines.
 *
 * @remarks
 * Each engine provides the same API but with different underlying implementations:
 * - **Classic**: Uses Ant Design's message system, supports static methods
 * - **Modern**: Uses DaisyUI/Tailwind styling, requires provider context
 * - **Rustic**: Pure HTML/CSS implementation, requires provider context
 *
 * @example Importing a Specific Engine
 * ```tsx
 * import { classicMessage } from '@rottay/design-system/engines';
 *
 * // Use Classic's MessageProvider
 * const { MessageProvider, useMessage } = classicMessage;
 * ```
 *
 * @example Using Engine Types
 * ```tsx
 * import type { ClassicMessageProvider, ModernMessageProvider, RusticMessageProvider } from '@rottay/design-system';
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
 * Classic engine (Ant Design) - Full-featured implementation with static methods.
 * @see {@link ./classic/index.tsx} for implementation details
 */
export { default as classicMessage } from './classic';

/**
 * Modern engine (DaisyUI/Tailwind) - Lightweight utility-first implementation.
 * @see {@link ./modern/index.tsx} for implementation details
 */
export { default as modernMessage } from './modern';

/**
 * Rustic engine (Vanilla HTML/CSS) - Zero-dependency accessible implementation.
 * @see {@link ./rustic/index.tsx} for implementation details
 */
export { default as rusticMessage } from './rustic';

// ============================================================================
// Engine Type Exports
// ============================================================================

/**
 * Type export for Classic engine's MessageProvider component.
 */
export type { MessageProvider as ClassicMessageProvider } from './classic';

/**
 * Type export for Modern engine's MessageProvider component.
 */
export type { MessageProvider as ModernMessageProvider } from './modern';

/**
 * Type export for Rustic engine's MessageProvider component.
 */
export type { MessageProvider as RusticMessageProvider } from './rustic';
