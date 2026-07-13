'use client';

/**
 * @fileoverview Rustic engine for the Callout component, using pure HTML/CSS.
 * Renders a semantic `<aside>` alert with a coloured left border accent,
 * icon, title, body, optional action, and dismissible close button --
 * all without external CSS framework dependencies.
 *
 * @example
 * ```tsx
 * <Callout engine="rustic" variant="error" title="Error" closable>
 *   Something went wrong. Please try again.
 * </Callout>
 * ```
 *
 * @module Callout/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { CalloutProps } from '../Callout.types';
import { CALLOUT_DEFAULTS, CALLOUT_COLORS, CALLOUT_ICONS, TONE_TO_CALLOUT_VARIANT } from '../Callout.types';

/**
 * Rustic (Pure HTML/CSS) implementation of the Callout component.
 *
 * Uses a semantic `<aside>` element with inline styles and CSS-variable
 * colour tokens. Differentiated from the classic engine by its left-border
 * accent style (instead of a full border) for a more editorial look.
 *
 * @param props - {@link CalloutProps} controlling variant, content, and behaviour.
 * @returns A semantic aside alert element, or null when dismissed.
 */
export default function RusticCallout(props: CalloutProps): React.ReactElement | null {
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

  // Uncontrolled dismiss: once closed, the aside is removed from the DOM
  const [visible, setVisible] = useState(true);
  const colors = CALLOUT_COLORS[variant];

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    // <aside> is semantically appropriate for tangential content like alerts.
    // The left-border accent (borderLeft) visually differentiates the rustic
    // engine from the classic engine's full-border approach.
    <aside
      className={`rottay-callout-rustic rottay-callout--${variant} rottay-callout-shell rottay-callout-shell--rustic ${className}`}
      role="alert"
      data-part="root"
      data-tone={variant}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 8,
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.icon}`,
        color: colors.text,
        fontSize: 14,
        lineHeight: 1.6,
        fontFamily: 'var(--ds-font-family-base, inherit)',
        position: 'relative',
        ...style,
      }}
    >
      {/* Icon column: fixed-size prevents text from pushing the icon around */}
      <span
        data-part="icon"
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

      {/* Content column: minWidth:0 prevents flex overflow on long unbreakable text */}
      <div data-part="body" style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div data-part="title" style={{ fontWeight: 600, marginBottom: children ? 4 : 0, fontSize: 14 }}>
            {title}
          </div>
        )}
        <div data-part="description">{children}</div>
        {/* Action slot for CTA buttons placed below the body */}
        {action && (
          <div data-part="action" style={{ marginTop: 8 }}>{action}</div>
        )}
      </div>

      {/* Close button: reduced opacity keeps it visually subordinate to content */}
      {closable && (
        <button
          type="button"
          data-part="close-button"
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
    </aside>
  );
}

RusticCallout.displayName = 'Callout.Rustic';
