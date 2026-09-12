import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// THE GOVERNED SELECTION, TAMPERED AFTER THE COMPILE.
//
// A code-owned vertical's recipe selection travels to React in the generated
// runtime block, because a selection is not paint and its stylesheet ships
// inside the package. That block is therefore the one place where a value the
// compile never produced could be introduced -- by a stale regeneration or by
// a hand edit -- and a client resolving recipes the document was not painted
// for is exactly the divergence D-26 forbids.
//
// The mount holds the compile in its hand on every server render, so it is
// where the two answers meet. Here the shipped block is made to disagree with
// it, and the mount must refuse BY NAME rather than hand back a projection
// whose attribute and whose bytes state different profiles.
//
// The module graph is loaded AFTER the mock, and this file is separate from the
// positive drills, because the mount caches one compile per vertical per
// process: a refusal that only happens on a cold cache is not a refusal.
// ---------------------------------------------------------------------------

const TAMPERED = 'rottay/editorial-round@1';

vi.mock('@/infrastructure/compilers/runtime/tenant-css/artifact-runtime', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/infrastructure/compilers/runtime/tenant-css/artifact-runtime')
  >();
  return {
    ...actual,
    firstPartyArtifactRecipeProfile: (vertical: string) =>
      vertical === 'rottay' ? TAMPERED : actual.firstPartyArtifactRecipeProfile(vertical),
  };
});

describe('mountTenantTheme — a shipped runtime block that outran its compile', () => {
  it('refuses the static mount by name instead of projecting the tampered profile', async () => {
    const { staticThemeIntent } = await import('@/infrastructure/compilers/runtime/theme');
    const { mountTenantTheme } = await import('..');

    await expect(mountTenantTheme(staticThemeIntent('rottay'))).rejects.toThrow(
      /shipped runtime block for "rottay" declares recipe profile "rottay\/editorial-round@1", but its artifact compiled "rottay\/technical-sharp@1"/,
    );
  });

  it('leaves a vertical whose block still matches its compile mountable', async () => {
    const { staticThemeIntent } = await import('@/infrastructure/compilers/runtime/theme');
    const { mountTenantTheme } = await import('..');

    const mounted = await mountTenantTheme(staticThemeIntent('bithire'));
    expect(mounted.rootAttributes['data-recipe-profile']).toBe(
      'rottay/network-professional@1',
    );
  });
});
