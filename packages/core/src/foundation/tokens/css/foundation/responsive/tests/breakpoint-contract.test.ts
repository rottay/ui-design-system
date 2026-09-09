/**
 * The responsive contract: one breakpoint ladder, three projections.
 *
 * The scale is authored once in `RESPONSIVE_BREAKPOINTS`. This test pins the
 * CSS token projection and the theme compiler's `responsive` family to that
 * one authority, and refuses a literal `min-width` threshold anywhere under
 * `foundation/responsive` other than the contract sheet -- which is what keeps
 * the five breakpoint vocabularies the audit measured from growing back.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { RESPONSIVE_BREAKPOINTS } from "@/foundation/contracts/kernel/responsive/breakpoints";
import { deriveResponsiveChannels } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/responsive";

const RESPONSIVE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACT = join(RESPONSIVE_ROOT, "breakpoints/index.css");
const MIN_WIDTH = /min-width:\s*(\d+)px/g;

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "tests" ? [] : cssFiles(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

const contractCss = readFileSync(CONTRACT, "utf8");

describe("the breakpoint contract", () => {
  it("projects every contract step as a --ds-breakpoint-* token", () => {
    for (const [step, px] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
      expect(contractCss).toContain(`--ds-breakpoint-${step}: ${px}px;`);
    }
  });

  it("declares no step the contract does not name", () => {
    const declared = [...contractCss.matchAll(/--ds-breakpoint-([a-z0-9]+):/g)]
      .map((match) => match[1])
      .sort();
    expect(declared).toEqual(Object.keys(RESPONSIVE_BREAKPOINTS).sort());
  });

  it("emits the same ladder from the theme compiler", () => {
    const channels = deriveResponsiveChannels({ id: "t", name: "T" });
    for (const [step, px] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
      expect(channels[`--ds-breakpoint-${step}`]).toBe(`${px}px`);
    }
  });

  it("keeps every literal threshold under foundation/responsive on a contract step", () => {
    const steps = new Set(Object.values(RESPONSIVE_BREAKPOINTS).map(String));
    const offenders: string[] = [];
    for (const file of cssFiles(RESPONSIVE_ROOT)) {
      const css = readFileSync(file, "utf8");
      for (const match of css.matchAll(MIN_WIDTH)) {
        if (!steps.has(match[1]!)) {
          offenders.push(`${relative(RESPONSIVE_ROOT, file)}: ${match[0]}`);
        }
      }
    }
    expect(offenders.sort()).toEqual([]);
  });

  it("turns red when a sheet invents a threshold off the ladder", () => {
    const steps = new Set(Object.values(RESPONSIVE_BREAKPOINTS).map(String));
    const planted = "@media (min-width: 999px) { :root { --x: 1; } }";
    const found = [...planted.matchAll(MIN_WIDTH)].filter(
      (match) => !steps.has(match[1]!)
    );
    expect(found).toHaveLength(1);
  });
});
