/**
 * The responsive contract: one breakpoint ladder, four projections.
 *
 * The scale is authored once in `RESPONSIVE_BREAKPOINTS`. This test pins the
 * CSS token projection and the theme compiler's `responsive` family to that
 * one authority, and then sweeps EVERY shipped stylesheet under
 * `foundation/tokens/css` so a literal threshold in an at-rule prelude is a
 * proven projection of the ladder rather than a second scale.
 *
 * Two axes, deliberately separated:
 *   - the VIEWPORT axis (`@media`) is the ladder. Every width threshold is a
 *     step, or a step minus one where the query is exclusive.
 *   - the COMPONENT-CONTAINER axis (`@container`) sizes an element against its
 *     own container and is NOT the viewport ladder, so its `max-width`
 *     thresholds are free. Its `min-width` thresholds are still swept, because
 *     the sheets that project the whole ladder into container queries
 *     (modern `skin/descriptions`, `skin/list`) must keep projecting it.
 *
 * `@media` and `@container` preludes cannot read a custom property, and the
 * shipped bundles are plain concatenation (`scripts/build/verticals/css-build`)
 * with no custom-media transform, so the literal IS the shipping value and this
 * sweep is the only thing that can make it an authority-bound projection.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { RESPONSIVE_BREAKPOINTS } from "@/foundation/contracts/kernel/responsive/breakpoints";
import { deriveResponsiveChannels } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/responsive";

const RESPONSIVE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_ROOT = resolve(RESPONSIVE_ROOT, "..", "..");
const CONTRACT = join(RESPONSIVE_ROOT, "breakpoints/index.css");
const MIN_WIDTH = /min-width:\s*(\d+)px/g;
const PRELUDE = /@(media|container)[^{;]*\{/g;
const WIDTH = /(min|max)-width:\s*(\d+)px/g;

/**
 * Thresholds that are literals in a prelude but are NOT viewport-ladder steps.
 * Each entry is a named residual with the reason it is not a drift: adding one
 * is a decision, not an accident.
 */
const DECLARED_OFF_LADDER = [
  // Component-container thresholds: the bottom tab bar switches to its wide
  // arrangement, and the widget board to its multi-column arrangement, against
  // their OWN container width. Neither is a viewport step.
  "presentation/components/skin/bottom-tab-bar/index.css: min-width: 600px",
  "presentation/components/skin/widget-board/index.css: min-width: 840px",
  // Legacy inclusive viewport bound on the command-home console, duplicated in
  // the paint sheet. 640px matches this query AND the `sm` step at the same
  // viewport; owned by whoever unifies patterns/ with patterns-paint/.
  "presentation/components/patterns-paint/index.css: max-width: 640px",
  "presentation/components/patterns/index.css: max-width: 640px",
];

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "tests" ? [] : cssFiles(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

interface Threshold {
  where: string;
  axis: "media" | "container";
  kind: "min" | "max";
  px: string;
}

function allThresholds(): Threshold[] {
  const found: Threshold[] = [];
  for (const file of cssFiles(CSS_ROOT)) {
    const css = readFileSync(file, "utf8");
    for (const prelude of css.matchAll(PRELUDE)) {
      for (const width of prelude[0]!.matchAll(WIDTH)) {
        found.push({
          where: relative(CSS_ROOT, file),
          axis: prelude[1] as "media" | "container",
          kind: width[1] as "min" | "max",
          px: width[2]!,
        });
      }
    }
  }
  return found;
}

function offLadder({ kind, px, axis }: Threshold): boolean {
  const steps = new Set(Object.values(RESPONSIVE_BREAKPOINTS).map(String));
  const exclusive = new Set(
    Object.values(RESPONSIVE_BREAKPOINTS)
      .filter((px) => px > 0)
      .map((px) => String(px - 1))
  );
  // A container query sizes against its own element, so only its `min-width`
  // side is bound to the ladder (that is what the projecting sheets use).
  if (kind === "min") return !steps.has(px);
  return axis !== "container" && !exclusive.has(px);
}

function label({ where, kind, px }: Threshold): string {
  return `${where}: ${kind}-width: ${px}px`;
}

function offenders(predicate: (found: Threshold) => boolean): string[] {
  const found = new Set<string>();
  for (const threshold of allThresholds()) {
    if (!predicate(threshold) || !offLadder(threshold)) continue;
    const entry = label(threshold);
    if (!DECLARED_OFF_LADDER.includes(entry)) found.add(entry);
  }
  return [...found].sort();
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

  it("keeps every shipped @media width threshold on the ladder", () => {
    expect(offenders((found) => found.axis === "media")).toEqual([]);
  });

  it("keeps every shipped min-width threshold on the ladder", () => {
    expect(offenders((found) => found.kind === "min")).toEqual([]);
  });

  it("declares no off-ladder threshold that has already been removed", () => {
    const live = new Set(allThresholds().filter(offLadder).map(label));
    expect(DECLARED_OFF_LADDER.filter((entry) => !live.has(entry))).toEqual([]);
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
