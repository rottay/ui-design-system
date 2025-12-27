/**
 * @fileoverview Toast Engine Exports - Rottay Design System
 * @description Barrel export file for all Toast engine implementations.
 *
 * @remarks
 * This module exports all engine-specific Toast implementations:
 * - **Titan**: Ant Design implementation using message/notification APIs
 * - **Hermes**: DaisyUI/Tailwind implementation with utility classes
 * - **Apollo**: Vanilla HTML/CSS implementation with zero dependencies
 *
 * Each engine provides the same component interface but with different
 * underlying styling and behavior appropriate for that engine's framework.
 *
 * @example Engine Selection
 * ```tsx
 * // Via EngineProvider (recommended)
 * <EngineProvider engine="titan">
 *   <Toast variant="success" title="Hello" />
 * </EngineProvider>
 *
 * // Via direct prop
 * <Toast engine="hermes" variant="success" title="Hello" />
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
 * Titan engine implementation - Ant Design based.
 * Full-featured with native message and notification APIs.
 * @see {@link TitanToast}
 */
export { default as titan } from './titan';

/**
 * Hermes engine implementation - DaisyUI/Tailwind based.
 * Utility-first styling with alert component classes.
 * @see {@link HermesToast}
 */
export { default as hermes } from './hermes';

/**
 * Apollo engine implementation - Vanilla HTML/CSS.
 * Zero dependencies, pure inline styles, maximum accessibility.
 * @see {@link ApolloToast}
 */
export { default as apollo } from './apollo';
