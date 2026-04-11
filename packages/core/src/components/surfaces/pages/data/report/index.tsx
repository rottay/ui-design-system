'use client';

/**
 * @fileoverview ReportSurface -- report builder with filters, charts, and export.
 * @description Composes template selection, configurable filters, chart rendering,
 * and export capabilities. Supports sidebar and top-aligned filter layouts. The app
 * owns data querying and report generation; this surface owns the page structure.
 */

import React from 'react';
import { Box, Button, Card, Flex, Grid, Stack, Text } from '../../../../primitives';
import { PatternDataTable, PatternFilterPanel } from '../../../../patterns';
import type { ColumnDef, FilterDef } from '../../../../patterns';
import type { ReportData, ReportSurfaceConfig, ReportTemplate } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../foundation/responsive';
import { SurfaceEmptyState } from '../../../foundation/states';

export interface ReportSurfaceProps {
  config: ReportSurfaceConfig;
  loading?: boolean;
}

function TemplateSelector({
  templates,
  selectedTemplate,
  onTemplateSelect,
}: {
  templates: ReportTemplate[];
  selectedTemplate?: string;
  onTemplateSelect?: (id: string) => void;
}): React.ReactElement {
  if (templates.length === 0) {
    return (
      <SurfaceEmptyState
        title="No templates"
        description="No report templates are available."
      />
    );
  }

  return (
    <Stack spacing="sm">
      <Text style={{ fontSize: 14, fontWeight: 600 }}>Templates</Text>
      {/* Selected template gets a primary border highlight to give a clear
          visual indicator without requiring a separate radio/checkbox UI. */}
      {templates.map((template) => (
        <Card
          key={template.id}
          variant="outlined"
          hoverable
          clickable
          onClick={() => onTemplateSelect?.(template.id)}
          style={{
            borderColor:
              selectedTemplate === template.id
                ? 'var(--ds-color-primary)'
                : undefined,
          }}
        >
          <Card.Body>
            <Flex gap={8} align="start">
              {template.icon && (
                <Box style={{ flexShrink: 0, marginTop: 2 }}>{template.icon}</Box>
              )}
              <Stack spacing="xs">
                <Text style={{ fontWeight: 500 }}>{template.name}</Text>
                {template.description && (
                  <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
                    {template.description}
                  </Text>
                )}
                {template.category && (
                  <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 11 }}>
                    {template.category}
                  </Text>
                )}
              </Stack>
            </Flex>
          </Card.Body>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * Maps ReportFilter types to FilterDef types. ReportFilter uses 'number'
 * while FilterDef expects 'text' (rendered as a text input -- the original
 * manual implementation used <Input type="number"> which is equivalent).
 */
function mapReportFilterType(type: string): FilterDef['type'] {
  if (type === 'number') return 'text';
  return type as FilterDef['type'];
}

function FilterPanel({
  config,
}: {
  config: ReportSurfaceConfig;
}): React.ReactElement {
  const { filters, filterValues } = config.behavior;

  if (filters.length === 0) return <></>;

  const filterDefs: FilterDef[] = filters.map((f) => ({
    key: f.key,
    label: f.label,
    type: mapReportFilterType(f.type),
    options: f.options,
    placeholder: f.placeholder,
    defaultValue: f.defaultValue,
  }));

  return (
    <Card variant="outlined">
      <Card.Body>
        <PatternFilterPanel
          filters={filterDefs}
          values={filterValues ?? {}}
          onChange={(values) => config.behavior.onFilterChange?.(values)}
          title="Filters"
          layout="stacked"
        />
      </Card.Body>
    </Card>
  );
}

function ReportResults({
  config,
}: {
  config: ReportSurfaceConfig;
}): React.ReactElement {
  const { reportData, generating } = config.behavior;

  if (generating) {
    return (
      <Card variant="outlined">
        <Card.Body>
          <Flex justify="center" style={{ padding: '32px 0' }}>
            <Text style={{ color: 'var(--ds-color-text-muted)' }}>Generating report...</Text>
          </Flex>
        </Card.Body>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card variant="outlined">
        <Card.Body>
          {config.presentation.emptyState ?? (
            <SurfaceEmptyState
              title="No report data"
              description="Select a template and generate a report to see results."
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

  const summaryFooter = reportData.summary ? (
    <Box style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--ds-color-border)' }}>
      <Flex gap={16} wrap="wrap">
        {Object.entries(reportData.summary).map(([key, value]) => (
          <Stack key={key} spacing="xs">
            <Text style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>{key}</Text>
            <Text style={{ fontWeight: 600 }}>{String(value)}</Text>
          </Stack>
        ))}
      </Flex>
    </Box>
  ) : undefined;

  return (
    <Stack spacing="lg">
      {config.presentation.renderChart && (
        <Card variant="outlined">
          <Card.Body>{config.presentation.renderChart(reportData)}</Card.Body>
        </Card>
      )}

      <Card variant="outlined">
        <Card.Body>
          <PatternDataTable<Record<string, unknown>>
            data={reportData.rows}
            columns={tableColumns}
            compact
            hoverable
            pagination={false}
            footer={summaryFooter}
          />
        </Card.Body>
      </Card>
    </Stack>
  );
}

export function ReportSurface({
  config,
  loading = false,
}: ReportSurfaceProps): React.ReactElement {
  // sidebar-filters layout puts templates + filters in a persistent left
  // column. On tablet, this gets too cramped so it stacks.
  const isSidebarLayout = config.visual.layout === 'sidebar-filters';
  const { shouldStack } = useSurfaceResponsiveLayout({
    stackOnMobile: true,
    stackOnTablet: isSidebarLayout,
  });

  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {config.behavior.onGenerate && (
        <Button
          variant="primary"
          size="sm"
          onClick={config.behavior.onGenerate}
          loading={config.behavior.generating}
        >
          <Text>Generate</Text>
        </Button>
      )}
      {/* All three export formats are always offered when onExport is set.
          The app decides which formats to actually support in its callback. */}
      {config.behavior.onExport && (
        <Flex gap={4}>
          {(['pdf', 'excel', 'csv'] as const).map((format) => (
            <Button
              key={format}
              variant="secondary"
              size="sm"
              onClick={() => config.behavior.onExport?.(format)}
            >
              <Text>{format.toUpperCase()}</Text>
            </Button>
          ))}
        </Flex>
      )}
    </Flex>
  );

  const sidebarContent = (
    <Stack spacing="lg">
      <TemplateSelector
        templates={config.behavior.templates}
        selectedTemplate={config.behavior.selectedTemplate}
        onTemplateSelect={config.behavior.onTemplateSelect}
      />
      <FilterPanel config={config} />
    </Stack>
  );

  const mainContent = <ReportResults config={config} />;

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={actionsNode}
      loading={loading}
    >
      {isSidebarLayout && !shouldStack ? (
        <Grid columns={12} gap="lg">
          <Grid.Item span={4}>{sidebarContent}</Grid.Item>
          <Grid.Item span={8}>{mainContent}</Grid.Item>
        </Grid>
      ) : (
        <Stack spacing="lg">
          {!isSidebarLayout && (
            <Flex gap={16} wrap="wrap" align="end">
              <Box style={{ flex: 1, minWidth: 200 }}>
                <TemplateSelector
                  templates={config.behavior.templates}
                  selectedTemplate={config.behavior.selectedTemplate}
                  onTemplateSelect={config.behavior.onTemplateSelect}
                />
              </Box>
            </Flex>
          )}
          {isSidebarLayout && shouldStack && sidebarContent}
          {!isSidebarLayout && <FilterPanel config={config} />}
          {mainContent}
        </Stack>
      )}
    </PageShellSurface>
  );
}
