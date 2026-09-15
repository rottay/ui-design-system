/**
 * PROVENANCE ACCEPTANCE — a tenant's accepted intent must reach CSS, or be
 * rejected at ingestion. Never accepted, normalized, digested and discarded.
 *
 * The DB path lowers a `TenantThemeDocument` into a `ThemeLayerPatch`, resolves that
 * patch onto the code-owned vertical `Theme`, and compiles the result through
 * the single `compileTheme`. `resolveTheme` is a total merge: the Theme it
 * returns carries no record of WHICH layer authored a field. That erasure was
 * load-bearing for two defects this file pins closed:
 *
 * 1. A tenant that sets its own `palette.primaryColor` moved the primary ramp
 *    and nothing else, because the vertical baseline authors the button, link
 *    and focus chrome derived from that seed as concrete leaves, and a leaf in
 *    the merged Theme outranks a derivation regardless of who wrote it.
 * 2. A tenant that authors `chrome.sidebar.bg` AND `navigation.sidebarTone` in
 *    the same document had the posture overwrite its own explicit leaf, because
 *    the tone `Object.assign` ran last over a flat chrome object.
 *
 * Both are resolved by carrying the tenant's authorship — and nothing else —
 * alongside the resolved Theme. `collectPatchAuthoredPaths` reads it off the
 * patch, which IS the authorship record: a path can only appear there because
 * the document put it there. The compiler consults it at exactly two sites,
 * under one five-rank lattice:
 *
 *   PROFILE(0) < BASELINE_LEAF(1) < BASELINE_RECIPE(2)
 *              < TENANT_DERIVED(3) < TENANT_LEAF(4)
 *
 * The ranks are not decoration. Each adjacency is a decided law with a case
 * below: 0<1 is `expressive-envelope-acid`'s BASELINE_CONTESTED (a profile
 * default loses to the vertical's own leaf), 1<3 is case D, 3<4 is case D2,
 * 1<4 is case F, and 2<4 is case B.
 *
 * Nothing here changes a value or a formula. `applyTenantSeedDerivations`
 * reuses `derivePrimarySemantics` and `deriveInteractionFloor` verbatim; the
 * sidebar site reuses `sidebarToneToVariables` verbatim. What changed is only
 * WHO WINS, and only where a tenant actually authored the contested field —
 * which is why case C, the three shipped first-party themes, is byte-identical.
 */
import { describe, expect, it } from "vitest";

import {
  CONSULTED_PROVENANCE_FIELDS,
  collectPatchAuthoredLeaves,
  collectPatchAuthoredPaths,
  mergeThemePatches,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  PRODUCER_RANK,
  SIDEBAR_TONE_FIELD,
  SIDEBAR_TONE_LEAF_FIELDS,
} from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";
import {
  PRIMARY_SEED_FIELD,
  SEED_SHADOWING_FIELDS,
  STATUS_SEED_FIELDS,
  STATUS_SEED_SHADOWING_FIELDS,
} from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/seeds";
import { withExpressiveFieldDefaults } from "@/infrastructure/compilers/runtime/theme/runtime/ingress/foundation/profile-expansion/foundation/field-defaults";

import {
  SIDEBAR_CONTRAST_ATTRIBUTION,
  TenantThemeValidationError,
  compileTenantThemeConfig,
  tenantPostureFloors,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "..";
import { migrateV1 } from "@/infrastructure/compilers/runtime/theme/runtime/ingress";
import { FIRST_PARTY_BASELINES, lowerTheme } from "@tests/support/theme-lowering";

const VERTICALS = ["rottay", "bithire", "evnto"] as const;
type Vertical = (typeof VERTICALS)[number];

/** One identity for every compilation here, so digests are comparable. */
const IDENTITY = {
  tenantId: "t_provenance",
  slug: "provenance-acceptance",
  rowVersion: 1,
} as const;

const compileFor = (vertical: Vertical, document: unknown) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(document, { ...IDENTITY, verticalKey: vertical }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical) }
  );

/**
 * The document the artifact-stability fixtures pin. Reproduced rather than
 * imported because this file asserts the OPPOSITE half of the same law: the
 * stability test pins what the delta no longer restates, this one pins what it
 * newly must.
 *
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
 * `navigation.sidebarTone` moved "subtle" -> "strong" in BOTH copies. `subtle`
 * is no longer admissible on bithire: its derived `--ds-sidebar-text` /
 * `--ds-sidebar-bg` pair is two references the APCA checker cannot read, so
 * admission fails closed. The refusal is pinned in `tenant-theme-compiler.test.ts`
 * under "refusals the neutral baseline introduces" and registered pending DT
 * adjudication; `strong` keeps the navigation axis in the fixture.
 */
const POPULATED_SIMPLE_DOCUMENT = {
  schemaVersion: 1,
  mode: "simple",
  appearance: {
    palette: {
      primary: "#0F766E",
      secondary: "#8C6D46",
      accent: "#E2725B",
      backgroundMode: "light",
    },
    typography: {
      fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
      fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
    },
    density: "normal",
    motion: { intensity: 0.62, durationScale: 1.15, ambient: "subtle" },
    shape: { buttonStyle: "soft" },
    surfaces: { elevation: "elevated" },
    navigation: { sidebarTone: "strong" },
  },
} as const;

/**
 * The eleven channels a primary seed owns: the six `derivePrimarySemantics`
 * emits plus the five interaction-floor channels. Assembled from the compiler's
 * own shadowing table rather than hand-listed, so a channel added to the family
 * cannot be silently omitted from this file's coverage.
 */
const SEED_FAMILY = Object.keys(SEED_SHADOWING_FIELDS);

/**
 * The six the bithire baseline authors as concrete leaves, which is why they
 * were DEFERRED in `tenant-theme-artifact-stability` and why they now enter the
 * delta. Values are the compiler's own derivation from `#0F766E`, measured, not
 * chosen: the two `var()` chains resolve per mode by construction and the two
 * literals are `deriveInteractionFloor`'s seed and `shadeSeed`'s hover step.
 */
const BITHIRE_SEED_DERIVED: Readonly<Record<string, string>> = {
  "--ds-button-primary-bg-hover": "#00635C",
  "--ds-color-border-focus": "#0F766E",
  "--ds-color-link": "#0F766E",
  "--ds-color-link-hover": "#00635C",
};

/**
 * The five the seed does NOT move, and the reason is a value predicate rather
 * than a rank: three are `var()` indirections that already point AT the
 * channels the seed controls, and the two inks resolve to the same `#ffffff`
 * under tenant and baseline alike — `#0F766E` takes the light ink on both
 * metrics. Re-deriving them would replace a value with an identical value, so
 * the delta inherits them. They stay in `POPULATED_WITHDRAWN` as benign rows.
 */
const BITHIRE_SEED_INHERITED = [
  "--ds-button-primary-bg",
  "--ds-button-primary-border",
  "--ds-button-primary-color",
  "--ds-color-primary-foreground",
  "--ds-color-text-on-primary",
  // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
  // so does the vertical. These two crossed from DERIVED to INHERITED for the
  // reason the group above states: the bithire preset BAKES no input focus
  // leaf, where the retired theme did, so the tenant's derivation no longer
  // displaces a baked value -- it equals the baseline and the delta withdraws
  // it. The law is unchanged: every channel of the family is still either
  // moved or deliberately inherited, and the partition below stays closed.
  "--ds-input-border-focus",
  "--ds-input-shadow-focus",
] as const;

/** Every schema-admitted `advanced.chrome.sidebar` COLOR field. */
const SIDEBAR_COLOR_FIELDS: Readonly<Record<string, string>> = {
  bg: "--ds-sidebar-bg",
  border: "--ds-sidebar-border",
  text: "--ds-sidebar-text",
  textMuted: "--ds-sidebar-text-muted",
  groupColor: "--ds-sidebar-group-color",
  itemColor: "--ds-sidebar-item-color",
  itemColorActive: "--ds-sidebar-item-color-active",
  itemBgActive: "--ds-sidebar-item-bg-active",
  itemBgHover: "--ds-sidebar-item-bg-hover",
  footerBg: "--ds-sidebar-footer-bg",
};

/** APCA Lc 0.0 against each other; above nothing. */
const SUB_FLOOR_PAIR = {
  itemColorActive: "#2A2824",
  itemBgActive: "#3D3B36",
} as const;

/** The same pair, authored legibly. */
const ABOVE_FLOOR_PAIR = {
  itemColorActive: "#FFFFFF",
  itemBgActive: "#1A3A6E",
} as const;

const advanced = (visualFoundation: unknown) => ({
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation,
});

