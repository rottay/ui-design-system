/**
 * @fileoverview Type definitions for the WorkspaceSwitcher pattern. Defines
 * Workspace (id, name, logo, unreadCount) and props controlling switching,
 * creation, current user display, trigger mode, and position context.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * Represents a single workspace that the user can switch to.
 * Each workspace has a unique identity and optional metadata such as
 * the user's role, active plan, unread notification count, and
 * the number of currently online members.
 */
export interface Workspace {
  /** Unique identifier for the workspace */
  id: string;
  /** Display name shown in the switcher list */
  name: string;
  /** URL to the workspace logo image */
  logo?: string;
  /** The current user's role within this workspace (e.g. "Admin", "Member") */
  role?: string;
  /** Subscription plan label for this workspace (e.g. "Pro", "Enterprise") */
  plan?: string;
  /** Number of unread notifications or messages in this workspace */
  unreadCount?: number;
  /** Number of members currently online in this workspace */
  online?: number;
}

/**
 * Props for the WorkspaceSwitcher pattern component.
 * Renders a dropdown or panel that lets users switch between workspaces,
 * create new ones, and access workspace settings.
 *
 * @example
 * ```tsx
 * <WorkspaceSwitcher
 *   workspaces={[
 *     { id: '1', name: 'Acme Corp', role: 'Admin', unreadCount: 3 },
 *     { id: '2', name: 'Side Project', role: 'Owner' },
 *   ]}
 *   activeWorkspaceId="1"
 *   onSwitch={(id) => router.push(`/workspace/${id}`)}
 *   onCreate={() => setShowCreateModal(true)}
 *   currentUser={{ name: 'Jane Doe', email: 'jane@acme.com' }}
 *   position="sidebar"
 * />
 * ```
 */
export interface WorkspaceSwitcherProps extends PatternBaseProps {
  /** List of workspaces available to switch between */
  workspaces: Workspace[];
  /** ID of the currently active workspace */
  activeWorkspaceId: string;
  /** Called when the user switches to a different workspace */
  onSwitch: (workspaceId: string) => void;
  /** Called when the user clicks "Create workspace" */
  onCreate?: () => void;
  /** Called when the user clicks settings for a workspace */
  onSettings?: (workspaceId: string) => void;
  /** Current user info displayed at the bottom */
  currentUser?: { name: string; avatar?: string; email?: string };
  /** Trigger interaction mode */
  trigger?: 'click' | 'hover';
  /** Position context affects layout */
  position?: 'sidebar' | 'header';
  /** Whether to show the "Create workspace" button */
  showCreateButton?: boolean;
}
