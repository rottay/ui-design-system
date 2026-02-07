/**
 * @fileoverview Toast Engine Exports - Rottay Design System
 * @description Barrel export file for all Toast engine implementations.
 *
 * @remarks
 * This module exports all engine-specific Toast implementations:
 * - **Classic**: Ant Design implementation using message/notification APIs
 * - **Modern**: DaisyUI/Tailwind implementation with utility classes
 * - **Rustic**: Vanilla HTML/CSS implementation with zero dependencies
 *
 * Each engine provides the same component interface but with different
 * underlying styling and behavior appropriate for that engine's framework.
 *
 * @example Engine Selection
 * ```tsx
 * // Via EngineProvider (recommended)
 * <EngineProvider engine="classic">
 *   <Toast variant="success" title="Hello" />
 * </EngineProvider>
 *
 * // Via direct prop
 * <Toast engine="modern" variant="success" title="Hello" />
 * ```
 *
 * @module Toast/Engines
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/**
 * Classic engine implementation - Ant Design based.
 * Full-featured with native message and notification APIs.
 * @see {@link ClassicToast}
 */
export { default as classic } from './classic';

/**
 * Modern engine implementation - DaisyUI/Tailwind based.
 * Utility-first styling with alert component classes.
 * @see {@link ModernToast}
 */
export { default as modern } from './modern';

/**
 * Rustic engine implementation - Vanilla HTML/CSS.
 * Zero dependencies, pure inline styles, maximum accessibility.
 * @see {@link RusticToast}
 */
export { default as rustic } from './rustic';
