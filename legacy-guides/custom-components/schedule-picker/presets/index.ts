/**
 * SchedulePicker - All Presets
 */

import type { SchedulePickerPreset, SchedulePickerProps } from '../core';
import type { ComponentType } from 'react';
import { BookingSchedulePicker } from './booking';
import { CompactSchedulePicker } from './compact';

export { BookingSchedulePicker } from './booking';
export { CompactSchedulePicker } from './compact';

export const SCHEDULE_PICKER_PRESETS: Record<SchedulePickerPreset, ComponentType<SchedulePickerProps>> = {
  booking: BookingSchedulePicker,
  compact: CompactSchedulePicker,
};
