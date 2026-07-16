/**
 * @fileoverview ActionDock Component Types - Rottay Design System
 * @description Type definitions for the ActionDock navigation primitive.
 * A floating action bar for sticky bottom (or top) actions on mobile.
 *
 * @module ActionDock/Types
 * @category Navigation
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Props interface for the ActionDock component.
 *
 * @description
 * A floating action container that anchors to the viewport or sticks within
 * its layout container. Renders children (typically Buttons) in a horizontal
 * row with tokenized padding and safe area insets.
 *
 * @example
 * ```tsx
 * <ActionDock>
 *   <Button variant="secondary" style={{ flex: 1 }}>Cancel</Button>
 *   <Button variant="primary" style={{ flex: 1 }}>Confirm</Button>
 * </ActionDock>
 * ```
 */
export interface ActionDockProps {
  /** Content to render inside the dock (typically Button components). */
  children: ReactNode;
  /** Position of the dock on the viewport. @default 'bottom' */
  position?: 'bottom' | 'top';
  /**
   * Positioning strategy. Fixed docks attach to the viewport; sticky docks
   * stay in their layout container. @default 'fixed'
   */
  mode?: 'fixed' | 'sticky';
  /** Optional DOM id for the dock root. */
  id?: string;
  /** Additional CSS class appended to the dock root. */
  className?: string;
  /** Test id for the dock root. @default 'action-dock' */
  'data-testid'?: string;
  /** Accessible name for the toolbar. Defaults to a placement-aware label. */
  'aria-label'?: string;
  /** Additional inline styles merged with the dock container. */
  style?: CSSProperties;
}

/**
 * Default values for ActionDock component props.
 */
export const ACTION_DOCK_DEFAULTS: Partial<ActionDockProps> = {
  position: 'bottom',
  mode: 'fixed',
};
