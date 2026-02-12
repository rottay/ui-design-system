'use client';

/**
 * BhInterviewCenter - Timeline Preset
 * Horizontal day timeline with interview blocks positioned by time,
 * a "now" line indicator, status coloring, and interview detail on click.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, getCardHoverShadow } from '../../../helpers';
import type { BhInterviewCenterProps, InterviewItem, InterviewType, InterviewStatus, InterviewFilter, SortDirection } from '../../core';
import { BH_INTERVIEW_CENTER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import { Calendar, List, Clock, Bot, User, Video, Plus, ChevronLeft, ChevronRight, X, Filter, Search, TrendingUp, TrendingDown, CheckCircle2, XCircle, Timer, BarChart3, CalendarDays, Star, ExternalLink, Activity } from 'lucide-react';

// ─── Config Maps ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<InterviewStatus, { label: string; scale: string }> = {
  scheduled: { label: 'Scheduled', scale: 'infoScale' }, in_progress: { label: 'In Progress', scale: 'warningScale' },
  completed: { label: 'Completed', scale: 'successScale' }, cancelled: { label: 'Cancelled', scale: 'neutral' },
  no_show: { label: 'No Show', scale: 'errorScale' },
};
const TYPE_MAP: Record<InterviewType, { label: string; scale: string }> = { ai: { label: 'AI', scale: 'infoScale' }, human: { label: 'Human', scale: 'secondaryScale' } };

function sc(t: DesignTokens, scale: string, shade: number) { return (t.colors as any)[scale]?.[shade] ?? (t.colors.neutral as any)[shade]; }

// ─── Date/Time Helpers ───────────────────────────────────────────────────────

const fmtTime = (s: string) => { const d = new Date(s); const h = d.getHours(); const m = d.getMinutes(); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
function getWeekDays(date: Date) { const days: Date[] = []; const s = new Date(date); s.setDate(s.getDate() - date.getDay()); for (let i = 0; i < 7; i++) { const d = new Date(s); d.setDate(d.getDate() + i); days.push(d); } return days; }

const TL_START = 7, TL_END = 20, TL_HOURS = TL_END - TL_START, HOUR_W = 120, TL_W = TL_HOURS * HOUR_W;
const getTimePos = (s: string) => { const d = new Date(s); return Math.max(0, Math.min(1, ((d.getHours() - TL_START) * 60 + d.getMinutes()) / (TL_HOURS * 60))) * TL_W; };
const getDurW = (dur: number) => (dur / (TL_HOURS * 60)) * TL_W;
const getNowPos = () => { const n = new Date(); return Math.max(0, Math.min(1, ((n.getHours() - TL_START) * 60 + n.getMinutes()) / (TL_HOURS * 60))) * TL_W; };
const fmtHour = (h: number) => h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Timeline Preset ─────────────────────────────────────────────────────────

export const TimelineBhInterviewCenter = createPreset<BhInterviewCenterProps>({
  name: 'BhInterviewCenter.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewCenterProps>) => {
    const t = tokens; const isModern = t.surface.useGlass;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;

    const { interviews, stats, filters: controlledFilters, onFilterChange, selectedInterview: controlledSelectedInterview, onInterviewSelect, onScheduleNew, sortDirection: controlledSortDirection, className, style } = props;

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

    const glassCard = isModern && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg, border: `${bdr} ${t.glass.border}` } : {};
    const glassSurface = isModern && t.glass ? { backdropFilter: t.glass.blurSm, WebkitBackdropFilter: t.glass.blurSm, backgroundColor: t.glass.bgLight, border: `${bdr} ${t.glass.borderLight}` } : {};

    const handleFilterChange = useCallback((f: InterviewFilter) => { if (controlledFilters === undefined) setInternalFilters(f); onFilterChange?.(f); }, [controlledFilters, onFilterChange]);
    const handleSelect = useCallback((id: string | null) => { if (controlledSelectedInterview === undefined) setInternalSelected(id); onInterviewSelect?.(id); }, [controlledSelectedInterview, onInterviewSelect]);
    const handleStatusFilter = useCallback((s: InterviewStatus | null) => handleFilterChange({ ...filters, status: s }), [filters, handleFilterChange]);
    const handleTypeFilter = useCallback((tp: InterviewType | null) => handleFilterChange({ ...filters, type: tp }), [filters, handleFilterChange]);
    const navigateDate = useCallback((dir: 'prev' | 'next' | 'today') => { if (dir === 'today') { setCurrentDate(new Date()); return; } const d = new Date(currentDate); d.setDate(d.getDate() + (dir === 'next' ? 7 : -7)); setCurrentDate(d); }, [currentDate]);

    const filtered = useMemo(() => {
      let r = [...interviews];
      if (filters.status) r = r.filter(i => i.status === filters.status);
      if (filters.type) r = r.filter(i => i.type === filters.type);
      if (searchQuery) { const q = searchQuery.toLowerCase(); r = r.filter(i => i.candidateName.toLowerCase().includes(q) || i.jobTitle.toLowerCase().includes(q) || i.stageName.toLowerCase().includes(q)); }
      r.sort((a, b) => { const d = new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(); return sortDirection === 'asc' ? d : -d; });
      return r;
    }, [interviews, filters, searchQuery, sortDirection]);

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const byDay = useMemo(() => {
      const map: Record<string, InterviewItem[]> = {};
      weekDays.forEach(d => { map[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] = []; });
      filtered.forEach(iv => { const d = new Date(iv.dateTime); const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; if (map[k]) map[k].push(iv); });
      return map;
    }, [filtered, weekDays]);

    const selectedData = useMemo(() => selectedInterview ? interviews.find(i => i.id === selectedInterview) ?? null : null, [selectedInterview, interviews]);
    const hasIvs = useMemo(() => weekDays.some(d => (byDay[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`] || []).length > 0), [weekDays, byDay]);

    // Chip helper
    const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
      <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, border: `${bdr} ${active ? t.colors.primaryScale[300] : t.colors.neutral[200]}`, backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white, color: active ? t.colors.primaryScale[600] : t.colors.neutral[600], cursor: 'pointer', transition: `all ${t.motion.hover}`, outline: 'none' }}>{children}</button>
    );

    // Stats bar
    const renderStats = () => {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: `${t.spacing[3]}px ${t.spacing[4]}px`, ...createSurfaceStyle(t, { elevation: 'sm' }), backgroundColor: t.colors.common.white, marginBottom: t.spacing[4], flexWrap: 'wrap' as const, ...glassSurface }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.full, backgroundColor: sc(t, item.scale, 50), border: `${bdr} ${t.colors.neutral[100]}` }}>
              <span style={{ color: sc(t, item.scale, 600), display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>{item.label}</span>
              <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{item.value}</span>
              {item.pulse && <span style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.warningScale[500], boxShadow: `0 0 0 2px ${t.colors.warningScale[100]}` }} />}
              {item.trend !== undefined && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: '10px', fontWeight: t.typography.fontWeight.medium, color: item.trend >= 0 ? t.colors.successScale[600] : t.colors.errorScale[600] }}>{item.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{Math.abs(item.trend)}%</span>}
            </div>
          ))}
        </div>
      );
    };

    // Day row
    const renderDayRow = (day: Date, dayIdx: number) => {
      const today = new Date(); const isToday = isSameDay(day, today);
      const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
      const dayIvs = byDay[key] || [];
      const sorted = [...dayIvs].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      const tracks: InterviewItem[][] = [];
      sorted.forEach(iv => { const iStart = new Date(iv.dateTime).getTime(); let placed = false; for (const tr of tracks) { const last = tr[tr.length - 1]; if (iStart >= new Date(last.dateTime).getTime() + last.duration * 60000) { tr.push(iv); placed = true; break; } } if (!placed) tracks.push([iv]); });
      const trkH = 44; const rowH = Math.max(60, tracks.length * trkH + 16);

      return (
        <div key={dayIdx} style={{ display: 'flex', minHeight: rowH, borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
          <div style={{ width: 160, flexShrink: 0, padding: `${t.spacing[2]}px ${t.spacing[3]}px`, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', backgroundColor: isToday ? t.colors.primaryScale[50] : t.colors.common.white, borderRight: `${bdr} ${t.colors.neutral[200]}` }}>
            <div style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: isToday ? t.colors.primaryScale[700] : t.colors.neutral[800] }}>
              {DAY_NAMES[day.getDay()]}
              {isToday && <span style={{ marginLeft: t.spacing[2], fontSize: '9px', fontWeight: t.typography.fontWeight.bold, color: t.colors.common.white, backgroundColor: t.colors.primaryScale[600], padding: `0 ${t.spacing[1]}px`, borderRadius: t.borderRadius.full }}>TODAY</span>}
            </div>
            <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>{MONTHS[day.getMonth()]} {day.getDate()}</div>
            {dayIvs.length > 0 && <span style={{ marginTop: t.spacing[1], fontSize: '10px', fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[600], backgroundColor: t.colors.primaryScale[100], padding: `0 ${t.spacing[1]}px`, borderRadius: t.borderRadius.full, display: 'inline-block', width: 'fit-content' }}>{dayIvs.length}</span>}
          </div>
          <div style={{ position: 'relative' as const, width: TL_W, flexShrink: 0, backgroundColor: isToday ? `${t.colors.primaryScale[50]}33` : 'transparent' }}>
            {Array.from({ length: TL_HOURS }).map((_, hIdx) => <div key={hIdx} style={{ position: 'absolute' as const, left: hIdx * HOUR_W, top: 0, bottom: 0, width: 1, backgroundColor: t.colors.neutral[100] }} />)}
            {isToday && <div style={{ position: 'absolute' as const, left: nowPos, top: 0, bottom: 0, width: 2, backgroundColor: t.colors.errorScale[500], zIndex: 10 }}><div style={{ position: 'absolute' as const, top: -4, left: -4, width: 10, height: 10, borderRadius: t.borderRadius.full, backgroundColor: t.colors.errorScale[500] }} /></div>}
            {tracks.map((track, tIdx) => track.map(iv => {
              const left = getTimePos(iv.dateTime); const width = Math.max(getDurW(iv.duration), 60);
              const sCfg = STATUS_MAP[iv.status]; const isHov = hoveredId === iv.id; const isSel = selectedInterview === iv.id;
              return (
                <div key={iv.id} onClick={() => handleSelect(iv.id)} onMouseEnter={() => setHoveredId(iv.id)} onMouseLeave={() => setHoveredId(null)} style={{ position: 'absolute' as const, left, top: 8 + tIdx * trkH, width, height: trkH - 8, borderRadius: t.borderRadius.md, backgroundColor: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 100 : 50), border: isSel ? `${bdr} ${t.colors.primaryScale[500]}` : `${bdr} ${sc(t, sCfg.scale, 200)}`, borderLeftWidth: 3, borderLeftColor: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 300 : 400), padding: `${t.spacing[1]}px ${t.spacing[2]}px`, cursor: 'pointer', transition: `all ${t.motion.hover}`, overflow: 'hidden' as const, display: 'flex', alignItems: 'center', gap: t.spacing[2], zIndex: isHov ? 5 : 1, transform: isHov ? t.motion.transform : 'none', boxShadow: isHov ? getCardHoverShadow(t, 'sm') : 'none' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: t.borderRadius.full, backgroundColor: sc(t, iv.type === 'ai' ? 'infoScale' : 'secondaryScale', 200), flexShrink: 0 }}>
                    {iv.type === 'ai' ? <Bot size={10} color={sc(t, 'infoScale', 700)} /> : <User size={10} color={sc(t, 'secondaryScale', 700)} />}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: t.typography.fontWeight.semibold, color: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 600 : 700), whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{iv.candidateName}</div>
                    <div style={{ fontSize: '9px', color: t.colors.neutral[500], whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const }}>{fmtTime(iv.dateTime)} &middot; {iv.duration}m</div>
                  </div>
                  {iv.score !== undefined && width > 150 && <span style={{ fontSize: '9px', fontWeight: t.typography.fontWeight.bold, color: iv.score >= 80 ? t.colors.successScale[700] : iv.score >= 60 ? t.colors.warningScale[700] : t.colors.errorScale[700], flexShrink: 0 }}>{iv.score}</span>}
                </div>
              );
            }))}
          </div>
        </div>
      );
    };

    // Detail popup
    const renderDetail = () => {
      if (!selectedData) return null;
      const iv = selectedData; const sCfg = STATUS_MAP[iv.status]; const tCfg = TYPE_MAP[iv.type];
      const labelSt = { fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: t.spacing[1] };
      const valSt = { display: 'flex', alignItems: 'center', gap: t.spacing[2], fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontWeight: t.typography.fontWeight.medium };
      const fields: [string, React.ReactNode, string][] = [
        ['Date & Time', <CalendarDays size={14} color={t.colors.neutral[400]} />, `${fmtDate(new Date(iv.dateTime))} at ${fmtTime(iv.dateTime)}`],
        ['Duration', <Timer size={14} color={t.colors.neutral[400]} />, `${iv.duration} minutes`],
        [iv.type === 'ai' ? 'AI Agent' : 'Recruiter', iv.type === 'ai' ? <Bot size={14} color={sc(t, 'infoScale', 500)} /> : <User size={14} color={sc(t, 'secondaryScale', 500)} />, iv.type === 'ai' ? iv.agentName ?? 'AI Agent' : iv.recruiterName ?? 'Unassigned'],
      ];
      return (
        <div style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.overlay?.light, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => handleSelect(null)}>
          <div onClick={e => e.stopPropagation()} style={{ ...createCardStyle(t, { elevation: 'xl', glass: isModern }), padding: 0, width: 440, maxHeight: '80vh', overflow: 'auto' as const, ...glassCard }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[4]}px ${t.spacing[5]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                <div style={{ width: 40, height: 40, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], backgroundImage: iv.candidateAvatar ? `url(${iv.candidateAvatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{!iv.candidateAvatar && <User size={18} color={t.colors.primaryScale[600]} />}</div>
                <div><div style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{iv.candidateName}</div><div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 1 }}>{iv.jobTitle} &middot; {iv.stageName}</div></div>
              </div>
              <button onClick={() => handleSelect(null)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[500], cursor: 'pointer', outline: 'none' }}><X size={14} /></button>
            </div>
            <div style={{ display: 'flex', gap: t.spacing[2], padding: `${t.spacing[3]}px ${t.spacing[5]}px`, borderBottom: `${bdr} ${t.colors.neutral[100]}` }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: sc(t, tCfg.scale, 100), color: sc(t, tCfg.scale, 700), border: `${bdr} ${sc(t, tCfg.scale, 200)}` }}>{iv.type === 'ai' ? <Bot size={12} /> : <User size={12} />}{tCfg.label} Interview</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, backgroundColor: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 100 : 50), color: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 600 : 700), border: `${bdr} ${sc(t, sCfg.scale, 200)}` }}><span style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc(t, sCfg.scale, sCfg.scale === 'neutral' ? 400 : 500) }} />{sCfg.label}</span>
            </div>
            <div style={{ padding: `${t.spacing[4]}px ${t.spacing[5]}px`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
              {fields.map(([label, icon, val], i) => <div key={i}><div style={labelSt}>{label}</div><div style={valSt}>{icon}{val}</div></div>)}
              {iv.score !== undefined && <div><div style={labelSt}>Score</div><div style={{ ...valSt, color: iv.score >= 80 ? t.colors.successScale[700] : iv.score >= 60 ? t.colors.warningScale[700] : t.colors.errorScale[700], fontWeight: t.typography.fontWeight.semibold }}><Star size={14} />{iv.score}/100</div></div>}
              {iv.location && <div><div style={labelSt}>Location</div><div style={valSt}><Video size={14} color={t.colors.neutral[400]} />{iv.location}</div></div>}
            </div>
            <div style={{ display: 'flex', gap: t.spacing[2], padding: `${t.spacing[3]}px ${t.spacing[5]}px ${t.spacing[4]}px`, borderTop: `${bdr} ${t.colors.neutral[100]}` }}>
              <button style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', outline: 'none' }}><Video size={14} />Join Interview</button>
              <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, backgroundColor: t.colors.common.white, color: t.colors.neutral[700], border: `${bdr} ${t.colors.neutral[200]}`, cursor: 'pointer', outline: 'none' }}><ExternalLink size={14} />Profile</button>
            </div>
          </div>
        </div>
      );
    };

    // Empty state
    const renderEmpty = () => (
      <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: `${t.spacing[12]}px ${t.spacing[6]}px`, textAlign: 'center' as const }}>
        <div style={{ width: 64, height: 64, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[50], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: t.spacing[4] }}><Clock size={28} color={t.colors.primaryScale[400]} /></div>
        <div style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[2] }}>No interviews this week</div>
        <div style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginBottom: t.spacing[6], maxWidth: 360, lineHeight: t.typography.lineHeight.relaxed }}>{searchQuery || filters.status || filters.type ? 'Try adjusting your filters or navigating to a different week.' : 'Schedule interviews to see them on the timeline.'}</div>
        {onScheduleNew && <button onClick={onScheduleNew} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[5]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', boxShadow: t.shadows.sm, outline: 'none' }}><Plus size={16} />Schedule Interview</button>}
      </div>
    );

    const statusOpts: (InterviewStatus | null)[] = [null, 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
    const typeOpts: (InterviewType | null)[] = [null, 'ai', 'human'];

    return (
      <div className={className} style={{ padding: t.spacing[6], backgroundColor: t.colors.neutral[50], minHeight: '100%', fontFamily: 'inherit', ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
          <div>
            <h1 style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], margin: 0, lineHeight: t.typography.lineHeight.tight }}>Interview Center</h1>
            <p style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], margin: 0, marginTop: t.spacing[1] }}>Manage and track all interviews across your pipeline</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <div style={{ display: 'flex', alignItems: 'center', borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, overflow: 'hidden' as const }}>
              {[{ key: 'calendar', icon: <Calendar size={14} /> }, { key: 'list', icon: <List size={14} /> }, { key: 'timeline', icon: <Clock size={14} /> }].map(({ key, icon }) => (
                <button key={key} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 28, border: 'none', backgroundColor: key === 'timeline' ? t.colors.primaryScale[50] : t.colors.common.white, color: key === 'timeline' ? t.colors.primaryScale[600] : t.colors.neutral[500], cursor: 'pointer', outline: 'none' }}>{icon}</button>
              ))}
            </div>
            {onScheduleNew && <button onClick={onScheduleNew} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white, border: 'none', cursor: 'pointer', boxShadow: t.shadows.sm, outline: 'none' }}><Plus size={16} />Schedule Interview</button>}
          </div>
        </div>

        {renderStats()}

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3], flexWrap: 'wrap' as const }}>
          <Filter size={14} color={t.colors.neutral[400]} />
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            {statusOpts.map(s => <Chip key={s ?? 'all'} active={filters.status === s || (s === null && !filters.status)} onClick={() => handleStatusFilter(s)}>{s !== null && <span style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: sc(t, STATUS_MAP[s].scale, STATUS_MAP[s].scale === 'neutral' ? 400 : 500), flexShrink: 0 }} />}{s === null ? 'All' : STATUS_MAP[s].label}</Chip>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            {typeOpts.map(tp => <Chip key={tp ?? 'all-types'} active={filters.type === tp || (tp === null && !filters.type)} onClick={() => handleTypeFilter(tp)}>{tp === 'ai' && <Bot size={10} />}{tp === 'human' && <User size={10} />}{tp === null ? 'All' : TYPE_MAP[tp].label}</Chip>)}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, minWidth: 180 }}>
            <Search size={14} color={t.colors.neutral[400]} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], backgroundColor: 'transparent', flex: 1, padding: 0 }} />
            {searchQuery && <X size={12} color={t.colors.neutral[400]} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {['prev', 'today', 'next'].map(dir => (
              <button key={dir} onClick={() => navigateDate(dir as any)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dir === 'today' ? undefined : 28, height: 28, padding: dir === 'today' ? `${t.spacing[1]}px ${t.spacing[3]}px` : 0, borderRadius: t.borderRadius.md, border: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, color: t.colors.neutral[dir === 'today' ? 700 : 600], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer', outline: 'none' }}>
                {dir === 'prev' ? <ChevronLeft size={14} /> : dir === 'next' ? <ChevronRight size={14} /> : 'This Week'}
              </button>
            ))}
            <span style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginLeft: t.spacing[2] }}>{fmtDate(weekDays[0])} - {fmtDate(weekDays[6])}</span>
          </div>
          <span style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium }}>{filtered.length} interview{filtered.length !== 1 ? 's' : ''} this week</span>
        </div>

        {/* Timeline */}
        {!hasIvs ? renderEmpty() : (
          <div ref={timelineRef} style={{ ...createCardStyle(t, { elevation: 'sm', glass: isModern }), padding: 0, overflow: 'auto' as const, ...glassCard }}>
            <div style={{ display: 'flex', marginLeft: 160, width: TL_W, borderBottom: `${bdr} ${t.colors.neutral[200]}`, flexShrink: 0 }}>
              {Array.from({ length: TL_HOURS }, (_, i) => i + TL_START).map(h => (
                <div key={h} style={{ width: HOUR_W, flexShrink: 0, padding: `${t.spacing[2]}px 0`, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontWeight: t.typography.fontWeight.medium, textAlign: 'center' as const, borderLeft: `${bdr} ${t.colors.neutral[100]}` }}>{fmtHour(h)}</div>
              ))}
            </div>
            {weekDays.map((day, idx) => renderDayRow(day, idx))}
          </div>
        )}
        {renderDetail()}
      </div>
    );
  },
});
