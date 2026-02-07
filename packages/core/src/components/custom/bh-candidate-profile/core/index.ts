/**
 * BhCandidateProfile - Core Interface
 * Comprehensive Candidate View for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhCandidateProfilePreset = 'full' | 'compact';

export type CandidateTab = 'profile' | 'applications' | 'interviews' | 'scores' | 'notes' | 'activity' | 'documents';

export interface CandidateInfo {
  id: string;
  name: string;
  avatar?: string;
  currentRole?: string;
  location?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  doNotContact: boolean;
}

export interface CandidateSkill {
  name: string;
  proficiency: number; // 0-100
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: number;
}

export interface CandidateApplication {
  id: string;
  jobName: string;
  stage: string;
  scorePercent: number;
  pipelineProgress: number; // 0-1
  recruiterName?: string;
  recruiterAvatar?: string;
  status: string;
}

export interface CandidateInterview {
  id: string;
  date: Date;
  type: 'ai' | 'human';
  status: 'scheduled' | 'completed' | 'cancelled';
  scorePercent?: number;
  duration?: string;
  hasReplay: boolean;
}

export interface ScoreCard {
  applicationId: string;
  jobName: string;
  overallScore: number;
  dimensions: { name: string; score: number; weight: number }[];
  date: string;
}

export interface CandidateNote {
  id: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: Date;
  content: string;
  isEditable: boolean;
}

export interface CandidateEvent {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  entityName?: string;
  entityLink?: string;
}

export interface CandidateStats {
  activeApplications: number;
  totalInterviews: number;
  avgScore: number;
  lastActivityDate: Date;
}

export interface BhCandidateProfileProps extends EngineAwareProps {
  preset?: BhCandidateProfilePreset;

  /** Primary candidate information */
  candidate?: CandidateInfo;

  /** Candidate skills with proficiency levels */
  skills?: CandidateSkill[];

  /** Work experience history */
  experience?: Experience[];

  /** Education history */
  education?: Education[];

  /** Active and past applications */
  applications?: CandidateApplication[];

  /** Scheduled and completed interviews */
  interviews?: CandidateInterview[];

  /** Score cards from completed evaluations */
  scoreCards?: ScoreCard[];

  /** Recruiter and team notes */
  notes?: CandidateNote[];

  /** Activity/event timeline */
  events?: CandidateEvent[];

  /** Summary statistics */
  stats?: CandidateStats;

  /** Compensation range (min and max) */
  compensationRange?: { min: number; max: number; currency?: string };

  /** Languages spoken */
  languages?: { name: string; level: string }[];

  /** External profile links */
  links?: { label: string; url: string }[];

  /** Document attachments */
  documents?: { id: string; name: string; type: string; uploadedAt: Date }[];

  /** Default active tab */
  defaultTab?: CandidateTab;

  /** Callback when tab changes */
  onTabChange?: (tab: CandidateTab) => void;

  /** Callback when an application is clicked */
  onApplicationClick?: (applicationId: string) => void;

  /** Callback when an interview is clicked */
  onInterviewClick?: (interviewId: string) => void;

  /** Callback when a note is saved */
  onNoteSave?: (noteId: string, content: string) => void;

  /** Callback when a note is deleted */
  onNoteDelete?: (noteId: string) => void;

  /** Callback when a new note is added */
  onNoteAdd?: (content: string) => void;

  /** Callback when a document is clicked */
  onDocumentClick?: (documentId: string) => void;

  /** Callback when an event entity link is clicked */
  onEventLinkClick?: (eventId: string) => void;

  /** Callback when interview replay is requested */
  onReplayClick?: (interviewId: string) => void;

  /** Callback when edit profile is triggered */
  onEditProfile?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CANDIDATE_PROFILE_DEFAULTS: Partial<BhCandidateProfileProps> = {
  preset: 'full',
  defaultTab: 'profile',
};
