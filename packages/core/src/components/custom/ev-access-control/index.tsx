/**
 * EvAccessControl - Main Export
 * Access control management
 * Automatically selects preset based on props
 */

import type { EvAccessControlProps } from './core';
import { EV_ACCESS_CONTROL_DEFAULTS } from './core';
import { EV_ACCESS_CONTROL_PRESETS } from './presets';

export {
  type EvAccessControlProps,
  type EvAccessControlPreset,
  type AccessLog as EvAccessControlAccessLog,
  type GateStatus as EvAccessControlGateStatus,
  EV_ACCESS_CONTROL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvAccessControl component
 * Renders the appropriate preset based on the preset prop
 */
export function EvAccessControl(props: EvAccessControlProps): React.ReactElement {
  const preset = props.preset ?? EV_ACCESS_CONTROL_DEFAULTS.preset ?? 'monitor';
  const PresetComponent = EV_ACCESS_CONTROL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvAccessControl.displayName = 'EvAccessControl';

export { MonitorEvAccessControl, ConfigEvAccessControl } from './presets';
