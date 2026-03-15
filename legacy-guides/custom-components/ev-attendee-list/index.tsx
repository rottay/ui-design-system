/**
 * EvAttendeeList - Main Export
 * Attendee management list
 * Automatically selects preset based on props
 */

import type { EvAttendeeListProps } from './core';
import { EV_ATTENDEE_LIST_DEFAULTS } from './core';
import { EV_ATTENDEE_LIST_PRESETS } from './presets';

export {
  type EvAttendeeListProps,
  type EvAttendeeListPreset,
  type AttendeeRecord as EvAttendeeListAttendeeRecord,
  type AttendeeFilter as EvAttendeeListAttendeeFilter,
  EV_ATTENDEE_LIST_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvAttendeeList component
 * Renders the appropriate preset based on the preset prop
 */
export function EvAttendeeList(props: EvAttendeeListProps): React.ReactElement {
  const preset = props.preset ?? EV_ATTENDEE_LIST_DEFAULTS.preset ?? 'table';
  const PresetComponent = EV_ATTENDEE_LIST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvAttendeeList.displayName = 'EvAttendeeList';

export { TableEvAttendeeList, CompactEvAttendeeList } from './presets';
