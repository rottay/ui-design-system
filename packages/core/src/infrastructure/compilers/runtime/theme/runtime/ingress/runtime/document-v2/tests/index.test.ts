/**
 * The v2 door: same lowering, closed catalog, honest report.
 *
 * The load-bearing assertion is the first one. It does not compare two
 * hand-written expectations; it compares the EMITTED CSS of a v2 document
 * against the emitted CSS of its v1 equivalent, in all three verticals, for a
 * decision whose fan-out is 25/25. If the adapter ever grew a second lowering,
 * a second default-mode reader or a second roster lookup, that byte comparison
 * is what would notice.
 */

import { describe, expect, it } from "vitest";

import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  APP_PLATFORM_ROW_REMEDIATIONS,
  APP_PLATFORM_TENANT_ROWS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/app-platform-rows";
import { THEME_DECISION_DOMAIN_SCHEMA } from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/decisions";
import {
  THEME_DECISION_IDS,
  THEME_DECISION_TIER_BY_ID,
} from "@/contracts/theme/foundation/decisions";
import { themeControlTier } from "@/contracts/theme/runtime/catalog";
import {
  TenantThemeDocumentV2Error,
  type TenantThemeDocumentV2,
} from "@/contracts/theme/presentation/document";
import { projectDecisionsToV1 } from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import {
  compileThemeIntent,
  emitThemeCss,
  tenantArtifactScope,
} from "@/infrastructure/compilers/runtime/theme";

import {
  admitDocument,
  documentThemeIntent,
  migrateAndAdmitDocument,
  migrateDocumentV1ToV2,
  previewThemeIntent,
  ThemePatchMigrationError,
  v1KeypathOf,
} from "../../..";

const PRIMARY = "#4F46E5";

const v1Seeds = (primary: string): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "simple",
    appearance: { palette: { primary } },
  }) as unknown as TenantThemeDocument;

const v2 = (
  decisions: TenantThemeDocumentV2["decisions"],
  plan: TenantThemeDocumentV2["plan"] = "standard"
): TenantThemeDocumentV2 => ({ version: 2, plan, decisions });

function css(vertical: (typeof FIRST_PARTY_VERTICAL_SLUGS)[number], document: unknown) {
  const intent = documentThemeIntent({
    vertical,
    slug: "acme",
    document: document as TenantThemeDocument,
  });
  return emitThemeCss(
    compileThemeIntent(intent).compiled,
    tenantArtifactScope(vertical, "acme")
  );
}

describe("v2 accepted at the door", () => {
  it("compiles palette.seeds to the SAME BYTES as its v1 equivalent, per vertical", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(css(vertical, v2({ "palette.seeds": { primary: PRIMARY } }))).toEqual(
        css(vertical, v1Seeds(PRIMARY))
      );
    }
  });

  it("produces the same patch through the persisted and the preview producer", () => {
    const document = v2({ "palette.seeds": { primary: PRIMARY } });
    const persisted = documentThemeIntent({ vertical: "bithire", slug: "acme", document });
    const preview = previewThemeIntent({ vertical: "bithire", slug: "acme", document });
    expect(preview.patch).toEqual(persisted.patch);
    expect(preview.origin).toBe("preview");
    expect(persisted.origin).toBe("tenant-document");
  });

  it("still accepts a v1 document unchanged", () => {
    const admission = admitDocument({ vertical: "bithire", document: v1Seeds(PRIMARY) });
    expect(admission.version).toBe(1);
    expect(admission.decisions).toEqual([]);
  });
});

