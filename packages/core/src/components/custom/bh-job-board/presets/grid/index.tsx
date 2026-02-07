'use client';

/**
 * BhJobBoard - Grid Preset
 * Card-based grid layout for browsing job listings with stats ribbon,
 * filter bar, view toggle, and job cards with candidate progress bars.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
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
  Pause,
  Play,
  X,
  ChevronDown,
  AlertCircle,
  Globe,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

// ─── Status Config ────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

function getStatusConfig(tokens: DesignTokens): Record<JobStatus, StatusConfig> {
  return {
    published: {
      label: 'Published',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      dotColor: tokens.colors.successScale[500],
    },
    draft: {
      label: 'Draft',
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
      borderColor: tokens.colors.neutral[200],
      dotColor: tokens.colors.neutral[400],
    },
    paused: {
      label: 'Paused',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      dotColor: tokens.colors.warningScale[500],
    },
    closed: {
      label: 'Closed',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      dotColor: tokens.colors.errorScale[500],
    },
  };
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

// ─── Stats Ribbon Stat Key Config ─────────────────────────────────────────────

function getStatKeyColor(key: string, tokens: DesignTokens): { bg: string; text: string } {
  switch (key) {
    case 'total':
      return { bg: tokens.colors.primaryScale[100], text: tokens.colors.primaryScale[700] };
    case 'published':
      return { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] };
    case 'draft':
      return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[700] };
    case 'paused':
      return { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] };
    case 'closed':
      return { bg: tokens.colors.errorScale[100], text: tokens.colors.errorScale[700] };
    default:
      return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[700] };
  }
}

// ─── Grid Preset ──────────────────────────────────────────────────────────────

export const GridBhJobBoard = createPreset<BhJobBoardProps>({
  name: 'BhJobBoard.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhJobBoardProps>) => {
    const { Box, Stack } = primitives;
    const isModern = engine === 'modern';

    const STATUS_CONFIG = useMemo(() => getStatusConfig(tokens), [tokens]);
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

    const [internalViewMode, setInternalViewMode] = useState<ViewMode>('grid');
    const [internalFilters, setInternalFilters] = useState<JobBoardFilter>({});
    const [internalSortBy, setInternalSortBy] = useState(BH_JOB_BOARD_DEFAULTS.sortBy ?? 'daysOpen');
    const [internalSortDirection, setInternalSortDirection] = useState(BH_JOB_BOARD_DEFAULTS.sortDirection ?? 'desc');
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedJobs, setInternalSelectedJobs] = useState<string[]>([]);

    const filters = controlledFilters ?? internalFilters;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const selectedJobs = controlledSelectedJobs ?? internalSelectedJobs;
    const sortBy = controlledSortBy ?? internalSortBy;
    const sortDirection = controlledSortDirection ?? internalSortDirection;

    // ─── Hover state for cards ──────────────────────────────────────────

    const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);

    // ─── Filter dropdown states ─────────────────────────────────────────

    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
    const [showClientDropdown, setShowClientDropdown] = useState(false);

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
      setInternalViewMode(mode);
      onViewModeChange?.(mode);
    }, [onViewModeChange]);

    const handleSortChange = useCallback((field: string) => {
      const newDirection = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
      if (controlledSortBy === undefined) {
        setInternalSortBy(field);
        setInternalSortDirection(newDirection);
      }
      onSortChange?.(field, newDirection);
    }, [sortBy, sortDirection, controlledSortBy, onSortChange]);

    const handleSelectionToggle = useCallback((jobId: string) => {
      const next = selectedJobs.includes(jobId)
        ? selectedJobs.filter(id => id !== jobId)
        : [...selectedJobs, jobId];
      if (controlledSelectedJobs === undefined) setInternalSelectedJobs(next);
      onSelectionChange?.(next);
    }, [selectedJobs, controlledSelectedJobs, onSelectionChange]);

    const handleStatusFilter = useCallback((status: JobStatus | null) => {
      handleFilterChange({ ...filters, status });
    }, [filters, handleFilterChange]);

    const handleUrgencyFilter = useCallback((urgency: JobUrgency | null) => {
      handleFilterChange({ ...filters, urgency });
    }, [filters, handleFilterChange]);

    const handleDepartmentFilter = useCallback((department: string | null) => {
      handleFilterChange({ ...filters, department });
      setShowDepartmentDropdown(false);
    }, [filters, handleFilterChange]);

    const handleClientFilter = useCallback((clientId: string | null) => {
      handleFilterChange({ ...filters, clientId });
      setShowClientDropdown(false);
    }, [filters, handleFilterChange]);

    // ─── Filtered + Sorted Jobs ─────────────────────────────────────────

    const filteredJobs = useMemo(() => {
      let result = [...jobs];

      if (filters.status) {
        result = result.filter(j => j.status === filters.status);
      }
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

      result.sort((a, b) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;
        switch (sortBy) {
          case 'daysOpen':
            aVal = a.daysOpen; bVal = b.daysOpen; break;
          case 'candidateCount':
            aVal = a.candidateCount; bVal = b.candidateCount; break;
          case 'title':
            aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); break;
          case 'urgency': {
            const order: Record<JobUrgency, number> = { low: 0, medium: 1, high: 2, critical: 3 };
            aVal = order[a.urgency]; bVal = order[b.urgency]; break;
          }
          default:
            aVal = a.daysOpen; bVal = b.daysOpen;
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });

      return result;
    }, [jobs, filters, searchQuery, sortBy, sortDirection, clients]);

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

    // ─── Render: Stats Ribbon ───────────────────────────────────────────

    const renderStatsRibbon = () => {
      if (stats.length === 0) return null;

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            ...createSurfaceStyle(tokens, { elevation: 'sm' }),
            backgroundColor: tokens.colors.common.white,
            marginBottom: tokens.spacing[4],
            flexWrap: 'wrap' as const,
            ...glassSurfaceStyle,
          }}
        >
          <Briefcase size={18} color={tokens.colors.neutral[500]} style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
            marginRight: tokens.spacing[2],
          }}>
            Jobs Overview
          </span>
          {stats.map(stat => {
            const keyColor = getStatKeyColor(stat.key, tokens);
            return (
              <div
                key={stat.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: filters.status === stat.key || (stat.key === 'total' && !filters.status)
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    filters.status === stat.key || (stat.key === 'total' && !filters.status)
                      ? tokens.colors.primaryScale[200]
                      : tokens.colors.neutral[200]
                  }`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onClick={() => {
                  if (stat.key === 'total') {
                    handleStatusFilter(null);
                  } else {
                    handleStatusFilter(stat.key === filters.status ? null : stat.key as JobStatus);
                  }
                }}
              >
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {stat.label}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 22,
                  height: 22,
                  padding: `0 ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.bold,
                  backgroundColor: keyColor.bg,
                  color: keyColor.text,
                }}>
                  {stat.count}
                </span>
              </div>
            );
          })}
        </div>
      );
    };

    // ─── Render: Filter Bar ─────────────────────────────────────────────

    const renderFilterBar = () => {
      const statusOptions: (JobStatus | null)[] = [null, 'published', 'draft', 'paused', 'closed'];

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

          {/* Department dropdown */}
          {departments.length > 0 && (
            <div style={{ position: 'relative' as const }}>
              <button
                onClick={() => {
                  setShowDepartmentDropdown(!showDepartmentDropdown);
                  setShowClientDropdown(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `1px solid ${filters.department ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                  backgroundColor: filters.department ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: filters.department ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                {filters.department ?? 'Department'}
                <ChevronDown size={12} />
              </button>
              {showDepartmentDropdown && (
                <div style={{
                  position: 'absolute' as const,
                  top: '100%',
                  left: 0,
                  marginTop: tokens.spacing[1],
                  minWidth: 180,
                  backgroundColor: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.lg,
                  boxShadow: tokens.shadows.lg,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  zIndex: 50,
                  padding: `${tokens.spacing[1]}px 0`,
                  ...glassSurfaceStyle,
                }}>
                  <div
                    onClick={() => handleDepartmentFilter(null)}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: !filters.department ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                      backgroundColor: !filters.department ? tokens.colors.primaryScale[50] : 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    All Departments
                  </div>
                  {departments.map(dept => (
                    <div
                      key={dept}
                      onClick={() => handleDepartmentFilter(dept)}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: filters.department === dept ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: filters.department === dept ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Urgency pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            {(['low', 'medium', 'high', 'critical'] as JobUrgency[]).map(urgency => {
              const isActive = filters.urgency === urgency;
              const cfg = URGENCY_CONFIG[urgency];
              return (
                <button
                  key={urgency}
                  onClick={() => handleUrgencyFilter(isActive ? null : urgency)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    border: `1px solid ${isActive ? cfg.color : tokens.colors.neutral[200]}`,
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
          </div>

          {/* Client selector */}
          {clients.length > 0 && (
            <div style={{ position: 'relative' as const }}>
              <button
                onClick={() => {
                  setShowClientDropdown(!showClientDropdown);
                  setShowDepartmentDropdown(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `1px solid ${filters.clientId ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                  backgroundColor: filters.clientId ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: filters.clientId ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                {filters.clientId ? clients.find(c => c.id === filters.clientId)?.name ?? 'Client' : 'Client'}
                <ChevronDown size={12} />
              </button>
              {showClientDropdown && (
                <div style={{
                  position: 'absolute' as const,
                  top: '100%',
                  left: 0,
                  marginTop: tokens.spacing[1],
                  minWidth: 180,
                  backgroundColor: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.lg,
                  boxShadow: tokens.shadows.lg,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  zIndex: 50,
                  padding: `${tokens.spacing[1]}px 0`,
                  ...glassSurfaceStyle,
                }}>
                  <div
                    onClick={() => handleClientFilter(null)}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: !filters.clientId ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                      backgroundColor: !filters.clientId ? tokens.colors.primaryScale[50] : 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    All Clients
                  </div>
                  {clients.map(client => (
                    <div
                      key={client.id}
                      onClick={() => handleClientFilter(client.id)}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: filters.clientId === client.id ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: filters.clientId === client.id ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {client.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 200,
            transition: `all ${tokens.motion.hover}`,
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

          {/* Sort control */}
          <button
            onClick={() => handleSortChange(sortBy)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <ArrowUpDown size={12} />
            {sortDirection === 'asc' ? 'Oldest' : 'Newest'}
          </button>

          {/* View toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.neutral[200]}`,
            overflow: 'hidden' as const,
          }}>
            {([
              { mode: 'grid' as ViewMode, icon: <LayoutGrid size={14} /> },
              { mode: 'table' as ViewMode, icon: <List size={14} /> },
              { mode: 'kanban' as ViewMode, icon: <Columns3 size={14} /> },
            ]).map(({ mode, icon }) => {
              const isActive = internalViewMode === mode;
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
        </div>
      );
    };

    // ─── Render: Candidate Progress Bar (SVG) ───────────────────────────

    const renderCandidateProgressBar = (job: JobItem) => {
      const total = job.candidatesByStage.reduce((sum, s) => sum + s.count, 0);
      if (total === 0) {
        return (
          <div style={{
            height: 6,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[100],
            width: '100%',
          }} />
        );
      }

      const barWidth = 200;
      const barHeight = 6;
      let xOffset = 0;

      return (
        <svg
          width="100%"
          height={barHeight}
          viewBox={`0 0 ${barWidth} ${barHeight}`}
          preserveAspectRatio="none"
          style={{ borderRadius: tokens.borderRadius.full, overflow: 'hidden' as const, display: 'block' }}
        >
          <rect x={0} y={0} width={barWidth} height={barHeight} fill={tokens.colors.neutral[100]} rx={3} />
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
                rx={idx === 0 ? 3 : 0}
              />
            );
          })}
        </svg>
      );
    };

    // ─── Render: Recruiter Avatar Stack ─────────────────────────────────

    const renderAvatarStack = (avatars: string[]) => {
      const maxShow = 3;
      const shown = avatars.slice(0, maxShow);
      const remaining = avatars.length - maxShow;

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {shown.map((avatar, idx) => (
            <div
              key={idx}
              style={{
                width: 24,
                height: 24,
                borderRadius: tokens.borderRadius.full,
                border: `2px solid ${tokens.colors.common.white}`,
                backgroundColor: tokens.colors.primaryScale[100],
                backgroundImage: avatar ? `url(${avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginLeft: idx > 0 ? -8 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[600],
                position: 'relative' as const,
                zIndex: maxShow - idx,
              }}
            >
              {!avatar && (
                <Users size={10} />
              )}
            </div>
          ))}
          {remaining > 0 && (
            <div style={{
              width: 24,
              height: 24,
              borderRadius: tokens.borderRadius.full,
              border: `2px solid ${tokens.colors.common.white}`,
              backgroundColor: tokens.colors.neutral[100],
              marginLeft: -8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[600],
              position: 'relative' as const,
              zIndex: 0,
            }}>
              +{remaining}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Job Card ───────────────────────────────────────────────

    const renderJobCard = (job: JobItem) => {
      const statusCfg = STATUS_CONFIG[job.status];
      const urgencyCfg = URGENCY_CONFIG[job.urgency];
      const isHovered = hoveredJobId === job.id;
      const isSelected = selectedJobs.includes(job.id);

      const cardBaseStyle = createCardStyle(tokens, {
        elevation: isHovered ? 'md' : 'sm',
        glass: isModern,
        interactive: true,
      });

      return (
        <div
          key={job.id}
          style={{
            ...cardBaseStyle,
            padding: tokens.spacing[4],
            position: 'relative' as const,
            cursor: 'pointer',
            transform: isHovered ? tokens.motion.transform : 'none',
            border: isSelected
              ? `2px solid ${tokens.colors.primaryScale[400]}`
              : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            ...(isModern ? glassCardStyle : {}),
          }}
          onMouseEnter={() => setHoveredJobId(job.id)}
          onMouseLeave={() => setHoveredJobId(null)}
          onClick={() => onJobClick?.(job.id)}
        >
          {/* Top row: Status badge + Urgency dot */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[3],
          }}>
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
              border: `1px solid ${statusCfg.borderColor}`,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: statusCfg.dotColor,
              }} />
              {statusCfg.label}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {/* Urgency indicator */}
              <span
                title={`Urgency: ${urgencyCfg.label}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: urgencyCfg.bgColor,
                  color: urgencyCfg.color,
                }}
              >
                <AlertCircle size={10} />
                {urgencyCfg.label}
              </span>

              {/* Selection checkbox */}
              <div
                onClick={(e) => { e.stopPropagation(); handleSelectionToggle(job.id); }}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: tokens.borderRadius.sm,
                  border: `2px solid ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
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
                  <svg width={10} height={10} viewBox="0 0 10 10">
                    <path d="M2 5L4.5 7.5L8 3" stroke={tokens.colors.common.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Job title + code */}
          <div style={{ marginBottom: tokens.spacing[2] }}>
            <div style={{
              fontSize: tokens.typography.fontSize.md,
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
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              {job.code} &middot; {job.department}
            </div>
          </div>

          {/* Location */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginBottom: tokens.spacing[3],
          }}>
            {job.isRemote ? (
              <>
                <Globe size={12} />
                <span>Remote</span>
              </>
            ) : (
              <>
                <MapPin size={12} />
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

          {/* Candidate progress bar */}
          <div style={{ marginBottom: tokens.spacing[2] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: tokens.spacing[1],
            }}>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: tokens.spacing[1] }} />
                {job.candidateCount} candidates
              </span>
            </div>
            {renderCandidateProgressBar(job)}
            {/* Stage legend */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap' as const,
              gap: tokens.spacing[2],
              marginTop: tokens.spacing[1],
            }}>
              {job.candidatesByStage.map((stage, idx) => (
                <span key={stage.stage} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '10px',
                  color: tokens.colors.neutral[500],
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length],
                    flexShrink: 0,
                  }} />
                  {stage.stage} ({stage.count})
                </span>
              ))}
            </div>
          </div>

          {/* Bottom row: Days open + Avatar stack + Quick actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: tokens.spacing[3],
            paddingTop: tokens.spacing[3],
            borderTop: `1px solid ${tokens.colors.neutral[100]}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                <Clock size={12} />
                {job.daysOpen}d open
              </span>
              {renderAvatarStack(job.recruiterAvatars)}
            </div>

            {/* Quick actions on hover */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); onJobClick?.(job.id); }}
                title="View job"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
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
                title="Edit job"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                title={job.status === 'paused' ? 'Resume job' : 'Pause job'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                {job.status === 'paused' ? <Play size={12} /> : <Pause size={12} />}
              </button>
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Empty State ────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
        ...glassSurfaceStyle,
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
          <Briefcase size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery || filters.status || filters.department || filters.urgency || filters.clientId
            ? emptyText
            : 'No jobs yet'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 360,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || filters.status || filters.department || filters.urgency || filters.clientId
            ? 'Try adjusting your filters or search query to find what you are looking for.'
            : 'Create your first job posting to start attracting candidates and filling positions.'}
        </div>
        {onCreateJob && (
          <button
            onClick={onCreateJob}
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
            Create your first job
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
    );

    // ─── Render: Grid ───────────────────────────────────────────────────

    const renderGrid = () => {
      if (filteredJobs.length === 0) return renderEmptyState();

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: tokens.spacing[4],
        }}>
          {filteredJobs.map(job => renderJobCard(job))}
        </div>
      );
    };

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
        {renderStatsRibbon()}
        {renderFilterBar()}
        {renderGrid()}
      </div>
    );
  },
});
