/**
 * WO-DER-05 acceptance: modes derived from decisions, and one default-mode law.
 *
 * Every arm of the lane's gate is executable here rather than probed by hand:
 * the rottay document that used to lose its colour to the vertical's own light
 * overlay, the single reader of "which mode is this", and the one
 * `prefers-color-scheme` block an `auto` artifact may carry.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "@/infrastructure/compilers/composition/tenant-theme";
import {
  compileThemeIntent,
  documentThemeIntent,
  staticThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";
import {
  renderedMode,
  resolveDocumentMode,
  themeDefaultMode,
  verticalDefaultMode,
} from "@/infrastructure/compilers/kernel/foundation/modes";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { contrastRatio } from "@/foundation/kernel/accessibility/branding-contrast";
import { FOUNDATION_COLOR_DEFAULTS } from "@/foundation/tokens/ts/foundation/base/declared-defaults";
import {
  DARK_DEFAULT_GROUND,
  LIGHT_DEFAULT_GROUND,
} from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/ground";
import { deriveModeThemes } from "..";
import { FIRST_PARTY_BASELINES } from "@tests/support/theme-lowering";

const TENANT_PRIMARY = "#2F6B9A";

/** The vertical's OWN light primary, which used to win this contest. */
const ROTTAY_OVERLAY_PRIMARY =
  FIRST_PARTY_BASELINES.rottay.modes?.light?.palette?.primaryColor;

const identity = (vertical: "rottay" | "bithire"): TenantThemeConfigIdentity => ({
  tenantId: `tenant_der05_${vertical}`,
  slug: `der05-${vertical}`,
  verticalKey: vertical,
  rowVersion: 1,
});

const paletteDocument = (
  palette: Record<string, unknown>
): TenantThemeDocument =>
  ({
    schemaVersion: 1,
    mode: "advanced",
    visualFoundation: { general: { palette } },
  } as unknown as TenantThemeDocument);

const compile = (vertical: "rottay" | "bithire", palette: Record<string, unknown>) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(paletteDocument(palette), identity(vertical)),
    { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical)! }
  );

/** Base rule under the mode's rule: what the selector actually resolves to. */
const effective = (
  artifact: ReturnType<typeof compile>,
  mode: "light" | "dark"
): Record<string, string> => ({
  ...artifact.variables,
  ...(artifact.modeDeltas?.find((delta) => delta.mode === mode)?.variables ?? {}),
});

describe("WO-DER-05 · a rottay document keeps its decision in both modes", () => {
  const artifact = compile("rottay", { primary: TENANT_PRIMARY });

  it("compiles a non-empty base block for the mode rottay actually renders", () => {
    expect(Object.keys(artifact.variables).length).toBeGreaterThan(0);
    expect(artifact.variables["--ds-color-primary"]).toBe(TENANT_PRIMARY);
    // The document named no background mode, so the canvas is the vertical's.
    expect(
      artifact.normalizedAppearance.general?.palette?.backgroundMode
    ).toBe("dark");
  });

  it("declares colorScheme dark, not the light the old reader assumed", () => {
    const { compiled } = compileThemeIntent(
      documentThemeIntent({
        vertical: "rottay",
        slug: identity("rottay").slug,
        document: paletteDocument({ primary: TENANT_PRIMARY }),
      })
    );
    expect(compiled.colorScheme).toBe("dark");
  });

  it("[data-theme='light'] carries the TENANT primary in both modes", () => {
    // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15):
    // `modes.{light,dark}.palette.*` on the first-party presets; pinned to the
    // measured state until the lane lands. The rottay vertical used to author a
    // competing light primary, which is what this rule had to beat. A preset
    // document seeds no per-mode palette, so there is no competitor left to
    // out-rank -- the rule itself still holds and is asserted below, but the
    // contest it was written against is no longer reproducible from a shipped
    // preset. Registered rather than deleted so the day a preset regains a
    // per-mode seed this reads as a real contest again.
    expect(ROTTAY_OVERLAY_PRIMARY).toBeUndefined();

    const light = artifact.modeDeltas?.find((delta) => delta.mode === "light");
    expect(light).toBeDefined();
    // A delta that restates nothing is the rule's visible signature: the
    // channel cascades from the base block, which is the tenant's own.
    expect(light?.variables["--ds-color-primary"]).toBeUndefined();
    expect(effective(artifact, "light")["--ds-color-primary"]).toBe(
      TENANT_PRIMARY
    );
    expect(effective(artifact, "dark")["--ds-color-primary"]).toBe(
      TENANT_PRIMARY
    );
  });

});

