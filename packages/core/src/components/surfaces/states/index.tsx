'use client';

/**
 * @fileoverview Shared surface state components: loading, empty, and error.
 * @description Centralizes the three universal page states so every surface uses
 * the same visual language: skeleton-based loading, PatternEmptyState for empty,
 * and Alert-based error with optional retry. These are internal to the surface
 * layer -- app code should use the surface component directly.
 */

import type { ReactNode } from 'react';
import { Alert, Button, Card, Skeleton, Stack, Text } from '../../primitives';
import { PatternEmptyState } from '../../patterns';
import { useBreakpoints } from '../../../hooks/responsive/useBreakpoints';
import { useTokens } from '../../../hooks/tokens';
import { normalizeSurfaceError, resolveSurfaceButtonVariant } from '../helpers';
import type { SurfaceAction } from '../types';
import { useSurfaceTranslations } from '../i18n';

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
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Stack spacing="xs">
            <Text style={{ fontWeight: 700 }}>
              {title ?? tSurface('states.loading_title')}
            </Text>
            <Text style={{ color: 'var(--ds-color-text-muted)' }}>
              {description ?? tSurface('states.loading_description')}
            </Text>
          </Stack>
          <Skeleton variant="text" rows={lines} animation={skeletonAnimation} active />
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
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Text style={{ fontWeight: 700 }}>
            {title ?? tSurface('states.error_title')}
          </Text>
          <Alert
            type="error"
            showIcon
            message={normalized.message}
            description={normalized.description}
          />
          {onRetry && (
            <Button variant="primary" onClick={() => onRetry()}>
              {retryLabel ?? tSurface('states.retry')}
            </Button>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}
