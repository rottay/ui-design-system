'use client';

/**
 * @fileoverview VisualizationSurface -- chart/map/timeline page shell.
 * @description Provides page-level skeleton for visual data pages: title, actions,
 * optional KPI stats, and tabbed view switching. The actual chart implementation
 * belongs to the app or pattern layer; this surface owns the page skeleton only.
 */

import React from 'react';
import { Box, Card, Grid, Stack, Tabs, Text } from '../../../../../primitives';
import { PatternStatsGrid } from '../../../../../patterns';
import { filterSurfaceTabbedViews } from '../../../../runtime/helpers';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import type { VisualizationSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar, SurfaceTabbedLabel } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface VisualizationSurfaceProps {
  config: VisualizationSurfaceConfig;
  loading?: boolean;
}

export function VisualizationSurface({
  config,
  loading = false,
}: VisualizationSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { tSurface } = useSurfaceTranslations();
  const responsiveLayout = useSurfaceResponsiveLayout(config.visual);
  const compactMobileCharts =
    responsiveLayout.isMobile &&
    responsiveLayout.hasResolvedViewport &&
    config.visual.compactChartsOnMobile === true;
  // Views use app-resolved access so hidden chart types never appear
  // in the tab bar (e.g. financial charts hidden from non-admin users).
  const visibleViews = filterSurfaceTabbedViews(config.behavior.views, config.access);
  // If the configured active view was hidden by access, fall back to
  // the first visible view to avoid a blank content area.
  const resolvedActiveView =
    visibleViews.some((view) => view.key === config.behavior.activeView)
      ? config.behavior.activeView
      : visibleViews[0]?.key;
  const isControlledViewState = config.behavior.activeView !== undefined;
  // Stats grid adapts from 4 columns on desktop to 1 on mobile so KPI
  // numbers remain readable at every breakpoint.
  const statsColumns = resolveResponsiveColumnCount(responsiveLayout, 4, 2, 1);

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} access={config.access} />}
      loading={loading}
    >
      {visibleViews.length === 0 ? (
        config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface('visualization.empty_title')}
            description={tSurface('visualization.empty_description')}
          />
        )
      ) : (
        <Grid
          className={`ds-surface ds-visualization ds-visualization--${responsiveLayout.shouldStack ? 'stacked' : 'wide'}`}
          columns={config.presentation.aside && !responsiveLayout.shouldStack ? 12 : 1}
          gap="lg"
        >
          <Grid.Item span={config.presentation.aside && !responsiveLayout.shouldStack ? 8 : undefined}>
            <Stack spacing="lg">
              {config.presentation.intro}

              {config.behavior.stats && config.behavior.stats.length > 0 && (
                <PatternStatsGrid
                  stats={config.behavior.stats}
                  columns={statsColumns}
                  variant="glass"
                />
              )}

              <Card variant="outlined">
                <Card.Body>
                  <Tabs
                    items={visibleViews.map((view) => ({
                      key: view.key,
                      label: <SurfaceTabbedLabel view={view} />,
                      icon: view.icon,
                      disabled: view.disabled,
                      children: (
                        <Stack spacing="md">
                          {view.description && (
                            <Text
                              className="ds-visualization__muted-text"
                            >
                              {view.description}
                            </Text>
                          )}
                          <Box
                            className="ds-visualization__view"
                            data-part="visualization-view"
                            data-chart-density={compactMobileCharts ? 'compact' : 'default'}
                          >
                            {view.content}
                          </Box>
                        </Stack>
                      ),
                    }))}
                    type={config.visual.tabsType ?? profileDefaults.tabsType}
                    centered={config.visual.centeredTabs}
                    activeKey={isControlledViewState ? resolvedActiveView : undefined}
                    defaultActiveKey={!isControlledViewState ? resolvedActiveView : undefined}
                    onChange={config.behavior.onViewChange}
                  />
                </Card.Body>
              </Card>

              {config.presentation.footer}
            </Stack>
          </Grid.Item>

          {config.presentation.aside && (
            <Grid.Item span={!responsiveLayout.shouldStack ? 4 : undefined}>
              <Card variant="outlined">
                <Card.Body>{config.presentation.aside}</Card.Body>
              </Card>
            </Grid.Item>
          )}
        </Grid>
      )}
    </PageShellSurface>
  );
}
