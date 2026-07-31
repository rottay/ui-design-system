'use client';

/**
 * @fileoverview FileBrowserSurface -- full-page file management shell.
 * @description Wraps PatternFileManager inside PageShellSurface. The surface owns
 * page chrome, header actions and the page-state orchestration (loading mirror,
 * error posture, custom empty slot); the pattern owns the file browsing UI
 * (toolbar, breadcrumb, list/grid views, upload drop zone, selection, rename).
 *
 * @remarks
 * State contract:
 * - `loading` keeps the page chrome mounted and renders a skeleton mirror with
 *   the toolbar + list/grid footprint of the pattern (no early-return shell
 *   skeleton that would unmount the chrome).
 * - `error` (+ optional `onRetry`) swaps the body for the shared surface error
 *   kit while the page chrome and header actions stay mounted.
 * - `presentation.emptyState` (contract slot) replaces the browsing body only
 *   when the current folder has no items; without it, the pattern renders its
 *   own empty state with the surface's localized `emptyMessage`.
 */

import React from 'react';
import { Box, Flex, Skeleton, Stack } from '../../../../../primitives';
import { PatternFileManager } from '../../../../../patterns';
import type { FileItem, FolderItem } from '../../../../../patterns';
import { FadeIn } from '@/graphics/motion';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import type { FileBrowserSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceErrorState } from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import {
  resolveStackSpacing,
  SurfaceAccentBarWrapper,
} from '../../../../runtime/profile-defaults/personality';

