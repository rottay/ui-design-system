import React, { act } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
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
          entry.license === "LicenseRef-Rottay-Original-Product-Asset-1.0" &&
          entry.rightsHolder === "Rottay" &&
          entry.distribution === "internal-and-bundled-product" &&
          entry.supplier === null &&
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
      expect(first).toContain('data-asset-class="feature-pictogram"');
      expect(first).toContain('data-pictogram-directional="false"');
      expect(first).not.toContain("lucide");
      expect(first).not.toContain("phosphor");
      expect(first).not.toContain("<image");
      expect(first).not.toContain(" href=");
    }
  });

  it("hydrates without a markup mismatch and remains direction-neutral in RTL", async () => {
    const element = (
      <div dir="rtl">
        <FeaturePictogram name="workflow-automation" label="Workflow automation" />
      </div>
    );
    const host = document.createElement("div");
    host.innerHTML = renderToString(element);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(host, element);
    });

    const pictogram = host.querySelector("svg");
    expect(pictogram?.getAttribute("data-pictogram-directional")).toBe("false");
    expect(pictogram?.getAttribute("transform")).toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();

    await act(async () => {
      root?.unmount();
    });
    consoleSpy.mockRestore();
  });

  it("keeps its server module hook-free and ships a forced-colors contract", () => {
    const componentSource = readFileSync(
      resolve(process.cwd(), "src/graphics/pictograms/presentation/feature-pictogram/index.tsx"),
      "utf8",
    );
    const cssSource = readFileSync(
      resolve(
        process.cwd(),
        "src/foundation/tokens/css/presentation/components/feature-pictogram.css",
      ),
      "utf8",
    );

    expect(componentSource).not.toContain("'use client'");
    expect(componentSource).not.toContain('"use client"');
    expect(componentSource).not.toMatch(/\buse(?:Effect|LayoutEffect|State|Ref)\b/);
    expect(componentSource).not.toMatch(/\b(?:window|document|navigator)\b/);
    expect(cssSource).toContain("@media (forced-colors: active)");
    expect(cssSource).toContain("color: CanvasText !important");
    expect(cssSource).toContain("forced-color-adjust: auto");
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
    const Unsafe = FeaturePictogram as unknown as React.ComponentType<
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
