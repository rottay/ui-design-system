import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// WHICH SIDE IS THE SOURCE OF TRUTH: the ARTIFACT, not the authored theme.
//
// F-12's own arm (D-26) says the recipe profile travels in the artifact only.
// For a code-owned vertical both readings derive from one preset document, so
// they normally agree -- and agreement is exactly what hides which one the
// runtime is actually reading. The only way to state the direction is to make
// them DISAGREE: the artifact's shipped runtime block is made to say
// `editorial-round` while `bithire`'s preset document still selects
// `technical-sharp`, and the product must follow the artifact.
//
// The mount refuses this same disagreement on the server (see
// mount/tests/tampered-runtime-block.test.ts), so in production the two can
// never diverge unseen. This file is about direction, not tolerance.
// ---------------------------------------------------------------------------

const ARTIFACT_SAYS = 'rottay/editorial-round@1';
const PRESET_SAYS = 'rottay/technical-sharp@1';

vi.mock('@/infrastructure/compilers/runtime/tenant-css/artifact-runtime', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/infrastructure/compilers/runtime/tenant-css/artifact-runtime')
  >();
  return {
    ...actual,
    firstPartyArtifactRecipeProfile: (vertical: string) =>
      vertical === 'bithire' ? ARTIFACT_SAYS : actual.firstPartyArtifactRecipeProfile(vertical),
  };
});

describe('DesignSystemProvider recipe profile — artifact over the preset selection', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('publishes what the artifact block says, not what the preset selected', async () => {
    const { VERTICAL_THEME_PRESETS } = await import('@/foundation/presets/verticals');
    const { useRecipeProfile } = await import('@/infrastructure/runtime/foundation/recipes/profiles');
    const { getKnownTenantConfig } = await import(
      '@/infrastructure/runtime/tenant/foundation/configuration/registry'
    );
    const ModernButton = (await import('@/components/primitives/inputs/button/engines/modern'))
      .default;
    const { DesignSystemProvider } = await import('..');

    // The disagreement is real only if the preset still selects the other
    // thing. Reading it here is the anti-cheat for the whole file.
    expect(JSON.stringify(VERTICAL_THEME_PRESETS.bithire.document)).toContain(
      `"recipe-profile":${JSON.stringify(PRESET_SAYS)}`,
    );
    expect(ARTIFACT_SAYS).not.toBe(PRESET_SAYS);

    function Probe() {
      const profile = useRecipeProfile();
      return (
        <>
          <output data-testid="active-recipe-profile">{profile?.id ?? 'engine-defaults'}</output>
          <ModernButton>Action</ModernButton>
        </>
      );
    }

    render(
      <DesignSystemProvider
        tenantConfig={getKnownTenantConfig('bithire')!}
        vertical="bithire"
        forceEngine="modern"
      >
        <Probe />
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId('active-recipe-profile')).toHaveTextContent(ARTIFACT_SAYS);
    // A published id that moves nothing is not evidence. `editorial-round`
    // declares a round button; `technical-sharp` declares a small outline one,
    // so the rendered posture names which selection won.
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-shape', 'round');
    expect(button).not.toHaveAttribute('data-variant', 'outline');
  });
});
