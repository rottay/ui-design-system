/**
 * Collapse Types
 */
import type { ReactNode, CSSProperties } from 'react';

export interface CollapsePanelProps {
  /** Unique key for the panel */
  panelKey?: string;
  /** Panel header content */
  header?: ReactNode;
  /** Whether panel is disabled */
  disabled?: boolean;
  /** Whether to show arrow icon */
  showArrow?: boolean;
  /** Extra element in header */
  extra?: ReactNode;
  /** Force render content when collapsed */
  forceRender?: boolean;
  /** Panel content */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export interface CollapseProps {
  /** Currently active panel keys (controlled) */
  activeKey?: string | string[];
  /** Default active panel keys */
  defaultActiveKey?: string | string[];
  /** Allow multiple panels open */
  accordion?: boolean;
  /** Show borders */
  bordered?: boolean;
  /** Ghost mode (no background) */
  ghost?: boolean;
  /** Expand icon position */
  expandIconPosition?: 'start' | 'end';
  /** Called when active panels change */
  onChange?: (key: string | string[]) => void;
  /** Whether all panels are collapsible */
  collapsible?: 'header' | 'icon' | 'disabled';
  /** Size variant */
  size?: 'small' | 'middle' | 'large';
  /** Panel children */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
}

export const COLLAPSE_DEFAULTS = {
  bordered: true,
  accordion: false,
  expandIconPosition: 'start' as const,
  size: 'middle' as const,
};
