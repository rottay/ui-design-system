/**
 * @fileoverview The single place that decides which engine renders.
 *
 * `PRIMARY_ENGINE` is the only statement of which engine renders when nothing
 * declares one, and this is the only resolution that reads it.
 */

import { isBundledTenant } from '../../../tenant/foundation/configuration/registry';
import {
  ENGINE_NAMES,
  FROZEN_ENGINE_NAMES,
  PRIMARY_ENGINE,
  isAdmittedEngineName,
  isValidEngineName,
} from '@/foundation/contracts/kernel/engine-identity';
import type { EngineName } from '../../../../../foundation/contracts';

export interface EngineResolutionInput {
  /**
   * An explicit caller override, and the one door to a frozen engine: the engine
   * comparison and capture routes render Classic/Rustic on purpose. Never data.
   */
  forceEngine?: EngineName;
  /** The engine the vertical declares. Static-first: this is product identity. */
  verticalEngine?: EngineName;
  /** The engine the tenant config declares, if any. */
  tenantEngine?: EngineName;
  /** Used to decide whether the tenant is allowed to declare an engine at all. */
  tenantSlug?: string;
}

/** A caller selected an engine the design system no longer admits. */
export class EngineNotAdmittedError extends Error {
  readonly engine: EngineName;
  readonly origin: string;

  constructor(engine: EngineName, origin: string) {
    super(
      `resolveEngine: "${engine}" is not an admitted engine (declared by ${origin}). ` +
        `The roster is ${ENGINE_NAMES.join(', ')}; Modern is the only productive engine and ` +
        `${FROZEN_ENGINE_NAMES.join(', ')} are frozen compatibility surfaces; ` +
        'a white-label product renders through a registered `custom` pack. ' +
        'There is no fallback engine.'
    );
    this.name = 'EngineNotAdmittedError';
    this.engine = engine;
    this.origin = origin;
  }
}

/** Refuse a non-admitted engine BY NAME, naming the origin that asked for it. */
function admit(engine: EngineName | undefined, origin: string): EngineName | undefined {
  if (engine === undefined) return undefined;
  if (!isAdmittedEngineName(engine)) throw new EngineNotAdmittedError(engine, origin);
  return engine;
}

/**
 * Resolves the active engine.
 *
 * The order is a constraint, not a preference:
 *
 * 1. `forceEngine` — an explicit caller override, for capture routes and tests.
 *    Everything below is DATA, and data is admitted.
 * 2. `verticalEngine` — the vertical owns its engine. `CLAUDE.md`: "Vertical
 *    identity is static-first — defined by files in each vertical app
 *    (PRODUCT_PROFILE, engine baseline...). It is not loaded from the
 *    database." A tenant must not be able to change what product this is.
 * 3. `tenantEngine`, and **only for a bundled tenant** — a first-party tenant
 *    rendered with no vertical in play may still pin an engine deliberately.
 *    A DB-driven tenant may not: tenant branding is bounded to name, logos,
 *    favicon, colors, locale and bounded token overrides. Engine is not on that
 *    list, so an `engine` arriving from the database is ignored rather than
 *    honoured. Fail closed.
 * 4. `PRIMARY_ENGINE` — Modern. Not a fallback BETWEEN candidates: it is the
 *    engine this design system renders with, stated once, in the identity
 *    contract, and it is also the only engine step 1-3 can return.
 *
 * Every declared candidate passes admission first: a frozen engine is refused by
 * name at whichever origin selected it.
 *
 * Note the tenant pin sits BELOW the vertical. When a vertical is present it
 * decides, and the pin is unreachable. That is the point: a stale `classic` on
 * a tenant record must never outrank a vertical that declares `modern`.
 */
export function resolveEngine({
  forceEngine,
  verticalEngine,
  tenantEngine,
  tenantSlug,
}: EngineResolutionInput): EngineName {
  if (forceEngine) {
    // The override is a code-written comparison seam, so a frozen engine passes.
    // An engine name that is not on the roster at all is not a comparison: it is
    // a typo that would surface as an obscure lookup failure three layers down.
    if (!isValidEngineName(forceEngine))
      throw new EngineNotAdmittedError(forceEngine, 'forceEngine');
    return forceEngine;
  }
  const vertical = admit(verticalEngine, 'verticalEngine');
  if (vertical) return vertical;
  if (tenantEngine && tenantSlug && isBundledTenant(tenantSlug))
    return admit(tenantEngine, `tenantEngine (bundled tenant "${tenantSlug}")`) as EngineName;
  return PRIMARY_ENGINE;
}
