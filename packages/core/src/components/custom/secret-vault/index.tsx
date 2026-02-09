import type { SecretVaultProps } from './core';
import { SECRET_VAULT_DEFAULTS } from './core';
import { SECRET_VAULT_PRESETS } from './presets';

export { type SecretVaultProps, type SecretVaultPreset, type Secret, type SecretVersion, type SecretType, SECRET_VAULT_DEFAULTS } from './core';
export { getSecretTypeColors, getSecretTypeIcon, getEnvironmentColors, isExpiringSoon } from './core';
export * from './presets';

export function SecretVault(props: SecretVaultProps): React.ReactElement {
  const preset = props.preset ?? SECRET_VAULT_DEFAULTS.preset ?? 'vault';
  const PresetComponent = SECRET_VAULT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

SecretVault.displayName = 'SecretVault';
export { VaultSecretVault, EnvEditorSecretVault } from './presets';