describe("the lattice is five ranks and is ordered", () => {
  it("states one strict order from profile default to tenant leaf", () => {
    const ordered = [
      PRODUCER_RANK.profile,
      PRODUCER_RANK.baselineLeaf,
      PRODUCER_RANK.baselineRecipe,
      PRODUCER_RANK.tenantDerived,
      PRODUCER_RANK.tenantLeaf,
    ];
    expect(ordered).toEqual([0, 1, 2, 3, 4]);
    expect(new Set(Object.values(PRODUCER_RANK)).size).toBe(5);
  });
});

describe("site A — a tenant seed re-derives the family it owns", () => {
  it("case D: baked BitHire leaves enter the delta at the tenant seed values", () => {
    const artifact = compileFor("bithire", POPULATED_SIMPLE_DOCUMENT);

    for (const [channel, value] of Object.entries(BITHIRE_SEED_DERIVED)) {
      expect(
        artifact.variables[channel],
        `${channel} must carry the tenant seed's derivation, not the vertical's blue`
      ).toBe(value);
    }
    // The complement, asserted as a complement so the family stays closed: a
    // channel is either moved above or deliberately inherited below, never
    // unaccounted for.
    expect(
      [...Object.keys(BITHIRE_SEED_DERIVED), ...BITHIRE_SEED_INHERITED].sort()
    ).toEqual([...SEED_FAMILY].sort());
    for (const channel of BITHIRE_SEED_INHERITED) {
      expect(
        artifact.variables[channel],
        `${channel} bakes no color of its own and must stay inherited`
      ).toBeUndefined();
    }
  });

  it("case D: derivation is idempotent — a second compile is byte-identical", () => {
    const first = compileFor("bithire", POPULATED_SIMPLE_DOCUMENT);
    const second = compileFor("bithire", POPULATED_SIMPLE_DOCUMENT);
    expect(second.variables).toEqual(first.variables);
    expect(second.digest).toBe(first.digest);
  });

  it("case D2: the tenant's own explicit leaf shadows its own derivation", () => {
    const artifact = compileFor(
      "bithire",
      advanced({
        general: { palette: { primary: "#0F766E", backgroundMode: "light" } },
        advanced: { chrome: { controls: { buttonPrimary: { bg: "#123456" } } } },
      })
    );
    expect(artifact.variables["--ds-button-primary-bg"]).toBe("#123456");
    // Every OTHER member of the family still re-derives: the shadowing is per
    // channel, not a family-wide opt-out.
    expect(artifact.variables["--ds-button-primary-bg-hover"]).toBe(
      BITHIRE_SEED_DERIVED["--ds-button-primary-bg-hover"]
    );
    expect(artifact.variables["--ds-color-link"]).toBe(
      BITHIRE_SEED_DERIVED["--ds-color-link"]
    );
  });

  it("case F: a tenant leaf beats the vertical baseline leaf with no seed at all", () => {
    const artifact = compileFor(
      "bithire",
      advanced({
        advanced: { chrome: { controls: { buttonPrimary: { bg: "#123456" } } } },
      })
    );
    expect(artifact.variables).toEqual({ "--ds-button-primary-bg": "#123456" });
    // No seed authored means no derivation ran: the delta is the authored leaf
    // and nothing else.
    for (const channel of SEED_FAMILY) {
      if (channel === "--ds-button-primary-bg") continue;
      expect(artifact.variables[channel]).toBeUndefined();
    }
  });
});

/**
 * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, and
 * every block below moved from the `inverse` posture to `strong`, beside a
 * tenant primary.
 *
 * WO-DER-06 derivation-lane registry, pending DT registration: `inverse` is now
 * INERT on bithire -- its fan-out equals the baseline, so the delta withdraws
 * every channel it used to produce -- and on rottay and evnto it derives a pair
 * the APCA checker cannot read, so admission fails closed. Either way it can no
 * longer carry this site's subject, which is that an explicit tenant leaf
 * outranks the tenant's OWN tone. `strong` still fans out on all three, so the
 * subject is preserved rather than pinned away; the tone's own values move from
 * the neutral ramp to the primary ramp with it. The refusals themselves are
 * pinned in `tenant-theme-compiler.test.ts` under "refusals the neutral
 * baseline introduces".
 */
describe("site B — an explicit sidebar leaf outranks the tenant's own tone", () => {
  const TONE = { palette: { primary: "#0F766E" }, navigation: { sidebarTone: "strong" } };

  it("case B: the authored pair survives a `strong` posture in the same document", () => {
    const document = advanced({
      general: TONE,
      advanced: { chrome: { sidebar: ABOVE_FLOOR_PAIR } },
    });
    for (const vertical of ["bithire", "evnto"] as const) {
      const artifact = compileFor(vertical, document);
      expect(
        artifact.variables["--ds-sidebar-item-color-active"],
        `${vertical} must emit the tenant's own ink`
      ).toBe(ABOVE_FLOOR_PAIR.itemColorActive);
      expect(artifact.variables["--ds-sidebar-item-bg-active"]).toBe(
        ABOVE_FLOOR_PAIR.itemBgActive
      );
      // The posture still governs every channel the tenant did NOT state — it
      // outranks the vertical's leaves, it simply no longer outranks the
      // tenant's own.
      expect(artifact.variables["--ds-sidebar-bg"]).toBe(
        "var(--ds-color-primary-900)"
      );
    }
    // rottay no longer rests at this ink literally: K1 (33efc95c0) rewired its
    // baseline leaf to the alias `var(--ds-color-primary)`
    // (brand-themes/rottay/index.ts:4315), so a tenant authoring the literal
    // `#FFFFFF` diverges from that alias and the delta emits the row exactly
    // like bithire and evnto.
    const rottay = compileFor("rottay", document);
    expect(rottay.variables["--ds-sidebar-item-color-active"]).toBe(
      ABOVE_FLOOR_PAIR.itemColorActive
    );
    expect(rottay.variables["--ds-sidebar-item-bg-active"]).toBe(
      ABOVE_FLOOR_PAIR.itemBgActive
    );
  });

  it("case B: the leaves the tone would have overwritten reach CSS byte-exact", () => {
    const artifact = compileFor(
      "bithire",
      advanced({
        general: TONE,
        advanced: { chrome: { sidebar: { bg: "#101014", text: "#F4F4F5" } } },
      })
    );
    expect(artifact.variables["--ds-sidebar-bg"]).toBe("#101014");
    expect(artifact.variables["--ds-sidebar-text"]).toBe("#F4F4F5");
    expect(artifact.css).toContain("--ds-sidebar-bg: #101014;");
    expect(artifact.css).toContain("--ds-sidebar-text: #F4F4F5;");
    // The ones the tenant left unstated still carry the posture.
    expect(artifact.variables["--ds-sidebar-item-bg-active"]).toBe(
      "var(--ds-color-primary-700)"
    );
    expect(artifact.variables["--ds-sidebar-item-bg-hover"]).toBe(
      "var(--ds-color-primary-800)"
    );
  });

  it("every tone-produced channel has a leaf that can outrank it", () => {
    const artifact = compileFor("bithire", advanced({ general: TONE }));
    for (const channel of Object.keys(SIDEBAR_TONE_LEAF_FIELDS)) {
      expect(
        SIDEBAR_TONE_LEAF_FIELDS[channel],
        `${channel} must name the field that outranks the tone`
      ).toMatch(/^chrome\.sidebar\./);
    }
    // The tone is alive: with no leaf authored it still paints.
    expect(Object.keys(artifact.variables).length).toBeGreaterThan(0);
  });
});

