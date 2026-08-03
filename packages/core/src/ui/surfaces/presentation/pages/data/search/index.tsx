'use client';

/**
 * @fileoverview SearchSurface -- dedicated search page with query state and filters.
 * @description Centralizes search page mechanics: query state, optional filter panel,
 * selection, result preview, and consistent empty/initial-state language. Not just a
 * list with an input -- includes debounce, minimum query length, and preview behavior.
 * The app owns querying and the render escape hatches; the surface owns the page
 * structure, the state kits (mirror skeleton, empty query/results, stale-while-
 * revalidate busy, error with retry), and the responsive choreography.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, Flex, Grid, Input, Stack, Text } from '../../../../../primitives';
import { PatternFilterPanel } from '../../../../../patterns';
import { FadeIn } from '@/graphics/motion';
import { useCollectionStagger } from '../../../../../patterns/foundation/motion';
import { countActiveFilters, filterSurfaceActions } from '../../../../runtime/helpers';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import type {
  SearchSurfaceConfig,
  SearchSurfaceResult,
} from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import {
  SurfaceActionBar,
  SurfaceSectionCard,
} from '../../../../runtime/helpers/rendering';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
} from '../../../../runtime/helpers/states';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';

type SurfaceCardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';
type SectionSpacing = 'sm' | 'md' | 'lg';

/** Stock result card. Selection rides the Card's native contract
 *  (`selectable`/`selected`/`onSelect`: role="button", tab stop, Enter/Space,
 *  aria-pressed, and the selected paint owned by the Card skin). The BEM
 *  classes are the pinned anatomy hooks
 *  (SurfacesLongTailBatch.contract.test.tsx) kept as landing hooks across
 *  engines; the surface adds no selection paint of its own. */
function DefaultSearchResult({
  result,
  selected,
  cardVariant,
  onSelect,
}: {
  result: SearchSurfaceResult;
  selected: boolean;
  cardVariant: SurfaceCardVariant;
  onSelect: (result: SearchSurfaceResult) => void;
}): React.ReactElement {
  return (
    <Card
      className={
        selected
          ? 'ds-search__result-card ds-search__result-card--selected'
          : 'ds-search__result-card'
      }
      variant={cardVariant}
      hoverable
      selectable
      selected={selected}
      onSelect={() => onSelect(result)}
    >
      <Card.Body>
        <Stack spacing="sm">
          {result.image && <Box>{result.image}</Box>}
          <Flex gap={12} align="start">
            {result.icon && (
              <Box className="ds-search__result-icon" data-part="result-icon">
                {result.icon}
              </Box>
            )}
            <Stack spacing="xs">
              <Text weight="semibold" className="ds-search__result-title">
                {result.title}
              </Text>
              {result.description && (
                <Text size="sm" color="muted" className="ds-search__result-meta">
                  {result.description}
                </Text>
              )}
              {result.meta && (
                <Box className="ds-search__result-meta">{result.meta}</Box>
              )}
              {result.badge}
            </Stack>
          </Flex>
        </Stack>
      </Card.Body>
    </Card>
  );
}

/** Loading placeholder that mirrors the search page geometry: the command bar
 *  (input + filter row) where it lands, then the result cards and -- in split
 *  layout -- the preview panel, on the same 7/5 grid as the real content.
 *  Blocks are painted by the surface skin (the pulse rides the canonical
 *  attention channel and goes quiet under reduced motion), so the swap to
 *  real content is a paint change, not a layout shift. */
