import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, Variant, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Tag specific sizes.
 */
export type TagSize = Size;

/**
 * Tag variants.
 */
export type TagVariant = Variant;

/**
 * Tag component props.
 */
export interface TagProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Tag size.
   * @default 'md'
   */
  size?: TagSize;

  /**
   * Tag color variant.
   * @default 'default'
   */
  variant?: TagVariant;

  /**
   * Tag icon.
   */
  icon?: ReactNode;

  /**
   * Whether the tag can be closed.
   * @default false
   */
  closable?: boolean;

  /**
   * Tag close callback.
   */
  onClose?: () => void;

  /**
   * Whether the tag is clickable.
   */
  clickable?: boolean;

  /**
   * Tag click callback.
   */
  onClick?: () => void;

  /**
   * Whether the tag has a border.
   * @default false
   */
  bordered?: boolean;

  /**
   * Tag border radius.
   * @default 'md'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

  /**
   * Custom tag color.
   */
  color?: string;

  /**
   * Whether the tag has an "outlined" style.
   */
  outlined?: boolean;
}
