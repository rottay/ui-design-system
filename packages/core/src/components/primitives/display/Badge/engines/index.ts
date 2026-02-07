/**
 * @fileoverview Badge Engine Implementations - Rottay Design System
 * @description Engine-specific badge implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Badge engine implementations.
 * Each engine provides the same badge functionality with different styling.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Badge with processing animation
 * - **Modern**: DaisyUI indicator classes
 * - **Rustic**: Pure CSS with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Count display | ✅ | ✅ | ✅ |
 * | Dot indicator | ✅ | ✅ | ✅ |
 * | Pulse animation | ✅ | ✅ | ✅ |
 * | Status processing | ✅ | ❌ | ❌ |
 * | Ribbon support | ✅ | ❌ | ❌ |
 * | Style variants | ❌ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Modern for DaisyUI styling
 * <Badge engine="modern" count={5} variant="primary" />
 *
 * // Use Rustic for zero dependencies
 * <Badge engine="rustic" dot pulse variant="error" />
 * ```
 *
 * @see {@link ClassicBadge} for Ant Design implementation
 * @see {@link ModernBadge} for DaisyUI implementation
 * @see {@link RusticBadge} for vanilla implementation
 * @module BadgeEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
