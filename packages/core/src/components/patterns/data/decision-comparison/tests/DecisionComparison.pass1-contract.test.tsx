import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DecisionComparisonEngine } from "../engines/foundation";

const subjects = [
  {
    key: "lucia",
    title: "Lucía Fernández",
    subtitle: "Senior Product Designer",
    score: 92,
    scoreLabel: "/ 100 verified",
    leading: true,
    badges: <span>Decision ready</span>,
    visualization: <span>Evidence radar</span>,
    facts: [
      { key: "fit", label: "Role fit", value: "9/10", tone: "positive" as const },
      { key: "risk", label: "Open risk", value: "Leadership", supporting: "Validate tomorrow" },
    ],
    actions: <button type="button">Open full record</button>,
    footnote: "Nine authorized sources",
  },
  {
    key: "marina",
    title: "Marina Costa",
    subtitle: "Product systems lead",
    score: 86,
    scoreLabel: "/ 100 verified",
    facts: [
      { key: "fit", label: "Role fit", value: "8/10" },
      { key: "risk", label: "Open risk", value: "Availability" },
    ],
  },
];

describe("DecisionComparison Pass 1 product contract", () => {
  it("exposes one labelled, busy-aware instrument with aligned subject anatomy", () => {
    const { container } = render(
      <DecisionComparisonEngine
        ariaLabel="Candidate comparison"
        context={<span>Senior Product Designer</span>}
        contextMeta={<span>2 of 4 selected</span>}
        toolbar={<button type="button">Add candidate</button>}
        verdict={<span>Lucía leads on verified delivery evidence.</span>}
        subjects={subjects}
        insight={<span>Compare panel evidence next.</span>}
        loading
      />
    );

    const root = screen.getByRole("region", { name: "Candidate comparison" });
    expect(root).toHaveAttribute("data-loading", "true");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveAttribute("data-subject-count", "2");
    expect(root).toHaveAttribute("data-has-toolbar", "true");
    expect(root).toHaveAttribute("data-has-verdict", "true");
    expect(root).toHaveAttribute("data-has-insight", "true");

    const renderedSubjects = container.querySelectorAll('[data-part="subject"]');
    expect(renderedSubjects).toHaveLength(2);
    expect(renderedSubjects[0]).toHaveAttribute("data-leading", "true");
    expect(renderedSubjects[0]).toHaveAttribute("aria-labelledby");
    expect(renderedSubjects[1]).toHaveAttribute("data-leading", "false");
    expect(container.querySelectorAll('[data-part="fact"]')).toHaveLength(4);
    expect(within(root).getByRole("button", { name: "Open full record" })).toBeInTheDocument();
  });

  it("keeps empty, density and optional-section states truthful", () => {
    const { container } = render(
      <DecisionComparisonEngine
        ariaLabel="Empty comparison"
        subjects={[]}
        density="comfortable"
        emptyState={<span>Select two records to compare.</span>}
      />
    );

    const root = screen.getByRole("region", { name: "Empty comparison" });
    expect(root).toHaveAttribute("data-density", "comfortable");
    expect(root).toHaveAttribute("data-subject-count", "0");
    expect(root).toHaveAttribute("data-has-toolbar", "false");
    expect(root).toHaveAttribute("data-has-verdict", "false");
    expect(root).toHaveAttribute("data-has-insight", "false");
    expect(root).not.toHaveAttribute("aria-busy");
    expect(container.querySelector('[data-part="empty-state"]')).toHaveTextContent(
      "Select two records to compare."
    );
  });
});
