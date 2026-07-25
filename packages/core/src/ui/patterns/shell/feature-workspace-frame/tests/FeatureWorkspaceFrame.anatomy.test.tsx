import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeatureWorkspaceFrameEngine } from "../engines/shared";

describe("FeatureWorkspaceFrame anatomy", () => {
  it("keeps navigation and content in distinct, queryable layout lanes", () => {
    const { container } = render(
      <FeatureWorkspaceFrameEngine
        ariaLabel="Candidate workspace"
        width="wide"
        stickyNavigation
        navigation={<nav aria-label="Candidate views">Views</nav>}
      >
        <main>Candidate content</main>
      </FeatureWorkspaceFrameEngine>
    );

    const root = screen.getByRole("region", { name: "Candidate workspace" });
    expect(root).toHaveAttribute("data-part", "root");
    expect(root).toHaveAttribute("data-width", "wide");
    expect(root).toHaveAttribute("data-has-navigation", "true");
    expect(root).toHaveAttribute("data-loading", "false");
    expect(container.querySelector('[data-part="frame"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="navigation"]')).toHaveAttribute(
      "data-sticky",
      "true"
    );
    expect(
      container.querySelector('[data-part="navigation-viewport"]')
    ).toContainElement(
      screen.getByRole("navigation", { name: "Candidate views" })
    );
    expect(container.querySelector('[data-part="content"]')).toHaveTextContent(
      "Candidate content"
    );
  });

  it("replaces content with a stable loading skeleton and preserves caller hooks", () => {
    const { container } = render(
      <FeatureWorkspaceFrameEngine
        className="consumer-class"
        style={{ minHeight: 320 }}
        loading
      >
        Loaded content
      </FeatureWorkspaceFrameEngine>
    );

    const root = container.querySelector(".ds-pattern-feature-workspace-frame");
    expect(root).toHaveClass("consumer-class");
    expect(root).toHaveAttribute("data-loading", "true");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveStyle({ minHeight: "320px" });
    expect(
      container.querySelector('[data-part="loading-skeleton"]')
    ).toBeInTheDocument();
    expect(screen.queryByText("Loaded content")).not.toBeInTheDocument();
  });
});
