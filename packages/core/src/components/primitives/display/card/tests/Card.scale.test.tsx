/**
 * The card footprint preset: an instance/surface prop that states one channel,
 * `--ds-card-scale`, through the skin, and nothing else. It is not a tenant
 * decision: no tenant-theme field and no catalog row carries it.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import postcss, { type Rule } from "postcss";

import ModernCard from "../engines/modern";

const CARD_SKIN = readFileSync(
  resolve(process.cwd(), "src/foundation/tokens/css/runtime/engines/modern/skin/card/index.css"),
  "utf8"
);

describe("Card scale", () => {
  it("stamps the preset and writes no inline style of its own", () => {
    const { container } = render(<ModernCard scale="lg">Body</ModernCard>);
    const root = container.querySelector("[data-part='root']")!;
    expect(root).toHaveAttribute("data-scale", "lg");
    expect(root.getAttribute("style") ?? "").not.toContain("--ds-");
    expect(root.hasAttribute("scale")).toBe(false);
  });

  it("stamps nothing when the prop is absent", () => {
    const { container } = render(<ModernCard>Body</ModernCard>);
    expect(container.querySelector("[data-part='root']")!.hasAttribute("data-scale")).toBe(false);
  });

  it("maps each preset to --ds-card-scale and to no other channel or property", () => {
    const rules: { selector: string; decls: Record<string, string> }[] = [];
    postcss.parse(CARD_SKIN).walkRules((rule: Rule) => {
      if (!rule.selector.includes("[data-scale=")) return;
      const decls: Record<string, string> = {};
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value.trim();
      });
      rules.push({ selector: rule.selector, decls });
    });
    const steps = {
      sm: "calc(var(--ds-card-scale-md, 1) * 0.875)",
      md: "1",
      lg: "calc(var(--ds-card-scale-md, 1) * 1.25)",
      xl: "calc(var(--ds-card-scale-md, 1) * 1.5)",
    } as const;
    expect(rules.map((rule) => rule.decls)).toEqual(
      Object.entries(steps).map(([step, rest]) => ({
        "--ds-card-scale": `var(--ds-card-scale-${step}, ${rest})`,
      }))
    );
  });

  it("is not a tenant decision", () => {
    const catalog = readFileSync(resolve(process.cwd(), "src/contracts/theme/runtime/catalog/index.ts"), "utf8");
    const tenantTheme = readFileSync(
      resolve(process.cwd(), "src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts"),
      "utf8"
    );
    expect(catalog).not.toMatch(/card-scale|cardScale/);
    expect(tenantTheme).not.toMatch(/card-scale|cardScale/);
  });
});
