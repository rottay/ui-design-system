'use client';

/**
 * BhInterviewCenter - List Preset
 * Sortable table view with all interview columns, inline status badges,
 * type indicators, and row actions.
 */

import { useState, useCallback, useMemo } from 'react';
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
} from '../../../helpers';
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
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  BarChart3,
  CalendarDays,
  Star,
  Eye,
  ExternalLink,
  ArrowUpDown,
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

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─── Table Columns ────────────────────────────────────────────────────────────

interface Column {
  key: string;
  label: string;
  width?: string;
  sortable: boolean;
}

const TABLE_COLUMNS: Column[] = [
  { key: 'candidateName', label: 'Candidate', sortable: true },
  { key: 'jobTitle', label: 'Position', sortable: true },
  { key: 'stageName', label: 'Stage', sortable: true },
  { key: 'type', label: 'Type', width: '90px', sortable: true },
  { key: 'status', label: 'Status', width: '120px', sortable: true },
  { key: 'dateTime', label: 'Date & Time', width: '160px', sortable: true },
  { key: 'duration', label: 'Duration', width: '90px', sortable: true },
  { key: 'score', label: 'Score', width: '80px', sortable: true },
  { key: 'interviewer', label: 'Interviewer', sortable: false },
  { key: 'actions', label: '', width: '80px', sortable: false },
];

// ─── List Preset ──────────────────────────────────────────────────────────────

