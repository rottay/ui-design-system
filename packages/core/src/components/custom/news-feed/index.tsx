import React from 'react';
import type { NewsFeedProps } from './core';
import { NEWS_FEED_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { NewsFeedProps, NewsFeedPreset, FeedPost } from './core';
export { NEWS_FEED_DEFAULTS } from './core';

export function NewsFeed(props: NewsFeedProps): React.ReactElement {
  const preset = props.preset ?? NEWS_FEED_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
NewsFeed.displayName = 'NewsFeed';
