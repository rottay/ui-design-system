'use client';

/**
 * BhCandidateSearch - Standard Preset
 * Advanced candidate search with full-text search, filters,
 * saved searches, result cards, faceted counts, and bulk actions.
 *
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows,
 * card-based results with avatar + match score ring + skill pills.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createHoverStyle,
  createSurfaceStyle,
  createCardHoverStyles,
  getCardPadding,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type {
  BhCandidateSearchProps,
  SearchResult,
  SavedSearch,
  SearchFilter,
  FacetCount,
} from '../../core';
import { getMatchScoreColor, getStatusColors, getCandidateInitials } from '../../core';
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
  ExternalLink,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_SAVED_SEARCHES: SavedSearch[] = [
  { id: 'ss-1', name: 'Senior React Devs', query: 'react senior', filters: { skills: ['React', 'TypeScript'], experienceRange: [5, 15] }, resultCount: 45 },
  { id: 'ss-2', name: 'SF Bay Area Engineers', query: 'software engineer', filters: { location: 'San Francisco, CA', radius: 50 }, resultCount: 128 },
  { id: 'ss-3', name: 'Active ML Candidates', query: 'machine learning', filters: { skills: ['Python', 'TensorFlow'], status: ['active'] }, resultCount: 23 },
];

const DEFAULT_RESULTS: SearchResult[] = [
  { id: 'c-1', name: 'Sarah Johnson', avatar: '', matchScore: 95, highlights: ['React', 'TypeScript', 'Next.js'], currentRole: 'Senior Frontend Engineer at Google', location: 'San Francisco, CA', skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js'], status: 'active', email: 'sarah.j@google.com' },
  { id: 'c-2', name: 'Michael Chen', avatar: '', matchScore: 88, highlights: ['React', 'Python', 'AWS'], currentRole: 'Full Stack Developer at Stripe', location: 'New York, NY', skills: ['React', 'Python', 'AWS', 'Docker', 'PostgreSQL'], status: 'active', email: 'm.chen@stripe.com' },
  { id: 'c-3', name: 'Emily Rodriguez', avatar: '', matchScore: 92, highlights: ['System Design', 'Go'], currentRole: 'Staff Engineer at Meta', location: 'Seattle, WA', skills: ['Go', 'Kubernetes', 'System Design', 'gRPC', 'Terraform'], status: 'active', email: 'e.rodriguez@meta.com' },
  { id: 'c-4', name: 'James Kim', avatar: '', matchScore: 85, highlights: ['Python', 'PyTorch'], currentRole: 'ML Engineer at Anthropic', location: 'San Francisco, CA', skills: ['Python', 'PyTorch', 'Transformers', 'CUDA', 'MLOps'], status: 'active', email: 'j.kim@anthropic.com' },
  { id: 'c-5', name: 'Anna Kowalski', avatar: '', matchScore: 78, highlights: ['AWS', 'Terraform'], currentRole: 'DevOps Lead at Vercel', location: 'Remote', skills: ['AWS', 'Terraform', 'Docker', 'CI/CD', 'Kubernetes'], status: 'passive', email: 'a.kowalski@vercel.com' },
  { id: 'c-6', name: 'David Thompson', avatar: '', matchScore: 91, highlights: ['Leadership', 'Architecture'], currentRole: 'VP Engineering at Linear', location: 'New York, NY', skills: ['Leadership', 'Architecture', 'TypeScript', 'React', 'PostgreSQL'], status: 'active', email: 'd.thompson@linear.app' },
];

const DEFAULT_FACETS: FacetCount[] = [
  { dimension: 'skills', value: 'React', count: 45 },
  { dimension: 'skills', value: 'TypeScript', count: 38 },
  { dimension: 'skills', value: 'Python', count: 32 },
  { dimension: 'skills', value: 'Node.js', count: 28 },
  { dimension: 'skills', value: 'AWS', count: 22 },
  { dimension: 'location', value: 'San Francisco', count: 34 },
  { dimension: 'location', value: 'New York', count: 28 },
  { dimension: 'location', value: 'Seattle', count: 18 },
  { dimension: 'status', value: 'active', count: 89 },
  { dimension: 'status', value: 'passive', count: 45 },
  { dimension: 'status', value: 'not-looking', count: 12 },
  { dimension: 'source', value: 'LinkedIn', count: 67 },
  { dimension: 'source', value: 'Referral', count: 34 },
  { dimension: 'source', value: 'Job Board', count: 22 },
];

const EXPERIENCE_OPTIONS = [0, 1, 2, 3, 5, 7, 10, 15, 20];
const EDUCATION_OPTIONS = ['Any', 'High School', "Associate's", "Bachelor's", "Master's", 'PhD'];
const AVAILABILITY_OPTIONS = ['Any', 'Immediately', '2 weeks', '1 month', '3 months'];
const STATUS_OPTIONS = ['active', 'passive', 'not-looking', 'hired', 'rejected'];
const SOURCE_OPTIONS = ['LinkedIn', 'Referral', 'Job Board', 'Direct', 'Agency', 'Event'];

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, tokens, size = 48 }: { score: number; tokens: DesignTokens; size?: number }) {
  const colors = getMatchScoreColor(score, tokens);
  const r = (size / 2) - 4;
  const circumference = 2 * Math.PI * r;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.border} strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.text} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={strokeOffset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size <= 36 ? 9 : tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: colors.text, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 7, color: colors.text, lineHeight: 1, marginTop: 1 }}>match</span>
      </div>
    </div>
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

function FilterSection({ sectionKey, label, Icon, isExpanded, onToggle, tokens, primitives, children }: FilterSectionProps) {
  const { Box, Text } = primitives;
  return (
    <Box style={{ borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
      <Box
        onClick={() => onToggle(sectionKey)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Icon size={14} color={tokens.colors.neutral[400]} />
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
            {label}
          </Text>
        </Box>
        {isExpanded
          ? <ChevronUp size={14} color={tokens.colors.neutral[400]} />
          : <ChevronDown size={14} color={tokens.colors.neutral[400]} />
        }
      </Box>
      {isExpanded && (
        <Box style={{ padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px` }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkbox Facet List                                                */
