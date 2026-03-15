'use client';

/**
 * VisualizationSurface
 *
 * Charts, maps, timelines, and custom visualizations all need the same page
 * mechanics: title, actions, optional stats, and a way to switch between
 * alternate visual views. The actual chart implementation still belongs to the
 * app or pattern layer; this surface only owns the page skeleton.
 */

import React from 'react';
import { Card, Grid, Stack, Tabs, Text } from '../../primitives';
import { PatternStatsGrid } from '../../patterns';
import { filterSurfaceTabbedViews } from '../helpers';
import { useSurfaceTranslations } from '../i18n';
import type { VisualizationSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceActionBar, SurfaceTabbedLabel } from '../shared';
import { SurfaceEmptyState } from '../states';

export interface VisualizationSurfaceProps {
  config: VisualizationSurfaceConfig;
  loading?: boolean;
}

export function VisualizationSurface({
  config,
  loading = false,
}: VisualizationSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const { tSurface } = useSurfaceTranslations();
  const responsiveLayout = useSurfaceResponsiveLayout(config.visual);
  const visibleViews = filterSurfaceTabbedViews(config.behavior.views, config.permissions);
  const resolvedActiveView =
    visibleViews.some((view) => view.key === config.behavior.activeView)
      ? config.behavior.activeView
      : visibleViews[0]?.key;
  const isControlledViewState = config.behavior.activeView !== undefined;
  const statsColumns = resolveResponsiveColumnCount(responsiveLayout, 4, 2, 1);

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={<SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />}
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
        <Grid columns={config.presentation.aside && !responsiveLayout.shouldStack ? 12 : 1} gap="lg">
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
                            <Text style={{ color: 'var(--ds-color-text-muted)' }}>
                              {view.description}
                            </Text>
                          )}
                          {view.content}
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
