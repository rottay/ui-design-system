/**
 * The add-widget catalog on the auto-fit card recipe (WO-FAM-12), Modern only:
 * the Modern engine slots the Grid primitive into the shared anatomy and stamps
 * the root's measured posture; the frozen engines render the catalog and the
 * root exactly as before. The computed proof is in
 * WidgetBoard.catalog-auto-fit.integration.test.tsx.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import React from "react";
import { waitFor } from "@testing-library/react";
import postcss, { type Rule } from "postcss";
import { describe, expect, it } from "vitest";

import { renderWithEngineContext } from "@tests/support/engine";
import type { WidgetBoardItem, WidgetBoardLabels, WidgetBoardProps } from "../contracts";
import ModernWidgetBoard from "../engines/modern";
import ClassicWidgetBoard from "../engines/classic";
import RusticWidgetBoard from "../engines/rustic";

const labels: WidgetBoardLabels = {
  heading: "Decision cockpit",
  customize: "Customize",
  done: "Done",
  addWidget: "Add widget",
  reset: "Reset",
  emptyCatalog: "Empty",
  editHint: "Editing",
  readHint: "Reading",
  move: "Move",
  resize: "Resize",
  remove: "Remove",
};

const item = (id: string, visible: boolean, order: number): WidgetBoardItem => ({
  id,
  size: "md",
  order,
  visible,
  title: id,
  accessibleTitle: id,
  content: <span>{id}</span>,
});

const ITEMS = [item("shown", true, 0), item("hidden-a", false, 1), item("hidden-b", false, 2)];

const open: Partial<WidgetBoardProps> = { editable: true, defaultEditing: true, defaultCatalogOpen: true };

async function catalogGrid(): Promise<HTMLElement> {
  return (await waitFor(() => {
    const node = document.body.querySelector<HTMLElement>("[data-part='catalog-grid']");
    if (!node) throw new Error("catalog grid not found");
    return node;
  })) as HTMLElement;
}

describe("WidgetBoard catalog -- auto-fit Grid on Modern, unchanged on the frozen engines", () => {
  it("Modern: the catalog is the auto-fit Grid at the md preset, with no track of its own", async () => {
    const { unmount } = renderWithEngineContext(
      <ModernWidgetBoard items={ITEMS} labels={labels} {...open} />,
      "modern",
    );
    const grid = await catalogGrid();
    expect(grid.classList.contains("ds-widget-board__catalog-grid")).toBe(true);
    expect(grid.getAttribute("data-component")).toBe("grid");
    expect(grid.getAttribute("data-auto-fit")).toBe("true");
    expect(grid.getAttribute("data-min-item")).toBe("md");
    expect(grid.style.gridTemplateColumns).toBe("");
    expect(grid.getAttribute("style") ?? "").not.toMatch(/272|minmax/);
    expect(grid.querySelectorAll("[data-part='catalog-item']")).toHaveLength(2);
    unmount();
  });

  it("Modern: catalogMinItem and adapt reach the catalog preset", async () => {
    const { unmount } = renderWithEngineContext(
      <ModernWidgetBoard items={ITEMS} labels={labels} {...open} catalogMinItem="lg" />,
      "modern",
    );
    expect((await catalogGrid()).getAttribute("data-min-item")).toBe("lg");
    unmount();

    // A posture delta the app declares outranks the stated preset.
    const every = { catalogMinItem: "xl" } as const;
    const adapted = renderWithEngineContext(
      <ModernWidgetBoard
        items={ITEMS}
        labels={labels}
        {...open}
        catalogMinItem="lg"
        adapt={{ phone: every, tablet: every, desktop: every }}
      />,
      "modern",
    );
    expect((await catalogGrid()).getAttribute("data-min-item")).toBe("xl");
    adapted.unmount();
  });

  it("Modern: the root stamps the posture the shared runtime resolves", async () => {
    const { container, unmount } = renderWithEngineContext(
      <ModernWidgetBoard items={ITEMS} labels={labels} />,
      "modern",
    );
    const root = container.querySelector(".ds-pattern-widget-board[data-part='root']")!;
    expect(root.getAttribute("data-posture")).toMatch(/^(phone|tablet|desktop)( (compact|regular|expanded))?$/);
    unmount();
  });

  it.each([
    ["classic", ClassicWidgetBoard],
    ["rustic", RusticWidgetBoard],
  ] as const)("%s: the catalog stays the plain grid and the root stamps no posture", async (engine, Board) => {
    const { container, unmount } = renderWithEngineContext(
      <Board items={ITEMS} labels={labels} {...open} catalogMinItem="lg" />,
      engine,
    );
    const grid = await catalogGrid();
    expect(grid.tagName).toBe("DIV");
    expect(grid.hasAttribute("data-auto-fit")).toBe(false);
    expect(grid.hasAttribute("data-component")).toBe(false);
    expect(grid.hasAttribute("data-min-item")).toBe(false);
    expect(container.querySelector("[data-part='root']")!.hasAttribute("data-posture")).toBe(false);
    unmount();
  });

  it("keeps the 272px catalog track for the frozen engines only", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/foundation/tokens/css/presentation/components/skin/widget-board/index.css"),
      "utf8",
    );
    const tracks: { selector: string; value: string }[] = [];
    postcss.parse(css).walkRules((rule: Rule) => {
      if (!rule.selector.includes("catalog-grid")) return;
      rule.walkDecls("grid-template-columns", (decl) => {
        tracks.push({ selector: rule.selector.replace(/\s+/g, " "), value: decl.value });
      });
    });
    expect(tracks.length).toBeGreaterThan(0);
    for (const track of tracks) {
      expect(track.selector).toContain(":not([data-auto-fit])");
    }
    // The frozen engines' track: auto-fit over a 272px floor capped at 100%.
    const frozen = tracks.find((track) => track.value.includes("272px"));
    expect(frozen?.value).toMatch(/^repeat\(auto-fit, /);
    expect(frozen?.value).toContain("min(100%, 272px)");
  });
});
