/**
 * @fileoverview Pins the engine resolution order (WO-ENG-17) and the admission
 * law that now runs inside it (WO-CAN-06).
 *
 * These are not preference tests. Reordering the chain silently changes which
 * product a customer sees, and it did: every vertical declared `modern`, every
 * first-party tenant carried a stale `classic`, the tenant outranked the
 * vertical, and so `app-evnto` rendered the classic engine while sixteen
 * modern-engine work orders landed invisibly. The stale `classic` is now a
 * named refusal rather than a silent render.
 */

import { describe, expect, it } from 'vitest';

import { EngineNotAdmittedError, resolveEngine } from '..';
import {
  EXTENSION_ENGINE,
  FROZEN_ENGINE_NAMES,
  PRIMARY_ENGINE,
} from '@/foundation/contracts/kernel/engine-identity';
import { isBundledTenant } from '../../../../tenant/foundation/configuration/registry';

/** A slug the registry actually bundles, so the pin branch is reachable. */
const BUNDLED_SLUG = 'rottay';
/** A slug no artifact ships, standing in for a row in a customer's database. */
const DB_DRIVEN_SLUG = 'acme-from-the-database';

/**
 * The precedence tests need two DIFFERENT admitted values, otherwise "the
 * vertical beat the tenant" and "the resolver returned its one answer" are the
 * same observation. `custom` is the second admitted name.
 */
const SECOND_ADMITTED = EXTENSION_ENGINE;

describe('engine resolution order', () => {
  it('is anchored on a registry that agrees with these fixtures', () => {
    // If this ever flips, the two tests below stop testing what they claim to.
    expect(isBundledTenant(BUNDLED_SLUG)).toBe(true);
    expect(isBundledTenant(DB_DRIVEN_SLUG)).toBe(false);
    expect(SECOND_ADMITTED).not.toBe(PRIMARY_ENGINE);
  });

  it('1. an explicit caller override beats everything', () => {
    expect(
      resolveEngine({
        forceEngine: SECOND_ADMITTED,
        verticalEngine: PRIMARY_ENGINE,
        tenantEngine: PRIMARY_ENGINE,
        tenantSlug: BUNDLED_SLUG,
      })
    ).toBe(SECOND_ADMITTED);
  });

  it('1b. the override is the one door a frozen engine may still come through', () => {
    // Deliberate, in code, for the engine comparison and the capture routes.
    // It is not data, which is why it is not admitted-checked.
    for (const frozen of FROZEN_ENGINE_NAMES)
      expect(resolveEngine({ forceEngine: frozen })).toBe(frozen);
  });

  it('1c. an override that is not on the roster at all is refused by name', () => {
    expect(() => resolveEngine({ forceEngine: 'nonsense' as never })).toThrow(
      EngineNotAdmittedError
    );
    expect(() => resolveEngine({ forceEngine: 'Modern' as never })).toThrow(
      /not an admitted engine \(declared by forceEngine\)/
    );
  });

  it('2. the vertical beats the tenant', () => {
    expect(
      resolveEngine({
        verticalEngine: PRIMARY_ENGINE,
        tenantEngine: SECOND_ADMITTED,
        tenantSlug: BUNDLED_SLUG,
      })
    ).toBe(PRIMARY_ENGINE);
  });

  it('3. a bundled tenant may pin an engine when no vertical is in play', () => {
    expect(resolveEngine({ tenantEngine: SECOND_ADMITTED, tenantSlug: BUNDLED_SLUG })).toBe(
      SECOND_ADMITTED
    );
  });

  it('4. nothing declared resolves to the primary engine, which is Modern', () => {
    expect(resolveEngine({})).toBe(PRIMARY_ENGINE);
    expect(resolveEngine({ tenantSlug: BUNDLED_SLUG })).toBe(PRIMARY_ENGINE);
    expect(PRIMARY_ENGINE).toBe('modern');
  });

  it('has no second constant answering the same question', async () => {
    const registry = (await import('../../../foundation/registry')) as Record<string, unknown>;
    expect(Object.keys(registry)).not.toContain('getDefaultEngine');
    const resolution = (await import('..')) as Record<string, unknown>;
    expect(Object.keys(resolution)).not.toContain('FALLBACK_ENGINE');
  });
});

describe('a frozen engine is refused by name, at the origin that selected it', () => {
  it('names the engine and the origin for every frozen roster entry', () => {
    for (const frozen of FROZEN_ENGINE_NAMES) {
      expect(() => resolveEngine({ verticalEngine: frozen })).toThrow(EngineNotAdmittedError);
      expect(() => resolveEngine({ verticalEngine: frozen })).toThrow(
        new RegExp(`"${frozen}".*verticalEngine`, 's')
      );
      expect(() =>
        resolveEngine({ tenantEngine: frozen, tenantSlug: BUNDLED_SLUG })
      ).toThrow(new RegExp(`"${frozen}".*tenantEngine`, 's'));
    }
  });

  it('carries the refused engine on the error, not only in prose', () => {
    for (const frozen of FROZEN_ENGINE_NAMES) {
      try {
        resolveEngine({ verticalEngine: frozen });
        throw new Error(`expected ${frozen} to be refused`);
      } catch (error) {
        expect(error).toBeInstanceOf(EngineNotAdmittedError);
        expect((error as EngineNotAdmittedError).engine).toBe(frozen);
      }
    }
  });

  it('never refuses an admitted engine', () => {
    expect(() => resolveEngine({ verticalEngine: PRIMARY_ENGINE })).not.toThrow();
    expect(() => resolveEngine({ verticalEngine: SECOND_ADMITTED })).not.toThrow();
  });

  it('leaves an unreachable stale pin unreached rather than refusing it', () => {
    // Precedence runs first: a vertical that declares Modern decides, and the
    // tenant row nobody consults is never admitted in the first place.
    for (const frozen of FROZEN_ENGINE_NAMES) {
      expect(
        resolveEngine({
          verticalEngine: PRIMARY_ENGINE,
          tenantEngine: frozen,
          tenantSlug: BUNDLED_SLUG,
        })
      ).toBe(PRIMARY_ENGINE);
    }
  });
});

describe('engine resolution fails closed on a database-driven tenant', () => {
  it('ignores an engine that arrives from an unbundled tenant', () => {
    // Tenant branding is bounded to name, logos, favicon, colours, locale and
    // bounded token overrides. `engine` is not on that list. A row that sets it
    // is not honoured, it is ignored.
    expect(resolveEngine({ tenantEngine: PRIMARY_ENGINE, tenantSlug: DB_DRIVEN_SLUG })).toBe(
      PRIMARY_ENGINE
    );
    for (const frozen of FROZEN_ENGINE_NAMES) {
      expect(resolveEngine({ tenantEngine: frozen, tenantSlug: DB_DRIVEN_SLUG })).toBe(
        PRIMARY_ENGINE
      );
    }
  });

  it('still lets the vertical decide for an unbundled tenant', () => {
    expect(
      resolveEngine({
        verticalEngine: PRIMARY_ENGINE,
        tenantEngine: SECOND_ADMITTED,
        tenantSlug: DB_DRIVEN_SLUG,
      })
    ).toBe(PRIMARY_ENGINE);
  });

  it('ignores a tenant engine when the slug is unknown to the resolver', () => {
    // No slug means the resolver cannot prove the tenant is bundled, so it must
    // not trust the pin.
    expect(resolveEngine({ tenantEngine: PRIMARY_ENGINE })).toBe(PRIMARY_ENGINE);
  });
});
