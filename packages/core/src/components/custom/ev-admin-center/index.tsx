/**
 * EvAdminCenter - Main Export
 * Platform admin dashboard
 * Automatically selects preset based on props
 */

import type { EvAdminCenterProps } from './core';
import { EV_ADMIN_CENTER_DEFAULTS } from './core';
import { EV_ADMIN_CENTER_PRESETS } from './presets';

export {
  type EvAdminCenterProps,
  type EvAdminCenterPreset,
  type SystemMetric as EvAdminCenterSystemMetric,
  type TenantSummary as EvAdminCenterTenantSummary,
  type SystemEvent as EvAdminCenterSystemEvent,
  type AdminAction as EvAdminCenterAdminAction,
  EV_ADMIN_CENTER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvAdminCenter component
 * Renders the appropriate preset based on the preset prop
 */
export function EvAdminCenter(props: EvAdminCenterProps): React.ReactElement {
  const preset = props.preset ?? EV_ADMIN_CENTER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = EV_ADMIN_CENTER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvAdminCenter.displayName = 'EvAdminCenter';

export { OverviewEvAdminCenter, SystemEvAdminCenter } from './presets';