describe("accepted but not lit", () => {
  it("accepts states.emphasis, records it, and reports it unlit", () => {
    const document = v2({ "states.emphasis": "strong" });
    const admission = admitDocument({ vertical: "bithire", document });
    expect(admission.version).toBe(2);
    expect(admission.decisions).toEqual([
      {
        id: "states.emphasis",
        tier: "standard",
        lit: false,
        reason: "no-keypath-today",
        keypaths: [],
      },
    ]);
    expect(admission.unlit.map((row) => row.id)).toEqual(["states.emphasis"]);
    // The catalog DECLARES the absence with `null`, so the projection reports
    // it instead of discovering it from a missing table row.
    expect(v1KeypathOf("states.emphasis")).toBeNull();
  });

  it("moves nothing in the compiled CSS when only unlit decisions are activated", () => {
    expect(css("bithire", v2({ "states.emphasis": "strong" }))).toEqual(
      css("bithire", v2({}))
    );
  });

  it("reports a lit decision with the v1 keypath it wrote", () => {
    const admission = admitDocument({
      vertical: "bithire",
      document: v2({ "navigation.sidebar-tone": "inverse" }),
    });
    expect(admission.decisions).toEqual([
      {
        id: "navigation.sidebar-tone",
        tier: "standard",
        lit: true,
        keypaths: ["appearance.general.navigation.sidebarTone"],
      },
    ]);
    expect(admission.unlit).toEqual([]);
  });

  it("reports typography.families unlit when only roles without a keypath are set", () => {
    const admission = admitDocument({
      vertical: "bithire",
      document: v2({ "typography.families": { mono: "plex-mono" } }, "pro"),
    });
    expect(admission.unlit.map((row) => [row.id, row.reason])).toEqual([
      ["typography.families", "role-has-no-keypath-today"],
    ]);
  });
});

describe("the catalog is closed, and refuses by name", () => {
  it("refuses a plan outside the enum, naming it", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: { version: 2, plan: "enterprise", decisions: {} } as never,
      })
    ).toThrow(/unsupported plan "enterprise"/);
  });

  it("refuses a decision id outside the 29", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: v2({ "palette.gradient": "x" } as never),
      })
    ).toThrow(TenantThemeDocumentV2Error);
  });

  it("refuses a Pro decision under the standard plan, naming the tier", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: v2({ "recipe-profile": "rottay/technical-sharp@1" }),
      })
    ).toThrow(/is tier pro; plan standard entitles standard/);
  });

  it("refuses a raw --ds-* override at any depth (D-03)", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: {
          version: 2,
          plan: "pro",
          decisions: {},
          overrides: { chrome: { sidebar: { "--ds-color-primary": "#fff" } } },
        } as never,
      })
    ).toThrow(/raw channel "--ds-color-primary"/);
  });

  it("refuses an override group that is not chrome", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: {
          version: 2,
          plan: "pro",
          decisions: {},
          overrides: { tokens: {} },
        } as never,
      })
    ).toThrow(/unsupported override group "tokens"/);
  });
});

