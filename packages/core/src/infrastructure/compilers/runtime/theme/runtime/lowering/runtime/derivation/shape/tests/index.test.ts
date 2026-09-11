/**
 * The shape family's two geometry decisions, and the consumers that paint them.
 *
 * A deriver that emits a channel nobody reads has connected nothing, so the
 * second half of this suite reads the skin sources: the nesting law is checked
 * against the one derivation that consumes both of its operands, and the
 * control-height factor against every file that folds it in.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { deriveControlHeightScale } from "../control-height";
import { deriveNestingLaw } from "../nesting";

const CSS_ROOT = resolve(process.cwd(), "src/foundation/tokens/css");

const DEFAULT_THEME_CSS = readFileSync(
  join(CSS_ROOT, "foundation/themes/default/index.css"),
  "utf8"
);
const CARD_SKIN_CSS = readFileSync(
  join(CSS_ROOT, "runtime/engines/modern/skin/card/index.css"),
  "utf8"
);
const CARD_TOKEN_CSS = readFileSync(
  join(CSS_ROOT, "presentation/components/card/index.css"),
  "utf8"
);

const theme = (surfaces: BrandTheme["surfaces"]): BrandTheme => ({
  id: "t",
  name: "T",
  surfaces,
});

/** Every authored stylesheet under the CSS root, repo-relative. */
function styleFiles(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const absolute = join(dir, entry);
      if (statSync(absolute).isDirectory()) walk(absolute);
      else if (entry.endsWith(".css")) found.push(absolute);
    }
  };
  walk(CSS_ROOT);
  return found.sort();
}

describe("shape/nesting (kit row 12)", () => {
  it("states both operands of the derivation, never one", () => {
    for (const law of ["concentric", "uniform"] as const) {
      expect(Object.keys(deriveNestingLaw(theme({ nesting: law }))).sort()).toEqual([
        "--ds-radius-nest-inset",
        "--ds-radius-nest-ratio",
      ]);
    }
  });

  it("is the identity at `concentric`: exactly the resting law, restated", () => {
    const concentric = deriveNestingLaw(theme({ nesting: "concentric" }));
    // Both operands are seeded by the foundation at exactly these values, so a
    // theme that names `concentric` paints what an unauthored theme paints. A
    // posture that had to DIFFER from the default to be expressible would make
    // the default inexpressible, which is why it is a word at all.
    expect(DEFAULT_THEME_CSS).toContain(
      `--ds-radius-nest-inset: ${concentric["--ds-radius-nest-inset"]};`
    );
    expect(DEFAULT_THEME_CSS).toContain(
      `--ds-radius-nest-ratio: ${concentric["--ds-radius-nest-ratio"]};`
    );
  });

  it("collapses the inset at `uniform`, which is what makes it expressible", () => {
    // Either operand alone leaves a step-down: the ratio term floors the inset
    // at half the parent radius, and the governed floor survives a zero ratio.
    expect(deriveNestingLaw(theme({ nesting: "uniform" }))).toEqual({
      "--ds-radius-nest-inset": "0px",
      "--ds-radius-nest-ratio": "0",
    });
  });

  it("emits nothing for a theme that decided nothing", () => {
    expect(deriveNestingLaw(theme(undefined))).toEqual({});
    expect(deriveNestingLaw(theme({}))).toEqual({});
  });

  // The compatibility transport erases the type: a BrandTheme arrives as plain
  // JSON, so both failure shapes below are reachable input, not hypotheticals.
  it("emits nothing for a word outside the domain or an INHERITED member", () => {
    for (const rogue of ["square", "constructor", "toString", "hasOwnProperty"]) {
      expect(deriveNestingLaw(theme({ nesting: rogue as never })), rogue).toEqual(
        {}
      );
    }
  });

  it("is consumed: the card reads BOTH operands, each through its own channel", () => {
    // The §1.6 cascade shape, twice: a card channel declared from the governed
    // root, read with that root as its fallback. Both halves are asserted --
    // the declaration alone would leave the read orphaned, and the read alone
    // would leave the channel unproduced.
    for (const operand of ["inset", "ratio"] as const) {
      expect(CARD_TOKEN_CSS, operand).toContain(
        `--ds-card-nest-${operand}: var(--ds-radius-nest-${operand});`
      );
      expect(CARD_SKIN_CSS, operand).toContain(
        `var(--ds-card-nest-${operand}, var(--ds-radius-nest-${operand}))`
      );
    }
  });
});

describe("shape/control-height (kit row 14)", () => {
  it("is the identity at `standard`, so the resting ladder stays expressible", () => {
    expect(deriveControlHeightScale(theme({ controlHeight: "standard" }))).toEqual({
      "--ds-control-height-scale": "1",
    });
  });

  it("orders the three postures around that identity", () => {
    const factor = (controlHeight: "compact" | "standard" | "tall") =>
      Number(
        deriveControlHeightScale(theme({ controlHeight }))[
          "--ds-control-height-scale"
        ]
      );
    expect(factor("compact")).toBeLessThan(factor("standard"));
    expect(factor("tall")).toBeGreaterThan(factor("standard"));
  });

  it("emits nothing for a theme that decided nothing", () => {
    expect(deriveControlHeightScale(theme(undefined))).toEqual({});
    expect(deriveControlHeightScale(theme({}))).toEqual({});
  });

  it("emits nothing for a word outside the domain or an INHERITED member", () => {
    for (const rogue of ["huge", "constructor", "toString", "hasOwnProperty"]) {
      expect(
        deriveControlHeightScale(theme({ controlHeight: rogue as never })),
        rogue
      ).toEqual({});
    }
  });

  it("is consumed as a SECOND factor beside density, never instead of it", () => {
    // A read that did not sit in the same product as the density scale would be
    // a second size vocabulary rather than a shift of the ramp the vertical
    // authored, which is the whole reason this row is a factor and not a ramp.
    const offenders: string[] = [];
    for (const file of styleFiles()) {
      const source = readFileSync(file, "utf8");
      if (!source.includes("--ds-control-height-scale")) continue;
      for (const declaration of source.split(";")) {
        // The foundation DECLARATION of the channel is the one site that names
        // it without a density scale beside it; every other site is a read.
        if (/--ds-control-height-scale\s*:/.test(declaration)) continue;
        if (!declaration.includes("--ds-control-height-scale")) continue;
        if (declaration.includes("--ds-density-effective-scale")) continue;
        offenders.push(`${relative(CSS_ROOT, file)}: ${declaration.trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("is declared once at rest, and read with that same factor as fallback", () => {
    expect(DEFAULT_THEME_CSS).toContain("--ds-control-height-scale: 1;");
    const consumers: string[] = [];
    const bare: string[] = [];
    for (const file of styleFiles()) {
      const source = readFileSync(file, "utf8");
      const reads = source.match(/var\(--ds-control-height-scale[^)]*\)/g);
      if (!reads) continue;
      consumers.push(relative(CSS_ROOT, file));
      for (const read of reads) {
        if (read !== "var(--ds-control-height-scale, 1)") bare.push(`${file}: ${read}`);
      }
    }
    // The declaration is what gives the channel a producer; the fallback is what
    // survives a token-layer outage. A read without one would collapse every
    // control to its content height instead of leaving it where it was.
    expect(bare).toEqual([]);
    expect(consumers.length).toBeGreaterThan(10);
  });
});
