/**
 * Alert - Hermes Engine (DaisyUI)
 */

import React, { useState } from 'react';
import type { AlertProps, AlertType } from '../../types';
import { ALERT_DEFAULTS } from '../../types';

const TYPE_CLASSES: Record<AlertType, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

const TYPE_ICONS: Record<AlertType, string> = {
  info: '💡',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

export default function HermesAlert(props: AlertProps): React.ReactElement | null {
  const [visible, setVisible] = useState(true);
  const {
    type = ALERT_DEFAULTS.type as AlertType,
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

  const alertType = type as AlertType;

  return (
    <div className={`alert ${TYPE_CLASSES[alertType]} ${className}`} style={style}>
      {showIcon && <span>{icon || TYPE_ICONS[alertType]}</span>}
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
