/**
 * EvLineupBuilder - Main Export
 * Lineup/scheduling builder
 * Automatically selects preset based on props
 */

import type { EvLineupBuilderProps } from './core';
import { EV_LINEUP_BUILDER_DEFAULTS } from './core';
import { EV_LINEUP_BUILDER_PRESETS } from './presets';

export {
  type EvLineupBuilderProps,
  type EvLineupBuilderPreset,
  type ArtistSlot as EvLineupBuilderArtistSlot,
  type StageTrack as EvLineupBuilderStageTrack,
  type TimeConflict as EvLineupBuilderTimeConflict,
  EV_LINEUP_BUILDER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvLineupBuilder component
 * Renders the appropriate preset based on the preset prop
 */
export function EvLineupBuilder(props: EvLineupBuilderProps): React.ReactElement {
  const preset = props.preset ?? EV_LINEUP_BUILDER_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = EV_LINEUP_BUILDER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvLineupBuilder.displayName = 'EvLineupBuilder';

export { TimelineEvLineupBuilder, ListEvLineupBuilder } from './presets';
