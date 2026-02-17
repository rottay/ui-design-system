'use client';

/**
 * BhClientDetail - Dashboard Preset
 * Full client dashboard with position table, revenue line chart (SVG),
 * KPI summary cards, and tier/contract badges.
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
  XCircle,
  TrendingUp,
  Users,
  ChevronRight,
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
  createEmptyStateStyle,
  createDividerStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { BhClientDetailProps, ClientPosition, RevenuePoint } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_POSITIONS: ClientPosition[] = [
  { id: 'p1', title: 'Senior Frontend Engineer', status: 'open', candidates: 24, daysOpen: 15 },
  { id: 'p2', title: 'Backend Engineer', status: 'open', candidates: 18, daysOpen: 22 },
  { id: 'p3', title: 'DevOps Engineer', status: 'filled', candidates: 12, daysOpen: 0 },
  { id: 'p4', title: 'QA Lead', status: 'open', candidates: 8, daysOpen: 30 },
  { id: 'p5', title: 'Product Manager', status: 'closed', candidates: 20, daysOpen: 0 },
  { id: 'p6', title: 'Data Scientist', status: 'open', candidates: 15, daysOpen: 10 },
  { id: 'p7', title: 'UI/UX Designer', status: 'filled', candidates: 9, daysOpen: 0 },
];

const MOCK_REVENUE: RevenuePoint[] = [
  { month: 'Jul', amount: 12000 },
  { month: 'Aug', amount: 15000 },
  { month: 'Sep', amount: 18000 },
  { month: 'Oct', amount: 14000 },
  { month: 'Nov', amount: 22000 },
  { month: 'Dec', amount: 19000 },
  { month: 'Jan', amount: 25000 },
];

/* ------------------------------------------------------------------ */
/*  SVG Helpers                                                        */
/* ------------------------------------------------------------------ */
function linePoints(data: RevenuePoint[], w: number, h: number, pad = 4): string {
  if (data.length < 2) return '';
  const max = Math.max(...data.map((d) => d.amount));
  const min = Math.min(...data.map((d) => d.amount));
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  return data.map((d, i) => `${pad + i * step},${h - pad - ((d.amount - min) / range) * (h - pad * 2)}`).join(' ');
}

function areaPoints(data: RevenuePoint[], w: number, h: number, pad = 4): string {
  if (data.length < 2) return '';
  const pts = linePoints(data, w, h, pad);
  const lastX = pad + (data.length - 1) * ((w - pad * 2) / (data.length - 1));
  return `${pad},${h - pad} ${pts} ${lastX},${h - pad}`;
}

