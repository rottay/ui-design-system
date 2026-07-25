"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  DesignSystemProvider,
  Flex,
  Grid,
  Heading,
  Popover,
  SemanticSurface,
  SemanticSurfaceSupport,
  Stack,
  Tabs,
  Text,
  Tooltip,
  bithireBrandTheme,
  brandThemeToTenantAppearance,
  useTranslation,
  type TenantConfig,
  type SemanticSurfaceRole,
} from "@rottay/design-system";

import { themanagementmiamiBrandTheme } from "@/components/torture-surface/fixtures";

export type BrandLocaleEvidenceFixture = "bithire" | "themanagementmiami";
export type BrandLocaleEvidenceLocale = "en" | "es" | "ar";

const THE_MANAGEMENT_DB_COPY: Record<
  BrandLocaleEvidenceLocale,
  NonNullable<TenantConfig["customTranslations"]>
> = {
  en: { components: { empty: { description: "No talent profiles yet" } } },
  es: {
    components: {
      empty: { description: "Todavía no hay perfiles de talento" },
    },
  },
  ar: { components: { empty: { description: "لا توجد ملفات مواهب بعد" } } },
};

const SURFACE_ROLE_SECTION_LABEL: Record<
  BrandLocaleEvidenceLocale,
  string
> = {
  en: "Semantic surface roles",
  es: "Roles semánticos de superficie",
  ar: "أدوار الأسطح الدلالية",
};

const THE_MANAGEMENT_PROJECTED_APPEARANCE = brandThemeToTenantAppearance(
  themanagementmiamiBrandTheme
);

/**
 * Deterministic specimen of the JSON-safe appearance payload production reads
 * from the tenancy DB. The local BrandTheme fixture is only an authoring input
 * to the public bounded exporter; the provider below receives `appearance`
 * and never receives that fixture through the file-first `brandTheme` field.
 */
