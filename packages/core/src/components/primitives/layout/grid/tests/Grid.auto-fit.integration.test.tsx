/**
 * The auto-fit card recipe in a real browser, through the productive door: a
 * larger preset absorbs the free space (the row is always filled, fewer and
 * wider cards), density and the type scale move the footprint while rhythm
 * moves only the gap, and a phone-wide container -- or the compact posture of
 * the responsive contract -- takes one column.
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
import {
  FIRST_PARTY_VERTICALS as VERTICALS,
  measureArms,
  type ProbeReadings,
  type ProbeTarget,
  type ProbeVertical,
} from "@tests/support/family-causality";
import ModernCard from "../../../display/card/engines/modern";
import type { CardScale } from "../../../display/card/contracts";
import { ModernGrid } from "../engines/modern";

const TENANT: TenantConfig = {
  slug: "grid-auto-fit",
  name: "Grid auto-fit",
  theme: "base",
  locale: "en",
  fallbackLocale: "en",
  plan: "enterprise",
  features: [],
  branding: { companyName: "Grid auto-fit" },
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

const cards = (count: number, scale?: CardScale) =>
  Array.from({ length: count }, (_, index) => (
    <ModernCard key={index} scale={scale} title={`Card ${index + 1}`}>
      Body
    </ModernCard>
  ));

/** One probe box per scene; the grid inside fills the box. */
const box = (probe: string, width: string, grid: React.ReactElement) => (
  <div data-probe={probe} style={{ inlineSize: width }}>
    {grid}
  </div>
);

const SCENES = (
  <>
    {box("lg3", "1440px", <ModernGrid autoFit minItem="lg" gap="md">{cards(3, "lg")}</ModernGrid>)}
    {box("md8", "1440px", <ModernGrid autoFit minItem="md" gap="md">{cards(8, "md")}</ModernGrid>)}
    {box("lg8", "1440px", <ModernGrid autoFit minItem="lg" gap="md">{cards(8, "lg")}</ModernGrid>)}
    {box("phone", "375px", <ModernGrid autoFit gap="md">{cards(3)}</ModernGrid>)}
    {box("posture", "600px", <ModernGrid autoFit minItem="sm" gap="md">{cards(3, "sm")}</ModernGrid>)}
    <div data-probe="footprint" style={{ inlineSize: "var(--ds-card-min-inline-size)" }} />
  </>
);

const GRID = "[data-component='grid']";
const card = (probe: string, index: number) => `[data-probe='${probe}'] ${GRID} > .ds-card:nth-child(${index})`;

