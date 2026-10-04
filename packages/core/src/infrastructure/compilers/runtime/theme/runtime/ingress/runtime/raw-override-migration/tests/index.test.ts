import { describe, expect, it } from "vitest";

import {
  isTenantThemeDocumentVersioned,
  type TenantThemeDocumentAny,
  type TenantThemeDocumentV1,
} from "@/contracts/theme/presentation/document";
import { THEME_CONTROL_CATALOG } from "@/contracts/theme/runtime/catalog";
import { TENANT_THEME_OVERRIDE_TOKENS } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  FIRST_PARTY_VERTICAL_SLUGS,
  type FirstPartyVerticalId,
} from "@/foundation/contracts/kernel/verticals";
import { TENANT_THEME_TOKEN_VALUE_RULES } from "@/infrastructure/compilers/kernel/foundation/schemas/tenant-theme";
import {
  compileThemeIntent,
  emitThemeCss,
  tenantArtifactScope,
} from "@/infrastructure/compilers/runtime/theme";
import {
  PERSISTED_ROW_GENERAL,
  PERSISTED_ROW_OFF_ALLOWLIST,
  PERSISTED_ROW_OVERRIDES,
  PERSISTED_ROW_REPRESENTABLE,
  PERSISTED_ROW_VERTICAL,
  SEEDED_ROW_OVERRIDES,
  persistedRow,
} from "@tests/fixtures/tenants/raw-override-rows";

import {
  ThemePatchMigrationError,
  documentThemeIntent,
  migrateDocumentV1ToV2,
} from "../../..";
import {
  RAW_OVERRIDE_BLOCKING_OUTCOMES,
  RAW_OVERRIDE_FOLDS,
  foldRawTokenOverrides,
  type RawOverrideMigration,
  type RawOverrideResolution,
} from "..";

const stored = (value: unknown): TenantThemeDocumentAny =>
  value as TenantThemeDocumentAny;

