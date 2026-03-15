'use client';

/**
 * @fileoverview Callout Classic Engine - Rottay Design System
 * @description Ant Design styled implementation of the Callout component.
 * A richer alternative to Ant Alert.
 *
 * @module Callout/Engines/Classic
 * @category Display
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { CalloutProps } from '../Callout.types';
import { CALLOUT_DEFAULTS, CALLOUT_COLORS, CALLOUT_ICONS } from '../Callout.types';

export default function ClassicCallout(props: CalloutProps): React.ReactElement | null {
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

  const [visible, setVisible] = useState(true);
  const colors = CALLOUT_COLORS[variant];

  if (!visible) return null;

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
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontWeight: 600, marginBottom: children ? 4 : 0, fontSize: 14 }}>
            {title}
          </div>
        )}
        <div>{children}</div>
        {action && (
          <div style={{ marginTop: 8 }}>{action}</div>
        )}
      </div>
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
