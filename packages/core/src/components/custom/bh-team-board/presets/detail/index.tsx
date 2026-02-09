'use client';

/**
 * BhTeamBoard - Detail Preset
 * Split panel focused view with team list on left and full detail on right.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
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
/*  Helper: progress ring                                              */
/* ------------------------------------------------------------------ */
function progressRing(value: number, max: number, radius: number) {
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / (max || 1), 1);
  const dashArray = `${pct * circumference} ${circumference}`;
  return { circumference, dashArray, pct };
}

function clampPct(val: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max((val / total) * 100, 0), 100);
}

/* ------------------------------------------------------------------ */
/*  Detail Preset                                                      */
/* ------------------------------------------------------------------ */
export const DetailBhTeamBoard = createPreset<BhTeamBoardProps>({
  name: 'BhTeamBoard.Detail',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhTeamBoardProps>) => {
    const { Box, Text } = primitives;

    const {
      teams = [],
      selectedTeam: controlledSelectedTeam,
      onTeamSelect,
      members = [],
      teamKpis,
      sprintData,
      targets = [],
      onAddTeam,
      onEditTeam,
      onAddMember,
      onRemoveMember,
      onMemberRoleChange,
      onMemberEdit,
      targetPeriod: controlledTargetPeriod,
      onTargetPeriodChange,
      className,
      style,
    } = props;

    const [internalSelectedTeam, setInternalSelectedTeam] = useState<string | null>(
      teams.length > 0 ? teams[0].id : null
    );
    const [internalTargetPeriod, setInternalTargetPeriod] = useState<'monthly' | 'quarterly'>('monthly');

    const activeSelectedTeam = controlledSelectedTeam !== undefined ? controlledSelectedTeam : internalSelectedTeam;
    const activeTargetPeriod = controlledTargetPeriod !== undefined ? controlledTargetPeriod : internalTargetPeriod;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
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

    const handleTargetPeriodChange = (period: 'monthly' | 'quarterly') => {
      setInternalTargetPeriod(period);
      onTargetPeriodChange?.(period);
    };

    const roleColorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'secondary'> = {
      'Lead': 'primary',
      'Senior': 'success',
      'Mid': 'info',
      'Junior': 'warning',
      'Intern': 'secondary',
    };

    /* ------------------------------------------------------------------ */
    /*  Render                                                             */
    /* ------------------------------------------------------------------ */
    return (
      <Box
        className={className}
        style={{
          height: '100%',
          display: 'flex',
          backgroundColor: tokens.colors.neutral[50],
          ...style,
        }}
      >
        {/* =========================================================== */}
        {/*  Left Panel: Team List                                       */}
        {/* =========================================================== */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...(isGlass && tokens.glass
              ? {
                  backdropFilter: tokens.glass.blurSm,
                  WebkitBackdropFilter: tokens.glass.blurSm,
                  backgroundColor: tokens.glass.bgLight,
                  borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.borderLight}`,
                }
              : {}),
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: tokens.spacing[4],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
                marginBottom: tokens.spacing[2],
              }}
            >
              Teams
            </Text>
            <button
              onClick={() => onAddTeam?.()}
              style={{
                width: '100%',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} dashed ${tokens.colors.primaryScale[300]}`,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                ...hoverStyle,
              }}
            >
              + New Team
            </button>
          </div>

          {/* Team list */}
          <div style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[2] }}>
            {teams.map((team) => {
              const isSelected = activeSelectedTeam === team.id;
              const capacityPct = clampPct(team.capacityUsed, team.capacityTotal);

              return (
                <div
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    marginBottom: tokens.spacing[1],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    backgroundColor: isSelected
                      ? tokens.colors.primaryScale[50]
                      : 'transparent',
                    border: isSelected
                      ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                      : `${tokens.surface.borderWidth} solid transparent`,
                    ...hoverStyle,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor =
                        tokens.colors.neutral[50];
                    }
                    e.currentTarget.style.transform = tokens.motion.transform;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    }
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                    <div
                      style={{
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.full,
                        overflow: 'hidden',
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tokens.colors.primaryScale[700],
                        fontSize: tokens.typography.fontSize.xs,
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
                        team.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[900],
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
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
                        {team.memberCount} members
                      </Text>
                    </div>
                  </div>
                  {/* Mini capacity bar */}
                  <div
                    style={{
                      height: 4,
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${capacityPct}%`,
                        height: '100%',
                        backgroundColor:
                          capacityPct >= 90
                            ? tokens.colors.errorScale[500]
                            : capacityPct >= 70
                            ? tokens.colors.warningScale[500]
                            : tokens.colors.successScale[500],
                        borderRadius: tokens.borderRadius.full,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================== */}
        {/*  Right Panel: Team Detail                                     */}
        {/* =========================================================== */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: tokens.spacing[6],
          }}
        >
          {selectedTeamData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
              {/* Detail header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <div
                    style={{
                      width: tokens.spacing[12],
                      height: tokens.spacing[12],
                      borderRadius: tokens.borderRadius.lg,
                      overflow: 'hidden',
                      backgroundColor: tokens.colors.primaryScale[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tokens.colors.primaryScale[700],
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                    }}
                  >
                    {selectedTeamData.leadAvatar ? (
                      <img
                        src={selectedTeamData.leadAvatar}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                      />
                    ) : (
                      selectedTeamData.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                      }}
                    >
                      {selectedTeamData.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      Lead: {selectedTeamData.leadName} &middot; {selectedTeamData.memberCount} members &middot; {selectedTeamData.activeJobs} active jobs
                    </Text>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  <button
                    onClick={() => onEditTeam?.(selectedTeamData.id)}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[700],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      ...hoverStyle,
                    }}
                  >
                    Edit Team
                  </button>
                  <button
                    onClick={() => onAddMember?.()}
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
                    + Add Member
                  </button>
                </div>
              </div>

              {/* Stats cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4] }}>
                {[
                  {
                    label: 'Performance',
                    value: `${selectedTeamData.performanceScore}%`,
                    color: selectedTeamData.performanceScore >= 80 ? 'success' : selectedTeamData.performanceScore >= 50 ? 'warning' : 'error',
                  },
                  {
                    label: 'Capacity',
                    value: `${selectedTeamData.capacityUsed}/${selectedTeamData.capacityTotal}`,
                    color: 'primary',
                  },
                  {
                    label: 'Active Jobs',
                    value: `${selectedTeamData.activeJobs}`,
                    color: 'info',
                  },
                  {
                    label: 'SLA',
                    value: teamKpis ? `${teamKpis.slaCompliance}%` : '--',
                    color: 'warning',
                  },
                ].map((stat) => {
                  const scaleKey = `${stat.color}Scale` as keyof typeof tokens.colors;
                  const scale = tokens.colors[scaleKey] as any;
                  return (
                    <div
                      key={stat.label}
                      style={{
                        ...cardBase,
                        backgroundColor: scale?.[50] || tokens.colors.neutral[50],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${scale?.[200] || tokens.colors.neutral[200]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: scale?.[700] || tokens.colors.neutral[700],
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {stat.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xl,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: scale?.[800] || tokens.colors.neutral[800],
                        }}
                      >
                        {stat.value}
                      </Text>
                    </div>
                  );
                })}
              </div>

              {/* Members list */}
              <div style={cardBase}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[4],
                  }}
                >
                  Team Members
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {members.map((member) => {
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
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[3],
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          ...hoverStyle,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = tokens.colors.neutral[50];
                          e.currentTarget.style.transform = tokens.motion.transform;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <div
                          style={{
                            width: tokens.spacing[10],
                            height: tokens.spacing[10],
                            borderRadius: tokens.borderRadius.full,
                            overflow: 'hidden',
                            backgroundColor: tokens.colors.secondaryScale[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: tokens.colors.secondaryScale[700],
                            fontSize: tokens.typography.fontSize.sm,
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
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                              display: 'block',
                            }}
                          >
                            {member.name}
                          </Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                            <span style={createBadgeStyle(tokens, roleColorMap[member.role] || 'info')}>
                              {member.role}
                            </span>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                              {member.activeJobs} jobs &middot; {member.hires} hires
                            </Text>
                          </div>
                        </div>
                        <div style={{ width: 100 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: 2,
                            }}
                          >
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                              Allocation
                            </Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                              {member.allocationPercent}%
                            </Text>
                          </div>
                          <div
                            style={{
                              height: 4,
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
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMemberEdit?.(member.id);
                            }}
                            style={{
                              width: tokens.spacing[7],
                              height: tokens.spacing[7],
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              backgroundColor: tokens.colors.common.white,
                              color: tokens.colors.neutral[500],
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              fontSize: tokens.typography.fontSize.xs,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              ...hoverStyle,
                            }}
                          >
                            &#x270E;
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveMember?.(member.id);
                            }}
                            style={{
                              width: tokens.spacing[7],
                              height: tokens.spacing[7],
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                              backgroundColor: tokens.colors.errorScale[50],
                              color: tokens.colors.errorScale[500],
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              fontSize: tokens.typography.fontSize.xs,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              ...hoverStyle,
                            }}
                          >
                            &#x2715;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {members.length === 0 && (
                    <div
                      style={{
                        padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
                        textAlign: 'center' as const,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No members assigned.</Text>
                    </div>
                  )}
                </div>
              </div>

              {/* KPI + Velocity section */}
              {teamKpis && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
                  <div style={cardBase}>
                    <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[3] }}>
                      Hires vs Target
                    </Text>
                    {(() => {
                      const radius = 36;
                      const strokeW = 6;
                      const size = (radius + strokeW) * 2;
                      const ring = progressRing(teamKpis.hiresVsTarget.actual, teamKpis.hiresVsTarget.target, radius);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
                          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tokens.colors.successScale[100]} strokeWidth={strokeW} />
                            <circle
                              cx={size / 2}
                              cy={size / 2}
                              r={radius}
                              fill="none"
                              stroke={tokens.colors.successScale[500]}
                              strokeWidth={strokeW}
                              strokeDasharray={ring.dashArray}
                              strokeLinecap="round"
                              transform={`rotate(-90 ${size / 2} ${size / 2})`}
                              style={{ transition: `stroke-dasharray ${tokens.motion.hover}` }}
                            />
                            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fill={tokens.colors.neutral[900]} fontSize={tokens.typography.fontSize.md} fontWeight={tokens.typography.fontWeight.bold}>
                              {Math.round(ring.pct * 100)}%
                            </text>
                          </svg>
                          <div>
                            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
                              {teamKpis.hiresVsTarget.actual}
                            </Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                              of {teamKpis.hiresVsTarget.target} target
                            </Text>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div style={cardBase}>
                    <Text style={{ ...sectionHeader, marginBottom: tokens.spacing[3] }}>
                      Velocity Trend
                    </Text>
                    {teamKpis.velocityTrend.length > 1 && (
                      <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="detail-vel-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={tokens.colors.primaryScale[400]} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={tokens.colors.primaryScale[400]} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polygon
                          points={sparklinePolygonPoints(teamKpis.velocityTrend, 200, 80, 4)}
                          fill="url(#detail-vel-grad)"
                        />
                        <polyline
                          points={sparklinePoints(teamKpis.velocityTrend, 200, 80, 4)}
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
              )}

              {/* Targets */}
              {targets.length > 0 && (
                <div style={cardBase}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                      Targets
                    </Text>
                    <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                      {(['monthly', 'quarterly'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleTargetPeriodChange(p)}
                          style={{
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: activeTargetPeriod === p ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            backgroundColor: activeTargetPeriod === p ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                            color: activeTargetPeriod === p ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: activeTargetPeriod === p ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            textTransform: 'capitalize' as const,
                            ...hoverStyle,
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                    {targets
                      .filter((t) => t.period === activeTargetPeriod || !t.period)
                      .map((target, idx) => {
                        const pct = clampPct(target.current, target.value);
                        const barColor = pct >= 100 ? tokens.colors.successScale[500] : pct >= 70 ? tokens.colors.primaryScale[500] : pct >= 40 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
                        return (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                                {target.metric}
                              </Text>
                              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                                {target.current} / {target.value}
                              </Text>
                            </div>
                            <div style={{ height: 8, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', backgroundColor: barColor, borderRadius: tokens.borderRadius.full, transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: tokens.colors.neutral[400],
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.md }}>
                Select a team from the list to view details.
              </Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
