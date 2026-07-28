'use client';

/**
 * @fileoverview Extended surface state components for the lifecycle state machine.
 *
 * @description Provides reusable visual primitives for every surface lifecycle state:
 * loading skeleton, empty state, error state, stale data banner, and offline banner.
 *
 * These complement the existing SurfaceLoadingState, SurfaceEmptyState, and
 * SurfaceErrorState in the sibling `index.tsx` by adding stale/offline awareness
 * and a skeleton variant optimized for the useSurfaceState hook.
 *
 * All components use DS CSS variables and primitives -- no hardcoded colors.
 */

import type { ReactNode } from 'react';
import { Alert, Button, Card, Flex, Skeleton, Stack, Text } from '../../../../../../primitives';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { useSurfaceTranslations } from '..';

// ---------------------------------------------------------------------------
// SurfaceLoadingSkeleton
// ---------------------------------------------------------------------------

export interface SurfaceLoadingSkeletonProps {
  /** Number of skeleton rows to render. Defaults to 6. */
  rows?: number;
  /** Whether to show a header skeleton above the rows. */
  showHeader?: boolean;
}

/**
 * A skeleton placeholder for surfaces in the `loading` state.
 *
 * Renders shimmer bars that approximate a data table or list. The animation
 * style respects the user's reduced-motion preference and the personality
 * token `animation.skeletonStyle`.
 */
export function SurfaceLoadingSkeleton({
  rows = 6,
  showHeader = true,
}: SurfaceLoadingSkeletonProps): React.ReactElement {
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();

  const skeletonAnimation =
    prefersReducedMotion || tokens.personality.animation.skeletonStyle === 'pulse'
      ? 'pulse'
      : 'wave';

  return (
    <Stack className="ds-surface ds-loading-skeleton" data-part="root" spacing="md">
      {showHeader && (
        <Flex data-part="header" gap={4} align="center">
          <Skeleton
            className="ds-loading-skeleton__header-primary"
            variant="text"
            rows={1}
            animation={skeletonAnimation}
            active
          />
          <Skeleton
            className="ds-loading-skeleton__header-secondary"
            variant="text"
            rows={1}
            animation={skeletonAnimation}
            active
          />
        </Flex>
      )}
      <Skeleton
        className="ds-loading-skeleton__rows"
        variant="text"
        rows={rows}
        animation={skeletonAnimation}
        active
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// SurfaceEmptyState
// ---------------------------------------------------------------------------

export interface SurfaceEmptyStateActionConfig {
  label: string;
  onClick: () => void;
}

export interface SurfaceEmptyStateCardProps {
  /** Icon rendered above the title. */
  icon?: ReactNode;
  /** Title text. Defaults to an i18n key. */
  title?: string;
  /** Description text. Defaults to an i18n key. */
  description?: string;
  /** Optional call-to-action button. */
  action?: SurfaceEmptyStateActionConfig;
}

/**
 * Empty state for surfaces that have loaded data but the result set is empty.
 *
 * Renders a centered card with an optional icon, title, description, and
 * action button. All text defaults to i18n translations so surfaces can
 * display a meaningful empty state without any configuration.
 */
export function SurfaceEmptyStateCard({
  icon,
  title,
  description,
  action,
}: SurfaceEmptyStateCardProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();

  return (
    <Card className="ds-surface ds-empty-state-card" variant="outlined">
      <Card.Body className="ds-empty-state-card__body">
        <Flex data-part="content" direction="column" align="center" gap={4}>
          {icon && (
            <Text data-part="icon">
              {icon}
            </Text>
          )}
          <Stack data-part="copy" spacing="xs">
            <Text
              data-part="title"
              as="p"
            >
              {title ?? tSurface('states.empty_title')}
            </Text>
            <Text
              data-part="description"
            >
              {description ?? tSurface('states.empty_description')}
            </Text>
          </Stack>
          {action && (
            <Button className="ds-empty-state-card__action" variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </Flex>
      </Card.Body>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SurfaceErrorState
// ---------------------------------------------------------------------------

export interface SurfaceErrorStateCardProps {
  /** The error object or message. */
  error: unknown;
  /** Title for the error card. */
  title?: string;
  /** Description override. When omitted the error message is shown. */
  description?: string;
  /** Retry handler. When provided, a retry button is rendered. */
  onRetry?: () => void;
}

/**
 * Error state for surfaces that failed to load data.
 *
 * Renders an alert card with the error message and an optional retry button.
 */
export function SurfaceErrorStateCard({
  error,
  title,
  description,
  onRetry,
}: SurfaceErrorStateCardProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();

  const errorMessage =
    description ??
    (error instanceof Error ? error.message : typeof error === 'string' ? error : tSurface('states.error_description'));

  return (
    <Card className="ds-surface ds-error-state-card" variant="outlined">
      <Card.Body className="ds-error-state-card__body">
        <Stack data-part="content" spacing="md">
          <Alert
            className="ds-error-state-card__alert"
            type="error"
            showIcon
            message={title ?? tSurface('states.error_title')}
            description={errorMessage}
          />
          {onRetry && (
            <Flex data-part="actions" justify="center">
              <Button className="ds-error-state-card__retry" variant="primary" onClick={onRetry}>
                {tSurface('states.retry')}
              </Button>
            </Flex>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SurfaceStaleBanner
// ---------------------------------------------------------------------------

export interface SurfaceStaleBannerProps {
  /** Human-readable message. Defaults to an i18n key. */
  message?: string;
  /** Handler to trigger a data refresh. */
  onRefresh?: () => void;
  /** Whether a refresh is currently in progress. */
  refreshing?: boolean;
}

/**
 * Info banner displayed when the surface data is stale (e.g., cache expired).
 *
 * Renders a compact info-level alert with an optional refresh button.
 */
export function SurfaceStaleBanner({
  message,
  onRefresh,
  refreshing,
}: SurfaceStaleBannerProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();

  return (
    <Flex className="ds-surface ds-stale-banner" data-part="banner" data-refreshing={refreshing ? 'true' : 'false'} gap={3} align="center">
      <Text data-part="description">{message ?? tSurface('states.stale_message')}</Text>
      {onRefresh && (
        <Button className="ds-stale-banner__refresh" variant="ghost" size="sm" onClick={onRefresh} loading={refreshing}>
          {tSurface('states.refresh')}
        </Button>
      )}
    </Flex>
  );
}

// ---------------------------------------------------------------------------
// SurfaceOfflineBanner
// ---------------------------------------------------------------------------

export interface SurfaceOfflineBannerProps {
  /** Human-readable message. Defaults to an i18n key. */
  message?: string;
  /** Whether cached data is currently being shown. */
  showCachedNotice?: boolean;
}

/**
 * Warning banner displayed when the browser is offline.
 *
 * Alerts the user that new data cannot be fetched. Optionally notes that
 * cached data is being displayed.
 */
export function SurfaceOfflineBanner({
  message,
  showCachedNotice,
}: SurfaceOfflineBannerProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();

  return (
    <Alert
      className="ds-surface ds-offline-banner"
      type="warning"
      showIcon
      message={message ?? tSurface('states.offline_message')}
      description={
        showCachedNotice ? tSurface('states.offline_cached_notice') : undefined
      }
    />
  );
}
