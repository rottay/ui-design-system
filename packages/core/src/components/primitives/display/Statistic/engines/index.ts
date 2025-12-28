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
 * - **Titan**: Ant Design Statistic with native countdown
 * - **Hermes**: DaisyUI statistic with Tailwind colors
 * - **Apollo**: Pure CSS with WCAG-compliant colors
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
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
 * // Use Titan for Ant Design ecosystem
 * <Statistic engine="titan" title="Users" value={1024} />
 *
 * // Use Hermes for DaisyUI theming
 * <Statistic engine="hermes" title="Users" value={1024} />
 *
 * // Use Apollo for zero dependencies
 * <Statistic engine="apollo" title="Users" value={1024} />
 * ```
 *
 * @module Statistic/engines
 * @category Display
 * @package @rottay/design-system
 */

export { default as titan } from './titan';
export { default as hermes } from './hermes';
export { default as apollo } from './apollo';