const THE_MANAGEMENT_DB_APPEARANCE: NonNullable<TenantConfig["appearance"]> = {
  general: {
    ...THE_MANAGEMENT_PROJECTED_APPEARANCE.general,
    typography: {
      ...THE_MANAGEMENT_PROJECTED_APPEARANCE.general?.typography,
      fontFamilyBase: themanagementmiamiBrandTheme.typography?.fontFamilyBase,
      fontFamilyHeading:
        themanagementmiamiBrandTheme.typography?.fontFamilyHeading,
      typePairing: "editorial",
      scale: 1.04,
    },
    shape: { buttonStyle: "soft", radiusScale: 0.76 },
    density: "spacious",
    motion: { intensity: 0.62, durationScale: 1.08, ambient: "subtle" },
    // General owns the coordinated surface-role tenor. This DB field must
    // retune every reviewed gradient/glass/glow/texture consumer without
    // customer CSS or component-specific repainting.
    surfaces: { elevation: "elevated", effectIntensity: 0.45 },
    navigation: { sidebarTone: "strong" },
  },
  advanced: {
    ...THE_MANAGEMENT_PROJECTED_APPEARANCE.advanced,
    chrome: {
      ...THE_MANAGEMENT_PROJECTED_APPEARANCE.advanced?.chrome,
      layout: {
        ...THE_MANAGEMENT_PROJECTED_APPEARANCE.advanced?.chrome?.layout,
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
      ...THE_MANAGEMENT_PROJECTED_APPEARANCE.advanced?.tokenOverrides,
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

export function tenantConfigFor(
  fixture: BrandLocaleEvidenceFixture,
  locale: BrandLocaleEvidenceLocale
): TenantConfig {
  if (fixture === "themanagementmiami") {
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
      appearance: THE_MANAGEMENT_DB_APPEARANCE,
      customTranslations: THE_MANAGEMENT_DB_COPY[locale],
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
    // checked-in DS theme, never from a customer DB fixture.
    brandTheme: bithireBrandTheme,
  };
}

function EvidenceCanvas({
  fixture,
  evidenceLocale,
}: {
  fixture: BrandLocaleEvidenceFixture;
  evidenceLocale: BrandLocaleEvidenceLocale;
}) {
  const { t, locale } = useTranslation();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const brandLabel = fixture === "bithire" ? "BitHire" : "The Management Miami";
  const sourceLabel = fixture === "bithire" ? "SOURCE:STATIC" : "SOURCE:DB";
  const configPath = fixture === "bithire" ? "brand-theme" : "appearance";
  const surfaceRoles: SemanticSurfaceRole[] = [
    "canvas",
    "shell",
    "panel",
    "card",
    "inset",
    "control",
    "raised",
    "overlay",
  ];

  return (
    <Box
      data-ds-root=""
      data-testid="brand-locale-evidence"
      data-evidence-brand={fixture}
      data-evidence-locale={locale}
      data-evidence-direction={direction}
      data-evidence-source={sourceLabel}
      data-evidence-config-path={configPath}
      lang={locale}
      dir={direction}
      minHeight="100vh"
      padding={{ xs: "md", md: "2xl" }}
      background="var(--ds-color-bg-primary)"
    >
      <Stack spacing="xl">
        <Stack spacing="xs">
          <Badge tone="primary" badgeStyle="soft">
            {sourceLabel} · {locale.toUpperCase()} · {direction.toUpperCase()}
          </Badge>
          <Heading
            data-testid="evidence-brand-title"
            level="h1"
            size="2xl"
            weight="bold"
          >
            {brandLabel}
          </Heading>
          <Text data-testid="localized-empty-copy" color="secondary">
            {t("components.empty.description")}
          </Text>
        </Stack>

        <Box data-testid="evidence-tabs">
          <Tabs
            type="card"
            items={[
              {
                key: "search",
                label: t("common.search"),
                children: (
                  <Text data-testid="evidence-search-copy">
                    {t("components.search.placeholder")}
                  </Text>
                ),
              },
              {
                key: "filter",
                label: t("common.filter"),
                children: (
                  <Text data-testid="evidence-filter-copy">
                    {t("components.table.filter")} · 3
                  </Text>
                ),
              },
              {
                key: "actions",
                label: t("common.actions"),
                children: (
                  <Text data-testid="evidence-actions-copy">
                    {t("common.more")}
                  </Text>
                ),
              },
            ]}
          />
        </Box>

        <Flex gap={8} wrap="wrap" data-testid="evidence-overlays">
          <Tooltip
            content={t("components.search.placeholder")}
            trigger="click"
            recipe="bordered"
          >
            <Button data-testid="evidence-tooltip-trigger">
              {t("common.search")}
            </Button>
          </Tooltip>
          <Popover
            title={t("common.actions")}
            content={<Text>{t("components.search.placeholder")}</Text>}
            trigger="click"
            recipe="bordered"
          >
            <Button variant="secondary" data-testid="evidence-popover-trigger">
              {t("common.actions")}
            </Button>
          </Popover>
        </Flex>

        <Grid columns={{ xs: 1, md: 2 }} gap="lg">
          <Card variant="outlined" data-testid="evidence-card">
            <Card.Header
              eyebrow={
                <span data-testid="evidence-primary-eyebrow">
                  {t("common.dashboard_status_live")}
                </span>
              }
              title={
                <span data-testid="evidence-primary-title">
                  {t("common.key_metrics")}
                </span>
              }
              subtitle={
                <span data-testid="evidence-primary-subtitle">
                  {t("components.table.rows_selected", { count: 3 })}
                </span>
              }
              extra={<Badge tone="success">84%</Badge>}
              divider
            />
            <Card.Body>
              <Stack spacing="md">
                <Text data-testid="evidence-primary-body" color="secondary">
                  {t("components.empty.description")}
                </Text>
                <Stack direction="horizontal" spacing="sm" wrap>
                  <Button
                    data-testid="evidence-primary-action"
                    variant="primary"
                  >
                    {t("common.save")}
                  </Button>
                  <Button
                    data-testid="evidence-secondary-action"
                    variant="secondary"
                  >
                    {t("common.cancel")}
                  </Button>
                </Stack>
              </Stack>
            </Card.Body>
          </Card>

          <Card variant="elevated" data-testid="evidence-secondary-card">
            <Card.Header
              eyebrow={
                <span data-testid="evidence-secondary-eyebrow">
                  {t("common.dashboard_status_connected")}
                </span>
              }
              title={
                <span data-testid="evidence-secondary-title">
                  {t("common.shortcuts")}
                </span>
              }
              subtitle={
                <span data-testid="evidence-secondary-subtitle">
                  {t("components.pagination.page", {
                    current: 1,
                    total: 6,
                  })}
                </span>
              }
              divider
            />
            <Card.Body>
              <Stack spacing="sm">
                <Text data-testid="evidence-show-more" weight="semibold">
                  {t("common.show_more")}
                </Text>
                <Text data-testid="evidence-no-results" color="secondary">
                  {t("components.search.no_results")}
                </Text>
              </Stack>
            </Card.Body>
          </Card>
        </Grid>

        <Box data-testid="semantic-surface-evidence">
          <Stack spacing="md">
            <Heading level="h2" size="lg">
              {SURFACE_ROLE_SECTION_LABEL[evidenceLocale]}
            </Heading>
            <Grid columns={{ xs: 1, sm: 2, lg: 4 }} gap="md">
              {surfaceRoles.map((surfaceRole, index) => (
                <SemanticSurface
                  key={surfaceRole}
                  surfaceRole={surfaceRole}
                  interactive={surfaceRole === "control" || surfaceRole === "card"}
                  selected={surfaceRole === "card"}
                  emphasis={index % 2 === 0 ? "strong" : "default"}
                  data-testid={`semantic-surface-${surfaceRole}`}
                  style={{ minHeight: "8rem", padding: "var(--ds-spacing-5)" }}
                >
                  <Stack spacing="xs">
                    <Text weight="semibold">{surfaceRole}</Text>
                    <SemanticSurfaceSupport>
                      {t("components.empty.description")}
                    </SemanticSurfaceSupport>
                  </Stack>
                </SemanticSurface>
              ))}
            </Grid>
            <SemanticSurface
              surfaceRole="control"
              as="button"
              interactive
              data-testid="semantic-surface-native-action"
              style={{ padding: "var(--ds-spacing-3) var(--ds-spacing-5)" }}
            >
              {t("common.actions")}
            </SemanticSurface>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export function BrandLocaleEvidence({
  fixture,
  locale,
}: {
  fixture: BrandLocaleEvidenceFixture;
  locale: BrandLocaleEvidenceLocale;
}) {
  return (
    <DesignSystemProvider
      tenantConfig={{ ...tenantConfigFor(fixture, locale), locale }}
      vertical="bithire"
      locale={locale}
      forceEngine="modern"
      forceTheme="light"
    >
      <EvidenceCanvas fixture={fixture} evidenceLocale={locale} />
    </DesignSystemProvider>
  );
}
