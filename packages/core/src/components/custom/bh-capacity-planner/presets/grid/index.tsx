'use client';

/**
 * BhCapacityPlanner - Grid Preset
 * Card-based grid showing each recruiter's capacity utilization
 * with SVG ring charts, workload stats, and rebalancing suggestions.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhCapacityPlannerProps, RecruiterCapacity, RebalanceSuggestion, CapacitySummary } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  LayoutGrid, Users, TrendingUp, AlertTriangle, AlertOctagon,
  Briefcase, ArrowRight, CheckCircle2, UserCircle, Zap,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

function getStatusConfig(status: string, t: DesignTokens) {
  switch (status) {
    case 'overloaded': return { label: 'Overloaded', color: t.colors.errorScale[600], bg: t.colors.errorScale[50], border: t.colors.errorScale[200] };
    case 'optimal': return { label: 'Optimal', color: t.colors.successScale[600], bg: t.colors.successScale[50], border: t.colors.successScale[200] };
    case 'underutilized': return { label: 'Underutilized', color: t.colors.warningScale[600], bg: t.colors.warningScale[50], border: t.colors.warningScale[200] };
    default: return { label: status, color: t.colors.neutral[500], bg: t.colors.neutral[50], border: t.colors.neutral[200] };
  }
}

function getRingColor(status: string, t: DesignTokens) {
  switch (status) {
    case 'overloaded': return t.colors.errorScale[500];
    case 'optimal': return t.colors.successScale[500];
    case 'underutilized': return t.colors.warningScale[500];
    default: return t.colors.neutral[400];
  }
}

/* ---------------------------------------------------------------------------
 * ScoreRing Sub-component
 * -------------------------------------------------------------------------*/

