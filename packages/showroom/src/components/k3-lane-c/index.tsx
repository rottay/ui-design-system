"use client";

/**
 * K3 Lane C probe (showroom): layout & navigation-chrome families.
 *
 * One identical component tree for the seven Lane-C families (Collapse,
 * ScrollArea, Layout, Splitter, Affix, Anchor, BackTop) rendered under two
 * opposing governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The density posture sweeps compact | comfortable | spacious through
 * `appearance.general.density` only (`comfortable` maps to the canonical
 * `normal` alias at the Appearance boundary), and the locale sweep renders
 * EN/ES/AR with `dir="rtl"` for Arabic.
 *
 * State axis (deterministic, no timers):
 *  - `rest`:     every family in its default posture;
 *  - `disabled`: Collapse renders a disabled panel (the other families have
 *    no disabled state and honestly render `rest` — the spec records this);
 *  - `active`:   Collapse opens every panel, Anchor pins a controlled
 *    activeKey (aria-current), ScrollArea switches to hover-reveal
 *    scrollbars, Affix renders its advanced pre-affixed surface.
 *
 * Semantic-HTML law: this probe owns the page's single `<main>` landmark
 * and its single `<h1>` (the K1 probes tripped landmark-one-main /
 * page-has-heading-one). The Layout specimen therefore renders Sider +
 * Header + Footer around a plain region: a Layout.Content would mint a
 * SECOND `<main>`. Content's structure/paint contract is covered by
 * `Layout.modern-contract.test.tsx`.
 *
 * Determinism notes: Affix's advanced specimen targets an inner scroll box
 * with the bar at offsetTop=0 so `data-sticky` is set on first measure
 * (never scroll-dependent); BackTop uses visibilityHeight={0} so it is
 * always mounted. Every cell is URL-addressable; no fixture value here is
 * product content.
 */

import {
  Affix,
  Anchor,
  BackTop,
  Box,
  Collapse,
  DesignSystemProvider,
  Heading,
  Layout,
  ScrollArea,
  Splitter,
  Stack,
  Text,
  bithireBrandTheme,
  type TenantConfig,
} from "@rottay/design-system";
import { useRef } from "react";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type LaneCSource = "bithire-static" | "themanagement-db";
export type LaneCLocale = "en" | "es" | "ar";
export type LaneCDensity = "compact" | "comfortable" | "spacious";
export type LaneCState = "rest" | "disabled" | "active";

