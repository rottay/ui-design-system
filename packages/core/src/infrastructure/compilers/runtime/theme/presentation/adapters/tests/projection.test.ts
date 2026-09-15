/**
 * What an adapter may produce, measured against real compiles — the three
 * shipped verticals over the neutral foundation and a customer document over
 * each of them — never a fabricated channel bag.
 */

import { describe, expect, it } from "vitest";

import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { ThemeLayerPatch } from "@/foundation/contracts/composition/tenants/themes/iso";

import { compileTheme } from "../../../runtime/lowering";
import {
  CLASSIC_RADIUS_CHANNELS,
  CLASSIC_SEED_CHANNELS,
  classicThemeAdapter,
} from "../presentation/classic";
import { staticThemeIntent } from "../../../runtime/ingress";
import { modernThemeAdapter } from "../presentation/modern";
import { rusticThemeAdapter } from "../presentation/rustic";
import { FIRST_PARTY_BASELINES, resolveFirstParty } from "@tests/support/theme-lowering";

const SLUGS = ["rottay", "bithire", "evnto"] as const;

const compiledFor = (slug: (typeof SLUGS)[number]): ThemeCompilation =>
  compileTheme(resolveFirstParty(staticThemeIntent(slug)), modernThemeAdapter);

const COMPILED: Readonly<Record<(typeof SLUGS)[number], ThemeCompilation>> = Object.freeze({
  rottay: compiledFor("rottay"),
  bithire: compiledFor("bithire"),
  evnto: compiledFor("evnto"),
});

/**
 * A customer that authors every operand classic reads: the eight colour seeds,
 * a mid radius and a primary for the vertical's other mode. The first-party
 * presets author no palette (rottay, evnto) or no radius literal (bithire), so
 * the seed vocabulary is measured on this document over each vertical.
 */
const CUSTOMER_PALETTE = {
  primaryColor: "#1D4ED8",
  secondaryColor: "#0F172A",
  accentColor: "#F59E0B",
  successColor: "#15803D",
  warningColor: "#B45309",
  errorColor: "#B91C1C",
  infoColor: "#0369A1",
  backgroundColor: "#FFFFFF",
  textPrimaryColor: "#111827",
  onPrimaryColor: "#FFFFFF",
} as const;
const CUSTOMER_RADIUS = { rottay: "10px", bithire: "10px", evnto: "14px" } as const;
const OTHER_MODE = { rottay: "light", bithire: "dark", evnto: "dark" } as const;
const CUSTOMER_MODE_PRIMARY = "#93C5FD";

const customerFor = (slug: (typeof SLUGS)[number]): ThemeCompilation =>
  compileTheme(
    resolveFirstParty({
      vertical: slug,
      slug: "acme",
      origin: "tenant-document",
      patch: {
        palette: CUSTOMER_PALETTE,
        surfaces: { borderRadius: { md: CUSTOMER_RADIUS[slug] } },
        modes: { [OTHER_MODE[slug]]: { palette: { primaryColor: CUSTOMER_MODE_PRIMARY } } },
      },
    }),
    modernThemeAdapter
  );

const CUSTOMER: Readonly<Record<(typeof SLUGS)[number], ThemeCompilation>> = Object.freeze({
  rottay: customerFor("rottay"),
  bithire: customerFor("bithire"),
  evnto: customerFor("evnto"),
});

// WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): projection.seeds
// is 0 for rottay and evnto (no preset authors a palette) and 8 for bithire,
// whose preset authors no radius literal (--ds-radius-md-base, the same family
// as the registered --ds-radius-sm-base) and no root ink (--ds-color-text-primary,
// left to the foundation since D6-2c-i); pinned to the measured state until the
// lane lands.
const FIRST_PARTY_UNPRODUCED: Readonly<Record<(typeof SLUGS)[number], readonly string[]>> = {
  rottay: [
    "--ds-color-bg-primary",
    "--ds-color-error",
    "--ds-color-info",
    "--ds-color-primary",
    "--ds-color-success",
    "--ds-color-text-on-primary",
    "--ds-color-text-primary",
    "--ds-color-warning",
    "--ds-radius-md-base",
  ],
  bithire: ["--ds-color-text-primary", "--ds-radius-md-base"],
  evnto: [
    "--ds-color-bg-primary",
    "--ds-color-error",
    "--ds-color-info",
    "--ds-color-primary",
    "--ds-color-success",
    "--ds-color-text-on-primary",
    "--ds-color-text-primary",
    "--ds-color-warning",
    "--ds-radius-md-base",
  ],
};
const FIRST_PARTY_SEEDS: Readonly<Record<(typeof SLUGS)[number], readonly string[]>> = {
  rottay: [],
  bithire: [
    "colorBgBase",
    "colorError",
    "colorInfo",
    "colorLink",
    "colorPrimary",
    "colorSuccess",
    "colorTextLightSolid",
    "colorWarning",
  ],
  evnto: [],
};

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
    it(`every channel classic names is produced by a customer compile over ${slug}`, () => {
      const missing = READ_CHANNELS.filter(
        (channel) => CUSTOMER[slug].cssVariables[channel] == null
      );
      expect(missing).toEqual([]);
    });

    it(`the ${slug} first-party compile leaves exactly the measured channels unproduced`, () => {
      const missing = READ_CHANNELS.filter(
        (channel) => COMPILED[slug].cssVariables[channel] == null
      );
      expect(missing).toEqual([...FIRST_PARTY_UNPRODUCED[slug]]);
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
        it(`${name}/${id}: every seed and source survives a customer compile over ${slug}`, () => {
          const projection = adapter.project(CUSTOMER[slug]);
          for (const seed of cell.evidence.seeds)
            expect(Object.keys(projection.seeds)).toContain(seed);
          for (const channel of cell.evidence.from)
            expect(CUSTOMER[slug].cssVariables[channel]).toBeDefined();
        });
      }
    }
  }

  for (const slug of SLUGS) {
    it(`the ${slug} first-party compile projects exactly the measured seeds`, () => {
      const { seeds } = classicThemeAdapter.project(COMPILED[slug]);
      expect(Object.keys(seeds).sort()).toEqual([...FIRST_PARTY_SEEDS[slug]]);
    });
  }
});

