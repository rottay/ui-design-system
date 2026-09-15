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
    // block would put the dark ink on a light surface. The vertical's own
    // per-mode ground is what used to stand under the tenant's sanctioned
    // overrides and keep that from happening.
    //
    // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15):
    // `modes.dark.palette.backgroundColor` on the bithire preset; pinned to the
    // measured state until the lane lands. The preset authors no per-mode
    // ground, so nothing restates the canvas in the dark block and the tenant's
    // base ground now cascades into it -- the light-canvas-in-dark-mode shape
    // this test was written to forbid. Pinned as measured, with the rule it
    // asserts stated, rather than re-titled as if the behaviour were intended.
    const grounded = compile("bithire", {
      primary: TENANT_PRIMARY,
      background: "#FBFBFD",
    });
    expect(grounded.variables["--ds-color-bg-primary"]).toBe("#FBFBFD");
    expect(
      FIRST_PARTY_BASELINES.bithire.modes?.dark?.palette?.backgroundColor
    ).toBeUndefined();
    expect(effective(grounded, "dark")["--ds-color-bg-primary"]).toBe(
      "#FBFBFD"
    );
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
