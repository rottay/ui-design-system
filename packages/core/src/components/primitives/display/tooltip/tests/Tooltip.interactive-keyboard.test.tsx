import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernTooltip from "../engines/modern";

function renderInteractive() {
  render(
    <ModernTooltip
      interactive
      trigger="click"
      content={
        <>
          <button type="button">Read the runbook</button>
          <button type="button">Escalate</button>
        </>
      }
    >
      <button type="button">Details</button>
    </ModernTooltip>
  );
  const trigger = screen.getByRole("button", { name: "Details" });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

describe("ModernTooltip interactive keyboard reach", () => {
  it("moves focus into the portalled dialog on Tab from the trigger", () => {
    const trigger = renderInteractive();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Tab" });

    // The bubble is portalled out of the trigger's ancestry, so DOM order
    // alone would skip the dialog the trigger just opened.
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Read the runbook" })
    );
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });

  it("returns focus to the trigger on Shift+Tab off the first control", () => {
    const trigger = renderInteractive();
    const firstControl = screen.getByRole("button", { name: "Read the runbook" });
    firstControl.focus();

    fireEvent.keyDown(firstControl, { key: "Tab", shiftKey: true });

    expect(document.activeElement).toBe(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not trap forward Tab past the last control", () => {
    const trigger = renderInteractive();
    const lastControl = screen.getByRole("button", { name: "Escalate" });
    lastControl.focus();

    fireEvent.keyDown(lastControl, { key: "Tab" });

    // A tooltip is not a modal: the forward exit stays native, so focus must
    // not be bounced back to the trigger.
    expect(document.activeElement).not.toBe(trigger);
  });

  it("leaves Tab alone for a non-interactive tooltip", () => {
    render(
      <ModernTooltip content="Plain description" trigger="click">
        <button type="button">Info</button>
      </ModernTooltip>
    );
    const trigger = screen.getByRole("button", { name: "Info" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Tab" });

    expect(document.activeElement).toBe(trigger);
  });

  it("still dismisses with Escape and hands focus back to the trigger", () => {
    const trigger = renderInteractive();
    const firstControl = screen.getByRole("button", { name: "Read the runbook" });
    firstControl.focus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
