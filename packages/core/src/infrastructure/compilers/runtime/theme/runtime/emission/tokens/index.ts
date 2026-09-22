/**
 * The resolved token document: the third projection of one compile.
 *
 * `emitThemeCss` hands a browser channel TEXT with its references intact, and
 * the browser resolves them. A renderer with no CSS engine cannot, so this
 * owner resolves and evaluates them here and hands back typed numeric leaves.
 *
 * It takes a `ThemeCompilation`, never a `ThemeIntent` and never a
 * `ThemeResolution`: a second compilation is then not expressible in its
 * signature. The intent-shaped door is a facade above it that compiles once.
 *
 * The closure is DECLARED, not discovered. A compilation resolved against
 * itself leaves two channels in five unresolvable, because the properties they
 * read live in the static token layer, which is not compiled per tenant. The
 * base environment is that layer's root projection, passed in as data: the
 * emitter reads no file, so what a document was resolved against is auditable
 * at the call site rather than inside the emitter.
 */

import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  TOKEN_EMISSION_BOUNDS,
  type ThemeTokenDocument,
  type ThemeTokenIdentity,
  type ThemeTokenLeaf,
  type TokenChannelName,
  type TokenEmissionEnvironment,
  type TokenEmissionMode,
  type UnresolvedToken,
} from "@/contracts/theme/runtime/compilation";

import { evaluateCssValue } from "./evaluate";
import { resolveScope } from "./resolve";

export type {
  EvaluationOutcome,
  EvaluationRefusal,
} from "./evaluate";
export {
  MAX_RESOLUTION_DEPTH,
  isGuaranteedInvalid,
  resolveChannelValue,
  resolveScope,
  splitVar,
} from "./resolve";
export { evaluateCssValue } from "./evaluate";

/**
 * The static token layer's root projection at one (vertical, mode).
 *
 * Produced by the build and handed to the emitter. It is keyed on the two
 * things that change it -- which vertical's static bundle, and which mode's
 * root block -- and carries its own digest so a caller resolving against a
 * stale snapshot is nameable rather than merely wrong.
 */
export interface ResolvedBaseEnvironment {
  readonly vertical: FirstPartyVerticalId;
  readonly mode: TokenEmissionMode;
  readonly channels: Readonly<Record<string, string>>;
  readonly digest: string;
}

/** Refused when the environment is absent, incomplete, or disagrees with the snapshot. */
export class TokenEmissionEnvironmentError extends Error {
  constructor(message: string) {
    super(`emitThemeTokens: ${message}`);
    this.name = "TokenEmissionEnvironmentError";
  }
}

const MODES: readonly TokenEmissionMode[] = ["light", "dark"];

function assertEnvironment(
  environment: TokenEmissionEnvironment | undefined,
  base: ResolvedBaseEnvironment | undefined
): asserts environment is TokenEmissionEnvironment {
  if (!environment || !MODES.includes(environment.mode)) {
    throw new TokenEmissionEnvironmentError(
      "the environment declares no mode. A root document resolves on declared axes; there is no default."
    );
  }
  if (
    typeof environment.rootFontSizePx !== "number" ||
    !Number.isFinite(environment.rootFontSizePx) ||
    environment.rootFontSizePx <= 0
  ) {
    throw new TokenEmissionEnvironmentError(
      "the environment declares no usable rootFontSizePx. The document root is fluid; the denominator is declared, never guessed."
    );
  }
  if (!base || !base.channels) {
    throw new TokenEmissionEnvironmentError(
      "no base environment was supplied. A compilation resolved against itself leaves two channels in five unresolvable."
    );
  }
  if (base.mode !== environment.mode) {
    throw new TokenEmissionEnvironmentError(
      `the base snapshot is for mode ${JSON.stringify(base.mode)} and the environment declares ${JSON.stringify(environment.mode)}. Resolving one mode against the other's root reports values the browser never paints.`
    );
  }
}

/** The compilation's own scope at a mode: the base rule, with that mode's delta over it. */
export function compilationScope(
  compiled: ThemeCompilation,
  mode: TokenEmissionMode
): Record<string, string> {
  const scope: Record<string, string> = { ...compiled.cssVariables };
  for (const block of compiled.modeBlocks) {
    if (block.mode !== mode) continue;
    for (const [channel, value] of Object.entries(block.cssVariables)) scope[channel] = value;
  }
  return scope;
}

/**
 * Reduce a `rem` length to the declared denominator.
 *
 * This is the ONE place `rootFontSizePx` is used, and it is used on a leaf that
 * carries no unit mix. It is never used to reconcile two units inside one
 * expression: that case refuses as `unit-mix` in the evaluator, because
 * reconciling would mean inventing a root font size for a root that is fluid.
 */
function applyRootFontSize(
  leaf: ThemeTokenLeaf,
  environment: TokenEmissionEnvironment
): ThemeTokenLeaf {
  if (leaf.kind !== "length" || leaf.unit !== "rem") return leaf;
  return {
    kind: "length",
    value: Number((leaf.value * environment.rootFontSizePx).toPrecision(12)),
    unit: "px",
  };
}

export function emitThemeTokens(
  compiled: ThemeCompilation,
  environment: TokenEmissionEnvironment,
  base: ResolvedBaseEnvironment,
  identity: ThemeTokenIdentity
): ThemeTokenDocument {
  assertEnvironment(environment, base);
  const scope = compilationScope(compiled, environment.mode);
  // Compilation over base environment: the tenant artifact is written UNLAYERED
  // and outranks the layered static block, so a compiled channel is what the
  // browser paints wherever both declare one.
  const closure: Record<string, string> = { ...base.channels, ...scope };

  const substituted = resolveScope(scope, {
    closure,
    maxDepth: TOKEN_EMISSION_BOUNDS.maxResolutionDepth,
  });
  const refused = new Map(substituted.unresolved.map((entry) => [entry.channel, entry]));

  const tokens: Record<string, ThemeTokenLeaf> = {};
  const unresolved: UnresolvedToken[] = [];
  for (const channel of Object.keys(scope).sort()) {
    const name = channel as TokenChannelName;
    const failure = refused.get(channel);
    if (failure) {
      unresolved.push({
        channel: name,
        reason: failure.reason,
        cause: (failure.cause as TokenChannelName | null) ?? null,
      });
      continue;
    }
    const evaluation = evaluateCssValue(substituted.resolved[channel], environment);
    if (evaluation.refused !== null) {
      unresolved.push({ channel: name, reason: evaluation.refused, cause: null });
      continue;
    }
    tokens[name] = applyRootFontSize(evaluation.leaf, environment);
  }

  return {
    formatVersion: 1,
    vertical: identity.vertical,
    slug: identity.slug,
    engine: identity.engine,
    environment,
    compilerVersion: identity.compilerVersion,
    digest: identity.digest,
    tokens,
    unresolved,
  };
}
