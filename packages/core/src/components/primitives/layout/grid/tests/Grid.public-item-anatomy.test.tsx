import React from "react";
import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";

import { renderWithEngine } from "@tests/support/engine";
import { Grid, GridItem } from "..";

// The modern skin's cell floor keys on `> [data-part='grid-cell']`: the PUBLIC
// item must stamp it, not only the engine-internal ModernGridItem.
const CELL = ".rottay-grid.rottay-grid--modern[data-component='grid'] > [data-part='grid-cell'][data-component='grid-item']";

describe("Grid.Item (public) anatomy", () => {
  it("stamps grid-cell / grid-item directly under a modern Grid", async () => {
    const { container } = renderWithEngine(
      <Grid columns={2}>
        <Grid.Item>a</Grid.Item>
        <GridItem>b</GridItem>
      </Grid>,
      "modern",
    );
    await waitFor(() => expect(container.querySelectorAll(CELL)).toHaveLength(2));
  });

  it("keeps a caller-owned data-part and still stamps the owned data-component", async () => {
    const { container } = renderWithEngine(
      <Grid columns={2}>
        <Grid.Item data-part="tile">a</Grid.Item>
      </Grid>,
      "modern",
    );
    await waitFor(() => expect(container.querySelector("[data-part='tile']")).not.toBeNull());
    expect(container.querySelector("[data-part='tile']")).toHaveAttribute("data-component", "grid-item");
  });
});
