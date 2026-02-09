/**
 * SecurityEventTimeline - All Presets
 */

import type { SecurityEventTimelinePreset } from '../core';
import { TimelineSecurityEventTimeline } from './timeline';
import { FeedSecurityEventTimeline } from './feed';
import { TableSecurityEventTimeline } from './table';

export { TimelineSecurityEventTimeline } from './timeline';
export { FeedSecurityEventTimeline } from './feed';
export { TableSecurityEventTimeline } from './table';

export const SECURITY_EVENT_TIMELINE_PRESETS: Record<SecurityEventTimelinePreset, React.ComponentType<any>> = {
  timeline: TimelineSecurityEventTimeline,
  feed: FeedSecurityEventTimeline,
  table: TableSecurityEventTimeline,
};
