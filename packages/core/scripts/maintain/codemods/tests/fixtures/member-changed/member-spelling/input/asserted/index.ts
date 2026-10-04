import type { TenantConfig } from '@rottay/design-system';

// The typecheck passes: an assertion suppresses the excess-property check.
export const config = {
  slug: 'acme',
  name: 'Acme',
  engine: 'modern',
  theme: 'light',
  plan: 'enterprise',
  features: ['*'],
  branding: { companyName: 'Acme' },
} as TenantConfig;
