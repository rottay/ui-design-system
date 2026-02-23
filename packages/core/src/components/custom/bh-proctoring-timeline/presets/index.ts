/**
 * BhProctoringTimeline - All Presets
 */

import type { BhProctoringTimelinePreset, BhProctoringTimelineProps } from '../core';
import type { ComponentType } from 'react';
import { HorizontalBhProctoringTimeline } from './horizontal';
import { VerticalBhProctoringTimeline } from './vertical';

export { HorizontalBhProctoringTimeline } from './horizontal';
export { VerticalBhProctoringTimeline } from './vertical';

export const BH_PROCTORING_TIMELINE_PRESETS: Record<BhProctoringTimelinePreset, ComponentType<BhProctoringTimelineProps>> = {
  'horizontal': HorizontalBhProctoringTimeline,
  'vertical': VerticalBhProctoringTimeline,
};
