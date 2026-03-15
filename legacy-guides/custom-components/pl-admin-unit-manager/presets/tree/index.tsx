'use client';

/**
 * PlAdminUnitManager - Tree Preset
 * Hierarchical tree view showing org structure with expand/collapse,
 * stats ribbon, connecting lines, and hover actions.
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
  ChevronsDown,
  ChevronsUp,
  Search,
  Plus,
  Edit3,
  Trash2,
  Archive,
  ArrowRightLeft,
  X,
  FolderTree,
  BarChart3,
  Hash,
  User,
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
  const iconSize = 16;
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

// ─── Tree Preset ─────────────────────────────────────────────────────────────

export const TreePlAdminUnitManager = createPreset<PlAdminUnitManagerProps>({
  name: 'PlAdminUnitManager.Tree',
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
      expandedIds: controlledExpandedIds,
      onToggleExpand,
      selectedUnitId,
      onUnitSelect,
      typeFilter,
      onTypeFilterChange,
      statusFilter,
      onStatusFilterChange,
      showArchived = PL_ADMIN_UNIT_MANAGER_DEFAULTS.showArchived,
      loading = PL_ADMIN_UNIT_MANAGER_DEFAULTS.loading,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(new Set());
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [showActionsForId, setShowActionsForId] = useState<string | null>(null);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const expandedSet = useMemo(() => {
      if (controlledExpandedIds) return new Set(controlledExpandedIds);
      return internalExpandedIds;
    }, [controlledExpandedIds, internalExpandedIds]);

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleToggleExpand = useCallback((nodeId: string) => {
      if (onToggleExpand) {
        onToggleExpand(nodeId);
      } else {
        setInternalExpandedIds(prev => {
          const next = new Set(prev);
          if (next.has(nodeId)) {
            next.delete(nodeId);
          } else {
            next.add(nodeId);
          }
          return next;
        });
      }
    }, [onToggleExpand]);

    const handleExpandAll = useCallback(() => {
      const allIds: string[] = [];
      const collectIds = (unitList: AdminUnit[]) => {
        unitList.forEach(u => {
          if (u.children && u.children.length > 0) {
            allIds.push(u.id);
            collectIds(u.children);
          }
        });
      };
      collectIds(units);
      if (onToggleExpand) {
        allIds.forEach(id => {
          if (!expandedSet.has(id)) onToggleExpand(id);
        });
      } else {
        setInternalExpandedIds(new Set(allIds));
      }
    }, [units, expandedSet, onToggleExpand]);

    const handleCollapseAll = useCallback(() => {
      if (onToggleExpand) {
        expandedSet.forEach(id => onToggleExpand(id));
      } else {
        setInternalExpandedIds(new Set());
      }
    }, [expandedSet, onToggleExpand]);

    const handleUnitClick = useCallback((unitId: string) => {
      onUnitClick?.(unitId);
      onUnitSelect?.(unitId);
    }, [onUnitClick, onUnitSelect]);

    // ─── Flatten + Stats ────────────────────────────────────────────────

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

    const filteredUnitIds = useMemo(() => {
      const ids = new Set<string>();
      allUnits.forEach(unit => {
        if (!showArchived && unit.status === 'archived') return;
        if (typeFilter && unit.type !== typeFilter) return;
        if (statusFilter && unit.status !== statusFilter) return;
        if (searchQuery) {
          const lower = searchQuery.toLowerCase();
          const matches =
            unit.name.toLowerCase().includes(lower) ||
            (unit.code && unit.code.toLowerCase().includes(lower)) ||
            (unit.managerName && unit.managerName.toLowerCase().includes(lower)) ||
            (unit.head?.name && unit.head.name.toLowerCase().includes(lower)) ||
            (unit.description && unit.description.toLowerCase().includes(lower));
          if (!matches) return;
        }
        ids.add(unit.id);
      });
      return ids;
    }, [allUnits, showArchived, typeFilter, statusFilter, searchQuery]);

    const stats = useMemo(() => {
      const activeUnits = allUnits.filter(u => u.status === 'active');
      const totalUnits = allUnits.length;
      const activeCount = activeUnits.length;
      const departments = allUnits.filter(u => u.type === 'department').length;
      const totalMembers = allUnits.reduce((sum, u) => sum + (u.memberCount || u.headCount || 0), 0);
      return { totalUnits, activeCount, departments, totalMembers };
    }, [allUnits]);

    // ─── Glass Styles ───────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Render: Stats Ribbon ───────────────────────────────────────────

    const renderStatsRibbon = () => {
      const statItems = [
        {
          label: 'Total Units',
          value: stats.totalUnits,
          icon: <FolderTree size={16} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active',
          value: stats.activeCount,
          icon: <BarChart3 size={16} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'Departments',
          value: stats.departments,
          icon: <Building2 size={16} />,
          color: tokens.colors.infoScale[600],
          bgColor: tokens.colors.infoScale[50],
        },
        {
          label: 'Total Members',
          value: stats.totalMembers,
          icon: <Users size={16} />,
          color: tokens.colors.secondaryScale[600],
          bgColor: tokens.colors.secondaryScale[50],
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[5],
        }}>
          {statItems.map((stat, idx) => (
            <div
              key={idx}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                ...glassCardStyle,
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginBottom: 2,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {stat.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Search + Toolbar ───────────────────────────────────────

    const renderToolbar = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        marginBottom: tokens.spacing[4],
        flexWrap: 'wrap' as const,
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          flex: 1,
          minWidth: 240,
          transition: `all ${tokens.motion.hover}`,
          ...glassCardStyle,
        }}>
          <Search size={16} color={tokens.colors.neutral[400]} />
          <input
            type="text"
            placeholder="Search units by name, code, or manager..."
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
              style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={() => handleSearchChange('')}
            />
          )}
        </div>

        {/* Expand/Collapse all buttons */}
        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
          <button
            onClick={handleExpandAll}
            title="Expand all"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <ChevronsDown size={14} />
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            title="Collapse all"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <ChevronsUp size={14} />
            Collapse All
          </button>
        </div>
      </div>
    );

    // ─── Render: Action Button ──────────────────────────────────────────

    const renderActionButton = (
      icon: React.ReactNode,
      label: string,
      onClick: (e: React.MouseEvent) => void,
      variant: 'default' | 'primary' | 'danger' = 'default',
    ) => {
      const colorMap = {
        default: {
          bg: tokens.colors.neutral[50],
          border: tokens.colors.neutral[200],
          color: tokens.colors.neutral[600],
          hoverBg: tokens.colors.neutral[100],
        },
        primary: {
          bg: tokens.colors.primaryScale[50],
          border: tokens.colors.primaryScale[200],
          color: tokens.colors.primaryScale[600],
          hoverBg: tokens.colors.primaryScale[100],
        },
        danger: {
          bg: tokens.colors.errorScale[50],
          border: tokens.colors.errorScale[200],
          color: tokens.colors.errorScale[600],
          hoverBg: tokens.colors.errorScale[100],
        },
      };

      const colors = colorMap[variant];

      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(e);
          }}
          title={label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
            backgroundColor: colors.bg,
            color: colors.color,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            outline: 'none',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {icon}
        </button>
      );
    };

    // ─── Render: Tree Node ──────────────────────────────────────────────

    const renderTreeNode = (unit: AdminUnit, depth: number = 0): React.ReactNode => {
      const isExpanded = expandedSet.has(unit.id);
      const isSelected = selectedUnitId === unit.id;
      const isHovered = hoveredNodeId === unit.id;
      const hasChildren = unit.children && unit.children.length > 0;
      const typeConfig = getUnitTypeConfig(unit.type, tokens);
      const statusConfig = getStatusConfig(unit.status, tokens);

      // Search filtering: if search is active, only show matching units
      if (searchQuery && !filteredUnitIds.has(unit.id)) {
        // Still recurse children in case they match
        const childResults = hasChildren
          ? unit.children.map(child => renderTreeNode(child, depth + 1)).filter(Boolean)
          : [];
        if (childResults.length === 0) return null;
        return <>{childResults}</>;
      }

      const memberCount = unit.memberCount || unit.headCount || 0;
      const managerDisplay = unit.managerName || unit.head?.name;
      const indentPx = depth * 28;

      return (
        <div key={unit.id}>
          {/* Node row */}
          <div
            onMouseEnter={() => setHoveredNodeId(unit.id)}
            onMouseLeave={() => {
              setHoveredNodeId(null);
              if (showActionsForId === unit.id) setShowActionsForId(null);
            }}
            onClick={() => handleUnitClick(unit.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              paddingLeft: tokens.spacing[3] + indentPx,
              backgroundColor: isSelected
                ? tokens.colors.primaryScale[50]
                : isHovered
                ? tokens.colors.neutral[50]
                : 'transparent',
              borderLeft: isSelected
                ? `3px solid ${tokens.colors.primaryScale[600]}`
                : '3px solid transparent',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              position: 'relative' as const,
            }}
          >
            {/* Connecting line for indentation */}
            {depth > 0 && (
              <div style={{
                position: 'absolute' as const,
                left: tokens.spacing[3] + ((depth - 1) * 28) + 10,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: tokens.colors.neutral[200],
                pointerEvents: 'none' as const,
              }} />
            )}

            {/* Expand/collapse chevron */}
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpand(unit.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  backgroundColor: isExpanded ? tokens.colors.neutral[100] : 'transparent',
                  border: 'none',
                  borderRadius: tokens.borderRadius.sm,
                  cursor: 'pointer',
                  color: tokens.colors.neutral[500],
                  padding: 0,
                  outline: 'none',
                  flexShrink: 0,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <div style={{ width: 22, flexShrink: 0 }} />
            )}

            {/* Unit type icon */}
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

            {/* Unit name + code + type badge */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden' as const,
                textOverflow: 'ellipsis' as const,
              }}>
                {unit.name}
              </span>

              {/* Code badge */}
              {unit.code && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: `1px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[600],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  flexShrink: 0,
                }}>
                  <Hash size={9} />
                  {unit.code}
                </span>
              )}

              {/* Type label (shown on hover or always for root) */}
              {(isHovered || depth === 0) && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: `1px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: typeConfig.bgColor,
                  color: typeConfig.color,
                  flexShrink: 0,
                }}>
                  {typeConfig.label}
                </span>
              )}
            </div>

            {/* Member count badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.neutral[100],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              fontWeight: tokens.typography.fontWeight.medium,
              flexShrink: 0,
            }}>
              <Users size={12} />
              {memberCount}
            </div>

            {/* Manager name */}
            {managerDisplay && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                flexShrink: 0,
                maxWidth: 140,
                overflow: 'hidden' as const,
                textOverflow: 'ellipsis' as const,
                whiteSpace: 'nowrap' as const,
              }}>
                <User size={12} />
                <span>{managerDisplay}</span>
              </div>
            )}

            {/* Status indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              flexShrink: 0,
            }}>
              <span style={{
                ...createStatusDotStyle(tokens, statusConfig.dotColor),
                width: 7,
                height: 7,
              }} />
              {isHovered && (
                <span style={{
                  fontSize: '10px',
                  color: statusConfig.textColor,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {statusConfig.label}
                </span>
              )}
            </div>

            {/* Hover actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
              flexShrink: 0,
            }}>
              {/* Add child */}
              {onCreate && renderActionButton(
                <Plus size={13} />,
                'Add Child Unit',
                () => onCreate(unit.id),
                'primary',
              )}

              {/* Edit */}
              {onEdit && renderActionButton(
                <Edit3 size={13} />,
                'Edit Unit',
                () => onEdit(unit.id),
                'default',
              )}

              {/* Move */}
              {onMove && renderActionButton(
                <ArrowRightLeft size={13} />,
                'Move Unit',
                () => onMove(unit.id),
                'default',
              )}

              {/* Archive */}
              {onArchive && unit.status === 'active' && renderActionButton(
                <Archive size={13} />,
                'Archive Unit',
                () => onArchive(unit.id),
                'default',
              )}

              {/* Delete */}
              {onDelete && renderActionButton(
                <Trash2 size={13} />,
                'Delete Unit',
                () => onDelete(unit.id),
                'danger',
              )}
            </div>
          </div>

          {/* Render children if expanded */}
          {isExpanded && hasChildren && (
            <div style={{ position: 'relative' as const }}>
              {unit.children.map(child => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Empty State ────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        ...glassCardStyle,
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
          <FolderTree size={32} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery ? 'No matching units found' : 'No organizational units'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery
            ? 'Try adjusting your search query to find what you are looking for.'
            : 'Create your first organizational unit to build your hierarchy.'}
        </div>
        {onCreate && !searchQuery && (
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
    );

    // ─── Render: Loading State ──────────────────────────────────────────

    const renderLoadingState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        ...glassCardStyle,
        padding: 0,
        overflow: 'hidden' as const,
      }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              paddingLeft: tokens.spacing[4] + ((i % 3) * 28),
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: tokens.borderRadius.sm,
              backgroundColor: tokens.colors.neutral[100],
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              width: 32,
              height: 32,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[100],
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{ flex: 1, display: 'flex', gap: tokens.spacing[2] }}>
              <div style={{
                width: 120 + (i * 15),
                height: 14,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{
                width: 48,
                height: 14,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            </div>
            <div style={{
              width: 56,
              height: 22,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.neutral[100],
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        ))}
      </div>
    );

    // ─── Render: Root Add Button ────────────────────────────────────────

    const renderRootAddButton = () => {
      if (!onCreate) return null;
      return (
        <div style={{
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <button
            onClick={() => onCreate()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.primaryScale[600],
              backgroundColor: 'transparent',
              border: `1px dashed ${tokens.colors.primaryScale[300]}`,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Plus size={14} />
            Add Root Unit
          </button>
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
              Manage your organizational hierarchy and reporting structure
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

        {/* Stats ribbon */}
        {renderStatsRibbon()}

        {/* Search + Toolbar */}
        {renderToolbar()}

        {/* Tree card */}
        {loading ? renderLoadingState() : (
          units.length === 0 ? renderEmptyState() : (
            <div style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              ...glassCardStyle,
              padding: 0,
              overflow: 'hidden' as const,
            }}>
              {/* Tree header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                backgroundColor: tokens.colors.neutral[50],
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}>
                  <FolderTree size={14} color={tokens.colors.neutral[500]} />
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>
                    Hierarchy
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 20,
                    height: 18,
                    padding: `0 ${tokens.spacing[1]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: '10px',
                    fontWeight: tokens.typography.fontWeight.semibold,
                    backgroundColor: tokens.colors.neutral[200],
                    color: tokens.colors.neutral[700],
                  }}>
                    {searchQuery ? filteredUnitIds.size : allUnits.length}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  <span>{expandedSet.size} expanded</span>
                </div>
              </div>

              {/* Tree body */}
              <div style={{
                maxHeight: 'calc(100vh - 480px)',
                overflow: 'auto' as const,
              }}>
                {units.map(unit => renderTreeNode(unit, 0))}
              </div>

              {/* Root add button at bottom */}
              {renderRootAddButton()}
            </div>
          )
        )}
      </div>
    );
  },
});
