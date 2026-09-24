/**
 * The style contract, at registration.
 *
 * A style is authored content: written once by a reviewed DS change and
 * inherited by many tenants. So every refusal here is one a STYLE AUTHOR earns,
 * not one a tenant discovers, and the suite is arranged around that -- the
 * partition it may author, the floor it must clear, the values it may carry and
 * the envelopes it must fit inside.
 *
 * The two tables this owner declares beside the catalog (the class column and
 * the non-emitting row) are re-derived from the catalog HERE, in both
 * directions, because the contract may not import its unranked peer in
 * production and a column nobody re-measures is a column that rots.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  THEME_DECISION_IDS,
  type ThemeDecisionId,
} from "@/contracts/theme/foundation/decisions";
import { THEME_CONTROL_CATALOG, themeControl } from "@/contracts/theme/runtime/catalog";
import { TENANT_THEME_VERTICAL_ENVELOPES } from "@/contracts/theme/runtime/envelopes";
import { ENVELOPE_RANGED_DIALS } from "@/infrastructure/compilers/composition/tenant-theme/foundation/envelope";
import { sidebarToneToVariables } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme/facade/runtime/compile";
import { documentThemeIntent } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/presentation/document";
import {
  THEME_STYLE_CLASSES,
  THEME_STYLE_CLASS_BY_DECISION,
  THEME_STYLE_IDS,
  THEME_STYLE_NON_EMITTING_DECISIONS,
  THEME_STYLE_RANGED_DIALS,
  THEME_STYLE_REGISTRY,
  ThemeStyleReferenceError,
  assertStyleAuthorable,
  assertStyleEmitsSomething,
  assertThemeStyleReference,
  defineThemeStyle,
  resolveThemeStyle,
  themeStyleDigest,
  themeStyleClearanceIssues,
  type ThemeStyleDocument,
  type ThemeStyleEnvelope,
} from "..";

const STYLE = { id: "quiet-premium", version: 1 } as const;

/** A publication fixture: the digest is computed so only the ARM is the defect. */
function publication(input: {
  id?: string;
  decisions: Record<string, unknown>;
  verticals?: unknown;
  exclusionReasons?: Record<string, string>;
  digest?: string;
}) {
  const id = input.id ?? "fixture";
  const document = { decisions: input.decisions };
  return {
    document,
    manifest: {
      id,
      version: 1,
      title: "Fixture",
      workOrder: "WO-CAT-04",
      publishedOn: "2026-09-21",
      digest: input.digest ?? themeStyleDigest(document),
      rows: Object.keys(input.decisions),
      provenance: Object.fromEntries(
        Object.keys(input.decisions).map((row) => [row, "a fixture reason"])
      ),
      verticals: input.verticals ?? "all",
      ...(input.exclusionReasons
        ? { exclusionReasons: input.exclusionReasons }
        : {}),
    },
  };
}

const register = (input: Parameters<typeof publication>[0]) => {
  const record = defineThemeStyle(publication(input));
  for (const row of record.manifest.rows) {
    assertStyleAuthorable(record.manifest.id, row);
  }
  assertStyleEmitsSomething(record.manifest.id, record.manifest.rows);
  return record;
};

/* -------------------------------------------------------------------------- */
/* I1 — unknown and unavailable, refused by name                              */
/* -------------------------------------------------------------------------- */

describe("I1 the registry refuses by name", () => {
  it("names the registry for an unknown id", () => {
    expect(() => resolveThemeStyle({ id: "nope", version: 1 })).toThrow(
      `ThemeStyle: unknown style "nope"; the registry is ${THEME_STYLE_IDS.join(" | ")}`
    );
  });

  it("names the registered versions for an unavailable version", () => {
    expect(() => resolveThemeStyle({ ...STYLE, version: 7 })).toThrow(
      'ThemeStyle: style "quiet-premium" has no version 7; the registered versions are 1'
    );
  });

  it("resolves the registered publication", () => {
    expect(resolveThemeStyle(STYLE).manifest.id).toBe("quiet-premium");
  });

  it("is keyed on id AND version, so a version is a row", () => {
    expect(Object.keys(THEME_STYLE_REGISTRY)).toContain("quiet-premium@1");
  });
});

