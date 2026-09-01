/**
 * First-party authored themes and the full theme roster derived from the
 * lightweight vertical identity contract.
 */

import type { FirstPartyBrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  brandThemeToTheme,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  FIRST_PARTY_VERTICAL_SLUGS,
  type FirstPartyVerticalId,
} from "@/foundation/contracts/kernel/verticals";
import type { ProductProfileKey } from "@/foundation/contracts/kernel/product-profile-identity";
import type { FontPackId } from "@/foundation/tokens/css/foundation/typography/font-packs/manifest";

import { rottayBrandTheme } from "./rottay";
import { bithireBrandTheme } from "./bithire";
import { evntoBrandTheme } from "./evnto";

export { rottayBrandTheme } from "./rottay";
export { bithireBrandTheme } from "./bithire";
export { evntoBrandTheme } from "./evnto";
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
 * `tests/roster.test.ts` instead of a silently wrong path at build time.
 */
export interface FirstPartyVerticalEntry {
  /** `data-tenant` value, artifact directory, and bundle basename. */
  readonly slug: FirstPartyVerticalId;
  /** Vertical registry key. Equal to `slug` — that equality IS the law. */
  readonly verticalKey: FirstPartyVerticalId;
  /** `BrandTheme.id`. Equal to `slug`. */
  readonly themeId: FirstPartyVerticalId;
  /** Human display name, taken from the theme source. */
  readonly name: string;
  /** The authored BrandTheme source object. */
  readonly theme: FirstPartyBrandTheme;
  /** Authored source path, relative to `packages/core/src`. */
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
   * `FontPackId`, not `string`. As `string[]` the comment below claiming
   * "every pack listed is physically shipped" was unenforced prose: a typo or
   * a pack that no longer exists type-checked identically to a real one, and
   * the build silently emitted a bundle with a missing `@font-face` layer.
   * Keyed off `FONT_PACK_MANIFEST`, a stale id is now a compile error.
   */
  readonly fontPacks: readonly FontPackId[];
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
  theme: FirstPartyBrandTheme,
  extras: {
    readonly fontPacks: readonly FontPackId[];
    readonly defaultProductProfile: ProductProfileKey;
  },
): FirstPartyVerticalEntry {
  // `theme.id` IS the slug, and now says so in the type: `FirstPartyBrandTheme`
  // narrows `id` to `FirstPartyVerticalId`, so this is a plain read.
  //
  // It used to be `theme.id as FirstPartyVerticalSlug`. That cast was the
  // whole leak: a cast asserts agreement instead of proving it, so a theme
  // authored in `rottay/` could carry any id at all and the roster would build
  // a perfectly consistent-looking entry around the wrong slug — which is
  // exactly how the theme folder, the artifact directory and the registry key
  // came to disagree in the first place.
  const slug = theme.id;
  const identity = getFirstPartyIdentity(slug);
  if (!identity || identity.name !== theme.name) {
    throw new Error(`First-party theme identity mismatch for ${slug}`);
  }

  return Object.freeze({
    slug,
    verticalKey: slug,
    themeId: slug,
    name: theme.name,
    theme,
    themeSourcePath: `foundation/tokens/ts/presentation/brand-themes/${slug}/index.ts`,
    artifactPath: `foundation/tokens/css/facade/artifacts/${slug}/index.css`,
    bundleFile: `${slug}.css`,
    styleEntry: `./styles/${slug}`,
    selector: verticalSelector(slug),
    defaultMode: theme.appearance.defaultMode,
    modes: ["light", "dark"] as const,
    engine: "modern",
    fontPacks: Object.freeze([...extras.fontPacks]),
    defaultProductProfile: extras.defaultProductProfile,
  });
}

/** Full-theme roster in canonical slug order. */
export const FIRST_PARTY_VERTICAL_ROSTER: readonly FirstPartyVerticalEntry[] =
  Object.freeze([
    entry(rottayBrandTheme, {
      // Neutral sober core: one humanist text family across base/heading/
      // display, plus the mono register. No display face on purpose — Rottay
      // is the baseline the other two are read against.
      //
      // Every pack listed for any vertical is physically shipped — see
      // FONT_PACK_MANIFEST. A family that is not in a pack is not available to
      // a first-party theme, however common it is on a designer's machine.
      fontPacks: ["humanist-text", "plex-mono"],
      defaultProductProfile: "rottay.admin",
    }),
    entry(bithireBrandTheme, {
      fontPacks: ["grotesk-display", "humanist-text", "plex-mono"],
      defaultProductProfile: "recruiting.operator",
    }),
    entry(evntoBrandTheme, {
      fontPacks: ["geometric-display", "humanist-text", "plex-mono"],
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

/**
 * The canonical first-party ISO Themes, derived from the BrandTheme sources
 * this barrel already owns.
 *
 * This lived in a `first-party-themes.ts` leaf beside the three vertical
 * folders, re-exported from here. The leaf's whole content was the three-line
 * record below, over the same three imports this file already had -- so the
 * indirection bought nothing and cost the tree its ownership shape: the
 * brand-themes root is supposed to hold the barrel and the three vertical
 * folders, and nothing else. Folded in, with no compatibility re-export left
 * behind.
 */
export const FIRST_PARTY_THEMES: Record<FirstPartyVerticalId, Theme> = {
  rottay: brandThemeToTheme(rottayBrandTheme),
  bithire: brandThemeToTheme(bithireBrandTheme),
  evnto: brandThemeToTheme(evntoBrandTheme),
};
