"use client";

/**
 * P1 ListToolbar probe (showroom): the elevated data-toolbar pattern under
 * two opposing governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * Requested by the ListToolbar lane (see
 * test-artifacts/rottay-design-platform/P1/list-toolbar/list-toolbar.md):
 * the torture band is static, en/ar-only and forces a ~6k-line page per
 * capture, so this light probe renders ONE desktop + ONE compact
 * PatternListToolbar with real controlled state (search, view mode, density,
 * filter pills, clear-all) on the K4 axes:
 *  - `source` sweeps BitHire static vs The Management DB appearance;
 *  - `locale` sweeps EN/ES/AR with `dir="rtl"` for Arabic — the chrome copy
 *    (messages contract) localizes per locale, English exercises the
 *    historical defaults (no `messages` passed);
 *  - `density` sweeps the toolbar's own density control initial value; the
 *    second toolbar is pinned to compact so every capture contrasts the axis
 *    value against compact in the same frame;
 *  - `engine` sweeps modern | classic | rustic through `forceEngine` (classic
 *    paint moved in Pass 1; rustic re-exports classic);
 *  - `state` is accepted for forward compatibility and currently always
 *    `rest` (the lane's request).
 *
 * W10 (2026-07): a third cell renders the toolbar IN a real list surface —
 * page background, results card with static rows beneath — because the Codex
 * verdict flagged the family evidence as isolated specimens only. The rows
 * are inert fixture copy (English on every locale, per the probe convention).
 *
 * No fixture value here is product content.
 */

import { useState } from "react";

import {
  Box,
  DesignSystemProvider,
  PatternListToolbar,
  Stack,
  Text,
  bithireBrandTheme,
  type DensityKey,
  type FilterPillConfig,
  type ListToolbarProps,
  type TenantConfig,
  type ViewMode,
} from "@rottay/design-system";
import { Icon } from "@rottay/design-system/icons";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type P1ListToolbarSource = "bithire-static" | "themanagement-db";
export type P1ListToolbarLocale = "en" | "es" | "ar";
export type P1ListToolbarDensity = "compact" | "comfortable" | "spacious";
export type P1ListToolbarEngine = "modern" | "classic" | "rustic";
export type P1ListToolbarState = "rest";

export interface P1ListToolbarProbeProps {
  source: P1ListToolbarSource;
  locale: P1ListToolbarLocale;
  density: P1ListToolbarDensity;
  engine?: P1ListToolbarEngine;
  state?: P1ListToolbarState;
}

type ToolbarMessages = NonNullable<ListToolbarProps["messages"]>;

function tenantConfig(source: P1ListToolbarSource, locale: P1ListToolbarLocale): TenantConfig {
  if (source === "themanagement-db") {
    return brandLocaleTenantConfigFor("themanagementmiami", locale);
  }

  return {
    slug: "bithire",
    name: "BitHire",
    vertical: "bithire",
    engine: "modern",
    theme: "light",
    plan: "enterprise",
    features: ["*"],
    branding: { companyName: "BitHire" },
    // BitHire is first-party vertical identity and therefore comes from the
    // checked-in DS theme, never from a customer DB fixture.
    brandTheme: bithireBrandTheme,
  };
}

interface LocaleCopy {
  title: string;
  searchPlaceholder: string;
  statusLabel: string;
  statusActive: string;
  statusPaused: string;
  teamLabel: string;
  teamOps: string;
  teamGrowth: string;
  primaryAction: string;
  settingsColumns: string;
  settingsViews: string;
  captionAxis: string;
  captionCompact: string;
  captionSurface: string;
  /** English leaves `messages` undefined to exercise the historical defaults. */
  messages?: ToolbarMessages;
}

