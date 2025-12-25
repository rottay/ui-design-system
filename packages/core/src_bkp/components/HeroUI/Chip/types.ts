import { ReactNode } from 'react';

export type ChipVariant = 'solid' | 'bordered' | 'flat' | 'dot' | 'shadow';
export type ChipColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';
export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ChipProps {
  /**
   * Content of the chip
   */
  children: ReactNode;

  /**
   * Style variant
   * @default 'solid'
   */
  variant?: ChipVariant;

  /**
   * Color theme
   * @default 'default'
   */
  color?: ChipColor;

  /**
   * Size of the chip
   * @default 'md'
   */
  size?: ChipSize;

  /**
   * Border radius
   * @default 'full'
   */
  radius?: ChipRadius;

  /**
   * Avatar/icon to show on the left
   */
  avatar?: ReactNode;

  /**
   * Icon to show on the left (alternative to avatar)
   */
  startContent?: ReactNode;

  /**
   * Icon to show on the right
   */
  endContent?: ReactNode;

  /**
   * Show close button
   * @default false
   */
  closeable?: boolean;

  /**
   * Callback when close button is clicked
   */
  onClose?: () => void;

  /**
   * Callback when chip is clicked
   */
  onClick?: () => void;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;
}
