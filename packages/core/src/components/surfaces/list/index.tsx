'use client';

/**
 * ListSurface
 *
 * This surface centralizes the mechanics of list pages:
 * - page chrome
 * - filters
 * - table view
 * - card view
 * - row actions
 * - empty/loading states
 *
 * The app still owns the product-specific renderers. That is the whole point:
 * the surface owns mechanics, while the app owns identity.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Flex, Grid, Stack, Text } from '../../primitives';
import { PatternDataTable, PatternFilterPanel } from '../../patterns';
import { FadeIn, StaggerChildren } from '../../../animations';
import {
  countActiveFilters,
  resolveSurfaceAction,
  filterSurfaceActions,
  filterSurfaceColumns,
  mapSurfaceData,
  resolveColumnValue,
  resolveSurfaceButtonVariant,
  stringifySurfaceValue,
} from '../helpers';
import type { EntityAdapter, ListSurfaceConfig, ListSurfaceView, SurfaceAction } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceTranslations } from '../i18n';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../personality-helpers';
import { SurfaceEmptyState, SurfaceErrorState } from '../states';

function renderActionButton<TView>(
  action: SurfaceAction<TView>,
  item: TView,
  options?: { size?: 'sm' | 'md' | 'lg'; stopPropagation?: boolean }
): React.ReactElement {
  return (
    <Button
      key={action.id}
      /**
       * Surface actions intentionally use the surface vocabulary. We normalize
       * that into the exact primitive button contract here so page configs stay
       * expressive without weakening the DS types.
       */
      variant={resolveSurfaceButtonVariant(action.variant)}
      size={options?.size ?? 'sm'}
      disabled={action.disabled}
      loading={action.loading}
      onClick={(event) => {
        if (options?.stopPropagation) {
          event.stopPropagation();
        }

        action.onClick?.(item);
      }}
    >
      {action.icon}
      <Text style={{ marginLeft: action.icon ? 8 : 0 }}>{action.label}</Text>
    </Button>
  );
}

function buildSurfaceCellRenderer<TView>(
  config: ListSurfaceConfig<TView>,
  columnKey: string,
  fieldId: string,
  value: unknown,
  item: TView,
  index: number,
  defaultRenderer?: (value: unknown, item: TView, index: number) => React.ReactNode
): React.ReactNode {
  const presentationRenderer =
    config.presentation.renderCell?.[fieldId] ?? config.presentation.renderCell?.[columnKey];

  if (presentationRenderer) {
    return presentationRenderer(value, item, index);
  }

  if (defaultRenderer) {
    return defaultRenderer(value, item, index);
  }

  return stringifySurfaceValue(value);
}

function DefaultCardView<TView>({
  items,
  config,
  columns,
  rowActions,
  cardMinWidth,
  cardVariant,
  animateEntrance,
  staggerDelay,
  entranceDuration,
}: {
  items: TView[];
  config: ListSurfaceConfig<TView>;
  columns: ReturnType<typeof filterSurfaceColumns<TView>>;
  rowActions: SurfaceAction<TView>[];
  cardMinWidth: number;
  cardVariant: 'outlined' | 'elevated' | 'filled' | 'ghost';
  animateEntrance: boolean;
  staggerDelay: number;
  entranceDuration: number;
}): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();

  if (items.length === 0) {
    return (
      <Card variant={cardVariant}>
        <Card.Body>
          {config.presentation.emptyState ?? (
            <SurfaceEmptyState
              title={tSurface('list.empty_title')}
              description={tSurface('list.empty_description')}
            />
          )}
        </Card.Body>
      </Card>
    );
  }

  const gridContent = (
    <Grid templateColumns={`repeat(auto-fit, minmax(${cardMinWidth}px, 1fr))`} gap="lg">
      {items.map((item, index) => {
        const customCard = config.presentation.renderCard?.(item, index);

        if (customCard) {
          return (
            <Box key={index}>
              {customCard}
            </Box>
          );
        }

        return (
          <Card
            key={index}
            variant={cardVariant}
            hoverable={!!config.behavior.onRowClick}
            clickable={!!config.behavior.onRowClick}
            onClick={() => config.behavior.onRowClick?.(item, index)}
          >
            <Card.Body>
              <Stack spacing="md">
                {columns
                  .filter((column) => !column.hideInCards)
                  .map((column) => {
                    const columnValue = resolveColumnValue(column, item);

                    return (
                      <Box key={column.key}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--ds-color-text-muted)',
                            marginBottom: 4,
                          }}
                        >
                          {column.header}
                        </Text>
                        <Text style={{ color: 'var(--ds-color-text-primary)' }}>
                          {buildSurfaceCellRenderer(
                            config,
                            column.key,
                            column.fieldId,
                            columnValue,
                            item,
                            index,
                            column.render
                          )}
                        </Text>
                      </Box>
                    );
                  })}

                {rowActions.length > 0 && (
                  <Box onClick={(event) => event.stopPropagation()}>
                    <Flex gap={8} wrap="wrap">
                    {rowActions.map((action) => renderActionButton(action, item, { stopPropagation: true }))}
                    </Flex>
                  </Box>
                )}
              </Stack>
            </Card.Body>
          </Card>
        );
      })}
    </Grid>
  );

  if (animateEntrance) {
    return (
      <StaggerChildren staggerDelay={staggerDelay} duration={entranceDuration}>
        {gridContent}
      </StaggerChildren>
    );
  }

  return gridContent;
}

