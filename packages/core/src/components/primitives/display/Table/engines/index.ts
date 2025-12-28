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
 * - **Titan**: Ant Design Table with full features
 * - **Hermes**: DaisyUI table with Tailwind utilities
 * - **Apollo**: Pure CSS table with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
 * |---------|-------|--------|--------|
 * | Sorting | ✅ | ✅ | ✅ |
 * | Filtering | ✅ | ❌ | ❌ |
 * | Pagination | ✅ | ✅ | ✅ |
 * | Row Selection | ✅ | ✅ | ✅ |
 * | Expandable | ✅ | ❌ | ❌ |
 * | Virtual Scroll | ✅ | ❌ | ❌ |
 * | Fixed Columns | ✅ | ❌ | ❌ |
 * | Column Groups | ✅ | ❌ | ❌ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Titan for full features
 * <Table engine="titan" expandable virtual />
 *
 * // Use Hermes for DaisyUI styling
 * <Table engine="hermes" bordered />
 *
 * // Use Apollo for zero dependencies
 * <Table engine="apollo" size="small" />
 * ```
 *
 * @see {@link TitanTable} for Ant Design implementation
 * @see {@link HermesTable} for DaisyUI implementation
 * @see {@link ApolloTable} for vanilla implementation
 * @module Table/engines
 * @category Display
 * @package @rottay/design-system
 */
export { Table as TitanTable } from './titan';
export { Table as HermesTable } from './hermes';
export { Table as ApolloTable } from './apollo';
