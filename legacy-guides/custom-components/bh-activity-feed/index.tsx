/**
 * BhActivityFeed - Main Export
 * Activity feed component for BitHire ATS platform
 */

import type { BhActivityFeedProps } from './core';
import { BH_ACTIVITY_FEED_DEFAULTS } from './core';
import { BH_ACTIVITY_FEED_PRESETS } from './presets';

export {
  type BhActivityFeedProps,
  type BhActivityFeedPreset,
  type ActivityActionType,
  type ActivityEntityType,
  type ActivityActor,
  type ActivityItem,
  type ActivityFeedStats,
  type ActivityFeedFilter,
  BH_ACTIVITY_FEED_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhActivityFeed component
 * Renders the appropriate preset based on the preset prop
 */
export function BhActivityFeed(props: BhActivityFeedProps): React.ReactElement {
  const preset = props.preset ?? BH_ACTIVITY_FEED_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_ACTIVITY_FEED_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhActivityFeed.displayName = 'BhActivityFeed';

export { FullBhActivityFeed } from './presets';
