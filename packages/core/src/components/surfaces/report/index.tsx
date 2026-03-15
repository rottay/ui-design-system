'use client';

/**
 * ReportSurface
 *
 * Report builder surface with template selection, configurable filters, data
 * generation, chart rendering, and export capabilities. Supports both sidebar
 * and top-aligned filter layouts. The app owns the actual data querying and
 * report generation; this surface provides consistent report page structure.
 */

import React, { useCallback, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Input, Select, Stack, Text } from '../../primitives';
import type { ReportData, ReportSurfaceConfig, ReportTemplate } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceEmptyState } from '../states';

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

function FilterPanel({
  config,
}: {
  config: ReportSurfaceConfig;
}): React.ReactElement {
  const { filters, filterValues } = config.behavior;

  if (filters.length === 0) return <></>;

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Text style={{ fontSize: 14, fontWeight: 600 }}>Filters</Text>
          {filters.map((filter) => (
            <Stack key={filter.key} spacing="xs">
              <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--ds-color-text-muted)' }}>
                {filter.label}
              </Text>
              {filter.type === 'select' || filter.type === 'multi-select' ? (
                <Select
                  value={filterValues?.[filter.key] as string}
                  onChange={(value) =>
                    config.behavior.onFilterChange?.({
                      ...filterValues,
                      [filter.key]: value,
                    })
                  }
                  options={(filter.options ?? []).map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                  }))}
                  placeholder={filter.placeholder}
                />
              ) : (
                <Input
                  value={String(filterValues?.[filter.key] ?? '')}
                  onChange={(e: any) =>
                    config.behavior.onFilterChange?.({
                      ...filterValues,
                      [filter.key]: typeof e === 'string' ? e : e?.target?.value ?? '',
                    })
                  }
                  placeholder={filter.placeholder}
                  type={filter.type === 'number' ? 'number' : 'text'}
                />
              )}
            </Stack>
          ))}
        </Stack>
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

  return (
    <Stack spacing="lg">
      {config.presentation.renderChart && (
        <Card variant="outlined">
          <Card.Body>{config.presentation.renderChart(reportData)}</Card.Body>
        </Card>
      )}

      <Card variant="outlined">
        <Card.Body>
          <Box style={{ overflowX: 'auto' }}>
            <Box style={{ display: 'table', width: '100%', borderCollapse: 'collapse' }}>
              <Box style={{ display: 'table-header-group' }}>
                <Box style={{ display: 'table-row' }}>
                  {reportData.columns.map((col) => (
                    <Box
                      key={col.key}
                      style={{
                        display: 'table-cell',
                        padding: '8px 12px',
                        fontWeight: 600,
                        fontSize: 13,
                        borderBottom: '2px solid var(--ds-color-border)',
                        color: 'var(--ds-color-text-muted)',
                      }}
                    >
                      <Text style={{ fontWeight: 600, fontSize: 13 }}>{col.label}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box style={{ display: 'table-row-group' }}>
                {reportData.rows.map((row, rowIndex) => (
                  <Box key={rowIndex} style={{ display: 'table-row' }}>
                    {reportData.columns.map((col) => (
                      <Box
                        key={col.key}
                        style={{
                          display: 'table-cell',
                          padding: '8px 12px',
                          fontSize: 13,
                          borderBottom: '1px solid var(--ds-color-border)',
                        }}
                      >
                        <Text style={{ fontSize: 13 }}>
                          {String(row[col.key] ?? '-')}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {reportData.summary && (
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
          )}
        </Card.Body>
      </Card>
    </Stack>
  );
}

export function ReportSurface({
  config,
  loading = false,
}: ReportSurfaceProps): React.ReactElement {
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
