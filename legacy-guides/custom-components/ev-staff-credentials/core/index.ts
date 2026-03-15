/**
 * EvStaffCredentials - Core Interface
 * Credential/badge management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvStaffCredentialsPreset = 'list' | 'scanner';

export interface Credential {
  id: string;
  staffName: string;
  credentialCode: string;
  qrCodeUrl?: string;
  zones: string[];
  status: "active" | "suspended" | "revoked" | "expired";
  validFrom: Date;
  validUntil: Date;
}

export interface EvStaffCredentialsProps extends EngineAwareProps {
  preset?: EvStaffCredentialsPreset;
  credentials?: Credential[];
  onActivate?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onRevoke?: (id: string) => void;
  onGenerate?: (staffId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_STAFF_CREDENTIALS_DEFAULTS: Partial<EvStaffCredentialsProps> = {
  preset: 'list',

};
