/**
 * @fileoverview The engine a first-party vertical renders with.
 *
 * @module Compilers/Theme/Ingress/Foundation/Engine
 * @category Compilers
 * @package @rottay/design-system
 */

import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { getFirstPartyVertical } from "@/foundation/tokens/ts/presentation/brand-themes";

/**
 * The roster row's engine, or a refusal.
 *
 * One question, one answer. The DB terminal already refused a vertical with no
 * roster row, while four preview and tooling sites spelled
 * `getFirstPartyVertical(slug)?.engine ?? PRIMARY_ENGINE` and silently rendered
 * with the primary instead. Two laws for the same question is how a preview
 * paints with an engine the publish would refuse, so there is now one law and
 * it is the strict one.
 *
 * This returns an `EngineName`, never an `EngineAdapter`. The registry lives in
 * `presentation/adapters`, which is above this owner; resolving an adapter here
 * would invert the dependency direction the tree encodes.
 */
export function verticalEngine(vertical: FirstPartyVerticalId): EngineName {
  const row = getFirstPartyVertical(vertical);
  if (!row) {
    throw new Error(
      `verticalEngine: no first-party vertical declares an engine for ${JSON.stringify(vertical)}`
    );
  }
  return row.engine;
}
