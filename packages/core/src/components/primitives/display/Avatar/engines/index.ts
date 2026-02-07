/**
 * @fileoverview Avatar Engine Implementations - Rottay Design System
 * @description Engine-specific avatar implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Avatar engine implementations.
 * Each engine provides the same avatar functionality with different styling.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Avatar with Badge for status
 * - **Modern**: DaisyUI avatar/mask classes
 * - **Rustic**: Pure CSS with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Image loading | ✅ | ✅ | ✅ |
 * | Initials fallback | ✅ | ✅ | ✅ |
 * | Status indicator | ✅ | ✅ | ✅ |
 * | Ring outline | ❌ | ✅ | ✅ |
 * | Gradient variant | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Modern for DaisyUI styling
 * <Avatar engine="modern" src="/user.jpg" status="online" />
 *
 * // Use Rustic for zero dependencies
 * <Avatar engine="rustic" name="JD" variant="primary" />
 * ```
 *
 * @see {@link ClassicAvatar} for Ant Design implementation
 * @see {@link ModernAvatar} for DaisyUI implementation
 * @see {@link RusticAvatar} for vanilla implementation
 * @module AvatarEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
