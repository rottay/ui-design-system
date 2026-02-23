/**
 * BhComplianceAudit - Main Export
 * Dashboard widget displaying compliance audit status and findings.
 */

import type { BhComplianceAuditProps } from './core';
import { BH_COMPLIANCE_AUDIT_DEFAULTS } from './core';
import { BH_COMPLIANCE_AUDIT_PRESETS } from './presets';

export {
  type BhComplianceAuditProps,
  type BhComplianceAuditPreset,
  type ComplianceAuditData,
  type ComplianceCategory,
  type ComplianceFinding,
  BH_COMPLIANCE_AUDIT_DEFAULTS,
} from './core';
export * from './presets';

export function BhComplianceAudit(props: BhComplianceAuditProps): React.ReactElement {
  const preset = props.preset ?? BH_COMPLIANCE_AUDIT_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_COMPLIANCE_AUDIT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhComplianceAudit.displayName = 'BhComplianceAudit';

export { CompactBhComplianceAudit } from './presets';
