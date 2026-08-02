"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  Badge,
  Box,
  Button,
  Card,
  DesignSystemProvider,
  Empty,
  Input,
  Menu,
  Modal,
  Pagination,
  PatternDataTable,
  PatternListToolbar,
  PatternPageShell,
  Popover,
  Progress,
  Select,
  Sheet,
  Skeleton,
  Spinner,
  Stack,
  Tabs,
  Text,
  Tooltip,
  WidgetBoard,
  bithireBrandTheme,
  type ColumnDef,
  type DensityKey,
  type FilterPillConfig,
  type ListToolbarProps,
  type TenantConfig,
  type ViewMode,
  type WidgetBoardItem,
  type WidgetBoardLabels,
} from "@rottay/design-system";
import { Icon } from "@rottay/design-system/icons";

import {
  tenantConfigFor as brandLocaleTenantConfigFor,
  seedsOnlyTenantConfig,
} from "@/components/brand-locale-evidence";

/**
 * R2 white-label canary (2026-07-27).
 *
 * ONE Candidates-style composition of the six premium-elevated Modern
 * families (shell/headers, tabs/buttons/pills, inputs/tables, cards/states,
 * overlays, widget-board) rendered as the SAME tree under two tenants:
 *  - `?source=bithire-static`   → BitHire static BrandTheme (DS file-first);
 *  - `?source=themanagement-db` → The Management DB fixture (teal #1F6F6B,
 *    sandstone, terracotta, Fraunces editorial, sharp radius 0.8, spacious,
 *    elevated, sidebarTone inverse) via brand-locale-evidence.
 *
 * Axes: ?locale=en|es|ar (ar ⇒ dir="rtl"), ?density=compact|comfortable|
 * spacious, ?theme=light|dark (dark via appearance.general.backgroundMode).
 * Overlays are opt-in for captures: &modal=1 / &sheet=1 (they portal above
 * everything by design, same convention as the daisy-regression probe).
 *
 * Tenant wiring mirrors the daisy-regression probe verbatim. All chrome copy
 * rides DS props (components i18nize their own chrome); section labels go
 * through a local en/es/ar dictionary so AR/RTL is real. Candidate fixture
 * names stay English on every locale per probe convention — no fixture value
 * here is product content.
 *
 * Inline styles are LAYOUT ONLY (grid/flex/gap/padding). Zero paint: colors,
 * borders and shadows come from the components. No Daisy classes, no new CSS.
 */

type Source = "bithire-static" | "themanagement-db" | "themanagement-seeds";
type Locale = "en" | "es" | "ar";
type Density = "compact" | "comfortable" | "spacious";
type Theme = "light" | "dark";

