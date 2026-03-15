/**
 * BhStandupView - Core Interface
 * Daily standup view for BitHire recruiting sprints.
 * Displays recruiter updates, blockers, and candidate progress.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhStandupViewPreset = 'daily';

// =============================================================================
// STANDUP DATA TYPES
// =============================================================================

/**
 * A single recruiter's standup entry.
 */
export interface StandupEntry {
  recruiterId: string;
  recruiterName: string;
  avatarUrl?: string;
  yesterday: string[];
  today: string[];
  blockers: string[];
  candidateUpdates?: number;
}

/**
 * Complete standup data for a sprint day.
 */
export interface StandupData {
  sprintId: string;
  sprintName: string;
  date: Date;
  entries: StandupEntry[];
  duration?: number;
  attendees: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhStandupViewProps extends EngineAwareProps {
  preset?: BhStandupViewPreset;

  /** Standup data for the current day */
  data?: StandupData;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback to add a new standup entry */
  onAddEntry?: (entry: Omit<StandupEntry, 'recruiterId' | 'recruiterName'>) => void;

  /** Callback to edit an existing entry */
  onEditEntry?: (recruiterId: string, entry: Partial<StandupEntry>) => void;

  /** Current authenticated user ID */
  currentUserId?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_STANDUP_VIEW_DEFAULTS: Partial<BhStandupViewProps> = {
  preset: 'daily',
};