export interface K3LaneCProbeProps {
  source: LaneCSource;
  locale: LaneCLocale;
  density: LaneCDensity;
  state: LaneCState;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: LaneCDensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: LaneCSource,
  locale: LaneCLocale,
  density: LaneCDensity
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

const COPY: Record<LaneCLocale, Record<string, string>> = {
  en: {
    title: "Layout & navigation chrome specimen",
    collapseCaption: "Collapse — bordered, ghost, and small rhythm",
    panelOne: "Pipeline overview",
    panelTwo: "Interview logistics",
    panelThree: "Offer approvals with a deliberately long header that must truncate cleanly instead of wrapping over the arrow affordance",
    panelDisabled: "Archived stage (disabled)",
    panelBody:
      "Stage metrics, owner assignments, and SLAs render here. The reveal animates on the grid row track, never on a guessed max-height.",
    extraAction: "Edit",
    scrollCaption: "ScrollArea — vertical and horizontal, token scrollbar",
    scrollRow: "Candidate row",
    scrollChip: "Very wide pipeline column",
    scrollVerticalLabel: "Candidate rows",
    scrollHorizontalLabel: "Pipeline columns",
    layoutCaption: "Layout — shell chrome with collapsible sider",
    layoutNav: "Navigation rail",
    layoutHeader: "Workspace header",
    layoutFooter: "Workspace footer",
    layoutRegion:
      "Content region (Layout.Content is omitted in this probe: one <main> per page, owned by the probe root)",
    splitterCaption: "Splitter — drag or use arrow keys on the separator",
    paneA: "Requisitions",
    paneB: "Candidate detail",
    paneTop: "Calendar",
    paneBottom: "Interviewer notes",
    affixCaption: "Affix — sticky bar (left) and pre-affixed advanced bar inside a scroll box",
    affixBar: "Bulk actions",
    affixScrollRow: "Scrollable row",
    affixScrollRegion: "Affix demo scrollable region",
    anchorCaption: "Anchor — nested section navigation with logical accent rail",
    anchorOne: "Overview",
    anchorTwo: "Compensation",
    anchorTwoChild: "Bands",
    anchorThree: "Compliance",
    sectionOne: "Overview section",
    sectionTwo: "Compensation section",
    sectionThree: "Compliance section",
    backtopCaption: "BackTop — always-mounted specimen (visibilityHeight 0)",
  },
  es: {
    title: "Espécimen de layout y chrome de navegación",
    collapseCaption: "Collapse — con borde, ghost y ritmo pequeño",
    panelOne: "Resumen del pipeline",
    panelTwo: "Logística de entrevistas",
    panelThree: "Aprobaciones de ofertas con un encabezado deliberadamente largo que debe truncarse sin solapar el indicador",
    panelDisabled: "Etapa archivada (deshabilitada)",
    panelBody:
      "Métricas de etapa, responsables y SLAs se renderizan aquí. La revelación anima la pista grid, nunca un max-height adivinado.",
    extraAction: "Editar",
    scrollCaption: "ScrollArea — vertical y horizontal, scrollbar por tokens",
    scrollRow: "Fila de candidato",
    scrollChip: "Columna de pipeline muy ancha",
    scrollVerticalLabel: "Filas de candidatos",
    scrollHorizontalLabel: "Columnas del pipeline",
    layoutCaption: "Layout — chrome de shell con sider plegable",
    layoutNav: "Riel de navegación",
    layoutHeader: "Encabezado del workspace",
    layoutFooter: "Pie del workspace",
    layoutRegion:
      "Región de contenido (Layout.Content se omite en esta sonda: un solo <main> por página, propiedad de la raíz de la sonda)",
    splitterCaption: "Splitter — arrastre o use las flechas en el separador",
    paneA: "Vacantes",
    paneB: "Detalle del candidato",
    paneTop: "Calendario",
    paneBottom: "Notas del entrevistador",
    affixCaption: "Affix — barra sticky (izquierda) y barra avanzada pre-fijada en un scroll box",
    affixBar: "Acciones en lote",
    affixScrollRow: "Fila desplazable",
    affixScrollRegion: "Región desplazable de la demo de Affix",
    anchorCaption: "Anchor — navegación de secciones anidada con riel de acento lógico",
    anchorOne: "Resumen",
    anchorTwo: "Compensación",
    anchorTwoChild: "Bandas",
    anchorThree: "Cumplimiento",
    sectionOne: "Sección de resumen",
    sectionTwo: "Sección de compensación",
    sectionThree: "Sección de cumplimiento",
    backtopCaption: "BackTop — espécimen siempre montado (visibilityHeight 0)",
  },
  ar: {
    title: "عينة التخطيط وعناصر التنقل",
    collapseCaption: "Collapse — بإطار، شفاف، وإيقاع صغير",
    panelOne: "نظرة عامة على خط التوظيف",
    panelTwo: "لوجستيات المقابلات",
    panelThree: "موافقات العروض مع عنوان طويل عمداً يجب أن يُقتطع بشكل نظيف دون التفاف فوق مؤشر السهم",
    panelDisabled: "مرحلة مؤرشفة (معطّلة)",
    panelBody:
      "تُعرض هنا مقاييس المرحلة والمسؤولون واتفاقيات مستوى الخدمة. يتحرك الكشف على مسار الشبكة، لا على max-height متخمَّن.",
    extraAction: "تحرير",
    scrollCaption: "ScrollArea — عمودي وأفقي، شريط تمرير بالرموز",
    scrollRow: "صف مرشح",
    scrollChip: "عمود خط توظيف عريض جداً",
    scrollVerticalLabel: "صفوف المرشحين",
    scrollHorizontalLabel: "أعمدة خط التوظيف",
    layoutCaption: "Layout — هيكل مع شريط جانبي قابل للطي",
    layoutNav: "سكة التنقل",
    layoutHeader: "ترويسة مساحة العمل",
    layoutFooter: "تذييل مساحة العمل",
    layoutRegion:
      "منطقة المحتوى (Layout.Content محذوف في هذه العينة: عنصر <main> واحد لكل صفحة، تملكه جذر العينة)",
    splitterCaption: "Splitter — اسحب أو استخدم الأسهم على الفاصل",
    paneA: "الوظائف الشاغرة",
    paneB: "تفاصيل المرشح",
    paneTop: "التقويم",
    paneBottom: "ملاحظات المُقابِل",
    affixCaption: "Affix — شريط لاصق (يسار) وشريط متقدم مثبّت مسبقاً داخل صندوق تمرير",
    affixBar: "إجراءات جماعية",
    affixScrollRow: "صف قابل للتمرير",
    affixScrollRegion: "منطقة التمرير لعينة Affix",
    anchorCaption: "Anchor — تنقل أقسام متداخل بسكة تمييز منطقية",
    anchorOne: "نظرة عامة",
    anchorTwo: "التعويضات",
    anchorTwoChild: "النطاقات",
    anchorThree: "الامتثال",
    sectionOne: "قسم النظرة العامة",
    sectionTwo: "قسم التعويضات",
    sectionThree: "قسم الامتثال",
    backtopCaption: "BackTop — عينة مثبتة دائماً (visibilityHeight 0)",
  },
};

function Caption({ children }: { children: string }) {
  return (
    <Text weight="semibold" size="sm">
      {children}
    </Text>
  );
}

/** Collapse specimens: bordered (default), ghost, and the small rhythm. */
function CollapseSpecimen({ copy, state }: { copy: Record<string, string>; state: LaneCState }) {
  const allOpen = state === "active";
  const disableThird = state === "disabled";
  return (
    <Stack spacing="sm" data-testid="k3-collapse">
      <Caption>{copy.collapseCaption}</Caption>
      <Collapse defaultActiveKey={allOpen ? ["one", "two", "three"] : ["one"]}>
        <Collapse.Panel panelKey="one" header={copy.panelOne}>
          <Text size="sm">{copy.panelBody}</Text>
        </Collapse.Panel>
        <Collapse.Panel
          panelKey="two"
          header={copy.panelTwo}
          extra={
            <button type="button" data-testid="k3-collapse-extra">
              {copy.extraAction}
            </button>
          }
        >
          <Text size="sm">{copy.panelBody}</Text>
        </Collapse.Panel>
        <Collapse.Panel panelKey="three" header={copy.panelThree} disabled={disableThird}>
          <Text size="sm">{copy.panelBody}</Text>
        </Collapse.Panel>
      </Collapse>
      <Collapse ghost defaultActiveKey={allOpen ? ["g1"] : []}>
        <Collapse.Panel panelKey="g1" header={copy.panelTwo}>
          <Text size="sm">{copy.panelBody}</Text>
        </Collapse.Panel>
      </Collapse>
      <Collapse size="sm" bordered={false} defaultActiveKey={allOpen ? ["s1"] : []}>
        <Collapse.Panel panelKey="s1" header={copy.panelOne}>
          <Text size="sm">{copy.panelBody}</Text>
        </Collapse.Panel>
      </Collapse>
    </Stack>
  );
}

/** ScrollArea specimens: vertical rhythm + horizontal overflow. Each instance
 * carries a meaningful, unique accessible name so the engine promotes it to a
 * named `role="region"` landmark — the unnamed default is NOT a landmark
 * (axe landmark-unique; K3-C remediation). */
function ScrollAreaSpecimen({ copy, state }: { copy: Record<string, string>; state: LaneCState }) {
  const hideScrollbar = state === "active";
  return (
    <Stack spacing="sm" data-testid="k3-scrollarea">
      <Caption>{copy.scrollCaption}</Caption>
      <ScrollArea
        data-testid="k3-scrollarea-vertical"
        maxHeight={150}
        hideScrollbar={hideScrollbar}
        aria-label={copy.scrollVerticalLabel}
      >
        <Stack spacing="xs">
          {Array.from({ length: 12 }, (_, i) => (
            <Text key={i} size="sm">
              {copy.scrollRow} {i + 1}
            </Text>
          ))}
        </Stack>
      </ScrollArea>
      <ScrollArea
        orientation="horizontal"
        maxWidth="100%"
        scrollbarSize="thin"
        aria-label={copy.scrollHorizontalLabel}
      >
        <div style={{ display: "flex", gap: 8, inlineSize: "max-content" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <Text key={i} size="sm" style={{ whiteSpace: "nowrap" }}>
              {copy.scrollChip} {i + 1}
            </Text>
          ))}
        </div>
      </ScrollArea>
    </Stack>
  );
}

