'use client';

/**
 * @fileoverview DatePicker Component - Rottay Design System
 * @description A date selection input component that provides calendar-based picking
 * with support for date, week, month, quarter, and year selection modes.
 *
 * @remarks
 * The DatePicker component provides intuitive date selection for forms:
 * - **Form date inputs**: Birthdays, appointments, deadlines
 * - **Scheduling**: Event planning, booking systems
 * - **Filtering**: Date range filters, reports, analytics
 * - **Data entry**: Any date-based information collection
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
 * - **Picker modes**: Date, week, month, quarter, year
 * - **Time support**: Optional time picker integration
 * - **Range picker**: DatePicker.RangePicker for date ranges
 * - **Validation**: Disabled dates, status indicators
 * - **Customization**: Formats, locales, cell rendering
 * - **Controlled/uncontrolled**: Full state management flexibility
 *
 * @example Basic date picker
 * ```tsx
 * import { DatePicker } from '@rottay/design-system';
 *
 * <DatePicker
 *   placeholder="Select date"
 *   onChange={(date, dateString) => console.log(date, dateString)}
 * />
 * ```
 *
 * @example Date range picker
 * ```tsx
 * <DatePicker.RangePicker
 *   placeholder={['Start date', 'End date']}
 *   onChange={(dates, dateStrings) => {
 *     console.log('Selected:', dates, dateStrings);
 *   }}
 * />
 * ```
 *
 * @example Month and year picker
 * ```tsx
 * // Month picker
 * <DatePicker picker="month" format="MMMM YYYY" />
 *
 * // Year picker
 * <DatePicker picker="year" />
 * ```
 *
 * @example With time selection
 * ```tsx
 * <DatePicker
 *   showTime={{ format: 'HH:mm' }}
 *   format="YYYY-MM-DD HH:mm"
 *   placeholder="Select date and time"
 * />
 * ```
 *
 * @example Disabled dates
 * ```tsx
 * <DatePicker
 *   disabledDate={(current) => {
 *     // Disable dates before today
 *     return current < new Date();
 *   }}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <DatePicker engine="classic" showToday showNow />
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <DatePicker engine="modern" size="lg" />
 *
 * // Rustic engine (Pure HTML/CSS)
 * <DatePicker engine="rustic" variant="borderless" />
 * ```
 *
 * @see {@link DatePickerProps} for component props
 * @see {@link RangePickerProps} for range picker props
 * @see {@link DatePickerMode} for picker modes
 * @module DatePicker
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { DatePickerProps } from './types';

// Export types
export {
  type DatePickerProps,
  type RangePickerProps,
  type DatePickerSize,
  type DatePickerStatus,
  type DatePickerPlacement,
  type DatePickerMode,
  DATE_PICKER_DEFAULTS,
} from './types';

/**
 * Create engine-aware DatePicker component.
 *
 * The DatePicker component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **classic**: Full-featured implementation using Ant Design (default)
 * - **modern**: Lightweight implementation using DaisyUI/Tailwind
 * - **rustic**: Headless implementation using vanilla HTML/CSS
 *
 * Compound components:
 * - **DatePicker.RangePicker**: Select a date range with start and end
 */
export const DatePicker = createEngineComponent<DatePickerProps>('DatePicker', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
