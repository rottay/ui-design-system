import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type PasskeyManagerPreset = 'list' | 'cards';

export type PasskeyType = 'platform' | 'cross-platform' | 'security-key';

export interface Passkey {
  id: string;
  name: string;
  type: PasskeyType;
  credentialId: string;
  createdAt: Date;
  lastUsedAt?: Date;
  aaguid?: string;
  deviceInfo?: string;
  transports?: ('usb' | 'nfc' | 'ble' | 'internal')[];
  backupEligible?: boolean;
  backupState?: boolean;
}

export interface PasskeyManagerProps extends EngineAwareProps {
  preset?: PasskeyManagerPreset;
  passkeys: Passkey[];
  onRegister?: () => void;
  onDelete?: (passkeyId: string) => void;
  onRename?: (passkeyId: string, newName: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  supportsWebAuthn?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const PASSKEY_MANAGER_DEFAULTS: Partial<PasskeyManagerProps> = {
  preset: 'list',
  title: 'Passkeys',
  supportsWebAuthn: true,
};

export function getPasskeyTypeColors(tokens: DesignTokens) {
  return {
    platform: { bg: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700] },
    'cross-platform': { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700] },
    'security-key': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700] },
  };
}

export function getPasskeyIcon(type: PasskeyType): string {
  return { platform: '💻', 'cross-platform': '📱', 'security-key': '🔑' }[type];
}
