import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { normalizeThemeSource } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { SemanticTypographyRoleTokens } from "@/foundation/contracts/kernel/tokens/typography";

import { compileTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering";
import { firstPartyFixture, lowerBrandThemeFixture, themeSourceOf } from "@tests/support/theme-lowering";
import { EMPTY_PROVENANCE } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import { containerScope, emitThemeCss } from "../../emission";
import { brandTenantSelector } from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";

const bithireBrandTheme = firstPartyFixture('bithire');
const evntoBrandTheme = firstPartyFixture('evnto');
const rottayBrandTheme = firstPartyFixture('rottay');

/**
 * The two lowerings of one authored theme:
 *   leg A — the static BrandTheme transport, compiled directly.
 *   leg B — the ISO transport: BrandTheme -> Theme -> governed intake -> compile.
 * Both must produce the SAME artifact. The ISO bridge materializes complete
 * containers, so leg B carries role keys that are present with the value
 * `undefined`; the compiler compacts those spread sources so a key that carries
 * no value does not participate in the merge (see `omitUndefined`).
 */
const FIRST_PARTY = [
  ["rottay", rottayBrandTheme],
  ["bithire", bithireBrandTheme],
  ["evnto", evntoBrandTheme],
] as const;

/** Every own key of a role, materialized with no value — the bridge skeleton. */
const ROLE_SKELETON: SemanticTypographyRoleTokens = {
  fontFamily: undefined,
  fontSize: undefined,
  fontWeight: undefined,
  lineHeight: undefined,
  letterSpacing: undefined,
  textTransform: undefined,
  fontVariantNumeric: undefined,
};

type Compiled = ReturnType<typeof lowerBrandThemeFixture>;

function legA(brandTheme: BrandTheme): Compiled {
  return lowerBrandThemeFixture({ brandTheme, tenantSlug: brandTheme.id });
}

/**
 * Leg B still means something with one lowering left: both legs call the same
 * door, so the comparison now isolates the ISO NORMALIZER. Leg A lifts the
 * authored theme wrap-only; leg B routes it through `normalizeThemeSource`, which
 * also completes shapes and materializes declared keys. Identical digests are
 * the proof that completion changes no compiled byte.
 */
function legB(brandTheme: BrandTheme): Compiled {
  const slug = brandTheme.id;
  // The normalizer's own output, lowered directly. It cannot go through the
  // intent door: the door reads the roster, so it would compare the roster's
  // theme to itself instead of comparing the two lifts.
  const compiled = compileTheme(
    { theme: normalizeThemeSource(themeSourceOf(brandTheme)), provenance: EMPTY_PROVENANCE },
    resolveAdapter("modern")
  );
  return {
    cssVariables: { ...compiled.cssVariables },
    cssString: emitThemeCss(compiled, containerScope(brandTenantSelector(slug))),
    personality: compiled.runtime.personality,
    tokenOverrides: compiled.runtime.tokenOverrides,
    ...(compiled.runtime.recipeProfile
      ? { recipeProfile: compiled.runtime.recipeProfile }
      : {}),
    ...(compiled.runtime.experienceProfile
      ? { experienceProfile: compiled.runtime.experienceProfile }
      : {}),
    ...(compiled.colorScheme ? { colorScheme: compiled.colorScheme } : {}),
    ...(compiled.modeBlocks.length > 0 ? { modeBlocks: compiled.modeBlocks } : {}),
  };
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const ordered: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      ordered[key] = stable((value as Record<string, unknown>)[key]);
    }
    return ordered;
  }
  return value;
}

function surfaceDigest(compiled: Compiled): string {
  return createHash("sha256")
    .update(
      JSON.stringify(
        stable({
          cssVariables: compiled.cssVariables,
          cssString: compiled.cssString,
          colorScheme: compiled.colorScheme ?? null,
          modeBlocks: compiled.modeBlocks ?? null,
          personality: compiled.personality,
          tokenOverrides: compiled.tokenOverrides,
          recipeProfile: compiled.recipeProfile ?? null,
          experienceProfile: compiled.experienceProfile ?? null,
        })
      )
    )
    .digest("hex");
}

function typeChannels(compiled: Compiled): Record<string, string> {
  const channels: Record<string, string> = {};
  for (const [name, value] of Object.entries(compiled.cssVariables)) {
    if (name.startsWith("--ds-type-")) channels[name] = value;
  }
  return channels;
}

/** Every variable the compile emits: the base block plus every mode block. */
function everyEmittedEntry(compiled: Compiled): Array<[string, string]> {
  const entries = Object.entries(compiled.cssVariables);
  for (const block of compiled.modeBlocks ?? []) {
    entries.push(...Object.entries(block.cssVariables));
  }
  return entries;
}

