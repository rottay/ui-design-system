/**
 * Exhaustive proof that no open string leaf of a Theme can escape its rule.
 *
 * `Theme` declares most of its string leaves open, so the option domains in
 * `themes/iso/schema` correctly refuse nothing at the great majority of them
 * and a brace-laden value reaches `compileTheme` intact. This sweep patches
 * EVERY string leaf of a first-party theme with a rule-closing value, one leaf
 * at a time, through the public `resolveTheme` door, and asserts that none of
 * them reaches assembled CSS text or opens a selector the scope does not own.
 *
 * The compiled map is measured too, and deliberately still carries the hostile
 * strings: the compiler is not a sanitizer, the emission grammar is. That count
 * is asserted to stay high so the two zeroes below can never pass vacuously.
 */

import { describe, expect, it } from "vitest";

import { FIRST_PARTY_THEMES } from "@/foundation/tokens/ts/presentation/brand-themes";

import { compileTheme } from "../../lowering";
import { resolveTheme } from "../../resolution";
import { resolveAdapter } from "../../../presentation/adapters";
import { containerScope, emitThemeCss } from "..";

const ESCAPE = "#000; } body { display: none; } .escaped {";
const SCOPE = ".sweep-probe";

function stringLeafPaths(value: unknown, prefix: string[] = []): string[][] {
  if (typeof value === "string") return [prefix];
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    stringLeafPaths(child, [...prefix, key])
  );
}

/** A patch that sets exactly one leaf, spelled the way the merge keys it. */
function patchFor(path: readonly string[]): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  let node = root;
  for (let index = 0; index < path.length - 1; index += 1) {
    node[path[index]!] = {};
    node = node[path[index]!] as Record<string, unknown>;
  }
  node[path[path.length - 1]!] = ESCAPE;
  return root;
}

describe("no open string leaf can escape the preview rule", () => {
  it("sweeps every string leaf of a first-party theme through the public door", () => {
    const theme = FIRST_PARTY_THEMES.bithire;
    const modern = resolveAdapter("modern");
    const paths = stringLeafPaths(theme).filter(
      (path) => path[0] !== "id" && path[0] !== "name"
    );

    let refusedAtResolution = 0;
    let carriedIntoCompiledMap = 0;
    let carriedIntoEmittedCss = 0;
    let foreignSelectors = 0;

    for (const path of paths) {
      let compiled;
      try {
        compiled = compileTheme(
          resolveTheme(theme, { origin: "preview", patch: patchFor(path) as never }),
          modern
        );
      } catch {
        refusedAtResolution += 1;
        continue;
      }

      const maps = [
        compiled.cssVariables,
        ...(compiled.modeBlocks ?? []).map((block) => block.cssVariables),
      ];
      if (
        maps.some((map) =>
          Object.values(map).some(
            (value) => typeof value === "string" && value.includes("} body {")
          )
        )
      ) {
        carriedIntoCompiledMap += 1;
      }

      const css = emitThemeCss(compiled, containerScope(SCOPE));
      if (css.includes("} body {")) carriedIntoEmittedCss += 1;
      const selectors = [...css.matchAll(/(^|\})\s*([^{}]+)\{/gu)].map((match) =>
        match[2]!.trim()
      );
      if (selectors.some((selector) => !selector.startsWith(SCOPE))) foreignSelectors += 1;
    }

    // Non-vacuity: the sweep really is delivering hostile values to the
    // emitter. The compiler is not a sanitizer and is not asked to be one.
    expect(paths.length).toBeGreaterThan(1400);
    expect(refusedAtResolution).toBeGreaterThan(0);
    expect(carriedIntoCompiledMap).toBeGreaterThan(1000);

    // The guarantee.
    expect(carriedIntoEmittedCss).toBe(0);
    expect(foreignSelectors).toBe(0);
  }, 60000);
});
