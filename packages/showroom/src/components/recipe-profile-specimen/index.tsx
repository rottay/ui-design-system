"use client";

/**
 * DS-Q001L canonical specimen (showroom probe).
 *
 * One identical component tree for the six DS-S001 families rendered under
 * two opposing governed sources:
 *  - `technical-static`: static BrandTheme selecting `rottay/technical-sharp@1`
 *    (radius-zero, ruled, outlined posture);
 *  - `editorial-db`: DB Appearance selecting `rottay/editorial-round@1`
 *    (ultra-rounded, soft, elevated posture).
 *
 * Every cell is deterministic and URL-addressable; the Playwright matrix
 * asserts DOM parity and computed-style divergence, and Codex performs the
 * sighted inspection. No fixture value here is product content.
 */

import { useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  DesignSystemProvider,
  Heading,
  PatternDataTable,
  Stack,
  SurfaceSectionCard,
  Tabs,
  Tag,
  Text,
  type BrandTheme,
  type TenantConfig,
} from "@rottay/design-system";

export type SpecimenSource = "technical-static" | "editorial-db";
export type SpecimenLocale = "en" | "es" | "ar";
export type SpecimenState = "rest" | "focus" | "disabled" | "loading" | "selected";
export type SpecimenStress = "default" | "long" | "dense" | "empty";

export interface RecipeProfileSpecimenProps {
  source: SpecimenSource;
  locale: SpecimenLocale;
  state: SpecimenState;
  stress: SpecimenStress;
}

/** Static technical vertical: square, ruled, cold, outlined. */
const TECHNICAL_STATIC_THEME: BrandTheme = {
  id: "q001l-technical",
  name: "Q001L Technical",
  recipes: { schemaVersion: 1, profile: "rottay/technical-sharp@1" },
  palette: {
    primaryColor: "#1a56db",
    backgroundColor: "#f4f5f7",
    textPrimaryColor: "#111827",
    borderPrimaryColor: "#9aa3b2",
  },
  typography: {
    fontFamilyBase: "'IBM Plex Sans', system-ui, sans-serif",
    fontFamilyHeading: "'IBM Plex Mono', ui-monospace, monospace",
    labelStyle: "uppercase",
  },
  surfaces: {
    borderRadius: { sm: "0px", md: "0px", lg: "0px", xl: "0px" },
    shadows: { sm: "none", md: "none", lg: "none", xl: "none" },
    densityScale: 0.92,
    effectIntensity: 0,
  },
};

/**
 * DB editorial tenant: round, soft, warm, elevated. Expressed strictly as the
 * bounded Appearance projection a customer row compiles to — never as a
 * static BrandTheme — so the specimen exercises the DB-owned runtime path.
 */
const EDITORIAL_DB_APPEARANCE = {
  recipeProfile: "rottay/editorial-round@1",
  general: {
    palette: {
      primary: "#b45309",
      secondary: "#7c3f18",
      accent: "#c26d2d",
      background: "#fffaf3",
      foreground: {
        primary: "#2c1810",
        secondary: "#674332",
        muted: "#886858",
        disabled: "#ad9386",
      },
      border: {
        primary: "#d9b99d",
        secondary: "#ead8c7",
      },
      backgroundMode: "light",
    },
    typography: {
      fontFamilyBase: "'Fraunces', Georgia, serif",
      fontFamilyHeading: "'Fraunces', Georgia, serif",
      typePairing: "editorial",
      scale: 1.04,
    },
    shape: {
      buttonStyle: "pill",
      radiusScale: 1.35,
    },
    density: "spacious",
    motion: {
      intensity: 0.75,
      durationScale: 1.08,
      ambient: "subtle",
    },
    surfaces: {
      elevation: "soft",
      effectIntensity: 0.55,
    },
  },
  advanced: {
    tokenOverrides: {
      "--ds-radius-sm": "14px",
      "--ds-radius-md": "20px",
      "--ds-radius-lg": "28px",
      "--ds-radius-xl": "36px",
      "--ds-density-scale": "1.08",
      "--ds-font-family-heading": "'Fraunces', Georgia, serif",
      "--ds-card-bg": "#fff6ea",
      "--ds-tabs-list-bg": "#f3e4d4",
      "--ds-tabs-list-border": "#d9b99d",
      "--ds-tabs-contained-list-bg": "#f3e4d4",
      "--ds-tabs-segmented-list-bg": "#f3e4d4",
      "--ds-tabs-pills-list-bg": "#f3e4d4",
      "--ds-tabs-active-bg": "#fffaf3",
      "--ds-tabs-pills-active-color": "#fffaf3",
      "--ds-tabs-panel-bg": "#fffaf3",
      "--ds-tabs-panel-border": "#ead8c7",
      "--ds-tab-color": "#674332",
      "--ds-tab-color-hover": "#2c1810",
      "--ds-tab-color-active": "#2c1810",
    },
  },
} as const satisfies NonNullable<TenantConfig["appearance"]>;