type OrderedDiff = {
  index: number;
  legA: string | undefined;
  legB: string | undefined;
};

/**
 * Positional — ORDER-SENSITIVE — difference between two ordered lists. `toEqual`
 * on the compiled containers is deliberately order-insensitive and proves the
 * two legs carry the same channels and the same values; this is the complement
 * that sees the one thing `toEqual` cannot: authored emission order.
 */
function orderedDiff(
  fromLegA: readonly string[],
  fromLegB: readonly string[]
): OrderedDiff[] {
  const diff: OrderedDiff[] = [];
  const length = Math.max(fromLegA.length, fromLegB.length);
  for (let index = 0; index < length; index += 1) {
    if (fromLegA[index] !== fromLegB[index]) {
      diff.push({ index, legA: fromLegA[index], legB: fromLegB[index] });
    }
  }
  return diff;
}

/** The emitted lines as a multiset: equal here means an order-only move. */
function sortedLines(css: string): string[] {
  return css.split("\n").sort();
}

/** Own key order of one authored mode block. */
function modeBlockKeys(compiled: Compiled, mode: string): string[] {
  const block = (compiled.modeBlocks ?? []).find(
    (entry) => entry.mode === mode
  );
  return Object.keys(block?.cssVariables ?? {});
}

/** True when this css line declares exactly `channel`. */
function declares(line: string | undefined, channel: string): boolean {
  return (line ?? "").trim().startsWith(`${channel}:`);
}

/** One authored source block, addressed by path. */
function authoredBlock(
  brandTheme: BrandTheme,
  path: readonly string[]
): Record<string, unknown> {
  let cursor: unknown = brandTheme;
  for (const step of path) cursor = (cursor as Record<string, unknown>)[step];
  return cursor as Record<string, unknown>;
}

/** Own key order of an authored source block. */
function authoredKeys(
  brandTheme: BrandTheme,
  path: readonly string[]
): string[] {
  return Object.keys(authoredBlock(brandTheme, path));
}

/**
 * Re-authors one nested source block with the SAME keys and the SAME values in
 * a different order — a permutation that changes nothing but authoring order.
 */
function withRotatedBlock(
  brandTheme: BrandTheme,
  path: readonly string[]
): BrandTheme {
  const clone = structuredClone(brandTheme) as unknown as Record<
    string,
    unknown
  >;
  let owner = clone;
  for (const step of path.slice(0, -1)) {
    owner = owner[step] as Record<string, unknown>;
  }
  const leaf = path[path.length - 1];
  const block = owner[leaf] as Record<string, unknown>;
  const keys = Object.keys(block);
  const rotated: Record<string, unknown> = {};
  for (const key of [...keys.slice(1), keys[0]]) rotated[key] = block[key];
  owner[leaf] = rotated;
  return clone as unknown as BrandTheme;
}

describe("semantic typography roles", () => {
  it("emits complete defaults and accepts bounded first-party role overrides", () => {
    const compiled = lowerBrandThemeFixture({
      tenantSlug: "type-proof",
      brandTheme: {
        id: "type-proof",
        name: "Type proof",
        typography: {
          roles: {
            pageTitle: { fontSize: "1.75rem", fontWeight: 650 },
            numeric: { fontFamily: "var(--ds-font-family-mono)" },
          },
        },
      },
    });

    expect(compiled.cssVariables).toMatchObject({
      "--ds-type-display-font-family":
        "var(--ds-font-family-display, var(--ds-font-family-heading))",
      "--ds-type-page-title-font-size": "1.75rem",
      "--ds-type-page-title-font-weight": "650",
      "--ds-type-body-font-family": "var(--ds-font-family-base)",
      "--ds-type-code-font-family": "var(--ds-font-family-mono)",
      "--ds-type-numeric-font-family": "var(--ds-font-family-mono)",
      "--ds-type-numeric-font-variant-numeric": "tabular-nums lining-nums",
      "--ds-type-page-title":
        "var(--ds-type-page-title-font-weight) var(--ds-type-page-title-font-size)/var(--ds-type-page-title-line-height) var(--ds-type-page-title-font-family)",
    });
  });
});

