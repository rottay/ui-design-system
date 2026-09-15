/**
 * The v1 WRITE validator admits exactly the catalog, on both transports.
 *
 * `TENANT_THEME_CONFIG_SCHEMA` is hand-kept while the v2 decision domains are
 * GENERATED from the typed catalog, so the two can drift in one direction only:
 * a catalog row gains a keypath, the reverse projection learns to write it, and
 * the hand-kept write schema never hears about it. That drift is silent in the
 * worst possible place — `parseTenantThemeDocument` refuses the row as
 * `unknown_key`, so the decision is unauthorable through the door a customer
 * actually writes through, while every v2-side test stays green. Six rows were
 * in exactly that state (`palette.neutral-temperature`,
 * `palette.contrast-posture`, `shape.nesting`, `shape.control-height`,
 * `states.emphasis`, `states.focus-style`) after CC-01 had widened the same file
 * for its own four.
 *
 * So the law here is not a list of six names. It is CLOSURE, measured two ways:
 *
 * 1. FORWARD — every closed-word-list row the catalog declares is admitted at
 *    its own v1 keypath, for every value of its domain, on the simple and the
 *    advanced path; and a value outside that domain is refused at that same
 *    keypath. Driven off `THEME_CONTROL_CATALOG`, so a new row is covered the
 *    moment it is declared rather than when someone remembers this file.
 * 2. BACKWARD — the v1 document `projectDecisionsToV1` produces for a decision
 *    must be one `validateTenantThemeDocument` accepts. That is the loop that
 *    was open: the projection already wrote all six, so the compiler was
 *    emitting documents its own write validator rejected.
 *
 * The rows whose domain is not a word list are covered by specimen, because a
 * generic sampler cannot author a font stack or a motion dial: a colour sampled
 * into `typography.fontFamilyBase` is refused for being an unsafe font family,
 * which looks like a schema gap and is not one. Every appearance row is in
 * exactly one of the two cohorts, asserted, so a row added without a specimen
 * fails here instead of going unmeasured.
 */
import { describe, expect, it } from "vitest";

import { firstPartyFixture, lowerFlatThemeFixture } from "@tests/support/theme-lowering";
import {
  THEME_CONTROL_CATALOG,
  type ThemeControlRow,
} from "@/contracts/theme/runtime/catalog";
import type { ThemeDecisions } from "@/contracts/theme/presentation/document";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  migrateDocumentV1ToV2,
  projectDecisionsToV1,
} from "@/infrastructure/compilers/runtime/theme/runtime/ingress";

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  parseTenantThemeDocument,
  validateTenantThemeDocument,
} from "../index";

const bithireFlatTheme = firstPartyFixture('bithire');

const ENVELOPE = getTenantThemeVerticalEnvelope("bithire")!;
const IDENTITY = {
  tenantId: "tenant_write_schema_closure",
  slug: "write-schema-closure",
  verticalKey: "bithire",
  rowVersion: 1,
} as const;

/** The prefix the catalog states every v1 general keypath under. */
const GENERAL_PREFIX = "appearance.general.";

const APPEARANCE_ROWS = THEME_CONTROL_CATALOG.filter((row) =>
  row.keypath.document?.startsWith(GENERAL_PREFIX)
);

/**
 * The rows a schema enum can close by itself: one closed word list at one leaf.
 * `palette.dark-mode` is an enum whose keypath is a brace group, so it belongs
 * to the specimen cohort with the other multi-leaf rows.
 */
const ENUM_ROWS = APPEARANCE_ROWS.filter(
  (row) => row.domain.kind === "enum" && !row.keypath.document!.includes("{")
);

const leafOf = (row: ThemeControlRow): string =>
  row.keypath.document!.slice(GENERAL_PREFIX.length);

const valuesOf = (row: ThemeControlRow): readonly string[] =>
  row.domain.kind === "enum" ? row.domain.values : [];

function authored(leaf: string, value: unknown): Record<string, unknown> {
  const segments = leaf.split(".");
  return segments.reduceRight<unknown>(
    (carried, segment) => ({ [segment]: carried }),
    value
  ) as Record<string, unknown>;
}

const simple = (general: unknown): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "simple",
    appearance: general,
  }) as unknown as TenantThemeDocument;

const advanced = (general: unknown): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: { general },
  }) as unknown as TenantThemeDocument;

