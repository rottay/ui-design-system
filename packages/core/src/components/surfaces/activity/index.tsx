'use client';

/**
 * ActivitySurface
 *
 * Full-page activity timeline surface wrapping PatternActivityLog inside
 * PageShellSurface. The surface owns the page chrome and pagination while
 * delegating the timeline rendering to the underlying pattern.
 */

import React from 'react';
import { Flex, Text } from '../../primitives';
import { PatternActivityLog } from '../../patterns';
import type { ActivitySurfaceConfig } from '../types';
import { PageShellSurface } from '../page-shell';
import { SurfaceActionBar } from '../shared';

export interface ActivitySurfaceProps {
  config: ActivitySurfaceConfig;
  loading?: boolean;
}

export function ActivitySurface({
  config,
  loading = false,
}: ActivitySurfaceProps): React.ReactElement {
  const actionsNode = <SurfaceActionBar actions={config.behavior.actions} permissions={config.permissions} />;

  const activities = config.behavior.activities.map((a) => ({
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
            ? (activity) => config.presentation.renderActivity!(activity as any)
            : undefined
        }
        onActivityClick={
          config.behavior.onActivityClick
            ? (activity) => config.behavior.onActivityClick!(activity as any)
            : undefined
        }
        emptyMessage="No activity recorded yet."
      />

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
