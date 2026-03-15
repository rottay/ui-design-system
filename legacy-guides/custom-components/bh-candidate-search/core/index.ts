/**
 * BhCandidateSearch - Core Interface
 * Advanced candidate search for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBCandidate[] for results - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBCandidate } from '@rottay/recruiter';

export type BhCandidateSearchPreset = 'standard';

/**
 * Re-export the DB type for convenience.
 * Consumers can import { RecruiterCandidate } from the DS or use DBCandidate from @rottay/recruiter.
 */
export type RecruiterCandidate = DBCandidate;

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Partial<SearchFilter>;
  resultCount: number;
}

export interface SearchFilter {
  skills: string[];
  experienceRange: [number, number];
  location: string;
  radius?: number;
  education: string;
  availability: string;
  salaryRange: [number, number];
  source: string[];
  tags: string[];
  status: string[];
  /** Filter by compensation range [min, max] */
  compensationRange?: [number, number];
  /** Filter by compensation currency */
  compensationCurrency?: string;
  /** Filter by remote work preference ('remote', 'hybrid', 'onsite') */
  remotePreference?: string;
  /** Filter by visa sponsorship requirement */
  requiresVisaSponsorship?: boolean;
  /** Filter by availability window (e.g. 'immediately', '2_weeks', '1_month') */
  availabilityWindow?: string;
  /** Filter by work authorization status */
  workAuthorization?: string;
  /** Filter by willing to relocate */
  willingToRelocate?: boolean;
}

export interface FacetCount {
  dimension: string;
  value: string;
  count: number;
}

export interface BhCandidateSearchProps extends EngineAwareProps {
  preset?: BhCandidateSearchPreset;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filters?: Partial<SearchFilter>;
  onFilterChange?: (filters: Partial<SearchFilter>) => void;
  savedSearches?: SavedSearch[];
  onSaveSearch?: (name: string) => void;
  onLoadSearch?: (searchId: string) => void;
  onDeleteSearch?: (searchId: string) => void;

  /** Candidate results - accepts DBCandidate[] directly from @rottay/recruiter */
  results?: DBCandidate[];

  /** Match scores keyed by candidate ID (computed externally, e.g. by AI) */
  matchScores?: Record<string, number>;

  /** Highlighted skill names per candidate (keyed by candidate ID) */
  highlights?: Record<string, string[]>;

  facetCounts?: FacetCount[];
  selectedCandidates?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onAddToJob?: (candidateIds: string[]) => void;
  onSendOutreach?: (candidateIds: string[]) => void;
  onExport?: (candidateIds: string[]) => void;
  onCompare?: (candidateIds: string[]) => void;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  totalResults?: number;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_CANDIDATE_SEARCH_DEFAULTS: Partial<BhCandidateSearchProps> = {
  preset: 'standard',
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterCandidate (DBCandidate) instead */
export type SearchResult = RecruiterCandidate;

/**
 * Get the candidate's full name from DB fields.
 */
export function getCandidateFullName(candidate: DBCandidate): string {
  return `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim();
}

/**
 * Get the candidate's current role display string.
 * Combines currentTitle and currentCompany.
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
 * Extract skill names from the jsonb skills field.
 */
export function getCandidateSkillNames(candidate: DBCandidate): string[] {
  const skills = candidate.skills as Array<{ name?: string }> | null;
  if (!Array.isArray(skills)) return [];
  return skills.map(s => s.name ?? '').filter(Boolean);
}

export function getMatchScoreColor(score: number, tokens: DesignTokens): { bg: string; text: string; border: string } {
  if (score >= 90) return { bg: tokens.colors.successScale[50], text: tokens.colors.successScale[700], border: tokens.colors.successScale[200] };
  if (score >= 75) return { bg: tokens.colors.successScale[50], text: tokens.colors.successScale[600], border: tokens.colors.successScale[200] };
  if (score >= 60) return { bg: tokens.colors.warningScale[50], text: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] };
  if (score >= 40) return { bg: tokens.colors.warningScale[50], text: tokens.colors.warningScale[600], border: tokens.colors.warningScale[200] };
  return { bg: tokens.colors.neutral[50], text: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
}

export function getStatusColors(status: string, tokens: DesignTokens): { bg: string; text: string; border: string } {
  switch (status) {
    case 'active':
      return { bg: tokens.colors.successScale[50], text: tokens.colors.successScale[700], border: tokens.colors.successScale[200] };
    case 'inactive':
      return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
    case 'hired':
      return { bg: tokens.colors.primaryScale[50], text: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] };
    case 'do_not_contact':
    case 'blacklisted':
      return { bg: tokens.colors.errorScale[50], text: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] };
    default:
      return { bg: tokens.colors.neutral[50], text: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
  }
}

export function getCandidateInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}
