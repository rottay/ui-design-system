'use client';

/**
 * @fileoverview Classic engine for the Callout component, styled after Ant Design.
 * Renders an inline alert banner with icon, title, body, optional action slot,
 * and a dismissible close button -- all using inline styles and CSS variables.
 *
 * @example
 * ```tsx
 * <Callout engine="classic" variant="warning" title="Heads up" closable>
 *   Your subscription is about to expire.
 * </Callout>
 * ```
 *
 * @module Callout/engines/classic
 * @category Display
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { CalloutProps } from '../Callout.types';
import { CALLOUT_DEFAULTS, CALLOUT_COLORS, CALLOUT_ICONS, TONE_TO_CALLOUT_VARIANT } from '../Callout.types';

/**
 * Classic (Ant Design-styled) implementation of the Callout component.
 *
 * Uses inline styles with CSS-variable colour tokens for each variant.
 * The component self-manages its dismissed state internally via useState.
 *
 * @param props - {@link CalloutProps} controlling variant, content, and behaviour.
 * @returns A dismissible alert banner, or null when dismissed.
 */
export default function ClassicCallout(props: CalloutProps): React.ReactElement | null {
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

  // tone (semantic) takes precedence over the deprecated variant prop; CALLOUT_COLORS
  // and CALLOUT_ICONS below are keyed by the same internal color-token name either way.
  const variant = tone ? TONE_TO_CALLOUT_VARIANT[tone] : variantProp;

  // Internal dismiss state: once closed, the component returns null.
  // This is uncontrolled -- consumers who need controlled visibility
  // should conditionally render the Callout themselves.
  const [visible, setVisible] = useState(true);
  const colors = CALLOUT_COLORS[variant];

  if (!visible) return null;

  // Notify the consumer first, then hide. The order ensures the callback
  // fires before the DOM node is removed.
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      className={`rottay-callout-classic rottay-callout--${variant} ${className}`}
      role="alert"
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 8,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: 14,
        lineHeight: 1.6,
        fontFamily: 'var(--ds-font-family-base, inherit)',
        position: 'relative',
        ...style,
      }}
    >
      {/* Icon column: fixed-width to keep text alignment consistent across
          different icon sizes. Custom icon prop overrides the variant default. */}
      <span
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: colors.icon,
          marginTop: 2,
        }}
      >
        {icon || CALLOUT_ICONS[variant]}
      </span>

      {/* Content column: flex-1 fills remaining space; minWidth:0 prevents
          long text from overflowing the flex container. */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontWeight: 600, marginBottom: children ? 4 : 0, fontSize: 14 }}>
            {title}
          </div>
        )}
        <div>{children}</div>
        {/* Action slot for buttons/links placed below the body text */}
        {action && (
          <div style={{ marginTop: 8 }}>{action}</div>
        )}
      </div>

      {/* Close button with reduced opacity to avoid competing with content */}
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          style={{
            flexShrink: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 16,
            color: colors.text,
            opacity: 0.6,
            padding: '0 2px',
            lineHeight: 1,
          }}
        >
          x
        </button>
      )}
    </div>
  );
}

ClassicCallout.displayName = 'Callout.Classic';
