/**
 * The Modern stats grid on the adaptive layout kit's recipe (WO-FAM-12), in a
 * real browser, through the productive door: the root IS the auto-fit Grid,
 * so the tracks follow the card footprint channels, the row is always filled,
 * the container's compact posture takes one column, and the engine makes no
 * viewport decision of its own. Every reading is taken in the three verticals
 * and in both writing directions.
 *
 * The LEGACY control renders the same engine with the track list the retired
 * viewport ladder produced, read from the frozen helper that classic and rustic
 * still call -- so the paint delta the recipe introduces is measured against
 * the exact old geometry, never a hand-copied literal.
 */
import React from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { beforeAll, describe, expect, it } from "vitest";

import {
  postureAttribute,
  resolveContainerPosture,
} from "@/foundation/contracts/kernel/adaptation/foundation";
import { DEFAULT_RESPONSIVE_POSTURE } from "@/foundation/tokens/ts/presentation/responsive-postures";
import { DesignSystemProvider } from "@/infrastructure/runtime/bootstrap";
import { firstPartyEngineVisual } from "@/infrastructure/compilers/runtime/theme";
import type { TenantConfig } from "@/foundation/contracts";
import type { StatDef } from "@/foundation/contracts/runtime/components/patterns/core";
import {
  FIRST_PARTY_VERTICALS as VERTICALS,
  measureArms,
  type ProbeReadings,
  type ProbeTarget,
  type ProbeVertical,
} from "@tests/support/family-causality";
import ModernStatsGrid from "../engines/modern";
import { resolveStatsGridColumns } from "../foundation/layout";

const TENANT: TenantConfig = {
  slug: "stats-grid-auto-fit",
  name: "Stats grid auto-fit",
  theme: "base",
  locale: "en",
  fallbackLocale: "en",
  plan: "enterprise",
  features: [],
  branding: { companyName: "Stats grid auto-fit" },
};

async function serverMarkup(node: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual("rottay", "modern")}
      skipCssLoading
      ssrViewport="desktop"
    >
      {node}
    </DesignSystemProvider>
  );
  let html = "";
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const stats = (count: number): StatDef[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `stat-${index + 1}`,
    label: `Metric ${index + 1}`,
    value: 1000 + index,
    change: 4,
    changeType: "increase" as const,
  }));

/** The retired Modern root geometry: the helper's desktop track list and the old 1rem gap. */
const legacy = (columns: number) => ({
  gridTemplateColumns: resolveStatsGridColumns(columns, "desktop"),
  gap: "1rem",
});

/** One probe box per scene; the grid inside fills the box. */
const box = (probe: string, width: string, grid: React.ReactElement) => (
  <div data-probe={probe} style={{ inlineSize: width }}>
    {grid}
  </div>
);

/**
 * One server render per scene: the provider streams every boundary after the
 * first as a deferred template, which a static page never swaps in.
 */
const SCENES = [
  box("d4", "1280px", <ModernStatsGrid stats={stats(4)} columns={4} />),
  box("d4-legacy", "1280px", <ModernStatsGrid stats={stats(4)} columns={4} style={legacy(4)} />),
  box("d3", "1440px", <ModernStatsGrid stats={stats(3)} columns={3} />),
  box("d3-legacy", "1440px", <ModernStatsGrid stats={stats(3)} columns={3} style={legacy(3)} />),
  box("d6", "1440px", <ModernStatsGrid stats={stats(6)} columns={4} />),
  box("d6-lg", "1440px", <ModernStatsGrid stats={stats(6)} columns={4} minItem="lg" />),
  box("tablet", "800px", <ModernStatsGrid stats={stats(4)} columns={4} />),
  box("phone", "390px", <ModernStatsGrid stats={stats(3)} columns={4} />),
  box("posture", "600px", <ModernStatsGrid stats={stats(3)} columns={4} minItem="sm" />),
];

const GRID = "[data-component='grid'].ds-pattern-stats-grid";
const card = (probe: string, index: number) =>
  `[data-probe='${probe}'] ${GRID} > [data-part='card']:nth-child(${index})`;

const COUNTS: Record<string, number> = {
  d4: 4,
  "d4-legacy": 4,
  d3: 3,
  "d3-legacy": 3,
  d6: 6,
  "d6-lg": 6,
  tablet: 4,
  phone: 3,
  posture: 3,
};

