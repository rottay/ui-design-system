'use client';

/**
 * OperationalSurface
 *
 * Operational pages are different from dashboards: they combine live queues,
 * real-time feed updates, and a few high-value panels that operators need in
 * one glance. This surface gives that layout a formal DS contract.
 */

import React from 'react';
import { Grid, Stack } from '../../primitives';
import { PatternLiveFeed, PatternStatsGrid } from '../../patterns';
import type { FeedItem } from '../../patterns';
import { useSurfaceTranslations } from '../i18n';
import type { OperationalSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceActionBar, SurfaceSectionCard } from '../shared';
import { SurfaceEmptyState } from '../states';

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
  const hasContent =
    !!config.presentation.primaryPanel ||
    !!config.presentation.secondaryPanel ||
    !!config.presentation.queue ||
    !!config.behavior.feed ||
    (config.presentation.sections?.length ?? 0) > 0;

  const actions = [
    ...(config.behavior.actions ?? []),
    ...(config.behavior.refreshAction ? [config.behavior.refreshAction] : []),
  ];
  const shouldStack = responsiveLayout.shouldStack;
  const statsColumns = resolveResponsiveColumnCount(responsiveLayout, 4, 2, 1);

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={actions} permissions={config.permissions} />}
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

          {config.behavior.stats && config.behavior.stats.length > 0 && (
            <PatternStatsGrid
              stats={config.behavior.stats}
              columns={statsColumns}
              variant="glass"
            />
          )}

          <Grid columns={config.presentation.queue || config.behavior.feed ? (shouldStack ? 1 : 12) : 1} gap="lg">
            <Grid.Item span={config.presentation.queue || config.behavior.feed ? (!shouldStack ? 8 : undefined) : undefined}>
              <Stack spacing="lg">
                {config.presentation.primaryPanel && (
                  <SurfaceSectionCard title={tSurface('operational.primary_panel')}>
                    {config.presentation.primaryPanel}
                  </SurfaceSectionCard>
                )}

                {config.presentation.secondaryPanel && (
                  <SurfaceSectionCard title={tSurface('operational.secondary_panel')}>
                    {config.presentation.secondaryPanel}
                  </SurfaceSectionCard>
                )}

                {config.presentation.sections?.map((section) => (
                  <SurfaceSectionCard
                    key={section.key}
                    title={section.title}
                    description={section.description}
                    actions={section.actions}
                    plain={section.chrome === 'plain'}
                  >
                    {section.content}
                  </SurfaceSectionCard>
                ))}
              </Stack>
            </Grid.Item>

            {(config.presentation.queue || config.behavior.feed) && (
              <Grid.Item span={!shouldStack ? 4 : undefined}>
                <Stack spacing="lg">
                  {config.presentation.queue && (
                    <SurfaceSectionCard title={tSurface('operational.queue')}>
                      {config.presentation.queue}
                    </SurfaceSectionCard>
                  )}

                  {config.behavior.feed && (
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
                  )}
                </Stack>
              </Grid.Item>
            )}
          </Grid>

          {config.presentation.footer}
        </Stack>
      )}
    </PageShellSurface>
  );
}
