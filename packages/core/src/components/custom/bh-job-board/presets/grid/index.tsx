'use client';

/**
 * BhJobBoard - Grid Preset
 * Slite-inspired card grid for browsing job listings with warm tones,
 * generous whitespace, soft shadows, and color-coded pipeline bars.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createBadgeStyle, createCardStyle, createSurfaceStyle } from '../../../helpers';
import type { BhJobBoardProps, JobItem, JobStatus, JobUrgency, JobBoardFilter, ViewMode, SortDirection } from '../../core';
import { BH_JOB_BOARD_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase, Plus, Search, LayoutGrid, List, Columns3, MapPin, Clock,
  Users, Eye, Pencil, Pause, Play, X, ChevronDown, AlertCircle, Globe,
  Filter, ArrowUpDown, Building2, TrendingUp,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

interface StatusConfig { label: string; color: string; bgColor: string; borderColor: string; dotColor: string }
interface UrgencyConfig { label: string; color: string; bgColor: string; borderColor: string }

function getStatusConfig(tokens: DesignTokens): Record<JobStatus, StatusConfig> {
  return {
    published: { label: 'Published', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200], dotColor: tokens.colors.successScale[500] },
    draft: { label: 'Draft', color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[50], borderColor: tokens.colors.neutral[200], dotColor: tokens.colors.neutral[400] },
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

const STAGE_COLORS_KEYS = ['primaryScale', 'infoScale', 'warningScale', 'successScale', 'secondaryScale', 'errorScale'] as const;
function getStageColors(tokens: DesignTokens): string[] {
  return STAGE_COLORS_KEYS.map((k) => tokens.colors[k][k === 'errorScale' ? 400 : 500]);
}

const STAT_SCALE: Record<string, string> = { total: 'primaryScale', published: 'successScale', draft: 'neutral', paused: 'warningScale', closed: 'errorScale' };
function getStatColors(key: string, tokens: DesignTokens) {
  const scale = STAT_SCALE[key] ?? 'neutral';
  const s = (tokens.colors as any)[scale];
  return { bg: s[50], text: s[700], border: s[200], dot: s[500] };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Checkbox({ checked, tokens, onClick }: { checked: boolean; tokens: DesignTokens; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <div onClick={onClick} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`, backgroundColor: checked ? tokens.colors.primaryScale[500] : tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, flexShrink: 0 }}>
      {checked && <svg width={11} height={11} viewBox="0 0 10 10"><path d="M2 5L4.5 7.5L8 3" stroke={tokens.colors.common.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
}

function StatusBadge({ config, tokens }: { config: StatusConfig; tokens: DesignTokens }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: config.bgColor, color: config.color, border: `1px solid ${config.borderColor}`, letterSpacing: '0.01em' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: config.dotColor }} />
      {config.label}
    </span>
  );
}

function UrgencyBadge({ config, tokens }: { config: UrgencyConfig; tokens: DesignTokens }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: tokens.borderRadius.md, fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium, backgroundColor: config.bgColor, color: config.color, border: `1px solid ${config.borderColor}` }}>
      <AlertCircle size={10} />{config.label}
    </span>
  );
}

function AvatarStack({ avatars, tokens, size = 26, maxShow = 3 }: { avatars: string[]; tokens: DesignTokens; size?: number; maxShow?: number }) {
  const shown = avatars.slice(0, maxShow);
  const remaining = avatars.length - maxShow;
  const overlap = Math.round(size * 0.3);
  const base = (idx: number, extra?: React.CSSProperties): React.CSSProperties => ({
    width: size, height: size, borderRadius: '50%',
    border: `2px solid ${tokens.colors.common.white}`,
    marginLeft: idx > 0 ? -overlap : 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative' as const, ...extra,
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((avatar, idx) => (
        <div key={idx} style={{ ...base(idx, { backgroundColor: tokens.colors.primaryScale[100], backgroundImage: avatar ? `url(${avatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600], zIndex: maxShow - idx }) }}>
          {!avatar && <Users size={Math.round(size * 0.42)} />}
        </div>
      ))}
      {remaining > 0 && (
        <div style={{ ...base(1, { backgroundColor: tokens.colors.neutral[100], fontSize: '9px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], zIndex: 0 }) }}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

function ViewToggle({ active, onSelect, tokens }: { active: ViewMode; onSelect: (m: ViewMode) => void; tokens: DesignTokens }) {
  const modes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'grid', icon: <LayoutGrid size={14} />, label: 'Grid' },
    { mode: 'table', icon: <List size={14} />, label: 'Table' },
    { mode: 'kanban', icon: <Columns3 size={14} />, label: 'Board' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.neutral[100] }}>
      {modes.map(({ mode, icon }) => (
        <button key={mode} onClick={() => onSelect(mode)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, border: 'none', borderRadius: tokens.borderRadius.md, backgroundColor: mode === active ? tokens.colors.common.white : 'transparent', color: mode === active ? tokens.colors.neutral[900] : tokens.colors.neutral[500], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', boxShadow: mode === active ? tokens.shadows.sm : 'none', fontFamily: 'inherit' }}>
          {icon}
        </button>
      ))}
    </div>
  );
}

function CandidateProgressBar({ job, stageColors, tokens }: { job: JobItem; stageColors: string[]; tokens: DesignTokens }) {
  const total = job.candidatesByStage.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return <div style={{ height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], width: '100%' }} />;
  const W = 200, H = 6;
  let x = 0;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const, display: 'block' }}>
      <rect x={0} y={0} width={W} height={H} fill={tokens.colors.neutral[100]} rx={3} />
      {job.candidatesByStage.map((stage, idx) => {
        const w = (stage.count / total) * W;
        const cx = x; x += w;
        return <rect key={stage.stage} x={cx} y={0} width={w} height={H} fill={stageColors[idx % stageColors.length]} rx={idx === 0 ? 3 : 0} />;
      })}
    </svg>
  );
}

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
      case 'urgency': { const o: Record<JobUrgency, number> = { low: 0, medium: 1, high: 2, critical: 3 }; aVal = o[a.urgency]; bVal = o[b.urgency]; break; }
      default: aVal = a.daysOpen; bVal = b.daysOpen;
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
  render: ({ primitives, props, tokens, engine }: PresetContext<BhJobBoardProps>) => {
    const isModern = tokens.surface.useGlass;
    const STATUS_CONFIG = useMemo(() => getStatusConfig(tokens), [tokens]);
    const URGENCY_CONFIG = useMemo(() => getUrgencyConfig(tokens), [tokens]);
    const STAGE_COLORS = useMemo(() => getStageColors(tokens), [tokens]);

    const {
      jobs, stats = [], filters: controlledFilters, onFilterChange, onViewModeChange, onJobClick, onCreateJob,
      selectedJobs: controlledSelectedJobs, onSelectionChange, searchQuery: controlledSearchQuery, onSearchChange,
      sortBy: controlledSortBy, sortDirection: controlledSortDirection, onSortChange,
      emptyText = BH_JOB_BOARD_DEFAULTS.emptyText, departments = [], clients = [], className, style,
    } = props;

    const [internalViewMode, setInternalViewMode] = useState<ViewMode>('grid');
    const [internalFilters, setInternalFilters] = useState<JobBoardFilter>({});
    const [internalSortBy, setInternalSortBy] = useState(BH_JOB_BOARD_DEFAULTS.sortBy ?? 'daysOpen');
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

    const filteredJobs = useMemo(() => filterAndSortJobs(jobs, filters, searchQuery, sortBy, sortDirection, clients), [jobs, filters, searchQuery, sortBy, sortDirection, clients]);

    const glassSurfaceStyle = isModern && tokens.glass ? { backdropFilter: tokens.glass.blurSm, WebkitBackdropFilter: tokens.glass.blurSm, backgroundColor: tokens.glass.bgLight, border: `1px solid ${tokens.glass.borderLight}` } : {};
    const glassCardStyle = isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg, border: `1px solid ${tokens.glass.border}` } : {};

    const hasActiveFilters = !!(searchQuery || filters.status || filters.department || filters.urgency || filters.clientId);

    /* Dropdown renderer */
    const renderDropdown = (show: boolean, setShow: (v: boolean) => void, otherClose: () => void, label: string, activeValue: string | null | undefined, options: { key: string; label: string }[], onSelect: (v: string | null) => void) => (
      <div style={{ position: 'relative' as const }}>
        <button onClick={() => { setShow(!show); otherClose(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, border: `1px solid ${activeValue ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`, backgroundColor: activeValue ? tokens.colors.primaryScale[50] : tokens.colors.common.white, color: activeValue ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit' }}>
          {activeValue ?? label}<ChevronDown size={12} />
        </button>
        {show && (
          <div style={{ position: 'absolute' as const, top: '100%', left: 0, marginTop: 6, minWidth: 200, backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.lg, border: `1px solid ${tokens.colors.neutral[100]}`, zIndex: 50, padding: '4px 0', ...glassSurfaceStyle }}>
            {[{ key: '__all__', label: `All ${label}s` }, ...options].map(opt => {
              const isActive = opt.key === '__all__' ? !activeValue : activeValue === opt.key;
              return (
                <div key={opt.key} onClick={() => onSelect(opt.key === '__all__' ? null : opt.key)} style={{ padding: '8px 14px', fontSize: tokens.typography.fontSize.sm, color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700], backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, fontWeight: isActive ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal, borderRadius: tokens.borderRadius.md, margin: '0 4px' }}>
                  {opt.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );

    /* Stats Ribbon */
    const renderStatsRibbon = () => {
      if (!stats.length) return null;
      return (
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, marginBottom: 20 }}>
          {stats.map(stat => {
            const kc = getStatColors(stat.key, tokens);
            const isActive = filters.status === stat.key || (stat.key === 'total' && !filters.status);
            return (
              <div key={stat.key} onClick={() => handleFilterChange({ ...filters, status: stat.key === 'total' ? null : (stat.key === filters.status ? null : stat.key as JobStatus) })} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '16px 12px', borderRadius: tokens.borderRadius.lg, backgroundColor: isActive ? kc.bg : tokens.colors.common.white, border: `1px solid ${isActive ? kc.border : tokens.colors.neutral[100]}`, cursor: 'pointer', transition: `all ${tokens.motion.hover}`, boxShadow: isActive ? tokens.shadows.sm : 'none' }}>
                <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: isActive ? kc.text : tokens.colors.neutral[900], lineHeight: '1' }}>{stat.count}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? kc.text : tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, marginTop: 6 }}>{stat.label}</span>
              </div>
            );
          })}
        </div>
      );
    };

    /* Filter Bar */
    const renderFilterBar = () => {
      const statusOptions: (JobStatus | null)[] = [null, 'published', 'draft', 'paused', 'closed'];
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 4, flexWrap: 'wrap' as const }}>
          {/* Status pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {statusOptions.map(status => {
              const isActive = filters.status === status || (status === null && !filters.status);
              return (
                <button key={status ?? 'all'} onClick={() => handleFilterChange({ ...filters, status })} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, border: 'none', backgroundColor: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[100], color: isActive ? tokens.colors.common.white : tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit' }}>
                  {status !== null && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isActive ? tokens.colors.common.white : STATUS_CONFIG[status].dotColor, flexShrink: 0, opacity: isActive ? 0.8 : 1 }} />}
                  {status === null ? 'All' : STATUS_CONFIG[status].label}
                </button>
              );
            })}
          </div>

          {departments.length > 0 && renderDropdown(showDepartmentDropdown, setShowDepartmentDropdown, () => setShowClientDropdown(false), 'Department', filters.department, departments.map(d => ({ key: d, label: d })), (v) => { handleFilterChange({ ...filters, department: v }); setShowDepartmentDropdown(false); })}

          {clients.length > 0 && renderDropdown(showClientDropdown, setShowClientDropdown, () => setShowDepartmentDropdown(false), 'Client', filters.clientId ? (clients.find(c => c.id === filters.clientId)?.name ?? null) : null, clients.map(c => ({ key: c.id, label: c.name })), (v) => { handleFilterChange({ ...filters, clientId: v }); setShowClientDropdown(false); })}

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, minWidth: 220, transition: `all ${tokens.motion.hover}` }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0, fontFamily: 'inherit' }} />
            {searchQuery && <X size={13} color={tokens.colors.neutral[400]} style={{ cursor: 'pointer' }} onClick={() => handleSearchChange('')} />}
          </div>

          {/* Sort */}
          <button onClick={() => handleSortChange(sortBy)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit' }}>
            <ArrowUpDown size={12} />{sortDirection === 'asc' ? 'Oldest' : 'Newest'}
          </button>

          <ViewToggle active={internalViewMode} onSelect={handleViewModeChange} tokens={tokens} />
        </div>
      );
    };

    /* Job Card */
    const renderJobCard = (job: JobItem) => {
      const statusCfg = STATUS_CONFIG[job.status];
      const urgencyCfg = URGENCY_CONFIG[job.urgency];
      const isHovered = hoveredJobId === job.id;
      const isSelected = selectedJobs.includes(job.id);

      return (
        <div key={job.id} style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`,
          boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
          padding: 24,
          cursor: 'pointer',
          transition: `all ${tokens.motion.hover}`,
          transform: isHovered ? 'translateY(-2px)' : 'none',
          position: 'relative' as const,
          ...(isModern ? glassCardStyle : {}),
        }} onMouseEnter={() => setHoveredJobId(job.id)} onMouseLeave={() => setHoveredJobId(null)} onClick={() => onJobClick?.(job.id)}>

          {/* Top row: status + urgency + checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <StatusBadge config={statusCfg} tokens={tokens} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UrgencyBadge config={urgencyCfg} tokens={tokens} />
              <Checkbox checked={isSelected} tokens={tokens} onClick={(e) => { e.stopPropagation(); handleSelectionToggle(job.id); }} />
            </div>
          </div>

          {/* Title + code */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight, marginBottom: 4 }}>{job.title}</div>
            <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, letterSpacing: '0.01em' }}>{job.code} &middot; {job.department}</div>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: 16 }}>
            {job.isRemote ? <><Globe size={12} /><span>Remote</span></> : <><MapPin size={12} /><span>{job.location}</span></>}
            {job.clientName && <><span style={{ color: tokens.colors.neutral[300] }}>&middot;</span><Building2 size={11} /><span>{job.clientName}</span></>}
          </div>

          {/* Candidate progress */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Users size={12} />{job.candidateCount} candidates
              </span>
            </div>
            <CandidateProgressBar job={job} stageColors={STAGE_COLORS} tokens={tokens} />
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: 8 }}>
              {job.candidatesByStage.map((stage, idx) => (
                <span key={stage.stage} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '10px', color: tokens.colors.neutral[500] }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length], flexShrink: 0 }} />
                  {stage.stage} ({stage.count})
                </span>
              ))}
            </div>
          </div>

          {/* Bottom: days + avatars + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: tokens.typography.fontSize.xs, color: job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}><Clock size={12} />{job.daysOpen}d open</span>
              <AvatarStack avatars={job.recruiterAvatars} tokens={tokens} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isHovered ? 1 : 0, transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}` }}>
              <button onClick={(e) => { e.stopPropagation(); onJobClick?.(job.id); }} title="View job" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none' }}><Eye size={13} /></button>
              <button onClick={(e) => { e.stopPropagation(); }} title="Edit job" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none' }}><Pencil size={13} /></button>
              <button onClick={(e) => { e.stopPropagation(); }} title={job.status === 'paused' ? 'Resume' : 'Pause'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none' }}>{job.status === 'paused' ? <Play size={13} /> : <Pause size={13} />}</button>
            </div>
          </div>
        </div>
      );
    };

    /* Empty state */
    const renderEmptyState = () => (
      <div style={{ backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[100]}`, boxShadow: tokens.shadows.sm, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '64px 32px', textAlign: 'center' as const }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Briefcase size={30} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginBottom: 8 }}>{hasActiveFilters ? emptyText : 'No jobs yet'}</div>
        <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginBottom: 24, maxWidth: 380, lineHeight: tokens.typography.lineHeight.relaxed }}>{hasActiveFilters ? 'Try adjusting your filters or search query to find what you are looking for.' : 'Create your first job posting to start attracting candidates and filling positions.'}</div>
        {onCreateJob && (
          <button onClick={onCreateJob} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit' }}><Plus size={16} />Create your first job</button>
        )}
      </div>
    );

    /* Header */
    const renderHeader = () => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], margin: 0, lineHeight: tokens.typography.lineHeight.tight, letterSpacing: '-0.02em' }}>Jobs</h1>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: 0, marginTop: 4 }}>Manage and track all your open positions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {selectedJobs.length > 0 && (
            <span style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs, padding: '4px 12px' }}>{selectedJobs.length} selected</span>
          )}
          {onCreateJob && (
            <button onClick={onCreateJob} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit' }}><Plus size={16} />New Job</button>
          )}
        </div>
      </div>
    );

    return (
      <div className={className} style={{ padding: 28, backgroundColor: tokens.colors.neutral[50], minHeight: '100%', fontFamily: 'inherit', ...style }}>
        {renderHeader()}
        {renderStatsRibbon()}
        {renderFilterBar()}
        {filteredJobs.length === 0 ? renderEmptyState() : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filteredJobs.map(job => renderJobCard(job))}
          </div>
        )}
      </div>
    );
  },
});
