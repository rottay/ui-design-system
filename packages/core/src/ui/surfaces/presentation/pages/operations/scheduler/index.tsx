'use client';

/**
 * @fileoverview SchedulerSurface -- calendar/scheduling page shell.
 * @description Wraps PatternCalendarView with date navigation, toolbar actions, and
 * optional sidebar content. Event rendering is delegated to the app when a richer
 * domain-specific presentation is needed.
 *
 * @remarks
 * The surface coordinates: page chrome lives in PageShellSurface, the calendar
 * in PatternCalendarView, and the state kits (mirror skeleton, empty, error
 * with retry) in the shared surface helpers — the surface owns the page
 * structure and the responsive choreography, never the composed chrome.
 */

import React, { useMemo } from 'react';
import { Box, Card, Grid, Stack, Text } from '../../../../../primitives';
import { PatternCalendarView, type CalendarEvent } from '../../../../../patterns';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import type { SchedulerSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState, SurfaceErrorState } from '../../../../runtime/helpers/states';
import { FadeIn, StaggerChildren } from '@/graphics/motion';
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

type SurfaceCardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';

/** Loading placeholder that mirrors the scheduler's geometry: the calendar
 *  card (header strip + grid body, or agenda rows in list view) and the
 *  timeline rail keep the 8/4 split through the load, so the swap to real
 *  content is paint-only, never a layout shift. Geometry hooks are
 *  `data-part`s; the pulse and block chrome live in the SchedulerSurface
 *  skin. */
function SchedulerSkeleton({
  cardVariant,
  sectionSpacing,
  showTimeline,
  shouldStack,
  isListView,
}: {
  cardVariant: SurfaceCardVariant;
  sectionSpacing: 'sm' | 'md' | 'lg';
  showTimeline: boolean;
  shouldStack: boolean;
  isListView: boolean;
}): React.ReactElement {
  return (
    <Grid columns={showTimeline && !shouldStack ? 12 : 1} gap={sectionSpacing}>
      <Grid.Item span={showTimeline && !shouldStack ? 8 : undefined}>
        <Card variant={cardVariant}>
          <Card.Body>
            {isListView ? (
              <Stack spacing="sm">
                {['a', 'b', 'c', 'd'].map((key) => (
                  <Box
                    key={`scheduler-skeleton-agenda-${key}`}
                    data-part="scheduler-skeleton-block"
                    data-size="agenda"
                  />
                ))}
              </Stack>
            ) : (
              <Stack spacing="sm">
                <Box data-part="scheduler-skeleton-block" data-size="header" />
                <Box data-part="scheduler-skeleton-block" data-size="calendar" />
              </Stack>
            )}
          </Card.Body>
        </Card>
      </Grid.Item>

      {showTimeline && (
        <Grid.Item span={!shouldStack ? 4 : undefined}>
          <Card variant={cardVariant}>
            <Card.Body>
              <Box data-part="scheduler-skeleton-block" data-size="aside" />
            </Card.Body>
          </Card>
        </Grid.Item>
      )}
    </Grid>
  );
}

export interface SchedulerSurfaceProps {
  config: SchedulerSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function SchedulerSurface({
  config,
  loading = false,
  error,
  onRetry,
}: SchedulerSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { tSurfaceOr, locale } = useSurfaceTranslations();
  const { shouldStack, isMobile, hasResolvedViewport } = useSurfaceResponsiveLayout(config.visual);
  // Visual defaults cascade: explicit surface config -> product profile ->
  // DS defaults (spacing scale, card material, motion intensity).
  const sectionSpacing = resolveStackSpacing(profileDefaults.sectionSpacing);
  const cardVariant = profileDefaults.cardVariant;
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
  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };
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

  // Error state renders full page chrome so header actions stay available
  // even when the data load failed (report/operational precedent).
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  // First paint with no events gets the mirror skeleton; a refetch with
  // events keeps them painted (stale-while-revalidate) under aria-busy.
  const isInitialLoad = loading && config.behavior.events.length === 0;

