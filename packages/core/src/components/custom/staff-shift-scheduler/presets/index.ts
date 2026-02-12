/**
 * StaffShiftScheduler - All Presets
 */

export { CalendarStaffShiftScheduler } from './calendar';
export { ListStaffShiftScheduler } from './list';

import type { StaffShiftSchedulerPreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffShiftSchedulerProps } from '../core';
import { CalendarStaffShiftScheduler } from './calendar';
import { ListStaffShiftScheduler } from './list';

export const STAFF_SHIFT_SCHEDULER_PRESETS: Record<StaffShiftSchedulerPreset, ComponentType<StaffShiftSchedulerProps>> = {
  calendar: CalendarStaffShiftScheduler,
  list: ListStaffShiftScheduler,
};
