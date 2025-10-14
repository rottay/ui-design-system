export type SkeletonVariant =
  | 'text'
  | 'paragraph'
  | 'card'
  | 'table'
  | 'profile'
  | 'custom';

export type SkeletonSize = 'small' | 'default' | 'large';

export interface SkeletonLoaderProps {
  /**
   * Predefined variant type
   * @default 'text'
   */
  variant?: SkeletonVariant;

  /**
   * Number of skeleton items to render
   * @default 1
   */
  count?: number;

  /**
   * Size of the skeleton
   * @default 'default'
   */
  size?: SkeletonSize;

  /**
   * Show animated shimmer effect
   * @default true
   */
  active?: boolean;

  /**
   * Custom children for 'custom' variant
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;

  /**
   * Number of rows for paragraph variant
   * @default 3
   */
  rows?: number;

  /**
   * Number of columns for table variant
   * @default 4
   */
  columns?: number;
}
