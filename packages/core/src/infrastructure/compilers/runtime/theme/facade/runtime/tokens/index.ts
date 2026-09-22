/**
 * The intent-shaped door onto the resolved token document.
 *
 * It composes two owners that already exist and decides nothing: the single
 * compile door, and the emitter that projects a compilation onto typed leaves.
 *
 * WHY THE EMITTER IS NOT THIS SHAPE. An emitter that took an intent would have
 * to compile, and two emitters that each compile is a second compilation the
 * moment a caller wants CSS and a token document from one compile. Publishing
 * the compilation-shaped function as the emitter and the intent-shaped one as a
 * facade satisfies both at once: `compileThemeIntent` is called exactly once
 * here, and `emitThemeTokens` cannot express a compile in its signature at all.
 *
 * The base environment stays an explicit parameter. A facade that loaded the
 * snapshot would be a pure function reading the filesystem, and a second answer
 * to what the base layer declares; with it passed in, the caller decides which
 * snapshot a document was resolved against and the closure is auditable at
 * every call site.
 */

import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type {
  ThemeTokenDocument,
  ThemeTokenProvenance,
  TokenEmissionEnvironment,
} from "@/contracts/theme/runtime/compilation";

import { compileThemeIntent, type CompileThemeIntentOptions } from "../compile";
import { verticalEngine } from "../../../runtime/ingress";
import {
  emitThemeTokens,
  type ResolvedBaseEnvironment,
} from "../../../runtime/emission/tokens";

export function emitThemeTokensForIntent(
  intent: ThemeIntent,
  environment: TokenEmissionEnvironment,
  base: ResolvedBaseEnvironment,
  provenance: ThemeTokenProvenance,
  options?: CompileThemeIntentOptions
): ThemeTokenDocument {
  const { compiled } = compileThemeIntent(intent, options);
  return emitThemeTokens(compiled, environment, base, {
    vertical: intent.vertical,
    slug: intent.slug,
    engine: options?.engine ?? verticalEngine(intent.vertical),
    compilerVersion: provenance.compilerVersion,
    digest: provenance.digest,
  });
}