function tenantConfig(
  source: Source,
  locale: Locale,
  density: Density,
  theme: Theme,
  seedPrimary?: string,
) {
  const appearanceDensity = density === "comfortable" ? ("normal" as const) : density;
  if (source === "themanagement-seeds") {
    // Deliberately NOT spread with density/theme: authoring anything beyond the
    // four seeds would break the very property this source exists to prove.
    return seedsOnlyTenantConfig(locale, seedPrimary);
  }
  if (source === "themanagement-db") {
    // Same wiring as the daisy-regression probe: DB fixture tenant, dark via Appearance.
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

// ---------------------------------------------------------------------------
// Localized copy (section labels only; fixture content stays English)
// ---------------------------------------------------------------------------

type ToolbarMessages = NonNullable<ListToolbarProps["messages"]>;

interface CanaryCopy {
  pageTitle: string;
  pageSubtitle: string;
  crumbWorkspace: string;
  tabList: string;
  tabOverview: string;
  tabMatching: string;
  tabCompare: string;
  invite: string;
  settings: string;
  searchPlaceholder: string;
  stageLabel: string;
  stageScreening: string;
  stageInterview: string;
  sourceLabel: string;
  sourceLinkedIn: string;
  sourceReferral: string;
  exportLabel: string;
  colName: string;
  colRole: string;
  colStage: string;
  colMatch: string;
  colSource: string;
  cardTitle: string;
  cardSubtitle: string;
  cardSave: string;
  cardNote: string;
  selectPlaceholder: string;
  groupActive: string;
  groupArchived: string;
  emptyTitle: string;
  openModal: string;
  openSheet: string;
  modalTitle: string;
  modalDescription: string;
  modalBody: string;
  sheetTitle: string;
  sheetBody: string;
  tooltipContent: string;
  popoverTitle: string;
  popoverContent: string;
  statesCaption: string;
  spinnerSync: string;
  spinnerLoading: string;
  widgetLabels: WidgetBoardLabels;
  /** English leaves `messages` undefined to exercise the historical defaults. */
  messages?: ToolbarMessages;
}

const COPY: Record<Locale, CanaryCopy> = {
  en: {
    pageTitle: "Candidates",
    pageSubtitle: "White-label canary — same tree, two tenants",
    crumbWorkspace: "Workspace",
    tabList: "List",
    tabOverview: "Overview",
    tabMatching: "Matching",
    tabCompare: "Compare",
    invite: "Invite candidate",
    settings: "Settings",
    searchPlaceholder: "Search candidates",
    stageLabel: "Stage",
    stageScreening: "Screening",
    stageInterview: "Interview",
    sourceLabel: "Source",
    sourceLinkedIn: "LinkedIn",
    sourceReferral: "Referral",
    exportLabel: "Export",
    colName: "Name",
    colRole: "Role",
    colStage: "Stage",
    colMatch: "Match",
    colSource: "Source",
    cardTitle: "Pipeline actions",
    cardSubtitle: "Bulk operations on the current view",
    cardSave: "Save view",
    cardNote: "Internal note",
    selectPlaceholder: "Move to stage",
    groupActive: "Active",
    groupArchived: "Archived",
    emptyTitle: "No saved views yet",
    openModal: "Open modal",
    openSheet: "Open sheet",
    modalTitle: "Advance 3 candidates?",
    modalDescription: "This moves the selection to the next stage.",
    modalBody: "Interviewers will be notified and the pipeline report updates immediately.",
    sheetTitle: "Candidate peek",
    sheetBody: "A quick-look panel rendered through the Sheet portal.",
    tooltipContent: "Match is recomputed nightly",
    popoverTitle: "Match breakdown",
    popoverContent: "Skills 82% · Experience 74% · Location 91%",
    statesCaption: "Loading states",
    spinnerSync: "Syncing",
    spinnerLoading: "Loading board",
    widgetLabels: {
      context: "Pipeline intelligence",
      heading: "Your widgets",
      customize: "Customize",
      done: "Done",
      addWidget: "Add widget",
      reset: "Reset",
      emptyCatalog: "No more widgets available",
      editHint: "Drag to reorder, resize from the edges",
      readHint: "Switch to customize mode to edit",
      move: "Move",
      resize: "Resize",
      remove: "Remove",
      catalogHeading: "Add a widget",
      catalogDescription: "Pick the signals you want on this board",
      recommended: "Recommended",
    },
    messages: undefined,
  },
  es: {
    pageTitle: "Candidatos",
    pageSubtitle: "Canario white-label — mismo árbol, dos tenants",
    crumbWorkspace: "Espacio de trabajo",
    tabList: "Lista",
    tabOverview: "Panorama",
    tabMatching: "Matching",
    tabCompare: "Comparar",
    invite: "Invitar candidato",
    settings: "Configuración",
    searchPlaceholder: "Buscar candidatos",
    stageLabel: "Etapa",
    stageScreening: "Criba",
    stageInterview: "Entrevista",
    sourceLabel: "Fuente",
    sourceLinkedIn: "LinkedIn",
    sourceReferral: "Referido",
    exportLabel: "Exportar",
    colName: "Nombre",
    colRole: "Puesto",
    colStage: "Etapa",
    colMatch: "Match",
    colSource: "Fuente",
    cardTitle: "Acciones del pipeline",
    cardSubtitle: "Operaciones masivas sobre la vista actual",
    cardSave: "Guardar vista",
    cardNote: "Nota interna",
    selectPlaceholder: "Mover a etapa",
    groupActive: "Activas",
    groupArchived: "Archivadas",
    emptyTitle: "Aún no hay vistas guardadas",
    openModal: "Abrir modal",
    openSheet: "Abrir sheet",
    modalTitle: "¿Avanzar 3 candidatos?",
    modalDescription: "La selección pasará a la siguiente etapa.",
    modalBody: "Los entrevistadores serán notificados y el informe se actualiza al momento.",
    sheetTitle: "Vista rápida",
    sheetBody: "Un panel de consulta rápida renderizado por el portal de Sheet.",
    tooltipContent: "El match se recalcula cada noche",
    popoverTitle: "Desglose del match",
    popoverContent: "Skills 82% · Experiencia 74% · Ubicación 91%",
    statesCaption: "Estados de carga",
    spinnerSync: "Sincronizando",
    spinnerLoading: "Cargando panel",
    widgetLabels: {
      context: "Inteligencia del pipeline",
      heading: "Tus widgets",
      customize: "Personalizar",
      done: "Listo",
      addWidget: "Añadir widget",
      reset: "Restablecer",
      emptyCatalog: "No hay más widgets disponibles",
      editHint: "Arrastra para reordenar, redimensiona desde los bordes",
      readHint: "Cambia a modo personalizar para editar",
      move: "Mover",
      resize: "Redimensionar",
      remove: "Eliminar",
      catalogHeading: "Añadir un widget",
      catalogDescription: "Elige las señales que quieres en este panel",
      recommended: "Recomendado",
    },
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
    pageTitle: "المرشحون",
    pageSubtitle: "كناري العلامة البيضاء — الشجرة نفسها، مستأجران",
    crumbWorkspace: "مساحة العمل",
    tabList: "القائمة",
    tabOverview: "نظرة عامة",
    tabMatching: "المطابقة",
    tabCompare: "المقارنة",
    invite: "دعوة مرشح",
    settings: "الإعدادات",
    searchPlaceholder: "البحث في المرشحين",
    stageLabel: "المرحلة",
    stageScreening: "الفرز",
    stageInterview: "المقابلة",
    sourceLabel: "المصدر",
    sourceLinkedIn: "لينكدإن",
    sourceReferral: "إحالة",
    exportLabel: "تصدير",
    colName: "الاسم",
    colRole: "الدور",
    colStage: "المرحلة",
    colMatch: "التطابق",
    colSource: "المصدر",
    cardTitle: "إجراءات خط الأنابيب",
    cardSubtitle: "عمليات جماعية على العرض الحالي",
    cardSave: "حفظ العرض",
    cardNote: "ملاحظة داخلية",
    selectPlaceholder: "نقل إلى مرحلة",
    groupActive: "نشطة",
    groupArchived: "مؤرشفة",
    emptyTitle: "لا توجد مشاهدات محفوظة بعد",
    openModal: "فتح النافذة",
    openSheet: "فتح اللوحة",
    modalTitle: "هل تريد ترقية 3 مرشحين؟",
    modalDescription: "سينتقل التحديد إلى المرحلة التالية.",
    modalBody: "سيتم إشعار المقابلين ويتحدث التقرير فورًا.",
    sheetTitle: "نظرة سريعة",
    sheetBody: "لوحة معاينة سريعة تُعرض عبر بوابة Sheet.",
    tooltipContent: "يُعاد حساب التطابق ليلاً",
    popoverTitle: "تفصيل التطابق",
    popoverContent: "المهارات 82% · الخبرة 74% · الموقع 91%",
    statesCaption: "حالات التحميل",
    spinnerSync: "جارٍ المزامنة",
    spinnerLoading: "جارٍ تحميل اللوحة",
    widgetLabels: {
      context: "ذكاء خط الأنابيب",
      heading: "أدواتك",
      customize: "تخصيص",
      done: "تم",
      addWidget: "إضافة أداة",
      reset: "إعادة تعيين",
      emptyCatalog: "لا توجد أدوات أخرى متاحة",
      editHint: "اسحب لإعادة الترتيب، وغيّر الحجم من الحواف",
      readHint: "بدّل إلى وضع التخصيص للتحرير",
      move: "نقل",
      resize: "تغيير الحجم",
      remove: "إزالة",
      catalogHeading: "إضافة أداة",
      catalogDescription: "اختر الإشارات التي تريدها في هذه اللوحة",
      recommended: "موصى به",
    },
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

// ---------------------------------------------------------------------------
// wc-header — PageShell-style header + DS Tabs + Button/Button.Icon actions
// ---------------------------------------------------------------------------

function HeaderSection({ copy }: { copy: CanaryCopy }) {
  const [tab, setTab] = useState("list");
  return (
    <Box data-testid="wc-header">
      <PatternPageShell
        title={copy.pageTitle}
        subtitle={copy.pageSubtitle}
        breadcrumbs={[{ label: copy.crumbWorkspace }, { label: copy.pageTitle }]}
        actions={
          <>
            <Button.Icon
              icon={<Icon name="navigation.settings" decorative />}
              aria-label={copy.settings}
            />
            <Button variant="secondary" icon={<Icon name="action.download" decorative />}>
              {copy.exportLabel}
            </Button>
            <Button variant="primary" icon={<Icon name="action.add" decorative />}>
              {copy.invite}
            </Button>
          </>
        }
      >
        <Tabs
          type="line"
          activeKey={tab}
          onChange={setTab}
          items={[
            { key: "list", label: copy.tabList },
            { key: "overview", label: copy.tabOverview },
            { key: "matching", label: copy.tabMatching },
            { key: "compare", label: copy.tabCompare },
          ]}
        />
      </PatternPageShell>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// wc-toolbar — PatternListToolbar with real controlled state
// ---------------------------------------------------------------------------

function ToolbarSection({ copy, initialDensity }: { copy: CanaryCopy; initialDensity: DensityKey }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [density, setDensity] = useState<DensityKey>(initialDensity);
  const [filters, setFilters] = useState<Record<string, unknown>>({
    stage: "interview",
    source: "linkedin",
  });

  const filterPills: FilterPillConfig[] = [
    {
      key: "stage",
      label: copy.stageLabel,
      value: String(filters.stage ?? "interview"),
      options: [
        { label: copy.stageScreening, value: "screening" },
        { label: copy.stageInterview, value: "interview" },
      ],
    },
    {
      key: "source",
      label: copy.sourceLabel,
      value: String(filters.source ?? "linkedin"),
      options: [
        { label: copy.sourceLinkedIn, value: "linkedin" },
        { label: copy.sourceReferral, value: "referral" },
      ],
    },
  ];

  return (
    <Box data-testid="wc-toolbar">
      <PatternListToolbar
        title={copy.pageTitle}
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
        primaryAction={{
          label: copy.invite,
          icon: <Icon name="action.add" decorative />,
          onClick: () => undefined,
        }}
        onExport={() => undefined}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// wc-table — PatternDataTable with candidate fixture rows + Pagination
// ---------------------------------------------------------------------------

type StageKey = "screening" | "interview" | "offer";

interface CandidateRow {
  id: string;
  name: string;
  role: string;
  stage: StageKey;
  match: number;
  source: string;
}

const CANDIDATE_ROWS: CandidateRow[] = [
  { id: "c-1", name: "Amelia Torres", role: "Product Designer", stage: "interview", match: 92, source: "LinkedIn" },
  { id: "c-2", name: "Jonas Meyer", role: "Frontend Engineer", stage: "screening", match: 78, source: "Referral" },
  { id: "c-3", name: "Priya Nair", role: "Data Analyst", stage: "offer", match: 88, source: "LinkedIn" },
  { id: "c-4", name: "Marcus Chen", role: "QA Engineer", stage: "screening", match: 64, source: "Referral" },
  { id: "c-5", name: "Sofia Rossi", role: "Engineering Manager", stage: "interview", match: 81, source: "LinkedIn" },
];

const STAGE_BADGE: Record<StageKey, { variant: "primary" | "success" | "warning" }> = {
  screening: { variant: "warning" },
  interview: { variant: "primary" },
  offer: { variant: "success" },
};

function TableSection({ copy }: { copy: CanaryCopy }) {
  const [page, setPage] = useState(1);

  const columns: ColumnDef<CandidateRow>[] = [
    { key: "name", header: copy.colName, accessorKey: "name", sortable: true, pin: "left", width: 180 },
    { key: "role", header: copy.colRole, accessorKey: "role" },
    {
      key: "stage",
      header: copy.colStage,
      accessorKey: "stage",
      render: (value) => {
        const stage = value as StageKey;
        const label =
          stage === "screening"
            ? copy.stageScreening
            : stage === "interview"
              ? copy.stageInterview
              : "Offer";
        return <Badge variant={STAGE_BADGE[stage].variant} badgeStyle="soft" content={label} />;
      },
    },
    {
      key: "match",
      header: copy.colMatch,
      accessorKey: "match",
      width: 140,
      render: (value) => (
        <Box style={{ display: "flex", alignItems: "center", gap: 8, minInlineSize: 110 }}>
          <Box style={{ flex: 1 }}>
            <Progress.Line percent={value as number} showInfo={false} />
          </Box>
          <Text size="xs" color="secondary">
            {String(value)}%
          </Text>
        </Box>
      ),
    },
    { key: "source", header: copy.colSource, accessorKey: "source" },
  ];

  return (
    <Box data-testid="wc-table">
      <Stack spacing="md" fullWidth>
        <PatternDataTable<CandidateRow>
          data={CANDIDATE_ROWS}
          rowKey="id"
          columns={columns}
          striped
          // The canary's declared pattern consumer is the REAL table header.
          // `autoMobileCards` defaults to true and the table measures its own
          // container (this column is `flex: 1 1 560px`), so it switched to the
          // mobile-card renderer at every viewport and no header row existed to
          // probe. Pinning it keeps the header consumer deterministic; mobile
          // posture is still covered by the viewport axis on the other parts.
          autoMobileCards={false}
        />
        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
          <Pagination current={page} total={248} pageSize={5} onChange={setPage} />
        </Box>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// wc-side — Card compound + grouped Select + Input with count + Empty
// ---------------------------------------------------------------------------

function SideSection({ copy }: { copy: CanaryCopy }) {
  const [stage, setStage] = useState<string | undefined>(undefined);
  return (
    <Box data-testid="wc-side">
      {/* navigation.sidebar-tone consumer. The capability's declared evidence
          file is the modern Menu skin, so the canary must render a real Menu:
          a Card standing in for a sidebar would prove nothing about it. */}
      <Box data-testid="wc-sidebar" style={{ marginBlockEnd: 24 }}>
        <Menu
          mode="vertical"
          defaultSelectedKeys={["pipeline"]}
          items={[
            { key: "pipeline", label: copy.tabOverview, icon: <Icon name="navigation.home" decorative /> },
            { key: "matching", label: copy.tabMatching, icon: <Icon name="action.search" decorative /> },
            { key: "settings", label: copy.settings, icon: <Icon name="navigation.settings" decorative /> },
          ]}
        />
      </Box>
      <Card variant="elevated">
        <Card.Header
          title={copy.cardTitle}
          subtitle={copy.cardSubtitle}
          divider
          extra={<Button.Icon icon={<Icon name="navigation.settings" decorative />} aria-label={copy.settings} />}
        />
        <Card.Body>
          <Stack spacing="md" fullWidth>
            <Select
              options={[
                { value: "screening", label: copy.stageScreening, group: copy.groupActive },
                { value: "interview", label: copy.stageInterview, group: copy.groupActive },
                { value: "offer", label: "Offer", group: copy.groupActive },
                { value: "rejected", label: "Rejected", group: copy.groupArchived },
              ]}
              value={stage}
              placeholder={copy.selectPlaceholder}
              onChange={(value) => setStage(value as string)}
            />
            <Input showCount maxLength={80} placeholder={copy.cardNote} />
            <Empty description={copy.emptyTitle} image="simple" />
          </Stack>
        </Card.Body>
        <Card.Footer
          divider
          align="space-between"
          actions={[
            <Button key="save" variant="primary" size="sm">
              {copy.cardSave}
            </Button>,
          ]}
        />
      </Card>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// wc-overlays — Modal + Sheet (portals), Tooltip + Popover
// ---------------------------------------------------------------------------

function OverlaysSection({
  copy,
  modalInitiallyOpen,
  sheetInitiallyOpen,
}: {
  copy: CanaryCopy;
  modalInitiallyOpen: boolean;
  sheetInitiallyOpen: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(modalInitiallyOpen);
  const [sheetOpen, setSheetOpen] = useState(sheetInitiallyOpen);
  return (
    <Box data-testid="wc-overlays">
      <Stack spacing="md" direction="horizontal">
        <Button data-testid="wc-modal-trigger" variant="primary" onClick={() => setModalOpen(true)}>
          {copy.openModal}
        </Button>
        <Button data-testid="wc-sheet-trigger" variant="secondary" onClick={() => setSheetOpen(true)}>
          {copy.openSheet}
        </Button>
        <Tooltip content={copy.tooltipContent} placement="top">
          <Button data-testid="wc-tooltip-trigger" variant="ghost">
            Tooltip
          </Button>
        </Tooltip>
        <Popover title={copy.popoverTitle} content={copy.popoverContent} trigger="click" arrow>
          <Button data-testid="wc-popover-trigger" variant="ghost">
            Popover
          </Button>
        </Popover>
      </Stack>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        onOk={() => setModalOpen(false)}
        title={copy.modalTitle}
        description={copy.modalDescription}
      >
        {copy.modalBody}
      </Modal>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} side="right" title={copy.sheetTitle}>
        {copy.sheetBody}
      </Sheet>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// wc-widgets — WidgetBoard (first showroom specimen for the family)
// ---------------------------------------------------------------------------

function buildWidgetItems(copy: CanaryCopy): WidgetBoardItem[] {
  return [
    {
      id: "w-pipeline",
      accessibleTitle: "Pipeline by stage",
      title: "Pipeline by stage",
      header: {
        eyebrow: "PIPELINE",
        icon: <Icon name="analytics.dashboard" decorative />,
        accessory: <Badge variant="primary" badgeStyle="soft" content="Live" />,
      },
      catalog: { description: "Stage distribution for the open requisitions", category: "Pipeline" },
      content: (
        <Stack spacing="sm" fullWidth>
          <Progress.Line percent={62} showInfo={false} />
          <Progress.Line percent={38} showInfo={false} />
          <Progress.Line percent={21} showInfo={false} />
        </Stack>
      ),
      size: "wide",
      order: 0,
      visible: true,
    },
    {
      id: "w-match",
      accessibleTitle: "Average match",
      title: "Average match",
      header: { eyebrow: "INTELLIGENCE", icon: <Icon name="analytics.dashboard" decorative /> },
      catalog: { description: "Mean match score across active candidates", category: "Intelligence", recommended: true },
      content: (
        <Stack spacing="xs">
          <Text size="lg">81%</Text>
          <Text size="xs" color="secondary">
            +4 pts this week
          </Text>
        </Stack>
      ),
      size: "sm",
      order: 1,
      visible: true,
    },
    {
      id: "w-sources",
      accessibleTitle: "Sources",
      title: "Top sources",
      header: { eyebrow: "ACQUISITION" },
      content: (
        <Stack spacing="xs">
          <Text size="sm">LinkedIn · 142</Text>
          <Text size="sm">Referral · 63</Text>
          <Text size="sm">Inbound · 41</Text>
        </Stack>
      ),
      size: "md",
      order: 2,
      visible: true,
    },
    {
      id: "w-notes",
      accessibleTitle: "Next actions",
      title: "Next actions",
      header: { eyebrow: "WORKFLOW" },
      content: (
        <Stack spacing="xs">
          <Text size="sm">Schedule panel for A. Torres</Text>
          <Text size="sm">Send offer draft to P. Nair</Text>
        </Stack>
      ),
      size: "lg",
      order: 3,
      visible: true,
    },
  ];
}

function WidgetsSection({ copy }: { copy: CanaryCopy }) {
  const [items, setItems] = useState<WidgetBoardItem[]>(() => buildWidgetItems(copy));
  return (
    <Box data-testid="wc-widgets">
      <WidgetBoard
        items={items}
        labels={copy.widgetLabels}
        editable
        onItemsChange={setItems}
        onReset={() => buildWidgetItems(copy)}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// wc-states — Spinner (2 sizes) + Skeleton table
// ---------------------------------------------------------------------------

function StatesSection({ copy }: { copy: CanaryCopy }) {
  return (
    <Box data-testid="wc-states">
      <Stack spacing="md" fullWidth>
        <Text size="xs" color="secondary">
          {copy.statesCaption}
        </Text>
        <Stack spacing="lg" direction="horizontal">
          <Spinner size="md" label={copy.spinnerSync} />
          <Spinner size="xl" label={copy.spinnerLoading} />
        </Stack>
        <Skeleton.Table rows={4} columns={5} />
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/** The only two mountable sources. Anything else is a hard failure. */
const SOURCES: readonly Source[] = ["bithire-static", "themanagement-db", "themanagement-seeds"];

/**
 * A requested source that cannot mount must FAIL VISIBLY. The previous form
 * coerced any unrecognised `?source` to `bithire-static`, so a typo — or a
 * tenant that stopped resolving — rendered a different vertical under the
 * requested name. That silent substitution is the defect this probe exists to
 * catch, so it cannot be allowed to live in the probe's own plumbing.
 */
function ProbeFailure({ requested }: { requested: string }) {
  return (
    <main
      data-testid="wc-source-failure"
      data-canary-source-requested={requested}
      style={{ minHeight: "100vh", padding: 32, fontFamily: "system-ui, sans-serif", background: "#2b0b0b", color: "#ffd9d9" }}
    >
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>canary source did not mount</h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
        Requested source <code>{requested || "(empty)"}</code> is not one of{" "}
        <code>{SOURCES.join(" | ")}</code>. Nothing is rendered on purpose: falling back to
        another tenant would make this probe certify the wrong vertical under the requested name.
      </p>
    </main>
  );
}

function ProbeContent() {
  const searchParams = useSearchParams();
  const requestedSource = searchParams.get("source");
  // Absent is the documented default; PRESENT-BUT-UNKNOWN is an error.
  const sourceIsValid = requestedSource === null || (SOURCES as readonly string[]).includes(requestedSource);
  const source: Source = (requestedSource ?? "bithire-static") as Source;
  const locale: Locale = searchParams.get("locale") === "es" || searchParams.get("locale") === "ar" ? (searchParams.get("locale") as Locale) : "en";
  const density: Density = searchParams.get("density") === "compact" || searchParams.get("density") === "spacious" ? (searchParams.get("density") as Density) : "comfortable";
  const theme: Theme = searchParams.get("theme") === "dark" ? "dark" : "light";
  // Overlays are opt-in (`&modal=1` / `&sheet=1`) so they do not cover the
  // other sections in their own captures (they portal above everything).
  const modalInitiallyOpen = searchParams.get("modal") === "1";
  const sheetInitiallyOpen = searchParams.get("sheet") === "1";

  const seedPrimary = searchParams.get("seedPrimary") ?? undefined;
  const config = useMemo(
    () => tenantConfig(source, locale, density, theme, seedPrimary),
    [source, locale, density, theme, seedPrimary],
  );
  const copy = COPY[locale];
  const appearanceDensity: DensityKey = density;

  if (!sourceIsValid) return <ProbeFailure requested={requestedSource ?? ""} />;

  // The mounted identity must also MATCH what was asked for: a resolver that
  // quietly returns another tenant is the same defect wearing a valid name.
  const expectedSlug =
    source === "themanagement-db"
      ? "themanagementmiami"
      : source === "themanagement-seeds"
        ? "themanagementseeds"
        : "bithire";
  if (config.slug !== expectedSlug) return <ProbeFailure requested={`${source} -> resolved '${config.slug}'`} />;

  return (
    <DesignSystemProvider
      tenantConfig={{ ...config, locale } as TenantConfig}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme={theme}
    >
      <Box
        data-testid="wc-root"
        data-ds-root=""
        // Contract markers: the suite reads the identity that ACTUALLY mounted,
        // never the query string it asked for. Comparing the two is what makes
        // a silent tenant substitution detectable from the DOM alone.
        data-canary-source={source}
        data-canary-tenant={config.slug}
        data-canary-engine="modern"
        data-canary-locale={locale}
        dir={locale === "ar" ? "rtl" : "ltr"}
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          padding: 24,
        }}
      >
        <Box style={{ maxInlineSize: 1280, marginInline: "auto", display: "grid", gap: 24 }}>
          <HeaderSection copy={copy} />
          {/* Main grid: 1fr / 340px, collapses to one column under ~900px
              (flex-wrap: 560 + 24 gap + 320 basis ≈ 904px breakpoint). */}
          <Box style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
            <Box style={{ flex: "1 1 560px", minInlineSize: 0, display: "grid", gap: 24 }}>
              <ToolbarSection copy={copy} initialDensity={appearanceDensity} />
              <TableSection copy={copy} />
              <OverlaysSection
                copy={copy}
                modalInitiallyOpen={modalInitiallyOpen}
                sheetInitiallyOpen={sheetInitiallyOpen}
              />
              <WidgetsSection copy={copy} />
              <StatesSection copy={copy} />
            </Box>
            <Box style={{ flex: "1 1 320px", minInlineSize: 280, maxInlineSize: "100%" }}>
              <SideSection copy={copy} />
            </Box>
          </Box>
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}

export default function WlCanaryProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
