'use client';

/**
 * BhClientPortal - Executive Preset
 * Premium executive dashboard for external clients with rich metrics,
 * pipeline visualization, position cards, and interview schedule.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createIconContainerStyle,
  createEntranceAnimation,
  createStaggerDelay,
} from '../../../helpers';
import type { BhClientPortalProps, ClientPosition, ClientInterview, ClientPipelineStage } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  LayoutDashboard, Briefcase, Users, Clock, TrendingUp, Award,
  Calendar, Video, Phone, MapPin, UsersRound, ChevronRight, BarChart3,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

interface ClientDisplay {
  name: string;
  contactName: string;
  contactEmail: string;
  logo?: string;
}

const DEFAULT_CLIENT: ClientDisplay = {
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

const DEFAULT_PIPELINE: ClientPipelineStage[] = [
  { name: 'Applied', count: 47 },
  { name: 'Screening', count: 28 },
  { name: 'Interview', count: 16 },
  { name: 'Technical', count: 9 },
  { name: 'Final Round', count: 5 },
  { name: 'Offer', count: 3 },
];

const DEFAULT_POSITIONS: ClientPosition[] = [
  { id: 'p-1', title: 'Senior Frontend Engineer', department: 'Engineering', status: 'open', totalCandidates: 18, activeCandidates: 12, interviewsScheduled: 4, daysOpen: 21, targetHireDate: '2026-03-15' },
  { id: 'p-2', title: 'Product Manager', department: 'Product', status: 'open', totalCandidates: 14, activeCandidates: 8, interviewsScheduled: 3, daysOpen: 35, targetHireDate: '2026-03-01' },
  { id: 'p-3', title: 'Staff Backend Engineer', department: 'Engineering', status: 'open', totalCandidates: 9, activeCandidates: 6, interviewsScheduled: 2, daysOpen: 14 },
  { id: 'p-4', title: 'UX Designer', department: 'Design', status: 'on_hold', totalCandidates: 7, activeCandidates: 3, interviewsScheduled: 0, daysOpen: 45 },
  { id: 'p-5', title: 'Data Analyst', department: 'Analytics', status: 'filled', totalCandidates: 22, activeCandidates: 0, interviewsScheduled: 0, daysOpen: 28 },
];

const DEFAULT_INTERVIEWS: ClientInterview[] = [
  { id: 'iv-1', candidateName: 'Sarah Johnson', positionTitle: 'Senior Frontend Engineer', date: '2026-02-12', time: '10:00 AM', type: 'video', status: 'scheduled' },
  { id: 'iv-2', candidateName: 'Michael Chen', positionTitle: 'Product Manager', date: '2026-02-12', time: '2:00 PM', type: 'panel', status: 'scheduled' },
  { id: 'iv-3', candidateName: 'Emily Rodriguez', positionTitle: 'Senior Frontend Engineer', date: '2026-02-13', time: '11:00 AM', type: 'onsite', status: 'scheduled' },
  { id: 'iv-4', candidateName: 'James Kim', positionTitle: 'Staff Backend Engineer', date: '2026-02-14', time: '3:00 PM', type: 'phone', status: 'scheduled' },
];

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

function getStatusConfig(status: string, t: DesignTokens) {
  switch (status) {
    case 'open': return { label: 'Open', color: t.colors.successScale[600], bg: t.colors.successScale[50], border: t.colors.successScale[200] };
    case 'on_hold': return { label: 'On Hold', color: t.colors.warningScale[600], bg: t.colors.warningScale[50], border: t.colors.warningScale[200] };
    case 'filled': return { label: 'Filled', color: t.colors.primaryScale[600], bg: t.colors.primaryScale[50], border: t.colors.primaryScale[200] };
    case 'cancelled': return { label: 'Cancelled', color: t.colors.neutral[500], bg: t.colors.neutral[50], border: t.colors.neutral[200] };
    default: return { label: status, color: t.colors.neutral[500], bg: t.colors.neutral[50], border: t.colors.neutral[200] };
  }
}

function getInterviewIcon(type: string) {
  switch (type) {
    case 'video': return Video;
    case 'phone': return Phone;
    case 'onsite': return MapPin;
    case 'panel': return UsersRound;
    default: return Calendar;
  }
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const ExecutiveBhClientPortal = createPreset<BhClientPortalProps>({
  name: 'BhClientPortal.Executive',
  render: ({ primitives, props, tokens: t }: PresetContext<BhClientPortalProps>) => {
    const { Box, Text } = primitives;
    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);

    const glassStyle = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur };
      }
      return {};
    }, [t]);

    const {
      client: clientProp,
      positions = DEFAULT_POSITIONS,
      pipeline = DEFAULT_PIPELINE,
      interviews = DEFAULT_INTERVIEWS,
      metrics = DEFAULT_METRICS,
      selectedPosition: controlledSelected,
      onPositionSelect,
      className, style,
    } = props;

    const client: ClientDisplay = useMemo(() => {
      if (!clientProp) return DEFAULT_CLIENT;
      return {
        name: clientProp.displayName ?? clientProp.clientCompanyName ?? '',
        contactName: clientProp.firstName ? `${clientProp.firstName} ${clientProp.lastName ?? ''}`.trim() : '',
        contactEmail: clientProp.personalEmail ?? '',
        logo: (clientProp as any).logo,
      };
    }, [clientProp]);

    const [internalSelected, setInternalSelected] = useState<string | null>(null);


    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;
    const handleSelect = useCallback((id: string | null) => {
      if (controlledSelected === undefined) setInternalSelected(id);
      onPositionSelect?.(id);
    }, [controlledSelected, onPositionSelect]);

    const pipelineMax = useMemo(() => pipeline.length > 0 ? Math.max(...pipeline.map(p => p.count)) : 1, [pipeline]);

    const metricItems = useMemo(() => metrics ? [
      { label: 'Open Positions', value: metrics.totalOpenPositions, icon: Briefcase, color: t.colors.primaryScale[600] },
      { label: 'Active Candidates', value: metrics.totalActiveCandidates, icon: Users, color: t.colors.infoScale[600] },
      { label: 'Avg Time to Fill', value: `${metrics.avgTimeToFill}d`, icon: Clock, color: t.colors.warningScale[600] },
      { label: 'Fill Rate', value: `${metrics.fillRate}%`, icon: TrendingUp, color: t.colors.successScale[600] },
      { label: 'Interviews', value: metrics.upcomingInterviews, icon: Calendar, color: t.colors.secondaryScale[600] },
      { label: 'Offers Extended', value: metrics.offersExtended, icon: Award, color: t.colors.primaryScale[500] },
    ] : [], [metrics, t]);

    const scheduledInterviews = useMemo(() => interviews.filter(i => i.status === 'scheduled'), [interviews]);

    return (
      <Box className={className} role="region" aria-label="Client Portal Dashboard" style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.neutral[50], overflow: 'hidden', ...glassStyle,
        ...entrance.animate, transition: entrance.transition,
        ...style,
      }}>
        {/* Client Header */}
        {client && (
          <Box style={{
            padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
            backgroundColor: t.colors.common.white,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              {client.logo ? (
                <Box style={{ width: 44, height: 44, borderRadius: t.borderRadius.lg, overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={client.logo}
                    alt={`${client.name} logo`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ) : (
                <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[100] })}>
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[700] }}>
                    {(client.name || '').charAt(0)}
                  </Text>
                </Box>
              )}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <LayoutDashboard size={16} color={t.colors.primaryScale[500]} />
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
                    {client.name}
                  </Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>
                  {client.contactName} -- {client.contactEmail}
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        <Box style={{ flex: 1, overflowY: 'auto', padding: t.spacing[6] }}>
          {/* Metric Cards */}
          {metrics && (
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: t.spacing[4], marginBottom: t.spacing[6], width: '100%' }}>
              {metricItems.map((m, idx) => {
                const Icon = m.icon;
                const itemEntrance = createEntranceAnimation(t, { index: idx });
                return (
                  <Box key={m.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                    ...createCardStyle(t, { elevation: 'sm' }),
                    padding: `${t.spacing[4]}px ${t.spacing[4]}px`,
                    backgroundColor: t.colors.common.white, textAlign: 'center',
                    ...itemEntrance.animate,
                    transition: itemEntrance.transition,
                  }}>
                    <Icon size={16} style={{ color: m.color, marginBottom: t.spacing[1] }} />
                    <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                      {m.value}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>
                      {m.label}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Pipeline + Positions */}
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: t.spacing[5], marginBottom: t.spacing[6], width: '100%' }}>
            {/* Pipeline */}
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: t.spacing[5], backgroundColor: t.colors.common.white,
            }} role="list" aria-label="Candidate Pipeline">
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <BarChart3 size={15} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Candidate Pipeline
                </Text>
              </Box>
              {pipeline.map((stage, i) => {
                const barPct = pipelineMax > 0 ? (stage.count / pipelineMax) * 100 : 0;
                return (
                  <Box key={stage.name} role="listitem" aria-label={`${stage.name}: ${stage.count} candidates`} style={{ marginBottom: i < pipeline.length - 1 ? t.spacing[3] : 0 }}>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{stage.name}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{stage.count}</Text>
                    </Box>
                    <Box style={{ height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                      <Box style={{
                        height: '100%', width: `${barPct}%`, borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.primaryScale[400], transition: `width ${t.motion.hover}`,
                      }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Positions */}
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: t.spacing[5], backgroundColor: t.colors.common.white,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <Briefcase size={15} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Your Positions ({positions.length})
                </Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }} role="list" aria-label="Open positions">
                {positions.map(pos => {
                  const isSelected = selected === pos.id;
                  const sc = getStatusConfig(pos.status, t);
                  return (
                    <Box
                      key={pos.id}
                      onClick={() => handleSelect(isSelected ? null : pos.id)}
                      role="listitem"
                      tabIndex={0}
                      aria-selected={isSelected}
                      aria-label={`${pos.title} - ${sc.label} - ${pos.activeCandidates} active candidates`}
                      style={{
                        padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                        borderRadius: t.borderRadius.lg,
                        border: `1px solid ${isSelected ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
                        backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                        cursor: 'pointer', transition: `all ${t.motion.hover}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], minWidth: 0 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          {pos.title}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>
                          {pos.department} -- {pos.daysOpen} days open
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                        <Box style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{pos.activeCandidates}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Active</Text>
                        </Box>
                        <Box style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{pos.interviewsScheduled}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Interviews</Text>
                        </Box>
                        <Box style={{
                          padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                          backgroundColor: sc.bg, border: `1px solid ${sc.border}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: sc.color }}>{sc.label}</Text>
                        </Box>
                        <ChevronRight size={14} color={t.colors.neutral[400]} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Upcoming Interviews */}
          {scheduledInterviews.length > 0 && (
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: t.spacing[5], backgroundColor: t.colors.common.white,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <Calendar size={15} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Upcoming Interviews ({scheduledInterviews.length})
                </Text>
              </Box>
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: t.spacing[3] }} role="list" aria-label="Upcoming interviews">
                {scheduledInterviews.map(iv => {
                  const Icon = getInterviewIcon(iv.type);
                  return (
                    <Box key={iv.id} role="listitem" aria-label={`${iv.candidateName} - ${iv.date} at ${iv.time}`} style={{
                      padding: t.spacing[4], borderRadius: t.borderRadius.lg,
                      border: `1px solid ${t.colors.neutral[100]}`,
                      backgroundColor: t.colors.common.white,
                    }}>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                          {iv.candidateName}
                        </Text>
                        <Box style={{
                          display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                          padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                          backgroundColor: t.colors.secondaryScale[50], border: `1px solid ${t.colors.secondaryScale[200]}`,
                        }}>
                          <Icon size={10} color={t.colors.secondaryScale[600]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.secondaryScale[700], textTransform: 'capitalize' }}>{iv.type}</Text>
                        </Box>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>{iv.positionTitle}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[2] }}>
                        <Calendar size={10} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                          {iv.date} at {iv.time}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
