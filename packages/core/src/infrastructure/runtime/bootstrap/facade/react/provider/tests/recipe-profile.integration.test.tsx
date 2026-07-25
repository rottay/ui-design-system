/**
 * DS-S001 production-provider proof.
 *
 * Static first-party BrandTheme selection and DB-owned Appearance selection
 * must reach the same runtime context. DB appearance is the later authority
 * in the documented merge chain, while malformed selections fail closed.
 */
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import { useRecipeProfile } from '@/infrastructure/runtime/foundation/recipes/profiles';
import ModernButton from '@/ui/primitives/inputs/Button/engines/modern';
import { DesignSystemProvider } from '..';

afterEach(cleanup);

function tenantConfig(
  overrides: Partial<TenantConfig> = {},
): TenantConfig {
  return {
    slug: 'recipe-profile-proof',
    name: 'Recipe profile proof',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Recipe profile proof' },
    ...overrides,
  };
}

function ProfileProbe() {
  const profile = useRecipeProfile();
  return (
    <>
      <output data-testid="active-recipe-profile">
        {profile?.id ?? 'engine-defaults'}
      </output>
      <ModernButton>Action</ModernButton>
    </>
  );
}

function renderConfig(config: TenantConfig) {
  return render(
    <DesignSystemProvider tenantConfig={config} skipCssLoading>
      <ProfileProbe />
    </DesignSystemProvider>,
  );
}

describe('DesignSystemProvider recipe-profile authority', () => {
  it('mounts a static BrandTheme selection in the production provider', async () => {
    const view = renderConfig(
      tenantConfig({
        brandTheme: {
          id: 'static-technical',
          name: 'Static technical',
          recipes: {
            schemaVersion: 1,
            profile: 'rottay/technical-sharp@1',
          },
        },
      }),
    );

    expect(
      await view.findByTestId('active-recipe-profile'),
    ).toHaveTextContent('rottay/technical-sharp@1');
    const button = await view.findByRole('button');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-shape', 'default');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('mounts DB Appearance and lets it override the static selection', async () => {
    const view = renderConfig(
      tenantConfig({
        brandTheme: {
          id: 'static-technical',
          name: 'Static technical',
          recipes: {
            schemaVersion: 1,
            profile: 'rottay/technical-sharp@1',
          },
        },
        appearance: {
          recipeProfile: 'rottay/editorial-round@1',
        },
      }),
    );

    expect(
      await view.findByTestId('active-recipe-profile'),
    ).toHaveTextContent('rottay/editorial-round@1');
    const button = await view.findByRole('button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-shape', 'round');
    expect(button).toHaveAttribute('data-size', 'lg');
  });

  it('fails closed for an invalid DB selection', async () => {
    const view = renderConfig(
      tenantConfig({
        appearance: { recipeProfile: 'foreign/not-published@9' },
      }),
    );

    await waitFor(() =>
      expect(view.getByTestId('active-recipe-profile')).toHaveTextContent(
        'engine-defaults',
      ),
    );
    expect(await view.findByRole('button')).toHaveAttribute(
      'data-variant',
      'primary',
    );
  });
});
