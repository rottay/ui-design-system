/**
 * @fileoverview Calendar Engine Implementations - Rottay Design System
 * @description Engine-specific calendar implementations for multi-library support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Calendar engine implementations.
 * Each engine provides the same calendar functionality with different styling.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design Calendar with dayjs
 * - **Modern**: DaisyUI calendar with Tailwind
 * - **Rustic**: Pure CSS calendar with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Classic | Modern | Rustic |
 * |---------|-------|--------|--------|
 * | Month view | ✅ | ✅ | ✅ |
 * | Year view | ✅ | ✅ | ✅ |
 * | Custom cells | ✅ | ✅ | ✅ |
 * | Date range | ✅ | ✅ | ✅ |
 * | Disabled dates | ✅ | ✅ | ✅ |
 * | Fullscreen | ✅ | ✅ | ✅ |
 * | Localization | ✅ | ❌ | ❌ |
 *
 * @example Engine Override
 * ```tsx
 * // Use Classic for full localization
 * <Calendar engine="classic" locale={enUS} />
 *
 * // Use Modern for DaisyUI styling
 * <Calendar engine="modern" fullscreen />
 *
 * // Use Rustic for zero dependencies
 * <Calendar engine="rustic" />
 * ```
 *
 * @see {@link ClassicCalendar} for Ant Design implementation
 * @see {@link ModernCalendar} for DaisyUI implementation
 * @see {@link RusticCalendar} for vanilla implementation
 * @module Calendar/engines
 * @category Display
 * @package @rottay/design-system
 */
export { Calendar as ClassicCalendar } from './classic';
export { Calendar as ModernCalendar } from './modern';
export { Calendar as RusticCalendar } from './rustic';