/* -------------------------------------------------------------------------- */
/* I2 — the reference is a NAME, never a body                                 */
/* -------------------------------------------------------------------------- */

describe("I2 a style reference carries exactly {id, version}", () => {
  it("refuses an inline body by the key it carried", () => {
    expect(() =>
      assertThemeStyleReference({ ...STYLE, decisions: { "density.mode": "compact" } })
    ).toThrow(
      'ThemeStyle: unsupported key "decisions" in style; a style is named by {id, version}, never carried'
    );
  });

  it("refuses a supplied digest the same way", () => {
    expect(() =>
      assertThemeStyleReference({ ...STYLE, digest: "sha256-0" })
    ).toThrow('ThemeStyle: unsupported key "digest" in style');
  });

  it("refuses a non-integer version", () => {
    expect(() => assertThemeStyleReference({ id: "x", version: 1.5 })).toThrow(
      "style.version must be a positive integer"
    );
  });

  it("admits the two-key reference", () => {
    expect(assertThemeStyleReference(STYLE)).toEqual(STYLE);
  });
});

/* -------------------------------------------------------------------------- */
/* I10 — every registration refusal                                           */
/* -------------------------------------------------------------------------- */

describe("I10 registration refuses a row a style may not author", () => {
  it("refuses a brand-class row, naming the row and the class", () => {
    expect(() =>
      register({ id: "brandy", decisions: { "palette.seeds": { primary: "#101010" } } })
    ).toThrow(
      'ThemeStyle: style "brandy" authors "palette.seeds", which is brand-class; a style owns form, the tenant owns brand'
    );
  });

  it("admits navigation.sidebar-tone as style: the deliberate widening this fixture gated (ratified 2026-09-22)", () => {
    expect(THEME_STYLE_CLASS_BY_DECISION["navigation.sidebar-tone"]).toBe("style");
    const record = register({ id: "tonal", decisions: { "navigation.sidebar-tone": "inverse" } });
    expect(record.manifest.rows).toEqual(["navigation.sidebar-tone"]);
  });

  it("R1: a style proposing a tone AND the seeds is refused on the seeds row, by name", () => {
    expect(() =>
      register({
        id: "tonal-seeded",
        decisions: { "navigation.sidebar-tone": "strong", "palette.seeds": { primary: "#101010" } },
      })
    ).toThrow(
      'ThemeStyle: style "tonal-seeded" authors "palette.seeds", which is brand-class; a style owns form, the tenant owns brand'
    );
    expect(() =>
      register({ id: "tonal-only", decisions: { "navigation.sidebar-tone": "strong" } })
    ).not.toThrow();
  });

  it("refuses experience.profile, naming the rank rule", () => {
    expect(() =>
      register({ id: "profiled", decisions: { "experience.profile": "focused" } })
    ).toThrow(
      'ThemeStyle: style "profiled" authors "experience.profile", whose expansion produces "profile-derived"; a style may not author a row that outranks itself'
    );
  });

  it("refuses a row the partition does not classify, so there is no default", () => {
    expect(() => assertStyleAuthorable("ghost", "palette.invented")).toThrow(
      /"palette\.invented", which the style partition does not classify/u
    );
  });

  it("refuses a manifest digest that disagrees with the document", () => {
    expect(() =>
      register({
        id: "stale",
        decisions: { "density.mode": "compact" },
        digest: `sha256-${"0".repeat(64)}`,
      })
    ).toThrow(/is not the document digest .*a style is immutable/u);
  });

  it("refuses an unknown key in the style JSON", () => {
    expect(() =>
      defineThemeStyle({
        document: { decisions: {}, plan: "pro" },
        manifest: publication({ decisions: {} }).manifest,
      })
    ).toThrow('ThemeStyle: unsupported key "plan" in document');
  });

  it("refuses a decision id the catalog does not know", () => {
    expect(() =>
      defineThemeStyle(publication({ decisions: { "palette.invented": 1 } }))
    ).toThrow(/unsupported key "palette\.invented" in style "fixture" decisions/u);
  });
});

