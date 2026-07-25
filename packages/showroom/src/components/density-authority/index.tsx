"use client";

/**
 * OLA-5 F2 density-authority probe (showroom).
 *
 * One identical public DS tree, URL-addressable, that sweeps:
 *  - theme source: static BitHire BrandTheme vs The Management Miami DB
 *    Appearance vs DB-over-static (DB precedence through the normalized
 *    configuration path);
 *  - semantic density posture: compact | comfortable | spacious, always
 *    supplied through `appearance.general.density`, the ONLY channel the root
 *    provider derives `data-density` from (structural
 *    `brandTheme.surfaces.densityScale` is a separate axis and must never
 *    become a posture);
 *  - locale: en | es | ar (ar renders dir="rtl" on the frame).
 *
 * The Playwright matrix (e2e/whitelabel/density-authority-matrix.spec.ts)
 * proves the five density planes agree in every cell: compiler output
 * (`--ds-density-mode-factor`), root `data-density`, CSS effective scale
 * (`--ds-density-effective-scale`, read through the px probe below because
 * custom-property computed values keep calc()/clamp() unevaluated), the
 * `useDensity()` JS context, and rendered control geometry.
 *
 * Every cell is deterministic and no fixture value here is product content.
 */

import {
  Box,
  Button,
  Card,
  DensityScope,
  DesignSystemProvider,
  FormField,
  Heading,
  Input,
  Stack,
  Tag,
  Text,
  bithireBrandTheme,
  brandThemeToTenantAppearance,
  useDensity,
  type TenantConfig,
} from "@rottay/design-system";

import { themanagementmiamiBrandTheme } from "@/components/torture-surface/fixtures";

export type DensityAuthoritySource =
  | "bithire-static"
  | "themanagement-db"
  | "db-over-static";
export type DensityAuthorityDensity = "compact" | "comfortable" | "spacious";
export type DensityAuthorityLocale = "en" | "es" | "ar";
export type DensityAuthorityProfile =
  | "none"
  | "technical-sharp"
  | "editorial-round";

