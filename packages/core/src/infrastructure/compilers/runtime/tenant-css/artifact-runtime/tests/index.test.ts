import { describe, expect, it } from 'vitest';

import { FIRST_PARTY_VERTICAL_SLUGS } from '@/foundation/contracts/kernel/verticals';
import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';
import { compileThemeIntent } from '@/infrastructure/compilers/runtime/theme';
import { staticThemeIntent } from '@/infrastructure/compilers/runtime/theme/runtime/ingress';
import {
  FIRST_PARTY_ARTIFACT_RUNTIME,
  firstPartyArtifactRecipeProfile,
} from '..';

// ---------------------------------------------------------------------------
// The generated runtime block is the artifact's own half, and this is where
// that claim is BOUND to the compile rather than asserted.
//
// A code-owned vertical publishes its recipe selection once, as data: the
// compile's runtime payload, which this module's runtime block ships and which
// React reads, because a selection is not paint. The stylesheet carries no
// selection channel, so the value the product resolves recipes from must be
// the value the same compile computes today -- recomputed from the neutral
// foundation and the vertical's preset here, through the published door, and
// compared to the shipped block.
// ---------------------------------------------------------------------------

/** The selection the current pipeline computes for a first-party vertical, and proof the stylesheet carries none. */
function recipeProfileInArtifactBytes(slug: FirstPartyVerticalId): string | undefined {
  const { compiled } = compileThemeIntent(staticThemeIntent(slug), {
    baselineSource: 'neutral-preset',
  });
  expect(compiled.cssVariables['--ds-recipe-profile'], `${slug} emits no selection channel`).toBeUndefined();
  return compiled.runtime.recipeProfile;
}

describe('first-party artifact runtime block', () => {
  it('states the profile the current compile computes, per vertical', () => {
    const declared: string[] = [];

    for (const slug of FIRST_PARTY_VERTICAL_SLUGS) {
      const fromBytes = recipeProfileInArtifactBytes(slug);
      // Absent on BOTH sides is a legitimate answer -- a vertical need not
      // select a profile -- but it must be absent on both.
      expect(firstPartyArtifactRecipeProfile(slug), `${slug} runtime block`).toBe(fromBytes);
      if (fromBytes) declared.push(`${slug}:${fromBytes}`);
    }

    // Anti-cheat: an all-undefined roster would satisfy the identity above for
    // free, and so would a block that mirrored one constant. The presets decide
    // differently -- one selects a profile, the structural-neutral ones select
    // none -- so both branches of the identity are exercised.
    expect(declared.length).toBeGreaterThanOrEqual(1);
    expect(declared.length).toBeLessThan(FIRST_PARTY_VERTICAL_SLUGS.length);
  });

  it('covers the roster exactly, and resolves nothing for a foreign slug', () => {
    expect(Object.keys(FIRST_PARTY_ARTIFACT_RUNTIME).sort())
      .toEqual([...FIRST_PARTY_VERTICAL_SLUGS].sort());
    expect(firstPartyArtifactRecipeProfile('themanagementmiami')).toBeUndefined();
    expect(firstPartyArtifactRecipeProfile('')).toBeUndefined();
  });

  it('is frozen, so no importer can restate another vertical\'s selection', () => {
    expect(Object.isFrozen(FIRST_PARTY_ARTIFACT_RUNTIME)).toBe(true);
    for (const block of Object.values(FIRST_PARTY_ARTIFACT_RUNTIME)) {
      expect(Object.isFrozen(block)).toBe(true);
    }
  });
});
