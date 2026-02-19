'use client';

/**
 * BhPositionList - Table Preset
 * Full DataTable view of positions with sortable columns,
 * status badges, and priority indicators.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo} from 'react';
import {
  Briefcase, ArrowUpDown, ArrowUp, ArrowDown,
  Users, Clock, User, Search, Filter, ChevronDown, X,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  createPersonalitySectionHeaderStyle,
  getAccentAwareLayout,

  createCardHoverStyles,
  createDividerStyle,
} from '../../../helpers';
import type { BhPositionListProps, RecruiterPosition } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDaysOpen(position: RecruiterPosition): number {
  const created = position.createdAt ? new Date(String(position.createdAt)) : new Date();
  return Math.floor((Date.now() - created.getTime()) / 86400000);
}

function getStatusConfig(status: string | null | undefined, t: DesignTokens) {
  switch (status) {
    case 'open': return { label: 'Open', badge: 'success' as const, color: t.colors.successScale[600] };
    case 'filled': return { label: 'Filled', badge: 'info' as const, color: t.colors.infoScale[600] };
    case 'closed':
    case 'cancelled':
    case 'archived': return { label: 'Closed', badge: 'secondary' as const, color: t.colors.neutral[500] };
    case 'on_hold': return { label: 'On Hold', badge: 'warning' as const, color: t.colors.warningScale[600] };
    case 'draft':
    case 'pending_approval':
    default: return { label: status ?? 'Draft', badge: 'secondary' as const, color: t.colors.neutral[500] };
  }
}

function getPriorityConfig(priority: string | null | undefined, t: DesignTokens) {
  switch (priority) {
    case 'high':
    case 'urgent':
    case 'critical': return { label: 'High', color: t.colors.errorScale[600], bg: t.colors.errorScale[50] };
    case 'normal': return { label: 'Medium', color: t.colors.warningScale[600], bg: t.colors.warningScale[50] };
    case 'low':
    default: return { label: 'Low', color: t.colors.neutral[500], bg: t.colors.neutral[100] };
  }
}

/* ================================================================== */
/*  Table Preset                                                       */
/* ================================================================== */

