/**
 * PlPermissionAudit - Main Export
 * Audit trail of permission changes with before/after comparison and rollback
 */

import type { PlPermissionAuditProps } from './core';
import { PL_PERMISSION_AUDIT_DEFAULTS } from './core';
import { PL_PERMISSION_AUDIT_PRESETS } from './presets';

export { type PlPermissionAuditProps, type PlPermissionAuditPreset, PL_PERMISSION_AUDIT_DEFAULTS } from './core';
export * from './presets';

export function PlPermissionAudit(props: PlPermissionAuditProps): React.ReactElement {
  const preset = props.preset ?? PL_PERMISSION_AUDIT_DEFAULTS.preset ?? 'timeline';
  const PresetComponent = PL_PERMISSION_AUDIT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlPermissionAudit.displayName = 'PlPermissionAudit';
