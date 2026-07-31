'use client';

/**
 * @fileoverview ActivitySurface -- full-page activity timeline.
 * @description Wraps PatternActivityLog inside PageShellSurface. The surface owns
 * page chrome, the error state and the pagination footer while delegating the
 * timeline, the filter bar, the empty state and the loading skeleton to the
 * pattern (PT02) — the surface coordinates, it never rebuilds the feed.
 *
 * @remarks
 * Anatomy: PageShellSurface (chrome + actions, alive through every state) ->
 * PatternActivityLog (filters + feed + composed Empty + mirror skeleton) ->
 * pagination island (surface-owned: summary text + canonical Pagination
 * primitive). The pattern root carries the pinned `ds-surface ds-activity`
 * landing hook via its `className` passthrough; the pagination island keeps
 * its own pinned `ds-activity__pagination[data-part="pagination"]` scope.
 *
 * States: initial load swaps the feed for the pattern's own mirror skeleton
 * (never the shell's loading early-return, which would drop the chrome); a
 * refetch keeps the painted feed (stale-while-revalidate) with the region
 * under `aria-busy` and the pagination controls disabled; an empty feed
 * renders the app-provided `presentation.emptyState` slot when declared
 * (previously a dead contract field) or the pattern's composed Empty with the
 * i18n floor; `error`/`onRetry` are additive surface props routed to the
 * SurfaceErrorState kit with the full page chrome alive (SU30/SU31 pattern).
 */

import React from 'react';
import { Flex, Pagination, Stack, Text } from '../../../../../primitives';
import { PatternActivityLog } from '../../../../../patterns';
import type { Activity } from '../../../../../patterns';
import type { ActivitySurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceErrorState } from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { FadeIn, StaggerChildren } from '@/graphics/motion';

export interface ActivitySurfaceProps {
  config: ActivitySurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function ActivitySurface({
  config,
  loading = false,
  error,
  onRetry,
}: ActivitySurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);
  const { tSurfaceOr } = useSurfaceTranslations();

  // Actions render outside the timeline so they remain accessible even when
  // the activity log is empty -- consistent with other surface action placements.
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} access={config.access} />;
  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };

  // Strip surface-specific fields before handing to the pattern. The pattern's
  // activity type is leaner than what the surface config carries, and passing
  // extra fields would violate the pattern's contract.
  const activities: Activity[] = config.behavior.activities.map((a) => ({
    id: a.id,
    user: a.user,
    action: a.action,
    timestamp: a.timestamp,
    entityType: a.entityType,
    entityId: a.entityId,
    diff: a.diff,
    metadata: a.metadata,
  }));

  // Error state renders the full page chrome so header actions stay available
  // even when the data load failed (scheduler/operational precedent).
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const isEmpty = activities.length === 0;
  /* Stale-while-revalidate: the pattern's mirror skeleton (avatar + lines,
     the feed's own shape) only engages when there is no painted feed to
     preserve; a refetch keeps the timeline on screen under aria-busy. The
     page-shell loading early-return is intentionally not engaged because it
     would drop the chrome (SU31 precedent). */
  const feedLoading = loading && isEmpty;
  const showCustomEmpty = isEmpty && !loading && config.presentation.emptyState != null;

  /* Pagination lives at the surface level because the pattern does not
     own data fetching -- the app controls page boundaries. */
  const pagination = config.behavior.pagination;
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / Math.max(1, pagination.pageSize)))
    : 0;

  const activityContent = (
    <Stack spacing="md" aria-busy={loading || undefined}>
      {showCustomEmpty ? (
        /* The custom empty slot takes over the empty presentation wholly and
           keeps the surface root hook that the pinned pattern root would
           otherwise carry (SU34 dead-field repair precedent). */
        <Stack className="ds-surface ds-activity" data-part="root" data-loading="false">
          {config.presentation.emptyState}
        </Stack>
      ) : (
        <PatternActivityLog
          className="ds-surface ds-activity"
          activities={activities}
          filters={config.behavior.filters}
          onFilterChange={config.behavior.onFilterChange}
          actionTypes={config.behavior.actionTypes}
          users={config.behavior.users}
          loading={feedLoading}
          renderActivity={
            config.presentation.renderActivity
              ? (activity: Activity) => config.presentation.renderActivity!(activity)
              : undefined
          }
          onActivityClick={
            config.behavior.onActivityClick
              ? (activity: Activity) => config.behavior.onActivityClick!(activity)
              : undefined
          }
          emptyMessage={tSurfaceOr('activity.empty_message', 'No activity recorded yet.')}
        />
      )}

      {pagination && (
        <Flex
          className="ds-surface ds-activity ds-activity__pagination"
          data-part="pagination"
          justify="between"
          wrap="wrap"
          align="center"
          gap="sm"
        >
          <Text size="sm" color="muted" className="ds-activity__muted-text">
            {tSurfaceOr('activity.pagination_summary', 'Page {current} of {pages} · {total} entries', {
              current: pagination.current,
              pages: totalPages,
              total: pagination.total,
            })}
          </Text>
          {/* The canonical primitive owns the page controls (nav landmark,
              i18n labels, RTL-mirroring chevrons). It renders only when the
              app declares the change contract; the `incremental` load mode has
              no visualization yet (registered gap, notification precedent). */}
          {typeof pagination.onChange === 'function' && pagination.loadMode !== 'incremental' && (
            <Pagination
              current={pagination.current}
              total={pagination.total}
              pageSize={pagination.pageSize}
              size="sm"
              showSizeChanger={Boolean(pagination.pageSizeOptions?.length)}
              disabled={loading}
              onChange={pagination.onChange}
            />
          )}
        </Flex>
      )}
    </Stack>
  );

  return (
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>
          <StaggerChildren staggerDelayMs={profileDefaults.staggerDelay}>
            {activityContent}
          </StaggerChildren>
        </FadeIn>
      ) : (
        activityContent
      )}
    </PageShellSurface>
  );
}
