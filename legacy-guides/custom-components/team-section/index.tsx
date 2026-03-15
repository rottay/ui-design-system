import type { TeamSectionProps } from './core';
import { TEAM_SECTION_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { TeamSectionProps, TeamSectionPreset, TeamMemberDisplay, SocialLink } from './core';
export { TEAM_SECTION_DEFAULTS } from './core';

export function TeamSection(props: TeamSectionProps): React.ReactElement {
  const preset = props.preset ?? TEAM_SECTION_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

TeamSection.displayName = 'TeamSection';