describe("migrate v1 -> v2", () => {
  it("carries a simple document's seeds and derives the minimum plan", () => {
    expect(migrateDocumentV1ToV2(v1Seeds(PRIMARY))).toEqual({
      version: 2,
      plan: "standard",
      decisions: { "palette.seeds": { primary: PRIMARY } },
    });
  });

  it("round-trips: the migrated v2 document compiles to the v1 bytes", () => {
    const v1 = v1Seeds(PRIMARY);
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(css(vertical, migrateDocumentV1ToV2(v1))).toEqual(css(vertical, v1));
    }
  });

  it("carries an advanced document's whole governed surface", () => {
    const advanced = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        general: {
          palette: { primary: PRIMARY, status: { success: "#10B981" } },
          typography: { typePairing: "editorial", scale: 1.05 },
          shape: { buttonStyle: "pill", radiusScale: 1.1 },
          density: "compact",
          rhythm: "airy",
          surfaces: { elevation: "elevated", effectIntensity: 0.4 },
          navigation: { sidebarTone: "inverse" },
          experienceProfile: "rottay/bithire-technical@1",
        },
        advanced: {
          chrome: {
            cardComponent: { anatomy: "framed" },
            tag: { defaultBg: "#101010" },
          },
          responsivePosture: "compact",
        },
        recipeProfile: "rottay/technical-sharp@1",
      },
    } as unknown as TenantThemeDocument;
    const migrated = migrateDocumentV1ToV2(advanced);
    expect(migrated.plan).toBe("pro");
    expect(Object.keys(migrated.decisions).sort()).toEqual(
      [
        "chrome.anatomy",
        "density.mode",
        "experience.profile",
        "navigation.sidebar-tone",
        "palette.seeds",
        "palette.status-seeds",
        "recipe-profile",
        "responsive.posture",
        "shape.button-style",
        "shape.radius-scale",
        "spacing.rhythm",
        "surfaces.effect-intensity",
        "surfaces.elevation-posture",
        "typography.pairing",
        "typography.scale",
      ].sort()
    );
    expect(migrated.overrides).toEqual({ chrome: { tag: { defaultBg: "#101010" } } });
  });

  it("carries the raw tokens that ARE a decision", () => {
    const document = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: {
          tokenOverrides: {
            "--ds-color-primary": PRIMARY,
            "--ds-color-error": "#DC2626",
            "--ds-effect-intensity": 0.5,
          },
        },
      },
    } as unknown as TenantThemeDocument;
    expect(migrateDocumentV1ToV2(document).decisions).toEqual({
      "palette.seeds": { primary: PRIMARY },
      "palette.status-seeds": { error: "#DC2626" },
      "surfaces.effect-intensity": 0.5,
    });
  });

  it("REFUSES a raw token that is not a decision, by its own name (D-03)", () => {
    const document = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        advanced: { tokenOverrides: { "--ds-radius-md": "4px" } },
      },
    } as unknown as TenantThemeDocument;
    expect(() => migrateDocumentV1ToV2(document)).toThrow(
      /tokenOverride "--ds-radius-md" has no v2 decision/
    );
  });

  it("REFUSES per-mode seeds rather than flattening them", () => {
    const document = {
      schemaVersion: 1,
      mode: "simple",
      appearance: { palette: { primary: PRIMARY, dark: { primary: "#000000" } } },
    } as unknown as TenantThemeDocument;
    expect(() => migrateDocumentV1ToV2(document)).toThrow(
      /general\.palette\.dark has no v2 counterpart/
    );
  });

  it("REFUSES a free font stack: row 6 closes the domain to a pack id", () => {
    const document = {
      schemaVersion: 1,
      mode: "simple",
      appearance: { typography: { fontFamilyBase: "Comic Sans MS" } },
    } as unknown as TenantThemeDocument;
    expect(() => migrateDocumentV1ToV2(document)).toThrow(
      /general\.typography\.fontFamilyBase has no v2 counterpart/
    );
  });

  it("is total: an unsupported schemaVersion is refused, never coerced", () => {
    expect(() =>
      migrateDocumentV1ToV2({ schemaVersion: 3, mode: "simple" } as never)
    ).toThrow(ThemePatchMigrationError);
  });
});

/**
 * The v1 document behind the compile-level migration proofs.
 *
 * Every field is one the v1 door actually lowers: an advanced fixture that the
 * v1 compiler refuses would make the byte comparison below vacuous, because
 * both sides would fail for the same unrelated reason.
 */
const ADVANCED_V1 = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: { primary: PRIMARY, status: { success: "#10B981" } },
      typography: { typePairing: "editorial", scale: 1.05 },
      shape: { buttonStyle: "pill", radiusScale: 1.1 },
      density: "compact",
      rhythm: "airy",
      surfaces: { elevation: "elevated", effectIntensity: 0.4 },
      navigation: { sidebarTone: "inverse" },
      experienceProfile: "rottay/bithire-technical@1",
    },
    advanced: {
      chrome: {
        cardComponent: { anatomy: "framed" },
        tag: { defaultBg: "#101010" },
      },
      responsivePosture: "compact",
    },
    recipeProfile: "rottay/technical-sharp@1",
  },
} as unknown as TenantThemeDocument;

