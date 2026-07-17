/**
 * @fileoverview Pins the engine resolution order (WO-ENG-17).
 *
 * These are not preference tests. Reordering the chain silently changes which
 * product a customer sees, and it did: every vertical declared `modern`, every
 * first-party tenant carried a stale `classic`, the tenant outranked the
 * vertical, and so `app-evnto` rendered the classic engine while sixteen
 * modern-engine work orders landed invisibly.
 */

import { describe, expect, it } from 'vitest';

import { FALLBACK_ENGINE, resolveEngine } from '..';
import { isBundledTenant } from '../../../../tenant/foundation/configuration/registry';

/** A slug the registry actually bundles, so the pin branch is reachable. */
const BUNDLED_SLUG = 'rottay';
/** A slug no artifact ships, standing in for a row in a customer's database. */
const DB_DRIVEN_SLUG = 'acme-from-the-database';

describe('engine resolution order', () => {
  it('is anchored on a registry that agrees with these fixtures', () => {
    // If this ever flips, the two tests below stop testing what they claim to.
    expect(isBundledTenant(BUNDLED_SLUG)).toBe(true);
    expect(isBundledTenant(DB_DRIVEN_SLUG)).toBe(false);
  });

  it('1. an explicit caller override beats everything', () => {
    expect(
      resolveEngine({
        forceEngine: 'rustic',
        verticalEngine: 'modern',
        tenantEngine: 'classic',
        tenantSlug: BUNDLED_SLUG,
      })
    ).toBe('rustic');
  });

  it('2. the vertical beats the tenant', () => {
    expect(
      resolveEngine({
        verticalEngine: 'modern',
        tenantEngine: 'classic',
        tenantSlug: BUNDLED_SLUG,
      })
    ).toBe('modern');
  });

  it('3. a bundled tenant may pin an engine when no vertical is in play', () => {
    expect(resolveEngine({ tenantEngine: 'rustic', tenantSlug: BUNDLED_SLUG })).toBe('rustic');
  });

  it('4. nothing declared falls back', () => {
    expect(resolveEngine({})).toBe(FALLBACK_ENGINE);
    expect(resolveEngine({ tenantSlug: BUNDLED_SLUG })).toBe(FALLBACK_ENGINE);
  });
});

describe('engine resolution fails closed on a database-driven tenant', () => {
  it('ignores an engine that arrives from an unbundled tenant', () => {
    // Tenant branding is bounded to name, logos, favicon, colours, locale and
    // bounded token overrides. `engine` is not on that list. A row that sets it
    // is not honoured, it is ignored.
    expect(resolveEngine({ tenantEngine: 'modern', tenantSlug: DB_DRIVEN_SLUG })).toBe(
      FALLBACK_ENGINE
    );
  });

  it('still lets the vertical decide for an unbundled tenant', () => {
    expect(
      resolveEngine({
        verticalEngine: 'modern',
        tenantEngine: 'rustic',
        tenantSlug: DB_DRIVEN_SLUG,
      })
    ).toBe('modern');
  });

  it('ignores a tenant engine when the slug is unknown to the resolver', () => {
    // No slug means the resolver cannot prove the tenant is bundled, so it must
    // not trust the pin.
    expect(resolveEngine({ tenantEngine: 'modern' })).toBe(FALLBACK_ENGINE);
  });
});
