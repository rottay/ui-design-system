/**
 * The add-widget catalog in a real browser (WO-FAM-12). The catalog Sheet is
 * portalled and absent from the server markup, so the scene is the element the
 * Modern slot renders -- the real ModernGrid with the catalog's class, part and
 * preset (WidgetBoard.catalog-auto-fit.test.tsx pins that the engine renders
 * exactly this) -- inside the catalog surface, beside the frozen engines' plain
 * catalog grid as the control that keeps its 272px track.
 */
import React from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { beforeAll, describe, expect, it } from "vitest";

import {
  postureAttribute,
  resolveContainerPosture,
} from "@/foundation/contracts/kernel/adaptation/foundation";
import { DEFAULT_RESPONSIVE_POSTURE } from "@/foundation/tokens/ts/presentation/responsive-postures";
import {
  FIRST_PARTY_VERTICALS as VERTICALS,
  measureArms,
  type ProbeReadings,
  type ProbeTarget,
  type ProbeVertical,
} from "@tests/support/family-causality";
import { ModernGrid } from "../../../../primitives/layout/grid/engines/modern";

const items = () =>
  [1, 2, 3].map((index) => (
    <article key={index} className="ds-widget-board__catalog-item" data-part="catalog-item">
      <h4 className="ds-widget-board__catalog-item-title">Widget {index}</h4>
    </article>
  ));

async function modernCatalog(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <ModernGrid autoFit minItem="md" className="ds-widget-board__catalog-grid" data-part="catalog-grid">
      {items()}
    </ModernGrid>,
  );
  let html = "";
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const FROZEN = `<div class="ds-widget-board__catalog-grid" data-part="catalog-grid">${[1, 2, 3]
  .map((index) => `<article class="ds-widget-board__catalog-item" data-part="catalog-item"><h4>Widget ${index}</h4></article>`)
  .join("")}</div>`;

const surface = (id: string, width: string, inner: string) =>
  `<section id="${id}" class="ds-widget-board__catalog-surface" style="inline-size:${width}">${inner}</section>`;

const COMPACT = postureAttribute({ viewport: "phone", container: resolveContainerPosture(600, DEFAULT_RESPONSIVE_POSTURE) });

function targets(dir: "ltr" | "rtl"): ProbeTarget[] {
  const grid = (id: string) => `#${id} [data-part='catalog-grid']`;
  const card = (id: string, index: number) => `${grid(id)} > [data-part='catalog-item']:nth-child(${index})`;
  const out: ProbeTarget[] = [
    { id: "wide|left", selector: grid("wide"), property: "@rect.left", dir },
    { id: "wide|right", selector: grid("wide"), property: "@rect.right", dir },
    { id: "frozen|cols", selector: grid("frozen"), property: "grid-template-columns", dir },
    { id: "wide|cols", selector: grid("wide"), property: "grid-template-columns", dir },
    { id: "wide|gap", selector: grid("wide"), property: "column-gap", dir },
  ];
  for (const index of [1, 2, 3]) {
    for (const key of ["left", "right", "top"] as const) {
      out.push({ id: `wide|${index}|${key}`, selector: card("wide", index), property: `@rect.${key}`, dir });
    }
    out.push({ id: `narrow|${index}|top`, selector: card("narrow", index), property: "@rect.top", dir });
    out.push({
      id: `compact|${index}|top`,
      selector: card("compact", index),
      property: "@rect.top",
      dir,
      attributes: { "data-posture": COMPACT },
      attributesOn: grid("compact"),
    });
  }
  return out;
}

const readings: Partial<Record<string, ProbeReadings[string]>> = {};

describe("WidgetBoard catalog on the auto-fit recipe, in Chromium", () => {
  beforeAll(async () => {
    const modern = await modernCatalog();
    const markup =
      surface("wide", "900px", modern) +
      surface("narrow", "600px", modern) +
      surface("compact", "600px", modern) +
      surface("frozen", "900px", FROZEN);
    for (const vertical of VERTICALS) {
      for (const dir of ["ltr", "rtl"] as const) {
        readings[`${vertical}|${dir}`] = (
          await measureArms({ vertical: vertical as ProbeVertical, markup, arms: { base: {} }, targets: targets(dir) })
        ).base;
      }
    }
  }, 240_000);

  it("fills the row with no orphan gap, in every vertical and direction", () => {
    expect(COMPACT).toBe("phone compact");
    for (const [where, r] of Object.entries(readings)) {
      const n = (id: string) => Number(r![id]);
      expect({ where, oneRow: n("wide|1|top") === n("wide|2|top") && n("wide|2|top") === n("wide|3|top") }).toEqual({
        where,
        oneRow: true,
      });
      // The live tracks (empty ones collapse to 0px) plus their gaps span the whole grid.
      const tracks = r!["wide|cols"]!.split(" ").map(parseFloat).filter((width) => width > 0);
      const span = tracks.reduce((sum, width) => sum + width, 0) + parseFloat(r!["wide|gap"]!) * (tracks.length - 1);
      expect({ where, tracks: tracks.length, filled: Math.abs(span - (n("wide|right") - n("wide|left"))) <= 1 }).toEqual({
        where,
        tracks: 3,
        filled: true,
      });
    }
  });

  it("takes one column under the compact posture the runtime measures, where the width alone fits two", () => {
    for (const [where, r] of Object.entries(readings)) {
      const n = (id: string) => Number(r![id]);
      expect({ where, twoFit: n("narrow|1|top") === n("narrow|2|top") }).toEqual({ where, twoFit: true });
      expect({ where, stacked: n("compact|1|top") < n("compact|2|top") && n("compact|2|top") < n("compact|3|top") }).toEqual({
        where,
        stacked: true,
      });
    }
  });

  it("keeps the frozen engines' 272px track on the plain catalog grid", () => {
    for (const [where, r] of Object.entries(readings)) {
      const tracks = r!["frozen|cols"]!.split(" ").filter((track) => track !== "0px").map(parseFloat);
      expect({ where, atLeast272: tracks.length > 0 && tracks.every((width) => width >= 272) }).toEqual({
        where,
        atLeast272: true,
      });
    }
  });
});
