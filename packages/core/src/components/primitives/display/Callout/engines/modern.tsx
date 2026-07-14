'use client';

/**
 * @fileoverview Modern engine for the Callout component, powered by DS token inline styles.
 * Renders an alert banner using `alert` structural classes with DS token semantic
 * variant colours, a dismissible close button, and an optional action slot.
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

import React, { useState } from 'react';
import type { CalloutProps } from '../Callout.types';
import { CALLOUT_DEFAULTS, CALLOUT_ICONS, TONE_TO_CALLOUT_VARIANT } from '../Callout.types';

/**
 * Modern (token-driven) implementation of the Callout component.
 *
 * Leverages `alert` structural class with DS token inline styles for semantic colouring
 * and layout, with a ghost close button and flex-column content area.
 *
 * Semantic paint (per-tone surface, text and close button) is keyed on
 * `data-tone` by `tokens/css/engines/modern/skin/callout.css`; an unrecognised
 * tone falls back to the info palette there, as it did here.
 *
 * @param props - {@link CalloutProps} controlling variant, content, and behaviour.
 * @returns A DS token-styled alert element, or null when dismissed.
 */
export default function ModernCallout(props: CalloutProps): React.ReactElement | null {
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
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      className={`alert rottay-callout-shell rottay-callout-shell--modern ${className}`}
      role="alert"
      data-part="root"
      data-tone={variant}
      style={style}
    >
      {/* Leading icon: custom icon overrides the per-variant default */}
      <span className="text-lg font-bold" data-part="icon">
        {icon || CALLOUT_ICONS[variant]}
      </span>

      {/* Content area: flex-col stacks title, body, and action vertically.
          flex-1 ensures it fills available width next to icon and close button. */}
      <div className="flex flex-col gap-1 flex-1" data-part="body">
        {title && (
          <span className="font-semibold text-sm" data-part="title">{title}</span>
        )}
        <span className="text-sm" data-part="description">{children}</span>
        {action && (
          <div className="mt-2" data-part="action">{action}</div>
        )}
      </div>

      {/* Ghost button creates a subtle, circular close affordance */}
      {closable && (
        <button
          type="button"
          data-part="close-button"
          style={{ width: 32, height: 32, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 13 }}
          onClick={handleClose}
          aria-label="Close"
        >
          x
        </button>
      )}
    </div>
  );
}

ModernCallout.displayName = 'Callout.Modern';
