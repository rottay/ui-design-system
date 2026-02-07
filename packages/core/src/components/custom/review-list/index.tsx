import React from 'react';
import type { ReviewListProps } from './core';
import { REVIEW_LIST_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ReviewListProps, ReviewListPreset, Review, RatingBreakdown } from './core';
export { REVIEW_LIST_DEFAULTS } from './core';

export function ReviewList(props: ReviewListProps): React.ReactElement {
  const preset = props.preset ?? REVIEW_LIST_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
ReviewList.displayName = 'ReviewList';
