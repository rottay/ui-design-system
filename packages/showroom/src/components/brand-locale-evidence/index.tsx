"use client";

import {
  Badge,
  Box,
  Button,
  Card,
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
  useTranslation,
  type TenantConfig,
  type SemanticSurfaceRole,
} from "@rottay/design-system";

import {
  ShowroomTenantProvider,
  type ShowroomTenantSource,
} from "@/components/showroom-tenant";

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

/**
 * The two fixtures of this route ARE two of the fleet's governed sources, so
 * they map onto them instead of rebuilding them. The third,
 * `themanagement-seeds`, is deliberately not offered here: this route contrasts
 * a bundled vertical against a fully-authored customer document, and the
 * seeds-only claim is the canary's subject, not this one's.
 */
const EVIDENCE_TENANT_SOURCE: Record<
  BrandLocaleEvidenceFixture,
  ShowroomTenantSource
> = {
  bithire: "bithire-static",
  themanagementmiami: "themanagement-db",
};

/**
 * Both halves come from the shared ground; this component owns neither.
 *
 * The previous `{ ...tenantConfigFor(fixture, locale), locale }` was illegal in
 * both directions at once. Spreading the registry config destroys the WeakSet
 * object identity that makes bithire code-owned, so the copy became an ordinary
 * tenant carrying an uncompiled `brandTheme` -- blocked visual authority, and a
 * blocked resolution renders `<LoadingScreen />`, which photographs as a slow
 * load rather than as a failure. The management branch was blocked for the
 * second reason: a hand-authored `appearance` is visual payload that no
 * declaration admits.
 *
 * `ShowroomTenantProvider` fixes both: bithire is the registry's own object,
 * unspread, and The Management is a validated/hydrated/compiled artifact whose
 * `<style>` mounts OUTSIDE the provider so the mount proof can see it.
 *
 * Locale is provider/context data on BOTH paths and never a reason to clone the
 * tenant -- the code-owned projection drops everything outside
 * `branding | engine | features | name | plan | slug | theme | vertical`, so a
 * `locale` (or `customTranslations`) set on a config would be silently dropped
 * even if cloning were legal. Copy travels the same way for the same reason.
 */
export function BrandLocaleEvidence({
  fixture,
  locale,
}: {
  fixture: BrandLocaleEvidenceFixture;
  locale: BrandLocaleEvidenceLocale;
}) {
  return (
    <ShowroomTenantProvider
      source={EVIDENCE_TENANT_SOURCE[fixture]}
      locale={locale}
      {...(fixture === "themanagementmiami"
        ? { customTranslations: THE_MANAGEMENT_DB_COPY[locale] }
        : {})}
    >
      <EvidenceCanvas fixture={fixture} evidenceLocale={locale} />
    </ShowroomTenantProvider>
  );
}
