/**
 * EvStageManager - Main Export
 * Stage configuration manager
 * Automatically selects preset based on props
 */

import type { EvStageManagerProps } from './core';
import { EV_STAGE_MANAGER_DEFAULTS } from './core';
import { EV_STAGE_MANAGER_PRESETS } from './presets';

export {
  type EvStageManagerProps,
  type EvStageManagerPreset,
  type StageConfig as EvStageManagerStageConfig,
  type StageSchedule as EvStageManagerStageSchedule,
  EV_STAGE_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvStageManager component
 * Renders the appropriate preset based on the preset prop
 */
export function EvStageManager(props: EvStageManagerProps): React.ReactElement {
  const preset = props.preset ?? EV_STAGE_MANAGER_DEFAULTS.preset ?? 'visual';
  const PresetComponent = EV_STAGE_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvStageManager.displayName = 'EvStageManager';

export { VisualEvStageManager, TableEvStageManager } from './presets';
