/**
 * BhSprintRetro - Core Interface
 * Sprint retrospective view for BitHire recruiting sprints.
 * Supports interactive retro sessions with categories, voting, and action items.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhSprintRetroPreset = 'session';

// =============================================================================
// RETRO DATA TYPES
// =============================================================================

/**
 * A single retro item (sticky note).
 */
export interface RetroItem {
  id: string;
  text: string;
  authorName: string;
  votes: number;
  isAnonymous?: boolean;
}

/**
 * A retro category column.
 */
export interface RetroCategory {
  name: 'went_well' | 'to_improve' | 'action_items' | 'kudos';
  items: RetroItem[];
  color: string;
}

/**
 * An action item from the retrospective.
 */
export interface RetroAction {
  id: string;
  text: string;
  assigneeName: string;
  dueDate?: string;
  completed: boolean;
}

/**
 * Complete retro session data.
 */
export interface RetroData {
  sprintId: string;
  sprintName: string;
  categories: RetroCategory[];
  votes: Record<string, number>;
  actionItems: RetroAction[];
  timer?: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhSprintRetroProps extends EngineAwareProps {
  preset?: BhSprintRetroPreset;

  /** Retro session data */
  data?: RetroData;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback to add a new retro item */
  onAddItem?: (category: RetroCategory['name'], text: string, isAnonymous?: boolean) => void;

  /** Callback to vote on a retro item */
  onVoteItem?: (itemId: string) => void;

  /** Callback to toggle action item completion */
  onToggleAction?: (actionId: string) => void;

  /** Current authenticated user ID */
  currentUserId?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SPRINT_RETRO_DEFAULTS: Partial<BhSprintRetroProps> = {
  preset: 'session',
};
