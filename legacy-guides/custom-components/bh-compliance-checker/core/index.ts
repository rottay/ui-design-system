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
  /** Severity level of the rule */
  severity?: 'critical' | 'high' | 'medium' | 'low';
  /** Whether this rule supports auto-fix */
  autoFix?: boolean;
  /** Timestamp when the rule was auto-fixed */
  fixedAt?: Date;
  /** User who triggered or approved the fix */
  fixedBy?: string;
  /** Regulation this rule maps to (e.g. GDPR, SOC2, EEOC) */
  regulation?: string;
  /** Additional structured details about the rule check */
  details?: Record<string, unknown>;
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