describe("WO-DER-05 · the tenant, and only the tenant, narrows its own decision", () => {
  it("keeps a tenant's per-mode seed above its own base seed", () => {
    // bithire is light-default, so the document's `dark:` seeds land in
    // `modes.dark` and the base seeds stay in the block bithire renders.
    const narrowed = compile("bithire", {
      primary: TENANT_PRIMARY,
      backgroundMode: "auto",
      dark: { primary: "#17415F", background: "#101014" },
    });
    expect(effective(narrowed, "light")["--ds-color-primary"]).toBe(
      TENANT_PRIMARY
    );
    expect(effective(narrowed, "dark")["--ds-color-primary"]).toBe("#17415F");
  });

  it("carries a base-only seed into the mode the tenant did not qualify", () => {
    const crossing = compile("bithire", { primary: TENANT_PRIMARY });
    const dark = crossing.modeDeltas?.find((delta) => delta.mode === "dark");
    // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15):
    // `modes.{light,dark}.palette.*` on the first-party presets; pinned to the
    // measured state until the lane lands. bithire's own dark overlay used to
    // restate the primary and used to win this contest; its preset seeds no
    // per-mode palette, so the crossing below is now unopposed.
    expect(
      FIRST_PARTY_BASELINES.bithire.modes?.dark?.palette?.primaryColor
    ).toBeUndefined();
    expect(dark?.variables["--ds-color-primary"]).toBeUndefined();
    expect(effective(crossing, "dark")["--ds-color-primary"]).toBe(
      TENANT_PRIMARY
    );
  });

  it("leaves a mode-DESCRIBING statement where the tenant wrote it", () => {
    // A ground is not brand identity: carrying a light canvas into the dark
    // block would put the dark ink on a light surface. Nothing in the chain
    // authors the other mode's canvas -- the bithire preset states none, and
    // per-mode seeds are refused at the document door -- so the statement is
    // kept in its own block by the mode's own canvas restating it, not by a
    // second authored ground.
    const grounded = compile("bithire", {
      primary: TENANT_PRIMARY,
      background: "#FBFBFD",
    });
    expect(grounded.variables["--ds-color-bg-primary"]).toBe("#FBFBFD");
    expect(
      FIRST_PARTY_BASELINES.bithire.modes?.dark?.palette?.backgroundColor
    ).toBeUndefined();
    expect(effective(grounded, "dark")["--ds-color-bg-primary"]).not.toBe(
      "#FBFBFD"
    );
  });
});

/**
 * R3 of the WO-DER-06 post-close residuals: "bithire's dark block cascades the
 * light ground".
 *
 * A mode block is a DELTA, so a ground stated once in the theme body is not
 * confined to the mode it describes -- it keeps cascading, and the block paints
 * a canvas nobody chose. The other mode cannot be authored out of that: the
 * document door refuses per-mode seeds by name (kit row 5 opens them only as
 * per-mode `SanctionedOverrides`, which carry chrome and nothing else), so the
 * overlay is structurally silent on every first-party vertical. The canvas is
 * therefore DERIVED for the surface the block compiles for.
 */
