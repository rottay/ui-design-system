'use client';

/**
 * BhClientCard - Standard Preset
 * Full client summary card with tier badge, contract status,
 * revenue figure, positions, hires, and contact name.
 */

import { useMemo, useCallback } from 'react';
import {
  Building,
  Briefcase,
  DollarSign,
  UserCheck,
  FileText,
  Crown,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
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
  createPersonalityAccentBar,
  createDividerStyle,
  getAccentAwareLayout,

  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhClientCardProps } from '../../core';

/* ------------------------------------------------------------------ */
/*  Standard Preset                                                    */
/* ------------------------------------------------------------------ */
export const StandardBhClientCard = createPreset<BhClientCardProps>({
  name: 'BhClientCard.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhClientCardProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      client,
      onClick,
      className,
      style,
    } = props;

    const clientName = client?.displayName ?? client?.clientCompanyName ?? 'Acme Corporation';
    const tier = client?.tier ?? 'enterprise';
    const status = client?.status ?? 'active';
    const openPositions = client?.openPositions ?? 12;
    const totalHires = (client as any)?.totalHires ?? 48;
    const revenue = Number(client?.totalRevenue ?? 125000);
    const contactName = (client as any)?.contactName ?? '';

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: t.spacing[6] }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t, { index: 0 }), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);

    const tierColor = useMemo(() => {
      switch (tier) {
        case 'enterprise': return { badge: 'primary' as const, icon: Crown, bg: t.colors.primaryScale[100], fg: t.colors.primaryScale[700] };
        case 'premium': return { badge: 'info' as const, icon: Shield, bg: t.colors.infoScale[100], fg: t.colors.infoScale[700] };
        case 'strategic': return { badge: 'warning' as const, icon: Crown, bg: t.colors.warningScale[100], fg: t.colors.warningScale[700] };
        case 'standard':
        default: return { badge: 'secondary' as const, icon: Zap, bg: t.colors.secondaryScale[100], fg: t.colors.secondaryScale[700] };
      }
    }, [tier, t]);

    const contractColor = useMemo(() => {
      switch (status) {
        case 'active': return { badge: 'success' as const, icon: CheckCircle2 };
        case 'suspended': return { badge: 'warning' as const, icon: AlertTriangle };
        case 'terminated':
        case 'archived': return { badge: 'error' as const, icon: Clock };
        case 'draft':
        case 'pending_approval':
        default: return { badge: 'secondary' as const, icon: Clock };
      }
    }, [status]);

    const accent = useMemo(
      () => createPersonalityAccentBar(t, { color: tierColor.bg }),
      [t, tierColor],
    );
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const formattedRevenue = useMemo(() => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(revenue);
    }, [revenue]);

    const handleClick = useCallback(() => { onClick?.(); }, [onClick]);

    const TierIcon = tierColor.icon;
    const ContractIcon = contractColor.icon;

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const isGlass = t.surface.useGlass;

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


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
          ...accentLayout.outer,
          position: 'relative' as const,
          overflow: 'hidden',
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
        {accent && <Box style={accent} />}

        <Box style={accentLayout.inner}>
        {/* Header: Client name + tier */}
        <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 44, color: tierColor.bg }),
              color: tierColor.fg,
            }}>
              <Building size={20} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], minWidth: 0 }}>
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: typo.headingWeight, color: t.colors.neutral[900], display: 'block', letterSpacing: typo.headingLetterSpacing }}>
                {clientName}
              </Text>
              {contactName && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[1] }}>
                  <User size={11} style={{ color: t.colors.neutral[400] }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{contactName}</Text>
                </Box>
              )}
            </Box>
          </Box>
          <Box style={{ ...createBadgeStyle(t, tierColor.badge), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
            <TierIcon size={11} />
            <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{tier}</Text>
          </Box>
        </Box>

        {/* Contract status */}
        <Box style={{ marginBottom: t.spacing[4] }}>
          <Box style={{ ...createBadgeStyle(t, contractColor.badge), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
            <ContractIcon size={11} />
            <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{status}</Text>
          </Box>
        </Box>

        <Box style={{ ...divider, marginBottom: t.spacing[4] }} />

        {/* Stats grid */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: t.spacing[3] }}>
          {/* Revenue */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <DollarSign size={12} style={{ color: t.colors.successScale[500] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Revenue</Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
              {formattedRevenue}
            </Text>
          </Box>

          {/* Open Positions */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Briefcase size={12} style={{ color: t.colors.warningScale[500] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Open Roles</Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
              {openPositions}
            </Text>
          </Box>

          {/* Total Hires */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <UserCheck size={12} style={{ color: t.colors.primaryScale[500] }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Hires</Text>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
              {totalHires}
            </Text>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
