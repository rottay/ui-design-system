/**
 * SecurityEventTimeline - Main Export
 * Automatically selects preset based on props
 */

import type { SecurityEventTimelineProps } from './core';
import { SECURITY_EVENT_TIMELINE_DEFAULTS } from './core';
import { SECURITY_EVENT_TIMELINE_PRESETS } from './presets';

export { type SecurityEventTimelineProps, type SecurityEventTimelinePreset, type SecurityEvent, type SecurityEventSeverity, type SecurityEventCategory, type SecurityActor, SECURITY_EVENT_TIMELINE_DEFAULTS } from './core';
export { getSeverityColors, getOutcomeColors, getCategoryLabel } from './core';
export * from './presets';

/**
 * SecurityEventTimeline component
 * Renders the appropriate preset based on the preset prop
 */
export function SecurityEventTimeline(props: SecurityEventTimelineProps): React.ReactElement {
  const preset = props.preset ?? SECURITY_EVENT_TIMELINE_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = SECURITY_EVENT_TIMELINE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

SecurityEventTimeline.displayName = 'SecurityEventTimeline';

export { TimelineSecurityEventTimeline, FeedSecurityEventTimeline, TableSecurityEventTimeline } from './presets';