function v1(document: TenantThemeDocumentAny): TenantThemeDocumentV1 {
  if (isTenantThemeDocumentVersioned(document)) {
    throw new Error("expected a v1 document");
  }
  return document;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const advancedRow = (
  tokenOverrides: unknown,
  general?: unknown,
  rest: Record<string, unknown> = {}
): TenantThemeDocumentAny =>
  stored(
    deepFreeze(
      JSON.parse(
        JSON.stringify({
          schemaVersion: 1,
          mode: "advanced",
          visualFoundation: {
            ...(general === undefined ? {} : { general }),
            advanced: { ...rest, tokenOverrides },
          },
        })
      )
    )
  );

function css(vertical: FirstPartyVerticalId, document: TenantThemeDocumentAny): string {
  const intent = documentThemeIntent({ vertical, slug: "acme", document });
  return emitThemeCss(
    compileThemeIntent(intent).compiled,
    tenantArtifactScope(vertical, "acme")
  );
}

function sampleValue(token: string): string | number {
  const rule = TENANT_THEME_TOKEN_VALUE_RULES[token];
  if (rule.type === "number") return rule.min ?? 1;
  if (rule.type !== "string") throw new Error(`no sample for ${token}`);
  if (rule.format === "hex-color" || rule.format === "color") return "#112233";
  if (rule.format === "font-family") return "Inter";
  return "4px";
}

const outcomes = (migration: RawOverrideMigration): Record<string, string> =>
  Object.fromEntries(migration.report.map((entry) => [entry.token, entry.outcome]));

const overridesOf = (document: TenantThemeDocumentAny): unknown =>
  JSON.parse(JSON.stringify(document)).visualFoundation?.advanced?.tokenOverrides;

const expectIdempotent = (
  vertical: FirstPartyVerticalId,
  document: TenantThemeDocumentAny,
  resolutions?: readonly RawOverrideResolution[]
): RawOverrideMigration => {
  const first = foldRawTokenOverrides({ vertical, document, resolutions });
  const again = foldRawTokenOverrides({
    vertical,
    document: first.document,
    resolutions,
  });
  if (first.status === "blocked") {
    expect(first.document).toBe(document);
    expect(JSON.stringify(again)).toBe(JSON.stringify(first));
  } else {
    expect(again.status).toBe("unchanged");
    expect(again.document).toBe(first.document);
    expect(again.report).toEqual([]);
    expect(overridesOf(first.document)).toBeUndefined();
  }
  return first;
};

const REPRESENTABLE = {
  "--ds-color-primary": ["palette.seeds", "palette.primary"],
  "--ds-color-secondary": ["palette.seeds", "palette.secondary"],
  "--ds-color-accent": ["palette.seeds", "palette.accent"],
  "--ds-color-bg-primary": ["palette.seeds", "palette.background"],
  "--ds-color-bg": ["palette.seeds", "palette.background"],
  "--ds-color-background": ["palette.seeds", "palette.background"],
  "--ds-color-success": ["palette.status-seeds", "palette.status.success"],
  "--ds-color-warning": ["palette.status-seeds", "palette.status.warning"],
  "--ds-color-error": ["palette.status-seeds", "palette.status.error"],
  "--ds-color-info": ["palette.status-seeds", "palette.status.info"],
  "--ds-effect-intensity": ["surfaces.effect-intensity", "surfaces.effectIntensity"],
} as const;

const NOTE = "owner ruling, test";
const acceptLoss = (token: string): RawOverrideResolution => ({
  token,
  action: "accept-loss",
  note: NOTE,
});

describe("the token table is the catalog's, not a third list", () => {
  it("exactly eleven of the closed list are a decision, each on its own general field", () => {
    expect(TENANT_THEME_OVERRIDE_TOKENS).toHaveLength(292);
    expect(
      Object.fromEntries(
        [...RAW_OVERRIDE_FOLDS].map(([token, fold]) => [
          token,
          [fold.decision, fold.field.join(".")],
        ])
      )
    ).toEqual(REPRESENTABLE);
    for (const fold of RAW_OVERRIDE_FOLDS.values()) {
      const row = THEME_CONTROL_CATALOG.find((entry) => entry.id === fold.decision);
      expect(row?.keypath.brandTheme).toContain(fold.leaf.split(".")[0]);
    }
  });

  it("every one of the 292 is folded or named unrepresentable, and re-running is a no-op", () => {
    const tally = { folded: 0, unrepresentable: 0 };
    for (const token of TENANT_THEME_OVERRIDE_TOKENS) {
      const document = advancedRow({ [token]: sampleValue(token) });
      const result = expectIdempotent("bithire", document);
      expect(result.report).toHaveLength(1);
      const [entry] = result.report;
      expect(entry.token).toBe(token);
      if (token in REPRESENTABLE) {
        expect(result.status).toBe("migrated");
        expect(entry.outcome).toBe("folded");
        tally.folded += 1;
      } else {
        expect(result.status).toBe("blocked");
        expect(entry.outcome).toBe("unrepresentable");
        expect(entry.reason).toBeTruthy();
        tally.unrepresentable += 1;
      }
    }
    expect(tally).toEqual({ folded: 11, unrepresentable: 281 });
  });

  it("agrees with the v1 -> v2 migrator on which tokens are a decision, and on which one", () => {
    for (const token of TENANT_THEME_OVERRIDE_TOKENS) {
      const document = advancedRow({ [token]: sampleValue(token) });
      const direct = (): unknown =>
        migrateDocumentV1ToV2(v1(document)).decisions;
      if (!RAW_OVERRIDE_FOLDS.has(token)) {
        expect(direct, token).toThrow(ThemePatchMigrationError);
        continue;
      }
      const folded = foldRawTokenOverrides({ vertical: "bithire", document });
      expect(folded.status, token).toBe("migrated");
      expect(migrateDocumentV1ToV2(v1(folded.document)).decisions, token).toEqual(
        direct()
      );
    }
  });
});

describe("the persisted row snapshot", () => {
  const document = stored(deepFreeze(persistedRow()));
  const names = Object.keys(PERSISTED_ROW_OVERRIDES);

  it("is blocked whole, and every one of its 56 entries is reported once", () => {
    const result = expectIdempotent(PERSISTED_ROW_VERTICAL, document);
    expect(result.status).toBe("blocked");
    expect(result.document).toBe(document);
    expect(result.report.map((entry) => entry.token)).toEqual([...names].sort());
    expect(result.report).toHaveLength(56);
    const by = (outcome: string): string[] =>
      result.report.filter((entry) => entry.outcome === outcome).map((entry) => entry.token);
    expect(by("folded")).toEqual([...PERSISTED_ROW_REPRESENTABLE]);
    expect(by("off-allowlist")).toEqual([...PERSISTED_ROW_OFF_ALLOWLIST]);
    expect(by("unrepresentable")).toHaveLength(41);
    for (const entry of result.report) {
      expect(entry.value).toEqual(PERSISTED_ROW_OVERRIDES[entry.token]);
      if (entry.outcome === "folded") {
        expect(entry.to).toBe(
          `$.visualFoundation.general.${REPRESENTABLE[entry.token as keyof typeof REPRESENTABLE][1]}`
        );
        expect(entry.decision).toBe(
          REPRESENTABLE[entry.token as keyof typeof REPRESENTABLE][0]
        );
      } else {
        expect(RAW_OVERRIDE_BLOCKING_OUTCOMES).toContain(entry.outcome);
        expect(entry.reason).toBeTruthy();
      }
    }
  });

  it("migrates only when the caller resolves all 45, and carries each note", () => {
    const pending = names.filter(
      (token) => !(PERSISTED_ROW_REPRESENTABLE as readonly string[]).includes(token)
    );
    expect(pending).toHaveLength(45);
    const partial = foldRawTokenOverrides({
      vertical: PERSISTED_ROW_VERTICAL,
      document,
      resolutions: pending.slice(1).map(acceptLoss),
    });
    expect(partial.status).toBe("blocked");
    expect(
      partial.report.filter((entry) =>
        (RAW_OVERRIDE_BLOCKING_OUTCOMES as readonly string[]).includes(entry.outcome)
      )
    ).toHaveLength(1);

    const resolutions = pending.map(acceptLoss);
    const result = expectIdempotent(PERSISTED_ROW_VERTICAL, document, resolutions);
    expect(result.status).toBe("migrated");
    expect(result.report).toHaveLength(56);
    for (const entry of result.report) {
      if (pending.includes(entry.token)) {
        expect(entry).toMatchObject({ outcome: "resolved", action: "accept-loss", note: NOTE });
      } else {
        expect(entry.outcome).toBe("folded");
      }
    }
    expect(JSON.parse(JSON.stringify(result.document))).toEqual({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        general: {
          ...PERSISTED_ROW_GENERAL,
          palette: {
            ...PERSISTED_ROW_GENERAL.palette,
            background: "#F4F0E8",
            status: {
              error: "#A9443F",
              info: "#4D668F",
              success: "#4B702F",
              warning: "#8A6716",
            },
          },
          surfaces: { ...PERSISTED_ROW_GENERAL.surfaces, effectIntensity: 0.18 },
        },
      },
    });
  });

  it("the seeded map folds one entry and names the other three", () => {
    const result = expectIdempotent("bithire", advancedRow(SEEDED_ROW_OVERRIDES));
    expect(outcomes(result)).toEqual({
      "--ds-density-scale": "unrepresentable",
      "--ds-effect-intensity": "folded",
      "--ds-letter-spacing-body": "unrepresentable",
      "--ds-line-height-body": "unrepresentable",
    });
  });
});

