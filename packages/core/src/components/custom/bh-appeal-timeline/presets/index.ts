/**
 * BhAppealTimeline - All Presets
 */

import type { BhAppealTimelinePreset } from '../core';
import { TimelineBhAppealTimeline } from './timeline';
import { CompactBhAppealTimeline } from './compact';

export { TimelineBhAppealTimeline } from './timeline';
export { CompactBhAppealTimeline } from './compact';

export const BH_APPEAL_TIMELINE_PRESETS: Record<BhAppealTimelinePreset, React.ComponentType<any>> = {
  'timeline': TimelineBhAppealTimeline,
  'compact': CompactBhAppealTimeline,
};
