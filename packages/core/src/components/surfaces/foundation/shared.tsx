'use client';

/**
 * @fileoverview Shared surface UI helpers - Rottay Design System
 * @description Small reusable chrome for the surface layer.
 *
 * @remarks
 * Surfaces need a bit of consistent page scaffolding, but this module stays
 * intentionally shallow so surface-specific behavior remains in each surface.
 */

import type { MouseEvent, ReactNode } from 'react';
import { Button, Card, Flex, Stack, Text } from '../../primitives';
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

/** Render a permission-aware action row using the standard DS button contract. */
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
          icon={action.icon}
          aria-label={action.label}
          data-surface-action={action.id}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            if (stopPropagation) {
              event.stopPropagation();
            }

            action.onClick?.(item as TView);
          }}
        >
          {action.label}
        </Button>
      ))}
    </Flex>
  );
}

export interface SurfaceTabbedLabelProps {
  view: Pick<SurfaceTabbedView, 'label' | 'badge'>;
}

/** Compact helper for tabs that optionally include badge content. */
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

/** Shared card wrapper for sectioned surfaces with optional title, copy, and actions. */
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
    <Card className="ds-surface ds-section-card" variant="outlined">
      <Card.Body className="ds-section-card__body">
        <Stack data-part="content" spacing="md">
          {/* The header chrome stays optional so the same wrapper can be used for plain sections. */}
          {(title || description || actions) && (
            <Flex
              data-part="header"
              data-has-actions={actions ? 'true' : 'false'}
              justify="between"
              align="start"
              gap={12}
            >
              <Stack data-part="header-copy" spacing="xs">
                {title && <Text data-part="title" style={{ fontSize: 18, fontWeight: 700 }}>{title}</Text>}
                {description && (
                  <Text data-part="description">{description}</Text>
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
