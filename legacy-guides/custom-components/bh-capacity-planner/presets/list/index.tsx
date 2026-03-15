'use client';

/**
 * BhCapacityPlanner - List Preset
 * Tabular view of recruiter capacity with sortable columns.
 */

import { useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhCapacityPlannerProps, RecruiterCapacity, CapacitySummary } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

function getStatusColor(status: string, tokens: DesignTokens): string {
  switch (status) {
    case 'overloaded': return tokens.colors.errorScale[500];
    case 'optimal': return tokens.colors.successScale[500];
    case 'underutilized': return tokens.colors.warningScale[500];
    default: return tokens.colors.neutral[500];
  }
}

function getStatusBg(status: string, tokens: DesignTokens): string {
  switch (status) {
    case 'overloaded': return tokens.colors.errorScale[50];
    case 'optimal': return tokens.colors.successScale[50];
    case 'underutilized': return tokens.colors.warningScale[50];
    default: return tokens.colors.neutral[50];
  }
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

export const ListBhCapacityPlanner = createPreset<BhCapacityPlannerProps>({
  name: 'BhCapacityPlanner.List',
  render: ({ primitives, props, tokens }: PresetContext<BhCapacityPlannerProps>) => {
    const { Box, Text } = primitives;

    const {
      recruiters: rawRecruiters = [],
      suggestions: rawSuggestions = [],
      summary: rawSummary = {},
      selectedRecruiter,
      onRecruiterSelect,
      onAcceptSuggestion,
      className,
      style,
    } = props;

    const recruiters = Array.isArray(rawRecruiters) ? rawRecruiters : [];
    const suggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];
    const summary = Array.isArray(rawSummary) ? rawSummary : ({} as Partial<CapacitySummary>);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const personalityTypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    const handleRecruiterClick = useCallback((id: string) => {
      const isSelected = selectedRecruiter === id;
      onRecruiterSelect?.(isSelected ? null : id);
    }, [selectedRecruiter, onRecruiterSelect]);

    const handleAcceptSuggestion = useCallback((fromId: string, toId: string) => {
      onAcceptSuggestion?.(fromId, toId);
    }, [onAcceptSuggestion]);

    const COLUMNS = ['Recruiter', 'Department', 'Assigned', 'Capacity', 'Utilization', 'Positions', 'Candidates', 'Status'];

    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[6],
          padding: tokens.spacing[6],
          minHeight: '100%',
          width: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...(isGlass && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur } : {}),
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Summary */}
        {summary && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4] }}>
            {[
              { label: 'Recruiters', value: String(summary.totalRecruiters) },
              { label: 'Avg Utilization', value: formatPercent((summary.avgUtilization ?? 0)) },
              { label: 'Overloaded', value: String(summary.overloadedCount) },
              { label: 'Underutilized', value: String(summary.underutilizedCount) },
              { label: 'Open Reqs', value: String(summary.totalOpenReqs) },
            ].map((stat, idx) => (
              <Box key={stat.label} style={{ ...animStyle(idx), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...cardBase, padding: tokens.spacing[4], textAlign: 'center' as const, ...createEntranceAnimation(tokens, { index: idx }).animate }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {/* Table */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <Text style={{ ...sectionHeader, fontWeight: personalityTypo.headingWeight, letterSpacing: personalityTypo.headingLetterSpacing }}>Capacity Overview</Text>
          {recruiters.length > 0 ? (
            <Box style={{ overflowX: 'auto' as const }} role="table" aria-label="Recruiter capacity overview">
              {/* Table Header */}
              <Box role="row" style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 80px 80px 140px 80px 100px 120px',
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                {COLUMNS.map((col) => (
                  <Box
                    key={col}
                    role="columnheader"
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      textAlign: 'left' as const,
                    }}
                  >
                    <Text style={{
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.xs,
                      textTransform: personalityTypo.labelTransform,
                      letterSpacing: personalityTypo.labelLetterSpacing,
                    }}>
                      {col}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Table Body */}
              {recruiters.map((rec, i) => {
                const isSelected = selectedRecruiter === rec.id;
                const statusColor = getStatusColor((rec.status ?? ''), tokens);
                const statusBg = getStatusBg((rec.status ?? ''), tokens);

                return (
                  <Box
                    key={rec.id}
                    role="row"
                    tabIndex={0}
                    aria-label={`${rec.name}, ${rec.department}, ${rec.status} at ${rec.utilizationPercent}% utilization`}
                    aria-selected={isSelected}
                    onClick={() => handleRecruiterClick((rec.id ?? ''))}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleRecruiterClick((rec.id ?? '')); }}
                    style={{
                      ...animStyle(i),
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 80px 80px 140px 80px 100px 120px',
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                      cursor: 'pointer',
                      transition: `background-color ${tokens.motion.hover}`,
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e: any) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                    }}
                    onMouseLeave={(e: any) => {
                      e.currentTarget.style.backgroundColor = isSelected ? tokens.colors.primaryScale[50] : 'transparent';
                    }}
                  >
                    {/* Recruiter */}
                    <Box role="cell" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{
                          width: 28,
                          height: 28,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>
                            {(rec.name || '').charAt(0)}
                          </Text>
                        </Box>
                        <Text style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], fontSize: tokens.typography.fontSize.sm }}>
                          {rec.name}
                        </Text>
                      </Box>
                    </Box>
                    {/* Department */}
                    <Box role="cell" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Text style={{ color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.sm }}>
                        {rec.department}
                      </Text>
                    </Box>
                    {/* Assigned */}
                    <Box role="cell" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], fontSize: tokens.typography.fontSize.sm }}>
                        {rec.currentAssignments}
                      </Text>
                    </Box>
                    {/* Capacity */}
                    <Box role="cell" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Text style={{ color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.sm }}>
                        {rec.maxCapacity}
                      </Text>
                    </Box>
                    {/* Utilization */}
                    <Box role="cell" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{ width: 60, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' }} role="progressbar" aria-valuenow={rec.utilizationPercent} aria-valuemin={0} aria-valuemax={150} aria-label={`${rec.utilizationPercent}% utilization`}>
                          <Box style={{ width: `${Math.min((rec.utilizationPercent ?? 0), 100)}%`, height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: statusColor }} />
                        </Box>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: statusColor, fontWeight: tokens.typography.fontWeight.semibold }}>
                          {formatPercent((rec.utilizationPercent ?? 0))}
                        </Text>
                      </Box>
                    </Box>
                    {/* Positions */}
                    <Box role="cell" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Text style={{ color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm }}>
                        {rec.activePositions}
                      </Text>
                    </Box>
                    {/* Candidates */}
                    <Box role="cell" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Text style={{ color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm }}>
                        {rec.activeCandidates}
                      </Text>
                    </Box>
                    {/* Status */}
                    <Box role="cell" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                      <Box style={{
                        display: 'inline-block',
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: badgeR,
                        backgroundColor: statusBg,
                        textTransform: 'capitalize' as const,
                      }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: statusColor }}>
                          {rec.status}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
              <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                No recruiter data available
              </Text>
            </Box>
          )}
        </Box>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader, fontWeight: personalityTypo.headingWeight, letterSpacing: personalityTypo.headingLetterSpacing }}>Suggested Rebalancing</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {suggestions.map((sug, i) => (
                <Box
                  key={i}
                  style={{
                    ...animStyle(i),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                    backgroundColor: tokens.colors.infoScale[50],
                  }}
                >
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                      {sug.fromRecruiterName} {'\u2192'} {sug.toRecruiterName} ({sug.candidateCount} candidates)
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {sug.reason}
                    </Text>
                  </Box>
                  {onAcceptSuggestion && (
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Accept: move ${sug.candidateCount} candidates from ${sug.fromRecruiterName} to ${sug.toRecruiterName}`}
                      onClick={() => handleAcceptSuggestion((sug.fromRecruiterId ?? ''), (sug.toRecruiterId ?? ''))}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleAcceptSuggestion((sug.fromRecruiterId ?? ''), (sug.toRecruiterId ?? '')); }}
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[500],
                        cursor: 'pointer',
                        transition: `background-color ${tokens.motion.hover}`,
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.common.white }}>
                        Accept
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
