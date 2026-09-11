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
import { staticThemeIntent } from "../../../runtime/ingress";
import { compileThemeIntent } from "../../runtime/compile";

/**
 * Drop the properties that are present with no value.
 *
 * The declaration is carried inside a compiled artifact, which is a database
 * row: `{ hoverLift: undefined }` and `{}` are the same JSON value, and only
 * the second survives the round trip. Projecting them apart here would give an
 * application in memory a different answer from the same application after a
 * reload -- and the in-memory one is the worse of the two, because spreading an
 * explicit `undefined` over a resolved preset erases it.
 */
function jsonPresentOnly<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => jsonPresentOnly(item)) as unknown as T;
  }
  if (value === null || typeof value !== "object") return value;
  const present: Record<string, unknown> = {};
  for (const [key, member] of Object.entries(value as Record<string, unknown>)) {
    if (member === undefined) continue;
    present[key] = jsonPresentOnly(member);
  }
  return present as T;
}

/** Project a compile onto the declaration the provider forwards. */
export function engineVisualOf(
  compiled: EngineThemeCompilation
): EngineVisualDeclaration {
  return jsonPresentOnly({
    engine: compiled.engine,
    projection: compiled.projection,
    ...(compiled.colorScheme ? { colorScheme: compiled.colorScheme } : {}),
    runtime: compiled.runtime,
  });
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
    compileThemeIntent(staticThemeIntent(slug), { engine }).compiled
  );
}
