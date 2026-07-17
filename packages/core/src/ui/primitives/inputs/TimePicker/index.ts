'use client';

/**
 * @fileoverview TimePicker Component - Rottay Design System
 * @description A time selection input component that provides clock-based picking
 * with support for hours, minutes, seconds, and 12/24-hour formats.
 *
 * @remarks
 * The TimePicker component provides intuitive time selection for forms:
 * - **Scheduling**: Meeting times, appointments, reminders
 * - **Time tracking**: Work hours, duration logging
 * - **Event planning**: Start/end times for events
 * - **Business hours**: Opening/closing times configuration
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
 * - **Format options**: 12-hour (AM/PM) or 24-hour format
 * - **Step intervals**: Custom steps for hours, minutes, seconds
 * - **Range picker**: TimePicker.RangePicker for time ranges
 * - **Disabled times**: Configurable disabled hours/minutes/seconds
 * - **Customization**: Custom icons, cell rendering, footer
 * - **Controlled/uncontrolled**: Full state management flexibility
 *
 * @example Basic time picker
 * ```tsx
 * import { TimePicker } from '@rottay/design-system';
 *
 * <TimePicker
 *   placeholder="Select time"
 *   onChange={(time, timeString) => console.log(time, timeString)}
 * />
 * ```
 *
 * @example 12-hour format with AM/PM
 * ```tsx
 * <TimePicker
 *   use12Hours
 *   format="h:mm:ss a"
 *   placeholder="Select time"
 * />
 * ```
 *
 * @example Time range picker
 * ```tsx
 * <TimePicker.RangePicker
 *   placeholder={['Start time', 'End time']}
 *   onChange={(times, timeStrings) => {
 *     console.log('Range:', times, timeStrings);
 *   }}
 * />
 * ```
 *
 * @example Custom step intervals
 * ```tsx
 * <TimePicker
 *   hourStep={2}
 *   minuteStep={15}
 *   secondStep={30}
 *   showSecond={false}
 *   format="HH:mm"
 * />
 * ```
 *
 * @example Disabled time options
 * ```tsx
 * <TimePicker
 *   disabledTime={() => ({
 *     disabledHours: () => [0, 1, 2, 3, 4, 5], // Disable midnight hours
 *     disabledMinutes: (hour) => hour === 12 ? [30, 45] : [],
 *   })}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <TimePicker engine="classic" showNow />
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <TimePicker engine="modern" size="lg" />
 *
 * // Rustic engine (Pure HTML/CSS)
 * <TimePicker engine="rustic" variant="borderless" />
 * ```
 *
 * @see {@link TimePickerProps} for component props
 * @see {@link TimeRangePickerProps} for range picker props
 * @module TimePicker
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { TimePickerProps, TimeRangePickerProps } from './contracts';

// Export types
export {
  type TimePickerProps,
  type TimeRangePickerProps,
  type TimePickerSize,
  type TimePickerStatus,
  type TimePickerPlacement,
  TIME_PICKER_DEFAULTS,
} from './contracts';

// Create base TimePicker component
const TimePickerBase = createEngineComponent<TimePickerProps>('TimePicker', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

// Create RangePicker component that uses the same engine routing
const TimeRangePicker = createEngineComponent<TimeRangePickerProps>('TimeRangePicker', {
  classic: () => import('./engines/classic').then(m => ({ default: (m.default as any).RangePicker })),
  modern: () => import('./engines/modern').then(m => ({ default: (m.default as any).RangePicker })),
  rustic: () => import('./engines/rustic').then(m => ({ default: (m.default as any).RangePicker })),
});

/**
 * TimePicker component for selecting time values.
 *
 * The TimePicker component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **classic**: Full-featured implementation using Ant Design (default)
 * - **modern**: Lightweight implementation using DaisyUI/Tailwind
 * - **rustic**: Headless implementation using vanilla HTML/CSS
 *
 * Compound components:
 * - **TimePicker.RangePicker**: Select a time range with start and end
 */
export const TimePicker = Object.assign(TimePickerBase, {
  /**
   * RangePicker compound component for time range selection.
   *
   * @example
   * ```tsx
   * <TimePicker.RangePicker
   *   placeholder={['Start', 'End']}
   *   onChange={(times, strings) => console.log(times)}
   * />
   * ```
   */
  RangePicker: TimeRangePicker,
});
