import React from "react";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  FEATURE_PICTOGRAM_CORPUS,
  FEATURE_PICTOGRAM_NAMES,
  FEATURE_PICTOGRAM_PROVENANCE,
  FeaturePictogram,
  isFeaturePictogramName,
} from "..";

describe("FeaturePictogram", () => {
  it("keeps corpus, artwork and provenance exhaustive and supplier-free", () => {
    expect(FEATURE_PICTOGRAM_NAMES).toHaveLength(8);
    expect(FEATURE_PICTOGRAM_CORPUS.map((entry) => entry.name)).toEqual(
      FEATURE_PICTOGRAM_NAMES
    );
    expect(Object.keys(FEATURE_PICTOGRAM_PROVENANCE)).toEqual(
      FEATURE_PICTOGRAM_NAMES
    );
    expect(
      Object.values(FEATURE_PICTOGRAM_PROVENANCE).every(
        (entry) =>
          entry.source === "rottay-original" &&
          entry.rendering === "local-svg-ssr"
      )
    ).toBe(true);
    expect(isFeaturePictogramName("candidate-evidence")).toBe(true);
    expect(isFeaturePictogramName("lucide.Briefcase")).toBe(false);
  });

  it("server-renders every registered artwork deterministically", () => {
    for (const name of FEATURE_PICTOGRAM_NAMES) {
      const first = renderToStaticMarkup(
        <FeaturePictogram name={name} decorative />
      );
      const second = renderToStaticMarkup(
        <FeaturePictogram name={name} decorative />
      );
      expect(second).toBe(first);
      expect(first).toContain(`data-pictogram-name="${name}"`);
      expect(first).toContain('data-pictogram-source="rottay-original"');
      expect(first).not.toContain("lucide");
      expect(first).not.toContain("phosphor");
      expect(first).not.toContain("<image");
      expect(first).not.toContain(" href=");
    }
  });

  it("enforces explicit accessible intent", () => {
    const { getByRole, rerender, container } = render(
      <FeaturePictogram name="candidate-evidence" label="Candidate evidence" />
    );
    expect(getByRole("img", { name: "Candidate evidence" })).toBeTruthy();
    expect(container.querySelector("title")?.textContent).toBe(
      "Candidate evidence"
    );

    rerender(<FeaturePictogram name="candidate-evidence" decorative />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true"
    );
    expect(container.querySelector("title")).toBeNull();
  });

  it("fails closed for unknown names, invalid sizes and ambiguous accessibility", () => {
    const consoleSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const Unsafe = FeaturePictogram as React.ComponentType<
      Record<string, unknown>
    >;
    const { container, rerender } = render(
      <Unsafe name="remote.svg" decorative />
    );
    expect(container.querySelector("svg")).toBeNull();

    rerender(<Unsafe name="empty-search" size={16} decorative />);
    expect(container.querySelector("svg")).toBeNull();

    rerender(<Unsafe name="empty-search" />);
    expect(container.querySelector("svg")).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("bounds optical sizes and exposes only finish metadata", () => {
    const { getByTestId, rerender } = render(
      <FeaturePictogram
        name="secure-access"
        size="sm"
        tone="success"
        decorative
        data-testid="p"
      />
    );
    const pictogram = getByTestId("p");
    expect(pictogram.getAttribute("width")).toBe("32");
    expect(pictogram.getAttribute("height")).toBe("32");
    expect(pictogram.getAttribute("data-pictogram-tone")).toBe("success");

    rerender(
      <FeaturePictogram
        name="secure-access"
        size={96}
        tone="neutral"
        decorative
        data-testid="p"
      />
    );
    expect(getByTestId("p").getAttribute("width")).toBe("96");
  });
});
