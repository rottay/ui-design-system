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

import { Button, Card, Grid, Stack, Text, Flex } from '../../primitives';
import { PatternStatsGrid } from '../../patterns';
import { FadeIn, StaggerChildren } from '../../../motion';
import { filterSurfaceActions, resolveSurfaceButtonVariant } from '../helpers';
import type { DashboardSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import {
  resolveHeadingFontWeight,
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../personality-helpers';
import { SurfaceErrorState } from '../states';

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
  // Permission filtering happens early so the action count drives both
  // rendering and layout decisions (e.g. no empty action bar wrapper).
  const headerActions = filterSurfaceActions(config.behavior.headerActions, config.permissions);
  // Spacing and heading weight resolve from personality tokens, allowing
  // the same dashboard config to render differently across product profiles.
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const headingWeight = resolveHeadingFontWeight(profileDefaults.headerWeight);

  const actionsNode = (
    <Flex gap={8} wrap="wrap" justify="end">
      {headerActions.map((action) => (
        <Button
          key={action.id}
          variant={resolveSurfaceButtonVariant(action.variant)}
          disabled={action.disabled}
          loading={action.loading}
          onClick={() => action.onClick?.(undefined as void)}
        >
          {action.icon}
          <Text style={{ marginLeft: action.icon ? 8 : 0 }}>{action.label}</Text>
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
    <Stack spacing={sectionSpacing}>
      {config.presentation.headerContent}

      {/* Stats stay optional so the same surface can power sparse and dense dashboards. */}
      {config.behavior.stats && config.behavior.stats.length > 0 && (
        <PatternStatsGrid
          stats={config.behavior.stats}
          columns={config.visual.statsColumns ?? 4}
          variant="glass"
          onStatClick={config.behavior.onStatClick}
        />
      )}

      {config.presentation.sections && config.presentation.sections.length > 0 && (
        <Grid columns={config.visual.sectionsColumns ?? 12} gap={sectionSpacing}>
          {config.presentation.sections.map((section) => {
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
                            <Text style={{ color: 'var(--ds-color-text-muted)' }}>
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
              <Grid.Item key={section.key} span={section.span}>
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
