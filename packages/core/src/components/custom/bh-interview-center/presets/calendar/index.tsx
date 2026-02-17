'use client';

/**
 * BhInterviewCenter - Calendar Preset
 * Full calendar view with stats bar, view toggle, month/week/day views,
 * filter bar, quick schedule FAB, and interview detail popup.
 *
 * Uses DBInterview from @rottay/recruiter as the data source.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle } from '../../../helpers';
import type {
  BhInterviewCenterProps, InterviewDisplayStatus, InterviewDisplayMode,
  InterviewFilter, CalendarView, SortDirection,
} from '../../core';
import {
  BH_INTERVIEW_CENTER_DEFAULTS, isAiInterview, getInterviewDateStr,
  getInterviewDuration, getInterviewScore, getInterviewStatusLabel,
  getInterviewModeLabel,
} from '../../core';
import type { DBInterview } from '@rottay/recruiter';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Calendar, List, Clock, Bot, User, Video, Plus, ChevronLeft, ChevronRight,
  X, Filter, TrendingUp, TrendingDown, CheckCircle2, XCircle, Timer,
  BarChart3, CalendarDays, CalendarRange, CalendarClock, Star, ExternalLink, Activity,
} from 'lucide-react';

// --- Config Maps ---

const STATUS_MAP: Record<string, { label: string; scale: string }> = {
  pending: { label: 'Pending', scale: 'infoScale' },
  scheduled: { label: 'Scheduled', scale: 'infoScale' },
  invitation_sent: { label: 'Invited', scale: 'infoScale' },
  ready: { label: 'Ready', scale: 'infoScale' },
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

function getStatusCfg(status: string | null | undefined) {
  return STATUS_MAP[status ?? ''] ?? { label: status ?? 'Unknown', scale: 'neutral' };
}

function sc(t: DesignTokens, scale: string, shade: number) {
  return (t.colors as any)[scale]?.[shade] ?? (t.colors.neutral as any)[shade];
}

/** Extract a display name from interview metadata or fall back to ID */
function getDisplayName(iv: DBInterview, key: string, fallback?: string): string {
  const meta = iv.metadata as Record<string, any> | null;
  return meta?.[key] ?? fallback ?? '';
}

// --- Date Helpers ---

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) days.push(new Date(year, month, -i));
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) for (let i = 1; i <= remaining; i++) days.push(new Date(year, month + 1, i));
  return days;
}

function getWeekDays(date: Date): Date[] {
  const days: Date[] = [];
  const start = new Date(date);
  start.setDate(start.getDate() - date.getDay());
  for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(d.getDate() + i); days.push(d); }
  return days;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function fmtTime(dateStr: string) {
  const d = new Date(dateStr); const h = d.getHours(); const m = d.getMinutes();
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const MONTHS_S = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_L = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (d: Date) => `${MONTHS_S[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const fmtMonthYear = (d: Date) => `${MONTHS_L[d.getMonth()]} ${d.getFullYear()}`;
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtHour = (h: number) => h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;

// --- Sub-components ---

function Badge({ status, tokens: t }: { status: string; tokens: DesignTokens }) {
  const cfg = getStatusCfg(status);
  const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: sc(t, cfg.scale, cfg.scale === 'neutral' ? 100 : 50), color: sc(t, cfg.scale, cfg.scale === 'neutral' ? 600 : 700), border: `${bdr} ${sc(t, cfg.scale, 200)}` }}>
      <span style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc(t, cfg.scale, cfg.scale === 'neutral' ? 400 : 500) }} />
      {cfg.label}
    </span>
  );
}

function ModeBadge({ isAi, tokens: t, size = 'sm' }: { isAi: boolean; tokens: DesignTokens; size?: 'sm' | 'md' }) {
  const scale = isAi ? 'infoScale' : 'secondaryScale';
  const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;
  const iconSize = size === 'sm' ? 10 : 12;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: size === 'sm' ? `0 ${t.spacing[1]}px` : `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: size === 'sm' ? '10px' : t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: sc(t, scale, 100), color: sc(t, scale, 700), border: `${bdr} ${sc(t, scale, 200)}`, whiteSpace: 'nowrap' as const }}>
      {isAi ? <Bot size={iconSize} /> : <User size={iconSize} />}
      {size === 'md' && (isAi ? 'AI' : 'Human')}
    </span>
  );
}

