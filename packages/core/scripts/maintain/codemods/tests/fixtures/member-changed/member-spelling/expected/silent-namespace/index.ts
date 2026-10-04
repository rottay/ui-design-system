import type * as DS from '@rottay/design-system';

export function slugOf(config: DS.TenantConfig, other: import('@rottay/design-system').TenantConfig) {
  return `${config.slug}/${other.slug}`;
}
