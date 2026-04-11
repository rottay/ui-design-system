'use client';

/**
 * @fileoverview ActivitySurface -- full-page activity timeline.
 * @description Wraps PatternActivityLog inside PageShellSurface. The surface owns
 * page chrome and pagination while delegating timeline rendering to the pattern.
 */

import React from 'react';
import { Flex, Text } from '../../../../primitives';
import { PatternActivityLog } from '../../../../patterns';
import type { Activity } from '../../../../patterns';
import type { ActivitySurfaceConfig } from '../../../foundation/types';
import { PageShellSurface } from '../../../layout/page-shell';
import { SurfaceActionBar } from '../../../foundation/shared';

export interface ActivitySurfaceProps {
  config: ActivitySurfaceConfig;
  loading?: boolean;
}

export function ActivitySurface({
  config,
  loading = false,
}: ActivitySurfaceProps): React.ReactElement {
  // Actions render outside the timeline so they remain accessible even when
  // the activity log is empty -- consistent with other surface action placements.
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />;

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

  return (
    <PageShellSurface
      chrome={{ ...config.presentation.chrome, maxWidth: config.visual.maxWidth }}
      actions={actionsNode}
      loading={loading}
    >
      <PatternActivityLog
        activities={activities}
        filters={config.behavior.filters}
        onFilterChange={config.behavior.onFilterChange}
        actionTypes={config.behavior.actionTypes}
        users={config.behavior.users}
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
        emptyMessage="No activity recorded yet."
      />

      {/* Pagination lives at the surface level because the pattern does not
          own data fetching -- the app controls page boundaries. */}
      {config.behavior.pagination && (
        <Flex justify="end" style={{ marginTop: 16 }}>
          <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
            Page {config.behavior.pagination.current} - {config.behavior.pagination.total} total entries
          </Text>
        </Flex>
      )}
    </PageShellSurface>
  );
}
