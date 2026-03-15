/**
 * PlPermissionAudit - All Presets
 */

export { TimelinePlPermissionAudit } from './timeline';
export { TablePlPermissionAudit } from './table';

import type { PlPermissionAuditPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlPermissionAuditProps } from '../core';
import { TimelinePlPermissionAudit } from './timeline';
import { TablePlPermissionAudit } from './table';

export const PL_PERMISSION_AUDIT_PRESETS: Record<PlPermissionAuditPreset, ComponentType<PlPermissionAuditProps>> = {
  timeline: TimelinePlPermissionAudit,
  table: TablePlPermissionAudit,
};