function rectTargets(
  probe: string,
  dir: "ltr" | "rtl",
  extra: Partial<ProbeTarget> = {},
  suffix = ""
): ProbeTarget[] {
  const id = `${probe}${suffix}@${dir}`;
  const out: ProbeTarget[] = [
    { id: `${id}|grid|left`, selector: `[data-probe='${probe}'] ${GRID}`, property: "@rect.left", dir, ...extra },
    { id: `${id}|grid|right`, selector: `[data-probe='${probe}'] ${GRID}`, property: "@rect.right", dir, ...extra },
    { id: `${id}|gap`, selector: `[data-probe='${probe}'] ${GRID}`, property: "column-gap", dir, ...extra },
  ];
  for (let index = 1; index <= COUNTS[probe]!; index += 1) {
    for (const key of ["left", "right", "top"] as const) {
      out.push({ id: `${id}|${index}|${key}`, selector: card(probe, index), property: `@rect.${key}`, dir, ...extra });
    }
  }
  return out;
}

/** The stamp the adaptation runtime writes once it has measured the box, on the default ladder. */
const measuredPosture = (widthPx: number) =>
  postureAttribute({ viewport: "phone", container: resolveContainerPosture(widthPx, DEFAULT_RESPONSIVE_POSTURE) });
const stamped = (probe: string, widthPx: number): Partial<ProbeTarget> => ({
  attributes: { "data-posture": measuredPosture(widthPx) },
  attributesOn: `[data-probe='${probe}'] ${GRID}`,
});

const DIRS = ["ltr", "rtl"] as const;
const TARGETS: ProbeTarget[] = DIRS.flatMap((dir) => [
  ...["d4", "d4-legacy", "d3", "d3-legacy", "d6", "d6-lg", "tablet", "phone", "posture"].flatMap((probe) =>
    rectTargets(probe, dir)
  ),
  ...rectTargets("phone", dir, stamped("phone", 390), "#measured"),
  ...rectTargets("posture", dir, stamped("posture", 600), "#measured"),
]);

const readings: Partial<Record<ProbeVertical, ProbeReadings>> = {};
const n = (vertical: ProbeVertical, id: string) => parseFloat(readings[vertical]!.base[id]!);

/** Columns in the first row: how many cards share the first card's top. */
function columns(vertical: ProbeVertical, scene: string, count: number): number {
  const top = n(vertical, `${scene}|1|top`);
  return Array.from({ length: count }, (_, i) => n(vertical, `${scene}|${i + 1}|top`)).filter((t) => t === top).length;
}

/** The first row spans the grid edge to edge: no orphan gap, in either direction. */
function rowFilled(vertical: ProbeVertical, scene: string, count: number): boolean {
  const cols = columns(vertical, scene, count);
  const edges = Array.from({ length: cols }, (_, i) => [
    n(vertical, `${scene}|${i + 1}|left`),
    n(vertical, `${scene}|${i + 1}|right`),
  ]);
  const start = Math.min(...edges.map(([left]) => left!));
  const end = Math.max(...edges.map(([, right]) => right!));
  return (
    Math.abs(start - n(vertical, `${scene}|grid|left`)) <= 1 &&
    Math.abs(end - n(vertical, `${scene}|grid|right`)) <= 1
  );
}

/** Every card's inline edges, in reading order (the block axis carries each scene's page offset). */
const inlineEdges = (vertical: ProbeVertical, scene: string, count: number) =>
  Array.from({ length: count }, (_, i) =>
    (["left", "right"] as const).map((key) => n(vertical, `${scene}|${i + 1}|${key}`))
  );

const gapOf = (vertical: ProbeVertical, scene: string) => readings[vertical]!.base[`${scene}|gap`];