export const TableBhPositionList = createPreset<BhPositionListProps>({
  name: 'BhPositionList.Table',
  render: (ctx: PresetContext<BhPositionListProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      positions: rawPositions = [],
      onPositionClick,
      selectedPositionId,
      sortBy: sortByProp,
      onSortChange,
      loading = false,
      statusFilterOptions,
      statusFilter: statusFilterProp,
      onStatusFilterChange,
      urgencyFilter: urgencyFilterProp,
      onUrgencyFilterChange,
      departmentFilter: departmentFilterProp,
      onDepartmentFilterChange,
      departments: departmentsProp,
      teamFilter: teamFilterProp,
      onTeamFilterChange,
      teams: teamsProp,
      className,
      style,
    } = props;

    const positions = Array.isArray(rawPositions) ? rawPositions : [];

    const [internalSort, setInternalSort] = useState<string>(sortByProp ?? 'daysOpen');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [searchQuery, setSearchQuery] = useState('');

    const sortBy = sortByProp ?? internalSort;

    const card = useMemo(() => createCardStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const handleSort = useCallback((field: string) => {
      if (sortBy === field) {
        setSortDir(d => d === 'asc' ? 'desc' : 'asc');
      } else {
        setInternalSort(field);
        setSortDir('desc');
        onSortChange?.(field);
      }
    }, [sortBy, onSortChange]);

    const filtered = useMemo(() => {
      let result = Array.isArray(positions) ? positions : [];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.code || '').toLowerCase().includes(q) ||
          (p.clientId || '').toLowerCase().includes(q)
        );
      }
      return [...result].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortBy];
        const bVal = (b as Record<string, unknown>)[sortBy];
        const cmp = typeof aVal === 'string' ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }, [positions, searchQuery, sortBy, sortDir]);

    const handleClick = useCallback((id: string) => {
      onPositionClick?.(id);
    }, [onPositionClick]);

    const columns = useMemo(() => [
      { key: 'title', label: 'Position', flex: 3 },
      { key: 'clientName', label: 'Client', flex: 2 },
      { key: 'status', label: 'Status', flex: 1.5 },
      { key: 'priority', label: 'Priority', flex: 1 },
      { key: 'candidates', label: 'Candidates', flex: 1 },
      { key: 'daysOpen', label: 'Days Open', flex: 1 },
      { key: 'assignee', label: 'Assignee', flex: 2 },
    ], []);

    const SortIcon = useCallback(({ field }: { field: string }) => {
      if (sortBy !== field) return <ArrowUpDown size={10} color={t.colors.neutral[300]} />;
      return sortDir === 'asc'
        ? <ArrowUp size={10} color={t.colors.primaryScale[500]} />
        : <ArrowDown size={10} color={t.colors.primaryScale[500]} />;
    }, [sortBy, sortDir, t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{ ...card, ...animStyle, padding: 0, overflow: 'hidden', ...accentLayout.outer,
          ...style }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[50] })}>
              <Briefcase size={18} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Positions
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {filtered.length} of {positions.length}
              </Text>
            </Box>
          </Box>

          <Box style={{ position: 'relative', minWidth: 200 }}>
            <Search size={13} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search positions..."
              aria-label="Search positions"
              style={{
                width: '100%',
                padding: `${t.spacing[2]}px ${t.spacing[3]}px ${t.spacing[2]}px ${t.spacing[8]}px`,
                border: `1px solid ${t.colors.neutral[200]}`,
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[900],
                backgroundColor: t.colors.common.white,
                outline: 'none',
              }}
            />
          </Box>
        </Box>

        {/* Filter bar */}
        {(statusFilterOptions || departmentsProp || teamsProp || urgencyFilterProp !== undefined) && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            flexWrap: 'wrap',
            padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.neutral[50],
          }} role="toolbar" aria-label="Position filters">
            <Filter size={13} color={t.colors.neutral[400]} />
            {/* Status filter */}
            {statusFilterOptions && statusFilterOptions.length > 0 && (
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${statusFilterProp && statusFilterProp !== 'all' ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: statusFilterProp && statusFilterProp !== 'all' ? t.colors.primaryScale[50] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: statusFilterProp && statusFilterProp !== 'all' ? t.colors.primaryScale[700] : t.colors.neutral[600] }}>
                    {statusFilterProp && statusFilterProp !== 'all' ? statusFilterProp.replace('_', ' ') : 'All Statuses'}
                  </Text>
                  <ChevronDown size={11} color={t.colors.neutral[400]} />
                  <select
                    aria-label="Filter by status"
                    value={statusFilterProp ?? 'all'}
                    onChange={(e: any) => onStatusFilterChange?.(e.target.value)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  >
                    {statusFilterOptions.map(s => (
                      <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
            {/* Department filter */}
            {departmentsProp && departmentsProp.length > 0 && (
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${departmentFilterProp ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: departmentFilterProp ? t.colors.primaryScale[50] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: departmentFilterProp ? t.colors.primaryScale[700] : t.colors.neutral[600] }}>
                    {departmentFilterProp ?? 'All Departments'}
                  </Text>
                  <ChevronDown size={11} color={t.colors.neutral[400]} />
                  <select
                    aria-label="Filter by department"
                    value={departmentFilterProp ?? ''}
                    onChange={(e: any) => onDepartmentFilterChange?.(e.target.value || null)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  >
                    <option value="">All Departments</option>
                    {departmentsProp.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
            {/* Team filter */}
            {teamsProp && teamsProp.length > 0 && (
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${teamFilterProp ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: teamFilterProp ? t.colors.primaryScale[50] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: teamFilterProp ? t.colors.primaryScale[700] : t.colors.neutral[600] }}>
                    {teamFilterProp ?? 'All Teams'}
                  </Text>
                  <ChevronDown size={11} color={t.colors.neutral[400]} />
                  <select
                    aria-label="Filter by team"
                    value={teamFilterProp ?? ''}
                    onChange={(e: any) => onTeamFilterChange?.(e.target.value || null)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  >
                    <option value="">All Teams</option>
                    {teamsProp.map(tm => (
                      <option key={tm} value={tm}>{tm}</option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
            {/* Urgency filter */}
            {urgencyFilterProp !== undefined && (
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Box style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${urgencyFilterProp ? t.colors.primaryScale[200] : t.colors.neutral[200]}`,
                  backgroundColor: urgencyFilterProp ? t.colors.primaryScale[50] : t.colors.common.white,
                  display: 'flex', alignItems: 'center', gap: t.spacing[1], cursor: 'pointer',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: urgencyFilterProp ? t.colors.primaryScale[700] : t.colors.neutral[600] }}>
                    {urgencyFilterProp ? `${urgencyFilterProp} urgency` : 'All Urgencies'}
                  </Text>
                  <ChevronDown size={11} color={t.colors.neutral[400]} />
                  <select
                    aria-label="Filter by urgency"
                    value={urgencyFilterProp ?? ''}
                    onChange={(e: any) => onUrgencyFilterChange?.(e.target.value || null)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  >
                    <option value="">All Urgencies</option>
                    {(['low', 'normal', 'high', 'urgent', 'critical'] as const).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Table header */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
          backgroundColor: t.colors.neutral[50],
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {columns.map(col => (
            <Box
              key={col.key}
              tabIndex={0}
              role="button"
              aria-label={`Sort by ${col.label}`}
              onClick={() => handleSort(col.key)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); } }}
              style={{
                flex: col.flex,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                padding: `${t.spacing[1]}px 0`,
              }}
            >
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: sortBy === col.key ? t.colors.primaryScale[600] : t.colors.neutral[500],
                textTransform: ptypo.labelTransform as React.CSSProperties['textTransform'],
                letterSpacing: ptypo.labelLetterSpacing,
              }}>
                {col.label}
              </Text>
              <SortIcon field={col.key} />
            </Box>
          ))}
        </Box>

        {/* Table body */}
        <Box role="list" aria-label="Positions list">
          {filtered.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Briefcase size={28} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No positions found
              </Text>
            </Box>
          )}
          {filtered.map((pos) => {
            const statusCfg = getStatusConfig(pos.status, t);
            const priorityCfg = getPriorityConfig(pos.priority, t);
            const isSelected = selectedPositionId === pos.id;
            const daysOpen = getDaysOpen(pos);

            return (
              <Box
                key={pos.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${pos.title ?? ''}`}
                onClick={() => handleClick(pos.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(pos.id); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  borderLeft: isSelected ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  cursor: 'pointer',
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 3, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[900],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {pos.title ?? ''}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {pos.code ?? ''}
                  </Text>
                </Box>
                <Box style={{ flex: 2 }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                    {pos.clientId ?? ''}
                  </Text>
                </Box>
                <Box style={{ flex: 1.5 }}>
                  <Box style={{
                    ...createBadgeStyle(t, statusCfg.badge),
                    borderRadius: badgeRadius,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{statusCfg.label}</Text>
                  </Box>
                </Box>
                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Box style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `0 ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    backgroundColor: priorityCfg.bg,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: priorityCfg.color }}>
                      {priorityCfg.label}
                    </Text>
                  </Box>
                  {(pos.priority === 'urgent' || pos.priority === 'critical') && (
                    <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.errorScale[500], flexShrink: 0, animation: 'pulse 2s infinite' }} aria-label="Urgent" />
                  )}
                </Box>
                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Users size={11} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                    {pos.openings ?? 0}
                  </Text>
                </Box>
                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={11} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: daysOpen > 30 ? t.colors.warningScale[600] : t.colors.neutral[700] }}>
                    {daysOpen}d
                  </Text>
                </Box>
                <Box style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <User size={11} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                    {pos.filledCount ?? 0}/{pos.openings ?? 0}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
        </Box>
      </Box>
    );
  },
});