describe("the fold paints what the raw tokens painted", () => {
  const representable = Object.fromEntries(
    PERSISTED_ROW_REPRESENTABLE.map((token) => [token, PERSISTED_ROW_OVERRIDES[token]])
  );

  it("the snapshot's eleven representable entries compile to identical CSS", () => {
    const before = stored(deepFreeze(persistedRow(representable)));
    for (const vertical of ["bithire", "evnto"] as const) {
      const result = expectIdempotent(vertical, before);
      expect(result.status, vertical).toBe("migrated");
      expect(result.report).toHaveLength(11);
      expect(css(vertical, result.document)).toBe(css(vertical, before));
    }
  });

  it("each representable token alone compiles to identical CSS on every vertical", () => {
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const token of Object.keys(REPRESENTABLE)) {
        const value = token === "--ds-effect-intensity" ? 0.18 : "#315D4D";
        const before = advancedRow({ [token]: value });
        const result = foldRawTokenOverrides({ vertical, document: before });
        expect(result.status, `${vertical} ${token}`).toBe("migrated");
        expect(css(vertical, result.document), `${vertical} ${token}`).toBe(
          css(vertical, before)
        );
      }
    }
  });

  it("a raw value that beat an authored general value still paints, and the loser is reported", () => {
    const before = advancedRow(
      { "--ds-color-primary": "#315D4D", "--ds-effect-intensity": 0.18 },
      { palette: { primary: "#AA0000" }, surfaces: { effectIntensity: 0.9 } }
    );
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      const result = foldRawTokenOverrides({ vertical, document: before });
      expect(result.status).toBe("migrated");
      expect(result.report).toEqual([
        {
          token: "--ds-color-primary",
          value: "#315D4D",
          outcome: "folded-over-general",
          decision: "palette.seeds",
          to: "$.visualFoundation.general.palette.primary",
          replaced: "#AA0000",
        },
        {
          token: "--ds-effect-intensity",
          value: 0.18,
          outcome: "folded-over-general",
          decision: "surfaces.effect-intensity",
          to: "$.visualFoundation.general.surfaces.effectIntensity",
          replaced: 0.9,
        },
      ]);
      expect(css(vertical, result.document)).toBe(css(vertical, before));
    }
  });

  it("across every mode declaration: migrated means identical CSS, and a routed seed blocks", () => {
    const dark = { primary: "#789E8D", background: "#203028" };
    const tally = { migrated: 0, blocked: 0 };
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      for (const backgroundMode of [undefined, "light", "dark", "auto"]) {
        for (const withDark of [false, true]) {
          const label = `${vertical} ${String(backgroundMode)} dark:${withDark}`;
          const before = advancedRow(representable, {
            palette: {
              primary: "#AA0000",
              ...(backgroundMode ? { backgroundMode } : {}),
              ...(withDark ? { dark } : {}),
            },
          });
          const result = expectIdempotent(vertical, before);
          if (result.status === "migrated") {
            tally.migrated += 1;
            expect(css(vertical, result.document), label).toBe(css(vertical, before));
            continue;
          }
          tally.blocked += 1;
          const blocking = result.report.filter((entry) => entry.outcome !== "folded");
          expect(blocking.length, label).toBeGreaterThan(0);
          for (const entry of blocking) {
            expect(entry.outcome, label).toBe("mode-routing");
            expect(entry.token, label).not.toBe("--ds-effect-intensity");
          }
        }
      }
    }
    expect(tally).toEqual({ migrated: 17, blocked: 7 });
  });

  it("a dark overlay that shadows a seed blocks that seed and no other", () => {
    const result = foldRawTokenOverrides({
      vertical: "rottay",
      document: advancedRow(representable, {
        palette: {
          backgroundMode: "auto",
          dark: { primary: "#789E8D", background: "#203028" },
        },
      }),
    });
    expect(
      result.report
        .filter((entry) => entry.outcome === "mode-routing")
        .map((entry) => entry.token)
    ).toEqual([
      "--ds-color-background",
      "--ds-color-bg",
      "--ds-color-bg-primary",
      "--ds-color-primary",
    ]);
    expect(
      result.report.filter((entry) => entry.outcome === "folded")
    ).toHaveLength(7);
  });

  it("the routing block is not over-caution: the naive fold it refuses repaints", () => {
    const before = advancedRow(
      { "--ds-color-primary": "#315D4D" },
      { palette: { backgroundMode: "light" } }
    );
    const result = foldRawTokenOverrides({ vertical: "rottay", document: before });
    expect(outcomes(result)).toEqual({ "--ds-color-primary": "mode-routing" });
    const naive = stored({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        general: { palette: { backgroundMode: "light", primary: "#315D4D" } },
      },
    });
    expect(css("rottay", naive)).not.toBe(css("rottay", before));
  });
});

