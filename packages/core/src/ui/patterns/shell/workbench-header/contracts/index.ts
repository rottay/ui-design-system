/**
 * @fileoverview Type definitions for the WorkbenchHeader pattern component.
 *
 * WorkbenchHeader renders a role-home header with briefing title, exception
 * count badge, saved view selector, and quick action buttons. Designed as
 * the top-level entry point for workbench/role-home pages.
 *
 * @module Patterns/WorkbenchHeader/Types
 * @category Patterns
 * @package @rottay/design-system
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * A quick action button rendered in the workbench header.
 */
export interface WorkbenchQuickAction {
  /** Button label text. */
  label: string;
  /** Callback fired when the action button is clicked. */
  onClick: () => void;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** Visual variant for the button. */
  variant?: 'primary' | 'default' | 'danger';
  /** When true, the button is rendered in a disabled state. */
  disabled?: boolean;
}

/**
 * A saved view option in the view selector dropdown.
 */
export interface WorkbenchSavedView {
  /** Unique identifier for the saved view. */
  id: string;
  /** Display label for the saved view. */
  label: string;
}

/**
 * Props for the WorkbenchHeader pattern component.
 *
 * Renders a role-home header card with a briefing title row, exception
 * count badge, saved view selector, and quick action buttons.
 *
 * @example
 * ```tsx
 * <PatternWorkbenchHeader
 *   title="Operations Dashboard"
 *   subtitle="Morning briefing"
 *   exceptionCount={3}
 *   quickActions={[
 *     { label: 'New Event', onClick: () => {}, icon: <PlusIcon /> },
 *   ]}
 *   savedViews={[
 *     { id: 'default', label: 'Default View' },
 *     { id: 'compact', label: 'Compact View' },
 *   ]}
 *   onViewChange={(id) => setView(id)}
 * />
 * ```
 */
export interface WorkbenchHeaderProps extends PatternBaseProps {
  /** Optional localized context label rendered above the title. */
  eyebrow?: ReactNode;
  /** Optional semantic DS icon rendered in a framed identity tile. */
  icon?: ReactNode;
  /** Main briefing title. */
  title: string;
  /** Optional subtitle or description line. */
  subtitle?: string;
  /** Number of pending exceptions to display as a badge. */
  exceptionCount?: number;
  /** Quick action buttons rendered in the header. */
  quickActions?: WorkbenchQuickAction[];
  /** Saved views available in the view selector dropdown. */
  savedViews?: WorkbenchSavedView[];
  /** Currently selected saved view ID. */
  activeViewId?: string;
  /** Callback fired when the user selects a different saved view. */
  onViewChange?: (viewId: string) => void;
}
