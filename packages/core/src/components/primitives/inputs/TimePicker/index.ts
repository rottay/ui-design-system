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
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
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
 * // Titan engine (Ant Design - default)
 * <TimePicker engine="titan" showNow />
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <TimePicker engine="hermes" size="lg" />
 *
 * // Apollo engine (Pure HTML/CSS)
 * <TimePicker engine="apollo" variant="borderless" />
 * ```
 *
 * @see {@link TimePickerProps} for component props
 * @see {@link TimeRangePickerProps} for range picker props
 * @module TimePicker
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TimePickerProps, TimeRangePickerProps } from './types';

// Export types
export {
  type TimePickerProps,
  type TimeRangePickerProps,
  type TimePickerSize,
  type TimePickerStatus,
  type TimePickerPlacement,
  TIME_PICKER_DEFAULTS,
} from './types';

// Create base TimePicker component
const TimePickerBase = createEngineComponent<TimePickerProps>('TimePicker', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

// Create RangePicker component that uses the same engine routing
const TimeRangePicker = createEngineComponent<TimeRangePickerProps>('TimeRangePicker', {
  titan: () => import('./engines/titan').then(m => ({ default: (m.default as any).RangePicker })),
  hermes: () => import('./engines/hermes').then(m => ({ default: (m.default as any).RangePicker })),
  apollo: () => import('./engines/apollo').then(m => ({ default: (m.default as any).RangePicker })),
});

/**
 * TimePicker component for selecting time values.
 *
 * The TimePicker component automatically selects the appropriate rendering engine
 * based on the current context or explicit engine prop.
 *
 * Engines:
 * - **titan**: Full-featured implementation using Ant Design (default)
 * - **hermes**: Lightweight implementation using DaisyUI/Tailwind
 * - **apollo**: Headless implementation using vanilla HTML/CSS
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
