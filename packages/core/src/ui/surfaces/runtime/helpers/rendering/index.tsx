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
import { Button, Card, Flex, Stack, Text } from '../../../../primitives';
import type { CardProps } from '../../../../primitives/display/Card/contracts';
import { defineRecipe } from '@/infrastructure/runtime/foundation/recipes/engine';
import { SECTION_CARD_RECIPE_DEFINITION } from '@/infrastructure/runtime/foundation/recipes/contracts/families';
import { useRecipeProfileDefaults } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { filterSurfaceActions, resolveSurfaceButtonVariant } from '..';
import type { SurfaceAccessInput, SurfaceAction, SurfaceTabbedView } from '../../../foundation/contracts';

export interface SurfaceActionBarProps<TView = void> {
  actions?: SurfaceAction<TView>[];
  item?: TView;
  /** Presentation access already resolved by the app/server. */
  access?: SurfaceAccessInput;
  justify?: 'start' | 'center' | 'end' | 'between';
  size?: 'sm' | 'md' | 'lg';
  stopPropagation?: boolean;
}

/** Render an app-resolved action row using the standard DS button contract. */
export function SurfaceActionBar<TView>({
  actions,
  item,
  access,
  justify = 'end',
  size = 'sm',
  stopPropagation = false,
}: SurfaceActionBarProps<TView>): React.ReactElement | null {
  /**
   * Filtering lives here on purpose. This component is the one place where the
   * vast majority of page-level actions are rendered, so this is the safest
   * place to apply final presentation visibility consistently.
   */
  const visibleActions = filterSurfaceActions(actions, access, item);

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
  /** Optional compact context rendered above the title. */
  eyebrow?: ReactNode;
  /** Optional semantic illustration for the section header. */
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  plain?: boolean;
  /** Explicit Card material; overrides the active recipe-profile default. */
  variant?: CardProps['variant'];
}

/** Governed section-card anatomy exposed through the public recipe manifest. */
export const surfaceSectionCardRecipe = defineRecipe(SECTION_CARD_RECIPE_DEFINITION);

/** Shared card wrapper for sectioned surfaces with optional title, copy, and actions. */
export function SurfaceSectionCard({
  eyebrow,
  icon,
  title,
  description,
  actions,
  children,
  plain = false,
  variant: variantProp,
}: SurfaceSectionCardProps): React.ReactElement {
  const profileDefaults = useRecipeProfileDefaults('sectionCard');
  const variant =
    variantProp ??
    (typeof profileDefaults.variant === 'string'
      ? (profileDefaults.variant as CardProps['variant'])
      : undefined) ??
    'outlined';
  const classes = surfaceSectionCardRecipe.resolve({ variant });

  if (plain) {
    return <>{children}</>;
  }

  const hasHeader = Boolean(eyebrow || icon || title || description || actions);

  return (
    <Card
      className={classes.root}
      variant={variant}
      data-has-header={hasHeader ? 'true' : 'false'}
    >
      <Card.Body className={classes.body} padding="none">
        <Stack data-part="content" spacing="none">
          {/* The header chrome stays optional so the same wrapper can be used for plain sections. */}
          {hasHeader && (
            <Flex
              className={classes.header}
              data-part="header"
              data-has-actions={actions ? 'true' : 'false'}
              justify="between"
              align="start"
              gap={12}
            >
              <Flex data-part="header-main" align="start" gap={12}>
                {icon && <span data-part="header-icon">{icon}</span>}
                <Stack data-part="header-copy" spacing="xs">
                  {eyebrow && (
                    <Text className="ds-section-card__eyebrow">{eyebrow}</Text>
                  )}
                  {title && (
                    <Text className="ds-section-card__title">{title}</Text>
                  )}
                  {description && (
                    <Text className="ds-section-card__description">
                      {description}
                    </Text>
                  )}
                </Stack>
              </Flex>
              {actions && <div data-part="header-actions">{actions}</div>}
            </Flex>
          )}
          <div className={classes.content} data-part="section-content">{children}</div>
        </Stack>
      </Card.Body>
    </Card>
  );
}
