/**
 * @fileoverview ActionDock Component Types - Rottay Design System
 * @description Type definitions for the ActionDock workspace structure.
 * A floating action bar for sticky bottom (or top) actions on mobile, with a
 * priority grammar (primary/secondary/danger), a narrow-viewport overflow
 * law, and an APG toolbar keyboard model.
 *
 * @module Structures/Workspace/ActionDock/Contracts
 * @category Structure
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';

/**
 * Priority grammar slot for a structured dock action.
 *
 * - `primary`: the one forward action. Grows to fill available inline space
 *   and always stays inline (never collapses into the overflow menu).
 * - `secondary`: supporting actions. First candidates for the narrow
 *   overflow menu (see {@link ActionDockProps.overflow}).
 * - `danger`: destructive actions. Rendered at the start edge and visually
 *   separated from the primary cluster; always stays inline so a destructive
 *   action is never hidden behind a menu.
 */
export type ActionDockPriority = 'primary' | 'secondary' | 'danger';

/**
 * Local density boundary steps. Stamping one re-projects the canonical
 * `--ds-spacing-*` and `--ds-density-effective-scale` channels inside the
 * dock (foundation density law), so the dock chrome and the Buttons it
 * composes track the same density posture. Omit to inherit the ambient
 * density from the nearest ancestor boundary.
 */
export type ActionDockDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * Narrow-viewport collapse law.
 *
 * - `menu`: on phone postures, when more than two structured actions are
 *   present, secondary actions collapse into a more-actions menu. Primary
 *   and danger actions always stay inline.
 * - `none`: every structured action stays inline at every viewport.
 */
export type ActionDockOverflow = 'menu' | 'none';

/**
 * A structured dock action. The dock renders each entry as a Button it owns,
 * stamps the priority grammar (`data-priority`), and manages its seat in the
 * roving-tabindex toolbar model.
 */
export interface ActionDockAction {
  /** Stable identity key (React key, focus model, overflow-menu mapping). */
  key: string;
  /** Visible label. Long labels ellipsize inside the Button label contract. */
  label: ReactNode;
  /** Priority grammar slot. @default 'secondary' */
  priority?: ActionDockPriority;
  /** Optional icon (Button icon contract; semantic icons mirror in RTL). */
  icon?: ReactNode;
  /** Icon placement. @default 'start' */
  iconPosition?: 'start' | 'end';
  /** Disabled posture (removed from the roving focus order). */
  disabled?: boolean;
  /** Busy posture (Button `pending` contract). */
  pending?: boolean;
  /** Link target; renders the action as an anchor button. */
  href?: string;
  /** Accessible name override (required for icon-only clarity). */
  'aria-label'?: string;
  /** Test id forwarded to the rendered action. */
  'data-testid'?: string;
  /** Activation callback (also used for the overflow-menu item). */
  onClick?: () => void;
}

/**
 * Props interface for the ActionDock component.
 *
 * @description
 * A floating action container that anchors to the viewport or sticks within
 * its layout container. Two composition paths:
 *
 * - `actions`: the structured premium path. The dock owns rendering, the
 *   priority grammar (danger separated at the start edge, secondary cluster,
 *   growing primary at the end edge), the narrow-viewport overflow menu, and
 *   the APG toolbar keyboard model (roving tabindex, direction-aware
 *   ArrowLeft/ArrowRight, Home/End).
 * - `children`: the freeform escape hatch (existing consumers). The dock
 *   still supplies the chrome (safe areas, stacking, density boundary,
 *   shrink guard) and arrow-key focus movement across focusable children,
 *   but tab stops remain the consumer's.
 *
 * Both may be combined; structured actions render before freeform children.
 *
 * @example
 * ```tsx
 * <ActionDock
 *   actions={[
 *     { key: 'reject', label: 'Reject', priority: 'danger', onClick: reject },
 *     { key: 'shortlist', label: 'Shortlist', onClick: shortlist },
 *     { key: 'advance', label: 'Advance', priority: 'primary', onClick: advance },
 *   ]}
 * />
 * ```
 */
export interface ActionDockProps {
  /** Freeform content (typically Button components). Rendered after `actions`. */
  children?: ReactNode;
  /** Structured actions with priority grammar. */
  actions?: ActionDockAction[];
  /** Narrow-viewport collapse law. @default 'menu' */
  overflow?: ActionDockOverflow;
  /**
   * Accessible name of the overflow (more-actions) trigger. Defaults to the
   * guarded `components.actionDock.overflow.label` catalog key with the
   * English fallback 'More actions' (explicit prop always wins).
   */
  overflowLabel?: string;
  /** Local density boundary for the dock subtree. */
  density?: ActionDockDensity;
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
  /**
   * Accessible name for the toolbar. Defaults to the placement-aware guarded
   * catalog keys `components.actionDock.topLabel` /
   * `components.actionDock.bottomLabel` with English fallbacks 'Top actions'
   * / 'Bottom actions' (explicit prop always wins).
   */
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
  overflow: 'menu',
};
