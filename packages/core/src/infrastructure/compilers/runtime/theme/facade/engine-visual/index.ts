/**
 * @fileoverview The compiled projection an application publishes to the runtime.
 *
 * An engine that seeds a third-party library needs concrete values on the first
 * frame. This owner is the one place a compile is projected into the shape the
 * provider forwards, so an application never assembles that object by hand and
 * never re-reads the values from the live cascade.
 *
 * @module Compilers/Theme/EngineVisual
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  EngineThemeCompilation,
  EngineVisualDeclaration,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";
import { compileTheme } from "../../runtime/lowering";
import { resolveTheme } from "../../runtime/resolution";
import { resolveAdapter } from "../../presentation/adapters";

/** Project a compile onto the declaration the provider forwards. */
export function engineVisualOf(
  compiled: EngineThemeCompilation
): EngineVisualDeclaration {
  return {
    engine: compiled.engine,
    projection: compiled.projection,
    ...(compiled.colorScheme ? { colorScheme: compiled.colorScheme } : {}),
    runtime: compiled.runtime,
  };
}

/**
 * The declaration for a first-party vertical rendered with a chosen engine.
 *
 * The roster declares each vertical's own engine; this takes one explicitly
 * because the caller that needs this function is the caller that renders a
 * vertical with something other than its declared engine.
 */
export function firstPartyEngineVisual(
  slug: FirstPartyVerticalId,
  engine: EngineName
): EngineVisualDeclaration {
  return engineVisualOf(
    compileTheme(resolveTheme(FIRST_PARTY_THEMES[slug]), resolveAdapter(engine))
  );
}
