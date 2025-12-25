/**
 * Result Component Types
 *
 * Unified type definitions for Result component across all engines.
 * Compatible with: titan (AntD), hermes (DaisyUI), apollo (Native HTML + Tailwind)
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Result status type
 * Determines the icon, color, and overall appearance
 */
export type ResultStatus =
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | '404'
  | '403'
  | '500';

/**
 * Base props that ALL engines must support.
 * These are the core properties available regardless of the rendering engine.
 */
export interface ResultBaseProps {
  // Status configuration
  status?: ResultStatus;

  // Content
  title?: ReactNode;
  subTitle?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;

  // Styling
  className?: string;
  style?: CSSProperties;
}

/**
 * Extended props for Result components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface ResultProps extends ResultBaseProps {
  // HTML id attribute
  id?: string;
}

/**
 * Status icon configuration
 * Maps status to default icon and color scheme
 */
export interface StatusConfig {
  icon: ReactNode;
  color: string;
  iconClass: string;
}

/**
 * Get default icon for a given status
 * Used by engines to provide consistent default icons
 */
export function getStatusIcon(status: ResultStatus): string {
  const iconMap: Record<ResultStatus, string> = {
    success: 'check-circle',
    error: 'close-circle',
    info: 'exclamation-circle',
    warning: 'warning',
    '404': 'file-search',
    '403': 'lock',
    '500': 'bug',
  };
  return iconMap[status] ?? 'info-circle';
}

/**
 * Get color class for a given status
 * Used by engines to apply consistent status colors
 */
export function getStatusColor(status: ResultStatus): string {
  const colorMap: Record<ResultStatus, string> = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    '404': 'text-gray-500',
    '403': 'text-red-500',
    '500': 'text-red-500',
  };
  return colorMap[status] ?? 'text-blue-500';
}

/**
 * Get background color class for a given status
 * Used by engines for status-specific background colors
 */
export function getStatusBgColor(status: ResultStatus): string {
  const bgColorMap: Record<ResultStatus, string> = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
    '404': 'bg-gray-50',
    '403': 'bg-red-50',
    '500': 'bg-red-50',
  };
  return bgColorMap[status] ?? 'bg-blue-50';
}

/**
 * Type guard to check if status is a HTTP error code
 */
export function isHttpErrorStatus(status?: ResultStatus): status is '404' | '403' | '500' {
  return status === '404' || status === '403' || status === '500';
}

/**
 * Type guard to check if status is a standard status
 */
export function isStandardStatus(
  status?: ResultStatus
): status is 'success' | 'error' | 'info' | 'warning' {
  return (
    status === 'success' ||
    status === 'error' ||
    status === 'info' ||
    status === 'warning'
  );
}
