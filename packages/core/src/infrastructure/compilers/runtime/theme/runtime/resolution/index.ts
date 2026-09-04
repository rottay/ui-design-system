import {
  TENANT_AUTHORED_ORIGINS,
  isTenantAuthoredOrigin,
  type ThemeIntent,
  type ThemeIntentOrigin,
} from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  assertThemeBaseline,
  mergeThemePatches,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  EMPTY_PROVENANCE,
  tenantProvenance,
  type ThemeResolution,
} from "@/foundation/contracts/composition/tenants/themes/resolved";

/**
 * Applies one intent to a baseline and records what the merge destroys.
 *
 * The origin decides authorship, not the presence of a patch: a
 * `static-vertical` intent may change the resolved `Theme` while creating no
 * tenant floor and no tenant status-seed authorship. Provenance is always
 * computed from the RAW patch, because a resolved `Theme` can no longer say
 * whose a value is.
 */
const ORIGINS: readonly ThemeIntentOrigin[] = Object.freeze([
  "static-vertical",
  ...TENANT_AUTHORED_ORIGINS,
]);

/** The envelope is EXACTLY these two keys: not fewer, not more, not inherited. */
const INTENT_KEYS: readonly string[] = ["origin", "patch"];

/**
 * Reject the intent before it can decide anything.
 *
 * The origin is what selects tenant authorship, so an origin outside the closed
 * union must not reach `isTenantAuthoredOrigin`: that predicate answers `false`
 * for every value it does not recognise, which turns a bogus, numeric or object
 * origin into a silent "not a tenant" instead of a refusal. Validated here, at
 * the public boundary, rather than trusted from a type a JS caller never saw.
 */
function assertThemeIntent(intent: ThemeIntent): void {
  if (typeof intent !== "object" || intent === null || Array.isArray(intent)) {
    throw new Error("resolveTheme: intent must be an object");
  }
  // OWN keys, and exactly the declared ones. `intent.origin` reached through
  // the prototype chain is not an authored origin, and an envelope carrying a
  // third key is a caller sending something this contract never agreed to read
  // -- silently ignoring it is how a field gets "supported" by accident.
  const keys = Object.keys(intent as object);
  const unknown = keys.filter((key) => !INTENT_KEYS.includes(key));
  if (unknown.length > 0) {
    throw new Error(
      `resolveTheme: unknown intent key(s) ${unknown.map((k) => JSON.stringify(k)).join(", ")}; ` +
        `a ThemeIntent carries exactly ${INTENT_KEYS.join(" and ")}`
    );
  }
  for (const key of INTENT_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(intent, key)) {
      throw new Error(`resolveTheme: intent.${key} must be an own property`);
    }
  }
  if (!ORIGINS.includes(intent.origin)) {
    throw new Error(
      `resolveTheme: unknown intent origin ${JSON.stringify(intent.origin)}; ` +
        `the closed set is ${ORIGINS.map((o) => `"${o}"`).join(", ")}`
    );
  }
  const { patch } = intent;
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
    throw new Error("resolveTheme: intent.patch must be an object");
  }
}

export function resolveTheme(baseline: Theme, intent?: ThemeIntent): ThemeResolution {
  // Before EVERY return: the no-intent path is the one that used to hand an
  // unvalidated object back as a resolved Theme.
  assertThemeBaseline(baseline, "resolveTheme");
  if (intent === undefined) return { theme: baseline, provenance: EMPTY_PROVENANCE };
  assertThemeIntent(intent);
  return {
    theme: mergeThemePatches(baseline, intent.patch),
    provenance: isTenantAuthoredOrigin(intent.origin)
      ? tenantProvenance(intent.patch)
      : EMPTY_PROVENANCE,
    intent,
  };
}
