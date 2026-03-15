import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type ComplianceScorecardPreset = 'overview' | 'detail' | 'comparison';

export type ComplianceLevel = 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';

export type RegulationType = 'gdpr' | 'ccpa' | 'hipaa' | 'pci-dss' | 'sox' | 'iso27001' | 'psd2' | 'aml' | 'mifid2' | 'dora' | 'mica' | 'gaming' | 'insurance' | 'securities' | 'hr' | 'custom';

export interface ComplianceRequirement {
  id: string;
  name: string;
  description?: string;
  level: ComplianceLevel;
  score: number;
  maxScore: number;
  category?: string;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  findings?: number;
  criticalFindings?: number;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  regulation: RegulationType;
  overallScore: number;
  maxScore: number;
  level: ComplianceLevel;
  requirements: ComplianceRequirement[];
  lastAssessment?: Date;
  nextAssessment?: Date;
  certificationExpiry?: Date;
  auditor?: string;
}

export interface ComplianceScorecardProps extends EngineAwareProps {
  preset?: ComplianceScorecardPreset;
  frameworks: ComplianceFramework[];
  selectedFrameworkId?: string;
  onFrameworkClick?: (frameworkId: string) => void;
  onRequirementClick?: (requirementId: string) => void;
  onExport?: () => void;
  onScheduleAudit?: (frameworkId: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const COMPLIANCE_SCORECARD_DEFAULTS: Partial<ComplianceScorecardProps> = {
  preset: 'overview',
  title: 'Compliance Scorecard',
};

export function getComplianceLevelColors(tokens: DesignTokens) {
  return {
    'compliant': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500], border: tokens.colors.successScale[200] },
    'partial': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500], border: tokens.colors.warningScale[200] },
    'non-compliant': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500], border: tokens.colors.errorScale[200] },
    'not-applicable': { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], dot: tokens.colors.neutral[400], border: tokens.colors.neutral[200] },
  };
}

export function getScoreColor(tokens: DesignTokens, score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 90) return tokens.colors.successScale[500];
  if (pct >= 70) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

export function getRegulationLabel(regulation: RegulationType): string {
  const labels: Record<RegulationType, string> = {
    'gdpr': 'GDPR', 'ccpa': 'CCPA/CPRA', 'hipaa': 'HIPAA', 'pci-dss': 'PCI DSS',
    'sox': 'SOX', 'iso27001': 'ISO 27001', 'psd2': 'PSD2', 'aml': 'AML/KYC',
    'mifid2': 'MiFID II', 'dora': 'DORA', 'mica': 'MiCA', 'gaming': 'Gaming',
    'insurance': 'Insurance', 'securities': 'Securities', 'hr': 'HR/Employment', 'custom': 'Custom',
  };
  return labels[regulation];
}