/** Layout specimen: shell chrome. Layout.Content deliberately omitted — see header. */
function LayoutSpecimen({ copy }: { copy: Record<string, string> }) {
  return (
    <Stack spacing="sm" data-testid="k3-layout">
      <Caption>{copy.layoutCaption}</Caption>
      <Layout hasSider style={{ minBlockSize: 380, border: "1px solid var(--ds-color-border)" }}>
        <Layout.Sider width={180} collapsedWidth={64} collapsible theme="dark">
          <Box style={{ padding: 12 }}>
            <Text size="sm">{copy.layoutNav}</Text>
          </Box>
        </Layout.Sider>
        <Layout>
          <Layout.Header>{copy.layoutHeader}</Layout.Header>
          {/* Plain region: Layout.Content would mint a second <main> (see header). */}
          <div style={{ flex: "1 1 0%", padding: "var(--ds-spacing-4, 16px)" }}>
            <Text size="sm">{copy.layoutRegion}</Text>
          </div>
          <Layout.Footer>{copy.layoutFooter}</Layout.Footer>
        </Layout>
      </Layout>
    </Stack>
  );
}

/** Splitter specimens: horizontal pair + vertical pair. */
function SplitterSpecimen({ copy }: { copy: Record<string, string> }) {
  const paneStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    blockSize: "100%",
    background: "var(--ds-surface-inset)",
    color: "var(--ds-color-text-secondary)",
  } as const;
  return (
    <Stack spacing="sm" data-testid="k3-splitter">
      <Caption>{copy.splitterCaption}</Caption>
      <div style={{ blockSize: 180, border: "1px solid var(--ds-color-border)" }} data-testid="k3-splitter-horizontal">
        <Splitter>
          <Splitter.Panel>
            <div style={paneStyle}>
              <Text size="sm">{copy.paneA}</Text>
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div style={paneStyle}>
              <Text size="sm">{copy.paneB}</Text>
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
      <div style={{ blockSize: 200, border: "1px solid var(--ds-color-border)" }} data-testid="k3-splitter-vertical">
        <Splitter layout="vertical">
          <Splitter.Panel>
            <div style={paneStyle}>
              <Text size="sm">{copy.paneTop}</Text>
            </div>
          </Splitter.Panel>
          <Splitter.Panel>
            <div style={paneStyle}>
              <Text size="sm">{copy.paneBottom}</Text>
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </Stack>
  );
}

