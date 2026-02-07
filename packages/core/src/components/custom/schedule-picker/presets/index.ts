/**
 * SchedulePicker - All Presets
 */

import type { SchedulePickerPreset } from '../core';
import { BookingSchedulePicker } from './booking';
import { CompactSchedulePicker } from './compact';

export { BookingSchedulePicker } from './booking';
export { CompactSchedulePicker } from './compact';

export const SCHEDULE_PICKER_PRESETS: Record<SchedulePickerPreset, React.ComponentType<any>> = {
  booking: BookingSchedulePicker,
  compact: CompactSchedulePicker,
};
