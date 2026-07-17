'use client';

/**
 * @fileoverview KanbanSurface -- full-page kanban board with filters.
 * @description Wraps PatternKanbanBoard inside PageShellSurface. The surface owns
 * page chrome, filter panel, and action bar; the pattern owns column/card rendering
 * and drag-and-drop mechanics.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Flex, Stack, Text } from '../../../../../primitives';
import { PatternKanbanBoard, PatternFilterPanel } from '../../../../../patterns';
import type { KanbanColumnDef } from '../../../../../patterns';
import type { KanbanSurfaceConfig, KanbanSurfaceCard } from '../../../../foundation/contracts';
import { countActiveFilters } from '../../../../runtime/helpers';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';

export interface KanbanSurfaceProps {
  config: KanbanSurfaceConfig;
  loading?: boolean;
}

export function KanbanSurface({
  config,
  loading = false,
}: KanbanSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const { isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout();
  const resolvedMobile = isMobile && hasResolvedViewport;
  // Actions render outside the board so they remain accessible even when
  // the board is empty -- this matches the list surface's action placement.
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} access={config.access} />;
  // Active filter count drives the badge on the filter toggle, giving users
  // a quick signal of how many constraints are applied.
  const activeFilterCount = countActiveFilters(config.behavior.filterValues);

  // Strip internal-only fields before passing to the pattern. The pattern's
  // column type expects a leaner shape than what the surface config carries.
  const boardColumns: KanbanColumnDef<KanbanSurfaceCard>[] = useMemo(
    () =>
      config.behavior.columns.map((col) => ({
        id: col.id,
        title: col.title as string,
        items: col.items,
        color: col.color,
        limit: col.limit,
      })),
    [config.behavior.columns]
  );
  const requestedMobileColumns = Math.max(
    1,
    Math.floor(config.visual.mobileColumnsLimit ?? (boardColumns.length || 1))
  );
  const mobilePageSize = resolvedMobile
    ? Math.min(requestedMobileColumns, Math.max(boardColumns.length, 1))
    : Math.max(boardColumns.length, 1);
  const mobilePageCount = Math.max(1, Math.ceil(boardColumns.length / mobilePageSize));
  const [mobilePage, setMobilePage] = useState(0);

  useEffect(() => {
    setMobilePage((current) => Math.min(current, mobilePageCount - 1));
  }, [mobilePageCount]);

  const visibleBoardColumns = resolvedMobile
    ? boardColumns.slice(mobilePage * mobilePageSize, (mobilePage + 1) * mobilePageSize)
    : boardColumns;
  const stackMobileColumns = resolvedMobile && config.visual.stackColumnsOnMobile === true;

  // Empty state checks both items AND loading: showing "no items" while data
  // is still loading would flash a misleading empty screen.
  const hasItems = boardColumns.some((col) => col.items.length > 0);

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={actionsNode}
      loading={loading}
    >
      <Stack
        className="ds-surface ds-kanban"
        data-part="root"
        data-loading={loading ? 'true' : 'false'}
        data-has-items={hasItems ? 'true' : 'false'}
        data-has-filters={config.behavior.filters && config.behavior.filters.length > 0 ? 'true' : 'false'}
        spacing="lg"
      >
        {config.behavior.filters && config.behavior.filters.length > 0 && (
          <Card className="ds-kanban__filters" variant="outlined">
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

        {!hasItems && !loading ? (
          <Card className="ds-kanban__empty-state" variant="outlined">
            <Card.Body>
              {config.presentation.emptyState ?? (
                <SurfaceEmptyState
                  title="No items"
                  description="There are no items on the board yet."
                />
              )}
            </Card.Body>
          </Card>
        ) : (
          <div
            className="ds-kanban__board"
            data-part="responsive-board"
            data-mobile-stack={stackMobileColumns ? 'true' : 'false'}
            data-mobile-page-size={resolvedMobile ? mobilePageSize : undefined}
          >
            {resolvedMobile && mobilePageCount > 1 && (
              <Flex
                data-part="mobile-lane-navigation"
                align="center"
                justify="between"
                wrap="wrap"
                style={{ gap: 'var(--ds-space-sm)', marginBottom: 'var(--ds-space-sm)' }}
              >
                <Button
                  variant="secondary"
                  disabled={mobilePage === 0}
                  aria-label={tSurface('kanban.previous_lanes')}
                  onClick={() => setMobilePage((current) => Math.max(0, current - 1))}
                >
                  {tSurface('kanban.previous')}
                </Button>
                <span role="status" aria-live="polite">
                  <Text>
                    {tSurface('kanban.lane_range', {
                      start: mobilePage * mobilePageSize + 1,
                      end: Math.min((mobilePage + 1) * mobilePageSize, boardColumns.length),
                      total: boardColumns.length,
                    })}
                  </Text>
                </span>
                <Button
                  variant="secondary"
                  disabled={mobilePage >= mobilePageCount - 1}
                  aria-label={tSurface('kanban.next_lanes')}
                  onClick={() =>
                    setMobilePage((current) => Math.min(mobilePageCount - 1, current + 1))
                  }
                >
                  {tSurface('kanban.next')}
                </Button>
              </Flex>
            )}

            <PatternKanbanBoard
              columns={visibleBoardColumns}
              // Falls back to just the card title when no custom renderer is provided,
              // keeping the board functional without presentation configuration.
              renderCard={(card: KanbanSurfaceCard, columnId: string) =>
                config.presentation.renderCard
                  ? config.presentation.renderCard(card, columnId)
                  : card.title
              }
              renderColumnHeader={
                config.presentation.renderColumnHeader
                  ? (col: KanbanColumnDef<KanbanSurfaceCard>, count: number) =>
                      config.presentation.renderColumnHeader!(col, count)
                  : undefined
              }
              onItemMove={(itemId: string, from: string, to: string, pos: number) =>
                config.behavior.onCardMove?.(itemId, from, to, pos)
              }
              onItemClick={
                config.behavior.onCardClick
                  ? (card: KanbanSurfaceCard, columnId: string) =>
                      config.behavior.onCardClick!(card, columnId)
                  : undefined
              }
              onAddItem={config.behavior.onCardCreate}
              itemKey={(card: KanbanSurfaceCard) => card.id}
              columnGap={config.visual.columnGap}
              columnMinWidth={stackMobileColumns ? 0 : config.visual.columnMinWidth}
            />
          </div>
        )}
      </Stack>
    </PageShellSurface>
  );
}
