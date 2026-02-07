'use client';

/**
 * BhCandidateSearch - Standard Preset
 * Advanced candidate search with full-text search, filters,
 * saved searches, result cards, faceted counts, and bulk actions
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
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
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
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
  Edit2,
} from 'lucide-react';

const DEFAULT_SAVED_SEARCHES: SavedSearch[] = [
  { id: 'ss-1', name: 'Senior React Devs', query: 'react senior', filters: { skills: ['React', 'TypeScript'], experienceRange: [5, 15] }, resultCount: 45 },
  { id: 'ss-2', name: 'SF Bay Area Engineers', query: 'software engineer', filters: { location: 'San Francisco, CA', radius: 50 }, resultCount: 128 },
  { id: 'ss-3', name: 'Active ML Candidates', query: 'machine learning', filters: { skills: ['Python', 'TensorFlow'], status: ['active'] }, resultCount: 23 },
];

const DEFAULT_RESULTS: SearchResult[] = [
  { id: 'c-1', name: 'Sarah Johnson', avatar: '', matchScore: 95, highlights: ['React', 'TypeScript', 'Next.js'], currentRole: 'Senior Frontend Engineer', location: 'San Francisco, CA', skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js'], status: 'active', email: 'sarah.j@example.com' },
  { id: 'c-2', name: 'Michael Chen', avatar: '', matchScore: 88, highlights: ['React', 'Python', 'AWS'], currentRole: 'Full Stack Developer', location: 'New York, NY', skills: ['React', 'Python', 'AWS', 'Docker', 'PostgreSQL'], status: 'active', email: 'm.chen@example.com' },
  { id: 'c-3', name: 'Emily Williams', avatar: '', matchScore: 82, highlights: ['TypeScript', 'Node.js'], currentRole: 'Backend Engineer', location: 'Austin, TX', skills: ['TypeScript', 'Node.js', 'MongoDB', 'Redis', 'Kubernetes'], status: 'passive', email: 'e.williams@example.com' },
  { id: 'c-4', name: 'David Rodriguez', avatar: '', matchScore: 76, highlights: ['React', 'Mobile'], currentRole: 'Mobile Developer', location: 'Seattle, WA', skills: ['React Native', 'iOS', 'Android', 'Flutter', 'Firebase'], status: 'active', email: 'd.rodriguez@example.com' },
  { id: 'c-5', name: 'Anna Kowalski', avatar: '', matchScore: 71, highlights: ['Python', 'ML'], currentRole: 'ML Engineer', location: 'Boston, MA', skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL'], status: 'passive', email: 'a.kowalski@example.com' },
  { id: 'c-6', name: 'James Thompson', avatar: '', matchScore: 65, highlights: ['Java', 'Spring'], currentRole: 'Backend Architect', location: 'Chicago, IL', skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'AWS'], status: 'not-looking', email: 'j.thompson@example.com' },
];

const DEFAULT_FACETS: FacetCount[] = [
  { dimension: 'skills', value: 'React', count: 45 },
  { dimension: 'skills', value: 'TypeScript', count: 38 },
  { dimension: 'skills', value: 'Python', count: 32 },
  { dimension: 'skills', value: 'Node.js', count: 28 },
  { dimension: 'skills', value: 'AWS', count: 22 },
  { dimension: 'location', value: 'San Francisco', count: 34 },
  { dimension: 'location', value: 'New York', count: 28 },
  { dimension: 'location', value: 'Austin', count: 18 },
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

export const StandardBhCandidateSearch = createPreset<BhCandidateSearchProps>({
  name: 'BhCandidateSearch.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCandidateSearchProps>) => {
    const { Box, Text } = primitives;
    const isModern = engine === 'modern';

    const {
      searchQuery: searchQueryProp,
      onSearchChange,
      filters: filtersProp,
      onFilterChange,
      savedSearches: savedSearchesProp,
      onSaveSearch,
      onLoadSearch,
      onDeleteSearch,
      results: resultsProp,
      facetCounts: facetCountsProp,
      selectedCandidates: selectedCandidatesProp,
      onSelectionChange,
      onAddToJob,
      onSendOutreach,
      onExport,
      onCompare,
      showAdvanced: showAdvancedProp,
      onToggleAdvanced,
      totalResults: totalResultsProp,
      loading,
      className,
      style,
    } = props;

    const [internalQuery, setInternalQuery] = useState(searchQueryProp ?? '');
    const [internalFilters, setInternalFilters] = useState<Partial<SearchFilter>>(filtersProp ?? {});
    const [internalSavedSearches, setInternalSavedSearches] = useState<SavedSearch[]>(savedSearchesProp ?? DEFAULT_SAVED_SEARCHES);
    const [internalResults, setInternalResults] = useState<SearchResult[]>(resultsProp ?? DEFAULT_RESULTS);
    const [internalSelected, setInternalSelected] = useState<string[]>(selectedCandidatesProp ?? []);
    const [internalShowAdvanced, setInternalShowAdvanced] = useState(showAdvancedProp ?? false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['skills', 'experience', 'location']));
    const [recentSearches] = useState(['react developer', 'senior engineer', 'python ML', 'frontend lead']);
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    const searchQuery = searchQueryProp ?? internalQuery;
    const activeFilters = filtersProp ?? internalFilters;
    const savedSearches = savedSearchesProp ?? internalSavedSearches;
    const results = resultsProp ?? internalResults;
    const facetCounts = facetCountsProp ?? DEFAULT_FACETS;
    const selectedCandidates = selectedCandidatesProp ?? internalSelected;
    const showAdvanced = showAdvancedProp ?? internalShowAdvanced;
    const totalResults = totalResultsProp ?? results.length;

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
          id: `ss-${Date.now()}`,
          name: saveSearchName.trim(),
          query: searchQuery,
          filters: activeFilters,
          resultCount: totalResults,
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

    const glassCardStyle = isModern ? createCardStyle(tokens, { elevation: 'md', glass: true }) : createCardStyle(tokens, { elevation: 'sm' });
    const hoverStyle = createHoverStyle(tokens);
    const hoverTransform = getHoverTransform(tokens);

    const facetsByDimension = useMemo(() => {
      const map: Record<string, FacetCount[]> = {};
      facetCounts.forEach(f => {
        if (!map[f.dimension]) map[f.dimension] = [];
        map[f.dimension].push(f);
      });
      return map;
    }, [facetCounts]);

    /* ─── Search Bar ─── */
    const renderSearchBar = () => (
      <Box style={{
        position: 'relative',
        padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.common.white,
        ...(isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
      }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {/* Search input */}
          <Box style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={18} color={tokens.colors.neutral[400]} style={{ position: 'absolute', left: tokens.spacing[3], zIndex: 1, pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
              placeholder="Search candidates by name, skills, role, location..."
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`,
                borderRadius: tokens.borderRadius.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.neutral[50],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                fontFamily: 'inherit',
                outline: 'none',
                transition: `all ${tokens.motion.hover}`,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => handleQueryChange('')}
                style={{
                  position: 'absolute',
                  right: tokens.spacing[2],
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: tokens.spacing[1],
                }}
              >
                <X size={14} color={tokens.colors.neutral[400]} />
              </button>
            )}
          </Box>

          {/* Advanced filter toggle */}
          <button
            onClick={handleToggleAdvanced}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${showAdvanced ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: showAdvanced ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: showAdvanced ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              transition: `all ${tokens.motion.hover}`,
              whiteSpace: 'nowrap',
            }}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[500],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </Box>

        {/* Autocomplete dropdown */}
        {showAutocomplete && !searchQuery && (
          <Box style={{
            position: 'absolute',
            top: '100%',
            left: tokens.spacing[5],
            right: tokens.spacing[5],
            backgroundColor: tokens.colors.common.white,
            border: `1px solid ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.md,
            boxShadow: tokens.shadows.lg,
            zIndex: 50,
            padding: tokens.spacing[2],
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, marginBottom: tokens.spacing[1] }}>
              Recent searches
            </Text>
            {recentSearches.map((term, idx) => (
              <Box
                key={idx}
                onClick={() => { handleQueryChange(term); setShowAutocomplete(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  cursor: 'pointer',
                  transition: `background-color ${tokens.motion.hover}`,
                }}
              >
                <Clock size={14} color={tokens.colors.neutral[400]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{term}</Text>
              </Box>
            ))}
          </Box>
        )}

        {/* Recent search chips */}
        {searchQuery && (
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[2], flexWrap: 'wrap' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              {totalResults} results
            </Text>
            {activeFilters.skills?.map(skill => (
              <Box key={skill} style={{
                ...createBadgeStyle(tokens, 'primary'),
                fontSize: tokens.typography.fontSize.xs,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                cursor: 'pointer',
              }}>
                {skill}
                <X size={10} onClick={() => handleFilterChange('skills', (activeFilters.skills ?? []).filter(s => s !== skill))} />
              </Box>
            ))}
            {activeFilters.location && (
              <Box style={{
                ...createBadgeStyle(tokens, 'info'),
                fontSize: tokens.typography.fontSize.xs,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                cursor: 'pointer',
              }}>
                <MapPin size={10} />
                {activeFilters.location}
                <X size={10} onClick={() => handleFilterChange('location', '')} />
              </Box>
            )}
            {activeFilters.status?.map(s => (
              <Box key={s} style={{
                ...createBadgeStyle(tokens, 'secondary'),
                fontSize: tokens.typography.fontSize.xs,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}>
                {s}
                <X size={10} onClick={() => handleFilterChange('status', (activeFilters.status ?? []).filter(st => st !== s))} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );

    /* ─── Saved Searches ─── */
    const renderSavedSearches = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        overflowX: 'auto',
        backgroundColor: tokens.colors.common.white,
      }}>
        <Bookmark size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0 }} />
        {savedSearches.map(search => (
          <Box
            key={search.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.full,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: `all ${tokens.motion.hover}`,
              flexShrink: 0,
            }}
          >
            <span onClick={() => handleLoadSearch(search)}>{search.name}</span>
            <span style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>({search.resultCount})</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteSearch(search.id); }}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                padding: 0,
                marginLeft: tokens.spacing[1],
              }}
            >
              <X size={10} color={tokens.colors.neutral[400]} />
            </button>
          </Box>
        ))}

        {/* Save current search */}
        {searchQuery && (
          <Box style={{ position: 'relative', flexShrink: 0 }}>
            {!showSaveDialog ? (
              <button
                onClick={() => setShowSaveDialog(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.full,
                  border: `1px dashed ${tokens.colors.primaryScale[300]}`,
                  backgroundColor: tokens.colors.primaryScale[50],
                  color: tokens.colors.primaryScale[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                <Save size={12} />
                Save current
              </button>
            ) : (
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}>
                <input
                  type="text"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
                  placeholder="Search name..."
                  autoFocus
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    border: `1px solid ${tokens.colors.primaryScale[300]}`,
                    fontSize: tokens.typography.fontSize.xs,
                    width: 120,
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
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
        )}
      </Box>
    );

    /* ─── Advanced Filters Panel ─── */
    const renderFilterSection = (key: string, label: string, Icon: typeof Filter, content: React.ReactNode) => {
      const isExpanded = expandedSections.has(key);
      return (
        <Box key={key} style={{
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        }}>
          <Box
            onClick={() => toggleSection(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              cursor: 'pointer',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Icon size={14} color={tokens.colors.neutral[400]} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                {label}
              </Text>
            </Box>
            {isExpanded ? <ChevronUp size={14} color={tokens.colors.neutral[400]} /> : <ChevronDown size={14} color={tokens.colors.neutral[400]} />}
          </Box>
          {isExpanded && (
            <Box style={{ padding: `0 ${tokens.spacing[3]}px ${tokens.spacing[3]}px` }}>
              {content}
            </Box>
          )}
        </Box>
      );
    };

    const renderFiltersPanel = () => (
      <Box style={{
        width: 280,
        flexShrink: 0,
        borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.common.white,
        overflowY: 'auto',
        ...(isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
      }}>
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
            Advanced Filters
          </Text>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setInternalFilters({}); onFilterChange?.({}); }}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: tokens.colors.primaryScale[500],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Clear all
            </button>
          )}
        </Box>

        {/* Skills filter */}
        {renderFilterSection('skills', 'Skills', Star, (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            {(facetsByDimension['skills'] ?? []).map(facet => {
              const isActive = (activeFilters.skills ?? []).includes(facet.value);
              return (
                <Box
                  key={facet.value}
                  onClick={() => {
                    const current = activeFilters.skills ?? [];
                    handleFilterChange('skills', isActive ? current.filter(s => s !== facet.value) : [...current, facet.value]);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    cursor: 'pointer',
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Box style={{
                      width: 16,
                      height: 16,
                      borderRadius: tokens.borderRadius.sm,
                      border: `2px solid ${isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                      backgroundColor: isActive ? tokens.colors.primaryScale[500] : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: `all ${tokens.motion.hover}`,
                    }}>
                      {isActive && <Check size={10} color={tokens.colors.common.white} />}
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{facet.value}</Text>
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{facet.count}</Text>
                </Box>
              );
            })}
          </Box>
        ))}

        {/* Experience range */}
        {renderFilterSection('experience', 'Experience', Briefcase, (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <select
                value={(activeFilters.experienceRange ?? [0, 20])[0]}
                onChange={(e) => handleFilterChange('experienceRange', [Number(e.target.value), (activeFilters.experienceRange ?? [0, 20])[1]])}
                style={{
                  flex: 1,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  fontFamily: 'inherit',
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                }}
              >
                {EXPERIENCE_OPTIONS.map(y => <option key={y} value={y}>{y} yrs</option>)}
              </select>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>to</Text>
              <select
                value={(activeFilters.experienceRange ?? [0, 20])[1]}
                onChange={(e) => handleFilterChange('experienceRange', [(activeFilters.experienceRange ?? [0, 20])[0], Number(e.target.value)])}
                style={{
                  flex: 1,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  fontFamily: 'inherit',
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                }}
              >
                {EXPERIENCE_OPTIONS.map(y => <option key={y} value={y}>{y}+ yrs</option>)}
              </select>
            </Box>
            {/* SVG range visualization */}
            <svg width="100%" height="8" viewBox="0 0 240 8" preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full }}>
              <rect x="0" y="0" width="240" height="8" rx="4" fill={tokens.colors.neutral[100]} />
              <rect
                x={((activeFilters.experienceRange ?? [0, 20])[0] / 20) * 240}
                y="0"
                width={Math.max(((activeFilters.experienceRange ?? [0, 20])[1] - (activeFilters.experienceRange ?? [0, 20])[0]) / 20 * 240, 8)}
                height="8"
                rx="4"
                fill={tokens.colors.primaryScale[400]}
              />
            </svg>
          </Box>
        ))}

        {/* Location filter */}
        {renderFilterSection('location', 'Location', MapPin, (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            <input
              type="text"
              value={activeFilters.location ?? ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="City, State, or Country"
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.sm,
                border: `1px solid ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                fontFamily: 'inherit',
                outline: 'none',
                width: '100%',
              }}
            />
            {activeFilters.location && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Radius:</Text>
                <select
                  value={activeFilters.radius ?? 25}
                  onChange={(e) => handleFilterChange('radius', Number(e.target.value))}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontFamily: 'inherit',
                    backgroundColor: tokens.colors.common.white,
                    outline: 'none',
                  }}
                >
                  {[10, 25, 50, 100, 200].map(r => <option key={r} value={r}>{r} mi</option>)}
                </select>
              </Box>
            )}
            {/* Location facets */}
            {(facetsByDimension['location'] ?? []).map(facet => (
              <Box
                key={facet.value}
                onClick={() => handleFilterChange('location', facet.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  cursor: 'pointer',
                  backgroundColor: activeFilters.location === facet.value ? tokens.colors.primaryScale[50] : 'transparent',
                  transition: `background-color ${tokens.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{facet.value}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{facet.count}</Text>
              </Box>
            ))}
          </Box>
        ))}

        {/* Education */}
        {renderFilterSection('education', 'Education', GraduationCap, (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            {EDUCATION_OPTIONS.map(opt => {
              const isActive = activeFilters.education === opt;
              return (
                <Box
                  key={opt}
                  onClick={() => handleFilterChange('education', opt === 'Any' ? '' : opt)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    cursor: 'pointer',
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                    color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  {opt}
                </Box>
              );
            })}
          </Box>
        ))}

        {/* Availability */}
        {renderFilterSection('availability', 'Availability', Clock, (
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
            {AVAILABILITY_OPTIONS.map(opt => {
              const isActive = activeFilters.availability === opt;
              return (
                <Box
                  key={opt}
                  onClick={() => handleFilterChange('availability', opt === 'Any' ? '' : opt)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    border: `1px solid ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {opt}
                </Box>
              );
            })}
          </Box>
        ))}

        {/* Salary Range */}
        {renderFilterSection('salary', 'Salary Range', DollarSign, (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <input
                type="number"
                value={(activeFilters.salaryRange ?? [0, 300000])[0]}
                onChange={(e) => handleFilterChange('salaryRange', [Number(e.target.value), (activeFilters.salaryRange ?? [0, 300000])[1]])}
                placeholder="Min"
                style={{
                  flex: 1,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontFamily: 'inherit',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>to</Text>
              <input
                type="number"
                value={(activeFilters.salaryRange ?? [0, 300000])[1]}
                onChange={(e) => handleFilterChange('salaryRange', [(activeFilters.salaryRange ?? [0, 300000])[0], Number(e.target.value)])}
                placeholder="Max"
                style={{
                  flex: 1,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontFamily: 'inherit',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </Box>
            {/* SVG dual slider visualization */}
            <svg width="100%" height="8" viewBox="0 0 240 8" preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full }}>
              <rect x="0" y="0" width="240" height="8" rx="4" fill={tokens.colors.neutral[100]} />
              <rect
                x={((activeFilters.salaryRange ?? [0, 300000])[0] / 300000) * 240}
                y="0"
                width={Math.max((((activeFilters.salaryRange ?? [0, 300000])[1] - (activeFilters.salaryRange ?? [0, 300000])[0]) / 300000) * 240, 8)}
                height="8"
                rx="4"
                fill={tokens.colors.successScale[400]}
              />
            </svg>
          </Box>
        ))}

        {/* Source */}
        {renderFilterSection('source', 'Source', Globe, (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            {SOURCE_OPTIONS.map(src => {
              const isActive = (activeFilters.source ?? []).includes(src);
              const facet = (facetsByDimension['source'] ?? []).find(f => f.value === src);
              return (
                <Box
                  key={src}
                  onClick={() => {
                    const current = activeFilters.source ?? [];
                    handleFilterChange('source', isActive ? current.filter(s => s !== src) : [...current, src]);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    cursor: 'pointer',
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Box style={{
                      width: 16,
                      height: 16,
                      borderRadius: tokens.borderRadius.sm,
                      border: `2px solid ${isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                      backgroundColor: isActive ? tokens.colors.primaryScale[500] : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: `all ${tokens.motion.hover}`,
                    }}>
                      {isActive && <Check size={10} color={tokens.colors.common.white} />}
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{src}</Text>
                  </Box>
                  {facet && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{facet.count}</Text>}
                </Box>
              );
            })}
          </Box>
        ))}

        {/* Tags */}
        {renderFilterSection('tags', 'Tags', Tag, (
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
            {['JavaScript', 'Remote', 'Full-time', 'Contract', 'Senior', 'Lead', 'Startup', 'Enterprise'].map(tag => {
              const isActive = (activeFilters.tags ?? []).includes(tag);
              return (
                <Box
                  key={tag}
                  onClick={() => {
                    const current = activeFilters.tags ?? [];
                    handleFilterChange('tags', isActive ? current.filter(t => t !== tag) : [...current, tag]);
                  }}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    border: `1px solid ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {tag}
                </Box>
              );
            })}
          </Box>
        ))}

        {/* Status */}
        {renderFilterSection('status', 'Status', Filter, (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            {STATUS_OPTIONS.map(status => {
              const isActive = (activeFilters.status ?? []).includes(status);
              const statusColors = getStatusColors(status, tokens);
              const facet = (facetsByDimension['status'] ?? []).find(f => f.value === status);
              return (
                <Box
                  key={status}
                  onClick={() => {
                    const current = activeFilters.status ?? [];
                    handleFilterChange('status', isActive ? current.filter(s => s !== status) : [...current, status]);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    cursor: 'pointer',
                    backgroundColor: isActive ? statusColors.bg : 'transparent',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Box style={{
                      width: 8,
                      height: 8,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: statusColors.text,
                    }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], textTransform: 'capitalize' }}>{status.replace('-', ' ')}</Text>
                  </Box>
                  {facet && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{facet.count}</Text>}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );

    /* ─── Results Grid ─── */
    const renderResults = () => (
      <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
        {/* Results header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box
              onClick={handleSelectAll}
              style={{
                width: 18,
                height: 18,
                borderRadius: tokens.borderRadius.sm,
                border: `2px solid ${selectedCandidates.length === results.length && results.length > 0 ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                backgroundColor: selectedCandidates.length === results.length && results.length > 0 ? tokens.colors.primaryScale[500] : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {selectedCandidates.length === results.length && results.length > 0 && <Check size={12} color={tokens.colors.common.white} />}
              {selectedCandidates.length > 0 && selectedCandidates.length < results.length && <Minus size={12} color={tokens.colors.primaryScale[500]} />}
            </Box>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
              {totalResults} candidates found
            </Text>
          </Box>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            Sorted by match score
          </Text>
        </Box>

        {/* Candidate cards */}
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
          {results.map(candidate => {
            const isSelected = selectedCandidates.includes(candidate.id);
            const scoreColors = getMatchScoreColor(candidate.matchScore, tokens);
            const statusColors = getStatusColors(candidate.status, tokens);

            return (
              <Box
                key={candidate.id}
                style={{
                  ...glassCardStyle,
                  padding: tokens.spacing[4],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[4],
                  border: `1px solid ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  transition: `all ${tokens.motion.hover}`,
                  cursor: 'pointer',
                  ...(isModern && isSelected && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur } : {}),
                }}
              >
                {/* Checkbox */}
                <Box
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelectionToggle(candidate.id); }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: tokens.borderRadius.sm,
                    border: `2px solid ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                    backgroundColor: isSelected ? tokens.colors.primaryScale[500] : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {isSelected && <Check size={12} color={tokens.colors.common.white} />}
                </Box>

                {/* Match score */}
                <Box style={{
                  width: 48,
                  height: 48,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: scoreColors.bg,
                  border: `2px solid ${scoreColors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: scoreColors.text, lineHeight: '1' }}>
                    {candidate.matchScore}
                  </Text>
                  <Text style={{ fontSize: '8px', color: scoreColors.text, lineHeight: '1' }}>
                    match
                  </Text>
                </Box>

                {/* Avatar */}
                <Box style={{
                  width: 40,
                  height: 40,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.primaryScale[700],
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {candidate.avatar ? (
                    <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }} />
                  ) : (
                    getCandidateInitials(candidate.name)
                  )}
                </Box>

                {/* Info */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                      {candidate.name}
                    </Text>
                    <Box style={{
                      padding: `0 ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: statusColors.bg,
                      border: `1px solid ${statusColors.border}`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: statusColors.text,
                      lineHeight: '1.6',
                      textTransform: 'capitalize',
                    }}>
                      {candidate.status.replace('-', ' ')}
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[1] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <Briefcase size={12} color={tokens.colors.neutral[400]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{candidate.currentRole}</Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <MapPin size={12} color={tokens.colors.neutral[400]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{candidate.location}</Text>
                    </Box>
                  </Box>
                  {/* Skills and highlights */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
                    {candidate.skills.slice(0, 5).map(skill => {
                      const isHighlighted = candidate.highlights.includes(skill);
                      return (
                        <Box key={skill} style={{
                          padding: `0 ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: isHighlighted ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                          border: `1px solid ${isHighlighted ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: isHighlighted ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                          color: isHighlighted ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                          lineHeight: '1.8',
                        }}>
                          {skill}
                        </Box>
                      );
                    })}
                    {candidate.skills.length > 5 && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], lineHeight: '1.8' }}>
                        +{candidate.skills.length - 5} more
                      </Text>
                    )}
                  </Box>
                </Box>

                {/* Quick actions */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], flexShrink: 0 }}>
                  <button
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSendOutreach?.([candidate.id]); }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Mail size={12} />
                    Email
                  </button>
                  <button
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAddToJob?.([candidate.id]); }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      border: `1px solid ${tokens.colors.primaryScale[200]}`,
                      backgroundColor: tokens.colors.primaryScale[50],
                      color: tokens.colors.primaryScale[700],
                      fontSize: tokens.typography.fontSize.xs,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Plus size={12} />
                    Add to Job
                  </button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );

    /* ─── Bulk Actions Bar ─── */
    const renderBulkActions = () => {
      if (selectedCandidates.length === 0) return null;

      return (
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.primaryScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...(isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box style={{
              ...createBadgeStyle(tokens, 'primary'),
              fontSize: tokens.typography.fontSize.xs,
            }}>
              {selectedCandidates.length} selected
            </Box>
            <button
              onClick={() => { setInternalSelected([]); onSelectionChange?.([]); }}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.xs,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Clear
            </button>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <button
              onClick={() => onAddToJob?.(selectedCandidates)}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: tokens.colors.primaryScale[500],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Users size={14} />
              Add to Job
            </button>
            <button
              onClick={() => onSendOutreach?.(selectedCandidates)}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Mail size={14} />
              Send Outreach
            </button>
            <button
              onClick={() => onExport?.(selectedCandidates)}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Download size={14} />
              Export
            </button>
            {selectedCandidates.length >= 2 && (
              <button
                onClick={() => onCompare?.(selectedCandidates)}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[700],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <GitCompare size={14} />
                Compare
              </button>
            )}
          </Box>
        </Box>
      );
    };

    /* ─── Main Render ─── */
    return (
      <Box className={className} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: isModern ? 'transparent' : tokens.colors.neutral[50],
        ...style,
      }}>
        {/* Search bar */}
        {renderSearchBar()}

        {/* Saved searches */}
        {renderSavedSearches()}

        {/* Main content: filters sidebar + results */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Filters panel */}
          {showAdvanced && renderFiltersPanel()}

          {/* Results */}
          {renderResults()}
        </Box>

        {/* Bulk actions */}
        {renderBulkActions()}
      </Box>
    );
  },
});
