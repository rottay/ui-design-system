/**
 * BhComplianceAudit - All Presets
 */

import type { BhComplianceAuditPreset, BhComplianceAuditProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhComplianceAudit } from './compact';

export { CompactBhComplianceAudit } from './compact';

export const BH_COMPLIANCE_AUDIT_PRESETS: Record<BhComplianceAuditPreset, ComponentType<BhComplianceAuditProps>> = {
  compact: CompactBhComplianceAudit,
};
