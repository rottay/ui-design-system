/**
 * The three shipped adapters.
 *
 * `native` is falsifiable here in two ways: every native cell declares WHICH of
 * three witness kinds carries it and the three counts are pinned, and every
 * `--ds-*` channel an adapter actually reads must be produced by a real compile
 * of every first-party theme.
 */

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { TENANT_CAPABILITY_REGISTRY } from "@/foundation/contracts/composition/tenants/capabilities";
import type {
  ControlId,
  EngineAdapter,
  EnginePosture,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { ThemePatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { compileTheme } from "../../../runtime/lowering";
import { resolveTheme } from "../../../runtime/resolution";
import {
  CLASSIC_RADIUS_CHANNELS,
  CLASSIC_SEED_CHANNELS,
  classicThemeAdapter,
  modernThemeAdapter,
  resolveAdapter,
  rusticThemeAdapter,
  THEME_ENGINE_ADAPTERS,
} from "..";

const SRC_ROOT = resolve(__dirname, "../../../../../../..");
const ANTD_BRIDGE = join(
  SRC_ROOT,
  "infrastructure/runtime/engines/presentation/adapters/antd/index.tsx"
);

const POSTURES: readonly EnginePosture[] = [
  "native",
  "mapped",
  "invariant",
  "unsupported",
];

const REGISTRY_IDS = TENANT_CAPABILITY_REGISTRY.map((control) => control.id);

/**
 * `declared-channel`  the engine's own surface reads a name from the control's
 *                     declared `outputs.channels`
 * `sibling-channel`   the control declares no channels, or its declared list is
 *                     read by NONE of the three engines, and a named substitute
 *                     channel family on the engine's own surface carries the axis
 * `runtime-delivery`  an engine-agnostic runtime delivers the axis and the
 *                     engine's own implementations consume the result as props
 */
type WitnessKind = "declared-channel" | "sibling-channel" | "runtime-delivery";

const WITNESSES: Readonly<Record<EngineName | "modern", Partial<Record<ControlId, WitnessKind>>>> = {
  modern: {
    "palette.seeds": "declared-channel",
    "palette.dark-mode": "sibling-channel",
    "typography.pairing": "declared-channel",
    "typography.families": "declared-channel",
    "typography.scale": "declared-channel",
    "shape.radius-scale": "declared-channel",
    "shape.button-style": "sibling-channel",
    "density.mode": "declared-channel",
    "spacing.rhythm": "declared-channel",
    "motion.dial": "declared-channel",
    "surfaces.elevation-posture": "declared-channel",
    "surfaces.effect-intensity": "declared-channel",
    "navigation.sidebar-tone": "declared-channel",
    "experience.profile": "declared-channel",
    "chrome.families": "declared-channel",
    "chrome.anatomy": "sibling-channel",
    "token-overrides": "declared-channel",
    "recipe-profile": "runtime-delivery",
    "profiles.expressive": "declared-channel",
    "palette.status-seeds": "declared-channel",
    "profiles.icon": "runtime-delivery",
    "responsive.posture": "runtime-delivery",
  },
  classic: {
    "palette.seeds": "declared-channel",
    "palette.dark-mode": "sibling-channel",
    "typography.pairing": "declared-channel",
    "typography.families": "declared-channel",
    "shape.radius-scale": "declared-channel",
    "shape.button-style": "sibling-channel",
    "surfaces.elevation-posture": "sibling-channel",
    "chrome.families": "declared-channel",
    "token-overrides": "declared-channel",
    "recipe-profile": "runtime-delivery",
    "palette.status-seeds": "declared-channel",
    "profiles.icon": "runtime-delivery",
    "responsive.posture": "runtime-delivery",
  },
  rustic: {
    "palette.seeds": "declared-channel",
    "palette.dark-mode": "sibling-channel",
    "typography.pairing": "declared-channel",
    "typography.families": "declared-channel",
    "shape.radius-scale": "declared-channel",
    "shape.button-style": "sibling-channel",
    "density.mode": "declared-channel",
    "motion.dial": "declared-channel",
    "surfaces.elevation-posture": "declared-channel",
    "chrome.families": "declared-channel",
    "chrome.anatomy": "sibling-channel",
    "token-overrides": "declared-channel",
    "recipe-profile": "runtime-delivery",
    "palette.status-seeds": "declared-channel",
    "profiles.icon": "runtime-delivery",
    "responsive.posture": "runtime-delivery",
  },
  custom: {},
};

const SLUGS = ["rottay", "bithire", "evnto"] as const;

/** Real compiles, never a hand-written channel bag: a fabricated channel proves nothing. */
const compiledFor = (slug: (typeof SLUGS)[number]): ThemeCompilation =>
  compileTheme(resolveTheme(FIRST_PARTY_THEMES[slug]), modernThemeAdapter);

const COMPILED: Readonly<Record<(typeof SLUGS)[number], ThemeCompilation>> = Object.freeze({
  rottay: compiledFor("rottay"),
  bithire: compiledFor("bithire"),
  evnto: compiledFor("evnto"),
});

/** The antd token -> DS channel map the shipped runtime bridge reads at paint time. */
const shippedBridgeSeedMap = (): Record<string, string> => {
  const source = readFileSync(ANTD_BRIDGE, "utf8");
  const open = source.indexOf("const CSS_VAR_MAP = {");
  const body = source.slice(open, source.indexOf("} as const;", open));
  return Object.fromEntries(
    [...body.matchAll(/(\w+):\s*'(--ds-[a-z0-9-]+)'/g)].map((match) => [
      match[1],
      match[2],
    ])
  );
};

const shipped: readonly [EngineName, EngineAdapter][] = [
  ["modern", modernThemeAdapter],
  ["classic", classicThemeAdapter],
  ["rustic", rusticThemeAdapter],
];

describe("resolveAdapter has no fallback", () => {
  it("resolves the three shipped engines", () => {
    expect(resolveAdapter("modern")).toBe(modernThemeAdapter);
    expect(resolveAdapter("classic")).toBe(classicThemeAdapter);
    expect(resolveAdapter("rustic")).toBe(rusticThemeAdapter);
  });

  it("throws on `custom` without a registered pack", () => {
    expect(() => resolveAdapter("custom")).toThrow(/no theme adapter for engine/);
  });

  it("throws on an unknown engine rather than defaulting to classic", () => {
    expect(() => resolveAdapter("nonsense" as EngineName)).toThrow(
      /There is no fallback engine/
    );
  });

  it("registers exactly the three shipped engines", () => {
    expect(Object.keys(THEME_ENGINE_ADAPTERS).sort()).toEqual([
      "classic",
      "modern",
      "rustic",
    ]);
  });
});

describe("posture is total and closed", () => {
  for (const [name, adapter] of shipped) {
    it(`${name} declares every registry control, and nothing else`, () => {
      expect(Object.keys(adapter.posture).sort()).toEqual([...REGISTRY_IDS].sort());
    });

    it(`${name} uses only the four closed posture values`, () => {
      for (const value of Object.values(adapter.posture)) {
        expect(POSTURES).toContain(value);
      }
    });

    it(`${name} reports its own engine id`, () => {
      expect(adapter.id).toBe(name);
    });
  }

  it("modern is native on all 22 controls", () => {
    for (const id of REGISTRY_IDS) {
      expect(modernThemeAdapter.posture[id]).toBe("native");
    }
  });

  it("pins the classic and rustic non-native counts", () => {
    const nonNative = (adapter: EngineAdapter) =>
      Object.values(adapter.posture).filter((p) => p !== "native").length;
    expect(nonNative(classicThemeAdapter)).toBe(9);
    expect(nonNative(rusticThemeAdapter)).toBe(6);
    expect(nonNative(modernThemeAdapter)).toBe(0);
  });

  it("pins the whole 66-cell distribution", () => {
    const all = shipped.flatMap(([, adapter]) => Object.values(adapter.posture));
    expect(all).toHaveLength(66);
    const count = (p: EnginePosture) => all.filter((v) => v === p).length;
    expect(count("native")).toBe(51);
    expect(count("mapped")).toBe(2);
    expect(count("invariant")).toBe(2);
    expect(count("unsupported")).toBe(11);
    expect(count("native") + count("mapped") + count("invariant") + count("unsupported")).toBe(66);
  });
});

describe("`native` is falsifiable: every native cell names its witness kind", () => {
  it("declares a witness for exactly the native cells", () => {
    for (const [name, adapter] of shipped) {
      const natives = REGISTRY_IDS.filter((id) => adapter.posture[id] === "native");
      const declared = Object.keys(WITNESSES[name]) as ControlId[];
      expect([...declared].sort()).toEqual([...natives].sort());
    }
  });

  it("pins the three witness counts, so 51 cannot be reached a different way", () => {
    const kinds = shipped.flatMap(([name, adapter]) =>
      REGISTRY_IDS.filter((id) => adapter.posture[id] === "native").map(
        (id) => WITNESSES[name][id] as WitnessKind
      )
    );
    expect(kinds.filter((k) => k === "declared-channel")).toHaveLength(33);
    expect(kinds.filter((k) => k === "sibling-channel")).toHaveLength(9);
    expect(kinds.filter((k) => k === "runtime-delivery")).toHaveLength(9);
    expect(kinds).toHaveLength(51);
    expect(33 + 9 + 9).toBe(51);
  });

  it("records the one counted exception: classic's elevation ladder", () => {
    // Modern and rustic read the declared --ds-elevation-{1,2,3} ladder; classic
    // reads none of it and expresses the axis through --ds-shadow-{sm,md,lg} on
    // its own surface. That is DS vocabulary, not antd's, so `mapped` would be
    // factually wrong; the cell is retained as native under an explicit,
    // counted sibling-channel witness rather than waived.
    expect(WITNESSES.classic["surfaces.elevation-posture"]).toBe("sibling-channel");
    expect(WITNESSES.modern["surfaces.elevation-posture"]).toBe("declared-channel");
    expect(WITNESSES.rustic["surfaces.elevation-posture"]).toBe("declared-channel");
  });
});

describe("a channel an adapter reads must exist in a real compile", () => {
  const SEED_CHANNELS = [...new Set(Object.values(CLASSIC_SEED_CHANNELS))];
  const READ_CHANNELS = [
    ...SEED_CHANNELS,
    ...Object.values(CLASSIC_RADIUS_CHANNELS),
  ].sort();

  it("reads eight colour channels and the two radius operands", () => {
    // Nine antd tokens over eight channels: colorPrimary and colorLink name
    // the same one, so the census dedupes at the seed map instead of leaving a
    // repeated entry for the channel list to absorb.
    expect(Object.values(CLASSIC_SEED_CHANNELS)).toHaveLength(9);
    expect(SEED_CHANNELS).toHaveLength(8);
    expect(CLASSIC_SEED_CHANNELS.colorLink).toBe(CLASSIC_SEED_CHANNELS.colorPrimary);
    expect(READ_CHANNELS).toHaveLength(10);
    expect(new Set(READ_CHANNELS).size).toBe(READ_CHANNELS.length);
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
    // The foundation stylesheet defines it as calc(base * scale). It is not a
    // key of ThemeCompilation.cssVariables, so an adapter that looked it up
    // there would silently drop the seed on every theme.
    for (const slug of SLUGS) {
      expect(COMPILED[slug].cssVariables["--ds-radius-md"]).toBeUndefined();
    }
    expect(Object.values(CLASSIC_SEED_CHANNELS)).not.toContain("--ds-radius-md");
    expect(Object.values(CLASSIC_RADIUS_CHANNELS)).not.toContain("--ds-radius-md");
  });
});

describe("classic projects the shipped antd seed vocabulary", () => {
  it("covers exactly the runtime bridge's token names", () => {
    const bridge = shippedBridgeSeedMap();
    expect(Object.keys(bridge)).toHaveLength(10);
    const projected = Object.keys(
      classicThemeAdapter.project(COMPILED.rottay).seeds
    ).sort();
    expect(projected).toEqual(Object.keys(bridge).sort());
  });

  it("agrees with the bridge channel-for-channel on the nine colour seeds", () => {
    const bridge = shippedBridgeSeedMap();
    for (const [token, channel] of Object.entries(CLASSIC_SEED_CHANNELS)) {
      expect(bridge[token]).toBe(channel);
    }
  });

  it("resolves radius where the bridge reads the composed stylesheet channel", () => {
    // The bridge reads --ds-radius-md off the live cascade, which the browser
    // has already resolved. A compile-time adapter has only the operands, so it
    // performs the same multiplication instead of reading a key that is absent.
    expect(shippedBridgeSeedMap().borderRadius).toBe("--ds-radius-md");
    expect(CLASSIC_RADIUS_CHANNELS.base).toBe("--ds-radius-md-base");
    expect(CLASSIC_RADIUS_CHANNELS.scale).toBe("--ds-radius-scale");
  });

  for (const slug of SLUGS) {
    it(`projects all ten seeds for ${slug}, none of them dropped`, () => {
      const { seeds } = classicThemeAdapter.project(COMPILED[slug]);
      expect(Object.keys(seeds)).toHaveLength(10);
      for (const [token, channel] of Object.entries(CLASSIC_SEED_CHANNELS)) {
        expect(seeds[token]).toBe(COMPILED[slug].cssVariables[channel]);
      }
      expect(typeof seeds.borderRadius).toBe("number");
      expect(Number.isFinite(seeds.borderRadius as number)).toBe(true);
    });
  }

  it("returns the authored radius in px, dial cancelled, as antd requires", () => {
    // rottay: base 10px at scale 1. bithire: base calc(10px / 1.25) at scale
    // 1.25. evnto: base 14px at scale 1. All three resolve to the authored step.
    expect(classicThemeAdapter.project(COMPILED.rottay).seeds.borderRadius).toBe(10);
    expect(classicThemeAdapter.project(COMPILED.bithire).seeds.borderRadius).toBe(10);
    expect(classicThemeAdapter.project(COMPILED.evnto).seeds.borderRadius).toBe(14);
  });

  it("matches parseFloat of the value the browser computes for the same operands", () => {
    for (const slug of SLUGS) {
      const vars = COMPILED[slug].cssVariables;
      const operand = vars[CLASSIC_RADIUS_CHANNELS.base] as string;
      const authored = operand.startsWith("calc(")
        ? parseFloat(operand.slice(5)) / Number(operand.split("/")[1]?.replace(")", ""))
        : parseFloat(operand);
      const composed = authored * Number(vars[CLASSIC_RADIUS_CHANNELS.scale]);
      expect(classicThemeAdapter.project(COMPILED[slug]).seeds.borderRadius).toBe(
        composed
      );
    }
  });

  it("moves the radius seed when the dial moves", () => {
    const dialed: ThemeCompilation = {
      ...COMPILED.rottay,
      cssVariables: { ...COMPILED.rottay.cssVariables, "--ds-radius-scale": "1.2" },
    };
    expect(classicThemeAdapter.project(dialed).seeds.borderRadius).toBeCloseTo(12, 10);
  });
});

describe("classic projects every compiled mode, never just the base", () => {
  for (const slug of SLUGS) {
    it(`emits one projection per compiled mode block for ${slug}`, () => {
      const projection = classicThemeAdapter.project(COMPILED[slug]);
      expect(projection.modes.map((entry) => entry.mode)).toEqual(
        COMPILED[slug].modeBlocks.map((block) => block.mode)
      );
      expect(projection.modes.length).toBeGreaterThan(0);
    });
  }

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
    const dark = compiled.modeBlocks.find((block) => block.mode === "dark");
    const projection = classicThemeAdapter.project(compiled);
    const projected = projection.modes.find((entry) => entry.mode === "dark");
    expect(dark?.cssVariables["--ds-color-text-on-primary"]).toBeUndefined();
    expect(projected?.seeds.colorTextLightSolid).toBe(
      projection.seeds.colorTextLightSolid
    );
  });

  it("keeps every mode projection complete", () => {
    for (const slug of SLUGS) {
      for (const entry of classicThemeAdapter.project(COMPILED[slug]).modes) {
        expect(Object.keys(entry.seeds)).toHaveLength(10);
      }
    }
  });

  it("has no mode projection when the theme compiles no mode block", () => {
    const flat: ThemeCompilation = { ...COMPILED.rottay, modeBlocks: [] };
    expect(classicThemeAdapter.project(flat).modes).toEqual([]);
  });
});

