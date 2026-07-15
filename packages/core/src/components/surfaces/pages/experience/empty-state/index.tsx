'use client';

/**
 * @fileoverview EmptyStateSurface -- full-page "nothing here yet" state.
 * @description Route-level empty state with primary/secondary actions, icon, and
 * optional guidance content. Different from the inline SurfaceEmptyState used
 * inside other surfaces.
 */

import React from 'react';
import { Stack } from '../../../../primitives';
import type { EmptyStateSurfaceConfig } from '../../../foundation/types';
import { filterSurfaceActions, resolveSurfaceAction } from '../../../foundation/helpers';
import { PageShellSurface } from '../../../layout/page-shell';
import { SurfaceActionBar } from '../../../foundation/shared';
import { SurfaceEmptyState } from '../../../foundation/states';

export interface EmptyStateSurfaceProps {
  config: EmptyStateSurfaceConfig;
}

export function EmptyStateSurface({
  config,
}: EmptyStateSurfaceProps): React.ReactElement {
  // Primary and secondary actions are permission-filtered so the empty
  // state gracefully degrades when the user lacks create permissions.
  const primaryAction = resolveSurfaceAction(config.behavior.primaryAction, config.access ?? config.permissions);
  const secondaryActions = filterSurfaceActions(
    config.behavior.secondaryAction ? [config.behavior.secondaryAction] : undefined,
    config.access ?? config.permissions
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
          permissions={config.access ?? config.permissions}
          justify="center"
        />
      )}
      {config.presentation.content}
    </Stack>
  );

  // When no chrome is provided, the empty state renders without page shell
  // wrapping. This is useful when the empty state is embedded inside another
  // surface rather than being a standalone route.
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
