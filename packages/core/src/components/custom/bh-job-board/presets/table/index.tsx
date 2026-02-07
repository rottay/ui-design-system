'use client';

/**
 * BhJobBoard - Table Preset
 * Sortable data table layout with inline status badges, sparkline for
 * candidate trend, and full-featured filtering/sorting.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type { BhJobBoardProps, JobItem, JobStatus, JobUrgency, JobBoardFilter, ViewMode, SortDirection } from '../../core';
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
  ChevronUp,
  AlertCircle,
  Globe,
  Filter,
  ArrowUpDown,
  ChevronsUpDown,
  MoreHorizontal,
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

// ─── Column Definitions ───────────────────────────────────────────────────────

interface TableColumn {
  key: string;
  label: string;
  width?: string | number;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'select', label: '', width: 40, sortable: false, align: 'center' },
  { key: 'title', label: 'Job Title', sortable: true },
  { key: 'status', label: 'Status', width: 120, sortable: true },
  { key: 'department', label: 'Department', width: 140, sortable: true },
  { key: 'urgency', label: 'Urgency', width: 100, sortable: true },
  { key: 'candidateCount', label: 'Candidates', width: 130, sortable: true, align: 'center' },
  { key: 'daysOpen', label: 'Days Open', width: 100, sortable: true, align: 'center' },
  { key: 'location', label: 'Location', width: 150, sortable: true },
  { key: 'recruiters', label: 'Recruiters', width: 100, sortable: false, align: 'center' },
  { key: 'actions', label: '', width: 80, sortable: false, align: 'center' },
];

// ─── Table Preset ─────────────────────────────────────────────────────────────

export const TableBhJobBoard = createPreset<BhJobBoardProps>({
  name: 'BhJobBoard.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhJobBoardProps>) => {
    const { Box, Stack } = primitives;
    const isModern = engine === 'modern';

    const STATUS_CONFIG = useMemo(() => getStatusConfig(tokens), [tokens]);
    const URGENCY_CONFIG = useMemo(() => getUrgencyConfig(tokens), [tokens]);

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
    const [internalSortBy, setInternalSortBy] = useState(BH_JOB_BOARD_DEFAULTS.sortBy ?? 'daysOpen');
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(BH_JOB_BOARD_DEFAULTS.sortDirection ?? 'desc');
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalSelectedJobs, setInternalSelectedJobs] = useState<string[]>([]);
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    const filters = controlledFilters ?? internalFilters;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const selectedJobs = controlledSelectedJobs ?? internalSelectedJobs;
    const sortBy = controlledSortBy ?? internalSortBy;
    const sortDirection = controlledSortDirection ?? internalSortDirection;

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleFilterChange = useCallback((newFilters: JobBoardFilter) => {
      if (controlledFilters === undefined) setInternalFilters(newFilters);
      onFilterChange?.(newFilters);
    }, [controlledFilters, onFilterChange]);

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleSortChange = useCallback((field: string) => {
      const newDirection: SortDirection = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
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

    const handleSelectAll = useCallback(() => {
      const allIds = filteredJobs.map(j => j.id);
      const allSelected = allIds.every(id => selectedJobs.includes(id));
      const next = allSelected ? [] : allIds;
      if (controlledSelectedJobs === undefined) setInternalSelectedJobs(next);
      onSelectionChange?.(next);
    }, [selectedJobs, controlledSelectedJobs, onSelectionChange]);

    const handleStatusFilter = useCallback((status: JobStatus | null) => {
      handleFilterChange({ ...filters, status });
    }, [filters, handleFilterChange]);

    const handleViewModeChange = useCallback((mode: ViewMode) => {
      onViewModeChange?.(mode);
    }, [onViewModeChange]);

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
          case 'daysOpen': aVal = a.daysOpen; bVal = b.daysOpen; break;
          case 'candidateCount': aVal = a.candidateCount; bVal = b.candidateCount; break;
          case 'title': aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); break;
          case 'department': aVal = a.department.toLowerCase(); bVal = b.department.toLowerCase(); break;
          case 'status': aVal = a.status; bVal = b.status; break;
          case 'location': aVal = a.location.toLowerCase(); bVal = b.location.toLowerCase(); break;
          case 'urgency': {
            const order: Record<JobUrgency, number> = { low: 0, medium: 1, high: 2, critical: 3 };
            aVal = order[a.urgency]; bVal = order[b.urgency]; break;
          }
          default: aVal = a.daysOpen; bVal = b.daysOpen;
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });

      return result;
    }, [jobs, filters, searchQuery, sortBy, sortDirection, clients]);

    // ─── Glass Styles ───────────────────────────────────────────────────

    const glassSurfaceStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blurSm,
      WebkitBackdropFilter: tokens.glass.blurSm,
      backgroundColor: tokens.glass.bgLight,
      border: `1px solid ${tokens.glass.borderLight}`,
    } : {};

    // ─── Render: Sparkline ──────────────────────────────────────────────

    const renderSparkline = (job: JobItem) => {
      const stages = job.candidatesByStage;
      if (stages.length === 0) return null;

      const maxCount = Math.max(...stages.map(s => s.count), 1);
      const width = 60;
      const height = 20;
      const stepX = stages.length > 1 ? width / (stages.length - 1) : width;

      const points = stages.map((s, i) => {
        const x = stages.length > 1 ? i * stepX : width / 2;
        const y = height - (s.count / maxCount) * (height - 4) - 2;
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
          <polyline
            points={points}
            fill="none"
            stroke={tokens.colors.primaryScale[400]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {stages.length > 0 && (
            <circle
              cx={stages.length > 1 ? (stages.length - 1) * stepX : width / 2}
              cy={height - (stages[stages.length - 1].count / maxCount) * (height - 4) - 2}
              r={2.5}
              fill={tokens.colors.primaryScale[500]}
            />
          )}
        </svg>
      );
    };

    // ─── Render: Avatar Stack ───────────────────────────────────────────

    const renderAvatarStack = (avatars: string[]) => {
      const maxShow = 3;
      const shown = avatars.slice(0, maxShow);
      const remaining = avatars.length - maxShow;

      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {shown.map((avatar, idx) => (
            <div
              key={idx}
              style={{
                width: 22,
                height: 22,
                borderRadius: tokens.borderRadius.full,
                border: `2px solid ${tokens.colors.common.white}`,
                backgroundColor: tokens.colors.primaryScale[100],
                backgroundImage: avatar ? `url(${avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginLeft: idx > 0 ? -6 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[600],
                position: 'relative' as const,
                zIndex: maxShow - idx,
              }}
            >
              {!avatar && <Users size={9} />}
            </div>
          ))}
          {remaining > 0 && (
            <div style={{
              width: 22,
              height: 22,
              borderRadius: tokens.borderRadius.full,
              border: `2px solid ${tokens.colors.common.white}`,
              backgroundColor: tokens.colors.neutral[100],
              marginLeft: -6,
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
            border: `1px solid ${tokens.colors.neutral[200]}`,
            overflow: 'hidden' as const,
          }}>
            {([
              { mode: 'grid' as ViewMode, icon: <LayoutGrid size={14} /> },
              { mode: 'table' as ViewMode, icon: <List size={14} /> },
              { mode: 'kanban' as ViewMode, icon: <Columns3 size={14} /> },
            ]).map(({ mode, icon }) => {
              const isActive = mode === 'table';
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

    // ─── Render: Toolbar ────────────────────────────────────────────────

    const renderToolbar = () => {
      const statusOptions: (JobStatus | null)[] = [null, 'published', 'draft', 'paused', 'closed'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.common.white,
          marginBottom: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          flexWrap: 'wrap' as const,
          ...glassSurfaceStyle,
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
                    border: `1px solid ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
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

          {/* Department filter */}
          {departments.length > 0 && (
            <div style={{ position: 'relative' as const }}>
              <button
                onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `1px solid ${filters.department ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                  backgroundColor: filters.department ? tokens.colors.primaryScale[50] : 'transparent',
                  color: filters.department ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  cursor: 'pointer',
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
                }}>
                  <div
                    onClick={() => { handleFilterChange({ ...filters, department: null }); setShowDepartmentDropdown(false); }}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: !filters.department ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                      backgroundColor: !filters.department ? tokens.colors.primaryScale[50] : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    All Departments
                  </div>
                  {departments.map(dept => (
                    <div
                      key={dept}
                      onClick={() => { handleFilterChange({ ...filters, department: dept }); setShowDepartmentDropdown(false); }}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: filters.department === dept ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: filters.department === dept ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 200,
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

          {/* Selected count */}
          {selectedJobs.length > 0 && (
            <span style={{
              ...createBadgeStyle(tokens, 'primary'),
              fontSize: tokens.typography.fontSize.xs,
            }}>
              {selectedJobs.length} selected
            </span>
          )}
        </div>
      );
    };

    // ─── Render: Table Header ───────────────────────────────────────────

    const renderSortIcon = (columnKey: string) => {
      if (sortBy !== columnKey) {
        return <ChevronsUpDown size={12} color={tokens.colors.neutral[300]} />;
      }
      return sortDirection === 'asc'
        ? <ChevronUp size={12} color={tokens.colors.primaryScale[500]} />
        : <ChevronDown size={12} color={tokens.colors.primaryScale[500]} />;
    };

    const allSelected = filteredJobs.length > 0 && filteredJobs.every(j => selectedJobs.includes(j.id));

    const renderTableHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
        backgroundColor: tokens.colors.neutral[50],
        borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
      }}>
        {TABLE_COLUMNS.map(col => (
          <div
            key={col.key}
            style={{
              flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              cursor: col.sortable ? 'pointer' : 'default',
              userSelect: 'none' as const,
              padding: `0 ${tokens.spacing[2]}px`,
            }}
            onClick={() => col.sortable && handleSortChange(col.key)}
          >
            {col.key === 'select' ? (
              <div
                onClick={(e) => { e.stopPropagation(); handleSelectAll(); }}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: tokens.borderRadius.sm,
                  border: `2px solid ${allSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                  backgroundColor: allSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {allSelected && (
                  <svg width={10} height={10} viewBox="0 0 10 10">
                    <path d="M2 5L4.5 7.5L8 3" stroke={tokens.colors.common.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ) : (
              <>
                {col.label}
                {col.sortable && renderSortIcon(col.key)}
              </>
            )}
          </div>
        ))}
      </div>
    );

    // ─── Render: Table Row ──────────────────────────────────────────────

    const renderTableRow = (job: JobItem) => {
      const statusCfg = STATUS_CONFIG[job.status];
      const urgencyCfg = URGENCY_CONFIG[job.urgency];
      const isHovered = hoveredRowId === job.id;
      const isSelected = selectedJobs.includes(job.id);

      return (
        <div
          key={job.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: isSelected
              ? tokens.colors.primaryScale[50]
              : isHovered
                ? tokens.colors.neutral[50]
                : tokens.colors.common.white,
            borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={() => setHoveredRowId(job.id)}
          onMouseLeave={() => setHoveredRowId(null)}
          onClick={() => onJobClick?.(job.id)}
        >
          {/* Select */}
          <div style={{
            flex: `0 0 40px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
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
              }}
            >
              {isSelected && (
                <svg width={10} height={10} viewBox="0 0 10 10">
                  <path d="M2 5L4.5 7.5L8 3" stroke={tokens.colors.common.white} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>

          {/* Title */}
          <div style={{
            flex: 1,
            padding: `0 ${tokens.spacing[2]}px`,
            overflow: 'hidden' as const,
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              whiteSpace: 'nowrap' as const,
              overflow: 'hidden' as const,
              textOverflow: 'ellipsis' as const,
            }}>
              {job.title}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              {job.code}
              {job.clientName && <span> &middot; {job.clientName}</span>}
            </div>
          </div>

          {/* Status */}
          <div style={{
            flex: '0 0 120px',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
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
          </div>

          {/* Department */}
          <div style={{
            flex: '0 0 140px',
            padding: `0 ${tokens.spacing[2]}px`,
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[700],
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden' as const,
            textOverflow: 'ellipsis' as const,
          }}>
            {job.department}
          </div>

          {/* Urgency */}
          <div style={{
            flex: '0 0 100px',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: urgencyCfg.bgColor,
              color: urgencyCfg.color,
            }}>
              {urgencyCfg.label}
            </span>
          </div>

          {/* Candidates (with sparkline) */}
          <div style={{
            flex: '0 0 130px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[2],
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
            }}>
              {job.candidateCount}
            </span>
            {renderSparkline(job)}
          </div>

          {/* Days Open */}
          <div style={{
            flex: '0 0 100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: job.daysOpen > 30 ? tokens.colors.warningScale[600] : tokens.colors.neutral[600],
            }}>
              <Clock size={12} />
              {job.daysOpen}d
            </span>
          </div>

          {/* Location */}
          <div style={{
            flex: '0 0 150px',
            padding: `0 ${tokens.spacing[2]}px`,
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden' as const,
            textOverflow: 'ellipsis' as const,
          }}>
            {job.isRemote ? (
              <>
                <Globe size={12} />
                Remote
              </>
            ) : (
              <>
                <MapPin size={12} />
                {job.location}
              </>
            )}
          </div>

          {/* Recruiters */}
          <div style={{
            flex: '0 0 100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            {renderAvatarStack(job.recruiterAvatars)}
          </div>

          {/* Actions */}
          <div style={{
            flex: '0 0 80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[1],
            opacity: isHovered ? 1 : 0,
            transition: `opacity ${tokens.motion.hover}`,
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onJobClick?.(job.id); }}
              title="View"
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
              title="More"
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
              <MoreHorizontal size={12} />
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
        backgroundColor: tokens.colors.common.white,
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
          marginBottom: tokens.spacing[5],
          maxWidth: 320,
        }}>
          Try adjusting your filters or search query.
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
              outline: 'none',
            }}
          >
            <Plus size={16} />
            Create Job
          </button>
        )}
      </div>
    );

    // ─── Render: Stats Summary ──────────────────────────────────────────

    const renderStatsSummary = () => {
      if (stats.length === 0) return null;

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
        }}>
          {stats.map(stat => {
            const isTotal = stat.key === 'total';
            return (
              <div
                key={stat.key}
                style={{
                  flex: 1,
                  ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...glassSurfaceStyle,
                }}
              >
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {stat.label}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: isTotal ? tokens.colors.primaryScale[600] : tokens.colors.neutral[900],
                }}>
                  {stat.count}
                </span>
              </div>
            );
          })}
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
        {renderStatsSummary()}
        <div style={{
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.common.white,
          overflow: 'hidden' as const,
          ...glassSurfaceStyle,
        }}>
          {renderToolbar()}
          {filteredJobs.length === 0 ? renderEmptyState() : (
            <>
              {renderTableHeader()}
              <div>
                {filteredJobs.map(job => renderTableRow(job))}
              </div>
            </>
          )}
          {/* Footer with count */}
          {filteredJobs.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderTop: `1px solid ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                Showing {filteredJobs.length} of {jobs.length} jobs
              </span>
              {selectedJobs.length > 0 && (
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.primaryScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {selectedJobs.length} selected
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
});
