'use client';

/**
 * BhTeamBoard - Grid Preset
 * Full team management board with team cards, member table, capacity bars,
 * performance KPIs, sprint panel, add/edit modal, and targets config.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhTeamBoardProps,
  TeamItem,
  TeamMember,
  TeamKpiData,
  SprintData,
  TeamTarget,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

/* ------------------------------------------------------------------ */
/*  Helper: sparkline polyline points                                  */
/* ------------------------------------------------------------------ */
function sparklinePoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1 || 1);
  return data
    .map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

function sparklinePolygonPoints(data: number[], width: number, height: number, padding: number): string {
  if (!data.length) return '';
  const line = sparklinePoints(data, width, height, padding);
  const lastX = padding + (data.length - 1) * ((width - padding * 2) / (data.length - 1 || 1));
  return `${padding},${height - padding} ${line} ${lastX},${height - padding}`;
}

/* ------------------------------------------------------------------ */
/*  Helper: progress ring SVG calculations                             */
/* ------------------------------------------------------------------ */
function progressRing(value: number, max: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / (max || 1), 1);
  const dashArray = `${pct * circumference} ${circumference}`;
  return { circumference, dashArray, pct };
}

/* ------------------------------------------------------------------ */
/*  Helper: clamp percentage                                           */
/* ------------------------------------------------------------------ */
function clampPct(val: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max((val / total) * 100, 0), 100);
}

