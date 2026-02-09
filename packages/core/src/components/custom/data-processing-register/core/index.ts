import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type DataProcessingRegisterPreset = 'register' | 'flow-diagram' | 'card';

export type LawfulBasis =
  | 'consent'
  | 'contract'
  | 'legal-obligation'
  | 'vital-interest'
  | 'public-task'
  | 'legitimate-interest';

export type DataCategory =
  | 'personal'
  | 'sensitive'
  | 'financial'
  | 'health'
  | 'biometric'
  | 'children';

export interface ProcessingActivity {
  id: string;
  name: string;
  description: string;
  purpose: string;
  lawfulBasis: LawfulBasis;
  dataCategories: DataCategory[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: string;
  transfersOutsideEEA: boolean;
  safeguards?: string;
  dpia: boolean;
  dpiaCompleted?: boolean;
  controller: string;
  processor?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'draft' | 'archived';
}

export interface DataProcessingRegisterProps extends EngineAwareProps {
  preset?: DataProcessingRegisterPreset;
  activities: ProcessingActivity[];
  onCreateActivity?: () => void;
  onEditActivity?: (id: string) => void;
  onDeleteActivity?: (id: string) => void;
  onExport?: () => void;
  selectedActivityId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const DATA_PROCESSING_REGISTER_DEFAULTS: Partial<DataProcessingRegisterProps> = {
  preset: 'register',
  title: 'Data Processing Register',
};

export function getLawfulBasisColors(tokens: DesignTokens) {
  return {
    'consent': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
    'contract': { bg: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] },
    'legal-obligation': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    'vital-interest': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] },
    'public-task': { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] },
    'legitimate-interest': { bg: tokens.colors.secondaryScale[50], color: tokens.colors.secondaryScale[700], border: tokens.colors.secondaryScale[200] },
  };
}

export function getDataCategoryColors(tokens: DesignTokens) {
  return {
    personal: { bg: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] },
    sensitive: { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] },
    financial: { bg: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    health: { bg: tokens.colors.successScale[100], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
    biometric: { bg: tokens.colors.infoScale[100], color: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] },
    children: { bg: tokens.colors.secondaryScale[100], color: tokens.colors.secondaryScale[700], border: tokens.colors.secondaryScale[200] },
  };
}

export function getDataCategoryIcon(category: DataCategory): string {
  const icons: Record<DataCategory, string> = {
    personal: '👤',
    sensitive: '🔒',
    financial: '💳',
    health: '🏥',
    biometric: '🧬',
    children: '👶',
  };
  return icons[category];
}
