'use client';

/**
 * BhInterviewCenter - Timeline Preset
 * Horizontal day timeline with interview blocks positioned by time,
 * a "now" line indicator, status coloring, and interview detail on click.
 * Personality-driven, glass-aware, fully accessible.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSurfaceStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  getCardHoverShadow,
} from '../../../helpers';
import type { BhInterviewCenterProps, InterviewDisplayStatus, InterviewDisplayMode, InterviewFilter, SortDirection } from '../../core';
import { BH_INTERVIEW_CENTER_DEFAULTS, isAiInterview, getInterviewModeLabel, getInterviewStatusLabel, getInterviewDateStr, getInterviewDuration, getInterviewScore } from '../../core';
import type { DBInterview } from '@rottay/recruiter';
import type { DesignTokens } from '../../../../../core/types/tokens';
import { Calendar, List, Clock, Bot, User, Video, Plus, ChevronLeft, ChevronRight, X, Filter, Search, TrendingUp, TrendingDown, CheckCircle2, XCircle, Timer, BarChart3, CalendarDays, Star, ExternalLink, Activity } from 'lucide-react';

// ---- Config Maps ----

const STATUS_MAP: Record<string, { label: string; scale: string }> = {
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

const MODE_MAP: Record<string, { label: string; scale: string }> = {
  ai_voice: { label: 'AI Voice', scale: 'infoScale' },
  ai_chat: { label: 'AI Chat', scale: 'infoScale' },
  human_video: { label: 'Video', scale: 'secondaryScale' },
  human_phone: { label: 'Phone', scale: 'secondaryScale' },
  in_person: { label: 'In Person', scale: 'secondaryScale' },
};

/** Safe display name extraction from metadata jsonb or fallback */
function getDisplayName(iv: DBInterview, field: string, fallback: string): string {
  const meta = iv.metadata as Record<string, unknown> | null | undefined;
  if (meta && typeof meta === 'object' && typeof (meta as any)[field] === 'string') {
    return (meta as any)[field] as string;
  }
  return fallback;
}

function sc(t: DesignTokens, scale: string, shade: number) {
  return (t.colors as any)[scale]?.[shade] ?? (t.colors.neutral as any)[shade];
}

// ---- Date/Time Helpers ----

