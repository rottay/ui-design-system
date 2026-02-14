/**
 * BhComplianceChecker - Core Interface
 * Compliance rules checker and status for BitHire ATS platform
 *
 * DB Reference: DBAuditLog from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBAuditLog } from '@rottay/recruiter';

export type BhComplianceCheckerPreset = 'checker' | 'compact';

/** Re-export for consumer convenience */
export type { DBAuditLog };

export interface ComplianceRule {
  id?: string;
  name?: string;
  category?: string;
  status?: 'pass' | 'fail' | 'warning' | 'na';
  description?: string;
  lastChecked?: Date;
}

export interface BhComplianceCheckerProps extends EngineAwareProps {
  preset?: BhComplianceCheckerPreset;

  /** Compliance rules */
  rules?: ComplianceRule[];

  /** Overall compliance score (0-100) */
  overallScore?: number;

  /** Dashboard title */
  title?: string;

  /** Callback when a rule is clicked */
  onRuleClick?: (ruleId: string) => void;

  /** Callback to trigger recheck */
  onRecheck?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_COMPLIANCE_CHECKER_DEFAULTS: Partial<BhComplianceCheckerProps> = {
  preset: 'checker',
  title: 'Compliance Status',
};
