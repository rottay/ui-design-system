/**
 * BhAppealTimeline - All Presets
 */

import type { BhAppealTimelinePreset, BhAppealTimelineProps } from '../core';
import type { ComponentType } from 'react';
import { TimelineBhAppealTimeline } from './timeline';
import { CompactBhAppealTimeline } from './compact';

export { TimelineBhAppealTimeline } from './timeline';
export { CompactBhAppealTimeline } from './compact';

export const BH_APPEAL_TIMELINE_PRESETS: Record<BhAppealTimelinePreset, ComponentType<BhAppealTimelineProps>> = {
  'timeline': TimelineBhAppealTimeline,
  'compact': CompactBhAppealTimeline,
};