const fmtTime = (s: string) => { const d = new Date(s); const h = d.getHours(); const m = d.getMinutes(); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
function getWeekDays(date: Date) { const days: Date[] = []; const s = new Date(date); s.setDate(s.getDate() - date.getDay()); for (let i = 0; i < 7; i++) { const d = new Date(s); d.setDate(d.getDate() + i); days.push(d); } return days; }

const TL_START = 7, TL_END = 20, TL_HOURS = TL_END - TL_START, HOUR_W = 120, TL_W = TL_HOURS * HOUR_W;
const getTimePos = (s: string | Date | null | undefined) => { if (!s) return 0; const d = new Date(s); if (isNaN(d.getTime())) return 0; return Math.max(0, Math.min(1, ((d.getHours() - TL_START) * 60 + d.getMinutes()) / (TL_HOURS * 60))) * TL_W; };
const getDurW = (dur: number) => (dur / (TL_HOURS * 60)) * TL_W;
const getNowPos = () => { const n = new Date(); return Math.max(0, Math.min(1, ((n.getHours() - TL_START) * 60 + n.getMinutes()) / (TL_HOURS * 60))) * TL_W; };
const fmtHour = (h: number) => h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ---- Timeline Preset ----

export const TimelineBhInterviewCenter = createPreset<BhInterviewCenterProps>({
  name: 'BhInterviewCenter.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewCenterProps>) => {
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
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const { interviews: rawInterviews = [], stats, filters: controlledFilters, onFilterChange, selectedInterview: controlledSelectedInterview, onInterviewSelect, onScheduleNew, sortDirection: controlledSortDirection, className, style } = props;

    const interviews = Array.isArray(rawInterviews) ? rawInterviews : [];

    const [internalFilters, setInternalFilters] = useState<InterviewFilter>({});
    const [internalSelected, setInternalSelected] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [internalSortDir, setInternalSortDir] = useState<SortDirection>(BH_INTERVIEW_CENTER_DEFAULTS.sortDirection ?? 'asc');
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [nowPos, setNowPos] = useState(getNowPos());
    const timelineRef = useRef<HTMLDivElement>(null);


    const filters = controlledFilters ?? internalFilters;
    const selectedInterview = controlledSelectedInterview ?? internalSelected;
    const sortDirection = controlledSortDirection ?? internalSortDir;

    useEffect(() => { const iv = setInterval(() => setNowPos(getNowPos()), 60000); return () => clearInterval(iv); }, []);

    const glassCard = useMemo(() =>
      isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg, border: `${bdr} ${t.glass.border}` } : {},
      [isGlass, t, bdr]
    );
    const glassSurface = useMemo(() =>
      isGlass && t.glass ? { backdropFilter: t.glass.blurSm, WebkitBackdropFilter: t.glass.blurSm, backgroundColor: t.glass.bgLight, border: `${bdr} ${t.glass.borderLight}` } : {},
      [isGlass, t, bdr]
    );

    const handleFilterChange = useCallback((f: InterviewFilter) => { if (controlledFilters === undefined) setInternalFilters(f); onFilterChange?.(f); }, [controlledFilters, onFilterChange]);
    const handleSelect = useCallback((id: string | null) => { if (controlledSelectedInterview === undefined) setInternalSelected(id); onInterviewSelect?.(id); }, [controlledSelectedInterview, onInterviewSelect]);
    const handleStatusFilter = useCallback((s: InterviewDisplayStatus | null) => handleFilterChange({ ...filters, status: s }), [filters, handleFilterChange]);
    const handleModeFilter = useCallback((mode: InterviewDisplayMode | null) => handleFilterChange({ ...filters, mode: mode }), [filters, handleFilterChange]);
    const navigateDate = useCallback((dir: 'prev' | 'next' | 'today') => { if (dir === 'today') { setCurrentDate(new Date()); return; } const d = new Date(currentDate); d.setDate(d.getDate() + (dir === 'next' ? 7 : -7)); setCurrentDate(d); }, [currentDate]);

    const handleKeyNav = useCallback((e: React.KeyboardEvent, action: () => void) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); } }, []);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

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
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        r = r.filter(i => {
          const candidateName = getDisplayName(i, 'candidateName', '');
          const jobTitle = getDisplayName(i, 'jobTitle', '');
          const stageName = getDisplayName(i, 'stageName', '');
          return [candidateName, jobTitle, stageName].some(v => v.toLowerCase().includes(q));
        });
      }
      r.sort((a, b) => { const d = new Date(getInterviewDateStr(a)).getTime() - new Date(getInterviewDateStr(b)).getTime(); return sortDirection === 'asc' ? d : -d; });
      return r;
    }, [interviews, filters, searchQuery, sortDirection]);

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const byDay = useMemo(() => {
      const map: Record<string, DBInterview[]> = {};
      weekDays.forEach(d => { map[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] = []; });
      filtered.forEach(iv => { const d = new Date(getInterviewDateStr(iv)); const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; if (map[k]) map[k].push(iv); });
      return map;
    }, [filtered, weekDays]);

    const selectedData = useMemo(() => selectedInterview ? interviews.find(i => i.id === selectedInterview) ?? null : null, [selectedInterview, interviews]);
    const hasIvs = useMemo(() => weekDays.some(d => (byDay[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] || []).length > 0), [weekDays, byDay]);

    // ---- Sub-components ----

    const ChipBtn = useCallback(({ active, onClick, children, ariaLabel }: { active: boolean; onClick: () => void; children: React.ReactNode; ariaLabel: string }) => (
      <Box
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-pressed={active}
        onClick={onClick}
        onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, onClick)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
          borderRadius: badgeRadius,
          fontSize: t.typography.fontSize.xs,
          fontWeight: t.typography.fontWeight.medium,
          border: `${bdr} ${active ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
          backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
          color: active ? t.colors.primaryScale[600] : t.colors.neutral[600],
          cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none',
        }}
      >{children}</Box>
    ), [t, bdr, badgeRadius, handleKeyNav]);

    const NavBtn = useCallback(({ dir, onClick }: { dir: 'prev' | 'today' | 'next'; onClick: () => void }) => (
      <Box
        role="button"
        tabIndex={0}
        aria-label={dir === 'prev' ? 'Previous week' : dir === 'next' ? 'Next week' : 'Go to this week'}
        onClick={onClick}
        onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, onClick)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: dir === 'today' ? undefined : 28, height: 28,
          padding: dir === 'today' ? `${t.spacing[1]}px ${t.spacing[3]}px` : 0,
          borderRadius: t.borderRadius.md,
          border: `${bdr} ${t.colors.neutral[200]}`,
          backgroundColor: t.colors.common.white,
          color: t.colors.neutral[dir === 'today' ? 700 : 600],
          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
          cursor: 'pointer', outline: 'none', transition: `all ${t.motion.hover}`,
        }}
      >
        {dir === 'prev' ? <ChevronLeft size={14} /> : dir === 'next' ? <ChevronRight size={14} /> : 'This Week'}
      </Box>
    ), [t, bdr, handleKeyNav]);

    // ---- Stats Bar ----

    const renderStats = useCallback(() => {
      if (!stats) return null;
      const items = [
        { label: 'Scheduled', value: stats.scheduledToday, icon: <CalendarDays size={14} />, scale: 'infoScale' },
        { label: 'In Progress', value: stats.inProgress, icon: <Activity size={14} />, scale: 'warningScale', pulse: true },
        { label: 'Completed', value: stats.completedToday, icon: <CheckCircle2 size={14} />, scale: 'successScale' },
        { label: 'No Shows', value: stats.noShows, icon: <XCircle size={14} />, scale: 'errorScale' },
        { label: 'Avg Duration', value: `${stats.avgDuration}m`, icon: <Timer size={14} />, scale: 'secondaryScale' },
        { label: 'Completion', value: `${stats.completionRate}%`, icon: <BarChart3 size={14} />, scale: 'primaryScale', trend: stats.completionTrend },
      ];
      return (
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: `${t.spacing[3]}px ${t.spacing[4]}px`, ...createSurfaceStyle(t, { elevation: 'sm' }), backgroundColor: t.colors.common.white, marginBottom: t.spacing[4], flexWrap: 'wrap' as const, ...glassSurface }} role="region" aria-label="Interview statistics">
          {items.map((item, idx) => (
            <Box key={idx} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: badgeRadius, backgroundColor: sc(t, item.scale, 50), border: `${bdr} ${t.colors.neutral[100]}`, ...animStyle(idx) }}>
              <Box style={{ color: sc(t, item.scale, 600), display: 'flex', alignItems: 'center' }}>{item.icon}</Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>{item.label}</Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing }}>{item.value}</Text>
              {item.pulse && <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.warningScale[500], boxShadow: `0 0 0 2px ${t.colors.warningScale[100]}` }} />}
              {item.trend !== undefined && (
                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: '10px', fontWeight: t.typography.fontWeight.medium, color: item.trend >= 0 ? t.colors.successScale[600] : t.colors.errorScale[600] }}>
                  {item.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <Text style={{ fontSize: '10px', color: item.trend >= 0 ? t.colors.successScale[600] : t.colors.errorScale[600] }}>{Math.abs(item.trend)}%</Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      );
    }, [stats, t, glassSurface, bdr, badgeRadius, ptypo, animStyle]);

    // ---- Day Row ----

    const renderDayRow = useCallback((day: Date, dayIdx: number) => {
      const today = new Date(); const isToday = isSameDay(day, today);
      const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
      const dayIvs = byDay[key] || [];
      const sorted = [...dayIvs].sort((a, b) => new Date(getInterviewDateStr(a)).getTime() - new Date(getInterviewDateStr(b)).getTime());
      const tracks: DBInterview[][] = [];
      sorted.forEach(iv => { const iStart = new Date(getInterviewDateStr(iv)).getTime(); const dur = getInterviewDuration(iv); let placed = false; for (const tr of tracks) { const last = tr[tr.length - 1]; if (iStart >= new Date(getInterviewDateStr(last)).getTime() + getInterviewDuration(last) * 60000) { tr.push(iv); placed = true; break; } } if (!placed) tracks.push([iv]); });
      const trkH = 44; const rowH = Math.max(60, tracks.length * trkH + 16);

      return (
        <Box key={dayIdx} style={{ display: 'flex', minHeight: rowH, borderBottom: `${bdr} ${t.colors.neutral[100]}`, ...animStyle(dayIdx) }}>
          <Box style={{ width: 160, flexShrink: 0, padding: `${t.spacing[2]}px ${t.spacing[3]}px`, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', backgroundColor: isToday ? t.colors.primaryScale[50] : t.colors.common.white, borderRight: `${bdr} ${t.colors.neutral[200]}` }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: isToday ? t.colors.primaryScale[700] : t.colors.neutral[800], letterSpacing: ptypo.headingLetterSpacing }}>
                {DAY_NAMES[day.getDay()]}
              </Text>
              {isToday && <Box style={{ fontSize: '9px', fontWeight: t.typography.fontWeight.bold, color: t.colors.common.white, backgroundColor: t.colors.primaryScale[600], padding: `0 ${t.spacing[1]}px`, borderRadius: badgeRadius }}><Text style={{ fontSize: '9px', color: t.colors.common.white, fontWeight: t.typography.fontWeight.bold }}>TODAY</Text></Box>}
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: t.spacing[1] }}>{MONTHS[day.getMonth()]} {day.getDate()}</Text>
            {dayIvs.length > 0 && (
              <Box style={{ marginTop: t.spacing[1], fontSize: '10px', fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[600], backgroundColor: t.colors.primaryScale[100], padding: `0 ${t.spacing[1]}px`, borderRadius: badgeRadius, display: 'inline-block', width: 'fit-content' }}>
                <Text style={{ fontSize: '10px', color: t.colors.primaryScale[600], fontWeight: t.typography.fontWeight.medium }}>{dayIvs.length}</Text>
              </Box>
            )}
          </Box>
          <Box style={{ position: 'relative' as const, width: TL_W, flexShrink: 0, backgroundColor: isToday ? `${t.colors.primaryScale[50]}33` : 'transparent' }}>
            {Array.from({ length: TL_HOURS }).map((_, hIdx) => <Box key={hIdx} style={{ position: 'absolute' as const, left: hIdx * HOUR_W, top: 0, bottom: 0, width: 1, backgroundColor: t.colors.neutral[100] }} />)}
            {isToday && (
              <Box style={{ position: 'absolute' as const, left: nowPos, top: 0, bottom: 0, width: 2, backgroundColor: t.colors.errorScale[500], zIndex: 10 }} aria-label="Current time indicator">
                <Box style={{ position: 'absolute' as const, top: -4, left: -4, width: 10, height: 10, borderRadius: t.borderRadius.full, backgroundColor: t.colors.errorScale[500] }} />
              </Box>
            )}
            {tracks.map((track, tIdx) => track.map(iv => {
              const dateStr = getInterviewDateStr(iv);
              const left = getTimePos(dateStr); const width = Math.max(getDurW(getInterviewDuration(iv)), 60);
              const sCfg = STATUS_MAP[iv.status ?? ''] ?? { label: 'Unknown', scale: 'neutral' }; const isHov = hoveredId === iv.id; const isSel = selectedInterview === iv.id;
              const candidateName = getDisplayName(iv, 'candidateName', 'Candidate');
              return (
                <Box
                  key={iv.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Interview with ${candidateName}, ${sCfg.label}, ${fmtTime(dateStr)}`}
                  onClick={() => handleSelect(iv.id)}
                  onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => handleSelect(iv.id))}
                  onMouseEnter={() => setHoveredId(iv.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position: 'absolute' as const, left, top: 8 + tIdx * trkH, width, height: trkH - 8,
                    borderRadius: t.borderRadius.md,
                    backgroundColor: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 100 : 50),
                    border: isSel ? `${bdr} ${t.colors.primaryScale[500]}` : `${bdr} ${sc(t, sCfg.scale, 200)}`,
                    borderLeftWidth: 3, borderLeftColor: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 300 : 400),
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    cursor: 'pointer', transition: `all ${t.motion.hover}`, overflow: 'hidden' as const,
                    display: 'flex', alignItems: 'center', gap: t.spacing[2],
                    zIndex: isHov ? 5 : 1,
                    transform: isHov ? t.motion.transform : 'none',
                    boxShadow: isHov ? getCardHoverShadow(t, 'sm') : 'none',
                    outline: 'none',
                  }}
                >
                  <Box style={{ ...createIconContainerStyle(t, { size: 20 }), flexShrink: 0 }}>
                    {isAiInterview(iv) ? <Bot size={10} color={sc(t, 'infoScale', 700)} /> : <User size={10} color={sc(t, 'secondaryScale', 700)} />}
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], minWidth: 0, flex: 1 }}>
                    <Text style={{ fontSize: '11px', fontWeight: ptypo.headingWeight, color: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 600 : 700), whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, letterSpacing: ptypo.headingLetterSpacing }}>{candidateName}</Text>
                    <Text style={{ fontSize: '9px', color: t.colors.neutral[500], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{fmtTime(dateStr)} - {getInterviewDuration(iv)}m</Text>
                  </Box>
                  {(() => { const s = getInterviewScore(iv); return s !== undefined && width > 150 ? (
                    <Text style={{ fontSize: '9px', fontWeight: t.typography.fontWeight.bold, color: s >= 80 ? t.colors.successScale[700] : s >= 60 ? t.colors.warningScale[700] : t.colors.errorScale[700], flexShrink: 0 }}>{s}</Text>
                  ) : null; })()}
                </Box>
              );
            }))}
          </Box>
        </Box>
      );
    }, [byDay, hoveredId, selectedInterview, t, bdr, nowPos, badgeRadius, ptypo, animStyle, handleSelect, handleKeyNav]);

    // ---- Detail Popup ----

    const renderDetail = useCallback(() => {
      if (!selectedData) return null;
      const iv = selectedData;
      const sCfg = STATUS_MAP[iv.status ?? ''] ?? { label: 'Unknown', scale: 'neutral' };
      const isAi = isAiInterview(iv);
      const mCfg = MODE_MAP[iv.interviewMode ?? ''] ?? { label: 'Unknown', scale: 'neutral' };
      const candidateName = getDisplayName(iv, 'candidateName', 'Candidate');
      const jobTitle = getDisplayName(iv, 'jobTitle', 'Position');
      const stageName = getDisplayName(iv, 'stageName', '--');
      const dateStr = getInterviewDateStr(iv);
      const duration = getInterviewDuration(iv);
      const score = getInterviewScore(iv);
      const labelSt: React.CSSProperties = { ...sectionLabel, marginBottom: t.spacing[1] };
      const valSt: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: t.spacing[2], fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontWeight: t.typography.fontWeight.medium };
      const fields: [string, React.ReactNode, string][] = [
        ['Date & Time', <CalendarDays size={14} color={t.colors.neutral[400]} />, `${fmtDate(new Date(dateStr))} at ${fmtTime(dateStr)}`],
        ['Duration', <Timer size={14} color={t.colors.neutral[400]} />, `${duration} minutes`],
        [isAi ? 'AI Agent' : 'Interviewer', isAi ? <Bot size={14} color={sc(t, 'infoScale', 500)} /> : <User size={14} color={sc(t, 'secondaryScale', 500)} />, isAi ? getDisplayName(iv, 'agentName', 'AI Agent') : (iv.interviewerName ?? 'Unassigned')],
      ];
      return (
        <Box
          role="dialog"
          aria-label={`Interview details for ${candidateName}`}
          aria-modal="true"
          style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.overlay?.light, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => handleSelect(null)}
        >
          <Box onClick={(e: React.MouseEvent) => e.stopPropagation()} style={{ ...createCardStyle(t, { elevation: 'xl', glass: isGlass }), padding: 0, width: 440, maxHeight: '80vh', overflow: 'auto' as const, ...glassCard, ...accentBar }}>
            {/* Header */}
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}`, backgroundColor: t.colors.neutral[50] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                <Box style={{ width: 40, height: 40, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} color={t.colors.primaryScale[600]} />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing }}>{candidateName}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>{jobTitle} - {stageName}</Text>
                </Box>
              </Box>
              <Box
                role="button"
                tabIndex={0}
                aria-label="Close detail popup"
                onClick={() => handleSelect(null)}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => handleSelect(null))}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[500], cursor: 'pointer', outline: 'none' }}
              >
                <X size={14} />
              </Box>
            </Box>
            {/* Badges */}
            <Box style={{ display: 'flex', gap: t.spacing[2], padding: `${t.spacing[3]}px ${t.spacing[5]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: sc(t, mCfg.scale, 100), color: sc(t, mCfg.scale, 700), border: `${bdr} ${sc(t, mCfg.scale, 200)}` }}>
                {isAi ? <Bot size={12} /> : <User size={12} />}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: sc(t, mCfg.scale, 700) }}>{mCfg.label} Interview</Text>
              </Box>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 100 : 50), color: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 600 : 700), border: `${bdr} ${sc(t, sCfg.scale, 200)}` }}>
                <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 400 : 500) }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 600 : 700) }}>{sCfg.label}</Text>
              </Box>
            </Box>
            {/* Fields */}
            <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
              {fields.map(([label, icon, val], i) => (
                <Box key={i}>
                  <Text style={labelSt}>{label}</Text>
                  <Box style={valSt}>{icon}<Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800] }}>{val}</Text></Box>
                </Box>
              ))}
              {score !== undefined && (
                <Box>
                  <Text style={labelSt}>Score</Text>
                  <Box style={{ ...valSt, color: score >= 80 ? t.colors.successScale[700] : score >= 60 ? t.colors.warningScale[700] : t.colors.errorScale[700], fontWeight: t.typography.fontWeight.semibold }}>
                    <Star size={14} /><Text style={{ fontSize: t.typography.fontSize.sm, color: score >= 80 ? t.colors.successScale[700] : score >= 60 ? t.colors.warningScale[700] : t.colors.errorScale[700] }}>{score}/100</Text>
                  </Box>
                </Box>
              )}
            </Box>
            {/* Actions */}
            <Box style={{ display: 'flex', gap: t.spacing[2], padding: `${t.spacing[3]}px ${t.spacing[5]}px ${t.spacing[4]}px`, borderTop: `${bdr} ${t.colors.neutral[100]}` }}>
              <Box
                role="button"
                tabIndex={0}
                aria-label="Join interview"
                onClick={() => {}}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => {})}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', outline: 'none', letterSpacing: ptypo.headingLetterSpacing }}
              >
                <Video size={14} /><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white, fontWeight: ptypo.headingWeight }}>Join Interview</Text>
              </Box>
              <Box
                role="button"
                tabIndex={0}
                aria-label="View candidate profile"
                onClick={() => {}}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => {})}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, backgroundColor: t.colors.common.white, color: t.colors.neutral[700], border: `${bdr} ${t.colors.neutral[200]}`, cursor: 'pointer', outline: 'none' }}
              >
                <ExternalLink size={14} /><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Profile</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }, [selectedData, t, bdr, isGlass, glassCard, accentBar, sectionLabel, ptypo, badgeRadius, handleSelect, handleKeyNav]);

    // ---- Empty State ----

    const renderEmpty = useCallback(() => (
      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...emptyState, padding: `${t.spacing[12]}px ${t.spacing[6]}px` }}>
        <Box style={{ ...createIconContainerStyle(t, { size: 64 }), marginBottom: t.spacing[4] }}>
          <Clock size={28} color={t.colors.primaryScale[400]} />
        </Box>
        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, color: t.colors.neutral[800], marginBottom: t.spacing[2], letterSpacing: ptypo.headingLetterSpacing }}>No interviews this week</Text>
        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginBottom: t.spacing[6], maxWidth: 360, lineHeight: t.typography.lineHeight.relaxed, textAlign: 'center' as const }}>{searchQuery || filters.status || filters.mode ? 'Try adjusting your filters or navigating to a different week.' : 'Schedule interviews to see them on the timeline.'}</Text>
        {onScheduleNew && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="Schedule a new interview"
            onClick={onScheduleNew}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, onScheduleNew)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[5]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', boxShadow: t.shadows.sm, outline: 'none', letterSpacing: ptypo.headingLetterSpacing }}
          >
            <Plus size={16} /><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Schedule Interview</Text>
          </Box>
        )}
      </Box>
    ), [emptyState, t, ptypo, searchQuery, filters, onScheduleNew, handleKeyNav]);

    const statusOpts: (InterviewDisplayStatus | null)[] = [null, 'pending', 'scheduled', 'in_progress', 'completed', 'scored', 'cancelled', 'no_show'];
    const modeGroupOpts: ({ key: string; label: string } | null)[] = [null, { key: 'ai', label: 'AI' }, { key: 'human', label: 'Human' }];

    return (
      <Box className={className} style={{ padding: t.spacing[6], backgroundColor: t.colors.neutral[50], minHeight: '100%', width: '100%', fontFamily: 'inherit', ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4], ...animStyle(0) }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text as="p" style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], margin: 0, lineHeight: t.typography.lineHeight.tight, letterSpacing: ptypo.headingLetterSpacing }}>Interview Center</Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], margin: 0}}>Manage and track all interviews across your pipeline</Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, overflow: 'hidden' as const }} role="group" aria-label="View mode toggle">
              {[{ key: 'calendar', icon: <Calendar size={14} />, label: 'Calendar view' }, { key: 'list', icon: <List size={14} />, label: 'List view' }, { key: 'timeline', icon: <Clock size={14} />, label: 'Timeline view' }].map(({ key, icon, label }) => (
                <Box
                  key={key}
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  aria-pressed={key === 'timeline'}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, border: 'none', backgroundColor: key === 'timeline' ? t.colors.primaryScale[50] : t.colors.common.white, color: key === 'timeline' ? t.colors.primaryScale[600] : t.colors.neutral[500], cursor: 'pointer', outline: 'none' }}
                >{icon}</Box>
              ))}
            </Box>
            {onScheduleNew && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Schedule a new interview"
                onClick={onScheduleNew}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, onScheduleNew)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', boxShadow: t.shadows.sm, outline: 'none' }}
              >
                <Plus size={16} /><Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Schedule Interview</Text>
              </Box>
            )}
          </Box>
        </Box>

        {renderStats()}

        {/* Toolbar */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3], flexWrap: 'wrap' as const, ...animStyle(1) }} role="toolbar" aria-label="Interview filters">
          <Filter size={14} color={t.colors.neutral[400]} />
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }} role="group" aria-label="Status filters">
            {statusOpts.map(s => {
              const entry = s ? STATUS_MAP[s] : null;
              return (
                <ChipBtn key={s ?? 'all'} active={filters.status === s || (s === null && !filters.status)} onClick={() => handleStatusFilter(s)} ariaLabel={s === null ? 'Show all statuses' : `Filter by ${entry?.label ?? s}`}>
                  {s !== null && entry && <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc(t, entry.scale, entry.scale === 'neutral' ? 400 : 500), flexShrink: 0 }} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: 'inherit' }}>{s === null ? 'All' : (entry?.label ?? s)}</Text>
                </ChipBtn>
              );
            })}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }} role="group" aria-label="Mode filters">
            {modeGroupOpts.map(mg => {
              const key = mg?.key ?? 'all-modes';
              const isAiFilter = filters.mode === 'ai_voice' || filters.mode === 'ai_chat';
              const isHumanFilter = filters.mode === 'human_video' || filters.mode === 'human_phone' || filters.mode === 'in_person';
              const a = mg === null ? !filters.mode : mg.key === 'ai' ? isAiFilter : isHumanFilter;
              return (
                <ChipBtn key={key} active={a} onClick={() => {
                  if (mg === null) handleModeFilter(null);
                  else if (mg.key === 'ai') handleModeFilter('ai_voice' as InterviewDisplayMode);
                  else handleModeFilter('human_video' as InterviewDisplayMode);
                }} ariaLabel={mg === null ? 'Show all modes' : `Filter by ${mg.label}`}>
                  {mg?.key === 'ai' && <Bot size={10} />}{mg?.key === 'human' && <User size={10} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: 'inherit' }}>{mg === null ? 'All' : mg.label}</Text>
                </ChipBtn>
              );
            })}
          </Box>
          <Box style={{ flex: 1 }} />
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, minWidth: 180 }}>
            <Search size={14} color={t.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              aria-label="Search interviews"
              style={{ border: 'none', outline: 'none', fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0 }}
            />
            {searchQuery && (
              <Box
                role="button"
                tabIndex={0}
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyNav(e, () => setSearchQuery(''))}
                style={{ cursor: 'pointer', display: 'flex', color: t.colors.neutral[400] }}
              >
                <X size={12} />
              </Box>
            )}
          </Box>
        </Box>

        {/* Navigation */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3], ...animStyle(2) }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <NavBtn dir="prev" onClick={() => navigateDate('prev')} />
            <NavBtn dir="today" onClick={() => navigateDate('today')} />
            <NavBtn dir="next" onClick={() => navigateDate('next')} />
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: ptypo.headingWeight, color: t.colors.neutral[800], marginLeft: t.spacing[2], letterSpacing: ptypo.headingLetterSpacing }}>{fmtDate(weekDays[0])} - {fmtDate(weekDays[6])}</Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>{filtered.length} interview{filtered.length !== 1 ? 's' : ''} this week</Text>
        </Box>

        {/* Timeline */}
        {!hasIvs ? renderEmpty() : (
          <div ref={timelineRef} style={{ ...createCardStyle(t, { elevation: 'sm', glass: isGlass }), padding: 0, overflow: 'auto' as const, ...glassCard, ...animStyle(3) }} role="region" aria-label="Weekly interview timeline">
            <Box style={{ display: 'flex', marginLeft: 160, width: TL_W, borderBottom: `${bdr} ${t.colors.neutral[200]}`, flexShrink: 0, backgroundColor: t.colors.neutral[50] }}>
              {Array.from({ length: TL_HOURS }, (_, i) => i + TL_START).map(h => (
                <Box key={h} style={{ width: HOUR_W, flexShrink: 0, padding: `${t.spacing[2]}px 0`, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium, textAlign: 'center' as const, borderLeft: `${bdr} ${t.colors.neutral[100]}` }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{fmtHour(h)}</Text>
                </Box>
              ))}
            </Box>
            {weekDays.map((day, idx) => renderDayRow(day, idx))}
          </div>
        )}
        {renderDetail()}
      </Box>
    );
  },
});
