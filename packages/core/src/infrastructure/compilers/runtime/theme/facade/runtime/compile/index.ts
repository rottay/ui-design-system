/**
 * @fileoverview The end-to-end door: one intent to one admitted compilation.
 *
 * Resolution, admission and lowering meet here and nowhere else. They cannot
 * meet inside `runtime/lowering`, because admission and the adapter registry
 * live above the runtime tier: a lowering that imported them would invert the
 * dependency direction this tree encodes. So the composition happens in the one
 * layer that is above both, and `compileTheme` stays what it is -- the sole
 * lowering, with an adapter handed to it.
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
import { staticThemeIntent, verticalEngine } from "../../../runtime/ingress";
import { compileTheme } from "../../../runtime/lowering";
import { resolveTheme } from "../../../runtime/resolution";
import { admitThemeCompilation, admitThemeIntent } from "../../foundation/admission";
import type { ThemeChannelDelta } from "../../foundation/admission";

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
  /**
   * The vertical's OWN compile, and the delta this tenant made against it.
   *
   * Present exactly when the origin is tenant-authored, because that is when
   * the admission needs a baseline to measure against. Published rather than
   * kept private because the DB terminal writes this delta into its artifact:
   * recomputing it there would be a second answer to "what did this tenant
   * move", and the two answers would drift the first time either changed.
   */
  readonly baseline?: EngineThemeCompilation;
  readonly delta?: ThemeChannelDelta;
}

/**
 * Resolve, admit and lower one intent.
 *
 * Admission runs HERE, for every origin, exactly once. It used to be a single
 * explicit call on the DB terminal, which meant the `preview` origin --
 * tenant-authored by the intent contract's own definition -- reached the
 * channel writers with only the engine checked, and a `BrandTheme` draft with
 * nothing checked at all. A preview of a publish that would be refused is the
 * most expensive kind of wrong. One door, one law.
 *
 * The baseline compile is produced with the SAME adapter, so a comparison
 * render measures a vertical against itself under one engine rather than
 * against a compile no consumer would ever mount.
 */
export function compileThemeIntent(
  intent: ThemeIntent,
  options?: CompileThemeIntentOptions
): ThemeIntentCompilation {
  const resolution = resolveTheme(intent);
  const adapter = resolveAdapter(options?.engine ?? verticalEngine(intent.vertical));
  admitThemeIntent({ intent, resolution, adapter });
  const compiled = compileTheme(resolution, adapter);
  if (!resolution.provenance.tenantAuthored) return { resolution, compiled };
  // The vertical's own baseline, compiled through the same lowering. It is NOT
  // reached through this function: a `static-vertical` intent is not
  // tenant-authored, so recursing would be one wasted compile per request and
  // an admission asked of a product about itself.
  const baselineIntent = staticThemeIntent(intent.vertical, intent.slug);
  const baselineResolution = resolveTheme(baselineIntent);
  const baseline = compileTheme(baselineResolution, adapter);
  const delta = admitThemeCompilation({
    resolution,
    compiled,
    baseline,
    patch: intent.patch,
    baselineTheme: baselineResolution.theme,
  });
  return { resolution, compiled, baseline, delta };
}
