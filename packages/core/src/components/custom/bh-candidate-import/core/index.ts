/**
 * BhCandidateImport - Core Interface
 * Step-by-step candidate import wizard
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The dedup match references DBCandidate for existing candidate records.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBCandidate } from '@rottay/recruiter';

export type BhCandidateImportPreset = 'standard';

export type RecruiterCandidate = DBCandidate;

export type ImportMethod = 'manual' | 'csv' | 'integration';

export interface ImportStep {
  key: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  autoDetected: boolean;
}

export interface DedupMatch {
  /** ID of the existing candidate in DB */
  candidateId: string;
  /** Display name (from the existing candidate) */
  name: string;
  /** Email of the existing candidate */
  email: string;
  /** Similarity score 0-100 */
  similarity: number;
  /** Action chosen by user */
  action: 'merge' | 'skip' | 'create';
}

export interface ValidationResult {
  valid: number;
  warnings: number;
  errors: number;
  details: { row: number; field: string; message: string }[];
}

export interface ImportProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  percentage: number;
}

export interface BhCandidateImportProps extends EngineAwareProps {
  preset?: BhCandidateImportPreset;
  steps?: ImportStep[];
  currentStep?: number;
  method?: ImportMethod;
  uploadedFile?: { name: string; size: number; type: string } | null;
  fieldMapping?: FieldMapping[];
  dedupResults?: DedupMatch[];
  validationResults?: ValidationResult | null;
  importProgress?: ImportProgress | null;
  onChange?: (field: string, value: unknown) => void;
  onStepChange?: (step: number) => void;
  onUpload?: (file: File) => void;
  onMappingChange?: (mappings: FieldMapping[]) => void;
  onDedupAction?: (candidateId: string, action: 'merge' | 'skip' | 'create') => void;
  onStartImport?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_CANDIDATE_IMPORT_DEFAULTS: Partial<BhCandidateImportProps> = {
  preset: 'standard',
};

export function getStepStatusColors(tokens: DesignTokens) {
  return {
    pending: { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[400], border: tokens.colors.neutral[200] },
    active: { bg: tokens.colors.primaryScale[50], text: tokens.colors.primaryScale[600], border: tokens.colors.primaryScale[300] },
    complete: { bg: tokens.colors.successScale[50], text: tokens.colors.successScale[600], border: tokens.colors.successScale[300] },
    error: { bg: tokens.colors.errorScale[50], text: tokens.colors.errorScale[600], border: tokens.colors.errorScale[300] },
  };
}

export function getMethodIcon(method: ImportMethod): string {
  switch (method) {
    case 'manual':
      return 'edit';
    case 'csv':
      return 'upload';
    case 'integration':
      return 'link';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
