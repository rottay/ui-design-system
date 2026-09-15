import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
import { firstPartyArtifactRecipeProfile } from '@/infrastructure/compilers/runtime/tenant-css/artifact-runtime';
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

const SRC_ROOT = resolve(__dirname, '../../../../../../..');

/** The selection the shipped artifact carries in its own runtime block; the stylesheet carries none. */
function recipeProfileInArtifactBytes(slug: string): string | undefined {
  return firstPartyArtifactRecipeProfile(slug as never);
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
  let reported: string[];

  beforeEach(() => {
    resetVisualAuthorityDiagnostics();
    reported = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      reported.push(args.map(String).join(' '));
    });
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
    // F-112. A `TenantConfig` carries no appearance, and the provider read the
    // profile only from one — so `rottay` (technical-sharp) and `bithire`
    // (network-professional) were indistinguishable in the product. The
    // selection now travels on the identity-keyed governed-behavior slot, which
    // is not paint and cannot be forged by a caller-built config; what it
    // carries is the vertical's own ARTIFACT block, byte-bound below.
    // D6-2c-ii: the profile is a preset decision and bithire is the vertical
    // whose document decides one, so it is the subject of this reading now.
    const codeOwned = getKnownTenantConfig('bithire')!;
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(codeOwned))?.recipeProfile)
      .toBe(recipeProfileInArtifactBytes('bithire'));

    render(
      <DesignSystemProvider tenantConfig={codeOwned} vertical="bithire" forceEngine="modern">
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
   * ONE DECISION, FOUR READINGS, proven per vertical against the BYTES.
   *
   * A code-owned vertical has no `<style>` to admit -- its artifact ships
   * inside `styles.css` -- so the provider cannot read its profile off a
   * mounted element the way the DB path does. What it reads instead is the
   * artifact's own generated runtime block: the non-CSS half of the very
   * compile that wrote the stylesheet. That is only honest if every reading is
   * the same string, and "the same string" is a claim about two build outputs,
   * not a comment.
   *
   * So this asserts the identity directly, for every first-party vertical:
   * the shipped runtime block, the id the registry hands `RecipeProfileProvider`,
   * and the id `mountTenantTheme` stamps as `data-recipe-profile` are one value.
   *
   * If they ever diverge, the product and the stylesheet disagree about which
   * recipes are active, which is exactly F-112 pointing the other way.
   */
  it('publishes the profile the artifact BYTES declare, per vertical', async () => {
    expect(FIRST_PARTY_VERTICAL_SLUGS.length).toBeGreaterThan(1);
    const declared: string[] = [];

    for (const slug of FIRST_PARTY_VERTICAL_SLUGS) {
      const config = getKnownTenantConfig(slug)!;
      const fromRegistry = getCodeOwnedGovernedBehavior(
        getCodeOwnedRuntimeConfig(config),
      )?.recipeProfile;

      const mounted = await mountTenantTheme(staticThemeIntent(slug, slug));
      const fromMount = mounted.rootAttributes['data-recipe-profile'];
      const fromBytes = recipeProfileInArtifactBytes(slug);

      // Absent on ALL sides is a legitimate answer -- a vertical need not
      // select a profile, and `evnto` does not -- but it must be absent on all.
      expect(fromRegistry, `${slug} registry profile`).toBe(fromBytes);
      expect(fromMount, `${slug} mounted profile`).toBe(fromBytes);
      expect(firstPartyArtifactRecipeProfile(slug), `${slug} runtime block`).toBe(fromBytes);
      if (fromBytes) declared.push(`${slug}:${fromBytes}`);
    }

    // Anti-cheat: an all-undefined roster would satisfy the identity above for
    // free. Since D6-2c-ii a vertical's profile is a PRESET DECISION, and only
    // bithire's document decides one -- the retired authored themes gave rottay
    // and evnto theirs. The population is therefore pinned exactly rather than
    // counted: a vertical that starts or stops declaring reddens this row, and
    // it is stronger than the "at least two" it replaces.
    expect(declared).toEqual(['bithire:rottay/technical-sharp@1']);
  });

  it('gives two code-owned verticals the two different profiles their artifacts compiled', () => {
    const bithire = getKnownTenantConfig('bithire')!;
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(bithire))?.recipeProfile)
      .toBe(recipeProfileInArtifactBytes('bithire'));
    expect(getCodeOwnedGovernedBehavior(getCodeOwnedRuntimeConfig(getKnownTenantConfig('rottay')!))?.recipeProfile)
      .not.toBe(recipeProfileInArtifactBytes('bithire'));
  });

  /**
   * THE AUTHORED-SELECTION READ PATH IS GONE FROM THE RUNTIME.
   *
   * The registry used to answer "which profile did this vertical choose?" by
   * calling `validateRecipeProfileSelection(theme.recipes.profile, ...)` on the
   * authored FlatTheme -- an independently projected AUTHORED selection beside
   * the artifact's own compiled one. Two readers of one decision is exactly the
   * D-26 violation, and it cannot be closed by a comment: a source assertion is
   * what keeps the call from growing back.
   *
   * The validator itself stays exported and is still called where it belongs --
   * the lowering's recipes deriver, and admission -- so this names the runtime
   * registry, not the symbol.
   */
  it('has no authored-selection validator left in the tenant registry', () => {
    const registry = readFileSync(
      resolve(SRC_ROOT, 'infrastructure/runtime/tenant/foundation/configuration/registry/index.ts'),
      'utf8',
    );
    expect(registry).not.toMatch(/validateRecipeProfileSelection/);
    expect(registry).not.toMatch(/recipes\?\.profile/);
    // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset;
    // the registry reads the artifact's whole published runtime block rather
    // than one accessor per field, so the symbol that proves "the artifact is
    // the reader" moves: firstPartyArtifactRecipeProfile ->
    // FIRST_PARTY_ARTIFACT_RUNTIME. The assertion is unchanged in kind.
    expect(registry).toMatch(/FIRST_PARTY_ARTIFACT_RUNTIME/);
  });

  /**
   * The same two verticals, RENDERED. The registry assertion above proves the
   * ids differ; a difference that never reaches a component is the defect this
   * WO exists to close, so the button each vertical produces is compared
   * directly. `technical-sharp` declares `{ size: 'sm', variant: 'outline' }`
   * and `network-professional` declares a filled default-shaped primary, so the
   * two surfaces must not be attribute-identical.
   */
  it('renders a profiled vertical and a default one as two visibly different buttons', () => {
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

    // D6-2c-ii: only bithire's preset decides a recipe profile, so the pair the
    // product renders is now "a vertical WITH a profile" against "a vertical
    // on engine defaults". The property under test is unchanged and still
    // falsifiable: the selection has to MOVE the button, not merely be read.
    expect(bithire.profile).toBe('rottay/technical-sharp@1');
    expect(rottay.profile).toBe('engine-defaults');
    expect(bithire).not.toEqual(rottay);
    expect(bithire.size).toBe('sm');
    expect(bithire.variant).toBe('outline');
  });

  /**
   * A DB ARTIFACT WHOSE GOVERNED SELECTION WAS MOVED AFTER THE COMPILE.
   *
   * The profile appears twice inside one artifact: `normalizedAppearance`
   * carries the read-model of what the tenant decided, and `runtime` carries
   * what the compile that produced the CSS actually selected. Either can be
   * rewritten in transit, or by a row whose appearance was edited without a
   * recompile, and a runtime resolving recipes the document was never painted
   * for is the exact failure D-26 forbids.
   *
   * Both halves are inside the digest source, so neither edit survives
   * admission: the declaration is refused BY NAME and the recipe consumer never
   * mounts at all. The authored-side projection that used to stand behind this
   * path is gone, so there is nothing left to fall back to either.
   */
  it.each([
    [
      'the appearance read-model',
      (artifact: TenantThemeArtifact): TenantThemeArtifact => ({
        ...artifact,
        normalizedAppearance: {
          ...artifact.normalizedAppearance,
          recipeProfile: 'rottay/technical-sharp@1',
        },
      }),
    ],
    [
      'the compiled runtime half',
      (artifact: TenantThemeArtifact): TenantThemeArtifact => ({
        ...artifact,
        runtime: {
          ...artifact.runtime!,
          runtime: { ...artifact.runtime!.runtime, recipeProfile: 'rottay/technical-sharp@1' },
        },
      }),
    ],
  ])('refuses an artifact whose selection was tampered in %s', (_label, tamper) => {
    expect(ARTIFACT.normalizedAppearance.recipeProfile).toBe('rottay/editorial-round@1');
    expect(ARTIFACT.runtime?.runtime.recipeProfile).toBe('rottay/editorial-round@1');

    const tampered = tamper(ARTIFACT);
    mountArtifact(tampered);
    render(
      <DesignSystemProvider
        tenantConfig={tenantConfig()}
        visualAuthority={{ authority: 'compiled-artifact', artifact: tampered }}
        vertical="rottay"
        forceEngine="modern"
      >
        <ProfileProbe />
      </DesignSystemProvider>,
    );

    // Blocked, not silently re-resolved: no consumer mounted, so no recipe was
    // published from either half of the tampered artifact.
    expect(screen.queryByTestId('active-recipe-profile')).toBeNull();
    expect(reported.join(' | '))
      .toMatch(/artifact digest does not recompute from v1 source/);
  });

  /**
   * THE VERIFIED HALF OUTRANKS A HAND-PASSED CLAIM.
   *
   * `engineVisual` is an application's claim; the artifact's own `runtime` is a
   * record inside the digest the mount proof covers. When both are present and
   * they disagree, the runtime reads the verified one -- so an app that
   * published a projection compiled for a different theme cannot move which
   * recipes are active on a tenant whose bytes say otherwise.
   */
  it('resolves from the artifact half, not a contradicting published projection', () => {
    mountArtifact(ARTIFACT);
    render(
      <DesignSystemProvider
        tenantConfig={tenantConfig()}
        visualAuthority={{ authority: 'compiled-artifact', artifact: ARTIFACT }}
        engineVisual={{
          ...ARTIFACT.runtime!,
          runtime: {
            ...ARTIFACT.runtime!.runtime,
            recipeProfile: 'rottay/technical-sharp@1',
          },
        }}
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

  it('blocks an uncompiled runtime visual payload before the recipe consumer mounts', () => {
    // A `TenantConfig` carries no theme, appearance or recipe selection; its
    // bounded branding seeds are its one raw channel, and they are refused for
    // want of an artifact exactly as a theme is.
    render(
      <DesignSystemProvider tenantConfig={tenantConfig({
        branding: { companyName: 'Recipe profile proof', primaryColor: '#B3001B' },
      })}>
        <ProfileProbe />
      </DesignSystemProvider>,
    );
    expect(screen.queryByTestId('active-recipe-profile')).toBeNull();
  });
});
