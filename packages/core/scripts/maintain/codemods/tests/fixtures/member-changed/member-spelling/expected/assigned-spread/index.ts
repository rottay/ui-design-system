import type { TenantConfig } from '@rottay/design-system';

// The arguments are not listed in the call, so what they carry is not written in this file.
export function merge(parts: object[]): TenantConfig {
  return Object.assign({ slug: 'acme' }, ...parts);
}
