"use client";

/**
 * P1 ActionDock probe (showroom): structured-action dock under two opposing
 * governed sources:
 *  - `bithire-static`: the checked-in BitHire BrandTheme (file-first path);
 *  - `themanagement-db`: the DB Appearance construction mirrored from
 *    `@/components/brand-locale-evidence` (DB-owned runtime path).
 *
 * The probe exists to give Pass-1/Pass-2 evidence a URL-addressable render of
 * the ActionDock elevation:
 *  - priority grammar: danger separated at the reading-START edge, secondary
 *    cluster, growing primary at the reading-END edge;
 *  - narrow-viewport overflow law: four secondary actions collapse into the
 *    canonical Dropdown "more actions" menu on phone postures while primary
 *    and danger stay inline;
 *  - APG toolbar keyboard model: roving tabindex, direction-aware
 *    ArrowLeft/ArrowRight, Home/End (verified in the interactive spec);
 *  - guarded i18n channel: toolbar aria-label resolves placement-aware
 *    (`actionDock.bottomLabel` / `actionDock.topLabel`) and the overflow
 *    trigger resolves `actionDock.overflow.label`, both through the catalog
 *    with English fallback (explicit props always win);
 *  - local density boundary: compact | comfortable | spacious re-projects the
 *    canonical spacing channels inside the dock chrome and its Buttons.
 *
 * Density sweeps through `appearance.general.density` only, locale sweeps
 * EN/ES/AR with `dir="rtl"` for Arabic, theme sweeps light | dark, and
 * `state` retunes the dock posture on the SAME markup: rest -> all enabled,
 * loading -> primary pending, error -> primary disabled + leading Retry
 * secondary. No fixture value here is product content.
 */

import {
  ActionDock,
  Box,
  DesignSystemProvider,
  Heading,
  Stack,
  Text,
  bithireBrandTheme,
  type ActionDockAction,
  type TenantConfig,
} from "@rottay/design-system";
import { Icon } from "@rottay/design-system/icons";

import { tenantConfigFor as brandLocaleTenantConfigFor } from "@/components/brand-locale-evidence";

export type P1ActionDockSource = "bithire-static" | "themanagement-db";
export type P1ActionDockLocale = "en" | "es" | "ar";
export type P1ActionDockDensity = "compact" | "comfortable" | "spacious";
export type P1ActionDockState = "rest" | "loading" | "error";
export type P1ActionDockTheme = "light" | "dark";

export interface P1ActionDockProbeProps {
  source: P1ActionDockSource;
  locale: P1ActionDockLocale;
  density: P1ActionDockDensity;
  state: P1ActionDockState;
  theme?: P1ActionDockTheme;
}

/**
 * The tenant-facing Appearance vocabulary has no `comfortable` literal:
 * `normal` is the canonical alias (TenantAppearanceGeneral['density']).
 */
function toAppearanceDensity(
  density: P1ActionDockDensity
): "compact" | "normal" | "spacious" {
  return density === "comfortable" ? "normal" : density;
}