describe("palette.seeds is CLOSED: no decision is an open bag", () => {
  for (const plan of ["standard", "pro"] as const) {
    it(`refuses authored inks under plan ${plan}, naming the key`, () => {
      expect(() =>
        admitDocument({
          vertical: "bithire",
          document: v2(
            {
              "palette.seeds": {
                primary: PRIMARY,
                foreground: { primary: "#123456" },
              } as never,
            },
            plan
          ),
        })
      ).toThrow(/unsupported key "foreground" in decision "palette\.seeds"/);
    });

    it(`refuses authored borders under plan ${plan}`, () => {
      expect(() =>
        admitDocument({
          vertical: "bithire",
          document: v2(
            { "palette.seeds": { primary: PRIMARY, border: {} } as never },
            plan
          ),
        })
      ).toThrow(/unsupported key "border" in decision "palette\.seeds"/);
    });

    it(`refuses the Pro mode selection smuggled through the seeds under plan ${plan}`, () => {
      expect(() =>
        admitDocument({
          vertical: "bithire",
          document: v2(
            {
              "palette.seeds": {
                primary: PRIMARY,
                backgroundMode: "dark",
              } as never,
            },
            plan
          ),
        })
      ).toThrow(/unsupported key "backgroundMode".*palette\.dark-mode/s);
    });

    it(`refuses per-mode seeds under plan ${plan}`, () => {
      expect(() =>
        admitDocument({
          vertical: "bithire",
          document: v2(
            {
              "palette.seeds": {
                primary: PRIMARY,
                dark: { primary: "#000000" },
              } as never,
            },
            plan
          ),
        })
      ).toThrow(/unsupported key "dark" in decision "palette\.seeds"/);
    });

    it(`refuses status seeds smuggled through the brand seeds under plan ${plan}`, () => {
      expect(() =>
        admitDocument({
          vertical: "bithire",
          document: v2(
            {
              "palette.seeds": {
                primary: PRIMARY,
                status: { success: "#10B981" },
              } as never,
            },
            plan
          ),
        })
      ).toThrow(/unsupported key "status".*palette\.status-seeds/s);
    });
  }

  it("a Standard document can produce NO modes.dark patch at all", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      const intent = documentThemeIntent({
        vertical,
        slug: "acme",
        document: v2({ "palette.seeds": { primary: PRIMARY } }),
      });
      expect(intent.patch.modes?.dark).toBeUndefined();
    }
  });

  it("refuses a key the direct projection would otherwise copy", () => {
    expect(() =>
      projectDecisionsToV1({
        version: 2,
        plan: "pro",
        decisions: { "palette.seeds": { primary: PRIMARY, dark: {} } as never },
      })
    ).toThrow(/unsupported key "dark" in decision "palette\.seeds"/);
  });

  it("closes the other map-valued rows on their own keys", () => {
    const cases: ReadonlyArray<[string, TenantThemeDocumentV2["decisions"]]> = [
      ["palette.status-seeds", { "palette.status-seeds": { danger: "#f00" } as never }],
      ["motion.dial", { "motion.dial": { easing: "linear" } as never }],
      ["chrome.anatomy", { "chrome.anatomy": { tooltip: "default" } as never }],
      ["profiles.expressive", { "profiles.expressive": { rhythm: "x" } as never }],
      ["typography.families", { "typography.families": { caption: "plex-mono" } as never }],
    ];
    for (const [id, decisions] of cases) {
      expect(() =>
        admitDocument({ vertical: "bithire", document: v2(decisions, "pro") })
      ).toThrow(new RegExp(`in decision "${id.replace(".", "\\.")}"`));
    }
  });
});

