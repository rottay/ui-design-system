import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernAspectRatio from "../engines/modern";

describe("AspectRatio modern anatomy ownership", () => {
  it("keeps its own root part when a composing caller passes a data-part (P-88)", () => {
    const { container } = render(
      <ModernAspectRatio data-part="media-frame" data-testid="frame">
        <img alt="" />
      </ModernAspectRatio>
    );

    expect(screen.getByTestId("frame")).toHaveAttribute("data-part", "root");
    expect(container.querySelector('[data-part="media-frame"]')).toBeNull();
  });

  it("stamps the root part when the caller passed none", () => {
    render(
      <ModernAspectRatio data-testid="frame">
        <img alt="" />
      </ModernAspectRatio>
    );

    expect(screen.getByTestId("frame")).toHaveAttribute("data-part", "root");
  });

  it("does not leak the engine selector prop onto the media frame", () => {
    render(
      <ModernAspectRatio engine="modern" data-testid="frame">
        <img alt="" />
      </ModernAspectRatio>
    );

    expect(screen.getByTestId("frame").hasAttribute("engine")).toBe(false);
  });
});