describe("APCA is fail-closed on authored sidebar colors", () => {
  it("case A: a sub-floor authored pair is rejected on every vertical and posture", () => {
    for (const vertical of VERTICALS) {
      for (const tone of [undefined, "inverse"] as const) {
        const document = advanced({
          ...(tone ? { general: { navigation: { sidebarTone: tone } } } : {}),
          advanced: { chrome: { sidebar: SUB_FLOOR_PAIR } },
        });
        let thrown: unknown;
        try {
          compileFor(vertical, document);
        } catch (error) {
          thrown = error;
        }
        expect(
          thrown,
          `${vertical} tone=${tone ?? "none"} must reject a sub-floor authored pair`
        ).toBeInstanceOf(TenantThemeValidationError);
        expect(
          (thrown as TenantThemeValidationError).issues.some((issue) =>
            issue.message.includes("--ds-sidebar-item-color-active")
          )
        ).toBe(true);
      }
    }
  });

  it("case A: rejection never repaints — no adjusted value is ever emitted", () => {
    // The remedy attributes authorship so the pair becomes MEASURABLE. It does
    // not add a correction: the guard's only outcome for an authored sub-floor
    // pair is a typed rejection, which is why the compile above throws instead
    // of returning a lightened ink.
    const artifact = compileFor(
      "bithire",
      advanced({ advanced: { chrome: { sidebar: ABOVE_FLOOR_PAIR } } })
    );
    // The field is omitted entirely when nothing was corrected, so its absence
    // IS the assertion: no authored sidebar color was ever rewritten.
    expect(artifact.adjustments).toBeUndefined();
    expect(artifact.variables["--ds-sidebar-item-color-active"]).toBe(
      ABOVE_FLOOR_PAIR.itemColorActive
    );
  });

  it("affirmative census: every admitted sidebar color is emitted byte-exact or rejected", () => {
    const probe = "#7B2D8E";
    for (const [field, channel] of Object.entries(SIDEBAR_COLOR_FIELDS)) {
      for (const vertical of VERTICALS) {
        const document = advanced({
          advanced: { chrome: { sidebar: { [field]: probe } } },
        });
        let artifact;
        try {
          artifact = compileFor(vertical, document);
        } catch (error) {
          expect(
            error,
            `${vertical}.${field} must reject with the typed document error`
          ).toBeInstanceOf(TenantThemeValidationError);
          continue;
        }
        expect(
          artifact.variables[channel],
          `${vertical}.${field} was accepted and digested, so it must reach CSS`
        ).toBe(probe);
        expect(artifact.css).toContain(`${channel}: ${probe};`);
      }
    }
  });

  it("the contrast attribution is exactly the governed sidebar pairs", () => {
    expect(Object.keys(SIDEBAR_CONTRAST_ATTRIBUTION).sort()).toEqual([
      "chrome.sidebar.bg",
      "chrome.sidebar.itemBgActive",
      "chrome.sidebar.itemColorActive",
      "chrome.sidebar.text",
    ]);
    for (const field of Object.keys(SIDEBAR_CONTRAST_ATTRIBUTION)) {
      expect(
        CONSULTED_PROVENANCE_FIELDS.has(field),
        `${field} is consulted, so it must be declared in the closed authority`
      ).toBe(true);
    }
  });

  it("the raw override route to the same channels stays closed", () => {
    expect(() =>
      compileFor(
        "bithire",
        advanced({
          advanced: {
            tokenOverrides: {
              "--ds-sidebar-item-bg-active": "#3D3B36",
              "--ds-sidebar-item-color-active": "#2A2824",
            },
          },
        })
      )
    ).toThrow(TenantThemeValidationError);
  });
});

