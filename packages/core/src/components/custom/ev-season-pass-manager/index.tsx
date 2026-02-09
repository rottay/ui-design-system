/**
 * EvSeasonPassManager - Main Export
 * Season pass management
 * Automatically selects preset based on props
 */

import type { EvSeasonPassManagerProps } from './core';
import { EV_SEASON_PASS_MANAGER_DEFAULTS } from './core';
import { EV_SEASON_PASS_MANAGER_PRESETS } from './presets';

export {
  type EvSeasonPassManagerProps,
  type EvSeasonPassManagerPreset,
  type SeasonPassType as EvSeasonPassManagerSeasonPassType,
  type PassHolder as EvSeasonPassManagerPassHolder,
  EV_SEASON_PASS_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvSeasonPassManager component
 * Renders the appropriate preset based on the preset prop
 */
export function EvSeasonPassManager(props: EvSeasonPassManagerProps): React.ReactElement {
  const preset = props.preset ?? EV_SEASON_PASS_MANAGER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_SEASON_PASS_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvSeasonPassManager.displayName = 'EvSeasonPassManager';

export { OverviewEvSeasonPassManager, EditorEvSeasonPassManager } from './presets';
