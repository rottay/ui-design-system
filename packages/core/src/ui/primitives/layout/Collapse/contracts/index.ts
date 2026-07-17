/**
 * @fileoverview Collapse Component Types - Rottay Design System
 * @description Type definitions for the Collapse compound component including
 * props for the main Collapse container and Collapse.Panel sub-component.
 *
 * @remarks
 * The Collapse types support:
 * - Accordion and multi-panel modes
 * - Controlled and uncontrolled state
 * - Panel customization (disabled, extra content, icons)
 * - Visual variants (bordered, ghost, sizes)
 *
 * @example Type Usage
 * ```tsx
 * import type { CollapseProps, CollapsePanelProps } from '@rottay/design-system';
 *
 * const collapseConfig: CollapseProps = {
 *   accordion: true,
 *   bordered: true,
 *   expandIconPosition: 'start',
 * };
 *
 * const panelConfig: CollapsePanelProps = {
 *   panelKey: 'panel1',
 *   header: 'Section Title',
 *   showArrow: true,
 * };
 * ```
 *
 * @module Collapse/Types
 * @category Layout
 * @package @rottay/design-system
 */
import type { ReactNode, CSSProperties } from 'react';
import type { Size } from '../../../../../foundation/contracts/kernel/common';

/**
 * Supported rendering engines for Collapse components.
 */
type CollapseEngine = 'classic' | 'modern' | 'rustic';

/** Collapse size, derived from the canonical {@link Size} scale. */
export type CollapseSize = Extract<Size, 'sm' | 'md' | 'lg'>;

/**
 * @deprecated Legacy antd-style spelling; use {@link CollapseSize} ('sm' | 'md' | 'lg')
 * instead. Retained for one release so existing values keep compiling.
 */
export type LegacyCollapseSize = 'small' | 'middle' | 'large';

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
  /** Rendering engine override */
  engine?: CollapseEngine;
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
  size?: CollapseSize | LegacyCollapseSize;
  /** Panel children */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Rendering engine override */
  engine?: CollapseEngine;
}

export const COLLAPSE_DEFAULTS = {
  bordered: true,
  accordion: false,
  expandIconPosition: 'start' as const,
  size: 'middle' as const,
};
