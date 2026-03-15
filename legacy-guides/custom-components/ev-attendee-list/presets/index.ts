/**
 * EvAttendeeList - All Presets
 */

export { TableEvAttendeeList } from './table';
export { CompactEvAttendeeList } from './compact';

import type { EvAttendeeListPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvAttendeeListProps } from '../core';
import { TableEvAttendeeList } from './table';
import { CompactEvAttendeeList } from './compact';

export const EV_ATTENDEE_LIST_PRESETS: Record<EvAttendeeListPreset, ComponentType<EvAttendeeListProps>> = {
  table: TableEvAttendeeList,
  compact: CompactEvAttendeeList,
};
