import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import postcss, { type AtRule, type Document, type Root, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

/** Exactly the node types that can sit above a rule. Closed under `.parent`,
    and every member carries a literal `type`, so `'atrule'` narrows here. */
type SkinAncestor = AtRule | Document | Root | Rule | undefined;

/** Both skins participate; `rottay-engines` (modern) sorts later than
    `rottay-components` in the canonical layer order, so modern wins by layer. */
const SOURCES: ReadonlyArray<{ path: string; layerRank: number }> = [
  {
    path: "src/foundation/tokens/css/presentation/components/skin/record-facts/index.css",
    layerRank: 0,
  },
  {
    path: "src/foundation/tokens/css/runtime/engines/modern/skin/record-facts/index.css",
    layerRank: 1,
  },
];

interface Declaration {
  selector: string;
  value: string;
  conditions: string;
  weight: number;
  layerRank: number;
}

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
  for (const source of SOURCES) {
    const css = readFileSync(resolve(process.cwd(), source.path), "utf8");
    postcss.parse(css).walkDecls(property, (decl) => {
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
          layerRank: source.layerRank,
        });
      }
    });
  }
  return found;
}

/** Layer beats specificity beats source order — the real cascade for these two files. */
function winner(candidates: Declaration[]): Declaration | undefined {
  return candidates.reduce<Declaration | undefined>((best, candidate) => {
    if (!best) return candidate;
    if (candidate.layerRank !== best.layerRank)
      return candidate.layerRank > best.layerRank ? candidate : best;
    return candidate.weight >= best.weight ? candidate : best;
  }, undefined);
}

const MODERN = ".ds-engine-modern";
const NARROW = "(max-width: 560px)";

/** The default fact/skeleton row, i.e. no trailing state or emphasis filter. */
const plain = (part: string) => (decl: Declaration) =>
  new RegExp(`${part}(:not\\([^)]*\\))?$`).test(decl.selector);

const compactScoped = (decl: Declaration): boolean =>
  decl.selector.includes('[data-density="compact"]');

describe("RecordFacts modern remediation", () => {
  it("keeps the section description readable below 560px instead of deleting it", () => {
    const narrowDisplay = winner(
      collect("display").filter(
        (decl) =>
          decl.conditions.includes(NARROW) &&
          decl.selector.endsWith("__description")
      )
    );
    expect(narrowDisplay).toBeDefined();
    expect(narrowDisplay!.selector).toContain(MODERN);
    expect(narrowDisplay!.value).not.toBe("none");

    const clamp = collect("-webkit-line-clamp").filter(
      (decl) =>
        decl.conditions.includes(NARROW) &&
        decl.selector.endsWith("__description")
    );
    expect(clamp.length).toBeGreaterThan(0);
  });

  it("wraps the fact label rather than silently truncating it", () => {
    const decided = winner(
      collect("white-space").filter((decl) =>
        decl.selector.endsWith("__label")
      )
    );
    expect(decided).toBeDefined();
    expect(decided!.selector).toContain(MODERN);
    expect(decided!.value).toBe("normal");

    const clamp = collect("-webkit-line-clamp").filter((decl) =>
      decl.selector.endsWith("__label")
    );
    expect(clamp.length).toBeGreaterThan(0);
  });

  it("reserves the real fact footprint in the loading skeleton", () => {
    const floors = collect("min-height").filter(
      (decl) => !decl.conditions.includes(NARROW)
    );

    const comfortableFact = winner(
      floors.filter((decl) => plain("__fact")(decl) && !compactScoped(decl))
    );
    const comfortableSkeleton = winner(
      floors.filter((decl) => plain("__skeleton")(decl) && !compactScoped(decl))
    );
    expect(comfortableSkeleton).toBeDefined();
    // The skeleton's min-height must track the same density-scoped floor as
    // the real fact row, or first load settles downward once data replaces it.
    expect(comfortableSkeleton!.value).toBe(comfortableFact?.value);

    const compactFact = winner(
      floors.filter((decl) => plain("__fact")(decl) && compactScoped(decl))
    );
    const compactSkeleton = winner(
      floors.filter((decl) => plain("__skeleton")(decl) && compactScoped(decl))
    );
    expect(compactSkeleton).toBeDefined();
    expect(compactSkeleton!.value).toBe(compactFact?.value);
  });

  it("routes header, fact and skeleton floors through the tenant density plane", () => {
    for (const part of ["__header", "__fact", "__skeleton"]) {
      const decided = winner(
        collect("min-height").filter(
          (decl) => !decl.conditions.includes(NARROW) && plain(part)(decl)
        )
      );
      expect(decided, part).toBeDefined();
      expect(decided!.value, part).toContain("--ds-density-effective-scale, 1");
    }
  });

  it("exposes the header and fact tint as channels and mirrors the light source", () => {
    const tints = collect("background").filter(
      (decl) => !decl.conditions.includes("forced-colors")
    );
    const header = winner(
      tints.filter((decl) => decl.selector.endsWith("__header"))
    );
    expect(header).toBeDefined();
    expect(header!.selector).toContain(MODERN);
    // Fallbacks are today's exact percentages: an unset channel is a no-op.
    expect(header!.value).toContain("--_ds-record-facts-header-tint, 8%");
    expect(header!.value).toContain("--_ds-record-facts-header-wash, 5%");
    expect(header!.value).toContain("--_ds-record-facts-header-origin");

    const origins = collect("--_ds-record-facts-header-origin");
    const ltr = origins.find((decl) => !decl.selector.includes('[dir="rtl"]'));
    const rtl = winner(
      origins.filter((decl) => decl.selector.includes('[dir="rtl"]'))
    );
    expect(ltr?.value).toBe("10% 0%");
    expect(rtl).toBeDefined();
    expect(rtl!.value).not.toBe(ltr!.value);

    const fact = winner(tints.filter(plain("__fact")));
    expect(fact).toBeDefined();
    expect(fact!.value).toContain("--_ds-record-facts-fact-bg-share, 96%");
  });
});
