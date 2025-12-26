import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, Variant, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * Badge specific sizes.
 */
export type BadgeSize = Size;

/**
 * Badge variants.
 */
export type BadgeVariant = Variant;

/**
 * Badge visual style.
 */
export type BadgeStyle = 'solid' | 'outline' | 'soft' | 'ghost';

/**
 * Badge status for status indicators.
 */
export type BadgeStatus = 'processing' | 'default' | 'success' | 'error' | 'warning';

/**
 * Badge component props.
 */
export interface BadgeProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  /**
   * Badge size.
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Badge color variant.
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Badge visual style.
   * @default 'solid'
   */
  badgeStyle?: BadgeStyle;

  /**
   * Badge content (number or text). Alternative to count.
   */
  content?: number | string;

  /**
   * Number to display on badge. Alternative to content.
   */
  count?: number;

  /**
   * Whether to show the badge as a small dot.
   */
  dot?: boolean;

  /**
   * Whether to show zero when count is 0.
   * @default false
   */
  showZero?: boolean;

  /**
   * Maximum number to show before using "+".
   * For example, if max=99 and content=100, shows "99+".
   * @default 99
   */
  max?: number;

  /**
   * @deprecated Use max instead. Maximum number before showing "+".
   * @default 99
   */
  overflowCount?: number;

  /**
   * Status indicator for dot badges.
   */
  status?: BadgeStatus;

  /**
   * Text to show next to status dot.
   */
  text?: string;

  /**
   * Offset of the badge from default position [x, y].
   */
  offset?: [number, number];

  /**
   * Whether the badge is visible.
   * @default true
   */
  visible?: boolean;

  /**
   * Whether to show a pulsing animation (for notifications).
   */
  pulse?: boolean;

  /**
   * Badge position when over another element.
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Icon to show before content.
   */
  icon?: ReactNode;

  /**
   * Whether the badge can be closed.
   */
  closable?: boolean;

  /**
   * Badge close callback.
   */
  onClose?: () => void;

  /**
   * Whether the badge is clickable.
   */
  clickable?: boolean;

  /**
   * Badge click callback.
   */
  onClick?: () => void;

  /**
   * Whether the badge has a border.
   */
  bordered?: boolean;

  /**
   * Badge border radius.
   * @default 'full'
   */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Badge.Ribbon component props (ribbon/banner badge).
 */
export interface BadgeRibbonProps extends BaseComponentProps {
  /**
   * Ribbon text.
   */
  text: string;

  /**
   * Color variant.
   * @default 'primary'
   */
  variant?: BadgeVariant;

  /**
   * Ribbon position.
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Element the ribbon is placed on.
   */
  children: ReactNode;
}

/**
 * Badge.Count component props (numeric counter).
 */
export interface BadgeCountProps extends BaseComponentProps {
  /**
   * Number to show.
   */
  count: number;

  /**
   * Maximum number before showing "+".
   * @default 99
   */
  max?: number;

  /**
   * Color variant.
   * @default 'error'
   */
  variant?: BadgeVariant;

  /**
   * Whether to show the counter even when 0.
   * @default false
   */
  showZero?: boolean;

  /**
   * Whether to show the counter.
   * @default true
   */
  visible?: boolean;

  /**
   * Element the counter is placed on.
   */
  children?: ReactNode;
}
