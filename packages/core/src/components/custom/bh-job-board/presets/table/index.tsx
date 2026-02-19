'use client';

/**
 * BhJobBoard - Table Preset
 * Slite-inspired sortable data table with inline status badges, sparkline for
 * candidate trends, warm neutral palette, and generous whitespace.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle, createCardStyle, createSurfaceStyle, createHoverStyle,
  createEntranceAnimation, createStaggerDelay,
  createCardHoverStyles, createIconContainerStyle,
  getPersonalityTypography, getPersonalityBadgeRadius, getCardPadding,
  createPersonalityAccentBar,

  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhJobBoardProps, JobItem, JobStatus, JobUrgency, JobBoardFilter, ViewMode, SortDirection } from '../../core';
import { BH_JOB_BOARD_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import type { ResolvedColumn, ActionDefinition } from '../../../../../core/types/extensions';
import {
  Briefcase, Plus, Search, LayoutGrid, List, Columns3, MapPin, Clock,
  Users, Eye, X, ChevronDown, ChevronUp, Globe, ChevronsUpDown,
  MoreHorizontal, Building2, Check,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Config lookups                                                      */
/* ------------------------------------------------------------------ */

interface StatusConfig { label: string; color: string; bgColor: string; borderColor: string; dotColor: string }
interface UrgencyConfig { label: string; color: string; bgColor: string; borderColor: string }

function getStatusConfig(tokens: DesignTokens): Record<JobStatus, StatusConfig> {
  return {
    published: { label: 'Published', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200], dotColor: tokens.colors.successScale[500] },
    draft: { label: 'Draft', color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], borderColor: tokens.colors.neutral[200], dotColor: tokens.colors.neutral[400] },
    paused: { label: 'Paused', color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], borderColor: tokens.colors.warningScale[200], dotColor: tokens.colors.warningScale[500] },
    closed: { label: 'Closed', color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200], dotColor: tokens.colors.errorScale[500] },
  };
}

function getUrgencyConfig(tokens: DesignTokens): Record<JobUrgency, UrgencyConfig> {
  return {
    low: { label: 'Low', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200] },
    medium: { label: 'Medium', color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], borderColor: tokens.colors.infoScale[200] },
    high: { label: 'High', color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], borderColor: tokens.colors.warningScale[200] },
    critical: { label: 'Critical', color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200] },
  };
}

/* ------------------------------------------------------------------ */
/*  Column config                                                       */
/* ------------------------------------------------------------------ */

