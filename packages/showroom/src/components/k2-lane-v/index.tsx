"use client";

/**
 * K2 Lane V probe (showroom): value-input families.
 *
 * One identical component tree for the six Lane-V families (InputNumber,
 * Slider, Upload, TagInput, Form, Rate) rendered under two opposing governed
 * sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The density posture sweeps compact | comfortable | spacious through
 * `appearance.general.density` only (`comfortable` maps to the canonical
 * `normal` alias at the Appearance boundary), and the locale sweep renders
 * EN/ES/AR with `dir="rtl"` for Arabic. Every cell is deterministic and
 * URL-addressable; no fixture value here is product content.
 *
 * State axis: `rest` | `disabled` | `error`. The Upload specimen always
 * renders its done/uploading/error list triad (those are file states, not
 * component states); the Rate specimen always renders a readonly sibling.
 */

import {
  Box,
  DesignSystemProvider,
  Form,
  Heading,
  Input,
  InputNumber,
  Rate,
  Slider,
  Stack,
  TagInput,
  Text,
  Upload,
  bithireBrandTheme,
  type TenantConfig,
} from "@rottay/design-system";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type LaneVSource = "bithire-static" | "themanagement-db";
export type LaneVLocale = "en" | "es" | "ar";
export type LaneVDensity = "compact" | "comfortable" | "spacious";
export type LaneVState = "rest" | "disabled" | "error";

