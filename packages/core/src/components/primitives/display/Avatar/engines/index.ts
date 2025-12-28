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
 * - **Titan**: Ant Design Avatar with Badge for status
 * - **Hermes**: DaisyUI avatar/mask classes
 * - **Apollo**: Pure CSS with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | Image loading | ✅ | ✅ | ✅ |
 * | Initials fallback | ✅ | ✅ | ✅ |
 * | Status indicator | ✅ | ✅ | ✅ |
 * | Ring outline | ❌ | ✅ | ✅ |
 * | Gradient variant | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Hermes for DaisyUI styling
 * <Avatar engine="hermes" src="/user.jpg" status="online" />
 *
 * // Use Apollo for zero dependencies
 * <Avatar engine="apollo" name="JD" variant="primary" />
 * ```
 *
 * @see {@link TitanAvatar} for Ant Design implementation
 * @see {@link HermesAvatar} for DaisyUI implementation
 * @see {@link ApolloAvatar} for vanilla implementation
 * @module AvatarEngines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
