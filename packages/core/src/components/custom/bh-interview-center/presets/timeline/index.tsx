'use client';

/**
 * BhInterviewCenter - Timeline Preset
 * Horizontal day timeline with interview blocks positioned by time,
 * a "now" line indicator, status coloring, and interview detail on click.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
  getCardHoverShadow,
} from '../../../helpers';
import type {
  BhInterviewCenterProps,
  InterviewItem,
  InterviewType,
  InterviewStatus,
  InterviewFilter,
  SortDirection,
} from '../../core';
import { BH_INTERVIEW_CENTER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Calendar,
  List,
  Clock,
  Bot,
  User,
  Video,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Timer,
  BarChart3,
  CalendarDays,
  Star,
  Eye,
  ExternalLink,
  Activity,
} from 'lucide-react';

// ─── Status Config ────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  accentColor: string;
}

function getStatusConfig(tokens: DesignTokens): Record<InterviewStatus, StatusConfig> {
  return {
    scheduled: {
      label: 'Scheduled',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
      dotColor: tokens.colors.infoScale[500],
      accentColor: tokens.colors.infoScale[400],
    },
    in_progress: {
      label: 'In Progress',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      dotColor: tokens.colors.warningScale[500],
      accentColor: tokens.colors.warningScale[400],
    },
    completed: {
      label: 'Completed',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      dotColor: tokens.colors.successScale[500],
      accentColor: tokens.colors.successScale[400],
    },
    cancelled: {
      label: 'Cancelled',
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
      borderColor: tokens.colors.neutral[200],
      dotColor: tokens.colors.neutral[400],
      accentColor: tokens.colors.neutral[300],
    },
    no_show: {
      label: 'No Show',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      dotColor: tokens.colors.errorScale[500],
      accentColor: tokens.colors.errorScale[400],
    },
  };
}

// ─── Type Config ──────────────────────────────────────────────────────────────

function getTypeConfig(tokens: DesignTokens): Record<InterviewType, { label: string; color: string; bgColor: string; borderColor: string }> {
  return {
    ai: {
      label: 'AI',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[100],
      borderColor: tokens.colors.infoScale[200],
    },
    human: {
      label: 'Human',
      color: tokens.colors.secondaryScale[700],
      bgColor: tokens.colors.secondaryScale[100],
      borderColor: tokens.colors.secondaryScale[200],
    },
  };
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatDayLabel(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getWeekDays(date: Date): Date[] {
  const days: Date[] = [];
  const dayOfWeek = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - dayOfWeek);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 20;
const TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;
const HOUR_WIDTH = 120;
const TIMELINE_WIDTH = TOTAL_HOURS * HOUR_WIDTH;

function getTimePosition(dateStr: string): number {
  const d = new Date(dateStr);
  const hour = d.getHours();
  const min = d.getMinutes();
  const totalMinutes = (hour - TIMELINE_START_HOUR) * 60 + min;
  const totalTimelineMinutes = TOTAL_HOURS * 60;
  return Math.max(0, Math.min(1, totalMinutes / totalTimelineMinutes)) * TIMELINE_WIDTH;
}

function getDurationWidth(duration: number): number {
  const totalTimelineMinutes = TOTAL_HOURS * 60;
  return (duration / totalTimelineMinutes) * TIMELINE_WIDTH;
}

function getNowPosition(): number {
  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const totalMinutes = (hour - TIMELINE_START_HOUR) * 60 + min;
  const totalTimelineMinutes = TOTAL_HOURS * 60;
  return Math.max(0, Math.min(1, totalMinutes / totalTimelineMinutes)) * TIMELINE_WIDTH;
}

// ─── Timeline Preset ──────────────────────────────────────────────────────────

export const TimelineBhInterviewCenter = createPreset<BhInterviewCenterProps>({
  name: 'BhInterviewCenter.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewCenterProps>) => {
    const { Box, Stack } = primitives;
    const isModern = engine === 'modern';

    const STATUS_CONFIG = useMemo(() => getStatusConfig(tokens), [tokens]);
    const TYPE_CONFIG = useMemo(() => getTypeConfig(tokens), [tokens]);

    const {
      interviews,
      stats,
      filters: controlledFilters,
      onFilterChange,
      selectedInterview: controlledSelectedInterview,
      onInterviewSelect,
      onScheduleNew,
      sortBy: controlledSortBy,
      sortDirection: controlledSortDirection,
      onSortChange,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalFilters, setInternalFilters] = useState<InterviewFilter>({});
    const [internalSelectedInterview, setInternalSelectedInterview] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [internalSortBy, setInternalSortBy] = useState(BH_INTERVIEW_CENTER_DEFAULTS.sortBy ?? 'dateTime');
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(
      BH_INTERVIEW_CENTER_DEFAULTS.sortDirection ?? 'asc'
    );
    const [hoveredInterviewId, setHoveredInterviewId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [nowPosition, setNowPosition] = useState(getNowPosition());

    const timelineRef = useRef<HTMLDivElement>(null);

    const filters = controlledFilters ?? internalFilters;
    const selectedInterview = controlledSelectedInterview ?? internalSelectedInterview;
    const sortBy = controlledSortBy ?? internalSortBy;
    const sortDirection = controlledSortDirection ?? internalSortDirection;

    // ─── Update now-line every minute ───────────────────────────────────

    useEffect(() => {
      const interval = setInterval(() => {
        setNowPosition(getNowPosition());
      }, 60000);
      return () => clearInterval(interval);
    }, []);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    const glassSurfaceStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blurSm,
      WebkitBackdropFilter: tokens.glass.blurSm,
      backgroundColor: tokens.glass.bgLight,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.borderLight}`,
    } : {};

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleFilterChange = useCallback((newFilters: InterviewFilter) => {
      if (controlledFilters === undefined) setInternalFilters(newFilters);
      onFilterChange?.(newFilters);
    }, [controlledFilters, onFilterChange]);

    const handleInterviewSelect = useCallback((id: string | null) => {
      if (controlledSelectedInterview === undefined) setInternalSelectedInterview(id);
      onInterviewSelect?.(id);
    }, [controlledSelectedInterview, onInterviewSelect]);

    const handleStatusFilter = useCallback((status: InterviewStatus | null) => {
      handleFilterChange({ ...filters, status });
    }, [filters, handleFilterChange]);

    const handleTypeFilter = useCallback((type: InterviewType | null) => {
      handleFilterChange({ ...filters, type });
    }, [filters, handleFilterChange]);

    const navigateDate = useCallback((direction: 'prev' | 'next' | 'today') => {
      if (direction === 'today') {
        setCurrentDate(new Date());
        return;
      }
      const d = new Date(currentDate);
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentDate(d);
    }, [currentDate]);

    // ─── Filtered Interviews ────────────────────────────────────────────

    const filteredInterviews = useMemo(() => {
      let result = [...interviews];
      if (filters.status) {
        result = result.filter(i => i.status === filters.status);
      }
      if (filters.type) {
        result = result.filter(i => i.type === filters.type);
      }
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(i =>
          i.candidateName.toLowerCase().includes(lower) ||
          i.jobTitle.toLowerCase().includes(lower) ||
          i.stageName.toLowerCase().includes(lower)
        );
      }
      result.sort((a, b) => {
        const aTime = new Date(a.dateTime).getTime();
        const bTime = new Date(b.dateTime).getTime();
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      });
      return result;
    }, [interviews, filters, searchQuery, sortDirection]);

    // ─── Week days ──────────────────────────────────────────────────────

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    // ─── Interviews grouped by day ──────────────────────────────────────

    const interviewsByDay = useMemo(() => {
      const map: Record<string, InterviewItem[]> = {};
      weekDays.forEach(day => {
        const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
        map[key] = [];
      });
      filteredInterviews.forEach(interview => {
        const d = new Date(interview.dateTime);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (map[key]) {
          map[key].push(interview);
        }
      });
      return map;
    }, [filteredInterviews, weekDays]);

    // ─── Selected Interview Data ────────────────────────────────────────

    const selectedInterviewData = useMemo(() => {
      if (!selectedInterview) return null;
      return interviews.find(i => i.id === selectedInterview) ?? null;
    }, [selectedInterview, interviews]);

    // ─── Render: Stats Bar ──────────────────────────────────────────────

    const renderStatsBar = () => {
      if (!stats) return null;

      const statItems = [
        { label: 'Scheduled', value: stats.scheduledToday, icon: <CalendarDays size={14} />, color: tokens.colors.infoScale[600], bg: tokens.colors.infoScale[50] },
        { label: 'In Progress', value: stats.inProgress, icon: <Activity size={14} />, color: tokens.colors.warningScale[600], bg: tokens.colors.warningScale[50], pulse: true },
        { label: 'Completed', value: stats.completedToday, icon: <CheckCircle2 size={14} />, color: tokens.colors.successScale[600], bg: tokens.colors.successScale[50] },
        { label: 'No Shows', value: stats.noShows, icon: <XCircle size={14} />, color: tokens.colors.errorScale[600], bg: tokens.colors.errorScale[50] },
        { label: 'Avg Duration', value: `${stats.avgDuration}m`, icon: <Timer size={14} />, color: tokens.colors.secondaryScale[600], bg: tokens.colors.secondaryScale[50] },
        { label: 'Completion', value: `${stats.completionRate}%`, icon: <BarChart3 size={14} />, color: tokens.colors.primaryScale[600], bg: tokens.colors.primaryScale[50], trend: stats.completionTrend },
      ];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.common.white,
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
          ...glassSurfaceStyle,
        }}>
          {statItems.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: item.bg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                {item.label}
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>
                {item.value}
              </span>
              {item.pulse && (
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.warningScale[500],
                  boxShadow: `0 0 0 2px ${tokens.colors.warningScale[100]}`,
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              )}
              {item.trend !== undefined && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: item.trend >= 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600],
                }}>
                  {item.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(item.trend)}%
                </span>
              )}
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Toolbar ────────────────────────────────────────────────

    const renderToolbar = () => {
      const statusOptions: (InterviewStatus | null)[] = [null, 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
      const typeOptions: (InterviewType | null)[] = [null, 'ai', 'human'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[3],
          flexWrap: 'wrap' as const,
        }}>
          <Filter size={14} color={tokens.colors.neutral[400]} />

          {/* Status chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            {statusOptions.map((status) => {
              const isActive = filters.status === status || (status === null && !filters.status);
              return (
                <button
                  key={status ?? 'all'}
                  onClick={() => handleStatusFilter(status)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  {status !== null && (
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: STATUS_CONFIG[status].dotColor,
                      flexShrink: 0,
                    }} />
                  )}
                  {status === null ? 'All' : STATUS_CONFIG[status].label}
                </button>
              );
            })}
          </div>

          {/* Type toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            {typeOptions.map((type) => {
              const isActive = filters.type === type || (type === null && !filters.type);
              return (
                <button
                  key={type ?? 'all-types'}
                  onClick={() => handleTypeFilter(type)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  {type === 'ai' && <Bot size={10} />}
                  {type === 'human' && <User size={10} />}
                  {type === null ? 'All' : TYPE_CONFIG[type].label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 180,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                backgroundColor: 'transparent',
                flex: 1,
                padding: 0,
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
            {searchQuery && (
              <X
                size={12}
                color={tokens.colors.neutral[400]}
                style={{ cursor: 'pointer' }}
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Navigation ─────────────────────────────────────────────

    const renderNavigation = () => {
      const startDay = weekDays[0];
      const endDay = weekDays[6];
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[3],
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}>
            <button
              onClick={() => navigateDate('prev')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => navigateDate('today')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              This Week
            </button>
            <button
              onClick={() => navigateDate('next')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              <ChevronRight size={14} />
            </button>
            <span style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
              marginLeft: tokens.spacing[2],
            }}>
              {formatDate(startDay)} - {formatDate(endDay)}
            </span>
          </div>

          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} this week
          </span>
        </div>
      );
    };

    // ─── Render: Timeline Hour Headers ──────────────────────────────────

    const renderTimelineHeaders = () => {
      const hours: number[] = [];
      for (let h = TIMELINE_START_HOUR; h < TIMELINE_END_HOUR; h++) {
        hours.push(h);
      }
      return (
        <div style={{
          display: 'flex',
          marginLeft: 160,
          width: TIMELINE_WIDTH,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          flexShrink: 0,
        }}>
          {hours.map(h => (
            <div
              key={h}
              style={{
                width: HOUR_WIDTH,
                flexShrink: 0,
                padding: `${tokens.spacing[2]}px 0`,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
                textAlign: 'center' as const,
                borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}
            >
              {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Day Row ────────────────────────────────────────────────

    const renderDayRow = (day: Date, dayIdx: number) => {
      const today = new Date();
      const isToday = isSameDay(day, today);
      const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
      const dayInterviews = interviewsByDay[key] || [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Resolve overlapping blocks by assigning tracks
      const tracks: InterviewItem[][] = [];
      const sortedInterviews = [...dayInterviews].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

      sortedInterviews.forEach(interview => {
        const iStart = new Date(interview.dateTime).getTime();
        const iEnd = iStart + interview.duration * 60000;
        let placed = false;
        for (let t = 0; t < tracks.length; t++) {
          const lastInTrack = tracks[t][tracks[t].length - 1];
          const lastEnd = new Date(lastInTrack.dateTime).getTime() + lastInTrack.duration * 60000;
          if (iStart >= lastEnd) {
            tracks[t].push(interview);
            placed = true;
            break;
          }
        }
        if (!placed) {
          tracks.push([interview]);
        }
      });

      const trackHeight = 44;
      const rowHeight = Math.max(60, tracks.length * trackHeight + 16);

      return (
        <div
          key={dayIdx}
          style={{
            display: 'flex',
            minHeight: rowHeight,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}
        >
          {/* Day label */}
          <div style={{
            width: 160,
            flexShrink: 0,
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center',
            backgroundColor: isToday ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: isToday ? tokens.colors.primaryScale[700] : tokens.colors.neutral[800],
            }}>
              {dayNames[day.getDay()]}
              {isToday && (
                <span style={{
                  marginLeft: tokens.spacing[2],
                  fontSize: '9px',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.common.white,
                  backgroundColor: tokens.colors.primaryScale[600],
                  padding: `0 ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.full,
                }}>
                  TODAY
                </span>
              )}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginTop: 2,
            }}>
              {months[day.getMonth()]} {day.getDate()}
            </div>
            {dayInterviews.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                marginTop: tokens.spacing[1],
              }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.primaryScale[600],
                  backgroundColor: tokens.colors.primaryScale[100],
                  padding: `0 ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.full,
                }}>
                  {dayInterviews.length}
                </span>
              </div>
            )}
          </div>

          {/* Timeline area */}
          <div style={{
            position: 'relative' as const,
            width: TIMELINE_WIDTH,
            flexShrink: 0,
            backgroundColor: isToday ? `${tokens.colors.primaryScale[50]}33` : 'transparent',
          }}>
            {/* Hour grid lines */}
            {Array.from({ length: TOTAL_HOURS }).map((_, hIdx) => (
              <div
                key={hIdx}
                style={{
                  position: 'absolute' as const,
                  left: hIdx * HOUR_WIDTH,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  backgroundColor: tokens.colors.neutral[100],
                }}
              />
            ))}

            {/* Now line (only on today's row) */}
            {isToday && (
              <div style={{
                position: 'absolute' as const,
                left: nowPosition,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: tokens.colors.errorScale[500],
                zIndex: 10,
              }}>
                <div style={{
                  position: 'absolute' as const,
                  top: -4,
                  left: -4,
                  width: 10,
                  height: 10,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.errorScale[500],
                }} />
              </div>
            )}

            {/* Interview blocks */}
            {tracks.map((track, trackIdx) =>
              track.map(interview => {
                const left = getTimePosition(interview.dateTime);
                const width = Math.max(getDurationWidth(interview.duration), 60);
                const statusCfg = STATUS_CONFIG[interview.status];
                const isHovered = hoveredInterviewId === interview.id;
                const isSelected = selectedInterview === interview.id;

                return (
                  <div
                    key={interview.id}
                    onClick={() => handleInterviewSelect(interview.id)}
                    onMouseEnter={() => setHoveredInterviewId(interview.id)}
                    onMouseLeave={() => setHoveredInterviewId(null)}
                    style={{
                      position: 'absolute' as const,
                      left,
                      top: 8 + trackIdx * trackHeight,
                      width,
                      height: trackHeight - 8,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: statusCfg.bgColor,
                      borderLeft: `3px solid ${statusCfg.accentColor}`,
                      border: isSelected
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}`
                        : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
                      borderLeftWidth: 3,
                      borderLeftColor: statusCfg.accentColor,
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      overflow: 'hidden' as const,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      zIndex: isHovered ? 5 : 1,
                      transform: isHovered ? tokens.motion.transform : 'none',
                      boxShadow: isHovered ? getCardHoverShadow(tokens, 'sm') : 'none',
                    }}
                  >
                    {/* Type icon */}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: interview.type === 'ai' ? tokens.colors.infoScale[200] : tokens.colors.secondaryScale[200],
                      flexShrink: 0,
                    }}>
                      {interview.type === 'ai'
                        ? <Bot size={10} color={tokens.colors.infoScale[700]} />
                        : <User size={10} color={tokens.colors.secondaryScale[700]} />
                      }
                    </span>

                    {/* Name + time */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: statusCfg.color,
                        whiteSpace: 'nowrap' as const,
                        overflow: 'hidden' as const,
                        textOverflow: 'ellipsis' as const,
                      }}>
                        {interview.candidateName}
                      </div>
                      <div style={{
                        fontSize: '9px',
                        color: tokens.colors.neutral[500],
                        whiteSpace: 'nowrap' as const,
                        overflow: 'hidden' as const,
                        textOverflow: 'ellipsis' as const,
                      }}>
                        {formatTime(interview.dateTime)} &middot; {interview.duration}m
                      </div>
                    </div>

                    {/* Score */}
                    {interview.score !== undefined && width > 150 && (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: interview.score >= 80 ? tokens.colors.successScale[700] : interview.score >= 60 ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700],
                        flexShrink: 0,
                      }}>
                        {interview.score}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Interview Detail Popup ─────────────────────────────────

    const renderDetailPopup = () => {
      if (!selectedInterviewData) return null;
      const interview = selectedInterviewData;
      const statusCfg = STATUS_CONFIG[interview.status];
      const typeCfg = TYPE_CONFIG[interview.type];

      return (
        <div
          style={{
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: tokens.overlay?.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => handleInterviewSelect(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...createCardStyle(tokens, { elevation: 'xl', glass: isModern }),
              padding: 0,
              width: 440,
              maxHeight: '80vh',
              overflow: 'auto' as const,
              ...(isModern ? glassCardStyle : {}),
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[100],
                  backgroundImage: interview.candidateAvatar ? `url(${interview.candidateAvatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {!interview.candidateAvatar && (
                    <User size={18} color={tokens.colors.primaryScale[600]} />
                  )}
                </div>
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}>
                    {interview.candidateName}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginTop: 1,
                  }}>
                    {interview.jobTitle} &middot; {interview.stageName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleInterviewSelect(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[500],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Badges */}
            <div style={{
              display: 'flex',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: typeCfg.bgColor,
                color: typeCfg.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${typeCfg.borderColor}`,
              }}>
                {interview.type === 'ai' ? <Bot size={12} /> : <User size={12} />}
                {typeCfg.label} Interview
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: statusCfg.bgColor,
                color: statusCfg.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: statusCfg.dotColor,
                }} />
                {statusCfg.label}
              </span>
            </div>

            {/* Details grid */}
            <div style={{
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            }}>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[1],
                }}>
                  Date & Time
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  <CalendarDays size={14} color={tokens.colors.neutral[400]} />
                  {formatDate(new Date(interview.dateTime))} at {formatTime(interview.dateTime)}
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[1],
                }}>
                  Duration
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  <Timer size={14} color={tokens.colors.neutral[400]} />
                  {interview.duration} minutes
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[1],
                }}>
                  {interview.type === 'ai' ? 'AI Agent' : 'Recruiter'}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {interview.type === 'ai' ? <Bot size={14} color={tokens.colors.infoScale[500]} /> : <User size={14} color={tokens.colors.secondaryScale[500]} />}
                  {interview.type === 'ai' ? interview.agentName ?? 'AI Agent' : interview.recruiterName ?? 'Unassigned'}
                </div>
              </div>

              {interview.score !== undefined && (
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[1],
                  }}>
                    Score
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.sm,
                    color: interview.score >= 80 ? tokens.colors.successScale[700] : interview.score >= 60 ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700],
                    fontWeight: tokens.typography.fontWeight.semibold,
                  }}>
                    <Star size={14} />
                    {interview.score}/100
                  </div>
                </div>
              )}

              {interview.location && (
                <div>
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    marginBottom: tokens.spacing[1],
                  }}>
                    Location
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[800],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}>
                    <Video size={14} color={tokens.colors.neutral[400]} />
                    {interview.location}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <button
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  border: 'none',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <Video size={14} />
                Join Interview
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[700],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <ExternalLink size={14} />
                Profile
              </button>
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Header ─────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[4],
      }}>
        <div>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            Interview Center
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage and track all interviews across your pipeline
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {/* Preset view toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            overflow: 'hidden' as const,
          }}>
            {[
              { key: 'calendar', icon: <Calendar size={14} /> },
              { key: 'list', icon: <List size={14} /> },
              { key: 'timeline', icon: <Clock size={14} /> },
            ].map(({ key, icon }) => {
              const isActive = key === 'timeline';
              return (
                <button
                  key={key}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 28,
                    border: 'none',
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  {icon}
                </button>
              );
            })}
          </div>
          {onScheduleNew && (
            <button
              onClick={onScheduleNew}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                boxShadow: tokens.shadows.sm,
                outline: 'none',
              }}
            >
              <Plus size={16} />
              Schedule Interview
            </button>
          )}
        </div>
      </div>
    );

    // ─── Render: Empty State ────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacing[4],
        }}>
          <Clock size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          No interviews this week
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 360,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || filters.status || filters.type
            ? 'Try adjusting your filters or navigating to a different week.'
            : 'Schedule interviews to see them on the timeline.'}
        </div>
        {onScheduleNew && (
          <button
            onClick={onScheduleNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              boxShadow: tokens.shadows.sm,
              outline: 'none',
            }}
          >
            <Plus size={16} />
            Schedule Interview
          </button>
        )}
      </div>
    );

    // ─── Check if any interviews in current week ────────────────────────

    const hasInterviewsThisWeek = useMemo(() => {
      return weekDays.some(day => {
        const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
        return (interviewsByDay[key] || []).length > 0;
      });
    }, [weekDays, interviewsByDay]);

    // ─── Main Render ────────────────────────────────────────────────────

    return (
      <div
        className={className}
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {renderHeader()}
        {renderStatsBar()}
        {renderToolbar()}
        {renderNavigation()}

        {/* Timeline container */}
        {!hasInterviewsThisWeek ? renderEmptyState() : (
          <div
            ref={timelineRef}
            style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              padding: 0,
              overflow: 'auto' as const,
              ...(isModern ? glassCardStyle : {}),
            }}
          >
            {/* Hour headers */}
            {renderTimelineHeaders()}

            {/* Day rows */}
            {weekDays.map((day, idx) => renderDayRow(day, idx))}
          </div>
        )}

        {/* Detail popup */}
        {renderDetailPopup()}
      </div>
    );
  },
});
