'use client';

/**
 * @fileoverview Callout Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind implementation of the Callout component.
 * Uses DaisyUI alert with enhancements.
 *
 * @module Callout/Engines/Modern
 * @category Display
 * @package @rottay/design-system
 */

import React, { useState } from 'react';
import type { CalloutProps } from '../../types';
import { CALLOUT_DEFAULTS, CALLOUT_ICONS } from '../../types';

const VARIANT_CLASSES: Record<string, string> = {
  info: 'alert-info',
  warning: 'alert-warning',
  error: 'alert-error',
  success: 'alert-success',
};

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

  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.info;

  return (
    <div
      className={`alert ${variantClass} ${className}`}
      role="alert"
      style={style}
    >
      <span className="text-lg font-bold">
        {icon || CALLOUT_ICONS[variant]}
      </span>
      <div className="flex flex-col gap-1 flex-1">
        {title && (
          <span className="font-semibold text-sm">{title}</span>
        )}
        <span className="text-sm">{children}</span>
        {action && (
          <div className="mt-2">{action}</div>
        )}
      </div>
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
