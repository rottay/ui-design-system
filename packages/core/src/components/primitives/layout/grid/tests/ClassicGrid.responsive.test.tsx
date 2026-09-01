import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ClassicGrid } from "../engines/classic";

describe("ClassicGrid responsive templates", () => {
  it("projects responsive templates into the shared layout stylesheet", () => {
    const { container } = render(
      <ClassicGrid columns={{ xs: 1, lg: 4 }} rows={{ xs: 1, xl: 2 }}>
        Content
      </ClassicGrid>
    );

    const grid = container.querySelector('[data-component="grid"]');
    expect(grid).toHaveAttribute("data-grid-id");
    expect(grid).toHaveAttribute("data-grid-columns", "xs lg");
    expect(grid).toHaveAttribute("data-grid-rows", "xs xl");
    expect(grid).toHaveStyle(
      "--_ds-grid-columns-xs: repeat(1, 1fr); --_ds-grid-columns-lg: repeat(4, 1fr)"
    );
    expect(grid).toHaveStyle(
      "--_ds-grid-rows-xs: repeat(1, 1fr); --_ds-grid-rows-xl: repeat(2, 1fr)"
    );
    expect(container.querySelector("style")).toBeNull();
  });
});
