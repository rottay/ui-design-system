import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RusticGrid } from "../engines/rustic";

describe("RusticGrid responsive templates", () => {
  it("projects responsive templates into the shared layout stylesheet", () => {
    const { container } = render(
      <RusticGrid
        data-testid="grid"
        columns={{ xs: 1, md: 3 }}
        rows={{ xs: 1, lg: 2 }}
      >
        Content
      </RusticGrid>
    );

    const grid = container.querySelector('[data-component="grid"]');
    expect(grid).toHaveAttribute("data-grid-id");
    expect(grid).toHaveAttribute("data-grid-columns", "xs md");
    expect(grid).toHaveAttribute("data-grid-rows", "xs lg");
    expect(grid).toHaveStyle(
      "--_ds-grid-columns-xs: repeat(1, 1fr); --_ds-grid-columns-md: repeat(3, 1fr)"
    );
    expect(grid).toHaveStyle(
      "--_ds-grid-rows-xs: repeat(1, 1fr); --_ds-grid-rows-lg: repeat(2, 1fr)"
    );
    expect(container.querySelector("style")).toBeNull();
  });
});
