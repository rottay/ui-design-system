import type { TenantConfig } from '@rottay/design-system';

export function overridesOf(config: TenantConfig) {
  return (config as unknown as Record<string, unknown>)['tokenOverrides'];
}
