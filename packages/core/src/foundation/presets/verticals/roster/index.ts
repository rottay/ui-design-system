/**
 * @fileoverview The first-party vertical roster: identity, engine, font
 * packs, product profile and the paths derived from the slug. No visual
 * theme lives here -- the roster names a vertical, it does not paint it.
 *
 * @module Foundation/Presets/Verticals/roster
 * @category Foundation
 * @package @rottay/design-system
 */

import {
  FIRST_PARTY_VERTICAL_SLUGS,
  type FirstPartyVerticalId,
} from "@/foundation/contracts/kernel/verticals";
import type { ProductProfileKey } from "@/foundation/contracts/kernel/product-profile-identity";
import type { TenantThemeFontPackId } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";

export { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";

export interface FirstPartyIdentity {
  readonly slug: FirstPartyVerticalId;
  readonly verticalKey: FirstPartyVerticalId;
  readonly name: string;
}

const FIRST_PARTY_IDENTITY_NAMES = Object.freeze({
  rottay: "Rottay",
  bithire: "BitHire",
  evnto: "Evnto",
} satisfies Record<FirstPartyVerticalId, string>);

type FirstPartyIdentitiesOf<T extends readonly FirstPartyVerticalId[]> = {
  readonly [K in keyof T]: T[K] extends FirstPartyVerticalId
    ? Readonly<{
        slug: T[K];
        verticalKey: T[K];
        name: (typeof FIRST_PARTY_IDENTITY_NAMES)[T[K]];
      }>
    : T[K];
};

export const FIRST_PARTY_IDENTITIES = Object.freeze(
  FIRST_PARTY_VERTICAL_SLUGS.map((slug) =>
    Object.freeze({
      slug,
      verticalKey: slug,
      name: FIRST_PARTY_IDENTITY_NAMES[slug],
    }),
  ),
) as FirstPartyIdentitiesOf<typeof FIRST_PARTY_VERTICAL_SLUGS>;

export const RESERVED_FIRST_PARTY_NAMES = Object.freeze(
  FIRST_PARTY_IDENTITIES.map((identity) => identity.name),
);

/**
 * Everything Unicode itself defines as having no visible rendering: the
 * zero-width set (ZWSP/ZWNJ/ZWJ/BOM/word joiner), the bidi controls, the soft
 * hyphen, the variation selectors, the Hangul fillers, and the combining
 * grapheme joiner. This is the "explicit zero-width" class, taken from the
 * standard rather than hand-listed, because a hand-list is a bypass surface --
 * every codepoint it forgets is an invisible character that survives into the
 * fingerprint and lets a reserved name through. `Default_Ignorable_Code_Point`
 * is exactly the enumeration, and it is stable across Unicode versions.
 *
 * Critically it does NOT contain a single visible combining mark: U+0301
 * ACUTE, U+0307 DOT ABOVE and U+0338 LONG SOLIDUS OVERLAY are all outside it.
 * That is the asymmetry this gate needs. It catches U+034F COMBINING GRAPHEME
 * JOINER, which IS a `\p{M}` mark but renders as nothing at all -- so
 * "Ro<CGJ>ttay" reads as "Rottay" to a human and must not be admitted.
 */
const IDENTITY_INVISIBLES = /\p{Default_Ignorable_Code_Point}/gu;

/**
 * Separators and punctuation only. Symbols (`\p{S}`) are deliberately absent:
 * "Rottay+" and "Rottay(TM)" are names a human reads as different, and a
 * customer is entitled to them.
 *
 * No separate `.trim()` runs before this: `\s` and `\p{Z}` erase whitespace
 * wherever it sits, so leading and trailing whitespace is already gone by
 * construction and a trim call would be dead code, not defense.
 */
const IDENTITY_SEPARATORS_AND_PUNCTUATION = /[\s\p{Z}\p{P}]/gu;

/**
 * Fold a candidate identity onto the form the reserved-name comparison uses.
 *
 * The contract is exactness in BOTH directions, and the second is the one that
 * is easy to lose: every variant that renders as a reserved name is rejected,
 * and every name that renders differently is admitted. Erasing `\p{M}` and
 * `\p{S}` wholesale satisfies only the first -- it also collapses "Rottay"
 * spelled with a diaeresis, and "Rottay" followed by a trademark sign, onto
 * the reserved fingerprint, refusing two legitimate customers to catch
 * nothing a reader would confuse. NFKC composes
 * rather than decomposes for the same reason: NFKD splits an accented letter
 * into a base plus a mark, and the mark then has to survive on its own for the
 * name to stay distinct.
 */
export function normalizeIdentityFingerprint(value: string): string {
  return value
    .normalize("NFKC")
    .replace(IDENTITY_INVISIBLES, "")
    .toLowerCase()
    .replace(IDENTITY_SEPARATORS_AND_PUNCTUATION, "");
}

const RESERVED_IDENTITY_FINGERPRINTS: ReadonlyMap<string, string> = new Map(
  FIRST_PARTY_IDENTITIES.flatMap((identity) => [identity.slug, identity.name]).map(
    (reserved) => [normalizeIdentityFingerprint(reserved), reserved],
  ),
);

export interface TenantIdentityCandidate {
  readonly slug?: unknown;
  readonly name?: unknown;
  readonly companyName?: unknown;
  readonly verticalKey?: unknown;
}

export type ReservedIdentityField = "slug" | "name" | "companyName";

export type TenantIdentityClassification =
  | { readonly kind: "customer" }
  | {
      readonly kind: "reserved-identity-violation";
      readonly field: ReservedIdentityField;
      readonly value: string;
      readonly reservedAs: string;
    };

function reservedIdentityMatch(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const fingerprint = normalizeIdentityFingerprint(value);
  return fingerprint.length > 0
    ? RESERVED_IDENTITY_FINGERPRINTS.get(fingerprint)
    : undefined;
}

export function isFirstPartyVerticalId(
  value: unknown,
): value is FirstPartyVerticalId {
  return (
    typeof value === "string" &&
    (FIRST_PARTY_VERTICAL_SLUGS as readonly string[]).includes(value)
  );
}

export function getFirstPartyIdentity(
  slug: unknown,
): FirstPartyIdentity | undefined {
  return typeof slug === "string"
    ? FIRST_PARTY_IDENTITIES.find((identity) => identity.slug === slug)
    : undefined;
}

export function classifyTenantIdentity(
  candidate: TenantIdentityCandidate,
): TenantIdentityClassification {
  for (const field of ["slug", "name", "companyName"] as const) {
    const value = candidate[field];
    const reservedAs = reservedIdentityMatch(value);
    if (reservedAs !== undefined) {
      return {
        kind: "reserved-identity-violation",
        field,
        value: value as string,
        reservedAs,
      };
    }
  }
  return { kind: "customer" };
}

export function isTenantIdentityAllowed(
  candidate: TenantIdentityCandidate,
): boolean {
  return classifyTenantIdentity(candidate).kind === "customer";
}

export function describeReservedIdentityViolation(
  violation: Extract<
    TenantIdentityClassification,
    { kind: "reserved-identity-violation" }
  >,
): string {
  return (
    `Tenant ${violation.field} ${JSON.stringify(violation.value)} is reserved: ` +
    `it resolves to the code-owned first-party identity ${JSON.stringify(violation.reservedAs)}`
  );
}

export class ReservedTenantIdentityError extends Error {
  readonly classification: Extract<
    TenantIdentityClassification,
    { kind: "reserved-identity-violation" }
  >;

  constructor(
    classification: Extract<
      TenantIdentityClassification,
      { kind: "reserved-identity-violation" }
    >,
  ) {
    super(`[design-system] ${describeReservedIdentityViolation(classification)}`);
    this.name = "ReservedTenantIdentityError";
    this.classification = classification;
  }
}

export function assertTenantIdentityAllowed(
  candidate: TenantIdentityCandidate,
): void {
  const classification = classifyTenantIdentity(candidate);
  if (classification.kind === "reserved-identity-violation") {
    throw new ReservedTenantIdentityError(classification);
  }
}

/**
 * Everything about one first-party vertical that is DERIVED from its slug.
 *
 * Every path-shaped field is a function of `slug` alone. They are spelled out
 * rather than templated at the use site so that a reader can see the whole
 * identity in one place, and so a mismatch is a failing assertion in
 * `tests/index.test.ts` instead of a silently wrong path at build time.
 *
 * The visual theme is NOT a field: the roster names a vertical, and the theme
 * a vertical compiles is resolved by slug where the compile happens.
 */
export interface FirstPartyVerticalEntry {
  /** `data-tenant` value, artifact directory, and bundle basename. */
  readonly slug: FirstPartyVerticalId;
  /** Vertical registry key. Equal to `slug` — that equality IS the law. */
  readonly verticalKey: FirstPartyVerticalId;
  /** The id the vertical's theme carries. Equal to `slug`. */
  readonly themeId: FirstPartyVerticalId;
  /** Human display name, the reserved first-party identity. */
  readonly name: string;
  /** The preset document the vertical compiles from, relative to `packages/core/src`. */
  readonly themeSourcePath: string;
  /** Generated artifact CSS, relative to `packages/core/src`. */
  readonly artifactPath: string;
  /** Generated per-vertical bundle basename under `dist/` and `styles/`. */
  readonly bundleFile: string;
  /** Public package export subpath for that bundle. */
  readonly styleEntry: string;
  /** The selector every generated tenant rule for this vertical keys on. */
  readonly selector: string;
  /** Mode this vertical's base values ARE; drives emitted `color-scheme`. */
  readonly defaultMode: "light" | "dark";
  /** Every mode the vertical actually resolves, in canonical order. */
  readonly modes: readonly ["light", "dark"];
  /** Default engine. */
  readonly engine: "modern";
  /**
   * Font packs this vertical's envelope enables, in role order.
   *
   * A closed id, not `string`. As `string[]` the comment below claiming
   * "every pack listed is physically shipped" was unenforced prose: a typo or
   * a pack that no longer exists type-checked identically to a real one, and
   * the build silently emitted a bundle with a missing `@font-face` layer.
   * The vocabulary is the tenant-theme contract's, which the roster tests pin
   * against `FONT_PACK_MANIFEST`, so a stale id is a compile error.
   */
  readonly fontPacks: readonly TenantThemeFontPackId[];
  /** Default product profile id, from the closed profile vocabulary. */
  readonly defaultProductProfile: ProductProfileKey;
}

/**
 * The selector shape every generated tenant rule uses, restated once.
 *
 * Two arms: a legacy document-root arm and a nested-provider arm. SSR emits
 * all three attributes on one element so both arms match it.
 */
function verticalSelector(slug: FirstPartyVerticalId): string {
  return `:is(html[data-tenant='${slug}'], :where([data-ds-root][data-vertical='${slug}']))`;
}

function entry(
  slug: FirstPartyVerticalId,
  extras: {
    readonly defaultMode: FirstPartyVerticalEntry["defaultMode"];
    readonly fontPacks: readonly TenantThemeFontPackId[];
    readonly defaultProductProfile: ProductProfileKey;
  },
): FirstPartyVerticalEntry {
  const identity = getFirstPartyIdentity(slug);
  if (!identity) {
    throw new Error(`First-party vertical ${slug} has no identity`);
  }

  return Object.freeze({
    slug,
    verticalKey: slug,
    themeId: slug,
    name: identity.name,
    themeSourcePath: `foundation/presets/verticals/${slug}/document/index.json`,
    artifactPath: `foundation/tokens/css/facade/artifacts/${slug}/index.css`,
    bundleFile: `${slug}.css`,
    styleEntry: `./styles/${slug}`,
    selector: verticalSelector(slug),
    defaultMode: extras.defaultMode,
    modes: ["light", "dark"] as const,
    engine: "modern",
    fontPacks: Object.freeze([...extras.fontPacks]),
    defaultProductProfile: extras.defaultProductProfile,
  });
}

/**
 * The mode a theme resolves to when neither it nor this roster declares one.
 *
 * THE PACKAGE'S ONLY LITERAL DEFAULT MODE. It lives with the roster because
 * the roster is what answers the question for every theme that has an
 * identity; this covers the remainder, and `compilers/kernel/foundation/modes`
 * is its only reader. Thirteen copies of this literal used to be spread across
 * the ingress, the lowering, the artifact terminal, the SSR projection and the
 * studio, and on the one vertical whose baseline is dark every one of them was
 * wrong in a different place.
 */
export const UNDECLARED_VERTICAL_DEFAULT_MODE: FirstPartyVerticalEntry["defaultMode"] =
  "light";

/** Roster in canonical slug order. */
export const FIRST_PARTY_VERTICAL_ROSTER: readonly FirstPartyVerticalEntry[] =
  Object.freeze([
    entry("rottay", {
      // Neutral sober core: one humanist text family across base/heading/
      // display, plus the mono register. No display face on purpose — Rottay
      // is the baseline the other two are read against.
      //
      // Every pack listed for any vertical is physically shipped — see
      // FONT_PACK_MANIFEST. A family that is not in a pack is not available to
      // a first-party theme, however common it is on a designer's machine.
      //
      // `arabic-text` closes every row because it is coverage, not style: it
      // ships the family `withArabicSafeFallback` compiles into every stack,
      // and its `unicode-range` keeps a latin page from fetching it.
      defaultMode: "dark",
      fontPacks: ["humanist-text", "plex-mono", "arabic-text"],
      defaultProductProfile: "rottay.admin",
    }),
    entry("bithire", {
      defaultMode: "light",
      fontPacks: [
        "grotesk-display",
        "humanist-text",
        "plex-mono",
        "arabic-text",
      ],
      defaultProductProfile: "recruiting.operator",
    }),
    entry("evnto", {
      defaultMode: "light",
      fontPacks: [
        "geometric-display",
        "humanist-text",
        "plex-mono",
        "arabic-text",
      ],
      defaultProductProfile: "events.organizer",
    }),
  ]);

/** Slug-keyed view of the roster. Iteration order matches the roster. */
export const FIRST_PARTY_VERTICALS: Readonly<
  Record<FirstPartyVerticalId, FirstPartyVerticalEntry>
> = Object.freeze(
  Object.fromEntries(
    FIRST_PARTY_VERTICAL_ROSTER.map((row) => [row.slug, row]),
  ) as Record<FirstPartyVerticalId, FirstPartyVerticalEntry>,
);

/**
 * Resolves a roster entry by slug. Returns `undefined` for anything else —
 * customer tenants are not in the roster and must not be synthesised into it.
 */
export function getFirstPartyVertical(
  slug: string,
): FirstPartyVerticalEntry | undefined {
  return isFirstPartyVerticalId(slug)
    ? FIRST_PARTY_VERTICALS[slug]
    : undefined;
}
