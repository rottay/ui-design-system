'use client';

/**
 * BhClientPortal - Operational Preset
 * Detailed tabular operations view with positions table, interview schedule,
 * and compact metrics. Slite-inspired warm design with clean data density.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius } from '../../../helpers';
import type { BhClientPortalProps, ClientPosition, ClientInterview } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Table, Briefcase, Users, Clock, TrendingUp, Calendar, Award,
  ArrowUpDown, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_CLIENT = {
  name: 'Acme Corporation',
  contactName: 'Jennifer Walsh',
  contactEmail: 'jennifer.walsh@acme.com',
};

const DEFAULT_METRICS = {
  totalOpenPositions: 8,
  totalActiveCandidates: 47,
  avgTimeToFill: 34,
  fillRate: 78,
  upcomingInterviews: 12,
  offersExtended: 3,
};

const DEFAULT_POSITIONS: ClientPosition[] = [
  { id: 'p-1', title: 'Senior Frontend Engineer', department: 'Engineering', status: 'open', totalCandidates: 18, activeCandidates: 12, interviewsScheduled: 4, daysOpen: 21, targetHireDate: '2026-03-15' },
  { id: 'p-2', title: 'Product Manager', department: 'Product', status: 'open', totalCandidates: 14, activeCandidates: 8, interviewsScheduled: 3, daysOpen: 35, targetHireDate: '2026-03-01' },
  { id: 'p-3', title: 'Staff Backend Engineer', department: 'Engineering', status: 'open', totalCandidates: 9, activeCandidates: 6, interviewsScheduled: 2, daysOpen: 14 },
  { id: 'p-4', title: 'UX Designer', department: 'Design', status: 'on_hold', totalCandidates: 7, activeCandidates: 3, interviewsScheduled: 0, daysOpen: 45 },
  { id: 'p-5', title: 'Data Analyst', department: 'Analytics', status: 'filled', totalCandidates: 22, activeCandidates: 0, interviewsScheduled: 0, daysOpen: 28 },
  { id: 'p-6', title: 'DevOps Engineer', department: 'Engineering', status: 'open', totalCandidates: 11, activeCandidates: 7, interviewsScheduled: 2, daysOpen: 18, targetHireDate: '2026-04-01' },
];

const DEFAULT_INTERVIEWS: ClientInterview[] = [
  { id: 'iv-1', candidateName: 'Sarah Johnson', positionTitle: 'Senior Frontend Engineer', date: '2026-02-12', time: '10:00 AM', type: 'video', status: 'scheduled' },
  { id: 'iv-2', candidateName: 'Michael Chen', positionTitle: 'Product Manager', date: '2026-02-12', time: '2:00 PM', type: 'panel', status: 'scheduled' },
  { id: 'iv-3', candidateName: 'Emily Rodriguez', positionTitle: 'Senior Frontend Engineer', date: '2026-02-13', time: '11:00 AM', type: 'onsite', status: 'scheduled' },
  { id: 'iv-4', candidateName: 'James Kim', positionTitle: 'Staff Backend Engineer', date: '2026-02-14', time: '3:00 PM', type: 'phone', status: 'scheduled' },
  { id: 'iv-5', candidateName: 'Anna Kowalski', positionTitle: 'DevOps Engineer', date: '2026-02-14', time: '10:00 AM', type: 'video', status: 'scheduled' },
  { id: 'iv-6', candidateName: 'David Thompson', positionTitle: 'Product Manager', date: '2026-02-10', time: '9:00 AM', type: 'video', status: 'completed' },
];

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

function getStatusConfig(status: string, t: DesignTokens) {
  switch (status) {
    case 'open': return { label: 'Open', color: t.colors.successScale[600], bg: t.colors.successScale[50], border: t.colors.successScale[200] };
    case 'on_hold': return { label: 'On Hold', color: t.colors.warningScale[600], bg: t.colors.warningScale[50], border: t.colors.warningScale[200] };
    case 'filled': return { label: 'Filled', color: t.colors.primaryScale[600], bg: t.colors.primaryScale[50], border: t.colors.primaryScale[200] };
    case 'cancelled': return { label: 'Cancelled', color: t.colors.neutral[500], bg: t.colors.neutral[100], border: t.colors.neutral[200] };
    default: return { label: status, color: t.colors.neutral[500], bg: t.colors.neutral[100], border: t.colors.neutral[200] };
  }
}

function getInterviewStatusColor(status: string, t: DesignTokens) {
  switch (status) {
    case 'scheduled': return t.colors.primaryScale[600];
    case 'completed': return t.colors.successScale[600];
    case 'cancelled': return t.colors.neutral[400];
    default: return t.colors.neutral[500];
  }
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const OperationalBhClientPortal = createPreset<BhClientPortalProps>({
  name: 'BhClientPortal.Operational',
  render: ({ primitives, props, tokens: t }: PresetContext<BhClientPortalProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);

    const {
      client = DEFAULT_CLIENT,
      positions = DEFAULT_POSITIONS,
      interviews = DEFAULT_INTERVIEWS,
      metrics = DEFAULT_METRICS,
      selectedPosition: controlledSelected,
      onPositionSelect,
      className, style,
    } = props;

    const [internalSelected, setInternalSelected] = useState<string | null>(null);
    const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;
    const handleSelect = (id: string | null) => {
      if (controlledSelected === undefined) setInternalSelected(id);
      onPositionSelect?.(id);
    };

    const thStyle = {
      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
      textAlign: 'left' as const,
      fontWeight: t.typography.fontWeight.semibold,
      color: t.colors.neutral[500],
      fontSize: t.typography.fontSize.xs,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      borderBottom: `1px solid ${t.colors.neutral[200]}`,
    };

    const tdStyle = {
      padding: `${t.spacing[3]}px ${t.spacing[3]}px`,
      fontSize: t.typography.fontSize.sm,
      color: t.colors.neutral[700],
      borderBottom: `1px solid ${t.colors.neutral[50]}`,
    };

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.neutral[50], overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            {client && (
              <>
                <Box style={{
                  width: 36, height: 36, borderRadius: t.borderRadius.lg, flexShrink: 0,
                  backgroundColor: t.colors.primaryScale[100], display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[700] }}>
                    {client.name.charAt(0)}
                  </Text>
                </Box>
                <Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Table size={14} style={{ color: t.colors.neutral[400] }} />
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                      {client.name} · Operations
                    </Text>
                  </Box>
                </Box>
              </>
            )}
          </Box>

          {/* Compact Metrics */}
          {metrics && (
            <Box style={{ display: 'flex', gap: t.spacing[4] }}>
              {[
                { label: 'Open', value: metrics.totalOpenPositions, icon: Briefcase },
                { label: 'Candidates', value: metrics.totalActiveCandidates, icon: Users },
                { label: 'Avg Fill', value: `${metrics.avgTimeToFill}d`, icon: Clock },
                { label: 'Fill Rate', value: `${metrics.fillRate}%`, icon: TrendingUp },
                { label: 'Interviews', value: metrics.upcomingInterviews, icon: Calendar },
                { label: 'Offers', value: metrics.offersExtended, icon: Award },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <Box key={m.label} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Icon size={12} style={{ color: t.colors.neutral[400] }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{m.value}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{m.label}</Text>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Box style={{ flex: 1, overflowY: 'auto', padding: t.spacing[6] }}>
          {/* Positions Table */}
          <Box style={{
            ...createCardStyle(t, { elevation: 'sm' }),
            padding: t.spacing[5], backgroundColor: t.colors.common.white, marginBottom: t.spacing[5],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Briefcase size={15} style={{ color: t.colors.primaryScale[500] }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                Positions Detail ({positions.length})
              </Text>
            </Box>
            {positions.length > 0 ? (
              <Box style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Position', 'Department', 'Status', 'Total', 'Active', 'Interviews', 'Days Open', 'Target Date'].map(col => (
                        <th key={col} style={thStyle}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(pos => {
                      const isSelected = selected === pos.id;
                      const sc = getStatusConfig(pos.status, t);
                      return (
                        <tr key={pos.id} onClick={() => handleSelect(isSelected ? null : pos.id)} style={{
                          cursor: 'pointer', transition: 'background-color 0.15s ease',
                          backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                        }}>
                          <td style={{ ...tdStyle, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{pos.title}</td>
                          <td style={tdStyle}>{pos.department}</td>
                          <td style={tdStyle}>
                            <Box style={{
                              display: 'inline-block', padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                              backgroundColor: sc.bg, border: `1px solid ${sc.border}`,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: sc.color }}>{sc.label}</Text>
                            </Box>
                          </td>
                          <td style={tdStyle}>{pos.totalCandidates}</td>
                          <td style={{ ...tdStyle, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{pos.activeCandidates}</td>
                          <td style={tdStyle}>{pos.interviewsScheduled}</td>
                          <td style={{ ...tdStyle, color: pos.daysOpen > 60 ? t.colors.errorScale[500] : pos.daysOpen > 30 ? t.colors.warningScale[600] : t.colors.neutral[700] }}>
                            {pos.daysOpen}d
                          </td>
                          <td style={{ ...tdStyle, color: t.colors.neutral[500] }}>{pos.targetHireDate || '--'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            ) : (
              <Box style={{ padding: t.spacing[8], textAlign: 'center', color: t.colors.neutral[400] }}>
                <Text style={{ fontSize: t.typography.fontSize.sm }}>No positions</Text>
              </Box>
            )}
          </Box>

          {/* Interview Schedule */}
          {interviews.length > 0 && (
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: t.spacing[5], backgroundColor: t.colors.common.white,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <Calendar size={15} style={{ color: t.colors.primaryScale[500] }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Interview Schedule ({interviews.length})
                </Text>
              </Box>
              <Box style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Candidate', 'Position', 'Date', 'Time', 'Type', 'Status'].map(col => (
                        <th key={col} style={thStyle}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map(iv => {
                      const statusColor = getInterviewStatusColor(iv.status, t);
                      return (
                        <tr key={iv.id}>
                          <td style={{ ...tdStyle, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{iv.candidateName}</td>
                          <td style={tdStyle}>{iv.positionTitle}</td>
                          <td style={tdStyle}>{iv.date}</td>
                          <td style={tdStyle}>{iv.time}</td>
                          <td style={tdStyle}>
                            <Box style={{
                              display: 'inline-block', padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                              backgroundColor: t.colors.secondaryScale[50], border: `1px solid ${t.colors.secondaryScale[200]}`,
                            }}>
                              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.secondaryScale[700], textTransform: 'capitalize' }}>{iv.type}</Text>
                            </Box>
                          </td>
                          <td style={tdStyle}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: statusColor, textTransform: 'capitalize' }}>
                              {iv.status}
                            </Text>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
