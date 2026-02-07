'use client';

/**
 * BhInterviewCenter - Calendar Preset
 * Full calendar view with stats bar, view toggle, month/week/day views,
 * filter bar, quick schedule FAB, and interview detail popup.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type {
  BhInterviewCenterProps,
  InterviewItem,
  InterviewType,
  InterviewStatus,
  InterviewFilter,
  CalendarView,
  SortDirection,
} from '../../core';
import { BH_INTERVIEW_CENTER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Calendar,
  List,
  Clock,
  Users,
  Bot,
  User,
  Video,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  BarChart3,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Star,
  Phone,
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
}

function getStatusConfig(tokens: DesignTokens): Record<InterviewStatus, StatusConfig> {
  return {
    scheduled: {
      label: 'Scheduled',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
      dotColor: tokens.colors.infoScale[500],
    },
    in_progress: {
      label: 'In Progress',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      dotColor: tokens.colors.warningScale[500],
    },
    completed: {
      label: 'Completed',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      dotColor: tokens.colors.successScale[500],
    },
    cancelled: {
      label: 'Cancelled',
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
      borderColor: tokens.colors.neutral[200],
      dotColor: tokens.colors.neutral[400],
    },
    no_show: {
      label: 'No Show',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      dotColor: tokens.colors.errorScale[500],
    },
  };
}

// ─── Type Config ──────────────────────────────────────────────────────────────

interface TypeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

function getTypeConfig(tokens: DesignTokens): Record<InterviewType, TypeConfig> {
  return {
    ai: {
      label: 'AI Interview',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[100],
      borderColor: tokens.colors.infoScale[200],
    },
    human: {
      label: 'Human Interview',
      color: tokens.colors.secondaryScale[700],
      bgColor: tokens.colors.secondaryScale[100],
      borderColor: tokens.colors.secondaryScale[200],
    },
  };
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();

  for (let i = startPad - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
  }
  return days;
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

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

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

function formatMonthYear(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

// ─── Calendar Preset ──────────────────────────────────────────────────────────

export const CalendarBhInterviewCenter = createPreset<BhInterviewCenterProps>({
  name: 'BhInterviewCenter.Calendar',
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
      calendarView: controlledCalendarView,
      onCalendarViewChange,
      sortBy: controlledSortBy,
      sortDirection: controlledSortDirection,
      onSortChange,
      dateRange: controlledDateRange,
      onDateRangeChange,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalCalendarView, setInternalCalendarView] = useState<CalendarView>(
      BH_INTERVIEW_CENTER_DEFAULTS.calendarView ?? 'week'
    );
    const [internalFilters, setInternalFilters] = useState<InterviewFilter>({});
    const [internalSelectedInterview, setInternalSelectedInterview] = useState<string | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [internalSortBy, setInternalSortBy] = useState(BH_INTERVIEW_CENTER_DEFAULTS.sortBy ?? 'dateTime');
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(
      BH_INTERVIEW_CENTER_DEFAULTS.sortDirection ?? 'asc'
    );

    const calendarView = controlledCalendarView ?? internalCalendarView;
    const filters = controlledFilters ?? internalFilters;
    const selectedInterview = controlledSelectedInterview ?? internalSelectedInterview;
    const sortBy = controlledSortBy ?? internalSortBy;
    const sortDirection = controlledSortDirection ?? internalSortDirection;

    // ─── Hover state ────────────────────────────────────────────────────

    const [hoveredInterviewId, setHoveredInterviewId] = useState<string | null>(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `1px solid ${tokens.glass.border}`,
    } : {};

    const glassSurfaceStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blurSm,
      WebkitBackdropFilter: tokens.glass.blurSm,
      backgroundColor: tokens.glass.bgLight,
      border: `1px solid ${tokens.glass.borderLight}`,
    } : {};

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleFilterChange = useCallback((newFilters: InterviewFilter) => {
      if (controlledFilters === undefined) setInternalFilters(newFilters);
      onFilterChange?.(newFilters);
    }, [controlledFilters, onFilterChange]);

    const handleCalendarViewChange = useCallback((view: CalendarView) => {
      if (controlledCalendarView === undefined) setInternalCalendarView(view);
      onCalendarViewChange?.(view);
    }, [controlledCalendarView, onCalendarViewChange]);

    const handleInterviewSelect = useCallback((id: string | null) => {
      if (controlledSelectedInterview === undefined) setInternalSelectedInterview(id);
      onInterviewSelect?.(id);
    }, [controlledSelectedInterview, onInterviewSelect]);

    const handleSortChange = useCallback((field: string) => {
      const newDirection = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
      if (controlledSortBy === undefined) {
        setInternalSortBy(field);
        setInternalSortDirection(newDirection);
      }
      onSortChange?.(field, newDirection);
    }, [sortBy, sortDirection, controlledSortBy, onSortChange]);

    const handleStatusFilter = useCallback((status: InterviewStatus | null) => {
      handleFilterChange({ ...filters, status });
      setShowStatusDropdown(false);
    }, [filters, handleFilterChange]);

    const handleTypeFilter = useCallback((type: InterviewType | null) => {
      handleFilterChange({ ...filters, type });
      setShowTypeDropdown(false);
    }, [filters, handleFilterChange]);

    const navigateDate = useCallback((direction: 'prev' | 'next' | 'today') => {
      if (direction === 'today') {
        setCurrentDate(new Date());
        return;
      }
      const d = new Date(currentDate);
      if (calendarView === 'month') {
        d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (calendarView === 'week') {
        d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        d.setDate(d.getDate() + (direction === 'next' ? 1 : -1));
      }
      setCurrentDate(d);
    }, [currentDate, calendarView]);

    // ─── Filtered Interviews ────────────────────────────────────────────

    const filteredInterviews = useMemo(() => {
      let result = [...interviews];
      if (filters.status) {
        result = result.filter(i => i.status === filters.status);
      }
      if (filters.type) {
        result = result.filter(i => i.type === filters.type);
      }
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        result = result.filter(i => {
          const d = new Date(i.dateTime);
          return d >= new Date(start) && d <= new Date(end);
        });
      }
      if (filters.jobId) {
        result = result.filter(i => i.jobTitle === filters.jobId);
      }
      if (filters.recruiterId) {
        result = result.filter(i => i.recruiterName === filters.recruiterId);
      }
      result.sort((a, b) => {
        const aTime = new Date(a.dateTime).getTime();
        const bTime = new Date(b.dateTime).getTime();
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      });
      return result;
    }, [interviews, filters, sortDirection]);

    // ─── Interviews by Date ─────────────────────────────────────────────

    const interviewsByDate = useMemo(() => {
      const map: Record<string, InterviewItem[]> = {};
      filteredInterviews.forEach(interview => {
        const d = new Date(interview.dateTime);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push(interview);
      });
      return map;
    }, [filteredInterviews]);

    function getInterviewsForDate(date: Date): InterviewItem[] {
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      return interviewsByDate[key] || [];
    }

    // ─── Selected Interview Data ────────────────────────────────────────

    const selectedInterviewData = useMemo(() => {
      if (!selectedInterview) return null;
      return interviews.find(i => i.id === selectedInterview) ?? null;
    }, [selectedInterview, interviews]);

    // ─── Render: Stats Bar ──────────────────────────────────────────────

    const renderStatsBar = () => {
      if (!stats) return null;

      const statItems = [
        {
          label: 'Scheduled Today',
          value: stats.scheduledToday,
          icon: <CalendarDays size={16} />,
          color: tokens.colors.infoScale[600],
          bg: tokens.colors.infoScale[50],
        },
        {
          label: 'In Progress',
          value: stats.inProgress,
          icon: <Activity size={16} />,
          color: tokens.colors.warningScale[600],
          bg: tokens.colors.warningScale[50],
          pulse: true,
        },
        {
          label: 'Completed',
          value: stats.completedToday,
          icon: <CheckCircle2 size={16} />,
          color: tokens.colors.successScale[600],
          bg: tokens.colors.successScale[50],
        },
        {
          label: 'No Shows',
          value: stats.noShows,
          icon: <XCircle size={16} />,
          color: tokens.colors.errorScale[600],
          bg: tokens.colors.errorScale[50],
        },
        {
          label: 'Avg Duration',
          value: `${stats.avgDuration}m`,
          icon: <Timer size={16} />,
          color: tokens.colors.secondaryScale[600],
          bg: tokens.colors.secondaryScale[50],
        },
        {
          label: 'Completion Rate',
          value: `${stats.completionRate}%`,
          icon: <BarChart3 size={16} />,
          color: tokens.colors.primaryScale[600],
          bg: tokens.colors.primaryScale[50],
          trend: stats.completionTrend,
        },
      ];

      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {statItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                display: 'flex',
                flexDirection: 'column' as const,
                gap: tokens.spacing[2],
                ...(isModern ? glassSurfaceStyle : {}),
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                }}>
                  {item.icon}
                </div>
                {item.pulse && (
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.warningScale[500],
                    boxShadow: `0 0 0 3px ${tokens.colors.warningScale[100]}`,
                    animation: 'pulse 2s ease-in-out infinite',
                  }} />
                )}
                {item.trend !== undefined && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: item.trend >= 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600],
                  }}>
                    {item.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(item.trend)}%
                  </div>
                )}
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {item.value}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                  marginTop: tokens.spacing[1],
                }}>
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: View Toggle ────────────────────────────────────────────

    const renderViewToggle = () => {
      const views: { key: CalendarView; icon: React.ReactNode; label: string }[] = [
        { key: 'month', icon: <CalendarDays size={14} />, label: 'Month' },
        { key: 'week', icon: <CalendarRange size={14} />, label: 'Week' },
        { key: 'day', icon: <CalendarClock size={14} />, label: 'Day' },
      ];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.neutral[200]}`,
          overflow: 'hidden' as const,
        }}>
          {views.map(({ key, icon, label }) => {
            const isActive = calendarView === key;
            return (
              <button
                key={key}
                onClick={() => handleCalendarViewChange(key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  border: 'none',
                  backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  borderRight: `1px solid ${tokens.colors.neutral[200]}`,
                }}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </div>
      );
    };

    // ─── Render: Preset View Toggle (calendar/list/timeline) ─────────────

    const renderPresetToggle = () => {
      const presetViews = [
        { key: 'calendar' as const, icon: <Calendar size={14} /> },
        { key: 'list' as const, icon: <List size={14} /> },
        { key: 'timeline' as const, icon: <Clock size={14} /> },
      ];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.neutral[200]}`,
          overflow: 'hidden' as const,
        }}>
          {presetViews.map(({ key, icon }) => {
            const isActive = key === 'calendar';
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
      );
    };

    // ─── Render: Calendar Navigation ────────────────────────────────────

    const renderCalendarNavigation = () => {
      let label = '';
      if (calendarView === 'month') {
        label = formatMonthYear(currentDate);
      } else if (calendarView === 'week') {
        const weekDays = getWeekDays(currentDate);
        label = `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`;
      } else {
        label = formatDate(currentDate);
      }

      return (
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
              border: `1px solid ${tokens.colors.neutral[200]}`,
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
              border: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            Today
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
              border: `1px solid ${tokens.colors.neutral[200]}`,
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
            {label}
          </span>
        </div>
      );
    };

    // ─── Render: Type Badge ─────────────────────────────────────────────

    const renderTypeBadge = (type: InterviewType, size: 'sm' | 'md' = 'sm') => {
      const cfg = TYPE_CONFIG[type];
      const iconSize = size === 'sm' ? 10 : 12;
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: size === 'sm'
            ? `0 ${tokens.spacing[1]}px`
            : `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: size === 'sm' ? '10px' : tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          backgroundColor: cfg.bgColor,
          color: cfg.color,
          border: `1px solid ${cfg.borderColor}`,
          whiteSpace: 'nowrap' as const,
        }}>
          {type === 'ai' ? <Bot size={iconSize} /> : <User size={iconSize} />}
          {size === 'md' && (type === 'ai' ? 'AI' : 'Human')}
        </span>
      );
    };

    // ─── Render: Status Badge ───────────────────────────────────────────

    const renderStatusBadge = (status: InterviewStatus) => {
      const cfg = STATUS_CONFIG[status];
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          backgroundColor: cfg.bgColor,
          color: cfg.color,
          border: `1px solid ${cfg.borderColor}`,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: cfg.dotColor,
          }} />
          {cfg.label}
        </span>
      );
    };

    // ─── Render: Filter Bar ─────────────────────────────────────────────

    const renderFilterBar = () => {
      const statusOptions: (InterviewStatus | null)[] = [null, 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
      const typeOptions: (InterviewType | null)[] = [null, 'ai', 'human'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px 0`,
          marginBottom: tokens.spacing[3],
          flexWrap: 'wrap' as const,
        }}>
          {/* Status chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Filter size={14} color={tokens.colors.neutral[400]} />
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
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    border: `1px solid ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
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
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    border: `1px solid ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  {type === 'ai' && <Bot size={12} />}
                  {type === 'human' && <User size={12} />}
                  {type === null ? 'All Types' : type === 'ai' ? 'AI' : 'Human'}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* View toggle + navigation */}
          {renderViewToggle()}
        </div>
      );
    };

    // ─── Render: Month View ─────────────────────────────────────────────

    const renderMonthView = () => {
      const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
      const today = new Date();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: 0,
          overflow: 'hidden' as const,
          ...(isModern ? glassCardStyle : {}),
        }}>
          {/* Day name headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}>
            {dayNames.map(name => (
              <div
                key={name}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textAlign: 'center' as const,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
          }}>
            {days.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, today);
              const dayInterviews = getInterviewsForDate(day);
              const aiCount = dayInterviews.filter(i => i.type === 'ai').length;
              const humanCount = dayInterviews.filter(i => i.type === 'human').length;

              return (
                <div
                  key={idx}
                  style={{
                    minHeight: 90,
                    padding: tokens.spacing[2],
                    borderRight: (idx + 1) % 7 !== 0 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                    borderBottom: idx < days.length - 7 ? `1px solid ${tokens.colors.neutral[100]}` : 'none',
                    backgroundColor: isToday ? tokens.colors.primaryScale[50] : isCurrentMonth ? tokens.colors.common.white : tokens.colors.neutral[50],
                    cursor: dayInterviews.length > 0 ? 'pointer' : 'default',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[1],
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: tokens.borderRadius.full,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: isToday ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.medium,
                      color: isToday ? tokens.colors.common.white : isCurrentMonth ? tokens.colors.neutral[800] : tokens.colors.neutral[400],
                      backgroundColor: isToday ? tokens.colors.primaryScale[600] : 'transparent',
                    }}>
                      {day.getDate()}
                    </span>
                    {dayInterviews.length > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 18,
                        height: 18,
                        borderRadius: tokens.borderRadius.full,
                        fontSize: '10px',
                        fontWeight: tokens.typography.fontWeight.bold,
                        backgroundColor: tokens.colors.primaryScale[100],
                        color: tokens.colors.primaryScale[700],
                        padding: `0 ${tokens.spacing[1]}px`,
                      }}>
                        {dayInterviews.length}
                      </span>
                    )}
                  </div>
                  {/* Colored dots for interview types */}
                  {dayInterviews.length > 0 && (
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' as const }}>
                      {aiCount > 0 && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                          fontSize: '9px',
                          color: tokens.colors.infoScale[600],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.infoScale[500],
                          }} />
                          {aiCount}
                        </span>
                      )}
                      {humanCount > 0 && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                          fontSize: '9px',
                          color: tokens.colors.secondaryScale[600],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.secondaryScale[500],
                          }} />
                          {humanCount}
                        </span>
                      )}
                    </div>
                  )}
                  {/* First 2 interview mini-cards */}
                  {dayInterviews.slice(0, 2).map(interview => (
                    <div
                      key={interview.id}
                      onClick={() => handleInterviewSelect(interview.id)}
                      style={{
                        marginTop: 2,
                        padding: `1px ${tokens.spacing[1]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        fontSize: '9px',
                        fontWeight: tokens.typography.fontWeight.medium,
                        backgroundColor: interview.type === 'ai' ? tokens.colors.infoScale[50] : tokens.colors.secondaryScale[50],
                        color: interview.type === 'ai' ? tokens.colors.infoScale[700] : tokens.colors.secondaryScale[700],
                        whiteSpace: 'nowrap' as const,
                        overflow: 'hidden' as const,
                        textOverflow: 'ellipsis' as const,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {formatTime(interview.dateTime)} {interview.candidateName.split(' ')[0]}
                    </div>
                  ))}
                  {dayInterviews.length > 2 && (
                    <div style={{
                      marginTop: 2,
                      fontSize: '9px',
                      color: tokens.colors.neutral[500],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}>
                      +{dayInterviews.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // ─── Render: Week View ──────────────────────────────────────────────

    const renderWeekView = () => {
      const weekDays = getWeekDays(currentDate);
      const today = new Date();

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: 0,
          overflow: 'hidden' as const,
          ...(isModern ? glassCardStyle : {}),
        }}>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px repeat(7, 1fr)',
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          }}>
            <div style={{ padding: tokens.spacing[2] }} />
            {weekDays.map((day, idx) => {
              const isToday = isSameDay(day, today);
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return (
                <div
                  key={idx}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[1]}px`,
                    textAlign: 'center' as const,
                    borderLeft: `1px solid ${tokens.colors.neutral[100]}`,
                    backgroundColor: isToday ? tokens.colors.primaryScale[50] : 'transparent',
                  }}
                >
                  <div style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>
                    {dayNames[idx]}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: isToday ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.medium,
                    color: isToday ? tokens.colors.common.white : tokens.colors.neutral[800],
                    backgroundColor: isToday ? tokens.colors.primaryScale[600] : 'transparent',
                    marginTop: tokens.spacing[1],
                  }}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hourly rows */}
          <div style={{ position: 'relative' as const }}>
            {HOURS.map(hour => (
              <div
                key={hour}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px repeat(7, 1fr)',
                  minHeight: 60,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                }}
              >
                {/* Time label */}
                <div style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  fontWeight: tokens.typography.fontWeight.medium,
                  textAlign: 'right' as const,
                  position: 'relative' as const,
                  top: -6,
                }}>
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIdx) => {
                  const isToday = isSameDay(day, today);
                  const dayInterviews = getInterviewsForDate(day);
                  const hourInterviews = dayInterviews.filter(i => {
                    const iHour = new Date(i.dateTime).getHours();
                    return iHour === hour;
                  });

                  return (
                    <div
                      key={dayIdx}
                      style={{
                        borderLeft: `1px solid ${tokens.colors.neutral[100]}`,
                        padding: 2,
                        backgroundColor: isToday ? `${tokens.colors.primaryScale[50]}33` : 'transparent',
                        position: 'relative' as const,
                      }}
                    >
                      {hourInterviews.map(interview => {
                        const durationBlocks = Math.max(1, Math.round(interview.duration / 60));
                        return (
                          <div
                            key={interview.id}
                            onClick={() => handleInterviewSelect(interview.id)}
                            onMouseEnter={() => setHoveredInterviewId(interview.id)}
                            onMouseLeave={() => setHoveredInterviewId(null)}
                            style={{
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: interview.type === 'ai' ? tokens.colors.infoScale[100] : tokens.colors.secondaryScale[100],
                              borderLeft: `3px solid ${interview.type === 'ai' ? tokens.colors.infoScale[500] : tokens.colors.secondaryScale[500]}`,
                              fontSize: '10px',
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: interview.type === 'ai' ? tokens.colors.infoScale[800] : tokens.colors.secondaryScale[800],
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              marginBottom: 2,
                              overflow: 'hidden' as const,
                              minHeight: `${durationBlocks * 28}px`,
                              transform: hoveredInterviewId === interview.id ? tokens.motion.transform : 'none',
                            }}
                          >
                            <div style={{
                              fontWeight: tokens.typography.fontWeight.semibold,
                              whiteSpace: 'nowrap' as const,
                              overflow: 'hidden' as const,
                              textOverflow: 'ellipsis' as const,
                            }}>
                              {interview.candidateName}
                            </div>
                            <div style={{ opacity: 0.8, marginTop: 1 }}>
                              {formatTime(interview.dateTime)} - {interview.duration}m
                            </div>
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

    // ─── Render: Day View ───────────────────────────────────────────────

    const renderDayView = () => {
      const today = new Date();
      const isToday = isSameDay(currentDate, today);
      const dayInterviews = getInterviewsForDate(currentDate);

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: 0,
          overflow: 'hidden' as const,
          ...(isModern ? glassCardStyle : {}),
        }}>
          {/* Day header */}
          <div style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
            backgroundColor: isToday ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
            }}>
              {formatDate(currentDate)}
              {isToday && (
                <span style={{
                  marginLeft: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.primaryScale[600],
                  backgroundColor: tokens.colors.primaryScale[100],
                  padding: `0 ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                }}>
                  Today
                </span>
              )}
            </div>
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}>
              {dayInterviews.length} interview{dayInterviews.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Hourly slots */}
          {HOURS.map(hour => {
            const hourInterviews = dayInterviews.filter(i => {
              const iHour = new Date(i.dateTime).getHours();
              return iHour === hour;
            });

            return (
              <div
                key={hour}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  minHeight: 70,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                }}
              >
                {/* Time label */}
                <div style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                  fontWeight: tokens.typography.fontWeight.medium,
                  textAlign: 'right' as const,
                  borderRight: `1px solid ${tokens.colors.neutral[100]}`,
                }}>
                  {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`}
                </div>

                {/* Interview blocks */}
                <div style={{ padding: tokens.spacing[1] }}>
                  {hourInterviews.map(interview => (
                    <div
                      key={interview.id}
                      onClick={() => handleInterviewSelect(interview.id)}
                      onMouseEnter={() => setHoveredInterviewId(interview.id)}
                      onMouseLeave={() => setHoveredInterviewId(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: interview.type === 'ai' ? tokens.colors.infoScale[50] : tokens.colors.secondaryScale[50],
                        borderLeft: `4px solid ${interview.type === 'ai' ? tokens.colors.infoScale[500] : tokens.colors.secondaryScale[500]}`,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        marginBottom: tokens.spacing[1],
                        transform: hoveredInterviewId === interview.id ? tokens.motion.transform : 'none',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: interview.type === 'ai' ? tokens.colors.infoScale[200] : tokens.colors.secondaryScale[200],
                        backgroundImage: interview.candidateAvatar ? `url(${interview.candidateAvatar})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {!interview.candidateAvatar && (
                          <User size={16} color={interview.type === 'ai' ? tokens.colors.infoScale[600] : tokens.colors.secondaryScale[600]} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          whiteSpace: 'nowrap' as const,
                          overflow: 'hidden' as const,
                          textOverflow: 'ellipsis' as const,
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

                      {/* Time + badges */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}>
                          {formatTime(interview.dateTime)} &middot; {interview.duration}m
                        </span>
                        {renderTypeBadge(interview.type, 'md')}
                        {renderStatusBadge(interview.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    // ─── Render: Interview Detail Popup ─────────────────────────────────

    const renderDetailPopup = () => {
      if (!selectedInterviewData) return null;
      const interview = selectedInterviewData;
      const typeCfg = TYPE_CONFIG[interview.type];
      const statusCfg = STATUS_CONFIG[interview.status];

      return (
        <div
          style={{
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
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
              width: 480,
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
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            }}>
              <div style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                Interview Details
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
                  border: `1px solid ${tokens.colors.neutral[200]}`,
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

            {/* Candidate info */}
            <div style={{
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            }}>
              <div style={{
                width: 48,
                height: 48,
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
                  <User size={20} color={tokens.colors.primaryScale[600]} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  {interview.candidateName}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  marginTop: 2,
                }}>
                  {interview.jobTitle} &middot; {interview.stageName}
                </div>
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                {renderTypeBadge(interview.type, 'md')}
                {renderStatusBadge(interview.status)}
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px` }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              }}>
                {/* Date & Time */}
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

                {/* Duration */}
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

                {/* Interviewer */}
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

                {/* Location */}
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

                {/* Score */}
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
              </div>

              {/* Action buttons */}
              <div style={{
                display: 'flex',
                gap: tokens.spacing[2],
                marginTop: tokens.spacing[5],
                paddingTop: tokens.spacing[4],
                borderTop: `1px solid ${tokens.colors.neutral[100]}`,
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
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  <ExternalLink size={14} />
                  Profile
                </button>
                {interview.status === 'scheduled' && (
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
                      color: tokens.colors.errorScale[600],
                      border: `1px solid ${tokens.colors.errorScale[200]}`,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      outline: 'none',
                    }}
                  >
                    <XCircle size={14} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Quick Schedule FAB ─────────────────────────────────────

    const renderFAB = () => {
      if (!onScheduleNew) return null;

      return (
        <button
          onClick={onScheduleNew}
          style={{
            position: 'fixed' as const,
            bottom: tokens.spacing[8],
            right: tokens.spacing[8],
            width: 56,
            height: 56,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[600],
            color: tokens.colors.common.white,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: tokens.shadows.lg,
            transition: `all ${tokens.motion.hover}`,
            outline: 'none',
            zIndex: 100,
          }}
          title="Schedule new interview"
        >
          <Plus size={24} />
        </button>
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
          {renderPresetToggle()}
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

    // ─── Render: Calendar Toolbar ────────────────────────────────────────

    const renderCalendarToolbar = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[3],
      }}>
        {renderCalendarNavigation()}
        {renderViewToggle()}
      </div>
    );

    // ─── Main Render ────────────────────────────────────────────────────

    return (
      <div
        className={className}
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
          fontFamily: 'inherit',
          position: 'relative' as const,
          ...style,
        }}
      >
        {renderHeader()}
        {renderStatsBar()}
        {renderFilterBar()}
        {renderCalendarToolbar()}
        {calendarView === 'month' && renderMonthView()}
        {calendarView === 'week' && renderWeekView()}
        {calendarView === 'day' && renderDayView()}
        {renderFAB()}
        {renderDetailPopup()}
      </div>
    );
  },
});
