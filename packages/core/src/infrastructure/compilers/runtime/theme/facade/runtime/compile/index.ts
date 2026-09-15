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

import type {
  EngineAdapter,
  EngineThemeCompilation,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { ThemeResolution } from "@/foundation/contracts/composition/tenants/themes/resolved";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import { sha256Utf8 } from "@/foundation/kernel/cryptography/sha-256";
import { resolveAdapter } from "../../../presentation/adapters";
import { baselineFor, staticThemeIntent, verticalEngine } from "../../../runtime/ingress";
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
 * The vertical's own compile, once per (baseline, engine) in a process.
 *
 * Every tenant compile needs the baseline to measure its delta against, and
 * lowering a ~9K-line authored theme a second time on every SSR request
 * produces a result that CANNOT differ: the roster themes are frozen module
 * singletons and the lowering is pure. The key is the digest of the resolved
 * baseline and the adapter it is projected onto, so a theme edit, a slug
 * change or a comparison engine each miss the cache on their own rather than
 * on a hand-listed set of fields somebody has to remember to extend.
 *
 * The entry is FROZEN all the way down before it is shared (F-60). A cache
 * that hands the same graph to every concurrent request turns one caller's
 * mutation into every later caller's product, with no trace.
 */
const BASELINE_COMPILES = new Map<string, EngineThemeCompilation>();

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
  }
  return value;
}

function cachedBaselineCompile(
  resolution: ThemeResolution,
  adapter: EngineAdapter
): EngineThemeCompilation {
  // The digest is over the baseline's VISUAL content, with `id` and `name`
  // dropped: `baselineFor` stamps the requesting tenant's slug onto the
  // roster's Theme, and that slug reaches nothing the compile emits -- only
  // the text of a refusal. Keyed WITH it, every tenant of a vertical would
  // miss, which is the one case this cache exists for.
  //
  // `JSON.stringify`, not the canonical JSON serializer: a Theme legitimately
  // carries `undefined` leaves (an unauthored capability note), which the
  // canonical form refuses by design. Key ORDER is part of the identity here
  // rather than noise -- two themes that differ only in it emit their channels
  // in a different order -- so the insertion-ordered form is the right digest.
  const { id: _id, name: _name, ...content } = resolution.theme;
  const key = `${adapter.id}|sha256-${sha256Utf8(JSON.stringify(content))}`;
  const cached = BASELINE_COMPILES.get(key);
  if (cached !== undefined) return cached;
  const compiled = deepFreeze(compileTheme(resolution, adapter));
  BASELINE_COMPILES.set(key, compiled);
  return compiled;
}

/**
 * Resolve, admit and lower one intent.
 *
 * Admission runs HERE, for every origin, exactly once. It used to be a single
 * explicit call on the DB terminal, which meant the `preview` origin --
 * tenant-authored by the intent contract's own definition -- reached the
 * channel writers with only the engine checked, and a `FlatTheme` draft with
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
  // The vertical's baseline is the neutral foundation with its preset admitted;
  // the door derives it and the resolver never carries one of its own.
  const resolveOver = (target: ThemeIntent) =>
    resolveTheme(target, { baseline: baselineFor(target.vertical, target.slug) });
  const resolution = resolveOver(intent);
  const adapter = resolveAdapter(options?.engine ?? verticalEngine(intent.vertical));
  admitThemeIntent({ intent, resolution, adapter });
  const compiled = compileTheme(resolution, adapter);
  if (!resolution.provenance.tenantAuthored) return { resolution, compiled };
  // The vertical's own baseline, compiled through the same lowering. It is NOT
  // reached through this function: a `static-vertical` intent is not
  // tenant-authored, so recursing would be one wasted compile per request and
  // an admission asked of a product about itself.
  const baselineIntent = staticThemeIntent(intent.vertical, intent.slug);
  const baselineResolution = resolveOver(baselineIntent);
  const baseline = cachedBaselineCompile(baselineResolution, adapter);
  const delta = admitThemeCompilation({
    resolution,
    compiled,
    baseline,
    patch: intent.patch,
    baselineTheme: baselineResolution.theme,
  });
  return { resolution, compiled, baseline, delta };
}
