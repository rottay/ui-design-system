/**
 * Anchor Component Types
 *
 * Unified type definitions for Anchor navigation.
 * Works with titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import type { CSSProperties, ReactNode, MouseEvent } from 'react';

/**
 * Individual anchor link item
 */
export interface AnchorLinkItem {
  /** Link key identifier */
  key?: string | number;
  /** Target href (e.g., #section-id) */
  href: string;
  /** Link title/label */
  title: ReactNode;
  /** Target attribute for link */
  target?: string;
  /** Custom className */
  className?: string;
  /** Nested children links */
  children?: AnchorLinkItem[];
}

/**
 * Anchor direction
 */
export type AnchorDirection = 'vertical' | 'horizontal';

/**
 * Base Anchor props supported by all engines
 */
export interface AnchorBaseProps {
  /** Array of anchor link items */
  items?: AnchorLinkItem[];
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Callback when active link changes */
  onChange?: (currentActiveLink: string) => void;
  /** Callback when link is clicked */
  onClick?: (e: MouseEvent<HTMLElement>, link: { title: ReactNode; href: string }) => void;
}

/**
 * Extended Anchor props with engine-specific features
 */
export interface AnchorProps extends AnchorBaseProps {
  /** Whether to affix to viewport */
  affix?: boolean;
  /** Offset from top when calculating scroll position */
  offsetTop?: number;
  /** Pixels to offset from top when scrolling to anchor */
  targetOffset?: number;
  /** Bounds for anchor area */
  bounds?: number;
  /** Show ink indicator */
  showInkInFixed?: boolean;
  /** Current active anchor href */
  getCurrentAnchor?: (activeLink: string) => string;
  /** Direction of anchor links */
  direction?: AnchorDirection;
  /** Replace history entry when clicking links */
  replace?: boolean;
  /** Scrolling container */
  getContainer?: () => HTMLElement | Window;
  /** Children (alternative to items) */
  children?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get element by anchor href
 */
export function getAnchorElement(href: string): HTMLElement | null {
  if (!href || typeof document === 'undefined') return null;
  const id = href.startsWith('#') ? href.slice(1) : href;
  return document.getElementById(id);
}

/**
 * Scroll to anchor target smoothly
 */
export function scrollToAnchor(href: string, offsetTop = 0): void {
  const element = getAnchorElement(href);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.pageYOffset - offsetTop;
  window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Get currently active anchor based on scroll position
 */
export function getActiveAnchor(
  items: AnchorLinkItem[],
  offsetTop = 0,
  bounds = 5
): string {
  if (typeof window === 'undefined') return '';

  const flatItems = flattenItems(items);
  const scrollTop = window.pageYOffset;

  for (let i = flatItems.length - 1; i >= 0; i--) {
    const item = flatItems[i];
    const element = getAnchorElement(item.href);
    if (!element) continue;

    const top = element.getBoundingClientRect().top + scrollTop - offsetTop;
    if (scrollTop >= top - bounds) {
      return item.href;
    }
  }

  return flatItems[0]?.href || '';
}

/**
 * Flatten nested anchor items
 */
export function flattenItems(items: AnchorLinkItem[]): AnchorLinkItem[] {
  const result: AnchorLinkItem[] = [];

  function traverse(list: AnchorLinkItem[]) {
    for (const item of list) {
      result.push(item);
      if (item.children?.length) {
        traverse(item.children);
      }
    }
  }

  traverse(items);
  return result;
}
