'use client';

/**
 * AuditSurface
 *
 * Config-driven audit log viewer for compliance frameworks (HIPAA, SOC2, GDPR).
 * Renders a filterable, exportable audit trail with severity indicators and
 * customizable entry rendering. The surface owns the table mechanics and filter
 * layout while the app owns the data fetching and domain-specific renderers.
 *
 * Composition: PageShellSurface chrome + PatternFilterPanel + PatternDataTable
 * + shared state kits (loading skeleton, empty, error with retry). Visible
 * copy resolves through `tSurfaceOr` under `surfaces.audit.*` with an English
 * floor, and visual defaults cascade config -> product profile -> DS defaults
 * via `useSurfaceProfileDefaultsWithOverrides`.
 */

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { FadeIn } from '@/graphics/motion';
import { ContentCodeIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-code';
import { ContentDocumentIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-document';
import { ContentFileIcon } from '@/graphics/icons/presentation/semantic/generated/roles/content-file';
import React from 'react';
import { Button, Card, Flex, Stack, Text } from '../../../../../primitives';
import { PatternDataTable, PatternFilterPanel } from '../../../../../patterns';
import { countActiveFilters } from '../../../../runtime/helpers';
import type { AuditSurfaceConfig, AuditEntry } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';

/**
 * Export formats the contract callback supports. Kept in surface vocabulary:
 * the app owns the export side effect (compliance exports are typically
 * generated server-side), so the surface only labels and forwards the format.
 */
const EXPORT_FORMATS = ['csv', 'json', 'pdf'] as const;
type AuditExportFormat = (typeof EXPORT_FORMATS)[number];

/**
 * Governed semantic roles per format (decorative; the label carries the
 * meaning). Module-level like the ExportButton structure's FORMAT_META so the
 * map stays render-context free.
 */
const EXPORT_FORMAT_ICONS: Record<AuditExportFormat, React.ReactNode> = {
  csv: <ContentDocumentIcon decorative size={15} />,
  json: <ContentCodeIcon decorative size={15} />,
  pdf: <ContentFileIcon decorative size={15} />,
};

export interface AuditSurfaceProps {
  config: AuditSurfaceConfig;
  loading?: boolean;
  /** Load/render failure surfaced as an error state (ListSurface prop precedent). */
  error?: unknown;
  /** Retry handler rendered inside the error state when provided. */
  onRetry?: () => void | Promise<void>;
}

export function AuditSurface({
  config,
  loading = false,
  error,
  onRetry,
}: AuditSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { tSurfaceOr } = useSurfaceTranslations();
  const { isMobile } = useBreakpoints();
  const isCompact = config.visual.density === 'compact';
  // Active filter count drives the badge in the filter panel header,
  // giving users a quick signal about how many constraints are applied.
  const activeFilterCount = countActiveFilters(config.behavior.filterValues);

  // Export buttons are rendered only when the app provides an export handler.
  // All three formats are always offered -- the app decides which to support
  // and can no-op unsupported formats in its callback. The cluster is a
  // labeled group so assistive tech announces the action family, and each
  // button carries a full aria-label ("CSV" alone is not an action name).
  const exportActions = config.behavior.onExport ? (
    <Flex
      gap={8}
      wrap="wrap"
      role="group"
      aria-label={tSurfaceOr('audit.export_group_aria', 'Export audit log')}
    >
      {EXPORT_FORMATS.map((format) => {
        const formatLabel = format.toUpperCase();
        return (
          <Button
            key={format}
            variant="secondary"
            size="sm"
            icon={EXPORT_FORMAT_ICONS[format]}
            aria-label={tSurfaceOr('audit.export_format_aria', 'Export as {format}', {
              format: formatLabel,
            })}
            onClick={() => config.behavior.onExport?.(format)}
          >
            {formatLabel}
          </Button>
        );
      })}
    </Flex>
  ) : null;

  const actionsNode = exportActions ? (
    <Flex gap={8} wrap="wrap" justify="end">
      {exportActions}
    </Flex>
  ) : undefined;

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

  // Error short-circuits the whole body: the shell keeps the page chrome and
  // actions so retry never loses context (ListSurface precedent).
  if (error) {
    return (
      <PageShellSurface
        chrome={config.presentation.chrome}
        actions={actionsNode}
        loading={false}
      >
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const auditContent = (
    <Stack
      className="ds-surface ds-audit"
      data-part="root"
      data-view="table"
      data-mobile={isMobile ? 'true' : 'false'}
      {...densityScopeAttributes(
        config.visual.density === 'compact' ? 'compact' : 'comfortable'
      )}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading}
      spacing={resolveStackSpacing(profileDefaults.sectionSpacing)}
    >
      {config.behavior.filters.length > 0 && (
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <PatternFilterPanel
              filters={config.behavior.filters}
              values={config.behavior.filterValues ?? {}}
              onChange={(values) => config.behavior.onFilterChange?.(values)}
              activeCount={activeFilterCount}
              title={
                isMobile || config.behavior.filters.length > 1
                  ? tSurfaceOr('audit.filters_title', 'Filters')
                  : undefined
              }
              layout={isMobile ? 'stacked' : 'inline'}
            />
          </Card.Body>
        </Card>
      )}

      {/*
        Loading keeps the real page chrome and renders a structural body
        skeleton (the shared kit approximates a data table) instead of the
        shell's whole-page placeholder: PatternPageShell's `loading` early
        return never renders children, so a table-shaped body skeleton can
        only exist here. Row count scales with density to mirror the final
        table footprint and avoid layout shift.
      */}
      {loading ? (
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <SurfaceLoadingSkeleton rows={isCompact ? 10 : 6} />
          </Card.Body>
        </Card>
      ) : config.behavior.entries.length === 0 ? (
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <SurfaceEmptyState
              title={tSurfaceOr('audit.empty_title', 'No audit entries')}
              description={tSurfaceOr(
                'audit.empty_description',
                'There are no audit log entries matching the current filters.'
              )}
            />
          </Card.Body>
        </Card>
      ) : (
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            {/*
              The bounded scroll region is the pattern's own (`maxHeight` prop
              -> `data-part="scroll"` + `data-bounded`), so the surface carries
              no inline geometry. A bounded trail keeps its header sticky so
              column context survives the scroll.
            */}
            <PatternDataTable<AuditEntry>
              data={config.behavior.entries}
              columns={tableColumns}
              rowKey="id"
              pagination={config.behavior.pagination}
              compact={isCompact}
              striped={false}
              hoverable={true}
              stickyHeader={config.visual.maxHeight ? true : undefined}
              maxHeight={config.visual.maxHeight}
            />
          </Card.Body>
        </Card>
      )}

      {!loading && config.behavior.pagination && (
        <Flex justify="end">
          {/*
            Typography rides the primitive's scale/color channels (`xs` +
            `muted`); the class is the pinned anatomy hook the skin uses for
            the numeric rhythm (tabular figures).
          */}
          <Text size="xs" color="muted" className="ds-audit__muted-text">
            {tSurfaceOr(
              'audit.pagination_summary',
              'Page {current} · Total entries: {total}',
              {
                current: config.behavior.pagination.current,
                total: config.behavior.pagination.total,
              }
            )}
          </Text>
        </Flex>
      )}
    </Stack>
  );

  return (
    <PageShellSurface
      chrome={config.presentation.chrome}
      actions={actionsNode}
      loading={false}
    >
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>{auditContent}</FadeIn>
      ) : (
        auditContent
      )}
    </PageShellSurface>
  );
}
