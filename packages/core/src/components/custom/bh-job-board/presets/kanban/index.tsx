'use client';

/**
 * BhJobBoard - Kanban Preset
 * Columns by status (draft -> published -> paused -> closed) with
 * drag-and-drop visual support and job cards within each column.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type { BhJobBoardProps, JobItem, JobStatus, JobUrgency, JobBoardFilter, ViewMode } from '../../core';
import { BH_JOB_BOARD_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase,
  Plus,
  Search,
  LayoutGrid,
  List,
  Columns3,
  MapPin,
  Clock,
  Users,
  Eye,
  Pencil,
  AlertCircle,
  Globe,
  X,
  GripVertical,
  Filter,
  ChevronDown,
} from 'lucide-react';

// ─── Status Config ────────────────────────────────────────────────────────────

interface StatusColumnConfig {
  key: JobStatus;
  label: string;
  color: string;
  bgColor: string;
  headerBg: string;
  borderColor: string;
  dotColor: string;
  accentBorder: string;
}

function getStatusColumns(tokens: DesignTokens): StatusColumnConfig[] {
  return [
    {
      key: 'draft',
      label: 'Draft',
      color: tokens.colors.neutral[700],
      bgColor: tokens.colors.neutral[50],
      headerBg: tokens.colors.neutral[100],
      borderColor: tokens.colors.neutral[200],
      dotColor: tokens.colors.neutral[400],
      accentBorder: tokens.colors.neutral[300],
    },
    {
      key: 'published',
      label: 'Published',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      headerBg: tokens.colors.successScale[100],
      borderColor: tokens.colors.successScale[200],
      dotColor: tokens.colors.successScale[500],
      accentBorder: tokens.colors.successScale[400],
    },
    {
      key: 'paused',
      label: 'Paused',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      headerBg: tokens.colors.warningScale[100],
      borderColor: tokens.colors.warningScale[200],
      dotColor: tokens.colors.warningScale[500],
      accentBorder: tokens.colors.warningScale[400],
    },
    {
      key: 'closed',
      label: 'Closed',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      headerBg: tokens.colors.errorScale[100],
      borderColor: tokens.colors.errorScale[200],
      dotColor: tokens.colors.errorScale[500],
      accentBorder: tokens.colors.errorScale[400],
    },
  ];
}

// ─── Urgency Config ───────────────────────────────────────────────────────────

interface UrgencyConfig {
  label: string;
  color: string;
  bgColor: string;
}

function getUrgencyConfig(tokens: DesignTokens): Record<JobUrgency, UrgencyConfig> {
  return {
    low: {
      label: 'Low',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[100],
    },
    medium: {
      label: 'Medium',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[100],
    },
    high: {
      label: 'High',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[100],
    },
    critical: {
      label: 'Critical',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[100],
    },
  };
}

// ─── Stage colors ─────────────────────────────────────────────────────────────

function getStageColors(tokens: DesignTokens): string[] {
  return [
    tokens.colors.primaryScale[500],
    tokens.colors.infoScale[500],
    tokens.colors.warningScale[500],
    tokens.colors.successScale[500],
    tokens.colors.secondaryScale[500],
    tokens.colors.errorScale[400],
  ];
}

// ─── Kanban Preset ────────────────────────────────────────────────────────────

export const KanbanBhJobBoard = createPreset<BhJobBoardProps>({
  name: 'BhJobBoard.Kanban',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhJobBoardProps>) => {
    const { Box, Stack } = primitives;
    const isModern = engine === 'modern';

    const STATUS_COLUMNS = useMemo(() => getStatusColumns(tokens), [tokens]);
    const URGENCY_CONFIG = useMemo(() => getUrgencyConfig(tokens), [tokens]);
    const STAGE_COLORS = useMemo(() => getStageColors(tokens), [tokens]);

    const {
      jobs,
      stats = [],
      filters: controlledFilters,
      onFilterChange,
      onViewModeChange,
      onJobClick,
      onCreateJob,
      selectedJobs: controlledSelectedJobs,
      onSelectionChange,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      sortBy: controlledSortBy,
      sortDirection: controlledSortDirection,
      onSortChange,
      emptyText = BH_JOB_BOARD_DEFAULTS.emptyText,
      departments = [],
      clients = [],
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalFilters, setInternalFilters] = useState<JobBoardFilter>({});
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedJobs, setInternalSelectedJobs] = useState<string[]>([]);
    const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
    const [dragState, setDragState] = useState<{
      jobId: string;
      fromStatus: JobStatus;
    } | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<JobStatus | null>(null);

    const filters = controlledFilters ?? internalFilters;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const selectedJobs = controlledSelectedJobs ?? internalSelectedJobs;

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleFilterChange = useCallback((newFilters: JobBoardFilter) => {
      if (controlledFilters === undefined) setInternalFilters(newFilters);
      onFilterChange?.(newFilters);
    }, [controlledFilters, onFilterChange]);

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
      onViewModeChange?.(mode);
    }, [onViewModeChange]);

    const handleSelectionToggle = useCallback((jobId: string) => {
      const next = selectedJobs.includes(jobId)
        ? selectedJobs.filter(id => id !== jobId)
        : [...selectedJobs, jobId];
      if (controlledSelectedJobs === undefined) setInternalSelectedJobs(next);
      onSelectionChange?.(next);
    }, [selectedJobs, controlledSelectedJobs, onSelectionChange]);

    // ─── Drag Handlers ──────────────────────────────────────────────────

    const handleDragStart = useCallback((jobId: string, fromStatus: JobStatus) => {
      setDragState({ jobId, fromStatus });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, status: JobStatus) => {
      e.preventDefault();
      setDragOverColumn(status);
    }, []);

    const handleDragLeave = useCallback(() => {
      setDragOverColumn(null);
    }, []);

    const handleDrop = useCallback((targetStatus: JobStatus) => {
      if (dragState && dragState.fromStatus !== targetStatus) {
        // Visual feedback - in production this would call an API
        // The drag state is cleared regardless
      }
      setDragState(null);
      setDragOverColumn(null);
    }, [dragState]);

    const handleDragEnd = useCallback(() => {
      setDragState(null);
      setDragOverColumn(null);
    }, []);

    // ─── Filtered Jobs ──────────────────────────────────────────────────

    const filteredJobs = useMemo(() => {
      let result = [...jobs];

      if (filters.department) {
        result = result.filter(j => j.department === filters.department);
      }
      if (filters.urgency) {
        result = result.filter(j => j.urgency === filters.urgency);
      }
      if (filters.clientId) {
        result = result.filter(j => j.clientName === clients.find(c => c.id === filters.clientId)?.name);
      }
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(j =>
          j.title.toLowerCase().includes(lower) ||
          j.code.toLowerCase().includes(lower) ||
          j.department.toLowerCase().includes(lower) ||
          j.location.toLowerCase().includes(lower) ||
          (j.clientName && j.clientName.toLowerCase().includes(lower))
        );
      }

      return result;
    }, [jobs, filters, searchQuery, clients]);

    // Group jobs by status
    const jobsByStatus = useMemo(() => {
      const grouped: Record<JobStatus, JobItem[]> = {
        draft: [],
        published: [],
        paused: [],
        closed: [],
      };
      filteredJobs.forEach(job => {
        grouped[job.status].push(job);
      });
      // Sort each column by days open descending
      Object.values(grouped).forEach(arr => {
        arr.sort((a, b) => b.daysOpen - a.daysOpen);
      });
      return grouped;
    }, [filteredJobs]);

    // ─── Glass Styles ───────────────────────────────────────────────────

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

    // ─── Render: Candidate Mini-Bar ─────────────────────────────────────

    const renderCandidateMiniBar = (job: JobItem) => {
      const total = job.candidatesByStage.reduce((sum, s) => sum + s.count, 0);
      if (total === 0) {
        return (
          <div style={{
            height: 4,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[100],
            width: '100%',
          }} />
        );
      }

      const barWidth = 160;
      const barHeight = 4;
      let xOffset = 0;

      return (
        <svg
          width="100%"
          height={barHeight}
          viewBox={`0 0 ${barWidth} ${barHeight}`}
          preserveAspectRatio="none"
          style={{ borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const, display: 'block' }}
        >
          <rect x={0} y={0} width={barWidth} height={barHeight} fill={tokens.colors.neutral[100]} rx={2} />
          {job.candidatesByStage.map((stage, idx) => {
            const segWidth = (stage.count / total) * barWidth;
            const x = xOffset;
            xOffset += segWidth;
            return (
              <rect
                key={stage.stage}
                x={x}
                y={0}
                width={segWidth}
                height={barHeight}
                fill={STAGE_COLORS[idx % STAGE_COLORS.length]}
                rx={idx === 0 ? 2 : 0}
              />
            );
          })}
        </svg>
      );
    };

    // ─── Render: Avatar Stack ───────────────────────────────────────────

    const renderAvatarStack = (avatars: string[]) => {
      const maxShow = 2;
      const shown = avatars.slice(0, maxShow);
      const remaining = avatars.length - maxShow;

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {shown.map((avatar, idx) => (
            <div
              key={idx}
              style={{
                width: 20,
                height: 20,
                borderRadius: tokens.borderRadius.full,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                backgroundColor: tokens.colors.primaryScale[100],
                backgroundImage: avatar ? `url(${avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginLeft: idx > 0 ? -6 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[600],
                position: 'relative' as const,
                zIndex: maxShow - idx,
              }}
            >
              {!avatar && <Users size={8} />}
            </div>
          ))}
          {remaining > 0 && (
            <div style={{
              width: 20,
              height: 20,
              borderRadius: tokens.borderRadius.full,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
              backgroundColor: tokens.colors.neutral[100],
              marginLeft: -6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[600],
            }}>
              +{remaining}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Job Kanban Card ────────────────────────────────────────

    const renderKanbanCard = (job: JobItem, columnConfig: StatusColumnConfig) => {
      const urgencyCfg = URGENCY_CONFIG[job.urgency];
      const isHovered = hoveredJobId === job.id;
      const isDragging = dragState?.jobId === job.id;
      const isSelected = selectedJobs.includes(job.id);

      return (
        <div
          key={job.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            handleDragStart(job.id, job.status);
          }}
          onDragEnd={handleDragEnd}
          style={{
            ...createCardStyle(tokens, { elevation: isHovered ? 'md' : 'sm', glass: isModern }),
            padding: tokens.spacing[3],
            cursor: 'grab',
            opacity: isDragging ? 0.5 : 1,
            transform: isHovered && !isDragging ? tokens.motion.transform : 'none',
            transition: `all ${tokens.motion.hover}`,
            border: isSelected
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[400]}`
              : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            ...(isModern ? glassCardStyle : {}),
          }}
          onMouseEnter={() => setHoveredJobId(job.id)}
          onMouseLeave={() => setHoveredJobId(null)}
          onClick={() => onJobClick?.(job.id)}
        >
          {/* Drag handle + Urgency + Selection */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[2],
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <GripVertical size={12} color={tokens.colors.neutral[300]} style={{ cursor: 'grab' }} />
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `0 ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: '10px',
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: urgencyCfg.bgColor,
                color: urgencyCfg.color,
              }}>
                <AlertCircle size={9} />
                {urgencyCfg.label}
              </span>
            </div>
            <div
              onClick={(e) => { e.stopPropagation(); handleSelectionToggle(job.id); }}
              style={{
                width: 14,
                height: 14,
                borderRadius: tokens.borderRadius.sm,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                flexShrink: 0,
              }}
            >
              {isSelected && (
                <svg width={8} height={8} viewBox="0 0 10 10">
                  <path d="M2 5L4.5 7.5L8 3" stroke={tokens.colors.common.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>

          {/* Title + Code */}
          <div style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            lineHeight: tokens.typography.lineHeight.tight,
            marginBottom: tokens.spacing[1],
          }}>
            {job.title}
          </div>
          <div style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[2],
          }}>
            {job.code} &middot; {job.department}
          </div>

          {/* Location */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: '10px',
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[2],
          }}>
            {job.isRemote ? (
              <>
                <Globe size={10} />
                <span>Remote</span>
              </>
            ) : (
              <>
                <MapPin size={10} />
                <span>{job.location}</span>
              </>
            )}
            {job.clientName && (
              <>
                <span style={{ color: tokens.colors.neutral[300] }}>&middot;</span>
                <span>{job.clientName}</span>
              </>
            )}
          </div>

          {/* Candidate mini progress bar */}
          <div style={{ marginBottom: tokens.spacing[2] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 2,
            }}>
              <span style={{
                fontSize: '10px',
                color: tokens.colors.neutral[600],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                {job.candidateCount} candidates
              </span>
            </div>
            {renderCandidateMiniBar(job)}
          </div>

          {/* Bottom: Days open + Avatars + Quick actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: tokens.spacing[2],
            paddingTop: tokens.spacing[2],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                fontSize: '10px',
                color: job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                <Clock size={10} />
                {job.daysOpen}d
              </span>
              {renderAvatarStack(job.recruiterAvatars)}
            </div>

            {/* Quick actions on hover */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`,
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); onJobClick?.(job.id); }}
                title="View"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: tokens.borderRadius.sm,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  padding: 0,
                }}
              >
                <Eye size={10} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                title="Edit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: tokens.borderRadius.sm,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  padding: 0,
                }}
              >
                <Pencil size={10} />
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
            Jobs
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage and track all your open positions
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {/* View toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            overflow: 'hidden' as const,
          }}>
            {([
              { mode: 'grid' as ViewMode, icon: <LayoutGrid size={14} /> },
              { mode: 'table' as ViewMode, icon: <List size={14} /> },
              { mode: 'kanban' as ViewMode, icon: <Columns3 size={14} /> },
            ]).map(({ mode, icon }) => {
              const isActive = mode === 'kanban';
              return (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode)}
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

          {onCreateJob && (
            <button
              onClick={onCreateJob}
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
              New Job
            </button>
          )}
        </div>
      </div>
    );

    // ─── Render: Filter Bar ─────────────────────────────────────────────

    const renderFilterBar = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        marginBottom: tokens.spacing[4],
        flexWrap: 'wrap' as const,
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          minWidth: 220,
        }}>
          <Search size={14} color={tokens.colors.neutral[400]} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
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
              onClick={() => handleSearchChange('')}
            />
          )}
        </div>

        {/* Department filter */}
        {departments.length > 0 && (
          <select
            value={filters.department ?? ''}
            onChange={(e) => handleFilterChange({ ...filters, department: e.target.value || null })}
            style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filters.department ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filters.department ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: filters.department ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              outline: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        )}

        {/* Urgency filter */}
        {(['low', 'medium', 'high', 'critical'] as JobUrgency[]).map(urgency => {
          const isActive = filters.urgency === urgency;
          const cfg = URGENCY_CONFIG[urgency];
          return (
            <button
              key={urgency}
              onClick={() => handleFilterChange({ ...filters, urgency: isActive ? null : urgency })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? cfg.color : tokens.colors.neutral[200]}`,
                backgroundColor: isActive ? cfg.bgColor : tokens.colors.common.white,
                color: isActive ? cfg.color : tokens.colors.neutral[500],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              {cfg.label}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Job count summary */}
        <span style={{
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.neutral[500],
        }}>
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} across {STATUS_COLUMNS.length} columns
        </span>
      </div>
    );

    // ─── Render: Kanban Column ──────────────────────────────────────────

    const renderKanbanColumn = (colConfig: StatusColumnConfig) => {
      const columnJobs = jobsByStatus[colConfig.key];
      const isDraggedOver = dragOverColumn === colConfig.key && dragState && dragState.fromStatus !== colConfig.key;

      return (
        <div
          key={colConfig.key}
          style={{
            flex: 1,
            minWidth: 280,
            display: 'flex',
            flexDirection: 'column' as const,
            maxHeight: '100%',
          }}
          onDragOver={(e) => handleDragOver(e, colConfig.key)}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop(colConfig.key)}
        >
          {/* Column header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            backgroundColor: colConfig.headerBg,
            borderRadius: `${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0 0`,
            borderTop: `3px solid ${colConfig.accentBorder}`,
            ...(isModern ? glassSurfaceStyle : {}),
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: colConfig.dotColor,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: colConfig.color,
              }}>
                {colConfig.label}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20,
                height: 20,
                padding: `0 ${tokens.spacing[1]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
                backgroundColor: colConfig.bgColor,
                color: colConfig.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colConfig.borderColor}`,
              }}>
                {columnJobs.length}
              </span>
            </div>
            {colConfig.key === 'draft' && onCreateJob && (
              <button
                onClick={onCreateJob}
                title="Create new job"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  padding: 0,
                }}
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* Column body */}
          <div style={{
            flex: 1,
            backgroundColor: isDraggedOver
              ? tokens.colors.primaryScale[50]
              : tokens.colors.neutral[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isDraggedOver ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
            borderTop: 'none',
            borderRadius: `0 0 ${tokens.borderRadius.lg} ${tokens.borderRadius.lg}`,
            padding: tokens.spacing[2],
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[2],
            overflowY: 'auto' as const,
            transition: `all ${tokens.motion.hover}`,
            minHeight: 200,
          }}>
            {columnJobs.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${tokens.spacing[6]}px ${tokens.spacing[3]}px`,
                textAlign: 'center' as const,
              }}>
                <Briefcase size={20} color={tokens.colors.neutral[300]} style={{ marginBottom: tokens.spacing[2] }} />
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  No {colConfig.label.toLowerCase()} jobs
                </span>
                {isDraggedOver && (
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.primaryScale[500],
                    fontWeight: tokens.typography.fontWeight.medium,
                    marginTop: tokens.spacing[1],
                  }}>
                    Drop here to move
                  </span>
                )}
              </div>
            ) : (
              columnJobs.map(job => renderKanbanCard(job, colConfig))
            )}

            {/* Drop indicator */}
            {isDraggedOver && columnJobs.length > 0 && (
              <div style={{
                height: 2,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[400],
                margin: `${tokens.spacing[1]}px 0`,
              }} />
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Empty State (all columns empty) ────────────────────────

    const totalJobs = filteredJobs.length;
    const showGlobalEmpty = totalJobs === 0 && (searchQuery || filters.department || filters.urgency || filters.clientId);

    // ─── Main Render ────────────────────────────────────────────────────

    return (
      <div
        className={className}
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
          fontFamily: 'inherit',
          display: 'flex',
          flexDirection: 'column' as const,
          ...style,
        }}
      >
        {renderHeader()}
        {renderFilterBar()}

        {showGlobalEmpty ? (
          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
            textAlign: 'center' as const,
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: tokens.spacing[4],
            }}>
              <Briefcase size={24} color={tokens.colors.primaryScale[400]} />
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
              marginBottom: tokens.spacing[2],
            }}>
              {emptyText}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}>
              Try adjusting your filters or search query.
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: tokens.spacing[4],
            flex: 1,
            overflowX: 'auto' as const,
            paddingBottom: tokens.spacing[2],
          }}>
            {STATUS_COLUMNS.map(colConfig => renderKanbanColumn(colConfig))}
          </div>
        )}
      </div>
    );
  },
});
