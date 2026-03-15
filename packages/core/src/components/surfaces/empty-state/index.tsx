'use client';

/**
 * EmptyStateSurface
 *
 * A page-sized empty state is different from an inline empty widget. This
 * surface standardizes the route-level version so create-first screens stop
 * hand-rolling their own shell around the same "nothing here yet" message.
 */

import React from 'react';
import { Stack } from '../../primitives';
import type { EmptyStateSurfaceConfig } from '../types';
import { filterSurfaceActions, resolveSurfaceAction } from '../helpers';
import { PageShellSurface } from '../page-shell';
import { SurfaceActionBar } from '../shared';
import { SurfaceEmptyState } from '../states';

export interface EmptyStateSurfaceProps {
  config: EmptyStateSurfaceConfig;
}

export function EmptyStateSurface({
  config,
}: EmptyStateSurfaceProps): React.ReactElement {
  const primaryAction = resolveSurfaceAction(config.behavior.primaryAction, config.permissions);
  const secondaryActions = filterSurfaceActions(
    config.behavior.secondaryAction ? [config.behavior.secondaryAction] : undefined,
    config.permissions
  );

  const content = (
    <Stack spacing="lg">
      <SurfaceEmptyState
        title={config.presentation.title}
        description={config.presentation.description}
        icon={config.presentation.icon}
        action={primaryAction}
      />
      {secondaryActions.length > 0 && (
        <SurfaceActionBar
          actions={secondaryActions}
          permissions={config.permissions}
          justify="center"
        />
      )}
      {config.presentation.content}
    </Stack>
  );

  if (!config.presentation.chrome) {
    return content;
  }

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
    >
      {content}
    </PageShellSurface>
  );
}
