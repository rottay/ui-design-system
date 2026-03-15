'use client';

/**
 * KanbanSurface
 *
 * Full-page kanban board surface wrapping PatternKanbanBoard inside
 * PageShellSurface. The surface owns the page chrome, filter panel, and action
 * bar while delegating board rendering to the underlying pattern.
 */

import React from 'react';
import { Card, Stack } from '../../primitives';
import { PatternKanbanBoard, PatternFilterPanel } from '../../patterns';
import type { KanbanSurfaceConfig, KanbanSurfaceCard } from '../types';
import { countActiveFilters } from '../helpers';
import { PageShellSurface } from '../page-shell';
import { SurfaceActionBar } from '../shared';
import { SurfaceEmptyState } from '../states';

export interface KanbanSurfaceProps {
  config: KanbanSurfaceConfig;
  loading?: boolean;
}

export function KanbanSurface({
  config,
  loading = false,
}: KanbanSurfaceProps): React.ReactElement {
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />;
  const activeFilterCount = countActiveFilters(config.behavior.filterValues);

  const boardColumns = config.behavior.columns.map((col) => ({
    id: col.id,
    title: col.title,
    items: col.items,
    limit: col.limit,
    color: col.color,
  }));

  const hasItems = boardColumns.some((col) => col.items.length > 0);

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={actionsNode}
      loading={loading}
    >
      <Stack spacing="lg">
        {config.behavior.filters && config.behavior.filters.length > 0 && (
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

        {!hasItems && !loading ? (
          <Card variant="outlined">
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
            columns={boardColumns as any}
            renderCard={(card: KanbanSurfaceCard, columnId: string) =>
              config.presentation.renderCard
                ? config.presentation.renderCard(card, columnId)
                : card.title
            }
            renderColumnHeader={
              config.presentation.renderColumnHeader
                ? (col: any, count: number) => config.presentation.renderColumnHeader!(col, count)
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
