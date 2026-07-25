import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RecordFactsEngine } from "../engines/shared";

describe("RecordFacts anatomy", () => {
  it("renders one labelled section with an internally segmented fact grid", () => {
    const { container } = render(
      <RecordFactsEngine
        ariaLabel="Professional background"
        title="Professional background"
        description="Current role and seniority"
        icon={<span>briefcase</span>}
        action={<button type="button">Edit section</button>}
        facts={[
          {
            key: "title",
            label: "Current title",
            value: "Senior QA Engineer",
            icon: <span>role</span>,
            span: 6,
            emphasis: "strong",
          },
          {
            key: "company",
            label: "Current company",
            value: "Elastic",
          },
          {
            key: "summary",
            label: "Summary",
            value: "Nine years building reliable systems.",
            span: "full",
            emphasis: "narrative",
          },
        ]}
      />
    );

    const root = screen.getByRole("region", {
      name: "Professional background",
    });
    expect(root).toHaveAttribute("data-columns", "12");
    expect(
      within(root).getByRole("heading", { name: "Professional background" })
    ).toBeInTheDocument();
    expect(
      within(root).getByRole("button", { name: "Edit section" })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[data-part="fact"]')).toHaveLength(3);
    expect(
      container.querySelector('[data-fact-key="summary"]')
    ).toHaveAttribute("data-emphasis", "narrative");
  });

  it("preserves engine loading, class and style contracts", () => {
    render(
      <RecordFactsEngine
        title="Identity"
        facts={[]}
        density="compact"
        loading
        action={<button type="button">Edit</button>}
        className="consumer-class"
        style={{ minHeight: 180 }}
      />
    );

    const root = screen.getByRole("region", { name: "Identity" });
    expect(root).toHaveClass("consumer-class");
    expect(root).toHaveAttribute("data-loading", "true");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveAttribute("data-density", "compact");
    expect(root).toHaveStyle({ minHeight: "180px" });
    expect(root.querySelectorAll('[data-part="skeleton"]')).toHaveLength(3);
    expect(
      within(root).queryByRole("button", { name: "Edit" })
    ).not.toBeInTheDocument();
  });
});
