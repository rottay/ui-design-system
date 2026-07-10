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
 * Maps DS variant names to DS token inline styles.
 */
const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  info: { background: 'color-mix(in srgb, var(--ds-color-info) 10%, transparent)', color: 'var(--ds-color-info)' },
  warning: { background: 'color-mix(in srgb, var(--ds-color-warning) 10%, transparent)', color: 'var(--ds-color-warning)' },
  error: { background: 'color-mix(in srgb, var(--ds-color-error) 10%, transparent)', color: 'var(--ds-color-error)' },
  success: { background: 'color-mix(in srgb, var(--ds-color-success) 10%, transparent)', color: 'var(--ds-color-success)' },
};

/**
 * Modern (token-driven) implementation of the Callout component.
 *
 * Leverages `alert` structural class with DS token inline styles for semantic colouring
 * and layout, with a ghost close button and flex-column content area.
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

  // Fallback to 'info' for unrecognised variants to avoid unstyled alerts
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.info;

  return (
    <div
      className={`alert ${className}`}
      role="alert"
      style={{ ...variantStyle, ...style }}
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

      {/* Ghost button creates a subtle, circular close affordance */}
      {closable && (
        <button
          type="button"
          style={{ background: 'transparent', color: 'var(--ds-color-text-primary)', width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 13 }}
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
