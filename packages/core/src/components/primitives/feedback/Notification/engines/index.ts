/**
 * @fileoverview Notification Engine Exports - Rottay Design System
 * @description Barrel export for all Notification engine implementations.
 *
 * @remarks
 * This module provides access to all three engine implementations:
 * - **Classic**: Full-featured implementation using Ant Design's notification API
 * - **Modern**: Lightweight implementation using DaisyUI/Tailwind classes
 * - **Rustic**: Zero-dependency vanilla HTML/CSS implementation
 *
 * Each engine exports the same interface but with different underlying implementations,
 * allowing consistent API usage across different styling frameworks.
 *
 * @example
 * ```tsx
 * import { classicNotification, modernNotification, rusticNotification } from './engines';
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
 * Classic engine implementation using Ant Design.
 * Full-featured with animations and static methods.
 */
export { default as classicNotification } from './classic';

/**
 * Modern engine implementation using DaisyUI/Tailwind.
 * Lightweight with utility-first styling.
 */
export { default as modernNotification } from './modern';

/**
 * Rustic engine implementation using vanilla HTML/CSS.
 * Zero dependencies with maximum accessibility.
 */
export { default as rusticNotification } from './rustic';
