/**
 * @fileoverview The sole resolution: one ThemeIntent to a resolved Theme.
 *
 * @module Compilers/Theme/Resolution
 * @category Compilers
 * @package @rottay/design-system
 */

import {
  assertDecisionProvenanceLedger,
  snapshotDecisionProvenanceLedger,
} from "@/contracts/theme/foundation/provenance";
import {
  TENANT_AUTHORED_ORIGINS,
  THEME_PLANS,
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
import {
  FIRST_PARTY_VERTICAL_SLUGS,
  type FirstPartyVerticalId,
} from "@/foundation/contracts/kernel/verticals";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

/**
 * Applies one intent to the baseline it names and records what the merge
 * destroys.
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

/** The envelope is EXACTLY these keys: not fewer, not more, not inherited. */
const INTENT_KEYS: readonly string[] = [
  "vertical",
  "slug",
  "origin",
  "patch",
  "entitlement",
  "ledger",
];

/** The optional keys; every other one must be present. */
const OPTIONAL_INTENT_KEYS: readonly string[] = ["entitlement", "ledger"];

/**
 * Reject the intent before it can decide anything.
 *
 * The origin is what selects tenant authorship, so an origin outside the closed
 * union must not reach `isTenantAuthoredOrigin`: that predicate answers `false`
 * for every value it does not recognise, which turns a bogus, numeric or object
 * origin into a silent "not a tenant" instead of a refusal. The vertical is
 * validated for the same reason one step earlier: it selects the BASELINE, and
 * an unrecognised one would index the roster to `undefined` and hand a
 * non-Theme to the merge. Validated here, at the public boundary, rather than
 * trusted from a type a JS caller never saw.
 */
function assertThemeIntent(intent: ThemeIntent): void {
  if (typeof intent !== "object" || intent === null || Array.isArray(intent)) {
    throw new Error("resolveTheme: intent must be an object");
  }
  // OWN keys, and exactly the declared ones. `intent.origin` reached through
  // the prototype chain is not an authored origin, and an envelope carrying a
  // fifth key is a caller sending something this contract never agreed to read
  // -- silently ignoring it is how a field gets "supported" by accident.
  const keys = Object.keys(intent as object);
  const unknown = keys.filter((key) => !INTENT_KEYS.includes(key));
  if (unknown.length > 0) {
    throw new Error(
      `resolveTheme: unknown intent key(s) ${unknown.map((k) => JSON.stringify(k)).join(", ")}; ` +
        `a ThemeIntent carries exactly ${INTENT_KEYS.join(", ")}`
    );
  }
  for (const key of INTENT_KEYS) {
    if (OPTIONAL_INTENT_KEYS.includes(key)) continue;
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
  if (
    !(FIRST_PARTY_VERTICAL_SLUGS as readonly string[]).includes(
      intent.vertical as string
    )
  ) {
    throw new Error(
      `resolveTheme: unknown intent vertical ${JSON.stringify(intent.vertical)}; ` +
        `the closed set is ${FIRST_PARTY_VERTICAL_SLUGS.map((v) => `"${v}"`).join(", ")}`
    );
  }
  if (typeof intent.slug !== "string" || intent.slug.length === 0) {
    throw new Error("resolveTheme: intent.slug must be a non-empty string");
  }
  const { patch } = intent;
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
    throw new Error("resolveTheme: intent.patch must be an object");
  }
  // F-70: the patch could name `id` and `name`. The type excludes them, but a
  // patch reaches here from a database row and an HTTP body, where the type is
  // gone. A patch that restates identity renames the theme it is patching.
  for (const key of ["id", "name"] as const) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      throw new Error(
        `resolveTheme: intent.patch may not carry "${key}"; theme identity comes ` +
          "from the roster row and the slug, never from a patch"
      );
    }
  }
  // A `static-vertical` intent IS the vertical's own baseline. A patch on top
  // of it would be a second, unnamed authoring surface for vertical identity,
  // which is the shape the static-first branding law exists to prevent.
  if (intent.origin === "static-vertical" && Object.keys(patch).length > 0) {
    throw new Error(
      "resolveTheme: a static-vertical intent carries an empty patch; the " +
        `vertical's baseline is authored in its own theme, not patched (got ${
          Object.keys(patch).map((key) => JSON.stringify(key)).join(", ")
        })`
    );
  }
  // D-02: the plan decides what a tenant may activate, so it travels ON the
  // intent. It is refused by name here rather than defaulted, because a
  // defaulted plan is an entitlement nobody granted.
  const { entitlement } = intent;
  if (entitlement !== undefined) {
    if (
      typeof entitlement !== "object" ||
      entitlement === null ||
      Array.isArray(entitlement)
    ) {
      throw new Error("resolveTheme: intent.entitlement must be an object");
    }
    const keys = Object.keys(entitlement);
    if (keys.length !== 1 || keys[0] !== "plan") {
      throw new Error(
        `resolveTheme: intent.entitlement carries exactly \`plan\`; got ${
          keys.map((key) => JSON.stringify(key)).join(", ") || "no key"
        }`
      );
    }
    if (!(THEME_PLANS as readonly string[]).includes(entitlement.plan)) {
      throw new Error(
        `resolveTheme: unknown plan ${JSON.stringify(entitlement.plan)}; ` +
          `the closed set is ${THEME_PLANS.map((plan) => `"${plan}"`).join(", ")}`
      );
    }
  }
  // The ledger is refused by name rather than dropped: it reaches here from a
  // database row and an HTTP body, where the type is gone, and a ledger that
  // is quietly ignored is authorship that silently disappears between the gate
  // that captured it and the station that judges it.
  const { ledger } = intent;
  if (ledger !== undefined) {
    assertDecisionProvenanceLedger(ledger, "resolveTheme: intent.ledger");
    // A static-vertical intent IS the vertical's baseline, so it has no tenant
    // authorship to record. Carrying entries there would be the one shape in
    // which vertical identity could enter as tenant authorship.
    if (intent.origin === "static-vertical" && ledger.entries.length > 0) {
      throw new Error(
        "resolveTheme: a static-vertical intent carries no provenance entries; " +
          `the vertical's baseline is not tenant authorship (got ${ledger.entries.length})`
      );
    }
  }
}

