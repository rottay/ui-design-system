/**
 * DatePicker - Engine Router
 *
 * Compound component with:
 * - DatePicker.RangePicker
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { DatePickerProps } from './types';

export {
  type DatePickerProps,
  type RangePickerProps,
  type DatePickerSize,
  type DatePickerStatus,
  type DatePickerPlacement,
  type DatePickerMode,
  DATE_PICKER_DEFAULTS,
} from './types';

export const DatePicker = createEngineComponent<DatePickerProps>('DatePicker', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
