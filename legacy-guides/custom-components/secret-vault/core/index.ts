import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type SecretVaultPreset = 'vault' | 'env-editor';

export type SecretType = 'api-key' | 'password' | 'token' | 'certificate' | 'ssh-key' | 'env-variable' | 'webhook-secret';

export interface SecretVersion {
  version: number;
  createdAt: Date;
  createdBy: string;
  expiresAt?: Date;
  isActive: boolean;
}

export interface Secret {
  id: string;
  name: string;
  type: SecretType;
  description?: string;
  environment: 'production' | 'staging' | 'development' | 'all';
  lastRotated?: Date;
  expiresAt?: Date;
  rotationPolicy?: { intervalDays: number; autoRotate: boolean };
  versions: SecretVersion[];
  tags?: string[];
  maskedValue?: string;
  createdAt: Date;
  createdBy: string;
}

export interface SecretVaultProps extends EngineAwareProps {
  preset?: SecretVaultPreset;
  secrets: Secret[];
  onCreateSecret?: () => void;
  onRotateSecret?: (secretId: string) => void;
  onDeleteSecret?: (secretId: string) => void;
  onViewSecret?: (secretId: string) => void;
  onCopySecret?: (secretId: string) => void;
  selectedEnvironment?: string;
  onEnvironmentChange?: (env: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SECRET_VAULT_DEFAULTS: Partial<SecretVaultProps> = {
  preset: 'vault',
  title: 'Secret Management',
};

export function getSecretTypeColors(tokens: DesignTokens) {
  return {
    'api-key': { bg: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700] },
    'password': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700] },
    'token': { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700] },
    'certificate': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700] },
    'ssh-key': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700] },
    'env-variable': { bg: tokens.colors.secondaryScale[50], color: tokens.colors.secondaryScale[700] },
    'webhook-secret': { bg: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700] },
  };
}

export function getSecretTypeIcon(type: SecretType): string {
  return { 'api-key': '🔑', 'password': '🔒', 'token': '🎫', 'certificate': '📜', 'ssh-key': '🔐', 'env-variable': '⚙', 'webhook-secret': '🔗' }[type];
}

export function getEnvironmentColors(tokens: DesignTokens) {
  return {
    production: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700] },
    staging: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700] },
    development: { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700] },
    all: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600] },
  };
}

export function isExpiringSoon(expiresAt?: Date, daysThreshold: number = 30): boolean {
  if (!expiresAt) return false;
  return (expiresAt.getTime() - Date.now()) < daysThreshold * 24 * 60 * 60 * 1000;
}
