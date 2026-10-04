import type { TenantConfig } from '@rottay/design-system';

// `engine` and `appearance` were removed from the type; this file names them only in this comment.
export interface StageProps {
  config: TenantConfig;
}

export function copyOf(config: TenantConfig): TenantConfig {
  const next: TenantConfig = { slug: config.slug, name: `${config.name} (copy)`, theme: config.theme, plan: config.plan, features: [], branding: config.branding };
  return { slug: next.slug, name: next.name, theme: next.theme, plan: next.plan, features: [], branding: next.branding } as TenantConfig;
}