function rectTargets(probe: string, count: number, extra: Partial<ProbeTarget> = {}, suffix = ""): ProbeTarget[] {
  const out: ProbeTarget[] = [
    { id: `${probe}${suffix}|grid|left`, selector: `[data-probe='${probe}'] ${GRID}`, property: "@rect.left", ...extra },
    { id: `${probe}${suffix}|grid|right`, selector: `[data-probe='${probe}'] ${GRID}`, property: "@rect.right", ...extra },
    { id: `${probe}${suffix}|gap`, selector: `[data-probe='${probe}'] ${GRID}`, property: "column-gap", ...extra },
  ];
  for (let index = 1; index <= count; index += 1) {
    for (const key of ["left", "right", "top"] as const) {
      out.push({ id: `${probe}${suffix}|${index}|${key}`, selector: card(probe, index), property: `@rect.${key}`, ...extra });
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

const TARGETS: ProbeTarget[] = [
  ...rectTargets("lg3", 3),
  ...rectTargets("md8", 8),
  ...rectTargets("lg8", 8),
  ...rectTargets("phone", 3),
  ...rectTargets("phone", 3, stamped("phone", 375), "@measured"),
  ...rectTargets("posture", 3),
  ...rectTargets("posture", 3, stamped("posture", 600), "@measured"),
  { id: "footprint", selector: "[data-probe='footprint']", property: "@rect.width" },
];

const ARMS = {
  base: {},
  compact: { "density.mode": "compact" },
  normal: { "density.mode": "normal" },
  spacious: { "density.mode": "spacious" },
  typeUp: { "typography.scale": 1.08 },
  airy: { "spacing.rhythm": "airy" },
};

const readings: Partial<Record<ProbeVertical, ProbeReadings>> = {};
const n = (vertical: ProbeVertical, arm: keyof typeof ARMS, id: string) => parseFloat(readings[vertical]![arm][id]!);

/** Columns in the first row: how many cards share the first card's top. */
function columns(vertical: ProbeVertical, arm: keyof typeof ARMS, probe: string, count: number): number {
  const top = n(vertical, arm, `${probe}|1|top`);
  return Array.from({ length: count }, (_, i) => n(vertical, arm, `${probe}|${i + 1}|top`)).filter((t) => t === top).length;
}

/** The last card of the first row ends on the grid's own edge: no orphan gap. */
function rowFilled(vertical: ProbeVertical, arm: keyof typeof ARMS, probe: string, count: number): boolean {
  const cols = columns(vertical, arm, probe, count);
  const firstLeft = n(vertical, arm, `${probe}|1|left`);
  const lastRight = n(vertical, arm, `${probe}|${cols}|right`);
  return (
    Math.abs(firstLeft - n(vertical, arm, `${probe}|grid|left`)) <= 1 &&
    Math.abs(lastRight - n(vertical, arm, `${probe}|grid|right`)) <= 1
  );
}

describe("Grid autoFit in Chromium", () => {
  beforeAll(async () => {
    const markup = await serverMarkup(SCENES);
    for (const vertical of VERTICALS) {
      readings[vertical] = await measureArms({ vertical, markup, arms: ARMS, targets: TARGETS });
    }
  }, 240_000);

  it("fills the row with three lg cards at 1440px: one row, no orphan gap", () => {
    for (const vertical of VERTICALS) {
      expect({ vertical, columns: columns(vertical, "base", "lg3", 3) }).toEqual({ vertical, columns: 3 });
      expect({ vertical, filled: rowFilled(vertical, "base", "lg3", 3) }).toEqual({ vertical, filled: true });
    }
  });

  it("absorbs the free space: a larger preset lays fewer, wider cards and still fills the row", () => {
    for (const vertical of VERTICALS) {
      const md = columns(vertical, "base", "md8", 8);
      const lg = columns(vertical, "base", "lg8", 8);
      expect({ vertical, fewer: lg < md }).toEqual({ vertical, fewer: true });
      const width = (probe: string) => n(vertical, "base", `${probe}|1|right`) - n(vertical, "base", `${probe}|1|left`);
      expect({ vertical, wider: width("lg8") > width("md8") }).toEqual({ vertical, wider: true });
      expect({ vertical, md: rowFilled(vertical, "base", "md8", 8), lg: rowFilled(vertical, "base", "lg8", 8) }).toEqual({
        vertical,
        md: true,
        lg: true,
      });
    }
  });

  it("density.mode moves --ds-card-min-inline-size: compact reduces it, spacious raises it", () => {
    for (const vertical of VERTICALS) {
      const base = n(vertical, "base", "footprint");
      const compact = n(vertical, "compact", "footprint");
      const spacious = n(vertical, "spacious", "footprint");
      expect({ vertical, spaciousAbove: spacious > base }).toEqual({ vertical, spaciousAbove: true });
      // bithire's own baseline IS compact, so the compact arm restates it; the
      // reduction is then measured from its normal posture.
      const reference = vertical === "bithire" ? n(vertical, "normal", "footprint") : base;
      expect({ vertical, compactBelow: compact < reference }).toEqual({ vertical, compactBelow: true });
    }
  });

  it("the type scale moves the footprint; the rhythm dial moves only the gap", () => {
    for (const vertical of VERTICALS) {
      expect({ vertical, typeUp: n(vertical, "typeUp", "footprint") > n(vertical, "base", "footprint") }).toEqual({
        vertical,
        typeUp: true,
      });
      expect({ vertical, rhythmFootprint: n(vertical, "airy", "footprint") }).toEqual({
        vertical,
        rhythmFootprint: n(vertical, "base", "footprint"),
      });
      expect({ vertical, rhythmGap: n(vertical, "airy", "lg3|gap") > n(vertical, "base", "lg3|gap") }).toEqual({
        vertical,
        rhythmGap: true,
      });
    }
  });

  it("takes one column at phone width, under the posture the runtime measures there", () => {
    expect(measuredPosture(375)).toBe("phone compact");
    for (const vertical of VERTICALS) {
      expect({ vertical, columns: columns(vertical, "base", "phone@measured", 3) }).toEqual({ vertical, columns: 1 });
      expect({ vertical, filled: rowFilled(vertical, "base", "phone@measured", 3) }).toEqual({ vertical, filled: true });
    }
  });

  it("the compact posture of the responsive contract forces one column where the width alone fits two", () => {
    expect(measuredPosture(600)).toBe("phone compact");
    for (const vertical of VERTICALS) {
      const control = columns(vertical, "base", "posture", 3);
      expect({ vertical, control: control > 1 }).toEqual({ vertical, control: true });
      const top = n(vertical, "base", "posture@measured|1|top");
      const single = [2, 3].every((i) => n(vertical, "base", `posture@measured|${i}|top`) > top);
      expect({ vertical, single }).toEqual({ vertical, single: true });
      expect(Math.abs(n(vertical, "base", "posture@measured|1|right") - n(vertical, "base", "posture@measured|grid|right"))).toBeLessThanOrEqual(1);
    }
  });
});
