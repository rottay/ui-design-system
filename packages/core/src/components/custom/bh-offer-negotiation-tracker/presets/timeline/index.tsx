'use client';

/**
 * BhOfferNegotiationTracker - Timeline Preset
 * Full vertical timeline showing negotiation rounds with salary bars
 * and progression. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowRight,
  CheckCircle, XCircle, Clock, MessageSquare,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhOfferNegotiationTrackerProps, NegotiationRound } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ROUNDS: NegotiationRound[] = [
  { id: 'nr-1', date: '2026-01-15', offeredSalary: 120000, requestedSalary: 145000, status: 'countered', notes: 'Initial offer based on market data' },
  { id: 'nr-2', date: '2026-01-20', offeredSalary: 130000, requestedSalary: 140000, status: 'countered', notes: 'Increased base, added signing bonus discussion' },
  { id: 'nr-3', date: '2026-01-25', offeredSalary: 135000, requestedSalary: 138000, status: 'countered', notes: 'Near agreement, discussing equity' },
  { id: 'nr-4', date: '2026-01-28', offeredSalary: 137000, requestedSalary: 137000, status: 'accepted', notes: 'Final agreement with RSU package' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusColor(status: NegotiationRound['status'], t: DesignTokens): string {
  switch (status) {
    case 'accepted': return t.colors.successScale[500];
    case 'rejected': return t.colors.errorScale[500];
    case 'countered': return t.colors.warningScale[500];
    case 'pending': return t.colors.infoScale[500];
  }
}

function getStatusIcon(status: NegotiationRound['status']) {
  switch (status) {
    case 'accepted': return CheckCircle;
    case 'rejected': return XCircle;
    case 'countered': return ArrowRight;
    case 'pending': return Clock;
  }
}

function getStatusBadge(status: NegotiationRound['status']): 'success' | 'error' | 'warning' | 'info' {
  switch (status) {
    case 'accepted': return 'success';
    case 'rejected': return 'error';
    case 'countered': return 'warning';
    case 'pending': return 'info';
  }
}

function formatCurrency(value: number, currency: string): string {
  return `${currency}${value.toLocaleString()}`;
}

/* ================================================================== */
/*  Timeline Preset                                                    */
/* ================================================================== */