/** The two write paths, each with the `$` prefix its own refusals carry. */
const TRANSPORTS = [
  { mode: "simple", document: simple, prefix: "$.appearance" },
  { mode: "advanced", document: advanced, prefix: "$.visualFoundation.general" },
] as const;

/**
 * One authored specimen per row the enum cohort cannot reach, in the row's own
 * vocabulary. Keyed by decision id so a renamed row breaks the map rather than
 * silently losing its coverage.
 */
const SPECIMENS: Partial<Record<ThemeControlRow["id"], Record<string, unknown>>> =
  {
    "palette.seeds": {
      palette: {
        primary: "#0F766E",
        secondary: "#8C6D46",
        accent: "#E2725B",
        background: "#FBF6EC",
      },
    },
    "palette.status-seeds": {
      palette: {
        status: {
          success: "#2F7A3D",
          warning: "#B5850F",
          error: "#A32E22",
          info: "#2C6FA6",
        },
      },
    },
    "palette.dark-mode": {
      palette: {
        backgroundMode: "auto",
        dark: { primary: "#7FD1C8", background: "#101617" },
      },
    },
    "typography.families": {
      typography: {
        fontFamilyBase: "Inter, sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, serif",
      },
    },
    "typography.scale": { typography: { scale: 1.05 } },
    "shape.radius-scale": { shape: { radiusScale: 1.1 } },
    "surfaces.effect-intensity": { surfaces: { effectIntensity: 0.4 } },
    "motion.dial": {
      motion: { intensity: 0.5, durationScale: 1, ambient: "subtle" },
    },
    "experience.profile": { experienceProfile: "rottay/bithire-technical@1" },
  };

describe("every catalog row the v1 shape declares is WRITABLE through it", () => {
  it("covers all 25 appearance rows between the two cohorts, with no remainder", () => {
    // The assertion that keeps this file honest as the catalog grows: a new
    // appearance row joins the enum cohort automatically or needs a specimen,
    // and a row in neither is unmeasured rather than proven.
    const covered = new Set([
      ...ENUM_ROWS.map((row) => row.id),
      ...Object.keys(SPECIMENS),
    ]);
    expect(
      APPEARANCE_ROWS.filter((row) => !covered.has(row.id)).map((row) => row.id)
    ).toEqual([]);
    expect(APPEARANCE_ROWS).toHaveLength(25);
    expect(ENUM_ROWS).toHaveLength(16);
  });

  it("admits every value of every closed word list, on both transports", () => {
    for (const row of ENUM_ROWS) {
      for (const value of valuesOf(row)) {
        for (const transport of TRANSPORTS) {
          const result = validateTenantThemeDocument(
            transport.document(authored(leafOf(row), value))
          );
          expect({
            row: row.id,
            value,
            mode: transport.mode,
            issues: result.success ? [] : result.issues,
          }).toEqual({ row: row.id, value, mode: transport.mode, issues: [] });
        }
      }
    }
  });

  it("admits every row whose domain a schema enum cannot state", () => {
    for (const [id, general] of Object.entries(SPECIMENS)) {
      for (const transport of TRANSPORTS) {
        const result = validateTenantThemeDocument(transport.document(general));
        expect({
          row: id,
          mode: transport.mode,
          issues: result.success ? [] : result.issues,
        }).toEqual({ row: id, mode: transport.mode, issues: [] });
      }
    }
  });
});

describe("a value outside a closed word list is refused BY NAME", () => {
  it("names the row's own keypath and the domain it left, on both transports", () => {
    for (const row of ENUM_ROWS) {
      const leaf = leafOf(row);
      for (const transport of TRANSPORTS) {
        const result = validateTenantThemeDocument(
          transport.document(authored(leaf, "not-a-member-of-this-domain"))
        );
        expect(result.success).toBe(false);
        // Exactly one issue: a refusal that also complained about a sibling
        // would mean the hostile value had disturbed something else.
        expect(result.success === false && result.issues).toEqual([
          {
            code: "invalid_value",
            path: `${transport.prefix}.${leaf}`,
            message: `Expected one of ${valuesOf(row).join(", ")}`,
          },
        ]);
      }
    }
  });

  it("refuses a key the catalog does not declare, beside the ones it does", () => {
    // The negative control for the widening: admitting six named leaves must
    // not have opened their parent nodes to anything else, including the one
    // node this lot created.
    const unknowns = [
      ["palette.neutralWarmth", { palette: { neutralWarmth: "warm" } }],
      ["shape.nestingLaw", { shape: { nestingLaw: "uniform" } }],
      ["states.emphasisLevel", { states: { emphasisLevel: "strong" } }],
      ["interactions", { interactions: { emphasis: "strong" } }],
    ] as const;
    for (const [path, general] of unknowns) {
      for (const transport of TRANSPORTS) {
        const result = validateTenantThemeDocument(transport.document(general));
        expect(result.success === false && result.issues).toEqual([
          {
            code: "unknown_key",
            path: `${transport.prefix}.${path}`,
            message: "Field is not part of TenantThemeConfig v1",
          },
        ]);
      }
    }
  });
});

