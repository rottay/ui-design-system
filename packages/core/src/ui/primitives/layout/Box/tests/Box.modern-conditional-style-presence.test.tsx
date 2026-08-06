import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import ModernBox from "../engines/modern";

function ConditionalBox({ elevated }: { elevated: boolean }) {
  return (
    <ModernBox
      data-testid="box-conditional"
      rounded="xl"
      shadow="lg"
      style={{
        borderRadius: elevated ? "3px" : undefined,
        boxShadow: elevated ? "0 1px 2px #0002" : undefined,
      }}
    />
  );
}

describe("Modern Box conditional caller style presence", () => {
  it("keeps the governed radius/shadow stamps when the caller's conditional style resolves to undefined", () => {
    render(<ConditionalBox elevated={false} />);

    const box = screen.getByTestId("box-conditional");
    expect(box.style.borderRadius).toBe("");
    expect(box.style.boxShadow).toBe("");
    expect(box).toHaveAttribute("data-radius", "xl");
    expect(box).toHaveAttribute("data-shadow", "lg");
  });

  it("still yields the governed stamps to a defined caller style value", () => {
    render(<ConditionalBox elevated />);

    const box = screen.getByTestId("box-conditional");
    expect(box.style.borderRadius).toBe("3px");
    expect(box.style.boxShadow).toBe("0 1px 2px #0002");
    expect(box).not.toHaveAttribute("data-radius");
    expect(box).not.toHaveAttribute("data-shadow");
  });

  it("yields to a caller style value that paints the property off", () => {
    render(
      <ModernBox
        data-testid="box-off"
        rounded="xl"
        shadow="lg"
        style={{ borderRadius: 0, boxShadow: "none" }}
      />
    );

    const box = screen.getByTestId("box-off");
    expect(box.style.borderRadius).toBe("0px");
    expect(box.style.boxShadow).toBe("none");
    expect(box).not.toHaveAttribute("data-radius");
    expect(box).not.toHaveAttribute("data-shadow");
  });
});