/** Affix specimens: simple sticky + advanced pre-affixed inside an inner scroll box. */
function AffixSpecimen({ copy, state }: { copy: Record<string, string>; state: LaneCState }) {
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const advanced = state === "active";
  const barStyle = {
    padding: "10px var(--ds-spacing-4, 16px)",
    // Material card channel first: the raw --ds-surface-card is the brand's
    // dark chrome surface on some tenants (TMM: #18181c, incoherent with
    // the inherited ink) — measured in the K3-C pass-2 contrast remediation.
    background: "var(--ds-material-card-background, var(--ds-surface-card))",
    border: "1px solid var(--ds-color-border)",
    fontWeight: 600,
    fontSize: 14,
  } as const;
  // The advanced bar's child deliberately paints NO surface of its own: the
  // visible affixed chrome must come from the skin-owned wrapper surface
  // (the DS-P067 fix) and from nothing else — airtight capture evidence.
  const bareBarStyle = {
    padding: "10px var(--ds-spacing-4, 16px)",
    fontWeight: 600,
    fontSize: 14,
  } as const;
  return (
    <Stack spacing="sm" data-testid="k3-affix">
      <Caption>{copy.affixCaption}</Caption>
      {!advanced && (
        <div data-testid="k3-affix-simple">
          <Affix offsetTop={0}>
            <div style={barStyle}>{copy.affixBar}</div>
          </Affix>
        </div>
      )}
      {advanced && (
        <div
          ref={scrollBoxRef}
          data-testid="k3-affix-scrollbox"
          role="region"
          tabIndex={0}
          aria-label={copy.affixScrollRegion}
          style={{
            blockSize: 160,
            overflow: "auto",
            // outline, not border: a 1px border would push the placeholder
            // 1px below the container rect top and the offsetTop=0 measure
            // would never affix. Outline keeps the frame AND the determinism.
            outline: "1px solid var(--ds-color-border)",
          }}
        >
          {/* The bar sits at the very top of the scroll content with
              offsetTop=0, so the first measure affixes it deterministically
              (data-sticky) without any scroll gesture. */}
          <Affix offsetTop={0} target={() => scrollBoxRef.current} onChange={() => {}}>
            <div style={bareBarStyle}>{copy.affixBar}</div>
          </Affix>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ padding: "8px var(--ds-spacing-4, 16px)" }}>
              <Text size="sm">
                {copy.affixScrollRow} {i + 1}
              </Text>
            </div>
          ))}
        </div>
      )}
    </Stack>
  );
}