export interface FileBrowserSurfaceProps {
  config: FileBrowserSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Row count the list-view mirror paints; close to a first-viewport page of rows. */
const LIST_MIRROR_ROWS = [0, 1, 2, 3, 4, 5] as const;
/** Card count the grid-view mirror paints (2 columns x 4 on the narrowest cut). */
const GRID_MIRROR_CARDS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/**
 * Loading mirror with the pattern's footprint: toolbar row (breadcrumb trail
 * inline-start, action buttons inline-end) over list rows or grid cards. All
 * geometry lives in the surface skin (`ds-file-browser__*` hooks); the Skeleton
 * primitive owns cadence and paint. Exposed as a polite live region so screen
 * readers announce the busy transition instead of a silent skeleton swap.
 */
function FileBrowserLoadingMirror({
  viewMode,
  animation,
  ariaLabel,
}: {
  viewMode: 'grid' | 'list';
  animation: 'pulse' | 'wave';
  ariaLabel: string;
}): React.ReactElement {
  return (
    <Box
      className="ds-file-browser__loading-mirror"
      data-part="loading-mirror"
      role="status"
      aria-label={ariaLabel}
    >
      <Flex
        className="ds-file-browser__skeleton-toolbar"
        data-part="skeleton-toolbar"
        justify="between"
        align="center"
        gap={8}
      >
        <Skeleton
          className="ds-file-browser__skeleton-breadcrumb"
          variant="text"
          animation={animation}
          active
        />
        <Flex className="ds-file-browser__skeleton-actions" gap={8}>
          <Skeleton
            className="ds-file-browser__skeleton-action"
            variant="text"
            animation={animation}
            active
          />
          <Skeleton
            className="ds-file-browser__skeleton-action"
            variant="text"
            animation={animation}
            active
          />
        </Flex>
      </Flex>
      {viewMode === 'grid' ? (
        <Box className="ds-file-browser__skeleton-grid" data-part="skeleton-grid">
          {GRID_MIRROR_CARDS.map((index) => (
            <Box key={index} className="ds-file-browser__skeleton-card">
              <Skeleton
                className="ds-file-browser__skeleton-card-icon"
                variant="text"
                animation={animation}
                active
              />
              <Skeleton
                className="ds-file-browser__skeleton-card-line"
                variant="text"
                animation={animation}
                active
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Stack
          className="ds-file-browser__skeleton-list"
          data-part="skeleton-list"
          spacing="sm"
        >
          {LIST_MIRROR_ROWS.map((index) => (
            <Flex key={index} className="ds-file-browser__skeleton-row" align="center" gap={8}>
              <Skeleton
                className="ds-file-browser__skeleton-row-icon"
                variant="text"
                animation={animation}
                active
              />
              <Skeleton
                className="ds-file-browser__skeleton-row-line"
                variant="text"
                animation={animation}
                active
              />
            </Flex>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export function FileBrowserSurface({
  config,
  loading = false,
  error,
  onRetry,
}: FileBrowserSurfaceProps): React.ReactElement {
  // Visual defaults cascade: explicit surface config -> product profile -> DS
  // defaults. The contract declares `visual.profileOverrides`; wiring it here
  // realizes that cascade (section spacing, entrance motion, accent bar).
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { tSurfaceOr } = useSurfaceTranslations();
  const { isMobile, prefersReducedMotion } = useBreakpoints();
  const tokens = useTokens();
  // Same skeleton animation governance as the shared state kit: reduced motion
  // (or a calm personality) falls back to the simpler pulse.
  const skeletonAnimation =
    prefersReducedMotion || tokens.personality.animation.skeletonStyle === 'pulse'
      ? 'pulse'
      : 'wave';

  const actionsNode = (
    <SurfaceActionBar actions={config.behavior.actions} access={config.access} />
  );

  // The pattern requires discriminated union types (FileItem / FolderItem).
  // We use type predicates to narrow from the surface config's types into
  // the pattern's discriminated union instead of casting with `as`.
  const allItems = [...config.behavior.files, ...config.behavior.folders];
  const files = allItems.filter((i): i is FileItem => i.type === 'file');
  const folders = allItems.filter((i): i is FolderItem => i.type === 'folder');

  // Resolved here (not only inside the pattern) so the root data-view hook and
  // the loading mirror agree with the pattern's own default.
  const viewMode = config.visual.viewMode ?? 'list';
  const isEmpty = files.length + folders.length === 0;

  const chrome = { ...config.presentation.chrome, maxWidth: config.visual.maxWidth };

  // Error posture (idiom data/list): the page chrome and header actions stay
  // mounted; the body becomes the shared error kit with optional retry.
  if (error) {
    return (
      <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const browserBody = (
    <Stack
      className="ds-surface ds-file-browser"
      data-part="root"
      data-view={viewMode}
      data-mobile={isMobile ? 'true' : 'false'}
      data-loading={loading ? 'true' : 'false'}
      data-empty={isEmpty ? 'true' : 'false'}
      aria-busy={loading || undefined}
      spacing={resolveStackSpacing(profileDefaults.sectionSpacing)}
    >
      {loading ? (
        <FileBrowserLoadingMirror
          viewMode={viewMode}
          animation={skeletonAnimation}
          ariaLabel={tSurfaceOr('file_browser.loading_aria', 'Loading files')}
        />
      ) : isEmpty && config.presentation.emptyState ? (
        // Contract slot: replaces only the browsing body of an empty folder;
        // the page chrome and header actions stay mounted.
        <Box className="ds-file-browser__empty-slot" data-part="empty-slot">
          {config.presentation.emptyState}
        </Box>
      ) : (
        <PatternFileManager
          files={files}
          folders={folders}
          currentPath={config.behavior.currentPath}
          viewMode={viewMode}
          selectedItems={config.behavior.selectedItems}
          onUpload={config.behavior.onUpload}
          onDelete={config.behavior.onDelete}
          onNavigate={config.behavior.onNavigate}
          onSelectionChange={config.behavior.onSelectionChange}
          onViewModeChange={config.behavior.onViewModeChange}
          onRename={config.behavior.onRename}
          renderFileIcon={config.presentation.renderFileIcon}
          emptyMessage={tSurfaceOr('file_browser.empty_message', 'No files or folders found.')}
        />
      )}
    </Stack>
  );

  // loading={false} on the shell: the chrome survives the loading phase while
  // the body swaps to the mirror (the shell's generic page skeleton would
  // unmount title/actions).
  return (
    <PageShellSurface chrome={chrome} actions={actionsNode} loading={false}>
      <SurfaceAccentBarWrapper defaults={profileDefaults}>
        {profileDefaults.animateEntrance ? (
          <FadeIn durationMs={profileDefaults.entranceDuration}>{browserBody}</FadeIn>
        ) : (
          browserBody
        )}
      </SurfaceAccentBarWrapper>
    </PageShellSurface>
  );
}
