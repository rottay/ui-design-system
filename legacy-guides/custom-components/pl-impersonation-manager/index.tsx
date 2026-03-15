/**
 * PlImpersonationManager - Main Export
 * Manage admin impersonation sessions with audit trail and time limits
 */

import type { PlImpersonationManagerProps } from './core';
import { PL_IMPERSONATION_MANAGER_DEFAULTS } from './core';
import { PL_IMPERSONATION_MANAGER_PRESETS } from './presets';

export { type PlImpersonationManagerProps, type PlImpersonationManagerPreset, PL_IMPERSONATION_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlImpersonationManager(props: PlImpersonationManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_IMPERSONATION_MANAGER_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PL_IMPERSONATION_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlImpersonationManager.displayName = 'PlImpersonationManager';