describe("case C — no contested tenant authorship changes nothing", () => {
  it("compiles every first-party theme byte-identically with and without provenance", () => {
    for (const vertical of VERTICALS) {
      const theme = FIRST_PARTY_BASELINES[vertical];
      const bare = lowerTheme(theme, { tenantSlug: IDENTITY.slug });
      const empty = lowerTheme(theme, {
        tenantSlug: IDENTITY.slug,
        tenantAuthoredPaths: new Set<string>(),
      });
      expect(empty.cssVariables, `${vertical} base block`).toEqual(
        bare.cssVariables
      );
      expect(empty.modeBlocks, `${vertical} mode blocks`).toEqual(
        bare.modeBlocks
      );
    }
  });

  it("keeps the shipped first-party variable counts", () => {
    /* bithire 1231 -> 1229, con la aritmetica completa escrita porque tres lotes
     * la movieron y una cuenta sin procedencia es imposible de auditar despues:
     *   1231  estado previo
     *    -3   F2A-1 Lote F (96b610162): --ds-surface-overlay,
     *         --ds-material-overlay-background y --ds-material-raised-foreground,
     *         removidos como duplicados de la capa base
     *    +2   F2A-1 Lote F-2 (este cierre): se RESTAURAN los dos primeros. No eran
     *         deuda muerta: salen de un solo campo (surfaceRoles.overlay.background)
     *         que emite el canal y su alias en el mismo `if`, y el alias existe,
     *         segun el comentario del propio compilador, para que un override DB
     *         no quede enmascarado. Su remocion rompia la particion por modo en la
     *         ruta de override plano (SC-7, APCA Lc 10.3).
     *    -1   F2A-1 Lote F-prima (decision 19): --ds-glass-blur, congelaba el
     *         resultado del dial surfaces.effect-intensity. Sitio unico de emision
     *         (brand-theme/index.ts:1009), verificado en fuente y en el artefacto.
     *   ----
     *   1229  medido hoy
     * --ds-material-raised-foreground sigue removido: es el unico de los tres del
     * Lote F que si era duplicado sin ruta de override que proteger. */
    /* Family-cut wave, measured commit by commit on isolated copies of the tree
     * (2026-09-14), with the same `lowerTheme` call the assertion below makes.
     * Every row is one commit and the parent of every row measures exactly the
     * previous row, so nothing between rows moved and the sums close with no
     * residue. Cells are added/removed keys per vertical, rottay / bithire /
     * evnto; a rename counts on both sides. This test has no --write mode: the pins
     * are inline, so this table is the procedure.
     *   1307 / 1283 /  584  anchor ff65f13c8 (WO-DER-05), the pins this table starts from
     *         +1      +36       +2  327c190d1  button (WO-FAM-01)
     *         +5       +8       +8  89e4920a5  checkbox
     *         +3       +8       +8  85e8dc70b  radio
     *        +11      +16      +16  e31c1174e  toggle
     *        +28       +3      +29  3c41c9dcc  segmented
     *         +2       +1       +2  9d924e9f2  controls fix: toggle-hover, segmented-item
     *    +12/-12       +0       +0  82c900730  input-number rename: rottay's authored --ds-inputnumber-* emit as --ds-input-number-* (WO-FAM-02)
     *       +112     +130     +137  cbce5ba71  field derivers wired: input, textarea, password-input, otp-input, tag-input, input-number, form-field, form
     *   +245/-31  +253/-1  +253/-1  bebfa7d3e  selection derivers wired: select, auto-complete, cascader, tree-select, mentions, transfer, date-picker, time-picker, color-picker; rottay drops the 31 pre-cut autocomplete/datepicker/timepicker names, bithire and evnto drop --ds-timepicker-panel-shadow (WO-FAM-03)
     *        +29       +0       +0  6b1bd546a  29 pre-cut picker names restated for the frozen skins, rottay only
     *        +19      +19      +34  75d77e375  modal (WO-FAM-04)
     *        +23      +29      +29  dc770e967  drawer
     *        +23      +23      +23  37063a7ed  sheet
     *        +38      +38      +38  a9e48ebc1  alert-dialog 16 + confirm-dialog 22
     *        +29      +29      +29  0d154c0d4  popover
     *         +6       +6       +6  008fb6609  hover-card
     *        +27      +31      +31  c6be7d3bd  dropdown
     *        +34      +40      +40  179da599a  tooltip
     *        +23      +23      +23  b43b9b7e9  tour
     *       +115     +115     +115  a4a8b6f2e  notifier (toast, notification, message roles)
     *        +55      +55      +55  0866afe18  alert with Callout folded in
     *     +0/-12   +0/-12   +0/-12  85bc5edc9  bare-var accent channels retired: alert 4 + notifier 8
     *         +4       +4       +4  3082d0dfb  --ds-alert-<tone>-wash-subtle
     *         +2       +2       +2  04e835647  --ds-toggle-{track,dot}-border-radius
     *   2098 / 2139 / 1455  re-anchored at 9bd9e3dd8 (the 51aea6509 tree); 72a1a99b6 and 73c6e9195 measure the same
     *        +82      +91      +92  eabf62987  menu chrome deriver (WO-FAM-05 lot 1), every key a --ds-menu-* relation
     *      +0/-1    +0/-2       +0  61280a253  profile emissions retired: --ds-recipe-profile (rottay, bithire) and --ds-experience-profile (bithire) travel as runtime data (WO-DER-06 2d-i); b68389160 (catalog data-only row) moves nothing
     *       +171     +152     +213  011910356  tabs, breadcrumb and pagination chrome derivers (WO-FAM-05 lot 2): rottay tabs 95, breadcrumb 39, pagination 37; bithire tabs 78, breadcrumb 32, pagination 42; evnto tabs 128, breadcrumb 43, pagination 42
     *   2350 / 2380 / 1760  the WO-FAM-05 lot 2 tree (011910356; a054f8972 is docs-only and measures the same)
     *         +0    +0/-1       +0  95a85b080  --ds-elevation-border-style retired with its producers (WO-DER-06 2d-ii); bithire is the one first-party theme whose flat posture emitted it
     *   2350 / 2379 / 1760  measured today (7b35276d5)
     *        +81      +81      +81  1ddfd6198  steps merge into stepper + sidebar-surface cut + sidebar roots wired (WO-FAM-05 close)
     *         +6       +6       +6  b5f547692  popover title padding consumed through the recipe chain
     *         +0       +0       +0  aded1f21d  roster and identity out of brand-themes (WO-DER-06 D6-2b); no channel moves
     *         +0       +0       +0  1390ebb82  the neutral foundation (WO-DER-06 D6-2a); lowerTheme's default baseline source is unchanged
     *        +26      +26      +26  3aea57452  card chrome deriver (WO-FAM-06 lot 1)
     *         +0       +1       +1  4aebf68f0  --ds-card-padding-base; rottay already authored it
     *   2463 / 2493 / 1874  measured 2026-09-15 (the a4bc94927 tree): 449e86e55 (texture, emission layer), 008eb19e2 (foundation retirements), b6ef4cc66 (gates) and 654fd1036 (docs) measure the same
     *  +15/-888   +6/-752  +15/-299  D6-2c-ii (WO-DER-06): the authored first-party themes are retired and a vertical is the neutral foundation plus its preset document
     *   1590 / 1747 / 1590  measured 2026-09-15 on this tree
     * Totals: rottay +1227/-944, bithire +1232/-768, evnto +1318/-312.
     *
     * The D6-2c-ii row is the largest single move this table records and it is
     * measured, not inferred: both legs were compiled with the SAME
     * `lowerTheme` call this test makes, the pre-lot leg on an isolated copy of
     * the HEAD tree, which reproduced 2463 / 2493 / 1874 byte-exact. What the
     * presets ADD is the structural decision vocabulary the retired themes
     * never carried as channels -- the five per-size `--ds-button-*-radius`,
     * `--ds-control-height-scale`, `--ds-density-mode-factor`,
     * `--ds-rhythm-scale`, `--ds-radius-nest-{ratio,inset}` and
     * `--ds-edge-emphasis-width` among them. What they REMOVE is the authored
     * chrome the themes hand-wrote family by family (alert, badge, button and
     * the rest). rottay and evnto land on the SAME 1590 because their presets
     * are structural only and author no palette; bithire keeps 157 more because
     * its preset authors palette seeds and typeface families. */
    const counts: Record<Vertical, number> = {
      // COH-1 (2026-08-30): 1192 -> 1196. `deriveStatusTintFloor` now
      // explicitly emits `--ds-color-alpha-{success,warning,error,info}-10`
      // in rottay's DARK block: rottay's light overlay authors all seven
      // alpha channels, but its dark (default) body authors only the three
      // `alphaSuccess20`/`alphaWarning20`/`alphaError20` fields, so these
      // four `-10` channels used to fall through to `default.css`'s `:root`
      // cascade default without ever appearing as an explicit compiled key.
      // Two of the four resolve to the byte-identical rgba the cascade
      // already gave (success/warning, whose dark seed matches the
      // foundation literal); error/info additionally correct the resolved
      // colour to rottay's own dark seed. Either way, the KEY is new, so the
      // count moves regardless of which of the four also changed a byte.
      // WO-DER-02 (measured): 1196 -> 1276. `derivation/materials` emits all 71
      // material roots for every vertical instead of only the authored facets,
      // and `derivation/states` adds the six interaction deltas and the three
      // focus-ring channels. rottay had authored none of the 71, so it gains
      // 71 + 9 = 80. Nothing was removed and no existing value moved.
      // WO-DER-04 (measured, additive-only): rottay 1276 -> 1315, added
      // 39, removed 0. Every added key is one of the five families that
      // gained an owner -- the 11 `--ds-z-index-*` bands the compiler
      // never carried, the 8 `--ds-font-weight-*` steps `headingWeightBias`
      // now reaches, the 6 `--ds-breakpoint-*` steps, the 4 `--ds-posture-*`
      // channels `responsive.posture` used to withhold, and the 10
      // `--ds-motion-*` roles that had no resting value. 18 EXISTING values
      // also moved, all of them ramp entries: `--ds-text-*` size and leading
      // now carry `var(--ds-type-scale, 1)` and each entry is expressed on its
      // own facets. At the default scale of 1 they compute byte-identically;
      // what changed is that a tenant's type scale finally reaches the ramp.
      // WO-DER-03 palette half (measured): rottay 1315 -> 1307, removed 10,
      // added 2. The ten removed are `--ds-color-accent-{50..900}`, a ramp with
      // no `var()` reader anywhere in the package; the two added are
      // `--ds-color-neutral-ink` and `--ds-color-neutral-paper`, the monochrome
      // ramp's own anchors, read by `foundation/monochrome`. No surviving value
      // moved: the -8 is a keyset move, not a paint move.
      // Family-cut wave (measured, 2026-09-14): rottay 1307 -> 2098, added 846, removed
      // 55, commit by commit in the table above.
      // WO-FAM-05 lots 1 and 2 plus DER-06 2d-i (measured, 2026-09-15): rottay 2098 -> 2350,
      // added 253, removed 1, rows eabf62987, 61280a253 and 011910356 in the table above.
      // FAM-05 close + FAM-06 lot 1 (measured, 2026-09-15): rottay 2350 -> 2463,
      // added 113, removed 0, rows 1ddfd6198, b5f547692, aded1f21d, 1390ebb82,
      // 3aea57452 and 4aebf68f0 in the table above.
      // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset,
      // and so does the vertical itself -- the authored theme is retired.
      // rottay 2463 -> 1590, added 15, removed 888, measured against an
      // isolated copy of the HEAD tree that reproduced 2463 byte-exact.
      rottay: 1590,
      // Status tint derivation adds seven keys; three unused emissions were
      // subsequently retired from the compiler.
      // WO-DER-02 (measured): 1233 -> 1248. bithire had already authored 65 of
      // the 71 material roots by hand, so it gains only the 6 it was missing
      // plus the same 9 state/focus channels.
      // WO-DER-04 (measured, additive-only): bithire 1248 -> 1291, added
      // 43, removed 0. Every added key is one of the five families that
      // gained an owner -- the 4 elevation roles and the border style a `flat` posture now states over the whole ladder, the 11 `--ds-z-index-*` bands the compiler
      // never carried, the 8 `--ds-font-weight-*` steps `headingWeightBias`
      // now reaches, the 6 `--ds-breakpoint-*` steps, the 4 `--ds-posture-*`
      // channels `responsive.posture` used to withhold, and the 10
      // `--ds-motion-*` roles that had no resting value. 18 EXISTING values
      // also moved, all of them ramp entries: `--ds-text-*` size and leading
      // now carry `var(--ds-type-scale, 1)` and each entry is expressed on its
      // own facets. At the default scale of 1 they compute byte-identically;
      // what changed is that a tenant's type scale finally reaches the ramp.
      // WO-DER-03 palette half (measured): bithire 1291 -> 1283, removed 10,
      // added 2. The ten removed are `--ds-color-accent-{50..900}`, a ramp with
      // no `var()` reader anywhere in the package; the two added are
      // `--ds-color-neutral-ink` and `--ds-color-neutral-paper`, the monochrome
      // ramp's own anchors, read by `foundation/monochrome`. No surviving value
      // moved: the -8 is a keyset move, not a paint move.
      // Family-cut wave (measured, 2026-09-14): bithire 1283 -> 2139, added 869, removed
      // 13, commit by commit in the table above.
      // WO-FAM-05 lots 1 and 2 plus DER-06 2d-i and 2d-ii (measured, 2026-09-15): bithire
      // 2139 -> 2379, added 243, removed 3, rows eabf62987, 61280a253, 011910356 and
      // 95a85b080 in the table above.
      // FAM-05 close + FAM-06 lot 1 (measured, 2026-09-15): bithire 2379 -> 2493,
      // added 114, removed 0, rows 1ddfd6198, b5f547692, aded1f21d, 1390ebb82,
      // 3aea57452 and 4aebf68f0 in the table above.
      // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset,
      // and so does the vertical itself -- the authored theme is retired.
      // bithire 2493 -> 1747, added 6, removed 752, measured against an
      // isolated copy of the HEAD tree that reproduced 2493 byte-exact.
      bithire: 1747,
      // COH-1 (2026-08-30): 468 -> 475. Same shape as bithire: evnto never
      // authored any of the seven alpha channels in either mode, so
      // `deriveStatusTintFloor` adds +7 new explicit keys to the base block.
      // The four retired `*BgColor` and four retired `*BorderColor` light
      // literals do not move this count (measured directly): each was
      // already an explicit compiled key before retirement (authored) and
      // remains one now (derived) -- same channel, different producer.
      // WO-DER-02 (measured): 475 -> 553. evnto had authored 2 of the 71.
      // WO-DER-04 (measured, additive-only): evnto 553 -> 592, added
      // 39, removed 0. Every added key is one of the five families that
      // gained an owner -- the 11 `--ds-z-index-*` bands the compiler
      // never carried, the 8 `--ds-font-weight-*` steps `headingWeightBias`
      // now reaches, the 6 `--ds-breakpoint-*` steps, the 4 `--ds-posture-*`
      // channels `responsive.posture` used to withhold, and the 10
      // `--ds-motion-*` roles that had no resting value. 18 EXISTING values
      // also moved, all of them ramp entries: `--ds-text-*` size and leading
      // now carry `var(--ds-type-scale, 1)` and each entry is expressed on its
      // own facets. At the default scale of 1 they compute byte-identically;
      // what changed is that a tenant's type scale finally reaches the ramp.
      // WO-DER-03 palette half (measured): evnto 592 -> 584, removed 10,
      // added 2. The ten removed are `--ds-color-accent-{50..900}`, a ramp with
      // no `var()` reader anywhere in the package; the two added are
      // `--ds-color-neutral-ink` and `--ds-color-neutral-paper`, the monochrome
      // ramp's own anchors, read by `foundation/monochrome`. No surviving value
      // moved: the -8 is a keyset move, not a paint move.
      // Family-cut wave (measured, 2026-09-14): evnto 584 -> 1455, added 884, removed
      // 13, commit by commit in the table above.
      // WO-FAM-05 lots 1 and 2 plus DER-06 2d-i (measured, 2026-09-15): evnto 1455 -> 1760,
      // added 305, removed 0, rows eabf62987, 61280a253 and 011910356 in the table above.
      // FAM-05 close + FAM-06 lot 1 (measured, 2026-09-15): evnto 1760 -> 1874,
      // added 114, removed 0, rows 1ddfd6198, b5f547692, aded1f21d, 1390ebb82,
      // 3aea57452 and 4aebf68f0 in the table above.
      // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset,
      // and so does the vertical itself -- the authored theme is retired.
      // evnto 1874 -> 1590, added 15, removed 299, measured against an
      // isolated copy of the HEAD tree that reproduced 1874 byte-exact.
      evnto: 1590,
    };
    for (const vertical of VERTICALS) {
      expect(
        Object.keys(
          lowerTheme(FIRST_PARTY_BASELINES[vertical], {
            tenantSlug: IDENTITY.slug,
          }).cssVariables
        ).length,
        `${vertical} first-party channel count`
      ).toBe(counts[vertical]);
    }
  });

  it("leaves an empty document at an empty delta", () => {
    for (const vertical of VERTICALS) {
      const artifact = compileFor(vertical, {
        schemaVersion: 1,
        mode: "simple",
        appearance: {},
      });
      expect(artifact.variables, `${vertical} empty delta`).toEqual({});
    }
  });
});

