/**
 * Hermes Alert Engine
 *
 * DaisyUI alert implementation with unified AlertProps.
 */

'use client';

import { useState } from 'react';
import type { AlertProps, AlertType } from '../../../../types/components/alert';

// Map unified alert type to DaisyUI classes
const alertTypeClasses: Record<AlertType, string> = {
  success: 'alert-success',
  info: 'alert-info',
  warning: 'alert-warning',
  error: 'alert-error',
};

// Default icons for alert types
const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="stroke-current shrink-0 h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="stroke-current shrink-0 w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="stroke-current shrink-0 h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="stroke-current shrink-0 h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Get default icon for alert type
function getDefaultIcon(type: AlertType = 'info') {
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'info':
      return <InfoIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'error':
      return <ErrorIcon />;
    default:
      return <InfoIcon />;
  }
}

/**
 * Hermes Alert - DaisyUI implementation with unified AlertProps
 */
function HermesAlert({
  type = 'info',
  message,
  description,
  showIcon = false,
  closable = false,
  onClose,
  icon,
  className = '',
  style,
  id,
  action,
  role = 'alert',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  // Handle close action
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) {
    return null;
  }

  const classes = [
    'alert',
    alertTypeClasses[type],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role={role}
      id={id}
      className={classes}
      style={style}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {/* Icon */}
      {showIcon && (icon ?? getDefaultIcon(type))}

      {/* Content */}
      <div className="flex-1">
        {/* Message */}
        {message && (
          <div className="font-semibold">{message}</div>
        )}

        {/* Description */}
        {description && (
          <div className={message ? 'text-sm mt-1' : ''}>
            {description}
          </div>
        )}
      </div>

      {/* Action */}
      {action && (
        <div>
          {action}
        </div>
      )}

      {/* Close button */}
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}

HermesAlert.displayName = 'HermesAlert';

export default HermesAlert;
