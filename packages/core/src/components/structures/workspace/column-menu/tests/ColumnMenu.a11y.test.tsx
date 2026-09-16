/**
 * What assistive technology can reach in the column menu: the panel opens as a
 * named dialog and its collapsible groups report their own expansion on the
 * control that changes it. Behaviour, never the text of a rule.
 */
import React from "react";

import { describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { ColumnMenu } from "../index";
import { renderWithEngine } from "@tests/support/engine";

async function openMenu(): Promise<void> {
  const { container } = renderWithEngine(
    <ColumnMenu
      columns={[
        { key: "name", title: "Name", group: "core" },
        { key: "email", title: "Email", group: "core" },
      ]}
      visibleColumns={["name"]}
      onColumnsChange={() => undefined}
      onReset={() => undefined}
      groups={[{ key: "core", label: "Core", columns: ["name", "email"] }]}
    />,
    "modern"
  );
  // The engine resolves its primitives lazily; the control appears after it.
  const control = await waitFor(() => {
    const node = container.querySelector('[data-part="control"]') as HTMLElement;
    expect(node).not.toBeNull();
    return node;
  });
  fireEvent.click(control);
}

describe("ColumnMenu accessibility", () => {
  it("opens a dialog that announces its own name", async () => {
    await openMenu();

    const panel = await screen.findByRole("dialog");
    expect(panel).toHaveAccessibleName();
  });

  it("reports each column group's expansion on its own toggle", async () => {
    await openMenu();
    const panel = await screen.findByRole("dialog");

    const toggle = await waitFor(() => {
      const node = panel.querySelector('[data-part="group-toggle"]') as HTMLElement;
      expect(node).not.toBeNull();
      return node;
    });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute("aria-expanded", "false"));
  });
});
