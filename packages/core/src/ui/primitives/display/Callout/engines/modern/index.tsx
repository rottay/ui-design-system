'use client';

/**
 * @fileoverview Modern engine for the Callout component, painted by the token-driven modern skin.
 * Renders a guidance banner with a semantic icon well, title/body hierarchy,
 * an optional action tray, and a dismissible close button. No DaisyUI classes
 * remain on this tree -- the `alert` structural class was drained in the
 * K1 Lane C pass (decrementing `daisy.classConsumers`); all layout and paint
 * live in `foundation/tokens/css/runtime/engines/modern/skin/callout.css`.
 *
 * @example
 * ```tsx
 * <Callout engine="modern" variant="success" title="Saved" closable>
 *   Your changes have been saved successfully.
 * </Callout>
 * ```
 *
 * @module Callout/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

import React, { useEffect, useRef, useState } from 'react';
import type { CalloutProps } from '../../contracts';
import type { CalloutVariant } from '../../contracts';
import { CALLOUT_DEFAULTS, TONE_TO_CALLOUT_VARIANT } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { StatusInfoIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

/**
 * Focusable candidates for the keyboard-dismiss focus return (deterministic
 * document-order query; disabled and tabindex="-1" nodes excluded). Same
 * vocabulary the Alert shell uses, so the two dismissible message shells
 * cannot diverge on where a keyboard dismissal lands.
 * @internal
 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const VARIANT_ICONS: Record<CalloutVariant, React.ReactNode> = {
  info: <StatusInfoIcon decorative size={20} />,
  success: <StatusSuccessIcon decorative size={20} />,
  warning: <StatusWarningIcon decorative size={20} />,
  error: <StatusErrorIcon decorative size={20} />,
};

/**
 * Modern (token-driven) implementation of the Callout component.
 *
 * Semantic paint (per-tone surface, icon well, action tray and close button) is
 * keyed on `data-tone`/`data-part` by
 * `foundation/tokens/css/runtime/engines/modern/skin/callout.css`; an
 * unrecognised tone falls back to the info palette there, as it did here.
 *
 * @param props - {@link CalloutProps} controlling variant, content, and behaviour.
 * @returns A token-styled callout element, or null when dismissed.
 */
export default function ModernCallout(props: CalloutProps): React.ReactElement | null {
  const i18n = useOptionalTranslation('common');
  const {
    tone,
    variant: variantProp = CALLOUT_DEFAULTS.variant,
    title,
    children,
    icon,
    closable = CALLOUT_DEFAULTS.closable,
    onClose,
    action,
    className = '',
    style,
  } = props;

  // tone (semantic) takes precedence over the deprecated variant prop; VARIANT_STYLES
  // and CALLOUT_ICONS below are keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_CALLOUT_VARIANT[tone] : variantProp;

  // Uncontrolled dismiss state -- once closed, the node is removed from the tree
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // A dismissal dies with the message it dismissed (Alert precedent): any change
  // of primitive body copy re-opens the callout, so a reused instance cannot
  // swallow every later message; a non-primitive node stays sticky.
  const dismissKey =
    typeof children === 'string' || typeof children === 'number' ? children : null;
  useEffect(() => {
    if (dismissKey === null) return;
    setDismissed(false);
  }, [dismissKey]);

  const isUrgent = variant === 'warning' || variant === 'error';

  if (dismissed) return null;

  /**
   * FOCUS RETURN: a keyboard-originated dismiss (detail === 0 -- the click came
   * from Enter/Space, not a pointer) must not strand focus on a node that is
   * about to unmount, which dropped focus to `<body>`. The landing spot is
   * deterministic: the first focusable element AFTER the callout in document
   * order (scope: the callout's parent subtree, then the document), else the
   * last one before it. Pointer dismissals keep the browser default.
   */
  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) {
      const root = rootRef.current;
      if (root) {
        const collect = (scope: ParentNode): HTMLElement[] =>
          Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
            (el) => el !== root && !root.contains(el)
          );
        const inParent = collect(root.parentElement ?? document);
        const focusable = inParent.length > 0 ? inParent : collect(document);
        const after = focusable.filter(
          (el) => root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
        );
        const target = after[0] ?? focusable[focusable.length - 1];
        target?.focus({ preventScroll: true });
      }
    }
    setDismissed(true);
    onClose?.();
  };

  return (
    <div
      ref={rootRef}
      className={`rottay-callout-shell rottay-callout-shell--modern ${className}`.trim()}
      role={isUrgent ? 'alert' : 'status'}
      data-part="root"
      data-tone={variant}
      data-has-title={Boolean(title)}
      data-has-action={Boolean(action)}
      data-closable={Boolean(closable)}
      style={style}
    >
      {/* Leading icon: custom icon overrides the per-variant default */}
      <span className="rottay-callout-shell__icon" data-part="icon">
        {icon || VARIANT_ICONS[variant]}
      </span>

      {/* Content area: flex-col stacks title, body, and action vertically.
          flex-1 ensures it fills available width next to icon and close button. */}
      <div className="rottay-callout-shell__body" data-part="body">
        {title && (
          <span data-part="title">{title}</span>
        )}
        <span data-part="description">{children}</span>
        {action && (
          <div className="rottay-callout-shell__action" data-part="action">{action}</div>
        )}
      </div>

      {/* Ghost button creates a subtle, circular close affordance */}
      {closable && (
        <button
          type="button"
          data-part="close-button"
          onClick={handleClose}
          aria-label={i18n?.t('close') ?? 'Close'}
        >
          <ActionCloseIcon decorative size={16} />
        </button>
      )}
    </div>
  );
}

ModernCallout.displayName = 'Callout.Modern';
