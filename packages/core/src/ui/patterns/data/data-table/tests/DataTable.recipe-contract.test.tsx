import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, waitFor } from "@testing-library/react";

import { renderWithEngine } from "../../../../../tooling/testing/helpers/engine";
import { RecipeProfileProvider } from "@/infrastructure/runtime/foundation/recipes/profiles";
import { PatternDataTable } from "..";
import type { DataTablePatternProps } from "../contracts";

type Row = { id: string; name: string; detail: string };

const rows: Row[] = [
  { id: "one", name: "Alpha", detail: "Long supporting value" },
];
const columns = [
  { key: "name", header: "Name", accessorKey: "name" as const },
  {
    key: "detail",
    header: "Detail",
    accessorKey: "detail" as const,
    priority: "low" as const,
  },
];

afterEach(cleanup);

async function renderModern(
  props: Partial<DataTablePatternProps<Row>> = {},
  profileId?: string
) {
  const result = renderWithEngine(
    <RecipeProfileProvider profileId={profileId}>
      <PatternDataTable<Row>
        engine="modern"
        data={rows}
        columns={columns}
        rowKey="id"
        autoMobileCards={false}
        {...props}
      />
    </RecipeProfileProvider>,
    "modern"
  );

  await waitFor(() => {
    expect(result.container.querySelector('[data-part="root"]')).not.toBeNull();
  });
  return result;
}

describe("DataTable bounded recipe contract", () => {
  it("uses profile density and recipe only when the caller leaves them unset", async () => {
    const technical = await renderModern({}, "rottay/technical-sharp@1");
    const technicalRoot = technical.container.querySelector('[data-part="root"]');
    expect(technicalRoot).toHaveAttribute("data-density", "compact");
    expect(technicalRoot).toHaveAttribute("data-recipe", "ruled");
    technical.unmount();

    const editorial = await renderModern({}, "rottay/editorial-round@1");
    const editorialRoot = editorial.container.querySelector('[data-part="root"]');
    expect(editorialRoot).toHaveAttribute("data-density", "comfortable");
    expect(editorialRoot).toHaveAttribute("data-recipe", "minimal");
    editorial.unmount();

    const explicit = await renderModern(
      { density: "spacious", recipe: "grid" },
      "rottay/technical-sharp@1"
    );
    const explicitRoot = explicit.container.querySelector('[data-part="root"]');
    expect(explicitRoot).toHaveAttribute("data-density", "spacious");
    expect(explicitRoot).toHaveAttribute("data-recipe", "grid");
  });

  it("resolves legacy compact and bordered props into truthful root state", async () => {
    const { container } = await renderModern({ compact: true, bordered: true });
    const root = container.querySelector('[data-part="root"]');

    expect(root).toHaveAttribute("data-density", "compact");
    expect(root).toHaveAttribute("data-recipe", "grid");
    expect(root).toHaveAttribute("data-bordered", "true");
  });

  it("lets an explicit recipe override legacy aliases and projects zebra paint through a token", async () => {
    const { container } = await renderModern({
      recipe: "editorial",
      bordered: true,
      striped: true,
      zebraColor: "var(--tenant-zebra)",
    });
    const root = container.querySelector<HTMLElement>('[data-part="root"]');

    expect(root).toHaveAttribute("data-recipe", "editorial");
    expect(root).toHaveAttribute("data-bordered", "false");
    expect(root?.style.getPropertyValue("--ds-table-row-bg-striped")).toBe(
      "var(--tenant-zebra)"
    );
  });

  it("renders localized error recovery content instead of stale rows", async () => {
    const { container, getByText } = await renderModern({
      error: true,
      messages: {
        errorTitle: "No pudimos cargar los datos",
        errorDescription: "Reintenta en unos segundos.",
      },
    });

    expect(getByText("No pudimos cargar los datos")).toBeInTheDocument();
    expect(getByText("Reintenta en unos segundos.")).toBeInTheDocument();
    expect(
      container.querySelector('[data-part="error-state"]')
    ).toHaveAttribute("role", "alert");
    expect(container.querySelector('[data-part="table"]')).toBeNull();
  });

  it("publishes capability state and native row selection semantics", async () => {
    const { container } = await renderModern({
      selectable: true,
      selectedKeys: ["one"],
      stickyHeader: true,
      resizable: true,
      reorderable: true,
      onColumnResize: () => undefined,
      onColumnReorder: () => undefined,
      toolbar: <span>Table controls</span>,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 1,
        onChange: () => undefined,
      },
    });
    const root = container.querySelector('[data-part="root"]');
    const row = container.querySelector('[data-part="body-row"]');

    expect(root).toHaveAttribute("data-selectable", "true");
    expect(root).toHaveAttribute("data-sticky-header", "true");
    expect(root).toHaveAttribute("data-resizable", "true");
    expect(root).toHaveAttribute("data-reorderable", "true");
    expect(root).toHaveAttribute("data-has-toolbar", "true");
    expect(root).toHaveAttribute("data-has-pagination", "true");
    expect(row).toHaveAttribute("aria-selected", "true");
  });

  it("uses localized DS tooltip triggers for column move and resize", async () => {
    const { getByLabelText } = await renderModern({
      resizable: true,
      reorderable: true,
      onColumnResize: () => undefined,
      onColumnReorder: () => undefined,
      messages: {
        moveColumn: (column) => `Mover ${column}`,
        resizeColumn: (column) => `Redimensionar ${column}`,
      },
    });

    expect(getByLabelText("Mover Name")).toHaveAttribute(
      "data-part",
      "drag-grip"
    );
    expect(getByLabelText("Redimensionar Name")).toHaveAttribute(
      "data-part",
      "resize-handle"
    );
  });
});
