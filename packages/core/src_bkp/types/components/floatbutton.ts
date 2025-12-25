/**
 * FloatButton Component Types
 *
 * Unified type definitions for floating action button.
 * Works with titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import type { CSSProperties, ReactNode, MouseEvent } from 'react';

/**
 * Float button type
 */
export type FloatButtonType = 'default' | 'primary';

/**
 * Float button shape
 */
export type FloatButtonShape = 'circle' | 'square';

/**
 * Float button badge config
 */
export interface FloatButtonBadge {
  /** Badge count */
  count?: number;
  /** Show dot instead of count */
  dot?: boolean;
  /** Offset position */
  offset?: [number, number];
}

/**
 * Base FloatButton props supported by all engines
 */
export interface FloatButtonBaseProps {
  /** Button icon */
  icon?: ReactNode;
  /** Description text */
  description?: ReactNode;
  /** Tooltip text */
  tooltip?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Click handler */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Extended FloatButton props with engine-specific features
 */
export interface FloatButtonProps extends FloatButtonBaseProps {
  /** Button type */
  type?: FloatButtonType;
  /** Button shape */
  shape?: FloatButtonShape;
  /** Badge configuration */
  badge?: FloatButtonBadge;
  /** Link href */
  href?: string;
  /** Link target */
  target?: string;
}

/**
 * Float button group trigger type
 */
export type FloatButtonGroupTrigger = 'click' | 'hover';

/**
 * FloatButton.Group props
 */
export interface FloatButtonGroupProps {
  /** Trigger method */
  trigger?: FloatButtonGroupTrigger;
  /** Whether group is open (controlled) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Group icon (main button icon) */
  icon?: ReactNode;
  /** Close icon */
  closeIcon?: ReactNode;
  /** Button type */
  type?: FloatButtonType;
  /** Button shape */
  shape?: FloatButtonShape;
  /** Group description */
  description?: ReactNode;
  /** Tooltip text */
  tooltip?: ReactNode;
  /** Badge configuration */
  badge?: FloatButtonBadge;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Child buttons */
  children?: ReactNode;
}

/**
 * FloatButton.BackTop props
 */
export interface FloatButtonBackTopProps extends FloatButtonProps {
  /** Scroll height to show button */
  visibilityHeight?: number;
  /** Scroll target */
  target?: () => HTMLElement | Window | null;
  /** Scroll duration */
  duration?: number;
}
