'use client';

/**
 * BhTokenTransfer - Compact Preset
 * Condensed list view of token transfers with inline status badges
 * and action buttons for pending items.
 * Personality-driven, glass-aware.
 */

import { useMemo, useCallback } from 'react';
import {
  ArrowRight, CheckCircle, XCircle, Clock, Coins,
  Plus, Shield,
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

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhTokenTransferProps, TokenTransfer } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusConfig(status: TokenTransfer['status'], t: DesignTokens) {
  switch (status) {
    case 'pending':
      return { label: 'Pending', badge: 'warning' as const, color: t.colors.warningScale[600], icon: Clock };
    case 'approved':
      return { label: 'Approved', badge: 'success' as const, color: t.colors.successScale[600], icon: CheckCircle };
    case 'rejected':
      return { label: 'Rejected', badge: 'error' as const, color: t.colors.errorScale[600], icon: XCircle };
    case 'completed':
      return { label: 'Completed', badge: 'primary' as const, color: t.colors.primaryScale[600], icon: Shield };
  }
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhTokenTransfer = createPreset<BhTokenTransferProps>({
  name: 'BhTokenTransfer.Compact',
  render: (ctx: PresetContext<BhTokenTransferProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      transfers: rawTransfers = [],
      onApprove,
      onReject,
      onRequestTransfer,
      loading = false,
      className,
      style,
    } = props;

    const transfers = Array.isArray(rawTransfers) ? rawTransfers : [];

    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const pendingCount = useMemo(() => transfers.filter(tr => tr.status === 'pending').length, [transfers]);

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
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[6], ...style }}>
          <Coins size={18} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, ...animStyle, width: '100%', padding: 0, ...style }}>
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `1px solid ${t.colors.neutral[200]}`,
        }}>
          <Coins size={14} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900] }}>
            Transfers
          </Text>

          {/* Pending count badge */}
          {pendingCount > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'warning'),
              borderRadius: badgeRadius,
              marginLeft: t.spacing[1],
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {pendingCount} pending
              </Text>
            </Box>
          )}

          {onRequestTransfer && (
            <Box
              tabIndex={0}
              role="button"
              aria-label="Request new transfer"
              onClick={handleRequestTransfer}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRequestTransfer(); } }}
              style={{
                marginLeft: 'auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.primaryScale[50],
                border: `1px solid ${t.colors.primaryScale[200]}`,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Plus size={12} color={t.colors.primaryScale[600]} />
            </Box>
          )}
        </Box>

        {/* Transfer rows */}
        {transfers.length === 0 ? (
          <Box style={{ ...emptyState, padding: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No transfers</Text>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
            {transfers.map((transfer, index) => {
              const statusCfg = getStatusConfig(transfer.status, t);
              const isPending = transfer.status === 'pending';
              const stagger = createStaggerDelay(t, index);
              return (
                <Box
                  key={transfer.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderBottom: index < transfers.length - 1
                      ? `1px solid ${t.colors.neutral[100]}`
                      : 'none',
                    transition: `all ${t.motion.hover}`,
                    opacity: 1, transform: 'translateX(0)',
                    transitionDelay: `${stagger}ms`,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* From -> To */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], minWidth: 0, flex: 1 }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[800],
                      whiteSpace: 'nowrap' as const,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {transfer.fromTeam.name}
                    </Text>
                    <ArrowRight size={10} color={t.colors.neutral[400]} style={{ flexShrink: 0 }} />
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[800],
                      whiteSpace: 'nowrap' as const,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {transfer.toTeam.name}
                    </Text>
                  </Box>

                  {/* Amount */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
                    <Coins size={10} color={t.colors.primaryScale[500]} />
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.bold,
                      color: t.colors.primaryScale[700],
                    }}>
                      {(transfer.amount ?? 0).toLocaleString()}
                    </Text>
                  </Box>

                  {/* Status badge */}
                  <Box style={{
                    ...createBadgeStyle(t, statusCfg.badge),
                    borderRadius: badgeRadius,
                    flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{statusCfg.label}</Text>
                  </Box>

                  {/* Inline action buttons for pending */}
                  {isPending && (onApprove || onReject) && (
                    <Box style={{ display: 'flex', gap: t.spacing[1], flexShrink: 0 }}>
                      {onReject && (
                        <Box
                          tabIndex={0}
                          role="button"
                          aria-label={`Reject transfer ${transfer.id}`}
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReject(transfer.id); }}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleReject(transfer.id); } }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 22, height: 22,
                            borderRadius: t.borderRadius.sm,
                            border: `1px solid ${t.colors.errorScale[200]}`,
                            backgroundColor: t.colors.common.white,
                            cursor: 'pointer',
                            transition: `all ${t.motion.hover}`,
                          }}
                        >
                          <XCircle size={11} color={t.colors.errorScale[500]} />
                        </Box>
                      )}
                      {onApprove && (
                        <Box
                          tabIndex={0}
                          role="button"
                          aria-label={`Approve transfer ${transfer.id}`}
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleApprove(transfer.id); }}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleApprove(transfer.id); } }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 22, height: 22,
                            borderRadius: t.borderRadius.sm,
                            border: 'none',
                            backgroundColor: t.colors.successScale[500],
                            cursor: 'pointer',
                            transition: `all ${t.motion.hover}`,
                          }}
                        >
                          <CheckCircle size={11} color={t.colors.common.white} />
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
