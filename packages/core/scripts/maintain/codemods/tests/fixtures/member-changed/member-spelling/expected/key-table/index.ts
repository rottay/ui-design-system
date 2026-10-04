import type { TenantConfig } from '@rottay/design-system';

export const REMOVED = ['personality'] as const;

export function strip(config: TenantConfig) {
  return Object.fromEntries(Object.entries(config).filter(([key]) => !(REMOVED as readonly string[]).includes(key)));
}
