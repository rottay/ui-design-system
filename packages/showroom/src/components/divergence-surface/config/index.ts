import type { TenantConfig } from '@rottay/design-system';

import { DIVERGENCE_FIXTURES, type DivergenceFixtureId } from '../fixtures';

export type DivergenceRoute = 'dashboard' | 'list' | 'detail';
export type DivergenceGround = 'light' | 'dark';

export const DIVERGENCE_ROUTES: readonly DivergenceRoute[] = ['dashboard', 'list', 'detail'];

/** The provider's tenant config, exactly as the surface has always handed it: no appearance echo. */
export function divergenceTenantConfig(fixture: DivergenceFixtureId, ground: DivergenceGround): TenantConfig {
  const spec = DIVERGENCE_FIXTURES[fixture];
  return {
    slug: spec.identity.slug,
    name: spec.displayName,
    vertical: 'bithire',
    engine: 'modern',
    theme: ground,
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: spec.displayName },
  } as TenantConfig;
}
