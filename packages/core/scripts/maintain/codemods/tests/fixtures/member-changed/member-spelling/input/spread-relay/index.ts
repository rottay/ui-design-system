import type { TenantConfig } from '@rottay/design-system';

export function copyOf(config: TenantConfig): TenantConfig {
  return { ...config, name: `${config.name} (copy)` };
}
