'use client';

/**
 * @fileoverview EmptyStateSurface -- full-page "nothing here yet" state.
 * @description Route-level empty state that coordinates the shared
 * `SurfaceEmptyState` kit (PT18 pattern: visual well, copy hierarchy, primary
 * action tray) with optional page chrome, a secondary action row, and caller
 * guidance content. Unlike the inline kit usage inside other surfaces, this
 * surface owns the page anatomy: root identity (`ds-empty-state-surface` with
 * always-stamped state attributes), profile-driven rhythm and entrance
 * motion, and the page/embedded frame coordination painted by its skin.
 * The surface owns no visible copy -- title, description, icon, content and
 * action labels are all caller-provided through the contract, so there is no
 * `surfaces.empty_state` i18n namespace (the kit's fallbacks live under
 * `surfaces.states.*`).
 */

import React from 'react';
import { Box, Stack } from '../../../../../primitives';
import { FadeIn } from '@/graphics/motion';
import type { EmptyStateSurfaceConfig } from '../../../../foundation/contracts';
import { filterSurfaceActions, resolveSurfaceAction } from '../../../../runtime/helpers';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import { useSurfaceResponsiveLayout } from '../../../../runtime/responsive';

export interface EmptyStateSurfaceProps {
  config: EmptyStateSurfaceConfig;
}

export function EmptyStateSurface({
  config,
}: EmptyStateSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { isMobile } = useSurfaceResponsiveLayout();
  // Primary and secondary actions use final app-resolved visibility so the
  // state gracefully degrades when the create action is unavailable.
  const primaryAction = resolveSurfaceAction(config.behavior.primaryAction, config.access);
  const secondaryActions = filterSurfaceActions(
    config.behavior.secondaryAction ? [config.behavior.secondaryAction] : undefined,
    config.access
  );
  const chrome = config.presentation.chrome;

  // Single-column anatomy: framed state block, quiet secondary row, guidance.
  // The skin keys on the always-stamped data attributes below; the direct
  // children carry the part names (`secondary-actions`, `content`).
  const content = (
    <Stack
      className="ds-surface ds-empty-state-surface"
      data-part="root"
      data-chrome={chrome ? 'page' : 'embedded'}
      data-mobile={isMobile ? 'true' : 'false'}
      spacing={resolveStackSpacing(profileDefaults.sectionSpacing)}
    >
      <SurfaceEmptyState
        title={config.presentation.title}
        description={config.presentation.description}
        icon={config.presentation.icon}
        action={primaryAction}
      />
      {secondaryActions.length > 0 && (
        <Box data-part="secondary-actions">
          <SurfaceActionBar
            actions={secondaryActions}
            access={config.access}
            justify="center"
          />
        </Box>
      )}
      {config.presentation.content && (
        <Box data-part="content">{config.presentation.content}</Box>
      )}
    </Stack>
  );

  // Entrance motion is personality-driven; FadeIn terminates at the final
  // state under reduced motion, so no surface-level motion guard is needed.
  const revealed = profileDefaults.animateEntrance ? (
    <FadeIn durationMs={profileDefaults.entranceDuration}>{content}</FadeIn>
  ) : (
    content
  );

  // When no chrome is provided, the empty state renders without page shell
  // wrapping. This is useful when the empty state is embedded inside another
  // surface rather than being a standalone route; the skin quiets the pattern
  // frame for that case (see `empty-state-surface.css`).
  if (!chrome) {
    return revealed;
  }

  return (
    <PageShellSurface
      chrome={{
        ...chrome,
        maxWidth: config.visual.maxWidth ?? chrome.maxWidth,
      }}
    >
      {revealed}
    </PageShellSurface>
  );
}
