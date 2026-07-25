import React from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import {
  renderWithEngine,
  STABLE_ENGINES,
} from "../../../../../tooling/testing/helpers/engine";

describe("Box integration", () => {
  it.each(STABLE_ENGINES)(
    "renders the live box with the %s engine",
    async (engine) => {
      const { Box } = await import("..");

      renderWithEngine(
        <Box
          engine={engine}
          padding="md"
          rounded="lg"
          shadow="sm"
          data-testid="box"
          aria-label="Layout container"
        >
          Box content
        </Box>,
        engine
      );

      const box = await screen.findByTestId("box", undefined, {
        timeout: 10000,
      });
      expect(box).toBeInTheDocument();
      expect(box).toHaveAttribute("aria-label", "Layout container");
      expect(screen.getByText("Box content")).toBeInTheDocument();
    },
    15000
  );
});
