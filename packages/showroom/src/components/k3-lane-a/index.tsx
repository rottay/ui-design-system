"use client";

/**
 * K3 Lane A probe (showroom): data-display families.
 *
 * One identical component tree for the six Lane-A families (Table, List,
 * Statistic, Descriptions, Timeline, Tree) rendered under two opposing
 * governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The density posture sweeps compact | comfortable | spacious through
 * `appearance.general.density` only (`comfortable` maps to the canonical
 * `normal` alias at the Appearance boundary), and the locale sweep renders
 * EN/ES/AR with `dir="rtl"` for Arabic -- the Tree indentation and Table
 * alignment hooks are logical, so the Arabic cell is the RTL witness. The
 * state axis is `rest | loading | empty`: Table/List/Statistic own loading
 * postures; Table owns the empty posture (its i18n `table.empty`); the other
 * families render their rest anatomy in every state cell (no loading/empty
 * contract exists for them). Every cell is deterministic and URL-addressable;
 * no fixture value here is product content.
 */

import {
  Box,
  Descriptions,
  DesignSystemProvider,
  Heading,
  List,
  Stack,
  Statistic,
  Table,
  Timeline,
  Tree,
  bithireBrandTheme,
  type TenantConfig,
  type TreeDataNode,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

/**
 * The public engine-switched `Table`/`List` are typed at `unknown` (their
 * contracts default `T = unknown` and `createEngineComponent` does not
 * propagate the generic), so the probe narrows callback params to its own
 * fixture shapes at the callback boundary.
 */
type ProbeRow = { key: string; name: string; role: string; status: string };
type ProbeListItem = { title: string; description: string };

export type LaneASource = "bithire-static" | "themanagement-db";
export type LaneALocale = "en" | "es" | "ar";
export type LaneADensity = "compact" | "comfortable" | "spacious";
export type LaneAState = "rest" | "loading" | "empty";

export interface K3LaneAProbeProps {
  source: LaneASource;
  locale: LaneALocale;
  density: LaneADensity;
  state: LaneAState;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: LaneADensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: LaneASource,
  locale: LaneALocale,
  density: LaneADensity
): TenantConfig {
  if (source === "themanagement-db") {
    const base = brandLocaleTenantConfigFor("themanagementmiami", locale);
    return {
      ...base,
      appearance: {
        ...base.appearance,
        general: {
          ...base.appearance?.general,
          density: toAppearanceDensity(density),
        },
      },
    };
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
    // checked-in DS theme, never from a customer DB fixture. The semantic
    // posture enters exclusively through the Appearance channel.
    brandTheme: bithireBrandTheme,
    appearance: { general: { density: toAppearanceDensity(density) } },
  };
}

const COPY: Record<
  LaneALocale,
  {
    tableTitle: string;
    colName: string;
    colRole: string;
    colStatus: string;
    rows: Array<{ key: string; name: string; role: string; status: string }>;
    listHeader: string;
    listFooter: string;
    listItems: Array<{ title: string; description: string }>;
    statRevenue: string;
    statOrders: string;
    countdownTitle: string;
    descTitle: string;
    descLabels: { name: string; email: string; plan: string; since: string };
    descValues: { plan: string; since: string };
    timelineItems: Array<{ label: string; text: string; color: string }>;
    timelinePending: string;
    tree: TreeDataNode[];
  }
> = {
  en: {
    tableTitle: "Pipeline specimen",
    colName: "Name",
    colRole: "Role",
    colStatus: "Status",
    rows: [
      { key: "1", name: "Ada Lovelace", role: "Staff Engineer", status: "Interview" },
      { key: "2", name: "Grace Hopper", role: "Compiler Lead", status: "Offer" },
      { key: "3", name: "Edsger Dijkstra", role: "Algorithms Researcher", status: "Screening" },
      { key: "4", name: "Barbara Liskov", role: "Distributed Systems", status: "Hired" },
    ],
    listHeader: "Recent activity",
    listFooter: "3 events",
    listItems: [
      { title: "Offer countersigned", description: "The counter-offer for the compiler lead was countersigned by finance." },
      { title: "Interview scheduled", description: "A system-design interview was scheduled for the staff engineer candidate." },
      { title: "Scorecard submitted", description: "The hiring panel submitted the final scorecard for distributed systems." },
    ],
    statRevenue: "Quarterly revenue",
    statOrders: "Filled positions",
    countdownTitle: "Offer expires",
    descTitle: "Candidate record",
    descLabels: { name: "Full name", email: "Email", plan: "Plan", since: "Member since" },
    descValues: { plan: "Enterprise", since: "March 2021" },
    timelineItems: [
      { label: "Mon 09:00", text: "Application received and parsed into the pipeline.", color: "green" },
      { label: "Mon 14:30", text: "Recruiter screen completed with a strong signal.", color: "blue" },
      { label: "Wed 11:15", text: "Technical interview scheduled with the panel.", color: "gray" },
    ],
    timelinePending: "Reference check in progress",
    tree: [
      {
        key: "eng",
        title: "Engineering",
        children: [
          {
            key: "eng-fe",
            title: "Frontend",
            children: [
              { key: "eng-fe-ds", title: "Design Systems" },
              { key: "eng-fe-web", title: "Web Platform" },
            ],
          },
          { key: "eng-be", title: "Backend" },
        ],
      },
      { key: "ops", title: "Operations" },
    ],
  },
  es: {
    tableTitle: "Espécimen de pipeline",
    colName: "Nombre",
    colRole: "Puesto",
    colStatus: "Estado",
    rows: [
      { key: "1", name: "Ada Lovelace", role: "Ingeniera Principal", status: "Entrevista" },
      { key: "2", name: "Grace Hopper", role: "Líder de Compiladores", status: "Oferta" },
      { key: "3", name: "Edsger Dijkstra", role: "Investigador de Algoritmos", status: "Cribado" },
      { key: "4", name: "Barbara Liskov", role: "Sistemas Distribuidos", status: "Contratada" },
    ],
    listHeader: "Actividad reciente",
    listFooter: "3 eventos",
    listItems: [
      { title: "Oferta firmada", description: "La contraoferta para la líder de compiladores fue firmada por finanzas." },
      { title: "Entrevista programada", description: "Se programó una entrevista de diseño de sistemas para la candidata principal." },
      { title: "Evaluación enviada", description: "El panel envió la evaluación final de sistemas distribuidos." },
    ],
    statRevenue: "Ingresos trimestrales",
    statOrders: "Vacantes cubiertas",
    countdownTitle: "La oferta expira",
    descTitle: "Expediente del candidato",
    descLabels: { name: "Nombre completo", email: "Correo", plan: "Plan", since: "Miembro desde" },
    descValues: { plan: "Empresarial", since: "Marzo de 2021" },
    timelineItems: [
      { label: "Lun 09:00", text: "Solicitud recibida e incorporada al pipeline.", color: "green" },
      { label: "Lun 14:30", text: "Entrevista inicial completada con buena señal.", color: "blue" },
      { label: "Mié 11:15", text: "Entrevista técnica programada con el panel.", color: "gray" },
    ],
    timelinePending: "Verificación de referencias en curso",
    tree: [
      {
        key: "eng",
        title: "Ingeniería",
        children: [
          {
            key: "eng-fe",
            title: "Frontend",
            children: [
              { key: "eng-fe-ds", title: "Sistemas de Diseño" },
              { key: "eng-fe-web", title: "Plataforma Web" },
            ],
          },
          { key: "eng-be", title: "Backend" },
        ],
      },
      { key: "ops", title: "Operaciones" },
    ],
  },
  ar: {
    tableTitle: "عينة خط التوظيف",
    colName: "الاسم",
    colRole: "الدور",
    colStatus: "الحالة",
    rows: [
      { key: "1", name: "أدا لوفلايس", role: "مهندسة أولى", status: "مقابلة" },
      { key: "2", name: "غريس هوبر", role: "قائدة المترجمات", status: "عرض" },
      { key: "3", name: "إدسخر ديكسترا", role: "باحث خوارزميات", status: "فرز" },
      { key: "4", name: "باربارا ليسكوف", role: "أنظمة موزعة", status: "تم التوظيف" },
    ],
    listHeader: "النشاط الأخير",
    listFooter: "٣ أحداث",
    listItems: [
      { title: "تم توقيع العرض", description: "وقّعت الإدارة المالية العرض المضاد لقائدة المترجمات." },
      { title: "تمت جدولة المقابلة", description: "تمت جدولة مقابلة تصميم الأنظمة للمرشحة الأولى." },
      { title: "تم إرسال التقييم", description: "أرسلت اللجنة التقييم النهائي للأنظمة الموزعة." },
    ],
    statRevenue: "إيرادات الربع",
    statOrders: "الوظائف المشغولة",
    countdownTitle: "ينتهي العرض",
    descTitle: "سجل المرشح",
    descLabels: { name: "الاسم الكامل", email: "البريد الإلكتروني", plan: "الخطة", since: "عضو منذ" },
    descValues: { plan: "مؤسسات", since: "مارس 2021" },
    timelineItems: [
      { label: "الإثنين 09:00", text: "تم استلام الطلب وإدخاله في خط التوظيف.", color: "green" },
      { label: "الإثنين 14:30", text: "اكتملت المقابلة الأولية بإشارة قوية.", color: "blue" },
      { label: "الأربعاء 11:15", text: "تمت جدولة المقابلة التقنية مع اللجنة.", color: "gray" },
    ],
    timelinePending: "التحقق من المراجع جارٍ",
    tree: [
      {
        key: "eng",
        title: "الهندسة",
        children: [
          {
            key: "eng-fe",
            title: "الواجهة الأمامية",
            children: [
              { key: "eng-fe-ds", title: "أنظمة التصميم" },
              { key: "eng-fe-web", title: "منصة الويب" },
            ],
          },
          { key: "eng-be", title: "الواجهة الخلفية" },
        ],
      },
      { key: "ops", title: "العمليات" },
    ],
  },
};

function SpecimenTree({
  locale,
  state,
}: Pick<K3LaneAProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  const loading = state === "loading";
  const empty = state === "empty";

  return (
    <Stack spacing="xl" data-testid="k3a-root">
      <Heading level="h2" data-testid="k3a-table-heading">
        {copy.tableTitle}
      </Heading>

      <div data-testid="k3a-table">
        <Table
          dataSource={empty ? [] : copy.rows}
          columns={[
            {
              key: "name",
              title: copy.colName,
              dataIndex: "name",
              sorter: (a, b) =>
                (a as ProbeRow).name.localeCompare((b as ProbeRow).name),
            },
            { key: "role", title: copy.colRole, dataIndex: "role" },
            { key: "status", title: copy.colStatus, dataIndex: "status", align: "right" },
          ]}
          rowSelection={{ type: "checkbox" }}
          loading={loading}
          bordered
          pagination={false}
        />
      </div>

      <div data-testid="k3a-list">
        <List
          bordered
          header={copy.listHeader}
          footer={copy.listFooter}
          loading={loading}
          dataSource={empty ? [] : copy.listItems}
          renderItem={(item) => {
            const listItem = item as ProbeListItem;
            return (
              <List.Item key={listItem.title}>
                <List.Item.Meta
                  title={listItem.title}
                  description={listItem.description}
                />
              </List.Item>
            );
          }}
        />
      </div>

      <Stack direction="horizontal" spacing="xl" wrap data-testid="k3a-statistic">
        <div data-testid="k3a-statistic-revenue">
          <Statistic
            title={copy.statRevenue}
            value={empty ? undefined : 128450}
            prefix="$"
            valueType="positive"
            loading={loading}
          />
        </div>
        <div data-testid="k3a-statistic-orders">
          <Statistic
            title={copy.statOrders}
            value={empty ? undefined : 342}
            suffix={locale === "ar" ? "وظيفة" : locale === "es" ? "vacantes" : "roles"}
            loading={loading}
          />
        </div>
        <div data-testid="k3a-countdown">
          <Statistic.Countdown
            title={copy.countdownTitle}
            value={Date.UTC(2099, 0, 1)}
            format="HH:mm:ss"
            valueType="warning"
          />
        </div>
      </Stack>

      <div data-testid="k3a-descriptions">
        <Descriptions
          title={copy.descTitle}
          bordered
          column={2}
        >
          <Descriptions.Item label={copy.descLabels.name}>
            {copy.rows[0].name}
          </Descriptions.Item>
          <Descriptions.Item label={copy.descLabels.email}>
            ada@example.test
          </Descriptions.Item>
          <Descriptions.Item label={copy.descLabels.plan}>
            {copy.descValues.plan}
          </Descriptions.Item>
          <Descriptions.Item label={copy.descLabels.since}>
            {copy.descValues.since}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div data-testid="k3a-timeline">
        <Timeline
          mode="alternate"
          pending={copy.timelinePending}
          items={copy.timelineItems.map((item) => ({
            label: item.label,
            color: item.color,
            children: item.text,
          }))}
        />
      </div>

      <div data-testid="k3a-tree">
        <Tree
          treeData={empty ? [] : copy.tree}
          showLine
          checkable
          defaultExpandAll
        />
      </div>
    </Stack>
  );
}

export function K3LaneAProbe({ source, locale, density, state }: K3LaneAProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="k3a-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="k3a-frame"
          data-k3a-source={source}
          data-k3a-density={density}
          data-k3a-state={state}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 720,
            marginInline: "auto",
          }}
        >
          <SpecimenTree locale={locale} state={state} />
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}
