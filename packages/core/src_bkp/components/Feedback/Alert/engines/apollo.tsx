/**
 * Apollo Alert Engine
 *
 * Native HTML + Tailwind CSS alert implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState } from 'react';
import type { AlertProps, AlertType } from '../../../../types/components/alert';
import { getAlertTypeColor } from '../../../../types/components/alert';
import { cn } from '../../../../utils/cn';

// Icon components for different alert types
const SuccessIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
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
 * Apollo Alert - Native HTML + Tailwind implementation
 */
function ApolloAlert({
  type = 'info',
  message,
  description,
  showIcon = false,
  closable = false,
  onClose,
  icon,
  className,
  style,
  id,
  banner = false,
  action,
  role = 'alert',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  const colors = getAlertTypeColor(type);

  // Handle close action
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn(
        'rounded-lg border p-4',
        colors.bg,
        colors.border,
        banner && 'rounded-none border-x-0',
        className
      )}
      style={style}
    >
      <div className="flex">
        {/* Icon */}
        {showIcon && (
          <div className={cn('flex-shrink-0', colors.icon)}>
            {icon ?? getDefaultIcon(type)}
          </div>
        )}

        {/* Content */}
        <div className={cn('flex-1', showIcon && 'ml-3')}>
          {/* Message */}
          {message && (
            <h3 className={cn('text-sm font-medium', colors.text)}>
              {message}
            </h3>
          )}

          {/* Description */}
          {description && (
            <div className={cn('mt-2 text-sm', colors.text, !!message && 'opacity-90')}>
              {description}
            </div>
          )}

          {/* Action */}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>

        {/* Close button */}
        {closable && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                colors.text,
                'hover:opacity-75 transition-opacity'
              )}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

ApolloAlert.displayName = 'ApolloAlert';

export default ApolloAlert;
