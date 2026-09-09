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
import ModernButton from '@/components/primitives/inputs/button/engines/modern';
import {
  getCodeOwnedGovernedBehavior,
  getCodeOwnedRuntimeConfig,
  getKnownTenantConfig,
} from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { DesignSystemProvider } from '..';
import { stampTenantThemeScope } from '@/infrastructure/runtime/theming/foundation/visual-authority/tests/mount-fixture';

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
  stampTenantThemeScope(artifact);
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

  it('reaches a CODE-OWNED vertical, whose profile had no runtime channel at all', () => {
    // F-112. The runtime projection strips `appearance` to keep static CSS the
    // sole visual emitter, and the provider read the profile only from there —
    // so `rottay` (technical-sharp) and `bithire` (network-professional) were
    // indistinguishable in the product. The selection now travels on the
    // identity-keyed governed-behavior slot, which is not paint and cannot be
    // forged by a caller-built config.
    const rottay = getKnownTenantConfig('rottay')!;
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(rottay)).recipeProfile)
      .toBe('rottay/technical-sharp@1');

    render(
      <DesignSystemProvider tenantConfig={rottay} vertical="rottay" forceEngine="modern">
        <ProfileProbe />
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId('active-recipe-profile'))
      .toHaveTextContent('rottay/technical-sharp@1');
    // The profile is only real if it MOVES a component. `technical-sharp`
    // declares `button: { size: 'sm', variant: 'outline' }`; the engine default
    // is a medium primary, so both attributes are evidence rather than a
    // coincidence of defaults.
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-variant', 'outline');
  });

  it('gives two code-owned verticals the two different profiles they authored', () => {
    const bithire = getKnownTenantConfig('bithire')!;
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(bithire)).recipeProfile)
      .toBe('rottay/network-professional@1');
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(getKnownTenantConfig('rottay')!)).recipeProfile)
      .not.toBe('rottay/network-professional@1');
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
