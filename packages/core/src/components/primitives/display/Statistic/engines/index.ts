/**
 * @fileoverview Statistic Engine Implementations - Rottay Design System
 * @description Engine-specific statistic implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Statistic engine implementations.
 * Each engine exports both Statistic and Countdown components.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Statistic with native countdown
 * - **Modern**: DaisyUI statistic with Tailwind colors
 * - **Rustic**: Pure CSS with WCAG-compliant colors
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Value formatting | ✅ | ✅ | ✅ |
 * | Value types | ✅ | ✅ | ✅ |
 * | Prefix/Suffix | ✅ | ✅ | ✅ |
 * | Loading state | ✅ | ✅ | ✅ |
 * | Countdown | ✅ | ✅ | ✅ |
 * | Custom formatter | ✅ | ✅ | ✅ |
 * | Theme colors | ✅ | ✅ | ⚠️ |
 * | WCAG colors | ✅ | ✅ | ✅ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for Ant Design ecosystem
 * <Statistic engine="classic" title="Users" value={1024} />
 *
 * // Use Modern for DaisyUI theming
 * <Statistic engine="modern" title="Users" value={1024} />
 *
 * // Use Rustic for zero dependencies
 * <Statistic engine="rustic" title="Users" value={1024} />
 * ```
 *
 * @module Statistic/engines
 * @category Display
 * @package @rottay/design-system
 */

export { default as classic } from './classic';
export { default as modern } from './modern';
export { default as rustic } from './rustic';
