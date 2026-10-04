import type { TenantConfig } from '@rottay/design-system';

// A local that only shares the spelling. The kit infers no types, so it cannot tell and reports.
export function render(config: TenantConfig, engine: 'modern' | 'classic') {
  return `${config.slug}:${engine}`;
}
