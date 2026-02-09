/**
 * EvShiftScheduler - Main Export
 * Shift scheduling calendar
 * Automatically selects preset based on props
 */

import type { EvShiftSchedulerProps } from './core';
import { EV_SHIFT_SCHEDULER_DEFAULTS } from './core';
import { EV_SHIFT_SCHEDULER_PRESETS } from './presets';

export {
  type EvShiftSchedulerProps,
  type EvShiftSchedulerPreset,
  type ShiftBlock as EvShiftSchedulerShiftBlock,
  type ShiftRequirement as EvShiftSchedulerShiftRequirement,
  EV_SHIFT_SCHEDULER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvShiftScheduler component
 * Renders the appropriate preset based on the preset prop
 */
export function EvShiftScheduler(props: EvShiftSchedulerProps): React.ReactElement {
  const preset = props.preset ?? EV_SHIFT_SCHEDULER_DEFAULTS.preset ?? 'calendar';
  const PresetComponent = EV_SHIFT_SCHEDULER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvShiftScheduler.displayName = 'EvShiftScheduler';

export { CalendarEvShiftScheduler, TimelineEvShiftScheduler } from './presets';
