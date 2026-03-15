import React from 'react';
import type { ContentCardProps } from './core';
import { CONTENT_CARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ContentCardProps, ContentCardPreset } from './core';
export { CONTENT_CARD_DEFAULTS } from './core';

export function ContentCard(props: ContentCardProps): React.ReactElement {
  const preset = props.preset ?? CONTENT_CARD_DEFAULTS.preset ?? 'document';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
ContentCard.displayName = 'ContentCard';
