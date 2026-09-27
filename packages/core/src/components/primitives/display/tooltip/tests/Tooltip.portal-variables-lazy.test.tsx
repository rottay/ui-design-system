/**
 * A CLOSED tooltip never walks its anchor's computed custom properties for a lineage mutation;
 * the bubble still carries the current `--ds-*` scope the moment it opens, and follows it while
 * open.
 */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import * as theme from "../../../runtime/overlay/foundation/portal-theme";
import ModernTooltip from "../engines/modern";

vi.mock("../../../runtime/overlay/foundation/portal-theme", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../runtime/overlay/foundation/portal-theme")>();
  return { ...actual, readDsPortalVariables: vi.fn(actual.readDsPortalVariables) };
});

const walks = () => vi.mocked(theme.readDsPortalVariables).mock.calls.length;
const flushMutations = () => act(async () => {
  await Promise.resolve();
});

function Board({ open }: { open: boolean }) {
  return (
    <div data-testid="cell" data-ds-root="">
      <ModernTooltip content="Remove: Pipeline" visible={open}>
        <button type="button">Remove</button>
      </ModernTooltip>
    </div>
  );
}

describe("ModernTooltip -- portal variables are read by the open bubble, not by a closed one", () => {
  it("ancestor style mutations while closed walk nothing; opening carries the current scope", async () => {
    vi.mocked(theme.readDsPortalVariables).mockClear();
    const { rerender } = render(<Board open={false} />);
    const afterMount = walks();
    expect(afterMount).toBeGreaterThan(0);

    const cell = screen.getByTestId("cell");
    for (const value of ["1 / span 3", "4 / span 3", "7 / span 3"]) {
      cell.setAttribute("style", `--ds-widget-board-cell-column: ${value}`);
      await flushMutations();
    }
    expect(walks()).toBe(afterMount);
    expect(screen.queryByRole("tooltip")).toBeNull();

    rerender(<Board open />);
    const bubble = screen.getByRole("tooltip");
    expect(bubble.style.getPropertyValue("--ds-widget-board-cell-column")).toBe("7 / span 3");
    expect(walks()).toBeGreaterThan(afterMount);
  });

  it("while open, a lineage mutation re-reads and the bubble follows it", async () => {
    render(<Board open />);
    const opened = walks();
    screen.getByTestId("cell").setAttribute("style", "--ds-widget-board-cell-column: 2 / span 6");
    await flushMutations();
    expect(walks()).toBeGreaterThan(opened);
    expect(screen.getByRole("tooltip").style.getPropertyValue("--ds-widget-board-cell-column")).toBe("2 / span 6");
  });
});
