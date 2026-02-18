'use client';

/**
 * BhOfferExpiration - List Preset
 * Condensed list of expiring offers with countdown.
 */

import { useState, useMemo, useEffect } from 'react';
import { Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhOfferExpirationProps, ExpiringOffer } from '../../core';
import { offersToExpiringOffers } from '../../core';
import type { DesignTokens } from '../../../../../types';

function getUrgencyColor(days: number, t: DesignTokens): string {
  if (days <= 0) return t.colors.errorScale[600];
  if (days <= 2) return t.colors.errorScale[500];
  if (days <= 5) return t.colors.warningScale[500];
  return t.colors.successScale[500];
}

export const ListBhOfferExpiration = createPreset<BhOfferExpirationProps>({
  name: 'BhOfferExpiration.List',
  render: (ctx: PresetContext<BhOfferExpirationProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      dbOffers,
      candidateNames,
      offers: offersProp,
      onOfferClick,
      className,
      style,
    } = props;

    const offers = offersProp
      ?? (dbOffers && dbOffers.length > 0 ? offersToExpiringOffers(dbOffers, candidateNames) : []);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const sorted = useMemo(
      () => [...offers].sort((a, b) => a.daysRemaining - b.daysRemaining),
      [offers],
    );

    const urgentCount = useMemo(
      () => offers.filter(o => o.daysRemaining <= 2 && o.status === 'pending').length,
      [offers],
    );

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
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
            <Clock size={14} color={t.colors.warningScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Expiring
            </Text>
          </Box>
          {urgentCount > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <AlertTriangle size={10} style={{ marginRight: t.spacing[1] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{urgentCount}</Text>
            </Box>
          )}
        </Box>

        <Box role="list" aria-label="Expiring offers">
          {sorted.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No offers</Text>
            </Box>
          )}
          {sorted.map((offer) => {
            const urgencyColor = getUrgencyColor(offer.daysRemaining, t);

            return (
              <Box
                key={offer.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${offer.candidateName}: ${offer.daysRemaining} days remaining`}
                onClick={() => onOfferClick?.(offer.id)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOfferClick?.(offer.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  borderLeft: `2px solid ${urgencyColor}`,
                  cursor: 'pointer',
                  backgroundColor: t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {offer.candidateName}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {offer.position}
                  </Text>
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  color: urgencyColor,
                  flexShrink: 0,
                }}>
                  {offer.daysRemaining <= 0 ? 'Expired' : `${offer.daysRemaining}d`}
                </Text>
                <ChevronRight size={12} color={t.colors.neutral[300]} />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