/* ------------------------------------------------------------------ */

function CheckboxFacetList({ facets, activeValues, onToggle, tokens, primitives }: {
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
            onClick={() => onToggle(facet.value)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              cursor: 'pointer',
              backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
              transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{
                width: 16, height: 16, borderRadius: tokens.borderRadius.sm,
                border: `1.5px solid ${isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                backgroundColor: isActive ? tokens.colors.primaryScale[500] : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: `all ${tokens.motion.hover}`,
              }}>
                {isActive && <Check size={10} color={tokens.colors.common.white} />}
              </Box>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{facet.value}</Text>
            </Box>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontWeight: tokens.typography.fontWeight.medium }}>
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

function CandidateResultCard({ candidate, isSelected, onToggleSelection, onSendOutreach, onAddToJob, tokens, primitives }: {
  candidate: SearchResult;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onSendOutreach?: (ids: string[]) => void;
  onAddToJob?: (ids: string[]) => void;
  tokens: DesignTokens;
  primitives: { Box: any; Text: any };
}) {
  const { Box, Text } = primitives;
  const [isHovered, setIsHovered] = useState(false);
  const scoreColors = getMatchScoreColor(candidate.matchScore, tokens);
  const statusColors = getStatusColors(candidate.status, tokens);
  const cardHover = createCardHoverStyles(tokens);
  const badgeRadius = getPersonalityBadgeRadius(tokens);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...createCardStyle(tokens, { elevation: 'sm' }),
        padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px`,
        display: 'flex', alignItems: 'center', gap: tokens.spacing[4],
        border: `1px solid ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`,
        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
        ...cardHover.base,
        ...(isHovered && !isSelected ? cardHover.hover : {}),
      }}
    >
      {/* Checkbox */}
      <Box
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleSelection(candidate.id); }}
        style={{
          width: 18, height: 18, borderRadius: tokens.borderRadius.sm, flexShrink: 0,
          border: `1.5px solid ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
          backgroundColor: isSelected ? tokens.colors.primaryScale[500] : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
        }}
      >
        {isSelected && <Check size={12} color={tokens.colors.common.white} />}
      </Box>

      {/* Avatar circle */}
      <Box style={{
        width: 48, height: 48, borderRadius: tokens.borderRadius.full, flexShrink: 0,
        overflow: 'hidden',
        backgroundColor: tokens.colors.primaryScale[100],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold,
        color: tokens.colors.primaryScale[700],
      }}>
        {candidate.avatar
          ? <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : getCandidateInitials(candidate.name)
        }
      </Box>

      {/* Info */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: 4 }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
            {candidate.name}
          </Text>
          <Box style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: `2px ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
            backgroundColor: statusColors.bg,
            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
            color: statusColors.text, textTransform: 'capitalize' as const,
          }}>
            <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: statusColors.text }} />
            {candidate.status.replace('-', ' ')}
          </Box>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[2] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Briefcase size={13} color={tokens.colors.neutral[400]} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
              {candidate.currentRole}
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <MapPin size={13} color={tokens.colors.neutral[400]} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {candidate.location}
            </Text>
          </Box>
        </Box>
        <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
          {candidate.skills.slice(0, 5).map(skill => {
            const isHighlighted = candidate.highlights.includes(skill);
            return (
              <Box key={skill} style={{
                padding: `2px ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
                backgroundColor: isHighlighted ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                border: `1px solid ${isHighlighted ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: isHighlighted ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: isHighlighted ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
              }}>
                {skill}
              </Box>
            );
          })}
          {candidate.skills.length > 5 && (
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], alignSelf: 'center' }}>
              +{candidate.skills.length - 5} more
            </Text>
          )}
        </Box>
      </Box>

      {/* Match score ring */}
      <ScoreRing score={candidate.matchScore} tokens={tokens} />

      {/* Quick actions */}
      <Box style={{
        display: 'flex', flexDirection: 'column', gap: tokens.spacing[2], flexShrink: 0,
        opacity: isHovered ? 1 : 0, transition: `opacity 0.2s ease`,
        pointerEvents: isHovered ? 'auto' as const : 'none' as const,
      }}>
        <button
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSendOutreach?.([candidate.id]); }}
          style={{
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600],
            fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          <Mail size={12} /> Email
        </button>
        <button
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAddToJob?.([candidate.id]); }}
          style={{
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
            border: 'none',
            backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
            fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
            fontWeight: tokens.typography.fontWeight.medium,
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          <Plus size={12} /> Add to Job
        </button>
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

    const {
      searchQuery: searchQueryProp, onSearchChange,
      filters: filtersProp, onFilterChange,
      savedSearches: savedSearchesProp, onSaveSearch, onLoadSearch, onDeleteSearch,
      results: resultsProp, facetCounts: facetCountsProp,
      selectedCandidates: selectedCandidatesProp, onSelectionChange,
      onAddToJob, onSendOutreach, onExport, onCompare,
      showAdvanced: showAdvancedProp, onToggleAdvanced,
      totalResults: totalResultsProp, loading, className, style,
    } = props;

    /* -- State --------------------------------------------------------- */
    const [internalQuery, setInternalQuery] = useState(searchQueryProp ?? '');
    const [internalFilters, setInternalFilters] = useState<Partial<SearchFilter>>(filtersProp ?? {});
    const [internalSavedSearches, setInternalSavedSearches] = useState<SavedSearch[]>(savedSearchesProp ?? DEFAULT_SAVED_SEARCHES);
    const [internalResults] = useState<SearchResult[]>(resultsProp ?? DEFAULT_RESULTS);
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
    const facetCounts = facetCountsProp ?? DEFAULT_FACETS;
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
    const inputStyle: React.CSSProperties = {
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `1px solid ${tokens.colors.neutral[200]}`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[700],
      fontFamily: 'inherit',
      outline: 'none',
      width: '100%',
      transition: `all ${tokens.motion.hover}`,
    };

    const focusHandlers = {
      onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.colors.primaryScale[100]}`;
        e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = tokens.colors.neutral[200];
      },
    };

    const pillStyle = (isActive: boolean): React.CSSProperties => ({
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.full,
      border: `1px solid ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
      backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
      color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    });

    const bulkActions = [
      { label: 'Add to Job', icon: <Users size={14} />, onClick: () => onAddToJob?.(selectedCandidates), primary: true },
      { label: 'Send Outreach', icon: <Mail size={14} />, onClick: () => onSendOutreach?.(selectedCandidates) },
      { label: 'Export', icon: <Download size={14} />, onClick: () => onExport?.(selectedCandidates) },
      ...(selectedCandidates.length >= 2 ? [{ label: 'Compare', icon: <GitCompare size={14} />, onClick: () => onCompare?.(selectedCandidates) }] : []),
    ];

    const renderRangeBar = (min: number, max: number, rangeMax: number, color: string) => (
      <svg width="100%" height="6" viewBox="0 0 240 6" preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full, marginTop: 4 }}>
        <rect x="0" y="0" width="240" height="6" rx="3" fill={tokens.colors.neutral[100]} />
        <rect
          x={(min / rangeMax) * 240}
          y="0"
          width={Math.max(((max - min) / rangeMax) * 240, 6)}
          height="6" rx="3" fill={color}
          style={{ transition: 'all 0.3s' }}
        />
      </svg>
    );

    /* -- Render -------------------------------------------------------- */
    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: tokens.colors.neutral[50],
        ...style,
      }}>
        {/* Search Bar */}
        <Box style={{
          position: 'relative',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color={tokens.colors.neutral[400]} style={{ position: 'absolute', left: tokens.spacing[4], zIndex: 1, pointerEvents: 'none' }} />
              <input
                type="text" value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={(e) => { setShowAutocomplete(true); focusHandlers.onFocus(e); }}
                onBlur={(e) => { setTimeout(() => setShowAutocomplete(false), 200); focusHandlers.onBlur(e); }}
                placeholder="Search candidates by name, skills, role, location..."
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px 44px`,
                  borderRadius: tokens.borderRadius.lg,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.neutral[50],
                  fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[800],
                  fontFamily: 'inherit', outline: 'none',
                  transition: `all ${tokens.motion.hover}`,
                }}
              />
              {searchQuery && (
                <button onClick={() => handleQueryChange('')} style={{
                  position: 'absolute', right: tokens.spacing[3], border: 'none', backgroundColor: 'transparent',
                  cursor: 'pointer', display: 'flex', padding: tokens.spacing[1],
                }}>
                  <X size={16} color={tokens.colors.neutral[400]} />
                </button>
              )}
            </Box>
            <button onClick={handleToggleAdvanced} style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${showAdvanced ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: showAdvanced ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: showAdvanced ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
              gap: tokens.spacing[2], whiteSpace: 'nowrap',
              transition: `all ${tokens.motion.hover}`,
            }}>
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 20, height: 20, borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </Box>

          {/* Autocomplete */}
          {showAutocomplete && !searchQuery && (
            <Box style={{
              position: 'absolute', top: '100%', left: tokens.spacing[6], right: tokens.spacing[6],
              backgroundColor: tokens.colors.common.white,
              border: `1px solid ${tokens.colors.neutral[100]}`,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              zIndex: 50, padding: tokens.spacing[2],
            }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              }}>
                Recent searches
              </Text>
              {recentSearches.map((term, idx) => (
                <Box key={idx} onClick={() => { handleQueryChange(term); setShowAutocomplete(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md, cursor: 'pointer',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <Clock size={14} color={tokens.colors.neutral[400]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{term}</Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Active filter chips */}
          {(searchQuery || activeFilterCount > 0) && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[3], flexWrap: 'wrap' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>
                {totalResults} results
              </Text>
              {activeFilters.skills?.map(skill => (
                <Box key={skill} style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                }}>
                  {skill}
                  <X size={10} onClick={() => handleFilterChange('skills', (activeFilters.skills ?? []).filter(s => s !== skill))} />
                </Box>
              ))}
              {activeFilters.location && (
                <Box style={{
                  ...createBadgeStyle(tokens, 'info'),
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                }}>
                  <MapPin size={10} />{activeFilters.location}
                  <X size={10} onClick={() => handleFilterChange('location', '')} />
                </Box>
              )}
              {activeFilters.status?.map(s => (
                <Box key={s} style={{
                  ...createBadgeStyle(tokens, 'secondary'),
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                  textTransform: 'capitalize' as const,
                }}>
                  {s}
                  <X size={10} onClick={() => handleFilterChange('status', (activeFilters.status ?? []).filter(st => st !== s))} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Saved Searches */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          overflowX: 'auto', backgroundColor: tokens.colors.common.white,
        }}>
          <Bookmark size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0 }} />
          {savedSearches.map(search => (
            <Box key={search.id} style={{
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.full,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              transition: `all ${tokens.motion.hover}`,
            }}>
              <span onClick={() => handleLoadSearch(search)}>{search.name}</span>
              <span style={{ color: tokens.colors.neutral[400] }}>({search.resultCount})</span>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteSearch(search.id); }}
                style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', padding: 0, marginLeft: 2 }}>
                <X size={10} color={tokens.colors.neutral[400]} />
              </button>
            </Box>
          ))}
          {searchQuery && !showSaveDialog && (
            <button onClick={() => setShowSaveDialog(true)} style={{
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.full,
              border: `1px dashed ${tokens.colors.primaryScale[300]}`,
              backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[600],
              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              <Save size={12} /> Save current
            </button>
          )}
          {showSaveDialog && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexShrink: 0 }}>
              <input type="text" value={saveSearchName} onChange={(e) => setSaveSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()} placeholder="Search name..." autoFocus
                style={{ ...inputStyle, width: 140, fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px` }}
                {...focusHandlers}
              />
              <button onClick={handleSaveSearch} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <Check size={14} color={tokens.colors.successScale[500]} />
              </button>
              <button onClick={() => setShowSaveDialog(false)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <X size={14} color={tokens.colors.neutral[400]} />
              </button>
            </Box>
          )}
        </Box>

        {/* Main Content */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Filters Panel */}
          {showAdvanced && (
            <Box style={{
              width: 300, flexShrink: 0,
              borderRight: `1px solid ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.common.white, overflowY: 'auto',
            }}>
              <Box style={{
                padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
                borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  Advanced Filters
                </Text>
                {activeFilterCount > 0 && (
                  <button onClick={() => { setInternalFilters({}); onFilterChange?.({}); }}
                    style={{ border: 'none', backgroundColor: 'transparent', color: tokens.colors.primaryScale[500], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Clear all
                  </button>
                )}
              </Box>

              <FilterSection sectionKey="skills" label="Skills" Icon={Star} isExpanded={expandedSections.has('skills')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <CheckboxFacetList facets={facetsByDimension['skills'] ?? []} activeValues={activeFilters.skills ?? []} onToggle={(v) => toggleArrayFilter('skills', v)} tokens={tokens} primitives={primitives} />
              </FilterSection>

              <FilterSection sectionKey="experience" label="Experience" Icon={Briefcase} isExpanded={expandedSections.has('experience')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <select value={(activeFilters.experienceRange ?? [0, 20])[0]} onChange={(e) => handleFilterChange('experienceRange', [Number(e.target.value), (activeFilters.experienceRange ?? [0, 20])[1]])} style={{ ...inputStyle, flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px` }}>
                      {EXPERIENCE_OPTIONS.map(y => <option key={y} value={y}>{y} yrs</option>)}
                    </select>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>to</Text>
                    <select value={(activeFilters.experienceRange ?? [0, 20])[1]} onChange={(e) => handleFilterChange('experienceRange', [(activeFilters.experienceRange ?? [0, 20])[0], Number(e.target.value)])} style={{ ...inputStyle, flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px` }}>
                      {EXPERIENCE_OPTIONS.map(y => <option key={y} value={y}>{y}+ yrs</option>)}
                    </select>
                  </Box>
                  {renderRangeBar((activeFilters.experienceRange ?? [0, 20])[0], (activeFilters.experienceRange ?? [0, 20])[1], 20, tokens.colors.primaryScale[400])}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="location" label="Location" Icon={MapPin} isExpanded={expandedSections.has('location')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  <input type="text" value={activeFilters.location ?? ''} onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="City, State, or Country" style={inputStyle} {...focusHandlers} />
                  {(facetsByDimension['location'] ?? []).map(facet => (
                    <Box key={facet.value} onClick={() => handleFilterChange('location', facet.value)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md, cursor: 'pointer',
                        backgroundColor: activeFilters.location === facet.value ? tokens.colors.primaryScale[50] : 'transparent',
                        transition: `background-color ${tokens.motion.hover}`,
                      }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{facet.value}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{facet.count}</Text>
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="education" label="Education" Icon={GraduationCap} isExpanded={expandedSections.has('education')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {EDUCATION_OPTIONS.map(opt => (
                    <Box key={opt} onClick={() => handleFilterChange('education', opt === 'Any' ? '' : opt)}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md, cursor: 'pointer',
                        backgroundColor: activeFilters.education === opt ? tokens.colors.primaryScale[50] : 'transparent',
                        color: activeFilters.education === opt ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.sm,
                        transition: `all ${tokens.motion.hover}`,
                      }}>
                      {opt}
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="availability" label="Availability" Icon={Clock} isExpanded={expandedSections.has('availability')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <Box key={opt} onClick={() => handleFilterChange('availability', opt === 'Any' ? '' : opt)} style={pillStyle(activeFilters.availability === opt)}>
                      {opt}
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="salary" label="Salary Range" Icon={DollarSign} isExpanded={expandedSections.has('salary')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <input type="number" value={(activeFilters.salaryRange ?? [0, 300000])[0]}
                      onChange={(e) => handleFilterChange('salaryRange', [Number(e.target.value), (activeFilters.salaryRange ?? [0, 300000])[1]])}
                      placeholder="Min" style={{ ...inputStyle, flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px` }} {...focusHandlers} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>to</Text>
                    <input type="number" value={(activeFilters.salaryRange ?? [0, 300000])[1]}
                      onChange={(e) => handleFilterChange('salaryRange', [(activeFilters.salaryRange ?? [0, 300000])[0], Number(e.target.value)])}
                      placeholder="Max" style={{ ...inputStyle, flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px` }} {...focusHandlers} />
                  </Box>
                  {renderRangeBar((activeFilters.salaryRange ?? [0, 300000])[0], (activeFilters.salaryRange ?? [0, 300000])[1], 300000, tokens.colors.successScale[400])}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="source" label="Source" Icon={Globe} isExpanded={expandedSections.has('source')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <CheckboxFacetList
                  facets={SOURCE_OPTIONS.map(src => ({ dimension: 'source', value: src, count: (facetsByDimension['source'] ?? []).find(f => f.value === src)?.count ?? 0 }))}
                  activeValues={activeFilters.source ?? []}
                  onToggle={(v) => toggleArrayFilter('source', v)}
                  tokens={tokens} primitives={primitives}
                />
              </FilterSection>

              <FilterSection sectionKey="tags" label="Tags" Icon={Tag} isExpanded={expandedSections.has('tags')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                  {['JavaScript', 'Remote', 'Full-time', 'Contract', 'Senior', 'Lead', 'Startup', 'Enterprise'].map(tag => (
                    <Box key={tag} onClick={() => toggleArrayFilter('tags', tag)} style={pillStyle((activeFilters.tags ?? []).includes(tag))}>
                      {tag}
                    </Box>
                  ))}
                </Box>
              </FilterSection>

              <FilterSection sectionKey="status" label="Status" Icon={Filter} isExpanded={expandedSections.has('status')} onToggle={toggleSection} tokens={tokens} primitives={primitives}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {STATUS_OPTIONS.map(status => {
                    const isActive = (activeFilters.status ?? []).includes(status);
                    const statusColorSet = getStatusColors(status, tokens);
                    const facet = (facetsByDimension['status'] ?? []).find(f => f.value === status);
                    return (
                      <Box key={status} onClick={() => toggleArrayFilter('status', status)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md, cursor: 'pointer',
                          backgroundColor: isActive ? statusColorSet.bg : 'transparent',
                          transition: `all ${tokens.motion.hover}`,
                        }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: statusColorSet.text }} />
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], textTransform: 'capitalize' as const }}>
                            {status.replace('-', ' ')}
                          </Text>
                        </Box>
                        {facet && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{facet.count}</Text>}
                      </Box>
                    );
                  })}
                </Box>
              </FilterSection>
            </Box>
          )}

          {/* Results */}
          <Box style={{ flex: 1, overflow: 'auto', padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px` }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <Box onClick={handleSelectAll} style={{
                  width: 18, height: 18, borderRadius: tokens.borderRadius.sm, cursor: 'pointer',
                  border: `1.5px solid ${selectedCandidates.length === results.length && results.length > 0 ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                  backgroundColor: selectedCandidates.length === results.length && results.length > 0 ? tokens.colors.primaryScale[500] : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `all ${tokens.motion.hover}`,
                }}>
                  {selectedCandidates.length === results.length && results.length > 0 && <Check size={12} color={tokens.colors.common.white} />}
                  {selectedCandidates.length > 0 && selectedCandidates.length < results.length && <Minus size={12} color={tokens.colors.primaryScale[500]} />}
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                  {totalResults} candidates found
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Sparkles size={14} color={tokens.colors.neutral[400]} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Sorted by match score</Text>
              </Box>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {results.map(candidate => (
                <CandidateResultCard
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={selectedCandidates.includes(candidate.id)}
                  onToggleSelection={handleSelectionToggle}
                  onSendOutreach={onSendOutreach}
                  onAddToJob={onAddToJob}
                  tokens={tokens}
                  primitives={primitives}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Bulk Actions Bar */}
        {selectedCandidates.length > 0 && (
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
            borderTop: `1px solid ${tokens.colors.neutral[100]}`,
            backgroundColor: tokens.colors.primaryScale[50],
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <Box style={{ ...createBadgeStyle(tokens, 'primary') }}>
                {selectedCandidates.length} selected
              </Box>
              <button onClick={() => { setInternalSelected([]); onSelectionChange?.([]); }}
                style={{ border: 'none', backgroundColor: 'transparent', color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear
              </button>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {bulkActions.map(action => (
                <button key={action.label} onClick={action.onClick} style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: action.primary ? 'none' : `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: action.primary ? tokens.colors.primaryScale[500] : tokens.colors.common.white,
                  color: action.primary ? tokens.colors.common.white : tokens.colors.neutral[700],
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  {action.icon}{action.label}
                </button>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
