'use client';

/**
 * BhInterviewCenter - List Preset
 * Sortable table view with status badges, mode indicators,
 * stats bar, filter pills, search, and row actions.
 * Personality-driven, glass-aware, fully accessible.
 *
 * Uses DBInterview from @rottay/recruiter (single source of truth).
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
import type { BhInterviewCenterProps, InterviewDisplayStatus, InterviewDisplayMode, InterviewFilter, SortDirection } from '../../core';
import { BH_INTERVIEW_CENTER_DEFAULTS, isAiInterview, getInterviewModeLabel, getInterviewStatusLabel, getInterviewDateStr, getInterviewDuration, getInterviewScore } from '../../core';
import type { DBInterview } from '@rottay/recruiter';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Calendar, List, Clock, Bot, User, Plus, ChevronDown, ChevronUp, X, Filter, Search,
  TrendingUp, TrendingDown, CheckCircle2, XCircle, Timer, BarChart3, CalendarDays,
  Star, Eye, ExternalLink, ArrowUpDown, Activity, Phone, Video, MapPin,
} from 'lucide-react';

type ScaleKey = 'infoScale' | 'warningScale' | 'successScale' | 'neutral' | 'errorScale' | 'secondaryScale' | 'primaryScale';

const STATUS_MAP: Record<string, { label: string; scale: ScaleKey }> = {
  pending: { label: 'Pending', scale: 'warningScale' },
  scheduled: { label: 'Scheduled', scale: 'infoScale' },
  invitation_sent: { label: 'Invited', scale: 'infoScale' },
  ready: { label: 'Ready', scale: 'primaryScale' },
  in_progress: { label: 'In Progress', scale: 'warningScale' },
  completed: { label: 'Completed', scale: 'successScale' },
  scored: { label: 'Scored', scale: 'successScale' },
  approved: { label: 'Approved', scale: 'successScale' },
  cancelled: { label: 'Cancelled', scale: 'neutral' },
  expired: { label: 'Expired', scale: 'neutral' },
  no_show: { label: 'No Show', scale: 'errorScale' },
  technical_issue: { label: 'Tech Issue', scale: 'errorScale' },
  candidate_declined: { label: 'Declined', scale: 'errorScale' },
};

const MODE_MAP: Record<string, { label: string; scale: ScaleKey }> = {
  ai_voice: { label: 'AI Voice', scale: 'infoScale' },
  ai_chat: { label: 'AI Chat', scale: 'infoScale' },
  human_video: { label: 'Video', scale: 'secondaryScale' },
  human_phone: { label: 'Phone', scale: 'secondaryScale' },
  in_person: { label: 'In Person', scale: 'secondaryScale' },
};

const statusCfg = (t: DesignTokens, s: string | null | undefined) => {
  const entry = STATUS_MAP[s ?? ''] ?? { label: 'Unknown', scale: 'neutral' as ScaleKey };
  const sc = (t.colors as any)[entry.scale];
  return { label: entry.label, color: sc?.[700] ?? sc?.[600], bg: sc?.[50] ?? sc?.[100], border: sc?.[200], dot: sc?.[500] ?? sc?.[400] };
};

const modeCfg = (t: DesignTokens, m: string | null | undefined) => {
  const entry = MODE_MAP[m ?? ''] ?? { label: 'Unknown', scale: 'neutral' as ScaleKey };
  const sc = (t.colors as any)[entry.scale];
  return { label: entry.label, color: sc?.[700], bg: sc?.[100], border: sc?.[200] };
};

/** Safe display name extraction from metadata jsonb or fallback */
function getDisplayName(iv: DBInterview, field: string, fallback: string): string {
  const meta = iv.metadata as Record<string, unknown> | null | undefined;
  if (meta && typeof meta === 'object' && typeof (meta as any)[field] === 'string') {
    return (meta as any)[field] as string;
  }
  return fallback;
}

