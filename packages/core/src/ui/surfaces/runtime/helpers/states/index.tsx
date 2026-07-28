'use client';

/**
 * @fileoverview Shared surface state components: loading, empty, and error.
 * @description Centralizes the three universal page states so every surface uses
 * the same visual language: skeleton-based loading, PatternEmptyState for empty,
 * and Alert-based error with optional retry. These are internal to the surface
 * layer -- app code should use the surface component directly.
 */

import type { ReactNode } from 'react';
import { Alert, Box, Button, Card, Skeleton, Stack, Text } from '../../../../primitives';
import { PatternEmptyState } from '../../../../patterns';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { useTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import { normalizeSurfaceError, resolveSurfaceButtonVariant } from '..';
import type { SurfaceAction, SurfaceCapabilityRegistration } from '../../../foundation/contracts';
import { useSurfaceTranslations } from './i18n';

export interface SurfaceLoadingStateProps {
  title?: ReactNode;
  description?: ReactNode;
  lines?: number;
}

export function SurfaceLoadingState({
  title,
  description,
  lines = 4,
}: SurfaceLoadingStateProps): React.ReactElement {
  const { tSurface } = useSurfaceTranslations();
  const tokens = useTokens();
  const { prefersReducedMotion } = useBreakpoints();
  // Respect the user's reduced-motion preference by falling back to the
  // simpler pulse animation. The personality token can also force pulse for
  // products that prefer a calmer visual style.
  const skeletonAnimation =
    prefersReducedMotion || tokens.personality.animation.skeletonStyle === 'pulse'
      ? 'pulse'
      : 'wave';

  return (
    <Card className="ds-surface ds-loading-state" variant="outlined">
      <Card.Body className="ds-loading-state__body">
        <Stack data-part="content" spacing="md">
          <Stack data-part="copy" spacing="xs">
            <Text data-part="title">
              {title ?? tSurface('states.loading_title')}
            </Text>
            <Text data-part="description">
              {description ?? tSurface('states.loading_description')}
            </Text>
          </Stack>
          <Skeleton
            className="ds-loading-state__skeleton"
            variant="text"
            rows={lines}
            animation={skeletonAnimation}
            active
          />
        </Stack>
      </Card.Body>
    </Card>
  );
}

export interface SurfaceEmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: SurfaceAction<void>;
}

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

export interface SurfaceErrorStateProps {
  error: unknown;
  title?: ReactNode;
  onRetry?: () => void | Promise<void>;
  retryLabel?: string;
}

export function SurfaceErrorState({
  error,
  title,
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
            message={normalized.message}
            description={normalized.description}
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

export interface SurfaceCapabilityAnatomyProps {
  capabilities: ReadonlyArray<SurfaceCapabilityRegistration>;
  label?: ReactNode;
  ariaLabel?: string;
}

/** Responsive, data-independent inventory shown beside a failed surface load. */
export function SurfaceCapabilityAnatomy({
  capabilities,
  label,
  ariaLabel,
}: SurfaceCapabilityAnatomyProps): React.ReactElement | null {
  const { tSurface } = useSurfaceTranslations();

  if (capabilities.length === 0) return null;

  return (
    <Box
      className="ds-surface ds-capability-anatomy"
      data-part="capability-anatomy"
      data-capability-count={capabilities.length}
      aria-label={ariaLabel ?? tSurface('states.capability_aria')}
    >
      <Text
        data-part="capability-anatomy-label"
        size="xs"
        color="muted"
      >
        {label ?? tSurface('states.capability_label')}
      </Text>
      <Box
        role="list"
        data-part="capability-list"
      >
        {capabilities.map((capability) => (
          <Box
            role="listitem"
            key={`${capability.kind}-${capability.id}`}
            data-part="capability"
            data-capability-kind={capability.kind}
            data-capability-id={capability.id}
            data-disabled={capability.disabled ? 'true' : undefined}
          >
            <Text size="sm" data-part="capability-label">
              {capability.label ?? capability.id}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Extended state components for the surface lifecycle state machine.
// Re-exported from `surface-states.tsx` for barrel convenience.
// ---------------------------------------------------------------------------
export {
  SurfaceLoadingSkeleton,
  SurfaceEmptyStateCard,
  SurfaceErrorStateCard,
  SurfaceStaleBanner,
  SurfaceOfflineBanner,
} from './i18n/components';

export type {
  SurfaceLoadingSkeletonProps,
  SurfaceEmptyStateActionConfig,
  SurfaceEmptyStateCardProps,
  SurfaceErrorStateCardProps,
  SurfaceStaleBannerProps,
  SurfaceOfflineBannerProps,
} from './i18n/components';
