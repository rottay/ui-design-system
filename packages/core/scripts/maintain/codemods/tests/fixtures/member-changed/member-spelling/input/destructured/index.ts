import type { TenantConfig } from '@rottay/design-system';

export function split(config: TenantConfig & Record<string, unknown>) {
  const { engine: legacyEngine, ...rest } = config;
  return { legacyEngine, rest };
}
