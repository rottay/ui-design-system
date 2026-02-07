import type { AuditLogProps } from './core';
import { AUDIT_LOG_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { AuditLogProps, AuditLogPreset, AuditEntry } from './core';
export { AUDIT_LOG_DEFAULTS } from './core';

export function AuditLog(props: AuditLogProps): React.ReactElement {
  const preset = props.preset ?? AUDIT_LOG_DEFAULTS.preset ?? 'table';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

AuditLog.displayName = 'AuditLog';
