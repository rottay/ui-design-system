import type { BadgeShowcaseProps } from './core';
import { BADGE_SHOWCASE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { BadgeShowcaseProps, BadgeShowcasePreset, AchievementBadge } from './core';
export { BADGE_SHOWCASE_DEFAULTS } from './core';

export function BadgeShowcase(props: BadgeShowcaseProps): React.ReactElement {
  const preset = props.preset ?? BADGE_SHOWCASE_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

BadgeShowcase.displayName = 'BadgeShowcase';