describe("Modern PatternStatsGrid on the auto-fit recipe, in Chromium", () => {
  beforeAll(async () => {
    const markup = (await Promise.all(SCENES.map((scene) => serverMarkup(scene)))).join("");
    for (const vertical of VERTICALS) {
      readings[vertical] = await measureArms({ vertical, markup, arms: { base: {} }, targets: TARGETS });
    }
  }, 240_000);

  it("fills the first row edge to edge in every scene, in both directions", () => {
    for (const vertical of VERTICALS) {
      for (const dir of DIRS) {
        for (const [scene, count] of Object.entries(COUNTS)) {
          expect({ vertical, dir, scene, filled: rowFilled(vertical, `${scene}@${dir}`, count) }).toEqual({
            vertical,
            dir,
            scene,
            filled: true,
          });
        }
      }
    }
  });

  it("lays the first card at the inline start: left in ltr, right in rtl", () => {
    for (const vertical of VERTICALS) {
      expect({ vertical, ltr: n(vertical, "d4@ltr|1|left") < n(vertical, "d4@ltr|2|left") }).toEqual({ vertical, ltr: true });
      expect({ vertical, rtl: n(vertical, "d4@rtl|1|left") > n(vertical, "d4@rtl|2|left") }).toEqual({ vertical, rtl: true });
    }
  });

  it("agrees with the retired ladder wherever the ladder's columns fit: same tracks at 1280 and 1440", () => {
    for (const vertical of VERTICALS) {
      for (const dir of DIRS) {
        for (const [scene, count] of [["d4", 4], ["d3", 3]] as const) {
          const now = `${scene}@${dir}`;
          const before = `${scene}-legacy@${dir}`;
          expect({ vertical, dir, scene, columns: columns(vertical, now, count) }).toEqual({
            vertical,
            dir,
            scene,
            columns: columns(vertical, before, count),
          });
          // Where the tenant's grid rung resolves to the retired 1rem, the paint is byte-equal.
          if (gapOf(vertical, now) === gapOf(vertical, before)) {
            expect({ vertical, dir, scene, edges: inlineEdges(vertical, now, count) }).toEqual({
              vertical,
              dir,
              scene,
              edges: inlineEdges(vertical, before, count),
            });
          }
        }
      }
    }
    // Measured: rottay and evnto resolve the rung to the retired 1rem, so their
    // default paint is byte-equal; bithire's compact rhythm tightens its rung.
    for (const vertical of ["rottay", "evnto"] as const) {
      expect({ vertical, gap: gapOf(vertical, "d4@ltr") }).toEqual({ vertical, gap: gapOf(vertical, "d4-legacy@ltr") });
    }
    expect(parseFloat(gapOf("bithire", "d4@ltr")!)).toBeLessThan(parseFloat(gapOf("bithire", "d4-legacy@ltr")!));
  });

  it("makes no viewport decision: at 800px the footprint, not the tablet ceiling of two, sets the tracks", () => {
    for (const vertical of VERTICALS) {
      expect({ vertical, columns: columns(vertical, "tablet@ltr", 4) > 2 }).toEqual({ vertical, columns: true });
    }
  });

  it("minItem reaches the grid: a larger preset never lays more columns, and lays fewer where the row has room", () => {
    for (const vertical of VERTICALS) {
      const md = columns(vertical, "d6@ltr", 6);
      const lg = columns(vertical, "d6-lg@ltr", 6);
      expect({ vertical, notMore: lg <= md }).toEqual({ vertical, notMore: true });
    }
    for (const vertical of ["rottay", "evnto"] as const) {
      expect({ vertical, fewer: columns(vertical, "d6-lg@ltr", 6) < columns(vertical, "d6@ltr", 6) }).toEqual({
        vertical,
        fewer: true,
      });
    }
  });

  it("takes one column under the posture the runtime measures at phone width", () => {
    expect(measuredPosture(390)).toBe("phone compact");
    for (const vertical of VERTICALS) {
      for (const dir of DIRS) {
        expect({ vertical, dir, columns: columns(vertical, `phone#measured@${dir}`, 3) }).toEqual({ vertical, dir, columns: 1 });
      }
    }
  });

  it("the compact posture forces one column where the width alone fits more", () => {
    expect(measuredPosture(600)).toBe("phone compact");
    for (const vertical of VERTICALS) {
      for (const dir of DIRS) {
        expect({ vertical, dir, control: columns(vertical, `posture@${dir}`, 3) > 1 }).toEqual({ vertical, dir, control: true });
        expect({ vertical, dir, columns: columns(vertical, `posture#measured@${dir}`, 3) }).toEqual({ vertical, dir, columns: 1 });
      }
    }
  });
});
