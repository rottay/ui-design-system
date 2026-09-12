import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { FIRST_PARTY_VERTICAL_SLUGS } from '@/foundation/contracts/kernel/verticals';
import {
  FIRST_PARTY_ARTIFACT_RUNTIME,
  firstPartyArtifactRecipeProfile,
} from '..';

// ---------------------------------------------------------------------------
// The generated runtime block is the artifact's own half, and this is where
// that claim is BYTE-BOUND rather than asserted.
//
// A code-owned vertical publishes its recipe selection twice out of one
// compile: as the `--ds-recipe-profile` provenance channel inside the bundled
// stylesheet, and as this module's runtime block, which is what React reads
// because a selection is not paint. The two are the same compile's two halves,
// so the value the document was painted with and the value the product
// resolves recipes from must be one string -- read out of the shipped CSS file
// here, not recomputed from the authored theme.
// ---------------------------------------------------------------------------

const ARTIFACT_ROOT = resolve(
  __dirname,
  '../../../../../../foundation/tokens/css/facade/artifacts',
);

/** The provenance channel the recipes deriver emitted into the shipped bytes. */
function recipeProfileInArtifactBytes(slug: string): string | undefined {
  const css = readFileSync(resolve(ARTIFACT_ROOT, slug, 'index.css'), 'utf8');
  const declarations = [...css.matchAll(/--ds-recipe-profile:\s*"([^"]+)"\s*;/g)].map(
    (match) => match[1] as string,
  );
  const unique = new Set(declarations);
  expect(unique.size, `${slug} declares more than one recipe profile`).toBeLessThan(2);
  return declarations[0];
}

describe('first-party artifact runtime block', () => {
  it('states the profile the shipped artifact bytes declare, per vertical', () => {
    const declared: string[] = [];

    for (const slug of FIRST_PARTY_VERTICAL_SLUGS) {
      const fromBytes = recipeProfileInArtifactBytes(slug);
      // Absent on BOTH sides is a legitimate answer -- a vertical need not
      // select a profile -- but it must be absent on both.
      expect(firstPartyArtifactRecipeProfile(slug), `${slug} runtime block`).toBe(fromBytes);
      if (fromBytes) declared.push(`${slug}:${fromBytes}`);
    }

    // Anti-cheat: an all-undefined roster would satisfy the identity above for
    // free, so at least two verticals must declare, and declare DIFFERENTLY.
    expect(declared.length).toBeGreaterThanOrEqual(2);
    expect(new Set(declared.map((row) => row.split(':')[1])).size).toBeGreaterThanOrEqual(2);
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
