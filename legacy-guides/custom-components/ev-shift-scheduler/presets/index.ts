/**
 * EvShiftScheduler - All Presets
 */

export { CalendarEvShiftScheduler } from './calendar';
export { TimelineEvShiftScheduler } from './timeline';

import type { EvShiftSchedulerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvShiftSchedulerProps } from '../core';
import { CalendarEvShiftScheduler } from './calendar';
import { TimelineEvShiftScheduler } from './timeline';

export const EV_SHIFT_SCHEDULER_PRESETS: Record<EvShiftSchedulerPreset, ComponentType<EvShiftSchedulerProps>> = {
  calendar: CalendarEvShiftScheduler,
  timeline: TimelineEvShiftScheduler,
};
