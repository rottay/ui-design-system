import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernStack from "../engines/modern";

function TwoAnonymousFragments({ align }: { align: "center" | "start" }) {
  return (
    <ModernStack divider align={align} data-testid="stack">
      <>
        <span key="a">a</span>
        <span key="b">b</span>
      </>
      <>
        <span key="c">c</span>
        <span key="d">d</span>
      </>
    </ModernStack>
  );
}

describe("Stack modern engine - fragment children", () => {
  it("separates every member of two anonymous sibling fragments", () => {
    render(<TwoAnonymousFragments align="center" />);

    const root = screen.getByTestId("stack");
    expect(root.querySelectorAll('[data-part="divider"]')).toHaveLength(3);
    expect(root.textContent).toBe("abcd");
  });

  it("keeps member identity across a re-render", () => {
    const { rerender } = render(<TwoAnonymousFragments align="center" />);
    const before = screen.getByText("d");

    rerender(<TwoAnonymousFragments align="start" />);

    expect(screen.getByText("d")).toBe(before);
  });
});
