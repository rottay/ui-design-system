'use client';

/**
 * BhInterviewCenter - List Preset
 * Sortable table view with status badges, type indicators,
 * stats bar, filter pills, search, and row actions.
 * Personality-driven, glass-aware, fully accessible.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhInterviewCenterProps, InterviewItem, InterviewType, InterviewStatus, InterviewFilter, SortDirection } from '../../core';
import { BH_INTERVIEW_CENTER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Calendar, List, Clock, Bot, User, Plus, ChevronDown, ChevronUp, X, Filter, Search,
  TrendingUp, TrendingDown, CheckCircle2, XCircle, Timer, BarChart3, CalendarDays,
  Star, Eye, ExternalLink, ArrowUpDown, Activity,
} from 'lucide-react';

type ScaleKey = 'infoScale' | 'warningScale' | 'successScale' | 'neutral' | 'errorScale' | 'secondaryScale' | 'primaryScale';

const STATUS_MAP: Record<InterviewStatus, { label: string; scale: ScaleKey }> = {
  scheduled: { label: 'Scheduled', scale: 'infoScale' },
  in_progress: { label: 'In Progress', scale: 'warningScale' },
  completed: { label: 'Completed', scale: 'successScale' },
  cancelled: { label: 'Cancelled', scale: 'neutral' },
  no_show: { label: 'No Show', scale: 'errorScale' },
};

const TYPE_MAP: Record<InterviewType, { label: string; scale: ScaleKey }> = {
  ai: { label: 'AI', scale: 'infoScale' },
  human: { label: 'Human', scale: 'secondaryScale' },
};

const statusCfg = (t: DesignTokens, s: InterviewStatus) => {
  const { scale } = STATUS_MAP[s];
  const sc = (t.colors as any)[scale];
  return { label: STATUS_MAP[s].label, color: sc[700] ?? sc[600], bg: sc[50] ?? sc[100], border: sc[200], dot: sc[500] ?? sc[400] };
};

const typeCfg = (t: DesignTokens, ty: InterviewType) => {
  const { scale } = TYPE_MAP[ty];
  const sc = (t.colors as any)[scale];
  return { label: TYPE_MAP[ty].label, color: sc[700], bg: sc[100], border: sc[200] };
};

function fmtTime(d: string) { const x = new Date(d), h = x.getHours(), m = x.getMinutes(); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; }
function fmtDate(d: string) { const x = new Date(d); return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][x.getMonth()]} ${x.getDate()}`; }

const TABLE_COLUMNS = [
  { key: 'candidateName', label: 'Candidate', sortable: true },
  { key: 'jobTitle', label: 'Position', sortable: true },
  { key: 'stageName', label: 'Stage', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'dateTime', label: 'Date & Time', sortable: true },
  { key: 'duration', label: 'Duration', sortable: true },
  { key: 'score', label: 'Score', sortable: true },
  { key: 'interviewer', label: 'Interviewer', sortable: false },
  { key: 'actions', label: '', sortable: false },
];

const GRID_COLS = '1fr 1fr 100px 90px 120px 160px 90px 80px 1fr 80px';

export const ListBhInterviewCenter = createPreset<BhInterviewCenterProps>({
  name: 'BhInterviewCenter.List',
  render: ({ primitives, props, tokens }: PresetContext<BhInterviewCenterProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const isGlass = t.surface.useGlass;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const { interviews, stats, filters: cFilters, onFilterChange, selectedInterview: cSel, onInterviewSelect, onScheduleNew, sortBy: cSort, sortDirection: cDir, onSortChange, className, style } = props;

    const [iFilters, setIFilters] = useState<InterviewFilter>({});
    const [iSel, setISel] = useState<string | null>(null);
    const [iSort, setISort] = useState(BH_INTERVIEW_CENTER_DEFAULTS.sortBy ?? 'dateTime');
    const [iDir, setIDir] = useState<SortDirection>(BH_INTERVIEW_CENTER_DEFAULTS.sortDirection ?? 'asc');
    const [search, setSearch] = useState('');
    const [hovered, setHovered] = useState<string | null>(null);


    const filters = cFilters ?? iFilters;
    const sel = cSel ?? iSel;
    const sortBy = cSort ?? iSort;
    const sortDir = cDir ?? iDir;

    const glassCard = useMemo(() =>
      isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg, border: `${bdr} ${t.glass.border}` } : {},
      [isGlass, t, bdr]
    );

    const handleFilter = useCallback((f: InterviewFilter) => { if (!cFilters) setIFilters(f); onFilterChange?.(f); }, [cFilters, onFilterChange]);
    const handleSelect = useCallback((id: string | null) => { if (cSel === undefined) setISel(id); onInterviewSelect?.(id); }, [cSel, onInterviewSelect]);
    const handleSort = useCallback((field: string) => {
      const dir = field === sortBy && sortDir === 'asc' ? 'desc' : 'asc';
      if (!cSort) { setISort(field); setIDir(dir); }
      onSortChange?.(field, dir);
    }, [sortBy, sortDir, cSort, onSortChange]);

    const filtered = useMemo(() => {
      let r = [...interviews];
      if (filters.status) r = r.filter(i => i.status === filters.status);
      if (filters.type) r = r.filter(i => i.type === filters.type);
      if (filters.dateRange) { const [s, e] = filters.dateRange; r = r.filter(i => { const d = new Date(i.dateTime); return d >= new Date(s) && d <= new Date(e); }); }
      if (search) { const q = search.toLowerCase(); r = r.filter(i => [i.candidateName, i.jobTitle, i.stageName, i.recruiterName, i.agentName].some(v => v?.toLowerCase().includes(q))); }
      r.sort((a, b) => {
        let av: number | string = 0, bv: number | string = 0;
        switch (sortBy) {
          case 'dateTime': av = new Date(a.dateTime).getTime(); bv = new Date(b.dateTime).getTime(); break;
          case 'candidateName': av = a.candidateName.toLowerCase(); bv = b.candidateName.toLowerCase(); break;
          case 'jobTitle': av = a.jobTitle.toLowerCase(); bv = b.jobTitle.toLowerCase(); break;
          case 'stageName': av = a.stageName.toLowerCase(); bv = b.stageName.toLowerCase(); break;
          case 'duration': av = a.duration; bv = b.duration; break;
          case 'score': av = a.score ?? 0; bv = b.score ?? 0; break;
          case 'type': av = a.type; bv = b.type; break;
          case 'status': { const o: Record<InterviewStatus, number> = { scheduled: 0, in_progress: 1, completed: 2, cancelled: 3, no_show: 4 }; av = o[a.status]; bv = o[b.status]; break; }
          default: av = new Date(a.dateTime).getTime(); bv = new Date(b.dateTime).getTime();
        }
        if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
        return sortDir === 'asc' ? av - (bv as number) : (bv as number) - av;
      });
      return r;
    }, [interviews, filters, search, sortBy, sortDir]);

    const pillStyle = useCallback((active: boolean): React.CSSProperties => ({
      display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
      padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: badgeRadius,
      fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
      border: `${bdr} ${active ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
      backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
      color: active ? t.colors.primaryScale[600] : t.colors.neutral[600],
      cursor: 'pointer', transition: `all ${t.motion.hover}`,
    }), [t, bdr, badgeRadius]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    const statuses: (InterviewStatus | null)[] = useMemo(() => [null, 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'], []);
    const types: (InterviewType | null)[] = useMemo(() => [null, 'ai', 'human'], []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);
    const clearSearch = useCallback(() => setSearch(''), []);

    return (
      <Box className={className} style={{ padding: t.spacing[6], backgroundColor: t.colors.neutral[50], minHeight: '100%', width: '100%', ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4], ...animStyle(0) }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], lineHeight: t.typography.lineHeight.tight, letterSpacing: ptypo.headingLetterSpacing }}>
              Interview Center
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
              Manage and track all interviews across your pipeline
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            {onScheduleNew && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Schedule new interview"
                onClick={onScheduleNew}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onScheduleNew(); } }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, cursor: 'pointer', transition: `all ${t.motion.hover}`, boxShadow: t.shadows.sm }}
              >
                <Plus size={16} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white, fontWeight: t.typography.fontWeight.semibold }}>Schedule Interview</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Stats */}
        {stats && (
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], flexWrap: 'wrap' as const, padding: `${t.spacing[3]}px ${t.spacing[4]}px`, marginBottom: t.spacing[4], ...createCardStyle(t, { elevation: 'sm', glass: isGlass }), borderRadius: t.borderRadius.lg, ...glassCard }} role="region" aria-label="Interview statistics">
            {[
              { label: 'Scheduled', value: stats.scheduledToday, icon: <CalendarDays size={14} />, scale: 'infoScale' },
              { label: 'In Progress', value: stats.inProgress, icon: <Activity size={14} />, scale: 'warningScale' },
              { label: 'Completed', value: stats.completedToday, icon: <CheckCircle2 size={14} />, scale: 'successScale' },
              { label: 'No Shows', value: stats.noShows, icon: <XCircle size={14} />, scale: 'errorScale' },
              { label: 'Avg Duration', value: `${stats.avgDuration}m`, icon: <Timer size={14} />, scale: 'secondaryScale' },
              { label: 'Completion', value: `${stats.completionRate}%`, icon: <BarChart3 size={14} />, scale: 'primaryScale' },
            ].map((it, i) => {
              const sc = (t.colors as any)[it.scale];
              return (
                <Box key={i} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: badgeRadius, backgroundColor: sc[50], border: `${bdr} ${t.colors.neutral[100]}` }}>
                  <Box style={{ color: sc[600], display: 'flex', alignItems: 'center' }}>{it.icon}</Box>
                  <Text style={{ ...sectionLabel, marginBottom: 0 }}>{it.label}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>{it.value}</Text>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Toolbar */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3], flexWrap: 'wrap' as const }} role="toolbar" aria-label="Interview filters">
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            <Filter size={14} color={t.colors.neutral[400]} />
            {statuses.map(s => {
              const a = filters.status === s || (s === null && !filters.status);
              return (
                <Box key={s ?? 'all'} role="button" tabIndex={0} aria-label={s === null ? 'All statuses' : STATUS_MAP[s].label} aria-pressed={a} onClick={() => handleFilter({ ...filters, status: s })} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilter({ ...filters, status: s }); } }} style={pillStyle(a)}>
                  {s !== null && <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: statusCfg(t, s).dot, flexShrink: 0 }} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{s === null ? 'All' : STATUS_MAP[s].label}</Text>
                </Box>
              );
            })}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            {types.map(ty => {
              const a = filters.type === ty || (ty === null && !filters.type);
              return (
                <Box key={ty ?? 'all-types'} role="button" tabIndex={0} aria-label={ty === null ? 'All types' : TYPE_MAP[ty].label} aria-pressed={a} onClick={() => handleFilter({ ...filters, type: ty })} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilter({ ...filters, type: ty }); } }} style={pillStyle(a)}>
                  {ty === 'ai' && <Bot size={10} />}
                  {ty === 'human' && <User size={10} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{ty === null ? 'All' : TYPE_MAP[ty].label}</Text>
                </Box>
              );
            })}
          </Box>
          <Box style={{ flex: 1 }} />
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, minWidth: 200 }}>
            <Search size={14} color={t.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search interviews..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search interviews"
              style={{ border: 'none', outline: 'none', fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0, fontFamily: 'inherit' }}
            />
            {search && <Box role="button" tabIndex={0} aria-label="Clear search" onClick={clearSearch} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearSearch(); } }} style={{ cursor: 'pointer', display: 'flex' }}><X size={12} color={t.colors.neutral[400]} /></Box>}
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>
            {filtered.length} interview{filtered.length !== 1 ? 's' : ''}
          </Text>
        </Box>

        {/* Table */}
        <Box style={{ ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }), borderRadius: t.borderRadius.lg, overflow: 'hidden', ...glassCard }}>
          {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
          {/* Table Header */}
          <Box style={{ display: 'grid', gridTemplateColumns: GRID_COLS, padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50] }} role="row">
            {TABLE_COLUMNS.map(col => {
              const cur = sortBy === col.key;
              return (
                <Box key={col.key} role={col.sortable ? 'button' : undefined} tabIndex={col.sortable ? 0 : undefined} aria-label={col.sortable ? `Sort by ${col.label}` : undefined} onClick={() => col.sortable && handleSort(col.key)} onKeyDown={col.sortable ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); } } : undefined} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], ...sectionLabel, marginBottom: 0, color: cur ? t.colors.primaryScale[700] : t.colors.neutral[500], cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' as const, padding: `0 ${t.spacing[1]}px` }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{col.label}</Text>
                  {col.sortable && cur && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  {col.sortable && !cur && col.label && <ArrowUpDown size={10} style={{ opacity: 0.3 }} />}
                </Box>
              );
            })}
          </Box>

          {/* Table Body */}
          {filtered.length === 0 ? (
            <Box style={emptyState}>
              <Box style={createIconContainerStyle(t, { size: 64, color: t.colors.primaryScale[50] })}>
                <Calendar size={28} color={t.colors.primaryScale[400]} />
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, color: t.colors.neutral[800], marginBottom: t.spacing[2], marginTop: t.spacing[4] }}>No interviews found</Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginBottom: t.spacing[6], maxWidth: 360, lineHeight: t.typography.lineHeight.relaxed }}>
                {search || filters.status || filters.type ? 'Try adjusting your filters or search query.' : 'Schedule your first interview to get started.'}
              </Text>
            </Box>
          ) : filtered.map((iv, idx) => {
            const sc = statusCfg(t, iv.status);
            const tc = typeCfg(t, iv.type);
            const isH = hovered === iv.id;
            const isS = sel === iv.id;

            return (
              <Box key={iv.id} role="row" aria-selected={isS} onClick={() => handleSelect(iv.id)} onMouseEnter={() => setHovered(iv.id)} onMouseLeave={() => setHovered(null)} style={{ display: 'grid', gridTemplateColumns: GRID_COLS, padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}`, backgroundColor: isS ? t.colors.primaryScale[50] : isH ? t.colors.neutral[50] : t.colors.common.white, cursor: 'pointer', transition: `all ${t.motion.hover}`, alignItems: 'center' }}>
                {/* Candidate */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `0 ${t.spacing[1]}px`, minWidth: 0 }}>
                  <Box style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={14} color={t.colors.primaryScale[600]} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900], whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{iv.candidateName}</Text>
                </Box>
                {/* Position */}
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], padding: `0 ${t.spacing[1]}px`, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{iv.jobTitle}</Text>
                {/* Stage */}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium, padding: `0 ${t.spacing[1]}px` }}>{iv.stageName}</Text>
                {/* Type */}
                <Box style={{ padding: `0 ${t.spacing[1]}px` }}>
                  <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[0]}px ${t.spacing[2]}px`, borderRadius: badgeRadius, backgroundColor: tc.bg, border: `${bdr} ${tc.border}` }}>
                    <Text style={{ fontSize: '10px', fontWeight: t.typography.fontWeight.medium, color: tc.color }}>{tc.label}</Text>
                  </Box>
                </Box>
                {/* Status */}
                <Box style={{ padding: `0 ${t.spacing[1]}px` }}>
                  <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[0]}px ${t.spacing[2]}px`, borderRadius: badgeRadius, backgroundColor: sc.bg, border: `${bdr} ${sc.border}` }}>
                    <Box style={{ width: 5, height: 5, borderRadius: t.borderRadius.full, backgroundColor: sc.dot }} />
                    <Text style={{ fontSize: '10px', fontWeight: t.typography.fontWeight.medium, color: sc.color }}>{sc.label}</Text>
                  </Box>
                </Box>
                {/* DateTime */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], padding: `0 ${t.spacing[1]}px` }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{fmtDate(iv.dateTime)}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{fmtTime(iv.dateTime)}</Text>
                </Box>
                {/* Duration */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `0 ${t.spacing[1]}px` }}>
                  <Clock size={12} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>{iv.duration}m</Text>
                </Box>
                {/* Score */}
                <Box style={{ padding: `0 ${t.spacing[1]}px` }}>
                  {iv.score !== undefined ? (
                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Star size={12} color={iv.score >= 80 ? t.colors.successScale[500] : iv.score >= 60 ? t.colors.warningScale[500] : t.colors.errorScale[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: iv.score >= 80 ? t.colors.successScale[700] : iv.score >= 60 ? t.colors.warningScale[700] : t.colors.errorScale[700] }}>{iv.score}</Text>
                    </Box>
                  ) : (
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>--</Text>
                  )}
                </Box>
                {/* Interviewer */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `0 ${t.spacing[1]}px`, overflow: 'hidden' }}>
                  {iv.type === 'ai' ? <Bot size={12} color={t.colors.infoScale[500]} /> : <User size={12} color={t.colors.secondaryScale[500]} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {iv.type === 'ai' ? (iv.agentName ?? 'AI Agent') : (iv.recruiterName ?? 'Unassigned')}
                  </Text>
                </Box>
                {/* Actions */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], opacity: isH ? 1 : 0, transition: `opacity ${t.motion.hover}`, padding: `0 ${t.spacing[1]}px` }}>
                  <Box role="button" tabIndex={0} aria-label={`View details for ${iv.candidateName}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelect(iv.id); }} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleSelect(iv.id); } }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <Eye size={12} />
                  </Box>
                  <Box role="button" tabIndex={0} aria-label={`Open profile for ${iv.candidateName}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <ExternalLink size={12} />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
        </Box>
      </Box>
    );
  },
});
