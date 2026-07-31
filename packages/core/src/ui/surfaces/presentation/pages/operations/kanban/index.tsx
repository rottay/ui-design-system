'use client';

/**
 * @fileoverview KanbanSurface -- full-page kanban board with filters.
 * @description Wraps PatternKanbanBoard inside PageShellSurface. The surface owns
 * page chrome, filter panel, action bar, and the state kits (mirror skeleton,
 * empty, error with retry); the pattern owns column/card rendering and
 * drag-and-drop mechanics (pointer DnD + FLIP) — the surface never duplicates
 * them.
 *
 * @remarks
 * The page chrome (title + toolbar actions) stays live through the load: the
 * surface owns the mirror skeleton, so the shell's loading early-return is
 * intentionally not engaged (scheduler/operational precedent).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Flex, Stack, Text } from '../../../../../primitives';
import { PatternKanbanBoard, PatternFilterPanel } from '../../../../../patterns';
import type { KanbanColumnDef } from '../../../../../patterns';
import type { KanbanSurfaceConfig, KanbanSurfaceCard } from '../../../../foundation/contracts';
import { countActiveFilters } from '../../../../runtime/helpers';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../../runtime/helpers/states';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import { FadeIn, StaggerChildren } from '@/graphics/motion';

/** Loading placeholder that mirrors the board's geometry: a row of columns
 *  (header strip + card blocks) at the same count the real board will paint,
 *  so the swap to live content is paint-only, never a layout shift. The
 *  filter panel is NOT mirrored — it stays live during the load. Geometry
 *  hooks are `data-part`s; the pulse and block chrome live in the
 *  KanbanSurface skin. */
function KanbanSkeleton({
  columnCount,
}: {
  columnCount: number;
}): React.ReactElement {
  // The real board scrolls horizontally past the viewport, so the mirror caps
  // at four columns: enough to read as "a board" without squeezing the row.
  const skeletonColumns = Array.from(
    { length: Math.max(1, Math.min(columnCount, 4)) },
    (_, index) => index
  );

  return (
    <Box data-part="kanban-skeleton-board">
      {skeletonColumns.map((columnIndex) => (
        <Box key={`kanban-skeleton-column-${columnIndex}`} data-part="kanban-skeleton-column">
          <Box data-part="kanban-skeleton-block" data-size="header" />
          <Box data-part="kanban-skeleton-block" data-size="card" />
          <Box data-part="kanban-skeleton-block" data-size="card" />
          <Box data-part="kanban-skeleton-block" data-size="card" />
        </Box>
      ))}
    </Box>
  );
}

export interface KanbanSurfaceProps {
  config: KanbanSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function KanbanSurface({
  config,
  loading = false,
  error,
  onRetry,
}: KanbanSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { tSurfaceOr } = useSurfaceTranslations();
  const { isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout();
  // Visual defaults cascade: explicit surface config -> product profile ->
  // DS defaults (spacing scale, card material, motion intensity).
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const cardVariant = profileDefaults.cardVariant;
  const resolvedMobile = isMobile && hasResolvedViewport;
  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };
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

  // Error state renders full page chrome so header actions stay available
  // even when the data load failed (report/scheduler precedent).
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  // First paint with no items gets the mirror skeleton; a refetch with items
  // keeps them painted (stale-while-revalidate) under aria-busy.
  const isInitialLoad = loading && !hasItems;

  const kanbanContent = (
    <Stack
      className="ds-surface ds-kanban"
      data-part="root"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      data-has-items={hasItems ? 'true' : 'false'}
      data-has-filters={
        config.behavior.filters && config.behavior.filters.length > 0 ? 'true' : 'false'
      }
      aria-busy={loading || undefined}
      spacing={sectionSpacing}
    >
      {config.behavior.filters && config.behavior.filters.length > 0 && (
        <Card className="ds-kanban__filters" variant={cardVariant}>
          <Card.Body>
            <PatternFilterPanel
              filters={config.behavior.filters}
              values={config.behavior.filterValues ?? {}}
              onChange={(values) => config.behavior.onFilterChange?.(values)}
              activeCount={activeFilterCount}
              title={tSurfaceOr('kanban.filters_title', 'Filters')}
              layout={resolvedMobile ? 'stacked' : 'inline'}
            />
          </Card.Body>
        </Card>
      )}

      {isInitialLoad ? (
        /* Mirror skeleton: the page chrome and the filter panel stay live and
           the swap is paint-only. The page-shell loading early-return is NOT
           used here because it would drop the surface's own shape
           (operational/scheduler precedent). */
        <KanbanSkeleton columnCount={resolvedMobile ? mobilePageSize : boardColumns.length} />
      ) : !hasItems ? (
        <Card className="ds-kanban__empty-state" variant={cardVariant}>
          <Card.Body>
            {config.presentation.emptyState ?? (
              <SurfaceEmptyState
                title={tSurfaceOr('kanban.empty_title', 'No items')}
                description={tSurfaceOr(
                  'kanban.empty_description',
                  'There are no items on the board yet.'
                )}
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
            /* Lane paging is a named control group: prev/range/next read as
               one widget, and the range announcement rides a polite live
               region (pinned anatomy). */
            <Flex
              data-part="mobile-lane-navigation"
              role="group"
              aria-label={tSurfaceOr('kanban.lanes_nav_aria', 'Kanban lanes')}
              align="center"
              justify="between"
              wrap="wrap"
            >
              <Button
                variant="secondary"
                disabled={mobilePage === 0}
                aria-label={tSurfaceOr('kanban.previous_lanes', 'Previous kanban lanes')}
                onClick={() => setMobilePage((current) => Math.max(0, current - 1))}
              >
                {tSurfaceOr('kanban.previous', 'Previous')}
              </Button>
              <span role="status" aria-live="polite">
                <Text>
                  {tSurfaceOr('kanban.lane_range', 'Lanes {start}–{end} of {total}', {
                    start: mobilePage * mobilePageSize + 1,
                    end: Math.min((mobilePage + 1) * mobilePageSize, boardColumns.length),
                    total: boardColumns.length,
                  })}
                </Text>
              </span>
              <Button
                variant="secondary"
                disabled={mobilePage >= mobilePageCount - 1}
                aria-label={tSurfaceOr('kanban.next_lanes', 'Next kanban lanes')}
                onClick={() =>
                  setMobilePage((current) => Math.min(mobilePageCount - 1, current + 1))
                }
              >
                {tSurfaceOr('kanban.next', 'Next')}
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
  );

  return (
    /* The page chrome (title + toolbar actions) stays live through the load:
       the surface owns the mirror skeleton, so the shell's loading
       early-return is intentionally not engaged. */
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>
          <StaggerChildren staggerDelayMs={profileDefaults.staggerDelay}>
            {kanbanContent}
          </StaggerChildren>
        </FadeIn>
      ) : (
        kanbanContent
      )}
    </PageShellSurface>
  );
}
