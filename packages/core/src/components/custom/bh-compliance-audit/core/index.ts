/**
 * BhComplianceAudit - Core Interface
 * Dashboard widget displaying compliance audit status, category scores,
 * findings, and upcoming audit dates.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhComplianceAuditPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Compliance category with score and check status */
export interface ComplianceCategory {
  name: string;
  score: number;
  status: 'pass' | 'warning' | 'fail';
  checkedItems: number;
  totalItems: number;
}

/** Individual compliance finding */
export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  dueDate?: Date | string;
  resolved: boolean;
}

/** Complete compliance audit dataset */
export interface ComplianceAuditData {
  overallScore: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  categories: ComplianceCategory[];
  recentFindings: ComplianceFinding[];
  auditDueDate?: Date | string;
  lastAuditDate: Date | string;
  openIssues: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhComplianceAuditProps extends EngineAwareProps {
  preset?: BhComplianceAuditPreset;

  /** Compliance audit data */
  data?: ComplianceAuditData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a finding is clicked */
  onViewFinding?: (findingId: string) => void;

  /** Callback when "View Report" or "Start Audit" is clicked */
  onViewAudit?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_COMPLIANCE_AUDIT_DEFAULTS: Partial<BhComplianceAuditProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
