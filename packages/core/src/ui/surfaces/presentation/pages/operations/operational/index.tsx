'use client';

/**
 * @fileoverview OperationalSurface -- real-time operations dashboard.
 * @description Combines live feeds, queue stats, and high-value operator panels.
 * Different from DashboardSurface in that it prioritizes real-time data and
 * denser information display for active monitoring workflows.
 *
 * @remarks
 * The surface coordinates: page chrome lives in PageShellSurface, module
 * chrome in SurfaceSectionCard, KPIs in PatternStatsGrid (PT16) and the live
 * feed in PatternLiveFeed. The surface owns the page structure, the state
 * kits (mirror skeleton, empty, error with retry) and the responsive
 * choreography — it never rebuilds composed chrome.
 */

import React from 'react';
import { Box, Card, Grid, Stack } from '../../../../../primitives';
import type { GridColumns } from '../../../../../primitives/layout/Grid/contracts';
import { PatternLiveFeed, PatternStatsGrid } from '../../../../../patterns';
import type { FeedItem } from '../../../../../patterns';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import type { OperationalSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../../runtime/helpers/states';
import { FadeIn, StaggerChildren } from '@/graphics/motion';

type SurfaceCardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';

/** StatsGrid has its own material vocabulary; map the profile card variant
 *  onto the closest stats material so the KPI row and the module cards share
 *  one tenant surface language (report/visualization precedent). This also
 *  keeps page-level stats off `glass`, which the Modern spec reserves for
 *  overlay backdrops (spec section 5). */
function resolveStatsGridVariant(
  cardVariant: SurfaceCardVariant
): 'default' | 'outlined' | 'filled' {
  if (cardVariant === 'outlined') return 'outlined';
  if (cardVariant === 'filled') return 'filled';
  return 'default';
}

/** Card-shaped placeholder used by the loading skeleton; geometry hooks are
 *  `data-part`s, the pulse and block chrome live in the OperationalSurface
 *  skin. */
function OperationalSkeletonCard({
  cardVariant,
  size,
}: {
  cardVariant: SurfaceCardVariant;
  size: 'panel' | 'section' | 'rail';
}): React.ReactElement {
  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <Box data-part="operational-skeleton-block" data-size="title" />
          <Box data-part="operational-skeleton-block" data-size={size} />
        </Stack>
      </Card.Body>
    </Card>
  );
}

/** Loading placeholder that mirrors the dashboard's geometry: the KPI row
 *  keeps the resolved column count, the 8/4 main/side split and the rail
 *  positions survive the load, so the swap to real content is paint-only,
 *  never a layout shift. */
