'use client';

/**
 * @fileoverview KanbanSurface -- full-page kanban board with filters.
 * @description Wraps PatternKanbanBoard inside PageShellSurface. The surface owns
 * page chrome, filter panel, and action bar; the pattern owns column/card rendering
 * and drag-and-drop mechanics.
 */

import React from 'react';
import { Card, Stack } from '../../../../primitives';
import { PatternKanbanBoard, PatternFilterPanel } from '../../../../patterns';
import type { KanbanColumnDef } from '../../../../patterns';
import type { KanbanSurfaceConfig, KanbanSurfaceCard } from '../../../foundation/types';
import { countActiveFilters } from '../../../foundation/helpers';
import { PageShellSurface } from '../../../layout/page-shell';
import { SurfaceActionBar } from '../../../foundation/shared';
import { SurfaceEmptyState } from '../../../foundation/states';

export interface KanbanSurfaceProps {
  config: KanbanSurfaceConfig;
  loading?: boolean;
}

export function KanbanSurface({
  config,
  loading = false,
}: KanbanSurfaceProps): React.ReactElement {
  // Actions render outside the board so they remain accessible even when
  // the board is empty -- this matches the list surface's action placement.
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />;
  // Active filter count drives the badge on the filter toggle, giving users
  // a quick signal of how many constraints are applied.
  const activeFilterCount = countActiveFilters(config.behavior.filterValues);

  // Strip internal-only fields before passing to the pattern. The pattern's
  // column type expects a leaner shape than what the surface config carries.
  const boardColumns: KanbanColumnDef<KanbanSurfaceCard>[] = config.behavior.columns.map((col) => ({
    id: col.id,
    title: col.title as string,
    items: col.items,
    color: col.color,
    limit: col.limit,
  }));

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
          <PatternKanbanBoard
            columns={boardColumns}
            // Falls back to just the card title when no custom renderer is provided,
            // keeping the board functional without presentation configuration.
            renderCard={(card: KanbanSurfaceCard, columnId: string) =>
              config.presentation.renderCard
                ? config.presentation.renderCard(card, columnId)
                : card.title
            }
            renderColumnHeader={
              config.presentation.renderColumnHeader
                ? (col: KanbanColumnDef<KanbanSurfaceCard>, count: number) => config.presentation.renderColumnHeader!(col, count)
                : undefined
            }
            onItemMove={(itemId: string, from: string, to: string, pos: number) =>
              config.behavior.onCardMove?.(itemId, from, to, pos)
            }
            onItemClick={
              config.behavior.onCardClick
                ? (card: KanbanSurfaceCard, columnId: string) => config.behavior.onCardClick!(card, columnId)
                : undefined
            }
            onAddItem={config.behavior.onCardCreate}
            itemKey={(card: KanbanSurfaceCard) => card.id}
            columnGap={config.visual.columnGap}
            columnMinWidth={config.visual.columnMinWidth}
          />
        )}
      </Stack>
    </PageShellSurface>
  );
}
