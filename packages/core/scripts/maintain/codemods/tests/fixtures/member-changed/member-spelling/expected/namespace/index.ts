import type * as DS from '@rottay/design-system';

export function engineOf(config: DS.TenantConfig) {
  return (config as { engine?: string }).engine;
}