describe("static and DB share one lowering", () => {
  /** Rebuild the DB leg's own inputs, exactly as `compileTenantThemeConfig` does. */
  const lower = (vertical: Vertical, document: TenantThemeDocument) => {
    const baseTheme = FIRST_PARTY_BASELINES[vertical];
    const envelope = migrateV1(document, baseTheme.appearance.defaultMode!);
    return {
      baseTheme,
      resolved: mergeThemePatches(baseTheme, envelope.patch),
      authoredPaths: collectPatchAuthoredPaths(envelope.patch),
      // The modes family carries a tenant's mode-agnostic decisions from one
      // block into the other, and it reads the HONEST set to do it. A mirror
      // that omits it is no longer the same lowering.
      authoredLeaves: collectPatchAuthoredLeaves(envelope.patch),
      // E-1: the DB leg hands the compiler the tenant's posture FLOORS as well
      // as its authorship, so a reconstruction that omits them is no longer the
      // same lowering. Imported rather than re-derived: one definition, or this
      // mirror drifts from the compiler it is meant to mirror.
      floors: tenantPostureFloors(envelope.patch),
    };
  };

  const LEAF_ONLY_DOCUMENT = advanced({
    advanced: {
      chrome: {
        sidebar: { bg: "#101014", text: "#F4F4F5" },
        controls: { buttonPrimary: { bg: "#123456" } },
      },
    },
  }) as unknown as TenantThemeDocument;

  /**
   * The populated document minus its navigation tone.
   *
   * The mirror law is about the LOWERING, not about the sidebar tone, so it
   * states a document without one. The toned document is exercised on its own
   * in the row below, on all three verticals.
   */
  const MIRROR_DOCUMENT = {
    ...POPULATED_SIMPLE_DOCUMENT,
    appearance: Object.fromEntries(
      Object.entries(POPULATED_SIMPLE_DOCUMENT.appearance).filter(
        ([key]) => key !== "navigation"
      )
    ),
  } as unknown as TenantThemeDocument;

  it("admits a sidebar tone beside a forced light mode on every vertical", () => {
    // rottay is dark-default, so forcing light makes dark the overlay and the
    // tone's derived pair is two references inside it. Adjudication #2
    // (2026-09-15): the floor resolves those against the foundation's own
    // declarations, so the pair is judged on its ratio rather than refused for
    // its form. Asserted on all three verticals and with the tone dropped, so a
    // regression on either side is visible.
    const toned = POPULATED_SIMPLE_DOCUMENT as unknown as TenantThemeDocument;
    for (const vertical of VERTICALS) {
      expect(() => compileFor(vertical, toned), vertical).not.toThrow();
    }
    expect(() => compileFor("rottay", MIRROR_DOCUMENT)).not.toThrow();
  });

  it("case G1: the artifact is the direct lowering minus the vertical baseline", () => {
    for (const vertical of VERTICALS) {
      const artifact = compileFor(vertical, MIRROR_DOCUMENT);
      const { baseTheme, resolved, authoredPaths, authoredLeaves, floors } = lower(
        vertical,
        MIRROR_DOCUMENT
      );
      const direct = lowerTheme(resolved, {
        tenantSlug: IDENTITY.slug,
        tenantAuthoredPaths: authoredPaths,
        tenantAuthoredLeaves: authoredLeaves,
        tenantPatch: floors,
      });
      const baseline = lowerTheme(baseTheme, { tenantSlug: IDENTITY.slug });

      const effective = { ...baseline.cssVariables, ...artifact.variables };
      expect(effective, `${vertical} base block`).toEqual(direct.cssVariables);

      for (const delta of artifact.modeDeltas ?? []) {
        const directBlock = (direct.modeBlocks ?? []).find(
          (block) => block.mode === delta.mode
        );
        expect(directBlock, `${vertical} ${delta.mode} block`).toBeDefined();
        // EFFECTIVE, not the block alone. A compile's own mode block carries
        // only what moves against its OWN base, while the artifact's delta
        // carries what moves against the VERTICAL's mode -- so a channel the
        // tenant pulled into both of its blocks is stated by the artifact and
        // withdrawn by the compile. Both say the same thing about the
        // selector; only the effective value is comparable.
        const directEffective = {
          ...direct.cssVariables,
          ...directBlock!.cssVariables,
        };
        for (const [channel, value] of Object.entries(delta.variables)) {
          expect(
            directEffective[channel],
            `${vertical} ${delta.mode} ${channel}`
          ).toBe(value);
        }
      }
    }
  });

  it("case G3 (E-1): the tenant's posture floor outranks an authored ladder", () => {
    // THE DEFECT THIS FIX CLOSES, as a fence. rottay is the only vertical that
    // authors values for all six `surfaces.elevations` levels, and the compiler
    // lowers an authored ladder AFTER the governed posture preset by law ("the
    // preset is the floor a tenant selects, an authored ladder is the ceiling").
    // Before E-1 the DB leg resolved the tenant's patch into the theme and then
    // compiled without a tenant floor, so the selection lowered at the
    // VERTICAL's position and the ladder erased it: `surfaces.elevation` moved
    // ZERO variables on both non-identity stops while the static arm moved
    // three. The values below are the static arm's, reproduced through the DB
    // door.
    // WO-DER-04: a posture now states the WHOLE seven-role ladder. It used to
    // state levels 1..3 only, so a flat
    // product still got a deep modal shadow from roles 4..6.
    const PRESET = {
      flat: {
        // D6-2c-ii (2026-09-15): tenant-document compiles over neutral +
        // preset, and role 0 joined the delta. It used to be absent because
        // rottay's retired theme stated `none` for it as well, so the tenant's
        // flat posture moved nothing there; the preset states no elevation
        // ladder of its own, so the posture now moves role 0 like the rest.
        "--ds-elevation-0": "none",
        "--ds-elevation-1": "none",
        "--ds-elevation-2": "none",
        "--ds-elevation-3": "0 1px 2px rgba(0,0,0,0.05)",
        "--ds-elevation-4": "0 1px 3px rgba(0,0,0,0.06)",
        "--ds-elevation-5": "0 2px 4px rgba(0,0,0,0.07)",
        "--ds-elevation-6": "0 2px 6px rgba(0,0,0,0.08)",
      },
      elevated: {
        // Same move as `flat` above: role 0 joins the delta over the preset.
        "--ds-elevation-0": "none",
        "--ds-elevation-1": "0 2px 4px rgba(0,0,0,0.08)",
        "--ds-elevation-2": "0 4px 8px rgba(0,0,0,0.1)",
        "--ds-elevation-3": "0 8px 16px rgba(0,0,0,0.12)",
        "--ds-elevation-4": "0 16px 32px rgba(0,0,0,0.14)",
        "--ds-elevation-5": "0 24px 48px rgba(0,0,0,0.16)",
        "--ds-elevation-6": "0 32px 64px rgba(0,0,0,0.18)",
      },
    } as const;
    const elevationDoc = (elevation: string) => ({
      schemaVersion: 1,
      mode: "simple",
      appearance: { surfaces: { elevation } },
    });
    for (const stop of ["flat", "elevated"] as const) {
      const artifact = compileFor("rottay", elevationDoc(stop));
      for (const [channel, value] of Object.entries(PRESET[stop])) {
        expect(artifact.variables[channel], `rottay/${stop} ${channel}`).toBe(
          value
        );
      }
    }
    // `soft` writes no channel at all (its preset is empty), so it is not a
    // witness for this axis on ANY vertical -- asserted so a future reader does
    // not mistake its silence for this defect returning.
    expect(
      compileFor("rottay", elevationDoc("soft")).variables
    ).toEqual({});
    // ADJUDICATED (DT, 2026-08-24, option B): the floor runs per BLOCK, so a
    // tenant selection governs BOTH modes and a mode overlay that the floor
    // overwrites stops diverging from the base -- it drops out of that block's
    // delta. bithire is where E-1's sweep surfaced it: before the fix its dark
    // overlay kept `--ds-letter-spacing-heading: -0.01em` against a tenant's
    // `typePairing`; now the selection reaches dark too and the delta is gone.
    // Fenced here so the adjudication is executable rather than remembered.
    const paired = compileFor("bithire", {
      schemaVersion: 1,
      mode: "simple",
      appearance: { typography: { typePairing: "editorial" } },
    });
    expect(paired.variables["--ds-letter-spacing-heading"]).toBe("0");
    expect(
      (paired.modeDeltas ?? []).flatMap((d) =>
        Object.keys(d.variables).filter((c) => c === "--ds-letter-spacing-heading")
      ),
      "the tenant's pairing governs dark too, so the overlay stops diverging"
    ).toEqual([]);

    // And the floor reaches ONLY what it should: the two verticals without an
    // authored ladder are untouched by the change.
    expect(
      compileFor("bithire", elevationDoc("elevated")).variables
    ).toEqual(PRESET.elevated);
  });

  it("case G2: one lowering, and provenance moves only what it arbitrates", () => {
    // `resolveTheme` erases the layer that authored each field, so a Theme
    // handed to `compileTheme` WITHOUT provenance is a Theme the compiler has
    // been told nothing about. It is not layer-equivalent to the same Theme
    // handed over WITH provenance, and demanding byte-identity between the two
    // would be demanding that the compiler reproduce a ranking it never
    // received — which is the defect, not the law.
    //
    // The law is narrower and checkable: one lowering, one formula set, and a
    // divergence surface that is exactly the arbitrated channels. Everything
    // the tenant did not author is byte-identical across both legs, including
    // the whole base block. Where the legs differ, they differ in one
    // direction only — the provenance-free leg re-states the vertical
    // baseline's mode overlay over the tenant's leaf; the provenance-carrying
    // leg emits no delta at all, because the tenant's base leaf already holds
    // inside the mode and the delta filter drops what equals the base.
    const arbitrated = ["--ds-sidebar-bg", "--ds-sidebar-text"] as const;

    for (const vertical of VERTICALS) {
      const { baseTheme, resolved, authoredPaths } = lower(
        vertical,
        LEAF_ONLY_DOCUMENT
      );
      const asStatic = lowerTheme(resolved, { tenantSlug: IDENTITY.slug });
      const asTenant = lowerTheme(resolved, {
        tenantSlug: IDENTITY.slug,
        tenantAuthoredPaths: authoredPaths,
      });
      const baseline = lowerTheme(baseTheme, { tenantSlug: IDENTITY.slug });

      // D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset,
      // and the base block joined the divergence surface. It used to be equal
      // on both legs, because the retired theme's own sidebar leaf sat where
      // the tenant's merged leaf landed and the two agreed. Over the preset the
      // chrome DERIVERS own those channels, so the provenance-free leg -- a
      // Theme the compiler has been told nothing about -- publishes the derived
      // value and the provenance-carrying leg publishes the tenant's leaf.
      //
      // The law this block states is unchanged and is asserted below exactly as
      // before: ONE lowering, one formula set, and a divergence surface that is
      // exactly the arbitrated channels, in one direction. What moved is which
      // blocks that surface spans. Measured on all three verticals: the base
      // surface is these same two channels and nothing else.
      const baseDivergent = [
        ...new Set([
          ...Object.keys(asStatic.cssVariables),
          ...Object.keys(asTenant.cssVariables),
        ]),
      ]
        .filter(
          (key) => asStatic.cssVariables[key] !== asTenant.cssVariables[key]
        )
        .sort();
      expect(baseDivergent, `${vertical} base surface`).toEqual(
        [...arbitrated].sort()
      );
      for (const channel of arbitrated) {
        expect(asTenant.cssVariables[channel], `${vertical} ${channel}`).toBe(
          channel === "--ds-sidebar-bg" ? "#101014" : "#F4F4F5"
        );
        // Direction: the provenance-free leg carries the deriver's value, and
        // it is never the tenant's literal.
        expect(
          asStatic.cssVariables[channel],
          `${vertical} ${channel} static`
        ).not.toBe(asTenant.cssVariables[channel]);
      }

      const staticModes = asStatic.modeBlocks ?? [];
      const tenantModes = asTenant.modeBlocks ?? [];
      expect(staticModes.length, `${vertical} mode count`).toBeGreaterThan(0);
      expect(tenantModes.length, `${vertical} mode count`).toBe(
        staticModes.length
      );
      for (const [index, staticBlock] of staticModes.entries()) {
        const tenantBlock = tenantModes[index]!;
        expect(tenantBlock.mode, `${vertical} mode order`).toBe(
          staticBlock.mode
        );

        const divergent = [
          ...new Set([
            ...Object.keys(staticBlock.cssVariables),
            ...Object.keys(tenantBlock.cssVariables),
          ]),
        ]
          .filter(
            (key) =>
              staticBlock.cssVariables[key] !== tenantBlock.cssVariables[key]
          )
          .sort();

        // The surface is closed: only the channels the tenant authored, and
        // only those the baseline actually contests in this mode.
        //
        // D6-2c-ii (2026-09-15): "contests" is a DEFINED value, not a present
        // key. A baseline is now the neutral foundation plus a preset patch, so
        // its mode chrome is a total shape whose unauthored leaves are present
        // and `undefined`; `hasOwnProperty` counted those as contests and made
        // this expectation claim a divergence the compile cannot produce. The
        // predicate reads the value, which is what the sentence above always
        // meant. Measured: no preset authors a mode sidebar leaf, so the
        // contested set is empty on all three and the mode surface is empty
        // with it -- the contest moved to the base block, asserted above.
        const contested = arbitrated
          .filter(
            (channel) =>
              baseTheme.modes?.[staticBlock.mode as "light" | "dark"]?.chrome
                ?.sidebar?.[channel === "--ds-sidebar-bg" ? "bg" : "text"] !==
              undefined
          )
          .sort();
        expect(divergent, `${vertical} ${staticBlock.mode} surface`).toEqual(
          contested
        );

        for (const channel of divergent) {
          // Direction, not just difference. The static leg republishes the
          // baseline's own mode value; the tenant leg publishes nothing,
          // leaving the authored base leaf in force for the whole document.
          expect(
            staticBlock.cssVariables[channel],
            `${vertical} ${staticBlock.mode} ${channel} static`
          ).toBe(
            (baseline.modeBlocks ?? []).find(
              (b) => b.mode === staticBlock.mode
            )?.cssVariables[channel]
          );
          expect(
            tenantBlock.cssVariables[channel],
            `${vertical} ${staticBlock.mode} ${channel} tenant`
          ).toBeUndefined();
        }
      }
    }
  });

  it("case G3: a tenant's base sidebar leaf stays authoritative across modes", () => {
    // The causal statement behind case G2's divergence, asserted directly and
    // two-sided, because "the delta is absent" is only half a proof.
    //
    // Every first-party vertical authors a mode overlay for the sidebar, and
    // every one of them is a BASELINE_LEAF(1). A tenant leaf is TENANT_LEAF(4).
    // So a tenant that writes `chrome.sidebar.bg` once, at the base, has
    // written it for every mode it did not separately qualify — the dark
    // baseline's own bg must NOT reappear as a mode delta, at any rank, for
    // any vertical. The moment it does, the tenant's document has been
    // accepted, normalized, digested and then silently overruled in the mode
    // the user actually looks at.
    //
    // The second leg is the limit: a tenant that DOES qualify the mode keeps
    // the mode statement it wrote. Rank never reaches past the author.
    const TENANT_DARK_BG = "#1B1024";
    const TENANT_DARK_TEXT = "#EDE4F5";

    for (const vertical of VERTICALS) {
      const baseOnly = lower(vertical, LEAF_ONLY_DOCUMENT);
      const compiled = lowerTheme(baseOnly.resolved, {
        tenantSlug: IDENTITY.slug,
        tenantAuthoredPaths: baseOnly.authoredPaths,
      });

      const compiledModes = compiled.modeBlocks ?? [];
      expect(compiledModes.length, `${vertical} overlay present`).toBeGreaterThan(
        0
      );
      for (const block of compiledModes) {
        const baselineSidebar =
          baseOnly.baseTheme.modes?.[block.mode as "light" | "dark"]?.chrome
            ?.sidebar;
        for (const [channel, field] of [
          ["--ds-sidebar-bg", "bg"],
          ["--ds-sidebar-text", "text"],
        ] as const) {
          const overlayValue = baselineSidebar?.[field];
          if (overlayValue === undefined) continue;
          // Present in the baseline overlay, absent from the emitted delta:
          // the tenant's base leaf won, and nothing re-states the baseline.
          expect(
            block.cssVariables[channel],
            `${vertical} ${block.mode} ${channel} must not re-state ${overlayValue}`
          ).toBeUndefined();
        }
      }

      // Limit case, on the transport that can express it. The DB document
      // reaches a mode value through `palette.dark` and `light-dark()`; only
      // the static patch carries a literal `modes.<mode>` chrome leaf. Both
      // transports land on the same `ThemeLayerPatch`, which is the authorship
      // record either way, so the rank being tested is the same rank.
      //
      // The overlay mode is read from the vertical, not assumed: bithire and
      // evnto rest light and overlay dark, rottay rests dark and overlays
      // light. The law is about the OVERLAY, whichever one it is.
      const overlayMode = compiledModes[0]?.mode;
      expect(overlayMode, `${vertical} overlay mode`).toBeDefined();

      const qualifiedPatch = {
        chrome: {
          sidebar: { bg: "#101014", text: "#F4F4F5" },
        },
        modes: {
          [overlayMode!]: {
            chrome: {
              sidebar: { bg: TENANT_DARK_BG, text: TENANT_DARK_TEXT },
            },
          },
        },
      };
      const qualified = {
        resolved: mergeThemePatches(
          FIRST_PARTY_BASELINES[vertical],
          qualifiedPatch as never
        ),
        authoredPaths: collectPatchAuthoredPaths(qualifiedPatch as never),
      };
      expect(
        qualified.authoredPaths.has(`modes.${overlayMode}.chrome.sidebar.bg`),
        `${vertical} ${overlayMode} authorship recorded`
      ).toBe(true);

      const withDark = lowerTheme(qualified.resolved, {
        tenantSlug: IDENTITY.slug,
        tenantAuthoredPaths: qualified.authoredPaths,
      });
      const darkBlock = (withDark.modeBlocks ?? []).find(
        (b) => b.mode === overlayMode
      );
      expect(darkBlock, `${vertical} ${overlayMode} block`).toBeDefined();
      expect(darkBlock!.cssVariables["--ds-sidebar-bg"]).toBe(TENANT_DARK_BG);
      expect(darkBlock!.cssVariables["--ds-sidebar-text"]).toBe(
        TENANT_DARK_TEXT
      );
      // And the base leaf is still the base leaf — qualifying dark did not
      // retroactively move the resting statement.
      expect(withDark.cssVariables["--ds-sidebar-bg"]).toBe("#101014");
      expect(withDark.cssVariables["--ds-sidebar-text"]).toBe("#F4F4F5");
    }
  });

  it("F4B-13: tenantPostureFloors unwraps motion the same way whether the patch arrives wrapped or bare", () => {
    // STRUCTURAL fence, not behavioural (independent audit preaudit, W-B): this asserts
    // the SHAPE of the projection, not that any vertical's baseline moves —
    // no first-party vertical authors a motion ladder that would out-rank
    // the tenant floor post-merge today, so there is no before/after flip to
    // assert (measured, not hypothesised — see the function's own docblock).
    const wrapped = tenantPostureFloors({
      motion: { value: { intensity: 0.4, durationScale: 1.2, ambient: "off" } },
    } as never);
    const bare = tenantPostureFloors({
      motion: { intensity: 0.4, durationScale: 1.2, ambient: "off" },
    } as never);
    const expectedMotion = { intensity: 0.4, durationScale: 1.2, ambient: "off" };
    expect(wrapped.motion, "wrapped patch unwraps").toEqual(expectedMotion);
    expect(bare.motion, "bare patch passes through unchanged").toEqual(
      expectedMotion
    );
    // MUTATION SENSITIVITY: reading `.intensity` off the WRAPPED input
    // directly (not `.value.intensity`) means a regression that dropped the
    // `mo?.value ?? mo` fallback back to `mo` alone would make `wrapped.motion`
    // the wrapper object `{value:{...}}}` — `.intensity` would read `undefined`
    // here, not `0.4`, so this assertion reddens on that exact regression.
    expect(wrapped.motion?.intensity).toBe(0.4);
    expect(wrapped.motion?.durationScale).toBe(1.2);
    // The six previously-projected fields stay intact — motion's addition is
    // additive, not a rewrite of the surrounding projection.
    expect(wrapped.typography).toEqual({ typePairing: undefined, scale: undefined });
    expect(wrapped.surfaces).toEqual({
      buttonStyle: undefined,
      radiusScale: undefined,
      density: undefined,
      elevation: undefined,
    });
    // CHEAP DEFENSIVE ASSERTION: today's registry keypath (fixed by this same
    // packet) used to write a malformed `motion['*']` shape when broken. The
    // unwrap must not throw on a patch that never carries `.value` at all —
    // it falls through to `mo` itself, an inert object no downstream reader
    // consumes (nothing reads a literal `'*'` key), so the projection stays
    // harmless rather than crashing the whole lowering.
    expect(() =>
      tenantPostureFloors({ motion: { "*": 0.3 } } as never)
    ).not.toThrow();
    const malformed = tenantPostureFloors({ motion: { "*": 0.3 } } as never);
    expect((malformed.motion as Record<string, unknown> | undefined)?.intensity).toBeUndefined();
  });
});

