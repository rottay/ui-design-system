import React from 'react';

/**
 * Base props for Container components
 * These props are supported by ALL engines (titan/AntD, hermes/DaisyUI, apollo/HTML+Tailwind)
 */
export interface ContainerBaseProps {
  /** Container content */
  children?: React.ReactNode;

  /** Additional CSS class name */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Extended props for Container components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface ContainerProps extends ContainerBaseProps {
  /** Maximum width of the container */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | number;

  /** Whether the container has padding */
  padding?: boolean;

  /** Whether the container should be centered */
  centered?: boolean;

  /** Whether the container should be fluid (full width) */
  fluid?: boolean;
}

/**
 * Utility function to get max-width value
 */
export const getMaxWidth = (maxWidth: ContainerProps['maxWidth']): string => {
  if (typeof maxWidth === 'number') {
    return `${maxWidth}px`;
  }

  const widths: Record<string, string> = {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  };

  return widths[maxWidth ?? 'lg'] ?? widths.lg;
};
