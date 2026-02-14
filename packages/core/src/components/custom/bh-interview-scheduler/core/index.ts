/**
 * BhInterviewScheduler - Core Interface
 * Schedule & Configure Interviews for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBInterview for pre-populating scheduling data.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBInterview } from '@rottay/recruiter';

export type BhInterviewSchedulerPreset = 'standard' | 'compact';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterInterview = DBInterview;

export interface ScheduleCandidate {
  id: string;
  name: string;
  avatar?: string;
  currentStage: string;
  jobTitle: string;
}

export interface InterviewTypeConfig {
  type: 'ai' | 'human';
  agentId?: string;
  agentName?: string;
  interviewerId?: string;
  interviewerName?: string;
  room?: string;
}

export interface ScheduleData {
  date: string;
  time: string;
  timezone: string;
  estimatedDuration: number;
}

export interface AgentOverride {
  temperature?: number;
  maxDuration?: number;
  customPrompt?: string;
}

export interface AvailableAgent {
  id: string;
  name: string;
  type: string;
  language: string;
}

export interface AvailableInterviewer {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface BhInterviewSchedulerProps extends EngineAwareProps {
  preset?: BhInterviewSchedulerPreset;

  /** Optional existing interview to pre-populate from */
  interview?: DBInterview;

  /** Candidate to schedule an interview for */
  candidate?: ScheduleCandidate | null;

  /** Current interview type configuration */
  interviewType?: InterviewTypeConfig;

  /** Callback when interview type changes */
  onTypeChange?: (config: InterviewTypeConfig) => void;

  /** Current pipeline template stage */
  templateStage?: string;

  /** Schedule date/time/timezone configuration */
  scheduleData?: ScheduleData;

  /** Callback when schedule data changes */
  onScheduleChange?: (data: ScheduleData) => void;

  /** AI agent configuration overrides */
  agentConfig?: AgentOverride;

  /** Callback when agent config changes */
  onAgentConfigChange?: (config: AgentOverride) => void;

  /** Available AI agents to choose from */
  agents?: AvailableAgent[];

  /** Available human interviewers to choose from */
  interviewers?: AvailableInterviewer[];

  /** Confirm and schedule the interview */
  onConfirm?: () => void;

  /** Cancel the scheduling flow */
  onCancel?: () => void;

  /** Estimated cost for AI interviews */
  estimatedCost?: number;

  /** Whether to show the confirmation summary */
  showConfirmation?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_INTERVIEW_SCHEDULER_DEFAULTS: Partial<BhInterviewSchedulerProps> = {
  preset: 'standard',
};