describe("classic projects the antd seed vocabulary, base and per mode", () => {
  for (const slug of SLUGS) {
    it(`projects all ten seeds for a customer over ${slug}, none of them dropped`, () => {
      const { seeds } = classicThemeAdapter.project(CUSTOMER[slug]);
      expect(Object.keys(seeds)).toHaveLength(10);
      for (const [token, channel] of Object.entries(CLASSIC_SEED_CHANNELS))
        expect(seeds[token]).toBe(CUSTOMER[slug].cssVariables[channel]);
      expect(Number.isFinite(seeds.borderRadius as number)).toBe(true);
    });

    it(`emits one projection per compiled mode block for a customer over ${slug}`, () => {
      const projection = classicThemeAdapter.project(CUSTOMER[slug]);
      expect(projection.modes.map((entry) => entry.mode)).toEqual(
        CUSTOMER[slug].modeBlocks.map((block) => block.mode)
      );
      expect(projection.modes).toHaveLength(1);
      for (const entry of projection.modes) expect(Object.keys(entry.seeds)).toHaveLength(10);
    });
  }

  it("returns the authored radius in px, dial cancelled, as antd requires", () => {
    // bithire's preset dial is 0.8, so its operand is `calc(10px / 0.8)` and the
    // seed folds the dial back out; rottay and evnto rest at 1.
    expect(CUSTOMER.bithire.cssVariables["--ds-radius-md-base"]).toBe("calc(10px / 0.8)");
    expect(classicThemeAdapter.project(CUSTOMER.rottay).seeds.borderRadius).toBe(10);
    expect(classicThemeAdapter.project(CUSTOMER.bithire).seeds.borderRadius).toBe(10);
    expect(classicThemeAdapter.project(CUSTOMER.evnto).seeds.borderRadius).toBe(14);
  });

  it("uses the mode block's own value where the mode overrides a channel", () => {
    const compiled = CUSTOMER.bithire;
    const dark = compiled.modeBlocks.find((block) => block.mode === "dark");
    const projection = classicThemeAdapter.project(compiled);
    const projected = projection.modes.find((entry) => entry.mode === "dark");
    expect(dark?.cssVariables["--ds-color-primary"]).toBe(CUSTOMER_MODE_PRIMARY);
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
    const { "--ds-color-info": _dropped, ...rest } = CUSTOMER.rottay.cssVariables;
    const sparse: ThemeCompilation = { ...CUSTOMER.rottay, cssVariables: rest };
    const { seeds } = classicThemeAdapter.project(sparse);
    expect(seeds.colorInfo).toBeUndefined();
    expect(Object.keys(seeds)).toHaveLength(9);
  });
});

describe("a real tenant radius reaches antd in the unit the tenant wrote", () => {
  const tenantSeed = (patch: ThemeLayerPatch): number =>
    compileTheme(
      resolveFirstParty({
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

  it("normalizes the authored radius against the VERTICAL dial, not the tenant's own", () => {
    const compiled = compileTheme(
      resolveFirstParty({
        vertical: "rottay",
        slug: "rottay",
        origin: "tenant-document",
        patch: { surfaces: { borderRadius: { md: "0.5rem" }, radiusScale: 1.25 } },
      }),
      classicThemeAdapter
    );
    // rottay rests at 1, so the operand is the authored unit unchanged and the
    // tenant's own 1.25 multiplies it in the browser: the corner MOVES. The
    // divisor used to be the tenant's dial, which reproduced 0.5rem at every
    // dial position and is exactly the self-cancellation F-07 measured.
    expect(compiled.cssVariables["--ds-radius-md-base"]).toBe("0.5rem");
    // 8 -> 10: antd's numeric seed follows the corner. 0.5rem at a 1.25 dial
    // IS 10px; the old 8 was the cancellation reported as a seed.
    expect(compiled.projection.seeds.borderRadius).toBeCloseTo(10, 10);
    for (const entry of compiled.projection.modes) expect(entry.seeds.borderRadius).toBe(10);
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
      const resolution = resolveFirstParty(staticThemeIntent(slug));
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
