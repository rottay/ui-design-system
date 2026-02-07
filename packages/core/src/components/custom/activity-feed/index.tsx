import type { ActivityFeedProps } from './core';
import { ACTIVITY_FEED_DEFAULTS } from './core';
import { ACTIVITY_FEED_PRESETS } from './presets';

export {
  type ActivityFeedProps,
  type ActivityFeedPreset,
  type ActivityEvent,
  type ActivityActor,
  type ActivityEventType,
  ACTIVITY_FEED_DEFAULTS,
} from './core';
export * from './presets';

export function ActivityFeed(props: ActivityFeedProps): React.ReactElement {
  const preset = props.preset ?? ACTIVITY_FEED_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = ACTIVITY_FEED_PRESETS[preset];
  return <PresetComponent {...props} />;
}

ActivityFeed.displayName = 'ActivityFeed';
