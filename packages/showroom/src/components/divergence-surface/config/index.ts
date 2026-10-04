import type { TenantConfig } from '@rottay/design-system';

import { DIVERGENCE_FIXTURES, type DivergenceFixtureId } from '../fixtures';

export type DivergenceRoute = 'dashboard' | 'list' | 'detail';
export type DivergenceGround = 'light' | 'dark';

export const DIVERGENCE_ROUTES: readonly DivergenceRoute[] = ['dashboard', 'list', 'detail'];

/** The provider's tenant config: identity and bounded branding, nothing visual. */
export function divergenceTenantConfig(fixture: DivergenceFixtureId, ground: DivergenceGround): TenantConfig {
  const spec = DIVERGENCE_FIXTURES[fixture];
  return {
    slug: spec.identity.slug,
    name: spec.displayName,
    vertical: 'bithire',
    theme: ground,
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: spec.displayName },
  };
}
