'use client';

/**
 * BhJobBoard - Kanban Preset
 * Slite-inspired kanban board with columns by status, drag-and-drop cards,
 * warm tones, generous whitespace, and color-coded pipeline mini-bars.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle, createHoverStyle, createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles, createIconContainerStyle,
  getPersonalityTypography, getPersonalityBadgeRadius, getCardPadding,
  createPersonalityAccentBar,

  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhJobBoardProps, JobItem, JobStatus, JobUrgency, JobBoardFilter, ViewMode } from '../../core';
import { BH_JOB_BOARD_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase, Plus, Search, LayoutGrid, List, Columns3, MapPin, Clock,
  Users, Eye, Pencil, AlertCircle, Globe, X, GripVertical, Building2, Check,
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
  return STAGE_SCALE_KEYS.map((k, i) => tokens.colors[k][k === 'errorScale' ? 400 : 500]);
}

/* ------------------------------------------------------------------ */
/*  Kanban Preset                                                       */
/* ------------------------------------------------------------------ */

export const KanbanBhJobBoard = createPreset<BhJobBoardProps>({
  name: 'BhJobBoard.Kanban',
  render: ({ primitives, props, tokens, engine, ext }: PresetContext<BhJobBoardProps>) => {
    const { Box, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const STATUS_COLUMNS = useMemo(() => getStatusColumns(tokens), [tokens]);
    const URGENCY_CONFIG = useMemo(() => getUrgencyConfig(tokens), [tokens]);
    const STAGE_COLORS = useMemo(() => getStageColors(tokens), [tokens]);

    const {
      jobs: rawJobs = [], stats: rawStats = [], filters: controlledFilters, onFilterChange, onViewModeChange, onJobClick, onCreateJob,
      selectedJobs: controlledSelectedJobs, onSelectionChange, searchQuery: controlledSearchQuery, onSearchChange,
      emptyText = BH_JOB_BOARD_DEFAULTS.emptyText, departments: rawDepartments = [], clients: rawClients = [], className, style,
    } = props;

    const jobs = Array.isArray(rawJobs) ? rawJobs : [];
    const stats = Array.isArray(rawStats) ? rawStats : [];
    const departments = Array.isArray(rawDepartments) ? rawDepartments : [];
    const clients = Array.isArray(rawClients) ? rawClients : [];

    // Extension helpers
    const extEmptyState = ext.emptyState();
    const extA11y = ext.a11yConfig();

    const [internalFilters, setInternalFilters] = useState<JobBoardFilter>({});
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedJobs, setInternalSelectedJobs] = useState<string[]>([]);
    const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
    const [dragState, setDragState] = useState<{ jobId: string; fromStatus: JobStatus } | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<JobStatus | null>(null);
    const [showDeptDropdown, setShowDeptDropdown] = useState(false);

    const filters = controlledFilters ?? internalFilters;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const selectedJobs = controlledSelectedJobs ?? internalSelectedJobs;

    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const cardPadding = useMemo(() => getCardPadding(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);

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
      let result = [...(jobs as JobItem[])];
      if (filters.department) result = result.filter(j => j.department === filters.department);
      if (filters.urgency) result = result.filter(j => j.urgency === filters.urgency);
      if (filters.clientId) result = result.filter(j => j.clientName === clients.find(c => c.id === filters.clientId)?.name);
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(j => (j.title || '').toLowerCase().includes(lower) || (j.code || '').toLowerCase().includes(lower) || (j.department || '').toLowerCase().includes(lower) || (j.location || '').toLowerCase().includes(lower) || (j.clientName && j.clientName.toLowerCase().includes(lower)));
      }
      return result;
    }, [jobs, filters, searchQuery, clients]);

    const jobsByStatus = useMemo(() => {
      const grouped: Record<JobStatus, JobItem[]> = { draft: [], published: [], paused: [], closed: [] };
      filteredJobs.forEach(job => { if (grouped[job.status]) grouped[job.status].push(job); });
      Object.values(grouped).forEach(arr => arr.sort((a, b) => b.daysOpen - a.daysOpen));
      return grouped;
    }, [filteredJobs]);

    /* Kanban Card */
    const renderKanbanCard = (job: JobItem, idx: number) => {
      const urgencyCfg = URGENCY_CONFIG[job.urgency] || URGENCY_CONFIG.medium;
      const isHovered = hoveredJobId === job.id;
      const isDragging = dragState?.jobId === job.id;
      const isSelected = selectedJobs.includes(job.id);
      const itemEntrance = createEntranceAnimation(tokens, { index: idx });

      return (
        <Box key={job.id} role="button" tabIndex={0} aria-label={`${job.title} - ${urgencyCfg.label} urgency`} aria-grabbed={isDragging}
          draggable
          onDragStart={(e: React.DragEvent) => { e.dataTransfer.effectAllowed = 'move'; handleDragStart(job.id, job.status); }}
          onDragEnd={handleDragEnd}
          onClick={() => onJobClick?.(job.id)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onJobClick?.(job.id); } }}
          onMouseEnter={() => setHoveredJobId(job.id)} onMouseLeave={() => setHoveredJobId(null)}
          style={{
            ...cardBase, padding: tokens.spacing[4],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`,
            boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
            cursor: 'grab', opacity: isDragging ? 0.5 : 1,
            transform: isHovered && !isDragging ? 'translateY(-2px)' : 'none',
            transition: `all ${tokens.motion.hover}`, outline: 'none',
            ...itemEntrance.animate,
          }}>

          {/* Drag handle + urgency + checkbox */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <GripVertical size={12} color={tokens.colors.neutral[300]} />
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: urgencyCfg.bgColor, color: urgencyCfg.color, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${urgencyCfg.borderColor}` }}>
                <AlertCircle size={9} />
                <Text style={{ fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium, color: urgencyCfg.color }}>{urgencyCfg.label}</Text>
              </Box>
            </Box>
            <Box role="checkbox" tabIndex={0} aria-checked={isSelected} aria-label={`Select ${job.title}`}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelectionToggle(job.id); }}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); handleSelectionToggle(job.id); } }}
              style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`, backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `all ${tokens.motion.hover}`, flexShrink: 0, outline: 'none' }}>
              {isSelected && <Check size={8} color={tokens.colors.common.white} />}
            </Box>
          </Box>

          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: typo.headingWeight, letterSpacing: typo.headingLetterSpacing, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight, marginBottom: tokens.spacing[1] }}>{job.title}</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[3] }}>{job.code} - {job.department}</Text>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[3] }}>
            {job.isRemote ? <><Globe size={10} color={tokens.colors.neutral[500]} /><Text style={{ fontSize: '10px', color: tokens.colors.neutral[500] }}>Remote</Text></> : <><MapPin size={10} color={tokens.colors.neutral[500]} /><Text style={{ fontSize: '10px', color: tokens.colors.neutral[500] }}>{job.location}</Text></>}
            {job.clientName && <>
              <Text style={{ fontSize: '10px', color: tokens.colors.neutral[300] }}>-</Text>
              <Building2 size={10} color={tokens.colors.neutral[500]} />
              <Text style={{ fontSize: '10px', color: tokens.colors.neutral[500] }}>{job.clientName}</Text>
            </>}
          </Box>

          <Box style={{ marginBottom: tokens.spacing[3] }}>
            <Text style={{ fontSize: '10px', color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium, marginBottom: tokens.spacing[1] }}>{job.candidateCount} candidates</Text>
            {/* SVG mini-bar - allowed */}
            {(() => {
              const total = (job.candidatesByStage || []).reduce((sum, s) => sum + s.count, 0);
              if (total === 0) return <Box style={{ height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], width: '100%' }} />;
              const W = 160, H = 5;
              let x = 0;
              return (
                <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const, display: 'block' }}>
                  <rect x={0} y={0} width={W} height={H} fill={tokens.colors.neutral[100]} rx={2.5} />
                  {(job.candidatesByStage || []).map((stage, si) => { const w = (stage.count / total) * W; const cx = x; x += w; return <rect key={stage.stage} x={cx} y={0} width={w} height={H} fill={STAGE_COLORS[si % STAGE_COLORS.length]} rx={si === 0 ? 2.5 : 0} />; })}
                </svg>
              );
            })()}
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: tokens.spacing[3], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Clock size={10} color={job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500]} />
                <Text style={{ fontSize: '10px', fontWeight: tokens.typography.fontWeight.medium, color: job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500] }}>{job.daysOpen}d</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                {(job.recruiterAvatars || []).slice(0, 2).map((avatar, ai) => (
                  <Box key={ai} style={{ ...animStyle(ai), width: 22, height: 22, borderRadius: tokens.borderRadius.full, border: `2px solid ${tokens.colors.common.white}`, marginLeft: ai > 0 ? -7 : 0, backgroundColor: tokens.colors.primaryScale[100], backgroundImage: avatar ? `url(${avatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const, zIndex: 2 - ai }}>
                    {!avatar && <Users size={8} color={tokens.colors.primaryScale[600]} />}
                  </Box>
                ))}
                {(job.recruiterAvatars || []).length > 2 && (
                  <Box style={{ width: 22, height: 22, borderRadius: tokens.borderRadius.full, border: `2px solid ${tokens.colors.common.white}`, marginLeft: -7, backgroundColor: tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: '8px', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }}>+{(job.recruiterAvatars || []).length - 2}</Text>
                  </Box>
                )}
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], opacity: isHovered ? 1 : 0, transition: `opacity ${tokens.motion.hover}` }}>
              {[
                { icon: <Eye size={10} />, label: 'View', onClick: (e: React.MouseEvent) => { e.stopPropagation(); onJobClick?.(job.id); } },
                { icon: <Pencil size={10} />, label: 'Edit', onClick: (e: React.MouseEvent) => { e.stopPropagation(); } },
              ].map((act, i) => (
                <Box key={i} role="button" tabIndex={0} aria-label={act.label}
                  onClick={act.onClick}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act.onClick(e as any); } }}
                  style={{ ...animStyle(i), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], transition: `all ${tokens.motion.hover}`, outline: 'none' }}>
                  {act.icon}
                </Box>
              ))}
            </Box>
          </Box>
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
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[0], padding: tokens.spacing[1], borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.neutral[100] }}>
            {([{ mode: 'grid' as ViewMode, icon: <LayoutGrid size={14} /> }, { mode: 'table' as ViewMode, icon: <List size={14} /> }, { mode: 'kanban' as ViewMode, icon: <Columns3 size={14} /> }]).map(({ mode, icon }) => (
              <Box key={mode} role="button" tabIndex={0} aria-label={`${mode} view`} aria-pressed={mode === 'kanban'}
                onClick={() => onViewModeChange?.(mode)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewModeChange?.(mode); } }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, borderRadius: tokens.borderRadius.md, backgroundColor: mode === 'kanban' ? tokens.colors.common.white : 'transparent', color: mode === 'kanban' ? tokens.colors.neutral[900] : tokens.colors.neutral[500], transition: `all ${tokens.motion.hover}`, outline: 'none', boxShadow: mode === 'kanban' ? tokens.shadows.sm : 'none', fontFamily: 'inherit' }}>
                {icon}
              </Box>
            ))}
          </Box>
          {onCreateJob && (
            <Box role="button" tabIndex={0} aria-label="Create new job" onClick={onCreateJob}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCreateJob(); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`, borderRadius: tokens.borderRadius.lg, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, boxShadow: tokens.shadows.sm, outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
              <Plus size={16} color={tokens.colors.common.white} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>New Job</Text>
            </Box>
          )}
        </Box>
      </Box>
    );

    /* Filter bar */
    const renderFilterBar = () => (
      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[5], flexWrap: 'wrap' as const }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.lg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, minWidth: 220 }}>
          <Search size={14} color={tokens.colors.neutral[400]} />
          <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0, fontFamily: 'inherit' }} />
          {searchQuery && <Box role="button" tabIndex={0} aria-label="Clear search" onClick={() => handleSearchChange('')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSearchChange(''); } }} style={{ display: 'flex', cursor: 'pointer', outline: 'none' }}><X size={13} color={tokens.colors.neutral[400]} /></Box>}
        </Box>

        {departments.length > 0 && (
          <Box style={{ position: 'relative' as const }}>
            <Box role="button" tabIndex={0} aria-label="Filter by department" aria-expanded={showDeptDropdown}
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDeptDropdown(!showDeptDropdown); } }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.lg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filters.department ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`, backgroundColor: filters.department ? tokens.colors.primaryScale[50] : tokens.colors.common.white, color: filters.department ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, outline: 'none', fontFamily: 'inherit' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: filters.department ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600] }}>{filters.department ?? 'All Departments'}</Text>
            </Box>
            {showDeptDropdown && (
              <Box style={{ position: 'absolute' as const, top: '100%', left: 0, marginTop: tokens.spacing[1], minWidth: 180, backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.lg, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, zIndex: 50, padding: `${tokens.spacing[1]}px 0` }}>
                {[null, ...departments].map(dept => {
                  const isActive = dept === null ? !filters.department : filters.department === dept;
                  return (
                    <Box key={dept ?? 'all'} role="option" aria-selected={isActive}
                      onClick={() => { handleFilterChange({ ...filters, department: dept }); setShowDeptDropdown(false); }}
                      style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, fontSize: tokens.typography.fontSize.sm, color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700], backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent', cursor: 'pointer', transition: `all ${tokens.motion.hover}`, borderRadius: tokens.borderRadius.md, margin: `0 ${tokens.spacing[1]}px` }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700] }}>{dept ?? 'All Departments'}</Text>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {(['low', 'medium', 'high', 'critical'] as JobUrgency[]).map(urgency => {
          const isActive = filters.urgency === urgency;
          const cfg = URGENCY_CONFIG[urgency];
          return (
            <Box key={urgency} role="button" tabIndex={0} aria-label={`Filter urgency ${cfg.label}`} aria-pressed={isActive}
              onClick={() => handleFilterChange({ ...filters, urgency: isActive ? null : urgency })}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...filters, urgency: isActive ? null : urgency }); } }}
              style={{ display: 'inline-flex', alignItems: 'center', padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, backgroundColor: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[100], color: isActive ? tokens.colors.common.white : tokens.colors.neutral[600], outline: 'none', fontFamily: 'inherit', transition: `all ${tokens.motion.hover}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? tokens.colors.common.white : tokens.colors.neutral[600] }}>{cfg.label}</Text>
            </Box>
          );
        })}

        <Box style={{ flex: 1 }} />
        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} across {STATUS_COLUMNS.length} columns</Text>
      </Box>
    );

    /* Kanban Column */
    const renderKanbanColumn = (col: StatusColumnConfig, colIdx: number) => {
      const columnJobs = jobsByStatus[col.key];
      const isDraggedOver = dragOverColumn === col.key && dragState && dragState.fromStatus !== col.key;
      const colEntrance = createEntranceAnimation(tokens, { index: colIdx });

      return (
        <Box key={col.key}
          style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column' as const, maxHeight: '100%', ...colEntrance.animate, transition: colEntrance.transition }}
          onDragOver={(e: React.DragEvent) => handleDragOver(e, col.key)} onDragLeave={handleDragLeave} onDrop={() => handleDrop(col.key)}>
          {/* Column header */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, backgroundColor: col.headerBg, borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0`, borderTop: `3px solid ${col.accentBorder}` }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: col.dotColor, flexShrink: 0 }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: col.color }}>{col.label}</Text>
              <Box style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, padding: '0 6px', borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.common.white, boxShadow: tokens.shadows.sm }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: col.color }}>{columnJobs.length}</Text>
              </Box>
            </Box>
            {col.key === 'draft' && onCreateJob && (
              <Box role="button" tabIndex={0} aria-label="Create new job"
                onClick={() => onCreateJob()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCreateJob(); } }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], transition: `all ${tokens.motion.hover}`, outline: 'none' }}>
                <Plus size={12} />
              </Box>
            )}
          </Box>

          {/* Column body */}
          <Box style={{ flex: 1, backgroundColor: isDraggedOver ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isDraggedOver ? tokens.colors.primaryScale[300] : tokens.colors.neutral[100]}`, borderTop: 'none', borderRadius: `0 0 ${tokens.borderRadius.lg} ${tokens.borderRadius.lg}`, padding: tokens.spacing[2], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2], overflowY: 'auto' as const, transition: `all ${tokens.motion.hover}`, minHeight: 200 }}>
            {columnJobs.length === 0 ? (
              <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const }}>
                <Briefcase size={20} color={tokens.colors.neutral[300]} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[2] }}>No {col.label.toLowerCase()} jobs</Text>
                {isDraggedOver && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[500], fontWeight: tokens.typography.fontWeight.medium, marginTop: tokens.spacing[1] }}>Drop here to move</Text>}
              </Box>
            ) : columnJobs.map((job, idx) => renderKanbanCard(job, idx))}
            {isDraggedOver && columnJobs.length > 0 && <Box style={{ height: 2, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[400], margin: `${tokens.spacing[1]}px 0` }} />}
          </Box>
        </Box>
      );
    };

    const showGlobalEmpty = filteredJobs.length === 0 && !!(searchQuery || filters.department || filters.urgency || filters.clientId);

    return (
      <Box className={className} style={{ padding: tokens.spacing[7], backgroundColor: tokens.colors.neutral[50], minHeight: '100%', width: '100%', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' as const, ...entrance.animate, transition: entrance.transition, ...style }}
        {...(extA11y.ariaLabel ? { 'aria-label': extA11y.ariaLabel } : {})}>
        {accentBar && <Box style={accentBar} />}
        {ext.slot('header:start')}
        {ext.section('header', renderHeader)}
        {ext.slot('header:end')}
        {ext.slot('toolbar:start')}
        {ext.section('toolbar', renderFilterBar)}
        {ext.slot('toolbar:end')}
        {showGlobalEmpty ? (
          ext.hasSlot('empty') ? ext.slot('empty') : (
            <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${tokens.spacing[16]}px ${tokens.spacing[8]}px`, textAlign: 'center' as const }}>
              {extEmptyState?.icon || (
                <Box style={createIconContainerStyle(tokens, { size: 72, color: tokens.colors.primaryScale[50] })}>
                  <Briefcase size={30} color={tokens.colors.primaryScale[400]} />
                </Box>
              )}
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: typo.headingWeight, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[2], marginTop: tokens.spacing[5] }}>{extEmptyState?.title || emptyText}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{extEmptyState?.description || 'Try adjusting your filters or search query.'}</Text>
            </Box>
          )
        ) : (
          <Box style={{ display: 'flex', gap: tokens.spacing[4], flex: 1, overflowX: 'auto' as const, paddingBottom: tokens.spacing[2] }}>
            {STATUS_COLUMNS.map((col, i) => renderKanbanColumn(col, i))}
          </Box>
        )}
        {ext.slot('footer')}
      </Box>
    );
  },
});
