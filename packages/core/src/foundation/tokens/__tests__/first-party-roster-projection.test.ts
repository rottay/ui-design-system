/**
 * @fileoverview The roster is the single first-party authority. Everything
 * else that enumerates the three verticals must be a PROJECTION of it.
 *
 * The defect this pins down is not "a value is wrong" — it is "the same fact
 * is stated in several places". `FIRST_PARTY_ARTIFACT_SPECS` said
 * `slug: 'rottay', verticalKey: 'platform'`; the roster said both were
 * `rottay`; the envelopes knew about two verticals and not the third; the
 * build script carried its own font-pack table that disagreed with all of
 * them. Every one of those tables was individually plausible, which is exactly
 * why nobody noticed they disagreed.
 *
 * So these tests do not check values against expected literals. They check
 * that each projection EQUALS the roster, field by field, in order. A test
 * that restated the expected slugs would be a fifth table.
 *
 * Each block that asserts agreement is paired with a MUTATED copy of the same
 * projection, which must fail the identical assertion. Without that, an
 * assertion that happens to be vacuous — comparing a thing to itself, or
 * looping over an empty array — reads exactly like a passing one.
 */

import { describe, it, expect } from "vitest";

import { FIRST_PARTY_ARTIFACT_SPECS } from "@/infrastructure/compilers/runtime/tenant-css";
import { TENANT_THEME_VERTICAL_ENVELOPES } from "@/infrastructure/compilers/composition/tenant-theme";
import { FONT_PACK_MANIFEST } from "@/foundation/tokens/css/foundation/typography/font-packs/manifest";
import { PRODUCT_PROFILES } from "@/foundation/presets/product-profiles";
import { VERTICAL_REGISTRY } from "@/foundation/presets/verticals";

import {
  FIRST_PARTY_VERTICAL_ROSTER,
  FIRST_PARTY_VERTICAL_SLUGS,
  FIRST_PARTY_VERTICALS,
  getFirstPartyVertical,
  isFirstPartyVerticalId,
} from "@/foundation/tokens/ts/presentation/brand-themes";

/** The roster's ordered slug list, which every projection must reproduce. */
const ROSTER_SLUGS = FIRST_PARTY_VERTICAL_ROSTER.map((row) => row.slug);

describe("the roster is internally consistent", () => {
  it("enumerates exactly three verticals, rottay first", () => {
    // rottay leads because it is the neutral baseline the other two are read
    // against, and because artifact digests are order-sensitive.
    expect(ROSTER_SLUGS).toEqual(["rottay", "bithire", "evnto"]);
  });

  it("carries no `platform` entry and no alias for one", () => {
    expect(isFirstPartyVerticalId("platform")).toBe(false);
    expect(getFirstPartyVertical("platform")).toBeUndefined();
  });

  it("keeps slug, verticalKey and theme.id as ONE fact per row", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect(row.verticalKey).toBe(row.slug);
      expect(row.themeId).toBe(row.slug);
      // The cast this replaces (`theme.id as FirstPartyVerticalSlug`) is why
      // this needs asserting at runtime as well as in the type.
      expect(row.theme.id).toBe(row.slug);
    }
  });

  it("derives every path-shaped field from the slug", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect(row.themeSourcePath).toBe(
        `foundation/tokens/ts/presentation/brand-themes/${row.slug}/index.ts`,
      );
      expect(row.artifactPath).toBe(
        `foundation/tokens/css/facade/artifacts/${row.slug}/index.css`,
      );
      expect(row.bundleFile).toBe(`${row.slug}.css`);
      expect(row.styleEntry).toBe(`./styles/${row.slug}`);
      expect(row.selector).toContain(`data-tenant='${row.slug}'`);
      expect(row.selector).toContain(`data-vertical='${row.slug}'`);
    }
  });

  it("keys the slug map in roster order", () => {
    expect(Object.keys(FIRST_PARTY_VERTICALS)).toEqual(ROSTER_SLUGS);
    expect([...FIRST_PARTY_VERTICAL_SLUGS]).toEqual(ROSTER_SLUGS);
  });
});