describe("R3 · the other mode's canvas is derived, not cascaded", () => {
  const groundChannels = [
    "--ds-color-bg-primary",
    "--ds-color-bg",
    "--ds-color-background",
  ] as const;

  it("a light seed ground does not paint the dark block", () => {
    const grounded = compile("bithire", {
      primary: TENANT_PRIMARY,
      background: "#FBFBFD",
    });
    for (const channel of groundChannels) {
      expect(grounded.variables[channel], `base ${channel}`).toBe("#FBFBFD");
      expect(effective(grounded, "dark")[channel], `dark ${channel}`).toBe(
        DARK_DEFAULT_GROUND
      );
    }
  });

  it("the dark canvas clears the floor the shipped light one could not", () => {
    // The defect measured as paint, on the ground bithire's own preset seeds:
    // the foundation's dark ink over it is 1.10:1, under every floor there is.
    const ink = FOUNDATION_COLOR_DEFAULTS.dark["--ds-color-text-primary"]!;
    const seeded = FIRST_PARTY_BASELINES.bithire.palette?.backgroundColor;
    expect(seeded).toBe("#FFFFFF");
    expect(contrastRatio(ink, seeded!)).toBeLessThan(1.5);
    expect(contrastRatio(ink, DARK_DEFAULT_GROUND)).toBeGreaterThan(7);
  });

  it("a tenant that authors the mode's own ground keeps it", () => {
    // The derivation fills a silence; it never outranks a statement about the
    // block's own mode.
    const narrowed = compile("bithire", {
      primary: TENANT_PRIMARY,
      background: "#FFFFFF",
      backgroundMode: "auto",
      dark: { background: "#101014" },
    });
    expect(effective(narrowed, "dark")["--ds-color-bg-primary"]).toBe(
      "#101014"
    );
  });

  it("holds in the other direction: a dark-default theme's light block", () => {
    const requests = deriveModeThemes({
      theme: {
        id: "r3-dark-default",
        name: "R3 dark default",
        appearance: { defaultMode: "dark" },
        palette: { primaryColor: TENANT_PRIMARY, backgroundColor: "#050307" },
        modes: { light: {} },
      } as unknown as FlatTheme,
      tenantFacts: undefined,
      tenantPatch: undefined,
    });
    expect(requests.map((request) => request.mode)).toEqual(["light"]);
    expect(requests[0]?.theme.palette?.backgroundColor).toBe(
      LIGHT_DEFAULT_GROUND
    );
  });

  it("RESIDUE: a theme that states its inks too keeps the cascade", () => {
    // The canvas moves as a set. A theme that authors inks for its own ground
    // owns the whole canvas, and re-grounding it alone stands those inks on a
    // canvas they were not chosen for -- measured, the APCA floor then REFUSES
    // the compile by name on the two deliberately quiet roles (`text-muted` at
    // Lc -51.6, `text-disabled` at Lc -12.0 over the dark canvas), because the
    // foundation's own per-mode values for them are sub-floor by design.
    // Re-authoring them needs the per-mode channel the kit has not opened, so
    // this shape is pinned as measured rather than half-fixed.
    const authoredInks = compile("bithire", {
      primary: TENANT_PRIMARY,
      background: "#FBF6EC",
      foreground: { primary: "#2E261C", secondary: "#5C4F3D" },
    });
    expect(authoredInks.variables["--ds-color-bg-primary"]).toBe("#FBF6EC");
    expect(effective(authoredInks, "dark")["--ds-color-bg-primary"]).toBe(
      "#FBF6EC"
    );
    expect(effective(authoredInks, "dark")["--ds-color-text-primary"]).toBe(
      "#2E261C"
    );
  });

  it("states no canvas for a theme that seeded none", () => {
    // rottay and evnto seed no ground at all, so the foundation's own per-mode
    // declaration is what paints and the derivation must stay out of it. This
    // is also the byte-stability leg: adding a canvas here would rewrite both
    // verticals' artifacts.
    for (const vertical of ["rottay", "evnto"] as const) {
      const baseline = FIRST_PARTY_BASELINES[vertical] as unknown as FlatTheme;
      expect(baseline.palette?.backgroundColor, vertical).toBeUndefined();
      const requests = deriveModeThemes({
        theme: baseline,
        tenantFacts: undefined,
        tenantPatch: undefined,
      });
      expect(requests.length, vertical).toBe(1);
      expect(
        requests[0]?.theme.palette?.backgroundColor,
        `${vertical} ${requests[0]?.mode}`
      ).toBeUndefined();
    }
  });
});

describe("WO-DER-05 · one `auto` block, keyed on the mode the base is NOT", () => {
  const mediaBlocks = (css: string): string[] =>
    css.match(/@media \(prefers-color-scheme: [a-z]+\)/g) ?? [];

  it("a light-default vertical emits exactly one dark media block", () => {
    const artifact = compile("bithire", {
      primary: TENANT_PRIMARY,
      backgroundMode: "auto",
      dark: { primary: "#17415F", background: "#101014" },
    });
    expect(mediaBlocks(artifact.css)).toEqual([
      "@media (prefers-color-scheme: dark)",
    ]);
    expect(artifact.css).toContain(
      `${artifact.scopes.combinedSelector}:not([data-theme='light'])`
    );
  });

  it("a dark-default vertical emits exactly one LIGHT media block", () => {
    const artifact = compile("rottay", {
      primary: TENANT_PRIMARY,
      backgroundMode: "auto",
    });
    // The old emitter hard-coded `dark`, so a dark-first vertical got either
    // nothing or a media copy of the wrong delta.
    expect(mediaBlocks(artifact.css)).toEqual([
      "@media (prefers-color-scheme: light)",
    ]);
    expect(artifact.css).toContain(
      `${artifact.scopes.combinedSelector}:not([data-theme='dark'])`
    );
  });

  it("emits no media block at all when the document names a mode", () => {
    const artifact = compile("bithire", {
      primary: TENANT_PRIMARY,
      backgroundMode: "light",
    });
    expect(mediaBlocks(artifact.css)).toEqual([]);
  });
});

