'use client';

/**
 * BhCandidateSearch - Standard Preset
 * Advanced candidate search with full-text search, filters,
 * saved searches, result cards, faceted counts, and bulk actions.
 *
 * Personality-driven, glass-aware, zero raw HTML.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getCardPadding,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhCandidateSearchProps,
  SavedSearch,
  SearchFilter,
  FacetCount,
} from '../../core';
import {
  getMatchScoreColor, getStatusColors, getCandidateInitials,
  getCandidateFullName, getCandidateRole, getCandidateLocation, getCandidateSkillNames,
} from '../../core';
import type { DBCandidate } from '@rottay/recruiter';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search,
  SlidersHorizontal,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Users,
  Mail,
  Download,
  GitCompare,
  Briefcase,
  MapPin,
  Star,
  Filter,
  Clock,
  Tag,
  GraduationCap,
  DollarSign,
  Globe,
  Check,
  Bookmark,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const EXPERIENCE_OPTIONS = [0, 1, 2, 3, 5, 7, 10, 15, 20];
const EDUCATION_OPTIONS = ['Any', 'High School', "Associate's", "Bachelor's", "Master's", 'PhD'];
const AVAILABILITY_OPTIONS = ['Any', 'Immediately', '2 weeks', '1 month', '3 months'];
const STATUS_OPTIONS = ['active', 'inactive', 'hired', 'do_not_contact', 'blacklisted'];
const SOURCE_OPTIONS = ['LinkedIn', 'Referral', 'Job Board', 'Direct', 'Agency', 'Event'];

/* ------------------------------------------------------------------ */
/*  Score Ring (Box + Text, zero raw HTML)                             */
/* ------------------------------------------------------------------ */