describe("the digest tells the truth", () => {
  it("moves when and only when the emitted variables move", () => {
    const documents: Readonly<Record<string, unknown>> = {
      empty: { schemaVersion: 1, mode: "simple", appearance: {} },
      emptyAgain: { schemaVersion: 1, mode: "simple", appearance: {} },
      seed: POPULATED_SIMPLE_DOCUMENT,
      // The pair, not the ground alone: bithire's baseline ink over #101014 is
      // itself sub-floor, so a lone `bg` is correctly rejected at ingestion and
      // has no emission to compare.
      sidebarLeaf: advanced({
        advanced: { chrome: { sidebar: { bg: "#101014", text: "#F4F4F5" } } },
      }),
      // D6-2c-ii (2026-09-15): the tone is `strong`, not `inverse`. `inverse`
      // is inert on bithire over neutral + preset, and an inert tone breaks
      // this biconditional in the exact direction the comment below names --
      // accepted and digested, nothing emitted. That is a real finding, so it
      // is pinned by name in its own block after this one rather than hidden
      // by this fixture; here the law is measured on a tone that still fans
      // out.
      sidebarLeafPlusTone: advanced({
        general: { navigation: { sidebarTone: "strong" } },
        advanced: { chrome: { sidebar: { bg: "#101014", text: "#F4F4F5" } } },
      }),
      // The accept-normalize-digest-discard shape, stated as a pair. These two
      // differ ONLY in the leaf values, and both carry the tone that used to
      // overwrite them. Under the ranked merge the leaves win, so the two
      // emissions differ and the two digests differ with them. Under an
      // unconditional tone assignment the leaves are discarded after being
      // accepted and digested: identical CSS, different digest -- and the
      // biconditional below is what makes that a test failure rather than a
      // paragraph. Both pairs are above the APCA floor so intake admits them
      // and the comparison is about precedence, not rejection.
      sidebarLeafPlusToneAlt: advanced({
        general: { navigation: { sidebarTone: "strong" } },
        advanced: { chrome: { sidebar: { bg: "#14100F", text: "#F5EFE4" } } },
      }),
    };
    // The compiled CSS opens with a provenance header that EMBEDS the digest.
    // Comparing it verbatim makes this assertion circular in the direction
    // that matters: two artifacts whose pixels are identical would still
    // compare unequal purely because their headers carry different digests,
    // so "digest moved but nothing was emitted" could never be observed. The
    // header is stripped, and only the styled bytes are compared.
    const styledBytes = (css: string) =>
      css.replace(/^\/\* TenantThemeArtifact[^\n]*\n/, "");

    const compiled = Object.entries(documents).map(([name, document]) => {
      const artifact = compileFor("bithire", document);
      return {
        name,
        digest: artifact.digest,
        emission: JSON.stringify([
          artifact.variables,
          artifact.modeDeltas,
          styledBytes(artifact.css),
        ]),
      };
    });
    for (const left of compiled) {
      for (const right of compiled) {
        expect(
          left.digest === right.digest,
          `${left.name} vs ${right.name}: the digest must move with the emission`
        ).toBe(left.emission === right.emission);
      }
    }
  });

  it("an INERT tone breaks the biconditional: digested, and emitting nothing", () => {
    // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15), pending DT
    // registration. `navigation.sidebarTone: "inverse"` is inert on bithire
    // over neutral + preset: its fan-out equals the baseline, so the delta
    // withdraws every channel it used to produce. The document is still
    // accepted, still normalized and still digested, so two artifacts whose
    // styled bytes are IDENTICAL carry DIFFERENT digests -- precisely the
    // accept-normalize-digest-discard shape the block above exists to forbid.
    //
    // This is the measured state, pinned so it cannot pass unnoticed and so it
    // reds the moment the derivation lane gives the tone a producer again (or
    // the digest source stops covering a decision that emits nothing). It is a
    // defect of the compiler, not of a fixture, so it is stated here rather
    // than repaired in a test.
    const leaf = { bg: "#101014", text: "#F4F4F5" };
    const withoutTone = compileFor(
      "bithire",
      advanced({ advanced: { chrome: { sidebar: leaf } } })
    );
    const withInertTone = compileFor(
      "bithire",
      advanced({
        general: { navigation: { sidebarTone: "inverse" } },
        advanced: { chrome: { sidebar: leaf } },
      })
    );
    const styled = (css: string) =>
      css.replace(/^\/\* TenantThemeArtifact[^\n]*\n/, "");
    expect(withInertTone.variables).toEqual(withoutTone.variables);
    expect(withInertTone.modeDeltas).toEqual(withoutTone.modeDeltas);
    expect(styled(withInertTone.css)).toBe(styled(withoutTone.css));
    expect(withInertTone.digest).not.toBe(withoutTone.digest);
  });
});

