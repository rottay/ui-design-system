'use client';

/**
 * BhJobBoard - Table Preset
 * Slite-inspired sortable data table with inline status badges, sparkline for
 * candidate trends, warm neutral palette, and generous whitespace.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { BhJobBoardProps, JobItem, JobStatus, JobUrgency, JobBoardFilter, ViewMode, SortDirection } from '../../core';
import { BH_JOB_BOARD_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase, Plus, Search, LayoutGrid, List, Columns3, MapPin, Clock,
  Users, Eye, X, ChevronDown, ChevronUp, Globe, Filter, ChevronsUpDown,
  MoreHorizontal, Building2,
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
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Checkbox({ checked, tokens, size = 16, onClick }: { checked: boolean; tokens: DesignTokens; size?: number; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <div onClick={onClick} style={{ width: size, height: size, borderRadius: 4, border: `1.5px solid ${checked ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`, backgroundColor: checked ? tokens.colors.primaryScale[500] : tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, flexShrink: 0 }}>
      {checked && (
        <svg width={size - 6} height={size - 6} viewBox="0 0 10 10">
          <path d="M2 5L4.5 7.5L8 3" stroke={tokens.colors.common.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function StatusBadge({ status, config, tokens }: { status: JobStatus; config: StatusConfig; tokens: DesignTokens }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `2px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: config.bgColor, color: config.color, border: `1px solid ${config.borderColor}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: config.dotColor }} />
      {config.label}
    </span>
  );
}

function AvatarStack({ avatars, tokens, size = 22, maxShow = 3 }: { avatars: string[]; tokens: DesignTokens; size?: number; maxShow?: number }) {
  const shown = avatars.slice(0, maxShow);
  const remaining = avatars.length - maxShow;
  const overlap = Math.round(size * 0.27);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {shown.map((avatar, idx) => (
        <div key={idx} style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${tokens.colors.common.white}`, backgroundColor: tokens.colors.primaryScale[100], backgroundImage: avatar ? `url(${avatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', marginLeft: idx > 0 ? -overlap : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600], position: 'relative' as const, zIndex: maxShow - idx }}>
          {!avatar && <Users size={Math.round(size * 0.41)} />}
        </div>
      ))}
      {remaining > 0 && (
        <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${tokens.colors.common.white}`, backgroundColor: tokens.colors.neutral[100], marginLeft: -overlap, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], position: 'relative' as const, zIndex: 0 }}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

function ViewToggle({ active, onSelect, tokens }: { active: ViewMode; onSelect: (m: ViewMode) => void; tokens: DesignTokens }) {
  const modes: { mode: ViewMode; icon: React.ReactNode }[] = [
    { mode: 'grid', icon: <LayoutGrid size={14} /> },
    { mode: 'table', icon: <List size={14} /> },
    { mode: 'kanban', icon: <Columns3 size={14} /> },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100] }}>
      {modes.map(({ mode, icon }) => (
        <button key={mode} onClick={() => onSelect(mode)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 26, border: 'none', borderRadius: tokens.borderRadius.sm, backgroundColor: mode === active ? tokens.colors.common.white : 'transparent', color: mode === active ? tokens.colors.neutral[900] : tokens.colors.neutral[500], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit', boxShadow: mode === active ? tokens.shadows.sm : 'none' }}>
          {icon}
        </button>
      ))}
    </div>
  );
}

function PrimaryButton({ onClick, children, tokens }: { onClick?: () => void; children: React.ReactNode; tokens: DesignTokens }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit' }}>
      {children}
    </button>
  );
}

function IconButton({ onClick, title, icon, tokens, size = 26 }: { onClick?: (e: React.MouseEvent) => void; title?: string; icon: React.ReactNode; tokens: DesignTokens; size?: number }) {
  return (
    <button onClick={onClick} title={title} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit' }}>
      {icon}
    </button>
  );
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
    result = result.filter(j => j.title.toLowerCase().includes(lower) || j.code.toLowerCase().includes(lower) || j.department.toLowerCase().includes(lower) || j.location.toLowerCase().includes(lower) || (j.clientName && j.clientName.toLowerCase().includes(lower)));
  }

  result.sort((a, b) => {
    let aVal: number | string = 0, bVal: number | string = 0;
    switch (sortBy) {
      case 'daysOpen': aVal = a.daysOpen; bVal = b.daysOpen; break;
      case 'candidateCount': aVal = a.candidateCount; bVal = b.candidateCount; break;
      case 'title': aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); break;
      case 'department': aVal = a.department.toLowerCase(); bVal = b.department.toLowerCase(); break;
      case 'status': aVal = a.status; bVal = b.status; break;
      case 'location': aVal = a.location.toLowerCase(); bVal = b.location.toLowerCase(); break;
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
  render: ({ primitives, props, tokens, engine }: PresetContext<BhJobBoardProps>) => {
    const isModern = tokens.surface.useGlass;

    const STATUS_CONFIG = useMemo(() => getStatusConfig(tokens), [tokens]);
    const URGENCY_CONFIG = useMemo(() => getUrgencyConfig(tokens), [tokens]);

    const {
      jobs, stats = [], filters: controlledFilters, onFilterChange, onViewModeChange, onJobClick, onCreateJob,
      selectedJobs: controlledSelectedJobs, onSelectionChange, searchQuery: controlledSearchQuery, onSearchChange,
      sortBy: controlledSortBy, sortDirection: controlledSortDirection, onSortChange,
      emptyText = BH_JOB_BOARD_DEFAULTS.emptyText, departments = [], clients = [], className, style,
    } = props;

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

    const filteredJobs = useMemo(() => filterAndSortJobs(jobs, filters, searchQuery, sortBy, sortDirection, clients), [jobs, filters, searchQuery, sortBy, sortDirection, clients]);

    const handleSelectAll = useCallback(() => {
      const allIds = filteredJobs.map(j => j.id);
      const next = allIds.every(id => selectedJobs.includes(id)) ? [] : allIds;
      if (controlledSelectedJobs === undefined) setInternalSelectedJobs(next);
      onSelectionChange?.(next);
    }, [filteredJobs, selectedJobs, controlledSelectedJobs, onSelectionChange]);

    const glassSurfaceStyle = isModern && tokens.glass ? { backdropFilter: tokens.glass.blurSm, WebkitBackdropFilter: tokens.glass.blurSm, backgroundColor: tokens.glass.bgLight, border: `1px solid ${tokens.glass.borderLight}` } : {};

    /* Sparkline */
    const renderSparkline = (job: JobItem) => {
      const stages = job.candidatesByStage;
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

    /* Header */
    const renderHeader = () => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
        <div>
          <h1 style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], margin: 0, lineHeight: tokens.typography.lineHeight.tight, letterSpacing: '-0.02em' }}>Jobs</h1>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: 0, marginTop: tokens.spacing[1] }}>Manage and track all your open positions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <ViewToggle active="table" onSelect={(m) => onViewModeChange?.(m)} tokens={tokens} />
          {onCreateJob && <PrimaryButton onClick={onCreateJob} tokens={tokens}><Plus size={16} />New Job</PrimaryButton>}
        </div>
      </div>
    );

    /* Toolbar */
    const renderToolbar = () => {
      const statusOptions: (JobStatus | null)[] = [null, 'published', 'draft', 'paused', 'closed'];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, backgroundColor: tokens.colors.common.white, marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, flexWrap: 'wrap' as const, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, ...glassSurfaceStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100] }}>
            {statusOptions.map((status) => {
              const isActive = filters.status === status || (status === null && !filters.status);
              return (
                <button key={status ?? 'all'} onClick={() => handleFilterChange({ ...filters, status })} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs, fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium, border: 'none', backgroundColor: isActive ? tokens.colors.common.white : 'transparent', color: isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[500], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit', boxShadow: isActive ? tokens.shadows.sm : 'none' }}>
                  {status !== null && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: STATUS_CONFIG[status].dotColor, flexShrink: 0 }} />}
                  {status === null ? 'All' : STATUS_CONFIG[status].label}
                </button>
              );
            })}
          </div>

          {departments.length > 0 && (
            <div style={{ position: 'relative' as const }}>
              <button onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, border: `1px solid ${filters.department ? tokens.colors.primaryScale[200] : tokens.colors.neutral[100]}`, backgroundColor: filters.department ? tokens.colors.primaryScale[50] : tokens.colors.common.white, color: filters.department ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit' }}>
                {filters.department ?? 'Department'}<ChevronDown size={12} />
              </button>
              {showDepartmentDropdown && (
                <div style={{ position: 'absolute' as const, top: '100%', left: 0, marginTop: tokens.spacing[1], minWidth: 180, backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.lg, border: `1px solid ${tokens.colors.neutral[100]}`, zIndex: 50, padding: `${tokens.spacing[1]}px 0` }}>
                  {[null, ...departments].map(dept => (
                    <div key={dept ?? 'all'} onClick={() => { handleFilterChange({ ...filters, department: dept }); setShowDepartmentDropdown(false); }} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: (dept === null ? !filters.department : filters.department === dept) ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700], backgroundColor: (dept === null ? !filters.department : filters.department === dept) ? tokens.colors.primaryScale[50] : 'transparent', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, fontFamily: 'inherit' }}>
                      {dept ?? 'All Departments'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.common.white, minWidth: 200 }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0, fontFamily: 'inherit' }} />
            {searchQuery && <X size={12} color={tokens.colors.neutral[400]} style={{ cursor: 'pointer' }} onClick={() => handleSearchChange('')} />}
          </div>

          {selectedJobs.length > 0 && <span style={{ padding: `2px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>{selectedJobs.length} selected</span>}
        </div>
      );
    };

    /* Sort icon */
    const renderSortIcon = (key: string) => {
      if (sortBy !== key) return <ChevronsUpDown size={12} color={tokens.colors.neutral[300]} />;
      return sortDirection === 'asc' ? <ChevronUp size={12} color={tokens.colors.primaryScale[500]} /> : <ChevronDown size={12} color={tokens.colors.primaryScale[500]} />;
    };

    const allSelected = filteredJobs.length > 0 && filteredJobs.every(j => selectedJobs.includes(j.id));

    /* Table header */
    const renderTableHeader = () => (
      <div style={{ display: 'flex', alignItems: 'center', padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`, backgroundColor: tokens.colors.neutral[50], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
        {TABLE_COLUMNS.map(col => (
          <div key={col.key} style={{ flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : '1', display: 'flex', alignItems: 'center', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' as const, padding: `0 ${tokens.spacing[2]}px` }} onClick={() => col.sortable && handleSortChange(col.key)}>
            {col.key === 'select' ? <Checkbox checked={allSelected} tokens={tokens} onClick={(e) => { e.stopPropagation(); handleSelectAll(); }} /> : <>{col.label}{col.sortable && renderSortIcon(col.key)}</>}
          </div>
        ))}
      </div>
    );

    /* Table row */
    const renderTableRow = (job: JobItem) => {
      const statusCfg = STATUS_CONFIG[job.status];
      const urgencyCfg = URGENCY_CONFIG[job.urgency];
      const isHovered = hoveredRowId === job.id;
      const isSelected = selectedJobs.includes(job.id);

      const cellPad = `0 ${tokens.spacing[2]}px`;

      return (
        <div key={job.id} style={{ display: 'flex', alignItems: 'center', padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, backgroundColor: isSelected ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, cursor: 'pointer', transition: `all ${tokens.motion.hover}` }} onMouseEnter={() => setHoveredRowId(job.id)} onMouseLeave={() => setHoveredRowId(null)} onClick={() => onJobClick?.(job.id)}>
          <div style={{ flex: '0 0 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: cellPad }}>
            <Checkbox checked={isSelected} tokens={tokens} onClick={(e) => { e.stopPropagation(); handleSelectionToggle(job.id); }} />
          </div>
          <div style={{ flex: 1, padding: cellPad, overflow: 'hidden' as const }}>
            <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{job.title}</div>
            <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>{job.code}{job.clientName && <><span style={{ color: tokens.colors.neutral[300] }}>&middot;</span><Building2 size={10} />{job.clientName}</>}</div>
          </div>
          <div style={{ flex: '0 0 120px', padding: cellPad }}><StatusBadge status={job.status} config={statusCfg} tokens={tokens} /></div>
          <div style={{ flex: '0 0 140px', padding: cellPad, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{job.department}</div>
          <div style={{ flex: '0 0 100px', padding: cellPad }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `2px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: urgencyCfg.bgColor, color: urgencyCfg.color, border: `1px solid ${urgencyCfg.borderColor}` }}>{urgencyCfg.label}</span>
          </div>
          <div style={{ flex: '0 0 130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[2], padding: cellPad }}>
            <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{job.candidateCount}</span>
            {renderSparkline(job)}
          </div>
          <div style={{ flex: '0 0 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: cellPad }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[600] }}><Clock size={12} />{job.daysOpen}d</span>
          </div>
          <div style={{ flex: '0 0 150px', padding: cellPad, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], display: 'flex', alignItems: 'center', gap: tokens.spacing[1], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>
            {job.isRemote ? <><Globe size={12} />Remote</> : <><MapPin size={12} />{job.location}</>}
          </div>
          <div style={{ flex: '0 0 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: cellPad }}>
            <AvatarStack avatars={job.recruiterAvatars} tokens={tokens} />
          </div>
          <div style={{ flex: '0 0 80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1], opacity: isHovered ? 1 : 0, transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`, padding: cellPad }}>
            <IconButton onClick={(e) => { e.stopPropagation(); onJobClick?.(job.id); }} title="View" icon={<Eye size={12} />} tokens={tokens} />
            <IconButton onClick={(e) => { e.stopPropagation(); }} title="More" icon={<MoreHorizontal size={12} />} tokens={tokens} />
          </div>
        </div>
      );
    };

    /* Empty state */
    const renderEmptyState = () => (
      <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`, textAlign: 'center' as const, backgroundColor: tokens.colors.common.white }}>
        <div style={{ width: 56, height: 56, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.spacing[4] }}>
          <Briefcase size={24} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], marginBottom: tokens.spacing[2], letterSpacing: '-0.01em' }}>{emptyText}</div>
        <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[5], maxWidth: 320 }}>Try adjusting your filters or search query.</div>
        {onCreateJob && <PrimaryButton onClick={onCreateJob} tokens={tokens}><Plus size={16} />Create Job</PrimaryButton>}
      </div>
    );

    /* Stats summary */
    const renderStatsSummary = () => {
      if (!stats.length) return null;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {stats.map(stat => (
            <div key={stat.key} style={{ flex: 1, ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }), padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...glassSurfaceStyle }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium }}>{stat.label}</span>
              <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: stat.key === 'total' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[900], letterSpacing: '-0.02em' }}>{stat.count}</span>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className={className} style={{ padding: 28, backgroundColor: tokens.colors.neutral[50], minHeight: '100%', fontFamily: 'inherit', ...style }}>
        {renderHeader()}
        {renderStatsSummary()}
        <div style={{ ...createSurfaceStyle(tokens, { elevation: 'sm' }), backgroundColor: tokens.colors.common.white, overflow: 'hidden' as const, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[100]}`, ...glassSurfaceStyle }}>
          {renderToolbar()}
          {filteredJobs.length === 0 ? renderEmptyState() : (
            <>
              {renderTableHeader()}
              <div>{filteredJobs.map(job => renderTableRow(job))}</div>
            </>
          )}
          {filteredJobs.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderTop: `1px solid ${tokens.colors.neutral[100]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Showing {filteredJobs.length} of {jobs.length} jobs</span>
              {selectedJobs.length > 0 && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[600], fontWeight: tokens.typography.fontWeight.medium }}>{selectedJobs.length} selected</span>}
            </div>
          )}
        </div>
      </div>
    );
  },
});