  const schedulerContent = (
    <Stack
      className="ds-surface ds-scheduler"
      data-part="root"
      data-mobile={resolvedMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      data-mobile-view={resolvedMobile ? resolvedView : undefined}
      data-mobile-timeline={showTimeline ? 'visible' : 'hidden'}
      aria-busy={loading || undefined}
      spacing={sectionSpacing}
    >
      {isInitialLoad ? (
        /* Mirror skeleton: the page chrome stays live and the swap is
           paint-only. The page-shell loading early-return is NOT used here
           because it would drop the surface's own shape (operational
           precedent). */
        <SchedulerSkeleton
          cardVariant={cardVariant}
          sectionSpacing={sectionSpacing}
          showTimeline={showTimeline}
          shouldStack={shouldStack}
          isListView={resolvedView === 'list'}
        />
      ) : config.behavior.events.length === 0 ? (
        config.presentation.emptyState ?? (
          <SurfaceEmptyState
            title={tSurfaceOr('scheduler.empty_title', 'No scheduled events')}
            description={tSurfaceOr(
              'scheduler.empty_description',
              'Populate the scheduler with events to render the calendar.'
            )}
          />
        )
      ) : (
        <Grid columns={showTimeline && !shouldStack ? 12 : 1} gap={sectionSpacing}>
          <Grid.Item span={showTimeline && !shouldStack ? 8 : undefined}>
            <Card variant={cardVariant}>
              <Card.Body>
                {invalidEventCount > 0 && (
                  <p
                    className="ds-scheduler__data-warning"
                    data-part="invalid-events-warning"
                    role="status"
                  >
                    {tSurfaceOr(
                      'scheduler.invalid_events',
                      'Events with an invalid start time: {count}',
                      { count: invalidEventCount }
                    )}
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
                    // The agenda replaces the calendar grid in list view, so
                    // the list itself carries the accessible name the
                    // calendar's own landmarks would otherwise provide.
                    aria-label={tSurfaceOr('scheduler.agenda_aria', 'Scheduled events')}
                  >
                    {normalizedEvents.map(({ event, start }) => {
                        const eventContent = (
                          <>
                            {start ? (
                              <time dateTime={start.toISOString()}>
                                <Text size="sm">
                                  {event.allDay
                                    ? tSurfaceOr('scheduler.all_day', 'All day')
                                    : formatTime(start, locale, { timeZone })}
                                </Text>
                              </time>
                            ) : (
                              <span data-part="invalid-event-time">
                                <Text size="sm">
                                  {tSurfaceOr('scheduler.invalid_time', 'Time unavailable')}
                                </Text>
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
                              /* Native button retained on purpose: the DS
                                 Button recipe chrome (variant paint, sizing,
                                 inline-flex) lives in the later
                                 `rottay-engines` layer and would override this
                                 row's grid/paint from `rottay-components`, and
                                 `!important` is forbidden. The pinned contract
                                 (`data-part="agenda-event"` as click target)
                                 is preserved verbatim. Minimal contract for
                                 the swap: an unstyled/pressable Button
                                 variant. */
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
                    /* Stale-while-revalidate: a refetch keeps the painted
                       events; the pattern's own loading swap (Spinner instead
                       of the grid) only engages when there is nothing valid
                       to keep on screen. */
                    loading={loading && validCalendarEvents.length === 0}
                    /* True per-instance geometry from the contract (sanctioned
                       inline passthrough), not reusable paint. */
                    style={{ minHeight: config.visual.height }}
                  />
                )}
              </Card.Body>
            </Card>
          </Grid.Item>

          {showTimeline && (
            <Grid.Item span={!shouldStack ? 4 : undefined}>
              <Card variant={cardVariant}>
                <Card.Body>{config.presentation.sidebar}</Card.Body>
              </Card>
            </Grid.Item>
          )}
        </Grid>
      )}

      {config.presentation.footer}
    </Stack>
  );

  return (
    /* The page chrome (title + toolbar actions) stays live through the load:
       the surface owns the mirror skeleton, so the shell's loading
       early-return is intentionally not engaged. */
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>
          <StaggerChildren staggerDelayMs={profileDefaults.staggerDelay}>
            {schedulerContent}
          </StaggerChildren>
        </FadeIn>
      ) : (
        schedulerContent
      )}
    </PageShellSurface>
  );
}
