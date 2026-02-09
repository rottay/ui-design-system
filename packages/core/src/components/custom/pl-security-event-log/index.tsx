/**
 * PlSecurityEventLog - Main Export
 * Monitor security events including login attempts, permission changes, and alerts
 */

import type { PlSecurityEventLogProps } from './core';
import { PL_SECURITY_EVENT_LOG_DEFAULTS } from './core';
import { PL_SECURITY_EVENT_LOG_PRESETS } from './presets';

export { type PlSecurityEventLogProps, type PlSecurityEventLogPreset, PL_SECURITY_EVENT_LOG_DEFAULTS } from './core';
export * from './presets';

export function PlSecurityEventLog(props: PlSecurityEventLogProps): React.ReactElement {
  const preset = props.preset ?? PL_SECURITY_EVENT_LOG_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = PL_SECURITY_EVENT_LOG_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlSecurityEventLog.displayName = 'PlSecurityEventLog';