describe("cross-lowering equality of the first-party themes", () => {
  for (const [slug, brandTheme] of FIRST_PARTY) {
    // T1 — the family the bridge skeleton reaches, channel by channel.
    it(`${slug}: every --ds-type-* channel is identical in both lowerings`, () => {
      expect(typeChannels(legB(brandTheme))).toEqual(
        typeChannels(legA(brandTheme))
      );
    });

    // T2 — the whole artifact, not just the family under repair. Any residual
    // here is a SECOND defect, not a tolerable gap: it fails, it is not pinned.
    it(`${slug}: the complete compiled surface is identical in both lowerings`, () => {
      const a = legA(brandTheme);
      const b = legB(brandTheme);
      expect(b.cssVariables).toEqual(a.cssVariables);
      expect(b.cssString).toBe(a.cssString);
      expect(b.colorScheme).toBe(a.colorScheme);
      expect(b.modeBlocks ?? null).toEqual(a.modeBlocks ?? null);
    });

    // T5 — permanent tripwire. `String(undefined)` must never reach a value,
    // in either lowering, in the base block or in any mode block.
    it(`${slug}: no compiled value is the literal string "undefined"`, () => {
      for (const compiled of [legA(brandTheme), legB(brandTheme)]) {
        const leaked = everyEmittedEntry(compiled)
          .filter(([, value]) => value === "undefined")
          .map(([name]) => name);
        expect(leaked).toEqual([]);
      }
    });
  }
});

/**
 * M3 — the authored-order law.
 *
 * The residual above is an ORDER defect, so the tripwire that guards it has to
 * be able to see authored order. This law states the asymmetry directly, on a
 * synthetic permutation of the source that changes no key and no value:
 *   - leg B is byte-INVARIANT under it, because the ISO bridge re-materializes
 *     the canonical shape and discards authoring order;
 *   - leg A DEVIATES under it, because the static transport carries authoring
 *     order straight through to the emitted css.
 * That asymmetry is exactly what makes an order-only source edit able to move
 * the leg-A digest while moving no pixel, and it is what a future change to the
 * merge machinery must not silently repeal. Both directions are asserted, so
 * the law fails if leg B starts leaking order AND if leg A stops carrying it.
 *
 * The permutation is applied through the same `withRotatedBlock` /
 * `orderedDiff` / `sortedLines` helpers the residual law enforces through, so a
 * mutant planted in any of them is causal for both.
 */
describe("authored-order law", () => {
  const ROTATED_BLOCK = ["chrome", "tooltip"] as const;

  /**
   * The law's subject: a theme that AUTHORS an ordered chrome block.
   *
   * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset; the
   * retired authored themes were the only source in this tree that ever handed
   * the static transport a hand-ordered block (rottay's `chrome.tooltip`, 11
   * keys, first divergence `--ds-tooltip-bg` / `--ds-tooltip-color`). No preset
   * authors chrome and the ISO normalizer materializes the container in
   * canonical order with no values, so the block is authored HERE -- the same
   * shape the transport used to receive, four keys instead of eleven. Measured
   * on both trees: a customer theme never carried order in either, because its
   * chrome families are deriver-owned; only a spread-emitted block does.
   */
  const AUTHORED_ORDER_SUBJECT: BrandTheme = {
    ...rottayBrandTheme,
    chrome: {
      ...rottayBrandTheme.chrome,
      tooltip: {
        bg: "#101014",
        color: "#F5F5F7",
        defaultBg: "#17171C",
        defaultColor: "#E8E8EC",
      },
    },
  };

  it("a source permutation changes authoring order and nothing else", () => {
    const permuted = withRotatedBlock(AUTHORED_ORDER_SUBJECT, ROTATED_BLOCK);
    const before = authoredKeys(AUTHORED_ORDER_SUBJECT, ROTATED_BLOCK);
    const after = authoredKeys(permuted, ROTATED_BLOCK);

    expect(after).not.toEqual(before);
    expect([...after].sort()).toEqual([...before].sort());
    expect(authoredBlock(permuted, ROTATED_BLOCK)).toEqual(
      authoredBlock(AUTHORED_ORDER_SUBJECT, ROTATED_BLOCK)
    );
  });

  it("leg B is byte-invariant under a source permutation", () => {
    const base = legB(AUTHORED_ORDER_SUBJECT);
    const permuted = legB(withRotatedBlock(AUTHORED_ORDER_SUBJECT, ROTATED_BLOCK));

    expect(permuted.cssString).toBe(base.cssString);
    expect(Object.keys(permuted.cssVariables)).toEqual(
      Object.keys(base.cssVariables)
    );
    expect(surfaceDigest(permuted)).toBe(surfaceDigest(base));
  });

  it("leg A carries the permutation, and the deviation is order-only", () => {
    const base = legA(AUTHORED_ORDER_SUBJECT);
    const permuted = legA(withRotatedBlock(AUTHORED_ORDER_SUBJECT, ROTATED_BLOCK));

    // Detected: the static transport moved.
    expect(
      orderedDiff(
        Object.keys(base.cssVariables),
        Object.keys(permuted.cssVariables)
      )
    ).not.toEqual([]);
    expect(surfaceDigest(permuted)).not.toBe(surfaceDigest(base));

    // ...and moved by order ALONE — same lines, same channels, same values.
    expect(sortedLines(permuted.cssString)).toEqual(sortedLines(base.cssString));
    expect(permuted.cssVariables).toEqual(base.cssVariables);
    expect(permuted.modeBlocks ?? null).toEqual(base.modeBlocks ?? null);
  });
});