/** Anchor specimen: nested links + real target sections, controlled active in `active`. */
function AnchorSpecimen({ copy, state }: { copy: Record<string, string>; state: LaneCState }) {
  return (
    <Stack spacing="sm" data-testid="k3-anchor">
      <Caption>{copy.anchorCaption}</Caption>
      <Anchor
        affix={false}
        activeKey={state === "active" ? "#k3-section-2" : undefined}
      >
        <Anchor.Link href="#k3-section-1" title={copy.anchorOne} />
        <Anchor.Link href="#k3-section-2" title={copy.anchorTwo}>
          <Anchor.Link href="#k3-section-2-bands" title={copy.anchorTwoChild} />
        </Anchor.Link>
        <Anchor.Link href="#k3-section-3" title={copy.anchorThree} />
      </Anchor>
      <Stack spacing="xs">
        <section id="k3-section-1">
          <Text size="sm">{copy.sectionOne}</Text>
        </section>
        <section id="k3-section-2">
          <Text size="sm">{copy.sectionTwo}</Text>
        </section>
        <section id="k3-section-3">
          <Text size="sm">{copy.sectionThree}</Text>
        </section>
      </Stack>
    </Stack>
  );
}

function SpecimenTree({
  locale,
  state,
}: Pick<K3LaneCProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  return (
    <Stack spacing="xl" data-testid="k3-root">
      <Heading level="h1" data-testid="k3-title" size="xl">
        {copy.title}
      </Heading>
      <CollapseSpecimen copy={copy} state={state} />
      <ScrollAreaSpecimen copy={copy} state={state} />
      <LayoutSpecimen copy={copy} />
      <SplitterSpecimen copy={copy} />
      <AffixSpecimen copy={copy} state={state} />
      <AnchorSpecimen copy={copy} state={state} />
      <Text size="sm" data-testid="k3-backtop-caption">
        {copy.backtopCaption}
      </Text>
      {/* Always mounted (visibilityHeight 0): the family IS an overlay, so
          the specimen overlays the cell corner exactly as it would in an app. */}
      <div data-testid="k3-backtop">
        <BackTop visibilityHeight={0} />
      </div>
    </Stack>
  );
}

export function K3LaneCProbe({ source, locale, density, state }: K3LaneCProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="k3-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <main
          data-testid="k3-main"
          data-k3-source={source}
          data-k3-density={density}
          data-k3-state={state}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 860,
            marginInline: "auto",
          }}
        >
          <SpecimenTree locale={locale} state={state} />
        </main>
      </Box>
    </DesignSystemProvider>
  );
}