/**
 * A per-request DEEP CLONE of a Theme, with no shared interior.
 *
 * `structuredClone` is not used: it is total over plain data but throws on a
 * function or a symbol, and a Theme leaf that acquired one would turn a compile
 * into a crash instead of a compile. This walker copies what a Theme can hold
 * and passes anything else through by reference, which is the same fail-open
 * posture the merge already has.
 */
function cloneThemeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneThemeValue(item)) as unknown as T;
  }
  if (value === null || typeof value !== "object") return value;
  const copy: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    copy[key] = cloneThemeValue(child);
  }
  return copy as unknown as T;
}

/**
 * The baseline a vertical names, CLONED for this request.
 *
 * The roster `Theme` is total (the three authored themes normalize through
 * `brandThemeToTheme` at module load), so a `static-vertical` intent needs no
 * patch at all and no invented neutral Theme exists to be one. The identity is
 * stamped here, once, instead of by every caller spreading `{ ...base, id }`.
 *
 * It returned the roster object ITSELF when the slug matched, which is one
 * shared mutable graph handed to every concurrent SSR request in a process
 * (F-60). The roster is frozen at its owner now, so a mutation would throw
 * rather than leak -- but a frozen baseline is also a baseline no consumer can
 * work on, so the clone is what makes the freeze usable instead of merely safe.
 */
export function baselineFor(vertical: FirstPartyVerticalId, slug: string): Theme {
  const roster = cloneThemeValue(FIRST_PARTY_THEMES[vertical]);
  return roster.id === slug ? roster : { ...roster, id: slug };
}

/**
 * The ledger is frozen HERE, at the boundary that validated it, because the
 * contract that declares the field may reference the ledger's owner as a type
 * only. An intent reaches the resolver from a database row and from a caller's
 * object graph, and a resolution sharing interior with either is a resolution
 * a later mutation rewrites.
 */
function snapshotLedger(
  ledger: ThemeIntent["ledger"]
): ThemeIntent["ledger"] {
  return ledger === undefined
    ? undefined
    : snapshotDecisionProvenanceLedger(ledger, "resolveTheme: intent.ledger");
}

export function resolveTheme(intent: ThemeIntent): ThemeResolution {
  assertThemeIntent(intent);
  const baseline = baselineFor(intent.vertical, intent.slug);
  assertThemeBaseline(baseline, "resolveTheme");
  return {
    theme: mergeThemePatches(baseline, intent.patch),
    provenance: isTenantAuthoredOrigin(intent.origin)
      ? tenantProvenance(intent.patch, snapshotLedger(intent.ledger))
      : EMPTY_PROVENANCE,
    intent,
  };
}
