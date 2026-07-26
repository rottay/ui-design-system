/**
 * @fileoverview Tag Modern Engine - Rottay Design System
 * @description Token-driven tag painted by the unlayered modern skin.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses the modern Tag skin for paint and DS tokens for theming.
 * No DaisyUI badge classes are used. All geometry, typography, fill, frame and
 * motion live in `foundation/tokens/css/runtime/engines/modern/skin/tag.css`,
 * keyed on the `rottay-tag-shell rottay-tag-shell--modern` scope and the
 * `data-*` contract stamped below; the engine only resolves profile defaults
 * and stamps that contract.
 *
 * @example Basic Usage
 * ```tsx
 * import { Tag } from '@rottay/design-system';
 *
 * <Tag engine="modern" variant="success" closable>
 *   Completed
 * </Tag>
 * ```
 *
 * @see {@link Tag} for the main component
 * @module ModernTag
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { useCallback } from 'react';
import { defineRecipe } from '@/infrastructure/runtime/foundation/recipes/engine';
import { TAG_RECIPE_DEFINITION } from '@/infrastructure/runtime/foundation/recipes/contracts/families';
import { useRecipeProfileDefaults } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { TagProps } from '../../contracts';
import { TAG_DEFAULTS, TONE_TO_TAG_VARIANT } from '../../contracts';

/**
 * DS-S001 recipe: the modern Tag shell classes. Variant/size/radius stay on
 * the `data-*` skin contract; profile-tunable axes arrive with DS-R00x.
 */
export const modernTagRecipe = defineRecipe(TAG_RECIPE_DEFINITION);
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

/**
 * Modern (token-driven) implementation of the Tag component.
 *
 * Uses the token-driven modern skin for a lightweight, customizable tag
 * implementation.
 *
 * @param props - Tag component properties
 * @returns DS token-styled tag element
 *
 * @example
 * ```tsx
 * <ModernTag variant="success" closable>
 *   Completed
 * </ModernTag>
 * ```
 */
export default function ModernTag(props: TagProps): React.ReactElement {
  const {
    size: sizeProp,
    tone,
    variant: variantProp,
    closable = TAG_DEFAULTS.closable,
    onClose,
    closeLabel,
    icon,
    children,
    bordered: borderedProp,
    radius: radiusProp,
    color,
    outlined: outlinedProp,
    clickable = TAG_DEFAULTS.clickable,
    onClick,
    className = '',
    style = {},
    ...restProps
  } = props;

  const i18n = useOptionalTranslation();
  const tagProfileDefaults = useRecipeProfileDefaults('tag');
  const size =
    sizeProp ??
    (typeof tagProfileDefaults.size === 'string'
      ? (tagProfileDefaults.size as TagProps['size'])
      : undefined) ??
    TAG_DEFAULTS.size;
  const bordered =
    borderedProp ??
    (typeof tagProfileDefaults.bordered === 'boolean'
      ? tagProfileDefaults.bordered
      : undefined) ??
    TAG_DEFAULTS.bordered;
  const radius =
    radiusProp ??
    (typeof tagProfileDefaults.radius === 'string'
      ? (tagProfileDefaults.radius as TagProps['radius'])
      : undefined) ??
    TAG_DEFAULTS.radius;
  const outlined =
    outlinedProp ??
    (typeof tagProfileDefaults.outlined === 'boolean'
      ? tagProfileDefaults.outlined
      : undefined) ??
    TAG_DEFAULTS.outlined;

  // tone (semantic) takes precedence over the deprecated variant prop; the skin's
  // fill/frame rules are keyed by the same internal color-token name either way.
  const variant = tone
    ? TONE_TO_TAG_VARIANT[tone]
    : variantProp ?? TAG_DEFAULTS.variant;

  /**
   * Handles close button click.
   * Stops propagation to prevent triggering tag click.
   */
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose?.();
    },
    [onClose]
  );

  /**
   * Handles tag click events when clickable.
   */
  const handleClick = useCallback(() => {
    if (clickable && onClick) {
      onClick();
    }
  }, [clickable, onClick]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (!clickable || !onClick) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onClick();
    },
    [clickable, onClick]
  );

  // The `color` prop is an arbitrary caller string, so it cannot be enumerated as a
  // CSS rule; it rides a custom property that every resting-fill rule in tag.css
  // reads with the variant's own token as the fallback. Every other paint and
  // geometry decision belongs to the skin.
  const tagStyle: React.CSSProperties = {
    ...(color ? ({ '--ds-tag-custom-bg': color } as React.CSSProperties) : {}),
    ...style,
  };

  // Accessible name for the close control: the caller's localized label wins,
  // then the component catalogue, then the documented English fallback.
  const removeAriaLabel = closeLabel ?? i18n?.t('common.remove') ?? 'Remove tag';

  // Conditionally add button semantics so keyboard users can activate
  // clickable tags via Enter/Space without extra JS key handlers.
  return (
    <span
      className={modernTagRecipe.resolve(undefined, { root: className }).root}
      data-part="root"
      data-variant={variant}
      data-size={size}
      data-radius={radius}
      data-outlined={outlined ? 'true' : undefined}
      data-bordered={bordered ? 'true' : undefined}
      data-clickable={clickable ? 'true' : undefined}
      data-has-icon={!!icon}
      data-closable={closable}
      style={tagStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...restProps}
    >
      {icon && <span data-part="icon">{icon}</span>}

      <span data-part="content">{children}</span>

      {closable && (
        <button
          type="button"
          data-part="close"
          onClick={handleClose}
          aria-label={removeAriaLabel}
        >
          <ActionCloseIcon size={12} decorative />
        </button>
      )}
    </span>
  );
}

ModernTag.displayName = 'ModernTag';