function SearchSkeleton({
  split,
  hasFilters,
  sectionSpacing,
}: {
  split: boolean;
  hasFilters: boolean;
  sectionSpacing: SectionSpacing;
}): React.ReactElement {
  const resultsSkeleton = (
    <Stack spacing="md" data-part="skeleton-results">
      <Box data-part="search-skeleton-block" data-size="result" />
      <Box data-part="search-skeleton-block" data-size="result" />
      <Box data-part="search-skeleton-block" data-size="result" />
    </Stack>
  );

  return (
    <Stack spacing={sectionSpacing} data-part="skeleton">
      <Box data-part="search-skeleton-block" data-size="input" />
      {hasFilters && <Box data-part="search-skeleton-block" data-size="filter" />}
      {split ? (
        <Grid columns={12} gap="lg">
          <Grid.Item span={7}>{resultsSkeleton}</Grid.Item>
          <Grid.Item span={5}>
            <Box data-part="search-skeleton-block" data-size="preview" />
          </Grid.Item>
        </Grid>
      ) : (
        resultsSkeleton
      )}
    </Stack>
  );
}

export interface SearchSurfaceProps {
  config: SearchSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Search page shell: command bar (query + filters), results, split preview. */
export function SearchSurface({
  config,
  loading = false,
  error,
  onRetry,
}: SearchSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { tSurfaceOr } = useSurfaceTranslations();
  const { isMobile, shouldStack } = useSurfaceResponsiveLayout(config.visual);
  // Visual defaults cascade: explicit surface config -> product profile ->
  // DS defaults (spacing scale, card material, motion intensity).
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const cardVariant = profileDefaults.cardVariant;
  // Selection state follows the controlled/uncontrolled pattern. When
  // selectedResultId is provided, the app owns it; otherwise the surface
  // auto-selects the first result for preview.
  const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(
    config.behavior.selectedResultId ?? config.behavior.results[0]?.id
  );

  // Re-sync on result changes so the preview panel does not go stale when
  // results are re-fetched after a query change: if the current selection is
  // gone from the new page of results, the first result takes over (the same
  // auto-selection the surface applies on mount).
  useEffect(() => {
    if (config.behavior.selectedResultId !== undefined) {
      setInternalSelectedId(config.behavior.selectedResultId);
    } else if (
      config.behavior.results.length > 0 &&
      (!internalSelectedId ||
        !config.behavior.results.some((result) => result.id === internalSelectedId))
    ) {
      setInternalSelectedId(config.behavior.results[0]?.id);
    }
  }, [config.behavior.results, config.behavior.selectedResultId, internalSelectedId]);

  const selectedId = config.behavior.selectedResultId ?? internalSelectedId;
  const selectedResult = useMemo(() => {
    return config.behavior.results.find((result) => result.id === selectedId);
  }, [config.behavior.results, selectedId]);

  const resultActions = useMemo(() => {
    return filterSurfaceActions(config.behavior.resultActions, config.access, selectedResult);
  }, [config.behavior.resultActions, config.access, selectedResult]);

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
      ? tSurfaceOr('search.empty_query_description_one', 'Enter at least {count} character to run the search.', { count: minQueryLength })
      : tSurfaceOr('search.empty_query_description_other', 'Enter at least {count} characters to run the search.', { count: minQueryLength });
  // Split layout with preview rail requires both a selected result AND a wide
  // enough viewport. On mobile the preview collapses into a full-width panel
  // below the results (the 12-col grid resolves to a single column).
  const showPreview = config.visual.layout === 'split' && !!selectedResult;
  const splitLayout = showPreview && !shouldStack;
  const resultMinWidth = config.visual.resultMinWidth ?? 280;
  const hasResults = config.behavior.results.length > 0;
  const hasFilters = !!config.behavior.filters && config.behavior.filters.length > 0;
  const activeFilterCount = countActiveFilters(config.behavior.filterValues);
  // Per-card entrance choreography (collection.insert recipe), gated by BOTH
  // the product profile's animateEntrance flag AND the active motion policy,
  // so a reduced/calm context renders every card at its final state.
  const stagger = useCollectionStagger(config.behavior.results.length);
  const applyStagger = profileDefaults.animateEntrance && stagger.animated;

  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };

  const actionsNode = (
    <SurfaceActionBar actions={config.behavior.actions} access={config.access} />
  );