describe("a channel the compile did not produce yields no seed", () => {
  it("drops one colour seed and keeps the rest", () => {
    const { "--ds-color-info": _dropped, ...rest } = COMPILED.rottay.cssVariables;
    const sparse: ThemeCompilation = { ...COMPILED.rottay, cssVariables: rest };
    const { seeds } = classicThemeAdapter.project(sparse);
    expect(seeds.colorInfo).toBeUndefined();
    expect(Object.keys(seeds)).toHaveLength(9);
  });

  it("drops the radius seed when the ramp operand is absent", () => {
    const { "--ds-radius-md-base": _dropped, ...rest } = COMPILED.rottay.cssVariables;
    const sparse: ThemeCompilation = { ...COMPILED.rottay, cssVariables: rest };
    expect(classicThemeAdapter.project(sparse).seeds.borderRadius).toBeUndefined();
  });

  it("throws rather than dropping a PRESENT operand it cannot convert", () => {
    // Absence is absence; a present value antd cannot carry is a different
    // fact, and dropping it would hand antd its own 6px default in silence.
    for (const unreadable of [
      "var(--elsewhere)",
      "50%",
      "calc(10px + 2px)",
      "clamp(4px, 1vw, 12px)",
      "calc(0.5rem / 0)",
      "inherit",
      "10px 4px",
      "",
    ]) {
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

  it("throws when the dial itself is not a finite multiplier", () => {
    const broken: ThemeCompilation = {
      ...COMPILED.rottay,
      cssVariables: {
        ...COMPILED.rottay.cssVariables,
        "--ds-radius-scale": "var(--elsewhere)",
      },
    };
    expect(() => classicThemeAdapter.project(broken)).toThrow(
      /--ds-radius-scale is "var\(--elsewhere\)".*not a finite multiplier/s
    );
  });

  it("projects nothing at all from an empty compile", () => {
    const empty: ThemeCompilation = {
      cssVariables: {},
      modeBlocks: [],
      runtime: { personality: {}, tokenOverrides: {} },
    };
    expect(classicThemeAdapter.project(empty)).toEqual({
      seeds: {},
      tokenOverrides: {},
      modes: [],
    });
  });
});

describe("a real tenant radius reaches antd in the unit the tenant wrote", () => {
  const tenantSeed = (patch: ThemePatch): number =>
    compileTheme(
      resolveTheme(FIRST_PARTY_THEMES.rottay, { origin: "tenant-document", patch }),
      classicThemeAdapter
    ).projection.seeds.borderRadius as number;

  it("carries rem and em, which parseFloat used to read as px", () => {
    expect(tenantSeed({ surfaces: { borderRadius: { md: "0.5rem" } } })).toBe(8);
    expect(tenantSeed({ surfaces: { borderRadius: { md: "1rem" } } })).toBe(16);
    expect(tenantSeed({ surfaces: { borderRadius: { md: "1em" } } })).toBe(16);
    expect(tenantSeed({ surfaces: { borderRadius: { md: "0.75rem" } } })).toBe(12);
  });

  it("carries the px and unitless spellings unchanged", () => {
    expect(tenantSeed({ surfaces: { borderRadius: { md: "10px" } } })).toBe(10);
    expect(tenantSeed({ surfaces: { borderRadius: { md: "3" } } })).toBe(3);
  });

  it("reproduces the authored radius at a non-1 dial, where the operand is dialed", () => {
    // The compiler emits calc(<authored> / <scale>); cancelling it is what makes
    // the seed equal what the browser resolves for the same operands.
    // Scales inside the expressive envelope [0.75, 1.25], so the dial the
    // compiler emits is the one authored and the operand is genuinely dialed.
    for (const [authored, scale, expected] of [
      ["0.5rem", 1.25, 8],
      ["0.5rem", 0.8, 8],
      ["1rem", 1.25, 16],
      ["10px", 0.75, 10],
      ["1em", 1.25, 16],
    ] as const) {
      const patch: ThemePatch = {
        surfaces: { borderRadius: { md: authored }, radiusScale: scale },
      };
      const compiled = compileTheme(
        resolveTheme(FIRST_PARTY_THEMES.rottay, { origin: "tenant-document", patch }),
        classicThemeAdapter
      );
      expect(compiled.cssVariables["--ds-radius-scale"]).toBe(String(scale));
      expect(compiled.cssVariables["--ds-radius-md-base"]).toBe(
        `calc(${authored} / ${scale})`
      );
      expect(compiled.projection.seeds.borderRadius).toBeCloseTo(expected, 10);
    }
  });

  it("gives every compiled mode the same converted radius the base has", () => {
    // The compiler emits no radius operand into a mode block, so each mode
    // projection inherits the base — converted, never re-read with parseFloat.
    const compiled = compileTheme(
      resolveTheme(FIRST_PARTY_THEMES.rottay, {
        origin: "tenant-document",
        patch: { surfaces: { borderRadius: { md: "0.5rem" }, radiusScale: 1.25 } },
      }),
      classicThemeAdapter
    );
    expect(compiled.modeBlocks.length).toBeGreaterThan(0);
    for (const block of compiled.modeBlocks) {
      expect(block.cssVariables["--ds-radius-md-base"]).toBeUndefined();
    }
    for (const entry of compiled.projection.modes) {
      expect(entry.seeds.borderRadius).toBe(8);
    }
  });

  it("uses the mode block's own operand where a mode does override it", () => {
    // Not reachable from a patch today, so it is asserted on the projection
    // path directly: the mode leg must convert, not just the base leg.
    const base = compileTheme(
      resolveTheme(FIRST_PARTY_THEMES.rottay, {
        origin: "tenant-document",
        patch: { surfaces: { borderRadius: { md: "0.5rem" } } },
      }),
      classicThemeAdapter
    );
    const withModeRadius: ThemeCompilation = {
      ...base,
      modeBlocks: [
        {
          mode: "dark",
          colorScheme: "dark",
          cssVariables: { "--ds-radius-md-base": "1.5rem" },
        },
      ],
    };
    const projected = classicThemeAdapter.project(withModeRadius);
    expect(projected.seeds.borderRadius).toBe(8);
    expect(projected.modes[0].mode).toBe("dark");
    expect(projected.modes[0].seeds.borderRadius).toBe(24);
  });

  it("fails loudly when a tenant authors a radius antd cannot seed", () => {
    const compiled = compileTheme(
      resolveTheme(FIRST_PARTY_THEMES.rottay, {
        origin: "tenant-document",
        patch: { surfaces: { borderRadius: { md: "50%" } } },
      }),
      modernThemeAdapter
    );
    expect(compiled.cssVariables["--ds-radius-md-base"]).toBe("50%");
    expect(() => classicThemeAdapter.project(compiled)).toThrow(
      /--ds-radius-md-base is "50%"/
    );
  });
});

describe("adapters project, they never mint a channel name", () => {
  for (const [name, adapter] of shipped) {
    it(`${name} emits no key beginning with --`, () => {
      for (const slug of SLUGS) {
        const projection = adapter.project(COMPILED[slug]);
        const keys = [
          ...Object.keys(projection.seeds),
          ...projection.modes.flatMap((entry) => Object.keys(entry.seeds)),
        ];
        expect(keys.every((key) => !key.startsWith("--"))).toBe(true);
      }
    });

    it(`${name} produces no CSS text`, () => {
      for (const slug of SLUGS) {
        const projection = adapter.project(COMPILED[slug]);
        const values = [
          ...Object.values(projection.seeds),
          ...projection.modes.flatMap((entry) => Object.values(entry.seeds)),
        ];
        for (const value of values) {
          expect(String(value)).not.toContain("{");
          expect(String(value)).not.toContain(";");
        }
      }
    });

    it(`${name} carries an empty tokenOverrides`, () => {
      expect(adapter.project(COMPILED.rottay).tokenOverrides).toEqual({});
    });
  }

  it("modern and rustic project nothing at all, base or mode", () => {
    for (const adapter of [modernThemeAdapter, rusticThemeAdapter]) {
      for (const slug of SLUGS) {
        expect(adapter.project(COMPILED[slug])).toEqual({
          seeds: {},
          tokenOverrides: {},
          modes: [],
        });
      }
    }
  });
});
