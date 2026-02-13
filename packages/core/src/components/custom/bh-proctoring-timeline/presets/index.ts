/**
 * BhProctoringTimeline - All Presets
 */

import type { BhProctoringTimelinePreset } from '../core';
import { HorizontalBhProctoringTimeline } from './horizontal';
import { VerticalBhProctoringTimeline } from './vertical';

export { HorizontalBhProctoringTimeline } from './horizontal';
export { VerticalBhProctoringTimeline } from './vertical';

export const BH_PROCTORING_TIMELINE_PRESETS: Record<BhProctoringTimelinePreset, React.ComponentType<any>> = {
  'horizontal': HorizontalBhProctoringTimeline,
  'vertical': VerticalBhProctoringTimeline,
};
