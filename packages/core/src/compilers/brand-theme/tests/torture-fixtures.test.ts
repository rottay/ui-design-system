/**
 * Hostile-tenant whitelabel proof-fixture gate (WO-GAT-03).
 *
 * torture-dark and torture-light exist to make hardcoded (tenant-ignoring)
 * styling mechanically detectable: every probe channel they set is pushed to
 * a value that never matches the first-party theme it is compared against.
 * If a component reads a probe channel from the active tenant theme, the
 * torture render visibly diverges from the first-party render. If a
 * component hardcodes the value instead, the torture render looks identical
 * to the first-party render and the divergence never happens.
 *
 * This file verifies the fixtures themselves are fit for that purpose: they
 * compile without error, every probe variable actually moves relative to the
 * matching first-party theme, and the fixtures are not accidentally wired up
 * as real, artifact-generating tenants.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

import { compileBrandTheme } from '../index';
import {
  tortureDarkBrandTheme,
  tortureLightBrandTheme,
  TORTURE_PROBE_VARS,
  rottayBrandTheme,
  bithireBrandTheme,
} from '../../../tokens/ts/brand-themes';
import { getKnownTenantSlugs, isBundledTenant } from '../../../runtime/tenant/registry';
import { FIRST_PARTY_ARTIFACT_SPECS } from '../../../runtime/tenant/storage/static/generator';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));

describe('torture fixtures compile', () => {
  it('compiles torture-dark without throwing and scopes it to its tenant selector', () => {
    const compiled = compileBrandTheme({
      brandTheme: tortureDarkBrandTheme,
      tenantSlug: 'torture-dark',
      baseTheme: 'dark',
    });
    expect(Object.keys(compiled.cssVariables).length).toBeGreaterThan(0);
    expect(compiled.cssString).toContain("[data-tenant='torture-dark']");
  });

  it('compiles torture-light without throwing and scopes it to its tenant selector', () => {
    const compiled = compileBrandTheme({
      brandTheme: tortureLightBrandTheme,
      tenantSlug: 'torture-light',
      baseTheme: 'light',
    });
    expect(Object.keys(compiled.cssVariables).length).toBeGreaterThan(0);
    expect(compiled.cssString).toContain("[data-tenant='torture-light']");
  });
});

describe('torture fixtures are hostile (probe channels actually move)', () => {
  const compiledTortureDark = compileBrandTheme({
    brandTheme: tortureDarkBrandTheme,
    tenantSlug: 'torture-dark',
    baseTheme: 'dark',
  });
  const compiledTortureLight = compileBrandTheme({
    brandTheme: tortureLightBrandTheme,
    tenantSlug: 'torture-light',
    baseTheme: 'light',
  });
  const compiledRottay = compileBrandTheme({
    brandTheme: rottayBrandTheme,
    tenantSlug: 'rottay',
    baseTheme: 'dark',
  });
  const compiledBithire = compileBrandTheme({
    brandTheme: bithireBrandTheme,
    tenantSlug: 'bithire',
    baseTheme: 'light',
  });

  // Load-bearing: if a probe channel did NOT move between a torture fixture
  // and the first-party theme it is paired against, the e2e differential
  // probe built on that channel would be vacuous -- a component that
  // hardcodes the first-party value would render identically under the
  // torture tenant and the hardcode would never be caught. This loop is
  // what guarantees every channel in TORTURE_PROBE_VARS is actually load-bearing.
  it.each(TORTURE_PROBE_VARS)('%s is present and diverges from the matching first-party theme', (varName) => {
    const tortureDarkValue = compiledTortureDark.cssVariables[varName];
    const tortureLightValue = compiledTortureLight.cssVariables[varName];
    const rottayValue = compiledRottay.cssVariables[varName];
    const bithireValue = compiledBithire.cssVariables[varName];

    // The torture value must always be emitted. A rottay/bithire source
    // field can legitimately be absent (making rottayValue/bithireValue
    // undefined) -- in that case undefined !== tortureValue already holds,
    // but the torture side must still be defined or there would be nothing
    // for a differential probe to observe.
    expect(tortureDarkValue, `torture-dark did not emit ${varName}`).toBeDefined();
    expect(tortureLightValue, `torture-light did not emit ${varName}`).toBeDefined();

    expect(tortureDarkValue, `torture-dark[${varName}] must differ from rottay[${varName}]`).not.toBe(rottayValue);
    expect(tortureLightValue, `torture-light[${varName}] must differ from bithire[${varName}]`).not.toBe(bithireValue);
  });
});

describe('torture fixtures are not product tenants', () => {
  it('is absent from the known-tenant registry', () => {
    const slugs = getKnownTenantSlugs();
    expect(slugs).not.toContain('torture-dark');
    expect(slugs).not.toContain('torture-light');
    expect(slugs).not.toContain('themanagementmiami');
  });

  it('has no bundled CSS artifact', () => {
    expect(isBundledTenant('torture-dark')).toBe(false);
    expect(isBundledTenant('torture-light')).toBe(false);
  });

  it('is absent from the live FIRST_PARTY_ARTIFACT_SPECS array', () => {
    const serialized = JSON.stringify(FIRST_PARTY_ARTIFACT_SPECS).toLowerCase();
    expect(serialized).not.toContain('torture');
  });

  it('is absent from the FIRST_PARTY_ARTIFACT_SPECS block in its source file', () => {
    // FIRST_PARTY_ARTIFACT_SPECS is authored in the generator source (not in
    // build-vertical-artifacts.mjs, which only imports the compiled array
    // from dist) -- that source file is the real single point of truth this
    // gate must read to be meaningful.
    const generatorSourcePath = resolve(
      TEST_DIR,
      '../../../runtime/tenant/storage/static/generator/index.ts',
    );
    const source = readFileSync(generatorSourcePath, 'utf-8');
    const blockMatch = source.match(/export const FIRST_PARTY_ARTIFACT_SPECS[\s\S]*?\n\];/);
    expect(blockMatch, 'could not locate the FIRST_PARTY_ARTIFACT_SPECS array literal').not.toBeNull();
    expect(blockMatch![0].toLowerCase()).not.toContain('torture');
  });
});
