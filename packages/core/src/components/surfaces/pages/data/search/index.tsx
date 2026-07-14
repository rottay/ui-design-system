'use client';

/**
 * @fileoverview SearchSurface -- dedicated search page with query state and filters.
 * @description Centralizes search page mechanics: query state, optional filter panel,
 * selection, result preview, and consistent empty/initial-state language. Not just a
 * list with an input -- includes debounce, minimum query length, and preview behavior.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, Grid, Input, Stack, Text } from '../../../../primitives';
import { PatternFilterPanel } from '../../../../patterns';
import { filterSurfaceActions } from '../../../foundation/helpers';
import { useSurfaceTranslations } from '../../../foundation/i18n';
import type { SearchSurfaceConfig, SearchSurfaceResult } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../foundation/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../foundation/shared';
import { SurfaceEmptyState } from '../../../foundation/states';

function DefaultSearchResult({
  result,
  selected,
}: {
  result: SearchSurfaceResult;
  selected: boolean;
}): React.ReactElement {
  return (
    <Card
      className={
        selected
          ? 'ds-search__result-card ds-search__result-card--selected'
          : 'ds-search__result-card'
      }
      variant="outlined"
      clickable
      hoverable
      style={{
        '--ds-card-bg-hover': 'var(--ds-search-result-bg-hover, var(--ds-card-bg-hover))',
      } as React.CSSProperties}
    >
      <Card.Body>
        <Stack spacing="sm">
          {result.image && <Box>{result.image}</Box>}
          <Box
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            {result.icon && (
              <Box style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                {result.icon}
              </Box>
            )}
            <Stack spacing="xs">
              <Text
                className="ds-search__result-title"
                data-part="result-title"
                style={{ fontWeight: 700 }}
              >
                {result.title}
              </Text>
              {result.description && (
                <Text
                  className="ds-search__result-meta"
                  data-part="result-meta"
                >
                  {result.description}
                </Text>
              )}
              {result.meta && (
                <Box
                  className="ds-search__result-meta"
                  data-part="result-meta"
                >
                  {result.meta}
                </Box>
              )}
              {result.badge}
            </Stack>
          </Box>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export interface SearchSurfaceProps {
  config: SearchSurfaceConfig;
  loading?: boolean;
}

export function SearchSurface({
  config,
  loading = false,
}: SearchSurfaceProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  // Selection state follows the controlled/uncontrolled pattern. When
  // selectedResultId is provided, the app owns it; otherwise the surface
  // auto-selects the first result for preview.
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(
    config.behavior.selectedResultId ?? config.behavior.results[0]?.id
  );

  // Re-sync on result changes so the preview panel does not go stale when
  // results are re-fetched after a query change.
  useEffect(() => {
    if (config.behavior.selectedResultId !== undefined) {
      setInternalSelectedId(config.behavior.selectedResultId);
    } else if (config.behavior.results.length > 0 && !internalSelectedId) {
      setInternalSelectedId(config.behavior.results[0]?.id);
    }
  }, [config.behavior.results, config.behavior.selectedResultId, internalSelectedId]);

  const selectedId = config.behavior.selectedResultId ?? internalSelectedId;
  const selectedResult = useMemo(() => {
    return config.behavior.results.find((result) => result.id === selectedId);
  }, [config.behavior.results, selectedId]);

  const resultActions = useMemo(() => {
    return filterSurfaceActions(config.behavior.resultActions, config.permissions, selectedResult);
  }, [config.behavior.resultActions, config.permissions, selectedResult]);

  const setSelectedResult = (result: SearchSurfaceResult): void => {
    if (config.behavior.selectedResultId === undefined) {
      setInternalSelectedId(result.id);
    }

    config.behavior.onSelectResult?.(result);
  };

  // Minimum query length prevents firing searches for single-character
  // inputs that would return too many results. The empty query state message
  // adapts its grammar based on the count (singular vs plural).
  const minQueryLength = config.visual.minQueryLength ?? 0;
  const hasEnoughQuery = config.behavior.query.trim().length >= minQueryLength;
  const emptyQueryDescription =
    minQueryLength === 1
      ? tSurface('search.empty_query_description_one', { count: minQueryLength })
      : tSurface('search.empty_query_description_other', { count: minQueryLength });
  // Split layout with preview rail requires both a selected result AND a wide
  // enough viewport. On mobile the preview collapses into the result list.
  const showPreview = config.visual.layout === 'split' && !!selectedResult;
  const splitLayout = showPreview && !shouldStack;
  const resultMinWidth = config.visual.resultMinWidth ?? 280;

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />}
      loading={loading}
    >
      <Stack
        className="ds-surface ds-search"
        data-part="root"
        data-layout={config.visual.layout}
        data-loading={loading ? 'true' : 'false'}
        data-preview={showPreview ? 'true' : 'false'}
        spacing="lg"
      >
        <SurfaceSectionCard>
          <Stack spacing="md">
            <Input.Search
              value={config.behavior.query}
              onChange={(value) => config.behavior.onQueryChange(value)}
              onSearch={(value) => config.behavior.onQuerySubmit?.(value)}
              placeholder={config.presentation.placeholder ?? tSurface('search.placeholder')}
              showSearchButton
            />

            {config.behavior.filters && config.behavior.filters.length > 0 && (
              <PatternFilterPanel
                filters={config.behavior.filters}
                values={config.behavior.filterValues ?? {}}
                onChange={config.behavior.onFilterChange ?? (() => undefined)}
                onReset={config.behavior.onFilterReset ?? (() => undefined)}
                onApply={config.behavior.onFilterApply ?? (() => undefined)}
              />
            )}
          </Stack>
        </SurfaceSectionCard>

        {/* Three-way state: not enough query -> empty query state,
            enough query but no results -> no results state,
            results available -> render the result grid/list.
            Loading state is excluded from all three to avoid flashing
            misleading empty states during fetches. */}
        {!hasEnoughQuery && !loading ? (
          config.presentation.emptyQueryState ?? (
            <Box
              className="ds-search__empty-state"
              data-part="empty-state"
              data-state="query"
            >
              <SurfaceEmptyState
                title={tSurface('search.empty_query_title')}
                description={emptyQueryDescription}
              />
            </Box>
          )
        ) : config.behavior.results.length === 0 && !loading ? (
          config.presentation.emptyResultsState ?? (
            <Box
              className="ds-search__empty-state"
              data-part="empty-state"
              data-state="results"
            >
              <SurfaceEmptyState
                title={tSurface('search.empty_results_title')}
                description={tSurface('search.empty_results_description')}
              />
            </Box>
          )
        ) : (
          <Grid columns={splitLayout ? 12 : 1} gap="lg">
            <Grid.Item span={splitLayout ? 7 : undefined}>
              {config.visual.layout === 'stack' ? (
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(${resultMinWidth}px, 1fr))`,
                    gap: 16,
                  }}
                >
                  {config.behavior.results.map((result, index) => {
                    const selected = result.id === selectedId;
                    const rendered =
                      config.presentation.renderResult?.(result, { index, selected }) ?? (
                        <DefaultSearchResult result={result} selected={selected} />
                      );

                    return (
                      <Box
                        key={result.id}
                        onClick={() => setSelectedResult(result)}
                        style={{ cursor: 'pointer' }}
                      >
                        {rendered}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Stack spacing="md">
                  {config.behavior.results.map((result, index) => {
                    const selected = result.id === selectedId;
                    const rendered =
                      config.presentation.renderResult?.(result, { index, selected }) ?? (
                        <DefaultSearchResult result={result} selected={selected} />
                      );

                    return (
                      <Box
                        key={result.id}
                        onClick={() => setSelectedResult(result)}
                        style={{ cursor: 'pointer' }}
                      >
                        {rendered}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Grid.Item>

            {showPreview && selectedResult && (
              <Grid.Item span={splitLayout ? 5 : undefined}>
                <SurfaceSectionCard
                  title={tSurface('search.preview_title')}
                  actions={
                    <SurfaceActionBar
                      actions={resultActions}
                      item={selectedResult}
                      permissions={config.permissions}
                    />
                  }
                >
                  {config.presentation.resultPreview?.(selectedResult) ?? (
                    <Stack spacing="md">
                      {selectedResult.image && <Box>{selectedResult.image}</Box>}
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        {selectedResult.icon && (
                          <Box style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                            {selectedResult.icon}
                          </Box>
                        )}
                        <Stack spacing="sm">
                          <Text style={{ fontWeight: 700 }}>{selectedResult.title}</Text>
                          {selectedResult.description && (
                            <Text
                              className="ds-search__muted-text"
                              data-part="muted-text"
                            >
                              {selectedResult.description}
                            </Text>
                          )}
                          {selectedResult.meta}
                          {selectedResult.badge}
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </SurfaceSectionCard>
              </Grid.Item>
            )}
          </Grid>
        )}

        {config.presentation.footer}
      </Stack>
    </PageShellSurface>
  );
}
