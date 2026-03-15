/**
 * PlMfaSetup - Core Interface
 * Guide users through multi-factor authentication setup with TOTP and backup codes
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlMfaSetupPreset = 'wizard' | 'compact';

export type MfaMethodType = 'totp' | 'sms' | 'email' | 'webauthn' | 'backup_codes';

export type MfaMethodStatus = 'active' | 'inactive' | 'pending';

export type SetupStep = 'select_method' | 'configure' | 'verify' | 'backup_codes' | 'complete';

export interface MfaMethod {
  id: string;
  type: MfaMethodType;
  name: string;
  status: MfaMethodStatus;
  isDefault: boolean;
  registeredAt?: Date;
  lastUsed?: Date;
  deviceName?: string;
}

export interface SetupState {
  currentStep: SetupStep;
  selectedMethod?: MfaMethodType;
  qrCodeUrl?: string;
  backupCodes?: string[];
  phoneNumber?: string;
  recoveryEmail?: string;
}

export interface PlMfaSetupProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlMfaSetupPreset;

  /** Configured MFA methods */
  methods: MfaMethod[];

  /** Current setup state (for wizard) */
  setupState?: SetupState;

  /** Callback when a method is selected for setup */
  onMethodSelect?: (methodType: MfaMethodType) => void;

  /** Callback when verification code is submitted */
  onVerify?: (code: string) => void;

  /** Callback when backup codes are downloaded */
  onDownloadBackupCodes?: () => void;

  /** Callback when a method is set as default */
  onSetDefault?: (methodId: string) => void;

  /** Callback when a method is removed */
  onRemoveMethod?: (methodId: string) => void;

  /** Callback when setup is completed */
  onComplete?: () => void;

  /** Callback to add a new method (compact view) */
  onAddMethod?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_MFA_SETUP_DEFAULTS: Partial<PlMfaSetupProps> = {
  preset: 'wizard',
};
