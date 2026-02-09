import type { SecretVaultPreset } from '../core';
import { VaultSecretVault } from './vault';
import { EnvEditorSecretVault } from './env-editor';

export { VaultSecretVault } from './vault';
export { EnvEditorSecretVault } from './env-editor';

export const SECRET_VAULT_PRESETS: Record<SecretVaultPreset, React.ComponentType<any>> = {
  vault: VaultSecretVault,
  'env-editor': EnvEditorSecretVault,
};
