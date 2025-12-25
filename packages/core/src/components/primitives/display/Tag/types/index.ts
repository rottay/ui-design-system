import type { BaseComponentProps } from '../../../../../types/common';
import type { EngineAwareProps } from '../../../../../types/engine';

/**
 * Tag size options.
 */
export type TagSize = 'sm' | 'md' | 'lg';

/**
 * Tag visual variants.
 */
export type TagVariant = 'solid' | 'outline' | 'subtle';

/**
 * Tag semantic colors.
 */
export type TagColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

/**
 * Props for the Tag component.
 */
export interface TagProps extends BaseComponentProps, EngineAwareProps {
  /** Tag size */
  size?: TagSize;
  /** Tag variant */
  variant?: TagVariant;
  /** Tag color */
  color?: TagColor;
  /** Closable tag with close icon */
  closable?: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Icon before text */
  icon?: React.ReactNode;
  /** Tag content */
  children: React.ReactNode;
  /** Rounded pill style */
  rounded?: boolean;
  /** Bordered style */
  bordered?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Clickable state */
  clickable?: boolean;
  /** Click callback */
  onClick?: () => void;
}
