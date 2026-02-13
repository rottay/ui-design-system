'use client';

/**
 * BhClientCard - Compact Preset
 * Slim single-row client card with tier, contract status, and key metrics inline.
 */

import { useMemo, useCallback } from 'react';
import {
  Building,
  Briefcase,
  DollarSign,
  UserCheck,
  Crown,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
} from '../../../helpers';
import type { BhClientCardProps } from '../../core';

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                     */
/* ------------------------------------------------------------------ */
export const CompactBhClientCard = createPreset<BhClientCardProps>({
  name: 'BhClientCard.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhClientCardProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      clientName = 'Acme Corporation',
      tier = 'enterprise',
      contractStatus = 'active',
      openPositions = 12,
      totalHires = 48,
      revenue = 125000,
      currency = 'USD',
      onClick,
      className,
      style,
    } = props;

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 14 }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t, { index: 0 }), [t]);

    const tierBadge = useMemo(() => {
      switch (tier) {
        case 'enterprise': return { color: 'primary' as const, icon: Crown };
        case 'business': return { color: 'info' as const, icon: Shield };
        case 'starter': return { color: 'secondary' as const, icon: Zap };
      }
    }, [tier]);

    const contractBadge = useMemo(() => {
      switch (contractStatus) {
        case 'active': return { color: 'success' as const, icon: CheckCircle2 };
        case 'expiring': return { color: 'warning' as const, icon: AlertTriangle };
        case 'expired': return { color: 'error' as const, icon: Clock };
      }
    }, [contractStatus]);

    const formattedRevenue = useMemo(() => {
      if (revenue >= 1000000) return `${(revenue / 1000000).toFixed(1)}M`;
      if (revenue >= 1000) return `${(revenue / 1000).toFixed(0)}K`;
      return revenue.toString();
    }, [revenue]);

    const handleClick = useCallback(() => { onClick?.(); }, [onClick]);

    const TierIcon = tierBadge.icon;
    const ContractIcon = contractBadge.icon;

    return (
      <Box
        className={className}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `View client ${clientName}` : undefined}
        onClick={handleClick}
        onKeyDown={onClick ? (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
        } : undefined}
        style={{
          ...card,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[3],
          cursor: onClick ? 'pointer' : 'default',
          transition: `all ${t.motion.hover}`,
          ...entrance.animate,
          width: '100%',
          ...style,
        }}
        onMouseEnter={onClick ? (e: React.MouseEvent<HTMLElement>) => {
          const el = e.currentTarget;
          if (cardHover.hover.transform) el.style.transform = cardHover.hover.transform;
          if (cardHover.hover.boxShadow) el.style.boxShadow = cardHover.hover.boxShadow;
        } : undefined}
        onMouseLeave={onClick ? (e: React.MouseEvent<HTMLElement>) => {
          const el = e.currentTarget;
          el.style.transform = 'none';
          el.style.boxShadow = (card.boxShadow as string) || '';
        } : undefined}
      >
        {/* Icon */}
        <Box style={{
          ...createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[100] }),
          color: t.colors.primaryScale[700],
        }}>
          <Building size={15} />
        </Box>

        {/* Name */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: typo.headingWeight, color: t.colors.neutral[900], display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, letterSpacing: typo.headingLetterSpacing }}>
            {clientName}
          </Text>
        </Box>

        {/* Tier */}
        <Box style={{ ...createBadgeStyle(t, tierBadge.color), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
          <TierIcon size={10} />
          <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{tier}</Text>
        </Box>

        {/* Contract */}
        <Box style={{ ...createBadgeStyle(t, contractBadge.color), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
          <ContractIcon size={10} />
          <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{contractStatus}</Text>
        </Box>

        {/* Revenue */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
          <DollarSign size={11} style={{ color: t.colors.successScale[500] }} />
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>{formattedRevenue}</Text>
        </Box>

        {/* Open positions */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
          <Briefcase size={11} style={{ color: t.colors.warningScale[500] }} />
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{openPositions}</Text>
        </Box>

        {/* Hires */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
          <UserCheck size={11} style={{ color: t.colors.primaryScale[500] }} />
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{totalHires}</Text>
        </Box>
      </Box>
    );
  },
});