describe("the projection writes documents the write validator accepts", () => {
  it("closes the v2 -> v1 -> write-validator loop for every closed word list", () => {
    // The backward half, and the measurement that would have caught all six
    // before a customer did: `projectDecisionsToV1` is the compiler's own
    // writer of v1 documents, so a row it can write and the validator cannot
    // read is a door that contradicts itself.
    for (const row of ENUM_ROWS) {
      for (const value of valuesOf(row)) {
        const { v1, projections } = projectDecisionsToV1({
          version: 2,
          plan: "pro",
          decisions: { [row.id]: value } as Partial<ThemeDecisions>,
        });
        expect(projections.map((entry) => [entry.id, entry.lit])).toEqual([
          [row.id, true],
        ]);
        const result = validateTenantThemeDocument(v1);
        expect({
          row: row.id,
          value,
          issues: result.success ? [] : result.issues,
        }).toEqual({ row: row.id, value, issues: [] });
      }
    }
  });
});

/**
 * The six rows this lot connected, with the in-memory spelling of each.
 *
 * The FlatTheme keypath is the catalog's own `keypath.brandTheme`, written out
 * as the object a theme author would hand the compiler: the parity measurement
 * below needs the same decision expressed in both vocabularies.
 */
/**
 * Every row states a value the bithire baseline does NOT already rest at.
 *
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
 * the preset states postures the retired authored theme left unstated --
 * `palette.contrastPosture: "high"`, `surfaces.nesting: "uniform"` and
 * `surfaces.stateEmphasis: "strong"` are the baseline's own values now. A row
 * authoring one of those moves nothing on EITHER arm, which is two empty
 * deltas agreeing: the vacuity this block's last assertion exists to forbid,
 * not a lost producer. Each of the three therefore authors the other end of its
 * own closed domain; the decision under test is unchanged.
 */
const CONNECTED = [
  {
    id: "palette.neutral-temperature",
    general: { palette: { neutralTemperature: "warm" } },
    flatTheme: { palette: { neutralTemperature: "warm" } },
  },
  {
    id: "palette.contrast-posture",
    general: { palette: { contrastPosture: "soft" } },
    flatTheme: { palette: { contrastPosture: "soft" } },
  },
  {
    id: "shape.nesting",
    general: { shape: { nesting: "concentric" } },
    flatTheme: { surfaces: { nesting: "concentric" } },
  },
  {
    id: "shape.control-height",
    general: { shape: { controlHeight: "tall" } },
    flatTheme: { surfaces: { controlHeight: "tall" } },
  },
  {
    id: "states.emphasis",
    general: { states: { emphasis: "subtle" } },
    flatTheme: { surfaces: { stateEmphasis: "subtle" } },
  },
  {
    id: "states.focus-style",
    general: { states: { focusStyle: "glow" } },
    flatTheme: { surfaces: { focusStyle: "glow" } },
  },
] as const;

function deepMerge<T extends object>(base: T, patch: object): T {
  const merged = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    const current = merged[key];
    merged[key] =
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      current !== null &&
      typeof current === "object" &&
      !Array.isArray(current)
        ? deepMerge(current as object, value as object)
        : value;
  }
  return merged as T;
}

/**
 * The seed both arms rest on.
 *
 * It is bithire's OWN primary: authoring any palette key activates the tenant
 * palette arm, so a base document with no palette at all would make every
 * seed-derived channel part of the delta. Authoring the baseline's own value
 * activates the arm in both the base and the moved compile, leaving only the
 * posture's own channels in the difference.
 */
