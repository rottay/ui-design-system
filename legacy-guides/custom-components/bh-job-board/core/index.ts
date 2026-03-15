/**
 * BhJobBoard - Core Interface
 * Jobs Overview screen for the BitHire ATS platform
 *
 * Two data shapes are supported:
 * - Grid preset: accepts DBJob[] directly from @rottay/recruiter with helper functions
 * - Table/Kanban presets: accept JobItem[] with UI-friendly pre-computed fields
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBJob } from '@rottay/recruiter';

export type BhJobBoardPreset = 'grid' | 'table' | 'kanban';

/**
 * Re-export the DB type for convenience.
 * Used by the Grid preset which works directly with DB data.
 */
export type RecruiterJob = DBJob;

/**
 * Status values the UI cares about for filtering/display.
 * Maps from the full JobStatus in the DB schema.
 */
export type JobDisplayStatus = 'draft' | 'pending_approval' | 'published' | 'paused' | 'closed' | 'archived';

/**
 * Hiring urgency from the DB schema.
 */
export type JobHiringUrgency = 'low' | 'normal' | 'high' | 'urgent';

/**
 * UI-friendly job status values (used by Table/Kanban presets).
 * Subset of JobDisplayStatus.
 */
export type JobStatus = 'draft' | 'published' | 'paused' | 'closed';

/**
 * UI-friendly urgency levels (used by Table/Kanban presets).
 * Different naming convention from DB's hiringUrgency.
 */
export type JobUrgency = 'low' | 'medium' | 'high' | 'critical';

/** Candidate pipeline stage count */
export interface CandidateStageCount {
  stage: string;
  count: number;
}

/**
 * UI-friendly job item shape used by Table and Kanban presets.
 * These are pre-computed/mapped from DB data by the consuming application.
 */
export interface JobItem {
  id: string;
  title?: string;
  code?: string;
  status: JobStatus;
  department?: string;
  urgency: JobUrgency;
  candidateCount: number;
  daysOpen: number;
  location?: string;
  isRemote?: boolean;
  clientName?: string;
  recruiterAvatars?: string[];
  candidatesByStage?: CandidateStageCount[];
  /** Work mode: remote, hybrid, or onsite */
  workMode?: 'remote' | 'hybrid' | 'onsite';
  /** List of benefits offered */
  benefits?: string[];
  /** Minimum salary for the position */
  salaryMin?: number;
  /** Maximum salary for the position */
  salaryMax?: number;
  /** Salary currency code (e.g. USD, EUR) */
  salaryCurrency?: string;
  /** Total number of applications received */
  totalApplications?: number;
  /** Total number of views on the job posting */
  totalViews?: number;
  /** Hiring urgency level from DB */
  hiringUrgency?: JobHiringUrgency;
  /** Target date to fill the position */
  targetHireDate?: Date | string | null;
  /** Team name associated with the job */
  team?: string;
  /** Seniority level required */
  seniorityLevel?: string;
}

/** @deprecated Use string (stage names are free-form from DB) */
export type CandidateStage = string;

export interface JobBoardStat {
  key: JobDisplayStatus | 'total';
  label: string;
  count: number;
}

export interface JobBoardFilter {
  status?: JobDisplayStatus | JobStatus | null;
  department?: string | null;
  urgency?: JobHiringUrgency | JobUrgency | null;
  clientId?: string | null;
  search?: string;
}

export type ViewMode = 'grid' | 'table' | 'kanban';

export type SortDirection = 'asc' | 'desc';

export interface BhJobBoardProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhJobBoardPreset;

  /**
   * Job listings to display.
   * Grid preset accepts DBJob[] directly; Table/Kanban accept JobItem[].
   * Both shapes are accepted via union type.
   */
  jobs?: (DBJob | JobItem)[];

  /** Summary statistics for the stats ribbon */
  stats?: JobBoardStat[];

  /** Active filters */
  filters?: JobBoardFilter;

  /** Callback when filters change */
  onFilterChange?: (filters: JobBoardFilter) => void;

  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;

  /** Callback when a job card/row is clicked */
  onJobClick?: (jobId: string) => void;

  /** Callback when create job button is clicked */
  onCreateJob?: () => void;

  /** Currently selected job IDs */
  selectedJobs?: string[];

  /** Callback when selection changes */
  onSelectionChange?: (jobIds: string[]) => void;

  /** Current search query */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Field to sort by */
  sortBy?: string;

  /** Sort direction */
  sortDirection?: SortDirection;

  /** Callback when sort changes */
  onSortChange?: (field: string, direction: SortDirection) => void;

  /** Text shown when no jobs match filters */
  emptyText?: string;

  /** List of department names for the department filter dropdown */
  departments?: string[];

  /** List of client names for the client filter */
  clients?: Array<{ id: string; name: string }>;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_JOB_BOARD_DEFAULTS: Partial<BhJobBoardProps> = {
  preset: 'grid',
  emptyText: 'No jobs found',
  sortBy: 'publishedAt',
  sortDirection: 'desc',
};