export const ListBhInterviewCenter = createPreset<BhInterviewCenterProps>({
  name: 'BhInterviewCenter.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhInterviewCenterProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

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
    const [internalSortBy, setInternalSortBy] = useState(BH_INTERVIEW_CENTER_DEFAULTS.sortBy ?? 'dateTime');
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(
      BH_INTERVIEW_CENTER_DEFAULTS.sortDirection ?? 'asc'
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

    const filters = controlledFilters ?? internalFilters;
    const selectedInterview = controlledSelectedInterview ?? internalSelectedInterview;
    const sortBy = controlledSortBy ?? internalSortBy;
    const sortDirection = controlledSortDirection ?? internalSortDirection;

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
    }, [filters, handleFilterChange]);

    const handleTypeFilter = useCallback((type: InterviewType | null) => {
      handleFilterChange({ ...filters, type });
    }, [filters, handleFilterChange]);

    // ─── Filtered + Sorted Interviews ───────────────────────────────────

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
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(i =>
          i.candidateName.toLowerCase().includes(lower) ||
          i.jobTitle.toLowerCase().includes(lower) ||
          i.stageName.toLowerCase().includes(lower) ||
          (i.recruiterName && i.recruiterName.toLowerCase().includes(lower)) ||
          (i.agentName && i.agentName.toLowerCase().includes(lower))
        );
      }

      result.sort((a, b) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;
        switch (sortBy) {
          case 'dateTime':
            aVal = new Date(a.dateTime).getTime(); bVal = new Date(b.dateTime).getTime(); break;
          case 'candidateName':
            aVal = a.candidateName.toLowerCase(); bVal = b.candidateName.toLowerCase(); break;
          case 'jobTitle':
            aVal = a.jobTitle.toLowerCase(); bVal = b.jobTitle.toLowerCase(); break;
          case 'stageName':
            aVal = a.stageName.toLowerCase(); bVal = b.stageName.toLowerCase(); break;
          case 'duration':
            aVal = a.duration; bVal = b.duration; break;
          case 'score':
            aVal = a.score ?? 0; bVal = b.score ?? 0; break;
          case 'type':
            aVal = a.type; bVal = b.type; break;
          case 'status': {
            const order: Record<InterviewStatus, number> = { scheduled: 0, in_progress: 1, completed: 2, cancelled: 3, no_show: 4 };
            aVal = order[a.status]; bVal = order[b.status]; break;
          }
          default:
            aVal = new Date(a.dateTime).getTime(); bVal = new Date(b.dateTime).getTime();
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });

      return result;
    }, [interviews, filters, searchQuery, sortBy, sortDirection]);

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
            minWidth: 200,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search interviews..."
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

          {/* Results count */}
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}
          </span>
        </div>
      );
    };

    // ─── Render: Table Header ───────────────────────────────────────────

    const renderTableHeader = () => (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 100px 90px 120px 160px 90px 80px 1fr 80px',
        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        backgroundColor: tokens.colors.neutral[50],
        borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0`,
      }}>
        {TABLE_COLUMNS.map(col => {
          const isCurrentSort = sortBy === col.key;
          return (
            <div
              key={col.key}
              onClick={() => col.sortable && handleSortChange(col.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: isCurrentSort ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                cursor: col.sortable ? 'pointer' : 'default',
                userSelect: 'none' as const,
                transition: `all ${tokens.motion.hover}`,
                padding: `0 ${tokens.spacing[1]}px`,
              }}
            >
              {col.label}
              {col.sortable && isCurrentSort && (
                sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
              )}
              {col.sortable && !isCurrentSort && col.label && (
                <ArrowUpDown size={10} style={{ opacity: 0.3 }} />
              )}
            </div>
          );
        })}
      </div>
    );

    // ─── Render: Table Row ──────────────────────────────────────────────

    const renderTableRow = (interview: InterviewItem) => {
      const statusCfg = STATUS_CONFIG[interview.status];
      const typeCfg = TYPE_CONFIG[interview.type];
      const isHovered = hoveredRowId === interview.id;
      const isSelected = selectedInterview === interview.id;

      return (
        <div
          key={interview.id}
          onClick={() => handleInterviewSelect(interview.id)}
          onMouseEnter={() => setHoveredRowId(interview.id)}
          onMouseLeave={() => setHoveredRowId(null)}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 100px 90px 120px 160px 90px 80px 1fr 80px',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            backgroundColor: isSelected
              ? tokens.colors.primaryScale[50]
              : isHovered
                ? tokens.colors.neutral[50]
                : tokens.colors.common.white,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            alignItems: 'center',
          }}
        >
          {/* Candidate */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `0 ${tokens.spacing[1]}px`,
            minWidth: 0,
          }}>
            <div style={{
              width: 32,
              height: 32,
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
                <User size={14} color={tokens.colors.primaryScale[600]} />
              )}
            </div>
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[900],
              whiteSpace: 'nowrap' as const,
              overflow: 'hidden' as const,
              textOverflow: 'ellipsis' as const,
            }}>
              {interview.candidateName}
            </span>
          </div>

          {/* Position */}
          <div style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[700],
            padding: `0 ${tokens.spacing[1]}px`,
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden' as const,
            textOverflow: 'ellipsis' as const,
          }}>
            {interview.jobTitle}
          </div>

          {/* Stage */}
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[600],
            fontWeight: tokens.typography.fontWeight.medium,
            padding: `0 ${tokens.spacing[1]}px`,
          }}>
            {interview.stageName}
          </div>

          {/* Type */}
          <div style={{ padding: `0 ${tokens.spacing[1]}px` }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: '10px',
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: typeCfg.bgColor,
              color: typeCfg.color,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${typeCfg.borderColor}`,
            }}>
              {interview.type === 'ai' ? <Bot size={10} /> : <User size={10} />}
              {typeCfg.label}
            </span>
          </div>

          {/* Status */}
          <div style={{ padding: `0 ${tokens.spacing[1]}px` }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: '10px',
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: statusCfg.bgColor,
              color: statusCfg.color,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
            }}>
              <span style={{
                width: 5,
                height: 5,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: statusCfg.dotColor,
              }} />
              {statusCfg.label}
            </span>
          </div>

          {/* Date & Time */}
          <div style={{
            padding: `0 ${tokens.spacing[1]}px`,
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[800],
            }}>
              {formatDateShort(interview.dateTime)}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              {formatTime(interview.dateTime)}
            </div>
          </div>

          {/* Duration */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[600],
            fontWeight: tokens.typography.fontWeight.medium,
            padding: `0 ${tokens.spacing[1]}px`,
          }}>
            <Clock size={12} color={tokens.colors.neutral[400]} />
            {interview.duration}m
          </div>

          {/* Score */}
          <div style={{ padding: `0 ${tokens.spacing[1]}px` }}>
            {interview.score !== undefined ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: interview.score >= 80 ? tokens.colors.successScale[700] : interview.score >= 60 ? tokens.colors.warningScale[700] : tokens.colors.errorScale[700],
              }}>
                <Star size={12} />
                {interview.score}
              </span>
            ) : (
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[300],
              }}>
                --
              </span>
            )}
          </div>

          {/* Interviewer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[600],
            padding: `0 ${tokens.spacing[1]}px`,
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden' as const,
            textOverflow: 'ellipsis' as const,
          }}>
            {interview.type === 'ai' ? (
              <>
                <Bot size={12} color={tokens.colors.infoScale[500]} />
                {interview.agentName ?? 'AI Agent'}
              </>
            ) : (
              <>
                <User size={12} color={tokens.colors.secondaryScale[500]} />
                {interview.recruiterName ?? 'Unassigned'}
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            opacity: isHovered ? 1 : 0,
            transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`,
            padding: `0 ${tokens.spacing[1]}px`,
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleInterviewSelect(interview.id); }}
              title="View details"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              <Eye size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); }}
              title="Open profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      );
    };

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
          <Calendar size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          No interviews found
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 360,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || filters.status || filters.type
            ? 'Try adjusting your filters or search query to find interviews.'
            : 'Schedule your first interview to get started with the interview management hub.'}
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
              const isActive = key === 'list';
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

        {/* Table */}
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: 0,
          overflow: 'hidden' as const,
          ...(isModern ? glassCardStyle : {}),
        }}>
          {renderTableHeader()}
          {filteredInterviews.length === 0 ? renderEmptyState() : (
            <div>
              {filteredInterviews.map(interview => renderTableRow(interview))}
            </div>
          )}
        </div>
      </div>
    );
  },
});
