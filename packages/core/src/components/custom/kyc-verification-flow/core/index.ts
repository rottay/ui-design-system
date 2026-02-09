import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type KycVerificationFlowPreset = 'wizard' | 'review' | 'status';

export type KycStatus = 'not-started' | 'pending' | 'in-review' | 'approved' | 'rejected' | 'expired';

export type KycLevel = 'basic' | 'standard' | 'enhanced';

export type VerificationStep = 'identity' | 'document' | 'address' | 'selfie' | 'screening' | 'review';

export interface KycDocument {
  id: string;
  type: 'passport' | 'id-card' | 'drivers-license' | 'utility-bill' | 'bank-statement' | 'selfie';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  fileName?: string;
  uploadedAt?: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

export interface KycCheck {
  id: string;
  type: 'identity' | 'sanctions' | 'pep' | 'adverse-media' | 'document' | 'address';
  status: 'pending' | 'passed' | 'failed' | 'review-needed';
  result?: string;
  completedAt?: Date;
  provider?: string;
}

export interface KycSubject {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  nationality?: string;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface KycVerification {
  id: string;
  subject: KycSubject;
  level: KycLevel;
  status: KycStatus;
  currentStep: VerificationStep;
  documents: KycDocument[];
  checks: KycCheck[];
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  notes?: string[];
  assignee?: { id: string; name: string };
}

export interface KycVerificationFlowProps extends EngineAwareProps {
  preset?: KycVerificationFlowPreset;
  verification: KycVerification;
  onStepComplete?: (step: VerificationStep) => void;
  onDocumentUpload?: (type: KycDocument['type']) => void;
  onApprove?: (verificationId: string) => void;
  onReject?: (verificationId: string, reason: string) => void;
  onRequestInfo?: (verificationId: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const KYC_VERIFICATION_FLOW_DEFAULTS: Partial<KycVerificationFlowProps> = {
  preset: 'wizard',
  title: 'KYC Verification',
};

export function getKycStatusColors(tokens: DesignTokens) {
  return {
    'not-started': { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], dot: tokens.colors.neutral[400] },
    'pending': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
    'in-review': { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500] },
    'approved': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
    'rejected': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    'expired': { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], dot: tokens.colors.neutral[400] },
  };
}

export function getCheckStatusColors(tokens: DesignTokens) {
  return {
    'pending': { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], icon: '⏳' },
    'passed': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], icon: '✓' },
    'failed': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], icon: '✗' },
    'review-needed': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], icon: '⚠' },
  };
}

export function getRiskColors(tokens: DesignTokens) {
  return {
    'low': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700] },
    'medium': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700] },
    'high': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700] },
    'critical': { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[800] },
  };
}

export const STEP_ORDER: VerificationStep[] = ['identity', 'document', 'address', 'selfie', 'screening', 'review'];

export function getStepLabel(step: VerificationStep): string {
  const labels: Record<VerificationStep, string> = {
    'identity': 'Identity Info',
    'document': 'Document Upload',
    'address': 'Address Proof',
    'selfie': 'Selfie Verification',
    'screening': 'Background Screening',
    'review': 'Final Review',
  };
  return labels[step];
}
