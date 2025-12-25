/**
 * Toast - Hermes Engine (DaisyUI)
 */

import React, { useEffect } from 'react';
import type { ToastProps } from '../types';
import { TOAST_DEFAULTS } from '../types';

const VARIANT_CLASSES = {
  default: 'alert',
  success: 'alert alert-success',
  warning: 'alert alert-warning',
  error: 'alert alert-error',
  info: 'alert alert-info',
};

const VARIANT_ICONS = {
  default: '📢',
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
};

export default function HermesToast(props: ToastProps): React.ReactElement {
  const {
    variant = TOAST_DEFAULTS.variant,
    title,
    description,
    duration = TOAST_DEFAULTS.duration,
    closable = TOAST_DEFAULTS.closable,
    onClose,
    action,
    icon,
    className = '',
    style,
  } = props;

  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return <></>;

  return (
    <div className={`${VARIANT_CLASSES[variant!]} shadow-lg ${className}`} style={style}>
      <div className="flex items-center gap-2">
        {icon || <span>{VARIANT_ICONS[variant!]}</span>}
        <div className="flex-1">
          {title && <div className="font-bold">{title}</div>}
          {description && <div className="text-sm">{description}</div>}
        </div>
        {action && (
          <button className="btn btn-sm" onClick={action.onClick}>
            {action.label}
          </button>
        )}
        {closable && (
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