const COPY: Record<P1ListToolbarLocale, LocaleCopy> = {
  en: {
    title: "Candidates",
    searchPlaceholder: "Search candidates",
    statusLabel: "Status",
    statusActive: "Active",
    statusPaused: "Paused",
    teamLabel: "Team",
    teamOps: "Ops",
    teamGrowth: "Growth",
    primaryAction: "Invite candidate",
    settingsColumns: "Name · Status · Owner · Updated",
    settingsViews: "Default · My pipeline · Archived",
    captionAxis: "Density axis value",
    captionCompact: "Pinned compact",
    captionSurface: "Inside a results surface (W10)",
    messages: undefined,
  },
  es: {
    title: "Candidatos",
    searchPlaceholder: "Buscar candidatos",
    statusLabel: "Estado",
    statusActive: "Activo",
    statusPaused: "En pausa",
    teamLabel: "Equipo",
    teamOps: "Operaciones",
    teamGrowth: "Crecimiento",
    primaryAction: "Invitar candidato",
    settingsColumns: "Nombre · Estado · Responsable · Actualizado",
    settingsViews: "Predeterminada · Mi pipeline · Archivados",
    captionAxis: "Valor del eje de densidad",
    captionCompact: "Compacta fija",
    captionSurface: "Dentro de una superficie de resultados (W10)",
    messages: {
      compact: "Compacta",
      comfortable: "Cómoda",
      spacious: "Espaciosa",
      densitySuffix: "densidad",
      rowDensity: "Densidad de fila",
      viewMode: "Modo de vista",
      listView: "Lista",
      cardView: "Tarjetas",
      columns: "Columnas",
      density: "Densidad",
      views: "Vistas",
      noColumnSettings: "Sin configuración de columnas",
      noSavedViews: "Sin vistas guardadas",
      columnSettings: "Configuración de columnas",
      settings: "Configuración",
      moreOptions: "Más opciones",
      export: "Exportar",
      active: "Activo",
      clearAll: "Limpiar todo",
      searchLabel: "Buscar",
    },
  },
  ar: {
    title: "المرشحون",
    searchPlaceholder: "البحث في المرشحين",
    statusLabel: "الحالة",
    statusActive: "نشط",
    statusPaused: "متوقف",
    teamLabel: "الفريق",
    teamOps: "العمليات",
    teamGrowth: "النمو",
    primaryAction: "دعوة مرشح",
    settingsColumns: "الاسم · الحالة · المسؤول · التحديث",
    settingsViews: "الافتراضية · خط أنابيبي · المؤرشفة",
    captionAxis: "قيمة محور الكثافة",
    captionCompact: "مدمجة ثابتة",
    captionSurface: "داخل سطح النتائج (W10)",
    messages: {
      compact: "مدمجة",
      comfortable: "مريحة",
      spacious: "واسعة",
      densitySuffix: "الكثافة",
      rowDensity: "كثافة الصف",
      viewMode: "وضع العرض",
      listView: "قائمة",
      cardView: "بطاقات",
      columns: "الأعمدة",
      density: "الكثافة",
      views: "المشاهدات",
      noColumnSettings: "لا توجد إعدادات أعمدة",
      noSavedViews: "لا توجد مشاهدات محفوظة",
      columnSettings: "إعدادات الأعمدة",
      settings: "الإعدادات",
      moreOptions: "خيارات إضافية",
      export: "تصدير",
      active: "نشط",
      clearAll: "مسح الكل",
      searchLabel: "بحث",
    },
  },
};

/** One stateful toolbar instance (real controlled state, not a static band). */
function ToolbarCell({
  copy,
  initialDensity,
  testId,
}: {
  copy: LocaleCopy;
  initialDensity: DensityKey;
  testId: string;
}) {  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [density, setDensity] = useState<DensityKey>(initialDensity);
  const [filters, setFilters] = useState<Record<string, unknown>>({
    status: "active",
    team: "ops",
  });

  const filterPills: FilterPillConfig[] = [
    {
      key: "status",
      label: copy.statusLabel,
      value: String(filters.status ?? "active"),
      options: [
        { label: copy.statusActive, value: "active" },
        { label: copy.statusPaused, value: "paused" },
      ],
    },
    {
      key: "team",
      label: copy.teamLabel,
      value: String(filters.team ?? "ops"),
      options: [
        { label: copy.teamOps, value: "ops" },
        { label: copy.teamGrowth, value: "growth" },
      ],
    },
  ];

  return (
    <Box data-testid={testId} style={{ inlineSize: "100%" }}>
      <PatternListToolbar
        title={copy.title}
        totalCount={248}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={copy.searchPlaceholder}
        messages={copy.messages}
        filterPills={filterPills}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((current) => ({ ...current, [key]: value }))
        }
        onClearFilters={() => setFilters({})}
        activeFilterCount={Object.keys(filters).length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        density={density}
        onDensityChange={setDensity}
        columnSettingsContent={
          <Box style={{ padding: 8 }}>
            <Text size="sm">{copy.settingsColumns}</Text>
          </Box>
        }
        savedViewsContent={
          <Box style={{ padding: 8 }}>
            <Text size="sm">{copy.settingsViews}</Text>
          </Box>
        }
        primaryAction={{
          label: copy.primaryAction,
          icon: <Icon name="action.add" decorative />,
          onClick: () => undefined,
        }}
        onExport={() => undefined}
      />
    </Box>
  );
}