describe("I10 the non-vacuity floor refuses what it exists for", () => {
  it("refuses a recipe-profile-only style, naming it data-only", () => {
    expect(() =>
      register({
        id: "dataonly",
        decisions: { "recipe-profile": "rottay/technical-sharp@1" },
      })
    ).toThrow(
      'ThemeStyle: style "dataonly" authors no row that emits a channel or a root attribute; "recipe-profile" is data-only'
    );
  });

  it("ADMITS a chrome.anatomy-only style, which is what proves the floor reads rootAttributes", () => {
    expect(() =>
      register({ id: "anatomical", decisions: { "chrome.anatomy": { table: "ruled" } } })
    ).not.toThrow();
  });
});

/* -------------------------------------------------------------------------- */
/* I10 — the partition cannot rot                                             */
/* -------------------------------------------------------------------------- */

describe("I10 the partition is total and pinned", () => {
  it("classifies every decision and nothing else", () => {
    expect(Object.keys(THEME_STYLE_CLASS_BY_DECISION).sort()).toEqual(
      [...THEME_DECISION_IDS].sort()
    );
    expect(Object.keys(THEME_STYLE_CLASS_BY_DECISION)).toHaveLength(
      THEME_DECISION_IDS.length
    );
  });

  it("pins the counts: 22 style, 6 brand, 1 refused (sidebar tone to style, ratified 2026-09-22)", () => {
    const counts = Object.fromEntries(
      THEME_STYLE_CLASSES.map((cls) => [
        cls,
        Object.values(THEME_STYLE_CLASS_BY_DECISION).filter((row) => row === cls)
          .length,
      ])
    );
    expect(counts).toEqual({ style: 22, brand: 6, refused: 1 });
  });

  it("P1: every registered publication's rows are still style-class", () => {
    for (const record of Object.values(THEME_STYLE_REGISTRY)) {
      for (const row of record.manifest.rows) {
        expect({ row, cls: THEME_STYLE_CLASS_BY_DECISION[row as keyof typeof THEME_STYLE_CLASS_BY_DECISION] }).toEqual({
          row,
          cls: "style",
        });
      }
    }
  });

  it("pins the catalog at 29, which this WO does not move", () => {
    expect(THEME_DECISION_IDS.length).toBe(29);
    expect(THEME_CONTROL_CATALOG.length).toBe(29);
  });

  it("re-derives the non-emitting row from the catalog, in both directions", () => {
    const measured = THEME_CONTROL_CATALOG.filter(
      (row) =>
        row.produces.channels.length === 0 &&
        row.produces.rootAttributes.length === 0
    ).map((row) => row.id);
    expect([...measured].sort()).toEqual(
      [...THEME_STYLE_NON_EMITTING_DECISIONS].sort()
    );
    // The `effect` label agrees with the reach, which is why `produces` can be
    // the normative spelling and the label can stay a label.
    expect(measured.every((id) => themeControl(id).effect === "data-only")).toBe(
      true
    );
  });

  it("keeps the ranged dials the publish terminal's, not a second table", () => {
    expect(THEME_STYLE_RANGED_DIALS.map((entry) => entry.dial).sort()).toEqual(
      [...ENVELOPE_RANGED_DIALS].sort()
    );
    // And every dial is authored by a STYLE-class row, so clause 1 never bites
    // on a row a style could not have authored in the first place.
    for (const entry of THEME_STYLE_RANGED_DIALS) {
      expect(THEME_STYLE_CLASS_BY_DECISION[entry.decision]).toBe("style");
    }
  });
});

/* -------------------------------------------------------------------------- */
/* I11 — the envelope clearance, and the exclusion mechanism it justifies      */
/* -------------------------------------------------------------------------- */

const envelopesOf = (...verticals: string[]): ThemeStyleEnvelope[] =>
  verticals.map((verticalKey) => {
    const envelope =
      TENANT_THEME_VERTICAL_ENVELOPES[
        verticalKey as keyof typeof TENANT_THEME_VERTICAL_ENVELOPES
      ];
    return {
      verticalKey,
      ranges: envelope.ranges,
      allowAnatomyVariants: envelope.advanced.allowAnatomyVariants,
    };
  });

const ALL = ["rottay", "bithire", "evnto"];

