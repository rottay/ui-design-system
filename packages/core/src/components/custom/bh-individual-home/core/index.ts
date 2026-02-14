/**
 * BhIndividualHome - Core Interface
 * Individual Contributor Dashboard for BitHire ATS platform
 *
 * DB References: DBRecruiter, DBJob, DBCandidate from @rottay/recruiter
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBRecruiter, DBJob, DBCandidate } from '@rottay/recruiter';

export type BhIndividualHomePreset = 'standard';

/** Re-export for consumer convenience */
export type { DBRecruiter, DBJob, DBCandidate };

export interface WelcomeInfo {
  name: string;
  greeting?: string;
  avatar?: string;
  focusSummary?: string;
  todayCount?: number;
}

export interface PipelineStage {
  key: string;
  label: string;
  count: number;
  color?: string;
}

export interface PipelinePreview {
  jobId: string;
  jobTitle: string;
  stages: PipelineStage[];
}

export interface ScheduleItem {
  id: string;
  candidateName: string;
  time: string;
  jobTitle: string;
  type: 'phone-screen' | 'video-interview' | 'onsite' | 'debrief' | 'offer-call';
  avatar?: string;
  duration?: string;
  status?: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
}

export interface WizardStep {
  key: string;
  label: string;
  completed: boolean;
  description?: string;
  icon?: ReactNode;
}

export interface PerformanceRing {
  hires: number;
  target: number;
  label?: string;
}

export interface RecentCandidate {
  id?: string;
  name?: string;
  status?: 'new' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected';
  score?: number;
  avatar?: string;
  jobTitle?: string;
  appliedDate?: string;
}

export interface TokenBalance {
  remaining: number;
  costPerInterview: number;
  total?: number;
  label?: string;
}

export interface BhIndividualHomeProps extends EngineAwareProps {
  preset?: BhIndividualHomePreset;
  welcome?: WelcomeInfo;
  pipelines?: PipelinePreview[];
  schedule?: ScheduleItem[];
  wizardSteps?: WizardStep[];
  performance?: PerformanceRing;
  recentCandidates?: RecentCandidate[];
  tokenBalance?: TokenBalance;
  onCandidateClick?: (candidateId: string) => void;
  onScheduleAction?: (scheduleId: string, action: string) => void;
  onJobClick?: (jobId: string) => void;
  onWizardStepClick?: (stepKey: string) => void;
  onViewAllCandidates?: () => void;
  onViewAllSchedule?: () => void;
  onBuyTokens?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const BH_INDIVIDUAL_HOME_DEFAULTS: Partial<BhIndividualHomeProps> = {
  preset: 'standard',
};
