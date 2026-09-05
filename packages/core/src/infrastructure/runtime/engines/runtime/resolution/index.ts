/**
 * @fileoverview The single place that decides which engine renders.
 *
 * `PRIMARY_ENGINE` is the only statement of which engine renders when nothing
 * declares one, and this is the only resolution that reads it.
 */

import { isBundledTenant } from '../../../tenant/foundation/configuration/registry';
import { PRIMARY_ENGINE } from '@/foundation/contracts/kernel/engine-identity';
import type { EngineName } from '../../../../../foundation/contracts';

export interface EngineResolutionInput {
  /** An explicit caller override. The showroom's capture routes use this. */
  forceEngine?: EngineName;
  /** The engine the vertical declares. Static-first: this is product identity. */
  verticalEngine?: EngineName;
  /** The engine the tenant config declares, if any. */
  tenantEngine?: EngineName;
  /** Used to decide whether the tenant is allowed to declare an engine at all. */
  tenantSlug?: string;
}

/**
 * Resolves the active engine.
 *
 * The order is a constraint, not a preference:
 *
 * 1. `forceEngine` — an explicit caller override, for capture routes and tests.
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
 * 4. `PRIMARY_ENGINE` — Modern. Not a fallback: it is the engine this design
 *    system renders with, stated once, in the identity contract.
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
  if (forceEngine) return forceEngine;
  if (verticalEngine) return verticalEngine;
  if (tenantEngine && tenantSlug && isBundledTenant(tenantSlug)) return tenantEngine;
  return PRIMARY_ENGINE;
}