  // Error state renders full page chrome so header actions stay available
  // even when the search load failed.
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const commandBar = (
    <SurfaceSectionCard>
      <Stack spacing="md">
        <Input.Search
          value={config.behavior.query}
          onChange={(value) => config.behavior.onQueryChange(value)}
          onSearch={(value) => config.behavior.onQuerySubmit?.(value)}
          placeholder={
            config.presentation.placeholder ?? tSurfaceOr('search.placeholder', 'Search')
          }
          loading={loading}
          showSearchButton
        />

        {hasFilters && config.behavior.filters && (
          <PatternFilterPanel
            filters={config.behavior.filters}
            values={config.behavior.filterValues ?? {}}
            onChange={(values) => config.behavior.onFilterChange?.(values)}
            onReset={config.behavior.onFilterReset}
            showReset={!!config.behavior.onFilterReset && activeFilterCount > 0}
            onApply={config.behavior.onFilterApply}
            showApply={!!config.behavior.onFilterApply}
            activeCount={activeFilterCount}
            title={tSurfaceOr('search.filters_title', 'Filters')}
            layout={isMobile ? 'stacked' : 'inline'}
          />
        )}
      </Stack>
    </SurfaceSectionCard>
  );

  const resultItems = config.behavior.results.map((result, index) => {
    const selected = result.id === selectedId;
    const customResult = config.presentation.renderResult?.(result, { index, selected });

    if (customResult != null) {
      // Custom renderer escape hatch: the app owns the inner content while
      // the surface keeps the click-to-select wiring so the preview contract
      // still holds. Selection is keyboard-complete (tab stop + Enter/Space,
      // aria-pressed) so it is never mouse-only; the cursor affordance and
      // the focus ring live in the skin.
      return (
        <Box
          key={result.id}
          data-part="result-custom"
          role="button"
          tabIndex={0}
          aria-pressed={selected}
          onClick={() => setSelectedResult(result)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setSelectedResult(result);
            }
          }}
          data-ds-stagger-item={applyStagger ? '' : undefined}
          style={
            applyStagger
              ? ({ '--ds-stagger-index': index } as React.CSSProperties)
              : undefined
          }
        >
          {customResult}
        </Box>
      );
    }

