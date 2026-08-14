'use client';

/**
 * @fileoverview The five surface lifecycle states: loading, empty, error,
 * stale, offline.
 *
 * @description One vocabulary, one component per state. The set maps 1:1 onto
 * the `SurfaceState` union that `useSurfaceState` derives, so a reader who
 * knows the states can name the components. The suffix says how each one
 * relates to the page content:
 *
 *   - `Skeleton` / `State` REPLACE the content -- the surface has nothing real
 *     to show yet (`loading`), has nothing to show at all (`empty`), or failed
 *     (`error`);
 *   - `Banner` ACCOMPANIES the content -- the data is on screen but degraded
 *     (`stale`, `refreshing`) or unrefreshable (`offline`).
 *
 * That distinction is the one thing a caller has to know before rendering, so
 * it is the one thing the name carries. Everything else -- card, alert, grid,
 * shimmer -- is anatomy, and anatomy belongs to the skin.
 *
 * These live in `structures/feedback` because that is what they are: page
 * chrome, built from primitives, knowing nothing about the screen they appear
 * on.
 *
 * ## Convergence (owner ruling, 2026-08-12)
 *
 * The lifecycle used to ship twice: a card set built by `useSurfaceState`, and
 * an older trio rendered directly in JSX by surface pages that drive their own
 * state. Three roles therefore had two public components and two anatomies to
 * skin. There is now exactly one component per role, chosen per role rather
 * than per set:
 *
 *   - LOADING keeps `SurfaceLoadingSkeleton`. The retired `SurfaceLoadingState`
 *     wrapped a card around the words "Loading" -- copy that is never real
 *     content -- and it had no production caller anywhere in the monorepo, only
 *     a test and a Showroom fixture. A loading placeholder should approximate
 *     the shape of what is coming, which is what the skeleton does.
 *   - EMPTY keeps `SurfaceEmptyState`, which delegates to `PatternEmptyState`.
 *     The retired `SurfaceEmptyStateCard` hand-rolled a centered card that the
 *     empty-state pattern already owns. A structure wraps a pattern; it does
 *     not reimplement one.
 *   - ERROR keeps `SurfaceErrorState`, which had the larger caller set and the
 *     richer contract (`ReactNode` title, `retryLabel`). It absorbed the one
 *     prop the retired `SurfaceErrorStateCard` had and it lacked --
 *     `description`, which lets a caller show a safe sentence instead of a raw
 *     internal error message. That prop carries a real disclosure property, so
 *     it survived the component it came from.
 *   - STALE and OFFLINE were never duplicated and are unchanged.
 *
 * All paint and typography belongs to `surface-states.css` in the skin. The
 * components stamp anatomy (`data-part`, BEM class names) and nothing else --
 * see the drain contract asserted in `tests/`.
 */

import type { ReactNode } from 'react';

import { Alert } from '../../../../primitives/feedback/Alert';
import { Button } from '../../../../primitives/inputs/Button';
import { Card } from '../../../../primitives/display/Card';
import { Flex } from '../../../../primitives/layout/Flex';
import { Skeleton } from '../../../../primitives/feedback/Skeleton';
import { Stack } from '../../../../primitives/layout/Stack';
import { Text } from '../../../../primitives/display/Typography/compound/Text';
import { PatternEmptyState } from '../../../../patterns/feedback/empty-state';
import type { SurfaceAction } from '../../../foundation/chrome/contracts';
import { resolveSurfaceButtonVariant } from '../../../foundation/chrome/runtime/access';
import { normalizeSurfaceError } from '../../../foundation/chrome/runtime/errors';
import { useSurfaceTranslations } from '../../../foundation/chrome/runtime/i18n';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';

// ---------------------------------------------------------------------------
// SurfaceLoadingSkeleton -- state: loading (replaces content)
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
// SurfaceEmptyState -- state: empty (replaces content)
// ---------------------------------------------------------------------------

export interface SurfaceEmptyStateProps {
  /** Title text. Defaults to an i18n key. */
  title?: string;
  /** Description text. Defaults to an i18n key. */
  description?: string;
  /** Icon rendered above the title. */
  icon?: ReactNode;
  /** Optional call-to-action. */
  action?: SurfaceAction<void>;
}

/**
 * Empty state for surfaces that have loaded data but the result set is empty.
 *
 * Delegates the centered icon/title/description/action composition to
 * `PatternEmptyState` -- the DS already owns that task widget, so this
 * structure supplies the surface vocabulary (i18n defaults, `SurfaceAction`
 * variant mapping) and lets the pattern render.
 */
export function SurfaceEmptyState({
  title,
  description,
  icon,
  action,
}: SurfaceEmptyStateProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();

  return (
    <PatternEmptyState
      className="ds-surface ds-empty-state"
      title={title ?? tSurface('states.empty_title')}
      description={description ?? tSurface('states.empty_description')}
      icon={icon}
      action={
        action
          ? {
              label: action.label,
              onClick: () => action.onClick?.(undefined as void),
              variant:
                resolveSurfaceButtonVariant(action.variant) === 'primary'
                  ? 'primary'
                  : 'default',
            }
          : undefined
      }
    />
  );
}

// ---------------------------------------------------------------------------
// SurfaceErrorState -- state: error (replaces content)
// ---------------------------------------------------------------------------

export interface SurfaceErrorStateProps {
  /** The error object or message. */
  error: unknown;
  /** Title for the error card. Defaults to an i18n key. */
  title?: ReactNode;
  /**
   * Safe copy shown instead of the normalized error message. Use it whenever
   * the underlying error may carry internal detail that must not reach the
   * screen.
   */
  description?: string;
  /** Retry handler. When provided, a retry button is rendered. */
  onRetry?: () => void | Promise<void>;
  /** Label for the retry button. Defaults to an i18n key. */
  retryLabel?: string;
}

/**
 * Error state for surfaces that failed to load data.
 *
 * Renders the title, an error alert, and an optional retry button. `error` is
 * `unknown` on purpose -- callers hand over whatever they caught, and
 * `normalizeSurfaceError` reduces it to a message. An explicit `description`
 * takes priority over that message.
 */
export function SurfaceErrorState({
  error,
  title,
  description,
  onRetry,
  retryLabel,
}: SurfaceErrorStateProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  // Normalize the error into a consistent shape regardless of whether the
  // caller passed an Error instance, a string, or an unknown object.
  const normalized = normalizeSurfaceError(error);

  return (
    <Card className="ds-surface ds-error-state" variant="outlined">
      <Card.Body className="ds-error-state__body">
        <Stack data-part="content" spacing="md">
          <Text data-part="title">
            {title ?? tSurface('states.error_title')}
          </Text>
          <Alert
            className="ds-error-state__alert"
            type="error"
            showIcon
            message={description ?? normalized.message}
          />
          {onRetry && (
            <Button className="ds-error-state__retry" variant="primary" onClick={() => onRetry()}>
              {retryLabel ?? tSurface('states.retry')}
            </Button>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SurfaceStaleBanner -- state: stale / refreshing (accompanies content)
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
// SurfaceOfflineBanner -- state: offline (accompanies content)
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
