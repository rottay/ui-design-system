import React, { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernAspectRatio from "../engines/modern";

describe("AspectRatio modern premium contract", () => {
  it("forwards semantics, ref, and caller-owned anatomy", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ModernAspectRatio
        ref={ref}
        role="group"
        aria-label="Candidate introduction"
        lang="en"
        data-part="consumer-value"
      >
        <video />
      </ModernAspectRatio>
    );

    const frame = screen.getByRole("group", { name: "Candidate introduction" });
    expect(frame).toHaveAttribute("data-part", "consumer-value");
    expect(frame).toHaveAttribute("lang", "en");
    expect(ref.current).toBe(frame);
  });

  it("falls back safely for zero, negative, and non-finite ratios", () => {
    const { rerender } = render(
      <ModernAspectRatio ratio={0} data-testid="frame">
        Content
      </ModernAspectRatio>
    );
    expect(screen.getByTestId("frame")).toHaveAttribute(
      "data-invalid-ratio",
      "true"
    );
    expect(screen.getByTestId("frame")).toHaveAttribute(
      "data-ratio",
      `${16 / 9}`
    );

    rerender(
      <ModernAspectRatio ratio={Number.NaN} data-testid="frame">
        Content
      </ModernAspectRatio>
    );
    expect(screen.getByTestId("frame")).toHaveAttribute(
      "data-ratio",
      `${16 / 9}`
    );

    rerender(
      <ModernAspectRatio ratio={-2} data-testid="frame">
        Content
      </ModernAspectRatio>
    );
    expect(screen.getByTestId("frame")).toHaveAttribute(
      "data-ratio",
      `${16 / 9}`
    );
  });

  it("supports numeric max width without horizontal overflow", () => {
    render(
      <ModernAspectRatio maxWidth={640} data-testid="frame">
        Content
      </ModernAspectRatio>
    );

    const frame = screen.getByTestId("frame");
    expect(
      frame.style.getPropertyValue("--ds-aspect-ratio-instance-max-width")
    ).toBe("640px");
    expect(frame).toHaveAttribute("data-component", "aspect-ratio");
  });

  it("carries the reserved ratio and nothing else inline", () => {
    render(<ModernAspectRatio data-testid="frame">Content</ModernAspectRatio>);

    const frame = screen.getByTestId("frame");
    const inlineStyle = frame.getAttribute("style") ?? "";
    expect(inlineStyle).toContain("--ds-aspect-ratio-instance-ratio");
    expect(inlineStyle).not.toContain("--ds-aspect-ratio-instance-max-width");
    const declared = inlineStyle
      .split(";")
      .map((entry) => entry.split(":")[0]?.trim())
      .filter((name): name is string => Boolean(name));
    expect(declared.every((name) => name.startsWith("--ds-"))).toBe(true);
    expect(frame.className).toContain("ds-aspect-ratio--modern");
  });
});
