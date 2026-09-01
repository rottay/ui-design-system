import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernDivider from "../engines/modern";

describe("Divider modern composite label", () => {
  it("names the separator from interpolated text children", () => {
    const index = 3;
    render(<ModernDivider>Section {index}</ModernDivider>);

    expect(
      screen.getByRole("separator", { name: "Section 3" })
    ).toBeInTheDocument();
  });

  it("names the separator from element children", () => {
    render(
      <ModernDivider>
        <strong>Or continue with</strong>
      </ModernDivider>
    );

    expect(
      screen.getByRole("separator", { name: "Or continue with" })
    ).toBeInTheDocument();
  });

  it("lets an explicit aria-label win over the rendered content", () => {
    render(
      <ModernDivider aria-label="Payment options" data-testid="divider">
        <strong>Or continue with</strong>
      </ModernDivider>
    );

    expect(
      screen.getByRole("separator", { name: "Payment options" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("divider")).not.toHaveAttribute(
      "aria-labelledby"
    );
  });
});
