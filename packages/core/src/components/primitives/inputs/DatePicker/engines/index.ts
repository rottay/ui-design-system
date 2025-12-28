/**
 * @fileoverview DatePicker Engine Exports - Rottay Design System
 * @description Barrel exports for all DatePicker engine implementations.
 *
 * @remarks
 * Available engines:
 * - **Titan**: Ant Design DatePicker with full feature support
 * - **Hermes**: DaisyUI/Tailwind CSS implementation
 * - **Apollo**: Pure vanilla HTML/CSS date picker
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
 * import { TitanDatePicker, HermesDatePicker } from './engines';
 *
 * // Component automatically selects engine
 * <DatePicker engine="hermes" picker="month" format="MMMM YYYY" />
 * ```
 *
 * @see {@link DatePicker} - Main component with engine switching
 * @module DatePicker/Engines
 * @category Inputs
 * @package @rottay/design-system
 */
export { DatePicker as TitanDatePicker } from './titan';
export { DatePicker as HermesDatePicker } from './hermes';
export { DatePicker as ApolloDatePicker } from './apollo';
