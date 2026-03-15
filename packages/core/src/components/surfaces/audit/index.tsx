'use client';

/**
 * AuditSurface
 *
 * Config-driven audit log viewer for compliance frameworks (HIPAA, SOC2, GDPR).
 * Renders a filterable, exportable audit trail with severity indicators and
 * customizable entry rendering. The surface owns the table mechanics and filter
 * layout while the app owns the data fetching and domain-specific renderers.
 */

import React, { useMemo } from 'react';
import { Badge, Box, Button, Card, Flex, Stack, Table, Tag, Text } from '../../primitives';
import { PatternFilterPanel } from '../../patterns';
import { countActiveFilters, filterSurfaceActions } from '../helpers';
import type { AuditSurfaceConfig, AuditEntry } from '../types';
import { PageShellSurface } from '../page-shell';
import { SurfaceEmptyState } from '../states';

export interface AuditSurfaceProps {
  config: AuditSurfaceConfig;
  loading?: boolean;
}

function severityColor(severity?: AuditEntry['severity']): string {
  switch (severity) {
    case 'critical':
      return 'var(--ds-color-error-500)';
    case 'warning':
      return 'var(--ds-color-warning-500)';
    case 'info':
    default:
      return 'var(--ds-color-text-muted)';
  }
}

export function AuditSurface({
  config,
  loading = false,
}: AuditSurfaceProps): React.ReactElement {
  const isCompact = config.visual.density === 'compact';
  const activeFilterCount = countActiveFilters(config.behavior.filterValues);

  const exportActions = useMemo(() => {
    if (!config.behavior.onExport) return null;

    const formats: Array<'csv' | 'json' | 'pdf'> = ['csv', 'json', 'pdf'];

    return (
      <Flex gap={8} wrap="wrap">
        {formats.map((format) => (
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
    );
  }, [config.behavior.onExport]);

  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {exportActions}
    </Flex>
  );

  const tableColumns = config.behavior.columns.map((col) => ({
    key: col.key,
    title: col.label,
    dataIndex: col.key,
    width: col.width,
    sorter: col.sortable,
    render: col.render
      ? (value: unknown, record: AuditEntry) => col.render!(value, record)
      : undefined,
  }));

  const defaultRenderEntry = (entry: AuditEntry) => (
    <Flex gap={12} align="center">
      <Tag
        color={
          entry.severity === 'critical'
            ? 'error'
            : entry.severity === 'warning'
              ? 'warning'
              : 'default'
        }
      >
        {entry.severity ?? 'info'}
      </Tag>
      <Stack spacing="xs">
        <Text style={{ fontWeight: 600 }}>{entry.action}</Text>
        <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
          {entry.actor} - {entry.resource}
        </Text>
      </Stack>
    </Flex>
  );

  const renderEntry = config.presentation.renderEntry ?? defaultRenderEntry;

  return (
    <PageShellSurface
      chrome={config.presentation.chrome}
      actions={actionsNode}
      loading={loading}
    >
      <Stack spacing="lg">
        {config.behavior.filters.length > 0 && (
          <Card variant="outlined">
            <Card.Body>
              <PatternFilterPanel
                filters={config.behavior.filters.map((f) => ({
                  key: f.key,
                  label: f.label,
                  type: f.type === 'date-range' ? 'text' : f.type === 'multi-select' ? 'select' : f.type,
                  options: f.options,
                  placeholder: f.placeholder,
                }))}
                values={config.behavior.filterValues ?? {}}
                onChange={(values) => config.behavior.onFilterChange?.(values)}
                activeCount={activeFilterCount}
                title="Filters"
                layout="inline"
              />
            </Card.Body>
          </Card>
        )}

        {config.behavior.entries.length === 0 ? (
          <Card variant="outlined">
            <Card.Body>
              <SurfaceEmptyState
                title="No audit entries"
                description="There are no audit log entries matching the current filters."
              />
            </Card.Body>
          </Card>
        ) : (
          <Card variant="outlined">
            <Card.Body>
              <Box style={{ maxHeight: config.visual.maxHeight, overflow: config.visual.maxHeight ? 'auto' : undefined }}>
                <Stack spacing={isCompact ? 'xs' : 'md'}>
                  {config.behavior.entries.map((entry) => (
                    <Box
                      key={entry.id}
                      style={{
                        padding: isCompact ? '8px 0' : '12px 0',
                        borderBottom: '1px solid var(--ds-color-border)',
                      }}
                    >
                      <Flex justify="between" align="start" gap={12}>
                        <Box style={{ flex: 1 }}>
                          {renderEntry(entry)}
                        </Box>
                        <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {entry.timestamp}
                        </Text>
                      </Flex>
                      {entry.details && (
                        <Text
                          style={{
                            color: 'var(--ds-color-text-muted)',
                            fontSize: 12,
                            marginTop: 4,
                            paddingLeft: isCompact ? 0 : 8,
                          }}
                        >
                          {entry.details}
                        </Text>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card.Body>
          </Card>
        )}

        {config.behavior.pagination && (
          <Flex justify="end">
            <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
              Page {config.behavior.pagination.current} - {config.behavior.pagination.total} total entries
            </Text>
          </Flex>
        )}
      </Stack>
    </PageShellSurface>
  );
}