/**
 * W10 in-surface specimen: the toolbar composed as the header of a results
 * surface (page background → toolbar → static result rows), answering the
 * verdict's "isolated specimens only" finding. Rows are inert fixture copy.
 */
const SURFACE_ROWS = [
  { name: "Amelia Torres", meta: "Ops · Active" },
  { name: "Jonas Meyer", meta: "Growth · Paused" },
  { name: "Priya Nair", meta: "Ops · Active" },
] as const;

function InSurfaceCell({ copy }: { copy: LocaleCopy }) {
  return (
    <Box
      data-testid="p1lt-in-surface"
      style={{
        inlineSize: "100%",
        overflow: "hidden",
        border: "1px solid var(--ds-color-border)",
        borderRadius: "var(--ds-radius-lg, 12px)",
        background: "var(--ds-surface-card, var(--ds-color-bg-primary))",
      }}
    >
      <Box style={{ padding: "var(--ds-spacing-3, 0.75rem)", paddingBlockEnd: 0 }}>
        <ToolbarCell copy={copy} initialDensity="comfortable" testId="p1lt-toolbar-in-surface" />
      </Box>
      <Box style={{ padding: "var(--ds-spacing-3, 0.75rem)" }}>
        {SURFACE_ROWS.map((row, index) => (
          <Box
            key={row.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--ds-spacing-3, 0.75rem)",
              paddingBlock: "var(--ds-spacing-2, 0.5rem)",
              borderBlockStart:
                index === 0 ? "none" : "1px solid var(--ds-color-border-subtle, var(--ds-color-border))",
            }}
          >
            <Text size="sm">{row.name}</Text>
            <Text size="xs" color="secondary">
              {row.meta}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function P1ListToolbarProbe({
  source,
  locale,
  density,
  engine = "modern",
}: P1ListToolbarProbeProps) {
  const copy = COPY[locale];

  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine={engine}
      forceTheme="light"
    >
      <Box
        data-testid="p1lt-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="p1lt-frame"
          data-p1lt-source={source}
          data-p1lt-engine={engine}
          data-p1lt-density={density}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 1080,
            marginInline: "auto",
          }}
        >
          <main>
            <h1
              style={{
                position: "absolute",
                inlineSize: 1,
                blockSize: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0 0 0 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              P1 ListToolbar probe — data toolbar pattern
            </h1>
            <Stack spacing="xl" data-testid="p1lt-root" data-ds-root="">
              <Stack spacing="sm">
                <Text size="xs" color="secondary" data-testid="p1lt-caption-axis">
                  {copy.captionAxis}: {density}
                </Text>
                <ToolbarCell copy={copy} initialDensity={density} testId="p1lt-toolbar-axis" />
              </Stack>
              <Stack spacing="sm">
                <Text size="xs" color="secondary" data-testid="p1lt-caption-compact">
                  {copy.captionCompact}
                </Text>
                <ToolbarCell copy={copy} initialDensity="compact" testId="p1lt-toolbar-compact" />
              </Stack>
              <Stack spacing="sm">
                <Text size="xs" color="secondary" data-testid="p1lt-caption-surface">
                  {copy.captionSurface}
                </Text>
                <InSurfaceCell copy={copy} />
              </Stack>
            </Stack>
          </main>
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}

export default P1ListToolbarProbe;
