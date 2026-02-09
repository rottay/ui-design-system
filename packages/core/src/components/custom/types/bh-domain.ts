/**
 * BitHire Domain Types
 * Aligned with dm-recruiter + dm-scoring domain models
 */

import type { AuditFields, Currency, StatusBadge, TrendIndicator, DateRange } from './common';

/** Job status */
export type BhJobStatus = 'draft' | 'open' | 'paused' | 'closed' | 'filled' | 'cancelled';

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

/** Interview type */
export type BhInterviewType = 'phone' | 'video' | 'onsite' | 'ai-screen' | 'technical' | 'panel';

/** Interview status */
export type BhInterviewStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

/** SLA status */
export type BhSlaStatus = 'on-track' | 'warning' | 'breached';

/** Job entity */
export interface BhJob extends AuditFields {
  id: string;
  title: string;
  code: string;
  department: string;
  location: string;
  workModel: BhWorkModel;
  employmentType: BhEmploymentType;
  status: BhJobStatus;
  urgency: BhJobUrgency;
  salary?: { min: Currency; max: Currency };
  description?: string;
  requirements?: string[];
  skills: string[];
  pipelineStages: BhPipelineStage[];
  candidateCount: number;
  slaStatus: BhSlaStatus;
  slaDaysRemaining?: number;
  clientName?: string;
  hiringManagerName?: string;
}

/** Pipeline stage */
export interface BhPipelineStage {
  id: string;
  name: string;
  order: number;
  count: number;
  color?: string;
}

/** Candidate entity */
export interface BhCandidate extends AuditFields {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  currentTitle?: string;
  currentCompany?: string;
  location?: string;
  stage: BhCandidateStage;
  score?: BhScore;
  skills: string[];
  yearsExperience?: number;
  source?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  appliedJobs: string[];
  tags?: string[];
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

/** Interview entity */
export interface BhInterview extends AuditFields {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  jobId: string;
  jobTitle: string;
  type: BhInterviewType;
  status: BhInterviewStatus;
  scheduledAt: Date;
  duration: number;
  interviewerName?: string;
  interviewerId?: string;
  stage: string;
  notes?: string;
  score?: BhScore;
  isAI?: boolean;
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

/** Offer */
export interface BhOffer extends AuditFields {
  id: string;
  candidateId: string;
  jobId: string;
  salary: Currency;
  startDate: Date;
  status: 'draft' | 'pending-approval' | 'approved' | 'sent' | 'accepted' | 'declined' | 'expired';
  expiresAt?: Date;
  approvers?: string[];
}
