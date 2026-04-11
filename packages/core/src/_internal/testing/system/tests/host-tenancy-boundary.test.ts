/**
 * @fileoverview Host-tenancy boundary guardrails.
 * Verifies the tenant registry contract and bundled CSS artifacts.
 *
 * 1. All first-party tenants are recognized by `isKnownTenant()`.
 * 2. Arbitrary slugs are rejected.
 * 3. Every slug in `BUNDLED_TENANT_SLUGS` has a corresponding CSS file on disk.
 *
 * This test reads source files and imports registry helpers -- no rendering.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  isKnownTenant,
  BUNDLED_TENANT_SLUGS,
  getKnownTenantSlugs,
} from '../../../../runtime/tenant/registry';

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

  it('rejects an arbitrary slug', () => {
    expect(isKnownTenant('random-corp')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isKnownTenant('Rottay')).toBe(true);
    expect(isKnownTenant('BITHIRE')).toBe(true);
  });

  it('returns at least the three first-party slugs', () => {
    const slugs = getKnownTenantSlugs();
    expect(slugs).toContain('rottay');
    expect(slugs).toContain('bithire');
    expect(slugs).toContain('evnto');
  });
});

// ---------------------------------------------------------------------------
// Bundled CSS artifacts exist on disk
// ---------------------------------------------------------------------------

/**
 * Map from bundled slug to the expected CSS artifact path (relative to src/).
 * First-party verticals use `tokens/css/artifacts/{slug}/index.css`.
 * Legacy customer tenants use `tokens/css/legacy/{slug}/index.css`.
 */
const ARTIFACT_PATHS: Record<string, string> = {
  rottay: 'tokens/css/artifacts/rottay/index.css',
  bithire: 'tokens/css/artifacts/bithire/index.css',
  evnto: 'tokens/css/artifacts/evnto/index.css',
  themanagementmiami: 'tokens/css/legacy/themanagementmiami/index.css',
};

describe('bundled tenant CSS artifacts', () => {
  it('BUNDLED_TENANT_SLUGS contains exactly the expected slugs', () => {
    const expected = new Set(Object.keys(ARTIFACT_PATHS));
    expect(new Set(BUNDLED_TENANT_SLUGS)).toEqual(expected);
  });

  for (const [slug, relativePath] of Object.entries(ARTIFACT_PATHS)) {
    it(`${slug} CSS artifact exists at ${relativePath}`, () => {
      const absolutePath = join(SRC_ROOT, relativePath);
      expect(existsSync(absolutePath)).toBe(true);
    });
  }
});