export interface ListSurfaceProps<TRaw, TView> {
  data: TRaw[];
  adapter: EntityAdapter<TRaw, TView>;
  config: ListSurfaceConfig<TView>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function ListSurface<TRaw, TView>({
  data,
  adapter,
  config,
  loading = false,
  error,
  onRetry,
}: ListSurfaceProps<TRaw, TView>): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const { tSurface } = useSurfaceTranslations();
  const resolvedDefaultView = config.visual.defaultView ?? profileDefaults.listView;
  const resolvedCompact = config.visual.compact ?? profileDefaults.listCompact;
  const resolvedCardMinWidth = config.visual.cardMinWidth ?? profileDefaults.listCardMinWidth;
  const [activeView, setActiveView] = useState<ListSurfaceView>(resolvedDefaultView);

  useEffect(() => {
    /**
     * Product profile defaults are part of the effective surface contract, so
     * when they change we resync the uncontrolled active view as well.
     */
    setActiveView(resolvedDefaultView);
  }, [resolvedDefaultView]);

  const mappedItems = useMemo(() => {
    return mapSurfaceData(data, adapter);
  }, [data, adapter]);

  const permittedColumns = useMemo(() => {
    return filterSurfaceColumns(config.behavior.columns, config.permissions);
  }, [config.behavior.columns, config.permissions]);
  const primaryAction = useMemo(() => {
    return resolveSurfaceAction(config.behavior.primaryAction, config.permissions);
  }, [config.behavior.primaryAction, config.permissions]);

  const rowActions = useMemo(() => {
    return filterSurfaceActions(config.behavior.rowActions, config.permissions);
  }, [config.behavior.rowActions, config.permissions]);

  const activeFilterCount = countActiveFilters(config.behavior.filterValues);

  const headerActions = (
    <Flex gap={8} wrap="wrap" justify="end">
      {config.presentation.toolbarEnd}

      {config.visual.allowViewSwitch !== false && (
        <Flex gap={8}>
          <Button
            variant={resolveSurfaceButtonVariant(activeView === 'table' ? 'primary' : 'secondary')}
            size="sm"
            onClick={() => setActiveView('table')}
          >
            {tSurface('list.view_table')}
          </Button>
          <Button
            variant={resolveSurfaceButtonVariant(activeView === 'cards' ? 'primary' : 'secondary')}
            size="sm"
            onClick={() => setActiveView('cards')}
          >
            {tSurface('list.view_cards')}
          </Button>
        </Flex>
      )}

      {primaryAction && (
        <Button
          variant={resolveSurfaceButtonVariant(primaryAction.variant ?? 'primary')}
          disabled={primaryAction.disabled}
          loading={primaryAction.loading}
          onClick={() => primaryAction.onClick?.(undefined as void)}
        >
          {primaryAction.icon}
          <Text style={{ marginLeft: primaryAction.icon ? 8 : 0 }}>
            {primaryAction.label}
          </Text>
        </Button>
      )}
    </Flex>
  );

  const resolvedSectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);

  if (error) {
    return (
      <PageShellSurface chrome={config.presentation.chrome} actions={headerActions} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const listContent = (
    <Stack spacing={resolvedSectionSpacing}>
      {config.presentation.toolbarStart}

      {config.behavior.filters && config.behavior.filters.length > 0 && (
        <Card variant={profileDefaults.cardVariant}>
          <Card.Body>
            <PatternFilterPanel
              filters={config.behavior.filters}
              values={config.behavior.filterValues ?? {}}
              onChange={(values) => config.behavior.onFilterChange?.(values)}
              onReset={config.behavior.onFilterReset}
              showReset={!!config.behavior.onFilterReset}
              showApply={!!config.behavior.onFilterApply}
              onApply={config.behavior.onFilterApply}
              activeCount={activeFilterCount}
              title={tSurface('list.filters_title')}
              layout="inline"
            />
          </Card.Body>
        </Card>
      )}

      {activeView === 'table' ? (
        <PatternDataTable
          data={mappedItems as Array<Record<string, unknown>>}
          columns={permittedColumns
            .filter((column) => !column.hideInTable)
            .map((column) => ({
              ...column,
              render: (value, item, index) =>
                buildSurfaceCellRenderer(
                  config,
                  column.key,
                  column.fieldId,
                  value,
                  item as TView,
                  index,
                  column.render
                ),
            }))}
          rowKey={config.behavior.rowKey as never}
          sorting={config.behavior.sorting}
          onSortChange={config.behavior.onSortChange}
          pagination={config.behavior.pagination}
          compact={resolvedCompact}
          stickyHeader={config.visual.stickyHeader}
          maxHeight={config.visual.maxHeight}
          onRowClick={config.behavior.onRowClick as never}
          actions={
            rowActions.length > 0
              ? (item: TView) => (
                  <Flex gap={8} justify="end" wrap="wrap">
                    {rowActions.map((action) => renderActionButton(action, item))}
                  </Flex>
                )
              : undefined
          }
          emptyState={
            config.presentation.emptyState ?? (
              <SurfaceEmptyState
                title={tSurface('list.empty_title')}
                description={tSurface('list.empty_description')}
              />
            )
          }
        />
      ) : (
        <DefaultCardView
          items={mappedItems}
          config={config}
          columns={permittedColumns}
          rowActions={rowActions}
          cardMinWidth={resolvedCardMinWidth}
          cardVariant={profileDefaults.cardVariant}
          animateEntrance={profileDefaults.animateEntrance}
          staggerDelay={profileDefaults.staggerDelay}
          entranceDuration={profileDefaults.entranceDuration}
        />
      )}
    </Stack>
  );

  return (
    <PageShellSurface chrome={config.presentation.chrome} actions={headerActions} loading={loading}>
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn duration={profileDefaults.entranceDuration}>
            {listContent}
          </FadeIn>
        ) : (
          listContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
