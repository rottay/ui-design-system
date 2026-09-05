/**
 * @fileoverview The end-to-end door: one intent to one admitted compilation.
 *
 * Resolution, engine selection, engine admission and lowering meet here and
 * nowhere else. They cannot meet inside `runtime/lowering`, because admission
 * and the adapter registry live in `presentation/adapters`, which is ABOVE the
 * runtime tier: a lowering that imported them would invert the dependency
 * direction this tree encodes. So the composition happens in the one layer that
 * is above both, and `compileTheme` stays what it is -- the sole lowering, with
 * an adapter handed to it.
 *
 * @module Compilers/Theme/Facade/Compile
 * @category Compilers
 * @package @rottay/design-system
 */

import type { EngineThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { ThemeResolution } from "@/foundation/contracts/composition/tenants/themes/resolved";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import { resolveAdapter } from "../../../presentation/adapters";
import { assertEngineSupportsActivatedControls } from "../../../presentation/adapters";
import { verticalEngine } from "../../../runtime/ingress";
import { compileTheme } from "../../../runtime/lowering";
import { resolveTheme } from "../../../runtime/resolution";

export interface CompileThemeIntentOptions {
  /**
   * Render the intent's vertical with an engine that is not its own.
   *
   * The ONLY sanctioned reason is deliberate comparison: the Showroom's engine
   * switcher and the engine-visual projection it drives show one vertical under
   * all three engines side by side. A productive compile never passes this --
   * it derives the engine from the roster row and refuses a vertical that has
   * none, so a tenant cannot be rendered as a product it is not.
   */
  engine?: EngineName;
}

/** What the door produces: the resolution it made, and the compile from it. */
export interface ThemeIntentCompilation {
  readonly resolution: ThemeResolution;
  readonly compiled: EngineThemeCompilation;
}

/**
 * Resolve, admit and lower one intent.
 *
 * Admission runs HERE, for every tenant-authored origin, exactly once. It used
 * to be a single explicit call on the DB terminal, which meant the `preview`
 * origin -- tenant-authored by the intent contract's own definition -- reached
 * the channel writers with nothing checked. A preview that paints a control the
 * rendering engine declares `unsupported` is a preview of a publish that would
 * be refused, which is the most expensive kind of wrong. One door, one law.
 */
export function compileThemeIntent(
  intent: ThemeIntent,
  options?: CompileThemeIntentOptions
): ThemeIntentCompilation {
  const resolution = resolveTheme(intent);
  const adapter = resolveAdapter(options?.engine ?? verticalEngine(intent.vertical));
  if (resolution.provenance.tenantAuthored) {
    assertEngineSupportsActivatedControls(
      adapter,
      resolution.provenance.authoredPaths
    );
  }
  return { resolution, compiled: compileTheme(resolution, adapter) };
}
