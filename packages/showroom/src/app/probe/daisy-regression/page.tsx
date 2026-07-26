"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  AlertDialog,
  Box,
  Button,
  DesignSystemProvider,
  Heading,
  PatternFilterBuilder,
  PatternKanbanBoard,
  PatternSavedViewsBar,
  Text,
  bithireBrandTheme,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

/**
 * Daisy-regression live evidence probe (2026-07-26).
 *
 * Surfaces the four remediated paths after the Daisy removal from Modern:
 * the three loading branches whose canonical ModernSpinner now re-stamps
 * the contracted `spinner` data-part (caller-wins P-79), and the
 * AlertDialog modern portal/top-layer posture whose contract moved off
 * the dead Daisy class list onto the canonical rottay-* hooks.
 *
 * URL-addressable: ?source=bithire-static|themanagement-db&locale=en|es|ar
 * &density=compact|comfortable|spacious&theme=light|dark
 */

type Source = "bithire-static" | "themanagement-db";
type Locale = "en" | "es" | "ar";
type Density = "compact" | "comfortable" | "spacious";
type Theme = "light" | "dark";

function tenantConfig(source: Source, locale: Locale, density: Density, theme: Theme) {
  const appearanceDensity = density === "comfortable" ? ("normal" as const) : density;
  if (source === "themanagement-db") {
    // Same wiring as K4LaneBProbe: DB fixture tenant, dark via Appearance.
    const base = brandLocaleTenantConfigFor("themanagementmiami", locale);
    return {
      ...base,
      theme,
      appearance: {
        ...base.appearance,
        general: {
          ...base.appearance?.general,
          density: appearanceDensity,
          ...(theme === "dark" ? { backgroundMode: "dark" as const } : {}),
        },
      },
    };
  }
  return {
    slug: "bithire",
    name: "BitHire",
    vertical: "bithire",
    engine: "modern" as const,
    theme,
    plan: "enterprise" as const,
    features: ["*"],
    branding: { companyName: "BitHire" },
    brandTheme: bithireBrandTheme,
    appearance: {
      general: {
        density: appearanceDensity,
        ...(theme === "dark" ? { backgroundMode: "dark" as const } : {}),
      },
    },
  };
}

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

function ProbeContent() {
  const searchParams = useSearchParams();
  const source: Source = searchParams.get("source") === "themanagement-db" ? "themanagement-db" : "bithire-static";
  const locale: Locale = searchParams.get("locale") === "es" || searchParams.get("locale") === "ar" ? (searchParams.get("locale") as Locale) : "en";
  const density: Density = searchParams.get("density") === "compact" || searchParams.get("density") === "spacious" ? (searchParams.get("density") as Density) : "comfortable";
  const theme: Theme = searchParams.get("theme") === "dark" ? "dark" : "light";
  // The dialog is opt-in (`&dialog=1`) so it does not cover the loading
  // cells in their own captures (it portals above everything by design).
  const dialogOpen = searchParams.get("dialog") === "1";

  const config = useMemo(
    () => tenantConfig(source, locale, density, theme),
    [source, locale, density, theme],
  );

  return (
    <DesignSystemProvider
      tenantConfig={{ ...config, locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme={theme}
    >
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
    </DesignSystemProvider>
  );
}

export default function DaisyRegressionProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
