/**
 * @fileoverview Host-tenancy boundary guardrails.
 * Verifies the tenant registry contract and bundled CSS artifacts.
 *
 * 1. Only first-party vertical baselines are recognized by `isKnownTenant()`.
 * 2. Arbitrary slugs are rejected.
 * 3. Every slug in `BUNDLED_TENANT_SLUGS` has a corresponding CSS file on disk
 *    at the conventional `foundation/tokens/css/facade/artifacts/<slug>/index.css` path. This is
 *    derived directly from the live set, not a hand-maintained parallel list,
 *    so a slug cannot sit in `BUNDLED_TENANT_SLUGS` promising a bundle that
 *    does not exist on disk.
 *
 * This test reads source files and imports registry helpers -- no rendering.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  isKnownTenant,
  isBundledTenant,
  BUNDLED_TENANT_SLUGS,
  getKnownTenantSlugs,
} from '../../../../infrastructure/runtime/tenant/foundation/configuration/registry';

const SRC_ROOT = join(process.cwd(), 'src');

// ---------------------------------------------------------------------------
// Registry correctness
// ---------------------------------------------------------------------------

describe('tenant registry', () => {
  it('recognizes rottay as a known tenant', () => {
    expect(isKnownTenant('rottay')).toBe(true);
  });

  it('recognizes bithire as a known tenant', () => {
    expect(isKnownTenant('bithire')).toBe(true);
  });

  it('recognizes evnto as a known tenant', () => {
    expect(isKnownTenant('evnto')).toBe(true);
  });

  it('does not auto-register the DB-owned themanagementmiami tenant', () => {
    expect(isKnownTenant('themanagementmiami')).toBe(false);
  });

  it('rejects an arbitrary slug', () => {
    expect(isKnownTenant('random-corp')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isKnownTenant('Rottay')).toBe(true);
    expect(isKnownTenant('BITHIRE')).toBe(true);
  });

  it('returns exactly the three file-owned vertical baselines', () => {
    const slugs = getKnownTenantSlugs();
    expect(new Set(slugs)).toEqual(new Set(['rottay', 'bithire', 'evnto']));
  });

  it('themanagementmiami is neither known nor bundled and must arrive as an explicit DB config', () => {
    expect(isKnownTenant('themanagementmiami')).toBe(false);
    expect(isBundledTenant('themanagementmiami')).toBe(false);
    expect(BUNDLED_TENANT_SLUGS.has('themanagementmiami')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Bundled CSS artifacts exist on disk
// ---------------------------------------------------------------------------

describe('bundled tenant CSS artifacts', () => {
  it('BUNDLED_TENANT_SLUGS contains exactly the expected slugs', () => {
    expect(new Set(BUNDLED_TENANT_SLUGS)).toEqual(new Set(['rottay', 'bithire', 'evnto']));
  });

  // Derived directly from the live set: a future slug added to
  // BUNDLED_TENANT_SLUGS without a matching artifact fails here immediately,
  // instead of shipping a bundled-tenant promise the CSS output cannot keep.
  for (const slug of BUNDLED_TENANT_SLUGS) {
    it(`${slug} CSS artifact exists at foundation/tokens/css/facade/artifacts/${slug}/index.css`, () => {
      const absolutePath = join(SRC_ROOT, 'foundation/tokens/css/facade/artifacts', slug, 'index.css');
      expect(existsSync(absolutePath)).toBe(true);
    });
  }

  it('themanagementmiami has no legacy CSS artifact that can override its DB artifact', () => {
    const legacyPath = join(SRC_ROOT, 'foundation/tokens/css/facade/legacy/themanagementmiami/index.css');
    expect(existsSync(legacyPath)).toBe(false);
  });
});
