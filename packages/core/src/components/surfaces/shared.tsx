'use client';

/**
 * Shared surface UI helpers
 *
 * The surface layer needs a tiny amount of reusable chrome so the individual
 * surface files do not each re-implement the same button normalization and
 * card-section scaffolding. This stays intentionally small: the goal is to
 * reduce repetition, not to hide the surface behavior behind another layer.
 */

import type { MouseEvent, ReactNode } from 'react';
import { Button, Card, Flex, Stack, Text } from '../primitives';
import { filterSurfaceActions, resolveSurfaceButtonVariant } from './helpers';
import type { SurfaceAction, SurfacePermissionsConfig, SurfaceTabbedView } from './types';

export interface SurfaceActionBarProps<TView = void> {
  actions?: SurfaceAction<TView>[];
  item?: TView;
  permissions?: SurfacePermissionsConfig;
  justify?: 'start' | 'center' | 'end' | 'between';
  size?: 'sm' | 'md' | 'lg';
  stopPropagation?: boolean;
}

export function SurfaceActionBar<TView>({
  actions,
  item,
  permissions,
  justify = 'end',
  size = 'sm',
  stopPropagation = false,
}: SurfaceActionBarProps<TView>): React.ReactElement | null {
  /**
   * Filtering lives here on purpose. This component is the one place where the
   * vast majority of page-level actions are rendered, so this is the safest
   * place to enforce visibility + permission rules consistently.
   */
  const visibleActions = filterSurfaceActions(actions, permissions, item);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <Flex gap={8} wrap="wrap" justify={justify}>
      {visibleActions.map((action) => (
        <Button
          key={action.id}
          variant={resolveSurfaceButtonVariant(action.variant)}
          size={size}
          disabled={action.disabled}
          loading={action.loading}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            if (stopPropagation) {
              event.stopPropagation();
            }

            action.onClick?.(item as TView);
          }}
        >
          {action.icon}
          <Text style={{ marginLeft: action.icon ? 8 : 0 }}>{action.label}</Text>
        </Button>
      ))}
    </Flex>
  );
}

export interface SurfaceTabbedLabelProps {
  view: Pick<SurfaceTabbedView, 'label' | 'badge'>;
}

export function SurfaceTabbedLabel({ view }: SurfaceTabbedLabelProps): React.ReactElement {
  if (!view.badge) {
    return <>{view.label}</>;
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span>{view.label}</span>
      <span>{view.badge}</span>
    </span>
  );
}

export interface SurfaceSectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  plain?: boolean;
}

export function SurfaceSectionCard({
  title,
  description,
  actions,
  children,
  plain = false,
}: SurfaceSectionCardProps): React.ReactElement {
  if (plain) {
    return <>{children}</>;
  }

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          {(title || description || actions) && (
            <Flex justify="between" align="start" gap={12}>
              <Stack spacing="xs">
                {title && <Text style={{ fontSize: 18, fontWeight: 700 }}>{title}</Text>}
                {description && (
                  <Text style={{ color: 'var(--ds-color-text-muted)' }}>{description}</Text>
                )}
              </Stack>
              {actions}
            </Flex>
          )}
          {children}
        </Stack>
      </Card.Body>
    </Card>
  );
}
