'use client';

/**
 * BhOfferNegotiationTracker - Compact Preset
 * Condensed negotiation summary with salary progression bar.
 */

import { useMemo } from 'react';
import { DollarSign, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhOfferNegotiationTrackerProps, NegotiationRound } from '../../core';
import { offerToNegotiationRounds } from '../../core';
import type { DesignTokens } from '../../../../../types';

function formatCurrency(value: number, currency: string): string {
  return `${currency}${(value || 0).toLocaleString()}`;
}

function getStatusBadge(status: NegotiationRound['status']): 'success' | 'error' | 'warning' | 'info' {
  switch (status) {
    case 'accepted': return 'success';
    case 'rejected': return 'error';
    case 'countered': return 'warning';
    case 'pending': return 'info';
  }
}

export const CompactBhOfferNegotiationTracker = createPreset<BhOfferNegotiationTrackerProps>({
  name: 'BhOfferNegotiationTracker.Compact',
  render: (ctx: PresetContext<BhOfferNegotiationTrackerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      offer,
      rounds: roundsProp,
      candidateName: candidateNameProp,
      currency = '$',
      className,
      style,
    } = props;

    const rounds = roundsProp ?? (offer ? offerToNegotiationRounds(offer) : []);
    const candidateName = candidateNameProp ?? '';

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const lastRound = useMemo(() => rounds[rounds.length - 1], [rounds]);
    const firstOffer = useMemo(() => rounds[0]?.offeredSalary ?? 0, [rounds]);
    const currentOffer = useMemo(() => lastRound?.offeredSalary ?? 0, [lastRound]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <DollarSign size={14} color={t.colors.successScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Negotiation
            </Text>
          </Box>
          {lastRound && (
            <Box style={{
              ...createBadgeStyle(t, getStatusBadge(lastRound.status)),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {(lastRound.status || '').charAt(0).toUpperCase() + (lastRound.status || '').slice(1)}
              </Text>
            </Box>
          )}
        </Box>

        {rounds.length === 0 ? (
          <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No rounds</Text>
          </Box>
        ) : (
          <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
            {/* Current offer */}
            <Box style={{ textAlign: 'center', marginBottom: t.spacing[3], display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize['2xl'],
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
              }}>
                {formatCurrency(currentOffer, currency)}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>
                {candidateName}
              </Text>
            </Box>

            {/* Round progression */}
            <Box role="list" aria-label="Negotiation rounds" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
              {rounds.map((round, i) => (
                <Box
                  key={round.id}
                  role="listitem"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    padding: `${t.spacing[1]}px 0`,
                  }}
                >
                  <Box style={{
                    width: 6,
                    height: 6,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: round.status === 'accepted'
                      ? t.colors.successScale[500]
                      : round.status === 'countered'
                        ? t.colors.warningScale[500]
                        : t.colors.neutral[300],
                    flexShrink: 0,
                  }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 20, flexShrink: 0 }}>
                    R{i + 1}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], flex: 1 }}>
                    {formatCurrency(round.offeredSalary, currency)}
                  </Text>
                  <ArrowRight size={10} color={t.colors.neutral[300]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                    {formatCurrency(round.requestedSalary, currency)}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
