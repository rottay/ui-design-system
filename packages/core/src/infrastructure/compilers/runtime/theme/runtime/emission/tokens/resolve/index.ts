/**
 * Custom-property substitution with the four CSS semantics a naive substituter
 * gets wrong.
 *
 * This is the PRODUCTIVE owner of the resolution the cascade instrument used to
 * carry. It is a move, not a fork: the instrument binds these functions out of
 * `dist/` the way the lowering readers bind `compileTheme`, so there is exactly
 * one implementation and the pinned resolved map is its continuous proof.
 *
 * The four rules, each of which a substituter that "replaces the text" breaks:
 *
 *  1. A property nobody declares, one declared `initial`, and one whose own
 *     reference chain fails (invalid at computed-value time) are all
 *     GUARANTEED-INVALID, and the consuming reference's fallback HOOKS.
 *  2. A MEMBER of a cycle is guaranteed-invalid and its own fallback is
 *     IRRELEVANT -- the graph's edges are made by each reference's first
 *     argument, so a fallback is not an escape. Only an EXTERNAL consumer of
 *     the cycle hooks its own.
 *  3. Cycle detection is by OPEN BRANCH STACK, not by a global seen-set. A
 *     value may name the same property twice without any circularity; the
 *     seen-set spelling reported 36 such pairs as cycles.
 *  4. The depth guard NEVER hooks a fallback. It is the resolver's own guard,
 *     not a real invalidity, and hooking it would hide the guard.
 */

export interface ResolutionFailure {
  /** The property that sank the value, when one is nameable. */
  readonly channel: string | null;
  readonly reason: "missing" | "cycle" | "guaranteed-invalid" | "depth";
  /** The cycle's members, from its first appearance on the stack to the top. */
  readonly members?: readonly string[];
}

export interface ResolutionOutcome {
  readonly value: string;
  readonly unresolved: ResolutionFailure | null;
}

export interface ResolutionOptions {
  readonly maxDepth?: number;
  readonly visiting?: readonly string[];
  readonly depth?: number;
  /** The property whose own declaration is being resolved, for rule 2. */
  readonly self?: string;
}

export interface ScopeResolutionOptions extends ResolutionOptions {
  /**
   * What names resolve against, when it is wider than what is being resolved.
   * The token emitter resolves a compilation's domain against the compilation
   * PLUS the declared base environment; the instrument resolves a scope against
   * itself. Defaults to the scope, which is the instrument's reading.
   */
  readonly closure?: Readonly<Record<string, string>>;
}

export interface ScopeFailure {
  readonly channel: string;
  readonly reason: ResolutionFailure["reason"];
  readonly cause: string | null;
}

export interface ScopeResolution {
  readonly resolved: Record<string, string>;
  readonly unresolved: readonly ScopeFailure[];
}

/** The substitution ceiling. A longer chain is a defect, not a datum. */
export const MAX_RESOLUTION_DEPTH = 32;

export interface SplitReference {
  readonly before: string;
  readonly name: string;
  readonly fallback: string | null;
  readonly after: string;
}

/** Split the first reference in `text`, respecting balanced parens in the fallback. */
export function splitVar(text: string): SplitReference | null {
  const start = text.indexOf("var(");
  if (start === -1) return null;
  let depth = 0;
  for (let index = start + 3; index < text.length; index += 1) {
    if (text[index] === "(") depth += 1;
    else if (text[index] === ")") {
      depth -= 1;
      if (depth === 0) {
        const inner = text.slice(start + 4, index);
        const comma = splitTopLevelComma(inner);
        return {
          before: text.slice(0, start),
          name: (comma === null ? inner : inner.slice(0, comma)).trim(),
          fallback: comma === null ? null : inner.slice(comma + 1).trim(),
          after: text.slice(index + 1),
        };
      }
    }
  }
  return null;
}

function splitTopLevelComma(text: string): number | null {
  let depth = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "(") depth += 1;
    else if (text[index] === ")") depth -= 1;
    else if (text[index] === "," && depth === 0) return index;
  }
  return null;
}

/** `initial`, case-insensitively, leaves a custom property guaranteed-invalid. */
export function isGuaranteedInvalid(raw: unknown): boolean {
  return typeof raw === "string" && raw.trim().toLowerCase() === "initial";
}

/**
 * Resolve one value against a closure, by BRANCH rather than by global set.
 *
 * Each reference is resolved with its own copy of the open stack, so two
 * sibling references to the same property do not shadow each other, and a
 * property that leads back to itself is marked `cycle` and never passed off as
 * a literal.
 */
