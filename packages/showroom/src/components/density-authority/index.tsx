"use client";

/**
 * OLA-5 F2 density-authority probe (showroom).
 *
 * ONE identical public DS tree, URL-addressable, rendered through the shared
 * `ShowroomTenantProvider` and nothing else. The probe owns no tenant config,
 * no Appearance literal, no BrandTheme and no `DesignSystemProvider` call: the
 * shared module is the single place that knows how a governed source is
 * mounted, and a probe that rebuilt any of that would be photographing a
 * blank page (see `@/components/showroom-tenant` for the measured why).
 *
 * The two axes that remain are the two this probe is about:
 *
 *  - theme source: `bithire-static` (the code-owned BitHire vertical, taken
 *    unspread from the registry) vs `themanagement-db` (a real validated,
 *    hydrated, compiled and proof-stamped customer artifact);
 *  - semantic density posture: compact | comfortable | spacious;
 *  - locale: en | es | ar (`ar` renders `dir="rtl"` on the frame).
 *
 * DENSITY HAS TWO LEGAL SEMANTICS HERE, AND THIS PROBE STATES BOTH.
 *
 *   `themanagement-db`   the requested posture is ROOT/ARTIFACT authority. The
 *                        customer document authors `general.density`, the
 *                        compiler emits `--ds-density-mode-factor` into the
 *                        tenant artifact, and the provider derives the root
 *                        `data-density` from the same normalized appearance.
 *                        The nearest density boundary above this tree IS
 *                        `<html>`.
 *
 *   `bithire-static`     the requested posture is a sanctioned nested VIEWER
 *                        boundary. A code-owned tenant config cannot be edited
 *                        or copied, so the shared provider expresses a viewer's
 *                        density preference as a `DensityScope` INSIDE the
 *                        provider. The tenant root keeps its code-owned
 *                        authored posture, and this probe must never claim the
 *                        root or the compiler moved. The nearest density
 *                        boundary above this tree is that scope element.
 *
 * `da-boundary-anchor` exists so the matrix can resolve that nearest boundary
 * by one rule (`closest('[data-density]')`) and then assert the two different
 * legal outcomes, rather than forcing one false uniform claim. The probe does
 * NOT create a second viewer boundary of its own — the shared provider owns
 * that one. The only `DensityScope` authored below is `da-nested`, which is a
 * different feature under test: a nested boundary that stays RELATIVE to the
 * global plane.
 *
 * Every cell is deterministic and no fixture value here is product content.
 */

import {
  Box,
  Button,
  Card,
  DensityScope,
  FormField,
  Heading,
  Input,
  Stack,
  Tag,
  Text,
  useDensity,
} from "@rottay/design-system";

import { ShowroomTenantProvider } from "@/components/showroom-tenant";

export type DensityAuthoritySource = "bithire-static" | "themanagement-db";
export type DensityAuthorityDensity = "compact" | "comfortable" | "spacious";
export type DensityAuthorityLocale = "en" | "es" | "ar";

export interface DensityAuthorityProbeProps {
  source: DensityAuthoritySource;
  density: DensityAuthorityDensity;
  locale: DensityAuthorityLocale;
}

const COPY: Record<
  DensityAuthorityLocale,
  Record<
    | "title"
    | "body"
    | "action"
    | "fieldLabel"
    | "fieldPlaceholder"
    | "tag"
    | "cardTitle"
    | "cardBody"
    | "layoutA"
    | "layoutB",
    string
  >
> = {
  en: {
    title: "Density authority probe",
    // Deliberately overlong (always on) to stress wrapping; must never clip,
    // overlap or force horizontal overflow in any posture or direction.
    body: "One identical tree under every posture: compiler output, root attribute, CSS scale, JS context and control geometry must agree, even when this deterministic sentence wraps onto a second line inside the frame.",
    action: "Primary action",
    fieldLabel: "Case reference",
    fieldPlaceholder: "Type a reference",
    tag: "Reviewed",
    cardTitle: "Pipeline summary",
    cardBody: "Deterministic fixture copy for density inspection.",
    layoutA: "Layout column A",
    layoutB: "Layout column B",
  },
  es: {
    title: "Sonda de autoridad de densidad",
    body: "Un mismo árbol en cada postura: la salida del compilador, el atributo raíz, la escala CSS, el contexto JS y la geometría de los controles deben coincidir, incluso cuando esta frase determinista ocupa una segunda línea dentro del marco.",
    action: "Acción principal",
    fieldLabel: "Referencia del caso",
    fieldPlaceholder: "Escribe una referencia",
    tag: "Revisado",
    cardTitle: "Resumen del pipeline",
    cardBody: "Texto determinista de inspección de densidad.",
    layoutA: "Columna de diseño A",
    layoutB: "Columna de diseño B",
  },
  ar: {
    title: "مسبار مرجعية الكثافة",
    body: "الشجرة نفسها في كل وضعية: مخرجات المترجم وسمة الجذر ومقياس CSS وسياق JS وهندسة عناصر التحكم يجب أن تتفق، حتى عندما تلتف هذه الجملة الحتمية إلى سطر ثان داخل الاطار.",
    action: "الاجراء الرئيسي",
    fieldLabel: "مرجع الحالة",
    fieldPlaceholder: "اكتب مرجعا",
    tag: "تمت المراجعة",
    cardTitle: "ملخص خط الانابيب",
    cardBody: "نص حتمي لفحص الكثافة.",
    layoutA: "عمود التخطيط أ",
    layoutB: "عمود التخطيط ب",
  },
};

