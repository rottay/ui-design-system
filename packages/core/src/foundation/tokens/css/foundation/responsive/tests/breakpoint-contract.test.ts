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
 * THE DOMAIN IS THE ONE CSS SHIPS, NOT THE ONE THAT WAS EASY TO MATCH. An
 * earlier revision recognised integer `px` in `min-width:`/`max-width:` only,
 * while the sheets under this root also ship `rem`, one `em`, a fractional
 * `rem`, the `inline-size` feature name and 31 range-syntax preludes
 * (`(inline-size < 34rem)`). A test named "every shipped @media width
 * threshold" that cannot read `@media (max-width: 30rem)` is not measuring what
 * it claims. Every length is normalised to px at the root font size before it
 * is compared, which is a RECONCILIATION and not a widening: `40rem` and `48rem`
 * on the container-min side are the `sm` and `md` steps, and would have been
 * reported as inventions by a rem-blind scan that simply started matching more.
 *
 * `@media` and `@container` preludes cannot read a custom property, and the
 * shipped bundles are plain concatenation (`scripts/build/verticals/css-build`)
 * with no custom-media transform, so the literal IS the shipping value and this
 * sweep is the only thing that can make it an authority-bound projection.
 */
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { RESPONSIVE_BREAKPOINTS } from "@/foundation/contracts/kernel/responsive/breakpoints";
import { deriveResponsiveChannels } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/responsive";