describe("the consulted-provenance authority is closed", () => {
  /** Assembled once so the closure test and the mutant test share one truth. */
  const THREE_SITE_UNION = (): Set<string> =>
    new Set<string>([
      PRIMARY_SEED_FIELD,
      ...Object.values(SEED_SHADOWING_FIELDS).flat(),
      SIDEBAR_TONE_FIELD,
      ...Object.values(SIDEBAR_TONE_LEAF_FIELDS),
      // COH-1 D3: the status-tint site's own table, the third union member.
      ...STATUS_SEED_FIELDS,
      ...Object.values(STATUS_SEED_SHADOWING_FIELDS).flat(),
    ]);

  it("is exactly the union of the three sites' own tables", () => {
    expect([...THREE_SITE_UNION()].sort()).toEqual(
      [...CONSULTED_PROVENANCE_FIELDS].sort()
    );
  });

  it("mutant: dropping one entry from the union desyncs it from CONSULTED_PROVENANCE_FIELDS", () => {
    // Proves the closure assertion above actually bites: a union missing a
    // single status-seed field must NOT equal the closed vocabulary. Without
    // this, a future edit that silently narrows either side could leave the
    // test above green for the wrong reason (both sides shrinking together).
    const mutatedUnion = [...THREE_SITE_UNION()].filter(
      (field) => field !== "palette.successColor"
    );
    expect(mutatedUnion.sort()).not.toEqual(
      [...CONSULTED_PROVENANCE_FIELDS].sort()
    );
  });

  it("mP6: a profile default can never fill a consulted field", () => {
    // The fence the whole design rests on. `collectPatchAuthoredPaths` reads
    // the patch, and the patch carries the profile's field defaults too — so if
    // an expressive profile ever learned to fill a palette seed or a sidebar
    // leaf, that PROFILE default would be indistinguishable from TENANT
    // authorship and would silently win rank 3 or 4. Every member is populated
    // so the fence tests the whole vocabulary, not today's subset.
    const filled = withExpressiveFieldDefaults(
      undefined,
      {
        typePairing: "editorial",
        buttonStyle: "pill",
        radiusScale: 1.15,
        density: "spacious",
        motion: { intensity: 0.7, durationScale: 1.1, ambient: "subtle" },
        elevation: "elevated",
      },
      undefined
    );
    const envelope = migrateV1(
      {
        schemaVersion: 1,
        mode: "simple",
        appearance: filled,
      } as unknown as TenantThemeDocument,
      "light"
    );
    const filledPaths = collectPatchAuthoredPaths(envelope.patch);
    expect(filledPaths.size).toBeGreaterThan(0);
    const intersection = [...filledPaths].filter((path) =>
      CONSULTED_PROVENANCE_FIELDS.has(path)
    );
    expect(
      intersection,
      "an expressive profile default reached a field the lattice consults"
    ).toEqual([]);

    // The fence's own negative control. An empty intersection is only
    // meaningful if a non-empty one is reachable — otherwise this test would
    // keep passing after `CONSULTED_PROVENANCE_FIELDS` was emptied, after
    // `collectPatchAuthoredPaths` stopped collecting, or after the profile
    // vocabulary was renamed out from under it. So the same pipeline is run
    // once more over an appearance deliberately contaminated with the THREE
    // field families the lattice does consult (COH-1 D3 added the status
    // seed as the third), and the intersection is required to catch all three.
    const contaminated = migrateV1(
      {
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: {
          general: {
            ...filled,
            palette: { primary: "#0F766E", status: { success: "#7C3AED" } },
          },
          advanced: { chrome: { sidebar: { bg: "#101014", text: "#F4F4F5" } } },
        },
      } as unknown as TenantThemeDocument,
      "light"
    );
    const contaminatedHits = [
      ...collectPatchAuthoredPaths(contaminated.patch),
    ].filter((path) => CONSULTED_PROVENANCE_FIELDS.has(path));
    // The migration's `paletteFields()` always constructs all four
    // `{tone}Color` keys the moment `general.palette.status` is present at
    // all (own-key presence, `undefined` value for the three untouched
    // tones) -- `collectPatchAuthoredPaths` collects by key presence, not
    // value, so the pre-existing over-approximation (the same one D1's fix
    // deliberately reads AROUND via `deriveTenantStatusSeedAuthorship`'s
    // `!== undefined` value check) surfaces all four here, not just the one
    // tone this document actually authored.
    expect(
      contaminatedHits.sort(),
      "the fence cannot detect a consulted field at all"
    ).toEqual([
      "chrome.sidebar.bg",
      "chrome.sidebar.text",
      PRIMARY_SEED_FIELD,
      "palette.successColor",
      "palette.warningColor",
      "palette.errorColor",
      "palette.infoColor",
    ].sort());
  });
});
