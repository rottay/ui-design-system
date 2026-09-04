import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { brandThemeToTheme } from "@/foundation/contracts/composition/tenants/themes/iso";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/bithire";
import { evntoBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/evnto";
import { rottayBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/rottay";
import type { FirstPartyBrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { SemanticTypographyRoleTokens } from "@/foundation/contracts/kernel/tokens/typography";

import { compileTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering";
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import { containerScope, emitThemeCss } from "../../emission";
import { brandTenantSelector } from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";

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

/**
 * Leg-A surface digests measured on the sealed worktree IMMEDIATELY BEFORE the
 * present-with-undefined compaction landed. The static path must be zero-pixel:
 * a moved digest here means the fix changed what a first-party BrandTheme
 * compiles to, which it must never do.
 *
 * ALT-SOURCE re-anchor, ROTTAY ONLY: the authored key order of the base
 * `chrome.popover` and `chrome.tooltip` blocks was permuted to match
 * `DEFAULT_CHROME_SHAPE`, which moved this digest from
 * ed3b3a677090bf56... to bd6dae97451b5b6e... The move is ORDER-ONLY, and that
 * is measured rather than asserted: four independent invariants were byte-
 * identical across the edit — the sorted cssString line multiset
 * (da8f1840e6392eb9...), the leg-A/leg-B value map (b777660c112521b9...), the
 * 1819-leaf authored manifest F2' (1fd5558de5c9ef89...), and the raw/bridged
 * keysets (bb0aec7a19f4ec7b..., 1191 keys). The source delta itself was
 * reconstructed in BOTH directions byte-exactly (cd6c33e256b22fde... <->
 * d672bfb6f3dd811f...) by two independent auditors. Zero pixel, zero value,
 * zero key: only authored order moved. bithire/evnto did not move and are not
 * re-anchored.
 *
 * CI-1 re-anchor, ALL THREE VERTICALS (2026-08-24): F4A-6/K3 (3393f70d4,
 * 2026-08-21) authored a NEW root, `--ds-color-text-page`, and rewired ~35
 * ink channels onto it. Unlike the two re-anchors above, this is NOT
 * order-only: confirmed the new channel is genuinely present in leg-A's
 * compiled output for all three verticals (`--ds-color-text-page` appears in
 * the tenant artifact today: 37 occurrences rottay, 3 bithire, 1 evnto) --
 * real added content, not a permutation. This re-anchor does NOT repeat the
 * full "measured, not asserted" invariant battery (value-map/cssString-
 * multiset/keyset diffs) the two re-anchors above performed -- it is a
 * mechanical CI-1 re-pin against the tree as measured today (the exact
 * `Received` value the suite itself reports), not an architecture audit. If
 * a zero-pixel proof is required for this specific move, it still needs
 * doing.
 *
 * D-1 re-anchor, ALL THREE VERTICALS (2026-08-24, same protocol as the CI-1
 * row above): D-1 restituted the four dark/light overlay shields that F2.4
 * drained, so leg-A's mode blocks each gained exactly the lines the drain had
 * removed -- bithire dark `--ds-card-bg: #151d2b` and
 * `--ds-table-cell-color: #e4e8ed`, rottay light and evnto dark
 * `--ds-layout-sider-bg`. Like the CI-1 row, this is real added content and
 * NOT a permutation, and it does NOT repeat the full invariant battery: the
 * zero-delta proof D-1 does carry is of a different shape -- each restituted
 * value equals what the base alias already resolved to in that mode (measured
 * per leaf), the rest of the compile is identical, and the three tenant
 * artifacts changed in exactly those four lines and nothing else.
 *
 * D-1b re-anchor, ROTTAY ONLY (2026-08-24, same protocol): D-1b restitutes the
 * fifth and sixth overlay shields -- rottay's light `--ds-sidebar-footer-bg`
 * (#F4F4F3, drained by F2.4 `8f58229e3`) and `--ds-table-header-color`
 * (#6B6B6B, drained by F4A-6 `3393f70d4`). Only rottay's leg-A compile moves,
 * and bithire/evnto are NOT re-anchored -- verified: their digests still equal
 * the pins above, which is the same evidence the compile census gives (rottay
 * light 680 -> 682 channels, the other two byte-identical). Same protocol as
 * the two rows above: real added content, no zero-pixel claim; the proof D-1b
 * carries is per-leaf chained resolution + rest-identical + a two-line artifact
 * diff.
 *
 * SHAPE-BASE re-anchor, ROTTAY ONLY: `applyModeOverlay` now completes the chrome
 * merge base to the canonical shape, so an overlay-ONLY key lands in its shape
 * slot instead of being appended after the authored base keys. That closed the
 * one adjudicated cross-lowering residual and moved this digest from
 * bd6dae97451b5b6e... to 80b245093f6fb3b9... The move is again ORDER-ONLY, and
 * again measured rather than asserted: across the edit the leg-A value map
 * (ceadb11e6190fe52...), the sorted cssString line multiset
 * (858cb824c7d4f5c3...) and the emitted keyset (1945 entries,
 * aae01a01eaa604bf...) are all byte-identical, so the ONLY component of the
 * digest that moved is `cssString` — from d02562c4f7c7f462... to exactly leg B's
 * 5b0a754e3112b083... The residual is closed, not relocated. The cross-leg
 * `tokenOverrides` gap that keeps leg A and leg B surface digests distinct is
 * pre-existing and invariant here (8 keys on both legs, before and after); it
 * applies identically to bithire and evnto, which did not move and are not
 * re-anchored.
 */
// C0 re-anchor. These pin the WHOLE leg-A surface, so they move whenever a
// first-party theme moves -- which is what makes them a tripwire and also what
// obliges a written reason on every re-anchor. The cause here is not the
// typography compaction they guard: the three themes rewired their chrome
// grounds onto cascade roots (`layout.bg: "var(--ds-color-bg-primary)"` in
// rottay and evnto, and the sider/table/button grounds in all three), so the
// compiled surface carries the alias where it used to carry the literal. The
// resolved colour is unchanged -- the root declares it in the same block --
// and the T2 cross-lowering equality above still holds byte for byte, which is
// the property this file actually exists to defend.
//
// C2 re-anchor, with its cause measured rather than asserted. The lowering
// stopped carrying `engineBridge` through its product -- it was produced by the
// compiler and read by nobody -- so the digest's payload lost exactly one key.
// PROOF that nothing else moved: re-adding `engineBridge` to this payload,
// taken from the theme where it always came from, reproduces the PREVIOUS pins
// byte for byte (rottay 16d10f6d…, bithire cdff418d…, evnto 4a6019fb…). Every
// other member of the surface -- cssVariables, cssString, colorScheme,
// modeBlocks, personality, tokenOverrides and both profile ids -- is identical.
const LEG_A_SURFACE_DIGEST: Record<string, string> = {
  rottay: "861c1a987d7e1ca8106797a7ef05fabb1c2280904b21f8939a1a32b586837ece",
  bithire: "1bd8bc6809e9d4b20232a195dddc8300833d33b1e444cc39d9544b48362eec83",
  evnto: "859ae1d3a42a7769affaa9fb087ecb3c06417ccd0f3e6f6fd13c3d0b879a8301",
};

/**
 * The re-anchor's own evidence: the aliases the surface now carries. Without
 * this a future re-anchor could restate a number with no way to see whether the
 * cause was the compaction this file guards or something else entirely.
 */
const CASCADE_ROOT_ALIASES: Record<string, ReadonlyArray<readonly [string, string]>> = {
  rottay: [["--ds-layout-bg", "var(--ds-color-bg-primary)"]],
  bithire: [["--ds-button-primary-bg", "var(--ds-color-primary)"]],
  evnto: [["--ds-layout-bg", "var(--ds-color-bg-primary)"]],
};

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

function legA(brandTheme: FirstPartyBrandTheme): Compiled {
  return lowerBrandThemeFixture({ brandTheme, tenantSlug: brandTheme.id });
}

/**
 * Leg B still means something with one lowering left: both legs call the same
 * door, so the comparison now isolates the ISO NORMALIZER. Leg A lifts the
 * authored theme wrap-only; leg B routes it through `brandThemeToTheme`, which
 * also completes shapes and materializes declared keys. Identical digests are
 * the proof that completion changes no compiled byte.
 */
function legB(brandTheme: FirstPartyBrandTheme): Compiled {
  const slug = brandTheme.id;
  const compiled = compileTheme(
    resolveTheme({ ...brandThemeToTheme(brandTheme), id: slug }),
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
  brandTheme: FirstPartyBrandTheme,
  path: readonly string[]
): Record<string, unknown> {
  let cursor: unknown = brandTheme;
  for (const step of path) cursor = (cursor as Record<string, unknown>)[step];
  return cursor as Record<string, unknown>;
}

/** Own key order of an authored source block. */
function authoredKeys(
  brandTheme: FirstPartyBrandTheme,
  path: readonly string[]
): string[] {
  return Object.keys(authoredBlock(brandTheme, path));
}

/**
 * Re-authors one nested source block with the SAME keys and the SAME values in
 * a different order — a permutation that changes nothing but authoring order.
 */
function withRotatedBlock(
  brandTheme: FirstPartyBrandTheme,
  path: readonly string[]
): FirstPartyBrandTheme {
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
  return clone as unknown as FirstPartyBrandTheme;
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

    // T6 — the static path is untouched by the compaction (zero pixel).
    it(`${slug}: the leg-A surface digest is unchanged by the compaction`, () => {
      expect(surfaceDigest(legA(brandTheme))).toBe(LEG_A_SURFACE_DIGEST[slug]);
      // The re-anchor is only legible while its stated cause is still true.
      for (const [channel, alias] of CASCADE_ROOT_ALIASES[slug]) {
        expect(legA(brandTheme).cssVariables[channel]).toBe(alias);
      }
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

  it("a source permutation changes authoring order and nothing else", () => {
    const permuted = withRotatedBlock(rottayBrandTheme, ROTATED_BLOCK);
    const before = authoredKeys(rottayBrandTheme, ROTATED_BLOCK);
    const after = authoredKeys(permuted, ROTATED_BLOCK);

    expect(after).not.toEqual(before);
    expect([...after].sort()).toEqual([...before].sort());
    expect(authoredBlock(permuted, ROTATED_BLOCK)).toEqual(
      authoredBlock(rottayBrandTheme, ROTATED_BLOCK)
    );
  });

  it("leg B is byte-invariant under a source permutation", () => {
    const base = legB(rottayBrandTheme);
    const permuted = legB(withRotatedBlock(rottayBrandTheme, ROTATED_BLOCK));

    expect(permuted.cssString).toBe(base.cssString);
    expect(Object.keys(permuted.cssVariables)).toEqual(
      Object.keys(base.cssVariables)
    );
    expect(surfaceDigest(permuted)).toBe(surfaceDigest(base));
  });

  it("leg A carries the permutation, and the deviation is order-only", () => {
    const base = legA(rottayBrandTheme);
    const permuted = legA(withRotatedBlock(rottayBrandTheme, ROTATED_BLOCK));

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

  // T4 (first-party leg): evnto authors `labelStyle: "capitalize"`, so the
  // channel is a live regression surface for the real artifact, in both legs.
  it("evnto emits its authored capitalize label case in both lowerings", () => {
    expect(legA(evntoBrandTheme).cssVariables["--ds-type-label-text-transform"]).toBe(
      "capitalize"
    );
    expect(legB(evntoBrandTheme).cssVariables["--ds-type-label-text-transform"]).toBe(
      "capitalize"
    );
  });
});