function tenantConfigFor(source: SpecimenSource): TenantConfig {
  if (source === "editorial-db") {
    return {
      slug: "q001l-editorial",
      name: "Editorial Round",
      vertical: "bithire",
      engine: "modern",
      theme: "light",
      plan: "enterprise",
      features: ["*"],
      branding: { companyName: "Editorial Round" },
      appearance: EDITORIAL_DB_APPEARANCE,
    };
  }
  return {
    slug: "q001l-technical",
    name: "Q001L Technical",
    vertical: "bithire",
    engine: "modern",
    theme: "light",
    plan: "enterprise",
    features: ["*"],
    branding: { companyName: "Q001L Technical" },
    brandTheme: TECHNICAL_STATIC_THEME,
  };
}

const COPY: Record<SpecimenLocale, Record<string, string>> = {
  en: {
    title: "Recipe profile specimen",
    action: "Primary action",
    quiet: "Quiet action",
    danger: "Remove",
    cardTitle: "Pipeline summary",
    cardBody: "Deterministic fixture copy for inspection.",
    sectionTitle: "Section grouping",
    tabOne: "Overview",
    tabTwo: "Activity",
    tabThree: "Settings",
    colName: "Name",
    colRole: "Role",
    colScore: "Score",
    colStage: "Stage",
    tagA: "Reviewed",
    tagB: "Priority",
  },
  es: {
    title: "Espécimen de perfil de receta",
    action: "Acción principal",
    quiet: "Acción silenciosa",
    danger: "Quitar",
    cardTitle: "Resumen del pipeline",
    cardBody: "Texto determinista de inspección.",
    sectionTitle: "Agrupación de sección",
    tabOne: "Resumen",
    tabTwo: "Actividad",
    tabThree: "Ajustes",
    colName: "Nombre",
    colRole: "Rol",
    colScore: "Puntaje",
    colStage: "Etapa",
    tagA: "Revisado",
    tagB: "Prioridad",
  },
  ar: {
    title: "عينة ملف الوصفة",
    action: "الاجراء الرئيسي",
    quiet: "اجراء هادئ",
    danger: "ازالة",
    cardTitle: "ملخص خط الانابيب",
    cardBody: "نص حتمي للفحص البصري.",
    sectionTitle: "تجميع القسم",
    tabOne: "نظرة عامة",
    tabTwo: "النشاط",
    tabThree: "الاعدادات",
    colName: "الاسم",
    colRole: "الدور",
    colScore: "النتيجة",
    colStage: "المرحلة",
    tagA: "تمت المراجعة",
    tagB: "اولوية",
  },
};

const LONG_SUFFIX =
  " — an intentionally overlong deterministic translation string that must wrap without clipping, overlapping or forcing horizontal overflow anywhere in the specimen frame";

interface SpecimenRow {
  id: string;
  name: string;
  role: string;
  score: number;
  stage: string;
}

