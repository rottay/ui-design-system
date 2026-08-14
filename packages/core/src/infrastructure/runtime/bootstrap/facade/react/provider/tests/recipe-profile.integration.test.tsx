import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TenantConfig } from '@/foundation/contracts/composition/tenants';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import { useRecipeProfile } from '@/infrastructure/runtime/foundation/recipes/profiles';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  resetVisualAuthorityDiagnostics,
} from '@/infrastructure/runtime/theming';
import ModernButton from '@/ui/primitives/inputs/Button/engines/modern';
import { DesignSystemProvider } from '..';

const ARTIFACT = compileTenantThemeConfig(
  hydrateTenantThemeConfig({
    schemaVersion: 1,
    mode: 'advanced',
    visualFoundation: {
      general: {},
      advanced: {},
      recipeProfile: 'rottay/editorial-round@1',
    },
  }, {
    tenantId: 'tenant_recipe_profile',
    slug: 'recipe-profile-proof',
    verticalKey: 'rottay',
    rowVersion: 1,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('rottay') },
);

function tenantConfig(overrides: Partial<TenantConfig> = {}): TenantConfig {
  return {
    slug: ARTIFACT.slug,
    name: 'Recipe profile proof',
    theme: 'base',
    plan: 'enterprise',
    features: [],
    branding: { companyName: 'Recipe profile proof' },
    appearance: ARTIFACT.normalizedAppearance,
    ...overrides,
  } as TenantConfig;
}

function mountArtifact(artifact: TenantThemeArtifact): void {
  const style = document.createElement('style');
  style.id = 'recipe-profile-artifact';
  style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, artifact.digest);
  style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, artifact.slug);
  style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, artifact.verticalKey);
  style.textContent = artifact.css;
  document.head.appendChild(style);
}

function ProfileProbe() {
  const profile = useRecipeProfile();
  return (
    <>
      <output data-testid="active-recipe-profile">{profile?.id ?? 'engine-defaults'}</output>
      <ModernButton>Action</ModernButton>
    </>
  );
}

describe('DesignSystemProvider recipe-profile authority', () => {
  beforeEach(() => {
    resetVisualAuthorityDiagnostics();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    resetVisualAuthorityDiagnostics();
    document.getElementById('recipe-profile-artifact')?.remove();
  });

  it('reads the recipe selection only from the verified mounted artifact', () => {
    mountArtifact(ARTIFACT);
    render(
      <DesignSystemProvider
        tenantConfig={tenantConfig()}
        visualAuthority={{ authority: 'compiled-artifact', artifact: ARTIFACT }}
        vertical="rottay"
        forceEngine="modern"
      >
        <ProfileProbe />
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId('active-recipe-profile'))
      .toHaveTextContent('rottay/editorial-round@1');
    expect(screen.getByRole('button')).toHaveAttribute('data-shape', 'round');
  });

  it('blocks an uncompiled runtime brandTheme before the recipe consumer mounts', () => {
    render(
      <DesignSystemProvider tenantConfig={tenantConfig({
        appearance: undefined,
        brandTheme: {
          id: 'runtime-technical',
          name: 'Runtime technical',
          recipes: { schemaVersion: 1, profile: 'rottay/technical-sharp@1' },
        },
      })}>
        <ProfileProbe />
      </DesignSystemProvider>,
    );
    expect(screen.queryByTestId('active-recipe-profile')).toBeNull();
  });
});
