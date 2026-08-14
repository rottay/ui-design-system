import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import postcss, { type AtRule, type Document, type Root, type Rule } from "postcss";
import { describe, expect, it } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";

import { ActiveFiltersBar } from "../index";
import type { ActiveFilter } from "../contracts";
import { renderWithEngine } from "../../../../../tooling/testing/helpers/engine";

const SKIN =
  "src/foundation/tokens/css/presentation/components/skin/active-filters-bar.css";

interface SkinRule {
  selector: string;
  conditions: string;
  decls: Record<string, string>;
}

/** Exactly the node types that can sit above a rule. Closed under `.parent`,
    and every member carries a literal `type`, so `'atrule'` narrows here. */
type SkinAncestor = AtRule | Document | Root | Rule | undefined;

function readRules(): SkinRule[] {
  const css = readFileSync(resolve(process.cwd(), SKIN), "utf8");
  const out: SkinRule[] = [];
  postcss.parse(css).walkRules((rule: Rule) => {
    const conditions: string[] = [];
    let inKeyframes = false;
    for (let node: SkinAncestor = rule.parent; node !== undefined; node = node.parent) {
      if (node.type === "atrule") {
        if (node.name === "keyframes") inKeyframes = true;
        conditions.push(`@${node.name} ${node.params}`);
      }
    }
    if (inKeyframes) return;
    const decls: Record<string, string> = {};
    rule.walkDecls((d) => {
      decls[d.prop] = d.value.replace(/\s+/g, " ").trim();
    });
    for (const selector of rule.selectors) {
      out.push({
        selector: selector.replace(/\s+/g, " ").trim(),
        conditions: conditions.join(" "),
        decls,
      });
    }
  });
  return out;
}

const FILTERS: ActiveFilter[] = [
  { key: "status", label: "Status", value: "active", displayValue: "Active" },
  { key: "owner", label: "Owner", value: "me", displayValue: "Me", state: "draft" },
  { key: "tier", label: "Tier", value: "gold", displayValue: "Gold", state: "invalid" },
];

async function renderRail(
  props: Partial<React.ComponentProps<typeof ActiveFiltersBar>> = {}
): Promise<HTMLElement> {
  const { container } = renderWithEngine(
    <ActiveFiltersBar
      activeFilters={FILTERS}
      onRemoveFilter={() => undefined}
      onClearAll={() => undefined}
      onAddFilter={() => undefined}
      {...props}
    />,
    "modern"
  );
  await waitFor(() =>
    expect(container.querySelector('[data-part="root"]')).not.toBeNull()
  );
  return container;
}

const winningDecl = (
  rules: SkinRule[],
  property: string,
  match: (rule: SkinRule) => boolean
): SkinRule | undefined => [...rules].reverse().find((r) => match(r) && property in r.decls);

// ---------------------------------------------------------------------------

