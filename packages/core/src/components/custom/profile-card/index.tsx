import React from 'react';
import type { ProfileCardProps } from './core';
import { PROFILE_CARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ProfileCardProps, ProfileCardPreset } from './core';
export { PROFILE_CARD_DEFAULTS } from './core';

export function ProfileCard(props: ProfileCardProps): React.ReactElement {
  const preset = props.preset ?? PROFILE_CARD_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}
ProfileCard.displayName = 'ProfileCard';
