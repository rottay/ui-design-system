/**
 * Alert Component Types
 *
 * Unified type definitions for Alert component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Alert type variants
 */
export type AlertType = 'success' | 'info' | 'warning' | 'error';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface AlertBaseProps {
  // Content
  message?: ReactNode;
  description?: ReactNode;

  // Type/Variant
  type?: AlertType;

  // Icon
  showIcon?: boolean;
  icon?: ReactNode;

  // Interaction
  closable?: boolean;
  onClose?: () => void;

  // Styling
  className?: string;
  style?: CSSProperties;

  // Accessibility
  id?: string;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Extended props with engine-specific features.
 * Not all engines may support all these properties.
 */
export interface AlertProps extends AlertBaseProps {
  // Banner mode (titan primary support)
  banner?: boolean;

  // Close button text (titan support)
  closeText?: ReactNode;

  // Action button (custom extension)
  action?: ReactNode;

  // After close callback (titan support)
  afterClose?: () => void;

  // Close icon custom element (titan support)
  closeIcon?: ReactNode;
}

/**
 * Type guard to check if alert is closable
 */
export function isClosableAlert(props: AlertProps): boolean {
  return props.closable === true;
}

/**
 * Get alert icon based on type
 */
export function getAlertTypeIcon(type: AlertType): string {
  switch (type) {
    case 'success':
      return '✓';
    case 'info':
      return 'ℹ';
    case 'warning':
      return '⚠';
    case 'error':
      return '✕';
    default:
      return 'ℹ';
  }
}

/**
 * Get alert color classes based on type
 */
export function getAlertTypeColor(type: AlertType): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600',
      };
    case 'info':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-600',
      };
    case 'error':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
      };
    default:
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
      };
  }
}
