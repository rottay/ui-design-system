/**
 * Alert - Hermes Engine (DaisyUI)
 */

import React, { useState } from 'react';
import type { AlertProps } from '../types';
import { ALERT_DEFAULTS } from '../types';

const TYPE_CLASSES = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

const TYPE_ICONS = {
  info: '💡',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

export default function HermesAlert(props: AlertProps): React.ReactElement | null {
  const [visible, setVisible] = useState(true);
  const {
    type = ALERT_DEFAULTS.type,
    message,
    description,
    icon,
    showIcon = ALERT_DEFAULTS.showIcon,
    closable = ALERT_DEFAULTS.closable,
    onClose,
    className = '',
    style,
  } = props;

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div className={`alert ${TYPE_CLASSES[type!]} ${className}`} style={style}>
      {showIcon && <span>{icon || TYPE_ICONS[type!]}</span>}
      <div>
        <div className="font-bold">{message}</div>
        {description && <div className="text-sm">{description}</div>}
      </div>
      {closable && (
        <button className="btn btn-sm btn-ghost" onClick={handleClose}>✕</button>
      )}
    </div>
  );
}
