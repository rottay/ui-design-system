/**
 * Resolution builds provenance from the RAW patch, and the intent's origin
 * decides authorship.
 */

import { describe, expect, it } from "vitest";

import type {
  ThemeIntent,
  ThemeIntentOrigin,
} from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  isTenantAuthoredOrigin,
  TENANT_AUTHORED_ORIGINS,
  THEME_PLANS,
} from "@/foundation/contracts/composition/tenants/themes/intent";
import type { ThemeLayerPatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  collectPatchAuthoredPaths,
  mergeThemePatches,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import { BRAND_CAPABILITY_ABSENCE_REASONS } from "@/foundation/contracts/composition/tenants/themes/iso/capability-absence";
import {
  themeLeafKinds,
  themeLeafOptions,
} from "@/foundation/contracts/composition/tenants/themes/iso/schema";
import {
  deriveTenantStatusSeedAuthorship,
  EMPTY_PROVENANCE,
  tenantPostureFloors,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { assertThemeBaseline } from "@/foundation/contracts/composition/tenants/themes/iso";

import { baselineFor, resolveTheme } from "..";

const baseline = FIRST_PARTY_THEMES.rottay;

const patch: ThemeLayerPatch = {
  palette: { primaryColor: "#123456", successColor: "#0a0" },
  surfaces: { density: "compact", elevation: "elevated" },
} as unknown as ThemeLayerPatch;

const intentOf = (origin: ThemeIntentOrigin): ThemeIntent => ({
  vertical: "rottay",
  slug: "rottay",
  origin,
  patch,
});

const ORIGINS: readonly ThemeIntentOrigin[] = [
  "static-vertical",
  "tenant-document",
  "preview",
];

describe("origin classification", () => {
  it("treats the two tenant-customization transports as authored", () => {
    expect([...TENANT_AUTHORED_ORIGINS].sort()).toEqual(["preview", "tenant-document"]);
    expect(isTenantAuthoredOrigin("tenant-document")).toBe(true);
    expect(isTenantAuthoredOrigin("preview")).toBe(true);
  });

  it("does not treat the vertical's own baseline layer as authored", () => {
    expect(isTenantAuthoredOrigin("static-vertical")).toBe(false);
    expect(TENANT_AUTHORED_ORIGINS).not.toContain("static-vertical");
  });

  it("keeps the origin union closed at three transports", () => {
    expect(new Set(ORIGINS).size).toBe(3);
  });
});

describe("there is no intentless arm", () => {
  // The optional intent was a FOURTH origin with no name: it returned before
  // `assertThemeIntent` ran, so the one path nobody declared was also the one
  // path nothing validated. It is gone, and the resolver takes one argument.
  it("takes exactly one argument", () => {
    expect(resolveTheme.length).toBe(1);
  });

  it("refuses a call with no intent at all", () => {
    expect(() => (resolveTheme as (i?: ThemeIntent) => unknown)()).toThrow(
      /intent must be an object/u
    );
  });

  it("resolves the roster baseline for a vertical, with the intent's slug", () => {
    const resolution = resolveTheme({
      vertical: "rottay",
      slug: "rottay",
      origin: "static-vertical",
      patch: {},
    });
    expect(resolution.theme).toEqual(baseline);
    expect(resolution.provenance).toBe(EMPTY_PROVENANCE);
    expect(resolution.theme.id).toBe("rottay");
    expect(
      resolveTheme({
        vertical: "rottay",
        slug: "acme",
        origin: "static-vertical",
        patch: {},
      }).theme.id
    ).toBe("acme");
  });

  it("names the baseline through one owner, not a caller's spread", () => {
    expect(baselineFor("bithire", "bithire")).toBe(FIRST_PARTY_THEMES.bithire);
    expect(baselineFor("bithire", "acme")).toEqual({
      ...FIRST_PARTY_THEMES.bithire,
      id: "acme",
    });
  });
});

describe("the intent's vertical is the closed roster set", () => {
  for (const vertical of ["platform", "", "acme", null, 7, {}, []]) {
    it(`refuses vertical ${JSON.stringify(vertical) ?? String(vertical)}`, () => {
      expect(() =>
        resolveTheme({ vertical, slug: "acme", origin: "preview", patch: {} } as never)
      ).toThrow(/unknown intent vertical/u);
    });
  }

  for (const slug of ["", null, 7, {}]) {
    it(`refuses slug ${JSON.stringify(slug) ?? String(slug)}`, () => {
      expect(() =>
        resolveTheme({ vertical: "rottay", slug, origin: "preview", patch: {} } as never)
      ).toThrow(/intent\.slug must be a non-empty string/u);
    });
  }
});

describe("resolveTheme applies every patch-bearing origin's patch to the baseline", () => {
  // `static-vertical` is deliberately absent: WO-CAT-02 refuses a patch on that
  // origin outright, and its own describe block below owns that law.
  for (const origin of TENANT_AUTHORED_ORIGINS) {
    it(`${origin} merges through the ISO resolver and changes the theme`, () => {
      const resolution = resolveTheme(intentOf(origin));
      expect(resolution.theme).toEqual(mergeThemePatches(baseline, patch));
      expect(resolution.theme).not.toBe(baseline);
      expect(resolution.theme).not.toEqual(baseline);
    });

    it(`${origin} carries its intent for diagnostics`, () => {
      const intent = intentOf(origin);
      expect(resolveTheme(intent).intent).toBe(intent);
    });
  }

  it("static-vertical carries its (empty) intent for diagnostics too", () => {
    const intent = {
      vertical: "rottay",
      slug: "rottay",
      origin: "static-vertical",
      patch: {},
    } as const;
    expect(resolveTheme(intent).intent).toBe(intent);
  });
});

describe("the intent refuses identity in the patch and an ungranted plan", () => {
  const tenantIntent = (over: Record<string, unknown>) => ({
    vertical: "rottay",
    slug: "acme",
    origin: "tenant-document",
    patch: {},
    ...over,
  });

  for (const key of ["id", "name"] as const) {
    it(`refuses a patch that carries "${key}" (F-70)`, () => {
      expect(() =>
        resolveTheme(tenantIntent({ patch: { [key]: "smuggled" } }) as never)
      ).toThrow(new RegExp(`patch may not carry "${key}"`, "u"));
    });
  }

  it("accepts an intent with no entitlement at all", () => {
    expect(() => resolveTheme(tenantIntent({}) as never)).not.toThrow();
  });

  it("accepts each plan of the closed set", () => {
    for (const plan of THEME_PLANS) {
      expect(() =>
        resolveTheme(tenantIntent({ entitlement: { plan } }) as never)
      ).not.toThrow();
    }
  });

  it("refuses a plan outside the closed set BY NAME", () => {
    expect(() =>
      resolveTheme(tenantIntent({ entitlement: { plan: "enterprise" } }) as never)
    ).toThrow(/unknown plan "enterprise"; the closed set is "standard", "pro", "internal"/u);
  });

  it("refuses an entitlement carrying anything but `plan`", () => {
    expect(() =>
      resolveTheme(
        tenantIntent({ entitlement: { plan: "pro", grantedBy: "me" } }) as never
      )
    ).toThrow(/entitlement carries exactly `plan`/u);
    expect(() =>
      resolveTheme(tenantIntent({ entitlement: {} }) as never)
    ).toThrow(/entitlement carries exactly `plan`/u);
    expect(() =>
      resolveTheme(tenantIntent({ entitlement: "pro" }) as never)
    ).toThrow(/entitlement must be an object/u);
  });

  it("still refuses a key the envelope never declared", () => {
    expect(() =>
      resolveTheme(tenantIntent({ plan: "pro" }) as never)
    ).toThrow(/unknown intent key\(s\) "plan"/u);
  });
});

describe("a static-vertical intent is the baseline itself, never a patch on it", () => {
  const resolution = resolveTheme({
    vertical: "rottay",
    slug: "rottay",
    origin: "static-vertical",
    patch: {},
  });

  it("resolves to the baseline and stays non-tenant", () => {
    expect(resolution.theme).toEqual(baseline);
    expect(resolution.provenance.tenantAuthored).toBe(false);
    expect(resolution.provenance).toBe(EMPTY_PROVENANCE);
  });

  it("creates no tenant floor, no status-seed authorship and no authored path", () => {
    expect(resolution.provenance.floors).toEqual({});
    expect(resolution.provenance.statusSeedAuthorship.base.success).toBe(false);
    expect(resolution.provenance.statusSeedAuthorship.modes).toEqual({});
    expect(resolution.provenance.authoredPaths.size).toBe(0);
    // The same patch, offered through a TENANT origin, does produce all three:
    // the difference is the origin, which is what makes the refusal below a
    // law about authorship rather than about an empty object.
    expect(tenantPostureFloors(patch)).not.toEqual({});
    expect(deriveTenantStatusSeedAuthorship(patch).base.success).toBe(true);
    expect(collectPatchAuthoredPaths(patch).size).toBeGreaterThan(0);
  });

  it("REFUSES a non-empty patch by name, listing the keys it refused", () => {
    // WO-CAT-02. A patch on top of the vertical's own baseline is a second,
    // unnamed authoring surface for vertical identity: the vertical authors its
    // theme, it does not patch it.
    expect(() => resolveTheme(intentOf("static-vertical"))).toThrow(
      /static-vertical intent carries an empty patch.*"palette", "surfaces"/su
    );
  });
});

describe("a tenant-authored origin overlays with full provenance", () => {
  for (const origin of ["tenant-document", "preview"] as const) {
    const resolution = resolveTheme(intentOf(origin));

    it(`${origin} marks the resolution authored`, () => {
      expect(resolution.provenance.tenantAuthored).toBe(true);
      expect(resolution.provenance).not.toBe(EMPTY_PROVENANCE);
    });

    it(`${origin} applies the producers to the raw patch`, () => {
      expect([...resolution.provenance.authoredPaths].sort()).toEqual(
        [...collectPatchAuthoredPaths(patch)].sort()
      );
      expect(resolution.provenance.floors).toEqual(tenantPostureFloors(patch));
      expect(resolution.provenance.statusSeedAuthorship).toEqual(
        deriveTenantStatusSeedAuthorship(patch)
      );
    });

    it(`${origin} does not derive the floor from the merged theme`, () => {
      // The merge is total, so every posture keypath is populated afterwards;
      // a floor derived from it would out-rank the tenant's own selection.
      const merged = resolution.theme as unknown as ThemeLayerPatch;
      expect(resolution.provenance.floors).not.toEqual(tenantPostureFloors(merged));
    });
  }

  it("resolves preview and tenant-document to the same provenance", () => {
    const preview = resolveTheme(intentOf("preview")).provenance;
    const document = resolveTheme(intentOf("tenant-document")).provenance;
    expect(preview.floors).toEqual(document.floors);
    expect(preview.statusSeedAuthorship).toEqual(document.statusSeedAuthorship);
    expect([...preview.authoredPaths].sort()).toEqual([...document.authoredPaths].sort());
  });
});

/* -------------------------------------------------------------------------- */
/* the public boundary fails closed on hostile input                          */
/* -------------------------------------------------------------------------- */

describe("resolveTheme refuses an intent it cannot trust", () => {
  const hostileBaseline = FIRST_PARTY_THEMES.bithire;

  // A JS caller never saw the type. Every value below reached
  // `isTenantAuthoredOrigin`, which answers `false` for anything it does not
  // recognise -- so a bogus origin used to resolve SILENTLY as "not a tenant"
  // rather than failing, which is the difference between a refused document and
  // a customer's overlay quietly compiling with no authorship.
  const bogusOrigins: readonly unknown[] = [
    "tenant",
    "TENANT-DOCUMENT",
    "",
    null,
    undefined,
    0,
    1,
    NaN,
    true,
    { origin: "tenant-document" },
    ["tenant-document"],
    Symbol("tenant-document"),
  ];

  for (const origin of bogusOrigins) {
    it(`refuses origin ${String(typeof origin)} ${JSON.stringify(origin) ?? String(origin)}`, () => {
      expect(() =>
        resolveTheme({ vertical: "bithire", slug: "bithire", origin, patch: {} } as never)
      ).toThrow(/unknown intent origin/u);
    });
  }

  it("refuses an intent that is not an object", () => {
    for (const intent of [null, 1, "tenant-document", [] as never]) {
      expect(() => resolveTheme(intent as never)).toThrow();
    }
  });

  it("refuses a patch that is not an object", () => {
    for (const patch of [null, 1, "x", [] as never]) {
      expect(() =>
        resolveTheme({
          vertical: "bithire",
          slug: "bithire",
          origin: "tenant-document",
          patch,
        } as never)
      ).toThrow(/intent\.patch must be an object/u);
    }
  });

  it("accepts every origin in the closed union, and only those", () => {
    for (const origin of ["static-vertical", "tenant-document", "preview"] as const) {
      expect(() =>
        resolveTheme({ vertical: "bithire", slug: "bithire", origin, patch: {} })
      ).not.toThrow();
    }
  });
});

describe("mergeThemePatches refuses the prototype chain", () => {
  const hostileBaseline = FIRST_PARTY_THEMES.bithire;

  // `key in baseObj` walked the prototype chain, so every one of these answered
  // "known key" and was merged into a Theme that declares none of them.
  const inherited = [
    "constructor",
    "toString",
    "valueOf",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
  ];

  for (const key of inherited) {
    it(`refuses the inherited key "${key}"`, () => {
      expect(() =>
        mergeThemePatches(hostileBaseline, { [key]: "x" } as never)
      ).toThrow(/unknown key/u);
    });
  }

  it("refuses __proto__ even when it arrives as an own key from JSON", () => {
    const patch = JSON.parse('{"__proto__": {"polluted": true}}');
    expect(Object.prototype.hasOwnProperty.call(patch, "__proto__")).toBe(true);
    expect(() => mergeThemePatches(hostileBaseline, patch as never)).toThrow(
      /unknown key|forbidden key/u
    );
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("still accepts a real declared key, so the guard is not refusing everything", () => {
    const merged = mergeThemePatches(hostileBaseline, {
      palette: { primaryColor: "#123456" },
    } as never);
    expect(merged.palette.primaryColor).toBe("#123456");
  });
});

/* -------------------------------------------------------------------------- */
/* the merge boundary refuses a node whose KIND the Theme does not declare     */
/* -------------------------------------------------------------------------- */

describe("mergeThemePatches refuses a mis-kinded patch node", () => {
  const hostileBaseline = FIRST_PARTY_THEMES.bithire;
  const merge = (patch: unknown) =>
    mergeThemePatches(hostileBaseline, patch as never);
  const resolve = (patch: unknown) =>
    resolveTheme({
      vertical: "bithire",
      slug: "bithire",
      origin: "tenant-document",
      patch: patch as never,
    });

  // The baseline actually declares these, which is what makes the mismatch a
  // mismatch rather than an undecidable leaf: where the base leaf is
  // `undefined` the Theme states no kind and the merge cannot decide, so the
  // attacks below all target a leaf the baseline really carries.
  it("the baseline declares the leaves these attacks target", () => {
    expect(typeof hostileBaseline.palette.primaryColor).toBe("string");
    expect(hostileBaseline.palette).toBeTypeOf("object");
    expect(hostileBaseline.motion).toBeTypeOf("object");
  });

  /* ---- wrong primitive on a declared string leaf ------------------------- */

  const wrongPrimitives: readonly [string, unknown][] = [
    ["number", 16],
    ["boolean", true],
    ["null", null],
  ];

  for (const [kind, value] of wrongPrimitives) {
    it(`refuses a ${kind} on palette.primaryColor`, () => {
      expect(() => merge({ palette: { primaryColor: value } })).toThrow(
        /expected string at \$\.palette\.primaryColor|is not a ThemeLayerPatch leaf/u
      );
      expect(() => resolve({ palette: { primaryColor: value } })).toThrow();
    });
  }

  it("refuses a function on a declared leaf", () => {
    expect(() => merge({ palette: { primaryColor: () => "#fff" } })).toThrow(
      /is not a ThemeLayerPatch leaf/u
    );
  });

  // Refused on the leaf's own kind, before the base is consulted: `NaN` is a
  // `number` and would otherwise agree with a declared numeric leaf.
  it("refuses a non-finite number anywhere", () => {
    expect(() => merge({ typography: { scale: NaN } })).toThrow(
      /non-finite number/u
    );
    expect(() => merge({ typography: { scale: Infinity } })).toThrow(
      /non-finite number/u
    );
    expect(() => merge({ typography: { scale: 1.05 } })).not.toThrow();
  });

  it("still accepts the RIGHT primitive on the same leaves", () => {
    const merged = merge({
      palette: { primaryColor: "#123456" },
      surfaces: { density: "compact" },
    });
    expect(merged.palette.primaryColor).toBe("#123456");
    expect(merged.surfaces.density).toBe("compact");
  });

  /* ---- arrays: the one node kind that replaces a container wholesale ------ */

  it("refuses an array as the top-level patch", () => {
    expect(() => merge([])).toThrow(/is not an object/u);
    expect(() => merge([{ palette: { primaryColor: "#fff" } }])).toThrow(
      /is not an object/u
    );
  });

  it("refuses an array where an object family is declared", () => {
    expect(() => merge({ palette: [] })).toThrow(
      /expected object at \$\.palette, received array/u
    );
    expect(() => merge({ motion: ["fast"] })).toThrow(
      /expected object at \$\.motion, received array/u
    );
  });

  it("refuses an array where a scalar leaf is declared", () => {
    expect(() => merge({ palette: { primaryColor: ["#fff"] } })).toThrow(
      /expected string at \$\.palette\.primaryColor, received array/u
    );
  });

  it("refuses an object element inside an array patch", () => {
    expect(() =>
      merge({ charts: { value: { categoryColors: [{ hex: "#fff" }] } } })
    ).toThrow(/object element at .*\[0\]/u);
  });

  /* ---- governed dispositions --------------------------------------------- */

  const bogusDispositions: readonly unknown[] = [
    "disabled",
    "inactive",
    "NOT-AUTHORED",
    "",
    null,
    0,
    true,
    ["not-authored"],
    { reason: "not-authored" },
  ];

  for (const disposition of bogusDispositions) {
    it(`refuses the invented disposition ${JSON.stringify(disposition) ?? String(disposition)}`, () => {
      // An unknown disposition is not inert: every reader asks only whether it
      // is `undefined`, so a typo DISABLES the family instead of being ignored.
      expect(() => merge({ motion: { disposition } })).toThrow(
        /unknown disposition/u
      );
      expect(() => resolve({ motion: { disposition } })).toThrow(
        /unknown disposition/u
      );
    });
  }

  it("accepts every disposition in the closed vocabulary, and undefined", () => {
    for (const disposition of BRAND_CAPABILITY_ABSENCE_REASONS) {
      const merged = merge({ motion: { disposition } });
      expect(merged.motion.disposition).toBe(disposition);
    }
    expect(() => merge({ motion: { disposition: undefined } })).not.toThrow();
  });

  it("supplying a governed value with no disposition still activates the slot", () => {
    const merged = merge({ recipes: { value: { profile: "sharp" } } });
    expect(merged.recipes.disposition).toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/* the boundary refuses what the BASELINE alone could never decide            */
/* -------------------------------------------------------------------------- */

describe("the declaration decides, not the baseline sample", () => {
  const hostileBaseline = FIRST_PARTY_THEMES.bithire;
  const merge = (patch: unknown) => mergeThemePatches(hostileBaseline, patch as never);

  it("refuses a boolean on an OPTIONAL string the baseline leaves undefined", () => {
    // The exact hole a baseline-as-schema leaves: nothing to compare against.
    expect(hostileBaseline.palette.successBgColor).toBeUndefined();
    expect(() => merge({ palette: { successBgColor: true } })).toThrow(
      /expected string at \$\.palette\.successBgColor/u
    );
    expect(() => merge({ palette: { successBgColor: 1 } })).toThrow(/expected string/u);
    expect(() => merge({ palette: { successBgColor: "#0a0" } })).not.toThrow();
  });

  it("types the elements of an EMPTY array from the declaration", () => {
    const charts = hostileBaseline.charts.value as { categoryColors?: readonly unknown[] };
    expect(charts.categoryColors ?? []).toHaveLength(0);
    expect(() =>
      merge({ charts: { value: { categoryColors: ["#111111", "#222222"] } } })
    ).not.toThrow();
    expect(() =>
      merge({ charts: { value: { categoryColors: ["#111111", 2] } } })
    ).toThrow(/expected string at \$\.charts\.value\.categoryColors\[1\]/u);
    expect(() => merge({ charts: { value: { categoryColors: [true] } } })).toThrow(
      /expected string/u
    );
  });

  it("no leaf is opaque any more, so the unknown-key rule has no exception", () => {
    // `engineBridge` was the one place the contract declared `unknown`: the
    // schema refused no kind there, and its dictionary had to admit
    // engine-roster keys the closed-vocabulary rule would otherwise reject.
    // The family is retired at source -- it had no reader in any adapter or
    // compiler -- so every declared leaf now answers with a kind, and naming
    // the family is just an unknown key like any other.
    expect(themeLeafKinds("$.chrome.card.hoverTint")).not.toBeNull();
    expect(() =>
      merge({ engineBridge: { value: { modern: { anything: 12 } } } })
    ).toThrow(/unknown key "engineBridge"/u);
  });
});

describe("a baseline that is not a Theme is refused by its own guard", () => {
  // These used to be reachable through `resolveTheme`, because the caller
  // supplied the baseline. It cannot any more: the intent NAMES a roster
  // vertical and the resolver reads the baseline itself, so the only bad
  // baseline a caller can now express is a bad vertical, which the intent guard
  // above refuses by name. The structural guard still runs on every resolve and
  // is asserted here directly, where its subject actually lives.
  const bogusBaselines: readonly [string, unknown][] = [
    ["null", null],
    ["undefined", undefined],
    ["an array", []],
    ["a string", "bithire"],
    ["an empty object", {}],
    ["id-only", { id: "bithire" }],
    ["an empty id", { id: "", palette: {} }],
    ["a non-string id", { id: 7, palette: {} }],
  ];

  for (const [label, bogus] of bogusBaselines) {
    it(`refuses ${label}`, () => {
      expect(() => assertThemeBaseline(bogus, "resolveTheme")).toThrow(
        /resolveTheme: baseline/u
      );
    });
  }

  it("accepts every roster Theme, which is the only baseline a caller can name", () => {
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      expect(() =>
        assertThemeBaseline(baselineFor(vertical, vertical), "resolveTheme")
      ).not.toThrow();
      expect(() =>
        resolveTheme({
          vertical,
          slug: vertical,
          origin: "tenant-document",
          patch: { palette: { primaryColor: "#123456" } } as unknown as ThemeLayerPatch,
        })
      ).not.toThrow();
    }
  });

  it("still accepts the SPARSE authored draft the compiler's own intake carries", () => {
    // Totality is deliberately not the guard's test: `liftAuthoredTheme` carries
    // a partially-authored draft to the compiler unchanged, and the guard has to
    // keep letting that through even though no INTENT can name it any more.
    expect(() =>
      assertThemeBaseline(
        { id: "draft", palette: { primaryColor: "#123456" } },
        "resolveTheme"
      )
    ).not.toThrow();
  });
});

describe("the ThemeIntent envelope is exact and own-keyed", () => {
  const baselineTheme = FIRST_PARTY_THEMES.bithire;

  it("refuses an intent whose origin/patch are INHERITED", () => {
    const inherited = Object.create({
      origin: "tenant-document",
      patch: { palette: { primaryColor: "#123456" } },
    }) as never;
    expect(() => resolveTheme(inherited)).toThrow(/must be an own property/u);
  });

  it("refuses an intent carrying a key the contract does not declare", () => {
    expect(() =>
      resolveTheme({
        vertical: "bithire",
        slug: "bithire",
        origin: "tenant-document",
        patch: {},
        tenantId: "acme",
      } as never)
    ).toThrow(/unknown intent key/u);
  });

  it("refuses an intent missing a declared key", () => {
    expect(() =>
      resolveTheme({
        vertical: "bithire",
        slug: "bithire",
        origin: "tenant-document",
      } as never)
    ).toThrow(/intent\.patch must be an own property/u);
    expect(() =>
      resolveTheme({ vertical: "bithire", slug: "bithire", patch: {} } as never)
    ).toThrow(/intent\.origin must be an own property/u);
    expect(() =>
      resolveTheme({ slug: "bithire", origin: "preview", patch: {} } as never)
    ).toThrow(/intent\.vertical must be an own property/u);
    expect(() =>
      resolveTheme({ vertical: "bithire", origin: "preview", patch: {} } as never)
    ).toThrow(/intent\.slug must be an own property/u);
  });

  it("accepts the exact envelope, so the guard is not refusing everything", () => {
    expect(() =>
      resolveTheme({
        vertical: "bithire",
        slug: "bithire",
        origin: "preview",
        patch: {},
      })
    ).not.toThrow();
  });
});


/* -------------------------------------------------------------------------- */
/* a closed option domain is refused where the contract declares it            */
/* -------------------------------------------------------------------------- */

describe("resolveTheme refuses a value outside a closed option domain", () => {
  const baselineTheme = FIRST_PARTY_THEMES.bithire;
  const resolve = (patch: unknown) =>
    resolveTheme({
      vertical: "bithire",
      slug: "bithire",
      origin: "tenant-document",
      patch: patch as never,
    });

  const invented: readonly [string, unknown, RegExp][] = [
    [
      "appearance.defaultMode",
      { appearance: { defaultMode: "potato" } },
      /\$\.appearance\.defaultMode/u,
    ],
    [
      "surfaces.buttonStyle",
      { surfaces: { buttonStyle: "potato" } },
      /\$\.surfaces\.buttonStyle/u,
    ],
    ["surfaces.density", { surfaces: { density: "potato" } }, /\$\.surfaces\.density/u],
    ["surfaces.elevation", { surfaces: { elevation: "lifted" } }, /\$\.surfaces\.elevation/u],
    ["surfaces.rhythm", { surfaces: { rhythm: "loose" } }, /\$\.surfaces\.rhythm/u],
    [
      "typography.labelStyle",
      { typography: { labelStyle: "smallcaps" } },
      /\$\.typography\.labelStyle/u,
    ],
    [
      "typography.typePairing",
      { typography: { typePairing: "handwritten" } },
      /\$\.typography\.typePairing/u,
    ],
    ["motion.entrance", { motion: { value: { entrance: "warp" } } }, /entrance/u],
    ["charts.lineStyle", { charts: { value: { lineStyle: "wiggly" } } }, /lineStyle/u],
    [
      "chrome.table.anatomy",
      { chrome: { table: { anatomy: "spreadsheet" } } },
      /\$\.chrome\.table\.anatomy/u,
    ],
    [
      "capabilities.*.status",
      { capabilities: { motion: { status: "maybe" } } },
      /\$\.capabilities\.motion\.status/u,
    ],
  ];

  for (const [label, patch, path] of invented) {
    it(`refuses an invented option at ${label}`, () => {
      expect(() => resolve(patch)).toThrow(/is not an option at/u);
      expect(() => resolve(patch)).toThrow(path);
    });
  }

  it("names the closed set in the failure, so the caller can correct it", () => {
    expect(() => resolve({ surfaces: { buttonStyle: "potato" } })).toThrow(
      /the closed set is "pill", "sharp", "soft"/u
    );
  });

  it("fails AT RESOLUTION with a domain error, not later as a generic TypeError", () => {
    // `"potato"` used to survive the merge, reach the lowering and die there --
    // when it died at all -- inside whatever reader first called a string
    // method on it. `appearance.defaultMode` did not even do that: it compiled.
    let thrown: unknown;
    try {
      resolve({ surfaces: { buttonStyle: "potato" } });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown).not.toBeInstanceOf(TypeError);
    expect((thrown as Error).message).not.toMatch(/trim|undefined/u);
    expect((thrown as Error).message).toMatch(/^mergeThemePatches: "potato" is not an option/u);
  });

  it("accepts every option the contract does declare, and applies it", () => {
    for (const mode of themeLeafOptions("$.appearance.defaultMode") ?? []) {
      expect(resolve({ appearance: { defaultMode: mode } }).theme.appearance.defaultMode).toBe(
        mode
      );
    }
    for (const style of themeLeafOptions("$.surfaces.buttonStyle") ?? []) {
      expect(resolve({ surfaces: { buttonStyle: style } }).theme.surfaces.buttonStyle).toBe(
        style
      );
    }
    for (const status of themeLeafOptions("$.capabilities.motion.status") ?? []) {
      expect(
        resolve({ capabilities: { motion: { status } } }).theme.capabilities.motion.status
      ).toBe(status);
    }
  });

  it("leaves an intentionally OPEN leaf open", () => {
    // The domain map must never narrow a leaf the contract widened: these are
    // free-form strings and a string/number union, not vocabularies.
    expect(themeLeafOptions("$.palette.primaryColor")).toBeNull();
    expect(() => resolve({ palette: { primaryColor: "#abcdef" } })).not.toThrow();
    expect(() =>
      resolve({ typography: { fontFamilyBase: "Some Unreleased Face, sans-serif" } })
    ).not.toThrow();
    expect(() => resolve({ chrome: { sidebar: { groupFontWeight: "600" } } })).not.toThrow();
  });
});

/* -------------------------------------------------------------------------- */
/* only a plain record may be a ThemeLayerPatch container                           */
/* -------------------------------------------------------------------------- */

describe("mergeThemePatches refuses a container that is not a plain record", () => {
  const baselineTheme = FIRST_PARTY_THEMES.bithire;
  const merge = (patch: unknown) => mergeThemePatches(baselineTheme, patch as never);

  class HostilePalette {
    primaryColor = "#123456";
  }

  const containers: readonly [string, () => unknown][] = [
    ["a Date", () => new Date()],
    ["a RegExp", () => /hostile/u],
    ["a Map", () => new Map()],
    ["a class instance", () => new HostilePalette()],
    ["an Object.create(proto) record", () => Object.create({ primaryColor: "#123456" })],
  ];

  for (const [label, make] of containers) {
    it(`refuses ${label} as the TOP-LEVEL patch`, () => {
      expect(() => merge(make())).toThrow(
        /is not a ThemeLayerPatch container|is not an object/u
      );
    });

    it(`refuses ${label} as a NESTED family`, () => {
      expect(() => merge({ palette: make() })).toThrow(/at \$\.palette/u);
      expect(() => merge({ chrome: { table: make() } })).toThrow(/at \$\.chrome\.table/u);
    });
  }

  it("a class instance no longer smuggles its fields into the Theme", () => {
    // This is the one that did not merely pass unnoticed: its own enumerable
    // fields were merged INTO the resolved palette through a container the
    // contract never declared.
    expect(() => merge({ palette: new HostilePalette() })).toThrow(
      /class instance at \$\.palette is not a ThemeLayerPatch container/u
    );
    expect(baselineTheme.palette.primaryColor).not.toBe("#123456");
  });

  it("a Date no longer reports as an applied family while changing nothing", () => {
    expect(() => merge({ palette: new Date() })).toThrow(/Date at \$\.palette/u);
  });

  it("still accepts the two containers the schema does declare", () => {
    expect(() => merge({ palette: { primaryColor: "#123456" } })).not.toThrow();
    expect(() =>
      merge({ charts: { value: { categoryColors: ["#111111", "#222222"] } } })
    ).not.toThrow();
    expect(() => merge(Object.create(null) as never)).not.toThrow();
  });
});

/* -------------------------------------------------------------------------- */
/* the baseline is validated structurally, on its OWN keys                     */
/* -------------------------------------------------------------------------- */

describe("the baseline guard validates structurally, on OWN keys", () => {
  const bothPaths = (bogus: unknown): readonly (() => unknown)[] => [
    () => assertThemeBaseline(bogus, "resolveTheme"),
    () => mergeThemePatches(bogus as never, { palette: { primaryColor: "#123456" } } as never),
  ];

  it("refuses an INHERITED id, which read back as a Theme through every access", () => {
    const inherited = Object.create({ id: "inherited", palette: { primaryColor: "#fff" } });
    for (const call of bothPaths(inherited)) {
      expect(call).toThrow(/baseline\.id must be a non-empty own string/u);
    }
  });

  it("refuses a baseline that carries an own id but is not a plain object", () => {
    class HostileTheme {
      id = "hostile";
      palette = { primaryColor: "#123456" };
    }
    for (const call of bothPaths(new HostileTheme())) {
      expect(call).toThrow(/baseline is a class instance, not a plain Theme object/u);
    }
  });

  it("refuses an id that is present but empty or not a string", () => {
    for (const call of bothPaths({ id: "", palette: {} })) {
      expect(call).toThrow(/baseline\.id must be a non-empty own string/u);
    }
    for (const call of bothPaths({ id: 7, palette: {} })) {
      expect(call).toThrow(/baseline\.id must be a non-empty own string/u);
    }
  });

  it("refuses a family that is not a record", () => {
    for (const call of bothPaths({ id: "x", palette: false })) {
      expect(call).toThrow(/baseline\.palette must be a record, received boolean/u);
    }
    for (const call of bothPaths({ id: "x", palette: {}, chrome: "dark" })) {
      expect(call).toThrow(/baseline\.chrome must be a record, received string/u);
    }
    for (const call of bothPaths({ id: "x", palette: [] })) {
      expect(call).toThrow(/baseline\.palette must be a record, received array/u);
    }
  });

  it("refuses a top-level key the Theme does not declare", () => {
    for (const call of bothPaths({ id: "x", palette: {}, tenantId: "acme" })) {
      expect(call).toThrow(/baseline carries unknown key\(s\) "tenantId"/u);
    }
  });

  it("does NOT require every optional family: a sparse authored draft resolves", () => {
    // `liftAuthoredTheme` exists to carry an editor draft to the compiler
    // unchanged; normalizing it here would compile channels nobody authored.
    for (const call of bothPaths({ id: "draft", palette: { primaryColor: "#123456" } })) {
      expect(call).not.toThrow();
    }
    expect(() =>
      assertThemeBaseline(
        { id: "draft", chrome: { cardComponent: { bg: "#fff" } } },
        "resolveTheme"
      )
    ).not.toThrow();
  });

  it("runs on every resolve, including the empty-patch static one", () => {
    // The guard used to be skipped on the intentless fast path. There is no
    // fast path now, and the static intent is the one that carries no patch.
    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      expect(() =>
        resolveTheme({
          vertical,
          slug: vertical,
          origin: "static-vertical",
          patch: {},
        })
      ).not.toThrow();
    }
    expect(() => assertThemeBaseline({ id: "x", palette: false }, "resolveTheme")).toThrow(
      /resolveTheme: baseline\.palette/u
    );
  });
});
