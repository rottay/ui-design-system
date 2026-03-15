'use client';

/**
 * SchedulerSurface
 *
 * Scheduling pages repeat the same contract: date navigation, calendar view,
 * toolbar actions, and optional contextual sidebar content. This surface keeps
 * that structure reusable while delegating event rendering to the app when a
 * richer domain-specific presentation is needed.
 */

import React from 'react';
import { Card, Grid, Stack } from '../../primitives';
import { PatternCalendarView } from '../../patterns';
import { useSurfaceTranslations } from '../i18n';
import type { SchedulerSurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { useSurfaceProfileDefaults } from '../profile-defaults';
import { useSurfaceResponsiveLayout } from '../responsive';
import { SurfaceActionBar } from '../shared';
import { SurfaceEmptyState } from '../states';

export interface SchedulerSurfaceProps {
  config: SchedulerSurfaceConfig;
  loading?: boolean;
}

export function SchedulerSurface({
  config,
  loading = false,
}: SchedulerSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaults();
  const { tSurface } = useSurfaceTranslations();
  const { shouldStack } = useSurfaceResponsiveLayout(config.visual);
  const actionsNode = (
    <Stack spacing="sm">
      {config.presentation.toolbarStart}
      <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />
      {config.presentation.toolbarEnd}
    </Stack>
  );

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      actions={actionsNode}
      loading={loading}
    >
      {config.behavior.events.length === 0 && !loading ? (
        config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurface('scheduler.empty_title')}
            description={tSurface('scheduler.empty_description')}
          />
        )
      ) : (
        <Grid columns={config.presentation.sidebar && !shouldStack ? 12 : 1} gap="lg">
          <Grid.Item span={config.presentation.sidebar && !shouldStack ? 8 : undefined}>
            <Card variant="outlined">
              <Card.Body>
                <PatternCalendarView
                  events={config.behavior.events}
                  view={
                    config.behavior.activeView ??
                    config.visual.defaultView ??
                    profileDefaults.schedulerView
                  }
                  currentDate={config.behavior.currentDate}
                  onDateChange={config.behavior.onDateChange}
                  onViewChange={config.behavior.onViewChange}
                  onEventClick={config.behavior.onEventClick}
                  onDateClick={config.behavior.onDateClick}
                  renderEvent={config.presentation.renderEvent}
                  loading={loading}
                  style={{ minHeight: config.visual.height }}
                />
              </Card.Body>
            </Card>
          </Grid.Item>

          {config.presentation.sidebar && (
            <Grid.Item span={!shouldStack ? 4 : undefined}>
              <Card variant="outlined">
                <Card.Body>{config.presentation.sidebar}</Card.Body>
              </Card>
            </Grid.Item>
          )}
        </Grid>
      )}

      {config.presentation.footer}
    </PageShellSurface>
  );
}
