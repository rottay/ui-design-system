/**
 * SchedulePicker - Main Export
 * Automatically selects preset based on props
 */

import type { SchedulePickerProps } from './core';
import { SCHEDULE_PICKER_DEFAULTS } from './core';
import { SCHEDULE_PICKER_PRESETS } from './presets';

export { type SchedulePickerProps, type SchedulePickerPreset, type TimeSlot, type DayAvailability, type SessionDuration, type TimePeriod, SCHEDULE_PICKER_DEFAULTS } from './core';
export * from './presets';

/**
 * SchedulePicker component
 * Renders the appropriate preset based on the preset prop
 */
export function SchedulePicker(props: SchedulePickerProps): React.ReactElement {
  const preset = props.preset ?? SCHEDULE_PICKER_DEFAULTS.preset ?? 'booking';
  const PresetComponent = SCHEDULE_PICKER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

SchedulePicker.displayName = 'SchedulePicker';

export { BookingSchedulePicker, CompactSchedulePicker } from './presets';