function fmtTime(d: string | Date | null | undefined) {
  if (!d) return '--';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '--';
  const h = x.getHours(), m = x.getMinutes();
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return '--';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '--';
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][x.getMonth()]} ${x.getDate()}`;
}

const TABLE_COLUMNS = [
  { key: 'candidateName', label: 'Candidate', sortable: true },
  { key: 'jobTitle', label: 'Position', sortable: true },
  { key: 'stageName', label: 'Stage', sortable: true },
  { key: 'mode', label: 'Mode', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'scheduledAt', label: 'Date & Time', sortable: true },
  { key: 'duration', label: 'Duration', sortable: true },
  { key: 'score', label: 'Score', sortable: true },
  { key: 'interviewer', label: 'Interviewer', sortable: false },
  { key: 'actions', label: '', sortable: false },
];

const GRID_COLS = '1fr 1fr 100px 100px 120px 160px 90px 80px 1fr 80px';

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

    const { interviews = [], stats, filters: cFilters, onFilterChange, selectedInterview: cSel, onInterviewSelect, onScheduleNew, sortBy: cSort, sortDirection: cDir, onSortChange, className, style } = props;

    const [iFilters, setIFilters] = useState<InterviewFilter>({});
    const [iSel, setISel] = useState<string | null>(null);
    const [iSort, setISort] = useState(BH_INTERVIEW_CENTER_DEFAULTS.sortBy ?? 'scheduledAt');
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
      if (filters.mode) {
        const isAiMode = filters.mode === 'ai_voice' || filters.mode === 'ai_chat';
        if (isAiMode) {
          r = r.filter(i => i.interviewMode === 'ai_voice' || i.interviewMode === 'ai_chat');
        } else {
          r = r.filter(i => i.interviewMode === filters.mode);
        }
      }
      if (filters.dateRange) {
        const [s, e] = filters.dateRange;
        r = r.filter(i => {
          const dateStr = getInterviewDateStr(i);
          const d = new Date(dateStr);
          return d >= new Date(s) && d <= new Date(e);
        });
      }
      if (search) {
        const q = search.toLowerCase();
        r = r.filter(i => {
          const candidateName = getDisplayName(i, 'candidateName', '');
          const jobTitle = getDisplayName(i, 'jobTitle', '');
          const stageName = getDisplayName(i, 'stageName', '');
          const interviewerName = i.interviewerName ?? '';
          return [candidateName, jobTitle, stageName, interviewerName].some(v => v.toLowerCase().includes(q));
        });
      }
      r.sort((a, b) => {
        let av: number | string = 0, bv: number | string = 0;
        switch (sortBy) {
          case 'scheduledAt': av = new Date(getInterviewDateStr(a)).getTime(); bv = new Date(getInterviewDateStr(b)).getTime(); break;
          case 'candidateName': av = getDisplayName(a, 'candidateName', '').toLowerCase(); bv = getDisplayName(b, 'candidateName', '').toLowerCase(); break;
          case 'jobTitle': av = getDisplayName(a, 'jobTitle', '').toLowerCase(); bv = getDisplayName(b, 'jobTitle', '').toLowerCase(); break;
          case 'stageName': av = getDisplayName(a, 'stageName', '').toLowerCase(); bv = getDisplayName(b, 'stageName', '').toLowerCase(); break;
          case 'duration': av = getInterviewDuration(a); bv = getInterviewDuration(b); break;
          case 'score': av = getInterviewScore(a) ?? 0; bv = getInterviewScore(b) ?? 0; break;
          case 'mode': av = a.interviewMode ?? ''; bv = b.interviewMode ?? ''; break;
          case 'status': av = a.status ?? ''; bv = b.status ?? ''; break;
          default: av = new Date(getInterviewDateStr(a)).getTime(); bv = new Date(getInterviewDateStr(b)).getTime();
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

    const statusOptions: (InterviewDisplayStatus | null)[] = useMemo(() => [null, 'pending', 'scheduled', 'invitation_sent', 'ready', 'in_progress', 'completed', 'scored', 'approved', 'cancelled', 'expired', 'no_show', 'technical_issue', 'candidate_declined'], []);
    const modeGroups: ({ key: string; label: string; icon?: React.ReactNode } | null)[] = useMemo(() => [
      null,
      { key: 'ai', label: 'AI' },
      { key: 'human', label: 'Human' },
    ], []);

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
            {statusOptions.slice(0, 8).map(s => {
              const a = filters.status === s || (s === null && !filters.status);
              const entry = s ? STATUS_MAP[s] : null;
              return (
                <Box key={s ?? 'all'} role="button" tabIndex={0} aria-label={s === null ? 'All statuses' : (entry?.label ?? s)} aria-pressed={a} onClick={() => handleFilter({ ...filters, status: s as InterviewDisplayStatus | undefined })} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilter({ ...filters, status: s as InterviewDisplayStatus | undefined }); } }} style={pillStyle(a)}>
                  {s !== null && <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: statusCfg(t, s).dot, flexShrink: 0 }} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{s === null ? 'All' : (entry?.label ?? s)}</Text>
                </Box>
              );
            })}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            {modeGroups.map(mg => {
              const key = mg?.key ?? 'all-modes';
              const isAiFilter = filters.mode === 'ai_voice' || filters.mode === 'ai_chat';
              const isHumanFilter = filters.mode === 'human_video' || filters.mode === 'human_phone' || filters.mode === 'in_person';
              const a = mg === null ? !filters.mode : mg.key === 'ai' ? isAiFilter : isHumanFilter;
              return (
                <Box key={key} role="button" tabIndex={0} aria-label={mg === null ? 'All modes' : mg.label} aria-pressed={a} onClick={() => {
                  if (mg === null) handleFilter({ ...filters, mode: undefined });
                  else if (mg.key === 'ai') handleFilter({ ...filters, mode: 'ai_voice' as InterviewDisplayMode });
                  else handleFilter({ ...filters, mode: 'human_video' as InterviewDisplayMode });
                }} onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (mg === null) handleFilter({ ...filters, mode: undefined });
                    else if (mg.key === 'ai') handleFilter({ ...filters, mode: 'ai_voice' as InterviewDisplayMode });
                    else handleFilter({ ...filters, mode: 'human_video' as InterviewDisplayMode });
                  }
                }} style={pillStyle(a)}>
                  {mg?.key === 'ai' && <Bot size={10} />}
                  {mg?.key === 'human' && <User size={10} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{mg === null ? 'All' : mg.label}</Text>
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
                {search || filters.status || filters.mode ? 'Try adjusting your filters or search query.' : 'Schedule your first interview to get started.'}
              </Text>
            </Box>
          ) : filtered.map((iv, idx) => {
            const sc = statusCfg(t, iv.status);
            const mc = modeCfg(t, iv.interviewMode);
            const isH = hovered === iv.id;
            const isS = sel === iv.id;
            const candidateName = getDisplayName(iv, 'candidateName', 'Candidate');
            const jobTitle = getDisplayName(iv, 'jobTitle', 'Position');
            const stageName = getDisplayName(iv, 'stageName', '--');
            const dateStr = getInterviewDateStr(iv);
            const duration = getInterviewDuration(iv);
            const score = getInterviewScore(iv);
            const isAi = isAiInterview(iv);

            return (
              <Box key={iv.id} role="row" aria-selected={isS} onClick={() => handleSelect(iv.id)} onMouseEnter={() => setHovered(iv.id)} onMouseLeave={() => setHovered(null)} style={{ display: 'grid', gridTemplateColumns: GRID_COLS, padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}`, backgroundColor: isS ? t.colors.primaryScale[50] : isH ? t.colors.neutral[50] : t.colors.common.white, cursor: 'pointer', transition: `all ${t.motion.hover}`, alignItems: 'center' }}>
                {/* Candidate */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `0 ${t.spacing[1]}px`, minWidth: 0 }}>
                  <Box style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={14} color={t.colors.primaryScale[600]} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900], whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidateName}</Text>
                </Box>
                {/* Position */}
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], padding: `0 ${t.spacing[1]}px`, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobTitle}</Text>
                {/* Stage */}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium, padding: `0 ${t.spacing[1]}px` }}>{stageName}</Text>
                {/* Mode */}
                <Box style={{ padding: `0 ${t.spacing[1]}px` }}>
                  <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[0]}px ${t.spacing[2]}px`, borderRadius: badgeRadius, backgroundColor: mc.bg, border: `${bdr} ${mc.border}` }}>
                    <Text style={{ fontSize: '10px', fontWeight: t.typography.fontWeight.medium, color: mc.color }}>{mc.label}</Text>
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
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{fmtDate(dateStr)}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{fmtTime(dateStr)}</Text>
                </Box>
                {/* Duration */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `0 ${t.spacing[1]}px` }}>
                  <Clock size={12} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>{duration}m</Text>
                </Box>
                {/* Score */}
                <Box style={{ padding: `0 ${t.spacing[1]}px` }}>
                  {score !== undefined ? (
                    <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Star size={12} color={score >= 80 ? t.colors.successScale[500] : score >= 60 ? t.colors.warningScale[500] : t.colors.errorScale[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: score >= 80 ? t.colors.successScale[700] : score >= 60 ? t.colors.warningScale[700] : t.colors.errorScale[700] }}>{score}</Text>
                    </Box>
                  ) : (
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>--</Text>
                  )}
                </Box>
                {/* Interviewer */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `0 ${t.spacing[1]}px`, overflow: 'hidden' }}>
                  {isAi ? <Bot size={12} color={t.colors.infoScale[500]} /> : <User size={12} color={t.colors.secondaryScale[500]} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isAi ? (getDisplayName(iv, 'agentName', 'AI Agent')) : (iv.interviewerName ?? 'Unassigned')}
                  </Text>
                </Box>
                {/* Actions */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], opacity: isH ? 1 : 0, transition: `opacity ${t.motion.hover}`, padding: `0 ${t.spacing[1]}px` }}>
                  <Box role="button" tabIndex={0} aria-label={`View details for ${candidateName}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelect(iv.id); }} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleSelect(iv.id); } }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <Eye size={12} />
                  </Box>
                  <Box role="button" tabIndex={0} aria-label={`Open profile for ${candidateName}`} onClick={(e: React.MouseEvent) => { e.stopPropagation(); }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
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
