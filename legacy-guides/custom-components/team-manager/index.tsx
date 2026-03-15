import type { TeamManagerProps } from './core';
import { TEAM_MANAGER_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { TeamManagerProps, TeamManagerPreset, TeamMember, TeamRole } from './core';
export { TEAM_MANAGER_DEFAULTS } from './core';

export function TeamManager(props: TeamManagerProps): React.ReactElement {
  const preset = props.preset ?? TEAM_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

TeamManager.displayName = 'TeamManager';
