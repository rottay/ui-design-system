"use client";

import type { ReactNode } from "react";

import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  Space,
  Stack,
  Text,
  useTranslation,
  type TenantConfig,
} from "@rottay/design-system";

import {
  ShowroomTenantProvider,
  type ShowroomTenantSource,
} from "@/components/showroom-tenant";
import type {
  BrandLocaleEvidenceFixture,
  BrandLocaleEvidenceLocale,
} from "@/components/brand-locale-evidence";

function FoundationPanel({
  testId,
  children,
}: {
  testId: string;
  children: ReactNode;
}) {
  return (
    <Box
      data-testid={testId}
      padding={{ xs: "md", md: "lg" }}
      border="1px solid var(--ds-color-border-subtle)"
      borderRadius="lg"
      background="var(--ds-color-surface)"
      shadow="xs"
      minWidth={0}
    >
      {children}
    </Box>
  );
}

function FoundationsCanvas({
  fixture,
}: {
  fixture: BrandLocaleEvidenceFixture;
}) {
  const { t, locale } = useTranslation();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const brandLabel = fixture === "bithire" ? "BitHire" : "The Management Miami";
  const sourceLabel =
    fixture === "bithire" ? "SOURCE:STATIC" : "SOURCE:APPEARANCE";
  const configPath = fixture === "bithire" ? "brand-theme" : "appearance";

  return (
    <Box
      data-ds-root=""
      data-testid="layout-foundations-evidence"
      data-evidence-brand={fixture}
      data-evidence-locale={locale}
      data-evidence-direction={direction}
      data-evidence-source={sourceLabel}
      data-evidence-config-path={configPath}
      lang={locale}
      dir={direction}
      minHeight="100vh"
      background="var(--ds-color-bg-primary)"
    >
      <Container
        data-testid="layout-evidence-container"
        maxWidth="xl"
        center
        padding="lg"
      >
        <Stack
          data-testid="layout-evidence-stack"
          spacing={{ xs: "lg", md: "xl" }}
        >
          <Flex
            data-testid="layout-evidence-header-flex"
            direction={{ xs: "column", md: "row" }}
            align={{ xs: "start", md: "center" }}
            justify="between"
            gap={{ xs: 12, md: 24 }}
            wrap="wrap"
          >
            <Stack spacing="xs">
              <Badge tone="primary" badgeStyle="soft">
                {sourceLabel} · {locale.toUpperCase()} ·{" "}
                {direction.toUpperCase()}
              </Badge>
              <Heading
                data-testid="layout-evidence-heading"
                level="h1"
                size="2xl"
                weight="bold"
              >
                {brandLabel}
              </Heading>
              <Text color="secondary">{t("components.empty.description")}</Text>
            </Stack>

            <Box width="100%" maxWidth="24rem">
              <Space
                data-testid="layout-evidence-space"
                size="sm"
                wrap
                dir={direction}
                split={<Divider orientation="vertical" spacing="none" />}
              >
                <Button
                  data-testid="layout-evidence-primary-action"
                  variant="primary"
                >
                  {t("common.save")}
                </Button>
                <Button
                  data-testid="layout-evidence-secondary-action"
                  variant="secondary"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  data-testid="layout-evidence-tertiary-action"
                  variant="ghost"
                >
                  {t("common.more")}
                </Button>
              </Space>
            </Box>
          </Flex>

          <Divider
            data-testid="layout-evidence-divider"
            textPosition="start"
            spacing="none"
          >
            {t("common.key_metrics")}
          </Divider>

          <Grid
            data-testid="layout-evidence-grid"
            columns={{ xs: 1, md: 2, lg: 3 }}
            gap="lg"
            alignItems="stretch"
          >
            <FoundationPanel testId="layout-evidence-box">
              <Stack spacing="md">
                <Text weight="semibold">
                  {t("common.dashboard_status_live")}
                </Text>
                <Text color="secondary">
                  {t("components.table.rows_selected", { count: 3 })}
                </Text>
                <Divider spacing="none" />
                <Flex
                  data-testid="layout-evidence-wrapping-flex"
                  gap={8}
                  wrap="wrap"
                  maxWidth="8rem"
                >
                  <Badge tone="success">84%</Badge>
                  <Badge tone="info">12</Badge>
                  <Badge tone="warning">3</Badge>
                  <Badge tone="primary">6</Badge>
                  <Badge tone="neutral">24</Badge>
                </Flex>
              </Stack>
            </FoundationPanel>

            <FoundationPanel testId="layout-evidence-aspect-panel">
              <Stack spacing="md">
                <Text weight="semibold">{t("common.shortcuts")}</Text>
                <AspectRatio
                  data-testid="layout-evidence-aspect-ratio"
                  ratio={16 / 9}
                >
                  <Box
                    data-testid="layout-evidence-aspect-child"
                    width="100%"
                    height="100%"
                    display="flex"
                    borderRadius="md"
                    background="var(--ds-color-bg-secondary)"
                    border="1px solid var(--ds-color-border-subtle)"
                  >
                    <Flex align="center" justify="center" flex={1}>
                      <Text weight="semibold">16:9</Text>
                    </Flex>
                  </Box>
                </AspectRatio>
              </Stack>
            </FoundationPanel>

            <FoundationPanel testId="layout-evidence-responsive-panel">
              <Stack spacing="md" divider={<Divider spacing="none" />}>
                <Text weight="semibold">{t("common.actions")}</Text>
                <Text color="secondary">
                  {t("components.search.placeholder")}
                </Text>
                <Text color="secondary">
                  {t("components.search.no_results")}
                </Text>
                <Text data-testid="layout-evidence-long-copy" color="secondary">
                  {t("components.search.placeholder")} ·
                  decision-evidence-reference-2026-with-unbroken-content
                </Text>
              </Stack>
            </FoundationPanel>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

/**
 * The customer's published copy for the DB-owned fixture.
 *
 * It travels as a PROVIDER prop and never on the tenant config: the code-owned
 * projection keeps only
 * `branding | engine | features | name | plan | slug | theme | vertical`, so
 * `customTranslations` (or `locale`) set on a config is dropped before the
 * runtime ever sees it. Routing copy the same way on both sources keeps one
 * rule instead of two.
 */
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

/**
 * This route's two fixtures ARE the fleet's two governed sources, so they map
 * onto them instead of rebuilding them.
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
 * both directions at once, and both failures are SILENT -- a blocked visual
 * authority renders `<LoadingScreen />`, which photographs as a slow load
 * rather than as a failure. Spreading the registry config destroys the WeakSet
 * object identity that makes bithire code-owned, so the copy became an ordinary
 * tenant carrying an uncompiled `brandTheme`; the management branch carried a
 * hand-authored `appearance` literal, which is visual payload that no
 * declaration admits.
 *
 * `ShowroomTenantProvider` fixes both: bithire is the registry's own object,
 * UNSPREAD, and The Management is a validated / hydrated / compiled artifact
 * whose `<style>` mounts OUTSIDE the provider so the mount proof can see it.
 * Engine (`modern`) and ground (`light`) are the provider's own defaults, and
 * locale stays a provider prop on both paths.
 */
export function LayoutFoundationsEvidence({
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
      <FoundationsCanvas fixture={fixture} />
    </ShowroomTenantProvider>
  );
}