export function resolveChannelValue(
  raw: string,
  closure: Readonly<Record<string, string>>,
  options: ResolutionOptions = {}
): ResolutionOutcome {
  const {
    maxDepth = MAX_RESOLUTION_DEPTH,
    visiting = [],
    depth = 0,
    self = undefined,
  } = options;
  let text = String(raw);
  let unresolved: ResolutionFailure | null = null;
  for (let guard = 0; guard <= maxDepth; guard += 1) {
    if (depth > maxDepth) {
      return { value: text.trim(), unresolved: { channel: null, reason: "depth" } };
    }
    const parsed = splitVar(text);
    if (!parsed) return { value: text.trim(), unresolved };
    const { name, fallback } = parsed;
    const revisit = visiting.indexOf(name);
    if (revisit !== -1) {
      // The branch came back on itself. The members run from the revisited
      // name to the top of the stack; each level above decides whether it IS a
      // member (no hook) or an external consumer (hooks its own fallback).
      return {
        value: text.trim(),
        unresolved: { channel: name, reason: "cycle", members: visiting.slice(revisit) },
      };
    }
    const declared = closure[name];
    if (declared !== undefined && !isGuaranteedInvalid(declared)) {
      const inner = resolveChannelValue(declared, closure, {
        maxDepth,
        depth: depth + 1,
        visiting: [...visiting, name],
        self: name,
      });
      if (inner.unresolved && inner.unresolved.reason === "depth") {
        // The resolver's own guard, not a real invalidity: it is recorded and
        // the best text is carried on, but the fallback NEVER hooks.
        if (!unresolved) unresolved = inner.unresolved;
        text = `${parsed.before}${inner.value}${parsed.after}`;
        continue;
      }
      if (
        inner.unresolved?.reason === "cycle" &&
        Array.isArray(inner.unresolved.members) &&
        self !== undefined &&
        inner.unresolved.members.includes(self)
      ) {
        // This level IS a member of the cycle: guaranteed-invalid by spec, and
        // its own fallback is irrelevant. The invalidity propagates intact.
        return { value: text.trim(), unresolved: unresolved ?? inner.unresolved };
      }
      if (inner.unresolved) {
        // Transitively invalid at computed-value time, or an EXTERNAL consumer
        // of a cycle: the declaration computes to guaranteed-invalid and this
        // site's fallback hooks. With no fallback, the consumer inherits the
        // root cause.
        if (fallback !== null) {
          text = `${parsed.before}${fallback}${parsed.after}`;
          continue;
        }
        return {
          value: text.trim(),
          unresolved: unresolved ?? { channel: name, reason: inner.unresolved.reason },
        };
      }
      text = `${parsed.before}${inner.value}${parsed.after}`;
      continue;
    }
    // Undeclared, or declared `initial` and therefore guaranteed-invalid by
    // spec: to the reference consuming it, it is as if it did not exist.
    if (fallback !== null) {
      text = `${parsed.before}${fallback}${parsed.after}`;
      continue;
    }
    const reason = declared === undefined ? "missing" : "guaranteed-invalid";
    return { value: text.trim(), unresolved: unresolved ?? { channel: name, reason } };
  }
  return { value: text.trim(), unresolved: unresolved ?? { channel: null, reason: "depth" } };
}

/**
 * Resolve every member of a scope.
 *
 * `channel` is the OUTER property that failed and `cause` the immediate one
 * that sank it; collapsing the two loses the claimant, which is what an earlier
 * spelling did across 251 entries.
 */
export function resolveScope(
  scope: Readonly<Record<string, string>>,
  options: ScopeResolutionOptions = {}
): ScopeResolution {
  const { closure = scope, ...resolution } = options;
  const resolved: Record<string, string> = {};
  const unresolved: ScopeFailure[] = [];
  for (const [channel, raw] of Object.entries(scope)) {
    const outcome = resolveChannelValue(raw, closure, { ...resolution, self: channel });
    resolved[channel] = outcome.value;
    if (isGuaranteedInvalid(raw)) {
      // The declaration is itself guaranteed-invalid: declared with the outer
      // channel, never passed off as a usable literal.
      unresolved.push({ channel, reason: "guaranteed-invalid", cause: null });
    } else if (outcome.unresolved) {
      unresolved.push({
        channel,
        reason: outcome.unresolved.reason,
        cause: outcome.unresolved.channel ?? null,
      });
    }
  }
  return { resolved, unresolved };
}