function buildRows(count: number, locale: SpecimenLocale): SpecimenRow[] {
  const stages = ["Applied", "Screening", "Interview", "Offer"];
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index + 1}`,
    name: `${locale.toUpperCase()} Candidate ${String(index + 1).padStart(2, "0")}`,
    role: index % 2 === 0 ? "Platform Engineer" : "Product Designer",
    score: 97 - index * 3,
    stage: stages[index % stages.length],
  }));
}

function SpecimenTree({ locale, state, stress }: Omit<RecipeProfileSpecimenProps, "source">) {
  const copy = COPY[locale];
  const long = stress === "long";
  const focusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (state !== "focus") return;
    let attempts = 0;
    let frame = 0;
    const tryFocus = () => {
      const node = focusRef.current;
      if (node) {
        node.focus();
        if (document.activeElement === node) return;
      }
      if (attempts++ < 60) frame = requestAnimationFrame(tryFocus);
    };
    frame = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(frame);
  }, [state]);

  const rows = buildRows(stress === "dense" ? 24 : 6, locale);
  const label = (text: string) => (long ? `${text}${LONG_SUFFIX}` : text);

  return (
    <Stack spacing="lg" data-testid="specimen-root">
      <Heading level="h2" data-testid="specimen-title">
        {label(copy.title)}
      </Heading>

      <Stack spacing="sm" data-testid="specimen-buttons">
        <Button
          ref={focusRef}
          data-testid="specimen-button-primary"
          disabled={state === "disabled"}
          loading={state === "loading"}
        >
          {label(copy.action)}
        </Button>
        <Button data-testid="specimen-button-quiet" variant="ghost">
          {copy.quiet}
        </Button>
        <Button data-testid="specimen-button-danger" variant="danger">
          {copy.danger}
        </Button>
      </Stack>

      <Card data-testid="specimen-card" title={label(copy.cardTitle)}>
        <Text data-testid="specimen-card-body">{label(copy.cardBody)}</Text>
        <Stack direction="horizontal" spacing="sm" data-testid="specimen-tags">
          <Tag data-testid="specimen-tag-a">{copy.tagA}</Tag>
          <Tag data-testid="specimen-tag-b" variant="warning">
            {label(copy.tagB)}
          </Tag>
        </Stack>
      </Card>

      <div data-testid="specimen-section">
        <SurfaceSectionCard title={label(copy.sectionTitle)}>
          <Tabs
            data-testid="specimen-tabs"
            items={[
              { key: "one", label: copy.tabOne, children: <Text>{copy.tabOne}</Text> },
              { key: "two", label: label(copy.tabTwo), children: <Text>{copy.tabTwo}</Text> },
              { key: "three", label: copy.tabThree, children: <Text>{copy.tabThree}</Text> },
            ]}
          />
        </SurfaceSectionCard>
      </div>

      <div data-testid="specimen-table">
        <PatternDataTable<SpecimenRow>
          data={stress === "empty" ? [] : rows}
          rowKey="id"
          loading={state === "loading"}
          selectable
          selectedKeys={state === "selected" ? ["row-1", "row-3"] : undefined}
          columns={[
            { key: "name", header: label(copy.colName), render: (_value: unknown, row: SpecimenRow) => row.name },
            { key: "role", header: copy.colRole, render: (_value: unknown, row: SpecimenRow) => row.role },
            { key: "score", header: copy.colScore, render: (_value: unknown, row: SpecimenRow) => String(row.score) },
            { key: "stage", header: copy.colStage, render: (_value: unknown, row: SpecimenRow) => row.stage },
          ]}
        />
      </div>
    </Stack>
  );
}

export function RecipeProfileSpecimen({
  source,
  locale,
  state,
  stress,
}: RecipeProfileSpecimenProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfigFor(source), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="specimen-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="specimen-frame"
          data-specimen-source={source}
          data-specimen-state={state}
          data-specimen-stress={stress}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 1100,
            marginInline: "auto",
          }}
        >
          <SpecimenTree locale={locale} state={state} stress={stress} />
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}
