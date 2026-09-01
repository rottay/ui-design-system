import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernGrid from "../engines/modern";

describe("ModernGrid responsive templates", () => {
  it("projects responsive templates into the shared layout stylesheet", () => {
    const { container } = render(
      <ModernGrid columns={{ xs: 1, md: 3 }} rows={{ xs: 1, lg: 2 }}>
        Content
      </ModernGrid>
    );

    const grid = container.querySelector('[data-component="grid"]');
    expect(grid).toHaveAttribute("data-grid-id");
    expect(grid).toHaveAttribute("data-grid-columns", "xs md");
    expect(grid).toHaveAttribute("data-grid-rows", "xs lg");
    expect(grid).toHaveStyle(
      "--_ds-grid-columns-xs: repeat(1, minmax(0, 1fr)); --_ds-grid-columns-md: repeat(3, minmax(0, 1fr))"
    );
    expect(grid).toHaveStyle(
      "--_ds-grid-rows-xs: repeat(1, minmax(0, 1fr)); --_ds-grid-rows-lg: repeat(2, minmax(0, 1fr))"
    );
    expect(container.querySelector("style")).toBeNull();
  });
});
