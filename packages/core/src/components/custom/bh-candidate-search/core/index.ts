import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhCandidateSearchPreset = 'standard';

export interface SearchResult {
  id: string;
  name: string;
  avatar?: string;
  matchScore: number;
  highlights: string[];
  currentRole: string;
  location: string;
  skills: string[];
  status: string;
  email: string;
}

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
  results?: SearchResult[];
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
    case 'passive':
      return { bg: tokens.colors.infoScale[50], text: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] };
    case 'not-looking':
      return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
    case 'hired':
      return { bg: tokens.colors.primaryScale[50], text: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] };
    case 'rejected':
      return { bg: tokens.colors.errorScale[50], text: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] };
    default:
      return { bg: tokens.colors.neutral[50], text: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
  }
}

export function getCandidateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}
