import type { CSSProperties, HTMLAttributes } from 'react';

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Container max-width size */
  size?: ContainerSize;
  /** Apply horizontal padding */
  padding?: boolean;
  /** Center the container horizontally */
  centered?: boolean;
  /** Remove max-width constraint */
  fluid?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Child elements */
  children?: React.ReactNode;
}
