/**
 * @fileoverview Avatar Types - Rottay Design System
 * @description Type definitions for the Avatar component.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This module provides default values and size mappings for the Avatar component.
 *
 * **Exported Types:**
 * - `AvatarProps` - Main component props interface
 * - `AvatarSize` - Size variant type ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl')
 * - `AvatarShape` - Shape variant type ('circle' | 'square' | 'rounded')
 * - `AvatarVariant` - Color variant type
 * - `AvatarStatus` - Status indicator type ('online' | 'offline' | 'away' | 'busy')
 * - `AvatarGroupProps` - Group component props
 * - `AvatarBadgeProps` - Badge compound props
 * - `AvatarFallbackProps` - Fallback compound props
 *
 * **Configuration Constants:**
 * - `AVATAR_DEFAULTS` - Default prop values
 * - `SIZE_MAP` - Pixel values for each size
 *
 * @example Type Usage
 * ```tsx
 * import type { AvatarProps, AvatarSize, AvatarStatus } from '@rottay/design-system';
 *
 * interface UserAvatarProps extends AvatarProps {
 *   userId: string;
 * }
 * ```
 *
 * @see {@link Avatar} for the main component
 * @module AvatarTypes
 * @category Display
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { BaseComponentProps, Size, Tone, Variant, Shape, WithChildren, BorderedProps } from '../../../../../foundation/contracts/kernel/common';
import { TONE_TO_VARIANT } from '../../../../../foundation/contracts/kernel/common';
import type { EngineAwareProps } from '../../../../../foundation/contracts/runtime/engine';

/** Avatar size type alias derived from the global Size scale. */
export type AvatarSize = Size;

/**
 * @deprecated Use {@link Tone} via the `tone` prop instead. Retained for one release so
 * existing values keep compiling.
 */
export type AvatarVariant = Variant;

/**
 * The {@link Tone} values Avatar accepts through the `tone` prop. `'info'` is excluded: no
 * engine defines `--ds-avatar-info-*` color tokens (unlike Badge, Avatar's variant vocabulary
 * only ever covered 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' |
 * 'gradient').
 */
export type AvatarTone = Exclude<Tone, 'info'>;

/**
 * @deprecated Use the kernel {@link TONE_TO_VARIANT} map directly; this export now folds into
 * it and is retained under Avatar's name for one release. Every {@link AvatarTone} value mapped
 * to the internal color-token key `variant` has always used ('danger' is the canonical Tone
 * spelling; Avatar's internal key has always been 'error'). `TONE_TO_VARIANT`'s extra `info` key
 * is harmless here: this binding's `Record<AvatarTone, AvatarVariant>` type does not require it.
 */
export const TONE_TO_AVATAR_VARIANT: Record<AvatarTone, AvatarVariant> = TONE_TO_VARIANT;

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
   * Avatar semantic color. Takes precedence over the deprecated `variant` prop when both
   * are given.
   * @default 'neutral'
   */
  tone?: AvatarTone;

  /**
   * @deprecated Use `tone` instead. Avatar color variant.
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

/**
 * Default values for Avatar component props.
 * These are applied when no explicit value is provided.
 */
export const AVATAR_DEFAULTS = {
  /** Default avatar size */
  size: 'md' as const,
  /** Default avatar shape */
  shape: 'circle' as const,
  /** Default color variant */
  variant: 'default' as const,
  /** Whether bordered by default */
  bordered: false,
  /** Whether to show zero count by default */
  showZero: false,
  /** Whether to show ring by default */
  ring: false,
};

/**
 * Size mapping to pixel values.
 * Corresponds to CSS token values for each size variant.
 */
export const SIZE_MAP: Record<string, number> = {
  /** Extra small: 24px (1.5rem) */
  xs: 24,
  /** Small: 32px (2rem) */
  sm: 32,
  /** Medium: 40px (2.5rem) - default */
  md: 40,
  /** Large: 48px (3rem) */
  lg: 48,
  /** Extra large: 56px (3.5rem) */
  xl: 56,
  /** 2X large: 64px (4rem) */
  '2xl': 64,
  /** 3X large: 96px (6rem) */
  '3xl': 96,
};
