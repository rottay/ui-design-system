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


import { compileTheme } from "../../../lowering";
import { resolveAdapter } from "../../../../presentation/adapters";
import { containerScope, emitThemeCss } from "../..";
import { FIRST_PARTY_BASELINES, resolveFirstParty } from "@tests/support/theme-lowering";

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
  /**
   * D6-2c-ii (2026-09-15): tenant-document compiles over neutral + preset, so a
   * first-party vertical no longer AUTHORS a dense theme -- its baseline is the
   * neutral foundation plus ~25 preset decisions. The swept corpus therefore
   * moves 1423 -> 48 string leaves on bithire (rottay and evnto author 20 each,
   * and every one of theirs is refused at resolution or carries nothing, so
   * bithire is the only vertical whose leaves still reach the emitter at all).
   *
   * The GUARANTEE is unchanged and is now asserted on all three verticals
   * rather than one. The non-vacuity floors are re-pinned to the measured
   * corpus and stay decrease-only, so the sweep can grow back with the
   * derivation lane but can never quietly shrink to nothing.
   *
   * REPORTED, not hidden: this is a real loss of coverage on a security
   * property. The emitter is still proven, but over 12 hostile values that
   * reach it instead of more than 1000.
   */
  const MEASURED = {
    leaves: 88,
    refusedAtResolution: 64,
    carriedIntoCompiledMap: 12,
  } as const;

  it("sweeps every string leaf of a first-party theme through the public door", () => {
    const modern = resolveAdapter("modern");

    let totalLeaves = 0;
    let refusedAtResolution = 0;
    let carriedIntoCompiledMap = 0;
    let carriedIntoEmittedCss = 0;
    let foreignSelectors = 0;

    for (const vertical of ["rottay", "bithire", "evnto"] as const) {
      const theme = FIRST_PARTY_BASELINES[vertical];
      const paths = stringLeafPaths(theme).filter(
        (path) => path[0] !== "id" && path[0] !== "name"
      );
      totalLeaves += paths.length;

      for (const path of paths) {
        let compiled;
        try {
          compiled = compileTheme(
            resolveFirstParty({
              vertical,
              slug: vertical,
              origin: "preview",
              patch: patchFor(path) as never,
            }),
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
    }

    // Non-vacuity: the sweep really is delivering hostile values to the
    // emitter. The compiler is not a sanitizer and is not asked to be one.
    // Decrease-only against the measured corpus.
    expect(totalLeaves).toBeGreaterThanOrEqual(MEASURED.leaves);
    expect(refusedAtResolution).toBeGreaterThanOrEqual(
      MEASURED.refusedAtResolution
    );
    expect(carriedIntoCompiledMap).toBeGreaterThanOrEqual(
      MEASURED.carriedIntoCompiledMap
    );

    // The guarantee.
    expect(carriedIntoEmittedCss).toBe(0);
    expect(foreignSelectors).toBe(0);
  }, 60000);
});