/**
 * JS-context witness: renders the posture published by `useDensity()` as a DOM
 * attribute so the spec can compare the React context against the boundary the
 * CSS cascade is using. Non-visual by design.
 *
 * The context this reads is whichever density provider is nearest: the shared
 * provider's viewer `DensityScope` on the static path, `RootDensityProvider` on
 * the DB path, and the local `da-nested` scope inside that boundary.
 */
function DensityReadout({ testId }: { testId: string }) {
  const { posture } = useDensity();
  return (
    <span
      data-testid={testId}
      data-density-context={posture}
      style={{ display: "none" }}
    />
  );
}

/**
 * Numeric witness for the CSS effective-scale plane. Custom-property computed
 * values keep calc()/clamp() unevaluated, so the spec reads the resolved used
 * width of this probe (`calc(var(--ds-density-effective-scale, 1) * 100px)`)
 * and divides by 100 to recover the effective scale as a number.
 *
 * It sits inside the tree on purpose: that is the position the rendered
 * controls occupy, so it measures the plane they are actually painted from —
 * the root plane on the DB path, the viewer boundary's locally reprojected
 * plane on the static one.
 */
function EffectiveScaleProbe({ testId }: { testId: string }) {
  return (
    <div
      data-testid={testId}
      aria-hidden
      style={{
        inlineSize: "calc(var(--ds-density-effective-scale, 1) * 100px)",
        blockSize: 0,
        overflow: "hidden",
      }}
    />
  );
}

function ProbeTree({ locale }: { locale: DensityAuthorityLocale }) {
  const copy = COPY[locale];
  return (
    <Stack spacing="lg" data-testid="da-root">
      <Stack spacing="xs">
        <Heading level="h1" size="xl" data-testid="da-title">
          {copy.title}
        </Heading>
        <Text data-testid="da-body" color="secondary">
          {copy.body}
        </Text>
      </Stack>

      <DensityReadout testId="da-context" />

      <Stack direction="horizontal" spacing="sm" wrap data-testid="da-controls">
        <Button variant="primary" data-testid="da-button">
          {copy.action}
        </Button>
        <Tag data-testid="da-tag">{copy.tag}</Tag>
      </Stack>

      {/* The DS Input has no label prop; FormField is the family's standard
          field pattern. `data-testid` lands on the `<input>` itself, which IS
          the sized root, and only a real control child receives FormField's
          `id`/`aria-*` binding -- a host wrapper would orphan the label. */}
      <FormField label={copy.fieldLabel} name="da-density-field">
        <Input data-testid="da-input" placeholder={copy.fieldPlaceholder} />
      </FormField>

      <Card data-testid="da-card" title={copy.cardTitle}>
        <Text data-testid="da-card-body" color="secondary">
          {copy.cardBody}
        </Text>
      </Card>

      {/* Layout-structure witness: a fixed-pixel gap keeps the resolved track
          sizes density-independent, so identical computed
          grid-template-columns across postures prove density never becomes a
          layout-view preference. */}
      <div
        data-testid="da-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <Text data-testid="da-layout-a">{copy.layoutA}</Text>
        <Text data-testid="da-layout-b">{copy.layoutB}</Text>
      </div>

      {/* Reference pair OUTSIDE the nested boundary: it inherits whichever
          plane the cell's authority established, and nothing else. */}
      <div data-testid="da-root-scope">
        <Stack direction="horizontal" spacing="sm">
          <Button data-testid="da-root-button">{copy.action}</Button>
          <div data-testid="da-root-input">
            <Input placeholder={copy.fieldPlaceholder} />
          </div>
        </Stack>
      </div>

      {/* The nested boundary, and the ONLY DensityScope this probe authors. It
          is not a second viewer boundary: it is the relative-nesting feature
          itself. The CSS law recomputes a nested boundary from the still-global
          structural scale × mode factor × its OWN local factor, so a compact
          scope is smaller than its surrounding plane without composing with the
          surrounding local factor — and the plane restores after it. */}
      <div data-testid="da-nested">
        <DensityScope posture="compact">
          <Stack direction="horizontal" spacing="sm">
            <Button data-testid="da-nested-button">{copy.action}</Button>
            <div data-testid="da-nested-input">
              <Input placeholder={copy.fieldPlaceholder} />
            </div>
          </Stack>
          <DensityReadout testId="da-context-nested" />
        </DensityScope>
      </div>

      <DensityReadout testId="da-context-after" />

      <EffectiveScaleProbe testId="da-scale-probe" />
    </Stack>
  );
}

export function DensityAuthorityProbe({
  source,
  density,
  locale,
}: DensityAuthorityProbeProps) {
  return (
    <ShowroomTenantProvider source={source} density={density} locale={locale}>
      <Box
        data-testid="da-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        {/* Boundary anchor. The spec resolves the density boundary that governs
            this tree with `closest('[data-density]')` from here: `<html>` on the
            DB path, the shared provider's viewer `DensityScope` on the static
            one. It is placed above `da-nested` so it never resolves to the
            nested boundary. */}
        <span
          data-testid="da-boundary-anchor"
          aria-hidden
          style={{ display: "none" }}
        />
        <Box
          data-testid="da-frame"
          data-da-source={source}
          data-da-density={density}
          data-da-locale={locale}
          lang={locale}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 1100,
            marginInline: "auto",
          }}
        >
          <ProbeTree locale={locale} />
        </Box>
      </Box>
    </ShowroomTenantProvider>
  );
}
