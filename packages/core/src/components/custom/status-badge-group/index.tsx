import type { StatusBadgeGroupProps } from './core';
import { STATUS_BADGE_GROUP_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { StatusBadgeGroupProps, StatusBadgeGroupPreset, StatusBadge } from './core';
export { STATUS_BADGE_GROUP_DEFAULTS } from './core';

export function StatusBadgeGroup(props: StatusBadgeGroupProps): React.ReactElement {
  const preset = props.preset ?? STATUS_BADGE_GROUP_DEFAULTS.preset ?? 'dots';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

StatusBadgeGroup.displayName = 'StatusBadgeGroup';