describe("I11 a style dial clears every declared vertical, or is refused", () => {
  it("admits the registered style against all three", () => {
    expect(
      themeStyleClearanceIssues({
        styleId: "quiet-premium",
        document: resolveThemeStyle(STYLE).document,
        envelopes: envelopesOf(...ALL),
      })
    ).toEqual([]);
  });

  it("refuses a dial outside the intersection, naming the dial AND the vertical", () => {
    const issues = themeStyleClearanceIssues({
      styleId: "wide",
      document: { decisions: { "shape.radius-scale": 1.25 } },
      envelopes: envelopesOf(...ALL),
    });
    expect(issues.map((issue) => issue.verticalKey)).toEqual(ALL);
    expect(issues[0].message).toBe(
      'style "wide" sets shape.radiusScale 1.25, outside the rottay envelope [0.8, 1.2]; narrow the dial or exclude the vertical with a written D-28 reason'
    );
  });

  /**
   * The Q4 = (b) pair, on the ONE dial the three envelopes actually disagree
   * about: `effectIntensity` is [0, 0.65] on rottay and bithire and [0, 0.75]
   * on evnto. So 0.7 is a MEASURED functional incompatibility, and the remedy
   * is the written exclusion rather than a silent narrowing.
   */
  it("refuses a style that clears one vertical but not the others under `all`", () => {
    const issues = themeStyleClearanceIssues({
      styleId: "glossy",
      document: { decisions: { "surfaces.effect-intensity": 0.7 } },
      envelopes: envelopesOf(...ALL),
    });
    expect(issues.map((issue) => issue.verticalKey)).toEqual(["rottay", "bithire"]);
  });

  it("admits the SAME style once the incompatible verticals are excluded", () => {
    expect(
      themeStyleClearanceIssues({
        styleId: "glossy",
        document: { decisions: { "surfaces.effect-intensity": 0.7 } },
        envelopes: envelopesOf("evnto"),
      })
    ).toEqual([]);
  });

  /**
   * `verticals: ["evnto"]` names who is ADMITTED, so the reason is owed by
   * rottay and bithire -- under THEIR keys, which is what the request-time
   * refusal reads back when a rottay tenant names the style. A reason filed
   * under `evnto` explains nothing about either exclusion.
   */
  const excluding = (exclusionReasons?: Record<string, string>) => () =>
    defineThemeStyle(
      publication({
        id: "glossy",
        decisions: { "surfaces.effect-intensity": 0.7 },
        verticals: ["evnto"],
        exclusionReasons,
      })
    );

  it("requires a written D-28 reason for EVERY excluded vertical, by name", () => {
    expect(excluding()).toThrow(
      /excludes rottay without a written D-28 reason under that key/u
    );
    expect(excluding({})).toThrow(
      /excludes rottay without a written D-28 reason under that key/u
    );
    expect(
      excluding({ rottay: "D-28: 0.7 leaves the rottay envelope" })
    ).toThrow(/excludes bithire without a written D-28 reason under that key/u);
    expect(excluding({ rottay: "", bithire: "" })).toThrow(
      /excludes rottay without a written D-28 reason under that key/u
    );
  });

  it("refuses reasons keyed by the ADMITTED vertical", () => {
    expect(
      excluding({ evnto: "D-28: the only envelope that admits 0.7" })
    ).toThrow(/excludes rottay without a written D-28 reason under that key/u);
  });

  it("admits the exclusion once both excluded verticals are named", () => {
    const record = excluding({
      rottay: "D-28: 0.7 leaves the rottay effectIntensity range",
      bithire: "D-28: 0.7 leaves the bithire effectIntensity range",
    })();
    expect(record.manifest.exclusionReasons).toEqual({
      rottay: "D-28: 0.7 leaves the rottay effectIntensity range",
      bithire: "D-28: 0.7 leaves the bithire effectIntensity range",
    });
  });

  it("stays vacuous at launch: `all` owes no reason", () => {
    expect(() =>
      defineThemeStyle(
        publication({ id: "glossy", decisions: { "shape.radius-scale": 1 } })
      )
    ).not.toThrow();
  });
});

