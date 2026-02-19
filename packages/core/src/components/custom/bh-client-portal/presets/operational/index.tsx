'use client';

/**
 * BhClientPortal - Operational Preset
 * Detailed tabular operations view with positions table, interview schedule,
 * and compact metrics. Slite-inspired warm design with clean data density.
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
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhClientPortalProps, ClientPosition, ClientInterview, ClientMetrics } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Table, Briefcase, Users, Clock, TrendingUp, Calendar, Award,
  ArrowUpDown, ChevronDown, ChevronUp, DollarSign,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

interface ClientDisplay {
  name: string;
  contactName: string;
  contactEmail: string;
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
 * Grid Column Defs
 * -------------------------------------------------------------------------*/

const POS_GRID = '2fr 1fr 80px 60px 60px 80px 70px 100px';
const IV_GRID = '1.5fr 1.5fr 100px 80px 80px 80px';

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const OperationalBhClientPortal = createPreset<BhClientPortalProps>({
  name: 'BhClientPortal.Operational',
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
      interviews: rawInterviews = [],
      metrics: rawMetrics = {} as Partial<ClientMetrics>,
      billingOverview,
      billingRecords: rawBillingRecords,
      selectedPosition: controlledSelected,
      onPositionSelect,
      className, style,
    } = props;

    const positions = Array.isArray(rawPositions) ? rawPositions : [];
    const interviews = Array.isArray(rawInterviews) ? rawInterviews : [];
    const metrics = rawMetrics as Partial<ClientMetrics>;
    const billingRecords = Array.isArray(rawBillingRecords) ? rawBillingRecords : [];

    const client: ClientDisplay = useMemo(() => {
      if (!clientProp) return DEFAULT_CLIENT;
      return {
        name: clientProp.displayName ?? clientProp.clientCompanyName ?? '',
        contactName: clientProp.firstName ? `${clientProp.firstName} ${clientProp.lastName ?? ''}`.trim() : '',
        contactEmail: clientProp.personalEmail ?? '',
      };
    }, [clientProp]);

    const [internalSelected, setInternalSelected] = useState<string | null>(null);

    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;
    const handleSelect = useCallback((id: string | null) => {
      if (controlledSelected === undefined) setInternalSelected(id);
      onPositionSelect?.(id);
    }, [controlledSelected, onPositionSelect]);

    const thStyle = useMemo(() => ({
      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
      textAlign: 'left' as const,
      fontWeight: t.typography.fontWeight.semibold,
      color: t.colors.neutral[500],
      fontSize: t.typography.fontSize.xs,
      textTransform: typo.labelTransform,
      letterSpacing: typo.labelLetterSpacing,
    }), [t, typo]);

    const tdStyle = useMemo(() => ({
      padding: `${t.spacing[3]}px ${t.spacing[3]}px`,
      fontSize: t.typography.fontSize.sm,
      color: t.colors.neutral[700],
      display: 'flex',
      alignItems: 'center',
    }), [t]);

    return (
      <Box className={className} role="region" aria-label="Client Portal Operations" style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.neutral[50], overflow: 'hidden', ...glassStyle,
        ...entrance.animate, transition: entrance.transition,
        ...style,
      }}>
        {accentBar && <Box style={accentBar} />}
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
                <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[100] })}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[700] }}>
                    {(client.name || '').charAt(0)}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Table size={14} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
                      {client.name} -- Operations
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
                  <Box key={m.label} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1] }}>
                    <Icon size={12} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800], display: 'block' }}>{m.value}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], display: 'block' }}>{m.label}</Text>
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
            padding: t.spacing[5], backgroundColor: t.colors.common.white, marginBottom: t.spacing[5], width: '100%',
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <Briefcase size={15} color={t.colors.primaryScale[500]} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                Positions Detail ({positions.length})
              </Text>
            </Box>
            {positions.length > 0 ? (
              <Box style={{ overflowX: 'auto' }} role="table" aria-label="Positions table">
                {/* Header row */}
                <Box role="row" style={{
                  display: 'grid',
                  gridTemplateColumns: POS_GRID,
                  borderBottom: `1px solid ${t.colors.neutral[200]}`,
                }}>
                  {['Position', 'Department', 'Status', 'Total', 'Active', 'Interviews', 'Days', 'Target Date'].map(col => (
                    <Box key={col} role="columnheader" style={thStyle}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500] }}>{col}</Text>
                    </Box>
                  ))}
                </Box>
                {/* Data rows */}
                {positions.map(pos => {
                  const isSelected = selected === pos.id;
                  const sc = getStatusConfig(pos.status, t);
                  return (
                    <Box
                      key={pos.id}
                      onClick={() => handleSelect(isSelected ? null : pos.id)}
                      role="row"
                      tabIndex={0}
                      aria-selected={isSelected}
                      aria-label={`${pos.title} - ${sc.label}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: POS_GRID,
                        cursor: 'pointer',
                        transition: `background-color ${t.motion.hover}`,
                        backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                        borderBottom: `1px solid ${t.colors.neutral[50]}`,
                      }}
                    >
                      <Box style={{ ...tdStyle, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], minWidth: 0 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{pos.title}</Text>
                      </Box>
                      <Box style={tdStyle}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{pos.department}</Text>
                      </Box>
                      <Box style={tdStyle}>
                        <Box style={{
                          display: 'inline-block', padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                          backgroundColor: sc.bg, border: `1px solid ${sc.border}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: sc.color }}>{sc.label}</Text>
                        </Box>
                      </Box>
                      <Box style={tdStyle}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{pos.totalCandidates}</Text>
                      </Box>
                      <Box style={{ ...tdStyle, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{pos.activeCandidates}</Text>
                      </Box>
                      <Box style={tdStyle}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{pos.interviewsScheduled}</Text>
                      </Box>
                      <Box style={{ ...tdStyle, color: pos.daysOpen > 60 ? t.colors.errorScale[500] : pos.daysOpen > 30 ? t.colors.warningScale[600] : t.colors.neutral[700] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: pos.daysOpen > 60 ? t.colors.errorScale[500] : pos.daysOpen > 30 ? t.colors.warningScale[600] : t.colors.neutral[700] }}>
                          {pos.daysOpen}d
                        </Text>
                      </Box>
                      <Box style={{ ...tdStyle, color: t.colors.neutral[500] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{pos.targetHireDate || '--'}</Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box style={{ padding: t.spacing[8], textAlign: 'center', color: t.colors.neutral[400] }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No positions</Text>
              </Box>
            )}
          </Box>

          {/* Interview Schedule */}
          {interviews.length > 0 && (
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: t.spacing[5], backgroundColor: t.colors.common.white, width: '100%',
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <Calendar size={15} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Interview Schedule ({interviews.length})
                </Text>
              </Box>
              <Box style={{ overflowX: 'auto' }} role="table" aria-label="Interview schedule table">
                {/* Header row */}
                <Box role="row" style={{
                  display: 'grid',
                  gridTemplateColumns: IV_GRID,
                  borderBottom: `1px solid ${t.colors.neutral[200]}`,
                }}>
                  {['Candidate', 'Position', 'Date', 'Time', 'Type', 'Status'].map(col => (
                    <Box key={col} role="columnheader" style={thStyle}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500] }}>{col}</Text>
                    </Box>
                  ))}
                </Box>
                {/* Data rows */}
                {interviews.map(iv => {
                  const statusColor = getInterviewStatusColor(iv.status, t);
                  return (
                    <Box key={iv.id} role="row" aria-label={`${iv.candidateName} - ${iv.positionTitle} - ${iv.date}`} style={{
                      display: 'grid',
                      gridTemplateColumns: IV_GRID,
                      borderBottom: `1px solid ${t.colors.neutral[50]}`,
                    }}>
                      <Box style={{ ...tdStyle, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], minWidth: 0 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{iv.candidateName}</Text>
                      </Box>
                      <Box style={tdStyle}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{iv.positionTitle}</Text>
                      </Box>
                      <Box style={tdStyle}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{iv.date}</Text>
                      </Box>
                      <Box style={tdStyle}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{iv.time}</Text>
                      </Box>
                      <Box style={tdStyle}>
                        <Box style={{
                          display: 'inline-block', padding: `1px ${t.spacing[2]}px`, borderRadius: br,
                          backgroundColor: t.colors.secondaryScale[50], border: `1px solid ${t.colors.secondaryScale[200]}`,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.secondaryScale[700], textTransform: 'capitalize' }}>{iv.type}</Text>
                        </Box>
                      </Box>
                      <Box style={tdStyle}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: statusColor, textTransform: 'capitalize' }}>
                          {iv.status}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Billing Summary */}
          {(billingOverview || billingRecords.length > 0) && (
            <Box style={{
              ...createCardStyle(t, { elevation: 'sm' }),
              padding: t.spacing[5], backgroundColor: t.colors.common.white, marginTop: t.spacing[5], width: '100%',
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
                <DollarSign size={15} color={t.colors.successScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                  Billing Summary
                </Text>
              </Box>
              {billingOverview && (
                <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: billingRecords.length > 0 ? t.spacing[4] : 0 }}>
                  {billingOverview.totalBilled != null && (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1] }}>
                      <DollarSign size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800], display: 'block' }}>
                        {billingOverview.currency ?? '$'}{billingOverview.totalBilled.toLocaleString()}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], display: 'block' }}>Billed</Text>
                    </Box>
                  )}
                  {billingOverview.totalPaid != null && (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1] }}>
                      <TrendingUp size={12} color={t.colors.successScale[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.successScale[700], display: 'block' }}>
                        {billingOverview.currency ?? '$'}{billingOverview.totalPaid.toLocaleString()}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], display: 'block' }}>Paid</Text>
                    </Box>
                  )}
                  {billingOverview.outstandingBalance != null && (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1] }}>
                      <Clock size={12} color={t.colors.warningScale[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: billingOverview.outstandingBalance > 0 ? t.colors.warningScale[700] : t.colors.neutral[800], display: 'block' }}>
                        {billingOverview.currency ?? '$'}{billingOverview.outstandingBalance.toLocaleString()}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], display: 'block' }}>Outstanding</Text>
                    </Box>
                  )}
                  {billingOverview.invoiceCount != null && (
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[1] }}>
                      <Briefcase size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800], display: 'block' }}>
                        {billingOverview.invoiceCount}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], display: 'block' }}>Invoices</Text>
                    </Box>
                  )}
                </Box>
              )}
              {billingRecords.length > 0 && (
                <Box role="list" aria-label="Billing records">
                  {billingRecords.slice(0, 5).map((record, idx) => (
                    <Box
                      key={record.id ?? idx}
                      role="listitem"
                      style={{
                        ...animStyle(idx),
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                        borderBottom: idx < Math.min(billingRecords.length, 5) - 1 ? `1px solid ${t.colors.neutral[50]}` : 'none',
                      }}
                    >
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                        {(record as any).description || (record as any).invoiceNumber || `Record #${idx + 1}`}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>
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
