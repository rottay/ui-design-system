'use client';

/**
 * BhTokenTransfer - Timeline Preset
 * Full vertical timeline of token transfers between teams with
 * connecting lines, status badges, and approve/reject actions for pending items.
 * Personality-driven, glass-aware, entrance animated.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ArrowRight, CheckCircle, XCircle, Clock, Coins,
  Plus, User, Calendar, MessageSquare, Shield,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhTokenTransferProps, TokenTransfer } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_TRANSFERS: TokenTransfer[] = [
  {
    id: 'tt-1',
    fromTeam: { id: 'team-eng', name: 'Engineering' },
    toTeam: { id: 'team-design', name: 'Design' },
    amount: 500,
    reason: 'Design sprint support for Q1 product launch',
    status: 'completed',
    requestedBy: 'Sarah Kim',
    requestedAt: new Date('2026-01-15T09:00:00'),
    approvedBy: 'Tom Walsh',
    approvedAt: new Date('2026-01-15T11:30:00'),
  },
  {
    id: 'tt-2',
    fromTeam: { id: 'team-hr', name: 'HR' },
    toTeam: { id: 'team-eng', name: 'Engineering' },
    amount: 1200,
    reason: 'Senior developer hiring campaign tokens',
    status: 'approved',
    requestedBy: 'Lisa Park',
    requestedAt: new Date('2026-01-20T14:00:00'),
    approvedBy: 'Mark Rivera',
    approvedAt: new Date('2026-01-21T10:00:00'),
    notes: 'Approved for Q1 hiring budget',
  },
  {
    id: 'tt-3',
    fromTeam: { id: 'team-marketing', name: 'Marketing' },
    toTeam: { id: 'team-sales', name: 'Sales' },
    amount: 800,
    reason: 'Lead generation outreach campaign',
    status: 'pending',
    requestedBy: 'James Chen',
    requestedAt: new Date('2026-02-05T16:00:00'),
  },
  {
    id: 'tt-4',
    fromTeam: { id: 'team-eng', name: 'Engineering' },
    toTeam: { id: 'team-qa', name: 'QA' },
    amount: 300,
    reason: 'Automated testing infrastructure tokens',
    status: 'rejected',
    requestedBy: 'Anna Lee',
    requestedAt: new Date('2026-02-01T08:30:00'),
    approvedBy: 'Tom Walsh',
    approvedAt: new Date('2026-02-01T15:00:00'),
    notes: 'Budget exceeded for this quarter',
  },
  {
    id: 'tt-5',
    fromTeam: { id: 'team-sales', name: 'Sales' },
    toTeam: { id: 'team-support', name: 'Support' },
    amount: 450,
    reason: 'Customer onboarding assistance tokens',
    status: 'pending',
    requestedBy: 'David Park',
    requestedAt: new Date('2026-02-10T10:00:00'),
    notes: 'Urgent - new enterprise client onboarding',
  },
  {
    id: 'tt-6',
    fromTeam: { id: 'team-design', name: 'Design' },
    toTeam: { id: 'team-marketing', name: 'Marketing' },
    amount: 250,
    reason: 'Brand refresh creative assets',
    status: 'completed',
    requestedBy: 'Maria Lopez',
    requestedAt: new Date('2026-01-28T11:00:00'),
    approvedBy: 'Lisa Park',
    approvedAt: new Date('2026-01-28T14:00:00'),
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusConfig(status: TokenTransfer['status'], t: DesignTokens) {
  switch (status) {
    case 'pending':
      return { label: 'Pending', badge: 'warning' as const, color: t.colors.warningScale[600], bg: t.colors.warningScale[50], icon: Clock };
    case 'approved':
      return { label: 'Approved', badge: 'success' as const, color: t.colors.successScale[600], bg: t.colors.successScale[50], icon: CheckCircle };
    case 'rejected':
      return { label: 'Rejected', badge: 'error' as const, color: t.colors.errorScale[600], bg: t.colors.errorScale[50], icon: XCircle };
    case 'completed':
      return { label: 'Completed', badge: 'primary' as const, color: t.colors.primaryScale[600], bg: t.colors.primaryScale[50], icon: Shield };
  }
}

/* ================================================================== */
/*  Timeline Preset                                                    */
/* ================================================================== */