export interface DensityAuthorityProbeProps {
  source: DensityAuthoritySource;
  density: DensityAuthorityDensity;
  locale: DensityAuthorityLocale;
  profile: DensityAuthorityProfile;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']). Both
 * resolve to the same mode factor 1 and to the `comfortable` root posture
 * (`deriveDensityPosture`), so the matrix keeps sweeping the public
 * compact | comfortable | spacious vocabulary unchanged.
 */
function toAppearanceDensity(
  density: DensityAuthorityDensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

/**
 * Deterministic specimen of the JSON-safe appearance payload production reads
 * from the tenancy DB. Mirrors the construction in
 * `@/components/brand-locale-evidence` exactly — the bounded exporter
 * projection of the local BrandTheme fixture, then the same General/Advanced
 * extensions — with `general.density` parameterized for the posture sweep.
 * The provider below receives `appearance` and never receives that fixture
 * through the file-first `brandTheme` field on the pure-DB source.
 */
function theManagementDbAppearance(
  density: DensityAuthorityDensity
): NonNullable<TenantConfig["appearance"]> {
  const projected = brandThemeToTenantAppearance(themanagementmiamiBrandTheme);
  return {
    general: {
      ...projected.general,
      typography: {
        ...projected.general?.typography,
        fontFamilyBase: themanagementmiamiBrandTheme.typography?.fontFamilyBase,
        fontFamilyHeading:
          themanagementmiamiBrandTheme.typography?.fontFamilyHeading,
        typePairing: "editorial",
        scale: 1.04,
      },
      shape: { buttonStyle: "soft", radiusScale: 0.76 },
      density: toAppearanceDensity(density),
      motion: { intensity: 0.62, durationScale: 1.08, ambient: "subtle" },
      // General owns the coordinated surface-role tenor. This DB field must
      // retune every reviewed gradient/glass/glow/texture consumer without
      // customer CSS or component-specific repainting.
      surfaces: { elevation: "elevated", effectIntensity: 0.45 },
      navigation: { sidebarTone: "strong" },
    },
    advanced: {
      ...projected.advanced,
      chrome: {
        ...projected.advanced?.chrome,
        layout: {
          ...projected.advanced?.chrome?.layout,
          containerBackground: "#FFFCF6",
          containerBorder: "1px solid #C9B89D",
          containerRadius: "0.75rem",
          containerShadow: "0 20px 48px -34px rgb(20 34 56 / 34%)",
          containerMotionDuration: "220ms",
          containerMotionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
          aspectRatioBackground: "#FBF3E7",
          aspectRatioBorder: "1px solid #C9B89D",
          aspectRatioRadius: "0.45rem",
          aspectRatioShadow: "inset 0 1px 0 rgb(255 255 255 / 72%)",
          aspectRatioOverflow: "hidden",
          aspectRatioMotionDuration: "220ms",
          aspectRatioMotionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
          dividerColor: "#9B8A73",
          dividerThicknessThin: "1px",
          dividerThicknessMedium: "2px",
          dividerThicknessThick: "3px",
          dividerContentGap: "0.75rem",
          dividerEdgeSegment: "7%",
          dividerMinSegment: "7%",
          dividerLabelMaxWidth: "32rem",
          dividerLabelFontSize: "0.75rem",
          dividerLabelFontWeight: "700",
          dividerLabelLineHeight: "1.3",
          dividerLabelTransform: "none",
          dividerLabelTracking: "0.04em",
          dividerMotionDuration: "160ms",
          dividerMotionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
          stackDividerSize: "1px",
          stackDividerColor: "#C9B89D",
          stackDividerOpacity: "0.82",
          spaceMotionDuration: "160ms",
          spaceMotionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
        tooltip: {
          borderedBackground: "#142238",
          borderedForeground: "#FFF9F0",
          borderedBorder: "#8B6F47",
          borderedRadius: "0.35rem",
          borderedShadow: "0 14px 30px -18px rgb(20 34 56 / 58%)",
          comfortablePaddingBlock: "0.55rem",
          comfortablePaddingInline: "0.8rem",
        },
        popover: {
          borderedBackground: "#FFFCF6",
          borderedForeground: "#142238",
          borderedMutedForeground: "#6F665C",
          borderedBorder: "#C9B89D",
          borderedRadius: "0.55rem",
          borderedShadow: "0 22px 48px -28px rgb(20 34 56 / 52%)",
          comfortablePaddingBlock: "1rem",
          comfortablePaddingInline: "1.1rem",
        },
      },
      // Nested surfaces remain legitimate bounded Advanced values; the global
      // canvas/ink/border hierarchy above is now a first-class General contract.
      tokenOverrides: {
        ...projected.advanced?.tokenOverrides,
        "--ds-color-bg-secondary": "#FBF3E7",
        "--ds-color-surface": "#FFFEFB",
        "--ds-material-canvas-background": "#FBF6EC",
        "--ds-material-canvas-foreground": "#2E261C",
        "--ds-material-canvas-border": "#E2D9CC",
        "--ds-material-canvas-shadow": "none",
        "--ds-material-shell-background": "#F5ECDF",
        "--ds-material-shell-foreground": "#2E261C",
        "--ds-material-shell-border": "#C8B9A5",
        "--ds-material-shell-shadow": "0 2px 8px rgba(46, 38, 28, 0.05)",
        "--ds-material-panel-background": "#FFFCF6",
        "--ds-material-panel-foreground": "#2E261C",
        "--ds-material-panel-border": "#D8C9B7",
        "--ds-material-panel-shadow": "0 8px 24px rgba(46, 38, 28, 0.08)",
        "--ds-material-card-background": "#FFFEFB",
        "--ds-material-card-background-hover": "#F8EFE2",
        "--ds-material-card-background-active": "#F1E4D3",
        "--ds-material-card-background-selected": "#E8F2EF",
        "--ds-material-card-foreground": "#2E261C",
        "--ds-material-card-foreground-muted": "#6B5B48",
        "--ds-material-card-border": "#D8C9B7",
        "--ds-material-card-border-strong": "#8C6D46",
        "--ds-material-card-border-hover": "#0F766E",
        "--ds-material-card-focus-ring": "0 0 0 3px rgba(15, 118, 110, 0.26)",
        "--ds-material-card-shadow": "0 10px 30px rgba(46, 38, 28, 0.08)",
        "--ds-material-card-shadow-hover": "0 16px 38px rgba(46, 38, 28, 0.12)",
        "--ds-material-card-shadow-selected": "0 0 0 2px rgba(15, 118, 110, 0.3)",
        "--ds-material-inset-background": "#F1E7D9",
        "--ds-material-inset-foreground": "#3B3126",
        "--ds-material-inset-border": "#C8B9A5",
        "--ds-material-inset-shadow": "inset 0 1px 3px rgba(46, 38, 28, 0.08)",
        "--ds-material-control-background": "#FFFFFF",
        "--ds-material-control-background-hover": "#F8EFE2",
        "--ds-material-control-background-active": "#EEE0CF",
        "--ds-material-control-foreground": "#2E261C",
        "--ds-material-control-border": "#B9A991",
        "--ds-material-control-border-hover": "#0F766E",
        "--ds-material-control-focus-ring": "0 0 0 3px rgba(15, 118, 110, 0.26)",
        "--ds-material-control-shadow": "0 1px 2px rgba(46, 38, 28, 0.05)",
        "--ds-material-raised-background": "#FFFFFF",
        "--ds-material-raised-foreground": "#2E261C",
        "--ds-material-raised-border": "#C8B9A5",
        "--ds-material-raised-shadow": "0 18px 42px rgba(46, 38, 28, 0.14)",
        "--ds-material-overlay-background": "#2E261C",
        "--ds-material-overlay-foreground": "#FFF9F0",
        "--ds-material-overlay-foreground-muted": "#E2D9CC",
        "--ds-material-overlay-border": "#8C6D46",
        "--ds-material-overlay-shadow": "0 24px 64px rgba(20, 14, 8, 0.34)",
      },
    },
  };
}

function recipeProfileRef(
  profile: Exclude<DensityAuthorityProfile, "none">
): `rottay/${string}@1` {
  return `rottay/${profile}@1`;
}

/**
 * BitHire is first-party vertical identity and therefore comes from the
 * checked-in DS theme, never from a customer DB fixture. The theme module is a
 * shared singleton, so a recipe selection is layered on with a spread instead
 * of mutating `bithireBrandTheme.recipes` in place.
 */
function bithireThemeFor(profile: DensityAuthorityProfile): TenantConfig["brandTheme"] {
  if (profile === "none") return bithireBrandTheme;
  return {
    ...bithireBrandTheme,
    recipes: { schemaVersion: 1, profile: recipeProfileRef(profile) },
  };
}

function tenantConfigFor(
  source: DensityAuthoritySource,
  density: DensityAuthorityDensity,
  profile: DensityAuthorityProfile
): TenantConfig {
  if (source === "themanagement-db") {
    return {
      slug: "themanagementmiami",
      name: "The Management Miami",
      vertical: "bithire",
      engine: "modern",
      theme: "light",
      plan: "enterprise",
      features: ["*"],
      branding: { companyName: "The Management Miami" },
      // Customer identity must exercise the DB-owned runtime path. Supplying
      // `brandTheme` here would be a false-positive proof of the file-first
      // path reserved for bundled vertical identity.
      appearance:
        profile === "none"
          ? theManagementDbAppearance(density)
          : {
              ...theManagementDbAppearance(density),
              recipeProfile: recipeProfileRef(profile),
            },
    };
  }

  if (source === "db-over-static") {
    return {
      slug: "themanagementmiami",
      name: "The Management Miami",
      vertical: "bithire",
      engine: "modern",
      theme: "light",
      plan: "enterprise",
      features: ["*"],
      branding: { companyName: "The Management Miami" },
      // BOTH channels populated on purpose: the DB appearance must win over
      // the static BrandTheme through the normalized configuration path
      // (appearance CSS variables are layered last by the runtime).
      brandTheme: bithireThemeFor(profile),
      appearance: theManagementDbAppearance(density),
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
    brandTheme: bithireThemeFor(profile),
    // The semantic posture enters exclusively through the Appearance channel:
    // the root provider derives `data-density` only from
    // `appearance.general.density`, never from `brandTheme.surfaces.densityScale`.
    appearance: { general: { density: toAppearanceDensity(density) } },
  };
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
 * JS-context plane witness: renders the posture published by `useDensity()`
 * as a DOM attribute so the spec can assert the React context agrees with
 * the root attribute and the CSS cascade. Non-visual by design.
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
          field pattern. The sizing block-size lives on the Input ROOT, so the
          measured testid wraps the control (the wrapper's height IS the root
          height); the testid on Input itself would land on the inner control. */}
      <FormField label={copy.fieldLabel} name="da-density-field">
        <div data-testid="da-input">
          <Input placeholder={copy.fieldPlaceholder} />
        </div>
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

      {/* Root-scope reference pair: inherits only the tenant posture. */}
      <div data-testid="da-root-scope">
        <Stack direction="horizontal" spacing="sm">
          <Button data-testid="da-root-button">{copy.action}</Button>
          <div data-testid="da-root-input">
            <Input placeholder={copy.fieldPlaceholder} />
          </div>
        </Stack>
      </div>

      {/* Nested scoped boundary: the local compact factor must apply inside
          and restore the parent posture after the boundary. */}
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
  profile,
}: DensityAuthorityProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfigFor(source, density, profile), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <Box
        data-testid="da-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="da-frame"
          data-da-source={source}
          data-da-density={density}
          data-da-locale={locale}
          data-da-profile={profile}
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
    </DesignSystemProvider>
  );
}
