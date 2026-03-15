/**
 * SecurityEventTimeline - All Presets
 */

import type { SecurityEventTimelinePreset, SecurityEventTimelineProps } from '../core';
import type { ComponentType } from 'react';
import { TimelineSecurityEventTimeline } from './timeline';
import { FeedSecurityEventTimeline } from './feed';
import { TableSecurityEventTimeline } from './table';

export { TimelineSecurityEventTimeline } from './timeline';
export { FeedSecurityEventTimeline } from './feed';
export { TableSecurityEventTimeline } from './table';

export const SECURITY_EVENT_TIMELINE_PRESETS: Record<SecurityEventTimelinePreset, ComponentType<SecurityEventTimelineProps>> = {
  timeline: TimelineSecurityEventTimeline,
  feed: FeedSecurityEventTimeline,
  table: TableSecurityEventTimeline,
};
