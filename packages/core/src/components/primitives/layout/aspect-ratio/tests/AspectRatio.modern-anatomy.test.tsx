import React from "react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ModernAspectRatio from "../engines/modern";

const skin = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../../../../foundation/tokens/css/presentation/components/skin/layout-primitives/index.css"
  ),
  "utf8"
);

describe("AspectRatio modern anatomy ownership", () => {
  it("lets a composing caller's data-part reach the DOM (P-79)", () => {
    render(
      <ModernAspectRatio data-part="media-frame" data-testid="frame">
        <img alt="" />
      </ModernAspectRatio>
    );

    expect(screen.getByTestId("frame")).toHaveAttribute(
      "data-part",
      "media-frame"
    );
  });

  it("stamps the default root part only when the caller passed none", () => {
    render(
      <ModernAspectRatio data-testid="frame">
        <img alt="" />
      </ModernAspectRatio>
    );

    expect(screen.getByTestId("frame")).toHaveAttribute("data-part", "root");
  });

  it("anchors every skin rule on the durable classes, never data-part", () => {
    expect(skin).toContain(".rottay-aspect-ratio.rottay-aspect-ratio--modern");
    expect(skin).not.toContain(
      '.rottay-aspect-ratio.rottay-aspect-ratio--modern[data-part="root"]'
    );
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
