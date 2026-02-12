/**
 * StaffShiftScheduler - Main Export
 * Calendar view for shift management with drag-drop assignment
 */

import type { StaffShiftSchedulerProps } from './core';
import { STAFF_SHIFT_SCHEDULER_DEFAULTS } from './core';
import { STAFF_SHIFT_SCHEDULER_PRESETS } from './presets';

export {
  type StaffShiftSchedulerProps,
  type StaffShiftSchedulerPreset,
  type StaffShift,
  type ShiftAssignment,
  STAFF_SHIFT_SCHEDULER_DEFAULTS,
} from './core';
export * from './presets';

export function StaffShiftScheduler(props: StaffShiftSchedulerProps): React.ReactElement {
  const preset = props.preset ?? STAFF_SHIFT_SCHEDULER_DEFAULTS.preset ?? 'calendar';
  const PresetComponent = STAFF_SHIFT_SCHEDULER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffShiftScheduler.displayName = 'StaffShiftScheduler';

export { CalendarStaffShiftScheduler, ListStaffShiftScheduler } from './presets';