export const TimelineBhOfferNegotiationTracker = createPreset<BhOfferNegotiationTrackerProps>({
  name: 'BhOfferNegotiationTracker.Timeline',
  render: (ctx: PresetContext<BhOfferNegotiationTrackerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      rounds = MOCK_ROUNDS,
      candidateName = 'Sarah Johnson',
      position = 'Senior Frontend Engineer',
      budgetMin = 115000,
      budgetMax = 140000,
      currency = '$',
      title = 'Offer Negotiation',
      onRoundClick,
      loading,
      className,
      style,
    } = props;

    const [hoveredRound, setHoveredRound] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleRoundClick = useCallback((id: string) => {
      onRoundClick?.(id);
    }, [onRoundClick]);

    const salaryRange = useMemo(() => {
      const allSalaries = rounds.flatMap(r => [r.offeredSalary, r.requestedSalary]);
      const min = Math.min(...allSalaries, budgetMin);
      const max = Math.max(...allSalaries, budgetMax);
      return { min, max, range: max - min || 1 };
    }, [rounds, budgetMin, budgetMax]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...(accentBar ? accentLayout.outer : {}),
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentBar ? accentLayout.inner : {}}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.successScale[50] })}>
                <DollarSign size={20} color={t.colors.successScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {candidateName} - {position}
                </Text>
              </Box>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, 'info'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                Budget: {formatCurrency(budgetMin, currency)} - {formatCurrency(budgetMax, currency)}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Timeline */}
        <Box style={{ padding: t.spacing[6] }}>
          {rounds.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <DollarSign size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No negotiation rounds yet
              </Text>
            </Box>
          )}

          <Box role="list" aria-label="Negotiation timeline">
            {rounds.map((round, i) => {
              const StatusIcon = getStatusIcon(round.status);
              const statusColor = getStatusColor(round.status, t);
              const isHovered = hoveredRound === round.id;
              const isLast = i === rounds.length - 1;
              const offeredPct = ((round.offeredSalary - salaryRange.min) / salaryRange.range) * 100;
              const requestedPct = ((round.requestedSalary - salaryRange.min) / salaryRange.range) * 100;

              return (
                <Box
                  key={round.id}
                  style={{
                    ...animStyle(i),
                    display: 'flex',
                    gap: t.spacing[4],
                  }}
                >
                  {/* Timeline track */}
                  <Box style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 32,
                    flexShrink: 0,
                  }}>
                    <Box style={{
                      width: 32,
                      height: 32,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: statusColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <StatusIcon size={16} color={t.colors.common.white} />
                    </Box>
                    {!isLast && (
                      <Box style={{
                        width: 2,
                        flex: 1,
                        backgroundColor: t.colors.neutral[200],
                        minHeight: 20,
                      }} />
                    )}
                  </Box>

                  {/* Round content */}
                  <Box
                    role="listitem"
                    tabIndex={0}
                    aria-label={`Round ${i + 1}: Offered ${formatCurrency(round.offeredSalary, currency)}, Requested ${formatCurrency(round.requestedSalary, currency)}, ${round.status}`}
                    onClick={() => handleRoundClick(round.id)}
                    onMouseEnter={() => setHoveredRound(round.id)}
                    onMouseLeave={() => setHoveredRound(null)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRoundClick(round.id);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: t.spacing[4],
                      marginBottom: t.spacing[4],
                      borderRadius: t.borderRadius.lg,
                      border: `1px solid ${isHovered ? t.colors.primaryScale[200] : t.colors.neutral[100]}`,
                      backgroundColor: isHovered ? t.colors.neutral[50] : t.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    {/* Round header */}
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[800],
                        }}>
                          Round {i + 1}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {round.date}
                        </Text>
                      </Box>
                      <Box style={{
                        ...createBadgeStyle(t, getStatusBadge(round.status)),
                        borderRadius: badgeRadius,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                        </Text>
                      </Box>
                    </Box>

                    {/* Salary comparison */}
                    <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[2] }}>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1] }}>
                          Offered
                        </Text>
                        <Text style={{
                          fontSize: t.typography.fontSize.lg,
                          fontWeight: t.typography.fontWeight.bold,
                          color: t.colors.neutral[900],
                        }}>
                          {formatCurrency(round.offeredSalary, currency)}
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1] }}>
                          Requested
                        </Text>
                        <Text style={{
                          fontSize: t.typography.fontSize.lg,
                          fontWeight: t.typography.fontWeight.bold,
                          color: t.colors.neutral[900],
                        }}>
                          {formatCurrency(round.requestedSalary, currency)}
                        </Text>
                      </Box>
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: t.spacing[1],
                      }}>
                        {round.requestedSalary > round.offeredSalary ? (
                          <TrendingUp size={14} color={t.colors.warningScale[500]} />
                        ) : (
                          <CheckCircle size={14} color={t.colors.successScale[500]} />
                        )}
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.bold,
                          color: round.requestedSalary > round.offeredSalary
                            ? t.colors.warningScale[600]
                            : t.colors.successScale[600],
                        }}>
                          {formatCurrency(Math.abs(round.requestedSalary - round.offeredSalary), currency)} gap
                        </Text>
                      </Box>
                    </Box>

                    {/* Notes */}
                    {round.notes && (
                      <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[1], marginTop: t.spacing[2] }}>
                        <MessageSquare size={12} color={t.colors.neutral[400]} style={{ marginTop: t.spacing[1], flexShrink: 0 }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], fontStyle: 'italic' }}>
                          {round.notes}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
