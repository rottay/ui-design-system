'use client';

/**
 * @fileoverview SchedulerSurface -- calendar/scheduling page shell.
 * @description Wraps PatternCalendarView with date navigation, toolbar actions, and
 * optional sidebar content. Event rendering is delegated to the app when a richer
 * domain-specific presentation is needed.
 */

import React, { useMemo } from 'react';
import { Card, Grid, Stack, Text } from '../../../../../primitives';
import { PatternCalendarView, type CalendarEvent } from '../../../../../patterns';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import type { SchedulerSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';
import { formatTime } from '@/foundation/i18n/runtime/formatting';

interface NormalizedSchedulerEvent {
  event: CalendarEvent;
  start: Date | null;
  sourceIndex: number;
}

function parseEventStart(value: Date | string): Date | null {
  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export interface SchedulerSurfaceProps {
  config: SchedulerSurfaceConfig;
  loading?: boolean;
}

export function SchedulerSurface({
  config,
  loading = false,
}: SchedulerSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { tSurface, locale } = useSurfaceTranslations();
  const { shouldStack, isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout(config.visual);
  const resolvedMobile = isMobile && hasResolvedViewport;
  const showTimeline =
    !!config.presentation.sidebar &&
    !(resolvedMobile && config.visual.hideTimelineOnMobile === true);
  const resolvedView =
    config.behavior.activeView ??
    (resolvedMobile ? config.visual.mobileView : undefined) ??
    config.visual.defaultView ??
    profileDefaults.schedulerView;
  const normalizedEvents = useMemo<NormalizedSchedulerEvent[]>(
    () =>
      config.behavior.events
        .map((event, sourceIndex) => ({
          event,
          start: parseEventStart(event.start),
          sourceIndex,
        }))
        .sort((left, right) => {
          const leftTime = left.start?.getTime() ?? Number.POSITIVE_INFINITY;
          const rightTime = right.start?.getTime() ?? Number.POSITIVE_INFINITY;
          return leftTime === rightTime ? left.sourceIndex - right.sourceIndex : leftTime - rightTime;
        }),
    [config.behavior.events]
  );
  const validCalendarEvents = normalizedEvents
    .filter((entry) => entry.start !== null)
    .map((entry) => entry.event);
  const invalidEventCount = normalizedEvents.length - validCalendarEvents.length;
  const timeZone = config.presentation.timeZone ?? 'UTC';
  // toolbarStart/toolbarEnd slots let apps inject view toggles or date
  // navigation controls around the standard action buttons without
  // overriding the entire actions area.
  const actionsNode = (
    <Stack spacing="sm">
      {config.presentation.toolbarStart}
      <SurfaceActionBar actions={config.behavior.actions} access={config.access} />
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
        <Grid
          className="ds-surface ds-scheduler"
          data-mobile-view={resolvedMobile ? resolvedView : undefined}
          data-mobile-timeline={showTimeline ? 'visible' : 'hidden'}
          columns={showTimeline && !shouldStack ? 12 : 1}
          gap="lg"
        >
          <Grid.Item span={showTimeline && !shouldStack ? 8 : undefined}>
            <Card variant="outlined">
              <Card.Body>
                {invalidEventCount > 0 && (
                  <p
                    className="ds-scheduler__data-warning"
                    data-part="invalid-events-warning"
                    role="status"
                  >
                    {tSurface('scheduler.invalid_events', { count: invalidEventCount })}
                  </p>
                )}
                {/* Calendar view cascades: explicit active view -> visual default ->
                    product profile default. This lets the app control the view
                    programmatically while still honoring the product-level
                    preference (e.g. "week" for scheduling-heavy products). */}
                {resolvedView === 'list' ? (
                  <ul
                    className="ds-scheduler__agenda"
                    data-part="mobile-agenda"
                  >
                    {normalizedEvents.map(({ event, start }) => {
                        const eventContent = (
                          <>
                            {start ? (
                              <time dateTime={start.toISOString()}>
                                <Text size="sm">
                                  {event.allDay
                                    ? tSurface('scheduler.all_day')
                                    : formatTime(start, locale, { timeZone })}
                                </Text>
                              </time>
                            ) : (
                              <span data-part="invalid-event-time">
                                <Text size="sm">{tSurface('scheduler.invalid_time')}</Text>
                              </span>
                            )}
                            <span data-part="agenda-event-content">
                              {config.presentation.renderEvent?.(event) ?? event.title}
                            </span>
                          </>
                        );

                        return (
                          <li key={event.id} data-part="agenda-item">
                            {config.behavior.onEventClick ? (
                              <button
                                type="button"
                                className="ds-scheduler__agenda-event"
                                data-part="agenda-event"
                                onClick={() => config.behavior.onEventClick?.(event)}
                              >
                                {eventContent}
                              </button>
                            ) : (
                              <div
                                className="ds-scheduler__agenda-event"
                                data-part="agenda-event"
                              >
                                {eventContent}
                              </div>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <PatternCalendarView
                    events={validCalendarEvents}
                    view={resolvedView}
                    currentDate={config.behavior.currentDate}
                    onDateChange={config.behavior.onDateChange}
                    onViewChange={config.behavior.onViewChange}
                    onEventClick={config.behavior.onEventClick}
                    onDateClick={config.behavior.onDateClick}
                    renderEvent={config.presentation.renderEvent}
                    loading={loading}
                    style={{ minHeight: config.visual.height }}
                  />
                )}
              </Card.Body>
            </Card>
          </Grid.Item>

          {showTimeline && (
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
