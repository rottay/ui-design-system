import type { ChangelogSectionProps } from './core';
import { CHANGELOG_SECTION_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ChangelogSectionProps, ChangelogSectionPreset, ChangelogEntry, ChangelogType } from './core';
export { CHANGELOG_SECTION_DEFAULTS } from './core';

export function ChangelogSection(props: ChangelogSectionProps): React.ReactElement {
  const preset = props.preset ?? CHANGELOG_SECTION_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ChangelogSection.displayName = 'ChangelogSection';
