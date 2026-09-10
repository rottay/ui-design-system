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
import { FIRST_PARTY_VERTICAL_SLUGS } from '@/foundation/contracts/kernel/verticals';
import { staticThemeIntent } from '@/infrastructure/compilers/runtime/theme';
import { mountTenantTheme } from '@/infrastructure/runtime/theming/composition/mount';
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
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(rottay))?.recipeProfile)
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

  /**
   * REGISTRY-FED AND ARTIFACT-FED ARE THE SAME DECISION, proven per vertical.
   *
   * A code-owned vertical has no `<style>` to admit -- its artifact ships
   * inside `styles.css` -- so the provider cannot read its profile off a
   * mounted element the way the DB path does. What it reads instead is the
   * registry's projection of the same authored theme. That is only honest if
   * the two are the same decision, and "the same decision" is a claim about
   * two compilers, not a comment. So this asserts the identity directly, for
   * every first-party vertical: the id the registry publishes to
   * `RecipeProfileProvider`, the id the artifact compile produced, and the id
   * `mountTenantTheme` stamps as `data-recipe-profile` are one string.
   *
   * If they ever diverge, the product and the stylesheet disagree about which
   * recipes are active, which is exactly F-112 pointing the other way.
   */
  it('publishes the same profile the mounted artifact compiled, per vertical', async () => {
    expect(FIRST_PARTY_VERTICAL_SLUGS.length).toBeGreaterThan(1);
    const declared: string[] = [];

    for (const slug of FIRST_PARTY_VERTICAL_SLUGS) {
      const config = getKnownTenantConfig(slug)!;
      const fromRegistry = getCodeOwnedGovernedBehavior(
        getCodeOwnedRuntimeConfig(config),
      )?.recipeProfile;

      const mounted = await mountTenantTheme(staticThemeIntent(slug, slug));
      const fromArtifact = mounted.rootAttributes['data-recipe-profile'];

      // Absent on BOTH sides is a legitimate answer -- a vertical need not
      // select a profile, and `evnto` does not -- but it must be absent on both.
      expect(fromRegistry, `${slug} registry profile`).toBe(fromArtifact);
      if (fromRegistry) declared.push(`${slug}:${fromRegistry}`);
    }

    // Anti-cheat: an all-undefined roster would satisfy the identity above for
    // free, so at least two verticals must declare, and declare DIFFERENTLY.
    expect(declared.length).toBeGreaterThanOrEqual(2);
    expect(new Set(declared.map((row) => row.split(':')[1])).size).toBeGreaterThanOrEqual(2);
  });

  it('gives two code-owned verticals the two different profiles they authored', () => {
    const bithire = getKnownTenantConfig('bithire')!;
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(bithire))?.recipeProfile)
      .toBe('rottay/network-professional@1');
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(getKnownTenantConfig('rottay')!))?.recipeProfile)
      .not.toBe('rottay/network-professional@1');
  });

  /**
   * The same two verticals, RENDERED. The registry assertion above proves the
   * ids differ; a difference that never reaches a component is the defect this
   * WO exists to close, so the button each vertical produces is compared
   * directly. `technical-sharp` declares `{ size: 'sm', variant: 'outline' }`
   * and `network-professional` declares a filled default-shaped primary, so the
   * two surfaces must not be attribute-identical.
   */
  it('renders bithire and rottay as two visibly different buttons', () => {
    const buttonPosture = (slug: 'rottay' | 'bithire'): Record<string, string | null> => {
      const view = render(
        <DesignSystemProvider
          tenantConfig={getKnownTenantConfig(slug)!}
          vertical={slug}
          forceEngine="modern"
        >
          <ProfileProbe />
        </DesignSystemProvider>,
      );
      const button = screen.getByRole('button');
      const posture = {
        profile: screen.getByTestId('active-recipe-profile').textContent,
        size: button.getAttribute('data-size'),
        variant: button.getAttribute('data-variant'),
        shape: button.getAttribute('data-shape'),
      };
      view.unmount();
      return posture;
    };

    const rottay = buttonPosture('rottay');
    const bithire = buttonPosture('bithire');

    expect(rottay.profile).toBe('rottay/technical-sharp@1');
    expect(bithire.profile).toBe('rottay/network-professional@1');
    expect(bithire).not.toEqual(rottay);
    expect(bithire.variant).toBe('primary');
    expect(bithire.shape).toBe('default');
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