const RESPONSIVE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_ROOT = resolve(RESPONSIVE_ROOT, "..", "..");
const CONTRACT = join(RESPONSIVE_ROOT, "breakpoints/index.css");
const PRELUDE = /@(media|container)[^{;]*\{/g;
const LENGTH = String.raw`([0-9]*\.?[0-9]+)(px|rem|em)`;
/** `min-width: 640px`, `max-inline-size: 30rem` — the prefixed-feature syntax. */
const LEGACY = new RegExp(String.raw`(min|max)-(?:width|inline-size):\s*${LENGTH}`, "g");
/** `(width < 900px)`, `(inline-size >= 34rem)` — the range syntax. */
const RANGE = new RegExp(String.raw`\b(?:width|inline-size)\s*(<=|>=|<|>)\s*${LENGTH}`, "g");

/**
 * No sheet under this root restates the root font size, so a `rem` threshold
 * ships at the browser default. The one `em` threshold is a container query
 * whose element does not restate a font size either; normalising both here is
 * nominal, and the pin below is what keeps it honest.
 */
const ROOT_FONT_PX = 16;

/**
 * Thresholds that are literals in a prelude but are NOT viewport-ladder steps.
 * Each entry is a named residual with the reason it is not a drift: adding one
 * is a decision, not an accident. Entries are written in the AUTHORED unit, so
 * a pin records the line a reader will find rather than its normalisation.
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
  // 30rem = 480px, BELOW the smallest non-zero step (`sm`, 640px), and it is a
  // reachability guard rather than a layout tier: the sidebar panel anchors at
  // the trigger's inline-end, so on a narrow viewport an 18rem panel starts
  // past the rail and its create/settings actions render off-screen. Raising it
  // to `sm - 1` would flip the sidebar to the below-trigger posture across
  // 480-639px, where the anchored posture fits and is the intended one. It is
  // pinned in the authored unit because that is the line to read; the ladder
  // owns tiers, and this is not one.
  "runtime/engines/modern/skin/workspace-switcher/index.css: max-width: 30rem",
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
  /** The authored text of the length, e.g. `30rem`, `47.9375rem`, `640px`. */
  authored: string;
  /** The same length in px, which is the only unit the ladder is stated in. */
  px: number;
  /** How the prelude spells the bound; a range `<` is a max side, `>` a min. */
  syntax: "legacy" | "range";
  operator?: string;
}

function toPx(value: string, unit: string): number {
  return unit === "px" ? Number(value) : Number(value) * ROOT_FONT_PX;
}

function allThresholds(root: string = CSS_ROOT): Threshold[] {
  const found: Threshold[] = [];
  for (const file of cssFiles(root)) {
    const css = readFileSync(file, "utf8");
    for (const prelude of css.matchAll(PRELUDE)) {
      const where = relative(root, file);
      const axis = prelude[1] as "media" | "container";
      for (const width of prelude[0]!.matchAll(LEGACY)) {
        found.push({
          where,
          axis,
          kind: width[1] as "min" | "max",
          authored: `${width[2]}${width[3]}`,
          px: toPx(width[2]!, width[3]!),
          syntax: "legacy",
        });
      }
      for (const width of prelude[0]!.matchAll(RANGE)) {
        found.push({
          where,
          axis,
          kind: width[1]!.startsWith("<") ? "max" : "min",
          authored: `${width[2]}${width[3]}`,
          px: toPx(width[2]!, width[3]!),
          syntax: "range",
          operator: width[1]!,
        });
      }
    }
  }
  return found;
}

function offLadder({ kind, px, axis }: Threshold): boolean {
  const steps = new Set(Object.values(RESPONSIVE_BREAKPOINTS).map(Number));
  const exclusive = new Set(
    Object.values(RESPONSIVE_BREAKPOINTS)
      .filter((step) => step > 0)
      .map((step) => step - 1)
  );
  // A container query sizes against its own element, so only its `min-width`
  // side is bound to the ladder (that is what the projecting sheets use).
  if (kind === "min") return !steps.has(px);
  return axis !== "container" && !exclusive.has(px);
}

function label(threshold: Threshold): string {
  const { where, kind, authored, syntax, operator } = threshold;
  return syntax === "legacy"
    ? `${where}: ${kind}-width: ${authored}`
    : `${where}: width ${operator} ${authored}`;
}

function offenders(
  predicate: (found: Threshold) => boolean,
  root: string = CSS_ROOT
): string[] {
  const found = new Set<string>();
  for (const threshold of allThresholds(root)) {
    if (!predicate(threshold) || !offLadder(threshold)) continue;
    const entry = label(threshold);
    if (!DECLARED_OFF_LADDER.includes(entry)) found.add(entry);
  }
  return [...found].sort();
}

/** A throwaway sheet root, so the drills below run the REAL sweep over real files. */
function withPlantedSheet<T>(css: string, run: (root: string) => T): T {
  const root = mkdtempSync(join(tmpdir(), "breakpoint-sweep-"));
  try {
    writeFileSync(join(root, "planted.css"), css);
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const contractCss = readFileSync(CONTRACT, "utf8");

/**
 * The zero step is a member of the ladder but NOT of its CSS projection.
 *
 * `xs` is `0`: the floor the other steps are measured from. A `@media` prelude
 * cannot read a custom property, and the routes that can -- the Container
 * measure ladder, JS, the compiled tenant block -- have no use for a zero, so it
 * was emitted into every tenant artifact with zero readers anywhere. WO-FAM-07
 * retired the CHANNEL and left the STEP, which is why this file now asserts the
 * projection against `PROJECTED_STEPS` while every other assertion below keeps
 * reading the full `RESPONSIVE_BREAKPOINTS` ladder.
 */
const PROJECTION_FLOOR = "xs";
const PROJECTED_STEPS = Object.entries(RESPONSIVE_BREAKPOINTS).filter(
  ([step]) => step !== PROJECTION_FLOOR
);

describe("the breakpoint contract", () => {
  it("projects every contract step above the floor as a --ds-breakpoint-* token", () => {
    for (const [step, px] of PROJECTED_STEPS) {
      expect(contractCss).toContain(`--ds-breakpoint-${step}: ${px}px;`);
    }
  });

  it("declares no step the contract does not name, and never the zero floor", () => {
    const declared = [...contractCss.matchAll(/--ds-breakpoint-([a-z0-9]+):/g)]
      .map((match) => match[1])
      .sort();
    expect(declared).toEqual(PROJECTED_STEPS.map(([step]) => step).sort());
    expect(declared).not.toContain(PROJECTION_FLOOR);
    // The STEP itself is untouched: only its projection retired.
    expect(RESPONSIVE_BREAKPOINTS[PROJECTION_FLOOR]).toBe(0);
  });

  it("emits the same ladder from the theme compiler, floor excluded", () => {
    const channels = deriveResponsiveChannels({ id: "t", name: "T" });
    for (const [step, px] of PROJECTED_STEPS) {
      expect(channels[`--ds-breakpoint-${step}`]).toBe(`${px}px`);
    }
    expect(channels[`--ds-breakpoint-${PROJECTION_FLOOR}`]).toBeUndefined();
  });

  it("keeps every literal threshold under foundation/responsive on a contract step", () => {
    const steps = new Set(Object.values(RESPONSIVE_BREAKPOINTS).map(Number));
    const exclusive = new Set(
      Object.values(RESPONSIVE_BREAKPOINTS)
        .filter((step) => step > 0)
        .map((step) => step - 1)
    );
    const found = allThresholds(RESPONSIVE_ROOT)
      .filter(({ kind, px }) => !(kind === "min" ? steps : exclusive).has(px))
      .map(label);
    expect([...new Set(found)].sort()).toEqual([]);
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

  // The drills below plant a real sheet into a throwaway root and run the REAL
  // `offenders` sweep over it. A predicate exercised on an in-memory string is
  // not evidence that the sweep would have found it in a shipped file.
  it("turns red when a sheet invents a threshold off the ladder", () => {
    const caught = withPlantedSheet(
      "@media (min-width: 999px) { :root { --x: 1; } }\n",
      (root) => offenders((found) => found.axis === "media", root)
    );
    expect(caught).toEqual(["planted.css: min-width: 999px"]);
  });

  it("turns red on an off-ladder threshold authored in rem", () => {
    // The 2026-09-09 checkpoint's witness class: a px-only scan reported this
    // file as carrying no @media width threshold at all.
    const caught = withPlantedSheet(
      "@media (max-width: 29rem) { :root { --x: 1; } }\n",
      (root) => offenders((found) => found.axis === "media", root)
    );
    expect(caught).toEqual(["planted.css: max-width: 29rem"]);
  });

  it("turns red on an off-ladder threshold authored in range syntax", () => {
    const caught = withPlantedSheet(
      "@media (width < 900px) { :root { --x: 1; } }\n",
      (root) => offenders((found) => found.axis === "media", root)
    );
    expect(caught).toEqual(["planted.css: width < 900px"]);
  });

  it("CONTROL: a ladder step authored in rem or em is not an invention", () => {
    // The reconciliation, not a widening: 40rem and 40em ARE `sm`, 48rem IS
    // `md`. A scan that started matching rem without normalising would have
    // reported the three shipped container-min thresholds as new drift.
    const caught = withPlantedSheet(
      [
        "@container (min-width: 40rem) { .a { color: red; } }",
        "@container (min-width: 40em) { .b { color: red; } }",
        "@container (min-width: 48rem) { .c { color: red; } }",
        "@media (min-width: 40rem) { .d { color: red; } }",
      ].join("\n"),
      (root) => offenders(() => true, root)
    );
    expect(caught).toEqual([]);
  });

  it("CONTROL: the free container-max axis stays free in every unit and syntax", () => {
    const caught = withPlantedSheet(
      [
        "@container ds-x (inline-size < 34rem) { .a { color: red; } }",
        "@container (max-width: 47.9375rem) { .b { color: red; } }",
      ].join("\n"),
      (root) => offenders(() => true, root)
    );
    expect(caught).toEqual([]);
  });

  it("sees the whole shipped domain, not only the part that is easy to match", () => {
    // The named-scan check: the sweep must actually be reading rem, em, the
    // range syntax and `inline-size`, or the four assertions above pass over a
    // corpus this test cannot see.
    const shipped = allThresholds();
    const units = new Set(shipped.map(({ authored }) => authored.replace(/[0-9.]/g, "")));
    expect([...units].sort()).toEqual(["em", "px", "rem"]);
    expect(shipped.filter(({ syntax }) => syntax === "range").length).toBeGreaterThan(0);
    expect(
      shipped.some(
        ({ where, authored, axis }) =>
          axis === "media" &&
          authored === "30rem" &&
          where.endsWith("skin/workspace-switcher/index.css")
      )
    ).toBe(true);
  });
});
