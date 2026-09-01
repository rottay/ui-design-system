import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Box, Button, Flex, Stack, Text } from "../../../primitives";
import { PatternDataTable } from "./";
import { createSurfaceStoryDecorator } from "../../../surfaces/foundation/common/story-helpers";

const meta: Meta<typeof PatternDataTable> = {
  title: "Patterns/DataTable",
  component: PatternDataTable,
  decorators: [
    createSurfaceStoryDecorator({
      productProfile: "recruiting.operator",
      engine: "modern",
    }),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof PatternDataTable>;

const data = [
  {
    id: "candidate-1",
    name: "Amelia Hernández-Walker",
    role: "Senior Product Designer — Enterprise decision systems",
    location: "Buenos Aires · Remote (GMT−3)",
    signal: 96,
    status: "Decision ready",
  },
  {
    id: "candidate-2",
    name: "Noah Okafor",
    role: "Staff Machine Learning Platform Engineer",
    location: "Lagos · Hybrid",
    signal: 88,
    status: "Panel review",
  },
  {
    id: "candidate-3",
    name: "ليلى العبدالله",
    role: "Design systems lead",
    location: "دبي · حضوري",
    signal: 91,
    status: "Offer planning",
  },
];

const columns = [
  {
    key: "name",
    header: "Candidate",
    accessorKey: "name",
    sortable: true,
    minWidth: 220,
    responsive: { phone: "primary" as const },
  },
  {
    key: "role",
    header: "Current focus",
    accessorKey: "role",
    minWidth: 300,
    responsive: { phone: "summary" as const },
  },
  {
    key: "location",
    header: "Location",
    accessorKey: "location",
    minWidth: 210,
    priority: "low" as const,
    responsive: { phone: "summary" as const },
  },
  {
    key: "signal",
    header: "Signal",
    accessorKey: "signal",
    align: "right" as const,
    sortable: true,
    minWidth: 100,
    responsive: { phone: "summary" as const },
  },
  {
    key: "status",
    header: "Decision state",
    accessorKey: "status",
    minWidth: 150,
  },
];

const toolbar = (
  <Flex justify="between" align="center" gap={12} wrap="wrap">
    <Stack spacing="xs">
      <Text weight="semibold">Candidate decisions</Text>
      <Text color="subtle">Evidence-ranked profiles requiring action</Text>
    </Stack>
    <Button size="sm">Export view</Button>
  </Flex>
);

type TableTokenPreviewStyle = React.CSSProperties &
  Record<`--${string}`, string | number>;

const bitHireTableTokens: TableTokenPreviewStyle = {
  padding: "1.5rem",
  background: "#f3f7fc",
  "--ds-table-bg": "#ffffff",
  "--ds-table-border": "#bfd0e5",
  "--ds-table-radius": "1rem",
  "--ds-table-shadow": "0 18px 48px -34px rgba(31, 73, 125, 0.52)",
  "--ds-table-header-bg":
    "linear-gradient(112deg, #eef5fd 0%, #f8fbff 56%, #edf4fc 100%)",
  "--ds-table-header-bg-hover":
    "linear-gradient(112deg, #e8f2fd 0%, #f6faff 56%, #e6f0fb 100%)",
  "--ds-table-header-color": "#284a70",
  "--ds-table-header-letter-spacing": "0.085em",
  "--ds-table-header-text-transform": "uppercase",
  "--ds-table-row-bg-hover": "#eef6ff",
  "--ds-table-row-bg-selected": "#e5f1ff",
  "--ds-table-action-bg": "#fbfdff",
  "--ds-table-padding-comfortable": "0.75rem 0.875rem",
  "--ds-table-control-radius": "0.5rem",
};

const managementTableTokens: TableTokenPreviewStyle = {
  padding: "1.5rem",
  background: "#f3efe7",
  "--ds-table-bg": "#fffdf8",
  "--ds-table-border": "#c9bead",
  "--ds-table-radius": "0.375rem",
  "--ds-table-shadow": "0 16px 34px -30px rgba(57, 43, 25, 0.7)",
  "--ds-table-header-bg":
    "linear-gradient(180deg, #2f2b27 0%, #25221f 100%)",
  "--ds-table-header-bg-hover":
    "linear-gradient(180deg, #3a342e 0%, #2a2622 100%)",
  "--ds-table-header-pinned-bg": "#292521",
  "--ds-table-header-color": "#fffaf0",
  "--ds-table-header-font-family": "Georgia, 'Times New Roman', serif",
  "--ds-table-header-letter-spacing": "0.02em",
  "--ds-table-header-text-transform": "none",
  "--ds-table-row-bg-hover": "#f6f0e5",
  "--ds-table-row-bg-selected": "#eee4d5",
  "--ds-table-row-border": "#dfd6c9",
  "--ds-table-action-bg": "#fbf7ef",
  "--ds-table-padding-comfortable": "0.875rem 1rem",
  "--ds-table-control-radius": "0.1875rem",
};

const managementColumns = columns.map((column) => ({
  ...column,
  header:
    {
      name: "Talento",
      role: "Especialidad actual",
      location: "Ubicación",
      signal: "Señal",
      status: "Estado de decisión",
    }[column.key] ?? column.header,
}));

export const Default: Story = {
  args: {
    data,
    columns,
    rowKey: "id",
    engine: "modern",
    recipe: "grid",
    density: "comfortable",
    selectable: true,
    hoverable: true,
    resizable: true,
    reorderable: true,
    stickyHeader: true,
    toolbar,
    sorting: { key: "signal", direction: "desc" },
    onSortChange: () => undefined,
    onColumnResize: () => undefined,
    onColumnReorder: () => undefined,
    actions: () => (
      <Button variant="ghost" size="xs">
        Open
      </Button>
    ),
    pagination: {
      current: 1,
      pageSize: 10,
      total: 158,
      onChange: () => undefined,
    },
  },
};

export const Editorial: Story = {
  args: {
    ...Default.args,
    recipe: "editorial",
    density: "spacious",
  },
};

export const CompactRuled: Story = {
  args: {
    ...Default.args,
    recipe: "ruled",
    density: "compact",
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    data: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    data: [],
    messages: {
      emptyTitle: "No candidates match this view",
      emptyDescription: "Broaden the evidence filters or restore the saved view.",
    },
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    data: [],
    error: true,
    messages: {
      errorTitle: "Candidate evidence is temporarily unavailable",
      errorDescription: "Your filters are preserved. Retry when the connection recovers.",
    },
  },
};

/**
 * One DataTable anatomy, two deliberately distant tenant personalities and
 * two locales. The contrast is authored only through component props,
 * localized messages and public `--ds-table-*` token channels.
 */
export const WhiteLabelSameMarkup: Story = {
  args: {
    data,
    columns,
  },
  render: () => (
    <Stack spacing="lg">
      <Box style={bitHireTableTokens}>
        <Stack spacing="sm">
          <Stack spacing="xs">
            <Text weight="semibold">BitHire · precise operations</Text>
            <Text color="subtle">
              Cool, rounded and compact without changing the table anatomy.
            </Text>
          </Stack>
          <PatternDataTable
            data={data}
            columns={columns}
            rowKey="id"
            engine="modern"
            recipe="grid"
            density="comfortable"
            selectable
            hoverable
            resizable
            reorderable
            stickyHeader
            sorting={{ key: "signal", direction: "desc" }}
            onSortChange={() => undefined}
            onColumnResize={() => undefined}
            onColumnReorder={() => undefined}
            actions={() => (
              <Button variant="ghost" size="xs">
                Open
              </Button>
            )}
            messages={{
              tableLabel: "Candidate decision queue",
              actionsColumn: "Actions",
              selectAll: "Select all candidates",
              selectRow: (rowKey) => `Select candidate ${rowKey}`,
              moveColumn: (column) => `Move ${column} column`,
              resizeColumn: (column) => `Resize ${column} column`,
              paginationRange: (start, end, total) =>
                `${start}–${end} of ${total}`,
            }}
            pagination={{
              current: 1,
              pageSize: 10,
              total: 158,
              onChange: () => undefined,
            }}
          />
        </Stack>
      </Box>

      <Box style={managementTableTokens} lang="es">
        <Stack spacing="sm">
          <Stack spacing="xs">
            <Text weight="semibold">The Management · editorial cálido</Text>
            <Text color="subtle">
              Más sobrio, angular y espacioso usando la misma anatomía.
            </Text>
          </Stack>
          <PatternDataTable
            data={data}
            columns={managementColumns}
            rowKey="id"
            engine="modern"
            recipe="ruled"
            density="comfortable"
            selectable
            hoverable
            resizable
            reorderable
            stickyHeader
            sorting={{ key: "signal", direction: "desc" }}
            onSortChange={() => undefined}
            onColumnResize={() => undefined}
            onColumnReorder={() => undefined}
            actions={() => (
              <Button variant="ghost" size="xs">
                Abrir
              </Button>
            )}
            messages={{
              tableLabel: "Cola de decisiones de talento",
              actionsColumn: "Acciones",
              selectAll: "Seleccionar todos los perfiles",
              selectRow: (rowKey) => `Seleccionar perfil ${rowKey}`,
              moveColumn: (column) => `Mover columna ${column}`,
              resizeColumn: (column) => `Cambiar ancho de ${column}`,
              previousPage: "Página anterior",
              nextPage: "Página siguiente",
              page: (page) => `Página ${page}`,
              paginationRange: (start, end, total) =>
                `${start}–${end} de ${total}`,
            }}
            pagination={{
              current: 1,
              pageSize: 10,
              total: 158,
              onChange: () => undefined,
            }}
          />
        </Stack>
      </Box>
    </Stack>
  ),
};
