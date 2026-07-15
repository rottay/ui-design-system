'use client';

/**
 * @fileoverview SchedulerSurface -- calendar/scheduling page shell.
 * @description Wraps PatternCalendarView with date navigation, toolbar actions, and
 * optional sidebar content. Event rendering is delegated to the app when a richer
 * domain-specific presentation is needed.
 */

import React from 'react';
import { Card, Grid, Stack } from '../../../../primitives';
import { PatternCalendarView } from '../../../../patterns';
import { useSurfaceTranslations } from '../../../foundation/i18n';
import type { SchedulerSurfaceConfig } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { useSurfaceProfileDefaults } from '../../../foundation/profile-defaults';
import { useSurfaceResponsiveLayout } from '../../../foundation/responsive';
import { SurfaceActionBar } from '../../../foundation/shared';
import { SurfaceEmptyState } from '../../../foundation/states';

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
  // toolbarStart/toolbarEnd slots let apps inject view toggles or date
  // navigation controls around the standard action buttons without
  // overriding the entire actions area.
  const actionsNode = (
    <Stack spacing="sm">
      {config.presentation.toolbarStart}
      <SurfaceActionBar actions={config.behavior.actions} permissions={config.access ?? config.permissions} />
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
                {/* Calendar view cascades: explicit active view -> visual default ->
                    product profile default. This lets the app control the view
                    programmatically while still honoring the product-level
                    preference (e.g. "week" for scheduling-heavy products). */}
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