describe("WO-DER-05 · one default-mode reader", () => {
  it("reads the roster first for every first-party vertical", () => {
    expect(verticalDefaultMode("rottay")).toBe("dark");
    expect(verticalDefaultMode("bithire")).toBe("light");
    expect(verticalDefaultMode("evnto")).toBe("light");
    for (const [slug, theme] of Object.entries(FIRST_PARTY_BASELINES)) {
      expect(verticalDefaultMode(slug)).toBe(theme.appearance?.defaultMode);
      expect(themeDefaultMode(theme)).toBe(theme.appearance?.defaultMode);
    }
  });

  it("renders a document's own selection, and the vertical's under `auto`", () => {
    expect(renderedMode("dark", "light")).toBe("light");
    expect(renderedMode("light", "dark")).toBe("dark");
    expect(renderedMode("dark", "auto")).toBe("dark");
    expect(renderedMode("dark", undefined)).toBe("dark");
    expect(
      resolveDocumentMode("rottay", { general: { palette: {} } })
    ).toBe("dark");
    expect(
      resolveDocumentMode("rottay", {
        general: { palette: { backgroundMode: "light" } },
      })
    ).toBe("light");
    expect(resolveDocumentMode("bithire", undefined)).toBe("light");
  });

  it("leaves no second default-mode reader anywhere in the source tree", () => {
    const root = resolve(process.cwd(), "src");
    // The roster owns the one literal; everything else asks it. Since
    // D6-2c-ii that literal is UNDECLARED_VERTICAL_DEFAULT_MODE, on the roster
    // itself: the authored theme barrel that used to hold it is retired.
    const roster = "foundation/presets/verticals/roster/index.ts";
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.tsx?$/.test(entry)) continue;
        const path = relative(root, full).split("\\").join("/");
        if (path === roster) continue;
        const source = readFileSync(full, "utf8");
        source.split("\n").forEach((line, index) => {
          if (/\?\?\s*['"]light['"]/.test(line)) {
            offenders.push(`${path}:${index + 1}`);
          }
        });
      }
    };
    walk(root);
    expect(offenders.sort()).toEqual([]);
  });
});

describe("WO-DER-05 · the vertical baseline is compiled once, cached by digest", () => {
  it("hands two tenant compiles of one vertical the same baseline object", () => {
    const intent = (rowVersion: number) =>
      documentThemeIntent({
        vertical: "bithire",
        slug: `der05-cache-${rowVersion}`,
        document: paletteDocument({ primary: TENANT_PRIMARY }),
      });
    // DIFFERENT SLUGS on purpose: `baselineFor` stamps the requesting tenant's
    // slug onto the roster Theme, and a cache keyed with it would miss on the
    // one case it exists for -- a second tenant of the same vertical.
    const first = compileThemeIntent(intent(1));
    const second = compileThemeIntent(intent(2));
    expect(first.baseline).toBeDefined();
    expect(second.baseline).toBe(first.baseline);
    expect(Object.isFrozen(first.baseline)).toBe(true);
  });

  it("misses the cache for a different vertical", () => {
    const evnto = compileThemeIntent(
      documentThemeIntent({
        vertical: "evnto",
        slug: "der05-cache-evnto",
        document: paletteDocument({ primary: TENANT_PRIMARY }),
      })
    );
    const bithire = compileThemeIntent(
      documentThemeIntent({
        vertical: "bithire",
        slug: "der05-cache-bithire",
        document: paletteDocument({ primary: TENANT_PRIMARY }),
      })
    );
    expect(evnto.baseline).not.toBe(bithire.baseline);
  });
});

describe("WO-DER-05 · the modes family refuses what it always refused", () => {
  const bithire = FIRST_PARTY_BASELINES.bithire as unknown as FlatTheme;

  it("derives exactly the non-default mode for an untouched vertical", () => {
    const requests = deriveModeThemes({
      theme: bithire,
      tenantFacts: undefined,
      tenantPatch: undefined,
    });
    expect(requests.map((request) => request.mode)).toEqual(["dark"]);
    expect(requests[0]?.modePrefix).toBe("modes.dark.");
  });

  it("refuses an overlay authored for the theme's OWN default mode", () => {
    const planted = {
      ...bithire,
      modes: {
        ...bithire.modes,
        light: { palette: { primaryColor: "#123456" } },
      },
    } as FlatTheme;
    expect(() =>
      deriveModeThemes({
        theme: planted,
        tenantFacts: undefined,
        tenantPatch: undefined,
      })
    ).toThrow(/declared defaultMode/);
  });

  it("keeps a static vertical compiling through the same family", () => {
    expect(() =>
      compileThemeIntent(staticThemeIntent("bithire", "der05-drill"))
    ).not.toThrow();
  });
});