function OperationalSkeleton({
  statsCount,
  statsColumns,
  cardVariant,
  sectionSpacing,
  hasPrimaryPanel,
  hasSecondaryPanel,
  visibleSections,
  sectionsColumns,
  isMobile,
  stackSections,
  hasSideRail,
  shouldStack,
  sideRailCount,
  topRailCount,
  bottomRailCount,
}: {
  statsCount: number;
  statsColumns: GridColumns;
  cardVariant: SurfaceCardVariant;
  sectionSpacing: 'sm' | 'md' | 'lg';
  hasPrimaryPanel: boolean;
  hasSecondaryPanel: boolean;
  visibleSections: NonNullable<OperationalSurfaceConfig['presentation']['sections']>;
  sectionsColumns: GridColumns;
  isMobile: boolean;
  stackSections: boolean;
  hasSideRail: boolean;
  shouldStack: boolean;
  sideRailCount: number;
  topRailCount: number;
  bottomRailCount: number;
}): React.ReactElement {
  return (
    <>
      {statsCount > 0 && (
        <Grid columns={statsColumns} gap={sectionSpacing}>
          {Array.from({ length: statsCount }, (_, index) => (
            <Box
              key={`operational-skeleton-stat-${index}`}
              data-part="operational-skeleton-block"
              data-size="stat"
            />
          ))}
        </Grid>
      )}

      {topRailCount > 0 && (
        <Stack spacing={sectionSpacing}>
          {Array.from({ length: topRailCount }, (_, index) => (
            <OperationalSkeletonCard
              key={`operational-skeleton-top-${index}`}
              cardVariant={cardVariant}
              size="rail"
            />
          ))}
        </Stack>
      )}

      <Grid columns={hasSideRail && !shouldStack ? 12 : 1} gap={sectionSpacing}>
        <Grid.Item span={hasSideRail && !shouldStack ? 8 : undefined}>
          <Stack spacing={sectionSpacing}>
            {hasPrimaryPanel && (
              <OperationalSkeletonCard cardVariant={cardVariant} size="panel" />
            )}
            {hasSecondaryPanel && (
              <OperationalSkeletonCard cardVariant={cardVariant} size="panel" />
            )}
            {visibleSections.length > 0 && (
              <Grid columns={sectionsColumns} gap={sectionSpacing}>
                {visibleSections.map((section) => (
                  <Grid.Item
                    key={section.key}
                    span={
                      isMobile && stackSections
                        ? undefined
                        : isMobile
                          ? section.mobileSpan
                          : section.span
                    }
                  >
                    <OperationalSkeletonCard cardVariant={cardVariant} size="section" />
                  </Grid.Item>
                ))}
              </Grid>
            )}
          </Stack>
        </Grid.Item>

        {hasSideRail && (
          <Grid.Item span={!shouldStack ? 4 : undefined}>
            <Stack spacing={sectionSpacing}>
              {Array.from({ length: sideRailCount }, (_, index) => (
                <OperationalSkeletonCard
                  key={`operational-skeleton-side-${index}`}
                  cardVariant={cardVariant}
                  size="rail"
                />
              ))}
            </Stack>
          </Grid.Item>
        )}
      </Grid>

      {bottomRailCount > 0 && (
        <Stack spacing={sectionSpacing}>
          {Array.from({ length: bottomRailCount }, (_, index) => (
            <OperationalSkeletonCard
              key={`operational-skeleton-bottom-${index}`}
              cardVariant={cardVariant}
              size="rail"
            />
          ))}
        </Stack>
      )}
    </>
  );
}

export interface OperationalSurfaceProps<TFeed extends FeedItem = FeedItem> {
  config: OperationalSurfaceConfig<TFeed>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function OperationalSurface<TFeed extends FeedItem = FeedItem>({
  config,
  loading = false,
  error,
  onRetry,
}: OperationalSurfaceProps<TFeed>): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { tSurfaceOr } = useSurfaceTranslations();
  const responsiveLayout = useSurfaceResponsiveLayout(config.visual);
  const isMobile = responsiveLayout.isMobile;
  // Stamped state attributes follow the resolved viewport so SSR/first-paint
  // markup never claims a mobile posture the media query has not confirmed
  // (the provider's pre-resolution default is phone; form/scheduler family
  // idiom). Structural decisions keep reading `isMobile` directly.
  const resolvedMobile = responsiveLayout.hasResolvedViewport && isMobile;
  // Visual defaults cascade: explicit surface config -> product profile ->
  // DS defaults (spacing scale, card material, motion intensity).
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const cardVariant = profileDefaults.cardVariant;
  // Content check is broad because operational dashboards may have any
  // combination of panels, feeds, queues, and sections. An entirely empty
  // config should show the empty state rather than a blank shell.
  const hasContent =
    !!config.presentation.primaryPanel ||
    !!config.presentation.secondaryPanel ||
    !!config.presentation.queue ||
    !!config.behavior.feed ||
    (config.presentation.sections?.length ?? 0) > 0;

  // The refresh action is merged into the standard actions array so it
  // renders alongside other header buttons without special-casing in the
  // action bar.
  const actions = [
    ...(config.behavior.actions ?? []),
    ...(config.behavior.refreshAction ? [config.behavior.refreshAction] : []),
  ];
  const shouldStack = responsiveLayout.shouldStack;
  const statsColumns = resolveResponsiveColumnCount(responsiveLayout, 4, 2, 1);
  const stats = isMobile && config.visual.mobileStatsLimit
    ? (config.behavior.stats ?? []).slice(0, config.visual.mobileStatsLimit)
    : config.behavior.stats;
  const visibleSections = (config.presentation.sections ?? [])
    .filter((section) => !(isMobile && section.hideOnMobile))
    .sort((left, right) => {
      if (!isMobile) {
        return 0;
      }

      return (left.mobilePriority ?? Number.MAX_SAFE_INTEGER) - (right.mobilePriority ?? Number.MAX_SAFE_INTEGER);
    });
  const sectionsColumns =
    isMobile && config.visual.stackSectionsOnMobile !== false
      ? 1
      : isMobile
        ? (config.visual.mobileSectionsColumns ?? 1)
        : (config.visual.sectionsColumns ?? 12);
  const hasSecondaryPanel =
    !!config.presentation.secondaryPanel &&
    !(isMobile && config.visual.hideSecondaryPanelOnMobile);

