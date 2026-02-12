'use client';

/**
 * BhJobBoard - Kanban Preset
 * Slite-inspired kanban board with columns by status, drag-and-drop cards,
 * warm tones, generous whitespace, and color-coded pipeline mini-bars.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { BhJobBoardProps, JobItem, JobStatus, JobUrgency, JobBoardFilter, ViewMode } from '../../core';
import { BH_JOB_BOARD_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase, Plus, Search, LayoutGrid, List, Columns3, MapPin, Clock,
  Users, Eye, Pencil, AlertCircle, Globe, X, GripVertical, Building2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

interface StatusColumnConfig {
  key: JobStatus; label: string; color: string; bgColor: string;
  headerBg: string; borderColor: string; dotColor: string; accentBorder: string;
}
interface UrgencyConfig { label: string; color: string; bgColor: string; borderColor: string }

function getStatusColumns(tokens: DesignTokens): StatusColumnConfig[] {
  const mk = (key: JobStatus, label: string, scale: string): StatusColumnConfig => {
    const s = (tokens.colors as any)[scale];
    return {
      key, label, color: s[700], bgColor: s[50], headerBg: s[50],
      borderColor: s[200], dotColor: s[scale === 'neutral' ? 400 : 500],
      accentBorder: s[scale === 'neutral' ? 300 : 400],
    };
  };
  return [
    mk('draft', 'Draft', 'neutral'),
    mk('published', 'Published', 'successScale'),
    mk('paused', 'Paused', 'warningScale'),
    mk('closed', 'Closed', 'errorScale'),
  ];
}

function getUrgencyConfig(tokens: DesignTokens): Record<JobUrgency, UrgencyConfig> {
  return {
    low: { label: 'Low', color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200] },
    medium: { label: 'Medium', color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], borderColor: tokens.colors.infoScale[200] },
    high: { label: 'High', color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], borderColor: tokens.colors.warningScale[200] },
    critical: { label: 'Critical', color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200] },
  };
}

const STAGE_SCALE_KEYS = ['primaryScale', 'infoScale', 'warningScale', 'successScale', 'secondaryScale', 'errorScale'] as const;
function getStageColors(tokens: DesignTokens): string[] {
  return STAGE_SCALE_KEYS.map((k) => tokens.colors[k][k === 'errorScale' ? 400 : 500]);
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Checkbox({ checked, tokens, size = 16, onClick }: { checked: boolean; tokens: DesignTokens; size?: number; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <div onClick={onClick} style={{ width: size, height: size, borderRadius: 4, border: `1.5px solid ${checked ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`, backgroundColor: checked ? tokens.colors.primaryScale[500] : tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, flexShrink: 0 }}>
      {checked && <svg width={size - 6} height={size - 6} viewBox="0 0 10 10"><path d="M2 5L4.5 7.5L8 3" stroke={tokens.colors.common.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
}

function AvatarStack({ avatars, tokens, size = 22, maxShow = 2 }: { avatars: string[]; tokens: DesignTokens; size?: number; maxShow?: number }) {
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
        <div key={idx} style={{ ...base(idx, { backgroundColor: tokens.colors.primaryScale[100], backgroundImage: avatar ? `url(${avatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', fontSize: '8px', fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600], zIndex: maxShow - idx }) }}>
          {!avatar && <Users size={8} />}
        </div>
      ))}
      {remaining > 0 && <div style={{ ...base(1, { backgroundColor: tokens.colors.neutral[100], fontSize: '8px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }) }}>+{remaining}</div>}
    </div>
  );
}

function ViewToggle({ active, onSelect, tokens }: { active: string; onSelect: (m: ViewMode) => void; tokens: DesignTokens }) {
  const modes: { mode: ViewMode; icon: React.ReactNode }[] = [
    { mode: 'grid', icon: <LayoutGrid size={14} /> },
    { mode: 'table', icon: <List size={14} /> },
    { mode: 'kanban', icon: <Columns3 size={14} /> },
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

function CandidateMiniBar({ job, stageColors, tokens }: { job: JobItem; stageColors: string[]; tokens: DesignTokens }) {
  const total = job.candidatesByStage.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return <div style={{ height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], width: '100%' }} />;

  const W = 160, H = 5;
  let x = 0;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const, display: 'block' }}>
      <rect x={0} y={0} width={W} height={H} fill={tokens.colors.neutral[100]} rx={2.5} />
      {job.candidatesByStage.map((stage, idx) => {
        const w = (stage.count / total) * W;
        const cx = x; x += w;
        return <rect key={stage.stage} x={cx} y={0} width={w} height={H} fill={stageColors[idx % stageColors.length]} rx={idx === 0 ? 2.5 : 0} />;
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Kanban Preset                                                       */
/* ------------------------------------------------------------------ */