describe("present-with-undefined role keys", () => {
  // T3 — a materialized key with no value must not participate in the merge:
  // it neither emits "undefined" nor deletes the default it sits on top of,
  // while a key that DOES carry a value still wins.
  it("falls through to the default and still lets an authored value win", () => {
    const control = lowerBrandThemeFixture({
      tenantSlug: "skeleton-control",
      brandTheme: { id: "skeleton-control", name: "Control" },
    }).cssVariables;

    const skeletal = lowerBrandThemeFixture({
      tenantSlug: "skeleton-probe",
      brandTheme: {
        id: "skeleton-probe",
        name: "Probe",
        typography: {
          roles: {
            pageTitle: { ...ROLE_SKELETON, fontWeight: 650 },
            body: { ...ROLE_SKELETON },
          },
        },
      },
    }).cssVariables;

    expect(
      Object.entries(skeletal).filter(([, value]) => value === "undefined")
    ).toEqual([]);

    // The default font-size survives an all-undefined authored role.
    expect(skeletal["--ds-type-page-title-font-size"]).toBe(
      control["--ds-type-page-title-font-size"]
    );
    expect(skeletal["--ds-type-page-title-font-size"]).toBeDefined();
    expect(skeletal["--ds-type-page-title-line-height"]).toBe(
      control["--ds-type-page-title-line-height"]
    );
    // `body` declares no default font-size, so the channel stays unemitted
    // rather than being emitted with a placeholder.
    expect("--ds-type-body-font-size" in skeletal).toBe(
      "--ds-type-body-font-size" in control
    );
    // A key that carries a value still overrides the default.
    expect(skeletal["--ds-type-page-title-font-weight"]).toBe("650");
    expect(skeletal["--ds-type-page-title-font-weight"]).not.toBe(
      control["--ds-type-page-title-font-weight"]
    );
  });

  // T4 — the label-case regression. `labelStyle` is authored one level above
  // `typography.roles.label`; a skeletal label role must not stomp it. This is
  // the mechanical counterfactual: compacting only the role emitter leaves this
  // red, because the value is destroyed in the caller before the emitter runs.
  it("keeps an authored labelStyle when the label role arrives as a skeleton", () => {
    const probe = lowerBrandThemeFixture({
      tenantSlug: "label-case-probe",
      brandTheme: {
        id: "label-case-probe",
        name: "Label case probe",
        typography: {
          labelStyle: "capitalize",
          roles: { label: { ...ROLE_SKELETON } },
        },
      },
    }).cssVariables;

    expect(probe["--ds-type-label-text-transform"]).toBe("capitalize");

    // ...and an explicitly authored role value still outranks labelStyle.
    const explicit = lowerBrandThemeFixture({
      tenantSlug: "label-case-explicit",
      brandTheme: {
        id: "label-case-explicit",
        name: "Label case explicit",
        typography: {
          labelStyle: "capitalize",
          roles: { label: { ...ROLE_SKELETON, textTransform: "uppercase" } },
        },
      },
    }).cssVariables;

    expect(explicit["--ds-type-label-text-transform"]).toBe("uppercase");
  });

  // T4 (first-party leg): the channel stays a live regression surface for a
  // real artifact, in both legs. D6-2c-ii (2026-09-15): tenant-document
  // compiles over neutral + preset; the subject moves from evnto's authored
  // `labelStyle: "capitalize"` to bithire, whose expressive profile
  // (`rottay/bithire-technical@1`, type `technical`) drives the same channel to
  // `uppercase`. No preset authors `labelStyle`, so rottay and evnto now take
  // the DS default `none` -- measured, and asserted here so the vertical that
  // does drive the channel cannot go quiet unnoticed.
  it("bithire emits its profile-driven label case in both lowerings", () => {
    expect(legA(bithireBrandTheme).cssVariables["--ds-type-label-text-transform"]).toBe(
      "uppercase"
    );
    expect(legB(bithireBrandTheme).cssVariables["--ds-type-label-text-transform"]).toBe(
      "uppercase"
    );
    expect(legA(evntoBrandTheme).cssVariables["--ds-type-label-text-transform"]).toBe(
      "none"
    );
  });
});
