/**
 * BhSprintRetrospective - Core Interface
 * Sprint retrospective form for BitHire ATS platform
 *
 * DB Reference: DBTeamSprint from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBTeamSprint } from '@rottay/recruiter';

export type BhSprintRetrospectivePreset = 'form' | 'compact';

/** Re-export for consumer convenience */
export type { DBTeamSprint };

export interface RetroItem {
  id?: string;
  text?: string;
  category?: 'good' | 'improve' | 'action';
  votes?: number;
  author?: string;
  /** ISO timestamp when the item was created */
  createdAt?: string;
  /** Whether this item has been resolved */
  resolved?: boolean;
  /** Person assigned to follow up on this item */
  assignee?: string;
  /** Priority level of the retro item */
  priority?: 'low' | 'medium' | 'high';
}

export interface BhSprintRetrospectiveProps extends EngineAwareProps {
  preset?: BhSprintRetrospectivePreset;

  /** Sprint data - accepts DBTeamSprint directly from @rottay/recruiter */
  sprint?: DBTeamSprint;

  /** Retrospective items */
  items?: RetroItem[];

  /** Sprint name (falls back to sprint?.name if not provided) */
  sprintName?: string;

  /** Callback to add a new item */
  onAddItem?: (category: string, text: string) => void;

  /** Callback to vote on an item */
  onVote?: (itemId: string) => void;

  /** Callback to delete an item */
  onDeleteItem?: (itemId: string) => void;

  /** Sprint goals (from DBTeamSprint.goals JSONB) */
  goals?: string[];

  /** Overall sprint completion percentage (from DBTeamSprint.completionPercentage) */
  completionPercentage?: number;

  /** Snapshot of team members at sprint time (from DBTeamSprint.memberSnapshot) */
  memberSnapshot?: Array<{ recruiterId: string; name: string; placementsMade: number }>;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SPRINT_RETROSPECTIVE_DEFAULTS: Partial<BhSprintRetrospectiveProps> = {
  preset: 'form',
};