  // Rail placement is resolved once and shared by the mirror skeleton and the
  // real content, so the loading geometry matches the loaded page exactly.
  // 'hidden' is an explicit mobile placement: the module is dropped from
  // every rail instead of silently falling through the distribution.
  const queueRail = !config.presentation.queue
    ? null
    : isMobile
      ? (config.visual.mobileQueuePosition ?? 'bottom')
      : 'sidebar';
  const feedRail = !config.behavior.feed
    ? null
    : isMobile
      ? (config.visual.mobileFeedPosition ?? 'bottom')
      : 'sidebar';
  const railPlacements = [queueRail, feedRail].filter(
    (rail): rail is 'top' | 'bottom' | 'sidebar' => rail !== null && rail !== 'hidden'
  );
  const topRailCount = railPlacements.filter((rail) => rail === 'top').length;
  const bottomRailCount = railPlacements.filter((rail) => rail === 'bottom').length;
  const sideRailCount = railPlacements.filter((rail) => rail === 'sidebar').length;

  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };
  const actionsNode = (
    <SurfaceActionBar actions={actions} access={config.access} />
  );

  // Error state renders full page chrome so header actions (e.g. refresh)
  // stay available even when the data load failed.
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const queueNode = queueRail !== null && queueRail !== 'hidden' ? (
    <SurfaceSectionCard title={tSurfaceOr('operational.queue', 'Queue')}>
      {config.presentation.queue}
    </SurfaceSectionCard>
  ) : null;
  const feedNode = feedRail !== null && feedRail !== 'hidden' && config.behavior.feed ? (
    <SurfaceSectionCard title={tSurfaceOr('operational.live_feed', 'Live feed')}>
      <PatternLiveFeed
        items={config.behavior.feed.items as FeedItem[]}
        renderItem={
          config.behavior.feed.renderItem as (
            item: FeedItem,
            index: number
          ) => React.ReactNode
        }
        onRefresh={config.behavior.feed.onRefresh}
        autoRefresh={config.behavior.feed.autoRefresh}
        emptyState={config.behavior.feed.emptyState}
        newItemsCount={config.behavior.feed.newItemsCount}
        onShowNewItems={config.behavior.feed.onShowNewItems}
        onLoadMore={config.behavior.feed.onLoadMore}
        hasMore={config.behavior.feed.hasMore}
        maxItems={config.behavior.feed.maxItems}
        maxHeight={config.behavior.feed.maxHeight ?? config.visual.feedHeight}
        header={config.behavior.feed.header}
        loading={loading}
      />
    </SurfaceSectionCard>
  ) : null;
  const secondaryPanelNode = hasSecondaryPanel ? (
    <SurfaceSectionCard
      title={tSurfaceOr('operational.secondary_panel', 'Secondary panel')}
    >
      {config.presentation.secondaryPanel}
    </SurfaceSectionCard>
  ) : null;

  const topRailCards: React.ReactNode[] = [];
  const bottomRailCards: React.ReactNode[] = [];
  const sideRailCards: React.ReactNode[] = [];

  if (queueNode) {
    if (queueRail === 'top') {
      topRailCards.push(queueNode);
    } else if (queueRail === 'bottom') {
      bottomRailCards.push(queueNode);
    } else {
      sideRailCards.push(queueNode);
    }
  }

  if (feedNode) {
    if (feedRail === 'top') {
      topRailCards.push(feedNode);
    } else if (feedRail === 'bottom') {
      bottomRailCards.push(feedNode);
    } else {
      sideRailCards.push(feedNode);
    }
  }

  const operationalContent = (
    <Stack
      className="ds-surface ds-operational"
      data-part="root"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading || undefined}
      spacing={sectionSpacing}
    >
      {loading ? (
        /* Mirror skeleton: the dashboard's geometry is preserved through the
           load — the page chrome stays live and the swap is paint-only. The
           page-shell loading early-return is NOT used here because it would
           drop the surface's own shape (report/dashboard precedent). */
        <OperationalSkeleton
          statsCount={stats?.length ?? 0}
          /* resolveResponsiveColumnCount clamps to the 1-12 literal range by
             contract, so the resolved count is always a valid GridColumns. */
          statsColumns={statsColumns as GridColumns}
          cardVariant={cardVariant}
          sectionSpacing={sectionSpacing}
          hasPrimaryPanel={!!config.presentation.primaryPanel}
          hasSecondaryPanel={hasSecondaryPanel}
          visibleSections={visibleSections}
          sectionsColumns={sectionsColumns}
          isMobile={isMobile}
          stackSections={config.visual.stackSectionsOnMobile !== false}
          hasSideRail={sideRailCount > 0}
          shouldStack={shouldStack}
          sideRailCount={sideRailCount}
          topRailCount={topRailCount}
          bottomRailCount={bottomRailCount}
        />
      ) : !hasContent ? (
        config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurfaceOr(
              'operational.empty_title',
              'No operational modules configured'
            )}
            description={tSurfaceOr(
              'operational.empty_description',
              'Add queue, feed, or panel content to render this surface.'
            )}
          />
        )
      ) : (
        <>
          {config.presentation.intro}

          {stats && stats.length > 0 && (
            /* The KPI strip is a named group so assistive tech can skip or
               jump straight to the operational metrics. */
            <Box
              role="group"
              aria-label={tSurfaceOr(
                'operational.stats_group_aria',
                'Operational metrics'
              )}
            >
              <PatternStatsGrid
                stats={stats}
                columns={statsColumns}
                variant={resolveStatsGridVariant(cardVariant)}
              />
            </Box>
          )}

          {topRailCards.length > 0 && (
            <Stack spacing={sectionSpacing}>
              {topRailCards.map((node, index) => (
                <Box key={`operational-top-${index}`}>{node}</Box>
              ))}
            </Stack>
          )}

          {/* The 8/4 grid split only activates when a queue or feed exists.
              Without a sidebar panel, the main content takes full width. On
              mobile the rail can move above or below the main content. */}
          <Grid columns={sideRailCards.length > 0 ? (shouldStack ? 1 : 12) : 1} gap={sectionSpacing}>
            <Grid.Item span={sideRailCards.length > 0 ? (!shouldStack ? 8 : undefined) : undefined}>
              <Stack spacing={sectionSpacing}>
                {config.presentation.primaryPanel && (
                  <SurfaceSectionCard
                    title={tSurfaceOr('operational.primary_panel', 'Primary panel')}
                  >
                    {config.presentation.primaryPanel}
                  </SurfaceSectionCard>
                )}

                {secondaryPanelNode}

                {visibleSections.length > 0 && (
                  <Grid columns={sectionsColumns} gap={sectionSpacing}>
                    {visibleSections.map((section) => (
                      <Grid.Item
                        key={section.key}
                        span={
                          isMobile && config.visual.stackSectionsOnMobile !== false
                            ? undefined
                            : isMobile
                              ? section.mobileSpan
                              : section.span
                        }
                      >
                        <SurfaceSectionCard
                          title={section.title}
                          description={section.description}
                          actions={section.actions}
                          plain={section.chrome === 'plain'}
                        >
                          {section.content}
                        </SurfaceSectionCard>
                      </Grid.Item>
                    ))}
                  </Grid>
                )}
              </Stack>
            </Grid.Item>

            {sideRailCards.length > 0 && (
              <Grid.Item span={!shouldStack ? 4 : undefined}>
                <Stack spacing={sectionSpacing}>
                  {sideRailCards.map((node, index) => (
                    <Box key={`operational-side-${index}`}>{node}</Box>
                  ))}
                </Stack>
              </Grid.Item>
            )}
          </Grid>

          {bottomRailCards.length > 0 && (
            <Stack spacing={sectionSpacing}>
              {bottomRailCards.map((node, index) => (
                <Box key={`operational-bottom-${index}`}>{node}</Box>
              ))}
            </Stack>
          )}

          {config.presentation.footer}
        </>
      )}
    </Stack>
  );

  return (
    /* The page chrome (title + actions) stays live through the load: the
       surface owns the mirror skeleton, so the shell's loading early-return
       is intentionally not engaged. */
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>
          <StaggerChildren staggerDelayMs={profileDefaults.staggerDelay}>
            {operationalContent}
          </StaggerChildren>
        </FadeIn>
      ) : (
        operationalContent
      )}
    </PageShellSurface>
  );
}