/* ------------------------------------------------------------------ */
/*  Grid Preset                                                        */
/* ------------------------------------------------------------------ */
export const GridBhTeamBoard = createPreset<BhTeamBoardProps>({
  name: 'BhTeamBoard.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhTeamBoardProps>) => {
    const { Box, Text } = primitives;

    const {
      teams = [],
      selectedTeam: controlledSelectedTeam,
      onTeamSelect,
      members = [],
      teamKpis,
      sprintData: controlledSprintData,
      targets = [],
      onAddTeam,
      onEditTeam,
      onAddMember,
      onRemoveMember,
      onMemberRoleChange,
      showAddModal: controlledShowAddModal,
      onAddModalToggle,
      viewMode: controlledViewMode,
      onViewModeChange,
      editingMember: controlledEditingMember,
      onMemberEdit,
      targetPeriod: controlledTargetPeriod,
      onTargetPeriodChange,
      className,
      style,
    } = props;

    const [internalSelectedTeam, setInternalSelectedTeam] = useState<string | null>(
      teams.length > 0 ? teams[0].id : null
    );
    const [internalMembers] = useState<TeamMember[]>(members);
    const [internalShowAddModal, setInternalShowAddModal] = useState(false);
    const [internalEditingMember, setInternalEditingMember] = useState<string | null>(null);
    const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>('grid');
    const [internalSprintData] = useState<SprintData | undefined>(controlledSprintData);
    const [internalTargetPeriod, setInternalTargetPeriod] = useState<'monthly' | 'quarterly'>('monthly');

    const activeSelectedTeam = controlledSelectedTeam !== undefined ? controlledSelectedTeam : internalSelectedTeam;
    const activeShowAddModal = controlledShowAddModal !== undefined ? controlledShowAddModal : internalShowAddModal;
    const activeViewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
    const activeEditingMember = controlledEditingMember !== undefined ? controlledEditingMember : internalEditingMember;
    const activeSprintData = controlledSprintData !== undefined ? controlledSprintData : internalSprintData;
    const activeTargetPeriod = controlledTargetPeriod !== undefined ? controlledTargetPeriod : internalTargetPeriod;
    const activeMembers = members.length > 0 ? members : internalMembers;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const cardInteractive = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass, interactive: true }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const selectedTeamData = useMemo(
      () => teams.find((t) => t.id === activeSelectedTeam),
      [teams, activeSelectedTeam]
    );

    const handleTeamSelect = (teamId: string) => {
      setInternalSelectedTeam(teamId);
      onTeamSelect?.(teamId);
    };

    const handleViewModeChange = (mode: 'grid' | 'list') => {
      setInternalViewMode(mode);
      onViewModeChange?.(mode);
    };

    const handleModalToggle = (open: boolean) => {
      setInternalShowAddModal(open);
      onAddModalToggle?.(open);
    };

    const handleMemberEdit = (memberId: string | null) => {
      setInternalEditingMember(memberId);
      onMemberEdit?.(memberId);
    };

    const handleTargetPeriodChange = (period: 'monthly' | 'quarterly') => {
      setInternalTargetPeriod(period);
      onTargetPeriodChange?.(period);
    };

    const roleColors: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'secondary'> = {
      'Lead': 'primary',
      'Senior': 'success',
      'Mid': 'info',
      'Junior': 'warning',
      'Intern': 'secondary',
    };

    const getRoleBadgeColor = (role: string): 'primary' | 'success' | 'warning' | 'info' | 'secondary' => {
      return roleColors[role] || 'info';
    };

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */
    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[6],
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  Header                                                      */}
        {/* =========================================================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[6],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
                marginBottom: tokens.spacing[1],
              }}
            >
              Team Management
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              {teams.length} teams &middot; {teams.reduce((s, t) => s + t.memberCount, 0)} total members
            </Text>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}
          >
            {/* View mode toggle */}
            <div
              style={{
                display: 'flex',
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                overflow: 'hidden',
              }}
            >
              {(['grid', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    border: 'none',
                    backgroundColor:
                      activeViewMode === mode ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color:
                      activeViewMode === mode ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight:
                      activeViewMode === mode
                        ? tokens.typography.fontWeight.semibold
                        : tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    textTransform: 'capitalize' as const,
                    ...hoverStyle,
                  }}
                >
                  {mode === 'grid' ? '\u25A6' : '\u2630'} {mode}
                </button>
              ))}
            </div>
            {/* Add team button */}
            <button
              onClick={() => {
                handleModalToggle(true);
                onAddTeam?.();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                ...hoverStyle,
              }}
            >
              + Add Team
            </button>
          </div>
        </div>

        {/* =========================================================== */}
        {/*  1. Team Grid / List                                         */}
        {/* =========================================================== */}
        <div
          style={{
            display: activeViewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: activeViewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
            flexDirection: activeViewMode === 'list' ? 'column' : undefined,
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[6],
          }}
        >
          {teams.map((team) => {
            const isSelected = activeSelectedTeam === team.id;
            const capacityPct = clampPct(team.capacityUsed, team.capacityTotal);
            const perfRadius = 22;
            const perfStroke = 4;
            const perfSize = (perfRadius + perfStroke) * 2;
            const perfRing = progressRing(team.performanceScore, 100, perfRadius);

            const capacityColor =
              capacityPct >= 90
                ? tokens.colors.errorScale[500]
                : capacityPct >= 70
                ? tokens.colors.warningScale[500]
                : tokens.colors.successScale[500];

            return (
              <div
                key={team.id}
                onClick={() => handleTeamSelect(team.id)}
                style={{
                  ...cardInteractive,
                  border: isSelected
                    ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[400]}`
                    : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: isSelected
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.common.white,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  display: 'flex',
                  flexDirection: activeViewMode === 'list' ? 'row' : 'column',
                  gap: tokens.spacing[3],
                }}
                onMouseEnter={(e) => {
                  Object.assign((e.currentTarget as HTMLDivElement).style, hoverTransform);
                  (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.md;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadows.sm;
                }}
              >
                {/* Team header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flex: activeViewMode === 'list' ? 1 : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    {/* Lead avatar */}
                    <div
                      style={{
                        width: tokens.spacing[9],
                        height: tokens.spacing[9],
                        borderRadius: tokens.borderRadius.full,
                        overflow: 'hidden',
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tokens.colors.primaryScale[700],
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        flexShrink: 0,
                      }}
                    >
                      {team.leadAvatar ? (
                        <img
                          src={team.leadAvatar}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                        />
                      ) : (
                        team.leadName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                        }}
                      >
                        {team.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        Lead: {team.leadName}
                      </Text>
                    </div>
                  </div>
                  {/* Performance ring */}
                  <svg
                    width={perfSize}
                    height={perfSize}
                    viewBox={`0 0 ${perfSize} ${perfSize}`}
                    style={{ flexShrink: 0 }}
                  >
                    <circle
                      cx={perfSize / 2}
                      cy={perfSize / 2}
                      r={perfRadius}
                      fill="none"
                      stroke={tokens.colors.neutral[100]}
                      strokeWidth={perfStroke}
                    />
                    <circle
                      cx={perfSize / 2}
                      cy={perfSize / 2}
                      r={perfRadius}
                      fill="none"
                      stroke={
                        team.performanceScore >= 80
                          ? tokens.colors.successScale[500]
                          : team.performanceScore >= 50
                          ? tokens.colors.warningScale[500]
                          : tokens.colors.errorScale[500]
                      }
                      strokeWidth={perfStroke}
                      strokeDasharray={perfRing.dashArray}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${perfSize / 2} ${perfSize / 2})`}
                      style={{ transition: `stroke-dasharray ${tokens.motion.hover}` }}
                    />
                    <text
                      x={perfSize / 2}
                      y={perfSize / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={tokens.colors.neutral[900]}
                      fontSize={tokens.typography.fontSize.xs}
                      fontWeight={tokens.typography.fontWeight.bold}
                    >
                      {team.performanceScore}
                    </text>
                  </svg>
                </div>

                {/* Stats row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    flex: activeViewMode === 'list' ? 1 : undefined,
                  }}
                >
                  {/* Member count badge */}
                  <div
                    style={{
                      ...createBadgeStyle(tokens, 'info'),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    <span style={{ fontSize: tokens.typography.fontSize.xs }}>{team.memberCount}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs }}>members</span>
                  </div>
                  {/* Active jobs */}
                  <div
                    style={{
                      ...createBadgeStyle(tokens, 'success'),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    <span style={{ fontSize: tokens.typography.fontSize.xs }}>{team.activeJobs}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs }}>jobs</span>
                  </div>
                </div>

                {/* Capacity bar */}
                <div
                  style={{
                    flex: activeViewMode === 'list' ? 1 : undefined,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      Capacity
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[700],
                      }}
                    >
                      {team.capacityUsed}/{team.capacityTotal}
                    </Text>
                  </div>
                  <svg width="100%" height="8" style={{ display: 'block' }}>
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="8"
                      rx="4"
                      fill={tokens.colors.neutral[100]}
                    />
                    <rect
                      x="0"
                      y="0"
                      width={`${capacityPct}%`}
                      height="8"
                      rx="4"
                      fill={capacityColor}
                      style={{ transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }}
                    />
                  </svg>
                </div>

                {/* Edit button */}
                {activeViewMode === 'list' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTeam?.(team.id);
                    }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      ...hoverStyle,
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* =========================================================== */}
        {/*  2. Team Detail Expanded Panel                               */}
        {/* =========================================================== */}
        {selectedTeamData && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 360px',
              gap: tokens.spacing[6],
              marginBottom: tokens.spacing[6],
            }}
          >
            {/* Left: Members table */}
            <div style={cardBase}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[4],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {selectedTeamData.name} Members
                </Text>
                <button
                  onClick={() => onAddMember?.()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    ...hoverStyle,
                  }}
                >
                  + Add Member
                </button>
              </div>

              {/* Members table header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 80px 80px 60px',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  marginBottom: tokens.spacing[2],
                }}
              >
                {['Member', 'Role', 'Allocation', 'Jobs', 'Hires', ''].map((col) => (
                  <Text
                    key={col}
                    style={{
                      ...sectionHeader,
                      marginBottom: 0,
                    }}
                  >
                    {col}
                  </Text>
                ))}
              </div>

              {/* Members rows */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeMembers.map((member) => {
                  const isEditing = activeEditingMember === member.id;
                  const allocationColor =
                    member.allocationPercent >= 90
                      ? tokens.colors.errorScale[500]
                      : member.allocationPercent >= 70
                      ? tokens.colors.warningScale[500]
                      : tokens.colors.primaryScale[500];

                  return (
                    <div
                      key={member.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 80px 80px 60px',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        alignItems: 'center',
                        backgroundColor: isEditing ? tokens.colors.primaryScale[50] : 'transparent',
                        borderRadius: isEditing ? tokens.borderRadius.md : undefined,
                        ...hoverStyle,
                      }}
                      onMouseEnter={(e) => {
                        if (!isEditing) {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50];
                        }
                        e.currentTarget.style.transform = tokens.motion.transform;
                      }}
                      onMouseLeave={(e) => {
                        if (!isEditing) {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                        }
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {/* Member name + avatar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <div
                          style={{
                            width: tokens.spacing[8],
                            height: tokens.spacing[8],
                            borderRadius: tokens.borderRadius.full,
                            overflow: 'hidden',
                            backgroundColor: tokens.colors.secondaryScale[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: tokens.colors.secondaryScale[700],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            flexShrink: 0,
                          }}
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                            />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[800],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                          }}
                        >
                          {member.name}
                        </Text>
                      </div>

                      {/* Role badge */}
                      <div>
                        <span style={createBadgeStyle(tokens, getRoleBadgeColor(member.role))}>
                          {member.role}
                        </span>
                      </div>

                      {/* Allocation bar */}
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[2],
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              backgroundColor: tokens.colors.neutral[100],
                              borderRadius: tokens.borderRadius.full,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${member.allocationPercent}%`,
                                height: '100%',
                                backgroundColor: allocationColor,
                                borderRadius: tokens.borderRadius.full,
                                transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                              }}
                            />
                          </div>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[700],
                              minWidth: 32,
                              textAlign: 'right' as const,
                            }}
                          >
                            {member.allocationPercent}%
                          </Text>
                        </div>
                      </div>

                      {/* Active jobs */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                          textAlign: 'center' as const,
                        }}
                      >
                        {member.activeJobs}
                      </Text>

                      {/* Hires */}
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.successScale[600],
                          textAlign: 'center' as const,
                        }}
                      >
                        {member.hires}
                      </Text>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: tokens.spacing[1], justifyContent: 'flex-end' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMemberEdit(isEditing ? null : member.id);
                          }}
                          style={{
                            width: tokens.spacing[6],
                            height: tokens.spacing[6],
                            borderRadius: tokens.borderRadius.md,
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: tokens.colors.neutral[400],
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            fontSize: tokens.typography.fontSize.xs,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...hoverStyle,
                          }}
                          title="Edit"
                        >
                          &#x270E;
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveMember?.(member.id);
                          }}
                          style={{
                            width: tokens.spacing[6],
                            height: tokens.spacing[6],
                            borderRadius: tokens.borderRadius.md,
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: tokens.colors.errorScale[400],
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            fontSize: tokens.typography.fontSize.xs,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...hoverStyle,
                          }}
                          title="Remove"
                        >
                          &#x2715;
                        </button>
                      </div>
                    </div>
                  );
                })}

                {activeMembers.length === 0 && (
                  <div
                    style={{
                      padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
                      textAlign: 'center' as const,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                      No members assigned to this team yet.
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar: Capacity + KPIs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
              {/* =========================================================== */}
              {/*  3. Capacity Visualization                                   */}
              {/* =========================================================== */}
              <div style={cardBase}>
                <Text
                  style={{
                    ...sectionHeader,
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  Recruiter Capacity
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  {activeMembers.map((member) => {
                    const allocated = member.allocationPercent;
                    const available = 100 - allocated;
                    return (
                      <div key={member.id}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[700],
                            display: 'block',
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          {member.name}
                        </Text>
                        <svg width="100%" height="16" style={{ display: 'block' }}>
                          <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="16"
                            rx="4"
                            fill={tokens.colors.neutral[100]}
                          />
                          <rect
                            x="0"
                            y="0"
                            width={`${allocated}%`}
                            height="16"
                            rx="4"
                            fill={tokens.colors.primaryScale[500]}
                            style={{ transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }}
                          />
                        </svg>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: tokens.spacing[1],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.primaryScale[600],
                            }}
                          >
                            Allocated: {allocated}%
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                            }}
                          >
                            Available: {available}%
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================== */}
              {/*  5. Performance KPIs                                         */}
              {/* =========================================================== */}
              {teamKpis && (
                <div style={cardBase}>
                  <Text
                    style={{
                      ...sectionHeader,
                      marginBottom: tokens.spacing[3],
                    }}
                  >
                    Performance KPIs
                  </Text>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                    {/* Hires vs Target */}
                    <div
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.successScale[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.successScale[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        Hires vs Target
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.successScale[800],
                          display: 'block',
                        }}
                      >
                        {teamKpis.hiresVsTarget.actual}/{teamKpis.hiresVsTarget.target}
                      </Text>
                    </div>

                    {/* SLA Compliance */}
                    <div
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.infoScale[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.infoScale[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        SLA Compliance
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.infoScale[800],
                          display: 'block',
                        }}
                      >
                        {teamKpis.slaCompliance}%
                      </Text>
                    </div>

                    {/* Velocity Trend sparkline */}
                    <div
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.primaryScale[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        Velocity Trend
                      </Text>
                      {teamKpis.velocityTrend.length > 1 && (
                        <svg width="100%" height="32" viewBox="0 0 120 32" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="vel-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={tokens.colors.primaryScale[400]} stopOpacity="0.3" />
                              <stop offset="100%" stopColor={tokens.colors.primaryScale[400]} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <polygon
                            points={sparklinePolygonPoints(teamKpis.velocityTrend, 120, 32, 2)}
                            fill="url(#vel-grad)"
                          />
                          <polyline
                            points={sparklinePoints(teamKpis.velocityTrend, 120, 32, 2)}
                            fill="none"
                            stroke={tokens.colors.primaryScale[500]}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Satisfaction */}
                    <div
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.warningScale[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.warningScale[700],
                          fontWeight: tokens.typography.fontWeight.medium,
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        Satisfaction
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.warningScale[800],
                          display: 'block',
                        }}
                      >
                        {teamKpis.satisfactionScore}/5
                      </Text>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================== */}
        {/*  6. Sprint Panel                                             */}
        {/* =========================================================== */}
        {activeSprintData && selectedTeamData && (
          <div
            style={{
              ...cardBase,
              marginBottom: tokens.spacing[6],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                display: 'block',
                marginBottom: tokens.spacing[4],
              }}
            >
              Sprint Progress
            </Text>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 1fr',
                gap: tokens.spacing[6],
                alignItems: 'center',
              }}
            >
              {/* Progress ring */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {(() => {
                  const sprintRadius = 44;
                  const sprintStroke = 8;
                  const sprintSize = (sprintRadius + sprintStroke) * 2;
                  const sprintRing = progressRing(
                    activeSprintData.completed,
                    activeSprintData.total,
                    sprintRadius
                  );
                  return (
                    <svg
                      width={sprintSize}
                      height={sprintSize}
                      viewBox={`0 0 ${sprintSize} ${sprintSize}`}
                    >
                      <circle
                        cx={sprintSize / 2}
                        cy={sprintSize / 2}
                        r={sprintRadius}
                        fill="none"
                        stroke={tokens.colors.neutral[100]}
                        strokeWidth={sprintStroke}
                      />
                      <circle
                        cx={sprintSize / 2}
                        cy={sprintSize / 2}
                        r={sprintRadius}
                        fill="none"
                        stroke={tokens.colors.successScale[500]}
                        strokeWidth={sprintStroke}
                        strokeDasharray={sprintRing.dashArray}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${sprintSize / 2} ${sprintSize / 2})`}
                        style={{ transition: `stroke-dasharray ${tokens.motion.hover}` }}
                      />
                      <text
                        x={sprintSize / 2}
                        y={sprintSize / 2 - 6}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={tokens.colors.neutral[900]}
                        fontSize={tokens.typography.fontSize.lg}
                        fontWeight={tokens.typography.fontWeight.bold}
                      >
                        {Math.round(sprintRing.pct * 100)}%
                      </text>
                      <text
                        x={sprintSize / 2}
                        y={sprintSize / 2 + 12}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={tokens.colors.neutral[500]}
                        fontSize={tokens.typography.fontSize.xs}
                      >
                        done
                      </text>
                    </svg>
                  );
                })()}
              </div>

              {/* Task distribution mini bar chart */}
              <div>
                <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[2] }}>
                  Task Distribution
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {[
                    { label: 'Completed', value: activeSprintData.completed, color: tokens.colors.successScale[500] },
                    { label: 'In Progress', value: activeSprintData.inProgress, color: tokens.colors.primaryScale[500] },
                    { label: 'Blocked', value: activeSprintData.blocked, color: tokens.colors.errorScale[500] },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          width: 80,
                          flexShrink: 0,
                        }}
                      >
                        {item.label}
                      </Text>
                      <div
                        style={{
                          flex: 1,
                          height: 12,
                          backgroundColor: tokens.colors.neutral[100],
                          borderRadius: tokens.borderRadius.sm,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${clampPct(item.value, activeSprintData.total)}%`,
                            height: '100%',
                            backgroundColor: item.color,
                            borderRadius: tokens.borderRadius.sm,
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }}
                        />
                      </div>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[700],
                          width: 24,
                          textAlign: 'right' as const,
                        }}
                      >
                        {item.value}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Burndown line chart */}
              <div>
                <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[2] }}>
                  Burndown
                </Text>
                {activeSprintData.burndownData.length > 1 && (
                  <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="burndown-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tokens.colors.primaryScale[400]} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={tokens.colors.primaryScale[400]} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Ideal line */}
                    <line
                      x1="4"
                      y1="4"
                      x2="196"
                      y2="76"
                      stroke={tokens.colors.neutral[300]}
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <polygon
                      points={sparklinePolygonPoints(activeSprintData.burndownData, 200, 80, 4)}
                      fill="url(#burndown-grad)"
                    />
                    <polyline
                      points={sparklinePoints(activeSprintData.burndownData, 200, 80, 4)}
                      fill="none"
                      stroke={tokens.colors.primaryScale[500]}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================== */}
        {/*  8. Targets Config                                           */}
        {/* =========================================================== */}
        {targets.length > 0 && (
          <div style={cardBase}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing[4],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                Team Targets
              </Text>
              <div
                style={{
                  display: 'flex',
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  overflow: 'hidden',
                }}
              >
                {(['monthly', 'quarterly'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => handleTargetPeriodChange(period)}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      border: 'none',
                      backgroundColor:
                        activeTargetPeriod === period
                          ? tokens.colors.primaryScale[50]
                          : tokens.colors.common.white,
                      color:
                        activeTargetPeriod === period
                          ? tokens.colors.primaryScale[600]
                          : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight:
                        activeTargetPeriod === period
                          ? tokens.typography.fontWeight.semibold
                          : tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      textTransform: 'capitalize' as const,
                      ...hoverStyle,
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: tokens.spacing[3],
              }}
            >
              {targets
                .filter((t) => t.period === activeTargetPeriod || !t.period)
                .map((target, idx) => {
                  const pct = clampPct(target.current, target.value);
                  const targetColor =
                    pct >= 100
                      ? tokens.colors.successScale[500]
                      : pct >= 70
                      ? tokens.colors.primaryScale[500]
                      : pct >= 40
                      ? tokens.colors.warningScale[500]
                      : tokens.colors.errorScale[500];
                  const targetBg =
                    pct >= 100
                      ? tokens.colors.successScale[50]
                      : pct >= 70
                      ? tokens.colors.primaryScale[50]
                      : pct >= 40
                      ? tokens.colors.warningScale[50]
                      : tokens.colors.errorScale[50];

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: targetBg,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                          pct >= 100
                            ? tokens.colors.successScale[200]
                            : pct >= 70
                            ? tokens.colors.primaryScale[200]
                            : pct >= 40
                            ? tokens.colors.warningScale[200]
                            : tokens.colors.errorScale[200]
                        }`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[600],
                          display: 'block',
                          marginBottom: tokens.spacing[2],
                        }}
                      >
                        {target.metric}
                      </Text>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: tokens.spacing[1],
                          marginBottom: tokens.spacing[2],
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xl,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {target.current}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          / {target.value}
                        </Text>
                      </div>
                      <div
                        style={{
                          height: 6,
                          backgroundColor: tokens.colors.neutral[200],
                          borderRadius: tokens.borderRadius.full,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            height: '100%',
                            backgroundColor: targetColor,
                            borderRadius: tokens.borderRadius.full,
                            transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* =========================================================== */}
        {/*  7. Add/Edit Team Modal                                      */}
        {/* =========================================================== */}
        {activeShowAddModal && (
          <div
            style={{
              position: 'fixed' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: tokens.overlay?.medium,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => handleModalToggle(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                ...cardBase,
                width: 480,
                maxHeight: '80%',
                overflow: 'auto',
                backgroundColor: tokens.colors.common.white,
                ...(isGlass && tokens.glass
                  ? {
                      backdropFilter: tokens.glass.blur,
                      WebkitBackdropFilter: tokens.glass.blur,
                      backgroundColor: tokens.glass.bg,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
                    }
                  : {}),
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[5],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  Add New Team
                </Text>
                <button
                  onClick={() => handleModalToggle(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: tokens.colors.neutral[400],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontSize: tokens.typography.fontSize.lg,
                    padding: tokens.spacing[1],
                  }}
                >
                  &#x2715;
                </button>
              </div>

              {/* Form fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                {/* Team name */}
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                      display: 'block',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    Team Name
                  </Text>
                  <div
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    e.g. Engineering Recruiting
                  </div>
                </div>

                {/* Team code */}
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                      display: 'block',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    Team Code
                  </Text>
                  <div
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    e.g. ENG-REC
                  </div>
                </div>

                {/* Lead selector */}
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                      display: 'block',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    Team Lead
                  </Text>
                  <div
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    Select team lead...
                    <span>&#9662;</span>
                  </div>
                </div>

                {/* Specializations tags */}
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                      display: 'block',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    Specializations
                  </Text>
                  <div
                    style={{
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      display: 'flex',
                      flexWrap: 'wrap' as const,
                      gap: tokens.spacing[1],
                      minHeight: 36,
                    }}
                  >
                    {['Engineering', 'Product', 'Design'].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          ...createBadgeStyle(tokens, 'primary'),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                        }}
                      >
                        {tag}
                        <span style={{ cursor: 'pointer', fontSize: tokens.typography.fontSize.xs }}>
                          &#x2715;
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capacity input */}
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                      display: 'block',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    Max Capacity
                  </Text>
                  <div
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      backgroundColor: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                    }}
                  >
                    e.g. 50
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: tokens.spacing[2],
                  marginTop: tokens.spacing[6],
                  paddingTop: tokens.spacing[4],
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                <button
                  onClick={() => handleModalToggle(false)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    ...hoverStyle,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleModalToggle(false);
                    onAddTeam?.();
                  }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    ...hoverStyle,
                  }}
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        )}
      </Box>
    );
  },
});