describe("font packs are a registered domain", () => {
  it("refuses an unregistered pack id BY NAME, never with a TypeError", () => {
    let thrown: unknown;
    try {
      admitDocument({
        vertical: "bithire",
        document: v2({ "typography.families": { base: "comic-sans" as never } }, "pro"),
      });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(TenantThemeDocumentV2Error);
    expect(String(thrown)).toMatch(/unsupported fontPackId "comic-sans" for role "base"/);
    expect(String(thrown)).toMatch(/humanist-text/);
    expect(thrown).not.toBeInstanceOf(TypeError);
  });

  it("refuses an unknown ROLE rather than skipping it", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: v2({ "typography.families": { caption: "plex-mono" } as never }, "pro"),
      })
    ).toThrow(/unsupported key "caption" in decision "typography\.families"/);
  });

  it("keeps a registered role with no keypath accepted-but-unlit", () => {
    const admission = admitDocument({
      vertical: "bithire",
      document: v2({ "typography.families": { display: "editorial-display" } }, "pro"),
    });
    expect(admission.unlit.map((row) => [row.id, row.reason])).toEqual([
      ["typography.families", "role-has-no-keypath-today"],
    ]);
  });

  it("an unlit role is INERT: the projection's empty typography moves no byte", () => {
    // The projection nests `general.typography` before it knows whether any
    // role has a keypath, so a display-only document reaches the v1 typography
    // migration with an empty object. That migration resolves a pairing, so
    // "unlit" is only true if the empty object still compiles to nothing.
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const role of ["display", "mono"] as const) {
        expect(
          css(
            vertical,
            v2({ "typography.families": { [role]: "plex-mono" } }, "pro")
          )
        ).toEqual(css(vertical, v2({}, "pro")));
      }
    }
  });

  it("emits the bare pack reference the DB font validator admits", () => {
    const { v1 } = projectDecisionsToV1(
      v2({ "typography.families": { base: "humanist-text" } }, "pro")
    );
    expect(v1.visualFoundation.general?.typography?.fontFamilyBase).toBe(
      "var(--ds-font-pack-humanist-text)"
    );
  });
});

describe("sanctioned overrides are Pro, and never carry an anatomy", () => {
  const withOverrides = (
    plan: TenantThemeDocumentV2["plan"],
    chrome: Record<string, unknown>
  ) => ({ version: 2 as const, plan, decisions: {}, overrides: { chrome } });

  it("REFUSES a non-empty override under the standard plan, by name", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: withOverrides("standard", { sidebar: { bg: "#101010" } }) as never,
      })
    ).toThrow(/sanctioned overrides are tier pro; plan standard entitles standard/);
  });

  it("accepts it under pro, and it moves bytes", () => {
    // The ink travels WITH the ground. A near-black sidebar under the
    // vertical's own ink is a sub-floor pair, and since WO-CAT-03 the compile
    // door applies the APCA admission to every origin -- so a document that
    // paints a ground and leaves the ink behind is refused here exactly as
    // `compileTenantThemeConfig` already refused it.
    const document = withOverrides("pro", {
      sidebar: { bg: "#101010", text: "#F5F5F5" },
    }) as never;
    expect(() =>
      admitDocument({ vertical: "bithire", document })
    ).not.toThrow();
    expect(css("bithire", document)).not.toEqual(css("bithire", v2({})));
  });

  it("REFUSES a ground that leaves the vertical's ink under the floor", () => {
    // The same override group WITHOUT the ink. Before WO-CAT-03 this compiled
    // silently through `compileThemeIntent` while `compileTenantThemeConfig`
    // refused it: one document, two answers (F-13).
    expect(() =>
      css("bithire", withOverrides("pro", { sidebar: { bg: "#101010" } }) as never)
    ).toThrow(/authored tenant colors must meet the governed floor/);
  });

  it("tolerates an EMPTY override group under standard: nothing is entitled", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: withOverrides("standard", {}) as never,
      })
    ).not.toThrow();
  });

  it("REFUSES anatomy inside an override under every plan", () => {
    for (const plan of ["standard", "pro", "internal"] as const) {
      expect(() =>
        admitDocument({
          vertical: "bithire",
          document: withOverrides(plan, { sidebar: { anatomy: "rail" } }) as never,
        })
      ).toThrow(/unsupported key "anatomy" in overrides\.chrome\.sidebar/);
    }
  });
});

