/**
 * Anchor Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface AnchorLinkProps {
  /** Target element href */
  href: string;
  /** Link title */
  title: ReactNode;
  /** Target (for external links) */
  target?: string;
  /** Replace URL in history */
  replace?: boolean;
  /** Nested links */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export interface AnchorProps {
  /** Scroll container */
  getContainer?: () => HTMLElement | Window;
  /** Currently active link */
  activeKey?: string;
  /** Offset from top when scrolling */
  offsetTop?: number;
  /** Offset from bottom when scrolling */
  offsetBottom?: number;
  /** Bounds for active detection */
  bounds?: number;
  /** Show ink indicator */
  showInkInFixed?: boolean;
  /** Called when active link changes */
  onChange?: (activeKey: string) => void;
  /** Called when link is clicked */
  onClick?: (e: React.MouseEvent, link: { title: ReactNode; href: string }) => void;
  /** Anchor direction */
  direction?: 'vertical' | 'horizontal';
  /** Affix to viewport */
  affix?: boolean;
  /** Link children */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export const ANCHOR_DEFAULTS = {
  offsetTop: 0,
  bounds: 5,
  direction: 'vertical' as const,
  affix: true,
};
