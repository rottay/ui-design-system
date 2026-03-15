'use client';

/**
 * BhJobBoard - Grid Preset
 * Slite-inspired card grid for browsing job listings with warm tones,
 * generous whitespace, soft shadows, and color-coded pipeline bars.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle, createCardStyle, createSurfaceStyle, createHoverStyle,
  createEntranceAnimation, createStaggerDelay, createCardHoverStyles,
  createIconContainerStyle, createEmptyStateStyle, getPersonalityTypography,
  getPersonalityBadgeRadius, getCardPadding,
  createPersonalityAccentBar,

  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhJobBoardProps, JobDisplayStatus, JobHiringUrgency, JobBoardFilter, ViewMode, SortDirection } from '../../core';
import type { DBJob } from '@rottay/recruiter';
import { BH_JOB_BOARD_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

/* ------------------------------------------------------------------ */
/*  DBJob field helpers (compute derived values from real DB data)       */
/* ------------------------------------------------------------------ */

function getJobLocation(job: DBJob): string {
  const loc = job.primaryLocation as any;
  if (!loc) return '';
  return [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
}

function getJobDaysOpen(job: DBJob): number {
  if (!job.publishedAt) return 0;
  const pub = typeof job.publishedAt === 'string' ? new Date(job.publishedAt) : job.publishedAt;
  return Math.max(0, Math.floor((Date.now() - pub.getTime()) / 86400000));
}
import {
  Briefcase, Plus, Search, LayoutGrid, List, Columns3, MapPin, Clock,
  Users, Eye, Pencil, Pause, Play, X, ChevronDown, AlertCircle, Globe,
  Filter, ArrowUpDown, Building2, TrendingUp, Check,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

interface StatusConfig { label: string; color: string; bgColor: string; borderColor: string; dotColor: string }
interface UrgencyConfig { label: string; color: string; bgColor: string; borderColor: string }

function getStatusConfig(tokens: DesignTokens): Record<string, StatusConfig> {
  return {
    published: { label: 'Published', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200], dotColor: tokens.colors.successScale[500] },
    draft: { label: 'Draft', color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[50], borderColor: tokens.colors.neutral[200], dotColor: tokens.colors.neutral[400] },
    pending_approval: { label: 'Pending', color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], borderColor: tokens.colors.infoScale[200], dotColor: tokens.colors.infoScale[500] },
    paused: { label: 'Paused', color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], borderColor: tokens.colors.warningScale[200], dotColor: tokens.colors.warningScale[500] },
    closed: { label: 'Closed', color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200], dotColor: tokens.colors.errorScale[500] },
    archived: { label: 'Archived', color: tokens.colors.neutral[500], bgColor: tokens.colors.neutral[50], borderColor: tokens.colors.neutral[200], dotColor: tokens.colors.neutral[300] },
  };
}

function getUrgencyConfig(tokens: DesignTokens): Record<string, UrgencyConfig> {
  return {
    low: { label: 'Low', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200] },
    normal: { label: 'Normal', color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], borderColor: tokens.colors.infoScale[200] },
    high: { label: 'High', color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], borderColor: tokens.colors.warningScale[200] },
    urgent: { label: 'Urgent', color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200] },
  };
}

const DEFAULT_STATUS_CFG: StatusConfig = { label: 'Unknown', color: '#666', bgColor: '#f5f5f5', borderColor: '#ddd', dotColor: '#999' };
const DEFAULT_URGENCY_CFG: UrgencyConfig = { label: 'Normal', color: '#666', bgColor: '#f5f5f5', borderColor: '#ddd' };

const STAGE_COLORS_KEYS = ['primaryScale', 'infoScale', 'warningScale', 'successScale', 'secondaryScale', 'errorScale'] as const;
function getStageColors(tokens: DesignTokens): string[] {
  return STAGE_COLORS_KEYS.map((k, i) => tokens.colors[k][k === 'errorScale' ? 400 : 500]);
}