export const TimelineBhTokenTransfer = createPreset<BhTokenTransferProps>({
  name: 'BhTokenTransfer.Timeline',
  render: (ctx: PresetContext<BhTokenTransferProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      transfers: rawTransfers = MOCK_TRANSFERS,
      onApprove,
      onReject,
      onRequestTransfer,
      loading = false,
      className,
      style,
    } = props;

    const transfers = Array.isArray(rawTransfers) ? rawTransfers : MOCK_TRANSFERS;


    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    // Stats
    const stats = useMemo(() => {
      const total = transfers.length;
      const pending = transfers.filter(tr => tr.status === 'pending').length;
      const completed = transfers.filter(tr => tr.status === 'completed').length;
      const totalAmount = transfers.reduce((sum, tr) => sum + tr.amount, 0);
      return { total, pending, completed, totalAmount };
    }, [transfers]);

    const handleApprove = useCallback((id: string) => {
      onApprove?.(id);
    }, [onApprove]);

    const handleReject = useCallback((id: string) => {
      onReject?.(id);
    }, [onReject]);

    const handleRequestTransfer = useCallback(() => {
      onRequestTransfer?.();
    }, [onRequestTransfer]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Coins size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading transfers...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, ...animStyle, width: '100%', padding: 0, overflow: 'hidden', ...style }}>
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <Coins size={20} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  letterSpacing: ptypo.headingLetterSpacing,
                  color: t.colors.neutral[900],
                }}>
                  Token Transfers
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Team token allocation history
                </Text>
              </Box>
            </Box>

            {onRequestTransfer && (
              <Box
                tabIndex={0}
                role="button"
                aria-label="Request new transfer"
                onClick={handleRequestTransfer}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRequestTransfer(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderRadius: badgeRadius,
                  backgroundColor: t.colors.primaryScale[500],
                  color: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                  border: 'none',
                }}
              >
                <Plus size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Request Transfer</Text>
              </Box>
            )}
          </Box>

          {/* Stats row */}
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            {[
              { label: 'Total', value: stats.total, color: t.colors.neutral[900] },
              { label: 'Pending', value: stats.pending, color: t.colors.warningScale[600] },
              { label: 'Completed', value: stats.completed, color: t.colors.successScale[600] },
            ].map((stat) => (
              <Box key={stat.label} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'baseline', gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: stat.color }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Timeline */}
        <Box style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
          {transfers.length === 0 ? (
            <Box style={{ ...emptyState }}>
              <Coins size={32} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No token transfers yet</Text>
            </Box>
          ) : (
            <Box style={{ position: 'relative' }}>
              {/* Vertical connecting line */}
              <Box style={{
                position: 'absolute',
                left: 15,
                top: 20,
                bottom: 20,
                width: 2,
                backgroundColor: t.colors.neutral[100],
                borderRadius: t.borderRadius.full,
              }} />

              {transfers.map((transfer, index) => {
                const statusCfg = getStatusConfig(transfer.status, t);
                const StatusIcon = statusCfg.icon;
                const isPending = transfer.status === 'pending';
                const stagger = createStaggerDelay(t, index);
                const hoverStyles = createCardHoverStyles(t);

                return (
                  <Box
                    key={transfer.id}
                    style={{
                      display: 'flex',
                      gap: t.spacing[4],
                      marginBottom: index < transfers.length - 1 ? t.spacing[4] : 0,
                      position: 'relative',
                      opacity: 1, transform: 'translateY(0)',
                      transition: `all ${t.motion.hover} ${stagger}ms`,
                    }}
                  >
                    {/* Timeline dot */}
                    <Box style={{
                      width: 32,
                      height: 32,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: statusCfg.bg,
                      border: `2px solid ${statusCfg.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 1,
                    }}>
                      <StatusIcon size={14} color={statusCfg.color} />
                    </Box>

                    {/* Transfer card */}
                    <Box style={{
                      flex: 1,
                      padding: t.spacing[4],
                      borderRadius: t.borderRadius.lg,
                      border: `1px solid ${t.colors.neutral[100]}`,
                      backgroundColor: t.colors.common.white,
                      transition: `all ${t.motion.hover}`,
                    }}>
                      {/* From -> To with arrow */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                        <Box style={{
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: t.colors.neutral[100],
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                            {transfer.fromTeam.name}
                          </Text>
                        </Box>

                        <ArrowRight size={14} color={t.colors.neutral[400]} />

                        <Box style={{
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: t.colors.neutral[100],
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                            {transfer.toTeam.name}
                          </Text>
                        </Box>

                        {/* Amount badge */}
                        <Box style={{
                          marginLeft: 'auto',
                          display: 'flex', alignItems: 'center', gap: t.spacing[1],
                          padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: t.colors.primaryScale[50],
                          border: `1px solid ${t.colors.primaryScale[200]}`,
                        }}>
                          <Coins size={12} color={t.colors.primaryScale[600]} />
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[700] }}>
                            {(transfer.amount ?? 0).toLocaleString()}
                          </Text>
                        </Box>

                        {/* Status badge */}
                        <Box style={{
                          ...createBadgeStyle(t, statusCfg.badge),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{statusCfg.label}</Text>
                        </Box>
                      </Box>

                      {/* Reason */}
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        color: t.colors.neutral[700],
                        marginBottom: t.spacing[2],
                        lineHeight: '1.5',
                      }}>
                        {transfer.reason}
                      </Text>

                      {/* Notes */}
                      {transfer.notes && (
                        <Box style={{
                          display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          backgroundColor: t.colors.neutral[50],
                          marginBottom: t.spacing[2],
                        }}>
                          <MessageSquare size={12} color={t.colors.neutral[400]} style={{ marginTop: t.spacing[1], flexShrink: 0 }} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], lineHeight: '1.4' }}>
                            {transfer.notes}
                          </Text>
                        </Box>
                      )}

                      {/* Metadata row */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4], flexWrap: 'wrap' as const }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <User size={11} color={t.colors.neutral[400]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {transfer.requestedBy}
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Calendar size={11} color={t.colors.neutral[400]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {formatDistanceToNow(transfer.requestedAt, { addSuffix: true })}
                          </Text>
                        </Box>
                        {transfer.approvedBy && (
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                            <CheckCircle size={11} color={t.colors.successScale[400]} />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                              {transfer.approvedBy}
                            </Text>
                          </Box>
                        )}
                      </Box>

                      {/* Pending action buttons */}
                      {isPending && (onApprove || onReject) && (
                        <Box style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                          gap: t.spacing[2],
                          marginTop: t.spacing[3],
                          paddingTop: t.spacing[3],
                          borderTop: `1px solid ${t.colors.neutral[100]}`,
                        }}>
                          {onReject && (
                            <Box
                              tabIndex={0}
                              role="button"
                              aria-label={`Reject transfer ${transfer.id}`}
                              onClick={() => handleReject(transfer.id)}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleReject(transfer.id); } }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                                borderRadius: badgeRadius,
                                border: `1px solid ${t.colors.errorScale[200]}`,
                                backgroundColor: t.colors.common.white,
                                cursor: 'pointer',
                                transition: `all ${t.motion.hover}`,
                              }}
                            >
                              <XCircle size={13} color={t.colors.errorScale[600]} />
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.errorScale[600] }}>
                                Reject
                              </Text>
                            </Box>
                          )}
                          {onApprove && (
                            <Box
                              tabIndex={0}
                              role="button"
                              aria-label={`Approve transfer ${transfer.id}`}
                              onClick={() => handleApprove(transfer.id)}
                              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleApprove(transfer.id); } }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                                borderRadius: badgeRadius,
                                border: 'none',
                                backgroundColor: t.colors.successScale[500],
                                cursor: 'pointer',
                                transition: `all ${t.motion.hover}`,
                              }}
                            >
                              <CheckCircle size={13} color={t.colors.common.white} />
                              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.common.white }}>
                                Approve
                              </Text>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