function NavBtn({ onClick, children, tokens: t, w }: { onClick: () => void; children: React.ReactNode; tokens: DesignTokens; w?: number }) {
  const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`;
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: w ?? 28, height: 28, borderRadius: t.borderRadius.md, border: bdr, backgroundColor: t.colors.common.white, color: t.colors.neutral[600], cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none', fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, padding: w ? `${t.spacing[1]}px ${t.spacing[3]}px` : 0 }}>
      {children}
    </button>
  );
}

function ChipBtn({ active, onClick, children, tokens: t }: { active: boolean; onClick: () => void; children: React.ReactNode; tokens: DesignTokens }) {
  const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, border: `${bdr} ${active ? t.colors.primaryScale[300] : t.colors.neutral[200]}`, backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white, color: active ? t.colors.primaryScale[600] : t.colors.neutral[600], cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none' }}>
      {children}
    </button>
  );
}

// --- Calendar Preset ---

export const CalendarBhInterviewCenter = createPreset<BhInterviewCenterProps>({
  name: 'BhInterviewCenter.Calendar',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewCenterProps>) => {
    const t = tokens;
    const isModern = t.surface.useGlass;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const { interviews: rawInterviews = [], stats, filters: controlledFilters, onFilterChange, selectedInterview: controlledSelectedInterview, onInterviewSelect, onScheduleNew, calendarView: controlledCalendarView, onCalendarViewChange, sortBy: controlledSortBy, sortDirection: controlledSortDirection, onSortChange, className, style } = props;

    const interviews = Array.isArray(rawInterviews) ? rawInterviews : [];

    const [internalCalendarView, setInternalCalendarView] = useState<CalendarView>(BH_INTERVIEW_CENTER_DEFAULTS.calendarView ?? 'week');
    const [internalFilters, setInternalFilters] = useState<InterviewFilter>({});
    const [internalSelectedInterview, setInternalSelectedInterview] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(BH_INTERVIEW_CENTER_DEFAULTS.sortDirection ?? 'asc');
    const [hoveredInterviewId, setHoveredInterviewId] = useState<string | null>(null);

    const calendarView = controlledCalendarView ?? internalCalendarView;
    const filters = controlledFilters ?? internalFilters;
    const selectedInterview = controlledSelectedInterview ?? internalSelectedInterview;
    const sortDirection = controlledSortDirection ?? internalSortDirection;

    const glassCard = isModern && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg, border: `${bdr} ${t.glass.border}` } : {};
    const glassSurface = isModern && t.glass ? { backdropFilter: t.glass.blurSm, WebkitBackdropFilter: t.glass.blurSm, backgroundColor: t.glass.bgLight, border: `${bdr} ${t.glass.borderLight}` } : {};

    const handleFilterChange = useCallback((f: InterviewFilter) => { if (controlledFilters === undefined) setInternalFilters(f); onFilterChange?.(f); }, [controlledFilters, onFilterChange]);
    const handleCalendarViewChange = useCallback((v: CalendarView) => { if (controlledCalendarView === undefined) setInternalCalendarView(v); onCalendarViewChange?.(v); }, [controlledCalendarView, onCalendarViewChange]);
    const handleInterviewSelect = useCallback((id: string | null) => { if (controlledSelectedInterview === undefined) setInternalSelectedInterview(id); onInterviewSelect?.(id); }, [controlledSelectedInterview, onInterviewSelect]);
    const handleStatusFilter = useCallback((s: InterviewDisplayStatus | null) => handleFilterChange({ ...filters, status: s }), [filters, handleFilterChange]);
    const handleModeFilter = useCallback((isAi: boolean | null) => {
      if (isAi === null) handleFilterChange({ ...filters, mode: undefined });
      else if (isAi) handleFilterChange({ ...filters, mode: 'ai_voice' });
      else handleFilterChange({ ...filters, mode: 'human_video' });
    }, [filters, handleFilterChange]);

    const navigateDate = useCallback((dir: 'prev' | 'next' | 'today') => {
      if (dir === 'today') { setCurrentDate(new Date()); return; }
      const d = new Date(currentDate);
      if (calendarView === 'month') d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
      else if (calendarView === 'week') d.setDate(d.getDate() + (dir === 'next' ? 7 : -7));
      else d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
      setCurrentDate(d);
    }, [currentDate, calendarView]);

    const filteredInterviews = useMemo(() => {
      let result = [...interviews];
      if (filters.status) result = result.filter(i => i.status === filters.status);
      if (filters.mode) {
        const isAiFilter = filters.mode === 'ai_voice' || filters.mode === 'ai_chat';
        result = result.filter(i => isAiFilter ? isAiInterview(i) : !isAiInterview(i));
      }
      if (filters.dateRange) {
        const [s, e] = filters.dateRange;
        result = result.filter(i => {
          const d = new Date(getInterviewDateStr(i));
          return d >= new Date(s) && d <= new Date(e);
        });
      }
      result.sort((a, b) => {
        const diff = new Date(getInterviewDateStr(a)).getTime() - new Date(getInterviewDateStr(b)).getTime();
        return sortDirection === 'asc' ? diff : -diff;
      });
      return result;
    }, [interviews, filters, sortDirection]);

    const interviewsByDate = useMemo(() => {
      const map: Record<string, DBInterview[]> = {};
      filteredInterviews.forEach(iv => {
        const d = new Date(getInterviewDateStr(iv));
        const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[k]) map[k] = [];
        map[k].push(iv);
      });
      return map;
    }, [filteredInterviews]);

    const getForDate = (date: Date) => interviewsByDate[`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`] || [];
    const selectedData = useMemo(() => selectedInterview ? interviews.find(i => i.id === selectedInterview) ?? null : null, [selectedInterview, interviews]);

    // --- Stats Bar ---
    const renderStatsBar = () => {
      if (!stats) return null;
      const items = [
        { label: 'Scheduled Today', value: stats.scheduledToday, icon: <CalendarDays size={16} />, scale: 'infoScale' },
        { label: 'In Progress', value: stats.inProgress, icon: <Activity size={16} />, scale: 'warningScale', pulse: true },
        { label: 'Completed', value: stats.completedToday, icon: <CheckCircle2 size={16} />, scale: 'successScale' },
        { label: 'No Shows', value: stats.noShows, icon: <XCircle size={16} />, scale: 'errorScale' },
        { label: 'Avg Duration', value: `${stats.avgDuration}m`, icon: <Timer size={16} />, scale: 'secondaryScale' },
        { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: <BarChart3 size={16} />, scale: 'primaryScale', trend: stats.completionTrend },
      ];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ ...createCardStyle(t, { elevation: 'sm', glass: isModern }), padding: `${t.spacing[3]}px ${t.spacing[4]}px`, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2], ...(isModern ? glassSurface : {}) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 32, height: 32, borderRadius: t.borderRadius.md, backgroundColor: sc(t, item.scale, 50), display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc(t, item.scale, 600) }}>{item.icon}</div>
                {item.pulse && <span style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.warningScale[500], boxShadow: `0 0 0 3px ${t.colors.warningScale[100]}` }} />}
                {item.trend !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: item.trend >= 0 ? t.colors.successScale[600] : t.colors.errorScale[600] }}>
                    {item.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(item.trend)}%
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <div style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: t.typography.lineHeight.tight }}>{item.value}</div>
                <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // --- View Toggle ---
    const ViewToggle = ({ views, activeKey }: { views: { key: string; icon: React.ReactNode; label?: string }[]; activeKey: string }) => (
      <div style={{ display: 'flex', alignItems: 'center', borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, overflow: 'hidden' as const }}>
        {views.map(({ key, icon, label }) => (
          <button key={key} onClick={() => key === 'month' || key === 'week' || key === 'day' ? handleCalendarViewChange(key as CalendarView) : undefined} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1], padding: label ? `${t.spacing[1]}px ${t.spacing[3]}px` : 0, width: label ? undefined : 32, height: 28, border: 'none', backgroundColor: activeKey === key ? t.colors.primaryScale[50] : t.colors.common.white, color: activeKey === key ? t.colors.primaryScale[600] : t.colors.neutral[500], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none' }}>
            {icon}{label}
          </button>
        ))}
      </div>
    );

    // --- Filter Bar ---
    const statusOpts: (InterviewDisplayStatus | null)[] = [null, 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];

    const renderFilterBar = () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: `${t.spacing[3]}px 0`, marginBottom: t.spacing[3], flexWrap: 'wrap' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
          <Filter size={14} color={t.colors.neutral[400]} />
          {statusOpts.map(s => {
            const cfg = s ? getStatusCfg(s) : null;
            return (
              <ChipBtn key={s ?? 'all'} active={filters.status === s || (s === null && !filters.status)} onClick={() => handleStatusFilter(s)} tokens={t}>
                {s !== null && cfg && <span style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc(t, cfg.scale, cfg.scale === 'neutral' ? 400 : 500), flexShrink: 0 }} />}
                {s === null ? 'All' : cfg?.label ?? s}
              </ChipBtn>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
          <ChipBtn active={!filters.mode} onClick={() => handleModeFilter(null)} tokens={t}>All Types</ChipBtn>
          <ChipBtn active={filters.mode === 'ai_voice' || filters.mode === 'ai_chat'} onClick={() => handleModeFilter(true)} tokens={t}><Bot size={12} />AI</ChipBtn>
          <ChipBtn active={filters.mode === 'human_video' || filters.mode === 'human_phone' || filters.mode === 'in_person'} onClick={() => handleModeFilter(false)} tokens={t}><User size={12} />Human</ChipBtn>
        </div>
        <div style={{ flex: 1 }} />
        <ViewToggle views={[{ key: 'month', icon: <CalendarDays size={14} />, label: 'Month' }, { key: 'week', icon: <CalendarRange size={14} />, label: 'Week' }, { key: 'day', icon: <CalendarClock size={14} />, label: 'Day' }]} activeKey={calendarView} />
      </div>
    );

    // --- Calendar Navigation ---
    const navLabel = calendarView === 'month' ? fmtMonthYear(currentDate) : calendarView === 'week' ? `${fmtDate(getWeekDays(currentDate)[0])} - ${fmtDate(getWeekDays(currentDate)[6])}` : fmtDate(currentDate);

    // --- Interview Mini Card ---
    const MiniCard = ({ iv }: { iv: DBInterview }) => {
      const isAi = isAiInterview(iv);
      const dateStr = getInterviewDateStr(iv);
      const name = getDisplayName(iv, 'candidateName', 'Candidate');
      return (
        <div onClick={() => handleInterviewSelect(iv.id)} style={{ marginTop: t.spacing[1], padding: `1px ${t.spacing[1]}px`, borderRadius: t.borderRadius.sm, fontSize: '9px', fontWeight: t.typography.fontWeight.medium, backgroundColor: isAi ? t.colors.infoScale[50] : t.colors.secondaryScale[50], color: isAi ? t.colors.infoScale[700] : t.colors.secondaryScale[700], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
          {fmtTime(dateStr)} {name.split(' ')[0]}
        </div>
      );
    };

    // --- Type Count Dot ---
    const TypeDot = ({ count, scale }: { count: number; scale: string }) => count > 0 ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: '9px', color: sc(t, scale, 600), fontWeight: t.typography.fontWeight.medium }}>
        <span style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc(t, scale, 500) }} />{count}
      </span>
    ) : null;

    // --- Month View ---
    const renderMonthView = () => {
      const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
      const today = new Date();
      return (
        <div style={{ ...createCardStyle(t, { elevation: 'sm', glass: isModern }), padding: 0, overflow: 'hidden' as const, ...glassCard }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `${bdr} ${t.colors.neutral[200]}` }}>
            {DAY_NAMES.map(n => <div key={n} style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textAlign: 'center' as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{n}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((day, idx) => {
              const isCurMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, today);
              const dayIvs = getForDate(day);
              const aiCt = dayIvs.filter(i => isAiInterview(i)).length;
              const humanCt = dayIvs.filter(i => !isAiInterview(i)).length;
              return (
                <div key={idx} style={{ minHeight: 90, padding: t.spacing[2], borderRight: (idx + 1) % 7 !== 0 ? `${bdr} ${t.colors.neutral[100]}` : 'none', borderBottom: idx < days.length - 7 ? `${bdr} ${t.colors.neutral[100]}` : 'none', backgroundColor: isToday ? t.colors.primaryScale[50] : isCurMonth ? t.colors.common.white : t.colors.neutral[50], cursor: dayIvs.length > 0 ? 'pointer' : 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: isToday ? t.typography.fontWeight.bold : t.typography.fontWeight.medium, color: isToday ? t.colors.common.white : isCurMonth ? t.colors.neutral[800] : t.colors.neutral[400], backgroundColor: isToday ? t.colors.primaryScale[600] : 'transparent' }}>{day.getDate()}</span>
                    {dayIvs.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: t.borderRadius.full, fontSize: '10px', fontWeight: t.typography.fontWeight.bold, backgroundColor: t.colors.primaryScale[100], color: t.colors.primaryScale[700], padding: `0 ${t.spacing[1]}px` }}>{dayIvs.length}</span>}
                  </div>
                  {dayIvs.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}><TypeDot count={aiCt} scale="infoScale" /><TypeDot count={humanCt} scale="secondaryScale" /></div>}
                  {dayIvs.slice(0, 2).map(iv => <MiniCard key={iv.id} iv={iv} />)}
                  {dayIvs.length > 2 && <div style={{ marginTop: t.spacing[1], fontSize: '9px', color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>+{dayIvs.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // --- Week View ---
    const renderWeekView = () => {
      const weekDays = getWeekDays(currentDate);
      const today = new Date();
      return (
        <div style={{ ...createCardStyle(t, { elevation: 'sm', glass: isModern }), padding: 0, overflow: 'hidden' as const, ...glassCard }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: `${bdr} ${t.colors.neutral[200]}` }}>
            <div style={{ padding: t.spacing[2] }} />
            {weekDays.map((day, idx) => {
              const isToday = isSameDay(day, today);
              return (
                <div key={idx} style={{ padding: `${t.spacing[2]}px ${t.spacing[1]}px`, textAlign: 'center' as const, borderLeft: `${bdr} ${t.colors.neutral[100]}`, backgroundColor: isToday ? t.colors.primaryScale[50] : 'transparent' }}>
                  <div style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{DAY_NAMES[idx]}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.sm, fontWeight: isToday ? t.typography.fontWeight.bold : t.typography.fontWeight.medium, color: isToday ? t.colors.common.white : t.colors.neutral[800], backgroundColor: isToday ? t.colors.primaryScale[600] : 'transparent', marginTop: t.spacing[1] }}>{day.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div style={{ position: 'relative' as const }}>
            {HOURS.map(hour => (
              <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: 60, borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
                <div style={{ padding: `${t.spacing[1]}px ${t.spacing[2]}px`, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontWeight: t.typography.fontWeight.medium, textAlign: 'right' as const, position: 'relative' as const, top: -6 }}>{fmtHour(hour)}</div>
                {weekDays.map((day, dayIdx) => {
                  const isToday = isSameDay(day, today);
                  const hourIvs = getForDate(day).filter(i => new Date(getInterviewDateStr(i)).getHours() === hour);
                  return (
                    <div key={dayIdx} style={{ borderLeft: `${bdr} ${t.colors.neutral[100]}`, padding: 2, backgroundColor: isToday ? `${t.colors.primaryScale[50]}33` : 'transparent', position: 'relative' as const }}>
                      {hourIvs.map(iv => {
                        const isAi = isAiInterview(iv);
                        const dateStr = getInterviewDateStr(iv);
                        const duration = getInterviewDuration(iv);
                        const name = getDisplayName(iv, 'candidateName', 'Candidate');
                        return (
                          <div key={iv.id} onClick={() => handleInterviewSelect(iv.id)} onMouseEnter={() => setHoveredInterviewId(iv.id)} onMouseLeave={() => setHoveredInterviewId(null)} style={{ padding: `${t.spacing[1]}px`, borderRadius: t.borderRadius.sm, backgroundColor: isAi ? t.colors.infoScale[100] : t.colors.secondaryScale[100], borderLeft: `3px solid ${isAi ? t.colors.infoScale[500] : t.colors.secondaryScale[500]}`, fontSize: '10px', fontWeight: t.typography.fontWeight.medium, color: isAi ? t.colors.infoScale[800] : t.colors.secondaryScale[800], cursor: 'pointer', transition: `all ${t.motion.hover}`, marginBottom: t.spacing[1], overflow: 'hidden' as const, minHeight: `${Math.max(1, Math.round(duration / 60)) * 28}px`, transform: hoveredInterviewId === iv.id ? t.motion.transform : 'none' }}>
                            <div style={{ fontWeight: t.typography.fontWeight.semibold, whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{name}</div>
                            <div style={{ opacity: 0.8, marginTop: 1 }}>{fmtTime(dateStr)} - {duration}m</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    };

    // --- Day View ---
    const renderDayView = () => {
      const today = new Date();
      const isToday = isSameDay(currentDate, today);
      const dayIvs = getForDate(currentDate);
      return (
        <div style={{ ...createCardStyle(t, { elevation: 'sm', glass: isModern }), padding: 0, overflow: 'hidden' as const, ...glassCard }}>
          <div style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderBottom: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: isToday ? t.colors.primaryScale[50] : t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
              {fmtDate(currentDate)}
              {isToday && <span style={{ marginLeft: t.spacing[2], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[600], backgroundColor: t.colors.primaryScale[100], padding: `0 ${t.spacing[2]}px`, borderRadius: t.borderRadius.full }}>Today</span>}
            </div>
            <span style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{dayIvs.length} interview{dayIvs.length !== 1 ? 's' : ''}</span>
          </div>
          {HOURS.map(hour => {
            const hourIvs = dayIvs.filter(i => new Date(getInterviewDateStr(i)).getHours() === hour);
            return (
              <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', minHeight: 70, borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
                <div style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400], fontWeight: t.typography.fontWeight.medium, textAlign: 'right' as const, borderRight: `${bdr} ${t.colors.neutral[100]}` }}>{fmtHour(hour)}:00</div>
                <div style={{ padding: t.spacing[1] }}>
                  {hourIvs.map(iv => {
                    const isAi = isAiInterview(iv);
                    const dateStr = getInterviewDateStr(iv);
                    const duration = getInterviewDuration(iv);
                    const name = getDisplayName(iv, 'candidateName', 'Candidate');
                    const jobTitle = getDisplayName(iv, 'jobTitle', '');
                    const stageName = getDisplayName(iv, 'stageName', '');
                    return (
                      <div key={iv.id} onClick={() => handleInterviewSelect(iv.id)} onMouseEnter={() => setHoveredInterviewId(iv.id)} onMouseLeave={() => setHoveredInterviewId(null)} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: isAi ? t.colors.infoScale[50] : t.colors.secondaryScale[50], borderLeft: `4px solid ${isAi ? t.colors.infoScale[500] : t.colors.secondaryScale[500]}`, cursor: 'pointer', transition: `all ${t.motion.hover}`, marginBottom: t.spacing[1], transform: hoveredInterviewId === iv.id ? t.motion.transform : 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: t.borderRadius.full, backgroundColor: isAi ? t.colors.infoScale[200] : t.colors.secondaryScale[200], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={16} color={isAi ? t.colors.infoScale[600] : t.colors.secondaryScale[600]} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{name}</div>
                          {(jobTitle || stageName) && <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 1 }}>{[jobTitle, stageName].filter(Boolean).join(' \u00B7 ')}</div>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                          <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>{fmtTime(dateStr)} &middot; {duration}m</span>
                          <ModeBadge isAi={isAi} tokens={t} size="md" />
                          <Badge status={iv.status} tokens={t} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    // --- Detail Popup ---
    const renderDetailPopup = () => {
      if (!selectedData) return null;
      const iv = selectedData;
      const isAi = isAiInterview(iv);
      const dateStr = getInterviewDateStr(iv);
      const duration = getInterviewDuration(iv);
      const score = getInterviewScore(iv);
      const name = getDisplayName(iv, 'candidateName', 'Candidate');
      const jobTitle = getDisplayName(iv, 'jobTitle', '');
      const stageName = getDisplayName(iv, 'stageName', '');
      const interviewer = isAi
        ? getDisplayName(iv, 'agentName', 'AI Agent')
        : (iv.interviewerName ?? getDisplayName(iv, 'recruiterName', 'Unassigned'));

      const detailFields: [string, React.ReactNode, React.ReactNode][] = [
        ['Date & Time', <CalendarDays size={14} color={t.colors.neutral[400]} />, `${fmtDate(new Date(dateStr))} at ${fmtTime(dateStr)}`],
        ['Duration', <Timer size={14} color={t.colors.neutral[400]} />, `${duration} minutes`],
        ['Mode', <Video size={14} color={t.colors.neutral[400]} />, getInterviewModeLabel(iv.interviewMode)],
        [isAi ? 'AI Agent' : 'Interviewer', isAi ? <Bot size={14} color={t.colors.infoScale[500]} /> : <User size={14} color={t.colors.secondaryScale[500]} />, interviewer],
      ];

      const labelSt = { fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: t.spacing[1] };
      const valSt = { display: 'flex', alignItems: 'center', gap: t.spacing[2], fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontWeight: t.typography.fontWeight.medium };

      return (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.overlay?.light, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => handleInterviewSelect(null)}>
          <div onClick={e => e.stopPropagation()} style={{ ...createCardStyle(t, { elevation: 'xl', glass: isModern }), padding: 0, width: 480, maxHeight: '80vh', overflow: 'auto' as const, ...glassCard }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
              <div style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>Interview Details</div>
              <NavBtn onClick={() => handleInterviewSelect(null)} tokens={t}><X size={14} /></NavBtn>
            </div>
            <div style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, display: 'flex', alignItems: 'center', gap: t.spacing[3], borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
              <div style={{ width: 48, height: 48, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={20} color={t.colors.primaryScale[600]} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{name}</div>
                {(jobTitle || stageName) && <div style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginTop: t.spacing[1] }}>{[jobTitle, stageName].filter(Boolean).join(' \u00B7 ')}</div>}
              </div>
              <div style={{ display: 'flex', gap: t.spacing[2] }}><ModeBadge isAi={isAi} tokens={t} size="md" /><Badge status={iv.status} tokens={t} /></div>
            </div>
            <div style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
                {detailFields.map(([label, icon, val], i) => (
                  <div key={i}><div style={labelSt}>{label}</div><div style={valSt}>{icon}{val}</div></div>
                ))}
                {score !== undefined && (
                  <div><div style={labelSt}>Score</div><div style={{ ...valSt, color: score >= 80 ? t.colors.successScale[700] : score >= 60 ? t.colors.warningScale[700] : t.colors.errorScale[700], fontWeight: t.typography.fontWeight.semibold }}><Star size={14} />{score}/100</div></div>
                )}
              </div>
              <div style={{ display: 'flex', gap: t.spacing[2], marginTop: t.spacing[5], paddingTop: t.spacing[4], borderTop: `${bdr} ${t.colors.neutral[100]}` }}>
                <button style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', outline: 'none' }}><Video size={14} />Join Interview</button>
                <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, backgroundColor: t.colors.common.white, color: t.colors.neutral[700], border: `${bdr} ${t.colors.neutral[200]}`, cursor: 'pointer', outline: 'none' }}><ExternalLink size={14} />Profile</button>
                {iv.status === 'scheduled' && <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, backgroundColor: t.colors.common.white, color: t.colors.errorScale[600], border: `${bdr} ${t.colors.errorScale[200]}`, cursor: 'pointer', outline: 'none' }}><XCircle size={14} />Cancel</button>}
              </div>
            </div>
          </div>
        </div>
      );
    };

    // --- Main ---
    return (
      <div className={className} style={{ padding: t.spacing[6], backgroundColor: t.colors.neutral[50], minHeight: '100%', width: '100%', fontFamily: 'inherit', position: 'relative' as const, ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
          <div>
            <h1 style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], margin: 0, lineHeight: t.typography.lineHeight.tight }}>Interview Center</h1>
            <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], margin: 0, marginTop: t.spacing[1] }}>Manage and track all interviews across your pipeline</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <ViewToggle views={[{ key: 'calendar', icon: <Calendar size={14} /> }, { key: 'list', icon: <List size={14} /> }, { key: 'timeline', icon: <Clock size={14} /> }]} activeKey="calendar" />
            {onScheduleNew && <button onClick={onScheduleNew} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', boxShadow: t.shadows.sm, outline: 'none' }}><Plus size={16} />Schedule Interview</button>}
          </div>
        </div>

        {renderStatsBar()}
        {renderFilterBar()}

        {/* Calendar Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <NavBtn onClick={() => navigateDate('prev')} tokens={t}><ChevronLeft size={14} /></NavBtn>
            <NavBtn onClick={() => navigateDate('today')} tokens={t} w={undefined}><span style={{ padding: `0 ${t.spacing[2]}px` }}>Today</span></NavBtn>
            <NavBtn onClick={() => navigateDate('next')} tokens={t}><ChevronRight size={14} /></NavBtn>
            <span style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginLeft: t.spacing[2] }}>{navLabel}</span>
          </div>
          <ViewToggle views={[{ key: 'month', icon: <CalendarDays size={14} />, label: 'Month' }, { key: 'week', icon: <CalendarRange size={14} />, label: 'Week' }, { key: 'day', icon: <CalendarClock size={14} />, label: 'Day' }]} activeKey={calendarView} />
        </div>

        {calendarView === 'month' && renderMonthView()}
        {calendarView === 'week' && renderWeekView()}
        {calendarView === 'day' && renderDayView()}

        {onScheduleNew && <button onClick={onScheduleNew} title="Schedule new interview" style={{ position: 'fixed' as const, bottom: t.spacing[8], right: t.spacing[8], width: 56, height: 56, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadows.lg, outline: 'none', zIndex: 100 }}><Plus size={24} /></button>}
        {renderDetailPopup()}
      </div>
    );
  },
});
