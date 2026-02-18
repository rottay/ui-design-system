'use client';

/**
 * BhOfferExpiration - Cards Preset
 * Offer cards grouped by urgency with countdown timers
 * and quick actions. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Clock, AlertTriangle, Bell, RefreshCw,
  User, Briefcase, CheckCircle, XCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhOfferExpirationProps, ExpiringOffer } from '../../core';
import { offersToExpiringOffers } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getUrgencyColor(days: number, t: DesignTokens): string {
  if (days <= 0) return t.colors.errorScale[600];
  if (days <= 2) return t.colors.errorScale[500];
  if (days <= 5) return t.colors.warningScale[500];
  return t.colors.successScale[500];
}

function getUrgencyBadge(days: number): 'error' | 'warning' | 'success' {
  if (days <= 2) return 'error';
  if (days <= 5) return 'warning';
  return 'success';
}

function getUrgencyLabel(days: number): string {
  if (days <= 0) return 'Expired';
  if (days <= 2) return 'Urgent';
  if (days <= 5) return 'Soon';
  return 'On Track';
}

function getStatusBadge(status: ExpiringOffer['status']): 'success' | 'error' | 'warning' | 'info' {
  switch (status) {
    case 'accepted': return 'success';
    case 'expired': return 'error';
    case 'extended': return 'info';
    case 'pending': return 'warning';
  }
}

/* ================================================================== */
/*  Cards Preset                                                       */
/* ================================================================== */

export const CardsBhOfferExpiration = createPreset<BhOfferExpirationProps>({
  name: 'BhOfferExpiration.Cards',
  render: (ctx: PresetContext<BhOfferExpirationProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      dbOffers,
      candidateNames,
      offers: offersProp,
      title = 'Expiring Offers',
      onOfferClick,
      onExtend,
      onRemind,
      className,
      style,
    } = props;

    const offers = offersProp
      ?? (dbOffers && dbOffers.length > 0 ? offersToExpiringOffers(dbOffers, candidateNames) : []);

    const [hoveredOffer, setHoveredOffer] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const grouped = useMemo(() => {
      const urgent = offers.filter(o => o.daysRemaining <= 2 && o.status === 'pending');
      const soon = offers.filter(o => o.daysRemaining > 2 && o.daysRemaining <= 5 && o.status === 'pending');
      const onTrack = offers.filter(o => o.daysRemaining > 5 && o.status === 'pending');
      const other = offers.filter(o => o.status !== 'pending');
      return { urgent, soon, onTrack, other };
    }, [offers]);

    const handleClick = useCallback((id: string) => {
      onOfferClick?.(id);
    }, [onOfferClick]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const renderOffer = (offer: ExpiringOffer, idx: number) => {
      const isHovered = hoveredOffer === offer.id;
      const urgencyColor = getUrgencyColor(offer.daysRemaining, t);

      return (
        <Box
          key={offer.id}
          role="listitem"
          tabIndex={0}
          aria-label={`${offer.candidateName}, ${offer.position}, ${offer.daysRemaining} days remaining`}
          onClick={() => handleClick(offer.id)}
          onMouseEnter={() => setHoveredOffer(offer.id)}
          onMouseLeave={() => setHoveredOffer(null)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(offer.id);
            }
          }}
          style={{
            ...animStyle(idx),
            padding: t.spacing[4],
            borderRadius: t.borderRadius.lg,
            border: `1px solid ${t.colors.neutral[100]}`,
            borderLeft: `3px solid ${urgencyColor}`,
            backgroundColor: isHovered ? t.colors.neutral[50] : t.colors.common.white,
            cursor: 'pointer',
            transition: `all ${t.motion.hover}`,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <User size={14} color={t.colors.neutral[500]} />
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                {offer.candidateName}
              </Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, getStatusBadge(offer.status)),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {(offer.status || '').charAt(0).toUpperCase() + (offer.status || '').slice(1)}
              </Text>
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
            <Briefcase size={12} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
              {offer.position}
            </Text>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Clock size={12} color={urgencyColor} />
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.bold,
                color: urgencyColor,
              }}>
                {offer.daysRemaining <= 0
                  ? 'Expired'
                  : `${offer.daysRemaining} day${offer.daysRemaining !== 1 ? 's' : ''} left`}
              </Text>
            </Box>

            {/* Quick actions */}
            {isHovered && offer.status === 'pending' && (
              <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                <Box
                  tabIndex={0}
                  role="button"
                  aria-label="Send reminder"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemind?.(offer.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white, cursor: 'pointer',
                  }}
                >
                  <Bell size={11} color={t.colors.primaryScale[500]} />
                </Box>
                <Box
                  tabIndex={0}
                  role="button"
                  aria-label="Extend offer"
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onExtend?.(offer.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white, cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={11} color={t.colors.infoScale[500]} />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    let globalIdx = 0;

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
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.warningScale[50] })}>
                <Clock size={20} color={t.colors.warningScale[600]} />
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
                  {offers.filter(o => o.status === 'pending').length} pending offers
                </Text>
              </Box>
            </Box>
            {grouped.urgent.length > 0 && (
              <Box style={{
                ...createBadgeStyle(t, 'error'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: t.spacing[1],
              }}>
                <AlertTriangle size={12} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{grouped.urgent.length} urgent</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[5] }} role="list" aria-label="Expiring offers">
          {offers.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Clock size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No expiring offers
              </Text>
            </Box>
          )}

          {/* Urgent */}
          {grouped.urgent.length > 0 && (
            <Box style={{ marginBottom: t.spacing[4] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.errorScale[600],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
                marginBottom: t.spacing[2],
              }}>
                Urgent (0-2 days)
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {grouped.urgent.map((o) => renderOffer(o, globalIdx++))}
              </Box>
            </Box>
          )}

          {/* Soon */}
          {grouped.soon.length > 0 && (
            <Box style={{ marginBottom: t.spacing[4] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.warningScale[600],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
                marginBottom: t.spacing[2],
              }}>
                Expiring Soon (3-5 days)
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {grouped.soon.map((o) => renderOffer(o, globalIdx++))}
              </Box>
            </Box>
          )}

          {/* On Track */}
          {grouped.onTrack.length > 0 && (
            <Box style={{ marginBottom: t.spacing[4] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.successScale[600],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
                marginBottom: t.spacing[2],
              }}>
                On Track (6+ days)
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {grouped.onTrack.map((o) => renderOffer(o, globalIdx++))}
              </Box>
            </Box>
          )}

          {/* Other statuses */}
          {grouped.other.length > 0 && (
            <Box>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[500],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
                marginBottom: t.spacing[2],
              }}>
                Resolved
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {grouped.other.map((o) => renderOffer(o, globalIdx++))}
              </Box>
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