    return (
      <Box
        key={result.id}
        data-ds-stagger-item={applyStagger ? '' : undefined}
        style={
          applyStagger
            ? ({ '--ds-stagger-index': index } as React.CSSProperties)
            : undefined
        }
      >
        <DefaultSearchResult
          result={result}
          selected={selected}
          cardVariant={cardVariant}
          onSelect={setSelectedResult}
        />
      </Box>
    );
  });

  // The results region is one labelled group; during a refetch with results
  // already on screen the stale page stays visible and aria-busy marks it as
  // updating (partial data: nothing drops out for the skeleton).
  const resultsAriaLabel = tSurfaceOr('search.results_group_aria', 'Search results');
  const resultsRegion =
    config.visual.layout === 'stack' ? (
      /* Stack layout: results flow into an auto-fit card grid. The
         `min(100%, …)` floor keeps a track from overflowing narrow
         viewports; geometry only, no paint. */
      <Grid
        templateColumns={`repeat(auto-fit, minmax(min(100%, ${resultMinWidth}px), 1fr))`}
        gap="md"
        data-part="results"
        role="group"
        aria-label={resultsAriaLabel}
        aria-busy={loading || undefined}
        className={applyStagger ? stagger.containerClassName : undefined}
        style={
          applyStagger
            ? ({
                '--ds-stagger-step': stagger.stepCss,
                '--ds-stagger-max': stagger.maxCss,
              } as React.CSSProperties)
            : undefined
        }
      >
        {resultItems}
      </Grid>
    ) : (
      <Stack
        spacing="md"
        data-part="results"
        role="group"
        aria-label={resultsAriaLabel}
        aria-busy={loading || undefined}
        className={applyStagger ? stagger.containerClassName : undefined}
        style={
          applyStagger
            ? ({
                '--ds-stagger-step': stagger.stepCss,
                '--ds-stagger-max': stagger.maxCss,
              } as React.CSSProperties)
            : undefined
        }
      >
        {resultItems}
      </Stack>
    );

  // Four-way state: loading without prior results -> mirror skeleton,
  // not enough query -> empty query state, enough query but no results ->
  // no results state, results available -> results (+ split preview).
  // Loading is excluded from the empty branches, so the empty states never
  // flash during fetches, and a refetch with data keeps the stale results
  // on screen (aria-busy above) even if the query was trimmed below the
  // minimum mid-flight.
  const bodyContent =
    loading && !hasResults ? (
      <SearchSkeleton
        split={splitLayout}
        hasFilters={hasFilters}
        sectionSpacing={sectionSpacing}
      />
    ) : !hasEnoughQuery && !loading ? (
      config.presentation.emptyQueryState ?? (
        <Box
          className="ds-search__empty-state"
          data-part="empty-state"
          data-state="query"
        >
          <SurfaceEmptyState
            title={tSurfaceOr('search.empty_query_title', 'Start typing to search')}
            description={emptyQueryDescription}
          />
        </Box>
      )
    ) : !hasResults ? (
      config.presentation.emptyResultsState ?? (
        <Box
          className="ds-search__empty-state"
          data-part="empty-state"
          data-state="results"
        >
          <SurfaceEmptyState
            title={tSurfaceOr('search.empty_results_title', 'No results found')}
            description={tSurfaceOr(
              'search.empty_results_description',
              'Try adjusting the query or filters.'
            )}
          />
        </Box>
      )
    ) : (
      <Grid columns={splitLayout ? 12 : 1} gap="lg">
        <Grid.Item span={splitLayout ? 7 : undefined}>{resultsRegion}</Grid.Item>

        {showPreview && selectedResult && (
          <Grid.Item span={splitLayout ? 5 : undefined}>
            <Box data-part="preview">
              <SurfaceSectionCard
                title={tSurfaceOr('search.preview_title', 'Preview')}
                actions={
                  <SurfaceActionBar
                    actions={resultActions}
                    item={selectedResult}
                    access={config.access}
                  />
                }
              >
                {config.presentation.resultPreview?.(selectedResult) ?? (
                  <Stack spacing="md">
                    {selectedResult.image && <Box>{selectedResult.image}</Box>}
                    <Flex gap={12} align="start">
                      {selectedResult.icon && (
                        <Box className="ds-search__result-icon" data-part="result-icon">
                          {selectedResult.icon}
                        </Box>
                      )}
                      <Stack spacing="sm">
                        <Text weight="semibold">{selectedResult.title}</Text>
                        {selectedResult.description && (
                          <Text size="sm" color="muted" className="ds-search__muted-text">
                            {selectedResult.description}
                          </Text>
                        )}
                        {selectedResult.meta}
                        {selectedResult.badge}
                      </Stack>
                    </Flex>
                  </Stack>
                )}
              </SurfaceSectionCard>
            </Box>
          </Grid.Item>
        )}
      </Grid>
    );

  const searchContent = (
    <Stack
      className="ds-surface ds-search"
      data-part="root"
      data-layout={config.visual.layout}
      data-mobile={isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      data-preview={showPreview ? 'true' : 'false'}
      spacing={sectionSpacing}
    >
      {commandBar}
      {bodyContent}
      {config.presentation.footer}
    </Stack>
  );

  return (
    /* The page chrome (title + actions) stays live through the load: the
       surface owns the mirror skeleton, so the shell's loading early-return
       is intentionally not engaged. */
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>{searchContent}</FadeIn>
      ) : (
        searchContent
      )}
    </PageShellSurface>
  );
}