interface TableColumn { key: string; label: string; width?: string | number; sortable?: boolean; align?: 'left' | 'center' | 'right' }

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'select', label: '', width: 40, sortable: false, align: 'center' },
  { key: 'title', label: 'Job Title', sortable: true },
  { key: 'status', label: 'Status', width: 120, sortable: true },
  { key: 'department', label: 'Department', width: 140, sortable: true },
  { key: 'urgency', label: 'Urgency', width: 100, sortable: true },
  { key: 'candidateCount', label: 'Candidates', width: 130, sortable: true, align: 'center' },
  { key: 'daysOpen', label: 'Days Open', width: 100, sortable: true, align: 'center' },
  { key: 'location', label: 'Location', width: 150, sortable: true },
  { key: 'recruiters', label: 'Recruiters', width: 100, sortable: false, align: 'center' },
  { key: 'actions', label: '', width: 80, sortable: false, align: 'center' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function filterAndSortJobs(jobs: JobItem[], filters: JobBoardFilter, searchQuery: string, sortBy: string, sortDirection: SortDirection, clients: { id: string; name: string }[]): JobItem[] {
  let result = [...jobs];
  if (filters.status) result = result.filter(j => j.status === filters.status);
  if (filters.department) result = result.filter(j => j.department === filters.department);
  if (filters.urgency) result = result.filter(j => j.urgency === filters.urgency);
  if (filters.clientId) result = result.filter(j => j.clientName === clients.find(c => c.id === filters.clientId)?.name);
  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    result = result.filter(j => (j.title || '').toLowerCase().includes(lower) || (j.code || '').toLowerCase().includes(lower) || (j.department || '').toLowerCase().includes(lower) || (j.location || '').toLowerCase().includes(lower) || (j.clientName && j.clientName.toLowerCase().includes(lower)));
  }
  result.sort((a, b) => {
    let aVal: number | string = 0, bVal: number | string = 0;
    switch (sortBy) {
      case 'daysOpen': aVal = a.daysOpen; bVal = b.daysOpen; break;
      case 'candidateCount': aVal = a.candidateCount; bVal = b.candidateCount; break;
      case 'title': aVal = (a.title || '').toLowerCase(); bVal = (b.title || '').toLowerCase(); break;
      case 'department': aVal = (a.department || '').toLowerCase(); bVal = (b.department || '').toLowerCase(); break;
      case 'status': aVal = a.status; bVal = b.status; break;
      case 'location': aVal = (a.location || '').toLowerCase(); bVal = (b.location || '').toLowerCase(); break;
      case 'urgency': { const o: Record<JobUrgency, number> = { low: 0, medium: 1, high: 2, critical: 3 }; aVal = o[a.urgency]; bVal = o[b.urgency]; break; }
      default: aVal = a.daysOpen; bVal = b.daysOpen;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });
  return result;
}

/* ------------------------------------------------------------------ */
/*  Table Preset                                                        */
/* ------------------------------------------------------------------ */

export const TableBhJobBoard = createPreset<BhJobBoardProps>({
  name: 'BhJobBoard.Table',
  render: ({ primitives, props, tokens, engine, ext }: PresetContext<BhJobBoardProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const STATUS_CONFIG = useMemo(() => getStatusConfig(tokens), [tokens]);
    const URGENCY_CONFIG = useMemo(() => getUrgencyConfig(tokens), [tokens]);

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

    // Resolve columns with extensions (extra, hidden, order, overrides)
    const resolvedColumns = useMemo(() => ext.columns(TABLE_COLUMNS), [ext]);
    // Merge toolbar/row actions from extensions
    const extToolbarActions = useMemo(() => ext.toolbarActions(), [ext]);
    const extRowActions = useMemo(() => ext.rowActions(), [ext]);
    // Extension-provided empty state
    const extEmptyState = ext.emptyState();
    // Extension-provided accessibility config
    const extA11y = ext.a11yConfig();

    const [internalFilters, setInternalFilters] = useState<JobBoardFilter>({});
    const [internalSortBy, setInternalSortBy] = useState(BH_JOB_BOARD_DEFAULTS.sortBy ?? 'daysOpen');
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(BH_JOB_BOARD_DEFAULTS.sortDirection ?? 'desc');
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedJobs, setInternalSelectedJobs] = useState<string[]>([]);
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

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
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);

    const handleFilterChange = useCallback((f: JobBoardFilter) => { if (controlledFilters === undefined) setInternalFilters(f); onFilterChange?.(f); }, [controlledFilters, onFilterChange]);
    const handleSearchChange = useCallback((q: string) => { if (controlledSearchQuery === undefined) setInternalSearchQuery(q); onSearchChange?.(q); }, [controlledSearchQuery, onSearchChange]);
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

    const filteredJobs = useMemo(() => filterAndSortJobs(jobs as JobItem[], filters, searchQuery, sortBy, sortDirection, clients), [jobs, filters, searchQuery, sortBy, sortDirection, clients]);

    const handleSelectAll = useCallback(() => {
      const allIds = filteredJobs.map(j => j.id);
      const next = allIds.every(id => selectedJobs.includes(id)) ? [] : allIds;
      if (controlledSelectedJobs === undefined) setInternalSelectedJobs(next);
      onSelectionChange?.(next);
    }, [filteredJobs, selectedJobs, controlledSelectedJobs, onSelectionChange]);

    /* Sparkline (SVG allowed) */
    const renderSparkline = (job: JobItem) => {
      const stages = job.candidatesByStage || [];
      if (!stages.length) return null;
      const max = Math.max(...stages.map(s => s.count), 1);
      const w = 60, h = 20;
      const step = stages.length > 1 ? w / (stages.length - 1) : w;
      const pts = stages.map((s, i) => `${stages.length > 1 ? i * step : w / 2},${h - (s.count / max) * (h - 4) - 2}`).join(' ');
      const lastX = stages.length > 1 ? (stages.length - 1) * step : w / 2;
      const lastY = h - (stages[stages.length - 1].count / max) * (h - 4) - 2;
      return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
          <polyline points={pts} fill="none" stroke={tokens.colors.primaryScale[400]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastX} cy={lastY} r={2.5} fill={tokens.colors.primaryScale[500]} />
        </svg>
      );
    };

    const renderSortIcon = (key: string) => {
      if (sortBy !== key) return <ChevronsUpDown size={12} color={tokens.colors.neutral[300]} />;
      return sortDirection === 'asc' ? <ChevronUp size={12} color={tokens.colors.primaryScale[500]} /> : <ChevronDown size={12} color={tokens.colors.primaryScale[500]} />;
    };

    const allSelected = filteredJobs.length > 0 && filteredJobs.every(j => selectedJobs.includes(j.id));

    /* Checkbox */
    const CheckboxBox = useCallback(({ checked, onClick, label }: { checked: boolean; onClick?: (e: React.MouseEvent) => void; label: string }) => (
      <Box role="checkbox" tabIndex={0} aria-checked={checked} aria-label={label}
        onClick={onClick}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e as any); } }}
        style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${checked ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`, backgroundColor: checked ? tokens.colors.primaryScale[500] : tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `all ${tokens.motion.hover}`, flexShrink: 0, outline: 'none' }}>
        {checked && <Check size={10} color={tokens.colors.common.white} />}
      </Box>
    ), [tokens, Box]);

    /* Header */
    const renderHeader = () => (
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight }}>Jobs</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500]}}>Manage and track all your open positions</Text>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {/* View toggle */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[0], padding: tokens.spacing[1], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100] }}>
            {([{ mode: 'grid' as ViewMode, icon: <LayoutGrid size={14} /> }, { mode: 'table' as ViewMode, icon: <List size={14} /> }, { mode: 'kanban' as ViewMode, icon: <Columns3 size={14} /> }]).map(({ mode, icon }) => (
              <Box key={mode} role="button" tabIndex={0} aria-label={`${mode} view`} aria-pressed={mode === 'table'}
                onClick={() => onViewModeChange?.(mode)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewModeChange?.(mode); } }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 26, borderRadius: tokens.borderRadius.sm, backgroundColor: mode === 'table' ? tokens.colors.common.white : 'transparent', color: mode === 'table' ? tokens.colors.neutral[900] : tokens.colors.neutral[500], transition: `all ${tokens.motion.hover}`, outline: 'none', boxShadow: mode === 'table' ? tokens.shadows.sm : 'none', fontFamily: 'inherit' }}>
                {icon}
              </Box>
            ))}
          </Box>
          {onCreateJob && (
            <Box role="button" tabIndex={0} aria-label="Create new job" onClick={onCreateJob}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCreateJob(); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
              <Plus size={16} color={tokens.colors.common.white} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>New Job</Text>
            </Box>
          )}
        </Box>
      </Box>
    );

    /* Toolbar */
    const renderToolbar = () => {
      const statusOptions: (JobStatus | null)[] = [null, 'published', 'draft', 'paused', 'closed'];
      return (
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, backgroundColor: tokens.colors.common.white, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, flexWrap: 'wrap' as const }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[0], padding: tokens.spacing[1], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100] }}>
            {statusOptions.map((status) => {
              const isActive = filters.status === status || (status === null && !filters.status);
              return (
                <Box key={status ?? 'all'} role="button" tabIndex={0} aria-label={`Filter ${status ?? 'all'}`} aria-pressed={isActive}
                  onClick={() => handleFilterChange({ ...filters, status })}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...filters, status }); } }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium, backgroundColor: isActive ? tokens.colors.common.white : 'transparent', color: isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[500], transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit', boxShadow: isActive ? tokens.shadows.sm : 'none' }}>
                  {status !== null && <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: (STATUS_CONFIG[status] || STATUS_CONFIG.draft).dotColor, flexShrink: 0 }} />}
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[500] }}>{status === null ? 'All' : (STATUS_CONFIG[status] || STATUS_CONFIG.draft).label}</Text>
                </Box>
              );
            })}
          </Box>

          {departments.length > 0 && (
            <Box style={{ position: 'relative' as const }}>
              <Box role="button" tabIndex={0} aria-label="Filter by department" aria-expanded={showDepartmentDropdown}
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDepartmentDropdown(!showDepartmentDropdown); } }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filters.department ? tokens.colors.primaryScale[200] : tokens.colors.neutral[100]}`, backgroundColor: filters.department ? tokens.colors.primaryScale[50] : tokens.colors.common.white, color: filters.department ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600], outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: filters.department ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600] }}>{filters.department ?? 'Department'}</Text>
                <ChevronDown size={12} />
              </Box>
              {showDepartmentDropdown && (
                <Box style={{ position: 'absolute' as const, top: '100%', left: 0, marginTop: tokens.spacing[1], minWidth: 180, backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.lg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, zIndex: 50, padding: `${tokens.spacing[1]}px 0` }}>
                  {[null, ...departments].map(dept => {
                    const isActive = dept === null ? !filters.department : filters.department === dept;
                    return (
                      <Box key={dept ?? 'all'} role="option" aria-selected={isActive}
                        onClick={() => { handleFilterChange({ ...filters, department: dept }); setShowDepartmentDropdown(false); }}
                        style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700], backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, fontFamily: 'inherit' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700] }}>{dept ?? 'All Departments'}</Text>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}

          <Box style={{ flex: 1 }} />

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.common.white, minWidth: 200 }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0, fontFamily: 'inherit' }} />
            {searchQuery && <Box role="button" tabIndex={0} aria-label="Clear search" onClick={() => handleSearchChange('')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSearchChange(''); } }} style={{ display: 'flex', cursor: 'pointer', outline: 'none' }}><X size={12} color={tokens.colors.neutral[400]} /></Box>}
          </Box>

          {selectedJobs.length > 0 && (
            <Box style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: badgeRadius, backgroundColor: tokens.colors.primaryScale[600], display: 'inline-flex', alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>{selectedJobs.length} selected</Text>
            </Box>
          )}
        </Box>
      );
    };

    /* Table header - uses resolved columns (merged with extensions) */
    const renderTableHeader = () => (
      <Box style={{ display: 'flex', alignItems: 'center', padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`, backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
        {resolvedColumns.map(col => (
          <Box key={col.key}
            role={col.sortable ? 'button' : undefined}
            tabIndex={col.sortable ? 0 : undefined}
            aria-label={col.sortable ? `Sort by ${col.label}` : undefined}
            onClick={() => col.sortable && handleSortChange(col.key)}
            onKeyDown={col.sortable ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSortChange(col.key); } } : undefined}
            style={{ flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : '1', display: 'flex', alignItems: 'center', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, userSelect: 'none' as const, outline: 'none' }}>
            {col.key === 'select'
              ? <CheckboxBox checked={allSelected} onClick={(e) => { e.stopPropagation(); handleSelectAll(); }} label="Select all" />
              : col.renderHeader
                ? col.renderHeader()
                : <>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: typo.labelTransform, letterSpacing: typo.labelLetterSpacing }}>{col.label}</Text>
                    {col.sortable && renderSortIcon(col.key)}
                  </>
            }
          </Box>
        ))}
      </Box>
    );

    /* Default cell renderer for known column keys */
    const renderDefaultCell = (col: ResolvedColumn, job: JobItem) => {
      const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;
      const urgencyCfg = URGENCY_CONFIG[job.urgency] || URGENCY_CONFIG.medium;
      const cellPad = `0 ${tokens.spacing[2]}px`;

      switch (col.key) {
        case 'select':
          return (
            <Box style={{ flex: '0 0 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: cellPad }}>
              <CheckboxBox checked={selectedJobs.includes(job.id)} onClick={(e) => { e.stopPropagation(); handleSelectionToggle(job.id); }} label={`Select ${job.title}`} />
            </Box>
          );
        case 'title':
          return (
            <Box style={{ flex: 1, padding: cellPad, overflow: 'hidden' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{job.title}</Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{job.code}</Text>
                {job.clientName && <>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[300] }}>-</Text>
                  <Building2 size={10} color={tokens.colors.neutral[400]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{job.clientName}</Text>
                </>}
              </Box>
            </Box>
          );
        case 'status':
          return (
            <Box style={{ flex: '0 0 120px', padding: cellPad }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: badgeRadius, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: statusCfg.bgColor, color: statusCfg.color, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}` }}>
                <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: statusCfg.dotColor }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: statusCfg.color }}>{statusCfg.label}</Text>
              </Box>
            </Box>
          );
        case 'department':
          return (
            <Box style={{ flex: '0 0 140px', padding: cellPad, overflow: 'hidden' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{job.department}</Text>
            </Box>
          );
        case 'urgency':
          return (
            <Box style={{ flex: '0 0 100px', padding: cellPad }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: badgeRadius, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: urgencyCfg.bgColor, color: urgencyCfg.color, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${urgencyCfg.borderColor}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: urgencyCfg.color }}>{urgencyCfg.label}</Text>
              </Box>
            </Box>
          );
        case 'candidateCount':
          return (
            <Box style={{ flex: '0 0 130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[2], padding: cellPad }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{job.candidateCount}</Text>
              {renderSparkline(job)}
            </Box>
          );
        case 'daysOpen':
          return (
            <Box style={{ flex: '0 0 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: cellPad }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Clock size={12} color={job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[600]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[600] }}>{job.daysOpen}d</Text>
              </Box>
            </Box>
          );
        case 'location':
          return (
            <Box style={{ flex: '0 0 150px', padding: cellPad, display: 'flex', alignItems: 'center', gap: tokens.spacing[1], overflow: 'hidden' as const }}>
              {job.isRemote ? <><Globe size={12} color={tokens.colors.neutral[600]} /><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Remote</Text></> : <><MapPin size={12} color={tokens.colors.neutral[600]} /><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{job.location}</Text></>}
            </Box>
          );
        case 'recruiters':
          return (
            <Box style={{ flex: '0 0 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: cellPad }}>
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                {(job.recruiterAvatars || []).slice(0, 3).map((avatar, idx) => (
                  <Box key={idx} style={{ ...animStyle(idx), width: 22, height: 22, borderRadius: tokens.borderRadius.full, border: `2px solid ${tokens.colors.common.white}`, backgroundColor: tokens.colors.primaryScale[100], backgroundImage: avatar ? `url(${avatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', marginLeft: idx > 0 ? -6 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const, zIndex: 3 - idx }}>
                    {!avatar && <Users size={9} color={tokens.colors.primaryScale[600]} />}
                  </Box>
                ))}
                {(job.recruiterAvatars || []).length > 3 && (
                  <Box style={{ width: 22, height: 22, borderRadius: tokens.borderRadius.full, border: `2px solid ${tokens.colors.common.white}`, backgroundColor: tokens.colors.neutral[100], marginLeft: -6, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const, zIndex: 0 }}>
                    <Text style={{ fontSize: '9px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }}>+{(job.recruiterAvatars || []).length - 3}</Text>
                  </Box>
                )}
              </Box>
            </Box>
          );
        case 'actions':
          return null; // Handled separately
        default:
          return null;
      }
    };

    /* Table row - renders resolved columns including extra/overridden ones */
    const renderTableRow = (job: JobItem) => {
      const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;
      const isHovered = hoveredRowId === job.id;
      const isSelected = selectedJobs.includes(job.id);
      const cellPad = `0 ${tokens.spacing[2]}px`;

      // Merge extension row actions with defaults
      const allRowActions = extRowActions;

      return (
        <Box key={job.id} role="row" tabIndex={0} aria-label={`${job.title} - ${statusCfg.label}`} aria-selected={isSelected}
          onClick={() => onJobClick?.(job.id)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onJobClick?.(job.id); } }}
          onMouseEnter={() => setHoveredRowId(job.id)} onMouseLeave={() => setHoveredRowId(null)}
          style={{ display: 'flex', alignItems: 'center', padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, backgroundColor: isSelected ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, transition: `all ${tokens.motion.hover}`, outline: 'none' }}>
          {resolvedColumns.map(col => {
            if (col.key === 'actions') {
              return (
                <Box key="actions" style={{ flex: '0 0 80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1], opacity: isHovered ? 1 : 0, transition: `opacity ${tokens.motion.hover}`, padding: cellPad }}>
                  <Box role="button" tabIndex={0} aria-label="View job" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onJobClick?.(job.id); }}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onJobClick?.(job.id); } }}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], transition: `all ${tokens.motion.hover}`, outline: 'none' }}>
                    <Eye size={12} />
                  </Box>
                  {allRowActions.length > 0 ? (
                    allRowActions.slice(0, 2).map(action => (
                      <Box key={action.key} role="button" tabIndex={0} aria-label={action.label}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); action.onClick(job as any, e); }}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); action.onClick(job as any); } }}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.common.white, color: action.variant === 'danger' ? tokens.colors.errorScale[600] : tokens.colors.neutral[600], transition: `all ${tokens.motion.hover}`, outline: 'none' }}>
                        {action.icon || <MoreHorizontal size={12} />}
                      </Box>
                    ))
                  ) : (
                    <Box role="button" tabIndex={0} aria-label="More actions" onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); } }}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], transition: `all ${tokens.motion.hover}`, outline: 'none' }}>
                      <MoreHorizontal size={12} />
                    </Box>
                  )}
                </Box>
              );
            }

            // Extra column from extensions - use its render function
            if (col._isExtra && col.render) {
              return (
                <Box key={col.key} style={{ flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : '1', display: 'flex', alignItems: 'center', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start', padding: cellPad, overflow: 'hidden' as const }}>
                  {col.render(job as any, filteredJobs.indexOf(job))}
                </Box>
              );
            }

            // Default column with render override
            if (col._renderOverride) {
              return (
                <Box key={col.key} style={{ flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : '1', display: 'flex', alignItems: 'center', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start', padding: cellPad, overflow: 'hidden' as const }}>
                  {col._renderOverride((job as any)[col.key], job as any, filteredJobs.indexOf(job))}
                </Box>
              );
            }

            // Default cell renderer
            const defaultCell = renderDefaultCell(col, job);
            if (defaultCell !== null) return <React.Fragment key={col.key}>{defaultCell}</React.Fragment>;

            return null;
          })}
        </Box>
      );
    };

    /* Empty state - supports extension override */
    const renderEmptyState = () => {
      const customEmpty = extEmptyState;
      return (
        <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`, textAlign: 'center' as const, backgroundColor: tokens.colors.common.white }}>
          {customEmpty?.icon || (
            <Box style={createIconContainerStyle(tokens, { size: 56, color: tokens.colors.primaryScale[50] })}>
              <Briefcase size={24} color={tokens.colors.primaryScale[400]} />
            </Box>
          )}
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: typo.headingWeight, color: tokens.colors.neutral[800], marginBottom: tokens.spacing[2], marginTop: tokens.spacing[4] }}>{customEmpty?.title || emptyText}</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[5], maxWidth: 320 }}>{customEmpty?.description || 'Try adjusting your filters or search query.'}</Text>
          {customEmpty?.action ? (
            <Box role="button" tabIndex={0} aria-label={customEmpty.action.label} onClick={customEmpty.action.onClick}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); customEmpty.action!.onClick(); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
              <Plus size={16} color={tokens.colors.common.white} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.common.white }}>{customEmpty.action.label}</Text>
            </Box>
          ) : onCreateJob && (
            <Box role="button" tabIndex={0} aria-label="Create job" onClick={onCreateJob}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCreateJob(); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
              <Plus size={16} color={tokens.colors.common.white} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.common.white }}>Create Job</Text>
            </Box>
          )}
        </Box>
      );
    };

    /* Stats summary */
    const renderStatsSummary = () => {
      if (!stats.length) return null;
      return (
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {stats.map((stat, i) => {
            const statEntrance = createEntranceAnimation(tokens, { index: i });
            return (
              <Box key={stat.key} style={{ flex: 1, ...cardBase, padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], alignItems: 'center', justifyContent: 'space-between', ...statEntrance.animate, transition: statEntrance.transition }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium }}>{stat.label}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: stat.key === 'total' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[900] }}>{stat.count}</Text>
              </Box>
            );
          })}
        </Box>
      );
    };

    return (
      <Box className={className} style={{ padding: tokens.spacing[7], backgroundColor: tokens.colors.neutral[50], minHeight: '100%', width: '100%', fontFamily: 'inherit', ...entrance.animate, transition: entrance.transition, ...style }}
        {...(extA11y.ariaLabel ? { 'aria-label': extA11y.ariaLabel } : {})}
        {...(extA11y.role ? { role: extA11y.role } : {})}>
        {accentBar && <Box style={accentBar} />}
        {ext.slot('header:start')}
        {ext.section('header', renderHeader)}
        {ext.slot('header:end')}
        {renderStatsSummary()}
        <Box style={{ ...createSurfaceStyle(tokens, { elevation: 'sm' }), backgroundColor: tokens.colors.common.white, overflow: 'hidden' as const, borderRadius: tokens.borderRadius.lg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
          {ext.slot('toolbar:start')}
          {ext.section('toolbar', renderToolbar)}
          {ext.slot('toolbar:end')}
          {filteredJobs.length === 0 ? (ext.hasSlot('empty') ? ext.slot('empty') : renderEmptyState()) : (
            <>
              {renderTableHeader()}
              <Box role="table">{filteredJobs.map(job => renderTableRow(job))}</Box>
            </>
          )}
          {filteredJobs.length > 0 && (
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Showing {filteredJobs.length} of {jobs.length} jobs</Text>
              {selectedJobs.length > 0 && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[600], fontWeight: tokens.typography.fontWeight.medium }}>{selectedJobs.length} selected</Text>}
              {ext.slot('footer:end')}
            </Box>
          )}
        </Box>
        {ext.slot('footer')}
      </Box>
    );
  },
});
