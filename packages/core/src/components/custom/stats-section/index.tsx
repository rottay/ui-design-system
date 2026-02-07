/**
 * StatsSection - Main Export
 */

import type { StatsSectionProps } from './core';
import { STATS_SECTION_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { StatsSectionProps, StatsSectionPreset, StatItem } from './core';
export { STATS_SECTION_DEFAULTS } from './core';

export function StatsSection(props: StatsSectionProps): React.ReactElement {
  const preset = props.preset ?? STATS_SECTION_DEFAULTS.preset ?? 'inline';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

StatsSection.displayName = 'StatsSection';