describe("FIRST_PARTY_ARTIFACT_SPECS projects the roster", () => {
  it("reproduces slug, verticalKey, name and theme path in exact order", () => {
    expect(
      FIRST_PARTY_ARTIFACT_SPECS.map((s) => [
        s.slug,
        s.verticalKey,
        s.displayName,
        s.authoredThemePath,
      ]),
    ).toEqual(
      FIRST_PARTY_VERTICAL_ROSTER.map((r) => [
        r.slug,
        r.verticalKey,
        r.name,
        r.themeSourcePath,
      ]),
    );
  });

  it("never spells a verticalKey that differs from its slug", () => {
    // The single assertion that would have caught `rottay -> platform`.
    for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
      expect(spec.verticalKey).toBe(spec.slug);
    }
  });

  it("scopes each artifact to the document-root arm of the roster selector", () => {
    for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
      const row = getFirstPartyVertical(spec.slug);
      expect(row).toBeDefined();
      // Not "looks similar to" — literally a substring, so the artifact
      // selector and the roster selector cannot drift into two spellings.
      expect(row!.selector).toContain(spec.selector);
    }
  });

  it("DRILL: a mutated projection fails the same assertions", () => {
    const mutated = FIRST_PARTY_ARTIFACT_SPECS.map((s) =>
      s.slug === "rottay" ? { ...s, verticalKey: "platform" } : s,
    );
    // Re-running the real assertion against the historical bad value must be
    // red. If this drill ever passes, the checks above are vacuous.
    expect(() => {
      for (const spec of mutated) expect(spec.verticalKey).toBe(spec.slug);
    }).toThrow();
  });
});

describe("TENANT_THEME_VERTICAL_ENVELOPES projects the roster", () => {
  it("keys exactly the roster slugs, in roster order", () => {
    // rottay's absence here meant a customer tenant on `verticalKey: 'rottay'`
    // resolved no envelope and silently could not compile at all.
    expect(Object.keys(TENANT_THEME_VERTICAL_ENVELOPES)).toEqual(ROSTER_SLUGS);
  });

  it("states a verticalKey equal to its own key", () => {
    for (const [key, envelope] of Object.entries(
      TENANT_THEME_VERTICAL_ENVELOPES,
    )) {
      expect(envelope.verticalKey).toBe(key);
    }
  });

  it("DRILL: a projection missing a vertical fails the key assertion", () => {
    const { rottay: _dropped, ...mutated } = TENANT_THEME_VERTICAL_ENVELOPES;
    expect(() => {
      expect(Object.keys(mutated)).toEqual(ROSTER_SLUGS);
    }).toThrow();
  });
});

describe("font packs are real, typed, and ordered", () => {
  it("names only packs the manifest physically ships", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect(row.fontPacks.length).toBeGreaterThan(0);
      for (const pack of row.fontPacks) {
        expect(
          FONT_PACK_MANIFEST[pack],
          `${row.slug} declares font pack "${pack}", which the manifest does ` +
            `not ship. A pack that is not in the manifest has no @font-face ` +
            `layer to emit, so the bundle silently loses the family.`,
        ).toBeDefined();
      }
    }
  });

  it("declares each pack at most once per vertical", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect(new Set(row.fontPacks).size).toBe(row.fontPacks.length);
    }
  });

  it("DRILL: an unshipped pack id is rejected", () => {
    const mutated = ["humanist-text", "not-a-real-pack"];
    expect(() => {
      for (const pack of mutated) {
        expect(
          FONT_PACK_MANIFEST[pack as keyof typeof FONT_PACK_MANIFEST],
        ).toBeDefined();
      }
    }).toThrow();
  });
});

describe("default product profiles resolve", () => {
  it("names a profile the registry actually defines", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect(
        PRODUCT_PROFILES[row.defaultProductProfile],
        `${row.slug} defaults to product profile ` +
          `"${row.defaultProductProfile}", which PRODUCT_PROFILES does not ` +
          `define — it would resolve silently to generic.default.`,
      ).toBeDefined();
    }
  });

  it("uses the rottay.* namespace, never platform.*", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect(row.defaultProductProfile).not.toMatch(/^platform\./);
    }
    for (const key of Object.keys(PRODUCT_PROFILES)) {
      expect(key).not.toMatch(/^platform\./);
    }
  });
});

describe("VERTICAL_REGISTRY projects the roster", () => {
  it("registers exactly the roster slugs", () => {
    expect(new Set(Object.keys(VERTICAL_REGISTRY))).toEqual(
      new Set(ROSTER_SLUGS),
    );
  });

  it("states a key equal to its own registry key", () => {
    for (const [key, preset] of Object.entries(VERTICAL_REGISTRY)) {
      expect(preset.key).toBe(key);
    }
  });
});
