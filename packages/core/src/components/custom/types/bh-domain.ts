/**
 * BitHire Domain Types
 * Canonical types re-exported from @rottay/recruiter.
 * UI-specific view model types defined locally for DS components.
 */

import type { AuditFields, Currency, StatusBadge, TrendIndicator, DateRange } from './common';

// ============================================================================
// Canonical Entity Types (from @rottay/recruiter)
// ============================================================================

export type {
  Candidate as BhCandidate,
  Job as BhJob,
  Interview as BhInterview,
  Offer as BhOffer,
} from '@rottay/recruiter';

// ============================================================================
// Module Enum Re-exports
// ============================================================================

export type {
  JobStatus as BhJobStatus,
  InterviewMode as BhInterviewMode,
  InterviewStatus as BhInterviewStatus,
  OfferStatus as BhOfferStatus,
  CandidateStatus as BhCandidateStatus,
} from '@rottay/recruiter';

// ============================================================================
// UI-Specific Types (DS component view models)
// ============================================================================

/** Job urgency */
export type BhJobUrgency = 'low' | 'medium' | 'high' | 'critical';

/** Work model */
export type BhWorkModel = 'onsite' | 'remote' | 'hybrid';

/** Employment type */
export type BhEmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';

/** Candidate stage */
export type BhCandidateStage =
  | 'sourced'
  | 'applied'
  | 'screening'
  | 'phone-screen'
  | 'interview'
  | 'technical'
  | 'final'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

/** Interview type (UI display) */
export type BhInterviewType = 'phone' | 'video' | 'onsite' | 'ai-screen' | 'technical' | 'panel';

/** SLA status */
export type BhSlaStatus = 'on-track' | 'warning' | 'breached';

/** Pipeline stage */
export interface BhPipelineStage {
  id: string;
  name: string;
  order: number;
  count: number;
  color?: string;
}

/** Score entity */
export interface BhScore {
  overall: number;
  dimensions: BhScoreDimension[];
  aiScore?: number;
  humanScore?: number;
  calibrationDelta?: number;
}

/** Score dimension */
export interface BhScoreDimension {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  evidence?: string[];
}

/** AI suggestion */
export interface BhAISuggestion {
  id: string;
  type: 'advance' | 'reject' | 'schedule' | 'outreach' | 'review';
  action: string;
  reason: string;
  confidence: number;
  candidateId?: string;
  jobId?: string;
}

/** Team member */
export interface BhTeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'admin' | 'recruiter' | 'hiring-manager' | 'interviewer';
  activeJobs: number;
  activeCandidates: number;
}

/** Agent configuration */
export interface BhAgent {
  id: string;
  name: string;
  type: 'screening' | 'technical' | 'cultural' | 'custom';
  model: string;
  voice?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  rubricId?: string;
  interviewCount: number;
  avgScore?: number;
}

/** Rubric */
export interface BhRubric {
  id: string;
  name: string;
  description?: string;
  dimensions: BhRubricDimension[];
}

/** Rubric dimension */
export interface BhRubricDimension {
  id: string;
  name: string;
  description?: string;
  weight: number;
  criteria: string[];
}

/** Template */
export interface BhTemplate {
  id: string;
  name: string;
  description?: string;
  stages: BhTemplateStage[];
  isDefault?: boolean;
}

/** Template stage */
export interface BhTemplateStage {
  id: string;
  name: string;
  order: number;
  type: 'manual' | 'ai-screen' | 'assessment' | 'approval';
  rubricId?: string;
  agentId?: string;
  knockoutRules?: string[];
}

/** SLA configuration */
export interface BhSlaConfig {
  stageTimeLimit: Record<string, number>;
  totalTimeLimit: number;
  warningThreshold: number;
}
