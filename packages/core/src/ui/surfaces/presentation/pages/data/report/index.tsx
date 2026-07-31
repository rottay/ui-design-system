'use client';

/**
 * @fileoverview ReportSurface -- report builder with templates, filters, KPI
 * summary, chart slot, result table, and export.
 * @description Composes template selection (native Card selection), a
 * configurable filter panel, a summary stats grid, an app-owned chart
 * renderer, and the result table. Supports sidebar and top-aligned filter
 * layouts. The app owns data querying and report generation; this surface
 * owns the page structure, the state kits (mirror skeleton, empty, generating,
 * error with retry, partial data), and the responsive choreography.
 */

import React from 'react';
import { Box, Button, Card, Flex, Grid, Stack, Text } from '../../../../../primitives';
import {
  PatternDataTable,
  PatternFilterPanel,
  PatternStatsGrid,
} from '../../../../../patterns';
import type { ColumnDef, FilterDef } from '../../../../../patterns';
import type {
  ReportSurfaceConfig,
  ReportTemplate,
} from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { countActiveFilters } from '../../../../runtime/helpers';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import { FadeIn, StaggerChildren } from '@/graphics/motion';
import { ActionPlayIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-play';
import { ContentDocumentIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-document';

type SurfaceCardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';
type SectionSpacing = 'sm' | 'md' | 'lg';

/** StatsGrid has its own material vocabulary; map the profile card variant
 *  onto the closest stats material so the summary row and the surrounding
 *  panels share one tenant surface language. */
function resolveStatsGridVariant(
  cardVariant: SurfaceCardVariant
): 'default' | 'outlined' | 'filled' {
  if (cardVariant === 'outlined') return 'outlined';
  if (cardVariant === 'filled') return 'filled';
  return 'default';
}

/** Section heading. The tenant's `sectionTitle` type style carries the
 *  hierarchy (family/size/weight via the `--ds-type-section-title` channel);
 *  the surface deliberately adds no weight paint of its own — typography.css
 *  sorts in a later layer, so a surface-local font-weight would be inert. */
function SectionTitle({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Text textStyle="sectionTitle" data-part="section-title">
      {children}
    </Text>
  );
}

function TemplateSelector({
  templates,
  selectedTemplate,
  onTemplateSelect,
  layout,
  cardVariant,
}: {
  templates: ReportTemplate[];
  selectedTemplate?: string;
  onTemplateSelect?: (id: string) => void;
  layout: 'grid' | 'stack';
  cardVariant: SurfaceCardVariant;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();

  if (templates.length === 0) {
    return (
      <Card variant={cardVariant}>
        <Card.Body>
          <SurfaceEmptyState
            title={tSurfaceOr('report.no_templates_title', 'No templates')}
            description={tSurfaceOr(
              'report.no_templates_description',
              'No report templates are available.'
            )}
          />
        </Card.Body>
      </Card>
    );
  }

  const templateCards = templates.map((template) => (
    /* Native Card selection: `selectable`+`selected`+`onSelect` give the
       toggle semantics (role="button", tab stop, Enter/Space activation,
       aria-pressed) and the selected paint is owned by the Card skin itself
       -- the surface only tints the leading icon. The BEM modifier class is
       the pinned anatomy hook (SurfacesLongTailBatch.contract.test.tsx) kept
       as a landing hook across engines. */
    <Card
      key={template.id}
      className={
        selectedTemplate === template.id
          ? 'ds-report__template-card ds-report__template-card--selected'
          : 'ds-report__template-card'
      }
      variant={cardVariant}
      hoverable
      selectable
      selected={selectedTemplate === template.id}
      onSelect={() => onTemplateSelect?.(template.id)}
    >
      <Card.Body>
        <Flex gap={12} align="start">
          <Box className="ds-report__template-icon" data-part="template-icon">
            {template.icon ?? <ContentDocumentIcon decorative size={18} />}
          </Box>
          <Stack spacing="xs">
            <Text weight="medium">{template.name}</Text>
            {template.description && (
              <Text size="xs" color="muted" className="ds-report__muted-text">
                {template.description}
              </Text>
            )}
            {template.category && (
              <Text size="xs" color="subtle" className="ds-report__muted-text">
                {template.category}
              </Text>
            )}
          </Stack>
        </Flex>
      </Card.Body>
    </Card>
  ));

  const templatesAriaLabel = tSurfaceOr(
    'report.templates_group_aria',
    'Report templates'
  );

  return (
    <Stack as="section" spacing="sm" data-part="templates">
      <SectionTitle>{tSurfaceOr('report.templates_title', 'Templates')}</SectionTitle>
      {layout === 'grid' ? (
        /* Top-filters layout: templates flow into an auto-fit grid. The
           `min(100%, …)` floor keeps a track from overflowing narrow
           viewports; geometry only, no paint. */
        <Grid
          templateColumns="repeat(auto-fit, minmax(min(100%, 240px), 1fr))"
          gap="md"
          role="group"
          aria-label={templatesAriaLabel}
        >
          {templateCards}
        </Grid>
      ) : (
        <Stack spacing="sm" role="group" aria-label={templatesAriaLabel}>
          {templateCards}
        </Stack>
      )}
    </Stack>
  );
}

function FilterPanel({
  config,
  layout,
  cardVariant,
}: {
  config: ReportSurfaceConfig;
  layout: 'inline' | 'stacked';
  cardVariant: SurfaceCardVariant;
}): React.ReactElement | null {
  const { tSurfaceOr } = useSurfaceTranslations();
  const { filters, filterValues } = config.behavior;

  if (filters.length === 0) return null;

  // ReportFilter['type'] is a subset of FilterDef['type'] ('number' and
  // 'date-range' are native FilterDef types), so the old string remapping is
  // gone: the contract value travels untouched.
  const filterDefs: FilterDef[] = filters.map((filter) => ({
    key: filter.key,
    label: filter.label,
    type: filter.type,
    options: filter.options,
    placeholder: filter.placeholder,
    defaultValue: filter.defaultValue,
  }));

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <PatternFilterPanel
          filters={filterDefs}
          values={filterValues ?? {}}
          onChange={(values) => config.behavior.onFilterChange?.(values)}
          title={tSurfaceOr('report.filters_title', 'Filters')}
          layout={layout}
          activeCount={countActiveFilters(filterValues)}
        />
      </Card.Body>
    </Card>
  );
}

/** First-generation placeholder: the status line is announced (role="status")
 *  while the skeleton mirrors the results geometry (stats + chart + rows), so
 *  the swap to real content is a paint change, not a layout shift. */
function GeneratingState({
  cardVariant,
}: {
  cardVariant: SurfaceCardVariant;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <Flex align="center" gap={8} role="status">
            <Text color="muted">
              {tSurfaceOr('report.generating', 'Generating report...')}
            </Text>
          </Flex>
          <Grid
            templateColumns="repeat(auto-fit, minmax(min(100%, 160px), 1fr))"
            gap="md"
          >
            <Box data-part="report-skeleton-block" data-size="stat" />
            <Box data-part="report-skeleton-block" data-size="stat" />
            <Box data-part="report-skeleton-block" data-size="stat" />
          </Grid>
          <Box data-part="report-skeleton-block" data-size="chart" />
          <Stack spacing="sm">
            <Box data-part="report-skeleton-block" data-size="line" />
            <Box data-part="report-skeleton-block" data-size="line" />
            <Box data-part="report-skeleton-block" data-size="line" />
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function ReportResults({
  config,
  cardVariant,
  sectionSpacing,
}: {
  config: ReportSurfaceConfig;
  cardVariant: SurfaceCardVariant;
  sectionSpacing: SectionSpacing;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const { reportData, generating, onGenerate } = config.behavior;

  // Regenerating over an existing report keeps the current numbers on screen
  // (aria-busy marks them stale); only a first generation swaps in the
  // mirror placeholder. Partial data below works the same way: every section
  // renders as soon as its own data exists.
  if (generating && !reportData) {
    return <GeneratingState cardVariant={cardVariant} />;
  }

  if (!reportData) {
    return (
      <Card variant={cardVariant}>
        <Card.Body>
          {config.presentation.emptyState ?? (
            <SurfaceEmptyState
              title={tSurfaceOr('report.empty_title', 'No report data')}
              description={tSurfaceOr(
                'report.empty_description',
                'Select a template and generate a report to see results.'
              )}
              action={
                onGenerate
                  ? {
                      id: 'report-empty-generate',
                      label: tSurfaceOr('report.generate', 'Generate'),
                      variant: 'primary',
                      onClick: () => {
                        void onGenerate();
                      },
                    }
                  : undefined
              }
            />
          )}
        </Card.Body>
      </Card>
    );
  }

  // Map dynamic report columns to PatternDataTable ColumnDef format.
  // Report columns are determined at runtime by the report template,
  // so we build the column definitions from the report data itself.
  const tableColumns: ColumnDef<Record<string, unknown>>[] = reportData.columns.map((col) => ({
    key: col.key,
    header: col.label,
    accessorKey: col.key,
    render: (_: unknown, row: Record<string, unknown>) => {
      const val = row[col.key];
      return String(val ?? '-');
    },
  }));

  // The summary strip reads as KPIs over the table, not as a table footer:
  // totals/averages are headline values, so they compose as a stats grid.
  const summaryStats = reportData.summary
    ? Object.entries(reportData.summary).map(([key, value]) => ({
        key,
        label: key,
        value: typeof value === 'number' ? value : String(value ?? ''),
      }))
    : [];

  return (
    <Stack
      spacing={sectionSpacing}
      data-part="results"
      aria-busy={generating || undefined}
    >
      {summaryStats.length > 0 && (
        <Stack as="section" spacing="sm" data-part="section">
          <SectionTitle>{tSurfaceOr('report.summary_title', 'Summary')}</SectionTitle>
          <PatternStatsGrid
            stats={summaryStats}
            columns={Math.min(summaryStats.length, 4)}
            variant={resolveStatsGridVariant(cardVariant)}
          />
        </Stack>
      )}

      {config.presentation.renderChart && (
        <Stack as="section" spacing="sm" data-part="section">
          <SectionTitle>{tSurfaceOr('report.chart_title', 'Visualization')}</SectionTitle>
          <Card variant={cardVariant}>
            <Card.Body>{config.presentation.renderChart(reportData)}</Card.Body>
          </Card>
        </Stack>
      )}

      <Stack as="section" spacing="sm" data-part="section">
        <SectionTitle>{tSurfaceOr('report.table_title', 'Results')}</SectionTitle>
        <PatternDataTable<Record<string, unknown>>
          data={reportData.rows}
          columns={tableColumns}
          compact
          hoverable
          pagination={false}
          emptyState={
            <SurfaceEmptyState
              title={tSurfaceOr('report.empty_rows_title', 'No rows')}
              description={tSurfaceOr(
                'report.empty_rows_description',
                'The report ran but returned no rows for the current filters.'
              )}
            />
          }
        />
      </Stack>
    </Stack>
  );
}

/** Loading placeholder that mirrors the report's geometry: template cards and
 *  the filter panel where they will land, then the stats row, chart block,
 *  and table lines. The blocks are painted by the surface skin (pulse rides
 *  the canonical attention channel and goes quiet under reduced motion). */
function ReportSkeleton({
  sidebar,
  hasTemplates,
  hasFilters,
  hasChart,
  sectionSpacing,
}: {
  sidebar: boolean;
  hasTemplates: boolean;
  hasFilters: boolean;
  hasChart: boolean;
  sectionSpacing: SectionSpacing;
}): React.ReactElement {
  const configSkeleton = (
    <Stack spacing={sectionSpacing} data-part="skeleton-config">
      {hasTemplates && (
        <>
          <Box data-part="report-skeleton-block" data-size="section-title" />
          <Box data-part="report-skeleton-block" data-size="template-card" />
          <Box data-part="report-skeleton-block" data-size="template-card" />
        </>
      )}
      {hasFilters && <Box data-part="report-skeleton-block" data-size="filter" />}
    </Stack>
  );

  const resultsSkeleton = (
    <Stack spacing={sectionSpacing} data-part="skeleton-results">
      <Grid
        templateColumns="repeat(auto-fit, minmax(min(100%, 160px), 1fr))"
        gap="md"
      >
        <Box data-part="report-skeleton-block" data-size="stat" />
        <Box data-part="report-skeleton-block" data-size="stat" />
        <Box data-part="report-skeleton-block" data-size="stat" />
      </Grid>
      {hasChart && <Box data-part="report-skeleton-block" data-size="chart" />}
      <Stack spacing="sm">
        <Box data-part="report-skeleton-block" data-size="line" />
        <Box data-part="report-skeleton-block" data-size="line" />
        <Box data-part="report-skeleton-block" data-size="line" />
        <Box data-part="report-skeleton-block" data-size="line" />
      </Stack>
    </Stack>
  );

  if (sidebar) {
    return (
      <Grid columns={12} gap={sectionSpacing}>
        <Grid.Item span={4}>{configSkeleton}</Grid.Item>
        <Grid.Item span={8}>{resultsSkeleton}</Grid.Item>
      </Grid>
    );
  }

  return (
    <Stack spacing={sectionSpacing}>
      {configSkeleton}
      {resultsSkeleton}
    </Stack>
  );
}

export interface ReportSurfaceProps {
  config: ReportSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Report builder/viewer shell: templates + filters configure, results read. */
export function ReportSurface({
  config,
  loading = false,
  error,
  onRetry,
}: ReportSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { tSurfaceOr } = useSurfaceTranslations();
  // sidebar-filters layout puts templates + filters in a persistent left
  // column. On tablet this gets too cramped, so it stacks.
  const isSidebarLayout = config.visual.layout === 'sidebar-filters';
  const { isMobile, shouldStack } = useSurfaceResponsiveLayout({
    stackOnMobile: true,
    stackOnTablet: isSidebarLayout,
  });
  // Visual defaults cascade: explicit surface config -> product profile ->
  // DS defaults (spacing scale, card material, motion intensity).
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const cardVariant = profileDefaults.cardVariant;
  const useSidebarColumns = isSidebarLayout && !shouldStack;

  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };

  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {config.behavior.onGenerate && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            void config.behavior.onGenerate?.();
          }}
          loading={config.behavior.generating}
          icon={<ActionPlayIcon decorative size={15} />}
        >
          {tSurfaceOr('report.generate', 'Generate')}
        </Button>
      )}
      {/* All three export formats are always offered when onExport is set.
          The app decides which formats to actually support in its callback.
          Exporting needs a generated report, so the group stays disabled
          until reportData exists. */}
      {config.behavior.onExport && (
        <Flex
          gap={4}
          wrap="wrap"
          role="group"
          aria-label={tSurfaceOr('report.export_group_aria', 'Export report')}
        >
          {(['pdf', 'excel', 'csv'] as const).map((format) => (
            <Button
              key={format}
              variant="secondary"
              size="sm"
              disabled={!config.behavior.reportData}
              onClick={() => config.behavior.onExport?.(format)}
            >
              {tSurfaceOr(`report.export_${format}`, format.toUpperCase())}
            </Button>
          ))}
        </Flex>
      )}
    </Flex>
  );

  // Error state renders full page chrome so header actions stay available
  // even when the report load failed.
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const templateSection = (
    <TemplateSelector
      templates={config.behavior.templates}
      selectedTemplate={config.behavior.selectedTemplate}
      onTemplateSelect={config.behavior.onTemplateSelect}
      layout={isSidebarLayout ? 'stack' : 'grid'}
      cardVariant={cardVariant}
    />
  );

  const filterSection = (
    <FilterPanel
      config={config}
      /* Sidebar columns keep the panel stacked; the top layout lets filters
         flow inline on desktop and stack on mobile/stacked-sidebar. */
      layout={!useSidebarColumns && !isMobile && !shouldStack ? 'inline' : 'stacked'}
      cardVariant={cardVariant}
    />
  );

  const resultsSection = (
    <ReportResults
      config={config}
      cardVariant={cardVariant}
      sectionSpacing={sectionSpacing}
    />
  );

  const bodyContent = loading ? (
    /* Mirror skeleton: the report's geometry is preserved through the load —
       the page chrome stays live and the swap is paint-only. The page-shell
       loading early-return is NOT used here because it would drop the
       report's own shape. */
    <ReportSkeleton
      sidebar={useSidebarColumns}
      hasTemplates={config.behavior.templates.length > 0}
      hasFilters={config.behavior.filters.length > 0}
      hasChart={!!config.presentation.renderChart}
      sectionSpacing={sectionSpacing}
    />
  ) : useSidebarColumns ? (
    <Grid columns={12} gap={sectionSpacing}>
      <Grid.Item span={4}>
        <Stack spacing={sectionSpacing}>
          {templateSection}
          {filterSection}
        </Stack>
      </Grid.Item>
      <Grid.Item span={8}>{resultsSection}</Grid.Item>
    </Grid>
  ) : (
    <>
      {templateSection}
      {filterSection}
      {resultsSection}
    </>
  );

  const reportContent = (
    <Stack
      className={`ds-surface ds-report ds-report--${
        useSidebarColumns
          ? 'sidebar'
          : isSidebarLayout
            ? 'stacked-sidebar'
            : 'top-filters'
      }`}
      data-part="root"
      data-layout={isSidebarLayout ? 'sidebar' : 'top'}
      data-mobile={isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      spacing={sectionSpacing}
    >
      {bodyContent}
    </Stack>
  );

  return (
    /* The page chrome (title + actions) stays live through the load: the
       surface owns the mirror skeleton, so the shell's loading early-return
       is intentionally not engaged. */
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>
          <StaggerChildren staggerDelayMs={profileDefaults.staggerDelay}>
            {reportContent}
          </StaggerChildren>
        </FadeIn>
      ) : (
        reportContent
      )}
    </PageShellSurface>
  );
}
