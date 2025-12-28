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
 * - **Titan**: Ant Design Calendar with dayjs
 * - **Hermes**: DaisyUI calendar with Tailwind
 * - **Apollo**: Pure CSS calendar with inline styles
 *
 * **Feature Comparison:**
 * | Feature | Titan | Hermes | Apollo |
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
 * // Use Titan for full localization
 * <Calendar engine="titan" locale={enUS} />
 *
 * // Use Hermes for DaisyUI styling
 * <Calendar engine="hermes" fullscreen />
 *
 * // Use Apollo for zero dependencies
 * <Calendar engine="apollo" />
 * ```
 *
 * @see {@link TitanCalendar} for Ant Design implementation
 * @see {@link HermesCalendar} for DaisyUI implementation
 * @see {@link ApolloCalendar} for vanilla implementation
 * @module Calendar/engines
 * @category Display
 * @package @rottay/design-system
 */
export { Calendar as TitanCalendar } from './titan';
export { Calendar as HermesCalendar } from './hermes';
export { Calendar as ApolloCalendar } from './apollo';
