/**
 * The card states no footprint of its own: the auto-fit grid is the single
 * author of `--ds-card-scale` (its `minItem`). A card-level scale had no reader
 * -- custom properties do not climb to the grid that sizes the tracks -- so the
 * card carries no scale prop, stamps no `data-scale` and its skin keys nothing
 * on it.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import React from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { render } from "@testing-library/react";
import postcss, { type Rule } from "postcss";

import ModernCard from "../engines/modern";
import type { CardProps } from "../contracts";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const CARD_SKIN = read("src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css");
const CARD_CONTRACTS = read("src/components/primitives/display/card/contracts/index.ts");

describe("Card has no footprint prop", () => {
  it("exposes no scale prop in its contract", () => {
    expectTypeOf<CardProps>().not.toHaveProperty("scale");
    expect(CARD_CONTRACTS).not.toMatch(/\bscale\?\s*:/);
    expect(CARD_CONTRACTS).not.toMatch(/\bCardScale\b/);
  });

  it("stamps no data-scale", () => {
    const { container } = render(<ModernCard title="Card">Body</ModernCard>);
    expect(container.querySelector("[data-part='root']")!.hasAttribute("data-scale")).toBe(false);
    expect(container.querySelector("[data-scale]")).toBeNull();
  });

  it("keys no skin rule on data-scale and sets no --ds-card-scale on the card", () => {
    const offenders: string[] = [];
    postcss.parse(CARD_SKIN).walkRules((rule: Rule) => {
      if (rule.selector.includes("data-scale")) offenders.push(rule.selector);
      rule.walkDecls("--ds-card-scale", () => {
        offenders.push(rule.selector);
      });
    });
    expect(offenders).toEqual([]);
  });
});