describe("I11 allowAnatomyVariants, vacuous on production data and not on a fixture", () => {
  const anatomy = {
    decisions: { "chrome.anatomy": { table: "ruled" } },
  } satisfies ThemeStyleDocument;

  it("pins the vacuity itself: all three declared envelopes open it", () => {
    for (const vertical of ALL) {
      expect(
        TENANT_THEME_VERTICAL_ENVELOPES[
          vertical as keyof typeof TENANT_THEME_VERTICAL_ENVELOPES
        ].advanced.allowAnatomyVariants
      ).toBe(true);
    }
  });

  it("admits a non-default anatomy against HEAD's envelopes", () => {
    expect(
      themeStyleClearanceIssues({
        styleId: "anatomical",
        document: anatomy,
        envelopes: envelopesOf(...ALL),
      })
    ).toEqual([]);
  });

  it("refuses it against a vertical that closes it, naming row and vertical", () => {
    const issues = themeStyleClearanceIssues({
      styleId: "anatomical",
      document: anatomy,
      envelopes: [{ verticalKey: "evnto", allowAnatomyVariants: false }],
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe(
      'style "anatomical" sets chrome.anatomy.table "ruled", but the evnto envelope sets allowAnatomyVariants false'
    );
  });

  it("does not refuse an explicit `default` family", () => {
    expect(
      themeStyleClearanceIssues({
        styleId: "anatomical",
        document: { decisions: { "chrome.anatomy": { table: "default" } } },
        envelopes: [{ verticalKey: "evnto", allowAnatomyVariants: false }],
      })
    ).toEqual([]);
  });
});

describe("the registered publication is what the manifest says it is", () => {
  it("digests the document with the artifact's own pair", () => {
    const record = resolveThemeStyle(STYLE);
    expect(record.manifest.digest).toBe(themeStyleDigest(record.document));
    expect(record.manifest.digest).toMatch(/^sha256-[0-9a-f]{64}$/u);
  });

  it("carries a written reason for every row it authors", () => {
    const record = resolveThemeStyle(STYLE);
    for (const row of record.manifest.rows) {
      expect(typeof record.manifest.provenance[row]).toBe("string");
      expect(THEME_STYLE_CLASS_BY_DECISION[row as ThemeDecisionId]).toBe("style");
    }
  });

  it("is frozen, so no reader can repoint a published style", () => {
    const record = resolveThemeStyle(STYLE);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.document.decisions)).toBe(true);
    expect(() => resolveThemeStyle({ id: "quiet-premium", version: 2 })).toThrow(
      ThemeStyleReferenceError
    );
  });
});

/* WO-DER-09 step 1: the two contrasting registry fixtures, drawn from WO-DER-07's measured bithire
 * candidates product-dense and editorial-quiet, registered under the CAT-04 contract. */
