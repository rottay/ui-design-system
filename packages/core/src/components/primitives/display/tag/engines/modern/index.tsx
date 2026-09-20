/**
 * @fileoverview Tag Modern Engine - Rottay Design System
 * @description Token-driven tag painted by the unlayered modern skin.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses the modern Tag skin for paint and DS tokens for theming.
 * No DaisyUI badge classes are used. All geometry, typography, fill, frame and
 * motion live in `foundation/tokens/css/runtime/engines/modern/skin/tag/index.css`,
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
import { partAttributes, useInteractionState } from '@/foundation/behavior';
import { composeHandlers } from '@/foundation/behavior/runtime/compose-handlers';
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
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';

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
      // A clickable tag with a close control nests a real button inside a
      // role="button" span. `handleClose` stops the mouse path, but a keyboard
      // activation of the close button bubbles here as a plain keydown -- so
      // Enter on "remove" used to remove AND activate the tag. The root is the
      // only part this handler speaks for.
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      onClick();
    },
    [clickable, onClick]
  );

  // F-37: the clickable root and the close control are two parts, so each owns
  // its own hover/press/focus triad and the skin reads the result off
  // `data-state`. The skin's `:hover`/`:active` arm stays as the platform
  // fallback; it is not a second source of truth.
  const rootInteraction = useInteractionState();
  const closeInteraction = useInteractionState();

  // A role="button" span never receives `:active` from the keyboard, so the
  // stamped press is the only way a keyboard activation feels like the pointer
  // one. The target guard is the same one `handleKeyDown` uses: a close-button
  // activation bubbling through must not press the tag underneath it.
  const handleRootKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (
        clickable &&
        (event.key === 'Enter' || event.key === ' ') &&
        event.target === event.currentTarget
      ) {
        rootInteraction.handlers.onPointerDown(event as unknown as React.PointerEvent);
      }
      handleKeyDown(event);
    },
    [clickable, rootInteraction.handlers, handleKeyDown]
  );

  const handleRootKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        rootInteraction.handlers.onPointerUp(event as unknown as React.PointerEvent);
      }
    },
    [rootInteraction.handlers]
  );

  // React's focus events are `focusin`/`focusout`, so a keyboard focus landing
  // on the close BUTTON would otherwise stamp the root focused and light the
  // root's ring -- something the `:focus-visible` arm never does. Only the root
  // itself speaks for the root's focus, exactly as its key handler does.
  const handleRootFocus = useCallback(
    (event: React.FocusEvent<HTMLSpanElement>) => {
      if (event.target !== event.currentTarget) return;
      rootInteraction.handlers.onFocus(event);
    },
    [rootInteraction.handlers]
  );

  const handleRootBlur = useCallback(
    (event: React.FocusEvent<HTMLSpanElement>) => {
      if (event.target !== event.currentTarget) return;
      rootInteraction.handlers.onBlur(event);
    },
    [rootInteraction.handlers]
  );

  // `TagProps` declares no DOM event handlers, but a caller may still forward
  // them through the passthrough -- and a spread REPLACES a colliding prop. The
  // kernel goes first and never prevents default, so the caller's handler always
  // runs after it (P-79).
  const callerDomProps = restProps as React.DOMAttributes<HTMLSpanElement>;

  // Hover and press ride the same bubbling the `:hover`/`:active` arm already
  // has: a pointer inside the close control is a pointer inside the tag.
  const rootInteractionProps = clickable
    ? {
        onPointerEnter: composeHandlers(rootInteraction.handlers.onPointerEnter, callerDomProps.onPointerEnter),
        onPointerLeave: composeHandlers(rootInteraction.handlers.onPointerLeave, callerDomProps.onPointerLeave),
        onPointerDown: composeHandlers(rootInteraction.handlers.onPointerDown, callerDomProps.onPointerDown),
        onPointerUp: composeHandlers(rootInteraction.handlers.onPointerUp, callerDomProps.onPointerUp),
        onFocus: composeHandlers(handleRootFocus, callerDomProps.onFocus),
        onBlur: composeHandlers(handleRootBlur, callerDomProps.onBlur),
        onKeyUp: composeHandlers(handleRootKeyUp, callerDomProps.onKeyUp),
        onKeyDown: composeHandlers(handleRootKeyDown, callerDomProps.onKeyDown),
      }
    : {};

  const handleCloseKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        closeInteraction.handlers.onPointerDown(event as unknown as React.PointerEvent);
      }
    },
    [closeInteraction.handlers]
  );

  const handleCloseKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        closeInteraction.handlers.onPointerUp(event as unknown as React.PointerEvent);
      }
    },
    [closeInteraction.handlers]
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
  const removeAriaLabel = closeLabel ?? i18n?.tOr('common.remove', 'Remove tag') ?? 'Remove tag';

  // Conditionally add button semantics so keyboard users can activate
  // clickable tags via Enter/Space without extra JS key handlers.
  return (
    <span
      className={modernTagRecipe.resolve(undefined, { root: className }).root}
      {...partAttributes('root', clickable ? rootInteraction.state : {})}
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
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...restProps}
      {...rootInteractionProps}
    >
      {icon && <span data-part="icon">{icon}</span>}

      {/* Truncated labels disclose their full text natively; composite
          children own their own disclosure. */}
      <span
        data-part="content"
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </span>

      {closable && (
        <button
          type="button"
          {...partAttributes('close', closeInteraction.state)}
          {...closeInteraction.handlers}
          onKeyDown={handleCloseKeyDown}
          onKeyUp={handleCloseKeyUp}
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