/* ------------------------------------------------------------------ */
/*  Dashboard Preset                                                   */
/* ------------------------------------------------------------------ */
export const DashboardBhClientDetail = createPreset<BhClientDetailProps>({
  name: 'BhClientDetail.Dashboard',
  render: ({ primitives, props, tokens }: PresetContext<BhClientDetailProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      client,
      positions: rawPositionsProp = [],
      revenueHistory: rawRevenueProp = [],
      onPositionClick,
      loading,
      className,
      style,
    } = props;

    const positionsProp = Array.isArray(rawPositionsProp) ? rawPositionsProp : [];
    const revenueProp = Array.isArray(rawRevenueProp) ? rawRevenueProp : [];

    const clientName = client?.displayName ?? client?.clientCompanyName ?? '';
    const tier = (client?.tier ?? 'enterprise') as string;
    const contractStatus = (client?.status ?? 'active') as string;
    const totalRevenue = Number(client?.totalRevenue ?? 0);
    const currency = 'USD';
    const positions = positionsProp;
    const revenueHistory = revenueProp;

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: 24 }), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);

    const handlePositionClick = useCallback((positionId: string) => { onPositionClick?.(positionId); }, [onPositionClick]);

    const tierConfig = useMemo(() => {
      switch (tier) {
        case 'enterprise': return { badge: 'primary' as const, icon: Crown, bg: t.colors.primaryScale[100], fg: t.colors.primaryScale[700] };
        case 'premium': return { badge: 'info' as const, icon: Shield, bg: t.colors.infoScale[100], fg: t.colors.infoScale[700] };
        case 'strategic': return { badge: 'warning' as const, icon: Crown, bg: t.colors.warningScale[100], fg: t.colors.warningScale[700] };
        case 'standard':
        default: return { badge: 'secondary' as const, icon: Zap, bg: t.colors.secondaryScale[100], fg: t.colors.secondaryScale[700] };
      }
    }, [tier, t]);

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
    const totalCandidates = useMemo(() => positions.reduce((sum, p) => sum + p.candidates, 0), [positions]);

    const formattedRevenue = useMemo(() => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalRevenue);
    }, [totalRevenue, currency]);

    const positionStatusBadge = useCallback((status: ClientPosition['status']) => {
      switch (status) {
        case 'open': return 'warning';
        case 'filled': return 'success';
        case 'closed': return 'secondary';
        default: return 'info' as const;
      }
    }, []);

    const positionStatusIcon = useCallback((status: ClientPosition['status']) => {
      switch (status) {
        case 'open': return <Clock size={11} />;
        case 'filled': return <CheckCircle2 size={11} />;
        case 'closed': return <XCircle size={11} />;
        default: return <Clock size={11} />;
      }
    }, []);

    const TierIcon = tierConfig.icon;
    const ContractIcon = contractConfig.icon;

    /* -- Loading --------------------------------------------------- */
    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8], ...style }}>
          <Loader2 size={20} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>Loading client details...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], width: '100%', ...style }}>
        {/* ---- Client Header ---------------------------------------- */}
        <Box style={{ ...card }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={{
                ...createIconContainerStyle(t, { size: 52, color: tierConfig.bg }),
                color: tierConfig.fg,
              }}>
                <Building size={24} />
              </Box>
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: typo.headingWeight, color: t.colors.neutral[900], display: 'block', letterSpacing: typo.headingLetterSpacing }}>
                  {clientName}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                  <Box style={{ ...createBadgeStyle(t, tierConfig.badge), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <TierIcon size={11} />
                    <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{tier}</Text>
                  </Box>
                  <Box style={{ ...createBadgeStyle(t, contractConfig.badge), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <ContractIcon size={11} />
                    <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>Contract {contractStatus}</Text>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
              {formattedRevenue}
            </Text>
          </Box>
        </Box>

        {/* ---- KPI Summary Cards ------------------------------------ */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
          {[
            { label: 'Open Positions', value: openCount, icon: Briefcase, scale: 'warningScale' },
            { label: 'Filled', value: filledCount, icon: CheckCircle2, scale: 'successScale' },
            { label: 'Total Candidates', value: totalCandidates, icon: Users, scale: 'infoScale' },
            { label: 'Closed', value: closedCount, icon: XCircle, scale: 'primaryScale' },
          ].map((kpi, idx) => {
            const s = (t.colors as any)[kpi.scale];
            const entrance = createEntranceAnimation(t, { index: idx });
            const KpiIcon = kpi.icon;
            return (
              <Box key={kpi.label} style={{
                padding: t.spacing[4],
                borderRadius: t.borderRadius.lg,
                backgroundColor: s[50],
                border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${s[200]}`,
                display: 'flex',
                flexDirection: 'column' as const,
                gap: t.spacing[1],
                ...entrance.animate,
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                  <KpiIcon size={14} style={{ color: s[600] }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: s[700], fontWeight: t.typography.fontWeight.medium }}>{kpi.label}</Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>{kpi.value}</Text>
              </Box>
            );
          })}
        </Box>

        {/* ---- Two Column: Positions + Revenue --------------------- */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: t.spacing[5] }}>
          {/* Positions Table */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...card, width: '100%' }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Briefcase size={16} style={{ color: t.colors.primaryScale[500] }} />
                <Text style={{ ...sectionHdr, marginBottom: 0 }}>Positions</Text>
              </Box>
              <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                <Box style={{ ...createBadgeStyle(t, 'warning'), borderRadius: badgeR }}>
                  <Text style={{ fontSize: 'inherit' }}>{openCount} open</Text>
                </Box>
                <Box style={{ ...createBadgeStyle(t, 'success'), borderRadius: badgeR }}>
                  <Text style={{ fontSize: 'inherit' }}>{filledCount} filled</Text>
                </Box>
              </Box>
            </Box>

            {/* Table header */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: '2fr 90px 80px 80px 40px',
              gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: t.borderRadius.md,
              marginBottom: t.spacing[2],
            }}>
              {['Position', 'Status', 'Candidates', 'Days Open', ''].map((col) => (
                <Text key={col} style={{ ...sectionHdr, marginBottom: 0 }}>{col}</Text>
              ))}
            </Box>

            {/* Rows */}
            {positions.map((position, idx) => {
              const entrance = createEntranceAnimation(t, { index: idx });
              return (
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
                    display: 'grid',
                    gridTemplateColumns: '2fr 90px 80px 80px 40px',
                    gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`,
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: `background-color ${t.motion.hover}`,
                    width: '100%',
                    ...entrance.animate,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = t.colors.neutral[50]; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, minWidth: 0 }}>
                    {position.title}
                  </Text>
                  <Box>
                    <Box style={{ ...createBadgeStyle(t, positionStatusBadge(position.status) as any), borderRadius: badgeR, display: 'inline-flex', alignItems: 'center', gap: t.spacing[1] }}>
                      {positionStatusIcon(position.status)}
                      <Text style={{ fontSize: 'inherit', textTransform: 'capitalize' as const }}>{position.status}</Text>
                    </Box>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600], textAlign: 'center' as const }}>
                    {position.candidates}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: position.daysOpen > 25 ? t.colors.errorScale[600] : position.daysOpen > 15 ? t.colors.warningScale[600] : t.colors.neutral[600],
                    textAlign: 'center' as const,
                  }}>
                    {position.status === 'open' ? `${position.daysOpen}d` : '--'}
                  </Text>
                  <Box style={{ display: 'flex', justifyContent: 'center', color: t.colors.neutral[400] }}>
                    <ChevronRight size={14} />
                  </Box>
                </Box>
              );
            })}

            {positions.length === 0 && (
              <Box style={emptyStyle}>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No positions yet.</Text>
              </Box>
            )}
          </Box>

          {/* Revenue Chart */}
          <Box style={{ ...card }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
              <TrendingUp size={16} style={{ color: t.colors.successScale[500] }} />
              <Text style={{ ...sectionHdr, marginBottom: 0 }}>Revenue History</Text>
            </Box>

            {/* Total */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginBottom: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[1] }}>Total Revenue</Text>
              <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                {formattedRevenue}
              </Text>
            </Box>

            {/* SVG line chart */}
            {revenueHistory.length > 1 && (
              <Box style={{ marginBottom: t.spacing[3] }}>
                <svg width="100%" height="120" viewBox="0 0 320 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cd-rev-g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.colors.successScale[400]} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={t.colors.successScale[400]} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points={areaPoints(revenueHistory, 320, 100)} fill="url(#cd-rev-g)" />
                  <polyline
                    points={linePoints(revenueHistory, 320, 100)}
                    fill="none"
                    stroke={t.colors.successScale[500]}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Dots */}
                  {(() => {
                    const max = Math.max(...revenueHistory.map((d) => d.amount));
                    const min = Math.min(...revenueHistory.map((d) => d.amount));
                    const range = max - min || 1;
                    const step = (320 - 8) / (revenueHistory.length - 1);
                    return revenueHistory.map((d, i) => (
                      <circle
                        key={i}
                        cx={4 + i * step}
                        cy={100 - 4 - ((d.amount - min) / range) * (100 - 8)}
                        r={3}
                        fill={t.colors.common.white}
                        stroke={t.colors.successScale[500]}
                        strokeWidth={2}
                      />
                    ));
                  })()}
                  {/* X-axis labels */}
                  {revenueHistory.map((d, i) => {
                    const step = (320 - 8) / (revenueHistory.length - 1);
                    return (
                      <text
                        key={`label-${i}`}
                        x={4 + i * step}
                        y={116}
                        textAnchor="middle"
                        fill={t.colors.neutral[400]}
                        fontSize={9}
                      >
                        {d.month}
                      </text>
                    );
                  })}
                </svg>
              </Box>
            )}

            {/* Monthly breakdown */}
            <Box style={{ ...divider, marginBottom: t.spacing[3] }} />
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {revenueHistory.slice(-4).reverse().map((point) => {
                const maxMonth = Math.max(...revenueHistory.map((d) => d.amount));
                const pct = maxMonth > 0 ? (point.amount / maxMonth) * 100 : 0;
                const bar = createProgressBarStyle(t, { color: t.colors.successScale[500], percent: pct });
                return (
                  <Box key={point.month} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 30, flexShrink: 0 }}>{point.month}</Text>
                    <Box style={{ ...bar.track, flex: 1, height: 6 }}>
                      <Box style={bar.fill} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], width: 50, textAlign: 'right' as const }}>
                      ${(point.amount / 1000).toFixed(0)}K
                    </Text>
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