function UtilizationRing({ percent, status, t }: { percent: number; status: string; t: DesignTokens }) {
  const size = 76;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(percent, 150);
  const progress = (Math.min(clamped, 100) / 100) * circ;
  const color = getRingColor(status, t);
return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${progress} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{ transition: `stroke-dasharray ${t.personality.animation.entranceDuration}ms ease` }}
      />
      {percent > 100 && (
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={t.colors.errorScale[300]} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${((clamped - 100) / 100) * circ} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          opacity={0.4}
          style={{ transition: `stroke-dasharray ${t.personality.animation.entranceDuration}ms ease` }}
        />
      )}
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={14} fontWeight={700}>
        {percent}%
      </text>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const GridBhCapacityPlanner = createPreset<BhCapacityPlannerProps>({
  name: 'BhCapacityPlanner.Grid',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCapacityPlannerProps>) => {
    const { Box, Text } = primitives;
    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const isGlass = t.surface.useGlass && !!t.glass;

    const {
      recruiters: rawRecruiters = [],
      suggestions: rawSuggestions = [],
      summary: rawSummary = {},
      selectedRecruiter: controlledSelected,
      onRecruiterSelect,
      onAcceptSuggestion,
      className, style,
    } = props;

    const recruiters = Array.isArray(rawRecruiters) ? rawRecruiters : [];
    const suggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];
    const summary = Array.isArray(rawSummary) ? rawSummary : ({} as Partial<CapacitySummary>);

    const [internalSelected, setInternalSelected] = useState<string | null>(null);
    const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;
    const handleSelect = useCallback((id: string | null) => {
      if (controlledSelected === undefined) setInternalSelected(id);
      onRecruiterSelect?.(id);
    }, [controlledSelected, onRecruiterSelect]);
    const divider = useMemo(() => createDividerStyle(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md', glass: isGlass }),
        display: 'flex', flexDirection: 'column' as const, height: '100%', width: '100%',
        backgroundColor: t.colors.neutral[50], overflow: 'hidden',
        ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur } : {}),
        ...style,
      }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
            <LayoutGrid size={16} style={{ color: t.colors.primaryScale[500] }} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: personalityTypo.headingWeight, color: t.colors.neutral[900], letterSpacing: personalityTypo.headingLetterSpacing }}>
              Recruiter Capacity
            </Text>
          </Box>

          {/* Summary Metrics */}
          {summary && (
            <Box style={{ display: 'flex', gap: t.spacing[5], flexWrap: 'wrap' as const }}>
              {[
                { label: 'Recruiters', value: summary.totalRecruiters, icon: Users, color: t.colors.primaryScale[600] },
                { label: 'Avg Utilization', value: `${summary.avgUtilization}%`, icon: TrendingUp, color: t.colors.infoScale[600] },
                { label: 'Overloaded', value: summary.overloadedCount, icon: AlertOctagon, color: t.colors.errorScale[600] },
                { label: 'Underutilized', value: summary.underutilizedCount, icon: AlertTriangle, color: t.colors.warningScale[600] },
                { label: 'Open Reqs', value: summary.totalOpenReqs, icon: Briefcase, color: t.colors.neutral[700] },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <Box key={m.label} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[2] }}>
                    <Icon size={14} style={{ color: m.color }} />
                    <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: m.color }}>{m.value}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{m.label}</Text>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Box style={{ flex: 1, overflowY: 'auto', padding: t.spacing[6] }}>
          {/* Recruiter Grid */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
            {recruiters.map(rec => {
              const isSelected = selected === rec.id;
              const sc = getStatusConfig((rec.status ?? ''), t);

              return (
                <Box key={rec.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${rec.name}, ${rec.department}, ${sc.label} at ${rec.utilizationPercent}%`}
                  aria-pressed={isSelected}
                  onClick={() => handleSelect((isSelected ? null : rec.id ?? null))}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleSelect((isSelected ? null : rec.id ?? null)); }}
                  style={{
                  ...createCardStyle(t, { elevation: 'sm' }),
                  ...createEntranceAnimation(t, { index: recruiters.indexOf(rec) }).animate,
                  padding: t.spacing[5], backgroundColor: t.colors.common.white,
                  border: `2px solid ${isSelected ? sc.color : t.colors.neutral[100]}`,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                  display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
                }}>
                  {/* Avatar + Ring */}
                  <Box style={{ position: 'relative', marginBottom: t.spacing[3] }}>
                    <UtilizationRing percent={rec.utilizationPercent ?? 0} status={rec.status ?? ''} t={t} />
                    <Box style={{
                      position: 'absolute', top: 14, left: 14, width: 48, height: 48,
                      borderRadius: t.borderRadius.full, overflow: 'hidden',
                      backgroundColor: t.colors.primaryScale[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {rec.avatar ? (
                        <img src={rec.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[700] }}>
                          {(rec.name ?? '').split(' ').map(n => n[0]).join('')}
                        </Text>
                      )}
                    </Box>
                  </Box>

                  {/* Name + Department */}
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800], textAlign: 'center' }}>
                    {rec.name}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[3] }}>
                    {rec.department}
                  </Text>

                  {/* Stats Row */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: t.spacing[3] }}>
                    {[
                      { label: 'Assigned', value: `${rec.currentAssignments}/${rec.maxCapacity}` },
                      { label: 'Positions', value: rec.activePositions },
                      { label: 'Candidates', value: rec.activeCandidates },
                    ].map(s => (
                      <Box key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center', flex: 1 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{s.value}</Text>
                        <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>{s.label}</Text>
                      </Box>
                    ))}
                  </Box>

                  {/* Avg Time */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[3] }}>
                    <Zap size={10} style={{ color: t.colors.neutral[400] }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {rec.avgTimePerCandidate}h avg/candidate
                    </Text>
                  </Box>

                  {/* Status Badge */}
                  <Box style={{
                    padding: `2px ${t.spacing[3]}px`, borderRadius: br,
                    backgroundColor: sc.bg, border: `1px solid ${sc.border}`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: sc.color }}>
                      {sc.label}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Rebalancing Suggestions */}
          {suggestions.length > 0 && (
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: t.spacing[5], backgroundColor: t.colors.common.white,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <Zap size={15} style={{ color: t.colors.warningScale[500] }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Rebalancing Suggestions ({suggestions.length})
                </Text>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
                {suggestions.map((sug, i) => (
                  <Box key={i} style={{
                    ...animStyle(i),
                    padding: `${t.spacing[4]}px ${t.spacing[4]}px`,
                    borderRadius: t.borderRadius.lg,
                    border: `1px solid ${t.colors.warningScale[200]}`,
                    backgroundColor: t.colors.warningScale[50],
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Box style={{ flex: 1 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                          Move
                        </Text>
                        <Box style={{
                          padding: `0 ${t.spacing[2]}px`, borderRadius: br,
                          backgroundColor: t.colors.infoScale[50], border: `1px solid ${t.colors.infoScale[200]}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.infoScale[700] }}>
                            {sug.candidateCount} candidates
                          </Text>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>from</Text>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{sug.fromRecruiterName}</Text>
                        <ArrowRight size={14} style={{ color: t.colors.neutral[400] }} />
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{sug.toRecruiterName}</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], lineHeight: 1.5 }}>
                        {sug.reason}
                      </Text>
                    </Box>
                    {onAcceptSuggestion && (
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={`Accept suggestion: move ${sug.candidateCount} candidates from ${sug.fromRecruiterName} to ${sug.toRecruiterName}`}
                        onClick={(e: any) => { e.stopPropagation(); onAcceptSuggestion((sug.fromRecruiterId ?? ''), (sug.toRecruiterId ?? '')); }}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onAcceptSuggestion((sug.fromRecruiterId ?? ''), (sug.toRecruiterId ?? '')); }}
                        style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[1],
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                        backgroundColor: t.colors.primaryScale[500], cursor: 'pointer',
                        transition: `background-color ${t.motion.hover}`, flexShrink: 0, marginLeft: t.spacing[4],
                      }}>
                        <CheckCircle2 size={12} style={{ color: t.colors.common.white }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>Accept</Text>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
