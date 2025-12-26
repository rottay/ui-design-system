/**
 * Container Types
 */
import type { ReactNode, CSSProperties } from 'react';

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

export interface ContainerProps {
  /** Maximum width of the container */
  maxWidth?: ContainerMaxWidth | number;
  /** Center the container horizontally */
  center?: boolean;
  /** Padding inside the container */
  padding?: ContainerPadding | number;
  /** If true, container takes full width of parent */
  fluid?: boolean;
  /** Container content */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export const CONTAINER_DEFAULTS: Partial<ContainerProps> = {
  center: true,
  padding: 'md',
  fluid: false,
  maxWidth: 'lg',
};

/** Max width values in pixels */
export const CONTAINER_MAX_WIDTHS: Record<ContainerMaxWidth, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

/** Padding values in pixels */
export const CONTAINER_PADDINGS: Record<ContainerPadding, string> = {
  none: '0',
  sm: '8px',
  md: '16px',
  lg: '24px',
};
