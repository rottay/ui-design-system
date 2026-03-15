/**
 * BhCandidateProfile - Core Interface
 * Comprehensive Candidate View for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBCandidate directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBCandidate } from '@rottay/recruiter';

export type BhCandidateProfilePreset = 'full' | 'compact';

export type RecruiterCandidate = DBCandidate;

export type CandidateTab = 'profile' | 'applications' | 'interviews' | 'scores' | 'notes' | 'activity' | 'documents';

/**
 * Application info for the applications tab (UI-specific, not a DB entity replacement).
 */
export interface CandidateApplication {
  id: string;
  jobName: string;
  stage: string;
  scorePercent: number;
  pipelineProgress: number;
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
  /** AI-computed overall match score (0-100) */
  aiMatchScore?: number;
  /** Screening assessment score (0-100) */
  screeningScore?: number;
  /** Technical assessment score (0-100) */
  technicalScore?: number;
  /** Cultural fit score (0-100) */
  culturalScore?: number;
}

/** Compensation details for the candidate */
export interface CandidateCompensation {
  /** Current salary amount */
  currentSalary?: number;
  /** Currency code for current salary (e.g. 'USD') */
  currentSalaryCurrency?: string;
  /** Minimum expected salary */
  expectedSalaryMin?: number;
  /** Maximum expected salary */
  expectedSalaryMax?: number;
  /** Currency code for expected salary */
  expectedSalaryCurrency?: string;
}

/** Language proficiency entry */
export interface CandidateLanguage {
  /** Language name */
  language: string;
  /** Proficiency level (e.g. 'native', 'fluent', 'conversational') */
  proficiency?: string;
}

/** Availability and relocation information */
export interface CandidateAvailability {
  /** Date from which candidate is available */
  availableFrom?: Date;
  /** Notice period in days at current employer */
  noticePeriodDays?: number;
  /** Whether the candidate requires visa sponsorship */
  requiresVisaSponsorship?: boolean;
  /** Work authorization status */
  workAuthorization?: string;
  /** Whether the candidate is willing to relocate */
  willingToRelocate?: boolean;
  /** Preferred relocation destinations */
  relocationPreferences?: string[];
}

/** External document and profile URLs */
export interface CandidateDocumentLinks {
  /** Portfolio URL */
  portfolioUrl?: string;
  /** GitHub profile URL */
  githubUrl?: string;
  /** Personal website URL */
  websiteUrl?: string;
  /** LinkedIn profile URL */
  linkedinUrl?: string;
}

export interface BhCandidateProfileProps extends EngineAwareProps {
  preset?: BhCandidateProfilePreset;

  /** Primary candidate data - accepts DBCandidate directly from @rottay/recruiter */
  candidate?: DBCandidate;

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

  /** Document attachments */
  documents?: { id: string; name: string; type: string; uploadedAt: Date }[];

  /** Compensation details (current salary, expected range) */
  compensation?: CandidateCompensation;

  /** Languages spoken by the candidate */
  languages?: CandidateLanguage[];

  /** Availability and relocation preferences */
  availability?: CandidateAvailability;

  /** External document and profile links */
  documentLinks?: CandidateDocumentLinks;

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

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterCandidate (DBCandidate) instead */
export type CandidateInfo = RecruiterCandidate;
/** @deprecated Use getCandidateSkills() return type instead */
export type CandidateSkill = { name: string; level?: string; yearsOfExperience?: number };
/** @deprecated Work experience - extract from DBCandidate.workExperience jsonb field */
export interface Experience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}
/** @deprecated Education - extract from DBCandidate.education jsonb field */
export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get the candidate's full name from DB fields.
 */
export function getCandidateFullName(candidate: DBCandidate): string {
  return `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim();
}

/**
 * Get the candidate's current role display string.
 */
export function getCandidateRole(candidate: DBCandidate): string {
  const title = candidate.currentTitle ?? '';
  const company = candidate.currentCompany ?? '';
  if (title && company) return `${title} at ${company}`;
  return title || company || '';
}

/**
 * Extract location string from the jsonb currentLocation field.
 */
export function getCandidateLocation(candidate: DBCandidate): string {
  const loc = candidate.currentLocation as { city?: string; state?: string; country?: string } | null;
  if (!loc) return '';
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.join(', ');
}

/**
 * Extract skill objects from the jsonb skills field.
 */
export function getCandidateSkills(candidate: DBCandidate): Array<{ name: string; level?: string; yearsOfExperience?: number }> {
  const skills = candidate.skills as Array<{ name?: string; level?: string; yearsOfExperience?: number }> | null;
  if (!Array.isArray(skills)) return [];
  return skills.filter(s => s.name).map(s => ({ name: s.name!, level: s.level, yearsOfExperience: s.yearsOfExperience }));
}

/**
 * Extract languages from the jsonb languages field.
 */
export function getCandidateLanguages(candidate: DBCandidate): Array<{ language: string; proficiency: string }> {
  const langs = candidate.languages as Array<{ language?: string; proficiency?: string }> | null;
  if (!Array.isArray(langs)) return [];
  return langs.filter(l => l.language).map(l => ({ language: l.language!, proficiency: l.proficiency ?? '' }));
}

/**
 * Build external links from DB URL fields.
 */
export function getCandidateLinks(candidate: DBCandidate): Array<{ label: string; url: string }> {
  const links: Array<{ label: string; url: string }> = [];
  if (candidate.linkedinUrl) links.push({ label: 'LinkedIn', url: candidate.linkedinUrl });
  if (candidate.githubUrl) links.push({ label: 'GitHub', url: candidate.githubUrl });
  if (candidate.portfolioUrl) links.push({ label: 'Portfolio', url: candidate.portfolioUrl });
  if (candidate.websiteUrl) links.push({ label: 'Website', url: candidate.websiteUrl });
  return links;
}

/**
 * Get compensation range from DB fields.
 */
export function getCandidateCompensation(candidate: DBCandidate): { min: number; max: number; currency: string } | null {
  if (candidate.expectedSalaryMin == null && candidate.expectedSalaryMax == null) return null;
  return {
    min: candidate.expectedSalaryMin ?? 0,
    max: candidate.expectedSalaryMax ?? 0,
    currency: candidate.expectedSalaryCurrency ?? 'USD',
  };
}