function tenantConfig(
  source: P1ActionDockSource,
  locale: P1ActionDockLocale,
  density: P1ActionDockDensity
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

const COPY: Record<P1ActionDockLocale, Record<string, string>> = {
  en: {
    title: "ActionDock specimen",
    caption:
      "Priority grammar (danger start / secondary cluster / growing primary), narrow overflow law, APG toolbar keyboard model.",
    recordA: "Application #2481 — Senior Product Designer",
    recordB: "Application #2482 — Frontend Engineer",
    recordC: "Application #2483 — Design Lead",
    reject: "Reject",
    shortlist: "Shortlist",
    share: "Share",
    export: "Export",
    archive: "Archive",
    advance: "Advance",
    retry: "Retry",
  },
  es: {
    title: "Espécimen de ActionDock",
    caption:
      "Gramática de prioridad (peligro al inicio / clúster secundario / primaria que crece), ley de overflow en angosto, modelo de teclado APG toolbar.",
    recordA: "Solicitud #2481 — Diseñador de Producto Senior",
    recordB: "Solicitud #2482 — Ingeniero Frontend",
    recordC: "Solicitud #2483 — Líder de Diseño",
    reject: "Rechazar",
    shortlist: "Preseleccionar",
    share: "Compartir",
    export: "Exportar",
    archive: "Archivar",
    advance: "Avanzar",
    retry: "Reintentar",
  },
  ar: {
    title: "عينة ActionDock",
    caption:
      "قواعد الأولوية (خطر في البداية / مجموعة ثانوية / إجراء رئيسي متمدد)، قانون القائمة في العرض الضيق، نموذج لوحة مفاتيح APG toolbar.",
    recordA: "الطلب #2481 — مصمم منتجات أول",
    recordB: "الطلب #2482 — مهندس واجهات أمامية",
    recordC: "الطلب #2483 — قائد التصميم",
    reject: "رفض",
    shortlist: "القائمة المختصرة",
    share: "مشاركة",
    export: "تصدير",
    archive: "أرشفة",
    advance: "تقديم",
    retry: "إعادة المحاولة",
  },
};

function buildActions(
  copy: Record<string, string>,
  state: P1ActionDockState
): ActionDockAction[] {
  const secondaries: ActionDockAction[] =
    state === "error"
      ? [
          {
            key: "retry",
            label: copy.retry,
            icon: <Icon name="action.retry" decorative />,
            "data-testid": "p1ad-action-retry",
          },
          {
            key: "shortlist",
            label: copy.shortlist,
            icon: <Icon name="content.bookmark" decorative />,
            "data-testid": "p1ad-action-shortlist",
          },
          {
            key: "share",
            label: copy.share,
            icon: <Icon name="action.share" decorative />,
            "data-testid": "p1ad-action-share",
          },
          {
            key: "archive",
            label: copy.archive,
            icon: <Icon name="action.archive" decorative />,
            "data-testid": "p1ad-action-archive",
          },
        ]
      : [
          {
            key: "shortlist",
            label: copy.shortlist,
            icon: <Icon name="content.bookmark" decorative />,
            "data-testid": "p1ad-action-shortlist",
          },
          {
            key: "share",
            label: copy.share,
            icon: <Icon name="action.share" decorative />,
            "data-testid": "p1ad-action-share",
          },
          {
            key: "export",
            label: copy.export,
            icon: <Icon name="action.download" decorative />,
            "data-testid": "p1ad-action-export",
          },
          {
            key: "archive",
            label: copy.archive,
            icon: <Icon name="action.archive" decorative />,
            "data-testid": "p1ad-action-archive",
          },
        ];

  return [
    {
      key: "reject",
      label: copy.reject,
      priority: "danger",
      icon: <Icon name="action.close" decorative />,
      "data-testid": "p1ad-action-reject",
    },
    ...secondaries,
    {
      key: "advance",
      label: copy.advance,
      priority: "primary",
      icon: <Icon name="navigation.forward" decorative />,
      iconPosition: "end",
      pending: state === "loading",
      disabled: state === "error",
      "data-testid": "p1ad-action-advance",
    },
  ];
}

function SpecimenTree({
  locale,
  state,
}: Pick<P1ActionDockProbeProps, "locale" | "state">) {
  const copy = COPY[locale];

  return (
    <Stack spacing="lg" data-testid="p1ad-root" data-ds-root="">
      <Stack spacing="sm">
        <Heading level="h2" data-testid="p1ad-title">
          {copy.title}
        </Heading>
        <Text size="sm" color="secondary">
          {copy.caption}
        </Text>
      </Stack>

      {/* Body content behind the fixed dock: realistic record rows with a
          generous end padding so the dock never hides content in captures. */}
      <Stack spacing="sm" data-testid="p1ad-body" style={{ paddingBlockEnd: 180 }}>
        {[copy.recordA, copy.recordB, copy.recordC].map((record) => (
          <Box
            key={record}
            style={{
              padding: 16,
              border: "1px solid var(--ds-color-border)",
              borderRadius: "var(--ds-radius-md)",
              background: "var(--ds-color-background-elevated)",
            }}
          >
            <Text size="sm">{record}</Text>
          </Box>
        ))}
      </Stack>

      <ActionDock
        actions={buildActions(copy, state)}
        data-testid="p1ad-dock"
      />
    </Stack>
  );
}

export function P1ActionDockProbe({
  source,
  locale,
  density,
  state,
  theme = "light",
}: P1ActionDockProbeProps) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfig(source, locale, density), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme={theme}
    >
      <Box
        data-testid="p1ad-canvas"
        style={{
          background: "var(--ds-color-background)",
          color: "var(--ds-color-text-primary)",
          minHeight: "100vh",
          inlineSize: "100%",
        }}
      >
        <Box
          data-testid="p1ad-frame"
          data-p1ad-source={source}
          data-p1ad-density={density}
          data-p1ad-state={state}
          data-p1ad-theme={theme}
          dir={locale === "ar" ? "rtl" : "ltr"}
          style={{
            padding: 24,
            minHeight: "100vh",
            maxInlineSize: 880,
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
              P1 ActionDock probe — structured action dock
            </h1>
            <SpecimenTree locale={locale} state={state} />
          </main>
        </Box>
      </Box>
    </DesignSystemProvider>
  );
}

export default P1ActionDockProbe;
