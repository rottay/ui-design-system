'use client';

/**
 * AuditSurface
 *
 * Config-driven audit log viewer for compliance frameworks (HIPAA, SOC2, GDPR).
 * Renders a filterable, exportable audit trail with severity indicators and
 * customizable entry rendering. The surface owns the table mechanics and filter
 * layout while the app owns the data fetching and domain-specific renderers.
 */

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import React, { useMemo } from 'react';
import { Box, Button, Card, Flex, Stack, Text } from '../../../../../primitives';
import { PatternDataTable, PatternFilterPanel } from '../../../../../patterns';
import { countActiveFilters, filterSurfaceActions } from '../../../../runtime/helpers';
import type { AuditSurfaceConfig, AuditEntry } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface AuditSurfaceProps {
  config: AuditSurfaceConfig;
  loading?: boolean;
}

export function AuditSurface({
  config,
  loading = false,
}: AuditSurfaceProps): React.ReactElement {
  const isCompact = config.visual.density === 'compact';
  // Active filter count drives the badge in the filter panel header,
  // giving users a quick signal about how many constraints are applied.
  const activeFilterCount = countActiveFilters(config.behavior.filterValues);

  // Export buttons are rendered only when the app provides an export handler.
  // All three formats are always offered -- the app decides which to support
  // and can no-op unsupported formats in its callback.
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

  // Translate surface column config into the PatternDataTable ColumnDef contract.
  // The surface uses `label` while ColumnDef expects `header`; the mapping keeps
  // the surface API domain-friendly without leaking DataTable internals.
  const tableColumns = config.behavior.columns.map((col) => ({
    key: col.key,
    header: col.label,
    accessorKey: col.key as keyof AuditEntry & string,
    width: col.width,
    sortable: col.sortable,
    render: col.render
      ? (value: unknown, row: AuditEntry) => col.render!(value, row)
      : undefined,
  }));

  return (
    <PageShellSurface
      chrome={config.presentation.chrome}
      actions={actionsNode}
      loading={loading}
    >
      <Stack
        className="ds-surface ds-audit"
        data-part="root"
        {...densityScopeAttributes(
          config.visual.density === 'compact' ? 'compact' : 'comfortable'
        )}
        data-loading={loading ? 'true' : 'false'}
        spacing="lg"
      >
        {config.behavior.filters.length > 0 && (
          <Card variant="outlined">
            <Card.Body>
              <PatternFilterPanel
                filters={config.behavior.filters}
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
                <PatternDataTable<AuditEntry>
                  data={config.behavior.entries}
                  columns={tableColumns}
                  rowKey="id"
                  pagination={config.behavior.pagination}
                  compact={isCompact}
                  striped={false}
                  hoverable={true}
                />
              </Box>
            </Card.Body>
          </Card>
        )}

        {config.behavior.pagination && (
          <Flex justify="end">
            <Text
              className="ds-audit__muted-text"
              style={{ fontSize: 12 }}
            >
              Page {config.behavior.pagination.current} - {config.behavior.pagination.total} total entries
            </Text>
          </Flex>
        )}
      </Stack>
    </PageShellSurface>
  );
}
