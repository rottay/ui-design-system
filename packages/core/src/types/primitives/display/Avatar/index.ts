import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, Variant, Shape, WithChildren, BorderedProps } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Avatar specific sizes.
 */
export type AvatarSize = Size;

/**
 * Avatar variants.
 */
export type AvatarVariant = Variant;

/**
 * Avatar shapes.
 */
export type AvatarShape = Shape;

/**
 * Avatar status states.
 */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/**
 * Base Avatar component props.
 */
export interface AvatarProps extends BaseComponentProps, EngineAwareProps, WithChildren, BorderedProps {
  /**
   * Avatar size.
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Avatar color variant.
   * @default 'default'
   */
  variant?: AvatarVariant;

  /**
   * Avatar shape.
   * @default 'circle'
   */
  shape?: AvatarShape;

  /**
   * Avatar image URL.
   */
  src?: string;

  /**
   * Alternative text for the image.
   */
  alt?: string;

  /**
   * Initials to show if no image.
   * If not provided, calculated from alt or name.
   */
  initials?: string;

  /**
   * User name (used to generate initials).
   */
  name?: string;

  /**
   * User presence/status state.
   */
  status?: AvatarStatus;

  /**
   * Whether the avatar is clickable.
   */
  clickable?: boolean;

  /**
   * Click callback (if clickable=true).
   */
  onClick?: () => void;

  /**
   * Image load error callback.
   */
  onError?: (error: Error) => void;

  /**
   * Image load success callback.
   */
  onLoad?: () => void;

  /**
   * Custom background color for initials.
   */
  backgroundColor?: string;

  /**
   * Custom text color for initials.
   */
  textColor?: string;

  /**
   * Whether to show a ring around the avatar.
   */
  ring?: boolean;

  /**
   * Ring color.
   */
  ringColor?: string;
}

/**
 * Avatar.Group component props.
 */
export interface AvatarGroupProps extends BaseComponentProps {
  /**
   * Maximum number of avatars to show.
   * The rest are shown as "+N".
   * @default 5
   */
  max?: number;

  /**
   * Avatar group size.
   */
  size?: AvatarSize;

  /**
   * Spacing between avatars.
   * @default 'normal'
   */
  spacing?: 'compact' | 'normal' | 'loose';

  /**
   * Whether to show the overflow counter.
   * @default true
   */
  showOverflow?: boolean;

  /**
   * Avatar group children.
   */
  children: ReactNode;

  /**
   * Overflow counter click callback.
   */
  onOverflowClick?: () => void;

  /**
   * Avatar stack direction.
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';
}

/**
 * Avatar.Badge component props.
 */
export interface AvatarBadgeProps extends BaseComponentProps {
  /**
   * Badge content (number or text).
   */
  content?: number | string;

  /**
   * Badge color variant.
   * @default 'primary'
   */
  variant?: Variant;

  /**
   * Badge position.
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Whether the badge is visible.
   * @default true
   */
  visible?: boolean;

  /**
   * Whether to show the badge as a small dot instead of with content.
   */
  dot?: boolean;

  /**
   * Whether to show a white border around the badge.
   * @default true
   */
  bordered?: boolean;

  /**
   * Maximum number to show before using "+".
   * For example, if max=99 and content=100, shows "99+".
   * @default 99
   */
  max?: number;
}

/**
 * Avatar.Fallback component props.
 */
export interface AvatarFallbackProps extends BaseComponentProps {
  /**
   * Fallback text (initials).
   */
  text?: string;

  /**
   * Fallback icon (if no text).
   */
  icon?: ReactNode;

  /**
   * Delay before showing fallback (to avoid flash).
   * @default 0
   */
  delayMs?: number;

  /**
   * Fallback background color.
   */
  backgroundColor?: string;

  /**
   * Fallback text/icon color.
   */
  color?: string;
}

/**
 * Avatar status indicator configuration.
 */
export interface AvatarStatusConfig {
  /** Current status */
  status: AvatarStatus;
  /** Whether to show the status */
  show: boolean;
  /** Status indicator position */
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  /** Whether the status has a white border */
  bordered?: boolean;
}