const STAT_SCALE: Record<string, string> = { total: 'primaryScale', published: 'successScale', draft: 'neutral', paused: 'warningScale', closed: 'errorScale' };
function getStatColors(key: string, tokens: DesignTokens) {
  const scale = STAT_SCALE[key] ?? 'neutral';
  const s = (tokens.colors as any)[scale];
  return { bg: s[50], text: s[700], border: s[200], dot: s[500] };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function filterAndSortJobs(jobs: DBJob[], filters: JobBoardFilter, searchQuery: string, sortBy: string, sortDirection: SortDirection, clients: { id: string; name: string }[]): DBJob[] {
  let result = [...jobs];
  if (filters.status) result = result.filter(j => j.status === filters.status);
  if (filters.department) result = result.filter(j => (j.departmentName || '') === filters.department);
  if (filters.urgency) result = result.filter(j => (j.hiringUrgency || 'normal') === filters.urgency);
  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    result = result.filter(j =>
      (j.title || '').toLowerCase().includes(lower) ||
      (j.code || j.slug || '').toLowerCase().includes(lower) ||
      (j.departmentName || '').toLowerCase().includes(lower) ||
      getJobLocation(j).toLowerCase().includes(lower)
    );
  }
  result.sort((a, b) => {
    let aVal: number | string = 0, bVal: number | string = 0;
    switch (sortBy) {
      case 'publishedAt': {
        const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        aVal = aDate; bVal = bDate; break;
      }
      case 'totalApplications': aVal = a.totalApplications || 0; bVal = b.totalApplications || 0; break;
      case 'title': aVal = (a.title || '').toLowerCase(); bVal = (b.title || '').toLowerCase(); break;
      case 'hiringUrgency': { const o: Record<string, number> = { low: 0, normal: 1, high: 2, urgent: 3 }; aVal = o[a.hiringUrgency || 'normal'] ?? 1; bVal = o[b.hiringUrgency || 'normal'] ?? 1; break; }
      default: { const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0; const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0; aVal = aDate; bVal = bDate; }
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });
  return result;
}

/* ------------------------------------------------------------------ */
/*  Grid Preset                                                         */
/* ------------------------------------------------------------------ */

export const GridBhJobBoard = createPreset<BhJobBoardProps>({
  name: 'BhJobBoard.Grid',
  render: ({ primitives, props, tokens, engine, ext }: PresetContext<BhJobBoardProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const STATUS_CONFIG = useMemo(() => getStatusConfig(tokens), [tokens]);
    const URGENCY_CONFIG = useMemo(() => getUrgencyConfig(tokens), [tokens]);
    const STAGE_COLORS = useMemo(() => getStageColors(tokens), [tokens]);

    const {
      jobs: rawJobs = [], stats: rawStats = [], filters: controlledFilters, onFilterChange, onViewModeChange, onJobClick, onCreateJob,
      selectedJobs: controlledSelectedJobs, onSelectionChange, searchQuery: controlledSearchQuery, onSearchChange,
      sortBy: controlledSortBy, sortDirection: controlledSortDirection, onSortChange,
      emptyText = BH_JOB_BOARD_DEFAULTS.emptyText, departments: rawDepartments = [], clients: rawClients = [], className, style,
    } = props;

    const jobs = Array.isArray(rawJobs) ? rawJobs : [];
    const stats = Array.isArray(rawStats) ? rawStats : [];
    const departments = Array.isArray(rawDepartments) ? rawDepartments : [];
    const clients = Array.isArray(rawClients) ? rawClients : [];

    // Extension helpers
    const extEmptyState = ext.emptyState();
    const extRowActions = useMemo(() => ext.rowActions(), [ext]);
    const extA11y = ext.a11yConfig();
    const extLayout = ext.layoutConfig();

    const [internalViewMode, setInternalViewMode] = useState<ViewMode>('grid');
    const [internalFilters, setInternalFilters] = useState<JobBoardFilter>({});
    const [internalSortBy, setInternalSortBy] = useState(BH_JOB_BOARD_DEFAULTS.sortBy ?? 'publishedAt');
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(BH_JOB_BOARD_DEFAULTS.sortDirection ?? 'desc');
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedJobs, setInternalSelectedJobs] = useState<string[]>([]);
    const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
    const [showClientDropdown, setShowClientDropdown] = useState(false);

    const filters = controlledFilters ?? internalFilters;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const selectedJobs = controlledSelectedJobs ?? internalSelectedJobs;
    const sortBy = controlledSortBy ?? internalSortBy;
    const sortDirection = controlledSortDirection ?? internalSortDirection;

    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardPadding = useMemo(() => getCardPadding(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);

    const handleFilterChange = useCallback((f: JobBoardFilter) => { if (controlledFilters === undefined) setInternalFilters(f); onFilterChange?.(f); }, [controlledFilters, onFilterChange]);
    const handleSearchChange = useCallback((q: string) => { if (controlledSearchQuery === undefined) setInternalSearchQuery(q); onSearchChange?.(q); }, [controlledSearchQuery, onSearchChange]);
    const handleViewModeChange = useCallback((m: ViewMode) => { setInternalViewMode(m); onViewModeChange?.(m); }, [onViewModeChange]);
    const handleSortChange = useCallback((field: string) => {
      const dir: SortDirection = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
      if (controlledSortBy === undefined) { setInternalSortBy(field); setInternalSortDirection(dir); }
      onSortChange?.(field, dir);
    }, [sortBy, sortDirection, controlledSortBy, onSortChange]);
    const handleSelectionToggle = useCallback((jobId: string) => {
      const next = selectedJobs.includes(jobId) ? selectedJobs.filter(id => id !== jobId) : [...selectedJobs, jobId];
      if (controlledSelectedJobs === undefined) setInternalSelectedJobs(next);
      onSelectionChange?.(next);
    }, [selectedJobs, controlledSelectedJobs, onSelectionChange]);

    const filteredJobs = useMemo(() => filterAndSortJobs(jobs as DBJob[], filters, searchQuery, sortBy, sortDirection, clients), [jobs, filters, searchQuery, sortBy, sortDirection, clients]);
    const hasActiveFilters = !!(searchQuery || filters.status || filters.department || filters.urgency || filters.clientId);

    /* Dropdown renderer */
    const renderDropdown = useCallback((show: boolean, setShow: (v: boolean) => void, otherClose: () => void, label: string, activeValue: string | null | undefined, options: { key: string; label: string }[], onSelect: (v: string | null) => void) => (
      <Box style={{ position: 'relative' as const }}>
        <Box
          role="button" tabIndex={0} aria-label={`Filter by ${label}`} aria-expanded={show}
          onClick={() => { setShow(!show); otherClose(); }}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShow(!show); otherClose(); } }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${activeValue ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`, backgroundColor: activeValue ? tokens.colors.primaryScale[50] : tokens.colors.common.white, color: activeValue ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600], outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}
        >
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: activeValue ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600] }}>{activeValue ?? label}</Text>
          <ChevronDown size={12} />
        </Box>
        {show && (
          <Box style={{ position: 'absolute' as const, top: '100%', left: 0, marginTop: tokens.spacing[2], minWidth: 200, backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.lg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, zIndex: 50, padding: `${tokens.spacing[1]}px 0` }}>
            {[{ key: '__all__', label: `All ${label}s` }, ...options].map(opt => {
              const isActive = opt.key === '__all__' ? !activeValue : activeValue === opt.key;
              return (
                <Box key={opt.key} role="option" aria-selected={isActive} onClick={() => onSelect(opt.key === '__all__' ? null : opt.key)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, fontSize: tokens.typography.fontSize.sm, color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700], backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, fontWeight: isActive ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal, borderRadius: tokens.borderRadius.md, margin: `0 ${tokens.spacing[1]}px` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700] }}>{opt.label}</Text>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    ), [tokens, Box, Text]);

    /* Stats Ribbon */
    const renderStatsRibbon = () => {
      if (!stats.length) return null;
      return (
        <Box style={{ display: 'flex', alignItems: 'stretch', gap: tokens.spacing[3], marginBottom: tokens.spacing[5] }}>
          {stats.map((stat, i) => {
            const kc = getStatColors(stat.key, tokens);
            const isActive = filters.status === stat.key || (stat.key === 'total' && !filters.status);
            const statEntrance = createEntranceAnimation(tokens, { index: i });
            return (
              <Box key={stat.key} role="button" tabIndex={0} aria-label={`Filter by ${stat.label}`} aria-pressed={isActive}
                onClick={() => handleFilterChange({ ...filters, status: stat.key === 'total' ? null : (stat.key === filters.status ? null : stat.key as JobDisplayStatus) })}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...filters, status: stat.key === 'total' ? null : (stat.key === filters.status ? null : stat.key as JobDisplayStatus) }); } }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${tokens.spacing[4]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg, backgroundColor: isActive ? kc.bg : tokens.colors.common.white, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? kc.border : tokens.colors.neutral[100]}`, transition: `all ${tokens.motion.hover}`, boxShadow: isActive ? tokens.shadows.sm : 'none', outline: 'none', ...statEntrance.animate }}>
                <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: typo.headingWeight, color: isActive ? kc.text : tokens.colors.neutral[900], lineHeight: '1' }}>{stat.count}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? kc.text : tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, marginTop: tokens.spacing[2], textTransform: typo.labelTransform, letterSpacing: typo.labelLetterSpacing }}>{stat.label}</Text>
              </Box>
            );
          })}
        </Box>
      );
    };

    /* Filter Bar */
    const renderFilterBar = () => {
      const statusOptions: (string | null)[] = [null, 'published', 'draft', 'pending_approval', 'paused', 'closed'];
      return (
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], paddingBottom: tokens.spacing[4], marginBottom: tokens.spacing[1], flexWrap: 'wrap' as const }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            {statusOptions.map(status => {
              const isActive = filters.status === status || (status === null && !filters.status);
              return (
                <Box key={status ?? 'all'} role="button" tabIndex={0} aria-label={`Filter ${status ?? 'all'}`} aria-pressed={isActive}
                  onClick={() => handleFilterChange({ ...filters, status: status as JobDisplayStatus | null })}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...filters, status: status as JobDisplayStatus | null }); } }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[100], color: isActive ? tokens.colors.common.white : tokens.colors.neutral[600], outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
                  {status !== null && <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: isActive ? tokens.colors.common.white : (STATUS_CONFIG[status] || DEFAULT_STATUS_CFG).dotColor, flexShrink: 0, opacity: isActive ? 0.8 : 1 }} />}
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? tokens.colors.common.white : tokens.colors.neutral[600] }}>{status === null ? 'All' : (STATUS_CONFIG[status] || DEFAULT_STATUS_CFG).label}</Text>
                </Box>
              );
            })}
          </Box>

          {departments.length > 0 && renderDropdown(showDepartmentDropdown, setShowDepartmentDropdown, () => setShowClientDropdown(false), 'Department', filters.department, departments.map(d => ({ key: d, label: d })), (v) => { handleFilterChange({ ...filters, department: v }); setShowDepartmentDropdown(false); })}
          {clients.length > 0 && renderDropdown(showClientDropdown, setShowClientDropdown, () => setShowDepartmentDropdown(false), 'Client', filters.clientId ? (clients.find(c => c.id === filters.clientId)?.name ?? null) : null, clients.map(c => ({ key: c.id, label: c.name })), (v) => { handleFilterChange({ ...filters, clientId: v }); setShowClientDropdown(false); })}

          <Box style={{ flex: 1 }} />

          {/* Search */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.lg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, minWidth: 220, transition: `all ${tokens.motion.hover}` }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0, fontFamily: 'inherit' }} />
            {searchQuery && <Box role="button" tabIndex={0} aria-label="Clear search" onClick={() => handleSearchChange('')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSearchChange(''); } }} style={{ cursor: 'pointer', display: 'flex', outline: 'none' }}><X size={13} color={tokens.colors.neutral[400]} /></Box>}
          </Box>

          {/* Sort */}
          <Box role="button" tabIndex={0} aria-label={`Sort by ${sortDirection === 'asc' ? 'oldest' : 'newest'}`}
            onClick={() => handleSortChange(sortBy)}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSortChange(sortBy); } }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
            <ArrowUpDown size={12} />
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{sortDirection === 'asc' ? 'Oldest' : 'Newest'}</Text>
          </Box>

          {/* View Toggle */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[0], padding: tokens.spacing[1], borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.neutral[100] }}>
            {([{ mode: 'grid' as ViewMode, icon: <LayoutGrid size={14} /> }, { mode: 'table' as ViewMode, icon: <List size={14} /> }, { mode: 'kanban' as ViewMode, icon: <Columns3 size={14} /> }]).map(({ mode, icon }) => (
              <Box key={mode} role="button" tabIndex={0} aria-label={`${mode} view`} aria-pressed={mode === internalViewMode}
                onClick={() => handleViewModeChange(mode)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewModeChange(mode); } }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, borderRadius: tokens.borderRadius.md, backgroundColor: mode === internalViewMode ? tokens.colors.common.white : 'transparent', color: mode === internalViewMode ? tokens.colors.neutral[900] : tokens.colors.neutral[500], transition: `all ${tokens.motion.hover}`, outline: 'none', boxShadow: mode === internalViewMode ? tokens.shadows.sm : 'none', fontFamily: 'inherit' }}>
                {icon}
              </Box>
            ))}
          </Box>
        </Box>
      );
    };

    /* Job Card */
    const renderJobCard = useCallback((job: DBJob, index: number) => {
      const statusCfg = STATUS_CONFIG[job.status] || DEFAULT_STATUS_CFG;
      const urgencyCfg = URGENCY_CONFIG[job.hiringUrgency || 'normal'] || DEFAULT_URGENCY_CFG;
      const daysOpen = getJobDaysOpen(job);
      const location = getJobLocation(job);
      const isRemote = job.workMode === 'remote';
      const isHovered = hoveredJobId === job.id;
      const isSelected = selectedJobs.includes(job.id);
      const itemEntrance = createEntranceAnimation(tokens, { index });

      return (
        <Box key={job.id}
          role="button" tabIndex={0} aria-label={`${job.title} - ${statusCfg.label}`}
          onClick={() => onJobClick?.(job.id)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onJobClick?.(job.id); } }}
          onMouseEnter={() => setHoveredJobId(job.id)} onMouseLeave={() => setHoveredJobId(null)}
          style={{
            ...cardBase, padding: cardPadding,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`,
            boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
            transition: `all ${tokens.motion.hover}`,
            transform: isHovered ? 'translateY(-2px)' : 'none',
            position: 'relative' as const, outline: 'none',
            ...itemEntrance.animate,
          }}>

          {/* Top row */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: badgeRadius, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: statusCfg.bgColor, color: statusCfg.color, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}` }}>
              <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: statusCfg.dotColor }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: statusCfg.color }}>{statusCfg.label}</Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium, backgroundColor: urgencyCfg.bgColor, color: urgencyCfg.color, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${urgencyCfg.borderColor}` }}>
                <AlertCircle size={10} /><Text style={{ fontSize: '10px', color: urgencyCfg.color }}>{urgencyCfg.label}</Text>
              </Box>
              <Box role="checkbox" tabIndex={0} aria-checked={isSelected} aria-label={`Select ${job.title}`}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelectionToggle(job.id); }}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); handleSelectionToggle(job.id); } }}
                style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`, backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `all ${tokens.motion.hover}`, flexShrink: 0, outline: 'none' }}>
                {isSelected && <Check size={11} color={tokens.colors.common.white} />}
              </Box>
            </Box>
          </Box>

          {/* Title + code */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], marginBottom: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight, marginBottom: tokens.spacing[1] }}>{job.title}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>{job.code || job.slug}{job.departmentName ? ` - ${job.departmentName}` : ''}</Text>
          </Box>

          {/* Work Mode Badge */}
          {job.workMode && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium, backgroundColor: job.workMode === 'remote' ? tokens.colors.infoScale[50] : job.workMode === 'hybrid' ? tokens.colors.warningScale[50] : tokens.colors.neutral[50], color: job.workMode === 'remote' ? tokens.colors.infoScale[700] : job.workMode === 'hybrid' ? tokens.colors.warningScale[700] : tokens.colors.neutral[700], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${job.workMode === 'remote' ? tokens.colors.infoScale[200] : job.workMode === 'hybrid' ? tokens.colors.warningScale[200] : tokens.colors.neutral[200]}` }}>
                <Globe size={10} />
                <Text style={{ fontSize: '10px', color: 'inherit' }}>{job.workMode === 'remote' ? 'Remote' : job.workMode === 'hybrid' ? 'Hybrid' : 'On-site'}</Text>
              </Box>
              {(job.salaryMin || job.salaryMax) && (
                <Text style={{ fontSize: '10px', color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>
                  {job.salaryCurrency || 'USD'} {job.salaryMin ? `${(job.salaryMin / 1000).toFixed(0)}k` : '?'} - {job.salaryMax ? `${(job.salaryMax / 1000).toFixed(0)}k` : '?'}
                </Text>
              )}
            </Box>
          )}

          {/* Location */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[4] }}>
            {isRemote ? <><Globe size={12} color={tokens.colors.neutral[500]} /><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Remote</Text></> : location ? <><MapPin size={12} color={tokens.colors.neutral[500]} /><Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{location}</Text></> : null}
            {job.teamName && <>
              <Text style={{ color: tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.xs }}>-</Text>
              <Building2 size={11} color={tokens.colors.neutral[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{job.teamName}</Text>
            </>}
          </Box>

          {/* Candidate progress */}
          <Box style={{ marginBottom: tokens.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Users size={12} color={tokens.colors.neutral[600]} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium }}>{job.totalApplications || 0} candidates</Text>
              </Box>
            </Box>
            {/* SVG progress bar - allowed */}
            {(() => {
              const stages = ((job as any).candidatesByStage || []) as { stage: string; count: number }[];
              const total = stages.reduce((sum: number, s: { count: number }) => sum + (s.count || 0), 0);
              if (total === 0) return <Box style={{ height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], width: '100%' }} />;
              const W = 200, H = 6;
              let x = 0;
              return (
                <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const, display: 'block' }}>
                  <rect x={0} y={0} width={W} height={H} fill={tokens.colors.neutral[100]} rx={3} />
                  {stages.map((stage: { stage: string; count: number }, idx: number) => { const w = ((stage.count || 0) / total) * W; const cx = x; x += w; return <rect key={stage.stage} x={cx} y={0} width={w} height={H} fill={STAGE_COLORS[idx % STAGE_COLORS.length]} rx={idx === 0 ? 3 : 0} />; })}
                </svg>
              );
            })()}
            <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2], marginTop: tokens.spacing[2] }}>
              {(((job as any).candidatesByStage || []) as { stage: string; count: number }[]).map((stage: { stage: string; count: number }, idx: number) => (
                <Box key={stage.stage} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length], flexShrink: 0 }} />
                  <Text style={{ fontSize: '10px', color: tokens.colors.neutral[500] }}>{stage.stage} ({stage.count})</Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Bottom: days + avatars + actions */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[4], paddingTop: tokens.spacing[4], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Clock size={12} color={daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500]} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>{daysOpen}d open</Text>
              </Box>
              {/* Avatar stack */}
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                {(((job as any).recruiterAvatars || []) as string[]).slice(0, 3).map((avatar: string, idx: number) => (
                  <Box key={idx} style={{
                    width: 26, height: 26, borderRadius: tokens.borderRadius.full,
                    border: `2px solid ${tokens.colors.common.white}`,
                    marginLeft: idx > 0 ? -8 : 0,
                    backgroundColor: tokens.colors.primaryScale[100],
                    backgroundImage: avatar ? `url(${avatar})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative' as const, zIndex: 3 - idx,
                  }}>
                    {!avatar && <Users size={11} color={tokens.colors.primaryScale[600]} />}
                  </Box>
                ))}
                {(((job as any).recruiterAvatars || []) as string[]).length > 3 && (
                  <Box style={{ width: 26, height: 26, borderRadius: tokens.borderRadius.full, border: `2px solid ${tokens.colors.common.white}`, marginLeft: -8, backgroundColor: tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const, zIndex: 0 }}>
                    <Text style={{ fontSize: '9px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }}>+{(((job as any).recruiterAvatars || []) as string[]).length - 3}</Text>
                  </Box>
                )}
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], opacity: isHovered ? 1 : 0, transition: `opacity ${tokens.motion.hover}` }}>
              {[
                { icon: <Eye size={13} />, label: 'View job', onClick: (e: React.MouseEvent) => { e.stopPropagation(); onJobClick?.(job.id); } },
                { icon: <Pencil size={13} />, label: 'Edit job', onClick: (e: React.MouseEvent) => { e.stopPropagation(); } },
                { icon: job.status === 'paused' ? <Play size={13} /> : <Pause size={13} />, label: job.status === 'paused' ? 'Resume' : 'Pause', onClick: (e: React.MouseEvent) => { e.stopPropagation(); } },
              ].map((act, i) => (
                <Box key={i} role="button" tabIndex={0} aria-label={act.label}
                  onClick={act.onClick}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act.onClick(e as any); } }}
                  style={{ ...animStyle(i), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], transition: `all ${tokens.motion.hover}`, outline: 'none' }}>
                  {act.icon}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    }, [cardBase, cardPadding, tokens, typo, badgeRadius, hoveredJobId, selectedJobs, STATUS_CONFIG, URGENCY_CONFIG, STAGE_COLORS, handleSelectionToggle, onJobClick, Box, Text]);

    /* Empty state - supports extension override */
    const renderEmptyState = () => {
      const customEmpty = extEmptyState;
      return (
        <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '64px 32px', textAlign: 'center' as const }}>
          {customEmpty?.icon || (
            <Box style={createIconContainerStyle(tokens, { size: 72, color: tokens.colors.primaryScale[50] })}>
              <Briefcase size={30} color={tokens.colors.primaryScale[400]} />
            </Box>
          )}
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: typo.headingWeight, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[2], marginTop: tokens.spacing[5] }}>{customEmpty?.title || (hasActiveFilters ? emptyText : 'No jobs yet')}</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[6], maxWidth: 380, lineHeight: tokens.typography.lineHeight.relaxed }}>{customEmpty?.description || (hasActiveFilters ? 'Try adjusting your filters or search query to find what you are looking for.' : 'Create your first job posting to start attracting candidates and filling positions.')}</Text>
          {customEmpty?.action ? (
            <Box role="button" tabIndex={0} aria-label={customEmpty.action.label}
              onClick={customEmpty.action.onClick}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); customEmpty.action!.onClick(); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
              <Plus size={16} color={tokens.colors.common.white} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>{customEmpty.action.label}</Text>
            </Box>
          ) : onCreateJob && (
            <Box role="button" tabIndex={0} aria-label="Create your first job"
              onClick={onCreateJob}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCreateJob(); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
              <Plus size={16} color={tokens.colors.common.white} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>Create your first job</Text>
            </Box>
          )}
        </Box>
      );
    };

    /* Header */
    const renderHeader = () => (
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[6] }}>
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight }}>Jobs</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500]}}>Manage and track all your open positions</Text>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {selectedJobs.length > 0 && (
            <Box style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: 'inherit' }}>{selectedJobs.length} selected</Text>
            </Box>
          )}
          {onCreateJob && (
            <Box role="button" tabIndex={0} aria-label="Create new job"
              onClick={onCreateJob}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCreateJob(); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
              <Plus size={16} color={tokens.colors.common.white} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>New Job</Text>
            </Box>
          )}
        </Box>
      </Box>
    );

    const gridCols = extLayout.gridColumns?.desktop ?? 3;

    return (
      <Box className={className} style={{ padding: tokens.spacing[7], backgroundColor: tokens.colors.neutral[50], minHeight: '100%', width: '100%', fontFamily: 'inherit', ...entrance.animate, transition: entrance.transition, ...style }}
        {...(extA11y.ariaLabel ? { 'aria-label': extA11y.ariaLabel } : {})}>
        {accentBar && <Box style={accentBar} />}
        {ext.slot('header:start')}
        {ext.section('header', renderHeader)}
        {ext.slot('header:end')}
        {renderStatsRibbon()}
        {ext.slot('toolbar:start')}
        {ext.section('toolbar', renderFilterBar)}
        {ext.slot('toolbar:end')}
        {filteredJobs.length === 0 ? (ext.hasSlot('empty') ? ext.slot('empty') : renderEmptyState()) : (
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: typeof extLayout.gap === 'number' ? extLayout.gap : tokens.spacing[4] }}>
            {filteredJobs.map((job, i) => renderJobCard(job, i))}
          </Box>
        )}
        {ext.slot('footer')}
      </Box>
    );
  },
});
