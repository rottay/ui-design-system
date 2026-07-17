'use client';

/**
 * @fileoverview OperationalSurface -- real-time operations dashboard.
 * @description Combines live feeds, queue stats, and high-value operator panels.
 * Different from DashboardSurface in that it prioritizes real-time data and
 * denser information display for active monitoring workflows.
 */

import React from 'react';
import { Box, Grid, Stack } from '../../../../../primitives';
import { PatternLiveFeed, PatternStatsGrid } from '../../../../../patterns';
import type { FeedItem } from '../../../../../patterns';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import type { OperationalSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface OperationalSurfaceProps<TFeed extends FeedItem = FeedItem> {
  config: OperationalSurfaceConfig<TFeed>;
  loading?: boolean;
}

export function OperationalSurface<TFeed extends FeedItem = FeedItem>({
  config,
  loading = false,
}: OperationalSurfaceProps<TFeed>): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const responsiveLayout = useSurfaceResponsiveLayout(config.visual);
  const isMobile = responsiveLayout.isMobile;
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
  const queueNode = config.presentation.queue ? (
    <SurfaceSectionCard title={tSurface('operational.queue')}>
      {config.presentation.queue}
    </SurfaceSectionCard>
  ) : null;
  const feedNode = config.behavior.feed ? (
    <SurfaceSectionCard title={tSurface('operational.live_feed')}>
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
  const secondaryPanelNode =
    config.presentation.secondaryPanel &&
    !(isMobile && config.visual.hideSecondaryPanelOnMobile)
      ? (
          <SurfaceSectionCard title={tSurface('operational.secondary_panel')}>
            {config.presentation.secondaryPanel}
          </SurfaceSectionCard>
        )
      : null;

  const topRailCards: React.ReactNode[] = [];
  const bottomRailCards: React.ReactNode[] = [];
  const sideRailCards: React.ReactNode[] = [];

  const queuePosition = isMobile ? (config.visual.mobileQueuePosition ?? 'bottom') : 'sidebar';
  const feedPosition = isMobile ? (config.visual.mobileFeedPosition ?? 'bottom') : 'sidebar';

  if (queueNode) {
    if (queuePosition === 'top') {
      topRailCards.push(queueNode);
    } else if (queuePosition === 'bottom') {
      bottomRailCards.push(queueNode);
    } else if (queuePosition === 'sidebar') {
      sideRailCards.push(queueNode);
    }
  }

  if (feedNode) {
    if (feedPosition === 'top') {
      topRailCards.push(feedNode);
    } else if (feedPosition === 'bottom') {
      bottomRailCards.push(feedNode);
    } else if (feedPosition === 'sidebar') {
      sideRailCards.push(feedNode);
    }
  }

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={actions} permissions={config.access ?? config.permissions} />}
      loading={loading}
    >
      {!hasContent ? (
        config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface('operational.empty_title')}
            description={tSurface('operational.empty_description')}
          />
        )
      ) : (
        <Stack spacing="lg">
          {config.presentation.intro}

          {stats && stats.length > 0 && (
            <PatternStatsGrid
              stats={stats}
              columns={statsColumns}
              variant="glass"
            />
          )}

          {topRailCards.length > 0 && (
            <Stack spacing="lg">
              {topRailCards.map((node, index) => (
                <Box key={`operational-top-${index}`}>{node}</Box>
              ))}
            </Stack>
          )}

          {/* The 8/4 grid split only activates when a queue or feed exists.
              Without a sidebar panel, the main content takes full width. On
              mobile the rail can move above or below the main content. */}
          <Grid columns={sideRailCards.length > 0 ? (shouldStack ? 1 : 12) : 1} gap="lg">
            <Grid.Item span={sideRailCards.length > 0 ? (!shouldStack ? 8 : undefined) : undefined}>
              <Stack spacing="lg">
                {config.presentation.primaryPanel && (
                  <SurfaceSectionCard title={tSurface('operational.primary_panel')}>
                    {config.presentation.primaryPanel}
                  </SurfaceSectionCard>
                )}

                {secondaryPanelNode}

                {visibleSections.length > 0 && (
                  <Grid columns={sectionsColumns} gap="lg">
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
                <Stack spacing="lg">
                  {sideRailCards.map((node, index) => (
                    <Box key={`operational-side-${index}`}>{node}</Box>
                  ))}
                </Stack>
              </Grid.Item>
            )}
          </Grid>

          {bottomRailCards.length > 0 && (
            <Stack spacing="lg">
              {bottomRailCards.map((node, index) => (
                <Box key={`operational-bottom-${index}`}>{node}</Box>
              ))}
            </Stack>
          )}

          {config.presentation.footer}
        </Stack>
      )}
    </PageShellSurface>
  );
}
