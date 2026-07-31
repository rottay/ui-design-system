'use client';

/**
 * @fileoverview VisualizationSurface -- chart/map/timeline page shell.
 * @description Provides the page-level skeleton for visual data pages: title,
 * actions, optional KPI stats, and tabbed view switching with per-view
 * supporting copy. The chart implementation belongs to the app or pattern
 * layer (the DS D3 chart families are the sanctioned renderers); this surface
 * owns the page structure, the state kits (mirror skeleton, empty, error with
 * retry), the compact-chart density projection on small viewports, and the
 * responsive choreography.
 */

import React from 'react';
import { Box, Card, Flex, Grid, Stack, Tabs, Text } from '../../../../../primitives';
import type { GridColumns } from '../../../../../primitives/layout/Grid/contracts';
import { PatternStatsGrid } from '../../../../../patterns';
import { filterSurfaceTabbedViews } from '../../../../runtime/helpers';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import type { VisualizationSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar, SurfaceTabbedLabel } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../../runtime/helpers/states';
import { FadeIn, StaggerChildren } from '@/graphics/motion';

type SurfaceCardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';
type SectionSpacing = 'sm' | 'md' | 'lg';

/** StatsGrid has its own material vocabulary; map the profile card variant
 *  onto the closest stats material so the KPI row and the surrounding panels
 *  share one tenant surface language (report precedent). This also keeps
 *  page-level stats off `glass`, which the Modern spec reserves for overlay
 *  backdrops. */
function resolveStatsGridVariant(
  cardVariant: SurfaceCardVariant
): 'default' | 'outlined' | 'filled' {
  if (cardVariant === 'outlined') return 'outlined';
  if (cardVariant === 'filled') return 'filled';
  return 'default';
}

/** Loading placeholder that mirrors the page's geometry: the KPI row keeps
 *  the resolved column count and the views card keeps its tab strip +
 *  description line + chart block, so the swap to real content is paint-only,
 *  never a layout shift. Geometry hooks are `data-part`s; the pulse and the
 *  block chrome live in the VisualizationSurface skin. */
function VisualizationSkeleton({
  statsCount,
  statsColumns,
  cardVariant,
  sectionSpacing,
}: {
  statsCount: number;
  statsColumns: GridColumns;
  cardVariant: SurfaceCardVariant;
  sectionSpacing: SectionSpacing;
}): React.ReactElement {
  return (
    <Stack spacing={sectionSpacing} data-part="visualization-skeleton">
      {statsCount > 0 && (
        <Grid
          columns={statsColumns}
          gap={sectionSpacing}
          data-part="visualization-skeleton-stats"
        >
          {Array.from({ length: statsCount }, (_, index) => (
            <Box
              key={index}
              data-part="visualization-skeleton-block"
              data-size="stat"
            />
          ))}
        </Grid>
      )}
      <Card variant={cardVariant}>
        <Card.Body>
          <Stack spacing="md">
            <Flex gap={8} data-part="visualization-skeleton-tabs">
              <Box data-part="visualization-skeleton-block" data-size="tab" />
              <Box data-part="visualization-skeleton-block" data-size="tab" />
              <Box data-part="visualization-skeleton-block" data-size="tab" />
            </Flex>
            <Box data-part="visualization-skeleton-block" data-size="description" />
            <Box data-part="visualization-skeleton-block" data-size="chart" />
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}

export interface VisualizationSurfaceProps {
  config: VisualizationSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Visualization page shell: KPI strip + tabbed chart views + optional aside rail. */
export function VisualizationSurface({
  config,
  loading = false,
  error,
  onRetry,
}: VisualizationSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { tSurfaceOr } = useSurfaceTranslations();
  const responsiveLayout = useSurfaceResponsiveLayout(config.visual);
  // Visual defaults cascade: explicit surface config -> product profile ->
  // DS defaults (spacing scale, card material, motion intensity).
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const cardVariant = profileDefaults.cardVariant;
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
  const hasAside = Boolean(config.presentation.aside);
  const useAsideColumns = hasAside && !responsiveLayout.shouldStack;

  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };
  const actionsNode = (
    <SurfaceActionBar actions={config.behavior.actions} access={config.access} />
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

  const mainColumn = loading ? (
    /* Mirror skeleton: the page's geometry is preserved through the load —
       the page chrome stays live and the swap is paint-only. The page-shell
       loading early-return is NOT used here because it would drop the
       surface's own shape. */
    <VisualizationSkeleton
      statsCount={config.behavior.stats?.length ?? 0}
      /* resolveResponsiveColumnCount clamps to the 1–12 literal range by
         contract, so the resolved count is always a valid GridColumns. */
      statsColumns={statsColumns as GridColumns}
      cardVariant={cardVariant}
      sectionSpacing={sectionSpacing}
    />
  ) : visibleViews.length === 0 ? (
    config.presentation.emptyState ?? (
      <SurfaceEmptyState
        title={tSurfaceOr('visualization.empty_title', 'No visualizations configured')}
        description={tSurfaceOr(
          'visualization.empty_description',
          'Add one or more views to render this surface.'
        )}
      />
    )
  ) : (
    <Stack spacing={sectionSpacing}>
      {config.presentation.intro}

      {config.behavior.stats && config.behavior.stats.length > 0 && (
        <PatternStatsGrid
          stats={config.behavior.stats}
          columns={statsColumns}
          variant={resolveStatsGridVariant(cardVariant)}
        />
      )}

      <Card variant={cardVariant}>
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
                    /* Supporting copy: size/mute ride the Text primitive's own
                       props — a skin color rule would lose against
                       typography.css in the later `rottay-engines` layer. The
                       BEM hook stays as pinned anatomy (landing hook across
                       engines; Modern forwards data-part). */
                    <Text
                      size="sm"
                      color="muted"
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
  );

  const visualizationContent = (
    <Grid
      className={`ds-surface ds-visualization ds-visualization--${responsiveLayout.shouldStack ? 'stacked' : 'wide'}`}
      data-part="root"
      data-mobile={responsiveLayout.isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      columns={useAsideColumns ? 12 : 1}
      gap={sectionSpacing}
    >
      <Grid.Item span={useAsideColumns ? 8 : undefined}>{mainColumn}</Grid.Item>

      {hasAside && (
        <Grid.Item span={useAsideColumns ? 4 : undefined}>
          {loading ? (
            <Card variant={cardVariant}>
              <Card.Body>
                <Box data-part="visualization-skeleton-block" data-size="aside" />
              </Card.Body>
            </Card>
          ) : (
            <Card variant={cardVariant}>
              <Card.Body>{config.presentation.aside}</Card.Body>
            </Card>
          )}
        </Grid.Item>
      )}
    </Grid>
  );

  return (
    /* The page chrome (title + actions) stays live through the load: the
       surface owns the mirror skeleton, so the shell's loading early-return
       is intentionally not engaged. */
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>
          <StaggerChildren staggerDelayMs={profileDefaults.staggerDelay}>
            {visualizationContent}
          </StaggerChildren>
        </FadeIn>
      ) : (
        visualizationContent
      )}
    </PageShellSurface>
  );
}
