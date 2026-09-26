/**
 * The auto-fit card recipe, as a DOM and skin contract: the engine stamps the
 * decision and leaves the tracks to the skin, and the skin states the recipe
 * through the card footprint channels only. The computed proof (a filled row at
 * 1440px, density moving the footprint, one column at phone width) is in
 * Grid.auto-fit.integration.test.tsx.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import postcss, { type Rule } from "postcss";

import type { GridProps } from "../contracts";
import { ModernGrid } from "../engines/modern";

// The grid is the single author of the footprint: minItem names exactly the four rungs the card deriver produces.
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const sameVocabulary: Same<NonNullable<GridProps["minItem"]>, "sm" | "md" | "lg" | "xl"> = true;

const GRID_SKIN_PATH = "src/foundation/tokens/css/runtime/engines/modern/skin/grid/index.css";
const CARD_SKIN_PATH = "src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css";
const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

/** Every rule of a sheet whose selector contains `marker`, with its declarations. */
function rulesWith(path: string, marker: string): { selector: string; decls: Record<string, string> }[] {
  const out: { selector: string; decls: Record<string, string> }[] = [];
  postcss.parse(read(path)).walkRules((rule: Rule) => {
    if (!rule.selector.includes(marker)) return;
    const decls: Record<string, string> = {};
    rule.walkDecls((decl) => {
      decls[decl.prop] = decl.value.replace(/\s+/g, " ").trim();
    });
    out.push({ selector: rule.selector.replace(/\s+/g, " "), decls });
  });
  return out;
}

describe("Grid autoFit -- the engine stamps, the skin lays out", () => {
  it("names the four footprint rungs", () => {
    expect(sameVocabulary).toBe(true);
  });

  it("stamps the decision and writes no inline track, even with columns or a minimum", () => {
    const { getByTestId } = render(
      <ModernGrid data-testid="grid" autoFit minItem="lg" columns={4} minColumnWidth={200}>
        <div />
      </ModernGrid>
    );
    const grid = getByTestId("grid");
    expect(grid).toHaveAttribute("data-auto-fit", "true");
    expect(grid).toHaveAttribute("data-min-item", "lg");
    expect(grid.style.gridTemplateColumns).toBe("");
    expect(grid.getAttribute("style") ?? "").not.toContain("--ds-card-scale");
    // The props are the engine's, never DOM attributes.
    expect(grid.hasAttribute("autofit")).toBe(false);
    expect(grid.hasAttribute("minitem")).toBe(false);
  });

  it("keeps an explicit templateColumns sovereign over autoFit", () => {
    const { getByTestId } = render(
      <ModernGrid data-testid="grid" autoFit templateColumns="200px 1fr">
        <div />
      </ModernGrid>
    );
    expect(getByTestId("grid").style.gridTemplateColumns).toBe("200px 1fr");
  });

  it("changes nothing for a grid that does not opt in", () => {
    const { getByTestId } = render(
      <ModernGrid data-testid="grid" columns={3} minItem="lg">
        <div />
      </ModernGrid>
    );
    const grid = getByTestId("grid");
    expect(grid.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    expect(grid.hasAttribute("data-auto-fit")).toBe(false);
    expect(grid.hasAttribute("data-min-item")).toBe(false);
  });

  it("states the recipe once, through the footprint channels, and one column in the compact posture", () => {
    const recipe = rulesWith(GRID_SKIN_PATH, "[data-auto-fit='true']");
    const base = recipe.filter((rule) => !rule.selector.includes("data-min-item") && !rule.selector.includes("data-posture"));
    expect(base).toHaveLength(1);
    expect(base[0].decls["grid-template-columns"]).toBe(
      "repeat( auto-fit, minmax( min( 100%, calc( var(--ds-card-min-inline-size, calc(16rem * var(--ds-density-effective-scale, 1) * var(--ds-type-scale, 1))) * var(--ds-card-scale, var(--ds-card-scale-md, 1)) ) ), 1fr ) )"
    );
    const compact = recipe.filter((rule) => rule.selector.includes("[data-posture~='compact']"));
    expect(compact.map((rule) => rule.decls)).toEqual([{ "grid-template-columns": "100%" }]);
  });

  it("maps each minItem preset to --ds-card-scale and nothing else", () => {
    const presets = rulesWith(GRID_SKIN_PATH, "[data-min-item=");
    expect(presets.map((rule) => rule.decls)).toEqual(
      ["sm", "md", "lg", "xl"].map((step) => ({
        "--ds-card-scale": `var(--ds-card-scale-${step}, ${{ sm: "calc(var(--ds-card-scale-md, 1) * 0.875)", md: "1", lg: "calc(var(--ds-card-scale-md, 1) * 1.25)", xl: "calc(var(--ds-card-scale-md, 1) * 1.5)" }[step]})`,
      }))
    );
  });

  it("leaves no minmax( without a --ds- channel in the two skins this recipe touches", () => {
    for (const path of [GRID_SKIN_PATH, CARD_SKIN_PATH]) {
      const css = read(path).replace(/\/\*[\s\S]*?\*\//g, "");
      const bare = [...css.matchAll(/minmax\(/g)].filter((match) => {
        let depth = 0;
        let end = match.index! + "minmax".length;
        for (; end < css.length; end += 1) {
          if (css[end] === "(") depth += 1;
          else if (css[end] === ")" && --depth === 0) break;
        }
        return !css.slice(match.index, end).includes("var(--ds-");
      });
      expect({ path, bare: bare.length }).toEqual({ path, bare: 0 });
    }
  });
});
