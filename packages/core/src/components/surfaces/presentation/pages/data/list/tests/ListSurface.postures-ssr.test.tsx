import React from "react";
import { describe, expect, it } from "vitest";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";

import { DesignSystemProvider } from "@/infrastructure/runtime/bootstrap";
import PostureListPage, {
  POSTURE_LIST_POSTURES,
} from "@tests/integration/consumer/app/posture-list-page";

const ROWS = [
  { id: "1", label: "Senior designer" },
  { id: "2", label: "Platform engineer" },
] as const;

const TENANT = {
  slug: "surface-posture-test",
  name: "Surface posture test",
  theme: "light",
  plan: "enterprise" as const,
  features: ["all"],
  branding: { companyName: "Surface posture test" },
};

function renderPageServerSide(
  viewport: "phone" | "tablet" | "desktop",
  postures = POSTURE_LIST_POSTURES
): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = "";
    let piped = false;
    let settled = false;
    let stream: ReturnType<typeof renderToPipeableStream> | undefined;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      stream?.abort();
      output.destroy();
      reject(error);
    };
    output.on("data", (chunk) => {
      html += chunk.toString();
    });
    output.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(html);
    });
    output.on("error", fail);
    stream = renderToPipeableStream(
      <DesignSystemProvider
        tenantConfig={TENANT}
        forceEngine="modern"
        ssrViewport={viewport}
        skipCssLoading
      >
        <PostureListPage rows={ROWS} postures={postures} />
      </DesignSystemProvider>,
      {
        onAllReady: () =>
          queueMicrotask(() => {
            if (piped || settled || !stream) return;
            piped = true;
            stream.pipe(output);
          }),
        onError: fail,
      }
    );
  });
}

describe("WO-INV-06 real ListSurface first paint", () => {
  it("renders a phone request in the simplified posture: hidden chrome stays out of the HTML", async () => {
    const html = await renderPageServerSide("phone");

    expect(html).not.toContain('data-surface-region="column-menu"');
    expect(html).not.toContain('data-surface-region="preview-rail"');
    expect(html).not.toContain("Preview rail body");
    expect(html).not.toContain("All columns");
    expect(html).toContain('data-surface-region="results"');
    expect(html).toContain('data-surface-region="bottom-bar"');
    expect(html).toContain('data-region-disposition="render"');
    expect(html).toContain('data-posture="phone"');
    expect(html).toContain("ds-list");
    expect(html).toContain("Senior designer");
    expect(html).toContain('data-density="spacious"');
    expect(html).toContain('data-mode="sticky"');
  });

  it("renders a desktop request with the full posture", async () => {
    const html = await renderPageServerSide("desktop");

    expect(html).toContain('data-surface-region="column-menu"');
    expect(html).toContain('data-surface-region="preview-rail"');
    expect(html).toContain("Preview rail body");
    expect(html).not.toContain('data-surface-region="bottom-bar"');
    expect(html).toContain('data-posture="desktop"');
    expect(html).toContain('data-density="compact"');
    expect(html).toContain("<table");
    expect(html).toContain('data-surface-region="primary-action"');
  });

  it("renders the phone navigation as a persistent bottom bar, not the sidebar", async () => {
    const html = await renderPageServerSide("phone");

    expect(html).toContain('data-part="navigation-bottom-bar"');
    expect(html).not.toContain('data-part="navigation-sidebar"');
  });

  it("renders the desktop navigation as the sidebar, not a bottom bar", async () => {
    const html = await renderPageServerSide("desktop");

    expect(html).toContain('data-part="navigation-sidebar"');
    expect(html).not.toContain('data-part="navigation-bottom-bar"');
  });

  it("renders the tablet declaration with a collapsed rail and a floating action", async () => {
    const html = await renderPageServerSide("tablet");

    expect(html).toContain('data-surface-region="column-menu"');
    expect(html).toContain('data-surface-region="preview-rail"');
    expect(html).toContain('data-posture="tablet"');
    expect(html).toContain('data-region-disposition="collapse"');
    expect(html).not.toContain("Preview rail body");
    expect(html).toContain('data-surface-region="floating"');
    expect(html).toContain('data-mode="fixed"');
  });

  it("does not hide phone regions when the app removes those declarations", async () => {
    const html = await renderPageServerSide("phone", {});
    expect(html).toContain('data-surface-region="column-menu"');
    expect(html).toContain("Preview rail body");
    expect(html).not.toContain('data-density="spacious"');
  });

  it("does not render the hidden primary action in a dock or header", async () => {
    const html = await renderPageServerSide("phone", {
      phone: {
        regions: { "primary-action": "hide" },
        primaryAction: "bottom-bar",
      },
    });
    expect(html).not.toContain("New role");
    expect(html).not.toContain('data-surface-region="bottom-bar"');
  });
});
