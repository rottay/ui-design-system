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
 * - **Titan**: Ant Design Badge with processing animation
 * - **Hermes**: DaisyUI indicator classes
 * - **Apollo**: Pure CSS with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
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
 * // Use Hermes for DaisyUI styling
 * <Badge engine="hermes" count={5} variant="primary" />
 *
 * // Use Apollo for zero dependencies
 * <Badge engine="apollo" dot pulse variant="error" />
 * ```
 *
 * @see {@link TitanBadge} for Ant Design implementation
 * @see {@link HermesBadge} for DaisyUI implementation
 * @see {@link ApolloBadge} for vanilla implementation
 * @module BadgeEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
