/**
 * FloatButton Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface FloatButtonProps {
  /** Button icon */
  icon?: ReactNode;
  /** Button description */
  description?: ReactNode;
  /** Tooltip text */
  tooltip?: ReactNode;
  /** Button type */
  type?: 'default' | 'primary';
  /** Button shape */
  shape?: 'circle' | 'square';
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Link href */
  href?: string;
  /** Link target */
  target?: string;
  /** Badge dot */
  badge?: { dot?: boolean; count?: number };
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Children (for accessibility) */
  children?: ReactNode;
}

export interface FloatButtonGroupProps {
  /** Trigger mode */
  trigger?: 'click' | 'hover';
  /** Whether group is open (controlled) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Group icon */
  icon?: ReactNode;
  /** Close icon */
  closeIcon?: ReactNode;
  /** Button shape */
  shape?: 'circle' | 'square';
  /** Button type */
  type?: 'default' | 'primary';
  /** Tooltip text */
  tooltip?: ReactNode;
  /** Group children */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export interface FloatButtonBackTopProps {
  /** Visibility threshold (scroll height) */
  visibilityHeight?: number;
  /** Scroll target */
  target?: () => HTMLElement | Window;
  /** Click callback */
  onClick?: () => void;
  /** Animation duration in ms */
  duration?: number;
  /** Button icon */
  icon?: ReactNode;
  /** Button description */
  description?: ReactNode;
  /** Button type */
  type?: 'default' | 'primary';
  /** Button shape */
  shape?: 'circle' | 'square';
  /** Tooltip text */
  tooltip?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export const FLOAT_BUTTON_DEFAULTS = {
  type: 'default' as const,
  shape: 'circle' as const,
  visibilityHeight: 400,
  duration: 450,
};
