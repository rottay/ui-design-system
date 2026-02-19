'use client';

/**
 * BhClientDetail - Compact Preset
 * Condensed client view with inline position summary,
 * revenue sparkline, and key metrics.
 */

import { useMemo, useCallback } from 'react';
import {
  Building,
  Briefcase,
  DollarSign,
  Crown,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createProgressBarStyle,
  createDividerStyle,
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhClientDetailProps, ClientPosition, RevenuePoint } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  SVG Sparkline Helper                                               */
/* ------------------------------------------------------------------ */
function sparkline(data: RevenuePoint[], w: number, h: number, pad = 2): string {
  if (data.length < 2) return '';
  const max = Math.max(...data.map((d) => d.amount));
  const min = Math.min(...data.map((d) => d.amount));
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  return data.map((d, i) => `${pad + i * step},${h - pad - ((d.amount - min) / range) * (h - pad * 2)}`).join(' ');
}

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                     */
/* ------------------------------------------------------------------ */
export const CompactBhClientDetail = createPreset<BhClientDetailProps>({
  name: 'BhClientDetail.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhClientDetailProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      client,
      positions: rawPositionsProp = [],
      revenueHistory: rawRevenueProp = [],
      billingRecords: rawBillingRecords = [],
      onPositionClick,
      loading,
      className,
      style,
    } = props;

    const positionsProp = Array.isArray(rawPositionsProp) ? rawPositionsProp : [];
    const revenueProp = Array.isArray(rawRevenueProp) ? rawRevenueProp : [];
    const billingRecords = Array.isArray(rawBillingRecords) ? rawBillingRecords : [];

    const clientName = client?.displayName ?? client?.clientCompanyName ?? '';
    const tier = (client?.tier ?? 'enterprise') as string;
    const contractStatus = (client?.status ?? 'active') as string;
    const totalRevenue = Number(client?.totalRevenue ?? 0);
    const positions = positionsProp;
    const revenueHistory = revenueProp;

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 20 }), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);

    const handlePositionClick = useCallback((positionId: string) => { onPositionClick?.(positionId); }, [onPositionClick]);

    const tierConfig = useMemo(() => {
      switch (tier) {
        case 'enterprise': return { badge: 'primary' as const, icon: Crown };
        case 'premium': return { badge: 'info' as const, icon: Shield };
        case 'strategic': return { badge: 'warning' as const, icon: Crown };
        case 'standard':
        default: return { badge: 'secondary' as const, icon: Zap };
      }
    }, [tier]);

    const contractConfig = useMemo(() => {
      switch (contractStatus) {
        case 'active': return { badge: 'success' as const, icon: CheckCircle2 };
        case 'suspended': return { badge: 'warning' as const, icon: AlertTriangle };
        case 'pending_approval': return { badge: 'warning' as const, icon: Clock };
        case 'terminated':
        case 'archived': return { badge: 'error' as const, icon: XCircle };
        case 'draft':
        default: return { badge: 'secondary' as const, icon: Clock };
      }
    }, [contractStatus]);

    const openCount = useMemo(() => positions.filter((p) => p.status === 'open').length, [positions]);
    const filledCount = useMemo(() => positions.filter((p) => p.status === 'filled').length, [positions]);
    const closedCount = useMemo(() => positions.filter((p) => p.status === 'closed').length, [positions]);

    const formattedRevenue = useMemo(() => {
      if (totalRevenue >= 1000000) return `$${(totalRevenue / 1000000).toFixed(1)}M`;
      if (totalRevenue >= 1000) return `$${(totalRevenue / 1000).toFixed(0)}K`;
      return `$${totalRevenue}`;
    }, [totalRevenue]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const TierIcon = tierConfig.icon;
    const ContractIcon = contractConfig.icon;

    if (loading) {
      return (
        <Box className={className} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
          <Loader2 size={18} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...card, width: '100%', ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
          <Box style={{
            ...createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[100] }),
            color: t.colors.primaryScale[700],
          }}>
            <Building size={18} />
          </Box>
          <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: typo.headingWeight, color: t.colors.neutral[900], display: 'block', letterSpacing: typo.headingLetterSpacing, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {clientName}
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
              <Box style={{ ...createBadgeStyle(t, tierConfig.badge), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                <TierIcon size={10} />
                <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{tier}</Text>
              </Box>
              <Box style={{ ...createBadgeStyle(t, contractConfig.badge), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                <ContractIcon size={10} />
                <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{contractStatus}</Text>
              </Box>
            </Box>
          </Box>
          {/* Revenue + sparkline */}
          <Box style={{ textAlign: 'right' as const }}>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
              {formattedRevenue}
            </Text>
            {revenueHistory.length > 1 && (
              <svg width="80" height="24" viewBox="0 0 80 24" style={{ display: 'block', marginLeft: 'auto' }}>
                <polyline
                  points={sparkline(revenueHistory, 80, 24)}
                  fill="none"
                  stroke={t.colors.successScale[400]}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </Box>
        </Box>

        <Box style={{ ...divider, marginBottom: t.spacing[4] }} />

        {/* Position summary badges */}
        <Box style={{ marginBottom: t.spacing[3] }}>
          <Text style={{ ...sectionHdr, display: 'block', marginBottom: t.spacing[2] }}>Positions</Text>
          <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
            <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Clock size={11} />
              <Text style={{ fontSize: 'inherit' }}>{openCount} open</Text>
            </Box>
            <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
              <CheckCircle2 size={11} />
              <Text style={{ fontSize: 'inherit' }}>{filledCount} filled</Text>
            </Box>
            <Box style={{ ...createBadgeStyle(t, 'secondary'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
              <XCircle size={11} />
              <Text style={{ fontSize: 'inherit' }}>{closedCount} closed</Text>
            </Box>
          </Box>
        </Box>

        {/* Top open positions */}
        {openCount > 0 && (
          <Box>
            <Text style={{ ...sectionHdr, display: 'block', marginBottom: t.spacing[2] }}>Open Positions</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {positions
                .filter((p) => p.status === 'open')
                .slice(0, 3)
                .map((position, i) => (
                  <Box
                    key={position.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View position ${position.title}`}
                    onClick={() => handlePositionClick(position.id)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePositionClick(position.id); }
                    }}
                    style={{
                      ...animStyle(i),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[50],
                      border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
                      cursor: 'pointer',
                      transition: `background-color ${t.motion.hover}`,
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = t.colors.primaryScale[50]; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                  >
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800], minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {position.title}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Users size={11} style={{ color: t.colors.neutral[400] }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{position.candidates}</Text>
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: position.daysOpen > 25 ? t.colors.errorScale[600] : t.colors.neutral[500],
                      }}>
                        {position.daysOpen}d
                      </Text>
                    </Box>
                  </Box>
                ))}
            </Box>
          </Box>
        )}

        {/* Billing summary */}
        {billingRecords.length > 0 && (
          <Box style={{ marginTop: t.spacing[3] }}>
            <Box style={{ ...divider, marginBottom: t.spacing[3] }} />
            <Text style={{ ...sectionHdr, display: 'block', marginBottom: t.spacing[2] }}>Billing</Text>
            <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
              <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                <DollarSign size={10} />
                <Text style={{ fontSize: 'inherit' }}>
                  {billingRecords.filter((r: any) => (r.status ?? r.billingStatus) === 'paid').length} paid
                </Text>
              </Box>
              <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Clock size={10} />
                <Text style={{ fontSize: 'inherit' }}>
                  {billingRecords.filter((r: any) => (r.status ?? r.billingStatus) !== 'paid').length} pending
                </Text>
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'flex', alignItems: 'center' }}>
                {billingRecords.length} total records
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
