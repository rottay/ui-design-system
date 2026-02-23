import type { SecretVaultPreset, SecretVaultProps } from '../core';
import type { ComponentType } from 'react';
import { VaultSecretVault } from './vault';
import { EnvEditorSecretVault } from './env-editor';

export { VaultSecretVault } from './vault';
export { EnvEditorSecretVault } from './env-editor';

export const SECRET_VAULT_PRESETS: Record<SecretVaultPreset, ComponentType<SecretVaultProps>> = {
  vault: VaultSecretVault,
  'env-editor': EnvEditorSecretVault,
};
