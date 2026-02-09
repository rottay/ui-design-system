/**
 * EvTipManager - Main Export
 * Tip collection and analytics
 * Automatically selects preset based on props
 */

import type { EvTipManagerProps } from './core';
import { EV_TIP_MANAGER_DEFAULTS } from './core';
import { EV_TIP_MANAGER_PRESETS } from './presets';

export {
  type EvTipManagerProps,
  type EvTipManagerPreset,
  type TipRecord as EvTipManagerTipRecord,
  type TipStats as EvTipManagerTipStats,
  type PayoutInfo as EvTipManagerPayoutInfo,
  EV_TIP_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvTipManager component
 * Renders the appropriate preset based on the preset prop
 */
export function EvTipManager(props: EvTipManagerProps): React.ReactElement {
  const preset = props.preset ?? EV_TIP_MANAGER_DEFAULTS.preset ?? 'performer';
  const PresetComponent = EV_TIP_MANAGER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvTipManager.displayName = 'EvTipManager';

export { PerformerEvTipManager, AdminEvTipManager } from './presets';