describe("ActiveFiltersBar skin reachability", () => {
  it("every authored selector matches a node the family actually renders", async () => {
    // Three lifecycle states, the embedded variant and the overflow toggles
    // between them cover every stamped part in the file.
    const full = await renderRail();
    const collapsed = await renderRail({ maxVisible: 2 });
    const embedded = await renderRail({ surfaceVariant: "embedded" });
    // The collapse affordance only exists once the rail has been expanded.
    const expanded = await renderRail({ maxVisible: 2 });
    fireEvent.click(expanded.querySelector('[data-part="more-toggle"]') as HTMLElement);
    const unreachable: string[] = [];

    for (const rule of readRules()) {
      const matches = [full, collapsed, embedded, expanded].some(
        (c) => c.querySelector(rule.selector) !== null
      );
      if (!matches) unreachable.push(rule.selector);
    }
    expect(unreachable).toEqual([]);
  });

  it("gives the heading, the objects and the action three different forms", async () => {
    const container = await renderRail({ maxVisible: 2 });

    // The heading is a label — not a control, not a Tag.
    const eyebrow = container.querySelector('[data-part="pill"]') as HTMLElement;
    expect(eyebrow.tagName).toBe("SPAN");
    expect(eyebrow.className).not.toContain("rottay-tag");
    expect(eyebrow.textContent).toContain("3 active");

    // The objects are the certified Tag primitive, each with a named control.
    for (const chip of container.querySelectorAll('[data-part="chip"]')) {
      expect(chip.className).toContain("rottay-tag-shell");
      const close = chip.querySelector('[data-part="close"]') as HTMLElement;
      expect(close.tagName).toBe("BUTTON");
      expect(close.getAttribute("aria-label")).toMatch(/^Remove filter /);
    }

    // The action is a real button with expansion state, never a third pill.
    const toggle = container.querySelector('[data-part="more-toggle"]') as HTMLElement;
    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle.className).not.toContain("rottay-tag");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("de-pills the count so the heading stops impersonating a filter chip", () => {
    const rules = readRules();
    const eyebrow = winningDecl(
      rules,
      "border-inline-end",
      (r) => r.selector.includes('[data-part="pill"]') && r.conditions === ""
    );
    expect(eyebrow).toBeDefined();
    // The role now reads as FORM — a hairline leader on the shared seam
    // channel — instead of a capsule competing with the chips beside it.
    expect(eyebrow!.decls["border-inline-end"]).toContain(
      "--_ds-active-filters-bar-leader"
    );
    expect(eyebrow!.decls["border-radius"]).toBeUndefined();
    expect(eyebrow!.decls.background).toBeUndefined();
    expect(eyebrow!.decls.border).toBeUndefined();
    // ...and as TYPOGRAPHY, which is what survives without a box.
    expect(eyebrow!.decls["text-transform"]).toBe("uppercase");
    expect(eyebrow!.decls["font-variant-numeric"]).toBe("tabular-nums");

    // Four reads of channels nothing declares went with the capsule.
    const body = readFileSync(resolve(process.cwd(), SKIN), "utf8").replace(
      /\/\*[\s\S]*?\*\//g,
      ""
    );
    for (const retired of [
      "--ds-active-filters-bar-count-radius",
      "--ds-active-filters-bar-count-padding-inline",
      "--ds-active-filters-bar-count-background",
      "--ds-active-filters-bar-count-border",
    ]) {
      expect(body, retired).not.toContain(retired);
    }
  });

  it("gives a dismissible object a hit target on the tenant density plane", () => {
    const rules = readRules();
    const chip = winningDecl(
      rules,
      "min-block-size",
      (r) => r.selector.endsWith('[data-part="chip"]') && r.conditions === ""
    );
    expect(chip!.decls["min-block-size"]).toContain(
      "--_ds-active-filters-bar-chip-target"
    );
    const body = readFileSync(resolve(process.cwd(), SKIN), "utf8");
    expect(body).toContain("--ds-control-size-sm");
    expect(body).toContain("--ds-density-effective-scale");
  });

  it("reads the same region channels as the sibling toolbar", () => {
    const rules = readRules();
    const ground = winningDecl(
      rules,
      "background",
      (r) => r.selector.includes('[data-embedded="false"]') && r.conditions === ""
    );
    // Family channel first (a tenant may still address the rail alone), then
    // the shared band channel, then the exact paint this family shipped with.
    expect(ground!.decls.background.indexOf("--ds-active-filters-bar-background"))
      .toBeLessThan(ground!.decls.background.indexOf("--ds-toolbar-bg"));

    const rule = winningDecl(
      rules,
      "border-bottom",
      (r) => r.selector.includes('[data-embedded="false"]') && r.conditions === ""
    );
    expect(rule!.decls["border-bottom"]).toContain("--ds-toolbar-border-bottom");

    const body = readFileSync(resolve(process.cwd(), SKIN), "utf8");
    expect(body).toContain("--ds-toolbar-gap");
    expect(body).toContain("--ds-toolbar-divider");
    expect(body).toContain("--ds-list-shell-section-gap");
    expect(body).not.toContain("--ds-toolbar-shadow");
  });

  it("answers narrow widths with a posture, not a compressed desktop", async () => {
    const rules = readRules();
    const container = await renderRail();
    const at = (width: string) =>
      rules.filter((r) => r.conditions.includes(`(max-width: ${width})`));

    expect(
      at("48rem").find((r) => r.selector.includes('[data-part="actions"]'))?.decls.flex
    ).toBe("1 1 100%");

    const phone = at("30rem");
    // The eyebrow becomes the line that titles the rail.
    const eyebrow = phone.find((r) => r.selector.includes('[data-part="pill"]'));
    expect(eyebrow?.decls.flex).toBe("0 0 100%");
    expect(eyebrow?.decls["border-inline-end"]).toBe("0");
    // The two affordances become an equal-width decision pair.
    for (const part of ["clear-all", "add-filter"]) {
      const decided = phone.find((r) => r.selector.includes(`[data-part="${part}"]`));
      expect(decided?.decls.flex, part).toBe("1 1 0");
      expect(container.querySelector(decided!.selector), part).not.toBeNull();
    }

    const body = readFileSync(resolve(process.cwd(), SKIN), "utf8");
    expect(body).toContain("container: ds-active-filters-bar / inline-size");
    for (const rule of rules) {
      if (rule.conditions.includes("@container")) {
        expect(rule.conditions).toContain("ds-active-filters-bar");
      }
    }
  });
});

// ---------------------------------------------------------------------------

describe("ActiveFiltersBar anatomy", () => {
  it("expands in place and offers the way back", async () => {
    const container = await renderRail({ maxVisible: 2 });
    fireEvent.click(container.querySelector('[data-part="more-toggle"]') as HTMLElement);
    expect(container.querySelectorAll('[data-part="chip"]')).toHaveLength(3);
    expect(
      (container.querySelector('[data-part="less-toggle"]') as HTMLElement).getAttribute(
        "aria-expanded"
      )
    ).toBe("true");
  });

  it("makes the chip group a labelled toolbar with APG arrow movement", async () => {
    const container = await renderRail();
    const group = container.querySelector('[data-part="chips"]') as HTMLElement;
    expect(group.getAttribute("role")).toBe("toolbar");
    expect(group.getAttribute("aria-label")).toBe("Applied filters");

    const dismissers = Array.from(
      group.querySelectorAll<HTMLElement>('[data-part="close"]')
    );
    expect(dismissers).toHaveLength(3);

    dismissers[0].focus();
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(document.activeElement).toBe(dismissers[1]);
    fireEvent.keyDown(group, { key: "End" });
    expect(document.activeElement).toBe(dismissers[2]);
    fireEvent.keyDown(group, { key: "Home" });
    expect(document.activeElement).toBe(dismissers[0]);
  });

  it("draws the rail's own glyphs from the semantic facade at a token size", async () => {
    const container = await renderRail();
    for (const part of ["add-filter", "clear-all"]) {
      const glyph = container.querySelector(
        `[data-part="${part}"] [data-icon-name]`
      ) as SVGElement;
      expect(glyph.getAttribute("width")).toContain("var(--ds-icon-");
    }
  });
});