export interface K2LaneVProbeProps {
  source: LaneVSource;
  locale: LaneVLocale;
  density: LaneVDensity;
  state: LaneVState;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: LaneVDensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: LaneVSource,
  locale: LaneVLocale,
  density: LaneVDensity
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

const COPY: Record<LaneVLocale, Record<string, string>> = {
  en: {
    title: "Value inputs specimen",
    quantity: "Headcount",
    salary: "Monthly salary",
    satisfaction: "Confidence score",
    satisfactionRange: "Acceptable range",
    skills: "Skills",
    skillsError: "Add at least one skill before continuing.",
    files: "Contract files",
    email: "Work email",
    emailError: "Enter a valid work email address.",
    seniority: "Years of experience",
    quality: "Referral quality",
    qualityReadonly: "Panel average (read only)",
    boundary: "Limits (min 0 / max 100)",
    overflow: "Skill cloud (overflow)",
  },
  es: {
    title: "Espécimen de entradas de valor",
    quantity: "Número de empleados",
    salary: "Salario mensual",
    satisfaction: "Puntuación de confianza",
    satisfactionRange: "Rango aceptable",
    skills: "Habilidades",
    skillsError: "Agrega al menos una habilidad antes de continuar.",
    files: "Archivos del contrato",
    email: "Correo de trabajo",
    emailError: "Ingresa una dirección de correo de trabajo válida.",
    seniority: "Años de experiencia",
    quality: "Calidad de la referencia",
    qualityReadonly: "Promedio del panel (solo lectura)",
    boundary: "Límites (mín 0 / máx 100)",
    overflow: "Nube de habilidades (desborde)",
  },
  ar: {
    title: "عينة مدخلات القيم",
    quantity: "عدد الموظفين",
    salary: "الراتب الشهري",
    satisfaction: "درجة الثقة",
    satisfactionRange: "النطاق المقبول",
    skills: "المهارات",
    skillsError: "أضف مهارة واحدة على الأقل قبل المتابعة.",
    files: "ملفات العقد",
    email: "البريد الإلكتروني للعمل",
    emailError: "أدخل عنوان بريد إلكتروني صالحاً للعمل.",
    seniority: "سنوات الخبرة",
    quality: "جودة التوصية",
    qualityReadonly: "متوسط اللجنة (للقراءة فقط)",
    boundary: "الحدود (الأدنى 0 / الأقصى 100)",
    overflow: "سحابة المهارات (تجاوز)",
  },
};

function SpecimenTree({
  locale,
  state,
}: Pick<K2LaneVProbeProps, "locale" | "state">) {
  const copy = COPY[locale];
  const disabled = state === "disabled";
  const isError = state === "error";

  return (
    <Stack spacing="lg" data-testid="lv-root">
      <Heading level="h2" data-testid="lv-title">
        {copy.title}
      </Heading>

      {/* InputNumber: step buttons + keyboard + affix/addon variants */}
      <Stack spacing="xs" data-testid="lv-inputnumber">
        <Text weight="semibold">{copy.quantity}</Text>
        <div data-testid="lv-inputnumber-stepper">
          <InputNumber
            min={0}
            max={100}
            step={5}
            defaultValue={50}
            disabled={disabled}
            status={isError ? "error" : undefined}
            aria-label={copy.quantity}
          />
        </div>
        <div data-testid="lv-inputnumber-addon">
          <InputNumber
            min={0}
            max={100000}
            defaultValue={12000}
            prefix="$"
            suffix="USD"
            disabled={disabled}
            aria-label={copy.salary}
          />
        </div>
        {/* Boundary: values pinned at min and max (clamped steppers) */}
        <Stack spacing="sm" direction="horizontal" data-testid="lv-inputnumber-boundary">
          <Text size="sm">{copy.boundary}</Text>
          <InputNumber
            min={0}
            max={100}
            defaultValue={0}
            disabled={disabled}
            aria-label={`${copy.boundary} — min`}
          />
          <InputNumber
            min={0}
            max={100}
            defaultValue={100}
            disabled={disabled}
            aria-label={`${copy.boundary} — max`}
          />
        </Stack>
      </Stack>

      {/* Slider: single with marks + dual range */}
      <Stack spacing="xs" data-testid="lv-slider">
        <Text weight="semibold">{copy.satisfaction}</Text>
        <div data-testid="lv-slider-single">
          <Slider
            min={0}
            max={100}
            defaultValue={40}
            marks={{ 0: "0", 50: "50", 100: "100" }}
            disabled={disabled}
            aria-label={copy.satisfaction}
          />
        </div>
        <div data-testid="lv-slider-range" style={{ marginBlockStart: 24 }}>
          <Text size="sm">{copy.satisfactionRange}</Text>
          <Slider
            range
            min={0}
            max={100}
            defaultValue={[20, 80]}
            disabled={disabled}
          />
        </div>
      </Stack>

      {/* Upload: text list triad (done/uploading/error) + dragger */}
      <Stack spacing="xs" data-testid="lv-upload">
        <Text weight="semibold">{copy.files}</Text>
        <div data-testid="lv-upload-list">
          <Upload
            defaultFileList={[
              { uid: "signed", name: "signed-contract.pdf", status: "done" },
              { uid: "draft", name: "annex-draft.pdf", status: "uploading", percent: 42 },
              { uid: "scan", name: "id-scan.png", status: "error" },
            ]}
            disabled={disabled}
          />
        </div>
        <div data-testid="lv-dragger">
          <Upload.Dragger
            name="lv-dragger-input"
            disabled={disabled}
            height={140}
          />
        </div>
      </Stack>

      {/* TagInput: prefilled chips, optional error message */}
      <Stack spacing="xs" data-testid="lv-taginput">
        <Text weight="semibold">{copy.skills}</Text>
        <div data-testid="lv-taginput-field">
          <TagInput
            value={["React", "TypeScript", "GraphQL"]}
            onChange={() => {}}
            error={isError}
            errorMessage={isError ? copy.skillsError : undefined}
            disabled={disabled}
            aria-label={copy.skills}
          />
        </div>
        {/* Overflow: many chips wrapping inside the fixed-width frame */}
        <div data-testid="lv-taginput-overflow">
          <Text size="sm">{copy.overflow}</Text>
          <TagInput
            value={[
              "React",
              "TypeScript",
              "GraphQL",
              "Node.js",
              "Playwright",
              "Accessibility",
              "Design tokens",
              "RTL",
              "Storybook",
            ]}
            onChange={() => {}}
            disabled={disabled}
            aria-label={copy.overflow}
          />
        </div>
      </Stack>

      {/* Form: vertical, required email + InputNumber field, feedback icons */}
      <div data-testid="lv-form">
        <Form layout="vertical" hasFeedback disabled={disabled}>
          <Form.Item
            name="email"
            label={copy.email}
            required
            validateStatus={isError ? "error" : undefined}
            help={isError ? copy.emailError : undefined}
            rules={[{ required: true }]}
          >
            <Input data-testid="lv-form-email" placeholder="ada@example.com" />
          </Form.Item>
          <Form.Item name="seniority" label={copy.seniority} initialValue={6}>
            <InputNumber min={0} max={50} />
          </Form.Item>
        </Form>
      </div>

      {/* Rate: interactive half-star + always-readonly sibling */}
      <Stack spacing="xs" data-testid="lv-rate">
        <Text weight="semibold">{copy.quality}</Text>
        <div data-testid="lv-rate-interactive">
          <Rate
            defaultValue={3.5}
            allowHalf
            allowClear
            tooltips={["1", "2", "3", "4", "5"]}
            disabled={disabled}
          />
        </div>
        <Stack spacing="xs" direction="horizontal" data-testid="lv-rate-readonly">
          <Text size="sm">{copy.qualityReadonly}</Text>
          <Rate value={4} readOnly />
        </Stack>
      </Stack>
    </Stack>
  );
}

export function K2LaneVProbe({ source, locale, density, state }: K2LaneVProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="lv-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <main
          data-testid="lv-frame"
          data-lv-source={source}
          data-lv-density={density}
          data-lv-state={state}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 720,
            marginInline: "auto",
          }}
        >
          <Heading level="h1" data-testid="lv-page-title">
            K2 Lane V — value inputs
          </Heading>
          <SpecimenTree locale={locale} state={state} />
        </main>
      </Box>
    </DesignSystemProvider>
  );
}
