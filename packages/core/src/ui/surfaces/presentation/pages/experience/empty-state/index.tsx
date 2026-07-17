'use client';

/**
 * @fileoverview EmptyStateSurface -- full-page "nothing here yet" state.
 * @description Route-level empty state with primary/secondary actions, icon, and
 * optional guidance content. Different from the inline SurfaceEmptyState used
 * inside other surfaces.
 */

import React from 'react';
import { Stack } from '../../../../../primitives';
import type { EmptyStateSurfaceConfig } from '../../../../foundation/contracts';
import { filterSurfaceActions, resolveSurfaceAction } from '../../../../runtime/helpers';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface EmptyStateSurfaceProps {
  config: EmptyStateSurfaceConfig;
}

export function EmptyStateSurface({
  config,
}: EmptyStateSurfaceProps): React.ReactElement {
  // Primary and secondary actions use final app-resolved visibility so the
  // state gracefully degrades when the create action is unavailable.
  const primaryAction = resolveSurfaceAction(config.behavior.primaryAction, config.access);
  const secondaryActions = filterSurfaceActions(
    config.behavior.secondaryAction ? [config.behavior.secondaryAction] : undefined,
    config.access
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
          access={config.access}
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
