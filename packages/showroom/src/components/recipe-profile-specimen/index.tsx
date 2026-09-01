"use client";

/**
 * DS-Q001L canonical specimen (showroom probe).
 *
 * One identical component tree for the six DS-S001 families rendered under the
 * two GOVERNED INGRESS PATHS a recipe profile actually has:
 *  - `technical-static`: the code-owned `rottay` registry tenant, whose own
 *    checked-in BrandTheme authors `rottay/technical-sharp@1` (ruled, outlined,
 *    square posture -- and Rottay's real near-black canvas);
 *  - `editorial-db`: a published customer document selecting
 *    `rottay/editorial-round@1`, validated, compiled and mounted as a verified
 *    artifact (rounded, soft, elevated, warm).
 *
 * NEITHER SIDE IS SYNTHESISED ANY MORE, and that is the repair. The static side
 * used to hand-author a `TECHNICAL_STATIC_THEME` BrandTheme and pass it as
 * `tenantConfig.brandTheme`; measured against the real resolver, a runtime
 * BrandTheme is unrenderable under every declaration, so that cell was a
 * spinner. The DB side used to pass a raw `appearance` literal, which is visual
 * payload on its own and blocks just as hard. A hand-authored BrandTheme has
 * exactly one legal home -- the checked-in registry -- and a customer's
 * appearance has exactly one -- a compiled artifact whose mount is proven. So
 * the specimen now uses one of each, which is also the more honest comparison:
 * it contrasts the two ways a profile can REACH the runtime, not two ways of
 * faking it.
 *
 * The editorial document's `radiusScale` is 1.2, not the 1.35 the superseded
 * literal used: 1.2 is the bithire envelope CEILING and 1.35 is a value the
 * real DB channel rejects. Its `advanced.tokenOverrides` block is gone as well
 * -- it hard-coded the radii, the card and the whole tabs tray to the values
 * the author wanted to see, which is exactly the "profile" being simulated
 * instead of selected. The governed dials plus `rottay/editorial-round@1` are
 * what a customer actually has, so they are what the specimen shows.
 *
 * Two placements below are load-bearing rather than stylistic, both inherited
 * from `showroom-tenant`, which is where they are argued in full:
 *
 *   - the registry config is passed UNSPREAD. Code-owned identity is WeakSet
 *     object identity, so `{ ...getKnownTenantConfig('rottay'), locale }` is an
 *     ordinary tenant carrying an uncompiled `brandTheme`, and it blocks.
 *     Locale therefore travels as a provider prop on BOTH sources.
 *   - the artifact `<style>` mounts OUTSIDE the provider. The provider proves
 *     the mount during its own render, before children commit, so an artifact
 *     mounted as a child can never be seen and the cell spins forever.
 *
 * The specimen's own axis (`vertical`) is read off whichever config it mounted
 * -- `rottay` for the registry tenant, `bithire` for the customer row, whose
 * envelope bounds its document -- instead of being restated as a literal that
 * could disagree with the artifact selector.
 *
 * Every cell is deterministic and URL-addressable; the Playwright matrix
 * asserts DOM parity and computed-style divergence, and sighted review performs the
 * sighted inspection. No fixture value here is product content.
 */

import { useEffect, useMemo, useRef } from "react";
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
} from "@rottay/design-system";
import { getKnownTenantConfig } from "@rottay/design-system/server";

import {
  ShowroomArtifactStyle,
  compileShowroomTenantGround,
  type ShowroomTenantGround,
  type ShowroomTenantIdentity,
} from "@/components/showroom-tenant";

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

/**
 * The trusted identity columns of the published editorial row.
 *
 * `verticalKey` is `bithire` because the envelope that bounds the document
 * below is bithire's; the profile it selects is a `rottay/` registry id, which
 * is a namespace on the governed profile registry and not a vertical claim.
 */
const EDITORIAL_IDENTITY: ShowroomTenantIdentity = {
  tenantId: "3f6c1d95-71ab-4e02-8c47-2d5b90ea6c18",
  slug: "q001l-editorial",
  verticalKey: "bithire",
  rowVersion: 1,
};

/**
 * The published editorial document: round, soft, warm, elevated.
 *
 * Expressed as the bounded `TenantThemeDocument` a customer actually writes --
 * not a `BrandTheme` (that channel is reserved for checked-in vertical
 * identity) and not a raw `appearance` literal (that is visual payload no
 * declaration admits). Every dial sits inside the measured bithire envelope:
 * radiusScale 1.2 is its ceiling, effectIntensity 0.55 and motion intensity
 * 0.75 are inside 0-0.65 and 0-0.8, and typeScale 1.04 is inside 0.92-1.08.
 * The visual difference is carried by these governed dials plus the profile
 * selection -- nothing here restates a `--ds-*` value directly.
 */
const EDITORIAL_DOCUMENT = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    recipeProfile: "rottay/editorial-round@1",
    general: {
      palette: {
        primary: "#B45309",
        secondary: "#7C3F18",
        accent: "#C26D2D",
        background: "#FFFAF3",
        foreground: {
          primary: "#2C1810",
          secondary: "#674332",
          muted: "#886858",
          disabled: "#AD9386",
        },
        border: { primary: "#D9B99D", secondary: "#EAD8C7" },
        backgroundMode: "light",
      },
      typography: {
        typePairing: "editorial",
        fontFamilyHeading: "Fraunces, Georgia, 'Times New Roman', serif",
        fontFamilyBase: "Fraunces, Georgia, 'Times New Roman', serif",
        scale: 1.04,
      },
      shape: { buttonStyle: "pill", radiusScale: 1.2 },
      motion: { intensity: 0.75, durationScale: 1.08 },
      density: "spacious",
      surfaces: { elevation: "soft", effectIntensity: 0.55 },
    },
  },
} as const;

/**
 * One compile for the process, and identity matters as much as cost: the
 * provider re-verifies the mounted artifact on every render, so a fresh
 * artifact object per render would churn the retained-artifact ledger for a
 * document whose bytes never changed.
 */
let EDITORIAL_GROUND: ShowroomTenantGround | null = null;

function editorialGround(): ShowroomTenantGround {
  EDITORIAL_GROUND ??= compileShowroomTenantGround({
    document: EDITORIAL_DOCUMENT,
    identity: EDITORIAL_IDENTITY,
    name: "Editorial Round",
    theme: "light",
  });
  return EDITORIAL_GROUND;
}

function technicalGround(): ShowroomTenantGround {
  // The REGISTRY's own object, unspread and uncopied. Rottay's checked-in
  // BrandTheme is what authors `rottay/technical-sharp@1` here, and its CSS is
  // bundled, so this side needs neither an emission nor a declaration.
  const tenantConfig = getKnownTenantConfig("rottay");
  if (!tenantConfig) {
    throw new Error("The bundled rottay tenant is missing from the registry");
  }
  return { tenantConfig, emission: null, declaration: undefined };
}

function specimenGround(source: SpecimenSource): ShowroomTenantGround {
  return source === "editorial-db" ? editorialGround() : technicalGround();
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
  const ground = useMemo(() => specimenGround(source), [source]);

  return (
    <>
      <ShowroomArtifactStyle emission={ground.emission} />
      <DesignSystemProvider
        tenantConfig={ground.tenantConfig}
        vertical={ground.tenantConfig.vertical}
        locale={locale}
        forceEngine="modern"
        forceTheme="light"
        {...(ground.declaration ? { visualAuthority: ground.declaration } : {})}
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
            data-specimen-tenant={ground.tenantConfig.slug}
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
    </>
  );
}
