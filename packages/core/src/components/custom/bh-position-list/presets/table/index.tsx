'use client';

/**
 * BhPositionList - Table Preset
 * Full DataTable view of positions with sortable columns,
 * status badges, and priority indicators.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Briefcase, ArrowUpDown, ArrowUp, ArrowDown,
  Users, Clock, User, Search, Filter,
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
} from '../../../helpers';
import type { BhPositionListProps, PositionListItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_POSITIONS: PositionListItem[] = [
  { id: 'pl-1', title: 'Senior Frontend Engineer', clientName: 'Acme Corp', department: 'Engineering', status: 'open', priority: 'high', candidates: 15, daysOpen: 12, assignee: 'Sarah Kim' },
  { id: 'pl-2', title: 'Product Manager', clientName: 'Horizon Labs', department: 'Product', status: 'open', priority: 'medium', candidates: 8, daysOpen: 25, assignee: 'Tom Walsh' },
  { id: 'pl-3', title: 'UX Designer', clientName: 'Nova Ventures', department: 'Design', status: 'on-hold', priority: 'low', candidates: 3, daysOpen: 45, assignee: 'Emily Chen' },
  { id: 'pl-4', title: 'Backend Developer', clientName: 'Acme Corp', department: 'Engineering', status: 'open', priority: 'high', candidates: 22, daysOpen: 5, assignee: 'Sarah Kim' },
  { id: 'pl-5', title: 'Data Analyst', clientName: 'Meridian Group', department: 'Analytics', status: 'filled', priority: 'medium', candidates: 10, daysOpen: 60, assignee: 'Mark Rivera' },
  { id: 'pl-6', title: 'DevOps Lead', clientName: 'Acme Corp', department: 'Infrastructure', status: 'closed', priority: 'low', candidates: 6, daysOpen: 90, assignee: 'Tom Walsh' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusConfig(status: PositionListItem['status'], t: DesignTokens) {
  switch (status) {
    case 'open': return { label: 'Open', badge: 'success' as const, color: t.colors.successScale[600] };
    case 'filled': return { label: 'Filled', badge: 'info' as const, color: t.colors.infoScale[600] };
    case 'closed': return { label: 'Closed', badge: 'secondary' as const, color: t.colors.neutral[500] };
    case 'on-hold': return { label: 'On Hold', badge: 'warning' as const, color: t.colors.warningScale[600] };
  }
}

function getPriorityConfig(priority: PositionListItem['priority'], t: DesignTokens) {
  switch (priority) {
    case 'high': return { label: 'High', color: t.colors.errorScale[600], bg: t.colors.errorScale[50] };
    case 'medium': return { label: 'Medium', color: t.colors.warningScale[600], bg: t.colors.warningScale[50] };
    case 'low': return { label: 'Low', color: t.colors.neutral[500], bg: t.colors.neutral[100] };
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
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      positions = MOCK_POSITIONS,
      onPositionClick,
      selectedPositionId,
      sortBy: sortByProp,
      onSortChange,
      loading = false,
      className,
      style,
    } = props;


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
      let result = positions;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q) ||
          p.assignee.toLowerCase().includes(q)
        );
      }
      return [...result].sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
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

    return (
      <Box
        className={className}
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
                textTransform: ptypo.labelTransform as any,
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

            return (
              <Box
                key={pos.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${pos.title} at ${pos.clientName}`}
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
                    {pos.title}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {pos.department}
                  </Text>
                </Box>
                <Box style={{ flex: 2 }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                    {pos.clientName}
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
                <Box style={{ flex: 1 }}>
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
                </Box>
                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Users size={11} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                    {pos.candidates}
                  </Text>
                </Box>
                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={11} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: pos.daysOpen > 30 ? t.colors.warningScale[600] : t.colors.neutral[700] }}>
                    {pos.daysOpen}d
                  </Text>
                </Box>
                <Box style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <User size={11} color={t.colors.neutral[400]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                    {pos.assignee}
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
