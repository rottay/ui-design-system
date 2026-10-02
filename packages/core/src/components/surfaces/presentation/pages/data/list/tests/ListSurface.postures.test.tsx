import React from "react";
import { fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListSurface } from "..";
import type {
  EntityAdapter,
  ListSurfaceConfig,
} from "../../../../../foundation/contracts";
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from "../../../../../foundation/common/test-utils";
import {
  DensityScope,
  useDensity,
} from "@/infrastructure/runtime/foundation/density";

type Row = { id: string; label: string };
const data: Row[] = [{ id: "one", label: "First record" }];
const adapter: EntityAdapter<Row, Row> = {
  entity: "record",
  version: "1",
  map: (row) => row,
  fields: [{ key: "label", fieldId: "record.label" }],
};

function DensityProbe() {
  return <output data-testid="density-probe">{useDensity().posture}</output>;
}

function config(onClick = vi.fn()): ListSurfaceConfig<Row> {
  return {
    visual: { allowViewSwitch: false },
    presentation: {
      chrome: { title: "Records" },
      toolbarStart: <button>Column choices</button>,
      previewRail: <div>Preview content</div>,
      renderCard: () => <DensityProbe />,
    },
    behavior: {
      columns: [{ key: "label", fieldId: "record.label", header: "Label" }],
      primaryAction: { id: "create", label: "Create record", onClick },
    },
  };
}

describe("ListSurface posture adoption", () => {
  it("keeps the named sticky dock a direct surface-container child", async () => {
    const onClick = vi.fn();
    const { container } = renderSurface(
      <ListSurface
        data={data}
        adapter={adapter}
        config={config(onClick)}
        postures={{ phone: { primaryAction: "bottom-bar" } }}
      />,
      { engine: "modern", responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-surface-region="bottom-bar"] button')
      ).not.toBeNull()
    );
    const dock = container.querySelector(
      '[data-surface-region="bottom-bar"]'
    ) as HTMLElement;
    expect(dock).toHaveClass("ds-action-dock");
    expect(dock).toHaveAttribute("role", "toolbar");
    expect(dock).toHaveAttribute("aria-label", "Create record");
    expect(dock).toHaveAttribute("data-mode", "sticky");
    expect(dock).toHaveAttribute("data-region-disposition", "render");
    expect(dock).toHaveAttribute("data-posture", "phone");
    expect(dock.parentElement?.style.viewTransitionName).toBe(
      "ds-vt-list-body"
    );
    const actions = dock.querySelectorAll("button");
    expect(actions).toHaveLength(1);
    fireEvent.click(actions[0]);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("keeps ambient density and existing header actions when postures are omitted", async () => {
    const { container } = renderSurface(
      <DensityScope posture="compact">
        <ListSurface data={data} adapter={adapter} config={config()} />
      </DensityScope>,
      { engine: "modern", responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-testid="density-probe"]')?.textContent
      ).toBe("compact")
    );
    expect(container.querySelector("[data-surface-region]")).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    expect(container.textContent).toContain("Column choices");
    expect(container.textContent).toContain("Preview content");
    expect(container.textContent).toContain("Create record");
  });

  it("applies configured density to the real card subtree and removes hidden slots", async () => {
    const { container } = renderSurface(
      <ListSurface
        data={data}
        adapter={adapter}
        config={config()}
        postures={{
          phone: {
            density: "spacious",
            regions: { "column-menu": "hide", "preview-rail": "collapse" },
          },
        }}
      />,
      { engine: "modern", responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-testid="density-probe"]')?.textContent
      ).toBe("spacious")
    );
    expect(
      container.querySelector('[data-surface-region="column-menu"]')
    ).toBeNull();
    const preview = container.querySelector(
      '[data-surface-region="preview-rail"]'
    );
    expect(preview).toHaveAttribute("data-region-disposition", "collapse");
    expect(preview?.textContent).toBe("");
    expect(container.textContent).not.toContain("Column choices");
    expect(container.textContent).not.toContain("Preview content");
  });

  it("preserves action semantics with an integrated toolbar and app-bar placement", async () => {
    const onClick = vi.fn();
    const surfaceConfig = config(onClick);
    surfaceConfig.behavior.primaryAction!.disabled = true;
    surfaceConfig.toolbar = {
      title: "Records",
      totalCount: 1,
      search: "",
      onSearchChange: vi.fn(),
      density: "comfortable",
      onDensityChange: vi.fn(),
    };
    const { container } = renderSurface(
      <ListSurface
        data={data}
        adapter={adapter}
        config={surfaceConfig}
        postures={{ phone: { primaryAction: "app-bar" } }}
      />,
      { engine: "modern", responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );
    await waitFor(() =>
      expect(
        container.querySelector('button[data-surface-region="primary-action"]')
      ).not.toBeNull()
    );
    const action = container.querySelector(
      'button[data-surface-region="primary-action"]'
    ) as HTMLButtonElement;
    expect(action).toBeDisabled();
    const copies = Array.from(container.querySelectorAll("button")).filter(
      (button) => button.textContent?.includes("Create record")
    );
    expect(copies).toHaveLength(1);
    fireEvent.click(action);
    expect(onClick).not.toHaveBeenCalled();
  });
});
