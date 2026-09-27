"use client";

import {
  AlertDialog,
  Box,
  Button,
  Heading,
  PatternFilterBuilder,
  PatternKanbanBoard,
  PatternSavedViewsBar,
  Text,
} from "@rottay/design-system";

import type { FleetLocale } from "@/components/probes/ground/documents";

const FILTER_FIELDS = [
  { name: "stage", label: "Stage", type: "select" as const, options: ["Screening", "Interview", "Offer"] },
  { name: "name", label: "Name", type: "text" as const },
];

function Cells({ dialogOpen }: { dialogOpen: boolean }) {
  return (
    <Box data-testid="dr-cells" style={{ display: "grid", gap: 32 }}>
      <section data-testid="dr-filter-builder-loading">
        <Text size="xs" color="secondary">FilterBuilder — loading branch (canonical spinner)</Text>
        <PatternFilterBuilder
          fields={FILTER_FIELDS as never}
          value={{ id: "root", logic: "and", rules: [] }}
          onChange={() => undefined}
          loading
        />
      </section>
      <section data-testid="dr-kanban-loading">
        <Text size="xs" color="secondary">KanbanBoard — loading branch (canonical spinner)</Text>
        <PatternKanbanBoard
          columns={[]}
          itemKey={(item: { id: string }) => item.id}
          onItemMove={() => undefined}
          onItemClick={() => undefined}
          renderCard={(item: { id: string }) => <Text>{item.id}</Text>}
          onAddItem={() => undefined}
          loading
        />
      </section>
      <section data-testid="dr-saved-views-loading">
        <Text size="xs" color="secondary">SavedViewsBar — loading branch (canonical spinner)</Text>
        <PatternSavedViewsBar
          views={[]}
          activeViewId=""
          onViewSelect={() => undefined}
          onViewSave={() => undefined}
          onViewDelete={() => undefined}
          onViewRename={() => undefined}
          onViewCreate={() => undefined}
          loading
        />
      </section>
      <section data-testid="dr-alert-dialog">
        <Text size="xs" color="secondary">AlertDialog modern — portal/top-layer, tenant scope</Text>
        {dialogOpen ? (
          <AlertDialog
            open
            onOpenChange={() => undefined}
            title="Revoke access?"
            description="All sessions will be terminated."
            action={<Button variant="primary">Revoke</Button>}
          />
        ) : null}
      </section>
    </Box>
  );
}

export function DaisyRegressionCanvas({ locale, dialogOpen }: { locale: FleetLocale; dialogOpen: boolean }) {
  return (
    <Box
      data-testid="dr-root"
      data-ds-root=""
      dir={locale === "ar" ? "rtl" : "ltr"}
      style={{
        background: "var(--ds-color-background)",
        color: "var(--ds-color-text-primary)",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <Heading level="h2">Daisy-regression evidence — loading branches + AlertDialog</Heading>
      <Cells dialogOpen={dialogOpen} />
    </Box>
  );
}