describe("DER-09 the two contrasting registry fixtures", () => {
  const FIXTURES = ["product-dense", "editorial-quiet"] as const;
  const record = (id: string) => resolveThemeStyle({ id, version: 1 });
  const candidate = (id: string) =>
    JSON.parse(
      readFileSync(resolve(process.cwd(), `src/foundation/presets/candidates/bithire/documents/${id}/index.json`), "utf8")
    ).decisions as Record<string, unknown>;

  it("(a) both register at version 1 under the digest law, style-class only, clearing all three verticals", () => {
    for (const id of FIXTURES) {
      const style = record(id);
      expect(style.ref).toEqual({ id, version: 1 });
      expect(style.manifest.digest).toBe(themeStyleDigest(style.document));
      expect(style.manifest.verticals).toBe("all");
      for (const row of style.manifest.rows) expect({ id, row, cls: THEME_STYLE_CLASS_BY_DECISION[row] }).toEqual({ id, row, cls: "style" });
      expect(themeStyleClearanceIssues({ styleId: id, document: style.document, envelopes: envelopesOf(...ALL) })).toEqual([]);
    }
  });

  it("(a) each is its candidate's style-class rows, verbatim, with the brand rows left to the tenant", () => {
    for (const id of FIXTURES) {
      const source = candidate(id);
      const styleRows = Object.keys(source).filter((row) => THEME_STYLE_CLASS_BY_DECISION[row as ThemeDecisionId] === "style");
      expect(Object.keys(record(id).document.decisions)).toEqual(styleRows);
      for (const row of styleRows) {
        expect({ row, value: (record(id).document.decisions as Record<string, unknown>)[row] }).toEqual({ row, value: source[row] });
      }
      expect(Object.keys(source).filter((row) => !styleRows.includes(row)).sort()).toEqual([
        "experience.profile",
        "palette.contrast-posture",
        "palette.dark-mode",
        "palette.neutral-temperature",
        "palette.seeds",
        "palette.status-seeds",
        "typography.families",
      ]);
    }
  });

  it("(a) both pass admission through the v3 door", () => {
    for (const id of FIXTURES) {
      expect(() => compileAs(id)).not.toThrow();
    }
  });

  it("(b) a fixture row outside the style class is refused by name, brand and refused alike", () => {
    const decisions = record("product-dense").document.decisions as Record<string, unknown>;
    expect(() => register({ id: "product-dense-seeded", decisions: { ...decisions, "palette.seeds": { primary: "#2F5BE8" } } })).toThrow(
      'ThemeStyle: style "product-dense-seeded" authors "palette.seeds", which is brand-class; a style owns form, the tenant owns brand'
    );
    expect(() =>
      register({ id: "product-dense-profiled", decisions: { ...decisions, "experience.profile": "rottay/bithire-technical@1" } })
    ).toThrow(/"experience\.profile", whose expansion produces "profile-derived"/u);
  });

  it("(b) the version pin is immutable: a changed document under the published digest is refused, and no version 2 exists", () => {
    const published = record("editorial-quiet");
    expect(() =>
      defineThemeStyle({
        document: { decisions: { ...published.document.decisions, "spacing.rhythm": "tight" } },
        manifest: published.manifest,
      } as never)
    ).toThrow(/is not the document digest .*a style is immutable, so a changed document is a NEW version/u);
    expect(() => resolveThemeStyle({ id: "editorial-quiet", version: 2 })).toThrow(
      'ThemeStyle: style "editorial-quiet" has no version 2; the registered versions are 1'
    );
  });

  it("(c) the same tenant document under each fixture differs in non-color output while the brand stays fixed", () => {
    const dense = compileAs("product-dense");
    const quiet = compileAs("editorial-quiet");
    const names = [...new Set([...Object.keys(dense.cssVariables), ...Object.keys(quiet.cssVariables)])];
    const moved = names.filter((name) => dense.cssVariables[name] !== quiet.cssVariables[name]);
    expect(moved.filter((name) => name.startsWith("--ds-color-") || /font-family/u.test(name))).toEqual([]);
    for (const mode of ["light", "dark"] as const) {
      const block = (compiled: typeof dense) => compiled.modeBlocks.find((candidate) => candidate.mode === mode)?.cssVariables ?? {};
      const colors = (compiled: typeof dense) =>
        Object.fromEntries(Object.entries({ ...compiled.cssVariables, ...block(compiled) }).filter(([name]) => name.startsWith("--ds-color-")));
      expect(colors(dense)).toEqual(colors(quiet));
    }
    const sidebar = (compiled: typeof dense) =>
      Object.fromEntries(Object.entries(compiled.cssVariables).filter(([name]) => name.startsWith("--ds-sidebar-")));
    expect(sidebar(dense)).toMatchObject(sidebarToneToVariables("inverse", "light"));
    expect(sidebar(quiet)).toMatchObject(sidebarToneToVariables("subtle", "light"));
    for (const dial of [
      "--ds-density-mode-factor",
      "--ds-rhythm-scale",
      "--ds-control-height-scale",
      "--ds-type-scale",
      "--ds-motion-duration-scale",
      "--ds-radius-scale",
    ]) {
      expect({ dial, moved: moved.includes(dial) }).toEqual({ dial, moved: true });
    }
    expect(moved.length).toBeGreaterThan(40);
  });
});

/** One fixed tenant: its own seeds, status seeds and faces, so only the style can move the output. */
const FIXED_TENANT = {
  "palette.seeds": { primary: "#2563EB", secondary: "#0F172A", accent: "#0891B2", background: "#FFFFFF" },
  "palette.status-seeds": { success: "#15803D", warning: "#B45309", error: "#B91C1C", info: "#0369A1" },
  "typography.families": { base: "humanist-text", heading: "grotesk-display", display: "grotesk-display", mono: "plex-mono" },
};

function compileAs(style: string) {
  return compileThemeIntent(
    documentThemeIntent({
      vertical: "bithire",
      slug: "acme",
      document: { version: 3, plan: "pro", decisions: FIXED_TENANT, style: { id: style, version: 1 } } as never,
    })
  ).compiled;
}
