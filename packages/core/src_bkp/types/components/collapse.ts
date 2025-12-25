/**
 * Collapse Component Types
 *
 * Unified type definitions for the Collapse/Accordion component.
 * Works with titan (AntD), hermes (DaisyUI), and apollo (HTML+Tailwind).
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Collapse size
 */
export type CollapseSize = 'small' | 'middle' | 'large';

/**
 * Expand icon position
 */
export type CollapseExpandIconPosition = 'start' | 'end';

/**
 * Collapse item/panel
 */
export interface CollapseItem {
  /** Unique key for the panel */
  key: string | number;
  /** Panel header content */
  label: ReactNode;
  /** Panel content */
  children: ReactNode;
  /** Whether the panel is disabled */
  disabled?: boolean;
  /** Extra content on the right of header */
  extra?: ReactNode;
  /** Force render when collapsed */
  forceRender?: boolean;
  /** Show arrow icon */
  showArrow?: boolean;
  /** Custom class for panel */
  className?: string;
  /** Custom style for panel */
  style?: CSSProperties;
  /** Header class */
  headerClass?: string;
  /** Whether the panel can be collapsed */
  collapsible?: 'header' | 'icon' | 'disabled';
}

/**
 * Base Collapse Props
 */
export interface CollapseBaseProps {
  /** Collapse items */
  items?: CollapseItem[];

  /** Active key(s) - controlled */
  activeKey?: string | string[] | number | number[];

  /** Default active key(s) - uncontrolled */
  defaultActiveKey?: string | string[] | number | number[];

  /** Allow multiple panels to be open at once */
  accordion?: boolean;

  /** Whether the collapse is bordered */
  bordered?: boolean;

  /** Collapse size */
  size?: CollapseSize;

  /** Expand icon position */
  expandIconPosition?: CollapseExpandIconPosition;

  /** Whether to show ghost style (no background) */
  ghost?: boolean;

  /** Collapsible trigger area */
  collapsible?: 'header' | 'icon' | 'disabled';

  /** Destroy content when collapsed */
  destroyInactivePanel?: boolean;

  /** Callback when panel is changed */
  onChange?: (key: string | string[]) => void;

  /** Additional CSS class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Children (alternative to items) */
  children?: ReactNode;
}

/**
 * Full Collapse Props
 */
export interface CollapseProps extends CollapseBaseProps {
  /** Custom expand icon */
  expandIcon?: (panelProps: { isActive: boolean }) => ReactNode;
}

/**
 * Collapse Panel Props (for children-based API)
 */
export interface CollapsePanelProps {
  /** Panel header */
  header: ReactNode;

  /** Unique key */
  key: string | number;

  /** Panel content */
  children?: ReactNode;

  /** Whether disabled */
  disabled?: boolean;

  /** Extra content */
  extra?: ReactNode;

  /** Force render */
  forceRender?: boolean;

  /** Show arrow */
  showArrow?: boolean;

  /** Additional class */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Collapsible trigger */
  collapsible?: 'header' | 'icon' | 'disabled';
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize active key to array
 */
export function normalizeActiveKey(
  key: string | string[] | number | number[] | undefined
): string[] {
  if (key === undefined) return [];
  if (Array.isArray(key)) return key.map(String);
  return [String(key)];
}

/**
 * Check if a panel is active
 */
export function isPanelActive(
  panelKey: string | number,
  activeKeys: string[]
): boolean {
  return activeKeys.includes(String(panelKey));
}

/**
 * Toggle panel in accordion mode
 */
export function toggleAccordion(
  panelKey: string,
  activeKeys: string[]
): string[] {
  if (activeKeys.includes(panelKey)) {
    return [];
  }
  return [panelKey];
}

/**
 * Toggle panel in multi mode
 */
export function toggleMultiple(
  panelKey: string,
  activeKeys: string[]
): string[] {
  if (activeKeys.includes(panelKey)) {
    return activeKeys.filter((k) => k !== panelKey);
  }
  return [...activeKeys, panelKey];
}
