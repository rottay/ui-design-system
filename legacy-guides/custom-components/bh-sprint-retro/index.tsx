/**
 * BhSprintRetro - Main Export
 * Sprint retrospective for BitHire recruiting sprints
 * Automatically selects preset based on props
 */

import type { BhSprintRetroProps } from './core';
import { BH_SPRINT_RETRO_DEFAULTS } from './core';
import { BH_SPRINT_RETRO_PRESETS } from './presets';

export {
  type BhSprintRetroProps,
  type BhSprintRetroPreset,
  type RetroItem,
  type RetroCategory,
  type RetroAction,
  type RetroData,
  BH_SPRINT_RETRO_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhSprintRetro component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSprintRetro(props: BhSprintRetroProps): React.ReactElement {
  const preset = props.preset ?? BH_SPRINT_RETRO_DEFAULTS.preset ?? 'session';
  const PresetComponent = BH_SPRINT_RETRO_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSprintRetro.displayName = 'BhSprintRetro';

export { SessionBhSprintRetro } from './presets';
