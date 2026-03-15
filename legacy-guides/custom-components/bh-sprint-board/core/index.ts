/**
 * BhSprintBoard - Core Interface
 * Sprint planning board for BitHire recruiting sprints.
 * Displays backlog items, assignments, and team capacity.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhSprintBoardPreset = 'planning';

// =============================================================================
// SPRINT BOARD DATA TYPES
// =============================================================================

/**
 * A backlog item that can be assigned to the sprint.
 */
export interface BacklogItem {
  id: string;
  title: string;
  type: 'candidate' | 'job' | 'task';
  points: number;
  assigneeId?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

/**
 * A team member participating in the sprint.
 */
export interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  capacity: number;
  committed: number;
}

/**
 * Sprint planning data.
 */
export interface SprintPlanningData {
  sprintId: string;
  sprintName: string;
  capacity: number;
  committed: number;
  backlogItems: BacklogItem[];
  assignedItems: BacklogItem[];
  teamMembers: TeamMember[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhSprintBoardProps extends EngineAwareProps {
  preset?: BhSprintBoardPreset;

  /** Sprint planning data */
  data?: SprintPlanningData;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback to assign an item to a team member */
  onAssignItem?: (itemId: string, assigneeId: string) => void;

  /** Callback to reorder an item in the backlog */
  onReorderItem?: (itemId: string, newIndex: number) => void;

  /** Callback to update points on an item */
  onUpdatePoints?: (itemId: string, points: number) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SPRINT_BOARD_DEFAULTS: Partial<BhSprintBoardProps> = {
  preset: 'planning',
};
