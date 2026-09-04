/**
 * PROVENANCE ACCEPTANCE — a tenant's accepted intent must reach CSS, or be
 * rejected at ingestion. Never accepted, normalized, digested and discarded.
 *
 * The DB path lowers a `TenantThemeDocument` into a `ThemePatch`, resolves that
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
  collectPatchAuthoredPaths,
  mergeThemePatches,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";
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
import { withExpressiveFieldDefaults } from "@/infrastructure/compilers/kernel/runtime/appearance";

import {
  SIDEBAR_CONTRAST_ATTRIBUTION,
  TenantThemeValidationError,
  compileTenantThemeConfig,
  tenantPostureFloors,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "..";
import { migrateV1 } from "../migrate-v1";
import { lowerTheme } from "@tests/support/theme-lowering";

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
    navigation: { sidebarTone: "subtle" },
  },
} as const;

/**
 * The ten channels a primary seed owns: the six `derivePrimarySemantics`
 * emits plus the four interaction-floor channels. Assembled from the compiler's
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
  "--ds-input-border-focus": "var(--ds-color-border-focus, var(--ds-color-primary))",
  "--ds-input-shadow-focus":
    "0 0 0 3px color-mix(in srgb, var(--ds-color-border-focus, var(--ds-color-primary)) 20%, transparent)",
};

/**
 * The four the seed does NOT move, and the reason is a value predicate rather
 * than a rank: their derived value bakes no color of its own — two are `var()`
 * indirections that already point AT the channels the seed controls, and the
 * third resolves to the same ink under tenant and baseline alike. Re-deriving
 * them would replace an indirection with an identical indirection, so the delta
 * inherits them. They stay in `POPULATED_WITHDRAWN` as benign rows.
 */
const BITHIRE_SEED_INHERITED = [
  "--ds-button-primary-bg",
  "--ds-button-primary-border",
  "--ds-button-primary-color",
  "--ds-color-primary-foreground",
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

describe("site B — an explicit sidebar leaf outranks the tenant's own tone", () => {
  it("case B: the authored pair survives an `inverse` posture in the same document", () => {
    const document = advanced({
      general: { navigation: { sidebarTone: "inverse" } },
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
        "var(--ds-color-neutral-900)"
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
        general: { navigation: { sidebarTone: "inverse" } },
        advanced: { chrome: { sidebar: { bg: "#101014", text: "#F4F4F5" } } },
      })
    );
    expect(artifact.variables["--ds-sidebar-bg"]).toBe("#101014");
    expect(artifact.variables["--ds-sidebar-text"]).toBe("#F4F4F5");
    expect(artifact.css).toContain("--ds-sidebar-bg: #101014;");
    expect(artifact.css).toContain("--ds-sidebar-text: #F4F4F5;");
    // The four the tenant left unstated still carry the posture.
    expect(artifact.variables["--ds-sidebar-item-color-active"]).toBe(
      "var(--ds-color-white)"
    );
  });

  it("every tone-produced channel has a leaf that can outrank it", () => {
    const artifact = compileFor(
      "bithire",
      advanced({ general: { navigation: { sidebarTone: "inverse" } } })
    );
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
      const theme = FIRST_PARTY_THEMES[vertical];
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
      rottay: 1196,
      // Status tint derivation adds seven keys; three unused emissions were
      // subsequently retired from the compiler.
      bithire: 1233,
      // COH-1 (2026-08-30): 468 -> 475. Same shape as bithire: evnto never
      // authored any of the seven alpha channels in either mode, so
      // `deriveStatusTintFloor` adds +7 new explicit keys to the base block.
      // The four retired `*BgColor` and four retired `*BorderColor` light
      // literals do not move this count (measured directly): each was
      // already an explicit compiled key before retirement (authored) and
      // remains one now (derived) -- same channel, different producer.
      evnto: 475,
    };
    for (const vertical of VERTICALS) {
      expect(
        Object.keys(
          lowerTheme(FIRST_PARTY_THEMES[vertical], {
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
    const baseTheme = FIRST_PARTY_THEMES[vertical];
    const envelope = migrateV1(document, baseTheme.appearance.defaultMode!);
    return {
      baseTheme,
      resolved: mergeThemePatches(baseTheme, envelope.patch),
      authoredPaths: collectPatchAuthoredPaths(envelope.patch),
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

  it("case G1: the artifact is the direct lowering minus the vertical baseline", () => {
    for (const vertical of VERTICALS) {
      const artifact = compileFor(vertical, POPULATED_SIMPLE_DOCUMENT);
      const { baseTheme, resolved, authoredPaths, floors } = lower(
        vertical,
        POPULATED_SIMPLE_DOCUMENT as unknown as TenantThemeDocument
      );
      const direct = lowerTheme(resolved, {
        tenantSlug: IDENTITY.slug,
        tenantAuthoredPaths: authoredPaths,
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
        for (const [channel, value] of Object.entries(delta.variables)) {
          expect(
            directBlock!.cssVariables[channel],
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
    const PRESET = {
      flat: {
        "--ds-elevation-1": "none",
        "--ds-elevation-2": "none",
        "--ds-elevation-3": "0 1px 2px rgba(0,0,0,0.05)",
      },
      elevated: {
        "--ds-elevation-1": "0 2px 4px rgba(0,0,0,0.08)",
        "--ds-elevation-2": "0 4px 8px rgba(0,0,0,0.1)",
        "--ds-elevation-3": "0 8px 16px rgba(0,0,0,0.12)",
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

      // Provenance never touches the base block. Both legs already put the
      // tenant's leaves there; the contest only exists inside a mode.
      expect(asStatic.cssVariables, `${vertical} base block`).toEqual(
        asTenant.cssVariables
      );
      for (const channel of arbitrated) {
        expect(asTenant.cssVariables[channel], `${vertical} ${channel}`).toBe(
          channel === "--ds-sidebar-bg" ? "#101014" : "#F4F4F5"
        );
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
        const contested = arbitrated
          .filter((channel) =>
            baseTheme.modes?.[staticBlock.mode as "light" | "dark"]?.chrome
              ?.sidebar
              ? Object.prototype.hasOwnProperty.call(
                  baseTheme.modes[staticBlock.mode as "light" | "dark"]!.chrome!
                    .sidebar!,
                  channel === "--ds-sidebar-bg" ? "bg" : "text"
                )
              : false
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
      // transports land on the same `ThemePatch`, which is the authorship
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
          FIRST_PARTY_THEMES[vertical],
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
      sidebarLeafPlusTone: advanced({
        general: { navigation: { sidebarTone: "inverse" } },
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
        general: { navigation: { sidebarTone: "inverse" } },
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
    // `migrateV1`'s `paletteFields()` always constructs all four
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
