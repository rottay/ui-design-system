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
 * - **Classic**: Ant Design List with full features
 * - **Modern**: DaisyUI list with Tailwind utilities
 * - **Rustic**: Pure CSS list with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
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
 * // Use Classic for pagination
 * <List engine="classic" pagination={{ pageSize: 10 }} />
 *
 * // Use Modern for DaisyUI styling
 * <List engine="modern" bordered />
 *
 * // Use Rustic for zero dependencies
 * <List engine="rustic" size="small" />
 * ```
 *
 * @module List/engines
 * @category Display
 * @package @rottay/design-system
 */
export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
