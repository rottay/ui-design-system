'use client';

/**
 * BhClientList - Grid Preset
 * Card-based grid layout with client summary tiles, tier badges,
 * contract status indicators, and revenue figures.
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
  Loader2,
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
  createEmptyStateStyle,
  createPersonalityAccentBar,
  createDividerStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhClientListProps, ClientListItem } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_CLIENTS: ClientListItem[] = [
  { id: 'c1', name: 'Acme Corporation', tier: 'enterprise', contractStatus: 'active', openPositions: 12, totalHires: 48, revenue: 125000 },
  { id: 'c2', name: 'TechStart Inc.', tier: 'starter', contractStatus: 'active', openPositions: 3, totalHires: 8, revenue: 15000 },
  { id: 'c3', name: 'GlobalBank Ltd.', tier: 'enterprise', contractStatus: 'expiring', openPositions: 8, totalHires: 35, revenue: 98000 },
  { id: 'c4', name: 'Velocity Partners', tier: 'business', contractStatus: 'active', openPositions: 6, totalHires: 22, revenue: 55000 },
  { id: 'c5', name: 'NovaTech Solutions', tier: 'business', contractStatus: 'expired', openPositions: 0, totalHires: 15, revenue: 42000 },
  { id: 'c6', name: 'Pinnacle Health', tier: 'enterprise', contractStatus: 'active', openPositions: 15, totalHires: 62, revenue: 180000 },
];

/* ------------------------------------------------------------------ */
/*  Grid Preset                                                        */
/* ------------------------------------------------------------------ */
export const GridBhClientList = createPreset<BhClientListProps>({
  name: 'BhClientList.Grid',
  render: ({ primitives, props, tokens }: PresetContext<BhClientListProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      clients: clientsProp,
      onClientClick,
      selectedClientId,
      loading,
      className,
      style,
    } = props;

    const clients = clientsProp?.length ? clientsProp : MOCK_CLIENTS;

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 20 }), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleClientClick = useCallback((clientId: string) => { onClientClick?.(clientId); }, [onClientClick]);

    const tierInfo = useCallback((tierVal: ClientListItem['tier']) => {
      switch (tierVal) {
        case 'enterprise': return { color: 'primary' as const, icon: Crown, bg: t.colors.primaryScale[100] };
        case 'business': return { color: 'info' as const, icon: Shield, bg: t.colors.infoScale[100] };
        case 'starter': return { color: 'secondary' as const, icon: Zap, bg: t.colors.secondaryScale[100] };
      }
    }, [t]);

    const contractInfo = useCallback((status: ClientListItem['contractStatus']) => {
      switch (status) {
        case 'active': return { color: 'success' as const, icon: CheckCircle2 };
        case 'expiring': return { color: 'warning' as const, icon: AlertTriangle };
        case 'expired': return { color: 'error' as const, icon: Clock };
      }
    }, []);

    const formatRevenue = useCallback((amount: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    }, []);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8], ...style }}>
          <Loader2 size={20} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>Loading clients...</Text>
        </Box>
      );
    }

    if (clients.length === 0) {
      return (
        <Box className={className} style={style}>
          <Box style={emptyStyle}>
            <Box style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }}>
              <Building size={40} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], display: 'block' }}>
              No clients found
            </Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ width: '100%', ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[5] }}>
          <Building size={18} style={{ color: t.colors.primaryScale[500] }} />
          <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
            Clients
          </Text>
          <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, marginLeft: t.spacing[1] }}>
            <Text style={{ fontSize: 'inherit' }}>{clients.length}</Text>
          </Box>
        </Box>

        {/* Grid */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: t.spacing[4] }}>
          {clients.map((client, idx) => {
            const isSelected = selectedClientId === client.id;
            const entrance = createEntranceAnimation(t, { index: idx });
            const ti = tierInfo(client.tier);
            const ci = contractInfo(client.contractStatus);
            const TierIcon = ti.icon;
            const ContractIcon = ci.icon;
            const accent = createPersonalityAccentBar(t, { color: isSelected ? t.colors.primaryScale[500] : ti.bg });

            return (
              <Box
                key={client.id}
                role="button"
                tabIndex={0}
                aria-label={`View client ${client.name}`}
                aria-selected={isSelected}
                onClick={() => handleClientClick(client.id)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClientClick(client.id); }
                }}
                style={{
                  ...card,
                  ...accentLayout.outer,
                  position: 'relative' as const,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected
                    ? `2px solid ${t.colors.primaryScale[400]}`
                    : `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : card.backgroundColor,
                  transition: `all ${t.motion.hover}`,
                  ...entrance.animate,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                  const el = e.currentTarget;
                  if (cardHover.hover.transform) el.style.transform = cardHover.hover.transform;
                  if (cardHover.hover.boxShadow) el.style.boxShadow = cardHover.hover.boxShadow;
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                  const el = e.currentTarget;
                  el.style.transform = 'none';
                  el.style.boxShadow = (card.boxShadow as string) || '';
                }}
              >
                {accent && <Box style={accent} />}

                <Box style={accentLayout.inner}>
                {/* Client name + tier */}
                <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                    <Box style={{
                      ...createIconContainerStyle(t, { size: 38, color: ti.bg }),
                      color: t.colors.primaryScale[700],
                    }}>
                      <Building size={17} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, minWidth: 0 }}>
                      {client.name}
                    </Text>
                  </Box>
                  <Box style={{ ...createBadgeStyle(t, ti.color), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <TierIcon size={10} />
                    <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{client.tier}</Text>
                  </Box>
                </Box>

                {/* Contract badge */}
                <Box style={{ marginBottom: t.spacing[3] }}>
                  <Box style={{ ...createBadgeStyle(t, ci.color), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <ContractIcon size={10} />
                    <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{client.contractStatus}</Text>
                  </Box>
                </Box>

                <Box style={{ ...divider, marginBottom: t.spacing[3] }} />

                {/* Stats */}
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: t.spacing[2] }}>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <DollarSign size={11} style={{ color: t.colors.successScale[500] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Revenue</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                      {formatRevenue(client.revenue)}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Briefcase size={11} style={{ color: t.colors.warningScale[500] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Open</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                      {client.openPositions}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <UserCheck size={11} style={{ color: t.colors.primaryScale[500] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Hires</Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                      {client.totalHires}
                    </Text>
                  </Box>
                </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
