/**
 * TimePicker - Engine Router
 *
 * Compound component with:
 * - TimePicker.RangePicker
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TimePickerProps } from './types';

export {
  type TimePickerProps,
  type TimeRangePickerProps,
  type TimePickerSize,
  type TimePickerStatus,
  type TimePickerPlacement,
  TIME_PICKER_DEFAULTS,
} from './types';

export const TimePicker = createEngineComponent<TimePickerProps>('TimePicker', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
