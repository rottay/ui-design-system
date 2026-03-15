/**
 * @fileoverview Table Engine Implementations - Rottay Design System
 * @description Engine-specific table implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Table engine implementations.
 * Each engine provides the same table functionality with different styling.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Table with full features
 * - **Modern**: DaisyUI table with Tailwind utilities
 * - **Rustic**: Pure CSS table with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Sorting | ✅ | ✅ | ✅ |
 * | Filtering | ✅ | ❌ | ❌ |
 * | Pagination | ✅ | ✅ | ✅ |
 * | Row Selection | ✅ | ✅ | ✅ |
 * | Expandable | ✅ | ❌ | ❌ |
 * | Virtual Scroll | ✅ | ❌ | ❌ |
 * | Fixed Columns | ✅ | ❌ | ❌ |
 * | Column Groups | ✅ | ❌ | ❌ |
 * | Inline Edit   | ❌ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for full features
 * <Table engine="classic" expandable virtual />
 *
 * // Use Modern for DaisyUI styling
 * <Table engine="modern" bordered />
 *
 * // Use Rustic for zero dependencies
 * <Table engine="rustic" size="small" />
 * ```
 *
 * @see {@link ClassicTable} for Ant Design implementation
 * @see {@link ModernTable} for DaisyUI implementation
 * @see {@link RusticTable} for vanilla implementation
 * @module Table/engines
 * @category Display
 * @package @rottay/design-system
 */
export { Table as ClassicTable } from './classic';
export { Table as ModernTable } from './modern';
export { Table as RusticTable } from './rustic';