export const KanbanBhJobBoard = createPreset<BhJobBoardProps>({
  name: 'BhJobBoard.Kanban',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhJobBoardProps>) => {
    const isModern = tokens.surface.useGlass;
    const STATUS_COLUMNS = useMemo(() => getStatusColumns(tokens), [tokens]);
    const URGENCY_CONFIG = useMemo(() => getUrgencyConfig(tokens), [tokens]);
    const STAGE_COLORS = useMemo(() => getStageColors(tokens), [tokens]);

    const {
      jobs, stats = [], filters: controlledFilters, onFilterChange, onViewModeChange, onJobClick, onCreateJob,
      selectedJobs: controlledSelectedJobs, onSelectionChange, searchQuery: controlledSearchQuery, onSearchChange,
      emptyText = BH_JOB_BOARD_DEFAULTS.emptyText, departments = [], clients = [], className, style,
    } = props;

    const [internalFilters, setInternalFilters] = useState<JobBoardFilter>({});
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedJobs, setInternalSelectedJobs] = useState<string[]>([]);
    const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
    const [dragState, setDragState] = useState<{ jobId: string; fromStatus: JobStatus } | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<JobStatus | null>(null);

    const filters = controlledFilters ?? internalFilters;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const selectedJobs = controlledSelectedJobs ?? internalSelectedJobs;

    const handleFilterChange = useCallback((f: JobBoardFilter) => { if (controlledFilters === undefined) setInternalFilters(f); onFilterChange?.(f); }, [controlledFilters, onFilterChange]);
    const handleSearchChange = useCallback((q: string) => { if (controlledSearchQuery === undefined) setInternalSearchQuery(q); onSearchChange?.(q); }, [controlledSearchQuery, onSearchChange]);
    const handleSelectionToggle = useCallback((jobId: string) => {
      const next = selectedJobs.includes(jobId) ? selectedJobs.filter(id => id !== jobId) : [...selectedJobs, jobId];
      if (controlledSelectedJobs === undefined) setInternalSelectedJobs(next);
      onSelectionChange?.(next);
    }, [selectedJobs, controlledSelectedJobs, onSelectionChange]);

    const handleDragStart = useCallback((jobId: string, fromStatus: JobStatus) => setDragState({ jobId, fromStatus }), []);
    const handleDragOver = useCallback((e: React.DragEvent, status: JobStatus) => { e.preventDefault(); setDragOverColumn(status); }, []);
    const handleDragLeave = useCallback(() => setDragOverColumn(null), []);
    const handleDrop = useCallback((targetStatus: JobStatus) => { setDragState(null); setDragOverColumn(null); }, []);
    const handleDragEnd = useCallback(() => { setDragState(null); setDragOverColumn(null); }, []);

    const filteredJobs = useMemo(() => {
      let result = [...jobs];
      if (filters.department) result = result.filter(j => j.department === filters.department);
      if (filters.urgency) result = result.filter(j => j.urgency === filters.urgency);
      if (filters.clientId) result = result.filter(j => j.clientName === clients.find(c => c.id === filters.clientId)?.name);
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(j => j.title.toLowerCase().includes(lower) || j.code.toLowerCase().includes(lower) || j.department.toLowerCase().includes(lower) || j.location.toLowerCase().includes(lower) || (j.clientName && j.clientName.toLowerCase().includes(lower)));
      }
      return result;
    }, [jobs, filters, searchQuery, clients]);

    const jobsByStatus = useMemo(() => {
      const grouped: Record<JobStatus, JobItem[]> = { draft: [], published: [], paused: [], closed: [] };
      filteredJobs.forEach(job => grouped[job.status].push(job));
      Object.values(grouped).forEach(arr => arr.sort((a, b) => b.daysOpen - a.daysOpen));
      return grouped;
    }, [filteredJobs]);

    const glassSurfaceStyle = isModern && tokens.glass ? { backdropFilter: tokens.glass.blurSm, WebkitBackdropFilter: tokens.glass.blurSm, backgroundColor: tokens.glass.bgLight, border: `1px solid ${tokens.glass.borderLight}` } : {};
    const glassCardStyle = isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg, border: `1px solid ${tokens.glass.border}` } : {};

    /* Kanban Card */
    const renderKanbanCard = (job: JobItem) => {
      const urgencyCfg = URGENCY_CONFIG[job.urgency];
      const isHovered = hoveredJobId === job.id;
      const isDragging = dragState?.jobId === job.id;
      const isSelected = selectedJobs.includes(job.id);

      return (
        <div key={job.id} draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; handleDragStart(job.id, job.status); }} onDragEnd={handleDragEnd} style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`,
          boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
          padding: 16,
          cursor: 'grab',
          opacity: isDragging ? 0.5 : 1,
          transform: isHovered && !isDragging ? 'translateY(-2px)' : 'none',
          transition: `all ${tokens.motion.hover}`,
          ...(isModern ? glassCardStyle : {}),
        }} onMouseEnter={() => setHoveredJobId(job.id)} onMouseLeave={() => setHoveredJobId(null)} onClick={() => onJobClick?.(job.id)}>

          {/* Drag handle + urgency + checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <GripVertical size={12} color={tokens.colors.neutral[300]} style={{ cursor: 'grab' }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: tokens.borderRadius.md, fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium, backgroundColor: urgencyCfg.bgColor, color: urgencyCfg.color, border: `1px solid ${urgencyCfg.borderColor}` }}>
                <AlertCircle size={9} />{urgencyCfg.label}
              </span>
            </div>
            <Checkbox checked={isSelected} tokens={tokens} size={14} onClick={(e) => { e.stopPropagation(); handleSelectionToggle(job.id); }} />
          </div>

          <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight, marginBottom: 4 }}>{job.title}</div>
          <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: 10 }}>{job.code} &middot; {job.department}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '10px', color: tokens.colors.neutral[500], marginBottom: 10 }}>
            {job.isRemote ? <><Globe size={10} /><span>Remote</span></> : <><MapPin size={10} /><span>{job.location}</span></>}
            {job.clientName && <><span style={{ color: tokens.colors.neutral[300] }}>&middot;</span><Building2 size={10} /><span>{job.clientName}</span></>}
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '10px', color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium, marginBottom: 4 }}>{job.candidateCount} candidates</div>
            <CandidateMiniBar job={job} stageColors={STAGE_COLORS} tokens={tokens} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '10px', color: job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}><Clock size={10} />{job.daysOpen}d</span>
              <AvatarStack avatars={job.recruiterAvatars} tokens={tokens} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: isHovered ? 1 : 0, transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}` }}>
              <button onClick={(e) => { e.stopPropagation(); onJobClick?.(job.id); }} title="View" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none' }}><Eye size={10} /></button>
              <button onClick={(e) => { e.stopPropagation(); }} title="Edit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none' }}><Pencil size={10} /></button>
            </div>
          </div>
        </div>
      );
    };

    /* Header */
    const renderHeader = () => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], margin: 0, lineHeight: tokens.typography.lineHeight.tight, letterSpacing: '-0.02em' }}>Jobs</h1>
          <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: 0, marginTop: 4 }}>Manage and track all your open positions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ViewToggle active="kanban" onSelect={(m) => onViewModeChange?.(m)} tokens={tokens} />
          {onCreateJob && (
            <button onClick={onCreateJob} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit' }}><Plus size={16} />New Job</button>
          )}
        </div>
      </div>
    );

    /* Filter bar */
    const renderFilterBar = () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, minWidth: 220 }}>
          <Search size={14} color={tokens.colors.neutral[400]} />
          <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0, fontFamily: 'inherit' }} />
          {searchQuery && <X size={13} color={tokens.colors.neutral[400]} style={{ cursor: 'pointer' }} onClick={() => handleSearchChange('')} />}
        </div>

        {departments.length > 0 && (
          <select value={filters.department ?? ''} onChange={(e) => handleFilterChange({ ...filters, department: e.target.value || null })} style={{ padding: '5px 12px', borderRadius: tokens.borderRadius.lg, border: `1px solid ${filters.department ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`, backgroundColor: filters.department ? tokens.colors.primaryScale[50] : tokens.colors.common.white, color: filters.department ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        )}

        {(['low', 'medium', 'high', 'critical'] as JobUrgency[]).map(urgency => {
          const isActive = filters.urgency === urgency;
          const cfg = URGENCY_CONFIG[urgency];
          return (
            <button key={urgency} onClick={() => handleFilterChange({ ...filters, urgency: isActive ? null : urgency })} style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, border: 'none', backgroundColor: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[100], color: isActive ? tokens.colors.common.white : tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none', fontFamily: 'inherit' }}>
              {cfg.label}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} across {STATUS_COLUMNS.length} columns</span>
      </div>
    );

    /* Kanban Column */
    const renderKanbanColumn = (col: StatusColumnConfig) => {
      const columnJobs = jobsByStatus[col.key];
      const isDraggedOver = dragOverColumn === col.key && dragState && dragState.fromStatus !== col.key;

      return (
        <div key={col.key} style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column' as const, maxHeight: '100%' }} onDragOver={(e) => handleDragOver(e, col.key)} onDragLeave={handleDragLeave} onDrop={() => handleDrop(col.key)}>
          {/* Column header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: col.headerBg, borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0`, borderTop: `3px solid ${col.accentBorder}`, ...(isModern ? glassSurfaceStyle : {}) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.dotColor, flexShrink: 0 }} />
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: col.color }}>{col.label}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, padding: '0 6px', borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, backgroundColor: tokens.colors.common.white, color: col.color, boxShadow: tokens.shadows.sm }}>{columnJobs.length}</span>
            </div>
            {col.key === 'draft' && onCreateJob && (
              <button onClick={() => onCreateJob()} title="Create new job" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], cursor: 'pointer', transition: `all ${tokens.motion.hover}`, outline: 'none' }}><Plus size={12} /></button>
            )}
          </div>

          {/* Column body */}
          <div style={{ flex: 1, backgroundColor: isDraggedOver ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50], border: `1px solid ${isDraggedOver ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`, borderTop: 'none', borderRadius: `0 0 ${tokens.borderRadius.lg} ${tokens.borderRadius.lg}`, padding: 8, display: 'flex', flexDirection: 'column' as const, gap: 8, overflowY: 'auto' as const, transition: `all ${tokens.motion.hover}`, minHeight: 200 }}>
            {columnJobs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center' as const }}>
                <Briefcase size={20} color={tokens.colors.neutral[300]} style={{ marginBottom: 8 }} />
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>No {col.label.toLowerCase()} jobs</span>
                {isDraggedOver && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[500], fontWeight: tokens.typography.fontWeight.medium, marginTop: 4 }}>Drop here to move</span>}
              </div>
            ) : columnJobs.map(job => renderKanbanCard(job))}
            {isDraggedOver && columnJobs.length > 0 && <div style={{ height: 2, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[400], margin: '4px 0' }} />}
          </div>
        </div>
      );
    };

    const showGlobalEmpty = filteredJobs.length === 0 && !!(searchQuery || filters.department || filters.urgency || filters.clientId);

    return (
      <div className={className} style={{ padding: 28, backgroundColor: tokens.colors.neutral[50], minHeight: '100%', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' as const, ...style }}>
        {renderHeader()}
        {renderFilterBar()}
        {showGlobalEmpty ? (
          <div style={{ backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.neutral[100]}`, boxShadow: tokens.shadows.sm, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '64px 32px', textAlign: 'center' as const }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: tokens.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Briefcase size={30} color={tokens.colors.primaryScale[400]} />
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], marginBottom: 8 }}>{emptyText}</div>
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Try adjusting your filters or search query.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16, flex: 1, overflowX: 'auto' as const, paddingBottom: 8 }}>
            {STATUS_COLUMNS.map(col => renderKanbanColumn(col))}
          </div>
        )}
      </div>
    );
  },
});
