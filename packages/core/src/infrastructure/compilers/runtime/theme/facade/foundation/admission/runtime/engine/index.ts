/**
 * @fileoverview Admission: one engine law, for every origin.
 *
 * The refusals themselves belong to the adapter registry, which is where an
 * engine's declared posture lives. This owner is the door's APPLICATION of
 * them: it states that the engine question is asked once, at the same place
 * the tier, envelope, contrast and limit questions are asked, rather than as a
 * side effect somewhere below.
 *
 * @module Compilers/Theme/Facade/Foundation/Admission/Runtime/Engine
 * @category Compilers
 * @package @rottay/design-system
 */

import type { EngineAdapter } from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { ThemeProvenance } from "@/foundation/contracts/composition/tenants/themes/resolved";
import {
  assertEngineAdmitted,
  assertEngineSupportsActivatedControls,
} from "../../../../../presentation/adapters";

/**
 * Refuse a frozen engine and any control the rendering engine cannot reach.
 *
 * Runs on the tenant-authored path only: the DS still compiles a frozen engine
 * for its own shipped verticals and its posture evidence, and no customer
 * document, saved or previewed, may select one. `preview` and `tenant-document`
 * are the same origin class by the intent contract's own definition, so one
 * check covers both and a preview can never show a publish that is refused.
 */
export function admitEngine(
  adapter: EngineAdapter,
  provenance: ThemeProvenance
): void {
  if (!provenance.tenantAuthored) return;
  assertEngineAdmitted(adapter.id);
  assertEngineSupportsActivatedControls(adapter, provenance.authoredPaths);
}
