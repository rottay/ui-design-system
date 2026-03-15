/**
 * StaffCredentialManager - Core Interface
 * Certifications and digital credentials with QR codes, expiry tracking
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffCredentialManagerPreset = 'grid' | 'table';

export interface StaffCredential {
  id: string;
  staffId: string;
  staffName: string;
  type: 'certification' | 'license' | 'training' | 'badge';
  name: string;
  issuedBy: string;
  issuedAt: Date;
  expiresAt?: Date;
  status: 'valid' | 'expiring-soon' | 'expired' | 'pending-verification';
  documentUrl?: string;
  qrCode?: string;
  verifiedBy?: string;
}

export interface StaffCredentialManagerProps extends EngineAwareProps {
  preset?: StaffCredentialManagerPreset;
  credentials?: StaffCredential[];
  onCredentialClick?: (id: string) => void;
  onVerify?: (id: string) => void;
  onRenew?: (id: string) => void;
  onAddCredential?: () => void;
  expiryWarningDays?: number;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_CREDENTIAL_MANAGER_DEFAULTS: Partial<StaffCredentialManagerProps> = {
  preset: 'grid',
  expiryWarningDays: 30,
};
