import React, { createRef } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernAspectRatio from "../engines/modern";

const layoutSkin = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/layout-primitives.css"
  ),
  "utf8"
);

describe("AspectRatio modern premium contract", () => {
  it("forwards semantics and ref while protecting its anatomy", () => {
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
    expect(frame).toHaveAttribute("data-part", "root");
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
    expect(layoutSkin).toContain("inline-size: 100%");
    expect(layoutSkin).toContain("min-inline-size: 0");
  });

  it("exposes only token-backed visual craft and reduced-motion behavior", () => {
    render(<ModernAspectRatio data-testid="frame">Content</ModernAspectRatio>);

    const frame = screen.getByTestId("frame");
    const inlineStyle = frame.getAttribute("style") ?? "";
    expect(inlineStyle).toContain("--ds-aspect-ratio-instance-ratio");
    expect(layoutSkin).toContain("--ds-aspect-ratio-background");
    expect(layoutSkin).toContain("--ds-aspect-ratio-border");
    expect(layoutSkin).toContain("--ds-aspect-ratio-radius");
    expect(layoutSkin).toContain("--ds-aspect-ratio-shadow");
    expect(layoutSkin).toContain("prefers-reduced-motion: reduce");
  });
});
