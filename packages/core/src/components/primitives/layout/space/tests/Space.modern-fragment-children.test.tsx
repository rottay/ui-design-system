import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernSpace from "../engines/modern";

function TwoAnonymousFragments({ align }: { align: "center" | "start" }) {
  return (
    <ModernSpace split="/" align={align} data-testid="space">
      <>
        <span key="a">a</span>
        <span key="b">b</span>
      </>
      <>
        <span key="c">c</span>
        <span key="d">d</span>
      </>
    </ModernSpace>
  );
}

describe("Space modern engine - fragment children", () => {
  it("separates every member of two anonymous sibling fragments", () => {
    render(<TwoAnonymousFragments align="center" />);

    const root = screen.getByTestId("space");
    expect(root.querySelectorAll('[data-part="separator"]')).toHaveLength(3);
    expect(root.textContent).toBe("a/b/c/d");
  });

  it("keeps member identity across a re-render", () => {
    const { rerender } = render(<TwoAnonymousFragments align="center" />);
    const before = screen.getByText("d");

    rerender(<TwoAnonymousFragments align="start" />);

    expect(screen.getByText("d")).toBe(before);
  });
});
