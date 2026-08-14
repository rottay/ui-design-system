'use client';

/**
 * @fileoverview Surface chrome - Rottay Design System
 * @module Structures/Shell/SurfaceChrome
 * @category Structure
 * @package @rottay/design-system
 *
 * @description
 * The composite `structure/shell/surface-chrome` family: the three small
 * page-chrome components that surfaces and shells render around their own
 * content - an access-filtered action row, a tab label with optional badge,
 * and the governed section-card wrapper.
 *
 * @remarks
 * WHY THESE THREE ARE ONE FAMILY IN `structure/shell/*`.
 *
 * They are public, component-shaped, and shipped from the package root, yet
 * they used to be published from `structures/foundation/chrome/presentation/
 * rendering` - a SUPPORT owner. A support folder may not create a family row,
 * so nothing in the taxonomy inventory could claim them and they read as
 * accidental. They are not accidental: between them they have more than
 * twenty callers across the surfaces tier plus `HeaderSurface` and
 * `SidebarSurface`, which makes them real shared page chrome, and `CLAUDE.md`
 * puts public page chrome in `structure/shell/*`.
 *
 * They are ONE family and not three, because they are one cohesive chrome
 * vocabulary with one owner: a surface asks for an action row, a tab label
 * and a section wrapper as a set, and splitting them into three single-
 * component rows would invent three owners for one decision. The `Surface*`
 * prefix stays - these are published names with consumers, and renaming them
 * would be a breaking API change dressed up as a file move.
 *
 * The chrome CONTRACTS and RUNTIME (`SurfaceAction`, access filtering,
 * translations, profile defaults) correctly stay in
 * `structures/foundation/chrome/*`: those are shared vocabulary and behavior
 * with no rendered product of their own. Only the renderable components moved
 * up into their own family, so the support root no longer publishes products.
 */

import type { MouseEvent, ReactNode } from 'react';
import { Button, Card, Flex, Heading, Stack, Text } from '../../../primitives';
import type { CardProps } from '../../../primitives/display/Card/contracts';
import { defineRecipe } from '@/infrastructure/runtime/foundation/recipes/engine';
import { SECTION_CARD_RECIPE_DEFINITION } from '@/infrastructure/runtime/foundation/recipes/contracts/families';
import { useRecipeProfileDefaults } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { filterSurfaceActions, resolveSurfaceButtonVariant } from '../../foundation/chrome/runtime/access';
import type {
  SurfaceAccessInput,
  SurfaceAction,
  SurfaceTabbedView,
} from '../../foundation/chrome/contracts';

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
  /** Semantic heading level exposed for the `title` slot. */
  titleHeadingLevel?: 2 | 3 | 4 | 5 | 6;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  plain?: boolean;
  /** Explicit Card material; overrides the active recipe-profile default. */
  variant?: CardProps['variant'];
}

/** Governed section-card anatomy exposed through the public recipe manifest. */
export const surfaceSectionCardRecipe = defineRecipe(SECTION_CARD_RECIPE_DEFINITION);

// Typography stamps its size scale inline, outranking the skin, so the tenant
// chain the skin declares only stays causal if it is restated here.
const SECTION_CARD_HEADER_TYPE = {
  eyebrow: { fontSize: 'var(--ds-text-eyebrow-size, var(--ds-font-size-xs))' },
  title: {
    fontSize: 'var(--ds-card-title-font-size, var(--ds-font-size-lg, 16px))',
    letterSpacing: 'var(--ds-card-title-letter-spacing, var(--ds-letter-spacing-heading))',
    lineHeight: 1.25,
  },
  description: { fontSize: 'var(--ds-font-size-xs, 12px)' },
} as const;

/** Shared card wrapper for sectioned surfaces with optional title, copy, and actions. */
export function SurfaceSectionCard({
  eyebrow,
  icon,
  title,
  titleHeadingLevel = 2,
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
                    <Text className="ds-section-card__eyebrow" style={SECTION_CARD_HEADER_TYPE.eyebrow}>
                      {eyebrow}
                    </Text>
                  )}
                  {title && (
                    <Heading
                      level={`h${titleHeadingLevel}`}
                      className="ds-section-card__title"
                      style={SECTION_CARD_HEADER_TYPE.title}
                    >
                      {title}
                    </Heading>
                  )}
                  {description && (
                    <Text className="ds-section-card__description" style={SECTION_CARD_HEADER_TYPE.description}>
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
