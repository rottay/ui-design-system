/**
 * BhJobBoard - Core Interface
 * Jobs Overview screen for the BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhJobBoardPreset = 'grid' | 'table' | 'kanban';

export type JobStatus = 'draft' | 'published' | 'paused' | 'closed';

export type JobUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface CandidateStage {
  stage: string;
  count: number;
}

export interface JobItem {
  id: string;
  title: string;
  code: string;
  department: string;
  status: JobStatus;
  urgency: JobUrgency;
  candidateCount: number;
  candidatesByStage: CandidateStage[];
  daysOpen: number;
  recruiterAvatars: string[];
  clientName?: string;
  location: string;
  isRemote: boolean;
}

export interface JobBoardStat {
  key: JobStatus | 'total';
  label: string;
  count: number;
}

export interface JobBoardFilter {
  status?: JobStatus | null;
  department?: string | null;
  urgency?: JobUrgency | null;
  clientId?: string | null;
  search?: string;
}

export type ViewMode = 'grid' | 'table' | 'kanban';

export type SortDirection = 'asc' | 'desc';

export interface BhJobBoardProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhJobBoardPreset;

  /** Job listings to display */
  jobs: JobItem[];

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
  sortBy: 'daysOpen',
  sortDirection: 'desc',
};
