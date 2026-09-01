import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import postcss, { type AtRule, type Document, type Root, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

/** Exactly the node types that can sit above a rule. Closed under `.parent`,
    and every member carries a literal `type`, so `'atrule'` narrows here. */
type SkinAncestor = AtRule | Document | Root | Rule | undefined;

const SKIN = resolve(
  process.cwd(),
  "src/foundation/tokens/css/presentation/components/skin/decision-comparison/index.css"
);

interface Declaration {
  selector: string;
  value: string;
  conditions: string;
  weight: number;
}

/** Specificity as a single comparable integer (a*10000 + b*100 + c). Only the
    selector grammar this family actually uses is modelled. */
function weigh(selector: string): number {
  let carried = 0;
  let rest = selector.trim();

  rest = rest.replace(/:(?:not|is|has)\(([^()]*)\)/g, (_all, inner: string) => {
    carried += Math.max(0, ...inner.split(",").map((part) => weigh(part)));
    return " ";
  });
  rest = rest.replace(/:where\([^()]*\)/g, " ");

  const count = (pattern: RegExp): number => {
    const found = rest.match(pattern) ?? [];
    rest = rest.replace(pattern, " ");
    return found.length;
  };

  const pseudoElements = count(/::[\w-]+/g);
  const functionalPseudo = count(/:[\w-]+\([^()]*\)/g);
  const ids = count(/#[\w-]+/g);
  const classes = count(/\.[\w-]+/g);
  const attributes = count(/\[[^\]]*\]/g);
  const pseudoClasses = count(/:[\w-]+/g);
  const elements = rest
    .split(/[\s>+~,]+/)
    .filter((token) => /^[a-zA-Z][\w-]*$/.test(token)).length;

  return (
    carried +
    ids * 10000 +
    (classes + attributes + functionalPseudo + pseudoClasses) * 100 +
    elements +
    pseudoElements
  );
}

function collect(property: string): Declaration[] {
  const found: Declaration[] = [];
  postcss.parse(readFileSync(SKIN, "utf8")).walkDecls(property, (decl) => {
    const rule = decl.parent as Rule | undefined;
    if (!rule || rule.type !== "rule") return;
    const conditions: string[] = [];
    for (let node: SkinAncestor = rule.parent; node !== undefined; node = node.parent) {
      if (node.type === "atrule") {
        conditions.push(`@${node.name} ${node.params}`);
      }
    }
    for (const selector of rule.selectors) {
      found.push({
        selector: selector.replace(/\s+/g, " ").trim(),
        value: decl.value.replace(/\s+/g, " ").trim(),
        conditions: conditions.join(" "),
        weight: weigh(selector),
      });
    }
  });
  return found;
}

/** The declaration that actually paints, i.e. the heaviest matching candidate. */
function winner(candidates: Declaration[]): Declaration | undefined {
  return candidates.reduce<Declaration | undefined>(
    (best, candidate) =>
      !best || candidate.weight >= best.weight ? candidate : best,
    undefined
  );
}

const MODERN = ".ds-engine-modern";

describe("DecisionComparison modern remediation", () => {
  it("kills the root entrance animation under reduced motion for modern", () => {
    const animations = collect("animation");

    const entrance = winner(
      animations.filter(
        (decl) =>
          decl.value.includes("ds-decision-comparison-enter") &&
          !decl.conditions.includes("prefers-reduced-motion")
      )
    );
    expect(entrance).toBeDefined();

    const exit = winner(
      animations.filter(
        (decl) =>
          decl.conditions.includes("prefers-reduced-motion") &&
          decl.value === "none" &&
          decl.selector.includes(MODERN) &&
          decl.selector.includes('[data-part="root"]')
      )
    );

    // The shared exit only reaches (0,2,0) against a (0,3,0) declaration, so a
    // modern-scoped exit has to out-rank the entrance, not merely follow it.
    expect(exit).toBeDefined();
    expect(exit!.weight).toBeGreaterThan(entrance!.weight);
  });

  it("gives the identity title its own wrap contract, not only its children", () => {
    const wrapped = collect("overflow-wrap").filter(
      (decl) =>
        decl.selector.includes(MODERN) &&
        /__title$/.test(decl.selector) &&
        decl.value === "anywhere"
    );
    expect(wrapped.length).toBeGreaterThan(0);

    const whiteSpace = winner(
      collect("white-space").filter(
        (decl) =>
          decl.selector.includes(MODERN) && /__title$/.test(decl.selector)
      )
    );
    expect(whiteSpace?.value).toBe("normal");
  });

  it("stops silently ellipsizing subtitle and score label", () => {
    for (const part of ["__subtitle", "__score-label"]) {
      const decided = winner(
        collect("white-space").filter(
          (decl) =>
            decl.selector.includes(MODERN) && decl.selector.endsWith(part)
        )
      );
      expect(decided, part).toBeDefined();
      expect(decided!.value, part).toBe("normal");

      const clamp = collect("-webkit-line-clamp").filter(
        (decl) =>
          decl.selector.includes(MODERN) && decl.selector.endsWith(part)
      );
      expect(clamp.length, part).toBeGreaterThan(0);
    }
  });

  it("mirrors the fact value column under RTL instead of double-flipping it", () => {
    const rtlAligned = winner(
      collect("text-align").filter(
        (decl) =>
          decl.selector.includes(":dir(rtl)") &&
          decl.selector.endsWith("__fact-value")
      )
    );
    expect(rtlAligned).toBeDefined();
    expect(rtlAligned!.selector).toContain(MODERN);
    // `end` is already writing-mode aware; forcing `start` under RTL puts the
    // values back on the right and collides them with the label column.
    expect(rtlAligned!.value).toBe("end");

    const rtlJustified = winner(
      collect("justify-items").filter(
        (decl) =>
          decl.selector.includes(":dir(rtl)") &&
          decl.selector.endsWith("__fact-value")
      )
    );
    expect(rtlJustified?.value).toBe("end");
  });

  it("routes every density-blind chrome floor through the tenant density plane", () => {
    const floors = collect("min-height").filter((decl) =>
      decl.selector.includes(MODERN)
    );
    for (const part of ["__toolbar", "__identity", "__badges", "__visual"]) {
      const decided = winner(
        floors.filter((decl) => decl.selector.endsWith(part))
      );
      expect(decided, part).toBeDefined();
      expect(decided!.value, part).toContain("--ds-density-effective-scale, 1");
    }

    const track = winner(
      collect("grid-template-rows").filter(
        (decl) =>
          decl.selector.includes(MODERN) && decl.selector.endsWith("__subject")
      )
    );
    expect(track?.value).toContain("--ds-density-effective-scale, 1");
  });

  it("keeps the tone redundancy marker visible in forced colors", () => {
    const dot = winner(
      collect("background").filter(
        (decl) =>
          decl.conditions.includes("forced-colors") &&
          decl.selector.includes("__fact-value") &&
          decl.selector.includes("::before")
      )
    );
    expect(dot).toBeDefined();
    expect(dot!.selector).toContain(MODERN);
    // `currentColor` as a background is exactly what forced colors replaces.
    expect(dot!.value).toBe("CanvasText");

    const emptyFrame = collect("outline").filter(
      (decl) =>
        decl.conditions.includes("forced-colors") &&
        decl.selector.includes(MODERN) &&
        decl.selector.endsWith("__empty")
    );
    expect(emptyFrame.length).toBeGreaterThan(0);
  });
});
