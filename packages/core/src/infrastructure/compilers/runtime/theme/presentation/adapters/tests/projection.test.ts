/**
 * What an adapter may produce, measured against real compiles of the three
 * shipped verticals — never a fabricated channel bag.
 */

import { describe, expect, it } from "vitest";

import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { ThemeLayerPatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { compileTheme } from "../../../runtime/lowering";
import { resolveTheme } from "../../../runtime/resolution";
import {
  CLASSIC_RADIUS_CHANNELS,
  CLASSIC_SEED_CHANNELS,
  classicThemeAdapter,
} from "../presentation/classic";
import { staticThemeIntent } from "../../../runtime/ingress";
import { modernThemeAdapter } from "../presentation/modern";
import { rusticThemeAdapter } from "../presentation/rustic";

const SLUGS = ["rottay", "bithire", "evnto"] as const;

const compiledFor = (slug: (typeof SLUGS)[number]): ThemeCompilation =>
  compileTheme(resolveTheme(staticThemeIntent(slug)), modernThemeAdapter);

const COMPILED: Readonly<Record<(typeof SLUGS)[number], ThemeCompilation>> = Object.freeze({
  rottay: compiledFor("rottay"),
  bithire: compiledFor("bithire"),
  evnto: compiledFor("evnto"),
});

const SHIPPED = [
  ["modern", modernThemeAdapter],
  ["classic", classicThemeAdapter],
  ["rustic", rusticThemeAdapter],
] as const;

describe("a channel an adapter reads must exist in a real compile", () => {
  const SEED_CHANNELS = [...new Set(Object.values(CLASSIC_SEED_CHANNELS))];
  const READ_CHANNELS = [...SEED_CHANNELS, ...Object.values(CLASSIC_RADIUS_CHANNELS)].sort();

  it("reads eight colour channels and the two radius operands", () => {
    expect(Object.values(CLASSIC_SEED_CHANNELS)).toHaveLength(9);
    expect(SEED_CHANNELS).toHaveLength(8);
    expect(CLASSIC_SEED_CHANNELS.colorLink).toBe(CLASSIC_SEED_CHANNELS.colorPrimary);
    expect(READ_CHANNELS).toHaveLength(10);
  });

  for (const slug of SLUGS) {
    it(`every channel classic names is produced by the ${slug} compile`, () => {
      const missing = READ_CHANNELS.filter(
        (channel) => COMPILED[slug].cssVariables[channel] == null
      );
      expect(missing).toEqual([]);
    });
  }

  it("--ds-radius-md is a stylesheet channel the compiler never emits", () => {
    for (const slug of SLUGS)
      expect(COMPILED[slug].cssVariables["--ds-radius-md"]).toBeUndefined();
    expect(Object.values(CLASSIC_SEED_CHANNELS)).not.toContain("--ds-radius-md");
  });
});

describe("the `mapped` cells name seeds the projection actually produces", () => {
  for (const [name, adapter] of SHIPPED) {
    for (const [id, cell] of Object.entries(adapter.controls)) {
      if (cell.posture !== "mapped") continue;
      for (const slug of SLUGS) {
        it(`${name}/${id}: every seed and source survives the ${slug} compile`, () => {
          const projection = adapter.project(COMPILED[slug]);
          for (const seed of cell.evidence.seeds)
            expect(Object.keys(projection.seeds)).toContain(seed);
          for (const channel of cell.evidence.from)
            expect(COMPILED[slug].cssVariables[channel]).toBeDefined();
        });
      }
    }
  }
});

describe("classic projects the antd seed vocabulary, base and per mode", () => {
  for (const slug of SLUGS) {
    it(`projects all ten seeds for ${slug}, none of them dropped`, () => {
      const { seeds } = classicThemeAdapter.project(COMPILED[slug]);
      expect(Object.keys(seeds)).toHaveLength(10);
      for (const [token, channel] of Object.entries(CLASSIC_SEED_CHANNELS))
        expect(seeds[token]).toBe(COMPILED[slug].cssVariables[channel]);
      expect(Number.isFinite(seeds.borderRadius as number)).toBe(true);
    });

    it(`emits one projection per compiled mode block for ${slug}`, () => {
      const projection = classicThemeAdapter.project(COMPILED[slug]);
      expect(projection.modes.map((entry) => entry.mode)).toEqual(
        COMPILED[slug].modeBlocks.map((block) => block.mode)
      );
      for (const entry of projection.modes) expect(Object.keys(entry.seeds)).toHaveLength(10);
    });
  }

  it("returns the authored radius in px, dial cancelled, as antd requires", () => {
    expect(classicThemeAdapter.project(COMPILED.rottay).seeds.borderRadius).toBe(10);
    expect(classicThemeAdapter.project(COMPILED.bithire).seeds.borderRadius).toBe(10);
    expect(classicThemeAdapter.project(COMPILED.evnto).seeds.borderRadius).toBe(14);
  });

  it("uses the mode block's own value where the mode overrides a channel", () => {
    const compiled = COMPILED.bithire;
    const dark = compiled.modeBlocks.find((block) => block.mode === "dark");
    const projection = classicThemeAdapter.project(compiled);
    const projected = projection.modes.find((entry) => entry.mode === "dark");
    expect(dark?.cssVariables["--ds-color-primary"]).toBeDefined();
    expect(projected?.seeds.colorPrimary).toBe(dark?.cssVariables["--ds-color-primary"]);
    expect(projected?.seeds.colorPrimary).not.toBe(projection.seeds.colorPrimary);
  });

  it("inherits the base value where the mode overrides nothing", () => {
    const compiled = COMPILED.bithire;
    const projection = classicThemeAdapter.project(compiled);
    const projected = projection.modes.find((entry) => entry.mode === "dark");
    expect(projected?.seeds.colorTextLightSolid).toBe(projection.seeds.colorTextLightSolid);
  });

  it("has no mode projection when the theme compiles no mode block", () => {
    const flat: ThemeCompilation = { ...COMPILED.rottay, modeBlocks: [] };
    expect(classicThemeAdapter.project(flat).modes).toEqual([]);
  });

  it("throws rather than dropping a PRESENT operand it cannot convert", () => {
    for (const unreadable of ["var(--elsewhere)", "50%", "calc(10px + 2px)", "inherit", ""]) {
      const broken: ThemeCompilation = {
        ...COMPILED.rottay,
        cssVariables: {
          ...COMPILED.rottay.cssVariables,
          "--ds-radius-md-base": unreadable,
        },
      };
      expect(() => classicThemeAdapter.project(broken)).toThrow(
        /--ds-radius-md-base is .*numeric borderRadius seed cannot carry/s
      );
    }
  });

  it("drops a seed the compile did not produce, and keeps the rest", () => {
    const { "--ds-color-info": _dropped, ...rest } = COMPILED.rottay.cssVariables;
    const sparse: ThemeCompilation = { ...COMPILED.rottay, cssVariables: rest };
    const { seeds } = classicThemeAdapter.project(sparse);
    expect(seeds.colorInfo).toBeUndefined();
    expect(Object.keys(seeds)).toHaveLength(9);
  });
});

describe("a real tenant radius reaches antd in the unit the tenant wrote", () => {
  const tenantSeed = (patch: ThemeLayerPatch): number =>
    compileTheme(
      resolveTheme({
        vertical: "rottay",
        slug: "rottay",
        origin: "tenant-document",
        patch,
      }),
      classicThemeAdapter
    ).projection.seeds.borderRadius as number;

  it("carries rem and em, which parseFloat used to read as px", () => {
    expect(tenantSeed({ surfaces: { borderRadius: { md: "0.5rem" } } })).toBe(8);
    expect(tenantSeed({ surfaces: { borderRadius: { md: "1em" } } })).toBe(16);
  });

  it("reproduces the authored radius at a non-1 dial", () => {
    const compiled = compileTheme(
      resolveTheme({
        vertical: "rottay",
        slug: "rottay",
        origin: "tenant-document",
        patch: { surfaces: { borderRadius: { md: "0.5rem" }, radiusScale: 1.25 } },
      }),
      classicThemeAdapter
    );
    expect(compiled.cssVariables["--ds-radius-md-base"]).toBe("calc(0.5rem / 1.25)");
    expect(compiled.projection.seeds.borderRadius).toBeCloseTo(8, 10);
    for (const entry of compiled.projection.modes) expect(entry.seeds.borderRadius).toBe(8);
  });
});

describe("the three baselines are three answers, never one copied thrice", () => {
  it("differ on every axis a component can see", () => {
    const rows = SHIPPED.map(([, adapter]) => adapter.tokenBaseline);
    for (const read of [
      (row: (typeof rows)[number]) => row.borderRadius.md,
      (row: (typeof rows)[number]) => row.shadows.md,
      (row: (typeof rows)[number]) => row.motion.hover,
      (row: (typeof rows)[number]) => String(row.densityScale),
    ]) {
      expect(new Set(rows.map(read)).size).toBe(rows.length);
    }
  });

  it("is frozen through its groups, not only at its outer object", () => {
    for (const [, adapter] of SHIPPED) {
      const baseline = adapter.tokenBaseline;
      expect(Object.isFrozen(baseline)).toBe(true);
      for (const group of [baseline.borderRadius, baseline.shadows, baseline.surface, baseline.motion])
        expect(Object.isFrozen(group)).toBe(true);
    }
  });
});

describe("adapters project, they never mint a channel name or emit CSS", () => {
  for (const [name, adapter] of SHIPPED) {
    it(`${name} emits no key beginning with -- and no CSS text`, () => {
      for (const slug of SLUGS) {
        const projection = adapter.project(COMPILED[slug]);
        const entries = [
          ...Object.entries(projection.seeds),
          ...projection.modes.flatMap((entry) => Object.entries(entry.seeds)),
        ];
        for (const [key, value] of entries) {
          expect(key.startsWith("--")).toBe(false);
          expect(String(value)).not.toContain("{");
          expect(String(value)).not.toContain(";");
        }
      }
    });

    it(`${name} declares a complete token baseline of its own`, () => {
      const baseline = adapter.tokenBaseline;
      expect(Object.keys(baseline.borderRadius).sort()).toEqual([
        "full",
        "lg",
        "md",
        "none",
        "sm",
        "xl",
      ]);
      expect(Object.keys(baseline.shadows).sort()).toEqual(["lg", "md", "sm", "xl"]);
      expect(typeof baseline.surface.borderWidth).toBe("string");
      expect(typeof baseline.motion.hover).toBe("string");
      expect(typeof baseline.densityScale).toBe("number");
    });
  }

  it("modern and rustic project nothing at all, base or mode", () => {
    for (const adapter of [modernThemeAdapter, rusticThemeAdapter])
      for (const slug of SLUGS)
        expect(adapter.project(COMPILED[slug])).toEqual({ seeds: {}, modes: [] });
  });

  it("compiles engine-invariant channels: the three adapters agree exactly", () => {
    for (const slug of SLUGS) {
      const resolution = resolveTheme(staticThemeIntent(slug));
      const [modern, classic, rustic] = SHIPPED.map(([, adapter]) =>
        compileTheme(resolution, adapter)
      );
      expect(classic.cssVariables).toEqual(modern.cssVariables);
      expect(rustic.cssVariables).toEqual(modern.cssVariables);
      expect(classic.modeBlocks).toEqual(modern.modeBlocks);
      expect(classic.engine).toBe("classic");
      expect(modern.engine).toBe("modern");
    }
  });
});