describe("nothing is decided or dropped in silence", () => {
  it("aliases that disagree block, and the caller says which one painted", () => {
    const document = advancedRow({
      "--ds-color-bg": "#111111",
      "--ds-color-background": "#222222",
      "--ds-color-bg-primary": "#111111",
    });
    const blocked = expectIdempotent("bithire", document);
    expect(outcomes(blocked)).toEqual({
      "--ds-color-background": "ambiguous",
      "--ds-color-bg": "ambiguous",
      "--ds-color-bg-primary": "ambiguous",
    });
    const result = expectIdempotent("bithire", document, [
      acceptLoss("--ds-color-background"),
    ]);
    expect(outcomes(result)).toEqual({
      "--ds-color-background": "resolved",
      "--ds-color-bg": "folded",
      "--ds-color-bg-primary": "folded",
    });
    expect(result.document).toEqual({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: { general: { palette: { background: "#111111" } } },
    });
  });

  it("a value the raw token admits and the decision does not is named, not coerced", () => {
    const result = expectIdempotent(
      "bithire",
      advancedRow({ "--ds-color-bg": "rgba(250, 247, 241, 0.88)" })
    );
    expect(result.status).toBe("blocked");
    expect(result.report[0]).toMatchObject({
      outcome: "unrepresentable",
      to: "$.visualFoundation.general.palette.background",
    });
    expect(result.report[0].reason).toContain(
      "$.visualFoundation.general.palette.background"
    );
  });

  it("an invalid value and an off-list name block by their own outcome", () => {
    const result = expectIdempotent(
      "bithire",
      advancedRow({
        "--ds-effect-intensity": 7,
        "--ds-private-secret": "1",
        "--ds-color-primary": "#315D4D",
      })
    );
    expect(result.status).toBe("blocked");
    expect(outcomes(result)).toEqual({
      "--ds-color-primary": "folded",
      "--ds-effect-intensity": "invalid-value",
      "--ds-private-secret": "off-allowlist",
    });
  });

  it("a replacement is written, reported by path, and never overwrites an authored value", () => {
    const document = advancedRow(
      { "--ds-radius-md": "5px" },
      { shape: { buttonStyle: "sharp" } },
      { chrome: { table: { radius: "5px" } } }
    );
    const replace = (
      replacement: RawOverrideResolution["replacement"]
    ): RawOverrideResolution => ({
      token: "--ds-radius-md",
      action: "replace",
      replacement,
      note: NOTE,
    });
    const result = expectIdempotent("bithire", document, [
      replace({
        general: { shape: { radiusScale: 0.9 } },
        advanced: { chrome: { cardComponent: { radius: "5px" } } },
      }),
    ]);
    expect(result.report).toEqual([
      {
        token: "--ds-radius-md",
        value: "5px",
        outcome: "resolved",
        action: "replace",
        note: NOTE,
        wrote: [
          "$.visualFoundation.advanced.chrome.cardComponent.radius",
          "$.visualFoundation.general.shape.radiusScale",
        ],
      },
    ]);
    expect(result.document).toEqual({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: {
        general: { shape: { buttonStyle: "sharp", radiusScale: 0.9 } },
        advanced: {
          chrome: { table: { radius: "5px" }, cardComponent: { radius: "5px" } },
        },
      },
    });

    const conflict = expectIdempotent("bithire", document, [
      replace({ general: { shape: { buttonStyle: "pill" } } }),
    ]);
    expect(outcomes(conflict)).toEqual({ "--ds-radius-md": "invalid-resolution" });
    expect(conflict.report[0].reason).toContain(
      "$.visualFoundation.general.shape.buttonStyle"
    );
  });

  it("a malformed resolution blocks instead of being read generously", () => {
    const document = advancedRow({ "--ds-radius-md": "5px" });
    const cases: readonly (readonly RawOverrideResolution[])[] = [
      [{ token: "--ds-radius-md", action: "accept-loss", note: "  " }],
      [acceptLoss("--ds-radius-md"), acceptLoss("--ds-radius-md")],
      [{ ...acceptLoss("--ds-radius-md"), replacement: { general: {} } }],
      [{ token: "--ds-radius-md", action: "replace", note: NOTE }],
      [{ token: "--ds-radius-md", action: "replace", note: NOTE, replacement: {} }],
      [
        {
          token: "--ds-radius-md",
          action: "replace",
          note: NOTE,
          replacement: { advanced: { tokenOverrides: { "--ds-radius-lg": "5px" } } },
        },
      ],
      [
        {
          token: "--ds-radius-md",
          action: "replace",
          note: NOTE,
          replacement: { recipeProfile: "anything" },
        },
      ],
      [
        {
          token: "--ds-radius-md",
          action: "replace",
          note: NOTE,
          replacement: { general: { shape: { radiusScale: 9 } } },
        },
      ],
      [
        {
          token: "--ds-radius-md",
          action: "drop" as RawOverrideResolution["action"],
          note: NOTE,
        },
      ],
    ];
    for (const resolutions of cases) {
      const result = expectIdempotent("bithire", document, resolutions);
      expect(outcomes(result), JSON.stringify(resolutions)).toEqual({
        "--ds-radius-md": "invalid-resolution",
      });
      expect(result.report[0].reason).toBeTruthy();
    }
  });

  it("a resolution for a token the row does not carry changes nothing", () => {
    const document = advancedRow({ "--ds-color-primary": "#315D4D" });
    expect(
      foldRawTokenOverrides({
        vertical: "bithire",
        document,
        resolutions: [acceptLoss("--ds-radius-md")],
      })
    ).toEqual(foldRawTokenOverrides({ vertical: "bithire", document }));
  });

  it("a replacement that re-routes a folded seed blocks the fold", () => {
    const replace = (replacement: unknown): RawOverrideResolution => ({
      token: "--ds-radius-md",
      action: "replace",
      note: NOTE,
      replacement: replacement as RawOverrideResolution["replacement"],
    });
    const row = { "--ds-color-primary": "#315D4D", "--ds-radius-md": "5px" };
    for (const vertical of FIRST_PARTY_VERTICAL_SLUGS) {
      const other = vertical === "rottay" ? "light" : "dark";
      const own = vertical === "rottay" ? "dark" : "light";
      expect(
        outcomes(
          foldRawTokenOverrides({
            vertical,
            document: advancedRow(row),
            resolutions: [replace({ general: { palette: { backgroundMode: other } } })],
          })
        )["--ds-color-primary"]
      ).toBe("mode-routing");
      expect(
        foldRawTokenOverrides({
          vertical,
          document: advancedRow(row),
          resolutions: [replace({ general: { palette: { backgroundMode: own } } })],
        }).status
      ).toBe("migrated");
    }
    expect(
      foldRawTokenOverrides({
        vertical: "rottay",
        document: advancedRow(row, { palette: { backgroundMode: "auto" } }),
        resolutions: [replace({ general: { palette: { dark: { primary: "#789E8D" } } } })],
      }).status
    ).toBe("blocked");
  });

  it("an own __proto__ key in the stored row survives the clone as a key", () => {
    const document = stored(
      JSON.parse(
        '{"schemaVersion":1,"mode":"advanced","visualFoundation":{"general":{"__proto__":{"palette":{"primary":"#FF0000"}}},"advanced":{"tokenOverrides":{"--ds-effect-intensity":0.2}}}}'
      )
    );
    const result = foldRawTokenOverrides({ vertical: "bithire", document });
    const general = JSON.parse(JSON.stringify(result.document)).visualFoundation.general;
    expect(Object.keys(general)).toContain("__proto__");
  });
});

