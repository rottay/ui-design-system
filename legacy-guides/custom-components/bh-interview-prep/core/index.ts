/**
 * BhInterviewPrep - Core Interface
 * Interview Preparation Briefing for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * Prep-specific types (InterviewBrief, CandidateBrief, etc.) are UI-only.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBInterview } from '@rottay/recruiter';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterInterview = DBInterview;

export type BhInterviewPrepPreset = 'standard';

export interface InterviewBrief {
  jobTitle: string;
  stageName: string;
  /** Interview mode: 'ai' for AI, 'human' for human, or DB modes */
  type: 'ai' | 'human' | 'ai_voice' | 'ai_chat' | 'human_video' | 'human_phone' | 'in_person';
  dateTime: Date;
  estimatedDuration: number;
  /** Specific interview mode from the DB schema */
  interviewMode?: string;
  /** Scheduled duration in minutes */
  scheduledDurationMinutes?: number;
  /** Timezone for the interview */
  timezone?: string;
  /** Whether proctoring is enabled */
  proctoringEnabled?: boolean;
  /** AI persona/model snapshot for the interview */
  personaSnapshot?: Record<string, unknown>;
}

export interface CandidateBrief {
  name: string;
  avatar?: string;
  summary: string;
  resumeHighlights: string[];
  previousScores: { stage: string; score: number }[];
  /** AI-generated match score for the candidate (0-100) */
  aiMatchScore?: number;
}

export interface EvaluationFocus {
  dimensions: {
    name: string;
    weight: number;
    isKnockout: boolean;
  }[];
}

export interface ScriptOverview {
  sections: {
    title: string;
    keyQuestions: string[];
  }[];
}

export interface ChecklistItem {
  key: string;
  label: string;
  status: 'pass' | 'fail' | 'pending';
}

export interface BhInterviewPrepProps extends EngineAwareProps {
  preset?: BhInterviewPrepPreset;

  /** Optional DB interview for pre-populating data */
  interview?: DBInterview;

  /** Interview details and logistics */
  interviewBrief?: InterviewBrief;

  /** Candidate background briefing */
  candidateBrief?: CandidateBrief;

  /** Evaluation rubric focus areas */
  evaluationFocus?: EvaluationFocus;

  /** Interview script with key questions */
  scriptOverview?: ScriptOverview;

  /** Pre-interview checklist items */
  checklist?: ChecklistItem[];

  /** Callback when a checklist item status changes */
  onChecklistUpdate?: (key: string, status: ChecklistItem['status']) => void;

  /** Currently expanded script sections */
  expandedSections?: string[];

  /** Callback when a script section is toggled */
  onSectionToggle?: (sectionTitle: string) => void;

  /** Whether to show the full rubric details */
  showFullRubric?: boolean;

  /** Toggle full rubric view */
  onRubricToggle?: (show: boolean) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_INTERVIEW_PREP_DEFAULTS: Partial<BhInterviewPrepProps> = {
  preset: 'standard',
};
