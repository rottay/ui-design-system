import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type MfaConfigPanelPreset = 'setup' | 'manage' | 'policy';

export type MfaMethod = 'totp' | 'sms' | 'email' | 'webauthn' | 'recovery-codes';

export type MfaMethodStatus = 'active' | 'inactive' | 'pending-setup';

export interface MfaMethodConfig {
  method: MfaMethod;
  status: MfaMethodStatus;
  label: string;
  description: string;
  isPrimary?: boolean;
  lastUsed?: Date;
  configuredAt?: Date;
  phoneNumber?: string;
  email?: string;
  recoveryCodesRemaining?: number;
}

export interface MfaPolicyRule {
  id: string;
  name: string;
  description?: string;
  requiredMethods: MfaMethod[];
  minMethods: number;
  enforced: boolean;
  appliesTo: 'all' | 'admins' | 'custom';
  gracePeriodDays?: number;
}

export interface MfaConfigPanelProps extends EngineAwareProps {
  preset?: MfaConfigPanelPreset;
  methods: MfaMethodConfig[];
  policies?: MfaPolicyRule[];
  onMethodToggle?: (method: MfaMethod, enabled: boolean) => void;
  onMethodSetup?: (method: MfaMethod) => void;
  onSetPrimary?: (method: MfaMethod) => void;
  onPolicyToggle?: (policyId: string, enforced: boolean) => void;
  onRegenerateRecoveryCodes?: () => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  userEmail?: string;
  userPhone?: string;
  className?: string;
  style?: CSSProperties;
}

export const MFA_CONFIG_PANEL_DEFAULTS: Partial<MfaConfigPanelProps> = {
  preset: 'manage',
  title: 'Multi-Factor Authentication',
};

export function getMethodIcon(method: MfaMethod): string {
  switch (method) {
    case 'totp': return '🔐';
    case 'sms': return '📱';
    case 'email': return '📧';
    case 'webauthn': return '🔑';
    case 'recovery-codes': return '🛡';
    default: return '🔒';
  }
}

export function getMethodStatusColors(tokens: DesignTokens) {
  return {
    active: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
    inactive: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], dot: tokens.colors.neutral[400] },
    'pending-setup': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
  };
}
