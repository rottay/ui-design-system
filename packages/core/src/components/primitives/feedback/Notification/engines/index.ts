/**
 * @fileoverview Notification Engine Exports - Rottay Design System
 * @description Barrel export for all Notification engine implementations.
 *
 * @remarks
 * This module provides access to all three engine implementations:
 * - **Titan**: Full-featured implementation using Ant Design's notification API
 * - **Hermes**: Lightweight implementation using DaisyUI/Tailwind classes
 * - **Apollo**: Zero-dependency vanilla HTML/CSS implementation
 *
 * Each engine exports the same interface but with different underlying implementations,
 * allowing consistent API usage across different styling frameworks.
 *
 * @example
 * ```tsx
 * import { titanNotification, hermesNotification, apolloNotification } from './engines';
 *
 * // Each engine provides the same exports:
 * // - NotificationProvider
 * // - NotificationItem
 * // - useNotification
 * // - notification (static methods)
 * ```
 *
 * @module Notification/Engines
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Engine Exports
// ============================================================================

/**
 * Titan engine implementation using Ant Design.
 * Full-featured with animations and static methods.
 */
export { default as titanNotification } from './titan';

/**
 * Hermes engine implementation using DaisyUI/Tailwind.
 * Lightweight with utility-first styling.
 */
export { default as hermesNotification } from './hermes';

/**
 * Apollo engine implementation using vanilla HTML/CSS.
 * Zero dependencies with maximum accessibility.
 */
export { default as apolloNotification } from './apollo';
