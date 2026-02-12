'use client';

/**
 * BhCapacityPlanner - List Preset
 * Tabular view of recruiter capacity with sortable columns.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
} from '../../../helpers';
import type { BhCapacityPlannerProps, RecruiterCapacity, CapacitySummary } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

const MOCK_RECRUITERS: RecruiterCapacity[] = [
  { id: 'r-1', name: 'Sarah Johnson', department: 'Engineering', currentAssignments: 14, maxCapacity: 12, utilizationPercent: 117, activePositions: 4, activeCandidates: 14, avgTimePerCandidate: 3.2, status: 'overloaded' },
  { id: 'r-2', name: 'Michael Chen', department: 'Engineering', currentAssignments: 9, maxCapacity: 12, utilizationPercent: 75, activePositions: 3, activeCandidates: 9, avgTimePerCandidate: 4.1, status: 'optimal' },
  { id: 'r-3', name: 'Emily Rodriguez', department: 'Product', currentAssignments: 11, maxCapacity: 12, utilizationPercent: 92, activePositions: 3, activeCandidates: 11, avgTimePerCandidate: 3.8, status: 'optimal' },
  { id: 'r-4', name: 'James Kim', department: 'Design', currentAssignments: 4, maxCapacity: 10, utilizationPercent: 40, activePositions: 2, activeCandidates: 4, avgTimePerCandidate: 5.0, status: 'underutilized' },
];

const MOCK_SUMMARY: CapacitySummary = {
  totalRecruiters: 4, avgUtilization: 81, overloadedCount: 1, underutilizedCount: 1, totalOpenReqs: 12,
};

function getStatusColor(status: string, tokens: DesignTokens): string {
  switch (status) {
    case 'overloaded': return tokens.colors.errorScale[500];
    case 'optimal': return tokens.colors.successScale[500];
    case 'underutilized': return tokens.colors.warningScale[500];
    default: return tokens.colors.neutral[500];
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
      recruiters = MOCK_RECRUITERS,
      suggestions = [],
      summary = MOCK_SUMMARY,
      selectedRecruiter,
      onRecruiterSelect,
      onAcceptSuggestion,
      className,
      style,
    } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[6],
          padding: tokens.spacing[6],
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Summary */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4] }}>
            {[
              { label: 'Recruiters', value: String(summary.totalRecruiters) },
              { label: 'Avg Utilization', value: formatPercent(summary.avgUtilization) },
              { label: 'Overloaded', value: String(summary.overloadedCount) },
              { label: 'Underutilized', value: String(summary.underutilizedCount) },
              { label: 'Open Reqs', value: String(summary.totalOpenReqs) },
            ].map((stat) => (
              <Box key={stat.label} style={{ ...cardBase, padding: tokens.spacing[4], textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg || '1.125rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {stat.label}
                </Text>
              </Box>
            ))}
          </div>
        )}

        {/* Table */}
        <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
          <Text style={{ ...sectionHeader }}>Capacity Overview</Text>
          {recruiters.length > 0 ? (
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: tokens.typography.fontSize.sm }}>
                <thead>
                  <tr style={{ borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    {['Recruiter', 'Department', 'Assigned', 'Capacity', 'Utilization', 'Positions', 'Candidates', 'Status'].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          textAlign: 'left' as const,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[500],
                          fontSize: tokens.typography.fontSize.xs,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recruiters.map((rec) => {
                    const isSelected = selectedRecruiter === rec.id;
                    const statusColor = getStatusColor(rec.status, tokens);

                    return (
                      <tr
                        key={rec.id}
                        onClick={() => onRecruiterSelect?.(isSelected ? null : rec.id)}
                        style={{
                          ...hoverStyle,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isSelected ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50])}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? tokens.colors.primaryScale[50] : 'transparent')}
                      >
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: tokens.colors.primaryScale[100],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.primaryScale[700],
                                flexShrink: 0,
                              }}
                            >
                              {rec.name.charAt(0)}
                            </div>
                            <Text style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                              {rec.name}
                            </Text>
                          </div>
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                          {rec.department}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                          {rec.currentAssignments}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[600] }}>
                          {rec.maxCapacity}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <div style={{ width: 60, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(rec.utilizationPercent, 100)}%`, height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: statusColor }} />
                            </div>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: statusColor, fontWeight: tokens.typography.fontWeight.semibold }}>
                              {formatPercent(rec.utilizationPercent)}
                            </Text>
                          </div>
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[700] }}>
                          {rec.activePositions}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, color: tokens.colors.neutral[700] }}>
                          {rec.activeCandidates}
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px` }}>
                          <div
                            style={{
                              display: 'inline-block',
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: statusColor + '15',
                              color: statusColor,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              textTransform: 'capitalize' as const,
                            }}
                          >
                            {rec.status}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No recruiter data available
            </div>
          )}
        </Box>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <Box style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ ...sectionHeader }}>Suggested Rebalancing</Text>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              {suggestions.map((sug, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                    backgroundColor: tokens.colors.infoScale[50],
                  }}
                >
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                      {sug.fromRecruiterName} {'\u2192'} {sug.toRecruiterName} ({sug.candidateCount} candidates)
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {sug.reason}
                    </Text>
                  </div>
                  {onAcceptSuggestion && (
                    <div
                      onClick={() => onAcceptSuggestion(sug.fromRecruiterId, sug.toRecruiterId)}
                      style={{
                        ...hoverStyle,
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[500],
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}
                    >
                      Accept
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Box>
        )}
      </Box>
    );
  },
});