const BASE_GENERAL = {
  palette: { primary: bithireFlatTheme.palette!.primaryColor! },
};

const documentVariables = (general: object): Record<string, string> =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(simple(general), IDENTITY),
    { verticalEnvelope: ENVELOPE }
  ).variables;

const flatThemeVariables = (patch: object): Record<string, string> =>
  lowerFlatThemeFixture({
    flatTheme: deepMerge(bithireFlatTheme, patch) as FlatTheme,
    tenantSlug: IDENTITY.slug,
  }).cssVariables;

/** What authoring the posture MOVED: name -> the value it moved to. */
const moved = (
  before: Record<string, string>,
  after: Record<string, string>
): Record<string, string | null> =>
  Object.fromEntries(
    [...new Set([...Object.keys(before), ...Object.keys(after)])]
      .filter((name) => before[name] !== after[name])
      .sort()
      .map((name) => [name, after[name] ?? null])
  );

describe("the six connected rows compile to the same bytes on both transports", () => {
  it("moves the same channels to the same values from the document and from memory", () => {
    // Delta against delta, on ONE shared vertical baseline, rather than the two
    // absolute variable sets: the document arm emits a DELTA against the
    // baseline and the static arm emits a whole identity, so comparing the sets
    // would measure that difference instead of this decision.
    for (const row of CONNECTED) {
      const fromDocument = moved(
        documentVariables(BASE_GENERAL),
        documentVariables(deepMerge(BASE_GENERAL, row.general))
      );
      const fromMemory = moved(
        flatThemeVariables({}),
        flatThemeVariables(row.flatTheme)
      );
      // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15), pending DT
      // registration. The two arms start from different BASES: the document
      // arm's base authors bithire's own primary, which activates the tenant
      // palette arm, while the static arm's base is the fixture itself and
      // does not. Over neutral + preset those two on-primary inks already rest
      // at the baseline's own value under that activation, so the document
      // arm's delta withdraws them in BOTH compiles and reports no move, while
      // the static arm reports the absolute one. This is the deferred
      // white-label defect the digest fixtures already record -- a
      // baseline-authored leaf outranking the tenant's seed -- seen from the
      // parity side; the previous fixture value for this row was the
      // baseline's own, so the row moved nothing at all and the asymmetry
      // could not surface. Named exactly, so any OTHER divergence still reds.
      const BASE_ACTIVATION_ONLY = row.id === "palette.contrast-posture"
        ? ["--ds-color-primary-foreground", "--ds-color-text-on-primary"]
        : [];
      for (const channel of BASE_ACTIVATION_ONLY) {
        expect(fromMemory[channel], `${row.id} ${channel}`).toBeDefined();
        expect(fromDocument[channel], `${row.id} ${channel}`).toBeUndefined();
        delete fromMemory[channel];
      }
      expect({ row: row.id, moved: fromDocument }).toEqual({
        row: row.id,
        moved: fromMemory,
      });
      // Non-empty on purpose: two empty deltas are equal and prove nothing.
      expect(Object.keys(fromDocument).length).toBeGreaterThan(0);
    }
  });

  it("compiles identically whether or not the document passed the validator", () => {
    for (const row of CONNECTED) {
      const document = simple(deepMerge(BASE_GENERAL, row.general));
      const validated = compileTenantThemeConfig(
        hydrateTenantThemeConfig(parseTenantThemeDocument(document), IDENTITY),
        { verticalEnvelope: ENVELOPE }
      );
      const direct = compileTenantThemeConfig(
        hydrateTenantThemeConfig(document, IDENTITY),
        { verticalEnvelope: ENVELOPE }
      );
      expect({ row: row.id, css: validated.css, digest: validated.digest }).toEqual(
        { row: row.id, css: direct.css, digest: direct.digest }
      );
    }
  });

  it("carries each one through the v1 -> v2 migration instead of dropping it", () => {
    // A persisted v1 row the validator now admits must also survive the
    // migration: a decision the transport accepts and the migration drops is
    // the same silent loss, one station later.
    for (const row of CONNECTED) {
      const migrated = migrateDocumentV1ToV2(
        simple(deepMerge(BASE_GENERAL, row.general))
      );
      expect(Object.keys(migrated.decisions).sort()).toEqual(
        ["palette.seeds", row.id].sort()
      );
    }
  });
});
