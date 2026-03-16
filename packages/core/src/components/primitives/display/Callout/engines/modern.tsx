'use client';

/**
 * @fileoverview Modern engine for the Callout component, powered by DaisyUI/Tailwind.
 * Renders an alert banner using DaisyUI's `alert` classes with semantic
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
import { CALLOUT_DEFAULTS, CALLOUT_ICONS } from '../Callout.types';

/**
 * Maps DS variant names to DaisyUI alert modifier classes.
 */
const VARIANT_CLASSES: Record<string, string> = {
  info: 'alert-info',
  warning: 'alert-warning',
  error: 'alert-error',
  success: 'alert-success',
};

/**
 * Modern (DaisyUI/Tailwind) implementation of the Callout component.
 *
 * Leverages DaisyUI's `alert` component for semantic colouring and layout,
 * with a ghost close button and flex-column content area.
 *
 * @param props - {@link CalloutProps} controlling variant, content, and behaviour.
 * @returns A DaisyUI-styled alert element, or null when dismissed.
 */
export default function ModernCallout(props: CalloutProps): React.ReactElement | null {
  const {
    variant = CALLOUT_DEFAULTS.variant,
    title,
    children,
    icon,
    closable = CALLOUT_DEFAULTS.closable,
    onClose,
    action,
    className = '',
    style,
  } = props;

  // Uncontrolled dismiss state -- once closed, the node is removed from the tree
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // Fallback to 'info' for unrecognised variants to avoid unstyled alerts
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.info;

  return (
    <div
      className={`alert ${variantClass} ${className}`}
      role="alert"
      style={style}
    >
      {/* Leading icon: custom icon overrides the per-variant default */}
      <span className="text-lg font-bold">
        {icon || CALLOUT_ICONS[variant]}
      </span>

      {/* Content area: flex-col stacks title, body, and action vertically.
          flex-1 ensures it fills available width next to icon and close button. */}
      <div className="flex flex-col gap-1 flex-1">
        {title && (
          <span className="font-semibold text-sm">{title}</span>
        )}
        <span className="text-sm">{children}</span>
        {action && (
          <div className="mt-2">{action}</div>
        )}
      </div>

      {/* DaisyUI ghost button creates a subtle, circular close affordance */}
      {closable && (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle"
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