describe("documents the fold leaves alone, and the ones it refuses to read", () => {
  it("returns the input itself when there is no raw field to retire", () => {
    const untouched: readonly unknown[] = [
      { version: 2, plan: "standard", decisions: {} },
      { version: 3, plan: "standard", decisions: {} },
      { schemaVersion: 1, mode: "simple", appearance: { palette: { primary: "#315D4D" } } },
      { schemaVersion: 1, mode: "advanced", visualFoundation: {} },
      {
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced: { chrome: { table: { radius: "5px" } } } },
      },
    ];
    for (const value of untouched) {
      const document = stored(deepFreeze(value));
      const result = foldRawTokenOverrides({ vertical: "bithire", document });
      expect(result).toEqual({ status: "unchanged", document, report: [] });
      expect(result.document).toBe(document);
    }
  });

  it("removes an empty raw map, and prunes only the container it emptied", () => {
    const bare = expectIdempotent("bithire", advancedRow({}));
    expect(bare).toEqual({
      status: "migrated",
      document: { schemaVersion: 1, mode: "advanced", visualFoundation: {} },
      report: [],
    });
    const kept = expectIdempotent(
      "bithire",
      advancedRow({}, undefined, { responsivePosture: "balanced" })
    );
    expect(kept.document).toEqual({
      schemaVersion: 1,
      mode: "advanced",
      visualFoundation: { advanced: { responsivePosture: "balanced" } },
    });
  });

  it("refuses by name what it cannot read as a row", () => {
    expect(() =>
      foldRawTokenOverrides({
        vertical: "acme" as FirstPartyVerticalId,
        document: advancedRow({}),
      })
    ).toThrow(ThemePatchMigrationError);
    for (const malformed of [null, [], "x", 3]) {
      expect(() =>
        foldRawTokenOverrides({
          vertical: "bithire",
          document: stored({
            schemaVersion: 1,
            mode: "advanced",
            visualFoundation: { advanced: { tokenOverrides: malformed } },
          }),
        })
      ).toThrow("$.visualFoundation.advanced.tokenOverrides; expected an object");
    }
  });
});
