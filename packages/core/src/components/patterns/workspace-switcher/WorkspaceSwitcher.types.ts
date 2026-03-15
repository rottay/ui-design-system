/**
 * WorkspaceSwitcher - Pattern Component Types
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

export interface Workspace {
  id: string;
  name: string;
  logo?: string;
  role?: string;
  plan?: string;
  unreadCount?: number;
  online?: number;
}

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