function ScoreRingInner({ score, tokens: t, size = 48, Box, Text }: { score: number; tokens: DesignTokens; size?: number; Box: any; Text: any }) {
  const colors = getMatchScoreColor(score, t);
  const r = (size / 2) - 4;
  const circumference = 2 * Math.PI * r;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <Box style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="img" aria-label={`Match score: ${score}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.border} strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.text} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={strokeOffset} strokeLinecap="round"
          style={{ transition: `stroke-dashoffset ${t.motion.hover}` }}
        />
      </svg>
      <Box style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: size <= 36 ? 9 : t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: colors.text, lineHeight: 1 }}>
          {score}
        </Text>
        <Text style={{ fontSize: 7, color: colors.text, lineHeight: 1}}>match</Text>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Section                                                     */
/* ------------------------------------------------------------------ */

interface FilterSectionProps {
  sectionKey: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  tokens: DesignTokens;
  primitives: { Box: any; Text: any };
  children: React.ReactNode;
}

function FilterSection({ sectionKey, label, Icon, isExpanded, onToggle, tokens: t, primitives, children }: FilterSectionProps) {
  const { Box, Text } = primitives;
  return (
    <Box style={{ borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`Toggle ${label} filter`}
        onClick={() => onToggle(sectionKey)}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(sectionKey); } }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          cursor: 'pointer', transition: `all ${t.motion.hover}`,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
          <Icon size={14} color={t.colors.neutral[400]} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
            {label}
          </Text>
        </Box>
        {isExpanded
          ? <ChevronUp size={14} color={t.colors.neutral[400]} />
          : <ChevronDown size={14} color={t.colors.neutral[400]} />
        }
      </Box>
      {isExpanded && (
        <Box style={{ padding: `0 ${t.spacing[4]}px ${t.spacing[4]}px` }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkbox Facet List                                                */
/* ------------------------------------------------------------------ */

function CheckboxFacetList({ facets, activeValues, onToggle, tokens: t, primitives }: {
  facets: FacetCount[];
  activeValues: string[];
  onToggle: (value: string) => void;
  tokens: DesignTokens;
  primitives: { Box: any; Text: any };
}) {
  const { Box, Text } = primitives;
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {facets.map(facet => {
        const isActive = activeValues.includes(facet.value);
        return (
          <Box
            key={facet.value}
            role="checkbox"
            tabIndex={0}
            aria-checked={isActive}
            aria-label={`${facet.value} (${facet.count})`}
            onClick={() => onToggle(facet.value)}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(facet.value); } }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${t.spacing[2]}px ${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              cursor: 'pointer',
              backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent',
              transition: `background-color ${t.motion.hover}`,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box style={{
                width: 16, height: 16, borderRadius: t.borderRadius.sm,
                border: `1.5px solid ${isActive ? t.colors.primaryScale[500] : t.colors.neutral[300]}`,
                backgroundColor: isActive ? t.colors.primaryScale[500] : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: `all ${t.motion.hover}`,
              }}>
                {isActive && <Check size={10} color={t.colors.common.white} />}
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{facet.value}</Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontWeight: t.typography.fontWeight.medium }}>
              {facet.count}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Candidate Result Card                                              */
/* ------------------------------------------------------------------ */

function CandidateResultCard({ candidate, matchScore, candidateHighlights, isSelected, onToggleSelection, onSendOutreach, onAddToJob, tokens: t, primitives }: {
  candidate: DBCandidate;
  matchScore: number;
  candidateHighlights: string[];
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onSendOutreach?: (ids: string[]) => void;
  onAddToJob?: (ids: string[]) => void;
  tokens: DesignTokens;
  primitives: { Box: any; Text: any };
}) {
  const { Box, Text } = primitives;
  const [isHovered, setIsHovered] = useState(false);
  const fullName = useMemo(() => getCandidateFullName(candidate), [candidate]);
  const role = useMemo(() => getCandidateRole(candidate), [candidate]);
  const location = useMemo(() => getCandidateLocation(candidate), [candidate]);
  const skillNames = useMemo(() => getCandidateSkillNames(candidate), [candidate]);
  const scoreColors = useMemo(() => getMatchScoreColor(matchScore, t), [matchScore, t]);
  const statusColors = useMemo(() => getStatusColors(candidate.status ?? 'active', t), [candidate.status, t]);
  const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
  const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleCheckboxClick = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onToggleSelection(candidate.id); }, [onToggleSelection, candidate.id]);
  const handleCheckboxKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleSelection(candidate.id); }
  }, [onToggleSelection, candidate.id]);
  const handleEmailClick = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onSendOutreach?.([candidate.id]); }, [onSendOutreach, candidate.id]);
  const handleAddClick = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onAddToJob?.([candidate.id]); }, [onAddToJob, candidate.id]);

  return (
    <Box
      role="listitem"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...createCardStyle(t, { elevation: 'sm' }),
        padding: `${t.spacing[5]}px ${t.spacing[5]}px`,
        display: 'flex', alignItems: 'center', gap: t.spacing[4],
        border: `1px solid ${isSelected ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
        backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
        ...cardHover.base,
        ...(isHovered && !isSelected ? cardHover.hover : {}),
      }}
    >
      {/* Checkbox */}
      <Box
        role="checkbox"
        tabIndex={0}
        aria-checked={isSelected}
        aria-label={`Select ${fullName}`}
        onClick={handleCheckboxClick}
        onKeyDown={handleCheckboxKey}
        style={{
          width: 18, height: 18, borderRadius: t.borderRadius.sm, flexShrink: 0,
          border: `1.5px solid ${isSelected ? t.colors.primaryScale[500] : t.colors.neutral[300]}`,
          backgroundColor: isSelected ? t.colors.primaryScale[500] : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: `all ${t.motion.hover}`,
        }}
      >
        {isSelected && <Check size={12} color={t.colors.common.white} />}
      </Box>

      {/* Avatar circle */}
      <Box style={{
        width: 48, height: 48, borderRadius: t.borderRadius.full, flexShrink: 0,
        overflow: 'hidden',
        backgroundColor: t.colors.primaryScale[100],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold,
        color: t.colors.primaryScale[700],
      }}>
        {candidate.avatarUrl
          ? <Box as="img" src={candidate.avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>{getCandidateInitials(fullName)}</Text>
        }
      </Box>

      {/* Info */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: 4 }}>
          <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
            {fullName}
          </Text>
          <Box style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: `2px ${t.spacing[2]}px`, borderRadius: badgeRadius,
            backgroundColor: statusColors.bg,
            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
            color: statusColors.text, textTransform: 'capitalize' as const,
          }}>
            <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: statusColors.text }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: statusColors.text }}>{(candidate.status ?? 'active').replace(/_/g, ' ')}</Text>
          </Box>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4], marginBottom: t.spacing[2] }}>
          {role && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Briefcase size={13} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{role}</Text>
            </Box>
          )}
          {location && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <MapPin size={13} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{location}</Text>
            </Box>
          )}
        </Box>
        <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' }}>
          {skillNames.slice(0, 5).map(skill => {
            const isHighlighted = candidateHighlights.includes(skill);
            return (
              <Box key={skill} style={{
                padding: `2px ${t.spacing[2]}px`, borderRadius: badgeRadius,
                backgroundColor: isHighlighted ? t.colors.primaryScale[50] : t.colors.neutral[50],
                border: `1px solid ${isHighlighted ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                fontSize: t.typography.fontSize.xs,
                fontWeight: isHighlighted ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                color: isHighlighted ? t.colors.primaryScale[700] : t.colors.neutral[600],
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{skill}</Text>
              </Box>
            );
          })}
          {skillNames.length > 5 && (
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], alignSelf: 'center' }}>
              +{skillNames.length - 5} more
            </Text>
          )}
        </Box>
      </Box>

      {/* Match score ring */}
      <ScoreRingInner score={matchScore} tokens={t} Box={Box} Text={Text} />

      {/* Quick actions */}
      <Box style={{
        display: 'flex', flexDirection: 'column', gap: t.spacing[2], flexShrink: 0,
        opacity: isHovered ? 1 : 0, transition: `opacity ${t.motion.hover}`,
        pointerEvents: isHovered ? 'auto' as const : 'none' as const,
      }}>
        <Box
          role="button"
          tabIndex={0}
          aria-label={`Email ${fullName}`}
          onClick={handleEmailClick}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSendOutreach?.([candidate.id]); } }}
          style={{
            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
            border: `1px solid ${t.colors.neutral[200]}`,
            backgroundColor: t.colors.common.white, color: t.colors.neutral[600],
            fontSize: t.typography.fontSize.xs, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: t.spacing[1],
            transition: `all ${t.motion.hover}`,
          }}
        >
          <Mail size={12} />
          <Text style={{ fontSize: t.typography.fontSize.xs }}>Email</Text>
        </Box>
        <Box
          role="button"
          tabIndex={0}
          aria-label={`Add ${fullName} to job`}
          onClick={handleAddClick}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAddToJob?.([candidate.id]); } }}
          style={{
            padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md,
            border: 'none',
            backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
            fontSize: t.typography.fontSize.xs, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: t.spacing[1],
            fontWeight: t.typography.fontWeight.medium,
            transition: `all ${t.motion.hover}`,
          }}
        >
          <Plus size={12} />
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>Add to Job</Text>
        </Box>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Preset                                                        */
/* ------------------------------------------------------------------ */

export const StandardBhCandidateSearch = createPreset<BhCandidateSearchProps>({
  name: 'BhCandidateSearch.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhCandidateSearchProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      searchQuery: searchQueryProp, onSearchChange,
      filters: filtersProp, onFilterChange,
      savedSearches: savedSearchesProp, onSaveSearch, onLoadSearch, onDeleteSearch,
      results: resultsProp, matchScores: matchScoresProp, highlights: highlightsProp, facetCounts: facetCountsProp,
      selectedCandidates: selectedCandidatesProp, onSelectionChange,
      onAddToJob, onSendOutreach, onExport, onCompare,
      showAdvanced: showAdvancedProp, onToggleAdvanced,
      totalResults: totalResultsProp, loading, className, style,
    } = props;

    const isGlass = useMemo(() => t.surface.useGlass, [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    /* -- State --------------------------------------------------------- */
    const [internalQuery, setInternalQuery] = useState(searchQueryProp ?? '');
    const [internalFilters, setInternalFilters] = useState<Partial<SearchFilter>>(filtersProp ?? {});
    const [internalSavedSearches, setInternalSavedSearches] = useState<SavedSearch[]>(savedSearchesProp ?? []);
    const [internalResults] = useState<DBCandidate[]>(resultsProp ?? []);
    const [internalSelected, setInternalSelected] = useState<string[]>(selectedCandidatesProp ?? []);
    const [internalShowAdvanced, setInternalShowAdvanced] = useState(showAdvancedProp ?? false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['skills', 'experience', 'location']));
    const [recentSearches] = useState(['react developer', 'senior engineer', 'python ML', 'frontend lead']);
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    /* -- Resolve controlled / uncontrolled ----------------------------- */
    const searchQuery = searchQueryProp ?? internalQuery;
    const activeFilters = filtersProp ?? internalFilters;
    const savedSearches = savedSearchesProp ?? internalSavedSearches;
    const results = resultsProp ?? internalResults;
    const matchScores = matchScoresProp ?? {};
    const highlights = highlightsProp ?? {};
    const facetCounts = facetCountsProp ?? [];
    const selectedCandidates = selectedCandidatesProp ?? internalSelected;
    const showAdvanced = showAdvancedProp ?? internalShowAdvanced;
    const totalResults = totalResultsProp ?? results.length;

    /* -- Handlers ------------------------------------------------------ */
    const handleQueryChange = useCallback((query: string) => {
      setInternalQuery(query);
      onSearchChange?.(query);
    }, [onSearchChange]);

    const handleFilterChange = useCallback((key: keyof SearchFilter, value: unknown) => {
      const updated = { ...activeFilters, [key]: value };
      setInternalFilters(updated);
      onFilterChange?.(updated);
    }, [activeFilters, onFilterChange]);

    const handleToggleAdvanced = useCallback(() => {
      setInternalShowAdvanced(prev => !prev);
      onToggleAdvanced?.();
    }, [onToggleAdvanced]);

    const handleSelectionToggle = useCallback((candidateId: string) => {
      const updated = selectedCandidates.includes(candidateId)
        ? selectedCandidates.filter(id => id !== candidateId)
        : [...selectedCandidates, candidateId];
      setInternalSelected(updated);
      onSelectionChange?.(updated);
    }, [selectedCandidates, onSelectionChange]);

    const handleSelectAll = useCallback(() => {
      const allIds = results.map(r => r.id);
      const allSelected = allIds.every(id => selectedCandidates.includes(id));
      const updated = allSelected ? [] : allIds;
      setInternalSelected(updated);
      onSelectionChange?.(updated);
    }, [results, selectedCandidates, onSelectionChange]);

    const handleSaveSearch = useCallback(() => {
      if (saveSearchName.trim()) {
        const newSearch: SavedSearch = {
          id: `ss-${Date.now()}`, name: saveSearchName.trim(),
          query: searchQuery, filters: activeFilters, resultCount: totalResults,
        };
        setInternalSavedSearches(prev => [...prev, newSearch]);
        onSaveSearch?.(saveSearchName.trim());
        setSaveSearchName('');
        setShowSaveDialog(false);
      }
    }, [saveSearchName, searchQuery, activeFilters, totalResults, onSaveSearch]);

    const handleDeleteSearch = useCallback((searchId: string) => {
      setInternalSavedSearches(prev => prev.filter(s => s.id !== searchId));
      onDeleteSearch?.(searchId);
    }, [onDeleteSearch]);

    const handleLoadSearch = useCallback((search: SavedSearch) => {
      setInternalQuery(search.query);
      setInternalFilters(search.filters);
      onSearchChange?.(search.query);
      onFilterChange?.(search.filters);
      onLoadSearch?.(search.id);
    }, [onSearchChange, onFilterChange, onLoadSearch]);

    const toggleSection = useCallback((section: string) => {
      setExpandedSections(prev => {
        const next = new Set(prev);
        if (next.has(section)) next.delete(section);
        else next.add(section);
        return next;
      });
    }, []);

    const toggleArrayFilter = useCallback((key: keyof SearchFilter, value: string) => {
      const current = (activeFilters[key] as string[] | undefined) ?? [];
      const isActive = current.includes(value);
      handleFilterChange(key, isActive ? current.filter(s => s !== value) : [...current, value]);
    }, [activeFilters, handleFilterChange]);

    const handleClearSelection = useCallback(() => {
      setInternalSelected([]);
      onSelectionChange?.([]);
    }, [onSelectionChange]);

    const handleClearFilters = useCallback(() => {
      setInternalFilters({});
      onFilterChange?.({});
    }, [onFilterChange]);

    /* -- Derived ------------------------------------------------------- */
    const activeFilterCount = useMemo(() => {
      let count = 0;
      if (activeFilters.skills?.length) count++;
      if (activeFilters.experienceRange) count++;
      if (activeFilters.location) count++;
      if (activeFilters.education && activeFilters.education !== 'Any') count++;
      if (activeFilters.availability && activeFilters.availability !== 'Any') count++;
      if (activeFilters.salaryRange) count++;
      if (activeFilters.source?.length) count++;
      if (activeFilters.tags?.length) count++;
      if (activeFilters.status?.length) count++;
      return count;
    }, [activeFilters]);

    const facetsByDimension = useMemo(() => {
      const map: Record<string, FacetCount[]> = {};
      facetCounts.forEach(f => {
        if (!map[f.dimension]) map[f.dimension] = [];
        map[f.dimension].push(f);
      });
      return map;
    }, [facetCounts]);

    /* -- Reusable styles ----------------------------------------------- */
    const inputStyle = useMemo((): React.CSSProperties => ({
      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
      borderRadius: t.borderRadius.md,
      border: `1px solid ${t.colors.neutral[200]}`,
      fontSize: t.typography.fontSize.sm,
      color: t.colors.neutral[700],
      fontFamily: 'inherit',
      outline: 'none',
      width: '100%',
      transition: `all ${t.motion.hover}`,
    }), [t]);

    const pillStyle = useCallback((isActive: boolean): React.CSSProperties => ({
      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
      borderRadius: t.borderRadius.full,
      border: `1px solid ${isActive ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
      backgroundColor: isActive ? t.colors.primaryScale[50] : t.colors.common.white,
      color: isActive ? t.colors.primaryScale[700] : t.colors.neutral[600],
      fontSize: t.typography.fontSize.xs,
      fontWeight: t.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${t.motion.hover}`,
    }), [t]);

    const bulkActions = useMemo(() => [
      { label: 'Add to Job', icon: <Users size={14} />, onClick: () => onAddToJob?.(selectedCandidates), primary: true },
      { label: 'Send Outreach', icon: <Mail size={14} />, onClick: () => onSendOutreach?.(selectedCandidates) },
      { label: 'Export', icon: <Download size={14} />, onClick: () => onExport?.(selectedCandidates) },
      ...(selectedCandidates.length >= 2 ? [{ label: 'Compare', icon: <GitCompare size={14} />, onClick: () => onCompare?.(selectedCandidates) }] : []),
    ], [selectedCandidates, onAddToJob, onSendOutreach, onExport, onCompare]);

    const renderRangeBar = useCallback((min: number, max: number, rangeMax: number, color: string) => (
      <svg width="100%" height="6" viewBox="0 0 240 6" preserveAspectRatio="none" style={{ borderRadius: t.borderRadius.full, marginTop: 4 }}>
        <rect x="0" y="0" width="240" height="6" rx="3" fill={t.colors.neutral[100]} />
        <rect
          x={(min / rangeMax) * 240}
          y="0"
          width={Math.max(((max - min) / rangeMax) * 240, 6)}
          height="6" rx="3" fill={color}
          style={{ transition: `all ${t.motion.hover}` }}
        />
      </svg>
    ), [t]);

    /* -- Render -------------------------------------------------------- */
    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.neutral[50],
        ...style,
      }}>
        {/* Search Bar */}
        <Box style={{
          position: 'relative',
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: isGlass && t.glass ? t.glass.bg : t.colors.common.white,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color={t.colors.neutral[400]} style={{ position: 'absolute', left: t.spacing[4], zIndex: 1, pointerEvents: 'none' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQueryChange(e.target.value)}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => { setTimeout(() => setShowAutocomplete(false), 200); }}
                placeholder="Search candidates by name, skills, role, location..."
                aria-label="Search candidates"
                style={{
                  width: '100%',
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px ${t.spacing[3]}px 44px`,
                  borderRadius: t.borderRadius.lg,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.neutral[50],
                  fontSize: t.typography.fontSize.md, color: t.colors.neutral[800],
                  fontFamily: 'inherit', outline: 'none',
                  transition: `all ${t.motion.hover}`,
                }}
              />
              {searchQuery && (
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Clear search"
                  onClick={() => handleQueryChange('')}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQueryChange(''); } }}
                  style={{
                    position: 'absolute', right: t.spacing[3], backgroundColor: 'transparent',
                    cursor: 'pointer', display: 'flex', padding: t.spacing[1],
                  }}
                >
                  <X size={16} color={t.colors.neutral[400]} />
                </Box>
              )}
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Toggle advanced filters"
              aria-expanded={showAdvanced}
              onClick={handleToggleAdvanced}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleAdvanced(); } }}
              style={{
                padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                border: `1px solid ${showAdvanced ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                backgroundColor: showAdvanced ? t.colors.primaryScale[50] : t.colors.common.white,
                color: showAdvanced ? t.colors.primaryScale[600] : t.colors.neutral[600],
                fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: t.spacing[2], whiteSpace: 'nowrap',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <SlidersHorizontal size={16} />
              <Text style={{ fontSize: t.typography.fontSize.sm }}>Filters</Text>
              {activeFilterCount > 0 && (
                <Box style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 20, height: 20, borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.primaryScale[500], color: t.colors.common.white,
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white, fontWeight: t.typography.fontWeight.bold }}>{activeFilterCount}</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Autocomplete */}
          {showAutocomplete && !searchQuery && (
            <Box style={{
              position: 'absolute', top: '100%', left: t.spacing[6], right: t.spacing[6],
              backgroundColor: t.colors.common.white,
              border: `1px solid ${t.colors.neutral[100]}`,
              borderRadius: t.borderRadius.lg,
              boxShadow: t.shadows.lg,
              zIndex: 50, padding: t.spacing[2],
            }}>
              <Text style={{
                ...createPersonalitySectionHeaderStyle(t),
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              }}>
                Recent searches
              </Text>
              {recentSearches.map((term, idx) => (
                <Box
                  key={idx}
                  role="option"
                  tabIndex={0}
                  aria-label={`Search for ${term}`}
                  onClick={() => { handleQueryChange(term); setShowAutocomplete(false); }}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleQueryChange(term); setShowAutocomplete(false); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md, cursor: 'pointer',
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <Clock size={14} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{term}</Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Active filter chips */}
          {(searchQuery || activeFilterCount > 0) && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[3], flexWrap: 'wrap' }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>
                {totalResults} results
              </Text>
              {activeFilters.skills?.map(skill => (
                <Box key={skill} style={{
                  ...createBadgeStyle(t, 'primary'),
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{skill}</Text>
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${skill} filter`}
                    onClick={() => handleFilterChange('skills', (activeFilters.skills ?? []).filter(s => s !== skill))}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange('skills', (activeFilters.skills ?? []).filter(s => s !== skill)); } }}
                    style={{ cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={10} />
                  </Box>
                </Box>
              ))}
              {activeFilters.location && (
                <Box style={{
                  ...createBadgeStyle(t, 'info'),
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                }}>
                  <MapPin size={10} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{activeFilters.location}</Text>
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label="Remove location filter"
                    onClick={() => handleFilterChange('location', '')}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange('location', ''); } }}
                    style={{ cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={10} />
                  </Box>
                </Box>
              )}
              {activeFilters.status?.map(s => (
                <Box key={s} style={{
                  ...createBadgeStyle(t, 'secondary'),
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                  textTransform: 'capitalize' as const,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{s}</Text>
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${s} filter`}
                    onClick={() => handleFilterChange('status', (activeFilters.status ?? []).filter(st => st !== s))}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange('status', (activeFilters.status ?? []).filter(st => st !== s)); } }}
                    style={{ cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={10} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Saved Searches */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[2],
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          overflowX: 'auto', backgroundColor: t.colors.common.white,
        }}>
          <Bookmark size={14} color={t.colors.neutral[400]} style={{ flexShrink: 0 }} />
          {savedSearches.map(search => (
            <Box key={search.id} style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.full,
              border: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.common.white,
              fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
              color: t.colors.neutral[700],
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: `all ${t.motion.hover}`,
            }}>
              <Box
                role="button"
                tabIndex={0}
                aria-label={`Load search: ${search.name}`}
                onClick={() => handleLoadSearch(search)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLoadSearch(search); } }}
                style={{ cursor: 'pointer' }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{search.name}</Text>
              </Box>
              <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.xs }}>({search.resultCount})</Text>
              <Box
                role="button"
                tabIndex={0}
                aria-label={`Delete search: ${search.name}`}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteSearch(search.id); }}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDeleteSearch(search.id); } }}
                style={{ cursor: 'pointer', display: 'flex', padding: 0, marginLeft: 2 }}
              >
                <X size={10} color={t.colors.neutral[400]} />
              </Box>
            </Box>
          ))}
          {searchQuery && !showSaveDialog && (
            <Box
              role="button"
              tabIndex={0}
              aria-label="Save current search"
              onClick={() => setShowSaveDialog(true)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSaveDialog(true); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.full,
                border: `1px dashed ${t.colors.primaryScale[300]}`,
                backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[600],
                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <Save size={12} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Save current</Text>
            </Box>
          )}
          {showSaveDialog && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
              <input
                type="text"
                value={saveSearchName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaveSearchName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSaveSearch(); }}
                placeholder="Search name..."
                aria-label="Save search name"
                autoFocus
                style={{ ...inputStyle, width: 140, fontSize: t.typography.fontSize.xs, padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}
              />
              <Box
                role="button"
                tabIndex={0}
                aria-label="Confirm save search"
                onClick={handleSaveSearch}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSaveSearch(); } }}
                style={{ cursor: 'pointer', display: 'flex', padding: 2 }}
              >
                <Check size={14} color={t.colors.successScale[500]} />
              </Box>
              <Box
                role="button"
                tabIndex={0}
                aria-label="Cancel save search"
                onClick={() => setShowSaveDialog(false)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSaveDialog(false); } }}
                style={{ cursor: 'pointer', display: 'flex', padding: 2 }}
              >
                <X size={14} color={t.colors.neutral[400]} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Main Content */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Filters Panel */}
          {showAdvanced && (
            <Box role="region" aria-label="Advanced filters" style={{
              width: 300, flexShrink: 0,
              borderRight: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.common.white, overflowY: 'auto',
            }}>
              <Box style={{
                padding: `${t.spacing[4]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[100]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[800] }}>
                  Advanced Filters
                </Text>
                {activeFilterCount > 0 && (
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label="Clear all filters"
                    onClick={handleClearFilters}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClearFilters(); } }}
                    style={{ color: t.colors.primaryScale[500], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer' }}
                  >
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primaryScale[500] }}>Clear all</Text>
                  </Box>
                )}
              </Box>

              <FilterSection sectionKey="skills" label="Skills" Icon={Star} isExpanded={expandedSections.has('skills')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <CheckboxFacetList facets={facetsByDimension['skills'] ?? []} activeValues={activeFilters.skills ?? []} onToggle={(v) => toggleArrayFilter('skills', v)} tokens={t} primitives={primitives} />
              </FilterSection>

              <FilterSection sectionKey="experience" label="Experience" Icon={Briefcase} isExpanded={expandedSections.has('experience')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <select value={(activeFilters.experienceRange ?? [0, 20])[0]} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('experienceRange', [Number(e.target.value), (activeFilters.experienceRange ?? [0, 20])[1]])} aria-label="Minimum experience" style={{ ...inputStyle, flex: 1, padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>
                      {EXPERIENCE_OPTIONS.map(y => <option key={y} value={y}>{y} yrs</option>)}
                    </select>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>to</Text>
                    <select value={(activeFilters.experienceRange ?? [0, 20])[1]} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('experienceRange', [(activeFilters.experienceRange ?? [0, 20])[0], Number(e.target.value)])} aria-label="Maximum experience" style={{ ...inputStyle, flex: 1, padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>
                      {EXPERIENCE_OPTIONS.map(y => <option key={y} value={y}>{y}+ yrs</option>)}
                    </select>
                  </Box>
                  {renderRangeBar((activeFilters.experienceRange ?? [0, 20])[0], (activeFilters.experienceRange ?? [0, 20])[1], 20, t.colors.primaryScale[400])}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="location" label="Location" Icon={MapPin} isExpanded={expandedSections.has('location')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  <input type="text" value={activeFilters.location ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('location', e.target.value)} placeholder="City, State, or Country" aria-label="Location filter" style={inputStyle} />
                  {(facetsByDimension['location'] ?? []).map(facet => (
                    <Box key={facet.value}
                      role="option"
                      tabIndex={0}
                      aria-label={`${facet.value} (${facet.count})`}
                      onClick={() => handleFilterChange('location', facet.value)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange('location', facet.value); } }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${t.spacing[2]}px ${t.spacing[2]}px`,
                        borderRadius: t.borderRadius.md, cursor: 'pointer',
                        backgroundColor: activeFilters.location === facet.value ? t.colors.primaryScale[50] : 'transparent',
                        transition: `background-color ${t.motion.hover}`,
                      }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{facet.value}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{facet.count}</Text>
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="education" label="Education" Icon={GraduationCap} isExpanded={expandedSections.has('education')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {EDUCATION_OPTIONS.map(opt => (
                    <Box key={opt}
                      role="option"
                      tabIndex={0}
                      aria-selected={activeFilters.education === opt}
                      onClick={() => handleFilterChange('education', opt === 'Any' ? '' : opt)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange('education', opt === 'Any' ? '' : opt); } }}
                      style={{
                        padding: `${t.spacing[2]}px ${t.spacing[2]}px`,
                        borderRadius: t.borderRadius.md, cursor: 'pointer',
                        backgroundColor: activeFilters.education === opt ? t.colors.primaryScale[50] : 'transparent',
                        color: activeFilters.education === opt ? t.colors.primaryScale[700] : t.colors.neutral[600],
                        fontSize: t.typography.fontSize.sm,
                        transition: `all ${t.motion.hover}`,
                      }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm }}>{opt}</Text>
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="availability" label="Availability" Icon={Clock} isExpanded={expandedSections.has('availability')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <Box key={opt}
                      role="option"
                      tabIndex={0}
                      aria-selected={activeFilters.availability === opt}
                      onClick={() => handleFilterChange('availability', opt === 'Any' ? '' : opt)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange('availability', opt === 'Any' ? '' : opt); } }}
                      style={pillStyle(activeFilters.availability === opt)}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt}</Text>
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="salary" label="Salary Range" Icon={DollarSign} isExpanded={expandedSections.has('salary')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <input type="number" value={(activeFilters.salaryRange ?? [0, 300000])[0]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('salaryRange', [Number(e.target.value), (activeFilters.salaryRange ?? [0, 300000])[1]])}
                      placeholder="Min" aria-label="Minimum salary" style={{ ...inputStyle, flex: 1, padding: `${t.spacing[1]}px ${t.spacing[2]}px` }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>to</Text>
                    <input type="number" value={(activeFilters.salaryRange ?? [0, 300000])[1]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('salaryRange', [(activeFilters.salaryRange ?? [0, 300000])[0], Number(e.target.value)])}
                      placeholder="Max" aria-label="Maximum salary" style={{ ...inputStyle, flex: 1, padding: `${t.spacing[1]}px ${t.spacing[2]}px` }} />
                  </Box>
                  {renderRangeBar((activeFilters.salaryRange ?? [0, 300000])[0], (activeFilters.salaryRange ?? [0, 300000])[1], 300000, t.colors.successScale[400])}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="source" label="Source" Icon={Globe} isExpanded={expandedSections.has('source')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <CheckboxFacetList
                  facets={SOURCE_OPTIONS.map(src => ({ dimension: 'source', value: src, count: (facetsByDimension['source'] ?? []).find(f => f.value === src)?.count ?? 0 }))}
                  activeValues={activeFilters.source ?? []}
                  onToggle={(v) => toggleArrayFilter('source', v)}
                  tokens={t} primitives={primitives}
                />
              </FilterSection>

              <FilterSection sectionKey="tags" label="Tags" Icon={Tag} isExpanded={expandedSections.has('tags')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
                  {['JavaScript', 'Remote', 'Full-time', 'Contract', 'Senior', 'Lead', 'Startup', 'Enterprise'].map(tag => (
                    <Box key={tag}
                      role="option"
                      tabIndex={0}
                      aria-selected={(activeFilters.tags ?? []).includes(tag)}
                      onClick={() => toggleArrayFilter('tags', tag)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleArrayFilter('tags', tag); } }}
                      style={pillStyle((activeFilters.tags ?? []).includes(tag))}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{tag}</Text>
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="status" label="Status" Icon={Filter} isExpanded={expandedSections.has('status')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {STATUS_OPTIONS.map(status => {
                    const isActive = (activeFilters.status ?? []).includes(status);
                    const statusColorSet = getStatusColors(status, t);
                    const facet = (facetsByDimension['status'] ?? []).find(f => f.value === status);
                    return (
                      <Box key={status}
                        role="checkbox"
                        tabIndex={0}
                        aria-checked={isActive}
                        aria-label={`${status} status filter`}
                        onClick={() => toggleArrayFilter('status', status)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleArrayFilter('status', status); } }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: `${t.spacing[2]}px ${t.spacing[2]}px`,
                          borderRadius: t.borderRadius.md, cursor: 'pointer',
                          backgroundColor: isActive ? statusColorSet.bg : 'transparent',
                          transition: `all ${t.motion.hover}`,
                        }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: statusColorSet.text }} />
                          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], textTransform: 'capitalize' as const }}>
                            {status.replace(/_/g, ' ')}
                          </Text>
                        </Box>
                        {facet && <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{facet.count}</Text>}
                      </Box>
                    );
                  })}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="remote" label="Remote Preference" Icon={Globe} isExpanded={expandedSections.has('remote')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
                  {['Remote', 'Hybrid', 'Onsite'].map(opt => (
                    <Box key={opt}
                      role="option"
                      tabIndex={0}
                      aria-selected={activeFilters.remotePreference === opt.toLowerCase()}
                      onClick={() => handleFilterChange('remotePreference' as keyof SearchFilter, activeFilters.remotePreference === opt.toLowerCase() ? '' : opt.toLowerCase())}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange('remotePreference' as keyof SearchFilter, activeFilters.remotePreference === opt.toLowerCase() ? '' : opt.toLowerCase()); } }}
                      style={pillStyle(activeFilters.remotePreference === opt.toLowerCase())}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt}</Text>
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="visa" label="Visa Sponsorship" Icon={Globe} isExpanded={expandedSections.has('visa')} onToggle={toggleSection} tokens={t} primitives={primitives}>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
                  {[{ label: 'Requires Sponsorship', value: true }, { label: 'No Sponsorship Needed', value: false }].map(opt => (
                    <Box key={String(opt.value)}
                      role="option"
                      tabIndex={0}
                      aria-selected={activeFilters.requiresVisaSponsorship === opt.value}
                      onClick={() => handleFilterChange('requiresVisaSponsorship' as keyof SearchFilter, activeFilters.requiresVisaSponsorship === opt.value ? undefined : opt.value)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange('requiresVisaSponsorship' as keyof SearchFilter, activeFilters.requiresVisaSponsorship === opt.value ? undefined : opt.value); } }}
                      style={pillStyle(activeFilters.requiresVisaSponsorship === opt.value)}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{opt.label}</Text>
                    </Box>
                  ))}
                </Box>
              </FilterSection>
            </Box>
          )}

          {/* Results */}
          <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[5]}px ${t.spacing[5]}px` }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                <Box
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={selectedCandidates.length === results.length && results.length > 0}
                  aria-label="Select all candidates"
                  onClick={handleSelectAll}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectAll(); } }}
                  style={{
                    width: 18, height: 18, borderRadius: t.borderRadius.sm, cursor: 'pointer',
                    border: `1.5px solid ${selectedCandidates.length === results.length && results.length > 0 ? t.colors.primaryScale[500] : t.colors.neutral[300]}`,
                    backgroundColor: selectedCandidates.length === results.length && results.length > 0 ? t.colors.primaryScale[500] : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `all ${t.motion.hover}`,
                  }}
                >
                  {selectedCandidates.length === results.length && results.length > 0 && <Check size={12} color={t.colors.common.white} />}
                  {selectedCandidates.length > 0 && selectedCandidates.length < results.length && <Minus size={12} color={t.colors.primaryScale[500]} />}
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                  {totalResults} candidates found
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Sparkles size={14} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Sorted by match score</Text>
              </Box>
            </Box>

            <Box role="list" aria-label="Search results" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
              {results.map(candidate => (
                <CandidateResultCard
                  key={candidate.id}
                  candidate={candidate}
                  matchScore={matchScores[candidate.id] ?? 0}
                  candidateHighlights={highlights[candidate.id] ?? []}
                  isSelected={selectedCandidates.includes(candidate.id)}
                  onToggleSelection={handleSelectionToggle}
                  onSendOutreach={onSendOutreach}
                  onAddToJob={onAddToJob}
                  tokens={t}
                  primitives={primitives}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Bulk Actions Bar */}
        {selectedCandidates.length > 0 && (
          <Box role="toolbar" aria-label="Bulk actions" style={{
            padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
            borderTop: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.primaryScale[50],
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={{ ...createBadgeStyle(t, 'primary') }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{selectedCandidates.length} selected</Text>
              </Box>
              <Box
                role="button"
                tabIndex={0}
                aria-label="Clear selection"
                onClick={handleClearSelection}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClearSelection(); } }}
                style={{ color: t.colors.neutral[500], fontSize: t.typography.fontSize.xs, cursor: 'pointer' }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Clear</Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              {bulkActions.map(action => (
                <Box
                  key={action.label}
                  role="button"
                  tabIndex={0}
                  aria-label={action.label}
                  onClick={action.onClick}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action.onClick?.(); } }}
                  style={{
                    padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                    borderRadius: t.borderRadius.md,
                    border: action.primary ? 'none' : `1px solid ${t.colors.neutral[200]}`,
                    backgroundColor: action.primary ? t.colors.primaryScale[500] : t.colors.common.white,
                    color: action.primary ? t.colors.common.white : t.colors.neutral[700],
                    fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: t.spacing[1],
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  {action.icon}
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: action.primary ? t.colors.common.white : t.colors.neutral[700] }}>{action.label}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
