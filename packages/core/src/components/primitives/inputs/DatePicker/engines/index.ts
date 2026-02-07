/**
 * @fileoverview DatePicker Engine Exports - Rottay Design System
 * @description Barrel exports for all DatePicker engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Classic**: Ant Design DatePicker with full feature support
 * - **Modern**: DaisyUI/Tailwind CSS implementation
 * - **Rustic**: Pure vanilla HTML/CSS date picker
 *
 * All engines implement:
 * - Date, week, month, quarter, year picker modes
 * - Optional time picker integration
 * - Range picker (RangePicker) component
 * - Disabled dates and validation
 * - Custom cell rendering
 *
 * @example Engine Import
 * ```tsx
 * // Direct engine import (internal use)
 * import { ClassicDatePicker, ModernDatePicker } from './engines';
 *
 * // Component automatically selects engine
 * <DatePicker engine="modern" picker="month" format="MMMM YYYY" />
 * ```
 *
 * @see {@link DatePicker} - Main component with engine switching
 * @module DatePicker/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { DatePicker as ClassicDatePicker } from './classic';
export { DatePicker as ModernDatePicker } from './modern';
export { DatePicker as RusticDatePicker } from './rustic';
