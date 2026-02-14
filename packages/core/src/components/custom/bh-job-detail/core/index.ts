/**
 * BhJobDetail - Core Interface
 * Job Detail Page for BitHire ATS platform
 *
 * DB Reference: DBJob, DBJobStatus from @rottay/recruiter
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBJob } from '@rottay/recruiter';

export type BhJobDetailPreset = 'full' | 'compact';

/** Re-export for consumer convenience */
export type { DBJob };

export type JobStatus = 'draft' | 'open' | 'paused' | 'closed' | 'filled' | 'pending_approval' | 'published' | 'archived';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical' | 'normal' | 'urgent';
export type CandidateStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
export type JobEventType = 'created' | 'opened' | 'candidate-added' | 'stage-change' | 'interview-scheduled' | 'offer-sent' | 'closed' | 'note';
export type MetricsTimeRange = '7d' | '14d' | '30d' | '90d';

export interface JobInfo {
  title: string;
  code: string;
  status: JobStatus;
  clientName: string;
  daysOpen: number;
  urgency: UrgencyLevel;
}

export interface JobMetric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'flat';
  trendValue?: number;
  icon?: ReactNode;
}

export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CandidatePreview {
  id: string;
  name: string;
  avatar?: string;
  stage: string;
  scorePercent: number;
  status: CandidateStatus;
}

export interface TemplateInfo {
  name: string;
  stages: string[];
  agents: string[];
  rubrics: string[];
}

export interface JobEvent {
  id: string;
  type: JobEventType;
  message: string;
  time: Date;
}

export interface AnalyticsSource {
  name: string;
  count: number;
  percentage: number;
}

export interface TimeToStageEntry {
  stageName: string;
  avgDays: number;
  targetDays: number;
}

export interface ScoreDistributionBucket {
  range: string;
  count: number;
}

export interface AnalyticsData {
  sources: AnalyticsSource[];
  timeToStage: TimeToStageEntry[];
  scoreDistribution: ScoreDistributionBucket[];
}

export interface SlaConfig {
  maxDaysOpen: number;
  maxDaysPerStage: number;
  notifyOnBreach: boolean;
}

export interface JobSettings {
  templateId: string;
  notifications: boolean;
  slaConfig: SlaConfig;
}

export type JobDetailTab = 'overview' | 'candidates' | 'analytics' | 'settings';

export interface BhJobDetailProps extends EngineAwareProps {
  preset?: BhJobDetailPreset;

  /** Optional raw DB job entity for direct binding */
  job?: Partial<DBJob> | null;

  /** Core job information */
  jobInfo?: JobInfo | null;

  /** KPI metric cards */
  metrics?: JobMetric[];

  /** Pipeline funnel stages */
  funnelStages?: FunnelStage[];

  /** Top candidate previews */
  candidates?: CandidatePreview[];

  /** Associated hiring template */
  templateInfo?: TemplateInfo;

  /** Recent activity events */
  events?: JobEvent[];

  /** Analytics data for charts */
  analytics?: AnalyticsData;

  /** Job settings configuration */
  settings?: JobSettings;

  /** Currently active tab */
  activeTab?: JobDetailTab;

  /** Tab change callback */
  onTabChange?: (tab: JobDetailTab) => void;

  /** Edit job callback */
  onEdit?: () => void;

  /** Pause job callback */
  onPause?: () => void;

  /** Close job callback */
  onClose?: () => void;

  /** Duplicate job callback */
  onDuplicate?: () => void;

  /** Candidate click callback */
  onCandidateClick?: (candidateId: string) => void;

  /** Settings save callback */
  onSettingsSave?: (settings: JobSettings) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_JOB_DETAIL_DEFAULTS: Partial<BhJobDetailProps> = {
  preset: 'full',
  activeTab: 'overview',
};
