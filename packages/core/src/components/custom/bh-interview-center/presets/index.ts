/**
 * BhInterviewCenter - All Presets
 */

export { CalendarBhInterviewCenter } from './calendar';
export { ListBhInterviewCenter } from './list';
export { TimelineBhInterviewCenter } from './timeline';

import type { BhInterviewCenterPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhInterviewCenterProps } from '../core';
import { CalendarBhInterviewCenter } from './calendar';
import { ListBhInterviewCenter } from './list';
import { TimelineBhInterviewCenter } from './timeline';

export const BH_INTERVIEW_CENTER_PRESETS: Record<BhInterviewCenterPreset, ComponentType<BhInterviewCenterProps>> = {
  calendar: CalendarBhInterviewCenter,
  list: ListBhInterviewCenter,
  timeline: TimelineBhInterviewCenter,
};
