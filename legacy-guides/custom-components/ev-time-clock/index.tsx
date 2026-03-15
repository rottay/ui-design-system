/**
 * EvTimeClock - Main Export
 * Staff check-in/out time clock
 * Automatically selects preset based on props
 */

import type { EvTimeClockProps } from './core';
import { EV_TIME_CLOCK_DEFAULTS } from './core';
import { EV_TIME_CLOCK_PRESETS } from './presets';

export {
  type EvTimeClockProps,
  type EvTimeClockPreset,
  type ClockEntry as EvTimeClockClockEntry,
  type ShiftInfo as EvTimeClockShiftInfo,
  EV_TIME_CLOCK_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvTimeClock component
 * Renders the appropriate preset based on the preset prop
 */
export function EvTimeClock(props: EvTimeClockProps): React.ReactElement {
  const preset = props.preset ?? EV_TIME_CLOCK_DEFAULTS.preset ?? 'standard';
  const PresetComponent = EV_TIME_CLOCK_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvTimeClock.displayName = 'EvTimeClock';

export { StandardEvTimeClock, KioskEvTimeClock } from './presets';
