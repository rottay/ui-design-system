'use client';

/**
 * @fileoverview DashboardSurface - Rottay Design System
 * @description Reusable dashboard shell for KPI grids, section cards, charts,
 * and header actions.
 *
 * @remarks
 * This surface packages the recurring "overview page" structure while leaving
 * each widget's content and meaning in app-level config.
 */

import { Button, Card, Grid, Stack, Text, Flex } from '../../../../primitives';
import { PatternStatsGrid } from '../../../../patterns';
import { FadeIn, StaggerChildren } from '../../../../../motion';
import { filterSurfaceActions, resolveSurfaceButtonVariant } from '../../../foundation/helpers';
import type { DashboardSurfaceConfig } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceProfileDefaults } from '../../../foundation/profile-defaults';
import { resolveResponsiveColumnCount, useSurfaceResponsiveLayout } from '../../../foundation/responsive';
import {
  resolveHeadingFontWeight,
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../foundation/personality-helpers';
import { SurfaceErrorState } from '../../../foundation/states';

export interface DashboardSurfaceProps {
  config: DashboardSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Dashboard page shell with stats, header actions, section cards, and error handling. */
export function DashboardSurface({
  config,
  loading = false,
  error,
  onRetry,
}: DashboardSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const responsiveLayout = useSurfaceResponsiveLayout({
    stackOnMobile: true,
    stackOnTablet: false,
  });
  const isMobile = responsiveLayout.isMobile;
  // Permission filtering happens early so the action count drives both
  // rendering and layout decisions (e.g. no empty action bar wrapper).
  const headerActions = filterSurfaceActions(config.behavior.headerActions, config.access ?? config.permissions);
  // Spacing and heading weight resolve from personality tokens, allowing
  // the same dashboard config to render differently across product profiles.
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const headingWeight = resolveHeadingFontWeight(profileDefaults.headerWeight);
  const visibleSections = (config.presentation.sections ?? [])
    .filter((section) => !(isMobile && section.hideOnMobile))
    .sort((left, right) => {
      if (!isMobile) {
        return 0;
      }

      return (left.mobilePriority ?? Number.MAX_SAFE_INTEGER) - (right.mobilePriority ?? Number.MAX_SAFE_INTEGER);
    });
  const stats = isMobile && config.visual.mobileStatsLimit
    ? (config.behavior.stats ?? []).slice(0, config.visual.mobileStatsLimit)
    : config.behavior.stats;
  const statsColumns = resolveResponsiveColumnCount(
    responsiveLayout,
    config.visual.statsColumns ?? 4,
    Math.min(config.visual.statsColumns ?? 4, 2),
    1
  );
  const sectionsColumns =
    isMobile && config.visual.stackSectionsOnMobile !== false
      ? 1
      : isMobile
        ? (config.visual.mobileSectionsColumns ?? 1)
        : (config.visual.sectionsColumns ?? 12);

  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {headerActions.map((action) => (
        <Button
          key={action.id}
          variant={resolveSurfaceButtonVariant(action.variant)}
          disabled={action.disabled}
          loading={action.loading}
          icon={action.icon}
          onClick={() => action.onClick?.(undefined as void)}
        >
          {action.label}
        </Button>
      ))}
    </Flex>
  );

  // Error state renders full page chrome so the user can still use header
  // actions (e.g. refresh) even when the data load failed.
  if (error) {
    return (
      <PageShellSurface
        chrome={config.presentation.chrome}
        actions={actionsNode}
        loading={false}
      >
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const dashboardContent = (
    <Stack
      className="ds-surface ds-dashboard"
      data-part="root"
      data-mobile={isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      spacing={sectionSpacing}
    >
      {config.presentation.headerContent}

      {/* Stats stay optional so the same surface can power sparse and dense dashboards. */}
      {stats && stats.length > 0 && (
        <PatternStatsGrid
          stats={stats}
          columns={statsColumns}
          variant="glass"
          onStatClick={config.behavior.onStatClick}
        />
      )}

      {visibleSections.length > 0 && (
        <Grid columns={sectionsColumns} gap={sectionSpacing}>
          {visibleSections.map((section) => {
            // Sections can opt out of the card shell when the content already brings its own chrome.
            const sectionContent = section.chrome === 'plain' ? (
              section.content
            ) : (
              <Card variant={profileDefaults.cardVariant}>
                <Card.Body>
                  <Stack spacing="md">
                    {(section.title || section.description || section.actions) && (
                      <Flex justify="between" align="start" gap={12}>
                        <Stack spacing="xs">
                          {section.title && (
                            <Text style={{ fontSize: 18, fontWeight: headingWeight }}>
                              {section.title}
                            </Text>
                          )}
                          {section.description && (
                            <Text
                              className="ds-dashboard__muted-text"
                              data-part="muted-text"
                            >
                              {section.description}
                            </Text>
                          )}
                        </Stack>
                        {section.actions}
                      </Flex>
                    )}
                    {section.content}
                  </Stack>
                </Card.Body>
              </Card>
            );

            return (
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
                {sectionContent}
              </Grid.Item>
            );
          })}
        </Grid>
      )}
    </Stack>
  );

  return (
    <PageShellSurface
      chrome={config.presentation.chrome}
      actions={actionsNode}
      loading={loading}
    >
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn duration={profileDefaults.entranceDuration}>
            <StaggerChildren staggerDelay={profileDefaults.staggerDelay}>
              {dashboardContent}
            </StaggerChildren>
          </FadeIn>
        ) : (
          dashboardContent
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
