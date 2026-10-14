import React from 'react';
import type { PaginationConfig } from '../../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { useFormatter } from '@/infrastructure/runtime/i18n';
import { useSurfaceTranslations } from '../../../../../../../structures/foundation/chrome/runtime/i18n';
import { Box } from '../../../../../../../primitives/layout/box';
import { Text } from '../../../../../../../primitives/display/typography';
import { Button } from '../../../../../../../primitives/inputs/button';
import { Select } from '../../../../../../../primitives/inputs/select';

export function CollectionPaginationFooter({
  pagination,
}: {
  pagination?: PaginationConfig | false;
}): React.ReactElement | null {
  const { tSurfaceOr } = useSurfaceTranslations();
  const format = useFormatter();
  if (!pagination) return null;

  const pageSize = Math.max(1, pagination.pageSize);
  const total = Math.max(0, pagination.total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, pagination.current), totalPages);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);
  const pageSizeOptions = pagination.pageSizeOptions?.length
    ? pagination.pageSizeOptions
    : [pageSize];
  const canGoBack = current > 1;
  const canGoForward = current < totalPages;

  return (
    <Box
      className="ds-surface ds-collection-render-dispatch ds-collection-render-dispatch__pagination"
      data-part="pagination"
    >
      <Text
        className="ds-collection-render-dispatch__muted-text"
        size="sm"
      >
        {total === 0
          ? tSurfaceOr('collection_workspace.results_zero', '0 results')
          : tSurfaceOr('collection_workspace.range_of', '{start}-{end} of {total}', {
              start: format.number(start),
              end: format.number(end),
              total: format.number(total),
            })}
      </Text>

      <Box
        className="ds-collection-render-dispatch__pagination-controls"
        data-part="pagination-controls"
      >
        <Button
          variant="default"
          size="sm"
          className="ds-collection-render-dispatch__pagination-prev"
          data-disabled={canGoBack ? 'false' : 'true'}
          disabled={!canGoBack}
          onClick={() => pagination.onChange(current - 1, pageSize)}
          aria-label={tSurfaceOr('collection_workspace.pagination_prev_aria', 'Go to previous page')}
        >
          {tSurfaceOr('collection_workspace.pagination_previous', 'Previous')}
        </Button>
        <Text
          className="ds-collection-render-dispatch__muted-text"
          size="sm"
        >
          {tSurfaceOr('collection_workspace.page_of', 'Page {current} of {total}', {
            current,
            total: totalPages,
          })}
        </Text>
        <Button
          variant="default"
          size="sm"
          className="ds-collection-render-dispatch__pagination-next"
          data-disabled={canGoForward ? 'false' : 'true'}
          disabled={!canGoForward}
          onClick={() => pagination.onChange(current + 1, pageSize)}
          aria-label={tSurfaceOr('collection_workspace.pagination_next_aria', 'Go to next page')}
        >
          {tSurfaceOr('collection_workspace.pagination_next', 'Next')}
        </Button>
      </Box>

      {pageSizeOptions.length > 1 ? (
        <Box
          as="label"
          className="ds-collection-render-dispatch__page-size"
          data-part="page-size"
        >
          {tSurfaceOr('collection_workspace.rows_unit', 'Rows')}
          <Select
            size="sm"
            className="ds-collection-render-dispatch__page-size-select"
            aria-label={tSurfaceOr('collection_workspace.rows_per_page', 'Rows per page')}
            value={pageSize}
            options={pageSizeOptions.map((option) => ({
              value: option,
              label: String(option),
            }))}
            onChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              const parsed = Number(next);
              if (Number.isFinite(parsed) && parsed > 0) pagination.onChange(1, parsed);
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
}

export function CardsIncrementalFooter({
  pagination,
  visibleCount,
}: {
  pagination: PaginationConfig;
  visibleCount: number;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();
  const format = useFormatter();
  const sentinelRef = React.useRef<HTMLElement | null>(null);
  const loadingRef = React.useRef(false);
  const pageSize = Math.max(1, pagination.pageSize);
  const total = Math.max(0, pagination.total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, pagination.current), totalPages);
  const visible = Math.min(Math.max(0, visibleCount), total);
  const canLoadMore = visible < total && current < totalPages;

  const loadMore = React.useCallback(() => {
    if (!canLoadMore || loadingRef.current) return;
    loadingRef.current = true;
    pagination.onChange(current + 1, pageSize);
    window.setTimeout(() => {
      loadingRef.current = false;
    }, 220);
  }, [canLoadMore, current, pageSize, pagination]);

  React.useEffect(() => {
    loadingRef.current = false;
  }, [current, visible]);

  React.useEffect(() => {
    if (!canLoadMore) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: '420px 0px 420px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, loadMore]);

  return (
    <Box
      className="ds-surface ds-collection-render-dispatch ds-collection-render-dispatch__incremental-footer"
      data-part="incremental-footer"
      data-can-load-more={canLoadMore ? 'true' : 'false'}
      ref={sentinelRef}
    >
      <Text
        className="ds-collection-render-dispatch__incremental-count"
        size="xs"
      >
        {total === 0
          ? tSurfaceOr('collection_workspace.results_zero', '0 results')
          : tSurfaceOr('collection_workspace.cards_showing', 'Showing 1-{visible} of {total}', {
              visible: format.number(visible),
              total: format.number(total),
            })}
      </Text>
      {canLoadMore ? (
        <Button
          variant="default"
          size="sm"
          className="ds-collection-render-dispatch__load-more"
          onClick={loadMore}
        >
          {tSurfaceOr('collection_workspace.load_more', 'Load more')}
        </Button>
      ) : (
        <Text
          className="ds-collection-render-dispatch__incremental-end"
          size="xs"
        >
          {tSurfaceOr('collection_workspace.end_of_cards', 'End of cards')}
        </Text>
      )}
    </Box>
  );
}
