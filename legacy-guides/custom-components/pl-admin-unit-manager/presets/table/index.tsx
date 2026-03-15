'use client';

/**
 * PlAdminUnitManager - Table Preset
 * Flat table view with path breadcrumbs, sortable columns,
 * type filtering, and row-level actions.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createStatusDotStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlAdminUnitManagerProps,
  AdminUnit,
  UnitType,
  UnitStatus,
} from '../../core';
import { PL_ADMIN_UNIT_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Building,
  Layers,
  Building2,
  Users,
  UserCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Edit3,
  Trash2,
  Archive,
  ArrowRightLeft,
  ArrowUpDown,
  X,
  MoreHorizontal,
  FolderTree,
  User,
  Calendar,
  Filter,
  Hash,
  Table as TableIcon,
} from 'lucide-react';

// ─── Unit Type Config ────────────────────────────────────────────────────────

interface UnitTypeConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

function getUnitTypeConfig(type: UnitType, tokens: DesignTokens): UnitTypeConfig {
  const iconSize = 14;
  switch (type) {
    case 'organization':
      return {
        label: 'Organization',
        icon: <Building size={iconSize} />,
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[100],
        borderColor: tokens.colors.primaryScale[200],
      };
    case 'division':
      return {
        label: 'Division',
        icon: <Layers size={iconSize} />,
        color: tokens.colors.secondaryScale[700],
        bgColor: tokens.colors.secondaryScale[100],
        borderColor: tokens.colors.secondaryScale[200],
      };
    case 'department':
      return {
        label: 'Department',
        icon: <Building2 size={iconSize} />,
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[100],
        borderColor: tokens.colors.infoScale[200],
      };
    case 'team':
      return {
        label: 'Team',
        icon: <Users size={iconSize} />,
        color: tokens.colors.successScale[700],
        bgColor: tokens.colors.successScale[100],
        borderColor: tokens.colors.successScale[200],
      };
    case 'group':
      return {
        label: 'Group',
        icon: <UserCircle size={iconSize} />,
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[100],
        borderColor: tokens.colors.warningScale[200],
      };
  }
}

// ─── Status Config ───────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  textColor: string;
  bgColor: string;
}

function getStatusConfig(status: UnitStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        textColor: tokens.colors.successScale[700],
        bgColor: tokens.colors.successScale[50],
      };
    case 'archived':
      return {
        label: 'Archived',
        dotColor: tokens.colors.neutral[400],
        textColor: tokens.colors.neutral[600],
        bgColor: tokens.colors.neutral[100],
      };
  }
}

// ─── Sort Types ──────────────────────────────────────────────────────────────

type SortField = 'name' | 'type' | 'memberCount' | 'status' | 'createdAt' | 'managerName';
type SortDirection = 'asc' | 'desc';

// ─── Table Preset ────────────────────────────────────────────────────────────

export const TablePlAdminUnitManager = createPreset<PlAdminUnitManagerProps>({
  name: 'PlAdminUnitManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlAdminUnitManagerProps>) => {
    const { Box } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      units,
      onUnitClick,
      onCreate,
      onMove,
      onDelete,
      onArchive,
      onEdit,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      selectedUnitId,
      onUnitSelect,
      typeFilter: controlledTypeFilter,
      onTypeFilterChange,
      statusFilter,
      onStatusFilterChange,
      showArchived = PL_ADMIN_UNIT_MANAGER_DEFAULTS.showArchived,
      loading = PL_ADMIN_UNIT_MANAGER_DEFAULTS.loading,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalTypeFilter, setInternalTypeFilter] = useState<UnitType | null>(null);
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [activeActionsId, setActiveActionsId] = useState<string | null>(null);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const typeFilter = controlledTypeFilter ?? internalTypeFilter;

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleTypeFilterChange = useCallback((type: UnitType | null) => {
      if (controlledTypeFilter === undefined) setInternalTypeFilter(type);
      onTypeFilterChange?.(type);
      setShowTypeDropdown(false);
    }, [controlledTypeFilter, onTypeFilterChange]);

    const handleSort = useCallback((field: SortField) => {
      if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    }, [sortField]);

    const handleUnitClick = useCallback((unitId: string) => {
      onUnitClick?.(unitId);
      onUnitSelect?.(unitId);
    }, [onUnitClick, onUnitSelect]);

    // ─── Flatten + Filter + Sort ────────────────────────────────────────

    const flattenUnits = useCallback((unitList: AdminUnit[]): AdminUnit[] => {
      const result: AdminUnit[] = [];
      const traverse = (unit: AdminUnit) => {
        result.push(unit);
        if (unit.children) unit.children.forEach(traverse);
      };
      unitList.forEach(traverse);
      return result;
    }, []);

    const allUnits = useMemo(() => flattenUnits(units), [units, flattenUnits]);

    const filteredUnits = useMemo(() => {
      let result = [...allUnits];

      // Status filter
      if (!showArchived) {
        result = result.filter(u => u.status !== 'archived');
      }
      if (statusFilter) {
        result = result.filter(u => u.status === statusFilter);
      }

      // Type filter
      if (typeFilter) {
        result = result.filter(u => u.type === typeFilter);
      }

      // Search filter
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(u =>
          u.name.toLowerCase().includes(lower) ||
          (u.code && u.code.toLowerCase().includes(lower)) ||
          (u.managerName && u.managerName.toLowerCase().includes(lower)) ||
          (u.head?.name && u.head.name.toLowerCase().includes(lower)) ||
          (u.description && u.description.toLowerCase().includes(lower)) ||
          u.path.some(p => p.toLowerCase().includes(lower))
        );
      }

      // Sort
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case 'name':
            cmp = a.name.localeCompare(b.name);
            break;
          case 'type':
            cmp = a.type.localeCompare(b.type);
            break;
          case 'memberCount':
            cmp = (a.memberCount || a.headCount || 0) - (b.memberCount || b.headCount || 0);
            break;
          case 'status':
            cmp = a.status.localeCompare(b.status);
            break;
          case 'createdAt':
            cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'managerName':
            cmp = (a.managerName || a.head?.name || '').localeCompare(b.managerName || b.head?.name || '');
            break;
        }
        return sortDirection === 'asc' ? cmp : -cmp;
      });

      return result;
    }, [allUnits, showArchived, statusFilter, typeFilter, searchQuery, sortField, sortDirection]);

    // ─── Stats ──────────────────────────────────────────────────────────

    const stats = useMemo(() => {
      const totalUnits = allUnits.length;
      const activeCount = allUnits.filter(u => u.status === 'active').length;
      const totalMembers = allUnits.reduce((sum, u) => sum + (u.memberCount || u.headCount || 0), 0);
      return { totalUnits, activeCount, totalMembers, filtered: filteredUnits.length };
    }, [allUnits, filteredUnits]);

    // ─── Glass Styles ───────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Render: Sort Header Cell ───────────────────────────────────────

    const renderSortHeader = (label: string, field: SortField, minWidth?: number) => {
      const isActive = sortField === field;
      return (
        <th
          onClick={() => handleSort(field)}
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            textAlign: 'left' as const,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            cursor: 'pointer',
            userSelect: 'none' as const,
            transition: `color ${tokens.motion.hover}`,
            whiteSpace: 'nowrap' as const,
            minWidth: minWidth,
            backgroundColor: tokens.colors.neutral[50],
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
          }}>
            {label}
            <div style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 0,
              opacity: isActive ? 1 : 0.3,
            }}>
              {isActive ? (
                sortDirection === 'asc'
                  ? <ChevronUp size={12} />
                  : <ChevronDown size={12} />
              ) : (
                <ArrowUpDown size={12} />
              )}
            </div>
          </div>
        </th>
      );
    };

    // ─── Render: Path Breadcrumb ────────────────────────────────────────

    const renderPathBreadcrumb = (path: string[]) => {
      if (!path || path.length === 0) {
        return (
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            fontStyle: 'italic' as const,
          }}>
            Root level
          </span>
        );
      }

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap' as const,
        }}>
          {path.map((segment, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: idx === path.length - 1 ? tokens.colors.neutral[700] : tokens.colors.neutral[500],
                fontWeight: idx === path.length - 1 ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                maxWidth: 100,
                overflow: 'hidden' as const,
                textOverflow: 'ellipsis' as const,
                whiteSpace: 'nowrap' as const,
              }}>
                {segment}
              </span>
              {idx < path.length - 1 && (
                <ChevronRight size={10} color={tokens.colors.neutral[300]} style={{ flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Actions Menu ───────────────────────────────────────────

    const renderActionsMenu = (unit: AdminUnit) => {
      const isOpen = activeActionsId === unit.id;
      const hasActions = onEdit || onMove || onArchive || onDelete;

      if (!hasActions) return null;

      return (
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveActionsId(isOpen ? null : unit.id);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: isOpen ? tokens.colors.neutral[100] : tokens.colors.common.white,
              color: tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
              padding: 0,
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {isOpen && (
            <div
              style={{
                position: 'absolute' as const,
                top: '100%',
                right: 0,
                marginTop: tokens.spacing[1],
                minWidth: 180,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
                overflow: 'hidden' as const,
              }}
              onMouseLeave={() => setActiveActionsId(null)}
            >
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(unit.id);
                    setActiveActionsId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `background-color ${tokens.motion.hover}`,
                    outline: 'none',
                    textAlign: 'left' as const,
                  }}
                >
                  <Edit3 size={14} color={tokens.colors.neutral[500]} />
                  Edit Unit
                </button>
              )}

              {onMove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(unit.id);
                    setActiveActionsId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `background-color ${tokens.motion.hover}`,
                    outline: 'none',
                    textAlign: 'left' as const,
                  }}
                >
                  <ArrowRightLeft size={14} color={tokens.colors.neutral[500]} />
                  Move Unit
                </button>
              )}

              {onCreate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreate(unit.id);
                    setActiveActionsId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `background-color ${tokens.motion.hover}`,
                    outline: 'none',
                    textAlign: 'left' as const,
                  }}
                >
                  <Plus size={14} color={tokens.colors.primaryScale[500]} />
                  Add Child Unit
                </button>
              )}

              {/* Divider before destructive actions */}
              {(onArchive || onDelete) && (onEdit || onMove || onCreate) && (
                <div style={{
                  height: 1,
                  backgroundColor: tokens.colors.neutral[100],
                  margin: `${tokens.spacing[1]}px 0`,
                }} />
              )}

              {onArchive && unit.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(unit.id);
                    setActiveActionsId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.warningScale[700],
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `background-color ${tokens.motion.hover}`,
                    outline: 'none',
                    textAlign: 'left' as const,
                  }}
                >
                  <Archive size={14} color={tokens.colors.warningScale[500]} />
                  Archive Unit
                </button>
              )}

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(unit.id);
                    setActiveActionsId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.errorScale[700],
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `background-color ${tokens.motion.hover}`,
                    outline: 'none',
                    textAlign: 'left' as const,
                  }}
                >
                  <Trash2 size={14} color={tokens.colors.errorScale[500]} />
                  Delete Unit
                </button>
              )}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Type Filter Dropdown ───────────────────────────────────

    const allTypes: UnitType[] = ['organization', 'division', 'department', 'team', 'group'];

    const renderTypeFilterDropdown = () => (
      <div style={{ position: 'relative' as const }}>
        <button
          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${typeFilter ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
            backgroundColor: typeFilter ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
            color: typeFilter ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            outline: 'none',
          }}
        >
          <Filter size={14} />
          {typeFilter ? getUnitTypeConfig(typeFilter, tokens).label : 'All Types'}
          <ChevronDown size={14} />
        </button>

        {showTypeDropdown && (
          <div
            style={{
              position: 'absolute' as const,
              top: '100%',
              left: 0,
              marginTop: tokens.spacing[1],
              minWidth: 220,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              padding: `${tokens.spacing[1]}px 0`,
            }}
            onMouseLeave={() => setShowTypeDropdown(false)}
          >
            {/* All types option */}
            <div
              onClick={() => handleTypeFilterChange(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: !typeFilter ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                backgroundColor: !typeFilter ? tokens.colors.primaryScale[50] : 'transparent',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <FolderTree size={14} />
              All Types
              {!typeFilter && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  {allUnits.length}
                </span>
              )}
            </div>

            {/* Divider */}
            <div style={{
              height: 1,
              backgroundColor: tokens.colors.neutral[100],
              margin: `${tokens.spacing[1]}px 0`,
            }} />

            {/* Type options */}
            {allTypes.map(type => {
              const cfg = getUnitTypeConfig(type, tokens);
              const count = allUnits.filter(u => u.type === type).length;
              if (count === 0) return null;

              return (
                <div
                  key={type}
                  onClick={() => handleTypeFilterChange(type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: typeFilter === type ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: typeFilter === type ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: cfg.bgColor,
                    color: cfg.color,
                  }}>
                    {cfg.icon}
                  </div>
                  <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>
                    {cfg.label}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    fontWeight: tokens.typography.fontWeight.normal,
                  }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );

    // ─── Render: Table Row ──────────────────────────────────────────────

    const renderTableRow = (unit: AdminUnit, idx: number) => {
      const typeConfig = getUnitTypeConfig(unit.type, tokens);
      const statusConfig = getStatusConfig(unit.status, tokens);
      const isHovered = hoveredRowId === unit.id;
      const isSelected = selectedUnitId === unit.id;
      const memberCount = unit.memberCount || unit.headCount || 0;
      const managerDisplay = unit.managerName || unit.head?.name;
      const isLast = idx === filteredUnits.length - 1;

      return (
        <tr
          key={unit.id}
          onMouseEnter={() => setHoveredRowId(unit.id)}
          onMouseLeave={() => setHoveredRowId(null)}
          onClick={() => handleUnitClick(unit.id)}
          style={{
            backgroundColor: isSelected
              ? tokens.colors.primaryScale[50]
              : isHovered
              ? tokens.colors.neutral[50]
              : tokens.colors.common.white,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Name */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
            borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[600]}` : '3px solid transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: typeConfig.bgColor,
                color: typeConfig.color,
                flexShrink: 0,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${typeConfig.borderColor}`,
              }}>
                {typeConfig.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                }}>
                  {unit.name}
                </div>
                {unit.code && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    marginTop: 1,
                  }}>
                    <Hash size={10} />
                    {unit.code}
                  </div>
                )}
              </div>
            </div>
          </td>

          {/* Type badge */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: typeConfig.bgColor,
              color: typeConfig.color,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${typeConfig.borderColor}`,
            }}>
              {typeConfig.icon}
              {typeConfig.label}
            </span>
          </td>

          {/* Path breadcrumb */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
            maxWidth: 260,
          }}>
            {renderPathBreadcrumb(unit.path)}
          </td>

          {/* Manager */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            {managerDisplay ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {/* Manager avatar */}
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: unit.head?.avatar ? 'transparent' : tokens.colors.primaryScale[100],
                  backgroundImage: unit.head?.avatar ? `url(${unit.head.avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.primaryScale[600],
                  flexShrink: 0,
                }}>
                  {!unit.head?.avatar && (managerDisplay.charAt(0) || 'M')}
                </div>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  fontWeight: tokens.typography.fontWeight.medium,
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                }}>
                  {managerDisplay}
                </span>
              </div>
            ) : (
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                fontStyle: 'italic' as const,
              }}>
                Unassigned
              </span>
            )}
          </td>

          {/* Members */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
            textAlign: 'center' as const,
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.neutral[100],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[700],
              fontWeight: tokens.typography.fontWeight.semibold,
            }}>
              <Users size={12} />
              {memberCount.toLocaleString()}
            </div>
          </td>

          {/* Status */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: statusConfig.bgColor,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              <span style={{
                ...createStatusDotStyle(tokens, statusConfig.dotColor),
                width: 7,
                height: 7,
              }} />
              <span style={{ color: statusConfig.textColor }}>
                {statusConfig.label}
              </span>
            </div>
          </td>

          {/* Created */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <Calendar size={12} />
              {unit.createdAt
                ? formatDistanceToNow(new Date(unit.createdAt), { addSuffix: true })
                : 'Unknown'
              }
            </div>
          </td>

          {/* Actions */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
            textAlign: 'right' as const,
          }}>
            <div style={{
              opacity: isHovered || activeActionsId === unit.id ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
            }}>
              {renderActionsMenu(unit)}
            </div>
          </td>
        </tr>
      );
    };

    // ─── Render: Empty State ────────────────────────────────────────────

    const renderEmptyState = () => (
      <tr>
        <td colSpan={8} style={{ padding: 0 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
            textAlign: 'center' as const,
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: tokens.spacing[4],
            }}>
              <TableIcon size={32} color={tokens.colors.primaryScale[400]} />
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[800],
              marginBottom: tokens.spacing[2],
            }}>
              {searchQuery || typeFilter ? 'No matching units found' : 'No organizational units'}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[6],
              maxWidth: 400,
              lineHeight: tokens.typography.lineHeight.relaxed,
            }}>
              {searchQuery || typeFilter
                ? 'Try adjusting your filters or search query.'
                : 'Create your first organizational unit to get started.'}
            </div>
            {onCreate && !(searchQuery || typeFilter) && (
              <button
                onClick={() => onCreate()}
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
                Create First Unit
              </button>
            )}
          </div>
        </td>
      </tr>
    );

    // ─── Render: Loading Skeleton Rows ──────────────────────────────────

    const renderLoadingRows = () => (
      <>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <tr key={i}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(col => (
              <td
                key={col}
                style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}
              >
                <div style={{
                  width: col === 1 ? 160 : col === 3 ? 140 : col === 8 ? 30 : 80,
                  height: col === 1 ? 32 : 16,
                  borderRadius: col === 2 || col === 5 || col === 6 ? tokens.borderRadius.full : tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </td>
            ))}
          </tr>
        ))}
      </>
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
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[5],
        }}>
          <div>
            <h1 style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              margin: 0,
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              Organizational Units
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
            }}>
              Browse and manage all units in a tabular view
            </p>
          </div>
          {onCreate && (
            <button
              onClick={() => onCreate()}
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
              Add Unit
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {/* Type filter dropdown */}
          {renderTypeFilterDropdown()}

          {/* Active filter pills */}
          {typeFilter && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.primaryScale[600],
            }}>
              {getUnitTypeConfig(typeFilter, tokens).label}
              <X
                size={12}
                style={{ cursor: 'pointer' }}
                onClick={() => handleTypeFilterChange(null)}
              />
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Results count */}
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            {filteredUnits.length} of {allUnits.length} units
          </span>

          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 260,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={16} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search units..."
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
                fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <X
                size={14}
                color={tokens.colors.neutral[400]}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSearchChange('')}
              />
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          ...glassCardStyle,
          padding: 0,
          overflow: 'hidden' as const,
        }}>
          <div style={{
            overflow: 'auto' as const,
            maxHeight: 'calc(100vh - 340px)',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse' as const,
              borderSpacing: 0,
            }}>
              <thead>
                <tr>
                  {renderSortHeader('Name', 'name', 180)}
                  {renderSortHeader('Type', 'type', 120)}
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'left' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    whiteSpace: 'nowrap' as const,
                    backgroundColor: tokens.colors.neutral[50],
                    minWidth: 160,
                  }}>
                    Path
                  </th>
                  {renderSortHeader('Manager', 'managerName', 130)}
                  {renderSortHeader('Members', 'memberCount', 90)}
                  {renderSortHeader('Status', 'status', 90)}
                  {renderSortHeader('Created', 'createdAt', 100)}
                  <th style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    textAlign: 'right' as const,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.neutral[50],
                    width: 60,
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? renderLoadingRows()
                  : filteredUnits.length === 0
                  ? renderEmptyState()
                  : filteredUnits.map((unit, idx) => renderTableRow(unit, idx))
                }
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {!loading && filteredUnits.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.neutral[50],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <span>
                Showing {filteredUnits.length} of {allUnits.length} units
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <span>
                  {stats.activeCount} active
                </span>
                <span style={{
                  width: 1,
                  height: 12,
                  backgroundColor: tokens.colors.neutral[200],
                }} />
                <span>
                  {stats.totalMembers.toLocaleString()} total members
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});
