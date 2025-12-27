/**
 * TimePicker - Engine Router
 *
 * Time picker component with support for multiple engines.
 *
 * Compound components:
 * - TimePicker.RangePicker - Time range selection
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TimePicker onChange={(time, timeStr) => console.log(time, timeStr)} />
 *
 * // With 12-hour format
 * <TimePicker use12Hours format="h:mm:ss a" />
 *
 * // Range picker
 * <TimePicker.RangePicker onChange={(times, timeStrings) => console.log(times)} />
 * ```
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
 * Supports multiple rendering engines (Titan, Hermes, Apollo) and includes
 * compound components for range selection.
 */
export const TimePicker = Object.assign(TimePickerBase, {
  RangePicker: TimeRangePicker,
});
