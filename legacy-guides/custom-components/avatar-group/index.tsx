import type { AvatarGroupProps } from './core';
import { AVATAR_GROUP_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { AvatarGroupProps, AvatarGroupPreset, AvatarItem } from './core';
export { AVATAR_GROUP_DEFAULTS } from './core';

export function AvatarGroup(props: AvatarGroupProps): React.ReactElement {
  const preset = props.preset ?? AVATAR_GROUP_DEFAULTS.preset ?? 'stacked';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

AvatarGroup.displayName = 'AvatarGroup';
