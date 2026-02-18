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
import type { BhClientPortalProps, ClientPosition, ClientInterview, ClientPipelineStage, ClientMetrics } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  LayoutDashboard, Briefcase, Users, Clock, TrendingUp, Award,
  Calendar, Video, Phone, MapPin, UsersRound, ChevronRight, BarChart3, DollarSign,
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
  name: 'Acme Corp',
  contactName: 'John Doe',
  contactEmail: 'john@acme.com',
};

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
      positions: rawPositions = [],
      pipeline: rawPipeline = [],
      interviews: rawInterviews = [],
      metrics: rawMetrics = {} as Partial<ClientMetrics>,
      billingOverview,
      billingRecords: rawBillingRecords,
      selectedPosition: controlledSelected,
      onPositionSelect,
      className, style,
    } = props;

    const positions = Array.isArray(rawPositions) ? rawPositions : [];
    const pipeline = Array.isArray(rawPipeline) ? rawPipeline : [];
    const interviews = Array.isArray(rawInterviews) ? rawInterviews : [];
    const metrics = rawMetrics as Partial<ClientMetrics>;
    const billingRecords = Array.isArray(rawBillingRecords) ? rawBillingRecords : [];

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

          {/* Billing Overview */}
          {(billingOverview || billingRecords.length > 0) && (
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: t.spacing[5], backgroundColor: t.colors.common.white, marginTop: t.spacing[5],
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <DollarSign size={15} color={t.colors.successScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Billing
                </Text>
              </Box>
              {billingOverview && (
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[3], marginBottom: billingRecords.length > 0 ? t.spacing[4] : 0 }}>
                  {billingOverview.totalBilled != null && (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Total Billed</Text>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                        {billingOverview.currency ?? '$'}{billingOverview.totalBilled.toLocaleString()}
                      </Text>
                    </Box>
                  )}
                  {billingOverview.totalPaid != null && (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Total Paid</Text>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.successScale[700], display: 'block' }}>
                        {billingOverview.currency ?? '$'}{billingOverview.totalPaid.toLocaleString()}
                      </Text>
                    </Box>
                  )}
                  {billingOverview.outstandingBalance != null && (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Outstanding</Text>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: billingOverview.outstandingBalance > 0 ? t.colors.warningScale[700] : t.colors.neutral[900], display: 'block' }}>
                        {billingOverview.currency ?? '$'}{billingOverview.outstandingBalance.toLocaleString()}
                      </Text>
                    </Box>
                  )}
                  {billingOverview.nextInvoiceDate && (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Next Invoice</Text>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], display: 'block' }}>
                        {billingOverview.nextInvoiceDate}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}
              {billingRecords.length > 0 && (
                <Box role="list" aria-label="Billing records">
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], marginBottom: t.spacing[2], display: 'block' }}>
                    Recent Records ({billingRecords.length})
                  </Text>
                  {billingRecords.slice(0, 5).map((record, idx) => (
                    <Box
                      key={record.id ?? idx}
                      role="listitem"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: `${t.spacing[2]}px 0`,
                        borderBottom: idx < Math.min(billingRecords.length, 5) - 1 ? `1px solid ${t.colors.neutral[50]}` : 'none',
                      }}
                    >
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                          {(record as any).description || (record as any).invoiceNumber || `Record #${idx + 1}`}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {(record as any).date || (record as any).createdAt || ''}
                        </Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                        ${Number((record as any).amount ?? 0).toLocaleString()}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