describe("migration is proven at the COMPILE door, not only structurally", () => {
  it("an advanced v1 document migrates to bytes identical to its own", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      expect(css(vertical, migrateDocumentV1ToV2(ADVANCED_V1))).toEqual(
        css(vertical, ADVANCED_V1)
      );
    }
  });

  it("migrateAndAdmitDocument admits the migrated document through the publish door", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      const result = migrateAndAdmitDocument({ vertical, document: ADVANCED_V1 });
      expect(result.version).toBe(2);
      expect(result.migrated.plan).toBe("pro");
      expect(result.patch).toEqual(
        documentThemeIntent({ vertical, slug: "acme", document: ADVANCED_V1 }).patch
      );
    }
  });

  it("passes a v2 document straight through instead of migrating it twice", () => {
    const document = v2({ "palette.seeds": { primary: PRIMARY } });
    const result = migrateAndAdmitDocument({ vertical: "bithire", document });
    expect(result.migrated).toEqual(document);
  });

  it("a v1 document the LOWERING refuses does not become a compilable v2 one", () => {
    // `chrome.tag.radius` is not a tag chrome field. The refusal is the merge's,
    // not the intent's, so the assertion is made where the refusal lives: the
    // migration must not launder it into a v2 document that compiles.
    const rejected = {
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: { advanced: { chrome: { tag: { radius: "4px" } } } },
    } as unknown as TenantThemeDocument;
    expect(() => css("bithire", rejected)).toThrow(/radius/);
    const migrated = migrateDocumentV1ToV2(rejected);
    expect(() => css("bithire", migrated)).toThrow(/radius/);
  });
});

/**
 * The migration against the documents app-platform actually seeds.
 *
 * THE RESULT IS A FINDING, not a formality: all SEVEN live rows are refused
 * today, six of them for the same reason (a free font stack, which kit row 6
 * closes to a registered pack id) and the seventh for per-mode seeds. That is
 * the migration being TOTAL and fail-closed, and it is also the exact work
 * app-platform owes before its rows can become v2 documents. The second block
 * proves the remediation is sufficient rather than merely stated.
 */
describe("the tier is not decorative (F-03)", () => {
  const proUnderStandard = v2(
    { "profiles.expressive": { type: "editorial" } },
    "standard"
  );

  it("refuses a Pro decision under a standard plan, IDENTICALLY at both doors", () => {
    // The same document, the same refusal, the same words. Preview accepting
    // what publish rejects is the shape F-13 measured; the tier check runs in
    // the contract both producers pass through, so there is one answer.
    const message = (run: () => unknown) => {
      try {
        run();
        return "accepted";
      } catch (error) {
        return (error as Error).message;
      }
    };
    const persisted = message(() =>
      documentThemeIntent({ vertical: "bithire", slug: "acme", document: proUnderStandard })
    );
    const preview = message(() =>
      previewThemeIntent({ vertical: "bithire", slug: "acme", document: proUnderStandard })
    );
    expect(persisted).toBe(preview);
    expect(persisted).toMatch(
      /decision "profiles\.expressive" is tier pro; plan standard entitles standard/u
    );
  });

  it("accepts the same decision once the plan entitles it", () => {
    const proPlan = v2({ "profiles.expressive": { type: "editorial" } }, "pro");
    expect(() =>
      documentThemeIntent({ vertical: "bithire", slug: "acme", document: proPlan })
    ).not.toThrow();
  });

  it("reads the tier from the catalog, which is its only source", () => {
    for (const id of THEME_DECISION_IDS) {
      expect(themeControlTier(id)).toBe(THEME_DECISION_TIER_BY_ID[id]);
    }
  });
});

