import React from "react";

import { describe, expect, it } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";

import { ColumnMenu } from "../index";
import { renderWithEngine } from "@tests/support/engine";
import {
  readSkinDeclarations,
  readSkinRules,
  unreachableSelectors,
  waitForPortalContent,
} from "@tests/support/skin-reachability";

const SURFACE = '.ds-structure.ds-column-menu-panel[data-part="surface"]';

/**
 * Full-surface fixture. Every optional prop is supplied on purpose: `actions`,
 * `groups`, `pinnedColumns` and `columnWidths` each gate a whole region of the
 * panel, and omitting one reports its rules as dead.
 */
async function openMenu(): Promise<HTMLElement> {
  const { container } = renderWithEngine(
    <ColumnMenu
      columns={[
        { key: "name", title: "Name", group: "core" },
        { key: "email", title: "Email", group: "core" },
        { key: "notes", title: "Notes" },
      ]}
      visibleColumns={["name", "notes"]}
      onColumnsChange={() => undefined}
      onReset={() => undefined}
      actions={[
        { key: "edit", title: "Edit" },
        { key: "delete", title: "Delete", locked: true },
      ]}
      visibleActions={["edit"]}
      onVisibleActionsChange={() => undefined}
      pinnedColumns={{ left: ["name"], right: [] }}
      onPinChange={() => undefined}
      columnWidths={{ name: 200 }}
      onColumnResize={() => undefined}
      groups={[{ key: "core", label: "Core", columns: ["name", "email"] }]}
    />,
    "modern"
  );
  const control = await waitFor(() => {
    const node = container.querySelector('[data-part="control"]') as HTMLElement;
    expect(node).not.toBeNull();
    return node;
  });
  fireEvent.click(control);
  // Content-level gate. Waiting on the surface alone samples an empty panel
  // and reports every content rule as dead — 44 false findings, measured.
  return waitForPortalContent(waitFor, SURFACE, '[data-part="row"]', 1);
}

/**
 * Excluded with reasons, never to make the sweep pass:
 *  - drag state: needs a pointer drag this fixture does not perform;
 *  - `width-input`: the resize affordance is opened by a further interaction.
 */
const EXEMPT = (selector: string): boolean =>
  selector.includes("data-dragging") ||
  selector.includes("data-drag-target") ||
  selector.includes('[data-part="width-input"]');

describe("ColumnMenu skin reachability", () => {
  it("the panel is portalled out of the render container", async () => {
    const { container } = renderWithEngine(
      <ColumnMenu
        columns={[{ key: "name", title: "Name" }]}
        visibleColumns={["name"]}
        onColumnsChange={() => undefined}
        onReset={() => undefined}
      />,
      "modern"
    );
    const control = await waitFor(() => {
      const node = container.querySelector('[data-part="control"]') as HTMLElement;
      expect(node).not.toBeNull();
      return node;
    });
    fireEvent.click(control);
    const surface = await waitForPortalContent(waitFor, SURFACE, '[data-part="panel"]');
    // This is why the sweep below queries `document`: a container-scoped
    // search would find none of the panel's anatomy.
    expect(container.contains(surface)).toBe(false);
    expect(surface.className).toContain("ds-structure");
    expect(surface.className).toContain("ds-column-menu-panel");
  });

  it("every authored selector matches a node the family actually renders", async () => {
    await openMenu();
    expect(
      unreachableSelectors({
        rules: readSkinRules("column-menu"),
        scopes: [document],
        exempt: EXEMPT,
      })
    ).toEqual([]);
  });

  it("the narrow posture queries a container this file declares", () => {
    // A `@container` block naming an undeclared container never fires and
    // never errors — the whole posture would be silently absent. Both
    // spellings are read: the shorthand and the `container-name` longhand.
    const css = readSkinDeclarations("column-menu");
    const declared = new Set<string>();
    for (const [, name] of css.matchAll(/container-name:\s*([\w-]+)/g)) declared.add(name);
    for (const [, name] of css.matchAll(/container:\s*([\w-]+)\s*\//g)) declared.add(name);

    const queried = [...css.matchAll(/@container\s+([\w-]+)\s*\(/g)].map(([, name]) => name);
    expect(queried.length).toBeGreaterThan(0);
    for (const name of queried) expect(declared, name).toContain(name);

    // Viewport queries would measure the document, not the portalled panel.
    expect(css).not.toMatch(/@media[^{]*(min|max)-width/);
  });

  it("every part the narrow posture names is stamped by the family", async () => {
    await openMenu();
    const rules = readSkinRules("column-menu").filter((rule) =>
      rule.conditions.includes("@container")
    );
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(document.querySelector(rule.selector), rule.selector).not.toBeNull();
    }
  });

  it("panel rules are scoped to the panel, not nested under the trigger", () => {
    // The named portal failure: a panel rule written under the trigger's class
    // silently no-ops, because the panel is not a DOM descendant of it.
    const rules = readSkinRules("column-menu");
    const panelParts = rules.filter((rule) =>
      /\[data-part="(panel|header|footer|row|scroll-region|action-section)"\]/.test(
        rule.selector
      )
    );
    expect(panelParts.length).toBeGreaterThan(0);
    for (const rule of panelParts) {
      expect(rule.selector, rule.selector).toContain("ds-column-menu-panel");
    }
  });
});
