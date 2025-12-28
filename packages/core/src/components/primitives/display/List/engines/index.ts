/**
 * @fileoverview List Engine Implementations - Rottay Design System
 * @description Engine-specific list implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all List engine implementations.
 * Each engine provides List, Item, and Meta components.
 *
 * **Available Engines:**
 * - **Titan**: Ant Design List with full features
 * - **Hermes**: DaisyUI list with Tailwind utilities
 * - **Apollo**: Pure CSS list with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | Bordered | ✅ | ✅ | ✅ |
 * | Header/Footer | ✅ | ✅ | ✅ |
 * | Loading | ✅ | ✅ | ✅ |
 * | Sizes | ✅ | ✅ | ✅ |
 * | Grid layout | ✅ | ✅ | ✅ |
 * | Pagination | ✅ | ❌ | ❌ |
 * | Item actions | ✅ | ✅ | ✅ |
 * | Item meta | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Titan for pagination
 * <List engine="titan" pagination={{ pageSize: 10 }} />
 *
 * // Use Hermes for DaisyUI styling
 * <List engine="hermes" bordered />
 *
 * // Use Apollo for zero dependencies
 * <List engine="apollo" size="small" />
 * ```
 *
 * @module List/engines
 * @category Display
 * @package @rottay/design-system
 */
export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
