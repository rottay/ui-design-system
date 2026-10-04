import type { TenantConfig } from '@rottay/design-system';

export function appearanceOf(config: TenantConfig) {
  return (config as unknown as Record<string, unknown>)[`appearance`];
}
