import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import postcss, { type AtRule, type Rule } from "postcss";
import { describe, expect, it } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";

import { TableToolbar } from "../index";
import { renderWithEngine } from "../../../../../tooling/testing/helpers/engine";

const SKIN = "src/foundation/tokens/css/presentation/components/skin/table-toolbar.css";

interface SkinRule {
  selector: string;
  conditions: string;
  decls: Record<string, string>;
}

function readRules(): SkinRule[] {
  const css = readFileSync(resolve(process.cwd(), SKIN), "utf8");
  const out: SkinRule[] = [];
  postcss.parse(css).walkRules((rule: Rule) => {
    const conditions: string[] = [];
    for (let node = rule.parent; node; node = node.parent) {
      if ((node as AtRule).type === "atrule") {
        const at = node as AtRule;
        if (at.name === "keyframes") return;
        conditions.push(`@${at.name} ${at.params}`);
      }
    }
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

/**
 * Selectors deliberately excluded from the reachability sweep:
 *  - the rustic arms. Rustic lands class AND part on one node (the shell IS
 *    the input), so `.__search-input.rottay-input` and the `--rustic` surface
 *    rule address a DOM this fixture does not render. Rustic is read-only for
 *    this programme; its own `[data-part='root']` defect is reported, not
 *    repaired here;
 *  - `:focus-within`, which needs a focused descendant to match.
 */
const EXEMPT = (selector: string): boolean =>
  selector.includes("--rustic") ||
  selector.includes("__search-input.rottay-input") ||
  selector.includes(":focus-within");

const withFilters = (
  <TableToolbar
    search=""
    onSearchChange={() => undefined}
    filters={<button type="button">Status</button>}
    actions={<button type="button">Extra</button>}
    primaryAction={{ label: "New", onClick: () => undefined }}
  />
);
const withoutFilters = (
  <TableToolbar
    search=""
    onSearchChange={() => undefined}
    primaryAction={{ label: "New", onClick: () => undefined }}
  />
);

async function renderToolbar(node: React.ReactElement): Promise<HTMLElement> {
  const { container } = renderWithEngine(node, "modern");
  await waitFor(() =>
    expect(container.querySelector('[data-part="root"]')).not.toBeNull()
  );
  await waitFor(() => expect(container.querySelector("input")).not.toBeNull());
  return container;
}

const winningDecl = (
  rules: SkinRule[],
  property: string,
  match: (rule: SkinRule) => boolean
): SkinRule | undefined => [...rules].reverse().find((r) => match(r) && property in r.decls);

// ---------------------------------------------------------------------------

describe("TableToolbar skin reachability", () => {
  it("every authored selector matches a node the family actually renders", async () => {
    const full = await renderToolbar(withFilters);
    const bare = await renderToolbar(withoutFilters);
    const unreachable: string[] = [];

    for (const rule of readRules()) {
      if (EXEMPT(rule.selector)) continue;
      const matches =
        full.querySelector(rule.selector) !== null ||
        bare.querySelector(rule.selector) !== null;
      if (!matches) unreachable.push(rule.selector);
    }

    // A rule predicated on a `data-part='root'` the component never stamps is
    // dead in every engine. Ten rules in this file were written that way.
    expect(unreachable).toEqual([]);
  });

  it("restores the row layout the dead block was meant to provide", async () => {
    const rules = readRules();
    const container = await renderToolbar(withFilters);

    const spacer = winningDecl(rules, "flex", (r) =>
      r.selector.includes("__spacer") && r.conditions === ""
    );
    expect(spacer, "the spacer holds the controls at the trailing edge").toBeDefined();
    expect(spacer!.decls.flex).toBe("1");
    expect(container.querySelector(spacer!.selector)).not.toBeNull();

    // Unconditional only: the tablet posture deliberately relaxes the cap to
    // 100%, and it sorts later.
    const field = winningDecl(
      rules,
      "max-inline-size",
      (r) => r.selector.endsWith("__search-field") && r.conditions === ""
    );
    expect(field, "the search field had no measure at all").toBeDefined();
    expect(field!.decls["max-inline-size"]).toContain("search-max");
    expect(container.querySelector(field!.selector)).not.toBeNull();
  });

  it("paints nothing on the primitive it composes, and relays instead", async () => {
    const rules = readRules();
    const container = await renderToolbar(withFilters);

    // This file is `rottay-components`; the Input skin is `rottay-engines`, a
    // LATER layer, so any property painted on the primitive's node loses — and
    // `[data-size='md']`'s `padding-inline` shorthand resets a
    // `padding-inline-start` well without naming it, which is how the glyph
    // ended up over the placeholder. Specificity cannot win this race; only
    // not painting there can.
    for (const rule of rules) {
      if (/rottay-input/.test(rule.selector)) {
        expect(Object.keys(rule.decls), rule.selector).toEqual([]);
      }
    }

    const field = rules.find(
      (r) => r.selector.endsWith("__search-field") && r.conditions === ""
    );
    expect(field).toBeDefined();
    // Each relay falls through to the EXACT root declaration, so a tenant with
    // no toolbar channel computes the primitive's own paint, unshifted.
    expect(field!.decls["--ds-input-bg"]).toBe(
      "var(--ds-toolbar-control-bg, var(--ds-color-bg-tertiary))"
    );
    expect(field!.decls["--ds-input-border"]).toBe(
      "var(--ds-toolbar-control-border, var(--ds-color-border-primary))"
    );
    expect(field!.decls["--ds-input-color"]).toBe(
      "var(--ds-toolbar-control-color, var(--ds-color-text-primary))"
    );

    // The glyph rides the primitive's affix slot, so it sits INSIDE the shell.
    const glyph = container.querySelector(
      '[data-part="search-input"] [data-part="search-icon"]'
    );
    expect(glyph, "the glyph must sit inside the field, not over it").not.toBeNull();
  });

  it("reads ground, rule and rhythm through the shared region channels", () => {
    const rules = readRules();
    const root = winningDecl(
      rules,
      "background",
      (r) =>
        r.selector === ".ds-structure.ds-table-toolbar[data-part='root']" &&
        r.conditions === ""
    );
    expect(root!.decls.background).toContain("--ds-toolbar-bg");

    const rule = winningDecl(rules, "border-bottom", (r) =>
      r.selector.includes("[data-structure='table-toolbar']") && r.conditions === ""
    );
    expect(rule!.decls["border-bottom"]).toContain("--ds-toolbar-border-bottom");

    const body = readFileSync(resolve(process.cwd(), SKIN), "utf8").replace(
      /\/\*[\s\S]*?\*\//g,
      ""
    );
    expect(body).toContain("--ds-list-shell-section-gap");
    expect(body).toContain("--ds-toolbar-gap");
    expect(body).toContain("--ds-toolbar-divider");
    // Flat by contract: the family reads no elevation channel.
    expect(body).not.toContain("--ds-toolbar-shadow");
  });

  it("answers narrow widths with a posture, not a compressed desktop", async () => {
    const rules = readRules();
    const container = await renderToolbar(withFilters);
    const at = (width: string) =>
      rules.filter((r) => r.conditions.includes(`(max-width: ${width})`));

    // Tablet: the search claims its own row before anything is squeezed.
    const tablet = at("64rem").find((r) => r.selector.includes("__search-field"));
    expect(tablet?.decls.flex).toBe("1 1 100%");

    // Phone: the controls stop hugging the trailing edge, and the forward
    // action becomes a full-width commit control.
    const phone = at("40rem");
    expect(
      phone.find((r) => r.selector.includes("__right"))?.decls["justify-content"]
    ).toBe("flex-start");
    const primary = phone.find((r) =>
      r.selector.includes("[data-part='primary-action']")
    );
    expect(primary?.decls.flex).toBe("1 1 auto");
    expect(container.querySelector(primary!.selector)).not.toBeNull();

    // Every posture answers the toolbar's own width against a declared
    // container name — never the viewport's.
    const body = readFileSync(resolve(process.cwd(), SKIN), "utf8");
    expect(body).toContain("container: ds-table-toolbar / inline-size");
    for (const rule of rules) {
      if (rule.conditions.includes("@container")) {
        expect(rule.conditions).toContain("ds-table-toolbar");
      }
    }
  });

  it("retires the divider only where it separates nothing", async () => {
    const bare = await renderToolbar(withoutFilters);
    const full = await renderToolbar(withFilters);
    const orphan =
      ".ds-structure.ds-table-toolbar .ds-table-toolbar__divider[data-part='divider']:first-child";
    // No filters cluster => the divider leads the control cluster.
    expect(bare.querySelector(orphan)).not.toBeNull();
    // With filters it separates two real clusters and keeps its paint.
    expect(full.querySelector(orphan)).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe("TableToolbar anatomy", () => {
  it("names the search landmark and its field instead of leaning on the placeholder", async () => {
    const container = await renderToolbar(withoutFilters);
    const landmark = container.querySelector('[role="search"]') as HTMLElement;
    expect(landmark.getAttribute("aria-label")).toBe("Search");
    expect(container.querySelector("input")?.getAttribute("aria-label")).toBe("Search");
  });

  it("draws every glyph from the semantic facade at a token size", async () => {
    const container = await renderToolbar(withoutFilters);
    const glyphs = Array.from(container.querySelectorAll<SVGElement>("[data-icon-name]"));
    expect(glyphs.map((g) => g.getAttribute("data-icon-name")).sort()).toEqual([
      "action.add",
      "action.search",
    ]);
    for (const glyph of glyphs) {
      expect(glyph.getAttribute("width")).toContain("var(--ds-icon-");
    }
  });

  it("makes the control cluster a labelled toolbar with APG arrow movement", async () => {
    const container = await renderToolbar(withFilters);
    const toolbar = container.querySelector('[role="toolbar"]') as HTMLElement;
    expect(toolbar.getAttribute("aria-label")).toBe("Table actions");

    const controls = Array.from(toolbar.querySelectorAll("button"));
    expect(controls.length).toBeGreaterThanOrEqual(3);

    controls[0].focus();
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(document.activeElement).toBe(controls[1]);
    fireEvent.keyDown(toolbar, { key: "End" });
    expect(document.activeElement).toBe(controls[controls.length - 1]);
    fireEvent.keyDown(toolbar, { key: "Home" });
    expect(document.activeElement).toBe(controls[0]);
    fireEvent.keyDown(toolbar, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(controls[controls.length - 1]);
  });
});