describe("the generated schema closes the values the contract leaves open", () => {
  it("refuses an enum value outside the catalog's closed domain, by name", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: v2({ "density.mode": "roomy" as never }),
      })
    ).toThrow(
      /decision "density\.mode" value "roomy" is outside its closed domain compact \| normal \| spacious/u
    );
  });

  it("refuses a scale outside its closed range, by name", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: v2({ "typography.scale": 1.4 }),
      })
    ).toThrow(/decision "typography\.scale" value 1\.4 is outside its closed range \[0\.9, 1\.1\]/u);
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: v2({ "typography.scale": "1" as never }),
      })
    ).toThrow(/decision "typography\.scale" must be a finite number/u);
  });

  it("refuses a seed that is not a hex colour", () => {
    expect(() =>
      admitDocument({
        vertical: "bithire",
        document: v2({ "palette.seeds": { primary: "notacolor" } }),
      })
    ).toThrow(/decision "palette\.seeds" role "primary" must be a hex colour/u);
  });

  it("leaves registered and record domains to their own owners", () => {
    // `experience.profile` is a REGISTERED id and `motion.dial` a record: the
    // schema declares neither, so it must not invent a verdict about them.
    expect(THEME_DECISION_DOMAIN_SCHEMA["experience.profile"]).toBeUndefined();
    expect(THEME_DECISION_DOMAIN_SCHEMA["motion.dial"]).toBeUndefined();
    expect(THEME_DECISION_DOMAIN_SCHEMA["recipe-profile"]).toBeUndefined();
  });

  it("admits every value the six live verticals' remediated rows carry", () => {
    for (const { document } of APP_PLATFORM_ROW_REMEDIATIONS) {
      expect(() =>
        migrateAndAdmitDocument({ vertical: "bithire", document })
      ).not.toThrow();
    }
  });
});

describe("migrate v1 -> v2 over the real app-platform rows", () => {
  it("covers the seven seeded rows and nothing else", () => {
    expect(APP_PLATFORM_TENANT_ROWS).toHaveLength(7);
    expect(APP_PLATFORM_ROW_REMEDIATIONS.map((row) => row.tenant)).toEqual(
      APP_PLATFORM_TENANT_ROWS.map((row) => row.tenant)
    );
  });

  for (const { tenant, document } of APP_PLATFORM_TENANT_ROWS) {
    it(`refuses "${tenant}" by naming the exact v1 field that has no counterpart`, () => {
      const refusal = APP_PLATFORM_ROW_REMEDIATIONS.find(
        (row) => row.tenant === tenant
      )!;
      expect(() => migrateDocumentV1ToV2(document)).toThrow(
        ThemePatchMigrationError
      );
      expect(() => migrateDocumentV1ToV2(document)).toThrow(
        new RegExp(
          `v1 ${refusal.refusedField.replace(/\./gu, "\\.")} has no v2 counterpart`,
          "u"
        )
      );
    });
  }

  for (const { tenant, document } of APP_PLATFORM_ROW_REMEDIATIONS) {
    it(`migrates the remediated "${tenant}" row and derives its minimum plan`, () => {
      const migrated = migrateDocumentV1ToV2(document);
      expect(migrated.version).toBe(2);
      // Every seeded row authors `backgroundMode`, which is kit row 5 (Pro), so
      // the derived minimum is `pro`. It is DERIVED, never defaulted: a plan a
      // v1 row never had would be an entitlement nobody granted.
      expect(migrated.plan).toBe("pro");
      expect(Object.keys(migrated.decisions).length).toBeGreaterThan(0);
    });

    it(`admits the remediated "${tenant}" row through the same door as its v1 self`, () => {
      const admission = migrateAndAdmitDocument({
        vertical: "bithire",
        document,
      });
      expect(admission.version).toBe(2);
      // Everything the migration carried is LIT: the remediation removes only
      // fields v2 retires, so nothing survives the migration without a keypath.
      expect(admission.unlit).toEqual([]);
      expect(css("bithire", admission.migrated)).toEqual(css("bithire", document));
    });
  }
});
